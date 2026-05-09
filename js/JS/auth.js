/* ================= GREETINGS - AUTH SYSTEM ================= */
(function () {
  'use strict';

  const USER_KEY   = 'greetings_user';
  const USERS_KEY  = 'greetings_users_db'; // stores all registered users
  const JOIN_KEY   = 'greetings_joined';

  /* ── Helpers ── */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveUsers(arr) {
    localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  }

  function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Record join date if not already set
    if (!localStorage.getItem(JOIN_KEY)) {
      localStorage.setItem(JOIN_KEY, new Date().toISOString());
    }
  }

  function showError(msg) {
    // Remove any existing error
    const old = document.querySelector('.auth-error-msg');
    if (old) old.remove();

    const el = document.createElement('p');
    el.className = 'auth-error-msg';
    el.style.cssText = `
      color: #ff4d6d;
      font-size: 0.85rem;
      font-weight: 600;
      text-align: center;
      margin: -8px 0 10px;
      animation: fadeIn .25s ease;
    `;
    el.textContent = msg;

    const btn = document.querySelector('.auth-btn');
    if (btn) btn.insertAdjacentElement('beforebegin', el);
  }

  function showSuccess(msg, redirect) {
    const old = document.querySelector('.auth-error-msg');
    if (old) old.remove();

    const el = document.createElement('p');
    el.className = 'auth-error-msg';
    el.style.cssText = `
      color: #22c55e;
      font-size: 0.85rem;
      font-weight: 600;
      text-align: center;
      margin: -8px 0 10px;
    `;
    el.textContent = msg;

    const btn = document.querySelector('.auth-btn');
    if (btn) btn.insertAdjacentElement('beforebegin', el);

    if (redirect) {
      setTimeout(() => { window.location.href = redirect; }, 1000);
    }
  }

  /* ─────────────────────────────────────────
     SIGNUP PAGE
  ───────────────────────────────────────── */
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      const name     = (document.getElementById('signupName')?.value  || '').trim();
      const email    = (document.getElementById('signupEmail')?.value || '').trim().toLowerCase();
      const phone    = (document.getElementById('signupPhone')?.value || '').trim();
      const password = (document.getElementById('signupPassword')?.value || '');

      // Validation
      if (!name)                          return showError('Please enter your full name.');
      if (!email || !email.includes('@')) return showError('Please enter a valid email address.');
      if (phone && !/^\d{10}$/.test(phone)) return showError('Phone must be a 10-digit number.');
      if (password.length < 6)            return showError('Password must be at least 6 characters.');

      // Check if email already exists
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        return showError('An account with this email already exists. Please log in.');
      }

      // Save new user
      const newUser = { name, email, phone, password };
      users.push(newUser);
      saveUsers(users);

      // Auto-login
      setCurrentUser({ name, email, phone });

      showSuccess('Account created! Redirecting…', 'index.html');
    });
  }

  /* ─────────────────────────────────────────
     LOGIN PAGE
  ───────────────────────────────────────── */
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email    = (document.getElementById('loginEmail')?.value    || '').trim().toLowerCase();
      const password = (document.getElementById('loginPassword')?.value || '');

      if (!email || !email.includes('@')) return showError('Please enter a valid email address.');
      if (!password)                       return showError('Please enter your password.');

      const users = getUsers();
      const user  = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return showError('Invalid email or password. Please try again.');
      }

      // Set current user (never store password in session)
      setCurrentUser({ name: user.name, email: user.email, phone: user.phone });

      showSuccess('Login successful! Redirecting…', 'index.html');
    });

    // Also allow pressing Enter to login
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }

})();