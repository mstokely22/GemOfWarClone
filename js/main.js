// ============================================================
//  GEMS OF COMBAT — Application Entry Point
//  ES module: loaded via <script type="module" src="js/main.js">
// ============================================================

// Battle engine must load first so window.BATTLE is defined
import './battle/engine.js';

import { loadSave }        from './state/save.js';
import { scaleBattle }     from './utils/scaling.js';
import { renderHome }      from './screens/home.js';
import { renderDungeonMap } from './screens/dungeonMap.js';
import { renderHeroes }    from './screens/heroes.js';
import { renderPacks }     from './screens/packs.js';
import { renderUpgrade }   from './screens/upgrade.js';
import { renderDungeonSelect } from './screens/dungeonSelect.js';
import { goToTeamBuilder, launchBattle, closePicker } from './screens/teamBuilder.js';
import { victToContinue, victNextLevel, onBattleEnd } from './screens/victory.js';
import { collectGachaResult } from './screens/packs.js';

// ── Responsive scaling ────────────────────────────────────────
scaleBattle();
window.addEventListener('resize', scaleBattle);
window.addEventListener('orientationchange', () => setTimeout(scaleBattle, 120));

// ── Bridge for battle engine ──────────────────────────────────
window.onBattleEnd = onBattleEnd;

// ── Boot on DOM ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSave();
  renderHome();

  // ── Nav bar ────────────────────────────────────────────────
  document.getElementById('btn-battle')?.addEventListener('click', renderDungeonSelect);
  document.getElementById('btn-heroes')?.addEventListener('click', renderHeroes);
  document.getElementById('btn-packs')?.addEventListener('click', renderPacks);
  document.getElementById('btn-upgrade')?.addEventListener('click', renderUpgrade);
  document.getElementById('btn-home')?.addEventListener('click', renderHome);

  // ── Dungeon Select ──────────────────────────────────────────────
  document.getElementById('dungeon-select-back-btn')?.addEventListener('click', renderHome);

  // ── Dungeon Map ────────────────────────────────────────────────
  document.getElementById('dmap-back-btn')?.addEventListener('click', renderDungeonSelect);

  // ── Team builder ───────────────────────────────────────────
  document.getElementById('team-back-btn')?.addEventListener('click', renderDungeonMap);
  document.getElementById('launch-battle-btn')?.addEventListener('click', launchBattle);
  document.getElementById('picker-close-btn')?.addEventListener('click', closePicker);
  document.getElementById('hero-picker-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closePicker();
  });

  // ── Battle screen ──────────────────────────────────────────
  document.getElementById('battle-retreat-btn')?.addEventListener('click', () => {
    window.onBattleEnd(false);
  });

  // ── Victory ────────────────────────────────────────────────
  document.getElementById('vict-continue-btn')?.addEventListener('click', victToContinue);
  document.getElementById('vict-next-btn')?.addEventListener('click', victNextLevel);

  // ── Heroes / Roster screen ─────────────────────────────────
  document.getElementById('heroes-back-btn')?.addEventListener('click', renderHome);

  // ── Packs screen ───────────────────────────────────────────
  document.getElementById('packs-back-btn')?.addEventListener('click', renderHome);

  // ── Upgrade / Forge screen ─────────────────────────────────
  document.getElementById('upgrade-back-btn')?.addEventListener('click', renderHome);

  // ── Gacha / pack-opening ───────────────────────────────────
  document.getElementById('gacha-collect-btn')?.addEventListener('click', collectGachaResult);
});
