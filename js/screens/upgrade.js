// ============================================================
//  GEMS OF COMBAT — Upgrade / Forge Screen
//  Upgrade equipment (+1 to +10) and dismantle unwanted gear.
// ============================================================
import { save, writeSave }      from '../state/save.js';
import { EQUIP_BY_ID, ALL_EQUIPMENT } from '../data/equipment.js';
import { MATERIALS, dismantleYield, upgradeCost, weaponUpgradeBonus, armorUpgradeBonus }
  from '../data/materials.js';
import { RARITY_COLORS }       from '../data/constants.js';
import { showScreen }           from './navigation.js';

let _activeFilter = 'all';

export function renderUpgrade() {
  document.getElementById('hud-gold').textContent = save.gold;
  renderMaterials();
  renderFilterBar();
  renderInventoryGrid();
  showScreen('upgrade');
}

function renderFilterBar() {
  let bar = document.getElementById('upgrade-filter-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'upgrade-filter-bar';
    const grid = document.getElementById('upgrade-grid');
    grid.parentNode.insertBefore(bar, grid);
  }
  const filters = [
    { key: 'all',       label: 'All' },
    { key: 'weapon',    label: '⚔️ Weapons' },
    { key: 'armor',     label: '🛡 Armor' },
    { key: 'accessory', label: '💍 Accessories' },
  ];
  bar.innerHTML = filters.map(f =>
    `<button class="upg-filter-btn${_activeFilter === f.key ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');
  bar.querySelectorAll('.upg-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeFilter = btn.dataset.filter;
      renderFilterBar();
      renderInventoryGrid();
    });
  });
}

// Build a readable stat summary for an item at a given upgrade level
function equipStatLine(item, level) {
  const parts = [];
  if (item.slot === 'weapon') {
    const base = item.baseAttackBonus || 0;
    const bonus = weaponUpgradeBonus(item.rarity, level);
    parts.push(`⚔️ +${base + bonus.attack} ATK`);
    if (item.manaCost) parts.push(`💎 ${item.manaCost} Mana`);
  } else if (item.slot === 'armor') {
    const baseA = item.baseArmorBonus || 0;
    const baseL = item.baseLifeBonus  || 0;
    const bonus = armorUpgradeBonus(item.rarity, level);
    parts.push(`🛡 +${baseA + bonus.armor} DEF`);
    parts.push(`❤️ +${baseL + bonus.maxLife} HP`);
  } else if (item.slot === 'accessory' && item.stats) {
    if (item.stats.attack)  parts.push(`⚔️ +${item.stats.attack} ATK`);
    if (item.stats.armor)   parts.push(`🛡 +${item.stats.armor} DEF`);
    if (item.stats.maxLife)  parts.push(`❤️ +${item.stats.maxLife} HP`);
  }
  return parts.join('  ');
}

function renderMaterials() {
  const el = document.getElementById('materials-bar');
  if (!el) return;
  el.innerHTML = Object.values(MATERIALS).map(m =>
    `<span class="mat-chip" title="${m.name}">
      ${m.emoji} <strong>${save.materials?.[m.id] ?? 0}</strong>
    </span>`
  ).join('');
}

function renderInventoryGrid() {
  const grid = document.getElementById('upgrade-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Show all items in inventory
  const items = save.inventory
    .map(id => ({ id, item: EQUIP_BY_ID[id] }))
    .filter(x => x.item);

  // Apply slot filter
  const filtered = _activeFilter === 'all'
    ? items
    : items.filter(x => x.item.slot === _activeFilter);

  // Deduplicate — show each unique item once
  const seen = new Set();
  filtered.forEach(({ id, item }) => {
    if (seen.has(id)) return;
    seen.add(id);

    const upgLevel = save.upgrades[id] || 0;
    const upgStr   = upgLevel > 0 ? ` +${upgLevel}` : '';
    const rarC     = RARITY_COLORS[item.rarity] || '#8a9ba8';

    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.style.borderColor = rarC;

    // Check if item is equipped
    const equippedBy = Object.entries(save.charData).find(([cid, cd]) =>
      cd.weapon === id || cd.armor === id || cd.acc1 === id || cd.acc2 === id
    );
    const eqLabel = equippedBy ? `<div class="eq-badge">Equipped</div>` : '';

    // ── Current stats ─────────────────────────────────────────
    const curStats = equipStatLine(item, upgLevel);
    let nextStats = '';
    if (upgLevel < 10) {
      nextStats = equipStatLine(item, upgLevel + 1);
    }

    // Upgrade cost info
    const canUpgrade = upgLevel < 10;
    let costHtml = '';
    if (canUpgrade) {
      const cost = upgradeCost(item, upgLevel);
      costHtml = Object.entries(cost).map(([matId, qty]) => {
        if (matId === '_gold') return `<span>💰${qty}g</span>`;
        const mat = MATERIALS[matId];
        const have = save.materials?.[matId] ?? 0;
        const enough = have >= qty;
        return `<span style="color:${enough ? '#8f8' : '#f88'}">${mat?.emoji || matId} ${qty}</span>`;
      }).join(' ');
    }

    card.innerHTML = `
      ${eqLabel}
      <div class="upg-header">
        <div class="upg-icon">${item.icon || '📦'}</div>
        <div class="upg-header-text">
          <div class="upg-name" style="color:${rarC}">${item.name}${upgStr}</div>
          <div class="upg-type">${item.slot} — ${item.rarity}${item.manaColor ? ` <span class="upg-mana-dot" style="background:var(--${item.manaColor})"></span> ${item.manaColor}` : ''}${item.spell ? ` — ✨ ${item.spell}` : ''}</div>
        </div>
      </div>
      ${item.spellDesc ? `<div class="upg-spell-desc">${item.spellDesc}</div>` : ''}
      <div class="upg-stats-row">
        <div class="upg-stats-current">
          <div class="upg-stats-label">Current</div>
          <div class="upg-stats-vals">${curStats}</div>
        </div>
        ${canUpgrade ? `
          <div class="upg-stats-arrow">→</div>
          <div class="upg-stats-next">
            <div class="upg-stats-label">+${upgLevel + 1}</div>
            <div class="upg-stats-vals">${nextStats}</div>
          </div>
        ` : '<div class="upg-max">MAX +10</div>'}
      </div>
      <div class="upg-actions">
        ${canUpgrade ? `
          <div class="upg-cost">${costHtml}</div>
          <button class="upg-btn" data-id="${id}">⬆ Upgrade</button>
        ` : ''}
        ${!equippedBy ? `<button class="dismantle-btn" data-id="${id}">🔨 Dismantle</button>` : ''}
      </div>
    `;

    // Wire buttons
    grid.appendChild(card);
    const upgBtn = card.querySelector('.upg-btn');
    if (upgBtn) upgBtn.addEventListener('click', () => doUpgrade(id));
    const disBtn = card.querySelector('.dismantle-btn');
    if (disBtn) disBtn.addEventListener('click', () => doDismantle(id));
  });

  if (seen.size === 0) {
    const msg = _activeFilter === 'all' ? 'No items in inventory' : `No ${_activeFilter}s in inventory`;
    grid.innerHTML = `<div style="color:#888;padding:20px;text-align:center">${msg}</div>`;
  }
}

function doUpgrade(itemId) {
  const item = EQUIP_BY_ID[itemId];
  if (!item) return;
  const lvl = save.upgrades[itemId] || 0;
  if (lvl >= 10) return;

  const cost = upgradeCost(item, lvl);
  // Check if player can afford
  for (const [matId, qty] of Object.entries(cost)) {
    if (matId === '_gold') {
      if (save.gold < qty) { alert('Not enough gold!'); return; }
    } else {
      if ((save.materials?.[matId] ?? 0) < qty) { alert('Not enough materials!'); return; }
    }
  }

  // Deduct cost
  for (const [matId, qty] of Object.entries(cost)) {
    if (matId === '_gold') save.gold -= qty;
    else save.materials[matId] -= qty;
  }
  save.upgrades[itemId] = lvl + 1;
  writeSave();
  renderUpgrade();
}

function doDismantle(itemId) {
  const item = EQUIP_BY_ID[itemId];
  if (!item) return;
  const upgLevel = save.upgrades[itemId] || 0;

  // Remove from inventory
  const idx = save.inventory.indexOf(itemId);
  if (idx < 0) return;
  save.inventory.splice(idx, 1);
  delete save.upgrades[itemId];

  // Grant materials
  const yields = dismantleYield(item, upgLevel);
  for (const [matId, qty] of Object.entries(yields)) {
    if (matId === '_gold') save.gold += qty;
    else save.materials[matId] = (save.materials[matId] || 0) + qty;
  }

  writeSave();
  renderUpgrade();
}
