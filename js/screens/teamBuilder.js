// ============================================================
//  GEMS OF COMBAT — Team Builder Screen (v3: characters + equipment)
// ============================================================
import { save, writeSave }            from '../state/save.js';
import { assembleTroop }              from '../state/gameState.js';
import { LEVELS }                     from '../data/levels.js';
import { CHAR_BY_ID, CHARACTERS }     from '../data/characters.js';
import { CLASS_BY_ID }                from '../data/classes.js';
import { EQUIP_BY_ID }               from '../data/equipment.js';
import { levelFromXp }                from '../data/leveling.js';
import { RARITY_COLORS }             from '../data/constants.js';
import { showScreen }                 from './navigation.js';

export let pendingLevelIdx = 0;
let pickerSlot = -1;
let equipSlotTarget = null; // { charId, slot: 'weapon'|'armor'|'acc1'|'acc2' }

export function goToTeamBuilder(levelIdx) {
  pendingLevelIdx = levelIdx;
  renderTeamBuilder();
  showScreen('team');
}

export function renderTeamBuilder() {
  document.getElementById('hud-gold').textContent = save.gold;
  const lvl = LEVELS[pendingLevelIdx];
  document.getElementById('team-level-title').textContent =
    `Level ${pendingLevelIdx + 1} — ${lvl.label}`;

  const preview = document.getElementById('team-enemy-preview');
  preview.innerHTML = lvl.enemies.map(e =>
    `<div class="enemy-chip">${e.emoji} ${e.name}</div>`
  ).join('');

  renderTeamSlots();
}

export function renderTeamSlots() {
  const slots = document.getElementById('team-slots');
  slots.innerHTML = '';

  save.team.forEach((charId, i) => {
    const char = charId ? CHAR_BY_ID[charId] : null;
    const cls  = char ? CLASS_BY_ID[char.classId] : null;
    const cData = charId ? save.charData[charId] : null;
    const level = cData ? levelFromXp(cData.xp || 0) : 0;

    const div = document.createElement('div');
    div.className = 'team-slot' + (char ? '' : ' empty');

    if (char) {
      const weapon = cData?.weapon ? EQUIP_BY_ID[cData.weapon] : null;
      const armor  = cData?.armor  ? EQUIP_BY_ID[cData.armor]  : null;
      div.innerHTML = `
        <div class="slot-emoji">${cls.emoji}</div>
        <div class="slot-name">${char.name}</div>
        <div class="slot-class">${cls.name} Lv.${level}</div>
        <div class="slot-equip-row">
          <span class="slot-equip" title="${weapon ? weapon.name : 'No weapon'}">${weapon ? '⚔️' : '➖'}</span>
          <span class="slot-equip" title="${armor ? armor.name : 'No armor'}">${armor ? '🛡' : '➖'}</span>
        </div>
        <div class="slot-remove" data-slot="${i}">✕</div>
      `;
      div.querySelector('.slot-remove').addEventListener('click', e => {
        e.stopPropagation();
        clearSlot(i);
      });
      div.addEventListener('click', () => openCharPicker(i));
    } else {
      div.innerHTML = `<div class="slot-plus">+</div><div class="slot-name">Empty</div>`;
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
    const level = cData ? levelFromXp(cData.xp || 0) : 1;

    const card = document.createElement('div');
    card.className = 'picker-card' + (used ? ' used' : '');
    card.innerHTML = `
      <div class="picker-emoji">${cls.emoji}</div>
      <div class="picker-name">${char.name}</div>
      <div class="picker-rarity">${cls.name} Lv.${level}</div>
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

  // Assemble player troops from class + equipment data
  const playerTeam = teamIds.map(id => assembleTroop(id));
  const lvl        = LEVELS[pendingLevelIdx];
  const enemyTeam  = lvl.enemies;

  showScreen('battle');
  requestAnimationFrame(() => {
    window.BATTLE.start(playerTeam, enemyTeam);
  });
}
