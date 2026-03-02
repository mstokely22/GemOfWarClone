// ============================================================
//  GEMS OF COMBAT — Responsive Battle Scaling
// ============================================================
const DESIGN_W = 980;
const DESIGN_H = 570;

export function scaleBattle() {
  const scale = Math.min(
    window.innerWidth  / DESIGN_W,
    window.innerHeight / DESIGN_H,
    1
  );
  document.documentElement.style.setProperty('--battle-scale', scale.toFixed(4));
}
