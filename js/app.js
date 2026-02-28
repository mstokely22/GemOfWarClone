// ============================================================
//  GEMS OF COMBAT — Meta-game: heroes, levels, gacha, screens
// ============================================================
'use strict';

// ══════════════════════════════════════════════════════════════
//  HERO ROSTER  (master list of every hero in the game)
// ══════════════════════════════════════════════════════════════
const HERO_ROSTER = [
  // ─── COMMON ──────────────────────────────────────────────
  {
    id:'iron_sentinel', name:'Iron Sentinel', rarity:'common',
    color:'brown', emoji:'🛡', attack:10, armor:8, maxLife:35, manaCost:10,
    spell:'Shield Wall', spellDesc:'Give all living allies +4 armor (permanent)',
    cast(self, allies) {
      const living = allies.filter(t=>t.life>0);
      living.forEach(t => t.armor = (t.armor||0) + 4);
      return `${self.name} raises a Shield Wall — all allies gain +4 armor!`;
    }
  },
  {
    id:'goblin_shaman', name:'Goblin Shaman', rarity:'common',
    color:'green', emoji:'🧙', attack:8, armor:3, maxLife:22, manaCost:9,
    spell:'Poison Cloud', spellDesc:'Deal 6 damage to all enemies',
    cast(self, allies, enemies) {
      enemies.filter(t=>t.life>0).forEach(t => { t.life = Math.max(0, t.life - 6); });
      return `${self.name} casts Poison Cloud — all enemies take 6 damage!`;
    }
  },
  {
    id:'plague_rat', name:'Plague Rat', rarity:'common',
    color:'green', emoji:'🐀', attack:9, armor:2, maxLife:20, manaCost:8,
    spell:'Gnaw', spellDesc:'Deal 10 damage to front enemy, heal self for 5',
    cast(self, allies, enemies) {
      const t = enemies.find(t=>t.life>0);
      if (!t) return '';
      t.life = Math.max(0, t.life - 10);
      self.life = Math.min(self.maxLife, self.life + 5);
      return `${self.name} gnaws ${t.name} for 10 damage and heals 5 HP!`;
    }
  },
  {
    id:'bone_knight', name:'Bone Knight', rarity:'common',
    color:'brown', emoji:'🦴', attack:13, armor:6, maxLife:28, manaCost:11,
    spell:'Soul Drain', spellDesc:'Steal 8 HP from the front enemy',
    cast(self, allies, enemies) {
      const t = enemies.find(t=>t.life>0);
      if (!t) return '';
      t.life = Math.max(0, t.life - 8);
      self.life = Math.min(self.maxLife, self.life + 8);
      return `${self.name} casts Soul Drain — steals 8 HP from ${t.name}!`;
    }
  },
  // ─── UNCOMMON ────────────────────────────────────────────
  {
    id:'fire_drake', name:'Fire Drake', rarity:'uncommon',
    color:'red', emoji:'🐉', attack:16, armor:4, maxLife:24, manaCost:12,
    spell:'Flame Burst', spellDesc:'Deal 25 damage to the front enemy',
    cast(self, allies, enemies) {
      const t = enemies.find(t=>t.life>0);
      if (!t) return '';
      t.life = Math.max(0, t.life - 25);
      return `${self.name} unleashes Flame Burst on ${t.name} for 25 damage!`;
    }
  },
  {
    id:'frost_mage', name:'Frost Mage', rarity:'uncommon',
    color:'blue', emoji:'🧊', attack:10, armor:2, maxLife:18, manaCost:9,
    spell:'Blizzard', spellDesc:'Deal 12 damage to the front enemy, 6 to the second',
    cast(self, allies, enemies) {
      const alive = enemies.filter(t=>t.life>0);
      let msg = `${self.name} unleashes Blizzard!`;
      if (alive[0]) { alive[0].life = Math.max(0, alive[0].life - 12); msg += ` ${alive[0].name} takes 12!`; }
      if (alive[1]) { alive[1].life = Math.max(0, alive[1].life - 6);  msg += ` ${alive[1].name} takes 6!`; }
      return msg;
    }
  },
  {
    id:'storm_dancer', name:'Storm Dancer', rarity:'uncommon',
    color:'yellow', emoji:'⚡', attack:12, armor:3, maxLife:21, manaCost:9,
    spell:'Thunder Bolt', spellDesc:'Deal 20 damage to a random enemy',
    cast(self, allies, enemies) {
      const alive = enemies.filter(t=>t.life>0);
      if (!alive.length) return '';
      const t = alive[Math.floor(Math.random() * alive.length)];
      t.life = Math.max(0, t.life - 20);
      return `${self.name} hurls a Thunder Bolt — ${t.name} takes 20 damage!`;
    }
  },
  // ─── RARE ────────────────────────────────────────────────
  {
    id:'valkyrie', name:'Valkyrie', rarity:'rare',
    color:'yellow', emoji:'⚔️', attack:11, armor:6, maxLife:30, manaCost:10,
    spell:'Divine Light', spellDesc:'Heal the most-wounded ally for 15 HP',
    cast(self, allies) {
      const t = [...allies].filter(t=>t.life>0).sort((a,b)=>(a.life/a.maxLife)-(b.life/b.maxLife))[0];
      if (!t) return '';
      t.life = Math.min(t.maxLife, t.life + 15);
      return `${self.name} casts Divine Light — ${t.name} recovers 15 HP!`;
    }
  },
  {
    id:'blood_reaper', name:'Blood Reaper', rarity:'rare',
    color:'red', emoji:'🩸', attack:17, armor:4, maxLife:26, manaCost:12,
    spell:'Death Strike', spellDesc:'Deal 30 damage to front enemy, heal self 10',
    cast(self, allies, enemies) {
      const t = enemies.find(t=>t.life>0);
      if (!t) return '';
      t.life = Math.max(0, t.life - 30);
      self.life = Math.min(self.maxLife, self.life + 10);
      return `${self.name} lands a Death Strike on ${t.name} for 30 damage, heals 10!`;
    }
  },
  {
    id:'dark_witch', name:'Dark Witch', rarity:'rare',
    color:'purple', emoji:'🧝', attack:9, armor:3, maxLife:20, manaCost:11,
    spell:'Hex', spellDesc:'Deal 12 damage to all enemies',
    cast(self, allies, enemies) {
      enemies.filter(t=>t.life>0).forEach(t => { t.life = Math.max(0, t.life - 12); });
      return `${self.name} casts Hex — all enemies take 12 damage!`;
    }
  },
  // ─── EPIC ────────────────────────────────────────────────
  {
    id:'shadow_mage', name:'Shadow Mage', rarity:'epic',
    color:'purple', emoji:'🌑', attack:14, armor:5, maxLife:25, manaCost:13,
    spell:'Void Blast', spellDesc:'Deal 40 damage to the front enemy',
    cast(self, allies, enemies) {
      const t = enemies.find(t=>t.life>0);
      if (!t) return '';
      t.life = Math.max(0, t.life - 40);
      return `${self.name} fires a Void Blast at ${t.name} for 40 damage!`;
    }
  },
  {
    id:'tide_caller', name:'Tide Caller', rarity:'epic',
    color:'blue', emoji:'🌊', attack:12, armor:6, maxLife:28, manaCost:12,
    spell:'Tsunami', spellDesc:'Deal 15 damage to ALL enemies',
    cast(self, allies, enemies) {
      enemies.filter(t=>t.life>0).forEach(t => { t.life = Math.max(0, t.life - 15); });
      return `${self.name} calls a Tsunami — all enemies take 15 damage!`;
    }
  },
  // ─── LEGENDARY ───────────────────────────────────────────
  {
    id:'dragon_lord', name:'Dragon Lord', rarity:'legendary',
    color:'red', emoji:'🔱', attack:22, armor:8, maxLife:40, manaCost:15,
    spell:'Dragon Fire', spellDesc:'50 dmg to front enemy + 20 dmg to all others',
    cast(self, allies, enemies) {
      const alive = enemies.filter(t=>t.life>0);
      if (!alive.length) return '';
      alive[0].life = Math.max(0, alive[0].life - 50);
      alive.slice(1).forEach(t => { t.life = Math.max(0, t.life - 20); });
      return `${self.name} breathes Dragon Fire — ${alive[0].name} takes 50, rest take 20!`;
    }
  },
  {
    id:'void_queen', name:'Void Queen', rarity:'legendary',
    color:'purple', emoji:'👑', attack:18, armor:7, maxLife:35, manaCost:14,
    spell:'Soul Harvest', spellDesc:'Deal 8 dmg to ALL units, heal self for total dealt',
    cast(self, allies, enemies) {
      const allUnits = [...allies, ...enemies].filter(t => t.life > 0 && t !== self);
      let total = 0;
      allUnits.forEach(t => {
        const dmg = Math.min(t.life, 8);
        t.life = Math.max(0, t.life - 8);
        total += dmg;
      });
      self.life = Math.min(self.maxLife, self.life + total);
      return `${self.name} casts Soul Harvest — drains 8 from all units, heals ${total} HP!`;
    }
  }
];

// Quick lookup by id
const HERO_BY_ID = Object.fromEntries(HERO_ROSTER.map(h => [h.id, h]));

// ══════════════════════════════════════════════════════════════
//  LEVEL CONFIGURATIONS  (10 levels of progressively harder foes)
// ══════════════════════════════════════════════════════════════
function mkEnemy(name, emoji, color, hp, attack, armor, manaCost, spell, castFn) {
  return { id: name.toLowerCase().replace(/\s/g,'_'), name, emoji, color,
           attack, armor, maxLife: hp, manaCost, spell,
           spellDesc: spell, cast: castFn };
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

const LEVELS = [
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
    label: 'Warchief\'s Camp', difficulty: 2
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
      mkEnemy('Fire Imp',    '🔥','red', 36, 15, 6, 10, 'Ember Toss',  dealDmg(14)),
      mkEnemy('Ember Knight','⚔️','red', 40, 17, 6, 10, 'Flame Slash', dealDmg(16)),
      mkEnemy('Lava Drake',  '🐉','red', 38, 16, 7, 11, 'Magma Breath',dealAoE(9)),
      mkEnemy('Cinder Mage', '🔮','red', 32, 14, 5, 10, 'Fireball',    dealDmg(15))
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
      mkEnemy('Elder Demon',  '😈','purple', 50, 20, 9, 12, 'Hellfire',   dealDmg(20)),
      mkEnemy('Chaos Mage',   '🌀','purple', 44, 18, 7, 11, 'Chaos Surge',dealAoE(12)),
      mkEnemy('Void Lord',    '🌑','purple', 52, 19, 9, 12, 'Void Crush', dealDmg(22)),
      mkEnemy('Demon Prime',  '👿','red',    48, 21, 8, 12, 'Doom Strike',dealDmg(21))
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

// ══════════════════════════════════════════════════════════════
//  CARD PACK DEFINITIONS
// ══════════════════════════════════════════════════════════════
const PACKS = {
  adventurer: {
    id: 'adventurer', name: 'Adventurer Pack',
    emoji: '🎒', cost: 150,
    desc: 'Common & Uncommon heroes',
    color: '#4a7c4e',
    odds: [
      { rarity: 'common',   weight: 70 },
      { rarity: 'uncommon', weight: 25 },
      { rarity: 'rare',     weight:  5 }
    ]
  },
  warrior: {
    id: 'warrior', name: 'Warrior Pack',
    emoji: '⚔️', cost: 400,
    desc: 'Uncommon & Rare heroes',
    color: '#3a80c8',
    odds: [
      { rarity: 'uncommon', weight: 45 },
      { rarity: 'rare',     weight: 42 },
      { rarity: 'epic',     weight: 12 },
      { rarity: 'legendary',weight:  1 }
    ]
  },
  champion: {
    id: 'champion', name: 'Champion Pack',
    emoji: '🏆', cost: 900,
    desc: 'Rare & Epic heroes',
    color: '#9b59b6',
    odds: [
      { rarity: 'rare',      weight: 45 },
      { rarity: 'epic',      weight: 45 },
      { rarity: 'legendary', weight: 10 }
    ]
  },
  legend: {
    id: 'legend', name: 'Legend Pack',
    emoji: '🌟', cost: 1800,
    desc: 'Epic & Legendary heroes',
    color: '#d4af37',
    odds: [
      { rarity: 'epic',      weight: 60 },
      { rarity: 'legendary', weight: 40 }
    ]
  }
};

const RARITY_ORDER = { common:0, uncommon:1, rare:2, epic:3, legendary:4 };
const RARITY_COLORS = {
  common: '#8a9ba8', uncommon: '#27ae60', rare: '#3498db',
  epic: '#9b59b6', legendary: '#d4af37'
};
const RARITY_GLOWS = {
  common: 'none', uncommon: '0 0 8px #27ae60',
  rare: '0 0 12px #3498db', epic: '0 0 16px #9b59b6, 0 0 32px #6c3483',
  legendary: '0 0 20px #d4af37, 0 0 40px #f39c12, 0 0 60px rgba(212,175,55,.4)'
};

// ══════════════════════════════════════════════════════════════
//  SAVED STATE  (persisted to localStorage)
// ══════════════════════════════════════════════════════════════
const SAVE_KEY = 'gems_of_combat_v2';
let save = {};

const DEFAULT_SAVE = {
  gold: 250,
  highestLevel: 0,
  levelStars: {},            // { '0': 1, '4': 1, ... }   levelIndex → stars
  unlockedHeroIds: ['iron_sentinel'],
  equippedTeam: ['iron_sentinel', null, null, null], // 4 slots
  freePacks: [],             // array of pack ids granted as rewards
};

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    save = raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : { ...DEFAULT_SAVE };
  } catch { save = { ...DEFAULT_SAVE }; }
}
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

// ══════════════════════════════════════════════════════════════
//  GACHA LOGIC
// ══════════════════════════════════════════════════════════════
function rollPack(packId) {
  const pack = PACKS[packId];
  const totalWeight = pack.odds.reduce((s, o) => s + o.weight, 0);
  let rng = Math.random() * totalWeight;
  let rarity = pack.odds[pack.odds.length - 1].rarity;
  for (const o of pack.odds) {
    rng -= o.weight;
    if (rng <= 0) { rarity = o.rarity; break; }
  }

  // Pick random hero of that rarity
  const pool = HERO_ROSTER.filter(h => h.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getDuplicateGold(rarity) {
  return { common:30, uncommon:60, rare:150, epic:400, legendary:1000 }[rarity] ?? 30;
}

// ══════════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ══════════════════════════════════════════════════════════════
let currentScreen = 'home';

function updateGoldDisplays() {
  const g = save.gold;
  ['hud-gold','home-gold','map-gold','team-gold','heroes-gold','packs-gold'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = g;
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.classList.remove('hidden');
  currentScreen = id;
  updateGoldDisplays();
}

// ══════════════════════════════════════════════════════════════
//  HOME SCREEN
// ══════════════════════════════════════════════════════════════
function renderHome() {
  document.getElementById('hud-gold').textContent = save.gold;
  // Show best level
  const best = save.highestLevel;
  document.getElementById('home-progress').textContent =
    best === 0 ? 'No battles won yet' :
    best >= 10 ? '🏆 All 10 levels complete!' :
    `Progress: Level ${best}/10 complete`;
  showScreen('home');
}

// ══════════════════════════════════════════════════════════════
//  MAP SCREEN
// ══════════════════════════════════════════════════════════════
function renderMap() {
  document.getElementById('hud-gold').textContent = save.gold;
  const container = document.getElementById('map-nodes');
  container.innerHTML = '';

  LEVELS.forEach((lvl, i) => {
    const unlocked  = i === 0 || save.highestLevel >= i;
    const completed = save.highestLevel > i;
    const current   = !completed && unlocked;

    const node = document.createElement('div');
    node.className = 'map-node' +
      (completed ? ' completed' : '') +
      (current   ? ' current'   : '') +
      (!unlocked ? ' locked'    : '');

    const stars = save.levelStars?.[i] || 0;
    const starsHtml = completed ? '⭐' : (unlocked ? '' : '🔒');
    const diffDots  = '◆'.repeat(lvl.difficulty) + '◇'.repeat(5 - lvl.difficulty);

    node.innerHTML = `
      <div class="node-num">${i + 1}</div>
      <div class="node-label">${lvl.label}</div>
      <div class="node-diff">${diffDots}</div>
      <div class="node-reward">💰 ${lvl.gold}g${lvl.packReward ? ' + 📦' : ''}</div>
      <div class="node-star">${starsHtml}</div>
    `;
    if (unlocked) node.addEventListener('click', () => goToTeamBuilder(i));
    container.appendChild(node);

    // Connector line (not after last)
    if (i < LEVELS.length - 1) {
      const line = document.createElement('div');
      line.className = 'map-line' + (completed ? ' done' : '');
      container.appendChild(line);
    }
  });

  showScreen('map');
}

// ══════════════════════════════════════════════════════════════
//  TEAM BUILDER
// ══════════════════════════════════════════════════════════════
let pendingLevelIdx = 0;
let pickerSlot      = -1;   // which slot we're currently assigning

function goToTeamBuilder(levelIdx) {
  pendingLevelIdx = levelIdx;
  renderTeamBuilder();
  showScreen('team');
}

function renderTeamBuilder() {
  document.getElementById('hud-gold').textContent = save.gold;
  const lvl = LEVELS[pendingLevelIdx];
  document.getElementById('team-level-title').textContent =
    `Level ${pendingLevelIdx + 1} — ${lvl.label}`;

  // Enemy preview
  const preview = document.getElementById('team-enemy-preview');
  preview.innerHTML = lvl.enemies.map(e =>
    `<div class="enemy-chip">${e.emoji} ${e.name}</div>`
  ).join('');

  renderTeamSlots();
}

function renderTeamSlots() {
  const slots = document.getElementById('team-slots');
  slots.innerHTML = '';
  save.equippedTeam.forEach((heroId, i) => {
    const hero = heroId ? HERO_BY_ID[heroId] : null;
    const div  = document.createElement('div');
    div.className = 'team-slot' + (hero ? '' : ' empty');
    if (hero) {
      div.innerHTML = `
        <div class="slot-emoji">${hero.emoji}</div>
        <div class="slot-name">${hero.name}</div>
        <div class="slot-rarity" style="color:${RARITY_COLORS[hero.rarity]}">${hero.rarity}</div>
        <div class="slot-remove" onclick="clearSlot(${i})">✕</div>
      `;
      div.style.borderColor = RARITY_COLORS[hero.rarity];
    } else {
      div.innerHTML = `<div class="slot-plus">+</div><div class="slot-name">Empty</div>`;
      div.addEventListener('click', () => openHeroPicker(i));
    }
    div.addEventListener('click', (e) => {
      if (!e.target.classList.contains('slot-remove') && !hero) openHeroPicker(i);
      else if (hero && !e.target.classList.contains('slot-remove')) openHeroPicker(i);
    });
    slots.appendChild(div);
  });
}

function openHeroPicker(slotIdx) {
  pickerSlot = slotIdx;
  const picker = document.getElementById('hero-picker-overlay');
  const grid   = document.getElementById('picker-grid');
  grid.innerHTML = '';

  const ownedIds = save.unlockedHeroIds;
  // Already equipped in other slots
  const usedIds  = save.equippedTeam.filter((id, i) => id && i !== slotIdx);

  ownedIds.forEach(id => {
    const hero = HERO_BY_ID[id];
    if (!hero) return;
    const used = usedIds.includes(id);
    const card = document.createElement('div');
    card.className = 'picker-card' + (used ? ' used' : '');
    card.style.borderColor = RARITY_COLORS[hero.rarity];
    card.innerHTML = `
      <div class="picker-emoji">${hero.emoji}</div>
      <div class="picker-name">${hero.name}</div>
      <div class="picker-rarity" style="color:${RARITY_COLORS[hero.rarity]}">${hero.rarity}</div>
    `;
    if (!used) card.addEventListener('click', () => assignHero(id));
    grid.appendChild(card);
  });

  picker.classList.remove('hidden');
}

function assignHero(heroId) {
  save.equippedTeam[pickerSlot] = heroId;
  writeSave();
  document.getElementById('hero-picker-overlay').classList.add('hidden');
  renderTeamSlots();
}

function clearSlot(i) {
  save.equippedTeam[i] = null;
  writeSave();
  renderTeamSlots();
}

function closePicker() {
  document.getElementById('hero-picker-overlay').classList.add('hidden');
}

function launchBattle() {
  const teamIds = save.equippedTeam.filter(Boolean);
  if (teamIds.length === 0) {
    alert('Add at least one hero to your team!');
    return;
  }

  // Build troop objects (clone from roster + reset life/mana)
  const playerTeam = teamIds.map(id => {
    const h = HERO_BY_ID[id];
    return { ...h, life: h.maxLife, mana: 0 };
  });

  const lvl = LEVELS[pendingLevelIdx];
  const enemyTeam = lvl.enemies.map(e => ({ ...e, life: e.maxLife, mana: 0 }));

  showScreen('battle');
  // Let the DOM settle before starting
  requestAnimationFrame(() => {
    window.BATTLE.start(playerTeam, enemyTeam);
  });
}

// ══════════════════════════════════════════════════════════════
//  BATTLE BRIDGE — called by game.js when battle ends
// ══════════════════════════════════════════════════════════════
window.onBattleEnd = function(won) {
  if (won) {
    const lvl = LEVELS[pendingLevelIdx];
    // Award gold
    save.gold += lvl.gold;
    // Mark level complete
    if (pendingLevelIdx >= save.highestLevel) {
      save.highestLevel = pendingLevelIdx + 1;
    }
    save.levelStars = save.levelStars || {};
    save.levelStars[pendingLevelIdx] = 1;
    // Award pack
    if (lvl.packReward) {
      save.freePacks = save.freePacks || [];
      save.freePacks.push(lvl.packReward);
    }
    writeSave();
    // Show victory rewards screen
    showVictoryRewards(lvl);
  } else {
    // Just go back to map
    renderMap();
  }
};

function showVictoryRewards(lvl) {
  document.getElementById('vict-level').textContent =
    `Level ${pendingLevelIdx + 1} — ${lvl.label}`;
  document.getElementById('vict-gold').textContent = `+${lvl.gold} 💰`;
  document.getElementById('vict-pack').textContent =
    lvl.packReward ? `+1 ${PACKS[lvl.packReward].name} 📦` : '';
  document.getElementById('vict-next').style.display =
    pendingLevelIdx < 9 ? '' : 'none';
  showScreen('victory');
}

function victToContinue() {
  renderMap();
}

function victNextLevel() {
  if (pendingLevelIdx < 9) {
    goToTeamBuilder(pendingLevelIdx + 1);
  }
}

// ══════════════════════════════════════════════════════════════
//  HEROES COLLECTION SCREEN
// ══════════════════════════════════════════════════════════════
function renderHeroes() {
  document.getElementById('hud-gold').textContent = save.gold;
  const grid = document.getElementById('heroes-grid');
  grid.innerHTML = '';

  // Sort: owned first (by rarity desc), then locked (by rarity desc)
  const sorted = [...HERO_ROSTER].sort((a, b) => {
    const aOwned = save.unlockedHeroIds.includes(a.id);
    const bOwned = save.unlockedHeroIds.includes(b.id);
    if (aOwned !== bOwned) return bOwned ? 1 : -1;
    return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
  });

  sorted.forEach(hero => {
    const owned = save.unlockedHeroIds.includes(hero.id);
    const card  = document.createElement('div');
    card.className = 'hero-card' + (owned ? '' : ' locked');
    card.style.borderColor = owned ? RARITY_COLORS[hero.rarity] : '#333';
    card.style.boxShadow   = owned ? RARITY_GLOWS[hero.rarity] : 'none';

    if (owned) {
      card.innerHTML = `
        <div class="hero-card-emoji">${hero.emoji}</div>
        <div class="hero-card-name">${hero.name}</div>
        <div class="hero-card-rarity" style="color:${RARITY_COLORS[hero.rarity]}">${hero.rarity.toUpperCase()}</div>
        <div class="hero-card-stats">⚔️${hero.attack} 🛡${hero.armor} ❤️${hero.maxLife}</div>
        <div class="hero-card-spell">✨ ${hero.spell}</div>
        <div class="hero-card-spelldesc">${hero.spellDesc}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="hero-card-emoji locked-emoji">?</div>
        <div class="hero-card-name">???</div>
        <div class="hero-card-rarity" style="color:${RARITY_COLORS[hero.rarity]}">${hero.rarity.toUpperCase()}</div>
        <div class="hero-card-spelldesc">Unlock via Card Packs</div>
      `;
    }
    grid.appendChild(card);
  });

  showScreen('heroes');
}

// ══════════════════════════════════════════════════════════════
//  CARD PACKS SCREEN
// ══════════════════════════════════════════════════════════════
function renderPacks() {
  document.getElementById('hud-gold').textContent = save.gold;

  // Notify about free packs
  const freeCount = (save.freePacks || []).length;
  document.getElementById('free-packs-notice').textContent =
    freeCount > 0 ? `🎁 You have ${freeCount} free pack${freeCount > 1 ? 's' : ''}!` : '';

  const container = document.getElementById('packs-grid');
  container.innerHTML = '';

  Object.values(PACKS).forEach(pack => {
    const canAfford = save.gold >= pack.cost;
    const freeAvail = (save.freePacks || []).includes(pack.id);

    const card = document.createElement('div');
    card.className = 'pack-card' + (!canAfford && !freeAvail ? ' cant-afford' : '');
    card.style.borderColor = pack.color;

    const oddsHtml = pack.odds.map(o =>
      `<span style="color:${RARITY_COLORS[o.rarity]}">${o.rarity} ${o.weight}%</span>`
    ).join(' · ');

    card.innerHTML = `
      <div class="pack-emoji">${pack.emoji}</div>
      <div class="pack-name">${pack.name}</div>
      <div class="pack-desc">${pack.desc}</div>
      <div class="pack-odds">${oddsHtml}</div>
      <div class="pack-cost">${freeAvail ? '<span class="free-badge">FREE!</span>' : `💰 ${pack.cost}g`}</div>
      <button class="pack-buy-btn" ${!canAfford && !freeAvail ? 'disabled' : ''}
        onclick="purchasePack('${pack.id}')">
        ${freeAvail ? '🎁 Open Free' : canAfford ? '🛒 Buy & Open' : '🔒 Need more gold'}
      </button>
    `;
    container.appendChild(card);
  });

  showScreen('packs');
}

// ══════════════════════════════════════════════════════════════
//  GACHA — PACK OPENING
// ══════════════════════════════════════════════════════════════
let gachaPendingPackId = null;

function purchasePack(packId) {
  const pack = PACKS[packId];
  const freeIdx = (save.freePacks || []).indexOf(packId);
  const hasFree = freeIdx >= 0;

  if (!hasFree && save.gold < pack.cost) return;

  if (hasFree) {
    save.freePacks.splice(freeIdx, 1);
  } else {
    save.gold -= pack.cost;
  }
  writeSave();
  openPackAnimation(packId);
}

function openPackAnimation(packId) {
  gachaPendingPackId = packId;
  const pack = PACKS[packId];

  // Reset state
  const cardWrap = document.getElementById('gacha-card-wrap');
  cardWrap.classList.remove('flipped');
  document.getElementById('gacha-result-info').classList.add('hidden');
  document.getElementById('gacha-collect-btn').classList.add('hidden');
  document.getElementById('gacha-pack-name').textContent = pack.name;

  // Style the card back
  document.getElementById('gacha-card-back').style.background =
    `radial-gradient(circle at 40% 40%, ${pack.color}aa, #1a0a3e)`;

  // Roll result ahead of time (revealed on flip)
  const hero   = rollPack(packId);
  const isNew  = !save.unlockedHeroIds.includes(hero.id);

  showScreen('gacha');

  // Auto-flip after brief suspense
  setTimeout(() => {
    revealGachaCard(hero, isNew);
  }, 1200);
}

function revealGachaCard(hero, isNew) {
  const cardWrap = document.getElementById('gacha-card-wrap');
  const infoEl   = document.getElementById('gacha-result-info');

  // Style card front
  const front = document.getElementById('gacha-card-front');
  front.style.borderColor = RARITY_COLORS[hero.rarity];
  front.style.boxShadow   = RARITY_GLOWS[hero.rarity];
  front.style.background  =
    `radial-gradient(circle at 35% 35%, #231545, #0d0821)`;

  document.getElementById('gacha-hero-emoji').textContent  = hero.emoji;
  document.getElementById('gacha-hero-name').textContent   = hero.name;
  document.getElementById('gacha-hero-rarity').textContent = hero.rarity.toUpperCase();
  document.getElementById('gacha-hero-rarity').style.color = RARITY_COLORS[hero.rarity];
  document.getElementById('gacha-hero-spell').textContent  = `✨ ${hero.spell}`;
  document.getElementById('gacha-hero-desc').textContent   = hero.spellDesc;
  document.getElementById('gacha-hero-stats').textContent  =
    `⚔️ ${hero.attack}  🛡 ${hero.armor}  ❤️ ${hero.maxLife}`;

  const badge = document.getElementById('gacha-new-badge');
  if (isNew) {
    badge.textContent = '✨ NEW HERO!';
    badge.className   = 'gacha-badge new';
    // Unlock hero
    save.unlockedHeroIds.push(hero.id);
  } else {
    const compensation = getDuplicateGold(hero.rarity);
    save.gold += compensation;
    badge.textContent = `💰 Duplicate (+${compensation}g)`;
    badge.className   = 'gacha-badge dupe';
  }
  writeSave();

  // Flip!
  cardWrap.classList.add('flipped');

  setTimeout(() => {
    infoEl.classList.remove('hidden');
    document.getElementById('gacha-collect-btn').classList.remove('hidden');
  }, 600);
}

function collectGachaResult() {
  renderPacks();
}

// ══════════════════════════════════════════════════════════════
//  RESPONSIVE SCALING
//  Fits the 980×700 battle canvas into whatever viewport we have.
//  Called on load, resize, and orientation change.
// ══════════════════════════════════════════════════════════════
function scaleBattle() {
  // Design dimensions (must match #game-container width/height in CSS)
  const DESIGN_W = 980;
  const DESIGN_H = 700;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Scale down to fit; never scale above 1× (keeps crispness on desktop)
  const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H, 1);
  document.documentElement.style.setProperty('--battle-scale', scale.toFixed(4));
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  scaleBattle();
  window.addEventListener('resize', scaleBattle);
  // orientationchange fires before dimensions settle; delay briefly
  window.addEventListener('orientationchange', () => setTimeout(scaleBattle, 120));

  loadSave();
  renderHome();

  // Wire nav buttons  
  document.getElementById('btn-battle').addEventListener('click', renderMap);
  document.getElementById('btn-heroes').addEventListener('click', renderHeroes);
  document.getElementById('btn-packs').addEventListener('click', renderPacks);
});
