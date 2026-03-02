// ============================================================
//  GEMS OF COMBAT — Crafting Materials & Upgrade Tables
// ============================================================

// ── Material Definitions ──────────────────────────────────────
export const MATERIALS = {
  metal_scrap:       { id: 'metal_scrap',       name: 'Metal Scrap',       emoji: '⚙️',  tier: 'base' },
  wood_scrap:        { id: 'wood_scrap',        name: 'Wood Scrap',        emoji: '🪵',  tier: 'base' },
  leather_scrap:     { id: 'leather_scrap',     name: 'Leather Scrap',     emoji: '🧶',  tier: 'base' },
  enchanted_metal:   { id: 'enchanted_metal',   name: 'Enchanted Metal',   emoji: '✨⚙️', tier: 'rare' },
  enchanted_wood:    { id: 'enchanted_wood',    name: 'Enchanted Wood',    emoji: '✨🪵', tier: 'rare' },
  enchanted_leather: { id: 'enchanted_leather', name: 'Enchanted Leather', emoji: '✨🧶', tier: 'rare' },
};

export const MATERIAL_IDS = Object.keys(MATERIALS);

export function defaultMaterials() {
  return Object.fromEntries(MATERIAL_IDS.map(id => [id, 0]));
}

// ── Which materials a weapon/armor category produces on dismantle ─
// Returns { materialId: baseAmount } — scaled by rarity on dismantle
const CATEGORY_MATERIALS = {
  // Weapons
  axe:     ['metal_scrap', 'wood_scrap'],
  sword:   ['metal_scrap'],
  hammer:  ['metal_scrap', 'wood_scrap'],
  staff:   ['wood_scrap'],
  wand:    ['wood_scrap'],
  tome:    ['leather_scrap', 'wood_scrap'],
  mace:    ['metal_scrap', 'wood_scrap'],
  dagger:  ['metal_scrap', 'leather_scrap'],
  bow:     ['wood_scrap', 'leather_scrap'],
  // Armor by weight
  light:   ['leather_scrap'],
  medium:  ['leather_scrap', 'metal_scrap'],
  heavy:   ['metal_scrap'],
};

const RARITY_DISMANTLE_MULT = {
  common: 1, uncommon: 2, rare: 3, epic: 5, legendary: 8,
};

// Enchanted variants appear when dismantling rare+ gear
const RARITY_ENCHANTED = {
  common: 0, uncommon: 0, rare: 1, epic: 2, legendary: 4,
};

/**
 * Compute materials gained from dismantling an equipment item.
 * @param {object} item — equipment item from EQUIP_BY_ID
 * @param {number} upgradeLevel — current +level (0-10)
 * @returns {{ [materialId]: number }}
 */
export function dismantleYield(item, upgradeLevel = 0) {
  const result = {};
  const cat = item.slot === 'armor' ? item.weight : item.category;
  const baseMats = CATEGORY_MATERIALS[cat] || ['metal_scrap'];
  const mult = RARITY_DISMANTLE_MULT[item.rarity] || 1;
  const enchMult = RARITY_ENCHANTED[item.rarity] || 0;

  // Base materials
  for (const matId of baseMats) {
    result[matId] = (result[matId] || 0) + (2 * mult);
  }

  // Enchanted materials for rare+
  if (enchMult > 0) {
    for (const matId of baseMats) {
      const enchId = matId.replace('_scrap', '').replace('_scrap', '');
      const enchKey = `enchanted_${enchId}`;
      if (MATERIALS[enchKey]) {
        result[enchKey] = (result[enchKey] || 0) + enchMult;
      }
    }
  }

  // Refund some materials from upgrade levels
  if (upgradeLevel > 0) {
    const refundMat = baseMats[0];
    result[refundMat] = (result[refundMat] || 0) + upgradeLevel * mult;
  }

  return result;
}

// ── Upgrade Cost Table ────────────────────────────────────────
// Cost to go from +N to +(N+1). Key = target level.
// Rarity multiplier scales the base cost.
const BASE_UPGRADE_COST = {
  1:  { mats: 3,  enchanted: 0 },
  2:  { mats: 4,  enchanted: 0 },
  3:  { mats: 6,  enchanted: 0 },
  4:  { mats: 8,  enchanted: 0 },
  5:  { mats: 12, enchanted: 0 },
  6:  { mats: 16, enchanted: 0 },
  7:  { mats: 20, enchanted: 1 },
  8:  { mats: 25, enchanted: 2 },
  9:  { mats: 32, enchanted: 3 },
  10: { mats: 40, enchanted: 5 },
};

const RARITY_COST_MULT = {
  common: 1, uncommon: 1.2, rare: 1.5, epic: 2, legendary: 3,
};

/**
 * Get the materials needed to upgrade an item from its current level to next.
 * @param {object} item — equipment item
 * @param {number} currentLevel — 0-9 (upgrading to currentLevel+1)
 * @returns {{ [materialId]: number } | null} — null if already max
 */
export function upgradeCost(item, currentLevel) {
  const targetLvl = currentLevel + 1;
  if (targetLvl > 10) return null;

  const base = BASE_UPGRADE_COST[targetLvl];
  const mult = RARITY_COST_MULT[item.rarity] || 1;
  const cat = item.slot === 'armor' ? item.weight : item.category;
  const baseMats = CATEGORY_MATERIALS[cat] || ['metal_scrap'];
  const result = {};

  // Distribute base material cost across the item's material types
  const perMat = Math.ceil((base.mats * mult) / baseMats.length);
  for (const matId of baseMats) {
    result[matId] = perMat;
  }

  // Enchanted materials for +7 through +10
  if (base.enchanted > 0) {
    for (const matId of baseMats) {
      const enchId = matId.replace('_scrap', '').replace('_scrap', '');
      const enchKey = `enchanted_${enchId}`;
      if (MATERIALS[enchKey]) {
        result[enchKey] = (result[enchKey] || 0) + Math.ceil(base.enchanted * mult);
      }
    }
  }

  // Also costs some gold
  result._gold = Math.floor(50 * targetLvl * mult);

  return result;
}

// ── Stat Bonus Per Upgrade Level ──────────────────────────────
// Returns the TOTAL bonus at a given upgrade level (not incremental).
const BASE_PER_LEVEL = {
  common: 1.0, uncommon: 1.2, rare: 1.5, epic: 2.0, legendary: 2.5,
};

/**
 * Get stat bonuses for a weapon at a given upgrade level.
 * Weapons gain attack bonus.
 */
export function weaponUpgradeBonus(rarity, level) {
  const per = BASE_PER_LEVEL[rarity] || 1;
  return { attack: Math.floor(level * per) };
}

/**
 * Get stat bonuses for armor at a given upgrade level.
 * Armor gains both armor and life bonus.
 */
export function armorUpgradeBonus(rarity, level) {
  const per = BASE_PER_LEVEL[rarity] || 1;
  return {
    armor:   Math.floor(level * per * 0.7),
    maxLife:  Math.floor(level * per * 1.5),
  };
}
