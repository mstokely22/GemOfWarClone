// ============================================================
//  GEMS OF COMBAT — Roster / Character Management Screen
//  Shows all characters, their levels, equipment, and lets
//  the player manage equipment loadouts.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { CHARACTERS, CHAR_BY_ID }         from '../data/characters.js';
import { CLASS_BY_ID }                    from '../data/classes.js';
import { EQUIP_BY_ID, WEAPONS, ARMORS, ACCESSORIES } from '../data/equipment.js';
import { levelFromXp, xpProgress, getActiveMilestones, isSlotUnlocked }
  from '../data/leveling.js';
import { RARITY_COLORS, RARITY_GLOWS }   from '../data/constants.js';
import { showScreen }                     from './navigation.js';

let selectedCharId = null;

export function renderHeroes() {
  document.getElementById('hud-gold').textContent = save.gold;
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
    const level = cData ? levelFromXp(cData.xp || 0) : 1;

    const card = document.createElement('div');
    card.className = 'hero-card' + (owned ? '' : ' locked');
    card.style.borderColor = owned ? '#c8a040' : '#333';

    if (owned) {
      const weapon = cData?.weapon ? EQUIP_BY_ID[cData.weapon] : null;
      const armor  = cData?.armor  ? EQUIP_BY_ID[cData.armor]  : null;
      const prog   = xpProgress(cData?.xp || 0);

      card.innerHTML = `
        <div class="hero-card-emoji">${cls.emoji}</div>
        <div class="hero-card-name">${char.name}</div>
        <div class="hero-card-rarity" style="color:#c8a040">${cls.name} — Lv.${level}</div>
        <div class="hero-card-xp-bar">
          <div class="hero-card-xp-fill" style="width:${prog.pct}%"></div>
        </div>
        <div class="hero-card-stats">
          ⚔️ ${weapon ? weapon.name : 'None'}<br>
          🛡 ${armor ? armor.name : 'None'}
        </div>
        <button class="hero-equip-btn" data-char="${char.charId}">Manage Gear</button>
      `;
      card.querySelector('.hero-equip-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEquipOverlay(char.charId);
      });
    } else {
      const condition = char.unlockCondition.startsWith('level_')
        ? `Beat Level ${char.unlockCondition.split('_')[1]}`
        : char.unlockCondition;
      card.innerHTML = `
        <div class="hero-card-emoji locked-emoji">?</div>
        <div class="hero-card-name">${char.name}</div>
        <div class="hero-card-rarity" style="color:#666">${cls.name}</div>
        <div class="hero-card-spelldesc">🔒 ${condition}</div>
      `;
    }
    grid.appendChild(card);
  });

  showScreen('heroes');
}

// ── Equipment Management Overlay ──────────────────────────────
function openEquipOverlay(charId) {
  selectedCharId = charId;
  const char  = CHAR_BY_ID[charId];
  const cls   = CLASS_BY_ID[char.classId];
  const cData = save.charData[charId];
  const level = levelFromXp(cData?.xp || 0);

  const overlay = document.getElementById('equip-overlay');
  if (!overlay) return;

  // Build overlay content
  const milestones = getActiveMilestones(cls.milestones, level);
  const acc2Open   = isSlotUnlocked(cls.milestones, level, 'acc2');

  let html = `
    <div class="equip-header">
      <span>${char.name} — ${cls.name} Lv.${level}</span>
      <button id="equip-close-btn">✕</button>
    </div>
    <div class="equip-slots">
      ${equipSlotHtml('weapon', cData?.weapon, '⚔️ Weapon', charId)}
      ${equipSlotHtml('armor',  cData?.armor,  '🛡 Armor', charId)}
      ${equipSlotHtml('acc1',   cData?.acc1,   '💎 Accessory 1', charId)}
      ${acc2Open 
        ? equipSlotHtml('acc2', cData?.acc2, '💎 Accessory 2', charId)
        : '<div class="equip-slot locked"><span>🔒 Lv.10 — 2nd Accessory</span></div>'
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

function equipSlotHtml(slot, itemId, label, charId) {
  const item = itemId ? EQUIP_BY_ID[itemId] : null;
  const upgLevel = itemId ? (save.upgrades[itemId] || 0) : 0;
  const upgStr = upgLevel > 0 ? ` +${upgLevel}` : '';
  if (item) {
    const rarC = RARITY_COLORS[item.rarity] || '#8a9ba8';
    return `<div class="equip-slot filled" style="border-color:${rarC}">
      <div class="equip-slot-label">${label}</div>
      <div class="equip-slot-name" style="color:${rarC}">${item.name}${upgStr}</div>
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
      <div class="picker-name">${item.name}${upgStr}</div>
      <div class="picker-rarity" style="color:${rarC}">${item.rarity}</div>
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
  openEquipOverlay(charId); // refresh
}

function unequipSlot(charId, slot) {
  if (!save.charData[charId]) return;
  save.charData[charId][slot] = null;
  writeSave();
  openEquipOverlay(charId); // refresh
}
