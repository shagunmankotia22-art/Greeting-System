// server.js — Greetings AI Backend (Gemini - FREE)
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ── */
app.use(cors({ origin: '*', methods: ['POST', 'GET'] }));
app.use(express.json());

/* ── Health check ── */
app.get('/', (req, res) => {
  res.json({ status: 'Greetings AI backend is running ✦' });
});

/* ── Main chat endpoint ── */
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    // Convert messages to Gemini format
    const geminiContents = [];

    // Add system prompt as first user message if provided
    if (system) {
      geminiContents.push({
        role: 'user',
        parts: [{ text: 'System instructions: ' + system }]
      });
      geminiContents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    // Add conversation history
    messages.forEach(msg => {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.8,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Greetings AI] Gemini error:', response.status, errText);
      return res.status(response.status).json({ error: 'Gemini API error', detail: errText });
    }

    const data = await response.json();

    // Extract text from Gemini response
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    // Return in Anthropic-compatible format so frontend works without changes
    res.json({
      content: [{ type: 'text', text: replyText }]
    });

  } catch (err) {
    console.error('[Greetings AI] Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Greetings AI backend running on http://localhost:${PORT}`);
});
