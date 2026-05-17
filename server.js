// server.js — Greetings AI Backend (Gemini + Full API Integration)
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ══════════════════════════════════════
   MIDDLEWARE
══════════════════════════════════════ */
app.use(cors({ origin: '*', methods: ['POST', 'GET', 'DELETE', 'PUT'] }));
app.use(express.json());

/* ══════════════════════════════════════
   SIMPLE FILE-BASED DATABASE
   (works on Render free tier — no DB needed)
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
  res.json({ status: 'Greetings AI backend is running ✦', version: '2.0' });
});

/* ══════════════════════════════════════
   🔐 AUTH ENDPOINTS
══════════════════════════════════════ */

// SIGNUP
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });

  if (!email.includes('@'))
    return res.status(400).json({ error: 'Invalid email address' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const users = readDB('users');
  const emailKey = email.toLowerCase().trim();

  if (users[emailKey])
    return res.status(409).json({ error: 'An account with this email already exists' });

  // Save user
  users[emailKey] = {
    name,
    email: emailKey,
    phone: phone || '',
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    favourites: []
  };
  writeDB('users', users);

  // Create session token
  const token = generateToken(emailKey);
  const sessions = readDB('sessions');
  sessions[token] = emailKey;
  writeDB('sessions', sessions);

  res.json({
    success: true,
    token,
    user: { name, email: emailKey, phone: phone || '' }
  });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const users = readDB('users');
  const emailKey = email.toLowerCase().trim();
  const user = users[emailKey];

  if (!user || user.password !== hashPassword(password))
    return res.status(401).json({ error: 'Invalid email or password' });

  // Create session token
  const token = generateToken(emailKey);
  const sessions = readDB('sessions');
  sessions[token] = emailKey;
  writeDB('sessions', sessions);

  res.json({
    success: true,
    token,
    user: { name: user.name, email: user.email, phone: user.phone }
  });
});

// LOGOUT
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  const sessions = readDB('sessions');
  delete sessions[token];
  writeDB('sessions', sessions);
  res.json({ success: true });
});

// GET PROFILE
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt });
});

/* ══════════════════════════════════════
   ❤️ FAVOURITES ENDPOINTS
══════════════════════════════════════ */

// GET all favourites for logged-in user
app.get('/api/favourites', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  res.json({ favourites: user?.favourites || [] });
});

// ADD a favourite
app.post('/api/favourites', authMiddleware, (req, res) => {
  const { imgUrl } = req.body;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });

  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.favourites.includes(imgUrl)) {
    user.favourites.push(imgUrl);
    writeDB('users', users);
  }
  res.json({ success: true, favourites: user.favourites });
});

// REMOVE a favourite
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

// CLEAR all favourites
app.delete('/api/favourites/all', authMiddleware, (req, res) => {
  const users = readDB('users');
  const user  = users[req.userEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.favourites = [];
  writeDB('users', users);
  res.json({ success: true });
});

/* ══════════════════════════════════════
   📊 CARD VIEW TRACKING
══════════════════════════════════════ */

// Track a card view
app.post('/api/cards/view', (req, res) => {
  const { imgUrl } = req.body;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });

  const views = readDB('card_views');
  views[imgUrl] = (views[imgUrl] || 0) + 1;
  writeDB('card_views', views);
  res.json({ success: true, views: views[imgUrl] });
});

// Get most popular cards
app.get('/api/cards/popular', (req, res) => {
  const views = readDB('card_views');
  const sorted = Object.entries(views)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 20)
    .map(([imgUrl, count]) => ({ imgUrl, views: count }));
  res.json({ popular: sorted });
});

// Get view count for a specific card
app.get('/api/cards/views', (req, res) => {
  const { imgUrl } = req.query;
  if (!imgUrl) return res.status(400).json({ error: 'imgUrl is required' });
  const views = readDB('card_views');
  res.json({ views: views[imgUrl] || 0 });
});

/* ══════════════════════════════════════
   📧 EMAIL SHARING
══════════════════════════════════════ */
app.post('/api/share/email', async (req, res) => {
  const { toEmail, cardUrl, senderName } = req.body;
  if (!toEmail || !cardUrl)
    return res.status(400).json({ error: 'toEmail and cardUrl are required' });

  // If no email service configured, return the share link directly
  if (!process.env.SENDGRID_API_KEY && !process.env.SMTP_KEY) {
    return res.json({
      success: true,
      message: 'Email service not configured — use the share link instead',
      shareLink: cardUrl,
      mailtoLink: `mailto:${toEmail}?subject=${encodeURIComponent('A beautiful card for you!')}&body=${encodeURIComponent(`Hi!\n\n${senderName || 'Someone'} sent you a greeting card.\n\nView it here: ${cardUrl}\n\n— Greetings App`)}`
    });
  }

  // SendGrid integration (if SENDGRID_API_KEY is set)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: 'noreply@greetings.app', name: 'Greetings App' },
          subject: `${senderName || 'Someone'} sent you a greeting card! 🎉`,
          content: [{
            type: 'text/html',
            value: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#7c3aed;">You received a greeting card! 🎉</h2>
              <p>${senderName || 'Someone'} thought of you and sent this card.</p>
              <a href="${cardUrl}" style="display:inline-block;background:linear-gradient(135deg,#9333ea,#ff4d6d);color:#fff;padding:14px 28px;border-radius:100px;text-decoration:none;font-weight:700;margin:20px 0;">
                View Your Card →
              </a>
              <p style="color:#888;font-size:0.85rem;margin-top:30px;">Sent via Greetings App</p>
            </div>`
          }]
        })
      });
      if (sgRes.ok) return res.json({ success: true, message: 'Email sent successfully!' });
    } catch(e) { console.error('SendGrid error:', e); }
  }

  res.status(500).json({ error: 'Failed to send email' });
});

/* ══════════════════════════════════════
   🔍 AI-POWERED SEARCH
══════════════════════════════════════ */
app.post('/api/search/ai', async (req, res) => {
  const { query, availableCards } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    const prompt = `You are a greeting card search assistant. 
A user is searching for: "${query}"

Available card types on the platform: Wedding, Birthday, Party, Cards (general), Events, Brunch, Holiday, Halloween, Christmas, Anniversary, Graduation, Baby, Retirement.

Based on the search query, respond with a JSON object with these fields:
- "category": the best matching category page (one of: wedding, birthday, party, cards, events)  
- "keywords": array of 3-5 keywords that describe what they're looking for
- "suggestion": a friendly one-line suggestion message to show the user
- "confidence": number 0-1 of how confident you are

Respond with ONLY valid JSON, no markdown.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response  = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.3 }
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch(e) {
    console.error('AI search error:', e);
    res.status(500).json({ error: 'AI search failed', category: 'cards' });
  }
});

/* ══════════════════════════════════════
   💬 AI CHAT (existing endpoint)
══════════════════════════════════════ */
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array is required' });

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  try {
    const geminiContents = [];
    if (system) {
      geminiContents.push({ role: 'user', parts: [{ text: 'System instructions: ' + system }] });
      geminiContents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
    }
    messages.forEach(msg => {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response  = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.8 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Gemini API error', detail: errText });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    res.json({ content: [{ type: 'text', text: replyText }] });
  } catch (err) {
    console.error('[Greetings AI] Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Greetings AI backend running on http://localhost:${PORT}`);
  console.log(`   Endpoints available:`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/favourites`);
  console.log(`   POST /api/favourites`);
  console.log(`   DELETE /api/favourites`);
  console.log(`   POST /api/cards/view`);
  console.log(`   GET  /api/cards/popular`);
  console.log(`   POST /api/share/email`);
  console.log(`   POST /api/search/ai`);
  console.log(`   POST /api/chat`);
});