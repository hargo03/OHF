/* ═══════════════════════════════════════════════════
   Rob's Outta Here Fiesta — Frontend App
   OHF.theghari.com
═══════════════════════════════════════════════════ */

'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ohf_nickname';
const OWNERSHIP_KEY = 'ohf_my_ids';

const AVATARS = [
  '🎭','🦄','🐉','🦊','🐸','🦁','🐼','🦋','🐬','🦅',
  '🌮','🍕','🎸','🚀','⚡','🌈','💎','🎲','🏆','🎯',
  '🦩','🐙','🍄','🎪','🤖','🦸','🧙','🐝','🦀','🌵',
];

const GIF_URLS = [
  { name: 'Confetti', url: 'https://media.giphy.com/media/l2JHRhAtnJSDNJ2py/giphy.gif' },
  { name: 'Party Minions', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
  { name: 'Carlton Dance', url: 'https://media.giphy.com/media/11sBLVxIRvnAwe/giphy.gif' },
  { name: 'Crying Goodbye', url: 'https://media.giphy.com/media/xT0Gqjym2cZMIj4HxC/giphy.gif' },
  { name: 'Michael Scott', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { name: 'Balloons', url: 'https://media.giphy.com/media/l0HlAL5R9Jv9hJ5UA/giphy.gif' },
  { name: 'Spongebob Party', url: 'https://media.giphy.com/media/nDSlfqf0GN5PANIRPK/giphy.gif' },
  { name: 'Happy Dog', url: 'https://media.giphy.com/media/3o7QSPx34WzJ2QJmQo/giphy.gif' },
  { name: 'Sad Cat', url: 'https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif' },
  { name: 'Farewell Salute', url: 'https://media.giphy.com/media/l4pMattUYTTM7qpIk/giphy.gif' },
  { name: 'Bye Bear', url: 'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif' },
  { name: 'Doge Wave', url: 'https://media.giphy.com/media/HcjKo8qQ8H5l4hEQ1n/giphy.gif' },
  { name: 'Miss You', url: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif' },
  { name: 'Hugging', url: 'https://media.giphy.com/media/l8ooOxhcItowwLPuZn/giphy.gif' },
  { name: 'Dance Off', url: 'https://media.giphy.com/media/wAxlCmeX1ri1y/giphy.gif' },
  { name: 'Kermit Dance', url: 'https://media.giphy.com/media/QSTpQ1tW6Wqf8iFjXb/giphy.gif' },
  { name: 'Peace Out', url: 'https://media.giphy.com/media/fSSbirL3Ew0zC/giphy.gif' },
  { name: 'Rolling Away', url: 'https://media.giphy.com/media/T8n0h3G6oQZpK/giphy.gif' },
  { name: 'Bawling', url: 'https://media.giphy.com/media/2rtQMJvhzOnRe/giphy.gif' },
  { name: 'Cat Party', url: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif' }
];

const CARD_THEMES = 6;

// To ensure 50 guaranteed offline-cached options without rate-limits!
const EXTRA_GIFS = [
  "https://cdn2.thecatapi.com/images/2n.gif", "https://cdn2.thecatapi.com/images/12r.gif",
  "https://cdn2.thecatapi.com/images/3qm.gif", "https://cdn2.thecatapi.com/images/4bo.gif",
  "https://cdn2.thecatapi.com/images/4gq.gif", "https://cdn2.thecatapi.com/images/4li.gif",
  "https://cdn2.thecatapi.com/images/4tg.gif", "https://cdn2.thecatapi.com/images/MTcxMjU0MQ.gif",
  "https://cdn2.thecatapi.com/images/MTc1Nzk4OA.gif", "https://cdn2.thecatapi.com/images/MTc2MjA2NA.gif",
  "https://media.giphy.com/media/l2JHRhAtnJSDNJ2py/giphy.gif", "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
  "https://media.giphy.com/media/11sBLVxIRvnAwe/giphy.gif", "https://media.giphy.com/media/xT0Gqjym2cZMIj4HxC/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", "https://media.giphy.com/media/l0HlAL5R9Jv9hJ5UA/giphy.gif",
  "https://media.giphy.com/media/nDSlfqf0GN5PANIRPK/giphy.gif", "https://media.giphy.com/media/3o7QSPx34WzJ2QJmQo/giphy.gif",
  "https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif", "https://media.giphy.com/media/l4pMattUYTTM7qpIk/giphy.gif",
  "https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif", "https://media.giphy.com/media/HcjKo8qQ8H5l4hEQ1n/giphy.gif",
  "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", "https://media.giphy.com/media/l8ooOxhcItowwLPuZn/giphy.gif",
  "https://media.giphy.com/media/wAxlCmeX1ri1y/giphy.gif", "https://media.giphy.com/media/QSTpQ1tW6Wqf8iFjXb/giphy.gif",
  "https://media.giphy.com/media/fSSbirL3Ew0zC/giphy.gif", "https://media.giphy.com/media/T8n0h3G6oQZpK/giphy.gif",
  "https://media.giphy.com/media/2rtQMJvhzOnRe/giphy.gif", "https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif"
];
EXTRA_GIFS.forEach((url, i) => {
  GIF_URLS.push({ name: 'Extra Reaction ' + (i + 1), url: url });
});

// ── State ─────────────────────────────────────────────────────────────────────
let currentNickname = localStorage.getItem(STORAGE_KEY) || '';
let previewedAnimation = null;
let selectedLottieHtml = null;
let editModeId = null; 
let ownedIds = JSON.parse(localStorage.getItem(OWNERSHIP_KEY) || '[]');
let loadedMessages = []; // Track to rebuild snapshots easily
let currentGifPage = 0;
const GIFS_PER_PAGE = 5;

// ── DOM References ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screenSignin     = $('screen-signin');
const screenWall       = $('screen-wall');
const nicknameInput    = $('nickname-input');
const btnSignin        = $('btn-signin');
const userNameDisplay  = $('user-name-display');
const btnAddMessage    = $('btn-add-message');
const btnSignout       = $('btn-signout');
const btnSaveWall      = $('btn-save-wall');
const stateLoading     = $('state-loading');
const stateEmpty       = $('state-empty');
const stateError       = $('state-error');
const errorText        = $('error-text');
const messagesGrid     = $('messages-grid');
const modalOverlay     = $('modal-overlay');
const btnCloseModal    = $('btn-close-modal');
const msgText          = $('msg-text');
const msgChar          = $('msg-char');
const animPrompt       = $('anim-prompt');
const btnPreview       = $('btn-preview');
const btnPost          = $('btn-post');
const previewArea      = $('preview-area');
const previewIframe    = $('preview-iframe');
const modalLoading     = $('modal-loading');
const modalLoadingText = $('modal-loading-text');
const modalError       = $('modal-error');
const modalErrorText   = $('modal-error-text');
const confettiCanvas   = $('confetti-canvas');
const toast            = $('toast');

// New DOM Refs for Toggle/Gallery
const animTypeRadios   = document.querySelectorAll('input[name="anim-type"]');
const aiPromptGroup    = $('ai-prompt-group');
const galleryGroup     = $('gallery-group');
const lottieGallery    = $('lottie-gallery');
const btnPrevGallery   = $('btn-prev-gallery');
const btnNextGallery   = $('btn-next-gallery');

// ── Utilities ─────────────────────────────────────────────────────────────────
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h);
}

function avatarFor(nickname) {
  return AVATARS[hashStr(nickname) % AVATARS.length];
}

function themeFor(index) {
  return `card-theme-${index % CARD_THEMES}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function saveOwnedId(id) {
  if (!ownedIds.includes(id)) {
    ownedIds.push(id);
    localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(ownedIds));
  }
}

let toastTimer;
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function buildGifHtml(url) {
  return `<!DOCTYPE html><html><head>
<style>body{margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;background:transparent;}</style>
</head><body>
<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
</body></html>`;
}

// ── Confetti Background ───────────────────────────────────────────────────────
(function initConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const COLORS = ['#FF6B9D','#FFE66D','#4ECDC4','#6C63FF','#FF6B6B','#A8E6CF','#FFC3A0'];
  let pieces = [];

  function resize() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makePiece() {
    return {
      x:    Math.random() * confettiCanvas.width,
      y:    Math.random() * confettiCanvas.height - confettiCanvas.height,
      w:    Math.random() * 10 + 5,
      h:    Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy:   Math.random() * 1.5 + 0.8,
      vx:   Math.random() * 1.5 - 0.75,
      rot:  Math.random() * 360,
      rotV: Math.random() * 4 - 2,
      opacity: Math.random() * 0.6 + 0.3,
    };
  }

  for (let i = 0; i < 120; i++) pieces.push(makePiece());

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (const p of pieces) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y   += p.vy;
      p.x   += p.vx;
      p.rot += p.rotV;
      if (p.y > confettiCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * confettiCanvas.width;
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── Init Lottie Gallery ────────────────────────────────────────────────────────
function initGallery() {
  const startIdx = currentGifPage * GIFS_PER_PAGE;
  const selectedGifs = GIF_URLS.slice(startIdx, startIdx + GIFS_PER_PAGE);

  lottieGallery.innerHTML = selectedGifs.map((gif, idx) => `
    <div class="lottie-item" data-url="${gif.url}" data-idx="${startIdx + idx}">
      <div style="position:absolute; bottom:5px; width:100%; text-align:center; font-size:10px; font-weight:bold; color:white; text-shadow:0px 0px 3px black; z-index:10; pointer-events:none;">${gif.name}</div>
      <iframe srcdoc='${buildGifHtml(gif.url)}'></iframe>
    </div>
  `).join('');

  document.querySelectorAll('.lottie-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.lottie-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      const url = item.getAttribute('data-url');
      selectedLottieHtml = buildGifHtml(url);
      btnPost.disabled = false; 
    });
  });

  if (btnPrevGallery) btnPrevGallery.disabled = currentGifPage === 0;
  if (btnNextGallery) btnNextGallery.disabled = startIdx + GIFS_PER_PAGE >= GIF_URLS.length;
}
initGallery();
if (btnPrevGallery) {
  btnPrevGallery.addEventListener('click', () => {
    if (currentGifPage > 0) { currentGifPage--; initGallery(); }
  });
}
if (btnNextGallery) {
  btnNextGallery.addEventListener('click', () => {
    if ((currentGifPage + 1) * GIFS_PER_PAGE < GIF_URLS.length) { currentGifPage++; initGallery(); }
  });
}

animTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.value === 'ai') {
      aiPromptGroup.style.display = 'block';
      galleryGroup.style.display = 'none';
      btnPreview.style.display = 'inline-block';
      selectedLottieHtml = null;
      btnPost.disabled = !previewedAnimation;
    } else {
      aiPromptGroup.style.display = 'none';
      galleryGroup.style.display = 'block';
      btnPreview.style.display = 'none';
      previewArea.style.display = 'none';
      btnPost.disabled = !selectedLottieHtml;
    }
  });
});

// ── Screen Management ─────────────────────────────────────────────────────────
function showSignin() {
  screenWall.classList.remove('active');
  screenSignin.classList.add('active');
  if (currentNickname) nicknameInput.value = currentNickname;
  nicknameInput.focus();
}

function showWall() {
  screenSignin.classList.remove('active');
  screenWall.classList.add('active');
  userNameDisplay.textContent = currentNickname;
  loadMessages();
}

// ── Sign-in Flow ──────────────────────────────────────────────────────────────
function handleSignin() {
  const name = nicknameInput.value.trim();
  if (!name) {
    nicknameInput.focus();
    nicknameInput.style.borderColor = '#FF6B6B';
    setTimeout(() => (nicknameInput.style.borderColor = ''), 1200);
    return;
  }
  currentNickname = name;
  localStorage.setItem(STORAGE_KEY, name);
  showWall();
  showToast(`Welcome to the party, ${name}! 🎉`);
}

btnSignin.addEventListener('click', handleSignin);
nicknameInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSignin(); });

btnSignout.addEventListener('click', () => {
  closeModal();
  showSignin();
});

// ── Load Messages ─────────────────────────────────────────────────────────────
async function loadMessages() {
  setWallState('loading');
  try {
    const res  = await fetch('/api/messages');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    loadedMessages = await res.json();
    renderMessages(loadedMessages);
  } catch (err) {
    errorText.textContent = `Couldn't load messages: ${err.message}`;
    setWallState('error');
  }
}

function setWallState(state) {
  stateLoading.style.display = state === 'loading' ? 'flex' : 'none';
  stateEmpty.style.display   = state === 'empty'   ? 'flex' : 'none';
  stateError.style.display   = state === 'error'   ? 'flex' : 'none';
  messagesGrid.style.display = state === 'messages' ? 'grid' : 'none';
}

function renderMessages(msgs) {
  if (!msgs || msgs.length === 0) {
    setWallState('empty');
    return;
  }
  messagesGrid.innerHTML = msgs.map((m, i) => buildCard(m, i)).join('');
  setWallState('messages');

  msgs.forEach(m => {
    const iframe = document.querySelector(`[data-id="${m.id}"] iframe`);
    if (iframe && m.animation) {
      iframe.srcdoc = m.animation;
    }
  });

  attachDragListeners();
  updateCanvasHeight();
}

function updateCanvasHeight() {
  const container = document.querySelector('.messages-grid');
  if (!container) return;
  let maxBottom = window.innerHeight; // minimum viewport height
  document.querySelectorAll('.message-card').forEach(c => {
    const bottom = c.offsetTop + c.offsetHeight;
    if (bottom > maxBottom) maxBottom = bottom;
  });
  container.style.height = `${maxBottom + 300}px`; // Give extra runway
}

function attachDragListeners() {
  const cards = document.querySelectorAll('.message-card');
  const container = document.querySelector('.messages-grid');
  if (!container) return;
  
  cards.forEach(card => {
    let startX, startY, initialLeft, initialTop;
    
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.target.tagName.toLowerCase() === 'button') return;
      if (e.target.tagName.toLowerCase() === 'iframe') return; // let iframes scroll/click if needed, though they have pointer-events auto
      
      const containerRect = container.getBoundingClientRect();
      
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = card.offsetLeft;
      initialTop = card.offsetTop;
      
      card.setPointerCapture(e.pointerId);
      card.style.transition = 'none'; 
      
      const onMove = (ev) => {
        let newX = initialLeft + (ev.clientX - startX);
        let newY = initialTop + (ev.clientY - startY);
        
        const maxW = containerRect.width - card.offsetWidth;
        if (newX < 0) newX = 0; if (newX > maxW) newX = maxW;
        if (newY < 0) newY = 0; 
        
        card.style.left = `${newX}px`;
        card.style.top = `${newY}px`;
      };
      
      const onUp = async (ev) => {
        card.releasePointerCapture(e.pointerId);
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerup', onUp);
        
        card.style.transition = '';
        
        const finalLeftPerc = (card.offsetLeft / containerRect.width) * 100;
        const finalTopPx = card.offsetTop;
        card.style.left = `${finalLeftPerc}%`;
        card.style.top = `${finalTopPx}px`;
        
        updateCanvasHeight();

        const id = card.getAttribute('data-id');
        try {
          await fetch(`/api/messages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: finalLeftPerc, y: finalTopPx })
          });
        } catch (err) {
          console.error('Failed to save pos:', err);
        }
      };
      
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerup', onUp);
    });
  });
}

function buildCard(msg, index) {
  const avatar  = escapeHtml(avatarFor(msg.nickname));
  const theme   = themeFor(index);
  const nick    = escapeHtml(msg.nickname);
  const message = escapeHtml(msg.message);
  const prompt  = escapeHtml(msg.animationPrompt);
  const time    = formatTime(msg.timestamp);

  // X keeps %, Y uses absolute PX for infinite vertical expansion
  const x = msg.x != null ? msg.x : (Math.random() * 70 + 5);
  let y = msg.y;
  if (y == null) {
      const container = document.querySelector('.messages-grid');
      const maxH = container ? Math.max(container.offsetHeight, window.innerHeight) : window.innerHeight;
      y = Math.random() * (maxH - 300) + 50; 
  }

  const isOwner = ownedIds.includes(msg.id);

  let actionsHtml = isOwner ? `
    <div class="card-actions">
      <div style="flex:1"></div>
      <button class="btn-action" onclick="editMessage('${msg.id}')">✏️ Edit</button>
      <button class="btn-action delete" onclick="deleteMessage('${msg.id}')">🗑️ Delete</button>
    </div>
  ` : '';

  const reactions = msg.reactions || { fire: 0, heart: 0, sad: 0 };
  const replies = msg.replies || [];
  
  let dominantClass = '';
  if (reactions.fire > reactions.heart && reactions.fire > reactions.sad) dominantClass = 'rx-fire';
  else if (reactions.heart > reactions.fire && reactions.heart > reactions.sad) dominantClass = 'rx-heart';
  else if (reactions.sad > reactions.fire && reactions.sad > reactions.heart) dominantClass = 'rx-sad';
  
  const repliesHtml = replies.map(r => `
    <div class="reply-item">
      <div class="reply-author">${escapeHtml(r.author)}</div>
      <div class="reply-text">${escapeHtml(r.text)}</div>
    </div>
  `).join('');

  return `
    <article class="message-card ${theme} ${dominantClass}" data-id="${msg.id}" style="left: ${x}%; top: ${y}px;">
      <div class="card-inner">
        <div class="card-front">
          <div class="card-header">
            <div class="card-avatar">${avatar}</div>
            <span class="card-nickname">${nick}</span>
            <span class="card-time">${time}</span>
            <button class="btn-action" onclick="flipCard('${msg.id}')" title="Replies" style="margin-left:auto; background:none; border:none; padding:0; font-size:1.1rem; opacity:0.8;">💬 ${replies.length}</button>
          </div>
          <iframe
            class="card-anim"
            sandbox="allow-scripts"
            title="Animation by ${nick}"
            scrolling="no"
            loading="lazy"
          ></iframe>
          <div class="card-body">
            <p class="card-message">${message}</p>
            <span class="card-prompt-tag">🎨 ${prompt}</span>
            ${actionsHtml}
          </div>
          <div class="card-stickers">
            <button class="sticker-btn" onclick="reactCard('${msg.id}', 'heart')">❤️ <span>${reactions.heart}</span></button>
            <button class="sticker-btn" onclick="reactCard('${msg.id}', 'fire')">🔥 <span>${reactions.fire}</span></button>
            <button class="sticker-btn" onclick="reactCard('${msg.id}', 'sad')">😢 <span>${reactions.sad}</span></button>
          </div>
        </div>
        <div class="card-back">
          <div class="card-header" style="background:var(--purple); color:white; border-radius:0;">
            <span class="card-nickname">Thread for ${nick}</span>
            <button class="btn-action" onclick="flipCard('${msg.id}')" style="margin-left:auto; background:none; border:none; color:white; font-size:1.1rem; padding:0;">✕</button>
          </div>
          <div class="replies-list">
            ${repliesHtml ? repliesHtml : '<p style="color:#999; font-size:0.9rem; text-align:center; padding-top:20px;">No replies yet. Be the first!</p>'}
          </div>
          <div class="reply-input-area">
            <input type="text" id="reply-text-${msg.id}" placeholder="Type a reply..." autocomplete="off">
            <button onclick="postReply('${msg.id}')">Post</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ── Card Action Handlers ───────────────────────────────────────────────────────
window.deleteMessage = async (id) => {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Message deleted! 🗑️');
    loadMessages();
  } catch (err) {
    showToast('Failed to delete message: ' + err.message);
  }
};

window.editMessage = (id) => {
  const msg = loadedMessages.find(m => m.id === id);
  if (!msg) return;
  editModeId = id;
  openModal();
  
  msgText.value = msg.message;
  msgChar.textContent = msg.message.length;
  
  $('modal-title').textContent = 'Edit Your Message ✏️';
  btnPost.innerHTML = '💾 Save Changes';

  animTypeRadios[0].click(); 
  animPrompt.value = msg.animationPrompt === 'Gallery Selection' ? '' : msg.animationPrompt;
  
  if (msg.animation) {
    previewedAnimation = msg.animation;
    previewIframe.srcdoc = msg.animation;
    previewArea.style.display = 'block';
    btnPost.disabled = false;
  }
};

// ── Download Wall Snapshot ───────────────────────────────────────────────────
btnSaveWall.addEventListener('click', async () => {
  btnSaveWall.disabled = true;
  btnSaveWall.textContent = 'Saving...';
  
  try {
    const cssRes = await fetch('style.css');
    const cssText = await cssRes.text();
    
    let gridHtml = '';
    loadedMessages.forEach((msg, i) => {
      const avatar  = escapeHtml(avatarFor(msg.nickname));
      const theme   = themeFor(i);
      const nick    = escapeHtml(msg.nickname);
      const message = escapeHtml(msg.message).replace(/\n/g, '<br>');
      const prompt  = escapeHtml(msg.animationPrompt);
      const time    = formatTime(msg.timestamp);
      
      const x = msg.x != null ? msg.x : 10;
      const y = msg.y != null ? msg.y : 50;

      const encodedAnim = btoa(unescape(encodeURIComponent(msg.animation)));
      
      gridHtml += `
        <article class="message-card ${theme}" style="left: ${x}%; top: ${y}px;">
          <div class="card-header">
            <div class="card-avatar">${avatar}</div>
            <span class="card-nickname">${nick}</span>
            <span class="card-time">${time}</span>
          </div>
          <iframe class="card-anim" scrolling="no" src="data:text/html;base64,${encodedAnim}"></iframe>
          <div class="card-body">
            <p class="card-message">${message}</p>
            <span class="card-prompt-tag">🎨 ${prompt}</span>
          </div>
        </article>
      `;
    });

    const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Rob's Outta Here Fiesta - Saved Wall</title>
<style>${cssText}</style>
<style>
  body { background: #fdfcff; overflow-y: auto; padding: 40px 20px; }
  .screen { display: block; position: relative; }
  .wall-header { margin-bottom: 30px; }
  .header-actions { display: none; }
</style>
</head>
<body>
  <div class="screen active">
    <header class="wall-header">
      <div class="header-inner">
        <div class="header-title">
          <span class="header-emoji">🎉</span>
          <h1>Rob's Outta Here Fiesta!</h1>
        </div>
      </div>
    </header>
    <main class="wall-main">
      <div class="messages-grid" style="display:grid;">
        ${gridHtml}
      </div>
    </main>
  </div>
</body>
</html>`;

    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Robs_Fiesta_Wall.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Wall snapshot downloaded! 🎉');
  } catch (err) {
    showToast('Error saving wall: ' + err.message);
  } finally {
    btnSaveWall.disabled = false;
    btnSaveWall.innerHTML = '💾 Save Wall';
  }
});


// ── Modal: Open / Close ───────────────────────────────────────────────────────
function openModal() {
  resetModal();
  modalOverlay.style.display = 'flex';
  msgText.focus();
}

function closeModal() {
  modalOverlay.style.display = 'none';
  editModeId = null;
  $('modal-title').textContent = 'Leave Rob a Message! 🎊';
  btnPost.innerHTML = '📮 Post to the Wall!';
}

window.openModal = openModal;

btnAddMessage.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function resetModal() {
  msgText.value          = '';
  animPrompt.value       = '';
  msgChar.textContent    = '0';
  previewedAnimation     = null;
  selectedLottieHtml     = null;
  previewArea.style.display  = 'none';
  modalLoading.style.display = 'none';
  modalError.style.display   = 'none';
  btnPost.disabled           = true;
  previewIframe.srcdoc       = '';
  animTypeRadios[0].click(); // Reset to AI default
  document.querySelectorAll('.lottie-item').forEach(el => el.classList.remove('selected'));
}

msgText.addEventListener('input', () => {
  msgChar.textContent = msgText.value.length;
});

// ── Modal: Preview Animation ──────────────────────────────────────────────────
btnPreview.addEventListener('click', async () => {
  const prompt = animPrompt.value.trim();
  if (!prompt) {
    animPrompt.focus();
    animPrompt.style.borderColor = '#FF6B6B';
    setTimeout(() => (animPrompt.style.borderColor = ''), 1200);
    return;
  }

  setModalLoading(true, 'Claude is conjuring your animation… ✨');
  hideModalError();
  previewArea.style.display = 'none';
  btnPost.disabled = true;

  try {
    const res  = await fetch('/api/preview-animation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate animation');

    previewedAnimation     = data.animation;
    previewIframe.srcdoc   = data.animation;
    previewArea.style.display = 'block';
    btnPost.disabled = false;
    showToast('Animation ready! 🎬 Check the preview!');
  } catch (err) {
    showModalError(`Animation failed: ${err.message}`);
  } finally {
    setModalLoading(false);
  }
});

// ── Modal: Post / Edit Message ────────────────────────────────────────────────
btnPost.addEventListener('click', async () => {
  const message = msgText.value.trim();
  const prompt  = animPrompt.value.trim();
  const isAi = document.querySelector('input[name="anim-type"]:checked').value === 'ai';

  if (!message) {
    msgText.focus();
    return showToast('⚠️ Please write a message for Rob!');
  }
  
  if (isAi && !previewedAnimation && !editModeId) {
    return showToast('⚠️ Please preview your animation first!');
  }
  if (!isAi && !selectedLottieHtml) {
    return showToast('⚠️ Please select a gallery animation!');
  }

  setModalLoading(true, editModeId ? 'Updating message…' : 'Posting your message to the wall… 🚀');
  hideModalError();
  btnPost.disabled = true;

  try {
    const payload = {
      nickname: currentNickname, 
      message,
    };
    
    if (isAi) {
      payload.animationPrompt = prompt;
      payload.customAnimationHtml = previewedAnimation; 
    } else {
      payload.customAnimationHtml = selectedLottieHtml;
    }

    const url = editModeId ? `/api/messages/${editModeId}` : '/api/messages';
    const method = editModeId ? 'PUT' : 'POST';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save message');

    // Save ownership for new messages
    if (!editModeId) saveOwnedId(data.id);

    closeModal();
    showToast(editModeId ? 'Message updated! ✨' : 'Your message is on the wall! 🎉🎉🎉', 4000);
    await loadMessages();
  } catch (err) {
    showModalError(`Couldn't save: ${err.message}`);
    btnPost.disabled = false;
  } finally {
    setModalLoading(false);
  }
});

// ── Modal Helpers ─────────────────────────────────────────────────────────────
function setModalLoading(active, text = '') {
  modalLoading.style.display = active ? 'flex' : 'none';
  if (text) modalLoadingText.textContent = text;
  btnPreview.disabled = active;
}

function showModalError(msg) {
  modalErrorText.textContent = msg;
  modalError.style.display = 'block';
}

function hideModalError() {
  modalError.style.display = 'none';
}

// ── Boot ──────────────────────────────────────────────────────────────────────
if (currentNickname) {
  showWall();
} else {
  showSignin();
}

// ── Ultimate Expansion Hooks ──────────────────────────────────────────────────
const btnPrintWall = document.getElementById('btn-print-wall');
if(btnPrintWall) btnPrintWall.addEventListener('click', () => window.print());

const GOLDEN_PROMPTS = [
  "A Matrix digital rain of the word GOODBYE",
  "A retro 90s synthwave sports car driving into a neon sunset",
  "A pixel art rocket ship launching into starry space",
  "A bouncy DVD logo hitting the corner of the screen",
  "A hilarious ragdoll physics character falling down endless stairs",
  "Confetti explosion with dancing tacos and a disco ball"
];
const btnSurprise = document.getElementById('btn-surprise-prompt');
if(btnSurprise) btnSurprise.addEventListener('click', (e) => {
  e.preventDefault();
  animPrompt.value = GOLDEN_PROMPTS[Math.floor(Math.random() * GOLDEN_PROMPTS.length)];
});

const wireSpice = (id, flavor) => {
  const btn = document.getElementById(id);
  if(!btn) return;
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = msgText.value.trim();
    if(!text) return showToast('Type a message first to spice it up! 🌶️', 3000);
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳...';
    btn.disabled = true;
    try {
      const res = await fetch('/api/spice', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ text, flavor })
      });
      const data = await res.json();
      if(res.ok && data.spicedText) {
        msgText.value = data.spicedText;
        msgChar.textContent = msgText.value.length;
      } else {
        showToast(data.error || 'Failed to spice message.', 3000);
      }
    } catch(err) {
      showToast('Network error spicing message.', 3000);
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
  });
};
wireSpice('btn-spice-roast', 'roast');
wireSpice('btn-spice-hype', 'hype');
wireSpice('btn-spice-pirate', 'pirate');

// Inline UI Handlers via globals
window.flipCard = (id) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if(el) el.classList.toggle('flipped');
};

window.reactCard = async (id, type) => {
  try {
    const res = await fetch(`/api/messages/${id}/react`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if(res.ok) loadMessages();
  } catch(e) {}
};

window.postReply = async (id) => {
  const input = document.getElementById(`reply-text-${id}`);
  if(!input || !input.value.trim()) return;
  try {
    const res = await fetch(`/api/messages/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: currentNickname || 'Guest', text: input.value.trim() })
    });
    if(res.ok) loadMessages();
  } catch(e) {}
};
