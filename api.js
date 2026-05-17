/* ═══════════════════════════════════════════════════
   api.js — Greetings Central API Client
   Include this on every page BEFORE other scripts
   ═══════════════════════════════════════════════════ */

const GREETINGS_API = 'https://greetings-system-ai.onrender.com';
const TOKEN_KEY     = 'greetings_token';
const USER_KEY      = 'greetings_user';

window.GreetingsAPI = {

  /* ── Token helpers ── */
  getToken()       { return localStorage.getItem(TOKEN_KEY); },
  setToken(t)      { localStorage.setItem(TOKEN_KEY, t); },
  clearToken()     { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  getUser()        { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  setUser(u)       { localStorage.setItem(USER_KEY, JSON.stringify(u)); },
  isLoggedIn()     { return !!this.getToken(); },

  /* ── Base fetch ── */
  async request(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = this.getToken();
      if (!token) throw new Error('Not logged in');
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(GREETINGS_API + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  /* ══════════════════
     🔐 AUTH
  ══════════════════ */
  async signup(name, email, phone, password) {
    const data = await this.request('POST', '/api/auth/signup', { name, email, phone, password });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  async login(email, password) {
    const data = await this.request('POST', '/api/auth/login', { email, password });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  },

  async logout() {
    try { await this.request('POST', '/api/auth/logout', {}, true); } catch(e) {}
    this.clearToken();
    window.location.href = 'login.html';
  },

  async getProfile() {
    return this.request('GET', '/api/auth/me', null, true);
  },

  /* ══════════════════
     ❤️ FAVOURITES
  ══════════════════ */
  async getFavourites() {
    if (!this.isLoggedIn()) {
      // Fall back to localStorage for guests
      try { return JSON.parse(localStorage.getItem('greetings_favourites') || '[]'); } catch { return []; }
    }
    const data = await this.request('GET', '/api/favourites', null, true);
    return data.favourites || [];
  },

  async addFavourite(imgUrl) {
    if (!this.isLoggedIn()) {
      const favs = await this.getFavourites();
      if (!favs.includes(imgUrl)) { favs.push(imgUrl); localStorage.setItem('greetings_favourites', JSON.stringify(favs)); }
      return favs;
    }
    const data = await this.request('POST', '/api/favourites', { imgUrl }, true);
    return data.favourites;
  },

  async removeFavourite(imgUrl) {
    if (!this.isLoggedIn()) {
      let favs = await this.getFavourites();
      favs = favs.filter(f => f !== imgUrl);
      localStorage.setItem('greetings_favourites', JSON.stringify(favs));
      return favs;
    }
    const data = await this.request('DELETE', '/api/favourites', { imgUrl }, true);
    return data.favourites;
  },

  async isFavourite(imgUrl) {
    const favs = await this.getFavourites();
    return favs.includes(imgUrl);
  },

  async clearAllFavourites() {
    if (!this.isLoggedIn()) { localStorage.removeItem('greetings_favourites'); return; }
    await this.request('DELETE', '/api/favourites/all', {}, true);
  },

  /* ══════════════════
     📊 CARD TRACKING
  ══════════════════ */
  async trackView(imgUrl) {
    if (!imgUrl) return;
    try { await this.request('POST', '/api/cards/view', { imgUrl }); } catch(e) {}
  },

  async getPopularCards() {
    return this.request('GET', '/api/cards/popular', null, false);
  },

  async getCardViews(imgUrl) {
    return this.request('GET', `/api/cards/views?imgUrl=${encodeURIComponent(imgUrl)}`, null, false);
  },

  /* ══════════════════
     📧 EMAIL SHARE
  ══════════════════ */
  async shareByEmail(toEmail, cardUrl, senderName) {
    return this.request('POST', '/api/share/email', { toEmail, cardUrl, senderName });
  },

  /* ══════════════════
     🔍 AI SEARCH
  ══════════════════ */
  async aiSearch(query) {
    return this.request('POST', '/api/search/ai', { query });
  },

  /* ══════════════════
     💬 AI CHAT
  ══════════════════ */
  async chat(messages, system) {
    return this.request('POST', '/api/chat', { messages, system });
  }
};