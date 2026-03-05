// ============================================================
//  GEMS OF COMBAT — Equipment Packs & Gacha Screen
// ============================================================
import { save, writeSave }  from '../state/save.js';
import { ALL_EQUIPMENT }    from '../data/equipment.js';
import { PACKS }            from '../data/packs.js';
import { RARITY_COLORS, RARITY_GLOWS } from '../data/constants.js';
import { showScreen }       from './navigation.js';

let gachaPendingPackId = null;

// ── Helper: roll equipment from a pack's odds table ──────────
function rollPack(packId) {
  const pack = PACKS[packId];
  const totalWeight = pack.odds.reduce((s, o) => s + o.weight, 0);
  let rng = Math.random() * totalWeight;
  let rarity = pack.odds[pack.odds.length - 1].rarity;
  for (const o of pack.odds) {
    rng -= o.weight;
    if (rng <= 0) { rarity = o.rarity; break; }
  }
  const pool = ALL_EQUIPMENT.filter(e => e.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Packs store ─────────────────────────────────────────────────
export function renderPacks() {
  document.getElementById('hud-gold').textContent = save.gold;

  const freeCount = (save.freePacks || []).length;
  document.getElementById('free-packs-notice').textContent =
    freeCount > 0
      ? `🎁 You have ${freeCount} free pack${freeCount > 1 ? 's' : ''}!`
      : '';

  const container = document.getElementById('packs-grid');
  container.innerHTML = '';

  Object.values(PACKS).forEach(pack => {
    const canAfford = save.gold >= pack.cost;
    const freeAvail = (save.freePacks || []).includes(pack.id);

    const card = document.createElement('div');
    card.className = 'pack-card' + (!canAfford && !freeAvail ? ' cant-afford' : '');
    card.style.borderColor = pack.color;

    const oddsHtml = pack.odds.map(o =>
      `<span style="color:${RARITY_COLORS[o.rarity]}">${o.rarity} ${o.weight}%</span>`
    ).join(' · ');

    const btn = document.createElement('button');
    btn.className = 'pack-buy-btn';
    btn.disabled  = !canAfford && !freeAvail;
    btn.textContent = freeAvail
      ? '🎁 Open Free'
      : canAfford ? '🛒 Buy & Open' : '🔒 Need more gold';
    btn.addEventListener('click', () => purchasePack(pack.id));

    card.innerHTML = `
      <div class="pack-emoji">${pack.emoji}</div>
      <div class="pack-name">${pack.name}</div>
      <div class="pack-desc">${pack.desc}</div>
      <div class="pack-odds">${oddsHtml}</div>
      <div class="pack-cost">${freeAvail ? '<span class="free-badge">FREE!</span>' : `💰 ${pack.cost}g`}</div>
    `;
    card.appendChild(btn);
    container.appendChild(card);
  });

  showScreen('packs');
}

// ── Purchase flow ─────────────────────────────────────────────
export function purchasePack(packId) {
  const pack    = PACKS[packId];
  const freeIdx = (save.freePacks || []).indexOf(packId);
  const hasFree = freeIdx >= 0;

  if (!hasFree && save.gold < pack.cost) return;

  if (hasFree) {
    save.freePacks.splice(freeIdx, 1);
  } else {
    save.gold -= pack.cost;
  }
  writeSave();
  openPackAnimation(packId);
}

export function openPackAnimation(packId) {
  gachaPendingPackId = packId;
  const pack = PACKS[packId];

  const cardWrap = document.getElementById('gacha-card-wrap');
  cardWrap.classList.remove('flipped');
  document.getElementById('gacha-result-info').classList.add('hidden');
  const collectBtn = document.getElementById('gacha-collect-btn');
  collectBtn.classList.add('hidden');
  collectBtn.disabled = true;
  document.getElementById('gacha-pack-name').textContent = pack.name;

  document.getElementById('gacha-card-back').style.background =
    `radial-gradient(circle at 40% 40%, ${pack.color}aa, #1a0a3e)`;

  const equip = rollPack(packId);
  const isNew = !save.inventory.includes(equip.id);

  showScreen('gacha');
  setTimeout(() => revealGachaCard(equip, isNew), 1200);
}

export function revealGachaCard(equip, isNew) {
  const cardWrap = document.getElementById('gacha-card-wrap');
  const infoEl   = document.getElementById('gacha-result-info');

  const front = document.getElementById('gacha-card-front');
  front.style.borderColor = RARITY_COLORS[equip.rarity];
  front.style.boxShadow   = RARITY_GLOWS[equip.rarity];
  front.style.background  = `radial-gradient(circle at 35% 35%, #231545, #0d0821)`;

  document.getElementById('gacha-hero-emoji').textContent  = equip.icon || '📦';
  document.getElementById('gacha-hero-name').textContent   = equip.name;
  document.getElementById('gacha-hero-rarity').textContent = equip.rarity.toUpperCase();
  document.getElementById('gacha-hero-rarity').style.color = RARITY_COLORS[equip.rarity];
  document.getElementById('gacha-hero-spell').textContent  =
    equip.spell ? `✨ ${equip.spell}` : `${equip.slot}`;
  document.getElementById('gacha-hero-desc').textContent   =
    equip.spellDesc || `${equip.slot} equipment`;
  document.getElementById('gacha-hero-stats').textContent  = getEquipStatsText(equip);

  const badge = document.getElementById('gacha-new-badge');
  // Always add item to inventory (no auto-dismantle)
  save.inventory.push(equip.id);
  if (isNew) {
    badge.textContent = '✨ NEW ITEM!';
    badge.className   = 'gacha-badge new';
  } else {
    badge.textContent = '📦 Duplicate!';
    badge.className   = 'gacha-badge dupe';
  }
  writeSave();

  cardWrap.classList.add('flipped');
  setTimeout(() => {
    infoEl.classList.remove('hidden');
    const collectBtn = document.getElementById('gacha-collect-btn');
    collectBtn.classList.remove('hidden');
    collectBtn.disabled = false;
  }, 600);
}

function getEquipStatsText(equip) {
  if (equip.slot === 'weapon') {
    return `⚔️ +${equip.baseAttackBonus} ATK  💎 ${equip.manaCost} Mana`;
  }
  if (equip.slot === 'armor') {
    return `🛡 +${equip.baseArmorBonus} DEF  ❤️ +${equip.baseLifeBonus} HP`;
  }
  if (equip.slot === 'accessory') {
    const parts = [];
    if (equip.stats.attack)  parts.push(`⚔️+${equip.stats.attack}`);
    if (equip.stats.armor)   parts.push(`🛡+${equip.stats.armor}`);
    if (equip.stats.maxLife) parts.push(`❤️+${equip.stats.maxLife}`);
    if (equip.passive)       parts.push(equip.passive.name);
    return parts.join('  ') || 'Accessory';
  }
  return '';
}

export function collectGachaResult() {
  renderPacks();
}
