// ============================================================
//  GEMS OF COMBAT — Hero XP / Leveling System
// ============================================================

export const MAX_LEVEL = 50;

// ── XP required to reach a given level (cumulative) ───────────
// xpForLevel(1) = 0 (start at level 1), xpForLevel(2) = 100, etc.
// Formula: level * 50 + level^1.6  (accelerating curve)
const _xpTable = [0]; // index 0 unused; index 1 = level 1
for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
  _xpTable[lvl] = lvl === 1
    ? 0
    : _xpTable[lvl - 1] + Math.floor(lvl * 50 + Math.pow(lvl, 1.6));
}
export const XP_TABLE = _xpTable;

/**
 * Given total accumulated XP, return the current level (1-based, capped at MAX_LEVEL).
 */
export function levelFromXp(totalXp) {
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
    if (totalXp >= XP_TABLE[lvl]) return lvl;
  }
  return 1;
}

/**
 * XP needed to go from current level to next level.
 * Returns Infinity if already at max.
 */
export function xpToNextLevel(totalXp) {
  const lvl = levelFromXp(totalXp);
  if (lvl >= MAX_LEVEL) return Infinity;
  return XP_TABLE[lvl + 1] - totalXp;
}

/**
 * XP within the current level (for progress bar).
 */
export function xpProgress(totalXp) {
  const lvl = levelFromXp(totalXp);
  if (lvl >= MAX_LEVEL) return { current: 0, needed: 1, pct: 100 };
  const base = XP_TABLE[lvl];
  const next = XP_TABLE[lvl + 1];
  const current = totalXp - base;
  const needed  = next - base;
  return { current, needed, pct: Math.min(100, (current / needed) * 100) };
}

// ── XP awarded per battle ─────────────────────────────────────
// Flat XP per battle, scaling with level difficulty (1-5).
// XP is split equally among living party members at end of battle.
const DIFFICULTY_XP = {
  1: 60,
  2: 100,
  3: 160,
  4: 240,
  5: 360,
};

/**
 * Get the XP each surviving party member earns from a battle.
 * @param {number} difficulty — level difficulty (1-5)
 * @param {number} livingCount — number of living party members
 */
export function xpPerMember(difficulty, livingCount) {
  const total = DIFFICULTY_XP[difficulty] || 100;
  return Math.floor(total / Math.max(1, livingCount));
}

// ── Stat Growth (legacy — keep for any remaining references) ─
export function statBonusAtLevel(growth, level) {
  const lvl = level - 1;
  return {
    attack:  Math.floor(growth.attack  * lvl),
    armor:   Math.floor(growth.armor   * lvl),
    maxLife: Math.floor(growth.maxLife * lvl),
  };
}

// ── Star system (v5) ────────────────────────────────────────
export const MAX_STARS = 5;

/**
 * Returns total stat bonus from a given star level.
 * growth values are the per-star bonus defined in classes.js.
 * @param {{ attack: number, armor: number, maxLife: number }} growth
 * @param {number} stars  (1–5)
 */
export function statBonusAtStars(growth, stars) {
  const s = Math.max(0, (stars || 1) - 1);
  return {
    attack:  Math.floor(growth.attack  * s),
    armor:   Math.floor(growth.armor   * s),
    maxLife: Math.floor(growth.maxLife * s),
  };
}

// ── Milestone helpers (works for both star-keyed and level-keyed) ─
/**
 * Given a class's milestones map and a hero's current stars,
 * return all active passives (array of { id, name, desc }).
 */
export function getActiveMilestones(milestones, stars) {
  const result = [];
  for (const [key, m] of Object.entries(milestones)) {
    if (parseInt(key, 10) <= stars && m.type === 'passive') {
      result.push({ id: m.passiveId, name: m.name, desc: m.desc });
    }
  }
  return result;
}

/**
 * Check if a specific slot is unlocked at the given star level.
 */
export function isSlotUnlocked(milestones, stars, slotName) {
  for (const [key, m] of Object.entries(milestones)) {
    if (parseInt(key, 10) <= stars && m.type === 'slot' && m.slot === slotName) {
      return true;
    }
  }
  return false;
}
