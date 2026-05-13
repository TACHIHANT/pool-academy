import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'https://tachihant.github.io' }));

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  JWT_SECRET = 'change-this-to-a-long-random-string',
  PORT = 3000,
  PAYPAL_MODE = 'sandbox',
} = process.env;

const PAYPAL_API = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Failed to get PayPal token');
  return data.access_token;
}

async function verifyPayPalOrder(orderId, accessToken) {
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const order = await res.json();
  if (!res.ok) throw new Error(order.message || 'Failed to verify order');

  if (order.status !== 'COMPLETED') {
    throw new Error(`Order status is ${order.status}, expected COMPLETED`);
  }

  const purchaseUnit = order.purchase_units?.[0];
  const items = purchaseUnit?.items?.map(i => ({
    name: i.name,
    qty: i.quantity,
  })) || [];

  return {
    orderId: order.id,
    status: order.status,
    payerEmail: order.payer?.email_address,
    items,
    amount: purchaseUnit?.amount?.value,
  };
}

app.post('/api/verify-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const accessToken = await getPayPalAccessToken();
    const verification = await verifyPayPalOrder(orderId, accessToken);

    const productIds = verification.items.map(i => {
      const match = i.name.match(/guide|traitement|solutions|problemes|entretien|saisonnier|equipements/i);
      if (!match) return null;
      if (i.name.toLowerCase().includes('traitement')) return 1;
      if (i.name.toLowerCase().includes('solutions') || i.name.toLowerCase().includes('problemes')) return 2;
      if (i.name.toLowerCase().includes('entretien') || i.name.toLowerCase().includes('saisonnier')) return 3;
      if (i.name.toLowerCase().includes('equipements')) return 4;
      return null;
    }).filter(Boolean);

    const token = jwt.sign(
      { orderId: verification.orderId, productIds, email: verification.payerEmail },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, productIds, expiresIn: '24h' });
  } catch (err) {
    console.error('verify-order error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      productIds: decoded.productIds,
      orderId: decoded.orderId,
      email: decoded.email,
    });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: PAYPAL_MODE });
});

app.listen(PORT, () => {
  console.log(`Pool Academy server running on port ${PORT} (${PAYPAL_MODE})`);
});
