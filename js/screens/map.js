// ============================================================
//  GEMS OF COMBAT — Dungeon Map Screen
//  Renders the room grid for the active dungeon.
//  Players click available rooms to queue a battle.
// ============================================================
import { save, writeSave }               from '../state/save.js';
import { getActiveDef, getAvailableRooms, setPendingRoom }
  from '../state/dungeonState.js';
import { showScreen }                    from './navigation.js';
import { goToTeamBuilder }               from './teamBuilder.js';
import { renderDungeonSelect }           from './dungeonSelect.js';

// Room type display config
const ROOM_CFG = {
  start:    { icon: '⚑',  label: 'Entrance', cls: 'room-start'    },
  combat:   { icon: '⚔️', label: 'Combat',   cls: 'room-combat'   },
  elite:    { icon: '💀', label: 'Elite',    cls: 'room-elite'    },
  treasure: { icon: '💎', label: 'Loot',     cls: 'room-treasure' },
  boss:     { icon: '👑', label: 'Boss',     cls: 'room-boss'     },
};

export function renderDungeonMap() {
  const dg  = save.activeDungeon;
  if (!dg) { renderDungeonSelect(); return; }
  const def = getActiveDef();

  document.getElementById('dungeon-map-title').textContent = def?.name || 'Dungeon';
  document.getElementById('dungeon-map-subtitle').textContent =
    def ? `${def.icon}  ${'◆'.repeat(def.difficulty)}${'◇'.repeat(5 - def.difficulty)}` : '';
  document.getElementById('hud-gold').textContent = save.gold;

  const availableIds = new Set(getAvailableRooms());
  const canvas       = document.getElementById('dungeon-canvas');
  canvas.innerHTML   = '';

  // ── SVG connector layer ───────────────────────────────────
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg   = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'dungeon-svg');
  svg.setAttribute('viewBox', '0 0 5 4');
  svg.setAttribute('preserveAspectRatio', 'none');

  const drawnLines = new Set();
  for (const room of Object.values(dg.rooms)) {
    for (const cid of room.connections) {
      const key = [room.id, cid].sort().join('|');
      if (drawnLines.has(key)) continue;
      drawnLines.add(key);
      const other = dg.rooms[cid];
      if (!other) continue;
      const active = room.cleared || other.cleared;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', room.x + 0.5);
      line.setAttribute('y1', room.y + 0.5);
      line.setAttribute('x2', other.x + 0.5);
      line.setAttribute('y2', other.y + 0.5);
      line.setAttribute('class', 'dungeon-connector' + (active ? ' active' : ''));
      svg.appendChild(line);
    }
  }
  canvas.appendChild(svg);

  // ── Room nodes (CSS grid 5×4) ─────────────────────────────
  for (const room of Object.values(dg.rooms)) {
    const cfg       = ROOM_CFG[room.type] || ROOM_CFG.combat;
    const available = availableIds.has(room.id);
    const cleared   = room.cleared;

    const node = document.createElement('div');
    node.className = [
      'dungeon-room', cfg.cls,
      cleared   ? 'room-cleared'   : '',
      available ? 'room-available' : '',
      !cleared && !available ? 'room-locked' : '',
    ].filter(Boolean).join(' ');

    node.style.gridColumn = room.x + 1;
    node.style.gridRow    = room.y + 1;

    node.innerHTML = `
      <div class="room-icon">${cleared ? '✓' : cfg.icon}</div>
      <div class="room-label">${cleared ? 'Done' : cfg.label}</div>
      ${available && room.type !== 'treasure' ? `<div class="room-gold">💰${room.goldReward}g</div>` : ''}
      ${available && room.type === 'treasure' ? `<div class="room-gold">💎 Free loot!</div>` : ''}
    `;

    if (available) node.addEventListener('click', () => selectRoom(room.id));
    canvas.appendChild(node);
  }

  showScreen('map');
}

function selectRoom(roomId) {
  const dg   = save.activeDungeon;
  const room = dg?.rooms[roomId];
  if (!room) return;

  // Treasure rooms grant gold instantly — no battle
  if (room.type === 'treasure') {
    save.gold += room.goldReward;
    room.cleared = true;
    writeSave();
    renderDungeonMap();
    return;
  }

  setPendingRoom(roomId);
  goToTeamBuilder(roomId);
}
