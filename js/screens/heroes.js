// ============================================================
//  GEMS OF COMBAT — Roster / Character Management Screen
//  v5: Stars replace levels. Hero Draw mechanic.
// ============================================================
import { save, writeSave, ensureCharData } from '../state/save.js';
import { CHARACTERS, CHAR_BY_ID, DRAWABLE_CHARS } from '../data/characters.js';
import { CLASS_BY_ID }                    from '../data/classes.js';
import { EQUIP_BY_ID, WEAPONS, ARMORS, ACCESSORIES } from '../data/equipment.js';
import { weaponUpgradeBonus, armorUpgradeBonus } from '../data/materials.js';
import { statBonusAtStars, getActiveMilestones, isSlotUnlocked, MAX_STARS }
  from '../data/leveling.js';
import { RARITY_COLORS, RARITY_GLOWS }   from '../data/constants.js';
import { showScreen }                     from './navigation.js';


let selectedCharId = null;

function starsHtml(stars, max = 5) {
  return '⭐'.repeat(stars) + '☆'.repeat(max - stars);
}

export function renderHeroes() {
  document.getElementById('hud-gold').textContent = save.gold;
  const grid = document.getElementById('heroes-grid');
  grid.innerHTML = '';

  // Hero Draw button
  const heroDraws = save.heroDraws || 0;
  const drawArea = document.createElement('div');
  drawArea.className = 'hero-draw-area';
  drawArea.innerHTML = `
    <button id="hero-draw-btn" class="hero-draw-btn" ${heroDraws < 1 ? 'disabled' : ''}>
      🎲 Hero Draw (${heroDraws} available)
    </button>
  `;
  grid.appendChild(drawArea);
  drawArea.querySelector('#hero-draw-btn').addEventListener('click', performHeroDraw);

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

    const card = document.createElement('div');
    card.className = 'hero-card' + (owned ? '' : ' locked');
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
        <button class="hero-equip-btn" data-char="${char.charId}">Manage Gear</button>
      `;
      card.querySelector('.hero-equip-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEquipOverlay(char.charId);
      });
    } else {
      card.innerHTML = `
        <div class="hc-top-row">
          <div class="hc-emoji locked-emoji">?</div>
          <div class="hc-title-block">
            <div class="hc-name">${char.name}</div>
            <div class="hc-class" style="color:#666">${cls.name}</div>
          </div>
        </div>
        <div class="hc-lock-msg">🔒 Use a Hero Draw to unlock</div>
      `;
    }
    grid.appendChild(card);
  });

  showScreen('heroes');
}

// ── Hero Draw ────────────────────────────────────────────────
function performHeroDraw() {
  if ((save.heroDraws || 0) < 1) return;
  save.heroDraws -= 1;

  // Find unlockable heroes (not yet unlocked)
  const unowned = DRAWABLE_CHARS.filter(c => !save.unlockedCharIds.includes(c.charId));
  if (unowned.length > 0) {
    // Unlock a random new hero
    const char = unowned[Math.floor(Math.random() * unowned.length)];
    save.unlockedCharIds.push(char.charId);
    ensureCharData(char.charId); // assigns starter weapon
    writeSave();
    alert(`🎉 ${char.name} joined your roster!`);
  } else {
    // All heroes unlocked — upgrade a random hero's stars (cap MAX_STARS)
    const upgradeable = DRAWABLE_CHARS.filter(c => (save.charData[c.charId]?.stars || 1) < MAX_STARS);
    if (upgradeable.length > 0) {
      const char = upgradeable[Math.floor(Math.random() * upgradeable.length)];
      save.charData[char.charId].stars = (save.charData[char.charId].stars || 1) + 1;
      writeSave();
      alert(`⭐ ${char.name} upgraded to ${starsHtml(save.charData[char.charId].stars)}!`);
    } else {
      // All heroes at max stars — refund draw
      save.heroDraws += 1;
      writeSave();
      alert('🌟 All heroes are already at max stars!');
    }
  }
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
  openEquipOverlay(charId); // refresh
}

function unequipSlot(charId, slot) {
  if (!save.charData[charId]) return;
  save.charData[charId][slot] = null;
  writeSave();
  openEquipOverlay(charId); // refresh
}
