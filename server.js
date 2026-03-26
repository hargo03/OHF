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

// ── AI-powered Animation Search ───────────────────────────────────────────────
async function extractSearchTerms(userPrompt) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    system: `You are a GIF search query optimizer for a farewell party app. 
Convert the user's animation prompt into 3-5 ideal search keywords for finding funny, relevant GIFs.
Rules:
- Return ONLY the search query string, nothing else (no explanation, no quotes)
- Make it playful and party-themed if applicable
- Keep it under 6 words
- Focus on the visual subject/action`,
    messages: [{ role: 'user', content: userPrompt }]
  });
  return msg.content[0].text.trim();
}

async function searchTenor(query, limit = 8) {
  // Tenor public demo key — works without registration
  const TENOR_KEY = 'LIVDSRZULELA';
  const url = `https://api.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=${limit}&contentfilter=medium&mediafilter=minimal`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tenor API error: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(gif => ({
    id: gif.id,
    title: gif.title,
    url: gif.media?.[0]?.gif?.url || gif.media?.[0]?.mediumgif?.url,
    preview: gif.media?.[0]?.tinygif?.url || gif.media?.[0]?.gif?.url,
  })).filter(g => g.url);
}

// ── API Routes ────────────────────────────────────────────────────────────────

// GET  /api/messages  – return all messages, newest first
app.get('/api/messages', (req, res) => {
  const messages = readMessages();
  res.json([...messages].reverse());
});

// POST /api/search-animation – AI semantic search for GIF
app.post('/api/search-animation', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });
  try {
    const query = await extractSearchTerms(prompt.trim());
    const results = await searchTenor(query);
    res.json({ query, results });
  } catch (err) {
    console.error('Search animation error:', err.message);
    res.status(500).json({ error: 'Failed to search for animations. Try again.' });
  }
});

// Legacy /api/preview-animation endpoint — now redirects to search
app.post('/api/preview-animation', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });
  try {
    const query = await extractSearchTerms(prompt.trim());
    const results = await searchTenor(query, 1);
    if (!results.length) throw new Error('No results found');
    const gifUrl = results[0].url;
    const animation = `<!DOCTYPE html><html><head><style>body{margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;background:transparent;} img{width:100%;height:100%;object-fit:cover;}</style></head><body><img src="${gifUrl}" /></body></html>`;
    res.json({ animation });
  } catch (err) {
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});

// DELETE /api/messages/:id/admin — hard delete any card (admin use; no auth required on private server)
app.delete('/api/messages/:id/admin', (req, res) => {
  const messages = readMessages();
  const before = messages.length;
  const filtered = messages.filter(m => m.id !== req.params.id);
  if (filtered.length === before) return res.status(404).json({ error: 'Message not found' });
  writeMessages(filtered);
  res.json({ ok: true, deleted: req.params.id });
});




// POST /api/messages  – create and save a new message
app.post('/api/messages', async (req, res) => {
  const { nickname, message, animationPrompt, customAnimationHtml, x, y } = req.body;

  if (!nickname?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Nickname and message are required' });
  }

  if (nickname.trim().length > 40) {
    return res.status(400).json({ error: 'Nickname too long (max 40 chars)' });
  }
  if (message.trim().length > 1000) {
    return res.status(400).json({ error: 'Message too long (max 1000 chars)' });
  }

  try {
    let animation = customAnimationHtml;
    // Only call Claude if no custom animation HTML was provided
    if (!animation && animationPrompt?.trim()) {
      animation = await generateAnimation(animationPrompt.trim());
    } else if (!animation) {
       return res.status(400).json({ error: 'Either an animation prompt or a selected gallery animation is required.' });
    }

    const messages = readMessages();

    const newMessage = {
    id: Date.now().toString(),
    nickname: nickname.trim(),
    message: message.trim(),
    animationPrompt: animationPrompt?.trim() || '',
    animation,
    x: typeof x === 'number' ? x : Math.floor(Math.random() * 70) + 5,
    y: typeof y === 'number' ? y : Math.floor(Math.random() * 800) + 50,
    timestamp: new Date().toISOString(),
    reactions: { fire: 0, heart: 0, sad: 0 },
    replies: []
  };

    messages.push(newMessage);
    writeMessages(messages);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error creating message:', err.message);
    res.status(500).json({ error: 'Failed to create message. Please try again.' });
  }
});

// PUT /api/messages/:id – edit a specific message
app.put('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { message, animationPrompt, customAnimationHtml, x, y } = req.body;

  // Allow coordinate-only updates
  const isPosUpdate = (typeof x === 'number' && typeof y === 'number');
  if (!isPosUpdate && !message?.trim()) {
    return res.status(400).json({ error: 'Message or coordinates are required' });
  }

  try {
    const messages = readMessages();
    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let animation = messages[msgIndex].animation;
    let finalPrompt = messages[msgIndex].animationPrompt;

    if (customAnimationHtml) {
      animation = customAnimationHtml;
      finalPrompt = 'Gallery Selection';
    } else if (animationPrompt && animationPrompt.trim() !== messages[msgIndex].animationPrompt) {
      animation = await generateAnimation(animationPrompt.trim());
      finalPrompt = animationPrompt.trim();
    }

    // Handle coordinate-only update vs full edit
    let finalMessage = messages[msgIndex].message;
    if (message?.trim()) finalMessage = message.trim();

    messages[msgIndex] = {
      ...messages[msgIndex],
      message: finalMessage,
      animationPrompt: finalPrompt,
      animation
    };

    if (typeof x === 'number') messages[msgIndex].x = x;
    if (typeof y === 'number') messages[msgIndex].y = y;

    writeMessages(messages);
    res.json(messages[msgIndex]);
  } catch (err) {
    console.error('Error updating message:', err.message);
    res.status(500).json({ error: 'Failed to update message.' });
  }
});

// PUT /api/messages/:id/react – increment a reaction stamp
app.put('/api/messages/:id/react', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'fire', 'heart', or 'sad'
  
  if (!['fire', 'heart', 'sad'].includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  let messages = readMessages();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (!messages[index].reactions) messages[index].reactions = { fire: 0, heart: 0, sad: 0 };
  messages[index].reactions[type] += 1;
  writeMessages(messages);
  
  res.json({ success: true, reactions: messages[index].reactions });
});

// POST /api/messages/:id/reply - add a thread reply
app.post('/api/messages/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  
  if (!author?.trim() || !text?.trim()) {
    return res.status(400).json({ error: 'Author and text are required' });
  }

  let messages = readMessages();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  if (!messages[index].replies) messages[index].replies = [];
  
  const newReply = {
    id: Date.now().toString(),
    author: author.trim(),
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  messages[index].replies.push(newReply);
  writeMessages(messages);
  res.json({ success: true, reply: newReply });
});

// POST /api/spice - AI rewrite for messages
app.post('/api/spice', async (req, res) => {
  const { text, flavor } = req.body;
  if (!text?.trim() || !flavor) return res.status(400).json({ error: 'Text and flavor required' });
  
  let systemPrompt = "You are a witty co-worker text rewriting bot.";
  if (flavor === 'roast') systemPrompt = "Rewrite the user's farewell message as a hilarious, slightly savage (but SFW) roast about them leaving. Keep it under 2 sentences.";
  if (flavor === 'hype') systemPrompt = "Rewrite the user's farewell message as a desperately overly-enthusiastic, corporate-jargon-filled hype speech. Keep it under 2 sentences.";
  if (flavor === 'pirate') systemPrompt = "Rewrite the user's farewell message strictly like an aggressive pirate saying farewell. Keep it under 2 sentences.";

  try {
    const aiRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 250,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }]
    });
    res.json({ spicedText: aiRes.content[0].text.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Spicing failed' });
  }
});

// DELETE /api/messages/:id  – remove a specific message 
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
