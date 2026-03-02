// ============================================================
//  GEMS OF COMBAT — SVG Icon Library
//  Fantasy ornate icons replacing emoji statistics.
//  Each function returns an SVG string or img-ready data URI.
// ============================================================

// ── Stat Icons ───────────────────────────────────────────────

export function iconSword() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="16" height="16" style="vertical-align:middle">
  <defs>
    <linearGradient id="sw_g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  stop-color="#e8e0cc"/>
      <stop offset="50%" stop-color="#a09080"/>
      <stop offset="100%" stop-color="#c8c0b0"/>
    </linearGradient>
  </defs>
  <!-- Blade -->
  <path d="M13,1 L17,5 L6,13 L4,11 Z" fill="url(#sw_g)" stroke="#888070" stroke-width="0.4"/>
  <!-- Fuller (groove) -->
  <line x1="10" y1="4" x2="15" y2="9" stroke="#a09080" stroke-width="0.5" opacity="0.6"/>
  <!-- Guard -->
  <path d="M4,10 L3,8 L6,7 L8,10 L5,11 Z" fill="#c8a040" stroke="#886820" stroke-width="0.4"/>
  <!-- Grip -->
  <path d="M3,11 L1,17 L3,16 L5,13 Z" fill="#7a4820" stroke="#4a2810" stroke-width="0.4"/>
  <!-- Pommel -->
  <circle cx="1.5" cy="16.5" r="1.3" fill="#c8a040" stroke="#886820" stroke-width="0.4"/>
  <!-- Blade tip shine -->
  <line x1="15" y1="3" x2="12" y2="2" stroke="white" stroke-width="0.5" opacity="0.5"/>
</svg>`;
}

export function iconShield() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="16" height="16" style="vertical-align:middle">
  <defs>
    <linearGradient id="sh_g" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%"   stop-color="#c0d0e0"/>
      <stop offset="45%"  stop-color="#6080a0"/>
      <stop offset="100%" stop-color="#304060"/>
    </linearGradient>
  </defs>
  <!-- Shield outer shape -->
  <path d="M9,1 L16,4 L16,10 C16,14 13,16.5 9,17.5 C5,16.5 2,14 2,10 L2,4 Z" fill="url(#sh_g)" stroke="#3a5880" stroke-width="0.6"/>
  <!-- Shield boss (center rivet) -->
  <circle cx="9" cy="10" r="2.5" fill="#c0a030" stroke="#886820" stroke-width="0.5"/>
  <!-- Shield cross ornament -->
  <line x1="9" y1="4" x2="9" y2="16" stroke="#4a6888" stroke-width="0.6" opacity="0.6"/>
  <line x1="3" y1="8" x2="15" y2="8" stroke="#4a6888" stroke-width="0.6" opacity="0.6"/>
  <!-- Top highlight -->
  <path d="M5,3 Q9,2 13,3 Q11,2 9,1.5 Q7,2 5,3Z" fill="white" opacity="0.3"/>
</svg>`;
}

export function iconHeart() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="16" height="16" style="vertical-align:middle">
  <defs>
    <radialGradient id="ht_g" cx="40%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#ff9999"/>
      <stop offset="55%"  stop-color="#e74c3c"/>
      <stop offset="100%" stop-color="#7a1010"/>
    </radialGradient>
  </defs>
  <!-- Heart shape -->
  <path d="M9,15 C9,15 1,10 1,5.5 C1,3 3,1.5 5.5,1.5 C7,1.5 8.2,2.2 9,3.2 C9.8,2.2 11,1.5 12.5,1.5 C15,1.5 17,3 17,5.5 C17,10 9,15 9,15Z" fill="url(#ht_g)" stroke="#7a1010" stroke-width="0.5"/>
  <!-- Highlight -->
  <path d="M5,3 Q7,2 8,4 Q6.5,2.5 5,3Z" fill="white" opacity="0.4"/>
</svg>`;
}

export function iconMana(color = '#9b59b6') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="12" height="12" style="vertical-align:middle">
  <defs>
    <radialGradient id="mn_g" cx="40%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${color}"/>
    </radialGradient>
  </defs>
  <!-- Mana crystal — small diamond -->
  <polygon points="7,1 12,5 12,9 7,13 2,9 2,5" fill="url(#mn_g)" stroke="${color}" stroke-width="0.5"/>
  <polygon points="7,3 10,6 7,11 4,6" fill="white" opacity="0.2"/>
</svg>`;
}

// ── Nav Button Icons ─────────────────────────────────────────

export function iconBattle() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
  <defs>
    <linearGradient id="batt_g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#e8e0cc"/>
      <stop offset="100%" stop-color="#c8a040"/>
    </linearGradient>
  </defs>
  <!-- Two crossed swords -->
  <path d="M32,4 L36,8 L12,28 L10,26 Z" fill="url(#batt_g)" stroke="#888" stroke-width="0.6"/>
  <path d="M8,4  L4,8  L28,28 L30,26 Z" fill="url(#batt_g)" stroke="#888" stroke-width="0.6"/>
  <!-- Guards -->
  <rect x="16" y="14" width="8" height="3" rx="1" fill="#c8a040" transform="rotate(-45,20,15.5)"/>
  <rect x="16" y="23" width="8" height="3" rx="1" fill="#c8a040" transform="rotate(45,20,24.5)"/>
  <!-- Pommel circles -->
  <circle cx="10" cy="34" r="3" fill="#c8a040" stroke="#886820" stroke-width="0.8"/>
  <circle cx="30" cy="34" r="3" fill="#c8a040" stroke="#886820" stroke-width="0.8"/>
</svg>`;
}

export function iconHeroes() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
  <defs>
    <radialGradient id="hero_g" cx="50%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#ffe0c0"/>
      <stop offset="100%" stop-color="#c07840"/>
    </radialGradient>
  </defs>
  <!-- Helm / crown shape -->
  <polygon points="20,3 28,10 36,8 32,18 20,16 8,18 4,8 12,10" fill="url(#hero_g)" stroke="#886830" stroke-width="0.7"/>
  <!-- Crown jewels -->
  <circle cx="20" cy="7"  r="2.5" fill="#e74c3c" stroke="#7a1010" stroke-width="0.5"/>
  <circle cx="12" cy="11" r="1.8" fill="#3498db" stroke="#0a3a60" stroke-width="0.5"/>
  <circle cx="28" cy="11" r="1.8" fill="#27ae60" stroke="#0e4020" stroke-width="0.5"/>
  <!-- Helm visor -->
  <path d="M10,18 Q10,28 20,30 Q30,28 30,18" fill="url(#hero_g)" stroke="#886830" stroke-width="0.7"/>
  <!-- Visor slit -->
  <path d="M13,22 Q20,24 27,22" stroke="#5a3810" stroke-width="1.5" fill="none"/>
  <!-- Base rim -->
  <rect x="8" y="30" width="24" height="4" rx="2" fill="#c8a040" stroke="#886820" stroke-width="0.6"/>
</svg>`;
}

export function iconPacks() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
  <defs>
    <linearGradient id="pack_g" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%"   stop-color="#c8a060"/>
      <stop offset="100%" stop-color="#7a5020"/>
    </linearGradient>
  </defs>
  <!-- Card stack (3 cards offset) -->
  <rect x="14" y="10" width="22" height="28" rx="3" fill="#3a2510" stroke="#7a5020" stroke-width="0.8" transform="rotate(-8,25,24)" opacity="0.7"/>
  <rect x="10" y="8"  width="22" height="28" rx="3" fill="#4a3520" stroke="#8a6030" stroke-width="0.8" transform="rotate(-3,21,22)" opacity="0.85"/>
  <!-- Front card -->
  <rect x="6"  y="6"  width="22" height="28" rx="3" fill="url(#pack_g)" stroke="#c8a040" stroke-width="1.2"/>
  <!-- Card face ornament -->
  <rect x="9" y="9" width="16" height="22" rx="2" fill="none" stroke="#d4af37" stroke-width="0.7" opacity="0.6"/>
  <!-- Star on card -->
  <polygon points="17,14 18.5,18.5 23,18.5 19.5,21 21,26 17,23 13,26 14.5,21 11,18.5 15.5,18.5" fill="#d4af37" opacity="0.85"/>
</svg>`;
}

export function iconMap() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
  <!-- Scroll / map background -->
  <path d="M4,8 Q4,5 7,5 L13,5 L13,35 Q13,38 10,38 Q7,38 7,35 L7,32 Q7,29 10,29 L36,29 L36,8 Q36,5 33,5 L13,5" fill="#c8a870" stroke="#886830" stroke-width="0.8"/>
  <path d="M7,8 L36,8 L36,29 L7,29 Z" fill="#e0c090" stroke="#886830" stroke-width="0.5"/>
  <!-- Map path line -->
  <path d="M12,23 Q18,18 20,22 Q22,26 28,20 Q32,16 34,18" stroke="#5a3810" stroke-width="1.5" fill="none" stroke-dasharray="2,2"/>
  <!-- Location markers -->
  <circle cx="12" cy="23" r="2" fill="#e74c3c" stroke="#7a1010" stroke-width="0.5"/>
  <circle cx="34" cy="18" r="2.5" fill="#d4af37" stroke="#886820" stroke-width="0.5"/>
  <!-- Star on destination -->
  <polygon points="34,15 34.8,17.5 37.5,17.5 35.3,19 36.2,21.5 34,20 31.8,21.5 32.7,19 30.5,17.5 33.2,17.5" fill="#d4af37" opacity="0.9" transform="scale(0.7) translate(19,8)"/>
</svg>`;
}

// ── Pack Tier Back Designs ────────────────────────────────────
export function packBackDesign(packId) {
  const designs = {
    adventurer: { color1: '#2a4a2e', color2: '#4a7c4e', accent: '#88cc88', symbol: 'M20,8 L24,16 L32,16 L26,21 L28,29 L20,24 L12,29 L14,21 L8,16 L16,16Z' },
    warrior:    { color1: '#1a2a50', color2: '#3a6090', accent: '#88aaff', symbol: 'M20,6 L34,14 L34,26 L20,34 L6,26 L6,14Z' },
    champion:   { color1: '#2a1040', color2: '#6a30a0', accent: '#cc88ff', symbol: 'M20,5 L23,14 L32,14 L25.5,19.5 L27.5,28.5 L20,23 L12.5,28.5 L14.5,19.5 L8,14 L17,14Z' },
    legend:     { color1: '#302000', color2: '#7a5000', accent: '#ffd700', symbol: 'M20,4 L23,13 L33,13 L25,19 L28,29 L20,23 L12,29 L15,19 L7,13 L17,13Z' },
  };
  const d = designs[packId] || designs.adventurer;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110" width="80" height="110">
  <defs>
    <radialGradient id="pb_${packId}" cx="50%" cy="40%" r="65%">
      <stop offset="0%"   stop-color="${d.color2}"/>
      <stop offset="100%" stop-color="${d.color1}"/>
    </radialGradient>
  </defs>
  <rect width="80" height="110" rx="8" fill="url(#pb_${packId})" stroke="${d.accent}" stroke-width="1.5"/>
  <rect x="4" y="4" width="72" height="102" rx="6" fill="none" stroke="${d.accent}" stroke-width="0.6" opacity="0.5"/>
  <!-- Symbol -->
  <path d="${d.symbol}" fill="${d.accent}" opacity="0.85" transform="translate(20,30) scale(1.0)"/>
  <!-- Decorative dots at corners of inner rect -->
  <circle cx="8"  cy="8"   r="2" fill="${d.accent}" opacity="0.7"/>
  <circle cx="72" cy="8"   r="2" fill="${d.accent}" opacity="0.7"/>
  <circle cx="8"  cy="102" r="2" fill="${d.accent}" opacity="0.7"/>
  <circle cx="72" cy="102" r="2" fill="${d.accent}" opacity="0.7"/>
</svg>`;
}

// ── Gem legend icons (small, for the mana legend bar) ──────────
export function legendGemIcon(type, color) {
  const shapes = {
    red:    'M10,2 L16,6 L18,10 L16,14 L10,18 L4,14 L2,10 L4,6Z',
    blue:   'M10,2 C14,6 18,8 18,13 C18,17 14,19 10,19 C6,19 2,17 2,13 C2,8 6,6 10,2Z',
    green:  'M10,2 C10,2 18,8 18,12 C18,16 14,19 10,19 C6,19 2,16 2,12 C2,8 10,2 10,2Z',
    yellow: 'M10,1 L12,8 L19,8 L14,13 L16,19 L10,15 L4,19 L6,13 L1,8 L8,8Z',
    purple: 'M10,2 L13,7 L19,7 L14,11 L16,17 L10,13 L4,17 L6,11 L1,7 L7,7Z',
    brown:  'M10,3 L17,6 L17,14 L10,17 L3,14 L3,6Z',
    skull:  'M10,2 C6,2 2,6 2,11 C2,14 4,16 7,17 L7,19 L13,19 L13,17 C16,16 18,14 18,11 C18,6 14,2 10,2Z',
  };
  const shape = shapes[type] || shapes.red;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="18" height="18" style="vertical-align:middle">
  <defs>
    <radialGradient id="lg_${type}" cx="38%" cy="30%" r="68%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${color}"/>
    </radialGradient>
  </defs>
  <path d="${shape}" fill="url(#lg_${type})" stroke="${color}" stroke-width="0.8"/>
  ${type === 'skull' ? '<circle cx="6.5" cy="11" r="2" fill="#050505"/><circle cx="13.5" cy="11" r="2" fill="#050505"/>' : ''}
</svg>`;
}
