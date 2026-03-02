// ============================================================
//  GEMS OF COMBAT — Map Screen
// ============================================================
import { save }            from '../state/save.js';
import { LEVELS }          from '../data/levels.js';

import { showScreen }      from './navigation.js';
import { goToTeamBuilder } from './teamBuilder.js';

export function renderMap() {
  document.getElementById('hud-gold').textContent = save.gold;
  const container = document.getElementById('map-nodes');
  container.innerHTML = '';

  LEVELS.forEach((lvl, i) => {
    const unlocked  = i === 0 || save.highestLevel >= i;
    const completed = save.highestLevel > i;
    const current   = !completed && unlocked;

    const node = document.createElement('div');
    node.className = 'map-node' +
      (completed ? ' completed' : '') +
      (current   ? ' current'   : '') +
      (!unlocked ? ' locked'    : '');

    const starsHtml = completed ? '⭐' : (unlocked ? '' : '🔒');
    const diffDots  = '◆'.repeat(lvl.difficulty) + '◇'.repeat(5 - lvl.difficulty);

    node.innerHTML = `
      <div class="node-num">${i + 1}</div>
      <div class="node-label">${lvl.label}</div>
      <div class="node-diff">${diffDots}</div>
      <div class="node-reward">💰 ${lvl.gold}g${lvl.packReward ? ' + 📦' : ''}</div>
      <div class="node-star">${starsHtml}</div>
    `;
    if (unlocked) node.addEventListener('click', () => goToTeamBuilder(i));
    container.appendChild(node);

    if (i < LEVELS.length - 1) {
      const line = document.createElement('div');
      line.className = 'map-line' + (completed ? ' done' : '');
      container.appendChild(line);
    }
  });

  showScreen('map');
}
