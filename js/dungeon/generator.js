// ============================================================
//  GEMS OF COMBAT — Dungeon Generator
//  Builds a randomized 5×4 room grid for a dungeon run.
//  Start room is pre-cleared (the entrance). Boss is in row 0.
// ============================================================
import { DUNGEON_BY_ID, ROOM_TYPE_LABELS } from '../data/dungeons.js';

// ── Layout constants ──────────────────────────────────────────
const COLS = 5;
const ROWS = 4;

// ── Grid generation ───────────────────────────────────────────
export function generateDungeon(dungeonId) {
  const rooms = [];
  const grid  = new Map(); // 'x,y' → roomId
  let nextId  = 0;

  function placeRoom(x, y, type) {
    const id = `r${nextId++}`;
    rooms.push({ id, type, x, y, cleared: false, connections: [] });
    grid.set(`${x},${y}`, id);
    return id;
  }

  // Start room — always bottom-centre, mark cleared immediately (entrance)
  placeRoom(2, 3, 'start');
  rooms[0].cleared = true;

  // Boss position: top row, not a corner
  const bossX = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3

  // Random walk from (2,3) toward (bossX, 0)
  let cx = 2, cy = 3;
  while (!(cx === bossX && cy === 0)) {
    // Build weighted move options
    const opts = [];
    if (cy > 0)       opts.push({ nx: cx,   ny: cy-1, w: 4 }); // up (strongly preferred)
    if (cx < COLS-1)  opts.push({ nx: cx+1, ny: cy,   w: bossX > cx ? 2 : 1 }); // right
    if (cx > 0)       opts.push({ nx: cx-1, ny: cy,   w: bossX < cx ? 2 : 1 }); // left

    const valid = opts.filter(o => !grid.has(`${o.nx},${o.ny}`)
      && o.nx >= 0 && o.nx < COLS && o.ny >= 0 && o.ny < ROWS);

    if (!valid.length) break; // trapped — will ensure boss after loop

    const total   = valid.reduce((s, o) => s + o.w, 0);
    let   r       = Math.random() * total;
    let   chosen  = valid[valid.length - 1];
    for (const o of valid) { r -= o.w; if (r <= 0) { chosen = o; break; } }

    cx = chosen.nx;
    cy = chosen.ny;

    const isLast   = cx === bossX && cy === 0;
    const pathLen  = rooms.length;
    const type     = isLast ? 'boss'
                   : pathLen % 3 === 0 ? 'elite'
                   : 'combat';
    placeRoom(cx, cy, type);
  }

  // Guarantee a boss room exists — if the random walk got trapped before
  // reaching (bossX, 0), force-place the boss on an available top-row cell.
  const hasBoss = rooms.some(rm => rm.type === 'boss');
  if (!hasBoss) {
    // Prefer the intended bossX, then try other interior top-row cells
    const topCandidates = [bossX, 1, 2, 3].filter((v, i, a) => a.indexOf(v) === i);
    let placed = false;
    for (const tx of topCandidates) {
      if (!grid.has(`${tx},0`)) {
        placeRoom(tx, 0, 'boss');
        placed = true;
        break;
      }
    }
    // If all top-row interior cells are taken, convert the last non-start room to boss
    if (!placed) {
      const convertible = rooms.filter(rm => rm.type !== 'start' && rm.type !== 'boss');
      if (convertible.length) {
        convertible[convertible.length - 1].type = 'boss';
      }
    }
  }

  // Add 2–3 branch rooms off the main path
  const mainPathSnap  = [...rooms];
  const branchCount   = 2 + Math.floor(Math.random() * 2);
  let   treasureAdded = false;

  for (let b = 0; b < branchCount; b++) {
    const eligible = mainPathSnap.filter(r => r.type !== 'start' && r.type !== 'boss');
    if (!eligible.length) break;

    const parent   = eligible[Math.floor(Math.random() * eligible.length)];
    const adjacent = [[-1,0],[1,0],[0,-1],[0,1]]
      .map(([dx,dy]) => [parent.x+dx, parent.y+dy])
      .filter(([nx,ny]) =>
        nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !grid.has(`${nx},${ny}`));

    if (!adjacent.length) continue;

    const [nx, ny] = adjacent[Math.floor(Math.random() * adjacent.length)];
    const type = (!treasureAdded && Math.random() > 0.35) ? 'treasure' : 'elite';
    if (type === 'treasure') treasureAdded = true;
    placeRoom(nx, ny, type);
  }

  // Build bidirectional connections between grid-adjacent rooms
  for (const room of rooms) {
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const neighborId = grid.get(`${room.x+dx},${room.y+dy}`);
      if (neighborId && !room.connections.includes(neighborId)) {
        room.connections.push(neighborId);
      }
    }
  }

  return { dungeonId, rooms, startRoomId: rooms[0].id };
}

// ── Battle content for a room ─────────────────────────────────
function sampleN(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function getRoomBattleData(dungeonId, roomType) {
  const def = DUNGEON_BY_ID[dungeonId];
  const { enemyPool, difficulty, completionReward } = def;

  let enemies, gold;

  if (roomType === 'boss') {
    enemies = sampleN(enemyPool.boss, enemyPool.boss.length);
    gold    = difficulty * 150;
  } else if (roomType === 'elite') {
    const count = difficulty >= 3 ? 3 : 2;
    enemies = sampleN(enemyPool.elite, Math.min(count, enemyPool.elite.length));
    gold    = difficulty * 70;
  } else {
    // combat
    const max   = difficulty <= 2 ? 2 : 3;
    const count = 1 + Math.floor(Math.random() * max);
    enemies = sampleN(enemyPool.combat, Math.min(count, enemyPool.combat.length));
    gold    = difficulty * 40;
  }

  return {
    enemies:    enemies.map(e => ({ ...e, life: e.maxLife, mana: 0 })),
    gold,
    difficulty,
    label:      ROOM_TYPE_LABELS[roomType] || roomType,
    packReward: roomType === 'boss' ? completionReward : null,
  };
}
