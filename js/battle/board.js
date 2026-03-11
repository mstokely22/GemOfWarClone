// ============================================================
//  GEMS OF COMBAT — Board Generation + Gravity + Reshuffle
// ============================================================
import { GEM_TYPES, BOARD_SIZE, ANIM_FALL, EMPOWERED_SPAWN_CHANCE } from '../data/constants.js';
import { state }                             from '../state/gameState.js';
import { gemEls, createGemEl, setGemPos, initBoardDOM, bumpGemId, resetGemIds } from './gemDom.js';
import { findAllMatches, findValidMoves }    from './matching.js';

/** Roll whether a newly spawned gem is empowered. */
export function rollEmpowered() {
  let chance = EMPOWERED_SPAWN_CHANCE;
  // Passive bonuses added by gear/accessories increase the chance
  if (state.playerTeam) {
    for (const t of state.playerTeam) {
      if (t.life > 0 && t.passives?.some(p => p.id === 'empower_boost')) chance += 0.03;
    }
  }
  return Math.random() < chance;
}

export function randomGem() {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
}

export function generateBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
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
      board[r][c] = { type, id: bumpGemId(), empowered: rollEmpowered() };
    }
  }
  return board;
}

// Drop existing gems down to fill gaps + spawn new gems above the board,
// then call cb when animations complete.
export function resolveGravity(cb) {
  const boardEl   = document.getElementById('game-board');
  const fallMoves = [];
  const newGems   = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    let writeRow = BOARD_SIZE - 1;
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (state.board[r][c] !== null) {
        if (writeRow !== r) {
          fallMoves.push({ id: state.board[r][c].id, toRow: writeRow, col: c });
          state.board[writeRow][c] = state.board[r][c];
          state.board[r][c]        = null;
        }
        writeRow--;
      }
    }
    let spawnIdx = 0;
    for (let r = writeRow; r >= 0; r--) {
      const id   = bumpGemId();
      const type = randomGem();
      state.board[r][c] = { type, id, empowered: rollEmpowered() };
      newGems.push({ id, type, empowered: state.board[r][c].empowered, toRow: r, col: c, spawnIdx: spawnIdx++ });
    }
  }

  // Slide existing gems to their new rows
  for (const { id, toRow, col } of fallMoves) {
    const el = gemEls.get(id);
    if (el) setGemPos(el, toRow, col, ANIM_FALL);
  }

  // Spawn new gems above visible area and animate in
  for (const { id, type, empowered, toRow, col, spawnIdx } of newGems) {
    const el = createGemEl(id, type, -(spawnIdx + 1), col, empowered);
    boardEl.appendChild(el);
    gemEls.set(id, el);
    el.getBoundingClientRect(); // force layout so off-screen start registers
    setGemPos(el, toRow, col, ANIM_FALL);
  }

  setTimeout(cb, ANIM_FALL + 30);
}

// Reshuffle board — guarantees at least one valid move.
export function reshuffleBoard() {
  let attempts = 0;
  do {
    resetGemIds();
    state.board = generateBoard();
    attempts++;
  } while (!findValidMoves(state.board).length && attempts < 30);
  initBoardDOM();
}

// Check for deadlock. Returns true if a reshuffle was needed.
export function checkDeadlock() {
  if (!findValidMoves(state.board).length) {
    reshuffleBoard();
    return true;
  }
  return false;
}
