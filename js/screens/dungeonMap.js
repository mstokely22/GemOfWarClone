// ============================================================
//  GEMS OF COMBAT — Dungeon Map Screen
//  Shows the procedural 5×4 grid of dungeon rooms.
//  Cleared = dimmed. Available (adjacent to cleared) = glowing.
//  Treasure rooms show a chest-reveal mini-screen.
// ============================================================
import { save, writeSave }          from '../state/save.js';
import { DUNGEON_BY_ID,
         ROOM_TYPE_ICONS,
         ROOM_TYPE_LABELS }         from '../data/dungeons.js';
import { getRoomBattleData }        from '../dungeon/generator.js';
import { ALL_EQUIPMENT }            from '../data/equipment.js';
import { MATERIAL_IDS, MATERIALS }  from '../data/materials.js';
import { CHARACTERS }               from '../data/characters.js';
import { showScreen }               from './navigation.js';
import { renderHome }               from './home.js';
import { renderDungeonSelect }      from './dungeonSelect.js';

export function renderDungeonMap() {
  const run = save.activeDungeon;
  if (!run) { renderHome(); return; }

  const def = DUNGEON_BY_ID[run.dungeonId];
  document.getElementById('hud-gold').textContent  = save.gold;
  document.getElementById('dmap-title').textContent = def.name;
  document.getElementById('dmap-icon').textContent  = def.icon;

  // Build available-room set (adjacent to any cleared room, not yet cleared)
  const clearedIds   = new Set(run.rooms.filter(r => r.cleared).map(r => r.id));
  const availableIds = new Set();
  for (const room of run.rooms) {
    if (!room.cleared && room.connections.some(cid => clearedIds.has(cid))) {
      availableIds.add(room.id);
    }
  }

  const grid = document.getElementById('dmap-grid');
  grid.innerHTML = '';

  for (const room of run.rooms) {
    const state = room.cleared      ? 'cleared'
                : availableIds.has(room.id) ? 'available'
                : 'locked';

    const node = document.createElement('div');
    node.className = `droom droom-${room.type} droom-${state}`;
    node.style.gridColumn = room.x + 1;
    node.style.gridRow    = room.y + 1;

    // Determine which sides have connections (for door indicators)
    const doors = { n: false, s: false, e: false, w: false };
    for (const cid of room.connections) {
      const nbr = run.rooms.find(r => r.id === cid);
      if (!nbr) continue;
      const dx = nbr.x - room.x, dy = nbr.y - room.y;
      if (dy === -1) doors.n = true;
      if (dy ===  1) doors.s = true;
      if (dx ===  1) doors.e = true;
      if (dx === -1) doors.w = true;
    }

    const icon  = room.cleared && room.type !== 'start'
      ? '✓'
      : ROOM_TYPE_ICONS[room.type];
    const label = room.cleared
      ? (room.type === 'start' ? 'Entrance' : '')
      : ROOM_TYPE_LABELS[room.type];

    node.innerHTML = `
      ${doors.n ? '<div class="droom-door droom-door-n">▲</div>' : ''}
      ${doors.s ? '<div class="droom-door droom-door-s">▼</div>' : ''}
      ${doors.e ? '<div class="droom-door droom-door-e">▶</div>' : ''}
      ${doors.w ? '<div class="droom-door droom-door-w">◀</div>' : ''}
      <div class="droom-icon">${icon}</div>
      <div class="droom-label">${label}</div>
    `;

    if (state === 'available') {
      node.addEventListener('click', () => enterRoom(room.id));
    }
    grid.appendChild(node);
  }

  // Hide flash message
  const flash = document.getElementById('dmap-flash');
  if (flash) flash.classList.add('hidden');

  showScreen('dungeon-map');
}

function enterRoom(roomId) {
  const run  = save.activeDungeon;
  const room = run.rooms.find(r => r.id === roomId);
  if (!room || room.cleared) return;

  if (room.type === 'treasure') {
    room.cleared = true;
    writeSave();
    openTreasureReveal(run.dungeonId);
    return;
  }

  // Combat / elite / boss → build battle data and go to team builder
  const battleData = getRoomBattleData(run.dungeonId, room.type);
  run.pendingRoomId  = roomId;
  run.pendingBattle  = battleData;
  writeSave();

  import('./teamBuilder.js').then(m => m.goToTeamBuilder());
}

// ── Treasure Reveal ───────────────────────────────────────────

function rollTreasureChests(difficulty) {
  // 1-3 chests, higher difficulty increases chance of 3
  const roll = Math.random();
  const count = roll < 0.25 ? 1 : roll < (0.70 - difficulty * 0.04) ? 2 : 3;

  const chests = [];
  for (let i = 0; i < count; i++) {
    chests.push(rollChestReward(difficulty, i === 0));
  }
  return chests;
}

function rollChestReward(difficulty, guaranteeGold) {
  // First chest always has gold. Others roll from the reward table.
  if (guaranteeGold) {
    const gold = 30 * difficulty + Math.floor(Math.random() * 25 * difficulty);
    return { type: 'gold', amount: gold, icon: '💰', label: `${gold} Gold` };
  }

  const roll = Math.random();

  // 35% gold
  if (roll < 0.35) {
    const gold = 20 * difficulty + Math.floor(Math.random() * 20 * difficulty);
    return { type: 'gold', amount: gold, icon: '💰', label: `${gold} Gold` };
  }
  // 20% treasure map
  if (roll < 0.55) {
    return { type: 'map', amount: 1, icon: '🗺️', label: 'Treasure Map' };
  }
  // 25% materials
  if (roll < 0.80) {
    const baseMats = ['metal_scrap', 'wood_scrap', 'leather_scrap'];
    const rareMats = ['enchanted_metal', 'enchanted_wood', 'enchanted_leather'];
    const useRare  = difficulty >= 3 && Math.random() < 0.3;
    const pool     = useRare ? rareMats : baseMats;
    const matId    = pool[Math.floor(Math.random() * pool.length)];
    const qty      = 1 + Math.floor(Math.random() * difficulty);
    const mat      = MATERIALS[matId];
    return { type: 'material', matId, amount: qty, icon: mat.emoji, label: `${qty}× ${mat.name}` };
  }
  // 12% equipment
  if (roll < 0.92) {
    const item = ALL_EQUIPMENT[Math.floor(Math.random() * ALL_EQUIPMENT.length)];
    return { type: 'equipment', itemId: item.id, amount: 1, icon: item.icon || '📦', label: item.name };
  }
  // 8% hero shards
  const hero = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  return { type: 'shards', charId: hero.charId, amount: 1, icon: '💎', label: `${hero.name} Shard` };
}

function applyChestReward(reward) {
  switch (reward.type) {
    case 'gold':
      save.gold += reward.amount;
      break;
    case 'map':
      save.treasureMaps = (save.treasureMaps ?? 0) + reward.amount;
      break;
    case 'material':
      if (!save.materials) save.materials = {};
      save.materials[reward.matId] = (save.materials[reward.matId] ?? 0) + reward.amount;
      break;
    case 'equipment':
      save.inventory.push(reward.itemId);
      break;
    case 'shards':
      save.heroDraws = (save.heroDraws || 0) + reward.amount;
      break;
  }
}

function openTreasureReveal(dungeonId) {
  const def      = DUNGEON_BY_ID[dungeonId];
  const chests   = rollTreasureChests(def.difficulty);
  let   revealed = 0;

  const overlay = document.getElementById('treasure-reveal-overlay');
  const box     = document.getElementById('tr-chests');
  const summary = document.getElementById('tr-summary');
  const doneBtn = document.getElementById('tr-done-btn');

  overlay.classList.remove('hidden');
  summary.classList.add('hidden');
  doneBtn.classList.add('hidden');
  box.innerHTML = '';

  chests.forEach((reward, i) => {
    const chest = document.createElement('div');
    chest.className = 'tr-chest';
    chest.innerHTML = `
      <div class="tr-chest-closed">🎁</div>
      <div class="tr-chest-open hidden">
        <div class="tr-reward-icon">${reward.icon}</div>
        <div class="tr-reward-label">${reward.label}</div>
      </div>
    `;
    // Stagger entrance animation
    chest.style.animationDelay = `${i * 0.15}s`;

    chest.addEventListener('click', () => {
      if (chest.classList.contains('tr-opened')) return;
      chest.classList.add('tr-opened');
      chest.querySelector('.tr-chest-closed').classList.add('hidden');
      chest.querySelector('.tr-chest-open').classList.remove('hidden');

      applyChestReward(reward);
      revealed++;

      if (revealed === chests.length) {
        writeSave();
        // Show summary + continue button
        const lines = chests.map(r => `<div class="tr-summary-row">${r.icon} ${r.label}</div>`);
        summary.innerHTML = `<div class="tr-summary-title">Loot Collected</div>${lines.join('')}`;
        summary.classList.remove('hidden');
        doneBtn.classList.remove('hidden');
      }
    }, { once: true });

    box.appendChild(chest);
  });

  // Wire done button
  doneBtn.onclick = () => {
    overlay.classList.add('hidden');
    renderDungeonMap();
  };
}
