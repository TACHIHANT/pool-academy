(function() {
  if (localStorage.getItem('pool-lead-shown')) return;
  const overlay = document.createElement('div');
  overlay.id = 'lead-overlay';
  overlay.innerHTML = '<div class="lead-modal"><button class="lead-close" onclick="closeLead()">&times;</button><div class="lead-content"><i class="fas fa-gift" style="font-size:3rem;color:#0ea5e9;margin-bottom:1rem;"></i><h3>Recevez votre guide gratuit</h3><p style="color:#64748b;margin-bottom:1.5rem;">"Les 5 erreurs qui ruinent votre piscine" — offert !</p><form id="lead-form"><input type="hidden" name="sujet" value="Newsletter - Guide gratuit"><input type="email" name="email" placeholder="Votre email" required style="width:100%;padding:0.75rem;border:2px solid #e2e8f0;border-radius:10px;margin-bottom:1rem;font-size:1rem;"><button type="submit" class="btn btn-blue btn-block" id="lead-submit"><i class="fas fa-download"></i> Recevoir le guide</button></form><p style="font-size:0.75rem;color:#94a3b8;margin-top:0.75rem;" id="lead-status">Votre email ne sera jamais partagé. Désabonnez-vous à tout moment.</p></div></div>';
  const style = document.createElement('style');
  style.textContent = '#lead-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s}.lead-modal{background:#fff;border-radius:20px;padding:2rem;max-width:420px;width:90%;position:relative;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)}.lead-close{position:absolute;top:10px;right:15px;font-size:1.8rem;border:none;background:none;cursor:pointer;color:#94a3b8;line-height:1}.lead-close:hover{color:#1a2a3a}.lead-content h3{margin-bottom:0.5rem}@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  function closeLead() { overlay.remove(); localStorage.setItem('pool-lead-shown', '1'); }

  setTimeout(function() {
    const form = document.getElementById('lead-form');
    const status = document.getElementById('lead-status');
    const submitBtn = document.getElementById('lead-submit');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        fetch('https://formspree.io/f/xgodnlkr', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function(r) {
          if (r.ok) {
            status.textContent = 'Merci ! Votre guide va vous être envoyé par email.';
            status.style.color = '#10b981';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Envoyé !';
            setTimeout(closeLead, 2000);
          } else {
            throw new Error('Erreur');
          }
        }).catch(function() {
          status.textContent = 'Une erreur est survenue. Réessayez ou contactez-nous.';
          status.style.color = '#ef4444';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-download"></i> Recevoir le guide';
        });
      });
    }
    const closeBtn = overlay.querySelector('.lead-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLead);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeLead();
    });
  }, 100);
})();