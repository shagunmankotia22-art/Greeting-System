/* ═══════════════════════════════════════════════════
   nav-auth.js — Greetings Navbar Auth
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const USER_KEY = 'greetings_user';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  }

  function isLoggedIn() { return !!getUser(); }

  function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
  }

  /* ── Inject CSS once ── */
  function injectCSS() {
    if (document.getElementById('nav-auth-css')) return;
    const style = document.createElement('style');
    style.id = 'nav-auth-css';
    style.textContent = `
      .g-user-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px 5px 6px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 100px;
        cursor: pointer;
        position: relative;
        transition: background 0.2s, border-color 0.2s;
        user-select: none;
      }
      .g-user-pill:hover {
        background: rgba(255,255,255,0.11);
        border-color: rgba(147,51,234,0.5);
      }
      .g-pill-avatar {
        width: 30px; height: 30px; border-radius: 50%;
        background: linear-gradient(135deg,#9333ea,#ff4d6d);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0;
      }
      .g-pill-name {
        color: #ffffff;
        font-size: 0.88rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .g-pill-chevron {
        width: 14px; height: 14px;
        opacity: 0.5;
        transition: transform 0.2s;
        flex-shrink: 0;
        color: #fff;
      }
      .g-user-pill.open .g-pill-chevron { transform: rotate(180deg); }

      /* Dropdown — dark mode (default) */
      .g-user-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 230px;
        background: rgba(10,6,28,0.97);
        border: 1px solid rgba(124,58,237,0.3);
        border-radius: 16px;
        padding: 6px;
        z-index: 999999;
        box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: #ffffff;
      }
      .g-user-dropdown.open { display: block; }

      /* Dropdown — light mode */
      body.light-mode .g-user-dropdown {
        background: #ffffff !important;
        border: 1px solid rgba(124,58,237,0.2);
        box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
        color: #111111;
      }
      body.light-mode .g-pill-name {
        color: #111111;
      }
      body.light-mode .g-dd-name {
        color: #111111 !important;
      }
      body.light-mode .g-dd-email {
        color: rgba(0,0,0,0.45) !important;
      }
      body.light-mode .g-dd-header {
        border-bottom: 1px solid rgba(0,0,0,0.08);
      }
      body.light-mode .g-dd-item {
        color: #222222;
      }
      body.light-mode .g-dd-item:hover {
        background: rgba(0,0,0,0.05);
        color: #111111;
      }
      body.light-mode .g-dd-item.danger { color: #e11d48; }
      body.light-mode .g-dd-item.danger:hover { background: rgba(225,29,72,0.08); }
      body.light-mode .g-dd-divider { background: rgba(0,0,0,0.08); }
      body.light-mode .g-dd-icon.ic-purple { background: rgba(124,58,237,0.1); }
      body.light-mode .g-dd-icon.ic-pink   { background: rgba(255,77,109,0.1); }
      body.light-mode .g-dd-icon.ic-red    { background: rgba(225,29,72,0.08); }

      .g-dd-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px 14px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-bottom: 4px;
      }
      .g-dd-big-avatar {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg,#9333ea,#ff4d6d);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 18px; font-weight: 700; flex-shrink: 0;
      }
      .g-dd-name {
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        line-height: 1.3;
      }
      .g-dd-email {
        color: rgba(255,255,255,0.5);
        font-size: 0.75rem;
        margin-top: 2px;
        word-break: break-all;
      }

      .g-dd-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.15s;
        text-decoration: none;
        color: rgba(255,255,255,0.8);
        font-size: 0.88rem;
        font-weight: 500;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
      }
      .g-dd-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
      .g-dd-item.danger { color: #ff4d6d; }
      .g-dd-item.danger:hover { background: rgba(255,77,109,0.1); }

      .g-dd-icon {
        width: 32px; height: 32px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; flex-shrink: 0;
      }
      .g-dd-icon.ic-purple { background: rgba(147,51,234,0.2); }
      .g-dd-icon.ic-pink   { background: rgba(255,77,109,0.15); }
      .g-dd-icon.ic-red    { background: rgba(255,77,109,0.12); }

      .g-dd-fav-count {
        margin-left: auto;
        background: linear-gradient(135deg, #ff4d6d, #8b5cf6);
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        display: none;
      }
      .g-dd-fav-count.has-favs { display: inline-flex; }
      .g-dd-divider {
        height: 1px;
        background: rgba(255,255,255,0.07);
        margin: 4px 6px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Build pill HTML ── */
  function buildPill(user) {
    const firstName = (user.name || 'User').split(' ')[0];
    const initial   = firstName[0].toUpperCase();

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;display:flex;align-items:center;';

    wrap.innerHTML = `
      <div class="g-user-pill" id="gUserPill">
        <div class="g-pill-avatar">${initial}</div>
        <span class="g-pill-name">${firstName}</span>
        <svg class="g-pill-chevron" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div class="g-user-dropdown" id="gUserDropdown">
        <div class="g-dd-header">
          <div class="g-dd-big-avatar">${initial}</div>
          <div>
            <div class="g-dd-name">${user.name || 'User'}</div>
            <div class="g-dd-email">${user.email || ''}</div>
          </div>
        </div>

        <a href="profile.html" class="g-dd-item">
          <div class="g-dd-icon ic-purple">&#128100;</div>
          My Profile
        </a>

        <button class="g-dd-item" id="gDdFavourites">
          <div class="g-dd-icon ic-pink">&#10084;</div>
          Saved
          <span class="g-dd-fav-count" id="gDdFavCount"></span>
        </button>

        <div class="g-dd-divider"></div>

        <button class="g-dd-item danger" id="gDdLogout">
          <div class="g-dd-icon ic-red">&#128682;</div>
          Logout
        </button>
      </div>
    `;

    return wrap;
  }

  /* ── Main render ── */
  function renderNav() {
    injectCSS();

    const user     = getUser();
    const loggedIn = isLoggedIn();

    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const gBtnLogin   = document.querySelector('.g-btn-login');
    const gBtnSignup  = document.querySelector('.g-btn-signup');
    const navActions  = document.querySelector('.g-nav-actions') ||
                        document.getElementById('navRight');

    if (loggedIn && user) {
      /* Hide login/signup — aggressive, use !important via inline style */
      if (authButtons) {
        authButtons.setAttribute('style','display:none!important');
        authButtons.classList.add('hidden');
      }
      if (gBtnLogin)  gBtnLogin.setAttribute('style','display:none!important');
      if (gBtnSignup) gBtnSignup.setAttribute('style','display:none!important');
      if (userProfile) {
        userProfile.setAttribute('style','display:none!important');
        userProfile.classList.add('hidden');
      }

      /* Inject pill once */
      if (navActions && !document.getElementById('gUserPill')) {
        const pillWrap = buildPill(user);
        navActions.appendChild(pillWrap);

        const pillEl     = document.getElementById('gUserPill');
        const dropdownEl = document.getElementById('gUserDropdown');

        /* Toggle */
        pillEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const open = dropdownEl.classList.contains('open');
          dropdownEl.classList.toggle('open', !open);
          pillEl.classList.toggle('open', !open);
        });

        /* Close outside */
        document.addEventListener('click', () => {
          dropdownEl.classList.remove('open');
          pillEl.classList.remove('open');
        });
        dropdownEl.addEventListener('click', (e) => e.stopPropagation());

        /* Saved Favourites */
        document.getElementById('gDdFavourites')?.addEventListener('click', () => {
          dropdownEl.classList.remove('open');
          pillEl.classList.remove('open');
          if (window._favOpenModal) window._favOpenModal();
          else document.dispatchEvent(new CustomEvent('fav:open'));
        });

        /* Logout */
        document.getElementById('gDdLogout')?.addEventListener('click', logout);
      }

    } else {
      /* Logged out — restore buttons */
      if (authButtons) {
        authButtons.removeAttribute('style');
        authButtons.style.display = 'flex';
        authButtons.classList.remove('hidden');
      }
      if (gBtnLogin)  { gBtnLogin.removeAttribute('style');  gBtnLogin.style.display  = 'inline-flex'; }
      if (gBtnSignup) { gBtnSignup.removeAttribute('style'); gBtnSignup.style.display = 'inline-flex'; }
      if (userProfile) {
        userProfile.setAttribute('style','display:none!important');
        userProfile.classList.add('hidden');
      }

      /* Remove pill */
      const existingPill = document.getElementById('gUserPill');
      if (existingPill) existingPill.closest('div[style*="position"]')?.remove();
    }

    /* Old-style logout button fallback */
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
  }

  /* ── Re-hide buttons after DOM changes (e.g. favorites.js runs) ── */
  function enforceHideOnLogin() {
    if (!isLoggedIn()) return;
    const ab = document.getElementById('authButtons');
    const gl = document.querySelector('.g-btn-login');
    const gs = document.querySelector('.g-btn-signup');
    if (ab && ab.style.display !== 'none') ab.setAttribute('style','display:none!important');
    if (gl && gl.style.display !== 'none') gl.setAttribute('style','display:none!important');
    if (gs && gs.style.display !== 'none') gs.setAttribute('style','display:none!important');
  }

  /* Watch for any DOM mutation that might re-show the buttons */
  const _observer = new MutationObserver(enforceHideOnLogin);
  document.addEventListener('DOMContentLoaded', () => {
    const navArea = document.querySelector('.g-nav-actions') || document.getElementById('navRight');
    if (navArea) {
      _observer.observe(navArea, { childList: true, subtree: true, attributes: true, attributeFilter: ['style','class'] });
    }
  });

  /* ── Expose ── */
  window.updateNavAuth = renderNav;
  // Extend GreetingsAPI if api.js already set it up; don't overwrite the full object
  if (window.GreetingsAPI) {
    window.GreetingsAPI.getUser    = window.GreetingsAPI.getUser    || getUser;
    window.GreetingsAPI.isLoggedIn = window.GreetingsAPI.isLoggedIn || isLoggedIn;
    window.GreetingsAPI.logout     = window.GreetingsAPI.logout     || logout;
  } else {
    window.GreetingsAPI = { getUser, isLoggedIn, logout };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNav);
  } else {
    renderNav();
  }

})();