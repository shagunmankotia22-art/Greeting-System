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
const closeHelp = document.getElementById('closeHelp');

if (helpBtn && helpPanel) {
  helpBtn.addEventListener('click', () => {
    helpPanel.style.display = helpPanel.style.display === 'flex' ? 'none' : 'flex';
  });
}

if (closeHelp) {
  closeHelp.addEventListener('click', () => {
    helpPanel.style.display = 'none';
  });
}

// Help options click
const faqOption = document.getElementById('faqOption');
const contactOption = document.getElementById('contactOption');
const reportOption = document.getElementById('reportOption');
const liveChatOption = document.getElementById('liveChatOption');

if (faqOption) {
  faqOption.addEventListener('click', () => {
    helpPanel.style.display = 'none';
    document.querySelector('.faq-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

if (contactOption) {
  contactOption.addEventListener('click', () => {
    alert('📧 Contact us at: support@greetings.com');
    helpPanel.style.display = 'none';
  });
}

if (reportOption) {
  reportOption.addEventListener('click', () => {
    alert('🐛 Issue reported! We will fix it shortly.');
    helpPanel.style.display = 'none';
  });
}

if (liveChatOption) {
  liveChatOption.addEventListener('click', () => {
    helpPanel.style.display = 'none';
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

window.addEventListener('load', () => {
  const favBtn = document.querySelector('.fav-nav-btn');
  const badge = document.getElementById('favCountBadge');

  if (favBtn && badge && !document.querySelector('.fav-text')) {

    const text = document.createElement('span');
    text.className = 'fav-text';
    text.textContent = 'Saved';

    favBtn.insertBefore(text, badge);
  }
});