// ============================================================
//  GEMS OF COMBAT — Battle Team Panel Rendering
// ============================================================
import { state }              from '../state/gameState.js';
import { heroPortrait }       from '../art/cards.js';
import { iconSword, iconShield, iconHeart } from '../art/icons.js';

// ── Rendering callbacks ───────────────────────────────────────
// castSpell is defined in core.js — injected here to avoid circular deps
let _castSpellFn = () => {};
export function injectCastSpell(fn) { _castSpellFn = fn; }

// ── Main Render ───────────────────────────────────────────────
export function renderTeams() {
  renderPanel('player-troops', state.playerTeam, true);
  renderPanel('enemy-troops',  state.enemyTeam,  false);
}

export function renderPanel(containerId, team, isPlayer) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  team.forEach((troop, i) => {
    const canCast = isPlayer && state.playerTurn && !state.busy && !state.gameOver
                  && troop.life > 0 && troop.mana >= troop.manaCost;

    const card = document.createElement('div');
    card.className = 'troop-card' +
      (troop.life <= 0 ? ' dead' : '') +
      (canCast         ? ' can-cast' : '');

    const hpPct     = Math.max(0, (troop.life / troop.maxLife) * 100).toFixed(1);
    const manaPct   = Math.max(0, (troop.mana  / troop.manaCost) * 100).toFixed(1);
    const hasShield = (troop.armor ?? 0) > 0;
    const shieldPct = hasShield
      ? Math.max(0, ((troop.shield ?? 0) / troop.armor) * 100).toFixed(1)
      : '0';

    // Portrait with unique gradient ID to avoid SVG id collisions across cards
    const uid = `${isPlayer ? 'p' : 'e'}${i}`;
    const portrait = heroPortrait(troop, uid);

    // Multi-color support
    const colors = troop.colors || [troop.color];
    const colorDots = colors.map(c => `<div class="mana-color-dot" style="background:var(--${c})"></div>`).join('');
    // Card background gradient from mana colors
    const bgColors = colors.map(c => `var(--${c})`);
    const bgGrad = colors.length === 1
      ? `radial-gradient(circle at 30% 30%, ${bgColors[0]}, transparent 70%)`
      : `linear-gradient(135deg, ${bgColors.map((c, i) => `${c} ${Math.round(i / (bgColors.length - 1) * 100)}%`).join(', ')})`;
    // Mana bar bg class: use primary color
    const primaryColor = colors[0];

    card.innerHTML = `
      <div class="card-portrait-bg" style="background:${bgGrad};opacity:0.18">${portrait}</div>
      <div class="card-overlay">
        <div class="card-name">${troop.name}</div>
        <div class="card-stat-chips">
          <span class="stat-chip">${iconSword()} ${troop.attack}</span>
          <span class="stat-chip">${iconShield()} ${troop.shield ?? 0}/${troop.armor ?? 0}</span>
          <span class="stat-chip">${iconHeart()} ${troop.life}/${troop.maxLife}</span>
        </div>
        <div class="card-bars">
          <div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
          ${hasShield ? `<div class="shield-bar-bg"><div class="shield-bar-fill" style="width:${shieldPct}%"></div></div>` : ''}
        </div>
        <div class="card-mana-section">
          <div class="mana-row">
            <div class="mana-color-dots">${colorDots}</div>
            <div class="mana-bar-wrap">
              <div class="mana-bar-bg ${primaryColor}"><div class="mana-bar-fill ${primaryColor}" style="width:${manaPct}%"></div></div>
            </div>
          </div>
          <div class="card-spell-label">${troop.spell} (${troop.mana}/${troop.manaCost})</div>
        </div>
      </div>
      ${canCast ? '<div class="cast-ready-badge">⚡ READY</div>' : ''}
    `;

    if (canCast) card.addEventListener('click', () => _castSpellFn(i));
    el.appendChild(card);
  });
}

export function renderTurnIndicator() {
  const pp = document.getElementById('player-panel');
  const ep = document.getElementById('enemy-panel');
  if (!pp || !ep) return;
  const playerActive = state.playerTurn && !state.gameOver;
  const enemyActive  = !state.playerTurn && !state.gameOver;
  pp.classList.toggle('turn-active',        playerActive);
  pp.classList.toggle('turn-active-player', playerActive);
  ep.classList.toggle('turn-active',        enemyActive);
  ep.classList.toggle('turn-active-enemy',  enemyActive);
}
