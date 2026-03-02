// ============================================================
//  GEMS OF COMBAT — Hero Roster
// ============================================================

export const HERO_ROSTER = [
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
export const HERO_BY_ID = Object.fromEntries(HERO_ROSTER.map(h => [h.id, h]));
