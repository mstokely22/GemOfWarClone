// ============================================================
//  GEMS OF COMBAT — Victory / Battle-End Screen
//  v3: XP distribution, level-up notifications, char unlocks
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { LEVELS }           from '../data/levels.js';
import { PACKS }            from '../data/packs.js';
import { getUnlockableChars, CHAR_BY_ID } from '../data/characters.js';
import { xpPerMember, levelFromXp } from '../data/leveling.js';
import { showScreen }       from './navigation.js';
import { pendingLevelIdx, goToTeamBuilder } from './teamBuilder.js';
import { renderMap }        from './map.js';
import { state }            from '../state/gameState.js';

export function showVictoryRewards(lvl, xpGained, levelUps, newChars) {
  document.getElementById('vict-level').textContent =
    `Level ${pendingLevelIdx + 1} — ${lvl.label}`;
  document.getElementById('vict-gold').textContent = `+${lvl.gold} 💰`;
  document.getElementById('vict-pack').textContent =
    lvl.packReward ? `+1 ${PACKS[lvl.packReward].name} 📦` : '';

  // XP summary
  const xpEl = document.getElementById('vict-xp');
  if (xpEl) {
    xpEl.textContent = xpGained > 0 ? `+${xpGained} XP per hero` : '';
  }

  // Level up notifications
  const lvlUpEl = document.getElementById('vict-levelups');
  if (lvlUpEl) {
    lvlUpEl.innerHTML = levelUps.map(lu =>
      `<div class="levelup-notice">⬆ ${lu.name} reached Level ${lu.level}!</div>`
    ).join('');
  }

  // New character unlocks
  const unlockEl = document.getElementById('vict-unlocks');
  if (unlockEl) {
    unlockEl.innerHTML = newChars.map(name =>
      `<div class="unlock-notice">🔓 ${name} has joined your roster!</div>`
    ).join('');
  }

  document.getElementById('vict-next-btn').style.display =
    pendingLevelIdx < LEVELS.length - 1 ? '' : 'none';
  showScreen('victory');
}

export function victToContinue() {
  renderMap();
}

export function victNextLevel() {
  if (pendingLevelIdx < LEVELS.length - 1) {
    goToTeamBuilder(pendingLevelIdx + 1);
  }
}

// Called by battle engine when a battle ends
export function onBattleEnd(won) {
  if (won) {
    const lvl = LEVELS[pendingLevelIdx];
    save.gold += lvl.gold;

    // Track highest level
    if (pendingLevelIdx >= save.highestLevel) {
      save.highestLevel = pendingLevelIdx + 1;
    }
    save.levelStars = save.levelStars || {};
    save.levelStars[pendingLevelIdx] = 1;

    // Pack reward
    if (lvl.packReward) {
      save.freePacks = save.freePacks || [];
      save.freePacks.push(lvl.packReward);
    }

    // ── XP Distribution ──────────────────────────────────────
    const livingCount = state.playerTeam.filter(t => t.life > 0).length;
    const xpEach = xpPerMember(lvl.difficulty || 1, Math.max(1, livingCount));
    const levelUps = [];

    // Distribute XP to all team members (alive only)
    const teamIds = save.team.filter(Boolean);
    for (const charId of teamIds) {
      ensureCharData(charId);
      const cData = save.charData[charId];
      // Find matching troop to check if alive
      const troop = state.playerTeam.find(t => t.charId === charId);
      if (!troop || troop.life <= 0) continue;

      const oldLevel = levelFromXp(cData.xp);
      cData.xp += xpEach;
      const newLevel = levelFromXp(cData.xp);

      if (newLevel > oldLevel) {
        levelUps.push({ name: troop.name, level: newLevel });
      }
    }

    // ── Character Unlocks ────────────────────────────────────
    const shouldUnlock = getUnlockableChars(save.highestLevel);
    const newChars = [];
    for (const charId of shouldUnlock) {
      if (!save.unlockedCharIds.includes(charId)) {
        save.unlockedCharIds.push(charId);
        ensureCharData(charId);
        const c = CHAR_BY_ID[charId];
        if (c) newChars.push(c.name);
      }
    }

    writeSave();
    showVictoryRewards(lvl, xpEach, levelUps, newChars);
  } else {
    renderMap();
  }
}

