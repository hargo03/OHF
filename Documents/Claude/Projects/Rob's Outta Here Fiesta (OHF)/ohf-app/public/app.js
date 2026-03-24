/* ═══════════════════════════════════════════════════
   Rob's Outta Here Fiesta — Frontend App
   OHF.theghari.com
═══════════════════════════════════════════════════ */

'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ohf_nickname';

const AVATARS = [
  '🎭','🦄','🐉','🦊','🐸','🦁','🐼','🦋','🐬','🦅',
  '🌮','🍕','🎸','🚀','⚡','🌈','💎','🎲','🏆','🎯',
  '🦩','🐙','🍄','🎪','🤖','🦸','🧙','🐝','🦀','🌵',
];

const CARD_THEMES = 6; // matches .card-theme-0 through .card-theme-5

// ── State ─────────────────────────────────────────────────────────────────────
let currentNickname = localStorage.getItem(STORAGE_KEY) || '';
let previewedAnimation = null; // stores the last generated animation HTML

// ── DOM References ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screenSignin     = $('screen-signin');
const screenWall       = $('screen-wall');
const nicknameInput    = $('nickname-input');
const btnSignin        = $('btn-signin');
const userNameDisplay  = $('user-name-display');
const btnAddMessage    = $('btn-add-message');
const btnSignout       = $('btn-signout');
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

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Simple djb2 hash for consistent emoji avatar selection */
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
  return str
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

let toastTimer;
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
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

// ── Screen Management ─────────────────────────────────────────────────────────
function showSignin() {
  screenWall.classList.remove('active');
  screenSignin.classList.add('active');
  // Pre-fill nickname if we have one
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
    const msgs = await res.json();
    renderMessages(msgs);
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

  // Inject iframe content after DOM is ready
  msgs.forEach(m => {
    const iframe = document.querySelector(`[data-id="${m.id}"] iframe`);
    if (iframe && m.animation) {
      iframe.srcdoc = m.animation;
    }
  });
}

function buildCard(msg, index) {
  const avatar  = escapeHtml(avatarFor(msg.nickname));
  const theme   = themeFor(index);
  const nick    = escapeHtml(msg.nickname);
  const message = escapeHtml(msg.message);
  const prompt  = escapeHtml(msg.animationPrompt);
  const time    = formatTime(msg.timestamp);

  return `
    <article class="message-card ${theme}" data-id="${msg.id}">
      <div class="card-header">
        <div class="card-avatar">${avatar}</div>
        <span class="card-nickname">${nick}</span>
        <span class="card-time">${time}</span>
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
      </div>
    </article>
  `;
}

// ── Modal: Open / Close ───────────────────────────────────────────────────────
function openModal() {
  resetModal();
  modalOverlay.style.display = 'flex';
  msgText.focus();
}

function closeModal() {
  modalOverlay.style.display = 'none';
}

window.openModal = openModal; // expose for empty-state button

btnAddMessage.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function resetModal() {
  msgText.value          = '';
  animPrompt.value       = '';
  msgChar.textContent    = '0';
  previewedAnimation     = null;
  previewArea.style.display  = 'none';
  modalLoading.style.display = 'none';
  modalError.style.display   = 'none';
  btnPost.disabled           = true;
  previewIframe.srcdoc       = '';
}

// Character counter
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

// ── Modal: Post Message ───────────────────────────────────────────────────────
btnPost.addEventListener('click', async () => {
  const message = msgText.value.trim();
  const prompt  = animPrompt.value.trim();

  if (!message) {
    msgText.focus();
    return showToast('⚠️ Please write a message for Rob!');
  }
  if (!previewedAnimation) {
    return showToast('⚠️ Please preview your animation first!');
  }

  setModalLoading(true, 'Posting your message to the wall… 🚀');
  hideModalError();
  btnPost.disabled = true;

  try {
    const res  = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: currentNickname,
        message,
        animationPrompt: prompt,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to post message');

    closeModal();
    showToast('Your message is on the wall! 🎉🎉🎉', 4000);
    await loadMessages();
  } catch (err) {
    showModalError(`Couldn't post: ${err.message}`);
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
