// ============================================================
//  GEMS OF COMBAT — Dungeon Map Screen
//  Shows the procedural 5×4 grid of dungeon rooms.
//  Cleared = dimmed. Available (adjacent to cleared) = glowing.
//  Treasure rooms award loot instantly. Others go to TeamBuilder.
// ============================================================
import { save, writeSave }          from '../state/save.js';
import { DUNGEON_BY_ID,
         ROOM_TYPE_ICONS,
         ROOM_TYPE_LABELS }         from '../data/dungeons.js';
import { getRoomBattleData }        from '../dungeon/generator.js';
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
    // No battle — instant gold reward
    const def  = DUNGEON_BY_ID[run.dungeonId];
    const gold = def.difficulty * 55 + Math.floor(Math.random() * def.difficulty * 20);
    save.gold += gold;
    room.cleared = true;
    writeSave();
    showTreasureFlash(gold);
    return;
  }

  // Combat / elite / boss → build battle data and go to team builder
  const battleData = getRoomBattleData(run.dungeonId, room.type);
  run.pendingRoomId  = roomId;
  run.pendingBattle  = battleData;
  writeSave();

  import('./teamBuilder.js').then(m => m.goToTeamBuilder());
}

function showTreasureFlash(gold) {
  const flash = document.getElementById('dmap-flash');
  if (!flash) { renderDungeonMap(); return; }
  flash.textContent = `💎 Found ${gold} gold!`;
  flash.classList.remove('hidden');
  setTimeout(() => { flash.classList.add('hidden'); renderDungeonMap(); }, 1600);
}
