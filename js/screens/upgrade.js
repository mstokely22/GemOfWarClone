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

export function renderUpgrade() {
  document.getElementById('hud-gold').textContent = save.gold;
  renderMaterials();
  renderInventoryGrid();
  showScreen('upgrade');
}

function renderMaterials() {
  const el = document.getElementById('materials-bar');
  if (!el) return;
  el.innerHTML = MATERIALS.map(m =>
    `<span class="mat-chip" title="${m.name}">
      ${m.icon} <strong>${save.materials?.[m.id] ?? 0}</strong>
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

  // Deduplicate — show each unique item once
  const seen = new Set();
  items.forEach(({ id, item }) => {
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

    // Upgrade cost info
    const canUpgrade = upgLevel < 10;
    let costHtml = '';
    if (canUpgrade) {
      const cost = upgradeCost(item, upgLevel);
      costHtml = Object.entries(cost).map(([matId, qty]) => {
        if (matId === '_gold') return `<span>💰${qty}g</span>`;
        const mat = MATERIALS.find(m => m.id === matId);
        const have = save.materials?.[matId] ?? 0;
        const enough = have >= qty;
        return `<span style="color:${enough ? '#8f8' : '#f88'}">${mat?.icon || matId}${qty}</span>`;
      }).join(' ');
    }

    card.innerHTML = `
      ${eqLabel}
      <div class="upg-icon">${item.icon || '📦'}</div>
      <div class="upg-name" style="color:${rarC}">${item.name}${upgStr}</div>
      <div class="upg-type">${item.slot} — ${item.rarity}</div>
      ${canUpgrade ? `
        <div class="upg-cost">${costHtml}</div>
        <button class="upg-btn" data-id="${id}">⬆ Upgrade to +${upgLevel + 1}</button>
      ` : '<div class="upg-max">MAX +10</div>'}
      ${!equippedBy ? `<button class="dismantle-btn" data-id="${id}">🔨 Dismantle</button>` : ''}
    `;

    // Wire buttons
    grid.appendChild(card);
    const upgBtn = card.querySelector('.upg-btn');
    if (upgBtn) upgBtn.addEventListener('click', () => doUpgrade(id));
    const disBtn = card.querySelector('.dismantle-btn');
    if (disBtn) disBtn.addEventListener('click', () => doDismantle(id));
  });

  if (seen.size === 0) {
    grid.innerHTML = '<div style="color:#888;padding:20px;text-align:center">No items in inventory</div>';
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
