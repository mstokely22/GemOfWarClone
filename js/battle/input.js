// ============================================================
//  GEMS OF COMBAT — Swipe / Pointer Input
// ============================================================
import { SWIPE_THRESHOLD } from '../data/constants.js';
import { state }           from '../state/gameState.js';
import { clearHint }       from './animation.js';
import { animateSwap }     from './animation.js';
import { findAllMatches }  from './matching.js';
import { processMatches }  from './core.js';

let dragState = null;

export function onPointerDown(e) {
  if (!state.playerTurn || state.busy || state.gameOver) return;
  const gem = e.target.closest('.gem');
  if (!gem) return;
  e.preventDefault();
  clearHint();
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
  if (!dragState) return;
  e.preventDefault(); // prevent scroll on touch devices
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
