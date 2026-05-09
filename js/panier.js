function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  showNotification('Ajouté au panier ✓');
  const p = getProductDetails(productId);
  if (p && typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', {content_name: p.titre, content_ids: [p.id], content_type: 'product', value: p.prix, currency: 'EUR'});
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCartPage();
}

function getProductDetails(productId) {
  return produits.find(p => p.id === productId);
}

const PAYPAL_EMAIL = 'tachihante25@gmail.com';

function getCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const p = getProductDetails(item.id);
    return sum + (p ? p.prix * item.qty : 0);
  }, 0);
}

function renderCartPage() {
  const container = document.getElementById('cart-container');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <h2>Votre panier est vide</h2>
        <p class="text-muted">Découvrez nos ebooks pour une piscine parfaite.</p>
        <a href="produits.html" class="btn btn-blue" style="margin-top:1rem;">Voir les ebooks</a>
      </div>
    `;
    return;
  }

  const total = getCartTotal(cart);
  let itemsHtml = '';
  cart.forEach(item => {
    const p = getProductDetails(item.id);
    if (!p) return;
    itemsHtml += `
      <div class="cart-item">
        <img class="cart-item-cover" src="${p.image}" alt="${p.titre}">
        <div class="cart-item-info">
          <h4>${p.titre}</h4>
          <div class="price">${p.prix.toFixed(2)} €</div>
        </div>
        <div class="cart-item-qty">
          <button onclick="updateQty(${p.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${p.id}, 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})">✕</button>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="cart-page">
      <div>
        <h2>Votre panier (${cart.reduce((s,i) => s + i.qty, 0)})</h2>
        <div class="cart-items">${itemsHtml}</div>
      </div>
      <div class="cart-summary">
        <h3>Récapitulatif</h3>
        ${cart.map(item => {
          const p = getProductDetails(item.id);
          return p ? `<div class="cart-summary-row"><span>${p.titre} × ${item.qty}</span><span>${(p.prix * item.qty).toFixed(2)} €</span></div>` : '';
        }).join('')}
        <div class="cart-summary-row total">
          <span>Total</span>
          <span>${total.toFixed(2)} €</span>
        </div>
        <a id="paypal-checkout-btn" class="btn btn-success btn-block" style="margin-top:1rem;" target="_blank">
          <i class="fab fa-paypal"></i> Payer avec PayPal
        </a>
        <p style="font-size:0.8rem;color:#94a3b8;text-align:center;margin-top:0.5rem;">
          Paiement sécurisé PayPal • Téléchargement immédiat
        </p>
      </div>
    </div>
  `;

  setupPayPalButton(total);
}

function setupPayPalButton(total) {
  const btn = document.getElementById('paypal-checkout-btn');
  if (!btn) return;
  const cart = getCart();
  const desc = cart.map(i => {
    const p = getProductDetails(i.id);
    return p ? `${p.titre} x${i.qty}` : '';
  }).join(', ');
  const siteUrl = window.location.origin + window.location.pathname.replace('panier.html','') + 'merci.html';
  const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&item_name=Pool+Academy+-+Ebooks+Piscine&item_number=${encodeURIComponent(desc)}&amount=${total.toFixed(2)}&currency_code=EUR&return=${encodeURIComponent(siteUrl)}&cancel_return=${encodeURIComponent(window.location.href)}&notify_url=&bn=PP-BuyNowBF`;
  btn.href = url;
}
