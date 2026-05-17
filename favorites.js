/* ═══════════════════════════════════════════════════
   favorites.js — Greetings Favourites (API-integrated)
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  function getAPI() { return window.GreetingsAPI; }

  function getCardSrc(card) {
    const img = card.querySelector('img');
    return img ? (img.getAttribute('src') || '') : '';
  }

  async function injectHeart(card) {
    if (card.querySelector('.fav-btn')) return;
    const src = getCardSrc(card);
    if (!src) return;

    const isFav = await getAPI().isFavourite(src);
    const btn   = document.createElement('button');
    btn.className = 'fav-btn' + (isFav ? ' active' : '');
    btn.setAttribute('aria-label', 'Add to favourites');
    btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      const active = btn.classList.contains('active');
      try {
        if (active) {
          await getAPI().removeFavourite(src);
          btn.classList.remove('active');
        } else {
          await getAPI().addFavourite(src);
          btn.classList.add('active');
          spawnParticles(btn);
        }
        btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
        btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
        updateAllBadges();
      } catch(err) { console.error('Favourite error:', err); }
    });

    card.appendChild(btn);
  }

  function spawnParticles(btn) {
    const colors = ['#ff4d6d','#ff8fa3','#ffd6dc','#8b5cf6','#fff'];
    const rect   = btn.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('span');
      const angle = (i/8)*Math.PI*2, dist = 28+Math.random()*18;
      const tx = Math.cos(angle)*dist, ty = Math.sin(angle)*dist;
      Object.assign(dot.style, { position:'fixed', left:cx+'px', top:cy+'px', width:'6px', height:'6px', borderRadius:'50%', background:colors[Math.floor(Math.random()*colors.length)], pointerEvents:'none', zIndex:'9999', transform:'translate(-50%,-50%)', transition:'transform 0.5s ease, opacity 0.5s ease', opacity:'1' });
      document.body.appendChild(dot);
      requestAnimationFrame(() => { dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`; dot.style.opacity = '0'; });
      setTimeout(() => dot.remove(), 550);
    }
  }

  async function updateAllBadges() {
    const favs  = await getAPI().getFavourites();
    const count = favs.length;
    document.querySelectorAll('.fav-count-badge').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('has-favs', count > 0);
    });
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const card = btn.closest('.card');
      if (!card) return;
      const src = getCardSrc(card);
      getAPI().isFavourite(src).then(is => btn.classList.toggle('active', is));
    });
  }

  function injectNavButton() {
    document.querySelectorAll('#navRight, .nav-right, .g-nav-actions').forEach(navRight => {
      if (navRight.querySelector('.fav-nav-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'fav-nav-btn';
      btn.setAttribute('aria-label', 'View favourites');
      btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="fav-count-badge" id="favCountBadge">0</span>`;
      btn.addEventListener('click', openModal);
      navRight.prepend(btn);
    });
    updateAllBadges();
  }

  let modalEl = null;

  function buildModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'fav-modal-overlay';
    modalEl.innerHTML = `
      <div class="fav-modal" role="dialog" aria-modal="true">
        <div class="fav-modal-header">
          <div class="fav-modal-title"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved Favourites</div>
          <button class="fav-modal-close">&times;</button>
        </div>
        <div class="fav-modal-grid" id="favModalGrid"></div>
        <div class="fav-clear-all" id="favClearAll">Clear all favourites</div>
      </div>`;
    document.body.appendChild(modalEl);
    modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
    modalEl.querySelector('.fav-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalEl.classList.contains('open')) closeModal(); });
    modalEl.querySelector('#favClearAll').addEventListener('click', async () => {
      const favs = await getAPI().getFavourites();
      if (!favs.length) return;
      if (confirm('Remove all saved favourites?')) {
        await getAPI().clearAllFavourites();
        renderModal(); updateAllBadges();
      }
    });
  }

  async function renderModal() {
    const grid = document.getElementById('favModalGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.5);">Loading…</div>';
    const favs = await getAPI().getFavourites();
    grid.innerHTML = '';
    if (!favs.length) {
      grid.innerHTML = `<div class="fav-empty"><div class="fav-empty-icon">🤍</div><p>No favourites yet.<br>Tap the heart on any card to save it here.</p></div>`;
      return;
    }
    favs.forEach(src => {
      const card = document.createElement('div');
      card.className = 'fav-modal-card';
      const img = document.createElement('img');
      img.src = src; img.alt = 'Favourite card'; img.loading = 'lazy';
      img.addEventListener('click', () => { window.location.href = `view.html?img=${encodeURIComponent(src)}`; });
      const removeBtn = document.createElement('button');
      removeBtn.className = 'fav-remove-btn'; removeBtn.innerHTML = '✕';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await getAPI().removeFavourite(src);
        renderModal(); updateAllBadges();
      });
      card.appendChild(img); card.appendChild(removeBtn); grid.appendChild(card);
    });
  }

  function openModal()  { buildModal(); renderModal(); modalEl.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal() { if (!modalEl) return; modalEl.classList.remove('open'); document.body.style.overflow = ''; }

  async function initCardHearts() {
    document.querySelectorAll('.card-grid .card').forEach(injectHeart);
  }

  function init() { injectNavButton(); initCardHearts(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();