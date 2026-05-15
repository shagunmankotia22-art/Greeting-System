// server.js — Greetings AI Backend Proxy
// Keeps your Anthropic API key secret on the server side.
// Deploy this to Render / Railway / Vercel / any Node host.

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ── */
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',   // Set to your domain in production
  methods: ['POST', 'GET'],
}));
app.use(express.json());

/* ── Health check ── */
app.get('/', (req, res) => {
  res.json({ status: 'Greetings AI backend is running ✦' });
});

/* ── Main proxy endpoint ── */
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  // Basic validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system:     system || '',
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Greetings AI] Anthropic error:', response.status, errText);
      return res.status(response.status).json({ error: 'Upstream API error', detail: errText });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('[Greetings AI] Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Greetings AI backend running on http://localhost:${PORT}`);
});