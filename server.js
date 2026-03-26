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
    max_tokens: 4096,
    system: `You are an elite creative web graphics engineer building high-end, 60fps cinematic animations for a farewell office party web app called "Rob's Outta Here Fiesta".

Your job: Generate a COMPLETE, self-contained HTML document serving as a visually stunning interactive animation based on the user's prompt.

SUPERCHARGED CAPABILITIES & STRICT RULES:
- You have FULL ACCESS to the world's best animation libraries via these CDNs. YOU MUST EXPLICITLY IMPORT THEM in the <head> if you need them to make the animation amazing:
  * GSAP: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  * Three.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  * Canvas Confetti: <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  * Matter.js (2D Physics): <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
- Return ONLY raw HTML — ABSOLUTELY NO MARKDOWN CODE FENCES (e.g. no \\\`\\\`\\\`html or \\\`\\\`\\\`), no text explanation. Just the raw <!DOCTYPE html> string.
- The animation must look incredibly premium, colorful, and highly entertaining (this is a party!).
- Keep the background fully transparent or vibrant — avoid dark blacks.
- Animation must endlessly loop or reach a spectacular resting state.
- Ensure all elements fit within the screen bounds (\`body { margin: 0; overflow: hidden; width: 100vw; height: 100vh; }\`).
- DO NOT use alert(), confirm(), prompt(), localStorage, or cookies.

EXAMPLE PIPELINES: 
- For "rain of tacos": Import Matter.js and render physical 2D bodies wrapped in taco emojis bouncing around.
- For "digital rain": Write native canvas code.
- For "spinning text": Import GSAP and build a staggered bouncing letter timeline. Let your creativity run completely wild!`,
    messages: [
      {
        role: 'user',
        content: `Create a funny animation for this prompt: "${userPrompt}"`,
      },
    ],
  });

  let html = message.content[0].text;
  
  // Impregnable extraction: Grabs strictly from <html to </html> ignoring EVERYTHING else
  const lower = html.toLowerCase();
  const startIdx = lower.indexOf('<html');
  const endIdx = lower.lastIndexOf('</html>');
  
  if (startIdx !== -1 && endIdx !== -1) {
    html = '<!DOCTYPE html>\n' + html.substring(startIdx, endIdx + 7);
  } else {
    // Fallback: aggressively strip backticks anywhere if <html> tags are missing
    html = html.replace(/```html/gi, '').replace(/```/g, '').trim();
  }

  // Sanity check
  if (!html.toLowerCase().includes('<html') && !html.toLowerCase().includes('<body')) {
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
