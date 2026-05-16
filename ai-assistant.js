// ai-assistant.js — Greetings AI Widget (Claude-powered)
// Drop this in your project root and add to any page:
//   <script src="ai-assistant.js"></script>
//
// HOW THE API WORKS:
//   This widget calls your backend proxy at /api/chat (server.js).
//   The proxy forwards requests to Anthropic, keeping your API key safe.
//   For local dev: run `node server.js` and set API_URL below to http://localhost:3001/api/chat
//   For production: deploy server.js and update API_URL to your deployed URL.

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     CONFIG — update API_URL after deploying server.js
  ────────────────────────────────────────────── */
  const API_URL = 'https://greetings-system-ai.onrender.com/api/chat'; // ← your deployed backend
  // const API_URL = 'http://localhost:3001/api/chat'; // ← for local dev

  /* ── Detect current page context ── */
  const PAGE = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
  const PAGE_LABELS = {
    index: 'Home', wedding: 'Wedding Invitations', birthday: 'Birthday Cards',
    party: 'Party Invitations', cards: 'Greeting Cards',
    events: 'Events Invitations', about: 'About', profile: 'User Profile',
    login: 'Login', signup: 'Sign Up', 'how-it-works': 'How It Works'
  };
  const PAGE_CONTEXT = PAGE_LABELS[PAGE] || PAGE;

  const SYSTEM = `You are "Greetings AI", a friendly assistant for the Greetings digital card platform. The user is currently on the "${PAGE_CONTEXT}" page.

You help users:
- Find the right card or invitation design for their occasion
- Write beautiful, personal greeting messages
- Navigate the site (Wedding, Birthday, Party, Cards, Events sections)
- Understand how the platform works
- Get gifting and occasion etiquette advice

Keep replies warm, concise (2-4 sentences), and use light emojis. Never mention being Claude. You are Greetings AI.`;

  /* ──────────────────────────────────────────────
     STYLES
  ────────────────────────────────────────────── */
  const css = `
    #gai-btn {
      position: fixed;
      bottom: 28px; left: 28px;
      z-index: 8888;
      width: 56px; height: 56px; border-radius: 16px;
      background: linear-gradient(135deg, #7c3aed, #ff4d6d);
      border: none; color: #fff;
      font-size: 1.3rem; font-weight: 900;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(124,58,237,0.5);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #gai-btn:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 10px 32px rgba(124,58,237,0.65);
    }
    #gai-btn .gai-badge {
      position: absolute; top: -5px; right: -5px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #ff4d6d; border: 2px solid #0a0c10;
      font-size: 0.52rem; font-weight: 900; letter-spacing: -0.3px;
      display: flex; align-items: center; justify-content: center;
      animation: gaiBadgePulse 2s ease-in-out infinite;
    }
    @keyframes gaiBadgePulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,77,109,0.55); }
      50%      { box-shadow: 0 0 0 7px rgba(255,77,109,0); }
    }

    /* ── Panel ── */
    #gai-panel {
      position: fixed; bottom: 96px; left: 28px; z-index: 8887;
      width: 370px; max-width: calc(100vw - 40px);
      background: #0f1320;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 22px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
      display: flex; flex-direction: column;
      overflow: hidden;
      opacity: 0; transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    #gai-panel.open {
      opacity: 1; transform: none; pointer-events: all;
    }

    /* ── Header ── */
    .gai-header {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 16px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.02);
      flex-shrink: 0;
    }
    .gai-orb {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #7c3aed, #ff4d6d);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem;
      box-shadow: 0 3px 12px rgba(124,58,237,0.4);
    }
    .gai-title { font-size: 0.92rem; font-weight: 800; color: #fff; }
    .gai-sub   { font-size: 0.68rem; color: #64748b; margin-top: 1px; }
    .gai-status-dot {
      display: inline-block; width: 6px; height: 6px;
      border-radius: 50%; background: #22c55e;
      margin-right: 5px;
      animation: gaiStatusPulse 2.5s ease-in-out infinite;
    }
    @keyframes gaiStatusPulse {
      0%,100% { opacity: 1; } 50% { opacity: 0.4; }
    }
    .gai-close {
      margin-left: auto; background: none; border: none;
      color: #64748b; font-size: 1.3rem; cursor: pointer;
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.18s, color 0.18s;
    }
    .gai-close:hover { background: rgba(255,255,255,0.07); color: #fff; }

    /* ── Messages ── */
    .gai-messages {
      height: 320px; overflow-y: auto;
      padding: 14px; display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent;
    }
    .gai-messages::-webkit-scrollbar { width: 3px; }
    .gai-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.35); border-radius: 3px; }

    .gai-msg { display: flex; gap: 8px; align-items: flex-start; animation: gaiMsgIn 0.25s ease; }
    @keyframes gaiMsgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    .gai-msg.user { flex-direction: row-reverse; }

    .gai-av {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
    }
    .gai-av.ai   { background: linear-gradient(135deg, #7c3aed, #ff4d6d); color: #fff; }
    .gai-av.user { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); }

    .gai-bub {
      max-width: 80%; padding: 9px 13px; border-radius: 14px;
      font-size: 0.82rem; line-height: 1.6;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    .gai-msg.ai .gai-bub {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-top-left-radius: 4px; color: #e2e8f0;
    }
    .gai-msg.user .gai-bub {
      background: linear-gradient(135deg, rgba(124,58,237,0.22), rgba(255,77,109,0.14));
      border: 1px solid rgba(124,58,237,0.25);
      border-top-right-radius: 4px; color: #e0d4ff;
    }

    /* ── Typing dots ── */
    .gai-typing { display: flex; gap: 4px; align-items: center; padding: 2px 0; }
    .gai-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #7c3aed; animation: gaiBounce 1.2s infinite;
    }
    .gai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .gai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes gaiBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

    /* ── Error bubble ── */
    .gai-bub.error {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.25);
      color: #fca5a5;
    }

    /* ── Chips ── */
    .gai-chips {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 10px 14px 0; flex-shrink: 0;
    }
    .gai-chip {
      padding: 5px 11px; border-radius: 100px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.6);
      font-size: 0.7rem; font-weight: 600;
      cursor: pointer; white-space: nowrap;
      transition: all 0.18s;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    .gai-chip:hover { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.4); color: #c4b5fd; }

    /* ── Input ── */
    .gai-input-wrap {
      padding: 12px 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
    }
    .gai-char-count {
      font-size: 0.65rem; color: #64748b;
      text-align: right; margin-bottom: 6px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      transition: color 0.2s;
    }
    .gai-char-count.warn { color: #f97316; }
    .gai-input-row { display: flex; gap: 8px; align-items: flex-end; }
    .gai-input {
      flex: 1; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09); border-radius: 12px;
      padding: 10px 14px; color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      font-size: 0.82rem; resize: none;
      min-height: 40px; max-height: 100px; overflow-y: auto;
      transition: border-color 0.2s; line-height: 1.5;
    }
    .gai-input:focus { outline: none; border-color: rgba(124,58,237,0.5); }
    .gai-input::placeholder { color: #64748b; }
    .gai-send {
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: 10px; border: none;
      background: linear-gradient(135deg, #7c3aed, #ff4d6d);
      color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.22s;
      box-shadow: 0 3px 12px rgba(124,58,237,0.35);
    }
    .gai-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 5px 18px rgba(124,58,237,0.5); }
    .gai-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .gai-send svg { width: 15px; height: 15px; }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #gai-btn  { bottom: 20px; left: 20px; width: 50px; height: 50px; }
      #gai-panel {
        bottom: 0; left: 0; right: 0;
        width: 100%; max-width: 100%;
        border-radius: 22px 22px 0 0;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ──────────────────────────────────────────────
     HTML STRUCTURE
  ────────────────────────────────────────────── */
  const html = `
    <button id="gai-btn" aria-label="Open AI Assistant" title="Ask Greetings AI">
      ✦
      <span class="gai-badge">AI</span>
    </button>

    <div id="gai-panel" role="dialog" aria-label="Greetings AI Chat">
      <div class="gai-header">
        <div class="gai-orb">✦</div>
        <div>
          <div class="gai-title">Greetings AI</div>
          <div class="gai-sub"><span class="gai-status-dot"></span>Online • Ask me anything</div>
        </div>
        <button class="gai-close" id="gai-close-btn" aria-label="Close AI assistant">&times;</button>
      </div>

      <div class="gai-messages" id="gai-msgs"></div>

      <div class="gai-chips" id="gai-chips">
        <button class="gai-chip" data-p="What cards do you have for birthdays?">🎂 Birthday</button>
        <button class="gai-chip" data-p="Write a sweet anniversary message for my partner">💌 Anniversary msg</button>
        <button class="gai-chip" data-p="How do I share a card on WhatsApp?">📤 Share a card</button>
        <button class="gai-chip" data-p="What occasions do you cover?">🎉 All occasions</button>
      </div>

      <div class="gai-input-wrap">
        <div class="gai-char-count" id="gai-char-count">0 / 500</div>
        <div class="gai-input-row">
          <textarea class="gai-input" id="gai-input"
            placeholder="Ask about cards, messages, occasions…"
            rows="1"
            maxlength="500"
            aria-label="Type your message"></textarea>
          <button class="gai-send" id="gai-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  /* ──────────────────────────────────────────────
     REFS
  ────────────────────────────────────────────── */
  const btnEl     = document.getElementById('gai-btn');
  const panel     = document.getElementById('gai-panel');
  const closeEl   = document.getElementById('gai-close-btn');
  const msgsEl    = document.getElementById('gai-msgs');
  const inputEl   = document.getElementById('gai-input');
  const sendEl    = document.getElementById('gai-send');
  const charCount = document.getElementById('gai-char-count');

  let isOpen    = false;
  let isLoading = false;
  let history   = [];   // [{role:'user'|'assistant', content:'...'}]
  let welcomed  = false;

  /* ──────────────────────────────────────────────
     OPEN / CLOSE
  ────────────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    if (!welcomed) {
      welcomed = true;
      setTimeout(() => addMsg('ai',
        `Hi there! 👋 I'm Greetings AI. I can help you find the perfect card, write a heartfelt message, or answer anything about our platform. What can I help you with today?`
      ), 300);
    }
    setTimeout(() => inputEl.focus(), 350);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
  }

  /* Expose globally so other scripts (e.g. Help Panel) can open the assistant */
  window.greetingsAI = { open: openPanel, close: closePanel };

  btnEl.addEventListener('click',  () => isOpen ? closePanel() : openPanel());
  closeEl.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); });

  /* ──────────────────────────────────────────────
     MESSAGES
  ────────────────────────────────────────────── */
  function addMsg(role, text, typing = false) {
    const row = document.createElement('div');
    row.className = `gai-msg ${role}`;

    const av = document.createElement('div');
    av.className = `gai-av ${role}`;
    av.textContent = role === 'ai' ? '✦' : '👤';

    const bub = document.createElement('div');
    bub.className = 'gai-bub';

    if (typing) {
      bub.innerHTML = '<div class="gai-typing"><span></span><span></span><span></span></div>';
      row.id = 'gai-typing-row';
    } else {
      // Render newlines as line breaks
      bub.textContent = text;
    }

    if (role === 'error') {
      bub.classList.add('error');
      row.classList.remove('error');
      row.classList.add('ai');
    }

    row.appendChild(av);
    row.appendChild(bub);
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return row;
  }

  /* ──────────────────────────────────────────────
     SEND MESSAGE → Backend → Claude API
  ────────────────────────────────────────────── */
  async function send(text) {
    text = text.trim();
    if (!text || isLoading) return;

    isLoading = true;
    sendEl.disabled = true;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    charCount.textContent = '0 / 500';
    charCount.classList.remove('warn');

    // Hide chips after first real message
    const chipsEl = document.getElementById('gai-chips');
    if (chipsEl) chipsEl.style.display = 'none';

    addMsg('user', text);
    history.push({ role: 'user', content: text });
    addMsg('ai', '', true); // typing indicator

    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system:   SYSTEM,
          messages: history,
        }),
      });

      // Remove typing indicator
      document.getElementById('gai-typing-row')?.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data?.content?.[0]?.text?.trim()
        || "Sorry, I couldn't get a response. Please try again! 🙏";

      addMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });

      // Keep history at max 20 turns to stay within token limits
      if (history.length > 20) history = history.slice(-20);

    } catch (err) {
      document.getElementById('gai-typing-row')?.remove();
      console.error('[Greetings AI] Error:', err.message);

      const isNetwork = err.message.includes('fetch') || err.message.includes('Failed');
      addMsg('error', isNetwork
        ? '⚠️ Connection error. Please check your internet and try again.'
        : `⚠️ ${err.message || 'Something went wrong. Please try again.'}`
      );
    }

    isLoading = false;
    sendEl.disabled = false;
    inputEl.focus();
  }

  /* ──────────────────────────────────────────────
     EVENT LISTENERS
  ────────────────────────────────────────────── */
  sendEl.addEventListener('click', () => send(inputEl.value));

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(inputEl.value);
    }
  });

  // Auto-resize textarea + character counter
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';

    const len = this.value.length;
    charCount.textContent = `${len} / 500`;
    charCount.classList.toggle('warn', len > 420);
  });

  // Quick-reply chips
  document.querySelectorAll('.gai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!isOpen) openPanel();
      send(chip.dataset.p);
    });
  });

})();