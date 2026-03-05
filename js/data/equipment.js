// ============================================================
//  GEMS OF COMBAT — Equipment Database
//  Weapons (class-locked), Armor (weight-classed), Accessories
// ============================================================

// ── Helper: damage spells ─────────────────────────────────────
function dmg(n) {
  return (self, allies, enemies) => {
    const t = enemies.find(t => t.life > 0);
    if (!t) return '';
    let d = n;
    if (self.passives?.some(p => p.id === 'mage_surge')) d = Math.ceil(d * 1.2);
    if (self.passives?.some(p => p.id === 'thief_critical') && Math.random() < 0.2) {
      d *= 2;
      t.life = Math.max(0, t.life - d);
      return `${self.name} CRITS ${t.name} for ${d} damage!`;
    }
    t.life = Math.max(0, t.life - d);
    return `${self.name} hits ${t.name} for ${d} damage!`;
  };
}
function aoe(n) {
  return (self, allies, enemies) => {
    let d = n;
    if (self.passives?.some(p => p.id === 'mage_surge')) d = Math.ceil(d * 1.2);
    enemies.filter(t => t.life > 0).forEach(t => { t.life = Math.max(0, t.life - d); });
    return `${self.name} deals ${d} damage to all enemies!`;
  };
}
function heal(n) {
  return (self, allies) => {
    let h = n;
    if (self.passives?.some(p => p.id === 'priest_ascendant')) h = Math.ceil(h * 1.5);
    const t = [...allies].filter(t => t.life > 0)
      .sort((a, b) => (a.life / a.maxLife) - (b.life / b.maxLife))[0];
    if (!t) return '';
    t.life = Math.min(t.maxLife, t.life + h);
    return `${self.name} heals ${t.name} for ${h} HP!`;
  };
}
function healAll(n) {
  return (self, allies) => {
    let h = n;
    if (self.passives?.some(p => p.id === 'priest_ascendant')) h = Math.ceil(h * 1.5);
    allies.filter(t => t.life > 0).forEach(t => {
      t.life = Math.min(t.maxLife, t.life + h);
    });
    return `${self.name} heals all allies for ${h} HP!`;
  };
}
function selfHealDmg(d, h) {
  return (self, allies, enemies) => {
    const t = enemies.find(t => t.life > 0);
    if (!t) return '';
    t.life = Math.max(0, t.life - d);
    self.life = Math.min(self.maxLife, self.life + h);
    return `${self.name} hits ${t.name} for ${d} and heals ${h}!`;
  };
}
// v5: buffShield adds to the current per-battle shield value, not permanent armor
function buffShield(n) {
  return (self, allies) => {
    allies.filter(t => t.life > 0).forEach(t => { t.shield = (t.shield || 0) + n; });
    return `${self.name} grants +${n} shield to all allies!`;
  };
}

// ── WEAPONS ───────────────────────────────────────────────────
export const WEAPONS = [
  // ─── Warrior ────────────────────────────────────────────────
  { id: 'iron_axe',       name: 'Iron Axe',        slot: 'weapon', category: 'axe',
    classes: ['warrior'], rarity: 'common', manaColor: 'red', manaCost: 8,
    spell: 'Cleave', spellDesc: 'Deal 9 damage to front enemy',
    baseAttackBonus: 2, icon: '🪓', cast: dmg(9) },
  { id: 'steel_sword',    name: 'Steel Sword',      slot: 'weapon', category: 'sword',
    classes: ['warrior'], rarity: 'common', manaColor: 'brown', manaCost: 7,
    spell: 'Slash', spellDesc: 'Deal 8 damage to front enemy',
    baseAttackBonus: 3, icon: '⚔️', cast: dmg(8) },
  { id: 'battle_axe',     name: 'Battle Axe',       slot: 'weapon', category: 'axe',
    classes: ['warrior'], rarity: 'uncommon', manaColor: 'red', manaCost: 10,
    spell: 'Rending Strike', spellDesc: 'Deal 15 damage to front enemy',
    baseAttackBonus: 4, icon: '🪓', cast: dmg(15) },
  { id: 'flame_blade',    name: 'Flame Blade',      slot: 'weapon', category: 'sword',
    classes: ['warrior'], rarity: 'rare', manaColor: 'red', manaCost: 11,
    spell: 'Flame Slash', spellDesc: 'Deal 21 damage to front enemy',
    baseAttackBonus: 5, icon: '🗡️', cast: dmg(21) },
  { id: 'warhammer',      name: 'Warhammer',        slot: 'weapon', category: 'hammer',
    classes: ['warrior'], rarity: 'rare', manaColor: 'brown', manaCost: 12,
    spell: 'Earthshatter', spellDesc: 'Deal 10 damage to ALL enemies',
    baseAttackBonus: 5, icon: '🔨', cast: aoe(10) },
  { id: 'berserker_axe',  name: 'Berserker Axe',    slot: 'weapon', category: 'axe',
    classes: ['warrior'], rarity: 'epic', manaColor: 'red', manaCost: 13,
    spell: 'Berserker Rage', spellDesc: 'Deal 30 dmg to front, heal 8',
    baseAttackBonus: 7, icon: '🪓', cast: selfHealDmg(30, 8) },
  { id: 'dragonslayer',   name: 'Dragonslayer',     slot: 'weapon', category: 'sword',
    classes: ['warrior'], rarity: 'legendary', manaColor: 'red', manaCost: 15,
    spell: 'Dragon Strike', spellDesc: 'Deal 41 dmg to front + 15 to all others',
    baseAttackBonus: 9, icon: '⚔️',
    cast(self, allies, enemies) {
      const alive = enemies.filter(t => t.life > 0);
      if (!alive.length) return '';
      alive[0].life = Math.max(0, alive[0].life - 41);
      alive.slice(1).forEach(t => { t.life = Math.max(0, t.life - 15); });
      return `${self.name} unleashes Dragon Strike — ${alive[0].name} takes 41, rest take 15!`;
    }
  },

  // ─── Priest ────────────────────────────────────────────────
  { id: 'wooden_mace',    name: 'Wooden Mace',      slot: 'weapon', category: 'mace',
    classes: ['priest'], rarity: 'common', manaColor: 'yellow', manaCost: 7,
    spell: 'Heal', spellDesc: 'Heal most-wounded ally for 9 HP',
    baseAttackBonus: 2, icon: '🏏', cast: heal(9) },
  { id: 'holy_staff',     name: 'Holy Staff',       slot: 'weapon', category: 'staff',
    classes: ['priest'], rarity: 'common', manaColor: 'yellow', manaCost: 8,
    spell: 'Holy Light', spellDesc: 'Heal all allies for 5 HP',
    baseAttackBonus: 1, icon: '🪄', cast: healAll(5) },
  { id: 'blessed_mace',   name: 'Blessed Mace',     slot: 'weapon', category: 'mace',
    classes: ['priest'], rarity: 'uncommon', manaColor: 'yellow', manaCost: 9,
    spell: 'Restoration', spellDesc: 'Heal most-wounded ally for 15 HP',
    baseAttackBonus: 2, icon: '🏏', cast: heal(15) },
  { id: 'radiant_staff',  name: 'Radiant Staff',    slot: 'weapon', category: 'staff',
    classes: ['priest'], rarity: 'rare', manaColor: 'yellow', manaCost: 10,
    spell: 'Radiance', spellDesc: 'Heal all allies for 9 HP',
    baseAttackBonus: 3, icon: '🪄', cast: healAll(9) },
  { id: 'scepter_dawn',   name: 'Scepter of Dawn',  slot: 'weapon', category: 'mace',
    classes: ['priest'], rarity: 'epic', manaColor: 'yellow', manaCost: 11,
    spell: 'Dawn\'s Embrace', spellDesc: 'Heal all allies 11 HP + 3 shield',
    baseAttackBonus: 4, icon: '🏏',
    cast(self, allies) {
      let h = 11;
      if (self.passives?.some(p => p.id === 'priest_ascendant')) h = Math.ceil(h * 1.5);
      allies.filter(t => t.life > 0).forEach(t => {
        t.life = Math.min(t.maxLife, t.life + h);
        t.shield = (t.shield || 0) + 3;
      });
      return `${self.name} calls Dawn's Embrace — all allies heal ${h} and gain +3 shield!`;
    }
  },
  { id: 'staff_divinity',  name: 'Staff of Divinity', slot: 'weapon', category: 'staff',
    classes: ['priest'], rarity: 'legendary', manaColor: 'yellow', manaCost: 14,
    spell: 'Divine Intervention', spellDesc: 'Full heal most-wounded + all allies 8 HP',
    baseAttackBonus: 5, icon: '🪄',
    cast(self, allies) {
      let bonus = self.passives?.some(p => p.id === 'priest_ascendant') ? 1.5 : 1;
      const sorted = [...allies].filter(t => t.life > 0)
        .sort((a, b) => (a.life / a.maxLife) - (b.life / b.maxLife));
      if (sorted[0]) sorted[0].life = sorted[0].maxLife;
      allies.filter(t => t.life > 0).forEach(t => {
        t.life = Math.min(t.maxLife, t.life + Math.ceil(8 * bonus));
      });
      return `${self.name} calls Divine Intervention — full heal + all allies +${Math.ceil(8 * bonus)} HP!`;
    }
  },

  // ─── Mage ───────────────────────────────────────────────────
  { id: 'apprentice_wand', name: 'Apprentice Wand',  slot: 'weapon', category: 'wand',
    classes: ['mage'], rarity: 'common', manaColor: 'blue', manaCost: 7,
    spell: 'Frost Bolt', spellDesc: 'Deal 10 damage to front enemy',
    baseAttackBonus: 1, icon: '🪄', cast: dmg(10) },
  { id: 'fire_staff',     name: 'Fire Staff',       slot: 'weapon', category: 'staff',
    classes: ['mage'], rarity: 'common', manaColor: 'red', manaCost: 8,
    spell: 'Fireball', spellDesc: 'Deal 6 damage to ALL enemies',
    baseAttackBonus: 1, icon: '🪄', cast: aoe(6) },
  { id: 'arcane_tome',    name: 'Arcane Tome',      slot: 'weapon', category: 'tome',
    classes: ['mage'], rarity: 'uncommon', manaColor: 'purple', manaCost: 9,
    spell: 'Arcane Blast', spellDesc: 'Deal 16 damage to front enemy',
    baseAttackBonus: 2, icon: '📕', cast: dmg(16) },
  { id: 'storm_wand',     name: 'Storm Wand',       slot: 'weapon', category: 'wand',
    classes: ['mage'], rarity: 'rare', manaColor: 'blue', manaCost: 10,
    spell: 'Lightning Storm', spellDesc: 'Deal 10 damage to ALL enemies',
    baseAttackBonus: 2, icon: '🪄', cast: aoe(10) },
  { id: 'void_tome',      name: 'Void Tome',        slot: 'weapon', category: 'tome',
    classes: ['mage'], rarity: 'epic', manaColor: 'purple', manaCost: 12,
    spell: 'Void Rift', spellDesc: 'Deal 34 damage to front enemy',
    baseAttackBonus: 3, icon: '📕', cast: dmg(34) },
  { id: 'staff_eternity', name: 'Staff of Eternity', slot: 'weapon', category: 'staff',
    classes: ['mage'], rarity: 'legendary', manaColor: 'purple', manaCost: 14,
    spell: 'Cataclysm', spellDesc: 'Deal 19 damage to ALL enemies',
    baseAttackBonus: 4, icon: '🪄', cast: aoe(19) },

  // ─── Thief ──────────────────────────────────────────────────
  { id: 'iron_dagger',    name: 'Iron Dagger',      slot: 'weapon', category: 'dagger',
    classes: ['thief'], rarity: 'common', manaColor: 'green', manaCost: 6,
    spell: 'Backstab', spellDesc: 'Deal 11 damage to front enemy',
    baseAttackBonus: 2, icon: '🗡️', cast: dmg(11) },
  { id: 'short_bow',      name: 'Short Bow',        slot: 'weapon', category: 'bow',
    classes: ['thief'], rarity: 'common', manaColor: 'green', manaCost: 7,
    spell: 'Quick Shot', spellDesc: 'Deal 9 damage to front enemy',
    baseAttackBonus: 3, icon: '🏹', cast: dmg(9) },
  { id: 'venom_dagger',   name: 'Venom Dagger',     slot: 'weapon', category: 'dagger',
    classes: ['thief'], rarity: 'uncommon', manaColor: 'green', manaCost: 8,
    spell: 'Venomous Strike', spellDesc: 'Deal 16 dmg + heal 4',
    baseAttackBonus: 4, icon: '🗡️', cast: selfHealDmg(16, 4) },
  { id: 'longbow',        name: 'Longbow',          slot: 'weapon', category: 'bow',
    classes: ['thief', 'ranger'], rarity: 'rare', manaColor: 'green', manaCost: 10,
    spell: 'Piercing Shot', spellDesc: 'Deal 22 damage to front enemy',
    baseAttackBonus: 5, icon: '🏹', cast: dmg(22) },
  { id: 'shadow_blade',   name: 'Shadow Blade',     slot: 'weapon', category: 'dagger',
    classes: ['thief'], rarity: 'epic', manaColor: 'purple', manaCost: 11,
    spell: 'Shadow Strike', spellDesc: 'Deal 28 dmg + heal 9',
    baseAttackBonus: 6, icon: '🗡️', cast: selfHealDmg(28, 9) },
  { id: 'nightfall_bow',  name: 'Nightfall Bow',    slot: 'weapon', category: 'bow',
    classes: ['thief', 'ranger'], rarity: 'legendary', manaColor: 'green', manaCost: 13,
    spell: 'Rain of Arrows', spellDesc: 'Deal 15 damage to ALL enemies',
    baseAttackBonus: 8, icon: '🏹', cast: aoe(15) },

  // ─── Paladin ────────────────────────────────────────────────
  { id: 'iron_mace',      name: 'Iron Mace',        slot: 'weapon', category: 'mace',
    classes: ['paladin'], rarity: 'common', manaColor: 'yellow', manaCost: 7,
    spell: 'Smite', spellDesc: 'Deal 8 damage to front enemy',
    baseAttackBonus: 2, icon: '🏏', cast: dmg(8) },
  { id: 'holy_sword',     name: 'Holy Sword',       slot: 'weapon', category: 'sword',
    classes: ['paladin'], rarity: 'uncommon', manaColor: 'yellow', manaCost: 9,
    spell: 'Holy Strike', spellDesc: 'Deal 14 dmg + heal 6',
    baseAttackBonus: 3, icon: '⚔️', cast: selfHealDmg(14, 6) },
  { id: 'crusader_hammer', name: 'Crusader Hammer', slot: 'weapon', category: 'hammer',
    classes: ['paladin'], rarity: 'rare', manaColor: 'brown', manaCost: 11,
    spell: 'Judgment', spellDesc: 'Deal 18 dmg + give all allies +2 shield',
    baseAttackBonus: 4, icon: '🔨',
    cast(self, allies, enemies) {
      const t = enemies.find(t => t.life > 0);
      if (t) t.life = Math.max(0, t.life - 18);
      allies.filter(t => t.life > 0).forEach(t => { t.shield = (t.shield || 0) + 2; });
      return `${self.name} calls Judgment — ${t?.name || 'enemy'} takes 18, allies gain +2 shield!`;
    }
  },
  { id: 'divine_aegis',   name: 'Divine Aegis',     slot: 'weapon', category: 'mace',
    classes: ['paladin'], rarity: 'epic', manaColor: 'yellow', manaCost: 12,
    spell: 'Shield of Faith', spellDesc: 'Grant all allies +5 shield',
    baseAttackBonus: 3, icon: '🏏', cast: buffShield(5) },

  // ─── Ranger ─────────────────────────────────────────────────
  { id: 'rough_bow',      name: 'Rough Bow',        slot: 'weapon', category: 'bow',
    classes: ['ranger'], rarity: 'common', manaColor: 'green', manaCost: 6,
    spell: 'Quick Draw', spellDesc: 'Deal 8 damage to front enemy',
    baseAttackBonus: 2, icon: '🏹', cast: dmg(8) },
  { id: 'hunting_bow',    name: 'Hunting Bow',      slot: 'weapon', category: 'bow',
    classes: ['ranger'], rarity: 'uncommon', manaColor: 'green', manaCost: 8,
    spell: 'Aimed Shot', spellDesc: 'Deal 15 damage to front enemy',
    baseAttackBonus: 4, icon: '🏹', cast: dmg(15) },
  { id: 'wild_blade',     name: 'Wild Blade',       slot: 'weapon', category: 'sword',
    classes: ['ranger'], rarity: 'rare', manaColor: 'green', manaCost: 10,
    spell: 'Nature\'s Wrath', spellDesc: 'Deal 9 dmg to all enemies',
    baseAttackBonus: 5, icon: '⚔️', cast: aoe(9) },
  { id: 'sylvan_bow',     name: 'Sylvan Bow',       slot: 'weapon', category: 'bow',
    classes: ['ranger'], rarity: 'epic', manaColor: 'green', manaCost: 11,
    spell: 'Barrage', spellDesc: 'Deal 26 damage to front enemy',
    baseAttackBonus: 6, icon: '🏹', cast: dmg(26) },
];

// ── ARMOR ─────────────────────────────────────────────────────
// Weight compatibility: light=all, medium=warrior/priest/thief/paladin/ranger, heavy=warrior/paladin
export const ARMORS = [
  // ─── Light ──────────────────────────────────────────────────
  { id: 'cloth_robe',     name: 'Cloth Robe',       slot: 'armor', weight: 'light',
    rarity: 'common', baseArmorBonus: 1, baseLifeBonus: 2, icon: '👘' },
  { id: 'leather_vest',   name: 'Leather Vest',     slot: 'armor', weight: 'light',
    rarity: 'common', baseArmorBonus: 1, baseLifeBonus: 3, icon: '🧥' },
  { id: 'enchanted_robe', name: 'Enchanted Robe',   slot: 'armor', weight: 'light',
    rarity: 'uncommon', baseArmorBonus: 2, baseLifeBonus: 5, icon: '👘' },
  { id: 'shadow_cloak',   name: 'Shadow Cloak',     slot: 'armor', weight: 'light',
    rarity: 'rare', baseArmorBonus: 3, baseLifeBonus: 6, icon: '🧥' },
  { id: 'archmage_robe',  name: 'Archmage Robe',    slot: 'armor', weight: 'light',
    rarity: 'epic', baseArmorBonus: 4, baseLifeBonus: 9, icon: '👘' },

  // ─── Medium ─────────────────────────────────────────────────
  { id: 'padded_armor',   name: 'Padded Armor',     slot: 'armor', weight: 'medium',
    rarity: 'common', baseArmorBonus: 2, baseLifeBonus: 4, icon: '🦺' },
  { id: 'chain_shirt',    name: 'Chain Shirt',      slot: 'armor', weight: 'medium',
    rarity: 'uncommon', baseArmorBonus: 4, baseLifeBonus: 6, icon: '🦺' },
  { id: 'scale_mail',     name: 'Scale Mail',       slot: 'armor', weight: 'medium',
    rarity: 'rare', baseArmorBonus: 5, baseLifeBonus: 8, icon: '🦺' },
  { id: 'mithril_shirt',  name: 'Mithril Shirt',    slot: 'armor', weight: 'medium',
    rarity: 'epic', baseArmorBonus: 7, baseLifeBonus: 10, icon: '🦺' },
  { id: 'dragonhide',     name: 'Dragonhide Armor', slot: 'armor', weight: 'medium',
    rarity: 'legendary', baseArmorBonus: 9, baseLifeBonus: 14, icon: '🦺' },

  // ─── Heavy ──────────────────────────────────────────────────
  { id: 'iron_breastplate', name: 'Iron Breastplate', slot: 'armor', weight: 'heavy',
    rarity: 'common', baseArmorBonus: 4, baseLifeBonus: 5, icon: '🛡️' },
  { id: 'steel_plate',    name: 'Steel Plate',      slot: 'armor', weight: 'heavy',
    rarity: 'uncommon', baseArmorBonus: 5, baseLifeBonus: 8, icon: '🛡️' },
  { id: 'knight_armor',   name: 'Knight\'s Armor',  slot: 'armor', weight: 'heavy',
    rarity: 'rare', baseArmorBonus: 8, baseLifeBonus: 10, icon: '🛡️' },
  { id: 'obsidian_plate', name: 'Obsidian Plate',   slot: 'armor', weight: 'heavy',
    rarity: 'epic', baseArmorBonus: 10, baseLifeBonus: 14, icon: '🛡️' },
  { id: 'titan_armor',    name: 'Titan\'s Armor',   slot: 'armor', weight: 'heavy',
    rarity: 'legendary', baseArmorBonus: 12, baseLifeBonus: 18, icon: '🛡️' },
];

// ── ACCESSORIES ───────────────────────────────────────────────
// Universal slot, static (no upgrades). Passive effects processed in battle/core.js.
export const ACCESSORIES = [
  { id: 'lucky_charm',    name: 'Lucky Charm',      slot: 'accessory',
    rarity: 'common', stats: { attack: 1 }, passive: null, icon: '🍀' },
  { id: 'iron_ring',      name: 'Iron Ring',        slot: 'accessory',
    rarity: 'common', stats: { armor: 1 }, passive: null, icon: '💍' },
  { id: 'health_amulet',  name: 'Health Amulet',    slot: 'accessory',
    rarity: 'common', stats: { maxLife: 4 }, passive: null, icon: '📿' },
  { id: 'skull_talisman', name: 'Skull Talisman',   slot: 'accessory',
    rarity: 'uncommon', stats: {}, passive: { id: 'skull_mana', name: 'Soul Siphon',
    desc: 'Skull matches also recharge your weapon skill' }, icon: '💀' },
  { id: 'berserker_ring', name: 'Berserker Ring',   slot: 'accessory',
    rarity: 'uncommon', stats: { attack: 2 }, passive: null, icon: '💍' },
  { id: 'guardian_amulet', name: 'Guardian Amulet', slot: 'accessory',
    rarity: 'uncommon', stats: { armor: 2, maxLife: 2 }, passive: null, icon: '📿' },
  { id: 'vampiric_fang',  name: 'Vampiric Fang',   slot: 'accessory',
    rarity: 'rare', stats: {}, passive: { id: 'lifesteal', name: 'Lifesteal',
    desc: 'Skull attacks heal attacker for 20% of damage dealt' }, icon: '🦷' },
  { id: 'mana_crystal',   name: 'Mana Crystal',    slot: 'accessory',
    rarity: 'rare', stats: {}, passive: { id: 'mana_boost', name: 'Mana Surge',
    desc: '+2 bonus mana from every color match' }, icon: '💎' },
  { id: 'thorns_amulet',  name: 'Thorns Amulet',   slot: 'accessory',
    rarity: 'rare', stats: { armor: 1 }, passive: { id: 'thorns', name: 'Thorns',
    desc: 'Reflect 3 damage when hit by skulls' }, icon: '📿' },
  { id: 'cleave_pendant', name: 'Cleave Pendant',  slot: 'accessory',
    rarity: 'epic', stats: { attack: 1 }, passive: { id: 'cleave_attack', name: 'Cleave',
    desc: 'Skull attacks also hit 2nd enemy for 50% damage' }, icon: '📿' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', slot: 'accessory',
    rarity: 'epic', stats: { maxLife: 6 }, passive: { id: 'phoenix', name: 'Phoenix',
    desc: 'Once per battle, revive with 25% HP on death' }, icon: '🪶' },
  { id: 'crown_of_ages',  name: 'Crown of Ages',   slot: 'accessory',
    rarity: 'legendary', stats: { attack: 3, armor: 3, maxLife: 6 },
    passive: null, icon: '👑' },
  { id: 'prism_gem',      name: 'Prism Gem',       slot: 'accessory',
    rarity: 'epic', stats: {}, bonusColor: 'purple',
    passive: { id: 'prism', name: 'Prismatic', desc: 'Purple gems also charge your skill' }, icon: '🔮' },
  { id: 'ember_stone',    name: 'Ember Stone',     slot: 'accessory',
    rarity: 'rare', stats: { attack: 1 }, bonusColor: 'red',
    passive: { id: 'ember', name: 'Ember Link', desc: 'Red gems also charge your skill' }, icon: '🔥' },
];

// ── Lookups ───────────────────────────────────────────────────
export const ALL_EQUIPMENT = [...WEAPONS, ...ARMORS, ...ACCESSORIES];
export const EQUIP_BY_ID   = Object.fromEntries(ALL_EQUIPMENT.map(e => [e.id, e]));

