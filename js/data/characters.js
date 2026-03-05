// ============================================================
//  GEMS OF COMBAT — Named Characters
//  v5: All non-starter heroes unlocked via Hero Draw mechanic.
// ============================================================

export const CHARACTERS = [
  // ─── Starters (always unlocked) ────────────────────────────
  { charId: 'roland', name: 'Roland',  classId: 'warrior',
    lore: 'A seasoned knight who once served the Crown Guard. Roland left the capital after refusing an unjust order, carrying nothing but his old axe and an unshakable sense of duty. His steadfast leadership has rallied many a broken militia to stand firm against the dark.' },
  { charId: 'elara',  name: 'Elara',   classId: 'priest',
    lore: 'Trained in the sanctuaries of Aeloria, Elara is a healer whose faith was tested when plague ravaged her village. She channels divine light not through scripture, but through sheer compassion — a force that even the undead recoil from.' },

  // ─── Draw pool (unlocked via Hero Draws) ───────────────────
  { charId: 'lyra',   name: 'Lyra',    classId: 'mage',
    lore: 'Lyra was expelled from the Arcane Academy for experimenting with forbidden gem-resonance magic. Now a wanderer, she bends raw mana to devastating effect — though some suspect her power has grown beyond her control.' },
  { charId: 'kael',   name: 'Kael',    classId: 'thief',
    lore: 'Born in the slums of Ironhaven, Kael learned to pick pockets before he learned to read. A master of stealth and blades, he claims to steal only from the wicked — though his definition of "wicked" conveniently includes anyone with a heavy purse.' },
  { charId: 'theron', name: 'Theron',  classId: 'paladin',
    lore: 'Theron took the Oath of Radiance at age twelve, the youngest in a hundred years. His divine shield has turned back siege engines, and his hammer glows with holy fire. Beneath the armor is a surprisingly gentle soul who tends a small herb garden between campaigns.' },
  { charId: 'sylva',  name: 'Sylva',   classId: 'ranger',
    lore: 'Raised by forest wardens in the Verdant Reach, Sylva speaks to birds and trails her quarry for days without rest. Her arrows fly true even in pitch darkness, guided by an almost supernatural sense of the wild.' },
  { charId: 'brynn',  name: 'Brynn',   classId: 'warrior',
    lore: 'Brynn earned the title "Ironclad" after surviving the Siege of Ashenmoor wearing nothing but chain mail and fury. She fights with reckless aggression, believing the best defense is an enemy too broken to swing back.' },
];

export const CHAR_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.charId, c])
);

/** Characters available in the draw pool (non-starters). */
export const DRAWABLE_CHARS = CHARACTERS.filter(
  c => c.charId !== 'roland' && c.charId !== 'elara'
);
