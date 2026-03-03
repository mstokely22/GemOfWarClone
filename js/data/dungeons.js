// ============================================================
//  GEMS OF COMBAT — Dungeon Definitions
//  5 thematic dungeons. Each run generates a random room grid.
// ============================================================

// ── Enemy helpers ─────────────────────────────────────────────
function mkEnemy(name, emoji, color, hp, atk, armor, manaCost, spell, castFn) {
  return {
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name, emoji, color,
    attack: atk, armor, maxLife: hp, manaCost,
    spell, spellDesc: spell, cast: castFn,
  };
}
function dealDmg(n) {
  return (self, allies, enemies) => {
    const t = enemies.find(t => t.life > 0);
    if (!t) return '';
    t.life = Math.max(0, t.life - n);
    return `${self.name} hits ${t.name} for ${n}!`;
  };
}
function dealAoE(n) {
  return (self, allies, enemies) => {
    enemies.filter(t => t.life > 0).forEach(t => { t.life = Math.max(0, t.life - n); });
    return `${self.name} hits all enemies for ${n}!`;
  };
}
function healSelf(n) {
  return (self) => {
    self.life = Math.min(self.maxLife, self.life + n);
    return `${self.name} heals ${n} HP!`;
  };
}

// ── Room type metadata ────────────────────────────────────────
export const ROOM_TYPE_LABELS = {
  start:    'Entrance',
  combat:   'Monster Room',
  elite:    'Elite Chamber',
  treasure: 'Treasure Room',
  boss:     'Boss Chamber',
};

export const ROOM_TYPE_ICONS = {
  start:    '🏕️',
  combat:   '⚔️',
  elite:    '💀',
  treasure: '💎',
  boss:     '👑',
};

// ── Dungeon definitions ───────────────────────────────────────
export const DUNGEONS = [

  // ─── 1. The Slime Pits ───────────────────────────────────────
  {
    id: 'slime_pits',
    name: 'The Slime Pits',
    icon: '🟢',
    flavorText: 'Damp caverns crawling with ooze and vermin.',
    theme: 'green',
    difficulty: 1,
    completionReward: 'adventurer',
    unlockCondition: 'start',
    enemyPool: {
      combat: [
        mkEnemy('Slime Pup',    '🟢','green', 16,  6, 1, 5, 'Ooze Toss',    dealDmg(5)),
        mkEnemy('Rock Bug',     '🪲','brown', 18,  7, 3, 6, 'Shell Slam',   dealDmg(6)),
        mkEnemy('Orc Grunt',    '🪓','red',   20,  8, 3, 6, 'Bash',         dealDmg(7)),
        mkEnemy('Swamp Toad',   '🐸','green', 14,  6, 2, 5, 'Croak Bolt',   dealDmg(5)),
        mkEnemy('Cave Rat',     '🐀','brown', 12,  5, 1, 5, 'Gnaw',         dealDmg(4)),
      ],
      elite: [
        mkEnemy('Slime Guard',  '🟩','green', 26, 11, 4, 7, 'Acid Glob',    dealDmg(10)),
        mkEnemy('Orc Warchief', '🪓','red',   28, 12, 5, 8, 'Battle Cry',   dealDmg(11)),
        mkEnemy('Bog Witch',    '🧙','green', 22, 10, 3, 7, 'Hex Bolt',     dealDmg(9)),
      ],
      boss: [
        mkEnemy('Slime King',   '👑','green', 40, 13, 6, 9, 'Toxic Surge',  dealAoE(8)),
        mkEnemy('Bog Ogre',     '👹','green', 36, 14, 7, 9, 'Ogre Slam',    dealDmg(14)),
      ],
    },
  },

  // ─── 2. Bandit Outpost ───────────────────────────────────────
  {
    id: 'bandit_outpost',
    name: 'Bandit Outpost',
    icon: '🏴',
    flavorText: 'A fortified hideout run by ruthless mercenaries.',
    theme: 'brown',
    difficulty: 2,
    completionReward: 'adventurer',
    unlockCondition: 'clear:slime_pits',
    enemyPool: {
      combat: [
        mkEnemy('Bandit',         '🗡','brown',  24, 10, 4, 7, 'Stab',          dealDmg(9)),
        mkEnemy('Crossbowman',    '🏹','brown',  20,  9, 3, 6, 'Bolt',          dealDmg(8)),
        mkEnemy('Thug',           '👊','brown',  26, 11, 4, 7, 'Pummel',        dealDmg(10)),
        mkEnemy('Rogue Scout',    '🥷','brown',  22,  9, 3, 6, 'Shadow Dart',   dealDmg(8)),
        mkEnemy('Mercenary',      '⚔️','red',    28, 10, 5, 7, 'Slice',         dealDmg(9)),
      ],
      elite: [
        mkEnemy('Bandit Captain', '🗡','red',    34, 13, 6, 8, 'Dual Slash',    dealDmg(13)),
        mkEnemy('Assassin',       '🥷','purple', 30, 14, 5, 9, 'Backstab',      dealDmg(14)),
        mkEnemy('Enforcer',       '💪','brown',  36, 12, 7, 9, 'Headcrack',     dealDmg(12)),
      ],
      boss: [
        mkEnemy('Bandit Lord',    '👑','red',    50, 16, 8,10, 'Death Mark',    dealDmg(16)),
        mkEnemy('Shadow Master',  '🥷','purple', 44, 17, 7,10, 'Vanishing Act', dealAoE(10)),
      ],
    },
  },

  // ─── 3. Frozen Caverns ───────────────────────────────────────
  {
    id: 'frozen_caverns',
    name: 'Frozen Caverns',
    icon: '❄️',
    flavorText: 'Crystalline tunnels haunted by frost spirits.',
    theme: 'blue',
    difficulty: 3,
    completionReward: 'warrior',
    unlockCondition: 'clear:bandit_outpost',
    enemyPool: {
      combat: [
        mkEnemy('Ice Shard',      '❄️','blue',  26, 11, 5, 7, 'Frost Bolt',    dealDmg(10)),
        mkEnemy('Snow Wolf',      '🐺','blue',  28, 12, 4, 8, 'Bite',          dealDmg(11)),
        mkEnemy('Frost Imp',      '🔵','blue',  22, 10, 4, 7, 'Chill Touch',   dealDmg(9)),
        mkEnemy('Ice Golem',      '🧊','blue',  34, 10, 8, 8, 'Permafrost',    healSelf(8)),
        mkEnemy('Blizzard Mage',  '🌨','blue',  24, 13, 4, 9, 'Blizzard',      dealAoE(7)),
      ],
      elite: [
        mkEnemy('Ice Warrior',    '❄️','blue',  38, 15, 7,10, 'Glacier Slash', dealDmg(14)),
        mkEnemy('Frost Witch',    '🧊','blue',  32, 14, 6,10, 'Deep Freeze',   dealDmg(13)),
        mkEnemy('Ice Guardian',   '🛡','blue',  42, 12, 9,10, 'Ice Wall',      healSelf(12)),
      ],
      boss: [
        mkEnemy('Frost Titan',    '👑','blue',  60, 17,11,12, 'Absolute Zero', dealAoE(12)),
        mkEnemy('Blizzard Queen', '❄️','blue',  54, 18, 9,12, 'Snowstorm',     dealAoE(11)),
      ],
    },
  },

  // ─── 4. Volcanic Depths ──────────────────────────────────────
  {
    id: 'volcanic_depths',
    name: 'Volcanic Depths',
    icon: '🔥',
    flavorText: 'Scorching tunnels seething with lava and flame.',
    theme: 'red',
    difficulty: 4,
    completionReward: 'warrior',
    unlockCondition: 'clear:frozen_caverns',
    enemyPool: {
      combat: [
        mkEnemy('Fire Imp',       '🔥','red',   30, 13, 5, 8, 'Ember Toss',    dealDmg(12)),
        mkEnemy('Lava Slug',      '🌋','red',   32, 12, 6, 8, 'Magma Glob',    dealDmg(11)),
        mkEnemy('Ember Hound',    '🐕','red',   28, 14, 5, 9, 'Fire Bite',     dealDmg(13)),
        mkEnemy('Ash Golem',      '⚫','red',   38, 11, 9, 9, 'Cinder Fist',   healSelf(10)),
        mkEnemy('Flame Archer',   '🏹','red',   26, 15, 4, 9, 'Fire Arrow',    dealDmg(14)),
      ],
      elite: [
        mkEnemy('Ember Knight',   '⚔️','red',   44, 17, 7,10, 'Flame Slash',   dealDmg(16)),
        mkEnemy('Lava Drake',     '🐉','red',   40, 16, 8,11, 'Magma Breath',  dealAoE(10)),
        mkEnemy('Cinder Mage',    '🔮','red',   36, 15, 6,10, 'Fireball',      dealDmg(15)),
      ],
      boss: [
        mkEnemy('Volcano Lord',   '👑','red',   72, 20,12,13, 'Eruption',      dealAoE(14)),
        mkEnemy('Ancient Drake',  '🐲','red',   68, 22,11,13, 'Dragon Rage',   dealDmg(24)),
      ],
    },
  },

  // ─── 5. Shadow Citadel ───────────────────────────────────────
  {
    id: 'shadow_citadel',
    name: 'Shadow Citadel',
    icon: '🌑',
    flavorText: 'A fortress of darkness at the edge of the void.',
    theme: 'purple',
    difficulty: 5,
    completionReward: 'champion',
    unlockCondition: 'clear:volcanic_depths',
    enemyPool: {
      combat: [
        mkEnemy('Shadow Wraith',    '👻','purple', 36, 16, 6,10, 'Soul Rend',     dealDmg(15)),
        mkEnemy('Void Imp',         '🌀','purple', 30, 17, 5,10, 'Void Bolt',     dealDmg(16)),
        mkEnemy('Dark Knight',      '🧑','purple', 42, 15, 8,10, 'Dark Smite',    dealDmg(14)),
        mkEnemy('Chaos Archer',     '🏹','purple', 32, 18, 5,11, 'Void Arrow',    dealDmg(17)),
        mkEnemy('Shadow Rogue',     '🗡','purple', 34, 17, 6,10, 'Backstab',      dealDmg(17)),
      ],
      elite: [
        mkEnemy('Void Specter',     '👻','purple', 48, 19, 8,11, 'Wail',          dealAoE(12)),
        mkEnemy('Chaos Templar',    '🧑','purple', 50, 18, 9,11, 'Chaos Smite',   dealDmg(18)),
        mkEnemy('Elder Demon',      '😈','purple', 52, 20, 9,12, 'Hellfire',      dealDmg(20)),
      ],
      boss: [
        mkEnemy('Oblivion Overlord','👑','purple', 88, 24,14,14, 'Oblivion Blast',dealAoE(17)),
        mkEnemy('Void God',         '🌑','purple', 80, 25,13,14, 'Nether Strike', dealDmg(26)),
      ],
    },
  },
];

export const DUNGEON_BY_ID = Object.fromEntries(DUNGEONS.map(d => [d.id, d]));

/** Returns true if this dungeon is accessible given the array of cleared dungeon IDs. */
export function isDungeonUnlocked(dungeon, dungeonsCleared = []) {
  if (dungeon.unlockCondition === 'start') return true;
  if (dungeon.unlockCondition.startsWith('clear:')) {
    return dungeonsCleared.includes(dungeon.unlockCondition.slice(6));
  }
  return false;
}
