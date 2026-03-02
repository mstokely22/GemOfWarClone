// ============================================================
//  GEMS OF COMBAT — Named Characters
//  Each character is bound to a class and has an unlock condition.
// ============================================================

export const CHARACTERS = [
  // ─── Starters ───────────────────────────────────────────────
  { charId: 'roland', name: 'Roland',  classId: 'warrior', unlockCondition: 'start' },
  { charId: 'elara',  name: 'Elara',   classId: 'priest',  unlockCondition: 'start' },

  // ─── Story unlocks ─────────────────────────────────────────
  { charId: 'lyra',   name: 'Lyra',    classId: 'mage',    unlockCondition: 'level_3' },
  { charId: 'kael',   name: 'Kael',    classId: 'thief',   unlockCondition: 'level_5' },

  // ─── Later unlocks ─────────────────────────────────────────
  { charId: 'theron', name: 'Theron',  classId: 'paladin', unlockCondition: 'level_7' },
  { charId: 'sylva',  name: 'Sylva',   classId: 'ranger',  unlockCondition: 'level_9' },

  // ─── Bonus / duplicate-class characters ────────────────────
  { charId: 'brynn',  name: 'Brynn',   classId: 'warrior', unlockCondition: 'level_10' },
];

export const CHAR_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.charId, c])
);

/**
 * Given a highestLevel (0-based count of levels beaten),
 * return array of charIds that should be unlocked.
 */
export function getUnlockableChars(highestLevel) {
  return CHARACTERS.filter(c => {
    if (c.unlockCondition === 'start') return true;
    if (c.unlockCondition.startsWith('level_')) {
      const needed = parseInt(c.unlockCondition.split('_')[1], 10);
      return highestLevel >= needed;
    }
    return false;
  }).map(c => c.charId);
}
