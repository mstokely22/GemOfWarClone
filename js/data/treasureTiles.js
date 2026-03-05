// ============================================================
//  GEMS OF COMBAT — Treasure Hunt Tile Definitions
//  6-tier treasure chain: Copper → Silver → Gold → Bag → Chest → Vault
// ============================================================

export const TREASURE_TIERS = [
  { tier: 1, id: 'copper',  name: 'Copper Coin',     emoji: '🪙',  color: '#b87333', bg: 'radial-gradient(circle at 35% 35%, #d4945a, #7a4418)', border: '#b87333' },
  { tier: 2, id: 'silver',  name: 'Silver Coin',     emoji: '🥈',  color: '#c0c0c0', bg: 'radial-gradient(circle at 35% 35%, #d8d8d8, #6a6a6a)', border: '#c0c0c0' },
  { tier: 3, id: 'gold',    name: 'Gold Coin',       emoji: '🥇',  color: '#ffd700', bg: 'radial-gradient(circle at 35% 35%, #ffe566, #b8860b)', border: '#ffd700' },
  { tier: 4, id: 'bag',     name: 'Money Bag',       emoji: '💰',  color: '#27ae60', bg: 'radial-gradient(circle at 35% 35%, #58d68d, #1a5e35)', border: '#27ae60' },
  { tier: 5, id: 'chest',   name: 'Treasure Chest',  emoji: '🎁',  color: '#3498db', bg: 'radial-gradient(circle at 35% 35%, #5dade2, #1a5276)', border: '#3498db' },
  { tier: 6, id: 'vault',   name: 'Vault',           emoji: '👑',  color: '#9b59b6', bg: 'radial-gradient(circle at 35% 35%, #c39bd3, #6c3483)', border: '#9b59b6' },
];

export const TIER_BY_ID = Object.fromEntries(TREASURE_TIERS.map(t => [t.id, t]));
export const MAX_TIER   = 6;

// Rewards granted per tile left on the board at end-of-game
export const TILE_REWARDS = {
  copper: { type: 'gold', amount: 5 },
  silver: { type: 'gold', amount: 15 },
  gold:   { type: 'gold', amount: 50 },
  bag:    { type: 'materials', amount: [1, 3] },   // 1-3 random base materials
  chest:  { type: 'equipment' },                    // 1 random equipment item
  vault:  { type: 'shards', amount: [2, 5] },       // 2-5 shards for a random unlocked hero
};

// Spawn weights for new tiles falling in after gravity
// Heavily favour copper so high-tier tiles come from merging
export const SPAWN_WEIGHTS = [
  { tier: 1, weight: 70 },
  { tier: 2, weight: 25 },
  { tier: 3, weight: 5  },
];

export const TH_BOARD_SIZE   = 8;
export const TH_START_TURNS  = 8;
