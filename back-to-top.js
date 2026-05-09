// back-to-top.js
/* ================= GREETINGS - BACK TO TOP ================= */
(function () {
  'use strict';

  function init() {
    // Create button
    const btn = document.createElement('button');
    btn.className   = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('title', 'Back to top');
    btn.innerHTML   = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="18 15 12 9 6 15"/>
      </svg>`;
    document.body.appendChild(btn);

    // Show / hide on scroll
    function onScroll() {
      btn.classList.toggle('visible', window.scrollY > 320);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // Smooth scroll to top on click
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();