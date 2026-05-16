/* ═══════════════════════════════════════════
   nav-auth.js — crystal face avatar in navbar
   ═══════════════════════════════════════════ */

const STORAGE_KEY = 'greetings_user';

const PROFILE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="38" height="38" style="display:block;">
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
  <polygon points="76,152 100,144 106,158 96,170" fill="#0888b8" opacity="0.72"/>
  <polygon points="106,158 112,130 128,150" fill="#5020a8" opacity="0.74"/>
  <line x1="100" y1="30" x2="144" y2="30" stroke="#30f0f0" stroke-width="0.7" opacity="0.6"/>
  <line x1="100" y1="30" x2="130" y2="58" stroke="#20e0e8" stroke-width="0.5" opacity="0.5"/>
  <line x1="144" y1="30" x2="144" y2="84" stroke="#20d8e8" stroke-width="0.6" opacity="0.55"/>
  <line x1="122" y1="90" x2="138" y2="116" stroke="#18c8d8" stroke-width="0.5" opacity="0.5"/>
  <line x1="112" y1="130" x2="106" y2="158" stroke="#18b8c8" stroke-width="0.5" opacity="0.45"/>
</svg>`;

function getUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function applyAvatarIcon(avatarEl) {
  avatarEl.innerHTML            = PROFILE_ICON_SVG;
  avatarEl.style.background     = 'transparent';
  avatarEl.style.fontSize       = '';
  avatarEl.style.color          = '';
  avatarEl.style.borderRadius   = '50%';
  avatarEl.style.overflow       = 'hidden';
  avatarEl.style.width          = '38px';
  avatarEl.style.height         = '38px';
  avatarEl.style.display        = 'flex';
  avatarEl.style.alignItems     = 'center';
  avatarEl.style.justifyContent = 'center';
  avatarEl.style.cursor         = 'pointer';
}

function renderNav() {
  const user = getUser();

  const avatarEl  = document.getElementById('navAvatar')
    || document.getElementById('userAvatar')
    || document.querySelector('.nav-avatar')
    || document.querySelector('.user-avatar')
    || document.querySelector('.avatar');

  const nameEl    = document.getElementById('navUserName')
    || document.getElementById('userName')
    || document.querySelector('.nav-user-name')
    || document.querySelector('.user-name');

  const loginLink  = document.getElementById('navLoginLink')  || document.querySelector('.nav-login');
  const logoutBtn  = document.getElementById('navLogoutBtn')  || document.querySelector('.nav-logout');
  const signupLink = document.getElementById('navSignupLink') || document.querySelector('.nav-signup');

  if (avatarEl) applyAvatarIcon(avatarEl);

  if (user && user.name) {
    if (avatarEl)   avatarEl.title       = user.name;
    if (nameEl)   { nameEl.textContent   = user.name; nameEl.style.display = ''; }
    if (loginLink)  loginLink.style.display  = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (logoutBtn)  logoutBtn.style.display  = '';
  } else {
    if (nameEl)     nameEl.style.display     = 'none';
    if (loginLink)  loginLink.style.display  = '';
    if (signupLink) signupLink.style.display = '';
    if (logoutBtn)  logoutBtn.style.display  = 'none';
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const logoutBtn = document.getElementById('navLogoutBtn') || document.querySelector('.nav-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});