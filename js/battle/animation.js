// ============================================================
//  GEMS OF COMBAT — Animations: swap, pop, attacks, broadcast, hints
// ============================================================
import { ANIM_SWAP, ANIM_MATCH, ANIM_ATTACK } from '../data/constants.js';
import { state }  from '../state/gameState.js';
import { gemEls, setGemPos } from './gemDom.js';
import { findValidMoves }    from './matching.js';

// ── Broadcast Toast ──────────────────────────────────────────
let _broadcastQueue = [];
let _broadcastBusy  = false;

export function addBroadcast(text, cls = '') {
  _broadcastQueue.push({ text, cls });
  if (!_broadcastBusy) _flushBroadcast();
}

function _flushBroadcast() {
  if (!_broadcastQueue.length) { _broadcastBusy = false; return; }
  _broadcastBusy = true;
  const { text, cls } = _broadcastQueue.shift();
  const el    = document.getElementById('broadcast');
  const inner = document.getElementById('broadcast-inner');
  if (!el || !inner) { _broadcastBusy = false; return; }
  inner.textContent = text;
  el.className = cls || '';
  el.classList.remove('hidden');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('bc-show');
  setTimeout(() => {
    el.classList.remove('bc-show');
    el.classList.add('hidden');
    setTimeout(_flushBroadcast, 80);
  }, 1500);
}

export function resetBroadcast() {
  _broadcastQueue = [];
  _broadcastBusy  = false;
  const el = document.getElementById('broadcast');
  if (el) el.classList.add('hidden');
}

// ── Hint System ───────────────────────────────────────────────
let hintTimer  = null;
let hintGemIds = [];

export function startHintTimer() {
  clearHint();
  if (state.gameOver || !state.playerTurn) return;
  hintTimer = setTimeout(showHint, 3000);
}

export function clearHint() {
  if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
  hintGemIds.forEach(id => {
    const el = gemEls.get(id);
    if (el) el.classList.remove('hint-glow');
  });
  hintGemIds = [];
}

function showHint() {
  hintTimer = null;
  if (state.gameOver || state.busy) return;
  const moves = findValidMoves(state.board);
  if (!moves.length) return;
  const move = moves[Math.floor(Math.random() * moves.length)];
  const g1   = state.board[move.r ][move.c ];
  const g2   = state.board[move.nr][move.nc];
  if (g1) { const el = gemEls.get(g1.id); if (el) { el.classList.add('hint-glow'); hintGemIds.push(g1.id); } }
  if (g2) { const el = gemEls.get(g2.id); if (el) { el.classList.add('hint-glow'); hintGemIds.push(g2.id); } }
}

// ── Animated Swap ─────────────────────────────────────────────
export function animateSwap(r1, c1, r2, c2, cb) {
  const gem1 = state.board[r1][c1];
  const gem2 = state.board[r2][c2];
  // Update logical board immediately
  [state.board[r1][c1], state.board[r2][c2]] = [state.board[r2][c2], state.board[r1][c1]];
  const el1 = gemEls.get(gem1.id);
  const el2 = gemEls.get(gem2.id);
  if (el1) setGemPos(el1, r2, c2, ANIM_SWAP);
  if (el2) setGemPos(el2, r1, c1, ANIM_SWAP);
  setTimeout(cb, ANIM_SWAP + 20);
}

// ── Animated Match Pop ────────────────────────────────────────
export function animateMatchPop(matched, cb) {
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    const gem    = state.board[r][c];
    if (!gem) continue;
    const el    = gemEls.get(gem.id);
    if (!el) continue;
    el.style.transition = 'none'; // freeze position during pop
    const inner = el.querySelector('.gem-inner');
    if (inner) inner.classList.add('popping');
  }
  setTimeout(cb, ANIM_MATCH);
}

// ── Skull Attack + Floating Damage ───────────────────────────
export function animateSkullAttack(isPlayer, atkIdx, defIdx, dmg, cb) {
  const atkPanelId = isPlayer ? 'player-troops' : 'enemy-troops';
  const defPanelId = isPlayer ? 'enemy-troops'  : 'player-troops';
  const atkPanel   = document.getElementById(atkPanelId);
  const defPanel   = document.getElementById(defPanelId);
  const atkCard    = atkPanel?.children[atkIdx];
  const defCard    = defPanel?.children[defIdx];
  if (!atkCard || !defCard) { cb(); return; }

  const atkRect = atkCard.getBoundingClientRect();
  const defRect = defCard.getBoundingClientRect();
  const fromX   = atkRect.left + atkRect.width  / 2;
  const fromY   = atkRect.top  + atkRect.height / 2;
  const toX     = defRect.left + defRect.width  / 2;
  const toY     = defRect.top  + defRect.height / 2;

  // Skull projectile SVG
  const proj = document.createElement('div');
  proj.className = 'atk-projectile';
  proj.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
    <circle cx="12" cy="10" r="8" fill="#8a8880" stroke="#444" stroke-width="1"/>
    <rect x="7" y="16" width="10" height="5" rx="1" fill="#8a8880" stroke="#444" stroke-width="0.7"/>
    <ellipse cx="9"  cy="10" rx="2.5" ry="2.2" fill="#111"/>
    <ellipse cx="15" cy="10" rx="2.5" ry="2.2" fill="#111"/>
    <line x1="9" y1="16" x2="9"  y2="21" stroke="#333" stroke-width="1.5"/>
    <line x1="12" y1="16" x2="12" y2="21" stroke="#333" stroke-width="1.5"/>
    <line x1="15" y1="16" x2="15" y2="21" stroke="#333" stroke-width="1.5"/>
  </svg>`;
  proj.style.cssText =
    `left:${fromX}px;top:${fromY}px;transition:` +
    `left ${ANIM_ATTACK}ms cubic-bezier(.4,.2,.2,1),` +
    `top ${ANIM_ATTACK}ms cubic-bezier(.4,.2,.2,1),` +
    `opacity ${ANIM_ATTACK}ms ease,` +
    `transform ${ANIM_ATTACK}ms ease;`;
  document.body.appendChild(proj);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    proj.style.left      = `${toX}px`;
    proj.style.top       = `${toY}px`;
    proj.style.opacity   = '0';
    proj.style.transform = 'translate(-50%,-50%) scale(2.4) rotate(180deg)';
  }));

  setTimeout(() => {
    proj.remove();
    defCard.classList.add('staggering');
    spawnFloatDmg(defCard, dmg);
    setTimeout(() => defCard.classList.remove('staggering'), 650);
    cb();
  }, ANIM_ATTACK + 20);
}

function spawnFloatDmg(targetEl, dmg) {
  const rect = targetEl.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className   = 'float-dmg';
  el.textContent = `-${dmg}`;
  el.style.left  = `${rect.left + rect.width  / 2}px`;
  el.style.top   = `${rect.top}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}
