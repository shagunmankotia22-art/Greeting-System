/* ═══════════════════════════════════════════════════
   search.js — Greetings Card Search (AI-integrated)
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  function nameFromUrl(url) {
    try {
      const base = decodeURIComponent(url).split('?')[0].split('/').pop()
        .replace(/\.(gif|jpe?g|png|avif|webp)$/i, '');
      return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
    } catch { return ''; }
  }

  function injectSearchBar(placeholder) {
    const titleWrap = document.querySelector('.page-title-wrap');
    if (!titleWrap) return;
    titleWrap.insertAdjacentHTML('afterend', `
      <div class="search-wrap">
        <div class="search-box">
          <input type="text" id="cardSearchInput" placeholder="${placeholder}" autocomplete="off" spellcheck="false" aria-label="Search cards">
          <span class="search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <button class="search-clear" id="searchClear" aria-label="Clear">&times;</button>
        </div>
        <button class="ai-search-btn" id="aiSearchBtn" aria-label="Smart Search">
            <span class="ai-btn-tooltip">Smart Search</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
          </button>
      </div>
      <div class="search-result-count" id="searchResultCount"></div>
      <div class="ai-search-suggestion" id="aiSuggestion" style="display:none;"></div>`);
  }

  function tagCards(cards) {
    cards.forEach(card => {
      const img  = card.querySelector('img');
      const src  = img ? (img.getAttribute('src') || '') : '';
      const href = card.getAttribute('href') || '';
      card.dataset.searchName = (nameFromUrl(src) || nameFromUrl(href) || 'Card').toLowerCase();
    });
  }

  function filterCards(query, cards, emptyEl, countEl, clearBtn) {
    const q = query.trim().toLowerCase();
    clearBtn.classList.toggle('visible', q.length > 0);
    let visible = 0;
    cards.forEach(card => {
      const matches = q === '' || (card.dataset.searchName || '').includes(q);
      card.classList.toggle('search-hidden', !matches);
      if (matches) { card.classList.remove('search-fade-in'); void card.offsetWidth; card.classList.add('search-fade-in'); visible++; }
    });
    countEl.textContent = q ? `${visible} result${visible !== 1 ? 's' : ''} found` : '';
    if (emptyEl) {
      const termEl = emptyEl.querySelector('#searchEmptyTerm');
      if (termEl) termEl.textContent = query.trim();
      emptyEl.classList.toggle('visible', visible === 0 && q !== '');
    }
  }

  async function doAISearch(query, cards, countEl) {
    const aiBtn        = document.getElementById('aiSearchBtn');
    const aiSuggestion = document.getElementById('aiSuggestion');
    if (!aiBtn || !aiSuggestion) return;

    aiBtn.textContent = '✦ Searching…';
    aiBtn.disabled    = true;

    try {
      const result = await window.GreetingsAPI.aiSearch(query);

      // Show suggestion
      aiSuggestion.style.display = 'block';
      aiSuggestion.innerHTML = `
        <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:12px 16px;margin:8px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="color:#a78bfa;font-size:0.9rem;">✦ AI suggests:</span>
          <span style="color:rgba(255,255,255,0.85);font-size:0.88rem;">${result.suggestion || 'Try browsing our categories'}</span>
          ${result.category ? `<a href="${result.category}.html" style="background:linear-gradient(135deg,#9333ea,#ff4d6d);color:#fff;padding:5px 14px;border-radius:100px;text-decoration:none;font-size:0.82rem;font-weight:700;">Browse ${result.category.charAt(0).toUpperCase()+result.category.slice(1)} →</a>` : ''}
        </div>`;

      // Filter by AI keywords
      if (result.keywords && result.keywords.length) {
        const keyStr = result.keywords.join(' ').toLowerCase();
        let visible  = 0;
        cards.forEach(card => {
          const name    = card.dataset.searchName || '';
          const matches = result.keywords.some(kw => name.includes(kw.toLowerCase()));
          card.classList.toggle('search-hidden', !matches);
          if (matches) visible++;
        });
        countEl.textContent = `${visible} result${visible !== 1 ? 's' : ''} found`;
      }

    } catch(e) {
      aiSuggestion.style.display  = 'block';
      aiSuggestion.innerHTML      = `<div style="color:rgba(255,255,255,0.5);font-size:0.85rem;padding:8px;">AI search unavailable — showing text results</div>`;
    }

    aiBtn.textContent = '✦ AI Search';
    aiBtn.disabled    = false;
  }

  function init() {
    const grid = document.querySelector('.card-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (!cards.length) return;

    const titleEl = document.querySelector('.page-title');
    const placeholder = `Search ${titleEl ? titleEl.textContent.trim() : 'cards'}...`;

    injectSearchBar(placeholder);
    tagCards(cards);

    const emptyEl  = document.createElement('div');
    emptyEl.className = 'search-empty'; emptyEl.id = 'searchEmpty';
    emptyEl.innerHTML = `<div class="search-empty-icon">🔍</div><p>No cards found for "<span id="searchEmptyTerm"></span>"</p>`;
    grid.appendChild(emptyEl);

    const input   = document.getElementById('cardSearchInput');
    const clearBtn = document.getElementById('searchClear');
    const countEl  = document.getElementById('searchResultCount');
    const aiBtn    = document.getElementById('aiSearchBtn');

    if (!input || !clearBtn || !countEl) return;

    input.addEventListener('input', () => filterCards(input.value, cards, emptyEl, countEl, clearBtn));
    clearBtn.addEventListener('click', () => {
      input.value = '';
      filterCards('', cards, emptyEl, countEl, clearBtn);
      const aiSuggestion = document.getElementById('aiSuggestion');
      if (aiSuggestion) aiSuggestion.style.display = 'none';
      input.focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { doAISearch(input.value, cards, countEl); }
      if (e.key === 'Escape') { input.value = ''; filterCards('', cards, emptyEl, countEl, clearBtn); }
    });
    aiBtn?.addEventListener('click', () => doAISearch(input.value, cards, countEl));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();