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
      { rarity: 'common',   weight: 70 },
      { rarity: 'uncommon', weight: 25 },
      { rarity: 'rare',     weight:  5 },
    ]
  },
  warrior: {
    id: 'warrior', name: 'Warrior Pack',
    emoji: '⚔️', cost: 400,
    desc: 'Uncommon & Rare equipment',
    color: '#3a80c8',
    odds: [
      { rarity: 'uncommon',  weight: 45 },
      { rarity: 'rare',      weight: 42 },
      { rarity: 'epic',      weight: 12 },
      { rarity: 'legendary', weight:  1 },
    ]
  },
  champion: {
    id: 'champion', name: 'Champion Pack',
    emoji: '🏆', cost: 900,
    desc: 'Rare & Epic equipment',
    color: '#9b59b6',
    odds: [
      { rarity: 'rare',      weight: 45 },
      { rarity: 'epic',      weight: 45 },
      { rarity: 'legendary', weight: 10 },
    ]
  },
  legend: {
    id: 'legend', name: 'Legend Pack',
    emoji: '🌟', cost: 1800,
    desc: 'Epic & Legendary equipment',
    color: '#d4af37',
    odds: [
      { rarity: 'epic',      weight: 60 },
      { rarity: 'legendary', weight: 40 },
    ]
  },
};

export { RARITY_COLORS };
