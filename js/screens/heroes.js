// ============================================================
//  GEMS OF COMBAT — Roster / Character Management Screen
//  Shows all characters, their levels, equipment, and lets
//  the player manage equipment loadouts.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { CHARACTERS, CHAR_BY_ID }         from '../data/characters.js';
import { CLASS_BY_ID }                    from '../data/classes.js';
import { EQUIP_BY_ID, WEAPONS, ARMORS, ACCESSORIES } from '../data/equipment.js';
import { weaponUpgradeBonus, armorUpgradeBonus } from '../data/materials.js';
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
      const acc1   = cData?.acc1   ? EQUIP_BY_ID[cData.acc1]   : null;
      const acc2   = cData?.acc2   ? EQUIP_BY_ID[cData.acc2]   : null;
      const prog   = xpProgress(cData?.xp || 0);
      const wUpg   = save.upgrades[cData?.weapon] || 0;
      const aUpg   = save.upgrades[cData?.armor]  || 0;

      // Compute effective stats
      const growth = cls.statGrowth || {};
      let atk  = (cls.baseAttack  || 0) + Math.floor((level - 1) * (growth.attack  || 0));
      let arm  = (cls.baseArmor   || 0) + Math.floor((level - 1) * (growth.armor   || 0));
      let hp   = (cls.baseMaxLife || 30) + Math.floor((level - 1) * (growth.maxLife || 0));
      if (weapon) {
        atk += (weapon.baseAttackBonus || 0) + weaponUpgradeBonus(weapon.rarity, wUpg).attack;
      }
      if (armor) {
        const aBonus = armorUpgradeBonus(armor.rarity, aUpg);
        arm += (armor.baseArmorBonus || 0) + aBonus.armor;
        hp  += (armor.baseLifeBonus  || 0) + aBonus.maxLife;
      }
      if (acc1?.stats) {
        atk += acc1.stats.attack  || 0;
        arm += acc1.stats.armor   || 0;
        hp  += acc1.stats.maxLife || 0;
      }
      if (acc2?.stats) {
        atk += acc2.stats.attack  || 0;
        arm += acc2.stats.armor   || 0;
        hp  += acc2.stats.maxLife || 0;
      }

      // Weapon skill color dot
      const manaColor = weapon?.manaColor || null;
      const manaHtml  = manaColor
        ? `<span class="hc-mana-dot" style="background:var(--${manaColor})" title="${manaColor} mana"></span>`
        : '';

      card.innerHTML = `
        <div class="hc-top-row">
          <div class="hc-emoji">${cls.emoji}</div>
          <div class="hc-title-block">
            <div class="hc-name">${char.name}</div>
            <div class="hc-class">${cls.name} — Lv.${level}</div>
            <div class="hc-xp-bar"><div class="hc-xp-fill" style="width:${prog.pct}%"></div></div>
          </div>
        </div>
        <div class="hc-stat-row">
          <span title="Attack">⚔️ ${atk}</span>
          <span title="Armor">🛡 ${arm}</span>
          <span title="HP">❤️ ${hp}</span>
        </div>
        <div class="hc-equip-row">
          <span class="hc-equip-item">${weapon ? `${manaHtml} ${weapon.icon || '⚔️'} ${weapon.name}` : '<span class="hc-empty">No weapon</span>'}</span>
          <span class="hc-equip-item">${armor  ? `${armor.icon || '🛡'} ${armor.name}` : '<span class="hc-empty">No armor</span>'}</span>
        </div>
        <button class="hero-equip-btn" data-char="${char.charId}">Manage Gear</button>
      `;
      card.querySelector('.hero-equip-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEquipOverlay(char.charId);
      });
    } else {
      let condition;
      if (char.unlockCondition.startsWith('clear:')) {
        const dName = char.unlockCondition.slice(6).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        condition = `Clear ${dName}`;
      } else {
        condition = char.unlockCondition;
      }
      card.innerHTML = `
        <div class="hc-top-row">
          <div class="hc-emoji locked-emoji">?</div>
          <div class="hc-title-block">
            <div class="hc-name">${char.name}</div>
            <div class="hc-class" style="color:#666">${cls.name}</div>
          </div>
        </div>
        <div class="hc-lock-msg">🔒 ${condition}</div>
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

/** Returns a 1–2 line stat/skill summary for any equipment item. */
function equipStatLine(item, upgLevel = 0) {
  if (!item) return '';
  if (item.slot === 'weapon') {
    const upgBonus = weaponUpgradeBonus(item.rarity, upgLevel);
    const atkBonus = item.baseAttackBonus + (upgBonus.attack || 0);
    const manaColor = item.manaColor ? `<span class="mana-pip ${item.manaColor}" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--gem-${item.manaColor},#888);vertical-align:middle;margin:0 2px"></span>` : '';
    return `<div class="equip-stat-line">⚔️ +${atkBonus} ATK &nbsp;${manaColor}${item.manaCost}✦</div>
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
    return `<div class="equip-slot filled" style="border-color:${rarC}">
      <div class="equip-slot-label">${label}</div>
      <div class="equip-slot-name" style="color:${rarC}">${item.name}${upgStr}</div>
      ${equipStatLine(item, upgLevel)}
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
  openEquipOverlay(charId); // refresh
}

function unequipSlot(charId, slot) {
  if (!save.charData[charId]) return;
  save.charData[charId][slot] = null;
  writeSave();
  openEquipOverlay(charId); // refresh
}
