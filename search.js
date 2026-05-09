/* ================= GREETINGS - CARD SEARCH ================= */

(function () {
  'use strict';

  /* --- Build a readable name from an image URL --- */
  function nameFromUrl(url) {
    try {
      const decoded = decodeURIComponent(url);
      // Grab the filename (last path segment, before query string)
      const filename = decoded.split('?')[0].split('/').pop();
      // Strip extension
      const base = filename.replace(/\.(gif|jpe?g|png|avif|webp)$/i, '');
      // Replace hyphens/underscores with spaces, title-case
      return base
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
    } catch (e) {
      return '';
    }
  }

  /* --- Inject the search bar HTML right after .page-title-wrap --- */
  function injectSearchBar(placeholder) {
    const titleWrap = document.querySelector('.page-title-wrap');
    if (!titleWrap) return;

    const searchHTML = `
      <div class="search-wrap">
        <div class="search-box">
          <input
            type="text"
            id="cardSearchInput"
            placeholder="${placeholder}"
            autocomplete="off"
            spellcheck="false"
            aria-label="Search cards"
          >
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <button class="search-clear" id="searchClear" aria-label="Clear search">&times;</button>
        </div>
      </div>
      <div class="search-result-count" id="searchResultCount"></div>
    `;

    titleWrap.insertAdjacentHTML('afterend', searchHTML);
  }

  /* --- Inject an empty-state element inside the card grid --- */
  function injectEmptyState(grid) {
    const el = document.createElement('div');
    el.className = 'search-empty';
    el.id = 'searchEmpty';
    el.innerHTML = `
      <div class="search-empty-icon">🔍</div>
      <p>No cards found for "<span id="searchEmptyTerm"></span>"</p>
    `;
    grid.appendChild(el);
    return el;
  }

  /* --- Tag every card with its searchable name --- */
  function tagCards(cards) {
    cards.forEach(card => {
      // Prefer the img src for naming; fall back to href
      const img   = card.querySelector('img');
      const src   = img ? (img.getAttribute('src') || '') : '';
      const href  = card.getAttribute('href') || '';
      const name  = nameFromUrl(src) || nameFromUrl(href) || 'Card';
      card.dataset.searchName = name.toLowerCase();
    });
  }

  /* --- Core filter logic --- */
  function filterCards(query, cards, emptyEl, countEl, clearBtn) {
    const q = query.trim().toLowerCase();

    // Toggle clear button
    clearBtn.classList.toggle('visible', q.length > 0);

    let visible = 0;
    cards.forEach(card => {
      const name    = card.dataset.searchName || '';
      const matches = q === '' || name.includes(q);

      if (matches) {
        card.classList.remove('search-hidden');
        card.classList.remove('search-fade-in');
        // Trigger reflow for animation restart
        void card.offsetWidth;
        card.classList.add('search-fade-in');
        visible++;
      } else {
        card.classList.add('search-hidden');
        card.classList.remove('search-fade-in');
      }
    });

    // Update count badge
    if (q === '') {
      countEl.textContent = '';
    } else {
      countEl.textContent = `${visible} result${visible !== 1 ? 's' : ''} found`;
    }

    // Show / hide empty state
    if (emptyEl) {
      const termEl = emptyEl.querySelector('#searchEmptyTerm');
      if (visible === 0 && q !== '') {
        if (termEl) termEl.textContent = query.trim();
        emptyEl.classList.add('visible');
      } else {
        emptyEl.classList.remove('visible');
      }
    }
  }

  /* --- Init --- */
  function init() {
    const grid = document.querySelector('.card-grid');
    if (!grid) return; // Not a card page

    const cards = Array.from(grid.querySelectorAll('.card'));
    if (!cards.length) return;

    // Determine placeholder from page title
    const titleEl = document.querySelector('.page-title');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : 'cards';
    const placeholder = `Search ${titleText}...`;

    // Inject UI
    injectSearchBar(placeholder);
    tagCards(cards);
    const emptyEl   = injectEmptyState(grid);
    const input     = document.getElementById('cardSearchInput');
    const clearBtn  = document.getElementById('searchClear');
    const countEl   = document.getElementById('searchResultCount');

    if (!input || !clearBtn || !countEl) return;

    // Input event
    input.addEventListener('input', () => {
      filterCards(input.value, cards, emptyEl, countEl, clearBtn);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
      input.value = '';
      filterCards('', cards, emptyEl, countEl, clearBtn);
      input.focus();
    });

    // Keyboard: Escape clears
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        filterCards('', cards, emptyEl, countEl, clearBtn);
        input.blur();
      }
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();