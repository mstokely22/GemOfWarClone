// ============================================================
//  GEMS OF COMBAT — Equipment Pack Definitions
// ============================================================
import { RARITY_COLORS } from './constants.js';

export const PACKS = {
  adventurer: {
    id: 'adventurer', name: 'Adventurer Pack',
    emoji: '🎒', cost: 150,
    desc: 'Common & Uncommon gear',
    color: '#4a7c4e',
    odds: [
      { rarity: 'common',   weight: 55 },
      { rarity: 'uncommon', weight: 35 },
      { rarity: 'rare',     weight:  9 },
      { rarity: 'epic',     weight:  1 },
    ]
  },
  champion: {
    id: 'champion', name: 'Champion Pack',
    emoji: '🏆', cost: 500,
    desc: 'Rare & Epic equipment',
    color: '#9b59b6',
    odds: [
      { rarity: 'uncommon',  weight: 20 },
      { rarity: 'rare',      weight: 45 },
      { rarity: 'epic',      weight: 30 },
      { rarity: 'legendary', weight:  5 },
    ]
  },
  legend: {
    id: 'legend', name: 'Legend Pack',
    emoji: '🌟', cost: 1200,
    desc: 'Epic & Legendary equipment',
    color: '#d4af37',
    odds: [
      { rarity: 'rare',      weight: 15 },
      { rarity: 'epic',      weight: 50 },
      { rarity: 'legendary', weight: 35 },
    ]
  },
};

export { RARITY_COLORS };
