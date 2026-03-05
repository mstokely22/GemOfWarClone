// ============================================================
//  GEMS OF COMBAT — Save State (localStorage persistence)
//  v5: stars replace levels, heroDraws, armor-as-shield
// ============================================================
import { defaultMaterials } from '../data/materials.js';
import { CHAR_BY_ID } from '../data/characters.js';

export const SAVE_KEY = 'gems_of_combat_v5';
const OLD_SAVE_KEY   = 'gems_of_combat_v4';

/** Starter weapon per class — used when a hero is first unlocked */
const CLASS_STARTER_WEAPONS = {
  warrior: 'iron_axe',
  priest:  'wooden_mace',
  mage:    'apprentice_wand',
  thief:   'iron_dagger',
  paladin: 'iron_mace',
  ranger:  'rough_bow',
};

const DEFAULT_SAVE = {
  gold: 300,

  // ── Dungeon progress ─────────────────────────────────────────
  dungeonsCleared: [],
  activeDungeon:   null,

  // ── Characters ──────────────────────────────────────────────
  unlockedCharIds: ['roland', 'elara'],
  heroDraws: 0,
  team: ['roland', 'elara', null, null],

  charData: {
    roland: { stars: 1, weapon: 'iron_axe',    armor: 'iron_breastplate', acc1: null, acc2: null },
    elara:  { stars: 1, weapon: 'wooden_mace', armor: 'padded_armor',     acc1: null, acc2: null },
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
    let raw = localStorage.getItem(SAVE_KEY);
    let parsed;

    if (!raw) {
      // Check for v4 save to migrate
      const oldRaw = localStorage.getItem(OLD_SAVE_KEY);
      if (oldRaw) {
        parsed = migrateV4(JSON.parse(oldRaw));
      }
    } else {
      parsed = JSON.parse(raw);
    }

    if (parsed) {
      const merged = { ...deepCloneDefault(), ...parsed };
      merged.charData        = { ...deepCloneDefault().charData, ...parsed.charData };
      merged.materials       = { ...defaultMaterials(), ...parsed.materials };
      merged.upgrades        = { ...parsed.upgrades };
      merged.dungeonsCleared = Array.isArray(parsed.dungeonsCleared) ? [...parsed.dungeonsCleared] : [];
      merged.activeDungeon   = parsed.activeDungeon || null;
      merged.heroDraws       = parsed.heroDraws ?? 0;
      // Ensure stars field on all charData entries
      for (const [id, cd] of Object.entries(merged.charData)) {
        if (cd.xp !== undefined && cd.stars === undefined) {
          cd.stars = 1;
          delete cd.xp;
        }
        cd.stars = cd.stars ?? 1;
      }
      Object.assign(save, merged);
    } else {
      Object.assign(save, deepCloneDefault());
    }
  } catch {
    Object.assign(save, deepCloneDefault());
  }
}

/** Migrate a v4 save object into v5 format */
function migrateV4(old) {
  const v5 = { ...old };
  v5.heroDraws = 0;
  if (v5.charData) {
    for (const [, cd] of Object.entries(v5.charData)) {
      cd.stars = 1;
      delete cd.xp;
    }
  }
  return v5;
}

export function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

/**
 * Ensure a newly unlocked character has a charData entry with a starter weapon.
 */
export function ensureCharData(charId) {
  if (!save.charData[charId]) {
    const char        = CHAR_BY_ID[charId];
    const classId     = char?.classId ?? 'warrior';
    const starterWeapon = CLASS_STARTER_WEAPONS[classId] ?? null;
    save.charData[charId] = { stars: 1, weapon: starterWeapon, armor: null, acc1: null, acc2: null };
    // Also ensure the starter weapon is in inventory
    if (starterWeapon && !save.inventory.includes(starterWeapon)) {
      save.inventory.push(starterWeapon);
    }
  }
}
