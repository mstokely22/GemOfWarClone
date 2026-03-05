// ============================================================
//  GEMS OF COMBAT — Named Characters
//  v5: All non-starter heroes unlocked via Hero Draw mechanic.
// ============================================================

export const CHARACTERS = [
  // ─── Starters (always unlocked) ────────────────────────────
  { charId: 'roland', name: 'Roland',  classId: 'warrior' },
  { charId: 'elara',  name: 'Elara',   classId: 'priest'  },

  // ─── Draw pool (unlocked via Hero Draws) ───────────────────
  { charId: 'lyra',   name: 'Lyra',    classId: 'mage'    },
  { charId: 'kael',   name: 'Kael',    classId: 'thief'   },
  { charId: 'theron', name: 'Theron',  classId: 'paladin' },
  { charId: 'sylva',  name: 'Sylva',   classId: 'ranger'  },
  { charId: 'brynn',  name: 'Brynn',   classId: 'warrior' },
];

export const CHAR_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.charId, c])
);

/** Characters available in the draw pool (non-starters). */
export const DRAWABLE_CHARS = CHARACTERS.filter(
  c => c.charId !== 'roland' && c.charId !== 'elara'
);
