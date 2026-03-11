// ============================================================
//  GEMS OF COMBAT — Core Turn Logic
//  Includes: processMatches (EXTRA TURN BUG FIX), processMana,
//  checkDeaths, checkGameOver, showOverlay,
//  enemyCastSpells, enemyMove, castSpell
//  + Passive effect hooks for class/equipment passives
// ============================================================
import { GEM_SYMBOLS, SKULL_BONUS_PER_GEM, ENEMY_DELAY, BOARD_SIZE } from '../data/constants.js';
import { state } from '../state/gameState.js';
import { addBroadcast }            from './animation.js';
import { animateMatchPop, animateSkullAttack, startHintTimer, clearHint } from './animation.js';
import { resolveGravity, checkDeadlock } from './board.js';
import { findAllMatches, largestMatchGroup, findValidMoves } from './matching.js';
import { animateSwap }             from './animation.js';
import { renderTeams, renderTurnIndicator } from './rendering.js';

// ── Helper: check if troop has a specific passive ────────────
function has(troop, pid) {
  return troop.passives?.some(p => p.id === pid);
}

// ── Mana & Skull Processing (with passive hooks) ─────────────
export function processMana(matched, isPlayer) {
  const counts = {};
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (!gem) continue;
    counts[gem.type] = (counts[gem.type] || 0) + 1;
  }

  const team = isPlayer ? state.playerTeam : state.enemyTeam;
  for (const [color, amount] of Object.entries(counts)) {
    if (color === 'skull') continue;
    for (const troop of team) {
      // colors array supports multi-color weapons & accessory bonus colors
      const troopColors = troop.colors || [troop.color];
      if (troop.life <= 0 || !troopColors.includes(color)) continue;
      let gain = amount;
      // Passive: mage_focus — +1 bonus mana per color match
      if (has(troop, 'mage_focus')) gain += 1;
      // Passive: mana_boost — +2 bonus mana per color match
      if (has(troop, 'mana_boost')) gain += 2;
      troop.mana = Math.min(troop.manaCost, troop.mana + gain);
    }
    // Passive: skull_mana — skull matches also give +1 mana to troops with this passive
    if (color === 'skull') { /* handled below */ }
  }

  // Passive: skull_mana — skull matches charge +2 mana to each troop with this passive
  if (counts['skull']) {
    for (const troop of team) {
      if (troop.life > 0 && has(troop, 'skull_mana')) {
        troop.mana = Math.min(troop.manaCost, troop.mana + 2);
      }
    }
  }

  // Passive: mage_resonance — if any single match group had 5+ gems, refund 3 mana
  // (We use total count of any non-skull color ≥ 5 as a proxy)
  for (const [color, amount] of Object.entries(counts)) {
    if (color === 'skull') continue;
    if (amount >= 5) {
      for (const troop of team) {
        const troopColors = troop.colors || [troop.color];
        if (troop.life > 0 && has(troop, 'mage_resonance') && troopColors.includes(color)) {
          troop.mana = Math.min(troop.manaCost, troop.mana + 3);
        }
      }
    }
  }

  let skullHit = null;
  if (counts['skull']) {
    const n       = counts['skull'];
    const atkTeam = isPlayer ? state.playerTeam : state.enemyTeam;
    const defTeam = isPlayer ? state.enemyTeam  : state.playerTeam;
    const atkIdx  = atkTeam.findIndex(t => t.life > 0);
    const defIdx  = defTeam.findIndex(t => t.life > 0);
    if (atkIdx >= 0 && defIdx >= 0) {
      const attacker = atkTeam[atkIdx];
      const defender = defTeam[defIdx];
      const bonus    = Math.max(0, n - 3) * SKULL_BONUS_PER_GEM;
      let rawDmg     = attacker.attack + bonus;

      // Passive: warrior_fury — skull attacks deal +3 damage
      if (has(attacker, 'warrior_fury')) rawDmg += 3;
      // Passive: paladin_smite — skull attacks deal +4 damage
      if (has(attacker, 'paladin_smite')) rawDmg += 4;
      // Passive: thief_poison — +2 extra damage
      if (has(attacker, 'thief_poison')) rawDmg += 2;
      // Passive: ranger_multishot — extra 3 dmg to random 2nd enemy
      if (has(attacker, 'ranger_multishot')) {
        const others = defTeam.filter((t, i) => i !== defIdx && t.life > 0);
        if (others.length) {
          const target = others[Math.floor(Math.random() * others.length)];
          const absorbed2 = Math.min(target.shield ?? 0, 3);
          target.shield = (target.shield ?? 0) - absorbed2;
          const ld2 = 3 - absorbed2;
          if (ld2 > 0) target.life = Math.max(0, target.life - ld2);
        }
      }
      rawDmg = Math.max(1, rawDmg);

      // Shield absorbs damage first
      const absorbed = Math.min(defender.shield ?? 0, rawDmg);
      defender.shield = (defender.shield ?? 0) - absorbed;
      const lifeDmg  = rawDmg - absorbed;

      // Passive: thief_evasion — 15% chance defender dodges skull attack
      if (has(defender, 'thief_evasion') && Math.random() < 0.15) {
        // Undo the shield absorption on dodge
        defender.shield = (defender.shield ?? 0) + absorbed;
        addBroadcast(`🌀 ${defender.name} DODGED!`, 'bc-system');
        skullHit = null;
      } else {
        if (lifeDmg > 0) defender.life = Math.max(0, defender.life - lifeDmg);

        // Passive: lifesteal — attacker heals 20% of life damage dealt
        if (has(attacker, 'lifesteal') && lifeDmg > 0) {
          const heal = Math.ceil(lifeDmg * 0.2);
          attacker.life = Math.min(attacker.maxLife, attacker.life + heal);
        }

        // Passive: thorns — reflect 3 damage to attacker
        if (has(defender, 'thorns') && defender.life > 0) {
          const reflect = 3;
          attacker.life = Math.max(0, attacker.life - reflect);
        }

        // Passive: cleave_attack or warrior_cleave — hit 2nd enemy for 50% raw dmg
        if (has(attacker, 'cleave_attack') || has(attacker, 'warrior_cleave')) {
          const second = defTeam.findIndex((t, idx) => idx !== defIdx && t.life > 0);
          if (second >= 0) {
            const cleaveDmg = Math.max(1, Math.floor(rawDmg * 0.5));
            const a2 = Math.min(defTeam[second].shield ?? 0, cleaveDmg);
            defTeam[second].shield = (defTeam[second].shield ?? 0) - a2;
            const cld = cleaveDmg - a2;
            if (cld > 0) defTeam[second].life = Math.max(0, defTeam[second].life - cld);
          }
        }

        const displayDmg = rawDmg;
        if (displayDmg >= 20)      addBroadcast(`💀 ${displayDmg} DAMAGE!`, 'bc-damage bc-big');
        else if (displayDmg >= 10) addBroadcast(`💀 ${displayDmg} DMG`,     'bc-damage');
        skullHit = { atkIdx, defIdx, dmg: rawDmg };
      }
    }
  }
  return { skullHit };
}

// ── Death & Game Over ─────────────────────────────────────────
export function checkDeaths() {
  [...state.playerTeam, ...state.enemyTeam].forEach(t => {
    if (t.life <= 0 && !t._deathLogged) {
      t.life = 0; t.mana = 0; t._deathLogged = true;
      addBroadcast(`☠️ ${t.name}\nDefeated!`, 'bc-death');
    }
  });
  // Passive: phoenix — revive once at 25% HP when killed
  [...state.playerTeam, ...state.enemyTeam].forEach(t => {
    if (t.life <= 0 && !t._phoenixUsed && has(t, 'phoenix')) {
      t.life = Math.ceil(t.maxLife * 0.25);
      t._deathLogged = false;
      t._phoenixUsed = true;
      addBroadcast(`🔥 ${t.name} REVIVED!`, 'bc-extra');
    }
  });
}

// ── End-of-player-turn passive effects ────────────────────────
function applyEndOfTurnPassives() {
  for (const troop of state.playerTeam) {
    if (troop.life <= 0) continue;
    // Passive: priest_regen — heal 2 HP at end of each player turn
    if (has(troop, 'priest_regen')) {
      troop.life = Math.min(troop.maxLife, troop.life + 2);
    }
  }
}

// ── Battle-start passive effects (called from engine.js) ──────
export function applyBattleStartPassives() {
  for (const troop of state.playerTeam) {
    if (troop.life <= 0) continue;
    // Passive: priest_blessing — +4 shield to all allies at battle start
    if (has(troop, 'priest_blessing')) {
      for (const ally of state.playerTeam) {
        if (ally.life > 0) ally.shield = (ally.shield ?? 0) + 4;
      }
    }
    // Passive: fortify — +5 shield to all allies at battle start
    if (has(troop, 'fortify')) {
      for (const ally of state.playerTeam) {
        if (ally.life > 0) ally.shield = (ally.shield ?? 0) + 5;
      }
    }
  }
}

export function checkGameOver() {
  const pAlive = state.playerTeam.some(t => t.life > 0);
  const eAlive = state.enemyTeam.some(t  => t.life > 0);
  if (!pAlive) {
    state.gameOver = true;
    addBroadcast('☠️ DEFEAT', 'bc-death bc-big');
    showOverlay('☠️ DEFEAT', 'Your team has been wiped out…');
    renderTeams(); renderTurnIndicator();
    return true;
  }
  if (!eAlive) {
    state.gameOver = true;
    addBroadcast('🏆 VICTORY!', 'bc-extra bc-big');
    showOverlay('🏆 VICTORY!', 'You defeated the enemy team!');
    renderTeams(); renderTurnIndicator();
    return true;
  }
  return false;
}

function showOverlay(title, msg) {
  const won = title.includes('VICTORY');
  window._lastBattleWon = won;
  // Skip the in-battle overlay — the meta-game victory/defeat screen handles it
  if (typeof window.onBattleEnd === 'function') {
    setTimeout(() => window.onBattleEnd(won), 1200);
  } else {
    // Fallback: show the old overlay if no meta handler is wired
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-msg').textContent   = msg;
    document.getElementById('overlay').classList.remove('hidden');
  }
}

// ── Core Match Processing (Extra Turn Bug Fix) ────────────────
//
// FIX: The old code computed `grantExtra` as a local variable per cascade
// level. Because processMatches is recursive for cascades, only the LAST
// cascade's local `grantExtra` reached the turn-switching logic — so a
// 4+ match followed by cascades of 3s would silently lose the extra turn.
//
// Fix: `state.grantExtra` is a latch. It is reset to false BEFORE each
// player/enemy turn starts (see attemptSwap and enemyMove). Inside
// processMatches it is OR-latched: once true it stays true for the entire
// cascade chain. The turn-decision code at the end reads `state.grantExtra`.
//
export function processMatches(matched, isPlayer) {
  state.busy = true;

  // ── Empowered gem explosions: expand matched set ──────────
  // Any empowered gem in the matched set explodes its 3×3 neighbors.
  const explosionCells = new Set();
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (gem?.empowered) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const nk = `${nr},${nc}`;
            if (!matched.has(nk) && state.board[nr][nc]) {
              explosionCells.add(nk);
            }
          }
        }
      }
    }
  }
  if (explosionCells.size) {
    for (const k of explosionCells) matched.add(k);
    addBroadcast('💥 EMPOWERED!', 'bc-extra');
  }

  // LATCH: if this cascade level has a 4+ group, record it.
  // Resets to false at the start of each new turn (not per cascade).
  const maxGroup = largestMatchGroup(state.board, matched);
  if (maxGroup >= 4) state.grantExtra = true;

  // ── Lucky Streak: +3 bonus mana on 4+ matches ──
  if (maxGroup >= 4 && isPlayer) {
    for (const t of state.playerTeam) {
      if (t.life > 0 && has(t, 'lucky_streak')) {
        t.mana = Math.min(t.manaCost, t.mana + 3);
      }
    }
  }

  // ── Demolition Charm: 4+ match triggers random 3×3 explosion ──
  if (maxGroup >= 4 && isPlayer) {
    const team = state.playerTeam;
    const hasDemolition = team.some(t => t.life > 0 && t.passives?.some(p => p.id === 'demolition'));
    if (hasDemolition) {
      // Pick a random non-matched gem to explode
      const candidates = [];
      for (let r = 0; r < BOARD_SIZE; r++)
        for (let c = 0; c < BOARD_SIZE; c++)
          if (state.board[r][c] && !matched.has(`${r},${c}`))
            candidates.push([r, c]);
      if (candidates.length) {
        const [cr, cc] = candidates[Math.floor(Math.random() * candidates.length)];
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr, nc = cc + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE)
              matched.add(`${nr},${nc}`);
          }
        addBroadcast('💣 DEMOLITION!', 'bc-extra');
      }
    }
  }

  animateMatchPop(matched, () => {
    const { skullHit } = processMana(matched, isPlayer);

    const afterAttack = () => {
      // Remove matched gems from DOM + board
      for (const key of matched) {
        const [r, c] = key.split(',').map(Number);
        const gem    = state.board[r][c];
        if (!gem) continue;
        const { gemEls } = _gemDomRef;
        const el = gemEls.get(gem.id);
        if (el) el.remove();
        gemEls.delete(gem.id);
        state.board[r][c] = null;
      }

      checkDeaths();
      if (checkGameOver()) return;

      resolveGravity(() => {
        // Cascade check — recurse with same player flag.
        // state.grantExtra is preserved across recursion (it's on state, not local).
        const next = findAllMatches(state.board);
        if (next.size > 0) {
          processMatches(next, isPlayer);
          return;
        }

        // ── End of full cascade chain — decide turn ──────────────
        // Apply end-of-turn passives (regen, etc.)
        if (isPlayer) applyEndOfTurnPassives();

        if (state.grantExtra) {
          addBroadcast('⭐ EXTRA TURN!', 'bc-extra');
        }

        // Clear busy BEFORE render on extra turn so spell buttons
        // are immediately clickable when mana is full.
        if (isPlayer && state.grantExtra) state.busy = false;

        renderTeams();
        renderTurnIndicator();

        if (state.grantExtra) {
          if (isPlayer) {
            // Player keeps the turn
            state.busy = false;
            if (checkDeadlock()) addBroadcast('🔄 RESHUFFLED', 'bc-system');
            startHintTimer();
          } else {
            // Enemy keeps the turn
            state.busy = false;
            setTimeout(enemyCastSpells, ENEMY_DELAY * 0.5);
          }
          return;
        }

        if (isPlayer) {
          // Switch to enemy
          state.playerTurn = false;
          renderTurnIndicator();
          state.busy = false;
          setTimeout(enemyCastSpells, ENEMY_DELAY * 0.5);
        } else {
          // Switch back to player
          state.playerTurn = true;
          state.busy = false;
          renderTeams();
          renderTurnIndicator();
          if (checkDeadlock()) addBroadcast('🔄 RESHUFFLED', 'bc-system');
          startHintTimer();
        }
      });
    };

    if (skullHit) {
      animateSkullAttack(isPlayer, skullHit.atkIdx, skullHit.defIdx, skullHit.dmg, afterAttack);
    } else {
      afterAttack();
    }
  });
}

// ── Enemy AI ──────────────────────────────────────────────────
export function enemyCastSpells() {
  const front = state.enemyTeam.find(t => t.life > 0);
  if (front && front.mana >= front.manaCost) {
    front.mana = 0;
    const msg = front.cast(front, state.enemyTeam, state.playerTeam);
    if (msg) addBroadcast(`✨ ${front.spell}!`, 'bc-enemy-spell');
    checkDeaths();
    if (checkGameOver()) return;
    renderTeams();
  }
  setTimeout(enemyMove, ENEMY_DELAY);
}

export function enemyMove() {
  const moves = findValidMoves(state.board);
  if (!moves.length) {
    // No valid moves — reshuffle and hand back to player
    const { reshuffleBoard } = _boardRef;
    reshuffleBoard();
    addBroadcast('🔄 RESHUFFLED', 'bc-system');
    state.playerTurn = true;
    state.busy = false;
    renderTeams();
    renderTurnIndicator();
    startHintTimer();
    return;
  }

  // Prefer skull matches
  const skullMoves = moves.filter(m => {
    const b = state.board.map(row => [...row]);
    [b[m.r][m.c], b[m.nr][m.nc]] = [b[m.nr][m.nc], b[m.r][m.c]];
    const matched = findAllMatches(b);
    for (const key of matched) {
      const [r, c] = key.split(',').map(Number);
      if (b[r][c] && b[r][c].type === 'skull') return true;
    }
    return false;
  });

  const pool   = skullMoves.length ? skullMoves : moves;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  state.busy = true;
  // Reset extra-turn latch for enemy turn
  state.grantExtra = false;

  animateSwap(chosen.r, chosen.c, chosen.nr, chosen.nc, () => {
    const matched = findAllMatches(state.board);
    processMatches(matched, false);
  });
}

// ── Spell Casting ─────────────────────────────────────────────
export function castSpell(i) {
  if (!state.playerTurn || state.busy || state.gameOver) return;
  // If already in targeting mode, ignore additional spell clicks
  if (state.targeting) return;
  const troop = state.playerTeam[i];
  if (troop.life <= 0 || troop.mana < troop.manaCost) return;

  // Check if spell needs board/enemy targeting.
  // Spell can set `troop._spellTargeting = { type, resolve }` to request targeting mode.
  troop.mana = 0;
  const result = troop.cast(troop, state.playerTeam, state.enemyTeam);

  // If cast returned a targeting request, enter targeting mode
  if (result && typeof result === 'object' && result.targetType) {
    const isBoardTarget = ['row', 'column', 'gem'].includes(result.targetType);
    state.targeting = {
      type: result.targetType,
      casterIndex: i,
      callback: (...args) => {
        result.resolve(...args);
        // Board-targeting spells call destroyGems which manages its own turn flow.
        // Enemy/ally targeting resolves instantly and needs manual finalization.
        if (!isBoardTarget) {
          checkDeaths();
          if (checkGameOver()) return;
          renderTeams();
          renderTurnIndicator();
        }
      },
    };
    addBroadcast(`🎯 ${troop.spell}!`, 'bc-spell');
    renderTeams();
    renderTurnIndicator();
    return;
  }

  if (result) addBroadcast(`✨ ${troop.spell}!`, 'bc-spell');
  checkDeaths();
  if (checkGameOver()) return;
  renderTeams();
  renderTurnIndicator();
}

// ── Lazy refs to avoid circular imports ───────────────────────
// board.js reshuffleBoard and gemDom.js gemEls are needed inside this module.
// Rather than circular imports, we pull them through a one-time injection.
let _gemDomRef  = { gemEls: new Map() };
let _boardRef   = { reshuffleBoard: () => {} };

export function injectCoreDeps(gemDom, board) {
  _gemDomRef = gemDom;
  _boardRef  = board;
}

// ── Destroy Gems API (for spell effects) ──────────────────────
// Destroys an arbitrary set of gem coordinates, processes mana/skulls,
// runs gravity + cascade, then calls onComplete.
// Used by row/column/explosion spells.
export function destroyGems(coordSet, isPlayer, onComplete) {
  state.busy = true;

  // Check for empowered explosions in the destruction set
  const explosionCells = new Set();
  for (const key of coordSet) {
    const [r, c] = key.split(',').map(Number);
    const gem = state.board[r][c];
    if (gem?.empowered) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const nk = `${nr},${nc}`;
            if (!coordSet.has(nk) && state.board[nr][nc]) {
              explosionCells.add(nk);
            }
          }
        }
      }
    }
  }
  if (explosionCells.size) {
    for (const k of explosionCells) coordSet.add(k);
    addBroadcast('💥 EMPOWERED!', 'bc-extra');
  }

  animateMatchPop(coordSet, () => {
    const { skullHit } = processMana(coordSet, isPlayer);

    const afterAttack = () => {
      for (const key of coordSet) {
        const [r, c] = key.split(',').map(Number);
        const gem    = state.board[r][c];
        if (!gem) continue;
        const { gemEls } = _gemDomRef;
        const el = gemEls.get(gem.id);
        if (el) el.remove();
        gemEls.delete(gem.id);
        state.board[r][c] = null;
      }

      checkDeaths();
      if (checkGameOver()) return;

      resolveGravity(() => {
        const next = findAllMatches(state.board);
        if (next.size > 0) {
          processMatches(next, isPlayer);
          return;
        }
        // No cascades — end spell turn
        if (isPlayer) applyEndOfTurnPassives();
        renderTeams();
        renderTurnIndicator();

        if (isPlayer) {
          state.playerTurn = false;
          renderTurnIndicator();
          state.busy = false;
          setTimeout(enemyCastSpells, ENEMY_DELAY * 0.5);
        } else {
          // Check if enemy earned an extra turn from cascades
          if (state.grantExtra) {
            addBroadcast('⭐ EXTRA TURN!', 'bc-extra');
            state.busy = false;
            setTimeout(enemyCastSpells, ENEMY_DELAY * 0.5);
          } else {
            state.playerTurn = true;
            state.busy = false;
            renderTeams();
            renderTurnIndicator();
            if (checkDeadlock()) addBroadcast('🔄 RESHUFFLED', 'bc-system');
            startHintTimer();
          }
        }
        if (onComplete) onComplete();
      });
    };

    if (skullHit) {
      animateSkullAttack(isPlayer, skullHit.atkIdx, skullHit.defIdx, skullHit.dmg, afterAttack);
    } else {
      afterAttack();
    }
  });
}
