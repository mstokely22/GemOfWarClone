// ============================================================
//  GEMS OF COMBAT — Victory / Battle-End Screen
//  v4: Dungeon room flow — clears room, returns to dungeon map.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { PACKS }                           from '../data/packs.js';
import { getUnlockableChars, CHAR_BY_ID }  from '../data/characters.js';
import { xpPerMember, levelFromXp }        from '../data/leveling.js';
import { DUNGEON_BY_ID }                   from '../data/dungeons.js';
import { showScreen }                      from './navigation.js';
import { state }                           from '../state/gameState.js';

let _dungeonComplete = false;

export function showVictoryRewards(gold, xpGained, levelUps, newChars, dungeonComplete, dungeonName) {
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
  if (xpEl) xpEl.textContent = xpGained > 0 ? `+${xpGained} XP` : '';

  const lvlUpEl = document.getElementById('vict-levelups');
  if (lvlUpEl) lvlUpEl.innerHTML = levelUps.map(lu =>
    `<div class="levelup-notice">⬆ ${lu.name} → Level ${lu.level}!</div>`
  ).join('');

  const unlockEl = document.getElementById('vict-unlocks');
  if (unlockEl) unlockEl.innerHTML = newChars.map(name =>
    `<div class="unlock-notice">🔓 ${name} joined your roster!</div>`
  ).join('');

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

  // ── XP Distribution ─────────────────────────────────────────
  const difficulty  = def.difficulty || 1;
  const livingCount = state.playerTeam.filter(t => t.life > 0).length;
  const xpEach      = xpPerMember(difficulty, Math.max(1, livingCount));
  const levelUps    = [];

  for (const charId of save.team.filter(Boolean)) {
    ensureCharData(charId);
    const cData = save.charData[charId];
    const troop = state.playerTeam.find(t => t.charId === charId);
    if (!troop || troop.life <= 0) continue;
    const oldLevel = levelFromXp(cData.xp);
    cData.xp += xpEach;
    const newLevel = levelFromXp(cData.xp);
    if (newLevel > oldLevel) levelUps.push({ name: troop.name, level: newLevel });
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

  // ── Character unlocks ────────────────────────────────────────
  const shouldUnlock = getUnlockableChars(save.dungeonsCleared);
  const newChars     = [];
  for (const charId of shouldUnlock) {
    if (!save.unlockedCharIds.includes(charId)) {
      save.unlockedCharIds.push(charId);
      ensureCharData(charId);
      const c = CHAR_BY_ID[charId];
      if (c) newChars.push(c.name);
    }
  }

  writeSave();
  showVictoryRewards(gold, xpEach, levelUps, newChars, dungeonComplete, def.name);
}
