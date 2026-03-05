// ============================================================
//  GEMS OF COMBAT — SVG Card Frame Art
//  Fantasy ornate card frames for each rarity.
//  cardFrame(rarity) → SVG string (viewBox 0 0 100 130).
//  Used as absolutely positioned background overlays on troop cards.
// ============================================================

import { RARITY_COLORS } from '../data/constants.js';

// Rarity border color gradient stops
const RARITY_FRAME = {
  common:    { hi: '#c8d4dc', mid: '#8a9ba8', lo: '#445058', shadow: '#1a2830' },
  uncommon:  { hi: '#88ffaa', mid: '#27ae60', lo: '#0e5028', shadow: '#041a10' },
  rare:      { hi: '#88ccff', mid: '#3498db', lo: '#0a3a60', shadow: '#041020' },
  epic:      { hi: '#e0aaff', mid: '#9b59b6', lo: '#3a0a60', shadow: '#14002a' },
  legendary: { hi: '#fff0a0', mid: '#d4af37', lo: '#7a5800', shadow: '#2a1800' },
};

// Ornate corner piece — 4-way filigree for each corner
function cornerPiece(x, y, rotDeg, color, hiColor) {
  return `<g transform="translate(${x},${y}) rotate(${rotDeg})">
    <!-- L-shaped bracket -->
    <path d="M0,0 L12,0 L12,2 L2,2 L2,12 L0,12 Z" fill="${hiColor}" opacity="0.85"/>
    <!-- Corner diamond ornament -->
    <polygon points="3,3 6,0 9,3 6,6" fill="${color}" opacity="0.9"/>
    <!-- Small accent circles -->
    <circle cx="11" cy="1" r="1.2" fill="${hiColor}" opacity="0.7"/>
    <circle cx="1"  cy="11" r="1.2" fill="${hiColor}" opacity="0.7"/>
    <!-- Filigree curl -->
    <path d="M4,8 Q7,5 10,8" stroke="${color}" stroke-width="0.8" fill="none" opacity="0.6"/>
  </g>`;
}

// Ornate mid-edge ornament (small centered medallion)
function edgeMedallion(x, y, rotDeg, color) {
  return `<g transform="translate(${x},${y}) rotate(${rotDeg})">
    <polygon points="0,-3 2.5,0 0,3 -2.5,0" fill="${color}" opacity="0.8"/>
    <line x1="-5" y1="0" x2="-2.5" y2="0" stroke="${color}" stroke-width="0.7" opacity="0.6"/>
    <line x1="2.5" y1="0" x2="5" y2="0" stroke="${color}" stroke-width="0.7" opacity="0.6"/>
  </g>`;
}

export function cardFrame(rarity = 'common') {
  const f = RARITY_FRAME[rarity] || RARITY_FRAME.common;
  const isLegendary = rarity === 'legendary';
  const gradId = `cf_${rarity}`;

  const legendaryGlow = isLegendary ? `
    <filter id="leg_glow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>` : '';

  const legendaryShimmer = isLegendary ? `
    <!-- Legendary shimmer sparkles -->
    <circle cx="8"  cy="8"  r="1.5" fill="#fff0a0" opacity="0.9"/>
    <circle cx="92" cy="8"  r="1.5" fill="#fff0a0" opacity="0.9"/>
    <circle cx="8"  cy="122" r="1.5" fill="#fff0a0" opacity="0.9"/>
    <circle cx="92" cy="122" r="1.5" fill="#fff0a0" opacity="0.9"/>
    <!-- Legendary inner glow ring -->
    <rect x="7" y="7" width="86" height="116" rx="6" fill="none"
          stroke="${f.hi}" stroke-width="0.6" opacity="0.55" filter="url(#leg_glow)"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="100%" height="100%" preserveAspectRatio="none" style="position:absolute;inset:0;pointer-events:none;z-index:0;">
  <defs>
    <linearGradient id="${gradId}_top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${f.lo}"/>
      <stop offset="35%"  stop-color="${f.hi}"/>
      <stop offset="65%"  stop-color="${f.hi}"/>
      <stop offset="100%" stop-color="${f.lo}"/>
    </linearGradient>
    <linearGradient id="${gradId}_side" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="${f.lo}"/>
      <stop offset="40%"  stop-color="${f.hi}"/>
      <stop offset="60%"  stop-color="${f.mid}"/>
      <stop offset="100%" stop-color="${f.lo}"/>
    </linearGradient>
    ${legendaryGlow}
  </defs>

  <!-- Outer shadow border -->
  <rect x="1" y="1" width="98" height="128" rx="8" fill="none" stroke="${f.shadow}" stroke-width="3" opacity="0.7"/>

  <!-- Main border frame — top/bottom bars -->
  <rect x="3" y="3" width="94" height="4" rx="2" fill="url(#${gradId}_top)"/>
  <rect x="3" y="123" width="94" height="4" rx="2" fill="url(#${gradId}_top)"/>
  <!-- Side bars -->
  <rect x="3" y="3" width="4" height="124" rx="2" fill="url(#${gradId}_side)"/>
  <rect x="93" y="3" width="4" height="124" rx="2" fill="url(#${gradId}_side)"/>

  <!-- Corner pieces — top-left, top-right, bottom-right, bottom-left -->
  ${cornerPiece(4, 4, 0, f.mid, f.hi)}
  ${cornerPiece(96, 4, 90, f.mid, f.hi)}
  ${cornerPiece(96, 126, 180, f.mid, f.hi)}
  ${cornerPiece(4, 126, 270, f.mid, f.hi)}

  <!-- Mid-edge medallions -->
  ${edgeMedallion(50, 5, 0, f.mid)}
  ${edgeMedallion(50, 125, 180, f.mid)}
  ${edgeMedallion(5, 65, 270, f.mid)}
  ${edgeMedallion(95, 65, 90, f.mid)}

  <!-- Inner thin accent line -->
  <rect x="10" y="10" width="80" height="110" rx="4" fill="none" stroke="${f.mid}" stroke-width="0.6" opacity="0.4"/>

  <!-- Top banner divider (separates portrait from stats) -->
  <line x1="10" y1="42" x2="90" y2="42" stroke="${f.mid}" stroke-width="0.8" opacity="0.5"/>
  <polygon points="50,40 53,42 50,44 47,42" fill="${f.hi}" opacity="0.7"/>

  ${legendaryShimmer}
</svg>`;
}

// ── Hero portrait icon SVG ────────────────────────────────────
// Returns an SVG badge (42x42) showing a silhouette based on hero archetype.
// Used in the top section of each troop card.
const ARCHETYPE_COLORS = {
  red:    '#e74c3c', blue:  '#3498db', green: '#27ae60',
  yellow: '#f1c40f', purple:'#9b59b6', brown: '#a0522d',
};

// Simple geometric silhouette shapes per troop class
const ARCHETYPE_PATH = {
  // Knight/warrior: shield with sword
  warrior: (c) => `
    <polygon points="21,6 6,11 6,22 21,36 36,22 36,11" fill="${c}" opacity="0.9" stroke="${c}" stroke-width="0.5"/>
    <line x1="21" y1="36" x2="21" y2="42" stroke="${c}" stroke-width="2" opacity="0.8"/>
    <line x1="16" y1="39" x2="26" y2="39" stroke="${c}" stroke-width="2" opacity="0.8"/>
    <ellipse cx="21" cy="20" rx="7" ry="8" fill="${adjustColor(c, -40)}" opacity="0.6"/>`,
  // Mage: pentacle + robes
  mage: (c) => `
    <polygon points="21,4 24,14 34,14 26,20 29,30 21,24 13,30 16,20 8,14 18,14" fill="${c}" opacity="0.9"/>
    <circle cx="21" cy="20" r="4" fill="${adjustColor(c, -40)}" opacity="0.7"/>`,
  // Priest: cross + halo
  priest: (c) => `
    <ellipse cx="21" cy="8" rx="12" ry="3" fill="${c}" opacity="0.4" stroke="${c}" stroke-width="0.5"/>
    <rect x="18" y="12" width="6" height="24" rx="1" fill="${c}" opacity="0.9"/>
    <rect x="11" y="18" width="20" height="6" rx="1" fill="${c}" opacity="0.9"/>
    <circle cx="21" cy="15" r="3" fill="${adjustColor(c, -40)}" opacity="0.6"/>`,
  // Rogue/thief: dagger
  rogue: (c) => `
    <path d="M21,3 L24,18 L26,40 L21,38 L16,40 L18,18 Z" fill="${c}" opacity="0.9"/>
    <path d="M21,3 L26,10 L28,8 Z" fill="white" opacity="0.5"/>
    <ellipse cx="21" cy="36" rx="5" ry="2.5" fill="${adjustColor(c, -30)}" opacity="0.6"/>`,
  // Paladin: shield with cross
  paladin: (c) => `
    <polygon points="21,4 6,10 6,24 21,38 36,24 36,10" fill="${c}" opacity="0.85" stroke="${c}" stroke-width="0.5"/>
    <rect x="19" y="10" width="4" height="20" rx="1" fill="white" opacity="0.5"/>
    <rect x="12" y="16" width="18" height="4" rx="1" fill="white" opacity="0.5"/>`,
  // Ranger: bow
  ranger: (c) => `
    <path d="M12,4 Q6,21 12,38" stroke="${c}" stroke-width="2.5" fill="none" opacity="0.9"/>
    <line x1="12" y1="4" x2="12" y2="38" stroke="${c}" stroke-width="1" opacity="0.7"/>
    <line x1="12" y1="21" x2="34" y2="21" stroke="${adjustColor(c, -20)}" stroke-width="1.5"/>
    <polygon points="34,17 38,21 34,25" fill="${c}" opacity="0.9"/>`,
  // Default: circular medallion
  default: (c) => `
    <circle cx="21" cy="21" r="16" fill="${c}" opacity="0.85"/>
    <circle cx="21" cy="21" r="10" fill="${adjustColor(c, -40)}" opacity="0.6"/>
    <polygon points="21,11 24,18 32,18 26,23 28,31 21,26 14,31 16,23 10,18 18,18" fill="white" opacity="0.3"/>`,
};

function adjustColor(hex, amount) {
  // Lighten or darken a hex color
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function heroPortrait(hero, uid = '') {
  const gid = `port_bg${uid}`;
  const color = ARCHETYPE_COLORS[hero.color] || '#7b2fff';
  // Use troop.archetype directly if present (player troops), fall back to keyword-sniffing for enemies
  const archetype = hero.archetype || guessArchetype(hero);
  const pathFn = ARCHETYPE_PATH[archetype] || ARCHETYPE_PATH.default;
  const rarColors = {
    common: '#8a9ba8', uncommon: '#27ae60', rare: '#3498db', epic: '#9b59b6', legendary: '#d4af37'
  };
  const rarC = rarColors[hero.rarity] || '#8a9ba8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="${gid}" cx="50%" cy="40%" r="65%">
      <stop offset="0%"   stop-color="${adjustColor(color, -60)}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0d0821" stop-opacity="0.95"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect x="1" y="1" width="40" height="40" rx="5" fill="url(#${gid})" stroke="${rarC}" stroke-width="1.2"/>
  <!-- Archetype silhouette -->
  ${pathFn(color)}
  <!-- Rarity corner gem -->
  <polygon points="36,2 40,6 36,10 32,6" fill="${rarC}" opacity="0.9"/>
</svg>`;
}

// Fallback for enemies (which don't have archetype property)
function guessArchetype(hero) {
  const id = (hero.id || '').toLowerCase();
  if (id.includes('knight') || id.includes('warrior') || id.includes('guardian') ||
      id.includes('drake') || id.includes('lord') || id.includes('dragon') ||
      id.includes('demon') || id.includes('overlord')) return 'warrior';
  if (id.includes('mage') || id.includes('shaman') || id.includes('witch') ||
      id.includes('acolyte') || id.includes('lich') || id.includes('specter')) return 'mage';
  if (id.includes('rogue') || id.includes('scout') || id.includes('assassin') ||
      id.includes('dancer') || id.includes('thief') || id.includes('imp')) return 'rogue';
  return 'default';
}
