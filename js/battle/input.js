// ============================================================
//  GEMS OF COMBAT — Swipe / Pointer Input + Targeting Mode
// ============================================================
import { SWIPE_THRESHOLD, BOARD_SIZE } from '../data/constants.js';
import { state }           from '../state/gameState.js';
import { clearHint }       from './animation.js';
import { animateSwap }     from './animation.js';
import { findAllMatches }  from './matching.js';
import { processMatches }  from './core.js';
import { renderTeams, renderTurnIndicator } from './rendering.js';

let dragState = null;

export function onPointerDown(e) {
  if (!state.playerTurn || state.busy || state.gameOver) return;
  const gem = e.target.closest('.gem');
  if (!gem) return;
  e.preventDefault();
  clearHint();

  // ── Targeting mode: gem/row/column selection ──────────────
  if (state.targeting) {
    // Only process gem clicks for board-targeting modes
    if (!['row', 'column', 'gem'].includes(state.targeting.type)) return;
    const r = +gem.dataset.r, c = +gem.dataset.c;
    const tgt = state.targeting;
    state.targeting = null;
    clearTargetHighlights();
    tgt.callback(r, c);
    return;
  }

  dragState = {
    r:      +gem.dataset.r,
    c:      +gem.dataset.c,
    startX: e.clientX,
    startY: e.clientY,
    el:     gem,
  };
  const inner = gem.querySelector('.gem-inner');
  if (inner) inner.style.filter = 'brightness(1.55)';
}

export function onPointerMove(e) {
  if (!dragState && !state.targeting) return;
  e.preventDefault();

  // When in targeting mode, highlight row/column on hover
  if (state.targeting && !dragState) {
    const gem = e.target.closest('.gem');
    if (!gem) return;
    const r = +gem.dataset.r, c = +gem.dataset.c;
    highlightTarget(state.targeting.type, r, c);
  }
}

export function onPointerUp(e) {
  if (!dragState) return;
  const { r, c, startX, startY, el } = dragState;
  dragState = null;

  const inner = el?.querySelector('.gem-inner');
  if (inner) inner.style.filter = '';

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (Math.max(adx, ady) < SWIPE_THRESHOLD) return; // tap, not swipe

  let nr = r, nc = c;
  if (adx > ady) { nc += dx > 0 ? 1 : -1; }
  else           { nr += dy > 0 ? 1 : -1; }

  if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return;
  attemptSwap(r, c, nr, nc);
}

export function onPointerCancel() {
  if (!dragState) return;
  const inner = dragState.el?.querySelector('.gem-inner');
  if (inner) inner.style.filter = '';
  dragState = null;
}

// ── Targeting mode helpers ────────────────────────────────────

/** Highlight gems based on targeting type + hovered position. */
function highlightTarget(type, r, c) {
  clearTargetHighlights();
  const board = document.getElementById('game-board');
  if (!board) return;

  if (type === 'row') {
    board.querySelectorAll('.gem').forEach(el => {
      if (+el.dataset.r === r) el.classList.add('target-highlight');
    });
  } else if (type === 'column') {
    board.querySelectorAll('.gem').forEach(el => {
      if (+el.dataset.c === c) el.classList.add('target-highlight');
    });
  } else if (type === 'gem') {
    // Highlight 3×3 around the gem
    board.querySelectorAll('.gem').forEach(el => {
      const gr = +el.dataset.r, gc = +el.dataset.c;
      if (Math.abs(gr - r) <= 1 && Math.abs(gc - c) <= 1) {
        el.classList.add('target-highlight');
      }
    });
  }
}

/** Remove all targeting highlights from the board. */
export function clearTargetHighlights() {
  document.querySelectorAll('.gem.target-highlight').forEach(el => {
    el.classList.remove('target-highlight');
  });
}

/** Enter targeting mode — called by spell cast functions. */
export function enterTargetingMode(type, casterIndex, callback) {
  state.targeting = { type, casterIndex, callback };
  // Show a broadcast hint
  const labels = { row: 'Select a row!', column: 'Select a column!', gem: 'Select a gem!' };
  const { addBroadcast } = _animRef;
  if (addBroadcast) addBroadcast(`🎯 ${labels[type] || 'Select target!'}`, 'bc-system');
}

// Lazy reference to avoid circular import
let _animRef = {};
export function injectInputDeps(anim) { _animRef = anim; }

export function attemptSwap(r1, c1, r2, c2) {
  state.busy = true;
  // Reset extra-turn latch at the start of each player turn action
  state.grantExtra = false;

  animateSwap(r1, c1, r2, c2, () => {
    const matched = findAllMatches(state.board);
    if (!matched.size) {
      // No match — animate swap back, no turn consumed
      state.grantExtra = false; // clean up
      animateSwap(r2, c2, r1, c1, () => { state.busy = false; });
      return;
    }
    processMatches(matched, true);
  });
}
