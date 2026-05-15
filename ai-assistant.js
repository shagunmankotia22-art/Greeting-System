// Ai assistant.js
// This file was created at the project root.

/* ===============================================================
   GREETINGS AI — Floating Assistant Widget
   Drop this file in your project and add to any page:
     <script src="ai-assistant.js"></script>

   It injects a floating "AI" button that opens a slide-up chat
   panel powered by Claude. Works on all pages automatically.
   =============================================================== */

(function () {
  'use strict';

  // https://greeting-system.onrender.com
  // const AI_MODEL = 'claude-sonnet-4-20250514';
  const API_URL = 'https://greeting-system.onrender.com/api/chat'; // Ensure the /api/chat path is correct for your backend
const AI_MODEL = 'claude-sonnet-4-20250514';

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
      display: none !important;
    }
    #gai-btn .gai-badge {
      position: absolute; top: -4px; right: -4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #ff4d6d; border: 2px solid #0a0c10;
      font-size: 0.55rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      animation: gaiBadgePulse 2s ease-in-out infinite;
    }
    @keyframes gaiBadgePulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,77,109,0.5); }
      50%      { box-shadow: 0 0 0 6px rgba(255,77,109,0); }
    }

    #gai-panel {
      position: fixed; bottom: 80px; right: 28px; z-index: 8887;
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
    .gai-close {
      margin-left: auto; background: none; border: none;
      color: #64748b; font-size: 1.3rem; cursor: pointer;
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.18s, color 0.18s;
    }
    .gai-close:hover { background: rgba(255,255,255,0.07); color: #fff; }

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

    .gai-typing { display: flex; gap: 4px; align-items: center; padding: 2px 0; }
    .gai-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #7c3aed; animation: gaiBounce 1.2s infinite;
    }
    .gai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .gai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes gaiBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

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

    .gai-input-wrap {
      padding: 12px 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
    }
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
    .gai-send:hover { transform: scale(1.08); }
    .gai-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .gai-send svg { width: 15px; height: 15px; }
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
          <div class="gai-sub">Powered by Claude • Ask me anything</div>
        </div>
        <button class="gai-close" id="gai-close-btn" aria-label="Close AI assistant">&times;</button>
      </div>

      <div class="gai-messages" id="gai-msgs"></div>

      <div class="gai-chips" id="gai-chips">
        <button class="gai-chip" data-p="What cards do you have for birthdays?">Birthday cards</button>
        <button class="gai-chip" data-p="Write a sweet anniversary message">Anniversary msg</button>
        <button class="gai-chip" data-p="How do I share a card on WhatsApp?">Share a card</button>
        <button class="gai-chip" data-p="What occasions do you cover?">All occasions</button>
      </div>

      <div class="gai-input-wrap">
        <div class="gai-input-row">
          <textarea class="gai-input" id="gai-input" placeholder="Ask about cards, messages, occasions…" rows="1"></textarea>
          <button class="gai-send" id="gai-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
  const btnEl   = document.getElementById('gai-btn');
  const panel   = document.getElementById('gai-panel');
  const closeEl = document.getElementById('gai-close-btn');
  const msgsEl  = document.getElementById('gai-msgs');
  const inputEl = document.getElementById('gai-input');
  const sendEl  = document.getElementById('gai-send');

  let isOpen    = false;
  let isLoading = false;
  let history   = [];
  let welcomed  = false;

  /* ──────────────────────────────────────────────
     OPEN / CLOSE
  ────────────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    if (!welcomed) {
      welcomed = true;
      setTimeout(() => addMsg('ai', `Hi there! 👋 I'm Greetings AI. I can help you find the perfect card, write a heartfelt message, or answer anything about our platform. What can I help you with?`), 300);
    }
    setTimeout(() => inputEl.focus(), 350);
  }

  function closePanel() { isOpen = false; panel.classList.remove('open'); }

  /* ── Expose globally so the Help Panel "Live Chat" button can open the assistant ── */
  window.greetingsAI = { open: openPanel, close: closePanel };

  btnEl.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  closeEl.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); });

  /* ──────────────────────────────────────────────
     MESSAGES
  ────────────────────────────────────────────── */
  function addMsg(role, text, typing = false) {
    const row  = document.createElement('div');
    row.className = `gai-msg ${role}`;

    const av   = document.createElement('div');
    av.className = `gai-av ${role}`;
    av.textContent = role === 'ai' ? '✦' : '👤';

    const bub  = document.createElement('div');
    bub.className = 'gai-bub';

    if (typing) {
      bub.innerHTML = '<div class="gai-typing"><span></span><span></span><span></span></div>';
      row.id = 'gai-typing';
    } else {
      bub.textContent = text;
    }

    row.appendChild(av); row.appendChild(bub);
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return row;
  }

  /* ──────────────────────────────────────────────
     SEND MESSAGE → Claude API
  ────────────────────────────────────────────── */
  async function send(text) {
    text = text.trim();
    if (!text || isLoading) return;

    isLoading = true;
    sendEl.disabled = true;
    inputEl.value = '';
    inputEl.style.height = 'auto';

    addMsg('user', text);
    history.push({ role: 'user', content: text });
    addMsg('ai', '', true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 600,
          system: SYSTEM,
          messages: history,
        })
      });

      const data  = await res.json();
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t respond right now. Please try again!';

      document.getElementById('gai-typing')?.remove();
      addMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });

      // Keep history at max 20 turns to avoid token limits
      if (history.length > 20) history = history.slice(-20);

    } catch (err) {
      document.getElementById('gai-typing')?.remove();
      addMsg('ai', '⚠️ Couldn\'t connect right now. Please check your connection and try again.');
      console.error('[Greetings AI] Error:', err);
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
      e.preventDefault(); send(inputEl.value);
    }
  });

  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  document.querySelectorAll('.gai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!isOpen) openPanel();
      send(chip.dataset.p);
    });
  });

})();


// ai-assistant.js

const chatContainer = document.querySelector('.chat-messages'); // Adjust selector as needed
const generateBtn = document.querySelector('.generate-btn');

async function generateGreeting() {
    const occasion = document.getElementById('occasion')?.value;
    const recipient = document.getElementById('recipient')?.value;
    const style = document.getElementById('style')?.value;

    

    try {
        // Show loading state
        if(generateBtn) generateBtn.innerText = "Generating...";

        const response = await fetch('https://greeting-system.onrender.com/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Important: Never put your API Key directly in frontend JS!
            },
            body: JSON.stringify({
                prompt: `Create a ${style} ${occasion} greeting for ${recipient}.`
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        displayMessage(data.message); // Helper to show in UI

    } catch (error) {
        console.error('Error:', error);
        // This triggers the warning seen in image_84f15e.jpg
        showError("Error generating message. Please try again.");
    } finally {
        if(generateBtn) generateBtn.innerText = "Generate Message";
    }
}

function showError(msg) {
    const errorDiv = document.querySelector('.error-message');
    if(errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    }
}