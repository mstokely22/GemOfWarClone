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
function healAlly(n) {
  return (self, allies) => {
    const wounded = allies.filter(t => t.life > 0 && t.life < t.maxLife)
      .sort((a, b) => (a.life / a.maxLife) - (b.life / b.maxLife));
    const target = wounded[0] || self;
    target.life = Math.min(target.maxLife, target.life + n);
    return `${self.name} heals ${target.name} for ${n}!`;
  };
}
function buffAllies(n) {
  return (self, allies) => {
    allies.filter(t => t.life > 0).forEach(t => { t.shield = (t.shield || 0) + n; });
    return `${self.name} shields all allies for +${n}!`;
  };
}
function drainLife(d, h) {
  return (self, allies, enemies) => {
    const t = enemies.find(t => t.life > 0);
    if (!t) return '';
    t.life = Math.max(0, t.life - d);
    self.life = Math.min(self.maxLife, self.life + h);
    return `${self.name} drains ${t.name} for ${d}, heals ${h}!`;
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
        mkEnemy('Slime Pup',    '🟢','green', 12,  5, 1, 5, 'Ooze Toss',    dealDmg(4)),
        mkEnemy('Rock Bug',     '🪲','brown', 14,  5, 2, 6, 'Shell Up',     healSelf(3)),
        mkEnemy('Orc Grunt',    '🪓','red',   15,  6, 2, 6, 'Bash',         dealDmg(5)),
        mkEnemy('Swamp Toad',   '🐸','green', 10,  5, 1, 5, 'Croak Bolt',   dealDmg(4)),
        mkEnemy('Cave Rat',     '🐀','brown',  9,  4, 1, 5, 'Gnaw',         drainLife(3, 2)),
      ],
      elite: [
        mkEnemy('Slime Guard',  '🟩','green', 20,  8, 3, 7, 'Acid Glob',    dealAoE(4)),
        mkEnemy('Orc Warchief', '🪓','red',   21,  9, 4, 8, 'War Shout',    buffAllies(2)),
        mkEnemy('Bog Witch',    '🧙','green', 16,  8, 2, 7, 'Mend Swamp',   healAlly(6)),
      ],
      boss: [
        mkEnemy('Slime King',   '👑','green', 30, 10, 5, 9, 'Toxic Surge',  dealAoE(6)),
        mkEnemy('Bog Ogre',     '👹','green', 27, 10, 5, 9, 'Ogre Drain',   drainLife(8, 5)),
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
        mkEnemy('Bandit',         '🗡','brown',  18,  8, 3, 7, 'Stab',          dealDmg(7)),
        mkEnemy('Crossbowman',    '🏹','brown',  15,  7, 2, 6, 'Bolt',          dealDmg(6)),
        mkEnemy('Thug',           '👊','brown',  20,  8, 3, 7, 'Pummel',        dealDmg(8)),
        mkEnemy('Rogue Scout',    '🥷','brown',  16,  7, 2, 6, 'Sap',           drainLife(4, 3)),
        mkEnemy('Mercenary',      '⚔️','red',    21,  8, 4, 7, 'Rally',         buffAllies(2)),
      ],
      elite: [
        mkEnemy('Bandit Captain', '🗡','red',    26, 10, 5, 8, 'Dual Slash',    dealDmg(10)),
        mkEnemy('Assassin',       '🥷','purple', 22, 10, 4, 9, 'Life Steal',    drainLife(8, 5)),
        mkEnemy('Enforcer',       '💪','brown',  27,  9, 5, 9, 'Brace!',        buffAllies(3)),
      ],
      boss: [
        mkEnemy('Bandit Lord',    '👑','red',    38, 12, 6,10, 'Death Mark',    dealDmg(12)),
        mkEnemy('Shadow Master',  '🥷','purple', 33, 13, 5,10, 'Vanishing Act', dealAoE(8)),
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
    completionReward: 'champion',
    unlockCondition: 'clear:bandit_outpost',
    enemyPool: {
      combat: [
        mkEnemy('Ice Shard',      '❄️','blue',  20,  8, 4, 7, 'Frost Bolt',    dealDmg(8)),
        mkEnemy('Snow Wolf',      '🐺','blue',  21,  9, 3, 8, 'Bite',          dealDmg(8)),
        mkEnemy('Frost Imp',      '🔵','blue',  16,  8, 3, 7, 'Frost Drain',   drainLife(5, 4)),
        mkEnemy('Ice Golem',      '🧊','blue',  26,  8, 6, 8, 'Permafrost',    buffAllies(3)),
        mkEnemy('Blizzard Mage',  '🌨','blue',  18, 10, 3, 9, 'Blizzard',      dealAoE(5)),
      ],
      elite: [
        mkEnemy('Ice Warrior',    '❄️','blue',  28, 11, 5,10, 'Glacier Slash', dealDmg(10)),
        mkEnemy('Frost Witch',    '🧊','blue',  24, 10, 5,10, 'Frost Mend',    healAlly(8)),
        mkEnemy('Ice Guardian',   '🛡','blue',  32,  9, 7,10, 'Ice Wall',      buffAllies(4)),
      ],
      boss: [
        mkEnemy('Frost Titan',    '👑','blue',  45, 13, 8,12, 'Absolute Zero', dealAoE(9)),
        mkEnemy('Blizzard Queen', '❄️','blue',  40, 14, 7,12, 'Frostbite',     drainLife(10, 7)),
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
    completionReward: 'champion',
    unlockCondition: 'clear:frozen_caverns',
    enemyPool: {
      combat: [
        mkEnemy('Fire Imp',       '🔥','red',   22, 10, 4, 8, 'Ember Toss',    dealDmg(9)),
        mkEnemy('Lava Slug',      '🌋','red',   24,  9, 5, 8, 'Magma Shell',   healSelf(8)),
        mkEnemy('Ember Hound',    '🐕','red',   21, 10, 4, 9, 'Fire Bite',     drainLife(7, 5)),
        mkEnemy('Ash Golem',      '⚫','red',   28,  8, 7, 9, 'Ash Shield',    buffAllies(4)),
        mkEnemy('Flame Archer',   '🏹','red',   20, 11, 3, 9, 'Fire Arrow',    dealDmg(10)),
      ],
      elite: [
        mkEnemy('Ember Knight',   '⚔️','red',   33, 13, 5,10, 'Flame Slash',   dealDmg(12)),
        mkEnemy('Lava Drake',     '🐉','red',   30, 12, 6,11, 'Magma Breath',  dealAoE(8)),
        mkEnemy('Cinder Mage',    '🔮','red',   27, 11, 5,10, 'Cauterize',     healAlly(10)),
      ],
      boss: [
        mkEnemy('Volcano Lord',   '👑','red',   54, 15, 9,13, 'Eruption',      dealAoE(10)),
        mkEnemy('Ancient Drake',  '🐲','red',   51, 16, 8,13, 'Dragon Siphon', drainLife(14, 10)),
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
        mkEnemy('Shadow Wraith',    '👻','purple', 27, 12, 5,10, 'Soul Rend',     drainLife(8, 5)),
        mkEnemy('Void Imp',         '🌀','purple', 22, 13, 4,10, 'Void Bolt',     dealDmg(12)),
        mkEnemy('Dark Knight',      '🧑','purple', 32, 11, 6,10, 'Dark Ward',     buffAllies(4)),
        mkEnemy('Chaos Archer',     '🏹','purple', 24, 14, 4,11, 'Void Arrow',    dealDmg(13)),
        mkEnemy('Shadow Rogue',     '🗡','purple', 26, 13, 5,10, 'Backstab',      dealDmg(13)),
      ],
      elite: [
        mkEnemy('Void Specter',     '👻','purple', 36, 14, 6,11, 'Wail',          dealAoE(9)),
        mkEnemy('Chaos Templar',    '🧑','purple', 38, 14, 7,11, 'Dark Pact',     healAlly(12)),
        mkEnemy('Elder Demon',      '😈','purple', 39, 15, 7,12, 'Hellfire',      drainLife(12, 8)),
      ],
      boss: [
        mkEnemy('Oblivion Overlord','👑','purple', 66, 18,10,14, 'Oblivion Blast',dealAoE(13)),
        mkEnemy('Void God',         '🌑','purple', 60, 19,10,14, 'Nether Drain',  drainLife(16, 12)),
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
