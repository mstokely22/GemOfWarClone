// ============================================================
//  GEMS OF COMBAT — Screen Navigation
// ============================================================
import { save } from '../state/save.js';

export let currentScreen = 'home';

export function updateGoldDisplays() {
  const g = save.gold;
  ['hud-gold','home-gold','dmap-gold','team-gold','heroes-gold','packs-gold','upgrade-gold','dungeon-select-gold','treasure-hunt-gold'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = g;
  });
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.classList.remove('hidden');
  currentScreen = id;
  updateGoldDisplays();
}
