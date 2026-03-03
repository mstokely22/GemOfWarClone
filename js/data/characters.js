// ============================================================
//  GEMS OF COMBAT — Named Characters
//  Unlock conditions tied to dungeon clears.
// ============================================================

export const CHARACTERS = [
  // ─── Starters ───────────────────────────────────────────────
  { charId: 'roland', name: 'Roland',  classId: 'warrior', unlockCondition: 'start' },
  { charId: 'elara',  name: 'Elara',   classId: 'priest',  unlockCondition: 'start' },

  // ─── Dungeon unlocks ────────────────────────────────────────
  { charId: 'lyra',   name: 'Lyra',    classId: 'mage',    unlockCondition: 'clear:slime_pits' },
  { charId: 'kael',   name: 'Kael',    classId: 'thief',   unlockCondition: 'clear:slime_pits' },
  { charId: 'theron', name: 'Theron',  classId: 'paladin', unlockCondition: 'clear:bandit_outpost' },
  { charId: 'sylva',  name: 'Sylva',   classId: 'ranger',  unlockCondition: 'clear:frozen_caverns' },
  { charId: 'brynn',  name: 'Brynn',   classId: 'warrior', unlockCondition: 'clear:volcanic_depths' },
];

export const CHAR_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.charId, c])
);

/**
 * Given the array of cleared dungeon IDs, return all charIds that should be unlocked.
 */
export function getUnlockableChars(dungeonsCleared = []) {
  return CHARACTERS.filter(c => {
    if (c.unlockCondition === 'start') return true;
    if (c.unlockCondition.startsWith('clear:')) {
      return dungeonsCleared.includes(c.unlockCondition.slice(6));
    }
    return false;
  }).map(c => c.charId);
}

/** Human-readable unlock hint shown on the roster for locked characters. */
export function unlockHint(unlockCondition) {
  if (unlockCondition === 'start') return 'Available';
  if (unlockCondition.startsWith('clear:')) {
    const name = unlockCondition.slice(6).replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return `Clear ${name}`;
  }
  return unlockCondition;
}
