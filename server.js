// server.js — Greetings AI Backend (Groq primary + Gemini fallback)
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');

/* ══════════════════════════════════════
   AI HELPER — Groq primary, Gemini fallback
══════════════════════════════════════ */
async function callAI(messages, system, maxTokens) {
  maxTokens = maxTokens || 600;

  // ── PRIMARY: Groq (fast + generous free tier) ──
  if (process.env.GROQ_API_KEY) {
    try {
      const groqMessages = [];
      if (system) groqMessages.push({ role: 'system', content: system });
      messages.forEach(function(m) { groqMessages.push(m); });

      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: maxTokens,
          temperature: 0.8,
          messages: groqMessages
        })
      });

      if (r.ok) {
        const d = await r.json();
        const text = d.choices?.[0]?.message?.content || '';
        if (text) return { text, provider: 'groq' };
      } else if (r.status === 429) {
        return { error: 'rate_limited', message: 'AI is a little busy right now — please try again in a few seconds.' };
      } else {
        const errText = await r.text();
        console.warn('[AI] Groq responded with', r.status, errText);
      }
    } catch(e) {
      console.warn('[AI] Groq fetch error:', e.message);
    }
  }

  // ── FALLBACK: Gemini ──
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiContents = [];
      if (system) {
        geminiContents.push({ role: 'user',  parts: [{ text: 'System instructions: ' + system }] });
        geminiContents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
      }
      messages.forEach(function(m) {
        geminiContents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      });

      const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY;
      const r = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 }
        })
      });

      if (r.ok) {
        const d = await r.json();
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return { text, provider: 'gemini' };
      }
      if (r.status === 429) {
        return { error: 'rate_limited', message: 'AI is a little busy right now — please try again in a few seconds.' };
      }
      console.warn('[AI] Gemini responded with', r.status);
    } catch(e) {
      console.warn('[AI] Gemini fetch error:', e.message);
    }
  }

  return { error: 'no_provider', message: 'No AI provider configured.' };
}

const app  = express();
const PORT = process.env.PORT || 3001;

/* ══════════════════════════════════════
   MIDDLEWARE
══════════════════════════════════════ */
app.use(cors({ origin: '*', methods: ['POST', 'GET', 'DELETE', 'PUT'] }));
app.use(express.json());

/* ══════════════════════════════════════
   SIMPLE FILE-BASED DATABASE
══════════════════════════════════════ */
const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function readDB(name) {
  try {
    const file = path.join(DB_DIR, `${name}.json`);
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return {}; }
}

function writeDB(name, data) {
  try {
    fs.writeFileSync(path.join(DB_DIR, `${name}.json`), JSON.stringify(data, null, 2));
  } catch(e) { console.error('DB write error:', e); }
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'greetings_salt_2025').digest('hex');
}

function generateToken(email) {
  return crypto.createHash('sha256').update(email + Date.now() + Math.random()).digest('hex');
}

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const sessions = readDB('sessions');
  const email = sessions[token];
  if (!email) return res.status(401).json({ error: 'Invalid or expired token' });
  req.userEmail = email;
  next();
}

/* ══════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════ */
app.get('/', (req, res) => {
  res.json({ status: 'Greetings AI backend is running', version: '3.0' });
});

/* ══════════════════════════════════════
   AUTH ENDPOINTS
══════════════════════════════════════ */
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (!email.includes('@'))
    return res.status(400).json({ error: 'Invalid email address' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const users    = readDB('users');
  const emailKey = email.toLowerCase().trim();
  if (users[emailKey])
    return res.status(409).json({ error: 'An account with this email already exists' });

  users[emailKey] = {
    name, email: emailKey, phone: phone || '',
    password: hashPassword(password),
    createdAt: new Date().toISOString(), favourites: []
  };
  writeDB('users', users);

  const token    = generateToken(emailKey);
  const sessions = readDB('sessions');
  sessions[token] = emailKey;
  writeDB('sessions', sessions);

  res.json({ success: true, token, user: { name, email: emailKey, phone: phone || '' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const users    = readDB('users');
  const emailKey = email.toLowerCase().trim();
  const user     = users[emailKey];
  if (!user || user.password !== hashPassword(password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token    = generateToken(emailKey);
  const sessions = readDB('sessions');
  sessions[token] = emailKey;
  writeDB('sessions', sessions);

  res.json({ success: true, token, user: { name: user.name, email: user.email, phone: user.phone } });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token    = req.headers['authorization']?.replace('Bearer ', '');
  const sessions = readDB('sessions');
  delete sessions[token];
  writeDB('sessions', sessions);
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt });
});

/* ══════════════════════════════════════
   FAVOURITES
══════════════════════════════════════ */
app.get('/api/favourites', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  res.json({ favourites: user?.favourites || [] });
});

app.post('/api/favourites', authMiddleware, (req, res) => {
  const { imgUrl } = req.body;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.favourites.includes(imgUrl)) { user.favourites.push(imgUrl); writeDB('users', users); }
  res.json({ success: true, favourites: user.favourites });
});

app.delete('/api/favourites', authMiddleware, (req, res) => {
  const { imgUrl } = req.body;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.favourites = user.favourites.filter(f => f !== imgUrl);
  writeDB('users', users);
  res.json({ success: true, favourites: user.favourites });
});

app.delete('/api/favourites/all', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.favourites = [];
  writeDB('users', users);
  res.json({ success: true });
});

/* ══════════════════════════════════════
   CARD VIEW TRACKING
══════════════════════════════════════ */
app.post('/api/cards/view', (req, res) => {
  const { imgUrl } = req.body;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });
  const views = readDB('card_views');
  views[imgUrl] = (views[imgUrl] || 0) + 1;
  writeDB('card_views', views);
  res.json({ success: true, views: views[imgUrl] });
});

app.get('/api/cards/popular', (req, res) => {
  const views  = readDB('card_views');
  const sorted = Object.entries(views)
    .sort(([,a],[,b]) => b - a).slice(0, 20)
    .map(([imgUrl, count]) => ({ imgUrl, views: count }));
  res.json({ popular: sorted });
});

app.get('/api/cards/views', (req, res) => {
  const { imgUrl } = req.query;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });
  const views = readDB('card_views');
  res.json({ views: views[imgUrl] || 0 });
});

/* ══════════════════════════════════════
   EMAIL SHARING
══════════════════════════════════════ */
app.post('/api/share/email', async (req, res) => {
  const { toEmail, cardUrl, senderName } = req.body;
  if (!toEmail || !cardUrl)
    return res.status(400).json({ error: 'toEmail and cardUrl are required' });

  if (!process.env.SENDGRID_API_KEY) {
    return res.json({
      success: true,
      message: 'Email service not configured — use the share link instead',
      shareLink: cardUrl,
      mailtoLink: `mailto:${toEmail}?subject=${encodeURIComponent('A beautiful card for you!')}&body=${encodeURIComponent(`Hi!\n\n${senderName || 'Someone'} sent you a greeting card.\n\nView it here: ${cardUrl}\n\n— Greetings App`)}`
    });
  }

  try {
    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: 'noreply@greetings.app', name: 'Greetings App' },
        subject: `${senderName || 'Someone'} sent you a greeting card!`,
        content: [{ type: 'text/html', value: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#7c3aed;">You received a greeting card!</h2><p>${senderName || 'Someone'} thought of you.</p><a href="${cardUrl}" style="display:inline-block;background:linear-gradient(135deg,#9333ea,#ff4d6d);color:#fff;padding:14px 28px;border-radius:100px;text-decoration:none;font-weight:700;margin:20px 0;">View Your Card</a></div>` }]
      })
    });
    if (sgRes.ok) return res.json({ success: true, message: 'Email sent successfully!' });
  } catch(e) { console.error('SendGrid error:', e); }

  res.status(500).json({ error: 'Failed to send email' });
});

/* ══════════════════════════════════════
   AI-POWERED SEARCH
══════════════════════════════════════ */
app.post('/api/search/ai', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'No AI provider configured', category: 'cards', keywords: [], suggestion: 'Try browsing our categories!' });

  const prompt = 'You are a greeting card search assistant.\nA user is searching for: "' + query + '"\n\nAvailable card types: Wedding, Birthday, Party, Cards (general), Events, Brunch, Holiday, Halloween, Christmas, Anniversary, Graduation, Baby, Retirement.\n\nRespond with a JSON object with these fields:\n- "category": best matching category (one of: wedding, birthday, party, cards, events)\n- "keywords": array of 3-5 relevant keywords\n- "suggestion": a friendly one-line suggestion message\n- "confidence": number 0-1\n\nRespond with ONLY valid JSON, no markdown, no explanation.';

  try {
    const result = await callAI([{ role: 'user', content: prompt }], null, 200);

    if (result.error === 'rate_limited')
      return res.status(429).json({ error: result.message, category: 'cards', suggestion: 'Try browsing our categories!', keywords: [] });

    if (result.error)
      return res.status(500).json({ error: result.message, category: 'cards', keywords: [], suggestion: 'Try browsing our categories!' });

    const clean  = result.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch(e) {
    console.error('AI search error:', e);
    res.status(500).json({ error: 'AI search failed', category: 'cards', keywords: [], suggestion: 'Try browsing our categories!' });
  }
});

/* ══════════════════════════════════════
   AI CHAT
══════════════════════════════════════ */
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  // Handle keep-alive pings without hitting any AI API
  if (system === 'ping') return res.json({ content: [{ type: 'text', text: 'pong' }] });

  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array is required' });

  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'No AI provider configured on server' });

  try {
    const result = await callAI(messages, system, 600);

    if (result.error === 'rate_limited')
      return res.status(429).json({ error: result.message });

    if (result.error)
      return res.status(500).json({ error: result.message });

    res.json({ content: [{ type: 'text', text: result.text }] });
  } catch (err) {
    console.error('[Greetings AI] Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  const hasGroq   = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  console.log('Greetings AI backend running on port ' + PORT);
  console.log('AI: ' + (hasGroq ? 'Groq (primary)' : '') + (hasGemini ? (hasGroq ? ' + Gemini (fallback)' : 'Gemini only') : '') + (!hasGroq && !hasGemini ? 'NONE configured!' : ''));
});