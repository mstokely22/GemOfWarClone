// ============================================================
//  GEMS OF COMBAT — Dungeon Select Screen
//  Lists all 5 dungeons. Locked ones show unlock condition.
//  Clicking an unlocked dungeon starts or resumes a run.
// ============================================================
import { save, writeSave }              from '../state/save.js';
import { DUNGEONS, isDungeonUnlocked }  from '../data/dungeons.js';
import { generateDungeon }             from '../dungeon/generator.js';
import { showScreen }                  from './navigation.js';

export function renderDungeonSelect() {
  document.getElementById('hud-gold').textContent = save.gold;
  const container = document.getElementById('dungeon-list');
  container.innerHTML = '';

  DUNGEONS.forEach(dungeon => {
    const cleared  = (save.dungeonsCleared || []).includes(dungeon.id);
    const unlocked = isDungeonUnlocked(dungeon, save.dungeonsCleared || []);
    const active   = save.activeDungeon?.dungeonId === dungeon.id && !save.activeDungeon?.dungeonComplete;

    const diffStars = '◆'.repeat(dungeon.difficulty) + '◇'.repeat(5 - dungeon.difficulty);

    let badge = '';
    if (!unlocked) {
      const needed = dungeon.unlockCondition.startsWith('clear:')
        ? dungeon.unlockCondition.slice(6).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : dungeon.unlockCondition;
      badge = `<span class="dsel-badge locked-badge">🔒 Clear ${needed}</span>`;
    } else if (active) {
      const progress = dungeon_progress(dungeon.id);
      badge = `<span class="dsel-badge active-badge">▶ ${progress} rooms cleared</span>`;
    } else if (cleared) {
      badge = `<span class="dsel-badge clear-badge">✓ Cleared</span>`;
    } else {
      badge = `<span class="dsel-badge avail-badge">⚔ Enter</span>`;
    }

    const card = document.createElement('div');
    card.className = `dsel-card${unlocked ? '' : ' dsel-locked'}${active ? ' dsel-active' : ''}${cleared ? ' dsel-cleared' : ''}`;

    card.innerHTML = `
      <div class="dsel-icon">${dungeon.icon}</div>
      <div class="dsel-body">
        <div class="dsel-name">${dungeon.name}</div>
        <div class="dsel-flavor">${dungeon.flavorText}</div>
        <div class="dsel-diff" title="Difficulty">${diffStars}</div>
      </div>
      <div class="dsel-right">
        ${badge}
        <div class="dsel-reward">🎁 ${dungeon.completionReward} pack</div>
      </div>
    `;

    if (unlocked) {
      card.addEventListener('click', () => enterDungeon(dungeon.id));
    }
    container.appendChild(card);
  });

  showScreen('dungeon-select');
}

function dungeon_progress(dungeonId) {
  if (save.activeDungeon?.dungeonId !== dungeonId) return 0;
  return save.activeDungeon.rooms.filter(r => r.cleared && r.type !== 'start').length;
}

function enterDungeon(dungeonId) {
  // Resume existing run for this dungeon, or generate a fresh one
  if (!save.activeDungeon
    || save.activeDungeon.dungeonId !== dungeonId
    || save.activeDungeon.dungeonComplete) {
    const run = generateDungeon(dungeonId);
    save.activeDungeon = {
      ...run,
      pendingRoomId:   null,
      pendingBattle:   null,
      dungeonComplete: false,
    };
    writeSave();
  }
  import('./dungeonMap.js').then(m => m.renderDungeonMap());
}
