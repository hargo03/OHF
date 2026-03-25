require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(DATA_DIR, 'messages.json');

// ── Anthropic client ─────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Persistent storage helpers ────────────────────────────────────────────────
function ensureDataFile() {
  const dataDirectory = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

function readMessages() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeMessages(messages) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// ── Animation generator ───────────────────────────────────────────────────────
async function generateAnimation(userPrompt) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are a hilarious creative web animator building animations for a farewell office party card app called "Rob's Outta Here Fiesta".

Your job: Generate a COMPLETE, self-contained HTML document as a funny animation based on the user's prompt.

STRICT RULES:
- Return ONLY raw HTML — no markdown, no code fences, no explanation
- Must start with <!DOCTYPE html> and end with </html>
- Zero external dependencies: no CDN links, no imports, nothing external
- Use CSS @keyframes animations and/or JavaScript Canvas/requestAnimationFrame
- Make it visually funny, colorful, and entertaining
- Animation must loop or run continuously
- Transparent or solid background is fine — avoid black backgrounds
- Keep it under 180 lines total
- Make it unmistakably related to the user's prompt
- Add humor — this is a party! Exaggerate things, add silly details
- Do NOT include text saying "farewell" or anyone's name unless the prompt requests it
- No alert(), no confirm(), no prompt() calls (they're blocked in sandboxed iframes)
- No localStorage, no cookies, no external fetch calls

EXAMPLE STYLE: If asked for "rain of tacos", generate falling taco emoji shapes on canvas with silly bounce physics. If asked for "rocket launch", do a CSS rocket animation with smoke particles and stars. Go wild!`,
    messages: [
      {
        role: 'user',
        content: `Create a funny animation for this prompt: "${userPrompt}"`,
      },
    ],
  });

  let html = message.content[0].text.trim();

  // Strip markdown code fences if Claude wrapped it
  html = html
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  // Sanity check — must look like HTML
  if (!html.toLowerCase().includes('<html')) {
    throw new Error('Generated content does not appear to be valid HTML');
  }

  return html;
}

// ── API Routes ────────────────────────────────────────────────────────────────

// GET  /api/messages  – return all messages, newest first
app.get('/api/messages', (req, res) => {
  const messages = readMessages();
  res.json([...messages].reverse());
});

// POST /api/preview-animation  – generate animation without saving
app.post('/api/preview-animation', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Animation prompt is required' });
  }
  try {
    const animation = await generateAnimation(prompt.trim());
    res.json({ animation });
  } catch (err) {
    console.error('Animation generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate animation. Check your API key and try again.' });
  }
});

// POST /api/messages  – create and save a new message
app.post('/api/messages', async (req, res) => {
  const { nickname, message, animationPrompt } = req.body;

  if (!nickname?.trim() || !message?.trim() || !animationPrompt?.trim()) {
    return res.status(400).json({ error: 'Nickname, message, and animation prompt are all required' });
  }

  if (nickname.trim().length > 40) {
    return res.status(400).json({ error: 'Nickname too long (max 40 chars)' });
  }
  if (message.trim().length > 1000) {
    return res.status(400).json({ error: 'Message too long (max 1000 chars)' });
  }

  try {
    const animation = await generateAnimation(animationPrompt.trim());
    const messages = readMessages();

    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nickname: nickname.trim(),
      message: message.trim(),
      animationPrompt: animationPrompt.trim(),
      animation,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    writeMessages(messages);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error creating message:', err.message);
    res.status(500).json({ error: 'Failed to create message. Please try again.' });
  }
});

// DELETE /api/messages/:id  – remove a specific message (admin use)
app.delete('/api/messages/:id', (req, res) => {
  const messages = readMessages();
  const filtered = messages.filter(m => m.id !== req.params.id);
  if (filtered.length === messages.length) {
    return res.status(404).json({ error: 'Message not found' });
  }
  writeMessages(filtered);
  res.json({ ok: true });
});

// Catch-all – serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
ensureDataFile();
app.listen(PORT, () => {
  console.log(`\n🎉  Rob's Outta Here Fiesta is LIVE!`);
  console.log(`🚀  http://localhost:${PORT}\n`);
});
