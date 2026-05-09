document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = getProductById(id);

  if (!product) {
    container.innerHTML = '<div class="text-center" style="padding:4rem;"><h2>Produit non trouvé</h2><a href="produits.html" class="btn btn-blue" style="margin-top:1rem;">Voir tous les produits</a></div>';
    return;
  }

  document.title = `${product.titre} — Pool Academy`;
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', {content_name: product.titre, content_ids: [product.id], content_type: 'product', value: product.prix, currency: 'EUR'});
  }

  const tocHtml = product.toc.map((item, i) => `<li>${item}</li>`).join('');

  const related = produits.filter(p => p.categorie === product.categorie && p.id !== product.id).slice(0, 2);

  container.innerHTML = `
    <div class="product-detail">
      <div>
        <img class="product-detail-cover" src="${product.image}" alt="${product.titre}">
        <div style="text-align:center;margin-top:0.5rem;color:#64748b;font-size:0.9rem;">${product.pages} pages • ${product.format}</div>
      </div>
      <div class="product-detail-info">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
        <h1>${product.titre}</h1>
        <p class="text-muted" style="margin:1rem 0;font-size:1.1rem;">${product.description}</p>
        <div class="price-large">${product.prix.toFixed(2)} €</div>
        <button class="btn btn-success btn-block" onclick="addToCart(${product.id})" style="margin-bottom:1rem;">
          <i class="fas fa-cart-plus"></i> Ajouter au panier
        </button>
        <div class="toc">
          <h3>Table des matières</h3>
          <ol>${tocHtml}</ol>
        </div>
      </div>
    </div>
    ${related.length ? `
      <div style="margin-top:2rem;">
        <h2>Vous aimerez aussi</h2>
        <div class="products-grid">
          ${related.map(p => `
            <div class="product-card" onclick="window.location='produit.html?id=${p.id}'">
              <img class="product-card-img" src="${p.image}" alt="${p.titre}" loading="lazy">
              <div class="product-card-body">
                <h3>${p.titre}</h3>
                <p class="desc">${p.description}</p>
                <div class="price">${p.prix.toFixed(2)} €</div>
                <button class="btn btn-blue btn-sm btn-block" onclick="event.stopPropagation();addToCart(${p.id})">
                  <i class="fas fa-cart-plus"></i> Ajouter
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
});
