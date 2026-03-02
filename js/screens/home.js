// ============================================================
//  GEMS OF COMBAT — Home Screen
// ============================================================
import { save }       from '../state/save.js';
import { showScreen } from './navigation.js';

export function renderHome() {
  document.getElementById('hud-gold').textContent = save.gold;
  const best = save.highestLevel;
  document.getElementById('home-progress').textContent =
    best === 0   ? 'No battles won yet' :
    best >= 10   ? '🏆 All 10 levels complete!' :
    `Progress: Level ${best}/10 complete`;
  showScreen('home');
}
