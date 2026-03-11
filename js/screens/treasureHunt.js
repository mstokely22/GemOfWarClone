// ============================================================
//  GEMS OF COMBAT — Treasure Hunt Mini-Game
//  Match-3 where tiles merge into higher-value treasure.
//  Copper → Silver → Gold → Bag → Chest → Vault
// ============================================================
import { save, writeSave }        from '../state/save.js';
import { showScreen }             from './navigation.js';
import { ALL_EQUIPMENT }          from '../data/equipment.js';
import { MATERIALS, MATERIAL_IDS } from '../data/materials.js';
import {
  TREASURE_TIERS, TIER_BY_ID, MAX_TIER,
  TILE_REWARDS, SPAWN_WEIGHTS,
  TH_BOARD_SIZE, TH_START_TURNS,
} from '../data/treasureTiles.js';
import {
  GEM_SIZE, GEM_GAP, CELL,
  ANIM_SWAP, ANIM_MATCH, ANIM_FALL, SWIPE_THRESHOLD,
} from '../data/constants.js';
import { TILE_SVG }                from '../art/treasure.js';

// ── Module state ──────────────────────────────────────────────
let board     = [];        // board[r][c] = { tier, id } | null
let gemEls    = new Map(); // id → HTMLElement
let nextId    = 0;
let turnsLeft = 0;
let busy      = false;
let gameActive = false;
let grantExtra = false;
let rewards   = null;      // { gold, materials: {}, equipment: [], shards: {} }

// Pointer tracking
let ptrDown   = false;
let startX    = 0;
let startY    = 0;
let startR    = -1;
let startC    = -1;

// Scaling / resize
let thResizeHandler = null;

const TH_DESIGN_W = 730;  // board(556) + gap(16) + sidebar(~158)
const TH_DESIGN_H = 570;  // board(556) + breathing room

function bumpId() { return nextId++; }

// ══════════════════════════════════════════════════════════════
//  ENTRY / LOBBY
// ══════════════════════════════════════════════════════════════
export function renderTreasureHunt() {
  cleanupTHResize();
  const maps = save.treasureMaps ?? 0;
  const lobby = document.getElementById('th-lobby');
  const game  = document.getElementById('th-game');
  const results = document.getElementById('th-results');
  if (lobby) lobby.style.display = '';
  if (game)  game.style.display  = 'none';
  if (results) results.style.display = 'none';

  // Update map count display
  const mapCount = document.getElementById('th-map-count');
  if (mapCount) mapCount.textContent = maps;

  const useBtn = document.getElementById('th-use-map-btn');
  if (useBtn) {
    useBtn.disabled = maps <= 0;
    useBtn.onclick = startTreasureHunt;
  }

  const buyBtn = document.getElementById('th-buy-map-btn');
  if (buyBtn) {
    const cost = 500;
    buyBtn.disabled = save.gold < cost;
    buyBtn.textContent = `💰 Buy Map (${cost}g)`;
    buyBtn.onclick = () => {
      if (save.gold < cost) return;
      save.gold -= cost;
      save.treasureMaps = (save.treasureMaps || 0) + 1;
      writeSave();
      renderTreasureHunt();
    };
  }

  showScreen('treasure-hunt');
}

// ══════════════════════════════════════════════════════════════
//  GAME START
// ══════════════════════════════════════════════════════════════
function startTreasureHunt() {
  // Consume a map
  save.treasureMaps = Math.max(0, (save.treasureMaps ?? 0) - 1);
  writeSave();

  // Reset state
  nextId   = 0;
  busy     = false;
  gameActive = true;
  grantExtra = false;
  turnsLeft = TH_START_TURNS;
  rewards   = { gold: 0, materials: {}, equipment: [], shards: {} };
  gemEls.clear();

  // Generate board
  board = generateTHBoard();

  // Switch to game view
  const lobby = document.getElementById('th-lobby');
  const game  = document.getElementById('th-game');
  const results = document.getElementById('th-results');
  if (lobby) lobby.style.display = 'none';
  if (game)  game.style.display  = '';
  if (results) results.style.display = 'none';

  // Render
  initBoardDOM();
  updateHUD();
  bindInput();

  // Scale to fit viewport
  if (thResizeHandler) window.removeEventListener('resize', thResizeHandler);
  thResizeHandler = () => scaleTH();
  window.addEventListener('resize', thResizeHandler);
  requestAnimationFrame(scaleTH);
}

// ══════════════════════════════════════════════════════════════
//  BOARD GENERATION
// ══════════════════════════════════════════════════════════════
function randomSpawnTier() {
  const total = SPAWN_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const sw of SPAWN_WEIGHTS) {
    r -= sw.weight;
    if (r <= 0) return sw.tier;
  }
  return 1;
}

function generateTHBoard() {
  const b = Array.from({ length: TH_BOARD_SIZE }, () => Array(TH_BOARD_SIZE).fill(null));
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    for (let c = 0; c < TH_BOARD_SIZE; c++) {
      // Prevent pre-existing matches of 3
      const forbidden = new Set();
      if (c >= 2 && b[r][c-1] && b[r][c-2] && b[r][c-1].tier === b[r][c-2].tier)
        forbidden.add(b[r][c-1].tier);
      if (r >= 2 && b[r-1][c] && b[r-2][c] && b[r-1][c].tier === b[r-2][c].tier)
        forbidden.add(b[r-1][c].tier);

      let tier;
      let attempts = 0;
      do {
        tier = randomSpawnTier();
        attempts++;
      } while (forbidden.has(tier) && attempts < 20);

      b[r][c] = { tier, id: bumpId() };
    }
  }
  return b;
}

// ══════════════════════════════════════════════════════════════
//  BOARD DOM
// ══════════════════════════════════════════════════════════════
function tierData(tier) {
  return TREASURE_TIERS[tier - 1] || TREASURE_TIERS[0];
}

function createTileEl(id, tier, r, c) {
  const td = tierData(tier);
  const el = document.createElement('div');
  el.className = `th-tile th-tier-${td.id}`;
  el.dataset.id = id;
  el.dataset.r  = r;
  el.dataset.c  = c;

  const inner = document.createElement('div');
  inner.className = 'th-tile-inner';

  // Use SVG art if available, fall back to emoji
  const svgFn = TILE_SVG[td.id];
  if (svgFn) {
    inner.innerHTML = svgFn();
  } else {
    inner.textContent = td.emoji;
  }
  el.appendChild(inner);

  el.style.transition = 'none';
  el.style.transform  = `translate(${c * CELL}px, ${r * CELL}px)`;
  return el;
}

function setTilePos(el, r, c, duration) {
  if (duration === undefined) duration = ANIM_SWAP;
  if (duration === 0) {
    el.style.transition = 'none';
    el.getBoundingClientRect();
  } else {
    el.style.transition = `transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
  }
  el.style.transform = `translate(${c * CELL}px, ${r * CELL}px)`;
  el.dataset.r = r;
  el.dataset.c = c;
}

function updateTileVisual(el, tier) {
  const td = tierData(tier);
  // Update class
  el.className = `th-tile th-tier-${td.id}`;
  // Update SVG / emoji
  const inner = el.querySelector('.th-tile-inner');
  if (inner) {
    const svgFn = TILE_SVG[td.id];
    if (svgFn) {
      inner.innerHTML = svgFn();
    } else {
      inner.textContent = td.emoji;
    }
  }
}

function initBoardDOM() {
  const boardEl = document.getElementById('th-board');
  if (!boardEl) return;
  boardEl.innerHTML = '';
  gemEls.clear();
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    for (let c = 0; c < TH_BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      const el = createTileEl(cell.id, cell.tier, r, c);
      if (cell.locked) el.classList.add('th-tile-locked');
      boardEl.appendChild(el);
      gemEls.set(cell.id, el);
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  SCALE-TO-FIT  (mirrors scaleBattle pattern)
// ══════════════════════════════════════════════════════════════
function scaleTH() {
  const game   = document.getElementById('th-game');
  const layout = game?.querySelector('.th-game-layout');
  if (!game || !layout || game.style.display === 'none') return;

  const availW = game.clientWidth;
  const availH = game.clientHeight;
  if (!availW || !availH) return;

  const s = Math.min(availW / TH_DESIGN_W, availH / TH_DESIGN_H, 1);
  const visW = TH_DESIGN_W * s;
  const visH = TH_DESIGN_H * s;
  const ofsX = Math.max(0, (availW - visW) / 2);
  const ofsY = Math.max(0, (availH - visH) / 2);

  layout.style.left      = `${ofsX}px`;
  layout.style.top       = `${ofsY}px`;
  layout.style.transform = `scale(${s.toFixed(4)})`;
}

function cleanupTHResize() {
  if (thResizeHandler) {
    window.removeEventListener('resize', thResizeHandler);
    thResizeHandler = null;
  }
}

// ══════════════════════════════════════════════════════════════
//  HUD
// ══════════════════════════════════════════════════════════════
function updateHUD() {
  const turnsEl = document.getElementById('th-turns');
  if (turnsEl) turnsEl.textContent = turnsLeft;

  const goldEl = document.getElementById('th-reward-gold');
  if (goldEl) goldEl.textContent = rewards.gold;

  // Count total mats
  const matCount = Object.values(rewards.materials).reduce((s, v) => s + v, 0);
  const matEl = document.getElementById('th-reward-mats');
  if (matEl) matEl.textContent = matCount;

  const eqEl = document.getElementById('th-reward-equip');
  if (eqEl) eqEl.textContent = rewards.equipment.length;

  const shardCount = Object.values(rewards.shards).reduce((s, v) => s + v, 0);
  const shardEl = document.getElementById('th-reward-shards');
  if (shardEl) shardEl.textContent = shardCount;

  updateBoardCounts();
}

function updateBoardCounts() {
  const counts = {};
  for (let t = 1; t <= MAX_TIER; t++) counts[t] = 0;
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    for (let c = 0; c < TH_BOARD_SIZE; c++) {
      if (board[r][c]) counts[board[r][c].tier]++;
    }
  }
  for (let t = 1; t <= MAX_TIER; t++) {
    const el = document.getElementById(`th-cnt-${t}`);
    if (el) {
      el.textContent = counts[t];
      const row = el.closest('.th-count-row');
      if (row) row.classList.toggle('has-none', counts[t] === 0);
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  INPUT
// ══════════════════════════════════════════════════════════════
function bindInput() {
  const boardEl = document.getElementById('th-board');
  if (!boardEl) return;
  boardEl.addEventListener('pointerdown', onPointerDown);
  boardEl.addEventListener('pointermove', e => e.preventDefault());
  boardEl.addEventListener('pointerup',   onPointerUp);
}

function onPointerDown(e) {
  if (busy || !gameActive) return;
  ptrDown = true;
  startX = e.clientX;
  startY = e.clientY;

  // Figure out which cell from the target
  const tile = e.target.closest('.th-tile');
  if (tile && !tile.classList.contains('th-tile-locked')) {
    startR = +tile.dataset.r;
    startC = +tile.dataset.c;
  } else {
    startR = -1;
    startC = -1;
  }
}

function onPointerUp(e) {
  if (!ptrDown || busy || !gameActive) return;
  ptrDown = false;
  if (startR < 0) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  let dr = 0, dc = 0;
  if (Math.abs(dx) >= Math.abs(dy)) dc = dx > 0 ? 1 : -1;
  else dr = dy > 0 ? 1 : -1;

  const nr = startR + dr;
  const nc = startC + dc;
  if (nr < 0 || nr >= TH_BOARD_SIZE || nc < 0 || nc >= TH_BOARD_SIZE) return;

  // Don't swap with locked tiles
  const target = board[nr][nc];
  if (target && target.locked) return;

  attemptSwap(startR, startC, nr, nc);
}

// ══════════════════════════════════════════════════════════════
//  MATCH DETECTION (adapted for tier-based tiles)
// ══════════════════════════════════════════════════════════════
function findAllMatches() {
  const matched = new Set();

  // Horizontal runs (skip locked tiles — they break runs)
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= TH_BOARD_SIZE; c++) {
      const cur  = c < TH_BOARD_SIZE ? board[r][c] : null;
      const prev = board[r][c-1];
      const same = cur && prev && !cur.locked && !prev.locked &&
                   cur.tier === prev.tier;
      if (same) { run++; }
      else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) {
            if (!board[r][k]?.locked) matched.add(`${r},${k}`);
          }
        }
        run = 1;
      }
    }
  }

  // Vertical runs (skip locked tiles)
  for (let c = 0; c < TH_BOARD_SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= TH_BOARD_SIZE; r++) {
      const cur  = r < TH_BOARD_SIZE ? board[r][c] : null;
      const prev = board[r-1][c];
      const same = cur && prev && !cur.locked && !prev.locked &&
                   cur.tier === prev.tier;
      if (same) { run++; }
      else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) {
            if (!board[k][c]?.locked) matched.add(`${k},${c}`);
          }
        }
        run = 1;
      }
    }
  }

  return matched;
}

/** BFS connected groups of same-tier matched tiles. Returns array of { tier, cells: [{r,c}] } */
function findMatchGroups(matched) {
  const visited = new Set();
  const groups = [];

  for (const key of matched) {
    if (visited.has(key)) continue;
    const [r, c] = key.split(',').map(Number);
    const tier = board[r][c]?.tier;
    if (tier == null) continue;

    const queue = [key];
    visited.add(key);
    const cells = [];

    while (queue.length) {
      const cur = queue.shift();
      const [cr, cc] = cur.split(',').map(Number);
      cells.push({ r: cr, c: cc });

      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = cr + dr, nc = cc + dc;
        const nk = `${nr},${nc}`;
        if (nr >= 0 && nr < TH_BOARD_SIZE && nc >= 0 && nc < TH_BOARD_SIZE &&
            matched.has(nk) && !visited.has(nk) &&
            board[nr][nc] && board[nr][nc].tier === tier) {
          visited.add(nk);
          queue.push(nk);
        }
      }
    }

    groups.push({ tier, cells });
  }

  return groups;
}

function findValidMoves() {
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    for (let c = 0; c < TH_BOARD_SIZE; c++) {
      if (board[r][c]?.locked) continue;   // locked tiles can't move
      for (const [dr, dc] of [[0,1],[1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= TH_BOARD_SIZE || nc >= TH_BOARD_SIZE) continue;
        if (board[nr][nc]?.locked) continue; // can't swap with locked
        // Temp swap
        [board[r][c], board[nr][nc]] = [board[nr][nc], board[r][c]];
        const has = findAllMatches().size > 0;
        [board[r][c], board[nr][nc]] = [board[nr][nc], board[r][c]];
        if (has) return true;
      }
    }
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
//  SWAP + MATCH PROCESSING
// ══════════════════════════════════════════════════════════════
function attemptSwap(r1, c1, r2, c2) {
  busy = true;
  grantExtra = false;

  // Swap in data
  [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];

  // Animate swap
  const el1 = gemEls.get(board[r1][c1]?.id);
  const el2 = gemEls.get(board[r2][c2]?.id);
  if (el1) setTilePos(el1, r1, c1, ANIM_SWAP);
  if (el2) setTilePos(el2, r2, c2, ANIM_SWAP);

  setTimeout(() => {
    const matched = findAllMatches();
    if (matched.size === 0) {
      // Swap back
      [board[r1][c1], board[r2][c2]] = [board[r2][c2], board[r1][c1]];
      if (el1) setTilePos(el1, r2, c2, ANIM_SWAP);
      if (el2) setTilePos(el2, r1, c1, ANIM_SWAP);
      setTimeout(() => { busy = false; }, ANIM_SWAP + 20);
      return;
    }

    processMatches(matched);
  }, ANIM_SWAP + 20);
}

function processMatches(matched) {
  const groups = findMatchGroups(matched);

  // Check for extra turn: any group of 4+ tiles
  for (const g of groups) {
    if (g.cells.length >= 4) grantExtra = true;
  }

  // Pop animation on all matched tiles
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    const cell = board[r][c];
    if (!cell) continue;
    const el = gemEls.get(cell.id);
    if (el) {
      const inner = el.querySelector('.th-tile-inner');
      if (inner) inner.classList.add('popping');
    }
  }

  setTimeout(() => {
    // Remove all matched tiles from DOM and board, then place upgraded tiles
    const upgradeTargets = [];
    const lockTargets = [];  // max-tier groups: lock in place instead of removing
    for (const group of groups) {
      const sorted = [...group.cells].sort((a, b) => b.r - a.r || b.c - a.c);
      const target = sorted[0];
      const newTier = Math.min(group.tier + 1, MAX_TIER);

      if (group.tier >= MAX_TIER) {
        // Max-tier match: award rewards + lock each tile in place
        for (const cell of group.cells) {
          awardTileReward(group.tier);
          lockTargets.push({ r: cell.r, c: cell.c });
        }
        // Don't remove these — skip them entirely
        continue;
      }

      // Remove all cells in group from DOM
      for (const cell of group.cells) {
        const { r, c } = cell;
        const bc = board[r][c];
        if (bc) {
          const el = gemEls.get(bc.id);
          if (el) el.remove();
          gemEls.delete(bc.id);
        }
        board[r][c] = null;
      }

      // Mark upgrade target
      upgradeTargets.push({ r: target.r, c: target.c, tier: newTier });
    }

    // Lock max-tier tiles (keep on board, mark immovable)
    for (const lt of lockTargets) {
      const cell = board[lt.r][lt.c];
      if (cell && !cell.locked) {
        cell.locked = true;
        const el = gemEls.get(cell.id);
        if (el) el.classList.add('th-tile-locked');
      }
    }

    // Place upgraded tiles
    const boardEl = document.getElementById('th-board');
    for (const ut of upgradeTargets) {
      const id = bumpId();
      const isMaxTier = ut.tier >= MAX_TIER;
      board[ut.r][ut.c] = { tier: ut.tier, id, locked: isMaxTier };
      const el = createTileEl(id, ut.tier, ut.r, ut.c);
      el.classList.add('th-upgraded');
      if (isMaxTier) {
        el.classList.add('th-tile-locked');
        awardTileReward(ut.tier);
      }
      boardEl.appendChild(el);
      gemEls.set(id, el);
    }

    // Resolve gravity
    resolveGravity(() => {
      // Check for cascading matches
      const newMatched = findAllMatches();
      if (newMatched.size > 0) {
        processMatches(newMatched);
        return;
      }

      // All cascades done — handle turn logic
      if (grantExtra) {
        turnsLeft++;
        showToast('+1 Turn!');
      }

      turnsLeft--;
      updateHUD();

      if (turnsLeft <= 0) {
        endTreasureHunt();
        return;
      }

      // Check for deadlock — reshuffle if needed
      if (!findValidMoves()) {
        showToast('No moves — reshuffling!');
        setTimeout(() => {
          reshuffleBoard();
          busy = false;
        }, 800);
        return;
      }

      busy = false;
    });
  }, ANIM_MATCH + 20);
}

// ══════════════════════════════════════════════════════════════
//  GRAVITY
// ══════════════════════════════════════════════════════════════
function resolveGravity(cb) {
  const boardEl = document.getElementById('th-board');

  for (let c = 0; c < TH_BOARD_SIZE; c++) {
    // Work in segments separated by locked tiles.
    // Process bottom-up: find each "gap" of empty cells above non-locked tiles
    // and shift free tiles down within each segment.

    // Collect segment boundaries: a segment is a contiguous range of rows
    // not interrupted by locked tiles.  Locked tiles sit on fixed rows.
    let writeRow = TH_BOARD_SIZE - 1;

    // Phase 1: compact free tiles downward, skipping locked cells
    for (let r = TH_BOARD_SIZE - 1; r >= 0; r--) {
      if (board[r][c] !== null && board[r][c].locked) {
        // Locked tile: reset writeRow to just above it
        writeRow = r - 1;
        continue;
      }
      if (board[r][c] !== null) {
        if (writeRow !== r) {
          board[writeRow][c] = board[r][c];
          board[r][c] = null;
          const el = gemEls.get(board[writeRow][c].id);
          if (el) setTilePos(el, writeRow, c, ANIM_FALL);
        }
        writeRow--;
        // If we hit a locked tile going up, skip it
        while (writeRow >= 0 && board[writeRow][c]?.locked) writeRow--;
      }
    }

    // Phase 2: fill remaining empty (non-locked) cells with new tiles
    let spawnIdx = 0;
    for (let r = writeRow; r >= 0; r--) {
      if (board[r][c]?.locked) continue;  // skip locked cells
      const id   = bumpId();
      const tier = randomSpawnTier();
      board[r][c] = { tier, id };

      const el = createTileEl(id, tier, -(spawnIdx + 1), c);
      boardEl.appendChild(el);
      gemEls.set(id, el);

      el.getBoundingClientRect(); // force layout
      setTilePos(el, r, c, ANIM_FALL);
      spawnIdx++;
    }
  }

  setTimeout(cb, ANIM_FALL + 40);
}

function reshuffleBoard() {
  // Collect locked tiles to preserve their positions
  const lockedCells = [];
  for (let r = 0; r < TH_BOARD_SIZE; r++) {
    for (let c = 0; c < TH_BOARD_SIZE; c++) {
      if (board[r][c]?.locked) lockedCells.push({ r, c, cell: board[r][c] });
    }
  }

  let attempts = 0;
  do {
    // Gather only non-locked tile tiers
    const allTiers = [];
    for (let r = 0; r < TH_BOARD_SIZE; r++) {
      for (let c = 0; c < TH_BOARD_SIZE; c++) {
        if (board[r][c] && !board[r][c].locked) allTiers.push(board[r][c].tier);
      }
    }

    // Shuffle the tier array
    for (let i = allTiers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiers[i], allTiers[j]] = [allTiers[j], allTiers[i]];
    }

    let idx = 0;
    for (let r = 0; r < TH_BOARD_SIZE; r++) {
      for (let c = 0; c < TH_BOARD_SIZE; c++) {
        if (board[r][c]?.locked) continue;  // keep locked cells
        board[r][c] = { tier: allTiers[idx++], id: bumpId() };
      }
    }

    attempts++;
  } while (!findValidMoves() && attempts < 30);

  initBoardDOM();
}

// ══════════════════════════════════════════════════════════════
//  REWARDS
// ══════════════════════════════════════════════════════════════
function awardTileReward(tier) {
  const td = TREASURE_TIERS[tier - 1];
  if (!td) return;
  const rw = TILE_REWARDS[td.id];
  if (!rw) return;

  if (rw.type === 'gold') {
    rewards.gold += rw.amount;
  } else if (rw.type === 'materials') {
    const [lo, hi] = rw.amount;
    const qty = lo + Math.floor(Math.random() * (hi - lo + 1));
    // Pick random base materials
    const baseMats = MATERIAL_IDS.filter(id => MATERIALS[id].tier === 'base');
    for (let i = 0; i < qty; i++) {
      const matId = baseMats[Math.floor(Math.random() * baseMats.length)];
      rewards.materials[matId] = (rewards.materials[matId] || 0) + 1;
    }
  } else if (rw.type === 'equipment') {
    const item = ALL_EQUIPMENT[Math.floor(Math.random() * ALL_EQUIPMENT.length)];
    rewards.equipment.push(item);
  } else if (rw.type === 'shards') {
    const [lo, hi] = rw.amount;
    const qty = lo + Math.floor(Math.random() * (hi - lo + 1));
    // Pick a random unlocked hero
    if (save.unlockedCharIds.length > 0) {
      const heroId = save.unlockedCharIds[Math.floor(Math.random() * save.unlockedCharIds.length)];
      rewards.shards[heroId] = (rewards.shards[heroId] || 0) + qty;
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  END GAME
// ══════════════════════════════════════════════════════════════
function endTreasureHunt() {
  gameActive = false;
  busy = true;
  cleanupTHResize();

  showToast('Time\'s Up!');

  setTimeout(() => {
    // Tally all tiles remaining on the board (skip locked — already rewarded)
    for (let r = 0; r < TH_BOARD_SIZE; r++) {
      for (let c = 0; c < TH_BOARD_SIZE; c++) {
        if (board[r][c] && !board[r][c].locked) {
          awardTileReward(board[r][c].tier);
        }
      }
    }

    // Apply rewards to save
    save.gold += rewards.gold;

    for (const [matId, qty] of Object.entries(rewards.materials)) {
      save.materials[matId] = (save.materials[matId] || 0) + qty;
    }

    for (const item of rewards.equipment) {
      save.inventory.push(item.id);
    }

    for (const [heroId, qty] of Object.entries(rewards.shards)) {
      if (save.charData[heroId]) {
        save.charData[heroId].shards = (save.charData[heroId].shards || 0) + qty;
      }
    }

    writeSave();
    showResults();
  }, 1200);
}

function showResults() {
  const lobby  = document.getElementById('th-lobby');
  const game   = document.getElementById('th-game');
  const results = document.getElementById('th-results');
  if (lobby) lobby.style.display = 'none';
  if (game)  game.style.display  = 'none';
  if (results) results.style.display = '';

  const body = document.getElementById('th-results-body');
  if (!body) return;

  let html = '<div class="thr-section"><h3>🪙 Gold</h3><div class="thr-value">+' + rewards.gold + 'g</div></div>';

  // Materials
  const matEntries = Object.entries(rewards.materials).filter(([, q]) => q > 0);
  if (matEntries.length) {
    html += '<div class="thr-section"><h3>⚙️ Materials</h3><div class="thr-chips">';
    for (const [matId, qty] of matEntries) {
      const mat = MATERIALS[matId];
      html += `<span class="thr-chip">${mat?.emoji || matId} +${qty}</span>`;
    }
    html += '</div></div>';
  }

  // Equipment
  if (rewards.equipment.length) {
    html += '<div class="thr-section"><h3>📦 Equipment</h3><div class="thr-chips">';
    for (const item of rewards.equipment) {
      html += `<span class="thr-chip">${item.icon || '📦'} ${item.name}</span>`;
    }
    html += '</div></div>';
  }

  // Shards
  const shardEntries = Object.entries(rewards.shards).filter(([, q]) => q > 0);
  if (shardEntries.length) {
    html += '<div class="thr-section"><h3>✨ Hero Shards</h3><div class="thr-chips">';
    for (const [heroId, qty] of shardEntries) {
      html += `<span class="thr-chip">💎 ${heroId} +${qty}</span>`;
    }
    html += '</div></div>';
  }

  body.innerHTML = html;
}

export function collectTreasureResults() {
  cleanupTHResize();
  import('./home.js').then(m => m.renderHome());
}

// ══════════════════════════════════════════════════════════════
//  TOAST / BROADCAST
// ══════════════════════════════════════════════════════════════
function showToast(text) {
  const boardEl = document.getElementById('th-board');
  if (!boardEl) return;

  const toast = document.createElement('div');
  toast.className = 'th-toast';
  toast.textContent = text;
  boardEl.appendChild(toast);

  setTimeout(() => toast.remove(), 1500);
}
