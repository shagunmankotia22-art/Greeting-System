/* ═══════════════════════════════════════════════════
   nav-auth.js — Greetings Navbar Auth (API-integrated)
   ═══════════════════════════════════════════════════ */

const PROFILE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="38" height="38" style="display:block;">
  <circle cx="100" cy="100" r="98" fill="#0d1129"/>
  <polygon points="100,30 130,58 112,78" fill="#0a0c1a"/>
  <polygon points="130,58 144,84 122,90" fill="#08091a"/>
  <polygon points="70,58 88,78 56,90" fill="#070818"/>
  <polygon points="100,30 70,58 88,78" fill="#0c0e22"/>
  <polygon points="88,78 112,78 100,102" fill="#090b1c"/>
  <polygon points="144,84 138,116 120,104" fill="#07091a"/>
  <polygon points="56,90 62,122 80,110" fill="#080a1c"/>
  <polygon points="100,30 130,58 144,30" fill="#0dd4d4" opacity="0.88"/>
  <polygon points="130,58 144,84 144,30" fill="#0ab8cc" opacity="0.82"/>
  <polygon points="120,104 144,84 138,116" fill="#09c4d4" opacity="0.8"/>
  <polygon points="80,110 100,102 88,78" fill="#0dcce0" opacity="0.78"/>
  <polygon points="100,102 120,104 112,130" fill="#08b8c8" opacity="0.74"/>
  <polygon points="80,110 112,130 100,144" fill="#0ac0d0" opacity="0.68"/>
  <polygon points="70,58 100,30 88,78" fill="#6a34c8" opacity="0.88"/>
  <polygon points="56,90 88,78 62,122" fill="#7040d0" opacity="0.82"/>
  <polygon points="112,78 130,58 122,90" fill="#5a28b8" opacity="0.8"/>
  <polygon points="120,104 138,116 112,130" fill="#6030c0" opacity="0.78"/>
  <polygon points="62,122 80,110 100,144" fill="#7038c8" opacity="0.74"/>
  <polygon points="100,144 112,130 106,158" fill="#5828b0" opacity="0.72"/>
  <polygon points="80,110 100,144 76,152" fill="#6830c0" opacity="0.68"/>
  <polygon points="112,78 122,90 100,102" fill="#1890a8" opacity="0.92"/>
  <polygon points="122,90 120,104 138,116" fill="#1070a0" opacity="0.88"/>
  <polygon points="62,122 80,110 76,152" fill="#1878a8" opacity="0.82"/>
  <polygon points="100,102 112,130 106,158" fill="#1060a0" opacity="0.85"/>
  <line x1="100" y1="30" x2="144" y2="30" stroke="#30f0f0" stroke-width="0.7" opacity="0.6"/>
  <line x1="100" y1="30" x2="130" y2="58" stroke="#20e0e8" stroke-width="0.5" opacity="0.5"/>
  <line x1="144" y1="30" x2="144" y2="84" stroke="#20d8e8" stroke-width="0.6" opacity="0.55"/>
</svg>`;

function renderNav() {
  const user       = window.GreetingsAPI?.getUser();
  const isLoggedIn = window.GreetingsAPI?.isLoggedIn();

  const authButtons = document.getElementById('authButtons');
  const userProfile = document.getElementById('userProfile');
  const avatar      = document.getElementById('avatar');
  const userEmail   = document.getElementById('userEmail');
  const logoutBtn   = document.getElementById('logoutBtn');

  // New navbar buttons
  const gBtnLogin  = document.querySelector('.g-btn-login');
  const gBtnSignup = document.querySelector('.g-btn-signup');

  if (isLoggedIn && user) {
    // Hide login/signup buttons
    if (authButtons) authButtons.style.display = 'none';
    if (gBtnLogin)  gBtnLogin.style.display  = 'none';
    if (gBtnSignup) gBtnSignup.style.display = 'none';

    // Show avatar
    if (userProfile) {
      userProfile.classList.remove('hidden');
      userProfile.style.display = 'flex';
      userProfile.style.alignItems = 'center';
      userProfile.style.gap = '8px';
    }

    if (avatar) {
      avatar.innerHTML = PROFILE_ICON_SVG;
      avatar.title     = user.name;
      avatar.style.cssText = 'cursor:pointer;width:38px;height:38px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;flex-shrink:0;';

      // Toggle dropdown on click
      const dropdown = document.getElementById('dropdown');
      if (dropdown) {
        avatar.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        });
        document.addEventListener('click', () => dropdown.style.display = 'none');
      }
    }

    if (userEmail && user.email) userEmail.textContent = user.email;

    // Also show user name if element exists
    const userName = document.getElementById('navUserName') || document.querySelector('.nav-user-name');
    if (userName) { userName.textContent = user.name; userName.style.display = ''; }

    // Show in navbar actions as crystal icon + name
    const navActions = document.querySelector('.g-nav-actions');
    if (navActions && !navActions.querySelector('.g-user-pill')) {
      const pill = document.createElement('div');
      pill.className = 'g-user-pill';
      pill.style.cssText = 'display:flex;align-items:center;gap:8px;cursor:pointer;position:relative;';
      pill.innerHTML = `
        ${PROFILE_ICON_SVG}
        <span style="color:rgba(255,255,255,0.85);font-size:0.88rem;font-weight:600;">${user.name.split(' ')[0]}</span>
        <div id="g-user-dropdown" style="display:none;position:absolute;top:calc(100% + 12px);right:0;background:rgba(10,6,28,0.97);border:1px solid rgba(124,58,237,0.35);border-radius:14px;padding:8px;min-width:180px;z-index:99999;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:6px;">
            <div style="color:#fff;font-weight:700;font-size:0.9rem;">${user.name}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:0.78rem;">${user.email}</div>
          </div>
          <a href="profile.html" style="display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.8);text-decoration:none;padding:9px 14px;border-radius:10px;font-size:0.88rem;transition:all 0.18s;" onmouseover="this.style.background='rgba(124,58,237,0.2)'" onmouseout="this.style.background=''">👤 My Profile</a>
          <button id="g-logout-btn" style="display:flex;align-items:center;gap:8px;color:#ff4d6d;background:none;border:none;padding:9px 14px;border-radius:10px;font-size:0.88rem;cursor:pointer;width:100%;text-align:left;transition:all 0.18s;" onmouseover="this.style.background='rgba(255,77,109,0.1)'" onmouseout="this.style.background=''">🚪 Logout</button>
        </div>`;

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = document.getElementById('g-user-dropdown');
        if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
      });
      document.addEventListener('click', () => {
        const dd = document.getElementById('g-user-dropdown');
        if (dd) dd.style.display = 'none';
      });

      navActions.innerHTML = '';
      navActions.appendChild(pill);

      document.getElementById('g-logout-btn')?.addEventListener('click', () => {
        window.GreetingsAPI.logout();
      });
    }

  } else {
    // Not logged in — show login/signup
    if (authButtons) { authButtons.style.display = ''; authButtons.classList.remove('hidden'); }
    if (gBtnLogin)  gBtnLogin.style.display  = '';
    if (gBtnSignup) gBtnSignup.style.display = '';
    if (userProfile) { userProfile.classList.add('hidden'); userProfile.style.display = 'none'; }
  }

  // Old-style logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.GreetingsAPI.logout());
  }
}

// Expose globally so auth.js can call it after login
window.updateNavAuth = renderNav;

document.addEventListener('DOMContentLoaded', renderNav);