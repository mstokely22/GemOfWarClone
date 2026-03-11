// ============================================================
//  GEMS OF COMBAT — Battle Engine (BATTLE API)
//  Wires all battle modules together and exposes window.BATTLE
// ============================================================
import { state, initState, _lastPlayerTeam, _lastEnemyTeam } from '../state/gameState.js';
import { generateBoard }     from './board.js';
import { gemEls, initBoardDOM, resetGemIds } from './gemDom.js';
import { renderTeams, renderTurnIndicator, injectCastSpell } from './rendering.js';
import { startHintTimer, resetBroadcast } from './animation.js';
import { castSpell, injectCoreDeps, applyBattleStartPassives, destroyGems } from './core.js';
import * as gemDomModule    from './gemDom.js';
import * as boardModule     from './board.js';
import { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, injectInputDeps } from './input.js';
import * as animModule       from './animation.js';
import { injectDestroyGems, injectEquipState } from '../data/equipment.js';

// Wire injection dependencies on load
injectCastSpell(castSpell);
injectCoreDeps(gemDomModule, boardModule);
injectInputDeps(animModule);
injectDestroyGems(destroyGems);
injectEquipState(state);

let _boardListenersAdded = false;

function startBattle(playerTeamData, enemyTeamData) {
  // Clear broadcast + gem DOM
  resetBroadcast();
  gemEls.clear();
  resetGemIds();

  // Initialize game state and generate board
  initState(playerTeamData, enemyTeamData);
  state.board = generateBoard();

  // Build board DOM
  initBoardDOM();
  applyBattleStartPassives();
  renderTeams();
  renderTurnIndicator();

  // Wire input events once
  if (!_boardListenersAdded) {
    const board = document.getElementById('game-board');
    board.addEventListener('pointerdown',   onPointerDown,  { passive: false });
    board.addEventListener('pointermove',   onPointerMove,  { passive: false });
    board.addEventListener('pointerup',     onPointerUp);
    board.addEventListener('pointercancel', onPointerCancel);
    _boardListenersAdded = true;
  }

  startHintTimer();
}

function retryBattle() {
  resetBroadcast();
  gemEls.clear();
  resetGemIds();

  // Re-use last teams
  initState(_lastPlayerTeam, _lastEnemyTeam);
  state.board = generateBoard();

  initBoardDOM();
  applyBattleStartPassives();
  renderTeams();
  renderTurnIndicator();
  startHintTimer();
}

// Expose global BATTLE API (consumed by screen modules)
window.BATTLE = { start: startBattle, retry: retryBattle };
