// ============================================================
//  GEMS OF COMBAT — SVG Treasure Tile Art
//  Fantasy ornate designs for the 6 treasure tiers.
//  Each function returns an SVG string (viewBox 0 0 56 56).
// ============================================================

// Thin filigree ring of tiny circles
function filigree(cx, cy, r, color, n = 10) {
  let pts = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    pts += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="none" stroke="${color}" stroke-width="0.7" opacity="0.6"/>`;
  }
  return pts;
}

// ── Copper Coin ──────────────────────────────────────────────
export function tilCopper() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="tc1" cx="38%" cy="30%" r="62%">
      <stop offset="0%"  stop-color="#e8b07a"/>
      <stop offset="40%" stop-color="#b87333"/>
      <stop offset="80%" stop-color="#7a4418"/>
      <stop offset="100%" stop-color="#3d1e00"/>
    </radialGradient>
    <radialGradient id="tc2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#d4945a" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#7a4418" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer ring -->
  <circle cx="28" cy="28" r="25" fill="#2e1500" stroke="#8b5e3c" stroke-width="1.5"/>
  <!-- Coin body -->
  <circle cx="28" cy="28" r="22" fill="url(#tc1)"/>
  <!-- Inner glow -->
  <circle cx="28" cy="28" r="14" fill="url(#tc2)"/>
  <!-- Coin rim -->
  <circle cx="28" cy="28" r="18" fill="none" stroke="#a06830" stroke-width="1" opacity="0.6"/>
  <!-- Stamped star design -->
  <polygon points="28,14 30.5,22 38,22 32,27 34,35 28,30 22,35 24,27 18,22 25.5,22"
           fill="#c9884a" opacity="0.4" stroke="#8b5e3c" stroke-width="0.5"/>
  <!-- Roman numeral I -->
  <text x="28" y="32" text-anchor="middle" font-size="8" font-weight="900" font-family="serif"
        fill="#4a2800" opacity="0.4">I</text>
  <!-- Top-left sparkle -->
  <ellipse cx="21" cy="19" rx="4.5" ry="2" fill="white" opacity="0.3" transform="rotate(-25,21,19)"/>
  <circle cx="19" cy="17" r="1.3" fill="white" opacity="0.5"/>
  <!-- Rim notches -->
  <circle cx="28" cy="5" r="1.5" fill="none" stroke="#a06830" stroke-width="0.8"/>
  <circle cx="28" cy="51" r="1.5" fill="none" stroke="#a06830" stroke-width="0.8"/>
  <circle cx="5" cy="28" r="1.5" fill="none" stroke="#a06830" stroke-width="0.8"/>
  <circle cx="51" cy="28" r="1.5" fill="none" stroke="#a06830" stroke-width="0.8"/>
  ${filigree(28, 28, 22, '#b87333', 12)}
</svg>`;
}

// ── Silver Coin ──────────────────────────────────────────────
export function tilSilver() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="ts1" cx="38%" cy="28%" r="65%">
      <stop offset="0%"  stop-color="#f0f0f0"/>
      <stop offset="35%" stop-color="#c0c0c0"/>
      <stop offset="75%" stop-color="#6a6a6a"/>
      <stop offset="100%" stop-color="#2a2a2a"/>
    </radialGradient>
    <radialGradient id="ts2" cx="50%" cy="45%" r="50%">
      <stop offset="0%"  stop-color="#e8e8e8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#808080" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Outer ring -->
  <circle cx="28" cy="28" r="25" fill="#1a1a1a" stroke="#888" stroke-width="1.5"/>
  <!-- Coin body -->
  <circle cx="28" cy="28" r="22" fill="url(#ts1)"/>
  <!-- Inner glow -->
  <circle cx="28" cy="28" r="14" fill="url(#ts2)"/>
  <!-- Coin rim -->
  <circle cx="28" cy="28" r="18" fill="none" stroke="#aaa" stroke-width="1" opacity="0.5"/>
  <!-- Stamped shield emblem -->
  <path d="M28,16 L35,20 L35,30 Q35,36 28,39 Q21,36 21,30 L21,20 Z"
        fill="#a0a0a0" opacity="0.35" stroke="#777" stroke-width="0.6"/>
  <!-- Shield cross -->
  <line x1="28" y1="18" x2="28" y2="37" stroke="#666" stroke-width="0.7" opacity="0.4"/>
  <line x1="22" y1="27" x2="34" y2="27" stroke="#666" stroke-width="0.7" opacity="0.4"/>
  <!-- Roman numeral II -->
  <text x="28" y="32" text-anchor="middle" font-size="7" font-weight="900" font-family="serif"
        fill="#333" opacity="0.35">II</text>
  <!-- Top sparkle -->
  <ellipse cx="22" cy="18" rx="5" ry="2.2" fill="white" opacity="0.4" transform="rotate(-22,22,18)"/>
  <circle cx="20" cy="16" r="1.5" fill="white" opacity="0.6"/>
  <!-- Rim accents -->
  <circle cx="28" cy="5" r="1.5" fill="none" stroke="#aaa" stroke-width="0.9"/>
  <circle cx="28" cy="51" r="1.5" fill="none" stroke="#aaa" stroke-width="0.9"/>
  <circle cx="5" cy="28" r="1.5" fill="none" stroke="#999" stroke-width="0.8"/>
  <circle cx="51" cy="28" r="1.5" fill="none" stroke="#999" stroke-width="0.8"/>
  ${filigree(28, 28, 22, '#c0c0c0', 12)}
</svg>`;
}

// ── Gold Coin ────────────────────────────────────────────────
export function tilGold() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="tg1" cx="36%" cy="28%" r="66%">
      <stop offset="0%"  stop-color="#fff4b0"/>
      <stop offset="30%" stop-color="#ffd700"/>
      <stop offset="65%" stop-color="#b8860b"/>
      <stop offset="100%" stop-color="#5a3d00"/>
    </radialGradient>
    <radialGradient id="tg2" cx="50%" cy="42%" r="48%">
      <stop offset="0%"  stop-color="#ffe566" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#b8860b" stop-opacity="0"/>
    </radialGradient>
    <filter id="fg_g" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Outer ring -->
  <circle cx="28" cy="28" r="25" fill="#2a1d00" stroke="#c9a020" stroke-width="1.5"/>
  <!-- Coin body -->
  <circle cx="28" cy="28" r="22" fill="url(#tg1)"/>
  <!-- Inner glow -->
  <circle cx="28" cy="28" r="14" fill="url(#tg2)" filter="url(#fg_g)"/>
  <!-- Outer rim -->
  <circle cx="28" cy="28" r="19" fill="none" stroke="#daa520" stroke-width="1.2" opacity="0.5"/>
  <!-- Crown emblem -->
  <path d="M20,29 L22,22 L25,26 L28,20 L31,26 L34,22 L36,29 Z"
        fill="#ffd700" opacity="0.45" stroke="#b8860b" stroke-width="0.7"/>
  <!-- Crown base -->
  <rect x="20" y="29" width="16" height="3" rx="1" fill="#daa520" opacity="0.35"/>
  <!-- Roman numeral III -->
  <text x="28" y="38" text-anchor="middle" font-size="6" font-weight="900" font-family="serif"
        fill="#5a3d00" opacity="0.4">III</text>
  <!-- Top sparkle -->
  <ellipse cx="21" cy="17" rx="5.5" ry="2.4" fill="white" opacity="0.38" transform="rotate(-20,21,17)"/>
  <circle cx="19" cy="15" r="1.6" fill="white" opacity="0.6"/>
  <!-- Secondary sparkle -->
  <circle cx="36" cy="20" r="1" fill="white" opacity="0.4"/>
  <!-- Cardinal accents -->
  <circle cx="28" cy="4.5" r="1.8" fill="none" stroke="#daa520" stroke-width="1"/>
  <circle cx="28" cy="51.5" r="1.8" fill="none" stroke="#daa520" stroke-width="1"/>
  <circle cx="4.5" cy="28" r="1.6" fill="none" stroke="#c9a020" stroke-width="0.9"/>
  <circle cx="51.5" cy="28" r="1.6" fill="none" stroke="#c9a020" stroke-width="0.9"/>
  ${filigree(28, 28, 23, '#ffd700', 14)}
</svg>`;
}

// ── Money Bag ────────────────────────────────────────────────
export function tilBag() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="tb1" cx="40%" cy="35%" r="60%">
      <stop offset="0%"  stop-color="#6be89d"/>
      <stop offset="40%" stop-color="#2ecc71"/>
      <stop offset="80%" stop-color="#1a6e3a"/>
      <stop offset="100%" stop-color="#0a3018"/>
    </radialGradient>
    <radialGradient id="tb2" cx="42%" cy="40%" r="45%">
      <stop offset="0%"  stop-color="#58d68d" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#1a5e35" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tb_str" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#8b6914"/>
      <stop offset="50%" stop-color="#daa520"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
  </defs>
  <!-- Ornate frame -->
  <rect x="3" y="3" width="50" height="50" rx="12" fill="#051a0a" stroke="#27ae60" stroke-width="1.2" opacity="0.85"/>
  <!-- Bag body -->
  <path d="M16,22 Q12,30 14,42 Q16,48 28,48 Q40,48 42,42 Q44,30 40,22 Z"
        fill="url(#tb1)" stroke="#1a5e35" stroke-width="0.8"/>
  <!-- Inner glow -->
  <ellipse cx="28" cy="36" rx="11" ry="10" fill="url(#tb2)"/>
  <!-- Bag neck / drawstring area -->
  <path d="M18,22 Q22,18 28,18 Q34,18 38,22" fill="#1a5e35" stroke="#27ae60" stroke-width="0.6"/>
  <!-- Drawstring -->
  <path d="M20,20 Q24,15 28,17 Q32,15 36,20" fill="none" stroke="url(#tb_str)" stroke-width="1.5"/>
  <!-- Drawstring knot -->
  <circle cx="28" cy="16" r="2.5" fill="#daa520" stroke="#8b6914" stroke-width="0.7"/>
  <!-- Bag top poof -->
  <ellipse cx="24" cy="12" rx="4" ry="3.5" fill="#2ecc71" opacity="0.5"/>
  <ellipse cx="32" cy="12" rx="4" ry="3.5" fill="#2ecc71" opacity="0.4"/>
  <ellipse cx="28" cy="10" rx="3" ry="3" fill="#27ae60" opacity="0.3"/>
  <!-- Dollar/coin symbol -->
  <text x="28" y="40" text-anchor="middle" font-size="14" font-weight="900" font-family="serif"
        fill="#ffd700" opacity="0.45">$</text>
  <!-- Fabric fold lines -->
  <path d="M22,28 Q26,32 24,40" fill="none" stroke="#145a2c" stroke-width="0.6" opacity="0.5"/>
  <path d="M34,28 Q30,32 32,40" fill="none" stroke="#145a2c" stroke-width="0.6" opacity="0.5"/>
  <!-- Top-left sparkle -->
  <ellipse cx="20" cy="28" rx="3.5" ry="1.8" fill="white" opacity="0.22" transform="rotate(-30,20,28)"/>
  <circle cx="19" cy="26" r="1.2" fill="white" opacity="0.4"/>
  <!-- Coin peeking out top -->
  <circle cx="22" cy="14" r="3" fill="#daa520" opacity="0.35" stroke="#8b6914" stroke-width="0.5"/>
  <!-- Corner accents -->
  ${filigree(28, 28, 23, '#27ae60', 12)}
</svg>`;
}

// ── Treasure Chest ───────────────────────────────────────────
export function tilChest() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <linearGradient id="txl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#6db3e0"/>
      <stop offset="50%" stop-color="#2980b9"/>
      <stop offset="100%" stop-color="#1a4f7a"/>
    </linearGradient>
    <linearGradient id="txl2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#1f6fa5"/>
      <stop offset="100%" stop-color="#0e3252"/>
    </linearGradient>
    <radialGradient id="txg" cx="50%" cy="30%" r="50%">
      <stop offset="0%"  stop-color="#88d4ff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#1a5276" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tx_band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#8b6914"/>
      <stop offset="30%" stop-color="#ffd700"/>
      <stop offset="70%" stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
    <filter id="fg_tx" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Ornate frame -->
  <rect x="3" y="3" width="50" height="50" rx="10" fill="#061428" stroke="#3498db" stroke-width="1.2" opacity="0.85"/>
  <!-- Chest lid (curved top) -->
  <path d="M10,24 L10,18 Q10,10 28,10 Q46,10 46,18 L46,24 Z"
        fill="url(#txl)" stroke="#1a5276" stroke-width="0.8"/>
  <!-- Lid arch highlight -->
  <path d="M14,18 Q14,13 28,13 Q42,13 42,18" fill="none" stroke="#88d4ff" stroke-width="0.5" opacity="0.35"/>
  <!-- Chest body -->
  <rect x="10" y="24" width="36" height="20" rx="2" fill="url(#txl2)" stroke="#1a5276" stroke-width="0.8"/>
  <!-- Inner glow on lid -->
  <ellipse cx="28" cy="18" rx="14" ry="6" fill="url(#txg)" filter="url(#fg_tx)"/>
  <!-- Gold horizontal bands -->
  <rect x="9" y="23" width="38" height="3" rx="1" fill="url(#tx_band)" opacity="0.7"/>
  <rect x="11" y="40" width="34" height="1.5" rx="0.5" fill="#daa520" opacity="0.3"/>
  <!-- Center clasp / lock -->
  <rect x="24" y="21" width="8" height="8" rx="2" fill="#daa520" stroke="#8b6914" stroke-width="0.8"/>
  <circle cx="28" cy="26" r="2" fill="#0e3252" stroke="#8b6914" stroke-width="0.6"/>
  <!-- Keyhole -->
  <path d="M27.2,26 L28.8,26 L29,28.5 L27,28.5 Z" fill="#0a1f40"/>
  <!-- Lid rivet details -->
  <circle cx="14" cy="15" r="1.2" fill="#1a5276" stroke="#daa520" stroke-width="0.5"/>
  <circle cx="42" cy="15" r="1.2" fill="#1a5276" stroke="#daa520" stroke-width="0.5"/>
  <!-- Body rivet details -->
  <circle cx="14" cy="34" r="1" fill="#0e3252" stroke="#daa520" stroke-width="0.5"/>
  <circle cx="42" cy="34" r="1" fill="#0e3252" stroke="#daa520" stroke-width="0.5"/>
  <!-- Sparkle on lid -->
  <ellipse cx="20" cy="15" rx="4" ry="1.8" fill="white" opacity="0.25" transform="rotate(-15,20,15)"/>
  <circle cx="18" cy="13" r="1.3" fill="white" opacity="0.45"/>
  <!-- Vertical wood/metal bands -->
  <line x1="19" y1="24" x2="19" y2="44" stroke="#daa520" stroke-width="0.6" opacity="0.25"/>
  <line x1="37" y1="24" x2="37" y2="44" stroke="#daa520" stroke-width="0.6" opacity="0.25"/>
  <!-- Bottom shadow -->
  <ellipse cx="28" cy="46" rx="16" ry="2" fill="#000" opacity="0.2"/>
  ${filigree(28, 28, 24, '#3498db', 14)}
</svg>`;
}

// ── Vault (Crown) ────────────────────────────────────────────
export function tilVault() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">
  <defs>
    <radialGradient id="tv1" cx="38%" cy="30%" r="65%">
      <stop offset="0%"  stop-color="#dbb0ee"/>
      <stop offset="35%" stop-color="#9b59b6"/>
      <stop offset="70%" stop-color="#6c3483"/>
      <stop offset="100%" stop-color="#2c0a3e"/>
    </radialGradient>
    <radialGradient id="tv2" cx="50%" cy="40%" r="45%">
      <stop offset="0%"  stop-color="#c39bd3" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#6c3483" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tv_band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#8b6914"/>
      <stop offset="30%" stop-color="#ffd700"/>
      <stop offset="70%" stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
    <filter id="fg_tv" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
      <feBlend in="SourceGraphic" in2="b" mode="screen"/>
    </filter>
  </defs>
  <!-- Ornate octagonal frame -->
  <polygon points="28,2 46,10 53,28 46,46 28,54 10,46 3,28 10,10"
           fill="#14032a" stroke="#9b59b6" stroke-width="1.4" opacity="0.9"/>
  <!-- Crown body inner -->
  <polygon points="28,5 44,12 50,28 44,44 28,51 12,44 6,28 12,12"
           fill="url(#tv1)"/>
  <!-- Inner glow -->
  <ellipse cx="28" cy="28" rx="15" ry="15" fill="url(#tv2)" filter="url(#fg_tv)"/>
  <!-- Crown shape -->
  <path d="M14,32 L17,18 L21,25 L25,15 L28,22 L31,15 L35,25 L39,18 L42,32 Z"
        fill="#daa520" stroke="#8b6914" stroke-width="0.8" opacity="0.8"/>
  <!-- Crown base band -->
  <rect x="14" y="32" width="28" height="5" rx="1.5" fill="url(#tv_band)" opacity="0.85"/>
  <!-- Crown base gems -->
  <circle cx="21" cy="34.5" r="1.8" fill="#e74c3c" stroke="#8b1a10" stroke-width="0.5"/>
  <circle cx="28" cy="34.5" r="2" fill="#3498db" stroke="#1a5276" stroke-width="0.5"/>
  <circle cx="35" cy="34.5" r="1.8" fill="#2ecc71" stroke="#1a5e35" stroke-width="0.5"/>
  <!-- Crown tip jewels -->
  <circle cx="25" cy="16" r="1.5" fill="#e74c3c" opacity="0.7"/>
  <circle cx="28" cy="22" r="1.2" fill="#ffd700" opacity="0.8"/>
  <circle cx="31" cy="16" r="1.5" fill="#3498db" opacity="0.7"/>
  <!-- Facet lines -->
  <line x1="28" y1="5" x2="28" y2="51" stroke="#c39bd3" stroke-width="0.4" opacity="0.2"/>
  <line x1="6" y1="28" x2="50" y2="28" stroke="#c39bd3" stroke-width="0.4" opacity="0.2"/>
  <!-- Top sparkle -->
  <ellipse cx="21" cy="13" rx="4" ry="1.8" fill="white" opacity="0.3" transform="rotate(-20,21,13)"/>
  <circle cx="19" cy="11" r="1.5" fill="white" opacity="0.5"/>
  <!-- Secondary sparkle -->
  <circle cx="37" cy="16" r="1" fill="white" opacity="0.35"/>
  <!-- Crown tip accents -->
  <path d="M24.5,15 Q25,12 25.5,15" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.4"/>
  <path d="M30.5,15 Q31,12 31.5,15" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.4"/>
  <!-- Lower decorative line -->
  <path d="M16,42 Q22,44 28,42 Q34,44 40,42" fill="none" stroke="#daa520" stroke-width="0.6" opacity="0.35"/>
  <!-- Cardinal point accents -->
  <circle cx="28" cy="4" r="2" fill="none" stroke="#c39bd3" stroke-width="1.2"/>
  <circle cx="28" cy="52" r="2" fill="none" stroke="#c39bd3" stroke-width="1.2"/>
  <circle cx="5" cy="28" r="1.8" fill="none" stroke="#9b59b6" stroke-width="1"/>
  <circle cx="51" cy="28" r="1.8" fill="none" stroke="#9b59b6" stroke-width="1"/>
  ${filigree(28, 28, 24, '#9b59b6', 16)}
</svg>`;
}

// Map tier id → SVG generator function
export const TILE_SVG = {
  copper: tilCopper,
  silver: tilSilver,
  gold:   tilGold,
  bag:    tilBag,
  chest:  tilChest,
  vault:  tilVault,
};
