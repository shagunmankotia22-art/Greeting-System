/* ================= GREETINGS - MAIN SCRIPT ================= */



/* ================= 1. FAQ ACCORDION ================= */
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    // Open clicked one if it wasn't open
    if (!isActive) item.classList.add('active');
  });
});

/* ================= 2. HELP WIDGET ================= */
const helpBtn = document.getElementById('helpBtn');
const helpPanel = document.getElementById('helpPanel');
const closeHelpBtn = document.getElementById('closeHelp');

function openHelpPanel() {
  if (!helpPanel || !helpBtn) return;
  helpPanel.classList.add('open');
  helpBtn.classList.add('active');
}

function closeHelpPanel() {
  if (!helpPanel || !helpBtn) return;
  helpPanel.classList.remove('open');
  helpBtn.classList.remove('active');
}

if (helpBtn && helpPanel) {
  helpBtn.addEventListener('click', () => {
    helpPanel.classList.contains('open') ? closeHelpPanel() : openHelpPanel();
  });
}

if (closeHelpBtn) {
  closeHelpBtn.addEventListener('click', closeHelpPanel);
}

// Close when clicking outside
document.addEventListener('click', function (e) {
  if (helpPanel && helpBtn &&
      !helpBtn.contains(e.target) && !helpPanel.contains(e.target)) {
    closeHelpPanel();
  }
});

// Help options click
const faqOption = document.getElementById('faqOption');
const contactOption = document.getElementById('contactOption');
const reportOption = document.getElementById('reportOption');
const liveChatOption = document.getElementById('liveChatOption');

if (faqOption) {
  faqOption.addEventListener('click', () => {
    closeHelpPanel();
    document.querySelector('.faq-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

if (contactOption) {
  contactOption.addEventListener('click', () => {
    alert('📧 Contact us at: support@greetings.com');
    closeHelpPanel();
  });
}

if (reportOption) {
  reportOption.addEventListener('click', () => {
    alert('🐛 Issue reported! We will fix it shortly.');
    closeHelpPanel();
  });
}

if (liveChatOption) {
  liveChatOption.addEventListener('click', () => {
    closeHelpPanel();
    if (window.greetingsAI) {
      window.greetingsAI.open();
    } else {
      document.getElementById('gai-btn')?.click();
    }
  });
}

/* ================= 3. STAR RATING ================= */
const starSpans = document.querySelectorAll('#starRating span');
const ratingMsg = document.getElementById('ratingText');

const messages = {
  1: '😞 Poor',
  2: '😐 Fair',
  2: '😐 Fair',
  3: '🙂 Good',
  4: '😊 Great',
  5: '🤩 Excellent!'
};

starSpans.forEach((star, i) => {
  star.addEventListener('mouseover', () => {
    starSpans.forEach((s, j) => {
      s.style.color = j <= i ? 'gold' : '#555';
      s.style.transform = j <= i ? 'scale(1.3)' : 'scale(1)';
    });
  });

  star.addEventListener('mouseout', () => {
    const saved = localStorage.getItem('greetings_rating');
    starSpans.forEach((s, j) => {
      s.style.color = saved && j < saved ? 'gold' : '#555';
      s.style.transform = 'scale(1)';
    });
  });

  star.addEventListener('click', () => {
    const val = i + 1;
    localStorage.setItem('greetings_rating', val);
    starSpans.forEach((s, j) => {
      s.style.color = j < val ? 'gold' : '#555';
    });
    if (ratingMsg) ratingMsg.textContent = `You rated: ${messages[val]}`;
  });
});

const savedRating = localStorage.getItem('greetings_rating');
if (savedRating) {
  starSpans.forEach((s, j) => {
    s.style.color = j < savedRating ? 'gold' : '#555';
  });
  if (ratingMsg) ratingMsg.textContent = `You rated: ${messages[savedRating]}`;
}

/* ================= 4. MOBILE MENU TOGGLE ================= */
const menuToggle = document.getElementById('menu-toggle');
const navLeft = document.querySelector('.nav-left');

if (menuToggle && navLeft) {
  menuToggle.addEventListener('change', () => {
    if (menuToggle.checked) {
      navLeft.style.maxHeight = '500px';
      navLeft.style.opacity = '1';
    } else {
      navLeft.style.maxHeight = '0';
      navLeft.style.opacity = '0';
    }
  });
}

/* ================= 5. ACTIVE NAV LINK ================= */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-left a, .menu a').forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});

/* ================= 6. AUTH - SHOW/HIDE BASED ON LOGIN ================= */
function updateNavAuth() {
  const user = JSON.parse(localStorage.getItem('greetings_user') || 'null');
  const authButtons = document.getElementById('authButtons');
  const userProfile = document.getElementById('userProfile');
  const avatar = document.getElementById('avatar');
  const userEmail = document.getElementById('userEmail');

  if (user) {
    if (authButtons) authButtons.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (avatar) avatar.textContent = user.name ? user.name[0].toUpperCase() : '👤';
    if (userEmail) userEmail.textContent = user.email;
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
  }
}

// Avatar click — toggle dropdown
const avatarEl = document.getElementById('avatar');
const dropdown = document.getElementById('dropdown');

if (avatarEl && dropdown) {
  avatarEl.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('greetings_user');
    updateNavAuth();
    window.location.href = 'index.html';
  });
}

// Run on load
updateNavAuth();

/* ================= 7. SUBSCRIBE FORM ================= */
const subscribeForm = document.querySelector('.subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = subscribeForm.querySelector('input').value.trim();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email!');
      return;
    }
    alert(`🎉 Thank you! You're subscribed with: ${email}`);
    subscribeForm.reset();
  });
}

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input) {
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email!');
        return;
      }
      alert(`🎉 Thank you! You're subscribed with: ${email}`);
      form.reset();
    }
  });
});

/* ================= 8. ABOUT PAGE - NEON CARD MOUSE EFFECT ================= */
document.querySelectorAll('.member-neon-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

/* ================= 9. SMOOTH SCROLL ================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ================= 10. CARD HOVER EFFECT ================= */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  });
});

/* ================= 11. DROPDOWN CATEGORY LINKS ================= */
const dropdownLinks = document.querySelectorAll('.dropdown-content a');
dropdownLinks.forEach(link => {
  link.addEventListener('click', function () {
    // Remove the effect from all dropdown siblings
    dropdownLinks.forEach(el => el.classList.remove('active-category'));

    // Add the effect to the clicked one
    this.classList.add('active-category');
  });
});

/* ================= 12. CARD CUSTOMIZER — TOGGLE MODAL ================= */
(function () {

  /* --- Theme & occasion data --- */
  const themes = [
    { bg: '#1a1a2e', text: '#e0d7ff', accent: '#7c6af7', badge: '#2d2b52', badgeT: '#c5beff', cta: '#7c6af7', ctaT: '#fff', divider: '#3a3a5e', tagBg: '#2d2b52', tagT: '#c5beff' },
    { bg: '#fff0f7', text: '#6b0035', accent: '#e84393', badge: '#fce4f0', badgeT: '#b0155f', cta: '#e84393', ctaT: '#fff', divider: '#f5c0da', tagBg: '#fce4f0', tagT: '#b0155f' },
    { bg: '#fffbf0', text: '#4a2200', accent: '#e07b00', badge: '#fde8bf', badgeT: '#7a3c00', cta: '#e07b00', ctaT: '#fff', divider: '#f0d5a0', tagBg: '#fde8bf', tagT: '#7a3c00' },
    { bg: '#f0fef4', text: '#0a3a1a', accent: '#16a34a', badge: '#dcfce7', badgeT: '#15803d', cta: '#16a34a', ctaT: '#fff', divider: '#b0e8c0', tagBg: '#dcfce7', tagT: '#15803d' },
    { bg: '#0a0a0a', text: '#f0f0f0', accent: '#4fffb0', badge: '#1a2e22', badgeT: '#4fffb0', cta: '#4fffb0', ctaT: '#000', divider: '#2a2a2a', tagBg: '#1a2e22', tagT: '#4fffb0' },
    { bg: '#e8f4fd', text: '#0c2a4a', accent: '#1a6ec7', badge: '#c5def6', badgeT: '#0c448a', cta: '#1a6ec7', ctaT: '#fff', divider: '#aad0f0', tagBg: '#c5def6', tagT: '#0c448a' },
  ];

  const swatchColors = ['#1a1a2e', '#e84393', '#e07b00', '#16a34a', '#0a0a0a', '#1a6ec7'];

  const occasions = {
    birthday:    { title: 'Happy Birthday! 🎂', body: 'Wishing you all the joy, laughter, and love on your special day!', badge: 'Birthday', icon: '🎂', cta: 'Send birthday wishes' },
    wedding:     { title: 'Wedding Invitation 💍', body: 'We joyfully invite you to share in our wedding celebration.', badge: 'Wedding', icon: '💍', cta: 'RSVP now' },
    party:       { title: "Let's Party! 🎉", body: "You're officially invited to the most epic celebration of the year!", badge: 'Party', icon: '🎉', cta: "I'll be there!" },
    anniversary: { title: 'Happy Anniversary ❤️', body: "Celebrating the beautiful journey you've shared together.", badge: 'Anniversary', icon: '❤️', cta: 'Celebrate with us' },
    graduation:  { title: 'Congratulations Grad! 🎓', body: 'Your hard work and dedication have paid off — this is your moment!', badge: 'Graduation', icon: '🎓', cta: 'Celebrate!' },
    custom:      { title: 'Your custom title', body: 'Write your personal message here for this special occasion.', badge: 'Special Day', icon: '🌸', cta: 'Send card' },
  };

  /* --- Internal state --- */
  let tiyState = { theme: 1, layout: 'left', variant: 'filled', shadow: 'none', icon: '🌸', isOpen: false };

  /* --- Helpers --- */
  function getEl(id) { return document.getElementById(id); }

  /* ---- TOGGLE: open / close modal ---- */
  function openCardCustomizer() {
    const overlay = getEl('tiyOverlay');
    const btn     = document.querySelector('.tiy-open-btn');
    if (!overlay) return;

    tiyState.isOpen = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Toggle active state on the trigger button
    if (btn) btn.classList.add('active');

    tiyRender();
  }

  function closeCardCustomizer() {
    const overlay = getEl('tiyOverlay');
    const btn     = document.querySelector('.tiy-open-btn');
    if (!overlay) return;

    tiyState.isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';

    if (btn) btn.classList.remove('active');
  }

  function toggleCardCustomizer() {
    tiyState.isOpen ? closeCardCustomizer() : openCardCustomizer();
  }

  /* ---- Expose to HTML onclick attributes ---- */
  window.openCardCustomizer  = openCardCustomizer;
  window.closeCardCustomizer = closeCardCustomizer;
  window.toggleCardCustomizer = toggleCardCustomizer;

  /* ---- Close on overlay background click ---- */
  document.addEventListener('click', function (e) {
    const overlay = getEl('tiyOverlay');
    if (overlay && e.target === overlay) closeCardCustomizer();
  });

  /* ---- Close on Escape key ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && tiyState.isOpen) closeCardCustomizer();
  });

  /* ---- Occasion preset ---- */
  window.tiyOccasionChange = function () {
    const val = getEl('tiy-occasion')?.value;
    const o   = occasions[val];
    if (!o) return;
    if (getEl('tiy-title'))  getEl('tiy-title').value  = o.title;
    if (getEl('tiy-body'))   getEl('tiy-body').value   = o.body;
    if (getEl('tiy-badge'))  getEl('tiy-badge').value  = o.badge;
    if (getEl('tiy-cta'))    getEl('tiy-cta').value    = o.cta;
    document.querySelectorAll('.tiy-icon-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.icon === o.icon);
    });
    tiyState.icon = o.icon;
    tiyRender();
  };

  /* ---- Style setters ---- */
  window.setTiyIcon    = function (el) { tiyState.icon    = el.dataset.icon; el.parentNode.querySelectorAll('.tiy-icon-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); tiyRender(); };
  window.setTiyLayout  = function (v, el) { tiyState.layout  = v; el.parentNode.querySelectorAll('.tiy-tog').forEach(t => t.classList.remove('active')); el.classList.add('active'); tiyRender(); };
  window.setTiyVariant = function (v, el) { tiyState.variant = v; el.parentNode.querySelectorAll('.tiy-tog').forEach(t => t.classList.remove('active')); el.classList.add('active'); tiyRender(); };
  window.setTiyShadow  = function (v, el) { tiyState.shadow  = v; el.parentNode.querySelectorAll('.tiy-tog').forEach(t => t.classList.remove('active')); el.classList.add('active'); tiyRender(); };

  /* ---- Render card live preview ---- */
  window.tiyRender = function () {
    const card = getEl('tiyCard');
    if (!card) return;

    const T       = themes[tiyState.theme];
    const title   = getEl('tiy-title')?.value   || '';
    const body    = getEl('tiy-body')?.value    || '';
    const cta     = getEl('tiy-cta')?.value     || '';
    const badge   = getEl('tiy-badge')?.value   || '';
    const footer  = getEl('tiy-footer')?.value  || '';
    const radius  = getEl('tiy-radius')?.value  || 14;
    const showIcon    = getEl('f-icon')?.checked;
    const showBadge   = getEl('f-badge')?.checked;
    const showTags    = getEl('f-tags')?.checked;
    const showDivider = getEl('f-divider')?.checked;
    const showFooter  = getEl('f-footer')?.checked;

    let bg     = T.bg;
    let border = 'none';
    if (tiyState.variant === 'outlined') { bg = 'transparent'; border = `2px solid ${T.accent}`; }
    if (tiyState.variant === 'soft')     { bg = T.bg + '33';   border = `1px solid ${T.accent}55`; }

    const shadows = { none: 'none', sm: '0 6px 24px rgba(0,0,0,.14)', lg: '0 12px 48px rgba(0,0,0,.24)' };
    const center  = tiyState.layout === 'center';

    card.style.cssText = `background:${bg};color:${T.text};border-radius:${radius}px;border:${border};box-shadow:${shadows[tiyState.shadow]};text-align:${tiyState.layout};padding:22px;width:100%;max-width:300px;transition:all .2s;font-family:'DM Sans',sans-serif;`;

    let html = '';
    if (showIcon)  html += `<div style="font-size:26px;margin-bottom:10px;">${tiyState.icon}</div>`;
    if (showBadge && badge) html += `<span style="font-size:11px;font-weight:500;padding:3px 12px;border-radius:20px;background:${T.badge};color:${T.badgeT};display:inline-block;margin-bottom:10px;">${badge}</span>`;
    html += `<div style="font-size:18px;font-weight:600;font-family:'Playfair Display',serif;margin-bottom:7px;line-height:1.3;">${title}</div>`;
    html += `<div style="font-size:13px;line-height:1.65;opacity:.85;margin-bottom:14px;">${body}</div>`;
    if (showTags) html += `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;${center ? 'justify-content:center;' : ''}"><span style="font-size:10px;padding:3px 9px;border-radius:20px;background:${T.tagBg};color:${T.tagT};">Greeting</span><span style="font-size:10px;padding:3px 9px;border-radius:20px;background:${T.tagBg};color:${T.tagT};">Personal</span></div>`;
    if (showDivider) html += `<hr style="border:none;height:0.5px;background:${T.divider};margin:10px 0;">`;
    if (cta) html += `<button style="font-size:12px;font-weight:500;padding:8px 18px;border-radius:24px;border:none;background:${T.cta};color:${T.ctaT};cursor:pointer;font-family:'DM Sans',sans-serif;">${cta}</button>`;
    if (showFooter && footer) html += `<div style="font-size:11px;opacity:.6;margin-top:12px;">${footer}</div>`;

    card.innerHTML = html;
  };

  /* ---- Download card as standalone HTML file ---- */
  window.tiyDownload = function () {
    const card = getEl('tiyCard');
    if (!card) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>My Greeting Card</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f7f0fb;font-family:'DM Sans',sans-serif;}</style></head><body>${card.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'greeting-card.html';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* ---- Build colour swatches dynamically ---- */
  function buildSwatches() {
    const container = getEl('tiySwatches');
    if (!container) return;
    swatchColors.forEach((col, i) => {
      const s = document.createElement('div');
      s.className = 'tiy-swatch' + (i === 1 ? ' active' : '');
      s.style.cssText = `width:22px;height:22px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${i === 1 ? '#333' : 'transparent'};transition:transform .15s,border-color .15s;flex-shrink:0;`;
      s.title = `Theme ${i + 1}`;
      s.addEventListener('click', () => {
        document.querySelectorAll('.tiy-swatch').forEach(x => {
          x.classList.remove('active');
          x.style.borderColor = 'transparent';
        });
        s.classList.add('active');
        s.style.borderColor = '#333';
        tiyState.theme = i;
        tiyRender();
      });
      container.appendChild(s);
    });
  }

  /* ---- Wire up the trigger button (toggle on repeated clicks) ---- */
  document.addEventListener('DOMContentLoaded', function () {
    buildSwatches();

    const triggerBtn = document.querySelector('.tiy-open-btn');
    if (triggerBtn) {
      // Replace any inline onclick so toggle works cleanly
      triggerBtn.removeAttribute('onclick');
      triggerBtn.addEventListener('click', toggleCardCustomizer);
    }

    // Radius slider label
    const radiusSlider = getEl('tiy-radius');
    const radiusVal    = getEl('tiy-radius-val');
    if (radiusSlider && radiusVal) {
      radiusSlider.addEventListener('input', () => {
        radiusVal.textContent = radiusSlider.value + 'px';
        tiyRender();
      });
    }
  });

})();