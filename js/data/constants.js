// ============================================================
//  GEMS OF COMBAT — Constants
// ============================================================

export const GEM_TYPES   = ['red','blue','green','yellow','purple','brown','skull'];
export const GEM_SYMBOLS = { red:'🔥', blue:'💧', green:'🌿', yellow:'⚡', purple:'✨', brown:'🪨', skull:'💀' };

export const BOARD_SIZE  = 8;
export const GEM_SIZE    = 66;   // px (matches CSS --gem-size)
export const GEM_GAP     = 4;    // px
export const CELL        = GEM_SIZE + GEM_GAP;  // 66px per grid cell

export const SKULL_BONUS_PER_GEM = 2;
export const SWIPE_THRESHOLD     = 15;  // px minimum swipe distance

// Empowered gems — rare gems that explode (3×3) when matched.
// Base chance applied per new gem spawned. Passives/gear can add to this.
export const EMPOWERED_SPAWN_CHANCE = 0.03;  // 3% base chance

export const ANIM_SWAP   = 180;  // ms — gem swap slide
export const ANIM_MATCH  = 320;  // ms — gem pop
export const ANIM_FALL   = 280;  // ms — gem fall/spawn
export const ENEMY_DELAY = 900;  // ms — pause before enemy acts
export const ANIM_ATTACK = 350;  // ms — skull projectile travel

export const RARITY_ORDER = { common:0, uncommon:1, rare:2, epic:3, legendary:4 };
export const RARITY_COLORS = {
  common:    '#8a9ba8',
  uncommon:  '#27ae60',
  rare:      '#3498db',
  epic:      '#9b59b6',
  legendary: '#d4af37',
};
export const RARITY_GLOWS = {
  common:    'none',
  uncommon:  '0 0 8px #27ae60',
  rare:      '0 0 12px #3498db',
  epic:      '0 0 16px #9b59b6, 0 0 32px #6c3483',
  legendary: '0 0 20px #d4af37, 0 0 40px #f39c12, 0 0 60px rgba(212,175,55,.4)',
};
