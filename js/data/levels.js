// ============================================================
//  GEMS OF COMBAT — Level Configurations
// ============================================================

function mkEnemy(name, emoji, color, hp, attack, armor, manaCost, spell, castFn) {
  return {
    id: name.toLowerCase().replace(/\s/g,'_'),
    name, emoji, color,
    attack, armor, maxLife: hp, manaCost, spell,
    spellDesc: spell, cast: castFn,
  };
}

function dealDmg(n) {
  return (self, allies, enemies) => {
    const t = enemies.find(t=>t.life>0);
    if (!t) return '';
    t.life = Math.max(0, t.life - n);
    return `${self.name} hits ${t.name} for ${n} damage!`;
  };
}

function dealAoE(n) {
  return (self, allies, enemies) => {
    enemies.filter(t=>t.life>0).forEach(t => { t.life = Math.max(0, t.life - n); });
    return `${self.name} hits all enemies for ${n} damage!`;
  };
}

function healSelf(n) {
  return (self) => {
    self.life = Math.min(self.maxLife, self.life + n);
    return `${self.name} heals for ${n} HP!`;
  };
}

export const LEVELS = [
  // Level 1 — Tutorial (1 enemy)
  {
    enemies: [
      mkEnemy('Slime Guard','🟢','green', 18, 7, 2, 6, 'Slime Toss', dealDmg(6))
    ],
    gold: 50, packReward: null, stars: 0,
    label: 'The Slime Pits', difficulty: 1
  },
  // Level 2 — 2 easy enemies
  {
    enemies: [
      mkEnemy('Orc Grunt','🪓','red',    22, 9, 3, 7,  'Bash',       dealDmg(8)),
      mkEnemy('Rock Bug', '🪲','brown',  20, 8, 4, 7,  'Shell Slam', dealDmg(7))
    ],
    gold: 75, packReward: null, stars: 0,
    label: 'Dusty Crossroads', difficulty: 1
  },
  // Level 3 — 2 medium enemies
  {
    enemies: [
      mkEnemy('Orc Archer',  '🏹','red',   26, 11, 4, 8, 'Volley',    dealDmg(10)),
      mkEnemy('Swamp Witch', '🧙','green', 22, 10, 3, 8, 'Hex Dart',  dealDmg(9))
    ],
    gold: 100, packReward: null, stars: 0,
    label: 'Rotwood Swamp', difficulty: 2
  },
  // Level 4 — 3 enemies
  {
    enemies: [
      mkEnemy('Orc Warchief Jr','🪓','red',   30, 12, 5, 9,  'Battle Cry', dealDmg(12)),
      mkEnemy('Goblin Bomber',  '💣','green', 24, 11, 3, 8,  'Kaboom!',    dealAoE(7)),
      mkEnemy('Orc Grunt',      '🪓','red',   26,  9, 4, 7,  'Bash',       dealDmg(8))
    ],
    gold: 125, packReward: null, stars: 0,
    label: "Warchief's Camp", difficulty: 2
  },
  // Level 5 — 3 harder enemies + pack reward
  {
    enemies: [
      mkEnemy('Dark Scout',    '🗡','purple', 30, 13, 5, 9,  'Shadow Step', dealDmg(13)),
      mkEnemy('Dark Mage',     '🔮','purple', 26, 12, 4, 9,  'Dark Burst',  dealDmg(12)),
      mkEnemy('Dark Assassin', '🥷','purple', 28, 14, 5, 10, 'Backstab',    dealDmg(15))
    ],
    gold: 150, packReward: 'adventurer', stars: 0,
    label: 'Shadow Keep', difficulty: 3
  },
  // Level 6 — 3 enemies (harder)
  {
    enemies: [
      mkEnemy('Ice Warrior', '❄️','blue', 38, 15, 6, 10, 'Ice Slash',   dealDmg(14)),
      mkEnemy('Frost Witch', '🧊','blue', 32, 14, 5, 10, 'Freeze Bolt', dealDmg(13)),
      mkEnemy('Ice Guardian','🛡','blue', 42, 13, 8, 11, 'Ice Wall',    healSelf(12))
    ],
    gold: 175, packReward: null, stars: 0,
    label: 'Frostpeak Citadel', difficulty: 3
  },
  // Level 7 — 4 enemies
  {
    enemies: [
      mkEnemy('Fire Imp',    '🔥','red', 36, 15, 6, 10, 'Ember Toss',   dealDmg(14)),
      mkEnemy('Ember Knight','⚔️','red', 40, 17, 6, 10, 'Flame Slash',  dealDmg(16)),
      mkEnemy('Lava Drake',  '🐉','red', 38, 16, 7, 11, 'Magma Breath', dealAoE(9)),
      mkEnemy('Cinder Mage', '🔮','red', 32, 14, 5, 10, 'Fireball',     dealDmg(15))
    ],
    gold: 200, packReward: null, stars: 0,
    label: 'Volcanic Depths', difficulty: 4
  },
  // Level 8 — 4 harder enemies + pack reward
  {
    enemies: [
      mkEnemy('Shadow Rogue',   '🗡','purple', 42, 17, 7, 11, 'Deadly Stab',  dealDmg(17)),
      mkEnemy('Void Specter',   '👻','purple', 38, 16, 6, 11, 'Soul Rend',    dealDmg(16)),
      mkEnemy('Dark Templar',   '🧑','purple', 46, 18, 7, 11, 'Dark Smite',   dealDmg(18)),
      mkEnemy('Shadow Acolyte', '🔮','purple', 36, 15, 6, 10, 'Chaos Bolt',   dealAoE(10))
    ],
    gold: 250, packReward: 'warrior', stars: 0,
    label: 'Temple of Shadow', difficulty: 4
  },
  // Level 9 — 4 very hard enemies
  {
    enemies: [
      mkEnemy('Elder Demon',  '😈','purple', 50, 20, 9, 12, 'Hellfire',    dealDmg(20)),
      mkEnemy('Chaos Mage',   '🌀','purple', 44, 18, 7, 11, 'Chaos Surge', dealAoE(12)),
      mkEnemy('Void Lord',    '🌑','purple', 52, 19, 9, 12, 'Void Crush',  dealDmg(22)),
      mkEnemy('Demon Prime',  '👿','red',    48, 21, 8, 12, 'Doom Strike', dealDmg(21))
    ],
    gold: 300, packReward: null, stars: 0,
    label: 'Infernal Abyss', difficulty: 5
  },
  // Level 10 — Elite boss fight + champion pack
  {
    enemies: [
      mkEnemy('Ancient Dragon',  '🐲','red',    58, 22, 12, 13, 'Dragon Rage',  dealDmg(25)),
      mkEnemy('Elder Lich',      '💀','purple', 54, 20, 10, 13, 'Death Wave',   dealAoE(14)),
      mkEnemy('Chaos Overlord',  '🌀','purple', 56, 21, 11, 13, 'Chaos Blast',  dealDmg(24)),
      mkEnemy('Oblivion Lord',   '🌑','purple', 60, 22, 11, 14, 'Oblivion Ray', dealAoE(16))
    ],
    gold: 500, packReward: 'champion', stars: 0,
    label: 'The Final Throne', difficulty: 5
  }
];
