// ============================================================
//  GEMS OF COMBAT — Save State (localStorage persistence)
//  v3: character-class + equipment model
// ============================================================
import { defaultMaterials } from '../data/materials.js';

export const SAVE_KEY = 'gems_of_combat_v3';

const DEFAULT_SAVE = {
  gold: 300,
  highestLevel: 0,
  levelStars: {},                       // { 0: 1, 4: 1 … } levelIndex → stars

  // ── Characters ──────────────────────────────────────────────
  unlockedCharIds: ['roland', 'elara'],
  team: ['roland', 'elara', null, null], // 4-slot party (charIds)

  // Per-character data: XP + equipment loadout
  charData: {
    roland: { xp: 0, weapon: 'iron_axe', armor: 'iron_breastplate', acc1: null, acc2: null },
    elara:  { xp: 0, weapon: 'wooden_mace', armor: 'padded_armor',  acc1: null, acc2: null },
  },

  // ── Equipment Inventory ─────────────────────────────────────
  // Flat array of equipment IDs the player owns (equipped items included).
  // Duplicates = separate entries.
  inventory: [
    'iron_axe', 'iron_breastplate',
    'wooden_mace', 'padded_armor',
  ],

  // Upgrade level per equipment ID (+0 through +10).
  // Only tracked when level > 0 to keep save small.
  upgrades: {},

  // ── Crafting materials ──────────────────────────────────────
  materials: null, // filled from defaultMaterials() on first load

  // ── Rewards ─────────────────────────────────────────────────
  freePacks: [],   // pack ids granted as level rewards
};

// Exported mutable singleton — all importers share the same reference.
export const save = {};

function deepCloneDefault() {
  const clone = JSON.parse(JSON.stringify(DEFAULT_SAVE));
  clone.materials = defaultMaterials();
  return clone;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...deepCloneDefault(), ...parsed };
      // Ensure nested objects are properly merged
      merged.charData  = { ...deepCloneDefault().charData,  ...parsed.charData };
      merged.materials = { ...defaultMaterials(), ...parsed.materials };
      merged.upgrades  = { ...parsed.upgrades };
      Object.assign(save, merged);
    } else {
      Object.assign(save, deepCloneDefault());
    }
  } catch {
    Object.assign(save, deepCloneDefault());
  }
}

export function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

/**
 * Ensure a newly unlocked character has a charData entry.
 */
export function ensureCharData(charId) {
  if (!save.charData[charId]) {
    save.charData[charId] = { xp: 0, weapon: null, armor: null, acc1: null, acc2: null };
  }
}
