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

const PAYPAL_CLIENT_ID = 'AY9HXafcPHStF8HwHiwdJ1OyRDSC739naTxvTnA_PbjIZXa4hF2Acb3735u7zgST8zok7jCcaMBkKtQN';

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
        <div id="paypal-button-container" style="margin-top:1rem;"></div>
        <p style="font-size:0.8rem;color:#94a3b8;text-align:center;margin-top:0.5rem;">
          Paiement sécurisé PayPal • Téléchargement immédiat
        </p>
      </div>
    </div>
  `;

  setupPayPalButton(total);
}

function setupPayPalButton(total) {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  container.innerHTML = '';
  if (typeof paypal === 'undefined') return;

  const cart = getCart();

  paypal.Buttons({
    style: { color: 'gold', shape: 'rect', layout: 'vertical', label: 'paypal' },
    createOrder: function(data, actions) {
      const items = cart.map(i => {
        const p = getProductDetails(i.id);
        return p ? { name: p.titre, unit_amount: { value: p.prix.toFixed(2), currency_code: 'EUR' }, quantity: i.qty } : null;
      }).filter(Boolean);
      return actions.order.create({
        purchase_units: [{
          description: 'Pool Academy - Ebooks Piscine',
          amount: { value: total.toFixed(2), currency_code: 'EUR', breakdown: { item_total: { value: total.toFixed(2), currency_code: 'EUR' } } },
          items: items
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        fbq('track', 'Purchase', { value: total.toFixed(2), currency: 'EUR' });
        var apiUrl = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : '';
        if (apiUrl) {
          return fetch(apiUrl + '/api/verify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: details.id }),
          }).then(function(r) { return r.json(); }).then(function(result) {
            if (result.token) {
              localStorage.setItem('pool-token', result.token);
              localStorage.setItem('pool-purchased', JSON.stringify(result.productIds));
            } else {
              localStorage.setItem('pool-purchased', JSON.stringify(cart.map(i => i.id)));
            }
            localStorage.removeItem('pool-cart');
            window.location.href = 'merci.html' + (result.token ? '?token=' + result.token : '');
          }).catch(function() {
            localStorage.setItem('pool-purchased', JSON.stringify(cart.map(i => i.id)));
            localStorage.removeItem('pool-cart');
            window.location.href = 'merci.html';
          });
        } else {
          localStorage.setItem('pool-purchased', JSON.stringify(cart.map(i => i.id)));
          localStorage.removeItem('pool-cart');
          window.location.href = 'merci.html';
        }
      });
    },
    onCancel: function() {
      showNotification('Paiement annulé', 'error');
    },
    onError: function(err) {
      showNotification('Erreur de paiement', 'error');
    }
  }).render('#paypal-button-container');
}
