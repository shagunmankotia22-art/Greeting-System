/* ================= GREETINGS - NAV AUTH ================= */
/* Add <script src="nav-auth.js"></script> to every page   */

(function () {
  'use strict';

  const USER_KEY = 'greetings_user';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  }

  function updateNavAuth() {
    const user        = getUser();
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const avatar      = document.getElementById('avatar');
    const userEmail   = document.getElementById('userEmail');
    const profileLink = document.getElementById('profileLink');

    if (user) {
      /* ── Logged in ── */
      if (authButtons) authButtons.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');

      if (avatar) {
        avatar.textContent = user.name ? user.name[0].toUpperCase() : '👤';
        avatar.title = user.name || user.email;
      }
      if (userEmail)   userEmail.textContent = user.email || '';
      if (profileLink) profileLink.href = 'profile.html';

    } else {
      /* ── Logged out ── */
      if (authButtons) authButtons.classList.remove('hidden');
      if (userProfile) userProfile.classList.add('hidden');
    }
  }

  /* ── Avatar click → toggle dropdown ── */
  function initDropdown() {
    const avatar   = document.getElementById('avatar');
    const dropdown = document.getElementById('dropdown');

    if (avatar && dropdown) {
      avatar.style.cursor = 'pointer';
      avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'flex';
        dropdown.style.display = isOpen ? 'none' : 'flex';
      });

      /* Close dropdown when clicking outside */
      document.addEventListener('click', () => {
        if (dropdown) dropdown.style.display = 'none';
      });
    }
  }

  /* ── Logout button ── */
  function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(USER_KEY);
        updateNavAuth();
        window.location.href = 'index.html';
      });
    }
  }

  /* ── Redirect to login if page is protected ── */
  function protectPage() {
    const protect = document.body.dataset.protect;
    if (protect === 'true' && !getUser()) {
      window.location.href = 'login.html';
    }
  }

  /* ── Run after DOM is ready ── */
  function init() {
    updateNavAuth();
    initDropdown();
    initLogout();
    protectPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Expose globally so auth.js can call it after login/signup ── */
  window.updateNavAuth = updateNavAuth;

})();
