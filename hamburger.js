/* ================= GREETINGS - HAMBURGER MENU ================= */
(function () {
  'use strict';

  function init() {
    const toggle    = document.getElementById('g-menu-toggle');
    const hamburger = document.querySelector('.g-hamburger');
    if (!toggle) return;

    /* Inject mobile menu styles once */
    if (!document.getElementById('g-mobile-menu-styles')) {
      const style = document.createElement('style');
      style.id = 'g-mobile-menu-styles';
      style.textContent = `
        @media (max-width: 900px) {
          /* Slide-down nav links when menu is open */
          #g-menu-toggle:checked ~ * .g-nav-links,
          header.g-navbar .g-nav-links.g-menu-open {
            display: flex !important;
            flex-direction: column !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            width: 100% !important;
            background: #0a0c10 !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
            padding: 16px 0 20px !important;
            gap: 4px !important;
            z-index: 999 !important;
          }
          header.g-navbar .g-nav-links.g-menu-open a {
            padding: 12px 28px !important;
            font-size: 1rem !important;
            border-bottom: none !important;
          }
          /* Show actions (login/signup) in mobile menu too */
          header.g-navbar .g-nav-actions.g-menu-open {
            display: flex !important;
            flex-direction: column !important;
            position: absolute !important;
            top: calc(100% + var(--nav-links-height, 220px)) !important;
            left: 0 !important;
            width: 100% !important;
            background: #0a0c10 !important;
            padding: 0 28px 20px !important;
            gap: 10px !important;
            z-index: 998 !important;
          }
          /* Animate hamburger to X when open */
          .g-hamburger.is-open span:nth-child(1) {
            transform: translateY(7px) rotate(45deg) !important;
          }
          .g-hamburger.is-open span:nth-child(2) {
            opacity: 0 !important;
          }
          .g-hamburger.is-open span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg) !important;
          }
          .g-hamburger span {
            transition: transform 0.2s, opacity 0.2s !important;
          }
          body.light-mode .g-hamburger span {
            background: #111 !important;
          }
          header.g-navbar {
            position: relative !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const navLinks   = document.querySelector('.g-nav-links');
    const navActions = document.querySelector('.g-nav-actions');

    function openMenu() {
      toggle.checked = true;
      hamburger && hamburger.classList.add('is-open');
      navLinks   && navLinks.classList.add('g-menu-open');
      navActions && navActions.classList.add('g-menu-open');
    }

    function closeMenu() {
      toggle.checked = false;
      hamburger && hamburger.classList.remove('is-open');
      navLinks   && navLinks.classList.remove('g-menu-open');
      navActions && navActions.classList.remove('g-menu-open');
    }

    /* Hamburger click toggles menu */
    hamburger && hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggle.checked ? closeMenu() : openMenu();
    });

    /* Also support the checkbox directly (fallback) */
    toggle.addEventListener('change', function() {
      this.checked ? openMenu() : closeMenu();
    });

    /* Close when a nav link is clicked */
    document.querySelectorAll('.g-nav-links a').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    /* Close when clicking outside navbar */
    document.addEventListener('click', function(e) {
      if (!toggle.checked) return;
      const navbar = document.querySelector('.g-navbar');
      if (navbar && !navbar.contains(e.target)) closeMenu();
    });

    /* Close on Escape */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();