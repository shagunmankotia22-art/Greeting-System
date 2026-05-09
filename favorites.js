// favorites.js
/* ================= GREETINGS - FAVOURITES SYSTEM ================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'greetings_favourites';

  /* ── Storage helpers ── */
  function getFavs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function saveFavs(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function isFav(src) {
    return getFavs().includes(src);
  }

  function toggleFav(src) {
    const favs = getFavs();
    const idx  = favs.indexOf(src);
    if (idx === -1) { favs.push(src); }
    else            { favs.splice(idx, 1); }
    saveFavs(favs);
    return idx === -1; // true = just added
  }

  /* ── Image src from card ── */
  function getCardSrc(card) {
    const img = card.querySelector('img');
    return img ? (img.getAttribute('src') || '') : '';
  }

  /* ── Inject heart button onto a single card ── */
  function injectHeart(card) {
    if (card.querySelector('.fav-btn')) return; // already done

    const src = getCardSrc(card);
    if (!src) return;

    const btn = document.createElement('button');
    btn.className  = 'fav-btn' + (isFav(src) ? ' active' : '');
    btn.setAttribute('aria-label', 'Add to favourites');
    btn.setAttribute('title', 'Save to Favourites');
    btn.innerHTML  = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                 a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>`;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const added = toggleFav(src);
      btn.classList.toggle('active', added);

      // Pop animation
      btn.classList.remove('pop');
      void btn.offsetWidth; // reflow
      btn.classList.add('pop');
      btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });

      // Update all navbar badges
      updateAllBadges();

      // Particle burst on add
      if (added) spawnParticles(btn);
    });

    card.appendChild(btn);
  }

  /* ── Tiny particle burst on favourite ── */
  function spawnParticles(btn) {
    const colors = ['#ff4d6d','#ff8fa3','#ffd6dc','#8b5cf6','#fff'];
    const rect   = btn.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('span');
      const angle = (i / 8) * Math.PI * 2;
      const dist  = 28 + Math.random() * 18;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size  = 5 + Math.random() * 5;

      Object.assign(dot.style, {
        position:  'fixed',
        left:      cx + 'px',
        top:       cy + 'px',
        width:     size + 'px',
        height:    size + 'px',
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        zIndex:    9999,
        transform: 'translate(-50%,-50%)',
        transition: 'transform 0.5s ease, opacity 0.5s ease',
        opacity:   '1',
      });

      document.body.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
        dot.style.opacity   = '0';
      });

      setTimeout(() => dot.remove(), 550);
    }
  }

  /* ── Inject hearts on all cards on the page ── */
  function initCardHearts() {
    const cards = document.querySelectorAll('.card-grid .card');
    cards.forEach(injectHeart);
  }

  /* ── Navbar favourites button ── */
  function injectNavButton() {
    // Inject into every nav-right found on the page
    document.querySelectorAll('#navRight, .nav-right').forEach(navRight => {
      if (navRight.querySelector('.fav-nav-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'fav-nav-btn';
      btn.setAttribute('aria-label', 'View favourites');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                   a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                   1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        Saved
        <span class="fav-count-badge" id="favCountBadge">0</span>`;

      btn.addEventListener('click', openModal);
      navRight.prepend(btn);
    });

    updateAllBadges();
  }

  /* ── Update all count badges ── */
  function updateAllBadges() {
    const count = getFavs().length;
    document.querySelectorAll('.fav-count-badge').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('has-favs', count > 0);
    });
    // Also re-sync heart buttons on page (in case modal removed one)
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const card = btn.closest('.card');
      if (!card) return;
      const src = getCardSrc(card);
      btn.classList.toggle('active', isFav(src));
    });
  }

  /* ── Modal ── */
  let modalEl = null;

  function buildModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.className = 'fav-modal-overlay';
    modalEl.innerHTML = `
      <div class="fav-modal" role="dialog" aria-modal="true" aria-label="Saved Favourites">
        <div class="fav-modal-header">
          <div class="fav-modal-title">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                       a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                       1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Saved Favourites
          </div>
          <button class="fav-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="fav-modal-grid" id="favModalGrid"></div>
        <div class="fav-clear-all" id="favClearAll">Clear all favourites</div>
      </div>`;

    document.body.appendChild(modalEl);

    // Close on overlay click
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) closeModal();
    });

    // Close button
    modalEl.querySelector('.fav-modal-close').addEventListener('click', closeModal);

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modalEl.classList.contains('open')) closeModal();
    });

    // Clear all
    modalEl.querySelector('#favClearAll').addEventListener('click', () => {
      if (!getFavs().length) return;
      if (confirm('Remove all saved favourites?')) {
        saveFavs([]);
        renderModal();
        updateAllBadges();
      }
    });
  }

  function renderModal() {
    const grid = document.getElementById('favModalGrid');
    if (!grid) return;

    const favs = getFavs();
    grid.innerHTML = '';

    if (favs.length === 0) {
      grid.innerHTML = `
        <div class="fav-empty">
          <div class="fav-empty-icon">🤍</div>
          <p>No favourites yet.<br>Tap the heart on any card to save it here.</p>
        </div>`;
      return;
    }

    favs.forEach(src => {
      const card = document.createElement('div');
      card.className = 'fav-modal-card';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Favourite card';
      img.loading = 'lazy';

      // Click image → go to view page
      img.addEventListener('click', () => {
        window.location.href = `view.html?img=${encodeURIComponent(src)}`;
      });

      const removeBtn = document.createElement('button');
      removeBtn.className = 'fav-remove-btn';
      removeBtn.setAttribute('aria-label', 'Remove from favourites');
      removeBtn.innerHTML = '✕';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        const favs2 = getFavs().filter(f => f !== src);
        saveFavs(favs2);
        renderModal();
        updateAllBadges();
      });

      card.appendChild(img);
      card.appendChild(removeBtn);
      grid.appendChild(card);
    });
  }

  function openModal() {
    buildModal();
    renderModal();
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Init ── */
  function init() {
    injectNavButton();
    initCardHearts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();