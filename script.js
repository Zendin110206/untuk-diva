// ================= [GLOBAL SCROLL RESET ON RELOAD] =================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  window.scrollTo(0, 0);
});
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// ================= [V7 WELCOME NOTIFICATION ONCE] =================
const notifOverlay = document.getElementById('notif-overlay');
const enterBtn = document.getElementById('enterBtn');
const welcomeKey = 'diva_welcome_seen_v7';

function closeNotif() {
  if (!notifOverlay) return;
  try { localStorage.setItem(welcomeKey, '1'); } catch { }
  
  unlockBgmPlayback();
  
  notifOverlay.classList.add('closing');
  setTimeout(() => {
    notifOverlay.remove();
  }, 520);
}

if (notifOverlay) {
  let seenWelcome = false;
  try { seenWelcome = localStorage.getItem(welcomeKey) === '1'; } catch {}

  if (seenWelcome) {
    notifOverlay.remove();
  } else if (enterBtn) {
    enterBtn.addEventListener('click', closeNotif);
  }
}

// ================= [BGM SWITCH: CH1-CH7 TRACK 1, CH8+ TRACK 2] =================
const bgm1 = document.getElementById('bgm1');
const bgm2 = document.getElementById('bgm2');
const bgmUnlockKey = 'diva_bgm_unlocked_v1';
let bgmUnlocked = false;
let bgmLockedToSecond = false;
let bgmCurrentTrack = 0;
let bgmSectionState = 's0';

function safePlayBgm(el) {
  if (!el) return;
  const playTry = el.play();
  if (playTry && typeof playTry.catch === 'function') {
    playTry.catch(() => {});
  }
}

function switchBgmTrack(track) {
  if (!bgm1 || !bgm2) return;

  if (bgmCurrentTrack === track) {
    if (!bgmUnlocked) return;
    const activeTrack = track === 1 ? bgm1 : bgm2;
    if (activeTrack.paused) safePlayBgm(activeTrack);
    return;
  }

  if (track === 1) {
    bgm2.pause();
    bgm2.currentTime = 0;
    bgmCurrentTrack = 1;
    if (bgmUnlocked) safePlayBgm(bgm1);
    return;
  }

  bgm1.pause();
  bgm1.currentTime = 0;
  bgmCurrentTrack = 2;
  if (bgmUnlocked) safePlayBgm(bgm2);
}

function syncBgmBySection(sectionId = bgmSectionState) {
  if (!bgm1 || !bgm2) return;
  bgmSectionState = sectionId;

  if (sectionId === 'ch8' || sectionId === 'ch9' || sectionId === 'ch10') {
    bgmLockedToSecond = true;
  }

  switchBgmTrack(bgmLockedToSecond ? 2 : 1);
}

function unlockBgmPlayback() {
  bgmUnlocked = true;
  try { localStorage.setItem(bgmUnlockKey, '1'); } catch {}
  syncBgmBySection();
  if (bgmCurrentTrack === 1) safePlayBgm(bgm1);
  if (bgmCurrentTrack === 2) safePlayBgm(bgm2);
}

if (bgm1 && bgm2) {
  bgm1.loop = false;
  bgm2.loop = true;
  bgm1.addEventListener('ended', () => {
    bgmLockedToSecond = true;
    switchBgmTrack(2);
  });
}

window.addEventListener('load', () => {
  let shouldTryAutoplay = false;
  try {
    shouldTryAutoplay =
      localStorage.getItem(bgmUnlockKey) === '1' ||
      localStorage.getItem(welcomeKey) === '1';
  } catch {}

  if (!shouldTryAutoplay) return;
  setTimeout(() => {
    unlockBgmPlayback();
  }, 120);
});

if (enterBtn) {
  enterBtn.addEventListener('click', unlockBgmPlayback);
}
window.addEventListener('pointerdown', unlockBgmPlayback, { once: true });
window.addEventListener('keydown', unlockBgmPlayback, { once: true });
window.addEventListener('wheel', unlockBgmPlayback, { once: true, passive: true });

// ================= [V5 CURSOR] =================
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * .1; ry += (my - ry) * .1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

// ================= [V2 BG STARS] =================
const bgC = document.getElementById('bgCanvas'), bgX = bgC.getContext('2d');
let W, H; const stars = [];
function rsz() { W = bgC.width = window.innerWidth; H = bgC.height = window.innerHeight; }
rsz(); window.addEventListener('resize', rsz);
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random() * 3000,
    y: Math.random() * 2000,
    r: Math.random() * 1.1 + .15,
    a: Math.random() * .5 + .1,
    ph: Math.random() * Math.PI * 2,
    sp: Math.random() * .006 + .002
  });
}
(function drawBg() {
  bgX.clearRect(0, 0, W, H);
  const t = Date.now() * .001;
  stars.forEach(s => {
    const a = s.a * (0.4 + 0.6 * Math.sin(t * s.sp * 25 + s.ph));
    bgX.beginPath(); bgX.arc(s.x % W, s.y % H, s.r, 0, Math.PI * 2);
    bgX.fillStyle = `rgba(240,234,220,${a})`; bgX.fill();
  });
  requestAnimationFrame(drawBg);
})();

// ================= [V2 WHITE PARTICLES] =================
const snC = document.getElementById('snowCanvas'), snX = snC.getContext('2d');
const flakes = [];
for (let i = 0; i < 120; i++) {
  flakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * .9 + .3,
    vx: Math.random() * .4 - .2,
    vy: Math.random() * .5 + .2,
    a: Math.random() * .5 + .15
  });
}
(function drawSnow() {
  snC.width = window.innerWidth; snC.height = window.innerHeight;
  snX.clearRect(0, 0, snC.width, snC.height);
  flakes.forEach(f => {
    snX.beginPath(); snX.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    snX.fillStyle = `rgba(255,255,255,${f.a})`; snX.fill();
    f.x += f.vx; f.y += f.vy;
    if (f.y > snC.height) { f.y = 0; f.x = Math.random() * snC.width; }
  });
  requestAnimationFrame(drawSnow);
})();

// ================= [V2 RAIN FOR CH5] =================
const rnC = document.getElementById('rainCanvas'), rnX = rnC.getContext('2d');
const drops = [];
for (let i = 0; i < 220; i++) {
  drops.push({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    len: Math.random() * 14 + 6,
    speed: Math.random() * 6 + 6,
    a: Math.random() * .35 + .1
  });
}
(function drawRain() {
  rnC.width = rnC.offsetWidth || window.innerWidth;
  rnC.height = rnC.offsetHeight || window.innerHeight;
  rnX.clearRect(0, 0, rnC.width, rnC.height);
  drops.forEach(d => {
    rnX.beginPath();
    rnX.moveTo(d.x, d.y);
    rnX.lineTo(d.x - 2, d.y + d.len);
    rnX.strokeStyle = `rgba(130,160,210,${d.a})`;
    rnX.lineWidth = .6;
    rnX.stroke();
    d.y += d.speed;
    if (d.y > rnC.height) { d.y = 0; d.x = Math.random() * rnC.width; }
  });
  requestAnimationFrame(drawRain);
})();

// ================= [V1 REL KERETA - SLEEPERS] =================
const sw = document.getElementById('sleepersWrap');
for (let i = 0; i < 30; i++) {
  const s = document.createElement('div');
  s.classList.add('sleeper');
  s.style.left = (i * 80) + 'px';
  sw.appendChild(s);
}

// ================= [V3 PETALS] =================
const pE = document.getElementById('petals');
function mkP() {
  const p = document.createElement('div'); p.className = 'petal';
  const sz = 6 + Math.random() * 7;
  p.style.cssText = `left:${Math.random() * 110 - 5}%;width:${sz}px;height:${sz * 1.25}px;animation-duration:${7 + Math.random() * 8}s;animation-delay:${Math.random() * 3}s;--drift:${(Math.random() - .5) * 180}px;transform:rotate(${Math.random() * 360}deg);`;
  pE.appendChild(p);
  setTimeout(() => p.remove(), 17000);
}
setInterval(mkP, 450);
for (let i = 0; i < 10; i++) setTimeout(mkP, i * 160);

// ================= [V2 REVEAL OBSERVER] =================
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: .12 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));

// ================= [V1 DAYS COUNTER ANIMATION] =================
function animateCount(target, el, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(timer);
      return;
    }
    el.textContent = Math.floor(start).toLocaleString();
  }, 16);
}

const daysEl = document.getElementById('daysNum');
const dcEl = document.getElementById('dc');
if (daysEl && dcEl) {
  const daysTarget = 1297;
  let daysAnimated = false;
  const dayObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || daysAnimated) return;
      daysAnimated = true;
      setTimeout(() => animateCount(daysTarget, daysEl, 1800), 400);
      dayObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  dayObs.observe(dcEl);
}

// ================= [V4 CHAPTER NAV ACTIVE STATE] =================
const navSectionIds = ['s0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10'];
const cnDots = document.querySelectorAll('.cnav-dot');

function updateChapNav() {
  let cur = 's0';
  navSectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY + window.innerHeight / 2 >= el.offsetTop) cur = id;
  });
  cnDots.forEach(d => { d.classList.toggle('active', d.dataset.target === cur); });
  document.body.classList.toggle('ch5-rain', cur === 'ch4' || cur === 'ch5' || cur === 'ch6');
  document.body.classList.toggle('ch8-petals', cur === 'ch8' || cur === 'ch9' || cur === 'ch10');
  syncBgmBySection(cur);
}

window.addEventListener('scroll', updateChapNav);
updateChapNav();

cnDots.forEach(d => {
  d.addEventListener('click', () => {
    document.getElementById(d.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
  });
});

// ================= [V4 FLIPBOOK CLICK INTERACTION] =================
const fb = document.getElementById('flipbook');
if (fb) {
  fb.addEventListener('click', () => {
    fb.style.transform = 'rotate(0deg) scale(1.05)';
    setTimeout(() => { fb.style.transform = 'rotate(-2deg)'; }, 600);
  });
}

// ================= [V3 MEMORY PETALS 01-12] =================
const mems = [
  { n: '01', t: 'Perpustakaan sore hari — kamu ikut, padahal teman-temanmu pergi ke tempat lain. Tidak ada yang memintamu. Tapi kamu tetap ke tempatku.' },
  { n: '02', t: 'Dairy Milk Indomaret malam-malam — tiga kali keliling sebelum berani masuk, karena tidak tahu yang mana yang enak, hanya tahu ingin memberi sesuatu.' },
  { n: '03', t: 'Seblak di pertigaan arah rumahku — pertama kalinya aku makan di luar berdua dengan seorang perempuan. Tidak ingat rasanya. Ingat wajahmu.' },
  { n: '04', t: 'Sleep call 7 jam. Dari malam sampai pagi. Handphone tidak pernah dimatikan. Tidak ada yang ingin memutus duluan.' },
  { n: '05', t: '"Jangan blokir aku" — kamu bilang itu. Dan aku yang masih childish waktu itu tidak mengerti seberapa besar arti kata-kata itu.' },
  { n: '06', t: 'Nonton 5 cm/detik via Discord. Dua orang yang dipisahkan jarak. Kita menonton tanpa tahu kita akan menghidupkannya.' },
  { n: '07', t: '"i always loved you" — aku screenshot dan jadikan wallpaper. Masih ada sampai sekarang.' },
  { n: '08', t: '01:35, 29 Agustus 2025 — aku bilang kesepian, bertanya apakah kamu akan ninggalin aku. Pesan itu tidak dibalas.' },
  { n: '09', t: 'Operasi tumor mamae, Januari 2026 — aku hanya bisa bilang "get well soon" dari jauh. Itu tidak cukup, dan aku tahu.' },
  { n: '10', t: 'Hujan petir Surabaya, 10 Februari — semua temanmu tidak ada yang balas. Kamu WhatsApp aku. Aku tidak terganggu. Justru sebaliknya.' },
  { n: '11', t: '"I may not have much to give, but I hope this mini book brings a small smile to u" — kamu tidak tahu betapa banyak yang sudah kamu berikan.' },
  { n: '12', t: 'Gubeng, Kamis malam — aku tiba jam 17:20. Keretamu jam 18:50. Di antara itu, ada 90 menit yang ingin kubuat berarti.' }
];
const rots = [-18, 12, -8, 20, -14, 6, -22, 10, -5, 17, -11, 8];
const pg = document.getElementById('pg'), mt = document.getElementById('mt');
if (pg && mt) {
  mems.forEach((m, i) => {
    const el = document.createElement('div');
    el.className = 'mp';
    el.style.setProperty('--r', rots[i % rots.length]);
    el.innerHTML = `<span>${m.n}</span>`;
    el.addEventListener('click', () => {
      document.querySelectorAll('.mp').forEach(x => x.classList.remove('open'));
      el.classList.add('open');
      mt.classList.remove('on');
      setTimeout(() => { mt.textContent = m.t; mt.classList.add('on'); }, 80);
    });
    pg.appendChild(el);
  });
}

// ================= [V5 DOA INTERACTION] =================
const doaInput = document.getElementById('doaInput');
const doaBtn = document.getElementById('doaBtn');
const doaOutput = document.getElementById('doaOutput');
const doaList = [];

if (doaInput && doaBtn && doaOutput) {
  doaBtn.addEventListener('click', () => {
    const v = doaInput.value.trim();
    if (!v) return;
    doaList.push(v);
    doaInput.value = '';
    renderDoa();
    spawnSakuraDoa();
  });
  doaInput.addEventListener('keydown', e => { if (e.key === 'Enter') doaBtn.click(); });
}

function renderDoa() {
  if (!doaOutput) return;
  doaOutput.innerHTML = '';
  doaList.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'doa-petal';
    s.style.setProperty('--dd', (i * 0.5) + 's');
    s.textContent = '✦ ' + w + ' ✦';
    doaOutput.appendChild(s);
  });
}

function spawnSakuraDoa() {
  for (let i = 0; i < 8; i++) {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;font-size:${14 + Math.random() * 14}px;pointer-events:none;z-index:10;left:${15 + Math.random() * 70}vw;animation:spawnFall ${5 + Math.random() * 5}s linear forwards;animation-delay:${Math.random() * 2}s;`;
    d.textContent = '🌸';
    document.body.appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  }
}

if (!document.getElementById('spawn-fall-style')) {
  const ks = document.createElement('style');
  ks.id = 'spawn-fall-style';
  ks.textContent = `@keyframes spawnFall{0%{top:-40px;opacity:0;transform:rotate(0deg);}10%{opacity:.8;}90%{opacity:.5;}100%{top:110vh;opacity:0;transform:rotate(540deg);}}`;
  document.head.appendChild(ks);
}

// ================= [V2 LANTERN CANVAS] =================
const lc = document.getElementById('lantCanvas');
if (lc) {
  const lx = lc.getContext('2d');
  const lanterns = [];
  const LW = 700, LH = 400;

  (function animLant() {
    lx.fillStyle = '#060611'; lx.fillRect(0, 0, LW, LH);
    const t = Date.now() * .001;
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 137.5) % LW), sy = ((i * 89.3) % LH);
      const a = .12 + .1 * Math.sin(t * .7 + i);
      lx.beginPath(); lx.arc(sx, sy, .8, 0, Math.PI * 2);
      lx.fillStyle = `rgba(240,234,220,${a})`; lx.fill();
    }
    lanterns.forEach((l, idx) => {
      l.y -= l.speed; l.x += Math.sin(t * .6 + l.phase) * .5;
      l.wobble = Math.sin(t + l.phase);
      if (l.y < -60) { lanterns.splice(idx, 1); return; }

      const glow = lx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.gr);
      glow.addColorStop(0, `rgba(${l.r},${l.g},${l.b},.55)`);
      glow.addColorStop(.5, `rgba(${l.r},${l.g},${l.b},.15)`);
      glow.addColorStop(1, `rgba(${l.r},${l.g},${l.b},0)`);
      lx.beginPath(); lx.arc(l.x, l.y, l.gr * 1.5, 0, Math.PI * 2);
      lx.fillStyle = glow; lx.fill();

      lx.save(); lx.translate(l.x, l.y); lx.rotate(Math.sin(l.wobble) * .08);
      const g2 = lx.createRadialGradient(0, -l.h * .2, 0, 0, 0, l.w * .7);
      g2.addColorStop(0, `rgba(${l.r + 40},${l.g + 20},${l.b},.95)`);
      g2.addColorStop(1, `rgba(${l.r},${l.g},${l.b},.8)`);
      lx.beginPath(); lx.ellipse(0, 0, l.w, l.h, 0, 0, Math.PI * 2);
      lx.fillStyle = g2; lx.fill();
      lx.beginPath(); lx.moveTo(0, -l.h); lx.lineTo(0, -l.h - 14);
      lx.strokeStyle = 'rgba(255,255,255,.18)'; lx.lineWidth = .8; lx.stroke();
      lx.restore();
    });
    requestAnimationFrame(animLant);
  })();

  lc.addEventListener('click', e => {
    const rect = lc.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (LW / rect.width), y = (e.clientY - rect.top) * (LH / rect.height);
    const cols = [[255, 200, 180], [255, 183, 197], [255, 215, 150], [210, 180, 255], [175, 220, 255]];
    const c = cols[Math.floor(Math.random() * cols.length)];
    lanterns.push({ x, y, w: 8 + Math.random() * 5, h: 11 + Math.random() * 6, gr: 22 + Math.random() * 18, speed: .45 + Math.random() * .5, phase: Math.random() * Math.PI * 2, wobble: 0, r: c[0], g: c[1], b: c[2] });
  });
  lc.addEventListener('contextmenu', e => { e.preventDefault(); lanterns.length = 0; });
}
