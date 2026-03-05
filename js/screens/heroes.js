// ============================================================
//  GEMS OF COMBAT — Roster / Character Management Screen
//  v5: Stars replace levels. Hero Draw mechanic.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { CHARACTERS, CHAR_BY_ID } from '../data/characters.js';
import { CLASS_BY_ID }                    from '../data/classes.js';
import { EQUIP_BY_ID, WEAPONS, ARMORS, ACCESSORIES } from '../data/equipment.js';
import { weaponUpgradeBonus, armorUpgradeBonus, upgradeCost, MATERIALS }
  from '../data/materials.js';
import { statBonusAtStars, getActiveMilestones, isSlotUnlocked, MAX_STARS }
  from '../data/leveling.js';
import { RARITY_COLORS, RARITY_GLOWS }   from '../data/constants.js';
import { showScreen }                     from './navigation.js';


let selectedCharId = null;
let selectedPartySlot = null;   // 0-3 when user clicks an empty/filled slot to reassign
let detailCharId = null;
let detailTab = 'overview';

function starsHtml(stars, max = 5) {
  return '⭐'.repeat(stars) + '☆'.repeat(max - stars);
}

export function renderHeroes() {
  document.getElementById('hud-gold').textContent = save.gold;

  // ── Party Bar ──────────────────────────────────────────────
  const partyBar = document.getElementById('party-bar');
  if (partyBar) {
    const team = save.team || [null,null,null,null];
    partyBar.innerHTML = '<div class="party-bar-label">Active Party <span class="party-hint">(click slot to change)</span></div><div class="party-slots">' +
      team.map((charId, i) => {
        const selected = selectedPartySlot === i ? ' selected' : '';
        if (!charId) {
          return `<div class="party-slot empty-slot${selected}" data-slot="${i}"><div class="ps-emoji">＋</div><div class="ps-info"><div class="ps-name">Empty</div><div class="ps-hint">Click to assign</div></div></div>`;
        }
        const char = CHAR_BY_ID[charId];
        if (!char) return `<div class="party-slot empty-slot${selected}" data-slot="${i}"><div class="ps-emoji">＋</div><div class="ps-info"><div class="ps-name">Empty</div><div class="ps-hint">Click to assign</div></div></div>`;
        const cls   = CLASS_BY_ID[char.classId];
        const cData = save.charData[charId];
        const stars = cData?.stars || 1;
        const weapon = cData?.weapon ? EQUIP_BY_ID[cData.weapon] : null;
        const acc1   = cData?.acc1   ? EQUIP_BY_ID[cData.acc1]   : null;
        const acc2   = cData?.acc2   ? EQUIP_BY_ID[cData.acc2]   : null;
        const manaColors = weapon
          ? (Array.isArray(weapon.manaColor) ? [...weapon.manaColor] : [weapon.manaColor])
          : [];
        for (const acc of [acc1, acc2]) {
          if (acc?.bonusColor) {
            const extra = Array.isArray(acc.bonusColor) ? acc.bonusColor : [acc.bonusColor];
            for (const c of extra) { if (!manaColors.includes(c)) manaColors.push(c); }
          }
        }
        const manaHtml = manaColors.map(c =>
          `<span class="hc-mana-dot" style="background:var(--${c})" title="${c} mana"></span>`
        ).join('');
        return `<div class="party-slot${selected}" data-slot="${i}">
          <div class="ps-emoji">${cls.emoji}</div>
          <div class="ps-info">
            <div class="ps-name">${char.name}</div>
            <div class="ps-stars">${starsHtml(stars)}</div>
            <div class="ps-mana">${manaHtml}</div>
          </div>
          <button class="ps-remove" data-slot="${i}" title="Remove from party">✕</button>
        </div>`;
      }).join('') + '</div>';

    // Wire party slot clicks
    partyBar.querySelectorAll('.party-slot').forEach(el => {
      const idx = parseInt(el.dataset.slot);
      // Remove button
      const rmBtn = el.querySelector('.ps-remove');
      if (rmBtn) {
        rmBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          save.team[idx] = null;
          selectedPartySlot = null;
          writeSave();
          renderHeroes();
        });
      }
      // Clicking the slot itself toggles selection for assignment
      el.addEventListener('click', () => {
        selectedPartySlot = selectedPartySlot === idx ? null : idx;
        renderHeroes();
      });
    });
  }

  const grid = document.getElementById('heroes-grid');
  grid.innerHTML = '';

  // Show unlocked first, then locked
  const sorted = [...CHARACTERS].sort((a, b) => {
    const aOwned = save.unlockedCharIds.includes(a.charId);
    const bOwned = save.unlockedCharIds.includes(b.charId);
    if (aOwned !== bOwned) return bOwned ? 1 : -1;
    return 0;
  });

  sorted.forEach(char => {
    const owned = save.unlockedCharIds.includes(char.charId);
    const cls   = CLASS_BY_ID[char.classId];
    const cData = save.charData[char.charId];
    const stars = cData ? (cData.stars || 1) : 0;

    const inParty = save.team.includes(char.charId);
    const card = document.createElement('div');
    card.className = 'hero-card' + (owned ? '' : ' locked') + (inParty ? ' in-party' : '');
    card.style.borderColor = owned ? '#c8a040' : '#333';

    if (owned) {
      const weapon = cData?.weapon ? EQUIP_BY_ID[cData.weapon] : null;
      const armor  = cData?.armor  ? EQUIP_BY_ID[cData.armor]  : null;
      const acc1   = cData?.acc1   ? EQUIP_BY_ID[cData.acc1]   : null;
      const acc2   = cData?.acc2   ? EQUIP_BY_ID[cData.acc2]   : null;
      const wUpg   = save.upgrades[cData?.weapon] || 0;
      const aUpg   = save.upgrades[cData?.armor]  || 0;

      // Compute effective stats
      const growth = cls.statGrowth || {};
      const bonus  = statBonusAtStars(growth, stars);
      let atk = (cls.baseAttack  || 0) + bonus.attack;
      let arm = (cls.baseArmor   || 0) + bonus.armor;
      let hp  = (cls.baseMaxLife || 22) + bonus.maxLife;
      if (weapon) {
        atk += (weapon.baseAttackBonus || 0) + weaponUpgradeBonus(weapon.rarity, wUpg).attack;
      }
      if (armor) {
        const aBonus = armorUpgradeBonus(armor.rarity, aUpg);
        arm += (armor.baseArmorBonus || 0) + aBonus.armor;
        hp  += (armor.baseLifeBonus  || 0) + aBonus.maxLife;
      }
      if (acc1?.stats) { atk += acc1.stats.attack || 0; arm += acc1.stats.armor || 0; hp += acc1.stats.maxLife || 0; }
      if (acc2?.stats) { atk += acc2.stats.attack || 0; arm += acc2.stats.armor || 0; hp += acc2.stats.maxLife || 0; }

      const manaColors = weapon
        ? (Array.isArray(weapon.manaColor) ? weapon.manaColor : [weapon.manaColor])
        : [];
      // Add bonus colors from accessories
      for (const acc of [acc1, acc2]) {
        if (acc?.bonusColor) {
          const extra = Array.isArray(acc.bonusColor) ? acc.bonusColor : [acc.bonusColor];
          for (const c of extra) { if (!manaColors.includes(c)) manaColors.push(c); }
        }
      }
      const manaHtml = manaColors.map(c =>
        `<span class="hc-mana-dot" style="background:var(--${c})" title="${c} mana"></span>`
      ).join('');
      // Card background gradient from mana colors
      const cardBg = manaColors.length > 0
        ? manaColors.length === 1
          ? `border-left: 4px solid var(--${manaColors[0]}); background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%);`
          : `border-image: linear-gradient(to bottom, ${manaColors.map(c => `var(--${c})`).join(', ')}) 1; border-left-width: 4px; border-left-style: solid;`
        : '';

      card.innerHTML = `
        <div class="hc-top-row">
          <div class="hc-emoji">${cls.emoji}</div>
          <div class="hc-title-block">
            <div class="hc-name">${char.name}</div>
            <div class="hc-class">${cls.name}</div>
            <div class="hc-stars">${starsHtml(stars)}</div>
          </div>
          <div class="hc-mana-dots">${manaHtml}</div>
        </div>
        <div class="hc-stat-row">
          <span title="Attack">⚔️ ${atk}</span>
          <span title="Armor">🛡 ${arm}</span>
          <span title="HP">❤️ ${hp}</span>
        </div>
        <div class="hc-equip-row">
          <span class="hc-equip-item">${weapon ? `${weapon.icon || '⚔️'} ${weapon.name}` : '<span class="hc-empty">No weapon</span>'}</span>
          <span class="hc-equip-item">${armor  ? `${armor.icon || '🛡'} ${armor.name}` : '<span class="hc-empty">No armor</span>'}</span>
        </div>
        <div class="hc-btn-row">
          <button class="hero-equip-btn" data-char="${char.charId}">Hero Details</button>
          ${inParty
            ? '<span class="hc-party-badge">✓ In Party</span>'
            : `<button class="hero-party-btn" data-char="${char.charId}">+ Add to Party</button>`}
        </div>
      `;
      card.querySelector('.hero-equip-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openHeroDetail(char.charId);
      });
      // Party assignment (click card or the "Add to Party" button)
      const partyBtn = card.querySelector('.hero-party-btn');
      if (partyBtn) {
        partyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          assignToParty(char.charId);
        });
      }
      // If a slot is selected, clicking the card itself also assigns
      if (selectedPartySlot !== null && !inParty) {
        card.classList.add('assignable');
        card.addEventListener('click', () => assignToParty(char.charId));
      }
    } else {
      card.innerHTML = `
        <div class="hc-top-row">
          <div class="hc-emoji locked-emoji">?</div>
          <div class="hc-title-block">
            <div class="hc-name">${char.name}</div>
            <div class="hc-class" style="color:#666">${cls.name}</div>
          </div>
        </div>
        <div class="hc-lock-msg">🔒 Use a Hero Draw in the Store</div>
      `;
    }
    grid.appendChild(card);
  });

  showScreen('heroes');
}

// ── Party Assignment ─────────────────────────────────────────
function assignToParty(charId) {
  if (!save.team) save.team = [null, null, null, null];

  // If a specific slot is selected, place hero there
  if (selectedPartySlot !== null) {
    // Remove hero from any existing slot
    const existingIdx = save.team.indexOf(charId);
    if (existingIdx !== -1) save.team[existingIdx] = null;
    save.team[selectedPartySlot] = charId;
    selectedPartySlot = null;
  } else {
    // No slot selected — find first empty slot
    const existingIdx = save.team.indexOf(charId);
    if (existingIdx !== -1) return; // already in party
    const emptyIdx = save.team.indexOf(null);
    if (emptyIdx === -1) return;    // party full
    save.team[emptyIdx] = charId;
  }
  writeSave();
  renderHeroes();
}

// ── Equipment Management Overlay ──────────────────────────────
function openEquipOverlay(charId) {
  selectedCharId = charId;
  const char  = CHAR_BY_ID[charId];
  const cls   = CLASS_BY_ID[char.classId];
  const cData = save.charData[charId];
  const stars = cData?.stars || 1;

  const overlay = document.getElementById('equip-overlay');
  if (!overlay) return;

  // Build overlay content
  const milestones = getActiveMilestones(cls.milestones, stars);
  const acc2Open   = isSlotUnlocked(cls.milestones, stars, 'acc2');

  let html = `
    <div class="equip-header">
      <span>${char.name} — ${cls.name} ${starsHtml(stars)}</span>
      <button id="equip-close-btn">✕</button>
    </div>
    <div class="equip-slots">
      ${equipSlotHtml('weapon', cData?.weapon, '⚔️ Weapon', charId)}
      ${equipSlotHtml('armor',  cData?.armor,  '🛡 Armor', charId)}
      ${equipSlotHtml('acc1',   cData?.acc1,   '💎 Accessory 1', charId)}
      ${acc2Open 
        ? equipSlotHtml('acc2', cData?.acc2, '💎 Accessory 2', charId)
        : '<div class="equip-slot locked"><span>🔒 ⭐3 — 2nd Accessory</span></div>'
      }
    </div>
    ${milestones.length ? `
      <div class="equip-passives">
        <div class="passives-label">Passives:</div>
        ${milestones.map(p => `<div class="passive-tag">${p.name} — ${p.desc}</div>`).join('')}
      </div>
    ` : ''}
  `;

  overlay.innerHTML = `<div id="equip-box">${html}</div>`;
  overlay.classList.remove('hidden');

  overlay.querySelector('#equip-close-btn').addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

  // Wire slot buttons
  overlay.querySelectorAll('.equip-change-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openEquipPicker(charId, btn.dataset.slot);
    });
  });
  overlay.querySelectorAll('.equip-unequip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      unequipSlot(charId, btn.dataset.slot);
    });
  });
}

/** Returns a 1–2 line stat/skill summary for any equipment item. */
function equipStatLine(item, upgLevel = 0) {
  if (!item) return '';
  if (item.slot === 'weapon') {
    const upgBonus = weaponUpgradeBonus(item.rarity, upgLevel);
    const atkBonus = item.baseAttackBonus + (upgBonus.attack || 0);
    const weaponColors = Array.isArray(item.manaColor) ? item.manaColor : (item.manaColor ? [item.manaColor] : []);
    const colorPips = weaponColors.map(c => `<span class="mana-pip ${c}"></span>`).join('');
    return `<div class="equip-stat-line">⚔️ +${atkBonus} ATK &nbsp;${colorPips}${item.manaCost}✦</div>
            <div class="equip-skill-line"><em>${item.spell}:</em> ${item.spellDesc}</div>`;
  }
  if (item.slot === 'armor') {
    const upgBonus = armorUpgradeBonus(item.rarity, upgLevel);
    const defBonus = item.baseArmorBonus + (upgBonus.armor || 0);
    const hpBonus  = (item.baseLifeBonus || 0) + (upgBonus.maxLife || 0);
    return `<div class="equip-stat-line">🛡 +${defBonus} DEF &nbsp;❤️ +${hpBonus} HP</div>`;
  }
  if (item.slot === 'accessory') {
    const statParts = [];
    if (item.stats?.attack)  statParts.push(`⚔️ +${item.stats.attack} ATK`);
    if (item.stats?.armor)   statParts.push(`🛡 +${item.stats.armor} DEF`);
    if (item.stats?.life)    statParts.push(`❤️ +${item.stats.life} HP`);
    if (item.stats?.mana)    statParts.push(`✦ +${item.stats.mana} mana`);
    // Show bonus mana color
    if (item.bonusColor) {
      const bc = Array.isArray(item.bonusColor) ? item.bonusColor : [item.bonusColor];
      statParts.push(bc.map(c => `<span class="mana-pip ${c}"></span>`).join('') + ' +mana color');
    }
    const statsStr = statParts.join(' &nbsp;') || '—';
    const passStr  = item.passive ? `<div class="equip-skill-line">🔮 <em>${item.passive.name}:</em> ${item.passive.desc}</div>` : '';
    return `<div class="equip-stat-line">${statsStr}</div>${passStr}`;
  }
  return '';
}

function equipSlotHtml(slot, itemId, label, charId) {
  const item = itemId ? EQUIP_BY_ID[itemId] : null;
  const upgLevel = itemId ? (save.upgrades[itemId] || 0) : 0;
  const upgStr = upgLevel > 0 ? ` +${upgLevel}` : '';
  if (item) {
    const rarC = RARITY_COLORS[item.rarity] || '#8a9ba8';
    const canUpg = upgLevel < 10;

    // Build upgrade section
    let upgradeHtml = '';
    if (canUpg) {
      const nextStats = equipStatLine(item, upgLevel + 1);
      const cost = upgradeCost(item, upgLevel);
      const costChips = Object.entries(cost).map(([matId, qty]) => {
        if (matId === '_gold') {
          const enough = save.gold >= qty;
          return `<span class="eu-cost-chip${enough ? '' : ' eu-short'}">💰${qty}g</span>`;
        }
        const mat = MATERIALS[matId];
        const have = save.materials?.[matId] ?? 0;
        const enough = have >= qty;
        return `<span class="eu-cost-chip${enough ? '' : ' eu-short'}">${mat?.emoji || matId} ${have}/${qty}</span>`;
      }).join('');

      upgradeHtml = `
        <div class="eu-upgrade-section">
          <div class="eu-preview">
            <span class="eu-preview-label">+${upgLevel + 1}</span>
            <span class="eu-preview-stats">${nextStats}</span>
          </div>
          <div class="eu-cost-row">${costChips}</div>
          <button class="eu-upgrade-btn" data-id="${itemId}">⬆ Upgrade</button>
        </div>`;
    } else {
      upgradeHtml = `<div class="eu-max-badge">✦ MAX +10</div>`;
    }

    return `<div class="equip-slot filled" style="border-color:${rarC}">
      <div class="es-top-row">
        <div class="es-info">
          <div class="equip-slot-label">${label}</div>
          <div class="equip-slot-name" style="color:${rarC}">${item.name}${upgStr}</div>
          ${equipStatLine(item, upgLevel)}
        </div>
        <div class="es-upgrade">
          ${upgradeHtml}
        </div>
      </div>
      <div class="equip-slot-btns">
        <button class="equip-change-btn" data-slot="${slot}">Change</button>
        <button class="equip-unequip-btn" data-slot="${slot}">Remove</button>
      </div>
    </div>`;
  }
  return `<div class="equip-slot empty">
    <div class="equip-slot-label">${label}</div>
    <div class="equip-slot-name">— Empty —</div>
    <button class="equip-change-btn" data-slot="${slot}">Equip</button>
  </div>`;
}

function openEquipPicker(charId, slot) {
  const char = CHAR_BY_ID[charId];
  const cls  = CLASS_BY_ID[char.classId];
  const cData = save.charData[charId];

  // Filter inventory to compatible items
  let pool;
  if (slot === 'weapon') {
    pool = save.inventory
      .map(id => EQUIP_BY_ID[id])
      .filter(item => item && item.slot === 'weapon' && item.classes.includes(char.classId));
  } else if (slot === 'armor') {
    pool = save.inventory
      .map(id => EQUIP_BY_ID[id])
      .filter(item => item && item.slot === 'armor' && cls.armorWeights.includes(item.weight));
  } else {
    // accessory — universal
    pool = save.inventory
      .map(id => EQUIP_BY_ID[id])
      .filter(item => item && item.slot === 'accessory');
  }

  // Remove duplicates and items already equipped by others
  const equippedElsewhere = new Set();
  for (const [cid, cd] of Object.entries(save.charData)) {
    if (cid === charId) continue;
    if (cd.weapon) equippedElsewhere.add(cd.weapon);
    if (cd.armor)  equippedElsewhere.add(cd.armor);
    if (cd.acc1)   equippedElsewhere.add(cd.acc1);
    if (cd.acc2)   equippedElsewhere.add(cd.acc2);
  }

  const grid = document.getElementById('picker-grid');
  const overlay = document.getElementById('hero-picker-overlay');
  const header  = document.getElementById('picker-header');
  if (header) header.querySelector('span').textContent = `Choose ${slot}`;
  grid.innerHTML = '';

  // Deduplicate by id (show each owned item once)
  const seen = new Set();
  pool.forEach(item => {
    if (!item || seen.has(item.id)) return;
    seen.add(item.id);
    const used = equippedElsewhere.has(item.id);
    const upgLevel = save.upgrades[item.id] || 0;
    const upgStr = upgLevel > 0 ? ` +${upgLevel}` : '';
    const rarC = RARITY_COLORS[item.rarity] || '#8a9ba8';

    const card = document.createElement('div');
    card.className = 'picker-card' + (used ? ' used' : '');
    card.style.borderColor = rarC;
    card.innerHTML = `
      <div class="picker-emoji">${item.icon || '📦'}</div>
      <div class="picker-name" style="color:${rarC}">${item.name}${upgStr}</div>
      <div class="picker-rarity" style="color:${rarC}">${item.rarity}</div>
      ${item.manaColor ? (() => {
        const mc = Array.isArray(item.manaColor) ? item.manaColor : [item.manaColor];
        return `<div class="picker-mana">${mc.map(c => `<span class="mana-pip ${c}"></span>`).join('')} ${mc.join(' + ')} mana</div>`;
      })() : ''}
      ${equipStatLine(item, save.upgrades[item.id] || 0)}
    `;
    if (!used) {
      card.addEventListener('click', () => {
        equipItem(charId, slot, item.id);
      });
    }
    grid.appendChild(card);
  });

  if (seen.size === 0) {
    grid.innerHTML = '<div style="color:#888;padding:20px">No compatible items in inventory</div>';
  }

  overlay.classList.remove('hidden');
}

function equipItem(charId, slot, itemId) {
  ensureCharData(charId);
  save.charData[charId][slot] = itemId;
  writeSave();
  document.getElementById('hero-picker-overlay').classList.add('hidden');
  openHeroDetail(charId, 'equipment'); // refresh detail view
}

function unequipSlot(charId, slot) {
  if (!save.charData[charId]) return;
  save.charData[charId][slot] = null;
  writeSave();
  openHeroDetail(charId, 'equipment'); // refresh detail view
}

function doInlineUpgrade(itemId, charId) {
  const item = EQUIP_BY_ID[itemId];
  if (!item) return;
  const lvl = save.upgrades[itemId] || 0;
  if (lvl >= 10) return;

  const cost = upgradeCost(item, lvl);
  // Check affordability
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
  // Refresh gold in HUD + re-render detail
  document.getElementById('hud-gold').textContent = save.gold;
  openHeroDetail(charId, 'equipment');
}

// ══════════════════════════════════════════════════════════════
//  HERO DETAIL VIEW  (tabbed: Overview · Equipment · Perks · Lore)
// ══════════════════════════════════════════════════════════════
const DETAIL_TABS = [
  { id: 'overview',  label: '📊 Overview' },
  { id: 'equipment', label: '⚔️ Equipment' },
  { id: 'perks',     label: '🔮 Perks' },
  { id: 'lore',      label: '📖 Lore' },
];

export function openHeroDetail(charId, tab) {
  detailCharId = charId;
  if (tab) detailTab = tab;

  const char  = CHAR_BY_ID[charId];
  const cls   = CLASS_BY_ID[char.classId];
  const cData = save.charData[charId];
  const stars = cData?.stars || 1;

  document.getElementById('hero-detail-title').textContent = char.name;

  const content = document.getElementById('hero-detail-content');

  // ── Tab bar ────────────────────────────────────────────────
  const tabsHtml = DETAIL_TABS.map(t =>
    `<button class="hd-tab${detailTab === t.id ? ' active' : ''}" data-tab="${t.id}">${t.label}</button>`
  ).join('');

  // ── Tab content ────────────────────────────────────────────
  let body = '';
  if (detailTab === 'overview')  body = renderOverviewTab(char, cls, cData, stars);
  if (detailTab === 'equipment') body = renderEquipmentTab(char, cls, cData, stars);
  if (detailTab === 'perks')     body = renderPerksTab(char, cls, cData, stars);
  if (detailTab === 'lore')      body = renderLoreTab(char, cls, cData, stars);

  content.innerHTML = `
    <div class="hd-tab-bar">${tabsHtml}</div>
    <div class="hd-tab-body">${body}</div>
  `;

  // Wire tabs
  content.querySelectorAll('.hd-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      detailTab = btn.dataset.tab;
      openHeroDetail(charId);
    });
  });

  // Wire equipment interactions if on equipment tab
  if (detailTab === 'equipment') {
    content.querySelectorAll('.equip-change-btn').forEach(btn => {
      btn.addEventListener('click', () => openEquipPicker(charId, btn.dataset.slot));
    });
    content.querySelectorAll('.equip-unequip-btn').forEach(btn => {
      btn.addEventListener('click', () => unequipSlot(charId, btn.dataset.slot));
    });
    content.querySelectorAll('.eu-upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => doInlineUpgrade(btn.dataset.id, charId));
    });
  }

  showScreen('hero-detail');
}

// ── Overview Tab ──────────────────────────────────────────────
function renderOverviewTab(char, cls, cData, stars) {
  const growth = cls.statGrowth || {};
  const bonus  = statBonusAtStars(growth, stars);
  const weapon = cData?.weapon ? EQUIP_BY_ID[cData.weapon] : null;
  const armor  = cData?.armor  ? EQUIP_BY_ID[cData.armor]  : null;
  const acc1   = cData?.acc1   ? EQUIP_BY_ID[cData.acc1]   : null;
  const acc2   = cData?.acc2   ? EQUIP_BY_ID[cData.acc2]   : null;
  const wUpg   = save.upgrades[cData?.weapon] || 0;
  const aUpg   = save.upgrades[cData?.armor]  || 0;

  let atk = (cls.baseAttack  || 0) + bonus.attack;
  let arm = (cls.baseArmor   || 0) + bonus.armor;
  let hp  = (cls.baseMaxLife || 22) + bonus.maxLife;
  if (weapon) atk += (weapon.baseAttackBonus || 0) + weaponUpgradeBonus(weapon.rarity, wUpg).attack;
  if (armor) {
    const aBonus = armorUpgradeBonus(armor.rarity, aUpg);
    arm += (armor.baseArmorBonus || 0) + aBonus.armor;
    hp  += (armor.baseLifeBonus  || 0) + aBonus.maxLife;
  }
  if (acc1?.stats) { atk += acc1.stats.attack || 0; arm += acc1.stats.armor || 0; hp += acc1.stats.maxLife || 0; }
  if (acc2?.stats) { atk += acc2.stats.attack || 0; arm += acc2.stats.armor || 0; hp += acc2.stats.maxLife || 0; }

  // Mana colors
  const manaColors = weapon
    ? (Array.isArray(weapon.manaColor) ? [...weapon.manaColor] : [weapon.manaColor])
    : [];
  for (const acc of [acc1, acc2]) {
    if (acc?.bonusColor) {
      const extra = Array.isArray(acc.bonusColor) ? acc.bonusColor : [acc.bonusColor];
      for (const c of extra) { if (!manaColors.includes(c)) manaColors.push(c); }
    }
  }
  const manaHtml = manaColors.length > 0
    ? manaColors.map(c => `<span class="hc-mana-dot" style="background:var(--${c})" title="${c}"></span>`).join('')
    : '<span class="hd-none">No weapon equipped</span>';

  // Spell info
  const spellHtml = weapon
    ? `<div class="hd-spell"><span class="hd-spell-name">${weapon.spell}</span> <span class="hd-spell-cost">(${weapon.manaCost} mana)</span><div class="hd-spell-desc">${weapon.spellDesc}</div></div>`
    : '<div class="hd-none">Equip a weapon to gain a spell</div>';

  // Star-up section
  const shards = cData?.shards || 0;
  const shardsNeeded = stars >= MAX_STARS ? 0 : stars * 10; // 10, 20, 30, 40
  const canStarUp = stars < MAX_STARS && shards >= shardsNeeded;

  return `
    <div class="hd-overview">
      <div class="hd-hero-header">
        <div class="hd-hero-emoji">${cls.emoji}</div>
        <div class="hd-hero-info">
          <div class="hd-hero-name">${char.name}</div>
          <div class="hd-hero-class">${cls.name}</div>
          <div class="hd-hero-stars">${starsHtml(stars)}</div>
        </div>
        <div class="hd-mana-col">
          <div class="hd-mana-label">Mana</div>
          <div class="hd-mana-dots">${manaHtml}</div>
        </div>
      </div>

      <div class="hd-stats-grid">
        <div class="hd-stat"><div class="hd-stat-val">${atk}</div><div class="hd-stat-label">⚔️ Attack</div></div>
        <div class="hd-stat"><div class="hd-stat-val">${arm}</div><div class="hd-stat-label">🛡 Armor</div></div>
        <div class="hd-stat"><div class="hd-stat-val">${hp}</div><div class="hd-stat-label">❤️ Health</div></div>
      </div>

      <div class="hd-section-label">Spell</div>
      ${spellHtml}

      <div class="hd-section-label">Star Upgrade</div>
      <div class="hd-star-up">
        ${stars >= MAX_STARS
          ? '<div class="hd-star-max">🌟 Maximum Stars Reached!</div>'
          : `<div class="hd-shard-bar">
              <div class="hd-shard-info">
                <span>Shards: ${shards} / ${shardsNeeded}</span>
              </div>
              <div class="hd-shard-track"><div class="hd-shard-fill" style="width:${Math.min(100, (shards / shardsNeeded) * 100)}%"></div></div>
            </div>
            <button class="hd-star-btn" ${canStarUp ? '' : 'disabled'}>
              ⭐ Upgrade to ${stars + 1} Stars
            </button>`
        }
      </div>
    </div>
  `;
}

// ── Equipment Tab ─────────────────────────────────────────────
function renderEquipmentTab(char, cls, cData, stars) {
  const acc2Open = isSlotUnlocked(cls.milestones, stars, 'acc2');

  return `
    <div class="hd-equipment">
      <div class="equip-slots">
        ${equipSlotHtml('weapon', cData?.weapon, '⚔️ Weapon', char.charId)}
        ${equipSlotHtml('armor',  cData?.armor,  '🛡 Armor', char.charId)}
        ${equipSlotHtml('acc1',   cData?.acc1,   '💎 Accessory 1', char.charId)}
        ${acc2Open
          ? equipSlotHtml('acc2', cData?.acc2, '💎 Accessory 2', char.charId)
          : '<div class="equip-slot locked"><span>🔒 Reach ⭐3 to unlock 2nd Accessory</span></div>'
        }
      </div>
    </div>
  `;
}

// ── Perks Tab ─────────────────────────────────────────────────
function renderPerksTab(char, cls, cData, stars) {
  const milestones = cls.milestones || {};
  let html = '<div class="hd-perks">';

  for (let s = 2; s <= MAX_STARS; s++) {
    const m = milestones[s];
    if (!m) continue;
    const unlocked = stars >= s;
    const icon = m.type === 'slot' ? '🔓' : '🔮';
    html += `
      <div class="hd-perk ${unlocked ? 'unlocked' : 'locked'}">
        <div class="hd-perk-star">${'⭐'.repeat(s)}</div>
        <div class="hd-perk-info">
          <div class="hd-perk-name">${icon} ${m.name}</div>
          <div class="hd-perk-desc">${m.desc}</div>
        </div>
        <div class="hd-perk-status">${unlocked ? '✅' : `🔒 Requires ⭐${s}`}</div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

// ── Lore Tab ──────────────────────────────────────────────────
function renderLoreTab(char, cls, cData, stars) {
  const lore = char.lore || 'This hero\'s story has yet to be written...';
  return `
    <div class="hd-lore">
      <div class="hd-lore-header">
        <div class="hd-lore-emoji">${cls.emoji}</div>
        <div>
          <div class="hd-lore-name">${char.name}</div>
          <div class="hd-lore-class">${cls.name} · ${cls.archetype}</div>
        </div>
      </div>
      <div class="hd-lore-text">${lore}</div>
    </div>
  `;
}
