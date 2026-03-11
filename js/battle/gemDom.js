// ============================================================
//  GEMS OF COMBAT — Gem DOM Registry + Board DOM Init
// ============================================================
import { GEM_SIZE, GEM_GAP, CELL, ANIM_SWAP, ANIM_FALL, BOARD_SIZE } from '../data/constants.js';
import { state } from '../state/gameState.js';
import { GEM_SVG, empoweredOverlay } from '../art/gems.js';

// DOM Gem Registry
export const gemEls  = new Map();  // id → HTMLElement
export let   nextGemId = 0;

export function resetGemIds() { nextGemId = 0; }
export function bumpGemId()   { return nextGemId++; }

export function createGemEl(id, type, r, c, empowered = false) {
  const el = document.createElement('div');
  el.className  = `gem ${type}${empowered ? ' empowered' : ''}`;
  el.dataset.id = id;
  el.dataset.r  = r;
  el.dataset.c  = c;

  const inner = document.createElement('div');
  inner.className = 'gem-inner';

  // Replace emoji with ornate SVG art
  const svgFn = GEM_SVG[type];
  if (svgFn) {
    inner.innerHTML = svgFn();
  } else {
    inner.textContent = type;
  }

  // Empowered overlay — starburst ring
  if (empowered) {
    inner.innerHTML += empoweredOverlay();
  }

  el.appendChild(inner);

  el.style.transition = 'none';
  el.style.transform  = `translate(${c * CELL}px, ${r * CELL}px)`;
  return el;
}

export function setGemPos(el, r, c, duration) {
  if (duration === undefined) duration = ANIM_SWAP;
  if (duration === 0) {
    el.style.transition = 'none';
    el.getBoundingClientRect(); // flush
  } else {
    el.style.transition = `transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
  }
  el.style.transform = `translate(${c * CELL}px, ${r * CELL}px)`;
  el.dataset.r = r;
  el.dataset.c = c;
}

export function initBoardDOM() {
  const boardEl = document.getElementById('game-board');
  boardEl.innerHTML = '';
  gemEls.clear();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const { type, id, empowered } = state.board[r][c];
      const el = createGemEl(id, type, r, c, empowered);
      boardEl.appendChild(el);
      gemEls.set(id, el);
    }
  }
}
