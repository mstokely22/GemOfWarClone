// ============================================================
//  GEMS OF COMBAT — SVG Gem Art
//  Fantasy ornate jewel designs for each gem type.
//  Each function returns an SVG string (viewBox 0 0 56 56).
// ============================================================

const DEFS = {
  // Shared filter: inner glow via blur+composite
  glowFilter(id, color, stdDev = 3, strength = 1) {
    return `
      <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${stdDev}" result="blur"/>
        <feComposite in="blur" in2="SourceGraphic" operator="over" result="glow"/>
        <feBlend in="glow" in2="SourceGraphic" mode="screen"/>
      </filter>`;
  },
};

// Thin ornate filigree ring — small circles at each corner of a diamond
function filigreeRing(cx, cy, r, color, n = 8) {
  let pts = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    pts += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.4" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.7"/>`;
  }
  return pts;
}

// ── Red Gem (Fire Ruby) ──────────────────────────────────────
export function gemRed() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_r" cx="38%" cy="30%" r="65%">
      <stop offset="0%"   stop-color="#ff9e7d"/>
      <stop offset="35%"  stop-color="#e63c1e"/>
      <stop offset="75%"  stop-color="#8b1a08"/>
      <stop offset="100%" stop-color="#3d0500"/>
    </radialGradient>
    <radialGradient id="rg_r2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ff6644" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ff2200" stop-opacity="0"/>
    </radialGradient>
    <filter id="fg_r" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Outer ornate frame -->
  <polygon points="28,3 48,16 51,28 48,40 28,53 8,40 5,28 8,16" fill="#2a0500" stroke="#7a2010" stroke-width="1.2" opacity="0.9"/>
  <!-- Main gem body — octagonal ruby -->
  <polygon points="28,6 45,16 49,28 45,40 28,50 11,40 7,28 11,16" fill="url(#rg_r)"/>
  <!-- Inner fire gradient -->
  <ellipse cx="28" cy="28" rx="16" ry="16" fill="url(#rg_r2)" filter="url(#fg_r)"/>
  <!-- Facet lines -->
  <line x1="28" y1="6"  x2="28" y2="50" stroke="#ff3300" stroke-width="0.5" opacity="0.25"/>
  <line x1="7"  y1="28" x2="49" y2="28" stroke="#ff3300" stroke-width="0.5" opacity="0.25"/>
  <line x1="11" y1="16" x2="45" y2="40" stroke="#ff4411" stroke-width="0.5" opacity="0.22"/>
  <line x1="45" y1="16" x2="11" y2="40" stroke="#ff4411" stroke-width="0.5" opacity="0.22"/>
  <!-- Facet top face -->
  <polygon points="28,6 37,13 28,20 19,13" fill="#ff6644" opacity="0.35"/>
  <!-- Corner filigree accents -->
  <circle cx="28" cy="6"  r="2"   fill="none" stroke="#ff8855" stroke-width="1.2"/>
  <circle cx="28" cy="50" r="2"   fill="none" stroke="#ff8855" stroke-width="1.2"/>
  <circle cx="7"  cy="28" r="1.8" fill="none" stroke="#cc3311" stroke-width="1"/>
  <circle cx="49" cy="28" r="1.8" fill="none" stroke="#cc3311" stroke-width="1"/>
  <!-- Top sparkle highlight -->
  <ellipse cx="22" cy="17" rx="5" ry="2.5" fill="white" opacity="0.35" transform="rotate(-25,22,17)"/>
  <circle  cx="20" cy="15" r="1.5"          fill="white" opacity="0.55"/>
  <!-- Flame-tip ornament at top -->
  <path d="M25,4 Q28,0 31,4 Q28,2 25,4Z" fill="#ff8844" opacity="0.8"/>
  <!-- Border filigree ring -->
  ${filigreeRing(28, 28, 23, '#ff6633', 16)}
</svg>`;
}

// ── Blue Gem (Water Sapphire) ─────────────────────────────────
export function gemBlue() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_b" cx="40%" cy="28%" r="68%">
      <stop offset="0%"   stop-color="#a8e8ff"/>
      <stop offset="30%"  stop-color="#3498db"/>
      <stop offset="70%"  stop-color="#1a4f7a"/>
      <stop offset="100%" stop-color="#0a1f40"/>
    </radialGradient>
    <radialGradient id="rg_b2" cx="50%" cy="40%" r="50%">
      <stop offset="0%"   stop-color="#66ddff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0055aa" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer ornate frame — water droplet shape -->
  <path d="M28,4 C38,14 50,22 50,34 C50,44 40,52 28,52 C16,52 6,44 6,34 C6,22 18,14 28,4Z" fill="#061428" stroke="#1a6090" stroke-width="1.2"/>
  <!-- Main gem body -->
  <path d="M28,7 C37,16 47,23 47,33 C47,42 38.5,49 28,49 C17.5,49 9,42 9,33 C9,23 19,16 28,7Z" fill="url(#rg_b)"/>
  <!-- Inner glow -->
  <ellipse cx="28" cy="34" rx="13" ry="14" fill="url(#rg_b2)"/>
  <!-- Water facet ripples -->
  <path d="M28,7  C32,20 34,28 34,33" stroke="#66ccff" stroke-width="0.6" fill="none" opacity="0.3"/>
  <path d="M28,7  C24,20 22,28 22,33" stroke="#66ccff" stroke-width="0.6" fill="none" opacity="0.3"/>
  <path d="M15,23 C20,27 28,29 35,27" stroke="#88ddff" stroke-width="0.5" fill="none" opacity="0.3"/>
  <path d="M12,32 C18,38 28,40 38,38 C42,36 46,34 47,33" stroke="#88ddff" stroke-width="0.6" fill="none" opacity="0.25"/>
  <!-- Facet top triangle -->
  <polygon points="28,7 38,20 28,24 18,20" fill="#88ccff" opacity="0.28"/>
  <!-- Ornate tip at top -->
  <circle  cx="28" cy="7"  r="2.5" fill="none" stroke="#66aaff" stroke-width="1.2"/>
  <path    d="M25,5 Q28,2 31,5" stroke="#aaddff" stroke-width="1" fill="none"/>
  <!-- Teardrop bottom ornament -->
  <path d="M23,47 Q28,52 33,47" stroke="#3377bb" stroke-width="1" fill="none" opacity="0.8"/>
  <!-- Top highlight -->
  <ellipse cx="22" cy="18" rx="5" ry="2.5" fill="white" opacity="0.38" transform="rotate(-30,22,18)"/>
  <circle  cx="20" cy="16" r="1.5" fill="white" opacity="0.6"/>
  <!-- Filigree ring -->
  ${filigreeRing(28, 33, 19, '#44aaff', 12)}
</svg>`;
}

// ── Green Gem (Nature Emerald) ────────────────────────────────
export function gemGreen() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_g" cx="38%" cy="30%" r="66%">
      <stop offset="0%"   stop-color="#9affb0"/>
      <stop offset="30%"  stop-color="#27ae60"/>
      <stop offset="70%"  stop-color="#135e30"/>
      <stop offset="100%" stop-color="#062210"/>
    </radialGradient>
    <radialGradient id="rg_g2" cx="50%" cy="45%" r="50%">
      <stop offset="0%"   stop-color="#55ff88" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#006622" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer marquise frame -->
  <ellipse cx="28" cy="28" rx="23" ry="24" fill="#061808" stroke="#1a6630" stroke-width="1.2"/>
  <!-- Main gem body — vertical marquise / oval cut -->
  <ellipse cx="28" cy="28" rx="20" ry="21" fill="url(#rg_g)"/>
  <!-- Inner glow -->
  <ellipse cx="28" cy="30" rx="11" ry="13" fill="url(#rg_g2)"/>
  <!-- Leaf vein facets -->
  <line x1="28" y1="7"  x2="28" y2="49" stroke="#44ee66" stroke-width="0.7" opacity="0.25"/>
  <path d="M28,7  Q35,18 35,28 Q35,38 28,49" stroke="#44ee66" stroke-width="0.5" fill="none" opacity="0.2"/>
  <path d="M28,7  Q21,18 21,28 Q21,38 28,49" stroke="#44ee66" stroke-width="0.5" fill="none" opacity="0.2"/>
  <path d="M10,22 Q19,26 28,26 Q37,26 46,22" stroke="#55dd77" stroke-width="0.5" fill="none" opacity="0.22"/>
  <path d="M10,34 Q19,30 28,30 Q37,30 46,34" stroke="#55dd77" stroke-width="0.5" fill="none" opacity="0.22"/>
  <!-- Top facet -->
  <polygon points="28,7 36,17 28,22 20,17" fill="#55ee77" opacity="0.25"/>
  <!-- Ornate top and bottom tips -->
  <circle cx="28" cy="7"  r="2.2" fill="none" stroke="#66ff88" stroke-width="1.2"/>
  <circle cx="28" cy="49" r="2.2" fill="none" stroke="#33aa55" stroke-width="1"/>
  <path d="M25,5 Q28,2 31,5 Q28,3 25,5Z" fill="#99ffaa" opacity="0.7"/>
  <!-- Left/right side ornaments -->
  <path d="M8,22 Q5,28 8,34" stroke="#33aa55" stroke-width="1" fill="none" opacity="0.7"/>
  <path d="M48,22 Q51,28 48,34" stroke="#33aa55" stroke-width="1" fill="none" opacity="0.7"/>
  <!-- Highlight -->
  <ellipse cx="22" cy="18" rx="5" ry="2.5" fill="white" opacity="0.35" transform="rotate(-20,22,18)"/>
  <circle  cx="20" cy="15" r="1.5" fill="white" opacity="0.55"/>
  <!-- Filigree -->
  ${filigreeRing(28, 28, 22, '#44cc66', 12)}
</svg>`;
}

// ── Yellow Gem (Lightning Topaz) ──────────────────────────────
export function gemYellow() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_y" cx="38%" cy="28%" r="65%">
      <stop offset="0%"   stop-color="#fffaaa"/>
      <stop offset="30%"  stop-color="#f5c500"/>
      <stop offset="65%"  stop-color="#9a7000"/>
      <stop offset="100%" stop-color="#3a2500"/>
    </radialGradient>
    <radialGradient id="rg_y2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffee55" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#aa8800" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer star-cut frame -->
  <polygon points="28,3 33,13 43,8 38,19 52,21 42,28 52,35 38,37 43,48 33,43 28,53 23,43 13,48 18,37 4,35 14,28 4,21 18,19 13,8 23,13" fill="#201000" stroke="#aa8800" stroke-width="1" opacity="0.85"/>
  <!-- Main gem body — angular diamond -->
  <polygon points="28,7 44,21 44,35 28,49 12,35 12,21" fill="url(#rg_y)"/>
  <!-- Inner glow -->
  <polygon points="28,16 38,25 38,31 28,40 18,31 18,25" fill="url(#rg_y2)"/>
  <!-- Facet lines — star burst -->
  <line x1="28" y1="7"  x2="28" y2="49" stroke="#ffdd00" stroke-width="0.6" opacity="0.3"/>
  <line x1="12" y1="21" x2="44" y2="35" stroke="#ffdd00" stroke-width="0.6" opacity="0.25"/>
  <line x1="44" y1="21" x2="12" y2="35" stroke="#ffdd00" stroke-width="0.6" opacity="0.25"/>
  <line x1="12" y1="28" x2="44" y2="28" stroke="#ffee44" stroke-width="0.5" opacity="0.2"/>
  <!-- Lightning bolt facet mark -->
  <path d="M31,13 L25,27 L30,27 L24,43 L33,27 L27,27 Z" fill="#ffe060" opacity="0.55"/>
  <!-- Facet top highlight -->
  <polygon points="28,7 36,16 28,21 20,16" fill="#ffee99" opacity="0.3"/>
  <!-- Star point ornaments -->
  <circle cx="28" cy="3"  r="2"   fill="none" stroke="#ffcc00" stroke-width="1.2"/>
  <circle cx="52" cy="21" r="1.5" fill="none" stroke="#ddaa00" stroke-width="0.8"/>
  <circle cx="52" cy="35" r="1.5" fill="none" stroke="#ddaa00" stroke-width="0.8"/>
  <circle cx="28" cy="53" r="2"   fill="none" stroke="#ffcc00" stroke-width="1.2"/>
  <circle cx="4"  cy="21" r="1.5" fill="none" stroke="#ddaa00" stroke-width="0.8"/>
  <circle cx="4"  cy="35" r="1.5" fill="none" stroke="#ddaa00" stroke-width="0.8"/>
  <!-- Top highlight -->
  <ellipse cx="21" cy="17" rx="5" ry="2.5" fill="white" opacity="0.4" transform="rotate(-25,21,17)"/>
  <circle  cx="19" cy="15" r="1.5" fill="white" opacity="0.65"/>
  ${filigreeRing(28, 28, 20, '#ddaa00', 12)}
</svg>`;
}

// ── Purple Gem (Arcane Amethyst) ──────────────────────────────
export function gemPurple() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_p" cx="40%" cy="28%" r="65%">
      <stop offset="0%"   stop-color="#e0aaff"/>
      <stop offset="30%"  stop-color="#9b59b6"/>
      <stop offset="68%"  stop-color="#4a1575"/>
      <stop offset="100%" stop-color="#14003a"/>
    </radialGradient>
    <radialGradient id="rg_p2" cx="50%" cy="45%" r="50%">
      <stop offset="0%"   stop-color="#cc66ff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#440088" stop-opacity="0"/>
    </radialGradient>
    <filter id="fg_p" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Outer octagram frame -->
  <polygon points="28,3 34,11 43,8 42,18 52,21 46,30 52,39 42,39 43,48 34,46 28,53 22,46 13,48 14,39 4,39 10,30 4,21 14,18 13,8 22,11" fill="#0d0022" stroke="#6622aa" stroke-width="1" opacity="0.9"/>
  <!-- Inner star cut body -->
  <polygon points="28,8 37,17 47,22 37,28 47,34 37,39 28,48 19,39 9,34 19,28 9,22 19,17" fill="url(#rg_p)"/>
  <!-- Inner arcane glow -->
  <circle cx="28" cy="28" r="13" fill="url(#rg_p2)" filter="url(#fg_p)"/>
  <!-- Arcane rune facets — six-pointed star + circles -->
  <polygon points="28,17 31.5,22.5 28,28 24.5,22.5" fill="none" stroke="#dd88ff" stroke-width="0.7" opacity="0.4"/>
  <polygon points="28,39 31.5,33.5 28,28 24.5,33.5" fill="none" stroke="#dd88ff" stroke-width="0.7" opacity="0.4"/>
  <line x1="9"  y1="28" x2="47" y2="28" stroke="#cc55ff" stroke-width="0.6" opacity="0.25"/>
  <line x1="14" y1="18" x2="42" y2="38" stroke="#cc55ff" stroke-width="0.6" opacity="0.22"/>
  <line x1="42" y1="18" x2="14" y2="38" stroke="#cc55ff" stroke-width="0.6" opacity="0.22"/>
  <!-- Central arcane rune circle -->
  <circle cx="28" cy="28" r="5" fill="none" stroke="#cc55ff" stroke-width="0.8" stroke-dasharray="2,2"/>
  <!-- Star-point ornaments -->
  <circle cx="28" cy="8"  r="2"   fill="#bb66ff" opacity="0.9"/>
  <circle cx="28" cy="48" r="2"   fill="#bb66ff" opacity="0.9"/>
  <circle cx="9"  cy="22" r="1.5" fill="#882299" opacity="0.7"/>
  <circle cx="47" cy="22" r="1.5" fill="#882299" opacity="0.7"/>
  <circle cx="9"  cy="34" r="1.5" fill="#882299" opacity="0.7"/>
  <circle cx="47" cy="34" r="1.5" fill="#882299" opacity="0.7"/>
  <!-- Top highlight -->
  <ellipse cx="22" cy="16" rx="5" ry="2.5" fill="white" opacity="0.35" transform="rotate(-20,22,16)"/>
  <circle  cx="20" cy="14" r="1.5" fill="white" opacity="0.55"/>
  ${filigreeRing(28, 28, 21, '#9933cc', 16)}
</svg>`;
}

// ── Brown Gem (Earth Amber) ────────────────────────────────────
export function gemBrown() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_br" cx="38%" cy="30%" r="66%">
      <stop offset="0%"   stop-color="#e8c090"/>
      <stop offset="28%"  stop-color="#c07030"/>
      <stop offset="68%"  stop-color="#6a3510"/>
      <stop offset="100%" stop-color="#2a1005"/>
    </radialGradient>
    <radialGradient id="rg_br2" cx="50%" cy="45%" r="50%">
      <stop offset="0%"   stop-color="#ffaa55" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#883300" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer hexagonal frame -->
  <polygon points="28,3 50,15 50,41 28,53 6,41 6,15" fill="#180800" stroke="#7a4020" stroke-width="1.2"/>
  <!-- Main gem body — hexagonal amber/topaz cut -->
  <polygon points="28,6 48,17 48,39 28,50 8,39 8,17" fill="url(#rg_br)"/>
  <!-- Inner earth glow -->
  <polygon points="28,14 42,22 42,34 28,42 14,34 14,22" fill="url(#rg_br2)"/>
  <!-- Stone vein facets -->
  <line x1="28" y1="6"  x2="28" y2="50" stroke="#cc8844" stroke-width="0.6" opacity="0.25"/>
  <line x1="8"  y1="17" x2="48" y2="39" stroke="#bb7733" stroke-width="0.6" opacity="0.22"/>
  <line x1="48" y1="17" x2="8"  y2="39" stroke="#bb7733" stroke-width="0.6" opacity="0.22"/>
  <line x1="8"  y1="28" x2="48" y2="28" stroke="#cc9944" stroke-width="0.5" opacity="0.2"/>
  <!-- Hexagonal grid texture lines (inner micro-facets) -->
  <path d="M22,14 L28,20 L34,14" stroke="#ddaa66" stroke-width="0.6" fill="none" opacity="0.3"/>
  <path d="M22,42 L28,36 L34,42" stroke="#ddaa66" stroke-width="0.6" fill="none" opacity="0.3"/>
  <path d="M8,24 L16,28 L8,32"   stroke="#cc9944" stroke-width="0.5" fill="none" opacity="0.25"/>
  <path d="M48,24 L40,28 L48,32" stroke="#cc9944" stroke-width="0.5" fill="none" opacity="0.25"/>
  <!-- Top facet -->
  <polygon points="28,6 38,14 28,20 18,14" fill="#e8a060" opacity="0.3"/>
  <!-- Hex corner ornaments -->
  <circle cx="28" cy="6"  r="2.2" fill="none" stroke="#ddaa44" stroke-width="1.2"/>
  <circle cx="28" cy="50" r="2.2" fill="none" stroke="#aa7722" stroke-width="1"/>
  <circle cx="8"  cy="17" r="1.8" fill="none" stroke="#885522" stroke-width="0.9"/>
  <circle cx="48" cy="17" r="1.8" fill="none" stroke="#885522" stroke-width="0.9"/>
  <circle cx="8"  cy="39" r="1.8" fill="none" stroke="#885522" stroke-width="0.9"/>
  <circle cx="48" cy="39" r="1.8" fill="none" stroke="#885522" stroke-width="0.9"/>
  <!-- Highlight -->
  <ellipse cx="21" cy="17" rx="5" ry="2.5" fill="white" opacity="0.32" transform="rotate(-20,21,17)"/>
  <circle  cx="19" cy="15" r="1.5" fill="white" opacity="0.5"/>
  ${filigreeRing(28, 28, 22, '#aa6622', 12)}
</svg>`;
}

// ── Skull Gem (Death Token) ────────────────────────────────────
export function gemSkull() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="rg_sk" cx="40%" cy="30%" r="65%">
      <stop offset="0%"   stop-color="#d0ccb8"/>
      <stop offset="40%"  stop-color="#8a8880"/>
      <stop offset="80%"  stop-color="#3a3830"/>
      <stop offset="100%" stop-color="#111010"/>
    </radialGradient>
    <radialGradient id="rg_eye" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#101010"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <filter id="fg_sk" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Outer dark ornate frame -->
  <circle cx="28" cy="28" r="26" fill="#0a0a08" stroke="#3a3830" stroke-width="1.2"/>
  <!-- Skull cranium -->
  <path d="M28,7 C16,7 8,15 8,24 C8,31 11,35 16,38 L16,44 C16,45.5 17.5,47 19,47 L37,47 C38.5,47 40,45.5 40,44 L40,38 C45,35 48,31 48,24 C48,15 40,7 28,7Z" fill="url(#rg_sk)" stroke="#444038" stroke-width="0.8"/>
  <!-- Bone-segment jaw indicators -->
  <line x1="21" y1="47" x2="21" y2="44" stroke="#222018" stroke-width="1.5"/>
  <line x1="28" y1="47" x2="28" y2="44" stroke="#222018" stroke-width="1.5"/>
  <line x1="35" y1="47" x2="35" y2="44" stroke="#222018" stroke-width="1.5"/>
  <!-- Left eye socket -->
  <ellipse cx="21" cy="24" rx="5.5" ry="5" fill="url(#rg_eye)" filter="url(#fg_sk)" stroke="#1a1810" stroke-width="0.5"/>
  <ellipse cx="21" cy="24" rx="4"   ry="3.5" fill="#060605"/>
  <!-- Right eye socket -->
  <ellipse cx="35" cy="24" rx="5.5" ry="5" fill="url(#rg_eye)" filter="url(#fg_sk)" stroke="#1a1810" stroke-width="0.5"/>
  <ellipse cx="35" cy="24" rx="4"   ry="3.5" fill="#060605"/>
  <!-- Nose cavity -->
  <path d="M25.5,32 Q28,35 30.5,32 Q28,31 25.5,32Z" fill="#111010" stroke="#222018" stroke-width="0.5"/>
  <!-- Eye glow — eerie blue tint -->
  <ellipse cx="21" cy="24" rx="2.5" ry="2.2" fill="#4466aa" opacity="0.35" filter="url(#fg_sk)"/>
  <ellipse cx="35" cy="24" rx="2.5" ry="2.2" fill="#4466aa" opacity="0.35" filter="url(#fg_sk)"/>
  <!-- Cranium bone highlight -->
  <path d="M18,11 Q28,8 38,11 Q32,9 28,9 Q24,9 18,11Z" fill="white" opacity="0.18"/>
  <!-- Top cranium ornate ridge -->
  <path d="M22,7 Q28,4 34,7 Q28,5 22,7Z" fill="#b0aa98" opacity="0.5"/>
  <!-- Ornate frame details -->
  <circle cx="28" cy="4"  r="1.8" fill="none" stroke="#555048" stroke-width="1"/>
  <circle cx="28" cy="52" r="1.8" fill="none" stroke="#555048" stroke-width="1"/>
  <circle cx="4"  cy="28" r="1.5" fill="none" stroke="#444038" stroke-width="0.9"/>
  <circle cx="52" cy="28" r="1.5" fill="none" stroke="#444038" stroke-width="0.9"/>
  <!-- Highlight on cranium -->
  <ellipse cx="22" cy="14" rx="4" ry="2" fill="white" opacity="0.22" transform="rotate(-15,22,14)"/>
  ${filigreeRing(28, 28, 25, '#555048', 16)}
</svg>`;
}

// Map gem type → generator function
export const GEM_SVG = {
  red:    gemRed,
  blue:   gemBlue,
  green:  gemGreen,
  yellow: gemYellow,
  purple: gemPurple,
  brown:  gemBrown,
  skull:  gemSkull,
};

/** Empowered gem overlay — a starburst ring drawn on top of the base gem. */
export function empoweredOverlay() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56" style="position:absolute;top:0;left:0;pointer-events:none">
  <defs>
    <radialGradient id="emp_glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffd700" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
    </radialGradient>
    <filter id="emp_blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <circle cx="28" cy="28" r="24" fill="url(#emp_glow)" filter="url(#emp_blur)"/>
  <!-- 8-point star frame -->
  <polygon points="28,4 31,20 44,8 34,22 52,22 36,28 52,34 34,34 44,48 31,36 28,52 25,36 12,48 22,34 4,34 20,28 4,22 22,22 12,8 25,20"
    fill="none" stroke="#ffd700" stroke-width="0.8" opacity="0.6"/>
</svg>`;
}
