// ============================================================
//  GEMS OF COMBAT — Game State
//  v3: assembleTroop builds a troop from class + equipment
// ============================================================
import { save }                      from './save.js';
import { CHAR_BY_ID }                from '../data/characters.js';
import { CLASS_BY_ID }               from '../data/classes.js';
import { EQUIP_BY_ID }               from '../data/equipment.js';
import { levelFromXp, statBonusAtLevel, getActiveMilestones, isSlotUnlocked }
  from '../data/leveling.js';
import { weaponUpgradeBonus, armorUpgradeBonus } from '../data/materials.js';
import { RARITY_ORDER }              from '../data/constants.js';

// Exported mutable state — all importers share the same reference.
export const state = {
  board:       [],
  playerTeam:  [],
  enemyTeam:   [],
  playerTurn:  true,
  busy:        false,
  gameOver:    false,
  grantExtra:  false,
};

// ── baseTroop — used for enemies (flat template) ──────────────
export function baseTroop(tpl) {
  return { ...tpl, life: tpl.maxLife, mana: 0, _deathLogged: false, passives: [] };
}

// ── assembleTroop — build a player troop from class + equipment ─
export function assembleTroop(charId) {
  const char  = CHAR_BY_ID[charId];
  const cls   = CLASS_BY_ID[char.classId];
  const cData = save.charData[charId] || {};
  const totalXp = cData.xp || 0;
  const level = levelFromXp(totalXp);

  // --- Base stats from class ---
  let attack  = cls.baseAttack;
  let armor   = cls.baseArmor;
  let maxLife = cls.baseMaxLife;

  // --- Level growth ---
  const growth = statBonusAtLevel(cls.statGrowth, level);
  attack  += growth.attack;
  armor   += growth.armor;
  maxLife += growth.maxLife;

  // --- Collect passives from milestones ---
  const passives = getActiveMilestones(cls.milestones, level);

  // --- Apply milestone stat passives ---
  for (const p of passives) {
    if (p.id === 'warrior_fortitude') armor += 5;
    if (p.id === 'warrior_warlord')  { attack += 5; armor += 5; }
    if (p.id === 'warrior_resilience') maxLife += 10;
    if (p.id === 'priest_aegis')     maxLife += 8;
    if (p.id === 'mage_ward')        armor += 6;
    if (p.id === 'thief_shadow')     attack += 8;
    if (p.id === 'paladin_shield')   armor += 6;
    if (p.id === 'paladin_valor')    { maxLife += 10; armor += 3; }
    if (p.id === 'ranger_apex')      attack += 6;
  }

  // --- Weapon ---
  const weaponId = cData.weapon;
  const weapon   = weaponId ? EQUIP_BY_ID[weaponId] : null;
  let manaColor  = 'brown'; // fallback bare-hand
  let manaCost   = 99;
  let spell      = 'Unarmed';
  let spellDesc  = 'No weapon equipped';
  let castFn     = () => '';

  if (weapon) {
    const wLevel = (save.upgrades[weaponId] || 0);
    attack    += weapon.baseAttackBonus;
    const wUp  = weaponUpgradeBonus(weapon.rarity, wLevel);
    attack    += wUp.attack;
    manaColor  = weapon.manaColor;
    manaCost   = weapon.manaCost;
    // Archmage passive: -3 mana cost
    if (passives.some(p => p.id === 'mage_archmage')) manaCost = Math.max(1, manaCost - 3);
    spell      = weapon.spell;
    spellDesc  = weapon.spellDesc;
    castFn     = weapon.cast;
  }

  // --- Armor ---
  const armorId  = cData.armor;
  const armorItem = armorId ? EQUIP_BY_ID[armorId] : null;
  if (armorItem) {
    const aLevel = (save.upgrades[armorId] || 0);
    armor   += armorItem.baseArmorBonus;
    maxLife += armorItem.baseLifeBonus;
    const aUp = armorUpgradeBonus(armorItem.rarity, aLevel);
    armor   += aUp.armor;
    maxLife += aUp.maxLife;
  }

  // --- Accessories ---
  const acc2Unlocked = isSlotUnlocked(cls.milestones, level, 'acc2');
  const accSlots = ['acc1'];
  if (acc2Unlocked) accSlots.push('acc2');

  for (const slot of accSlots) {
    const accId = cData[slot];
    if (!accId) continue;
    const acc = EQUIP_BY_ID[accId];
    if (!acc) continue;
    if (acc.stats.attack)  attack  += acc.stats.attack;
    if (acc.stats.armor)   armor   += acc.stats.armor;
    if (acc.stats.maxLife) maxLife += acc.stats.maxLife;
    if (acc.passive) passives.push({ ...acc.passive });
  }

  // --- Determine display rarity (highest equipped item rarity) ---
  const equippedItems = [weapon, armorItem,
    cData.acc1 ? EQUIP_BY_ID[cData.acc1] : null,
    cData.acc2 ? EQUIP_BY_ID[cData.acc2] : null,
  ].filter(Boolean);
  const rarity = equippedItems.reduce((best, item) => {
    return (RARITY_ORDER[item.rarity] || 0) > (RARITY_ORDER[best] || 0)
      ? item.rarity : best;
  }, 'common');

  return {
    id:         charId,
    name:       char.name,
    charId,
    classId:    char.classId,
    className:  cls.name,
    archetype:  cls.archetype,
    emoji:      cls.emoji,
    color:      manaColor,
    rarity,
    level,
    attack,
    armor,
    maxLife,
    manaCost,
    spell,
    spellDesc,
    cast:       castFn,
    passives,
    // Runtime fields (set at battle start)
    life:       maxLife,
    mana:       0,
    _deathLogged: false,
  };
}

// ── Last teams (for retry) ────────────────────────────────────
export let _lastPlayerTeam = [];
export let _lastEnemyTeam  = [];

export function initState(playerTeamData, enemyTeamData) {
  _lastPlayerTeam = playerTeamData;
  _lastEnemyTeam  = enemyTeamData;

  state.board       = [];
  state.playerTeam  = playerTeamData.map(t =>
    // If it looks pre-assembled (has charId), use as-is; otherwise baseTroop
    t.charId ? { ...t, life: t.maxLife, mana: 0, _deathLogged: false }
             : baseTroop(t)
  );
  state.enemyTeam   = enemyTeamData.map(baseTroop);
  state.playerTurn  = true;
  state.busy        = false;
  state.gameOver    = false;
  state.grantExtra  = false;
}
