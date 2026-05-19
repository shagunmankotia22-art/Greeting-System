/* ═══════════════════════════════════════════════════
   auth.js — Greetings Auth (API-integrated)
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  function showMsg(msg, isError) {
    document.querySelector('.auth-error-msg')?.remove();
    const el = document.createElement('p');
    el.className = 'auth-error-msg';
    el.style.cssText = `color:${isError ? '#ff4d6d' : '#22c55e'};font-size:0.85rem;font-weight:600;text-align:center;margin:-8px 0 10px;`;
    el.textContent = msg;
    document.querySelector('.auth-btn')?.insertAdjacentElement('beforebegin', el);
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : btn.dataset.label;
  }

  /* ── SIGNUP ── */
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.dataset.label = signupBtn.textContent;
    signupBtn.addEventListener('click', async () => {
      const name     = document.getElementById('signupName')?.value.trim() || '';
      const email    = document.getElementById('signupEmail')?.value.trim().toLowerCase() || '';
      const phone    = document.getElementById('signupPhone')?.value.trim() || '';
      const password = document.getElementById('signupPassword')?.value || '';

      if (!name)                          return showMsg('Please enter your full name.', true);
      if (!email || !email.includes('@')) return showMsg('Please enter a valid email.', true);
      if (phone && !/^\d{10}$/.test(phone)) return showMsg('Phone must be 10 digits.', true);
      if (password.length < 6)            return showMsg('Password must be at least 6 characters.', true);

      setLoading(signupBtn, true);
      try {
        await window.GreetingsAPI.signup(name, email, phone, password);
        showMsg('Account created! Redirecting…', false);
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch(e) {
        showMsg(e.message || 'Signup failed. Please try again.', true);
        setLoading(signupBtn, false);
      }
    });
  }

  /* ── LOGIN ── */
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.dataset.label = loginBtn.textContent;

    async function doLogin() {
      const email    = document.getElementById('loginEmail')?.value.trim().toLowerCase() || '';
      const password = document.getElementById('loginPassword')?.value || '';

      if (!email || !email.includes('@')) return showMsg('Please enter a valid email.', true);
      if (!password)                       return showMsg('Please enter your password.', true);

      // Remember me
      const rememberCheck = document.getElementById('rememberMe');
      const REMEMBER_KEY  = 'greetings_remember_email';
      if (rememberCheck?.checked && email) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      setLoading(loginBtn, true);
      try {
        await window.GreetingsAPI.login(email, password);
        showMsg('Login successful! Redirecting…', false);
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch(e) {
        showMsg(e.message || 'Login failed. Please try again.', true);
        setLoading(loginBtn, false);
      }
    }

    loginBtn.addEventListener('click', doLogin);
    document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

    // Pre-fill remembered email
    const saved = localStorage.getItem('greetings_remember_email');
    if (saved) {
      const emailInput = document.getElementById('loginEmail');
      const rememberCheck = document.getElementById('rememberMe');
      if (emailInput) emailInput.value = saved;
      if (rememberCheck) rememberCheck.checked = true;
    }

    // Forgot password
    document.querySelector('.forgot a')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      if (!email) return showMsg('Enter your email first, then click Forgot Password.', true);
      showMsg(`Password reset link sent to: ${email}`, false);
    });
  }
})();