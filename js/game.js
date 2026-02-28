// ============================================================
//  GEMS OF COMBAT — Game Engine  (swipe + animated gems)
// ============================================================

'use strict';

// ── Constants ────────────────────────────────────────────────
const GEM_TYPES   = ['red','blue','green','yellow','purple','brown','skull'];
const GEM_SYMBOLS = { red:'🔥', blue:'💧', green:'🌿', yellow:'⚡', purple:'✨', brown:'🪨', skull:'💀' };
const BOARD_SIZE  = 8;
const GEM_SIZE    = 62;   // px  (matches CSS --gem-size)
const GEM_GAP     = 4;    // px
const CELL        = GEM_SIZE + GEM_GAP;   // 66 px per grid cell
const SKULL_BONUS_PER_GEM = 2;
const SWIPE_THRESHOLD = 15;  // px minimum swipe distance

const ANIM_SWAP  = 180;   // ms — gem swap slide
const ANIM_MATCH = 320;   // ms — gem pop
const ANIM_FALL  = 280;   // ms — gem fall / spawn
const ENEMY_DELAY  = 900;  // ms — pause before enemy acts
const ANIM_ATTACK  = 350;  // ms — skull projectile travel

// ── Troop Definitions ───────────────────────────────────────
function baseTroop(tpl) { return { ...tpl, life: tpl.maxLife, mana: 0, _deathLogged: false }; }

// ── DOM Gem Registry ─────────────────────────────────────────
const gemEls = new Map();   // id → HTMLElement
let nextGemId = 0;

// ── Game State ───────────────────────────────────────────────
let state = {};
let _lastPlayerTeam = [];
let _lastEnemyTeam  = [];

function initState(playerTeamData, enemyTeamData) {
  nextGemId = 0;
  _lastPlayerTeam = playerTeamData;
  _lastEnemyTeam  = enemyTeamData;
  state = {
    board:       [],    // board[r][c] = { type: string, id: number }
    playerTeam:  playerTeamData.map(baseTroop),
    enemyTeam:   enemyTeamData.map(baseTroop),
    playerTurn:  true,
    busy:        false,
    gameOver:    false,
  };
  state.board = generateBoard();
}

// ── Board Generation ─────────────────────────────────────────
function generateBoard() {
  const board = Array.from({length:BOARD_SIZE}, () => Array(BOARD_SIZE).fill(null));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const forbidden = new Set();
      if (c >= 2 && board[r][c-1] && board[r][c-2] && board[r][c-1].type === board[r][c-2].type)
        forbidden.add(board[r][c-1].type);
      if (r >= 2 && board[r-1][c] && board[r-2][c] && board[r-1][c].type === board[r-2][c].type)
        forbidden.add(board[r-1][c].type);
      let choices = GEM_TYPES.filter(g => !forbidden.has(g));
      if (!choices.length) choices = GEM_TYPES;
      const type = choices[Math.floor(Math.random() * choices.length)];
      board[r][c] = { type, id: nextGemId++ };
    }
  }
  return board;
}

function randomGem() {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
}

// ── DOM Gem Creation ─────────────────────────────────────────
function createGemEl(id, type, r, c) {
  const el = document.createElement('div');
  el.className = `gem ${type}`;
  el.dataset.id = id;
  el.dataset.r  = r;
  el.dataset.c  = c;

  const inner = document.createElement('div');
  inner.className = 'gem-inner';
  inner.textContent = GEM_SYMBOLS[type];
  el.appendChild(inner);

  // Place instantly at starting position (no transition)
  el.style.transition = 'none';
  el.style.transform  = `translate(${c * CELL}px, ${r * CELL}px)`;
  return el;
}

// Set a gem element's grid position with or without animated transition.
// duration=0 → instant
function setGemPos(el, r, c, duration) {
  if (duration === undefined) duration = ANIM_SWAP;
  if (duration === 0) {
    el.style.transition = 'none';
    el.getBoundingClientRect(); // flush style
  } else {
    el.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
  }
  el.style.transform = `translate(${c * CELL}px, ${r * CELL}px)`;
  el.dataset.r = r;
  el.dataset.c = c;
}

// ── Board DOM Init ────────────────────────────────────────────
function initBoardDOM() {
  const boardEl = document.getElementById('game-board');
  boardEl.innerHTML = '';
  gemEls.clear();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const { type, id } = state.board[r][c];
      const el = createGemEl(id, type, r, c);
      boardEl.appendChild(el);
      gemEls.set(id, el);
    }
  }
}

// ── Hint System ─────────────────────────────────────────────
let hintTimer = null;
let hintGemIds = [];

function startHintTimer() {
  clearHint();
  if (state.gameOver || !state.playerTurn) return;
  hintTimer = setTimeout(showHint, 3000);
}

function clearHint() {
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
  const g1 = state.board[move.r ][move.c ];
  const g2 = state.board[move.nr][move.nc];
  if (g1) { const el = gemEls.get(g1.id); if (el) { el.classList.add('hint-glow'); hintGemIds.push(g1.id); } }
  if (g2) { const el = gemEls.get(g2.id); if (el) { el.classList.add('hint-glow'); hintGemIds.push(g2.id); } }
}

// ── Attack Animations + Floating Damage ──────────────────────
function animateSkullAttack(isPlayer, atkIdx, defIdx, dmg, cb) {
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

  // Projectile skull emoji
  const proj = document.createElement('div');
  proj.className = 'atk-projectile';
  proj.textContent = '💀';
  proj.style.cssText =
    `left:${fromX}px;top:${fromY}px;transition:` +
    `left ${ANIM_ATTACK}ms cubic-bezier(.4,.2,.2,1),` +
    `top ${ANIM_ATTACK}ms cubic-bezier(.4,.2,.2,1),` +
    `opacity ${ANIM_ATTACK}ms ease,` +
    `transform ${ANIM_ATTACK}ms ease;`;
  document.body.appendChild(proj);

  // Double rAF ensures the start position is painted before transition
  requestAnimationFrame(() => requestAnimationFrame(() => {
    proj.style.left      = `${toX}px`;
    proj.style.top       = `${toY}px`;
    proj.style.opacity   = '0';
    proj.style.transform = 'translate(-50%,-50%) scale(2.4) rotate(180deg)';
  }));

  setTimeout(() => {
    proj.remove();
    // Slam the defender card
    defCard.classList.add('staggering');
    spawnFloatDmg(defCard, dmg);
    setTimeout(() => defCard.classList.remove('staggering'), 650);
    cb();
  }, ANIM_ATTACK + 20);
}

function spawnFloatDmg(targetEl, dmg) {
  const rect = targetEl.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className = 'float-dmg';
  el.textContent = `-${dmg}`;
  el.style.left  = `${rect.left + rect.width  / 2}px`;
  el.style.top   = `${rect.top}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// ── Match Detection ──────────────────────────────────────────
function findAllMatches(board) {
  const matched = new Set();

  for (let r = 0; r < BOARD_SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= BOARD_SIZE; c++) {
      const same = c < BOARD_SIZE && board[r][c] && board[r][c-1] &&
                   board[r][c].type === board[r][c-1].type;
      if (same) { run++; }
      else {
        if (run >= 3) for (let k = c-run; k < c; k++) matched.add(`${r},${k}`);
        run = 1;
      }
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= BOARD_SIZE; r++) {
      const same = r < BOARD_SIZE && board[r][c] && board[r-1][c] &&
                   board[r][c].type === board[r-1][c].type;
      if (same) { run++; }
      else {
        if (run >= 3) for (let k = r-run; k < r; k++) matched.add(`${k},${c}`);
        run = 1;
      }
    }
  }

  return matched;
}

function largestMatchGroup(board, matched) {
  if (!matched.size) return 0;
  const visited = new Set();
  let largest = 0;
  for (const key of matched) {
    if (visited.has(key)) continue;
    const [r, c] = key.split(',').map(Number);
    const color = board[r][c] ? board[r][c].type : null;
    const queue = [key];
    visited.add(key);
    let count = 0;
    while (queue.length) {
      const cur = queue.shift();
      count++;
      const [cr, cc] = cur.split(',').map(Number);
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = cr+dr, nc = cc+dc;
        const nk = `${nr},${nc}`;
        if (nr>=0 && nr<BOARD_SIZE && nc>=0 && nc<BOARD_SIZE &&
            matched.has(nk) && !visited.has(nk) &&
            board[nr][nc] && board[nr][nc].type === color) {
          visited.add(nk);
          queue.push(nk);
        }
      }
    }
    if (count > largest) largest = count;
  }
  return largest;
}

// ── Mana & Skull Processing ──────────────────────────────────
function processMana(matched, isPlayer) {
  const counts = {};
  for (const key of matched) {
    const [r,c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (!gem) continue;
    counts[gem.type] = (counts[gem.type] || 0) + 1;
  }

  const team = isPlayer ? state.playerTeam : state.enemyTeam;
  for (const [color, amount] of Object.entries(counts)) {
    if (color === 'skull') continue;
    for (const troop of team) {
      if (troop.life > 0 && troop.color === color)
        troop.mana = Math.min(troop.manaCost, troop.mana + amount);
    }
  }

  const logs = [];
  let skullHit = null;
  if (counts['skull']) {
    const n      = counts['skull'];
    const atkTeam = isPlayer ? state.playerTeam : state.enemyTeam;
    const defTeam = isPlayer ? state.enemyTeam  : state.playerTeam;
    const atkIdx  = atkTeam.findIndex(t => t.life > 0);
    const defIdx  = defTeam.findIndex(t => t.life > 0);
    if (atkIdx >= 0 && defIdx >= 0) {
      const attacker = atkTeam[atkIdx];
      const defender = defTeam[defIdx];
      const bonus = Math.max(0, n - 3) * SKULL_BONUS_PER_GEM;
      const dmg   = Math.max(1, attacker.attack + bonus - defender.armor);
      defender.life = Math.max(0, defender.life - dmg);
      logs.push({ type:'damage', text:`💀 ${n} skulls! ${attacker.name} deals ${dmg} damage to ${defender.name}!` });
      skullHit = { atkIdx, defIdx, dmg };
    }
  }
  return { logs, skullHit };
}

// ── Valid Moves (AI + deadlock) ───────────────────────────────
function findValidMoves(board) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of [[0,1],[1,0]]) {
        const nr = r+dr, nc = c+dc;
        if (nr >= BOARD_SIZE || nc >= BOARD_SIZE) continue;
        const b = board.map(row => [...row]);
        [b[r][c], b[nr][nc]] = [b[nr][nc], b[r][c]];
        if (findAllMatches(b).size > 0) moves.push({r,c,nr,nc});
      }
    }
  }
  return moves;
}

// ── Animated Swap ────────────────────────────────────────────
function animateSwap(r1, c1, r2, c2, cb) {
  const gem1 = state.board[r1][c1];
  const gem2 = state.board[r2][c2];
  // Update logical board immediately
  [state.board[r1][c1], state.board[r2][c2]] = [state.board[r2][c2], state.board[r1][c1]];
  // Animate elements to swapped positions
  const el1 = gemEls.get(gem1.id);
  const el2 = gemEls.get(gem2.id);
  if (el1) setGemPos(el1, r2, c2, ANIM_SWAP);
  if (el2) setGemPos(el2, r1, c1, ANIM_SWAP);
  setTimeout(cb, ANIM_SWAP + 20);
}

// ── Animated Match Pop ────────────────────────────────────────
function animateMatchPop(matched, cb) {
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (!gem) continue;
    const el = gemEls.get(gem.id);
    if (!el) continue;
    el.style.transition = 'none'; // freeze position during pop
    const inner = el.querySelector('.gem-inner');
    if (inner) inner.classList.add('popping');
  }
  setTimeout(cb, ANIM_MATCH);
}

// ── Animated Gravity + Refill ─────────────────────────────────
function resolveGravity(cb) {
  const boardEl = document.getElementById('game-board');
  const fallMoves = [];
  const newGems   = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    let writeRow = BOARD_SIZE - 1;
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (state.board[r][c] !== null) {
        if (writeRow !== r) {
          fallMoves.push({ id: state.board[r][c].id, toRow: writeRow, col: c });
          state.board[writeRow][c] = state.board[r][c];
          state.board[r][c] = null;
        }
        writeRow--;
      }
    }
    let spawnIdx = 0;
    for (let r = writeRow; r >= 0; r--) {
      const id   = nextGemId++;
      const type = randomGem();
      state.board[r][c] = { type, id };
      newGems.push({ id, type, toRow: r, col: c, spawnIdx: spawnIdx++ });
    }
  }

  // Slide existing gems down to their new rows
  for (const { id, toRow, col } of fallMoves) {
    const el = gemEls.get(id);
    if (el) setGemPos(el, toRow, col, ANIM_FALL);
  }

  // Spawn new gems above the visible board and slide them in
  for (const { id, type, toRow, col, spawnIdx } of newGems) {
    const el = createGemEl(id, type, -(spawnIdx + 1), col);
    boardEl.appendChild(el);
    gemEls.set(id, el);
    el.getBoundingClientRect(); // force layout so off-screen start registers
    setGemPos(el, toRow, col, ANIM_FALL);
  }

  setTimeout(cb, ANIM_FALL + 30);
}

// ── Core Match Processing ─────────────────────────────────────
function processMatches(matched, isPlayer) {
  state.busy = true;
  const maxGroup   = largestMatchGroup(state.board, matched);
  const grantExtra = maxGroup >= 4;

  // Pre-count gem types before board is cleared
  const counts = {};
  for (const key of matched) {
    const [r,c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (gem) counts[gem.type] = (counts[gem.type] || 0) + 1;
  }

  animateMatchPop(matched, () => {
    // Process mana / skull damage
    const { logs, skullHit } = processMana(matched, isPlayer);
    logs.forEach(l => addLog(l.type, l.text));

    const manaInfo = Object.entries(counts)
      .filter(([k]) => k !== 'skull')
      .map(([k,v]) => `${GEM_SYMBOLS[k]}×${v}`).join(', ');
    if (manaInfo) addLog(isPlayer ? 'player' : 'enemy',
      `${isPlayer ? 'You' : 'Enemy'} matched: ${manaInfo}`);
    if (counts['skull']) addLog(isPlayer ? 'player' : 'enemy',
      `${GEM_SYMBOLS['skull']}×${counts['skull']} skulls!`);

    const afterAttack = () => {
      // Remove matched gems from DOM + board
      for (const key of matched) {
        const [r,c] = key.split(',').map(Number);
        const gem = state.board[r][c];
        if (!gem) continue;
        const el = gemEls.get(gem.id);
        if (el) el.remove();
        gemEls.delete(gem.id);
        state.board[r][c] = null;
      }

      checkDeaths();
      if (checkGameOver()) return;

      // Apply gravity + animate refill
      resolveGravity(() => {
        // Cascade check
        const next = findAllMatches(state.board);
        if (next.size > 0) {
          processMatches(next, isPlayer);
          return;
        }

        if (grantExtra) addLog('extra', '⭐ Match of 4+! EXTRA TURN!');
        renderTeams();
        renderTurnIndicator();

        if (isPlayer && grantExtra) {
          state.busy = false;
          checkDeadlock();
          startHintTimer();
          return;
        }

        if (isPlayer) {
          state.playerTurn = false;
          renderTurnIndicator();
          state.busy = false;
          setTimeout(enemyCastSpells, ENEMY_DELAY * 0.5);
        } else {
          state.playerTurn = true;
          state.busy = false;
          renderTeams();
          renderTurnIndicator();
          checkDeadlock();
          startHintTimer();
        }
      });
    };

    if (skullHit) {
      animateSkullAttack(isPlayer, skullHit.atkIdx, skullHit.defIdx, skullHit.dmg, afterAttack);
    } else {
      afterAttack();
    }
  });
}

// ── Swipe Input ──────────────────────────────────────────────
let dragState = null;

function onPointerDown(e) {
  if (!state.playerTurn || state.busy || state.gameOver) return;
  const gem = e.target.closest('.gem');
  if (!gem) return;
  e.preventDefault();
  clearHint();
  dragState = {
    r: +gem.dataset.r,
    c: +gem.dataset.c,
    startX: e.clientX,
    startY: e.clientY,
    el: gem,
  };
  const inner = gem.querySelector('.gem-inner');
  if (inner) inner.style.filter = 'brightness(1.55)';
}

function onPointerMove(e) {
  if (!dragState) return;
  e.preventDefault(); // prevent scroll on touch devices
}

function onPointerUp(e) {
  if (!dragState) return;
  const { r, c, startX, startY, el } = dragState;
  dragState = null;

  const inner = el ? el.querySelector('.gem-inner') : null;
  if (inner) inner.style.filter = '';

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (Math.max(adx, ady) < SWIPE_THRESHOLD) return; // tap, not swipe

  let nr = r, nc = c;
  if (adx > ady) { nc += dx > 0 ? 1 : -1; }
  else           { nr += dy > 0 ? 1 : -1; }

  if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return;
  attemptSwap(r, c, nr, nc);
}

function onPointerCancel() {
  if (!dragState) return;
  const inner = dragState.el ? dragState.el.querySelector('.gem-inner') : null;
  if (inner) inner.style.filter = '';
  dragState = null;
}

function attemptSwap(r1, c1, r2, c2) {
  state.busy = true;
  animateSwap(r1, c1, r2, c2, () => {
    const matched = findAllMatches(state.board);
    if (!matched.size) {
      // No match — animate swap back
      animateSwap(r2, c2, r1, c1, () => {
        state.busy = false;
        addLog('system', 'No match — try a different direction.');
      });
      return;
    }
    processMatches(matched, true);
  });
}

// ── Enemy AI ─────────────────────────────────────────────────
function enemyCastSpells() {
  const front = state.enemyTeam.find(t => t.life > 0);
  if (front && front.mana >= front.manaCost) {
    front.mana = 0;
    const msg = front.cast(front, state.enemyTeam, state.playerTeam);
    if (msg) addLog('spell', `✨ ${msg}`);
    checkDeaths();
    if (checkGameOver()) return;
    renderTeams();
  }
  setTimeout(enemyMove, ENEMY_DELAY);
}

function enemyMove() {
  const moves = findValidMoves(state.board);
  if (!moves.length) {
    addLog('enemy', 'Enemy has no valid moves. Reshuffling board…');
    reshuffleBoard();
    state.playerTurn = true;
    state.busy = false;
    renderTeams();
    renderTurnIndicator();
    startHintTimer();
    return;
  }

  // Prefer skull matches
  const skullMoves = moves.filter(m => {
    const b = state.board.map(row => [...row]);
    [b[m.r][m.c], b[m.nr][m.nc]] = [b[m.nr][m.nc], b[m.r][m.c]];
    const matched = findAllMatches(b);
    for (const key of matched) {
      const [r,c] = key.split(',').map(Number);
      if (b[r][c] && b[r][c].type === 'skull') return true;
    }
    return false;
  });

  const pool   = skullMoves.length ? skullMoves : moves;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  addLog('enemy', `Enemy swaps (${chosen.r+1},${chosen.c+1}) ↔ (${chosen.nr+1},${chosen.nc+1})`);
  state.busy = true;
  animateSwap(chosen.r, chosen.c, chosen.nr, chosen.nc, () => {
    const matched = findAllMatches(state.board);
    processMatches(matched, false);
  });
}

// ── Death / Game Over ─────────────────────────────────────────
function checkDeaths() {
  [...state.playerTeam, ...state.enemyTeam].forEach(t => {
    if (t.life <= 0 && !t._deathLogged) {
      t.life = 0; t.mana = 0; t._deathLogged = true;
      addLog('death', `☠️ ${t.name} has been defeated!`);
    }
  });
}

function checkGameOver() {
  const pAlive = state.playerTeam.some(t => t.life > 0);
  const eAlive = state.enemyTeam.some(t  => t.life > 0);
  if (!pAlive) { state.gameOver = true; showOverlay('☠️ DEFEAT',  'Your team has been wiped out…'); renderTeams(); renderTurnIndicator(); return true; }
  if (!eAlive) { state.gameOver = true; showOverlay('🏆 VICTORY!','You defeated the enemy team!');  renderTeams(); renderTurnIndicator(); return true; }
  return false;
}

function showOverlay(title, msg) {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-msg').textContent   = msg;
  document.getElementById('overlay').classList.remove('hidden');
  const won = title.includes('VICTORY');
  window._lastBattleWon = won;
  if (typeof window.onBattleEnd === 'function') {
    setTimeout(() => window.onBattleEnd(won), 1200);
  }
}

// ── Deadlock / Reshuffle ──────────────────────────────────────
function checkDeadlock() {
  if (!findValidMoves(state.board).length) {
    addLog('system', '🔄 No valid moves — board reshuffled!');
    reshuffleBoard();
    startHintTimer();
  }
}

function reshuffleBoard() {
  // Guarantee the new board has at least one valid move
  let attempts = 0;
  do {
    state.board = generateBoard();
    attempts++;
  } while (!findValidMoves(state.board).length && attempts < 30);
  nextGemId = 0;
  // Re-assign sequential IDs to board gems
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      state.board[r][c].id = nextGemId++;
  initBoardDOM();
}

// ── Logging ──────────────────────────────────────────────────
function addLog(type, text) {
  const el = document.getElementById('message-log');
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.textContent = text;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  while (el.children.length > 40) el.removeChild(el.firstChild);
}

// ── Team Panel Rendering ──────────────────────────────────────
function renderTeams() {
  renderPanel('player-troops', state.playerTeam, true);
  renderPanel('enemy-troops',  state.enemyTeam,  false);
}

function renderPanel(containerId, team, isPlayer) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  team.forEach((troop, i) => {
    const canCast = isPlayer && state.playerTurn && !state.busy && !state.gameOver
                  && troop.life > 0 && troop.mana >= troop.manaCost;
    const card = document.createElement('div');
    card.className = 'troop-card' + (troop.life <= 0 ? ' dead' : '') + (canCast ? ' can-cast' : '');

    const hpPct   = Math.max(0, (troop.life / troop.maxLife) * 100).toFixed(1);
    const manaPct = Math.max(0, (troop.mana  / troop.manaCost) * 100).toFixed(1);
    const dot     = `background:var(--${troop.color});width:10px;height:10px;border-radius:50%;`;

    card.innerHTML = `
      <div class="troop-name"><span style="${dot}"></span>${troop.emoji} ${troop.name}</div>
      <div class="troop-stats">
        <span title="Attack">⚔️ ${troop.attack}</span>
        <span title="Armor">🛡 ${troop.armor}</span>
        <span title="Life">❤️ ${troop.life}/${troop.maxLife}</span>
      </div>
      <div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
      <div class="mana-label">${troop.spell} (${troop.mana}/${troop.manaCost})</div>
      <div class="mana-bar-bg"><div class="mana-bar-fill ${troop.color}" style="width:${manaPct}%"></div></div>
      ${canCast ? '<div class="cast-hint">&#9654; CLICK TO CAST</div>' : ''}
    `;
    if (canCast) card.addEventListener('click', () => castSpell(i));
    el.appendChild(card);
  });
}

function renderTurnIndicator() {
  document.getElementById('turn-indicator').textContent =
    state.gameOver    ? '' :
    !state.playerTurn ? 'Enemy Turn…' : 'Your Turn — Swipe a gem!';
}

// ── Spell Casting ─────────────────────────────────────────────
function castSpell(i) {
  if (!state.playerTurn || state.busy || state.gameOver) return;
  const troop = state.playerTeam[i];
  if (troop.life <= 0 || troop.mana < troop.manaCost) return;
  troop.mana = 0;
  const msg = troop.cast(troop, state.playerTeam, state.enemyTeam);
  if (msg) addLog('spell', `✨ ${msg}`);
  checkDeaths();
  if (checkGameOver()) return;
  renderTeams();
  renderTurnIndicator();
}

// ── BATTLE API (called by app.js meta-game) ───────────────────
window.BATTLE = {
  _boardListenersAdded: false,

  start(playerTeamData, enemyTeamData) {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('message-log').innerHTML = '';
    gemEls.clear();
    initState(playerTeamData, enemyTeamData);
    initBoardDOM();
    renderTeams();
    renderTurnIndicator();
    addLog('system', 'Battle started! Swipe gems to match 3+.');
    addLog('system', '💀 Skulls deal damage · Match 4+ for an EXTRA TURN · Click troop cards to cast spells!');
    if (!this._boardListenersAdded) {
      const board = document.getElementById('game-board');
      board.addEventListener('pointerdown',   onPointerDown,  { passive: false });
      board.addEventListener('pointermove',   onPointerMove,  { passive: false });
      board.addEventListener('pointerup',     onPointerUp);
      board.addEventListener('pointercancel', onPointerCancel);
      this._boardListenersAdded = true;
    }
    startHintTimer();
  },

  retry() {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('message-log').innerHTML = '';
    gemEls.clear();
    initState(_lastPlayerTeam, _lastEnemyTeam);
    initBoardDOM();
    renderTeams();
    renderTurnIndicator();
    addLog('system', 'Retrying battle! Swipe gems to match 3+.');
    startHintTimer();
  }
};
