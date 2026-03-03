// ============================================================
//  GEMS OF COMBAT — Home Screen
// ============================================================
import { save }        from '../state/save.js';
import { DUNGEONS }    from '../data/dungeons.js';
import { showScreen }  from './navigation.js';

export function renderHome() {
  document.getElementById('hud-gold').textContent = save.gold;
  document.getElementById('home-gold').textContent = save.gold;

  const cleared = (save.dungeonsCleared || []).length;
  const total   = DUNGEONS.length;
  const active  = save.activeDungeon;

  let progressText;
  if (active && !active.dungeonComplete) {
    const def       = DUNGEONS.find(d => d.id === active.dungeonId);
    const roomsDone = active.rooms.filter(r => r.cleared && r.type !== 'start').length;
    progressText = `${def?.icon || '⚔'} ${def?.name || 'Dungeon'} in progress — ${roomsDone} rooms cleared`;
  } else if (cleared === 0) {
    progressText = 'No dungeons cleared yet';
  } else if (cleared >= total) {
    progressText = '🏆 All dungeons conquered!';
  } else {
    progressText = `${cleared} / ${total} dungeons cleared`;
  }

  document.getElementById('home-progress').textContent = progressText;
  showScreen('home');
}
