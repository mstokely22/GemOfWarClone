// ============================================================
//  GEMS OF COMBAT — Battle Team Panel Rendering
// ============================================================
import { state }              from '../state/gameState.js';
import { cardFrame, heroPortrait } from '../art/cards.js';
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

    const hpPct   = Math.max(0, (troop.life / troop.maxLife) * 100).toFixed(1);
    const manaPct = Math.max(0, (troop.mana  / troop.manaCost) * 100).toFixed(1);

    // SVG card frame overlay (rarity-based)
    const rarity = troop.rarity || 'common';

    // SVG portrait
    const portrait = heroPortrait(troop);

    card.innerHTML = `
      ${cardFrame(rarity)}
      <div class="card-inner">
        <div class="card-portrait-row">
          <div class="card-portrait">${portrait}</div>
          <div class="card-title-block">
            <div class="troop-name">${troop.name}</div>
            <div class="troop-rarity" style="color:var(--${troop.color})">${rarity.toUpperCase()}</div>
          </div>
        </div>
        <div class="troop-stats">
          <span title="Attack">${iconSword()} ${troop.attack}</span>
          <span title="Armor">${iconShield()} ${troop.armor}</span>
          <span title="Life">${iconHeart()} ${troop.life}/${troop.maxLife}</span>
        </div>
        <div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
        <div class="mana-label">${troop.spell} (${troop.mana}/${troop.manaCost})</div>
        <div class="mana-bar-bg"><div class="mana-bar-fill ${troop.color}" style="width:${manaPct}%"></div></div>
        ${canCast ? '<div class="cast-hint">&#9654; CAST</div>' : ''}
      </div>
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
