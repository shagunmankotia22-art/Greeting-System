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
        color: rgba(255,255,255,0.88);
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

      /* Dropdown */
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
      }
      .g-user-dropdown.open { display: block; }

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
        color: #fff;
        font-weight: 700;
        font-size: 0.95rem;
        line-height: 1.3;
      }
      .g-dd-email {
        color: rgba(255,255,255,0.4);
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

        <button class="g-dd-item" id="gDdSaved">
          <div class="g-dd-icon ic-pink">&#10084;</div>
          Saved Cards
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
      /* Hide login/signup */
      if (authButtons) { authButtons.style.display = 'none'; authButtons.classList.add('hidden'); }
      if (gBtnLogin)   gBtnLogin.style.display  = 'none';
      if (gBtnSignup)  gBtnSignup.style.display = 'none';
      if (userProfile) { userProfile.style.display = 'none'; userProfile.classList.add('hidden'); }

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

        /* Saved Cards */
        document.getElementById('gDdSaved')?.addEventListener('click', () => {
          dropdownEl.classList.remove('open');
          pillEl.classList.remove('open');
          const favBtn = document.querySelector('.fav-nav-btn');
          if (favBtn) favBtn.click();
          else alert('Heart any card to save it here! ❤️');
        });

        /* Logout */
        document.getElementById('gDdLogout')?.addEventListener('click', logout);
      }

    } else {
      /* Logged out */
      if (authButtons) { authButtons.style.display = ''; authButtons.classList.remove('hidden'); }
      if (gBtnLogin)   gBtnLogin.style.display  = '';
      if (gBtnSignup)  gBtnSignup.style.display = '';
      if (userProfile) { userProfile.style.display = 'none'; userProfile.classList.add('hidden'); }

      /* Remove pill */
      const existingPill = document.getElementById('gUserPill');
      if (existingPill) existingPill.closest('div[style*="position"]')?.remove();
    }

    /* Old-style logout button fallback */
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
  }

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