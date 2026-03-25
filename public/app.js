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

const LOTTIE_URLS = [
  { name: 'Confetti', url: 'https://assets9.lottiefiles.com/packages/lf20_U10l2e.json' },
  { name: 'Rocket Launch', url: 'https://assets2.lottiefiles.com/packages/lf20_touohxv0.json' },
  { name: 'Party Time', url: 'https://assets3.lottiefiles.com/packages/lf20_aBYm0U.json' },
  { name: 'Dancing Taco', url: 'https://assets5.lottiefiles.com/packages/lf20_s0g2b0.json' },
  { name: 'Fireworks', url: 'https://assets8.lottiefiles.com/packages/lf20_igjhxt9f.json' }
];

const CARD_THEMES = 6;

// ── State ─────────────────────────────────────────────────────────────────────
let currentNickname = localStorage.getItem(STORAGE_KEY) || '';
let previewedAnimation = null;
let selectedLottieHtml = null;
let editModeId = null; 
let ownedIds = JSON.parse(localStorage.getItem(OWNERSHIP_KEY) || '[]');
let loadedMessages = []; // Track to rebuild snapshots easily

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

// New DOM Refs for Toggle/Gallery
const animTypeRadios   = document.querySelectorAll('input[name="anim-type"]');
const aiPromptGroup    = $('ai-prompt-group');
const galleryGroup     = $('gallery-group');
const lottieGallery    = $('lottie-gallery');

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

function buildLottieHtml(url) {
  return `<!DOCTYPE html><html><head>
<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>
<style>body{margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;background:transparent;}</style>
</head><body>
<dotlottie-player src="${url}" background="transparent" speed="1" style="width:100%;height:100%;" loop autoplay></dotlottie-player>
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
  lottieGallery.innerHTML = LOTTIE_URLS.map((lot, idx) => `
    <div class="lottie-item" data-url="${lot.url}" data-idx="${idx}">
      <div style="position:absolute; bottom:5px; width:100%; text-align:center; font-size:10px; font-weight:bold; color:#555; z-index:10; pointer-events:none;">${lot.name}</div>
      <iframe srcdoc='${buildLottieHtml(lot.url)}'></iframe>
    </div>
  `).join('');

  document.querySelectorAll('.lottie-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.lottie-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      const url = item.getAttribute('data-url');
      selectedLottieHtml = buildLottieHtml(url);
      btnPost.disabled = false; 
    });
  });
}
initGallery();

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
}

function buildCard(msg, index) {
  const avatar  = escapeHtml(avatarFor(msg.nickname));
  const theme   = themeFor(index);
  const nick    = escapeHtml(msg.nickname);
  const message = escapeHtml(msg.message);
  const prompt  = escapeHtml(msg.animationPrompt);
  const time    = formatTime(msg.timestamp);

  const isOwner = ownedIds.includes(msg.id);

  let actionsHtml = `
    <div class="card-actions">
      <button class="btn-action" onclick="downloadSnapshot('${msg.id}')">💾 Snapshot</button>
  `;
  if (isOwner) {
    actionsHtml += `
      <div style="flex:1"></div>
      <button class="btn-action" onclick="editMessage('${msg.id}')">✏️ Edit</button>
      <button class="btn-action delete" onclick="deleteMessage('${msg.id}')">🗑️ Delete</button>
    `;
  }
  actionsHtml += `</div>`;

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
        ${actionsHtml}
      </div>
    </article>
  `;
}

// ── Card Action Handlers ───────────────────────────────────────────────────────
window.deleteMessage = async (id) => {
  if (!confirm('Are you sure you want to delete this message?')) return;
  try {
    const res = await fetch(\`/api/messages/\${id}\`, { method: 'DELETE' });
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

  // For simplicity, force AI toggle on edit to let them see prompt. 
  // If we wanted we could select gallery, but AI prompt is easiest fallback.
  animTypeRadios[0].click(); 
  animPrompt.value = msg.animationPrompt === 'Gallery Selection' ? '' : msg.animationPrompt;
  
  if (msg.animation) {
    previewedAnimation = msg.animation;
    previewIframe.srcdoc = msg.animation;
    previewArea.style.display = 'block';
    btnPost.disabled = false;
  }
};

window.downloadSnapshot = (id) => {
  const msg = loadedMessages.find(m => m.id === id);
  if (!msg || !msg.animation) return showToast('Cannot snapshot this card.');

  let html = msg.animation;
  const safeNick = escapeHtml(msg.nickname);
  const safeMsg = escapeHtml(msg.message).replace(/\n/g, '<br>');

  const overlayHtml = \`
    <div style="position:fixed; bottom:20px; left:20px; right:20px; background:rgba(255,255,255,0.95); padding:15px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.15); font-family:sans-serif; text-align:center; z-index:999999; backdrop-filter:blur(5px); border:1px solid rgba(0,0,0,0.1);">
      <h3 style="margin:0 0 5px 0; color:#333; font-size:18px;">From: \${safeNick}</h3>
      <p style="margin:0; color:#555; font-size:14px; line-height:1.4;">\${safeMsg}</p>
    </div>
  \`;

  if (html.toLowerCase().includes('</body>')) {
    html = html.replace('</body>', overlayHtml + '</body>');
  } else {
    html += overlayHtml; 
  }

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`FarewellCard_\${safeNick.replace(/[^A-Za-z0-9]/g, '_')}.html\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Snapshot downloaded! 🎉');
};

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
    showModalError(\`Animation failed: \${err.message}\`);
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
      nickname: currentNickname, // PUT doesn't technically update nickname right now, but fine to send
      message,
    };
    
    if (isAi) {
      payload.animationPrompt = prompt;
      payload.customAnimationHtml = previewedAnimation; // Send what we already generated! Avoid double-generating.
    } else {
      payload.customAnimationHtml = selectedLottieHtml;
    }

    const url = editModeId ? \`/api/messages/\${editModeId}\` : '/api/messages';
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
    showModalError(\`Couldn't save: \${err.message}\`);
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
