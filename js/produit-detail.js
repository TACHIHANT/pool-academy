const AMAZON_TAG = 'poolacademy-21';

const amazonLinks = {
  traitement: [
    { q: 'testeur+ph+piscine', label: 'Testeur pH électronique' },
    { q: 'chlore+piscine+pastille', label: 'Pastilles chlore piscine' },
    { q: 'stabilisant+piscine', label: 'Stabilisant piscine' },
  ],
  problemes: [
    { q: 'algicide+piscine', label: 'Algicide piscine' },
    { q: 'floculant+piscine', label: 'Floculant piscine' },
    { q: 'anti-calcaire+piscine', label: 'Anti-calcaire piscine' },
  ],
  saisonnier: [
    { q: 'bache+hivernage+piscine', label: 'Bâche hivernage' },
    { q: 'couverture+piscine+ete', label: 'Couverture été' },
    { q: 'bidon+degivrage+piscine', label: 'Bidon dégivrage' },
  ],
  equipement: [
    { q: 'robot+piscine+electrique', label: 'Robot piscine' },
    { q: 'pompe+filtration+piscine', label: 'Pompe filtration' },
    { q: 'chauffage+piscine', label: 'Chauffage piscine' },
  ],
};

function amazonLink(keyword) {
  return `https://www.amazon.fr/s?k=${encodeURIComponent(keyword)}&tag=${AMAZON_TAG}`;
}

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
  const amzItems = amazonLinks[product.categorie] || [];

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
        ${amzItems.length ? `
          <div style="margin:1.5rem 0;padding:1.25rem;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
            <h3 style="font-size:1rem;margin-bottom:0.75rem;"><i class="fab fa-amazon" style="color:#ff9900;"></i> Matériel recommandé sur Amazon</h3>
            ${amzItems.map(item => `
              <a href="${amazonLink(item.q)}" target="_blank" rel="nofollow sponsored" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0;color:#0369a1;font-weight:500;border-bottom:1px solid #bae6fd;">
                <i class="fas fa-chevron-right" style="font-size:0.7rem;"></i> ${item.label}
              </a>
            `).join('')}
            <p style="font-size:0.7rem;color:#64748b;margin-top:0.5rem;">Liens partenaires Amazon — prix identiques</p>
          </div>
        ` : ''}
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
