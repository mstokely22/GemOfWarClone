// ============================================================
//  GEMS OF COMBAT — Save State (localStorage persistence)
//  v4: dungeon crawl model
// ============================================================
import { defaultMaterials } from '../data/materials.js';

export const SAVE_KEY = 'gems_of_combat_v4';

const DEFAULT_SAVE = {
  gold: 300,

  // ── Dungeon progress ─────────────────────────────────────────
  dungeonsCleared: [],  // array of dungeon IDs fully beaten
  activeDungeon:   null, // { dungeonId, rooms[], startRoomId, pendingRoomId, pendingBattle, dungeonComplete }

  // ── Characters ──────────────────────────────────────────────
  unlockedCharIds: ['roland', 'elara'],
  team: ['roland', 'elara', null, null],

  charData: {
    roland: { xp: 0, weapon: 'iron_axe', armor: 'iron_breastplate', acc1: null, acc2: null },
    elara:  { xp: 0, weapon: 'wooden_mace', armor: 'padded_armor',  acc1: null, acc2: null },
  },

  // ── Equipment Inventory ─────────────────────────────────────
  inventory: [
    'iron_axe', 'iron_breastplate',
    'wooden_mace', 'padded_armor',
  ],
  upgrades: {},

  // ── Crafting materials ──────────────────────────────────────
  materials: null,

  // ── Rewards ─────────────────────────────────────────────────
  freePacks: [],
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
      merged.charData        = { ...deepCloneDefault().charData, ...parsed.charData };
      merged.materials       = { ...defaultMaterials(), ...parsed.materials };
      merged.upgrades        = { ...parsed.upgrades };
      merged.dungeonsCleared = Array.isArray(parsed.dungeonsCleared) ? [...parsed.dungeonsCleared] : [];
      merged.activeDungeon   = parsed.activeDungeon || null;
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
