// ============================================================
//  GEMS OF COMBAT — Victory / Battle-End Screen
//  v5: Stars replace levels, hero draws from boss clears,
//      equipment drops from combat/elite rooms.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { PACKS }                           from '../data/packs.js';
import { CHAR_BY_ID }                      from '../data/characters.js';
import { DUNGEON_BY_ID }                   from '../data/dungeons.js';
import { ALL_EQUIPMENT }                   from '../data/equipment.js';
import { showScreen }                      from './navigation.js';
import { state }                           from '../state/gameState.js'


let _dungeonComplete = false;

export function showVictoryRewards(gold, lootItem, heroDraw, dungeonComplete, dungeonName, treasureMap) {
  _dungeonComplete = dungeonComplete;

  document.getElementById('vict-level').textContent =
    dungeonComplete ? `🏆 ${dungeonName} Complete!` : `${dungeonName} — Room Cleared!`;
  document.getElementById('vict-gold').textContent = `+${gold} 💰`;

  let packText = '';
  if (dungeonComplete && save.activeDungeon) {
    const def  = DUNGEON_BY_ID[save.activeDungeon.dungeonId];
    const pack = PACKS[def?.completionReward];
    if (pack) packText = `+1 ${pack.name} 📦 awarded!`;
  }
  document.getElementById('vict-pack').textContent = packText;

  const xpEl = document.getElementById('vict-xp');
  if (xpEl) {
    const parts = [];
    if (heroDraw) parts.push('🎲 +1 Hero Draw!');
    if (treasureMap) parts.push('🗺️ +1 Treasure Map!');
    xpEl.textContent = parts.join('  ');
  }

  const lvlUpEl = document.getElementById('vict-levelups');
  if (lvlUpEl) lvlUpEl.innerHTML = heroDraw
    ? `<div class="levelup-notice">🎲 Boss cleared! Head to Heroes to use your draw.</div>`
    : '';

  const unlockEl = document.getElementById('vict-unlocks');
  if (unlockEl) {
    unlockEl.innerHTML = lootItem
      ? `<div class="unlock-notice">📦 Loot: ${lootItem.icon} ${lootItem.name} (${lootItem.rarity})</div>`
      : '';
  }

  document.getElementById('vict-continue-btn').textContent =
    dungeonComplete ? '🏠 Return Home' : '🗺 Back to Dungeon';
  document.getElementById('vict-next-btn').style.display = 'none';

  showScreen('victory');
}

export function victToContinue() {
  if (_dungeonComplete) {
    import('./home.js').then(m => m.renderHome());
  } else {
    import('./dungeonMap.js').then(m => m.renderDungeonMap());
  }
}

export function victNextLevel() {
  // Unused in dungeon mode — kept for wiring compatibility
  import('./dungeonMap.js').then(m => m.renderDungeonMap());
}

// ── Called by battle engine on win or loss ────────────────────
export function onBattleEnd(won) {
  if (!won) {
    // Loss: return to dungeon map (room is NOT cleared)
    if (save.activeDungeon) {
      save.activeDungeon.pendingRoomId  = null;
      save.activeDungeon.pendingBattle  = null;
      writeSave();
    }
    import('./dungeonMap.js').then(m => m.renderDungeonMap());
    return;
  }

  // ── Win ───────────────────────────────────────────────────
  const run  = save.activeDungeon;
  if (!run) { import('./home.js').then(m => m.renderHome()); return; }

  const room = run.rooms.find(r => r.id === run.pendingRoomId);
  const def  = DUNGEON_BY_ID[run.dungeonId];
  if (!room || !def) { import('./home.js').then(m => m.renderHome()); return; }

  // Mark room cleared
  room.cleared = true;

  const battle   = run.pendingBattle || {};
  const gold     = battle.gold || 0;
  const isBoss   = room.type === 'boss';
  save.gold     += gold;

  run.pendingRoomId = null;
  run.pendingBattle = null;

  // ── Equipment drop from combat/elite rooms ───────────────────
  let lootItem = null;
  if (room.type === 'combat' || room.type === 'elite') {
    lootItem = ALL_EQUIPMENT[Math.floor(Math.random() * ALL_EQUIPMENT.length)];
    save.inventory.push(lootItem.id);
  }

  // ── Treasure Map from treasure rooms ────────────────────────
  let treasureMapGained = false;
  if (room.type === 'treasure') {
    save.treasureMaps = (save.treasureMaps ?? 0) + 1;
    treasureMapGained = true;
  }

  // ── Hero Draw on boss clear ───────────────────────────────────
  let heroDraw = false;
  if (isBoss) {
    save.heroDraws = (save.heroDraws || 0) + 1;
    heroDraw = true;
  }

  // ── Dungeon completion ───────────────────────────────────────
  let dungeonComplete = false;
  if (isBoss) {
    dungeonComplete = true;
    run.dungeonComplete = true;
    if (!save.dungeonsCleared.includes(def.id)) {
      save.dungeonsCleared.push(def.id);
    }
    if (def.completionReward) {
      save.freePacks = save.freePacks || [];
      save.freePacks.push(def.completionReward);
    }
  }

  writeSave();
  showVictoryRewards(gold, lootItem, heroDraw, dungeonComplete, def.name, treasureMapGained);
}
