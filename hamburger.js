/* ================= GREETINGS - HAMBURGER MENU UX ================= */
(function () {
  'use strict';

  function init() {
    const toggle = document.getElementById('menu-toggle');
    if (!toggle) return;

    // Close menu when a nav link is clicked (mobile)
    document.querySelectorAll('.nav-left a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.checked = false;
      });
    });

    // Close menu when clicking outside the navbar
    document.addEventListener('click', function (e) {
      if (!toggle.checked) return;
      const navbar = document.querySelector('.navbar');
      if (navbar && !navbar.contains(e.target)) {
        toggle.checked = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();