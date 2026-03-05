// ============================================================
//  GEMS OF COMBAT — Team Builder Screen (v3: characters + equipment)
// ============================================================
import { save, writeSave }            from '../state/save.js';
import { assembleTroop }              from '../state/gameState.js';
import { CHAR_BY_ID, CHARACTERS }     from '../data/characters.js';
import { CLASS_BY_ID }                from '../data/classes.js';
import { EQUIP_BY_ID }               from '../data/equipment.js';
import { statBonusAtStars }           from '../data/leveling.js';
import { weaponUpgradeBonus, armorUpgradeBonus } from '../data/materials.js';
import { RARITY_COLORS }             from '../data/constants.js';
import { showScreen }                 from './navigation.js';

let pickerSlot = -1;

export function goToTeamBuilder() {
  renderTeamBuilder();
  showScreen('team');
}

export function renderTeamBuilder() {
  document.getElementById('hud-gold').textContent = save.gold;
  const battle = save.activeDungeon?.pendingBattle;

  document.getElementById('team-level-title').textContent =
    battle ? `${DUNGEON_NAME()} — ${battle.label}` : 'Team Builder';

  const preview = document.getElementById('team-enemy-preview');
  const enemies = battle?.enemies || [];
  preview.innerHTML = enemies.map(e =>
    `<div class="enemy-chip">${e.emoji} ${e.name}</div>`
  ).join('') || '<div class="enemy-chip">No enemies</div>';

  renderTeamSlots();
}

function DUNGEON_NAME() {
  const id  = save.activeDungeon?.dungeonId;
  if (!id) return 'Dungeon';
  // Lazy inline name without full import to avoid circular deps
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function renderTeamSlots() {
  const slots = document.getElementById('team-slots');
  slots.innerHTML = '';

  save.team.forEach((charId, i) => {
    const char = charId ? CHAR_BY_ID[charId] : null;
    const cls  = char ? CLASS_BY_ID[char.classId] : null;
    const cData = charId ? save.charData[charId] : null;
    const stars = cData ? (cData.stars || 1) : 0;

    const div = document.createElement('div');
    div.className = 'team-slot' + (char ? '' : ' empty');

    if (char) {
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
      if (weapon) atk += (weapon.baseAttackBonus || 0) + weaponUpgradeBonus(weapon.rarity, wUpg).attack;
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

      div.innerHTML = `
        <div class="ts-card-body">
          <div class="hc-top-row">
            <div class="hc-emoji">${cls.emoji}</div>
            <div class="hc-title-block">
              <div class="hc-name">${char.name}</div>
              <div class="hc-class">${cls.name} ${'\u2b50'.repeat(stars)}</div>
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
        </div>
        <div class="ts-remove" data-slot="${i}" title="Remove">✕</div>
      `;
      div.querySelector('.ts-remove').addEventListener('click', e => {
        e.stopPropagation();
        clearSlot(i);
      });
      div.addEventListener('click', () => openCharPicker(i));
    } else {
      div.innerHTML = `<div class="slot-plus">+</div><div class="hc-name" style="color:#666">Empty</div>`;
      div.addEventListener('click', () => openCharPicker(i));
    }
    slots.appendChild(div);
  });
}

export function openCharPicker(slotIdx) {
  pickerSlot = slotIdx;
  const grid    = document.getElementById('picker-grid');
  const overlay = document.getElementById('hero-picker-overlay');
  grid.innerHTML = '';

  const usedIds = save.team.filter((id, i) => id && i !== slotIdx);

  // Show header
  const header = document.getElementById('picker-header');
  if (header) header.querySelector('span').textContent = 'Choose a Character';

  save.unlockedCharIds.forEach(charId => {
    const char = CHAR_BY_ID[charId];
    if (!char) return;
    const cls  = CLASS_BY_ID[char.classId];
    const used = usedIds.includes(charId);
    const cData = save.charData[charId];
    const stars = cData ? (cData.stars || 1) : 1;
    const starStr = '⭐'.repeat(stars);

    const card = document.createElement('div');
    card.className = 'picker-card' + (used ? ' used' : '');
    card.innerHTML = `
      <div class="picker-emoji">${cls.emoji}</div>
      <div class="picker-name">${char.name}</div>
      <div class="picker-rarity">${cls.name} ${starStr}</div>
    `;
    if (!used) card.addEventListener('click', () => assignChar(charId));
    grid.appendChild(card);
  });

  overlay.classList.remove('hidden');
}

export function assignChar(charId) {
  save.team[pickerSlot] = charId;
  writeSave();
  document.getElementById('hero-picker-overlay').classList.add('hidden');
  renderTeamSlots();
}

export function clearSlot(i) {
  save.team[i] = null;
  writeSave();
  renderTeamSlots();
}

export function closePicker() {
  document.getElementById('hero-picker-overlay').classList.add('hidden');
}

export function launchBattle() {
  const teamIds = save.team.filter(Boolean);
  if (teamIds.length === 0) {
    alert('Add at least one character to your team!');
    return;
  }
  const battle = save.activeDungeon?.pendingBattle;
  if (!battle) { alert('No room selected!'); return; }

  const playerTeam = teamIds.map(id => assembleTroop(id));
  const enemyTeam  = battle.enemies;

  showScreen('battle');
  requestAnimationFrame(() => {
    window.BATTLE.start(playerTeam, enemyTeam);
  });
}
