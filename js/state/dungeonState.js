// ============================================================
//  GEMS OF COMBAT — Dungeon State
//  Generates random dungeon room layouts and manages run state.
//  Layout lives in save.activeDungeon; enemies generated on demand.
// ============================================================
import { DUNGEON_BY_ID }   from '../data/dungeons.js';
import { save, writeSave } from './save.js';

// ── Grid layout ───────────────────────────────────────────────
// 5 cols (x: 0-4), 4 rows (y: 0-3)  y=3 = bottom (entrance), y=0 = top (boss)
// Start always (2,3), Boss always (2,0).
// Center path: (2,2) and (2,1) are always placed.
// Branch candidates in priority order (closer to center first):

const BRANCH_CANDIDATES = [
  // Sides of center path — priority 1
  {x:1,y:2}, {x:3,y:2},
  {x:1,y:1}, {x:3,y:1},
  // Near start
  {x:1,y:3}, {x:3,y:3},
  // Near boss
  {x:1,y:0}, {x:3,y:0},
  // Far sides
  {x:0,y:2}, {x:4,y:2},
  {x:0,y:1}, {x:4,y:1},
];

function roomId(x, y) { return `r_${x}_${y}`; }

function adjacentKey(x,y) {
  return [{x:x-1,y},{x:x+1,y},{x,y:y-1},{x,y:y+1}];
}

// Seeded pseudo-random (simple LCG)
function makeRng(seed) {
  let s = seed >>> 0;
  return function() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Shuffle array in place using rng
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Pick `n` random items
function pick(arr, n, rng) {
  return shuffle([...arr], rng).slice(0, n);
}

// ── Generate a dungeon layout ─────────────────────────────────
export function generateDungeon(dungeonId) {
  const def = DUNGEON_BY_ID[dungeonId];
  if (!def) return null;

  const seed = Math.floor(Math.random() * 2147483647);
  const rng  = makeRng(seed);

  // Always-present cells
  const cells = [
    {x:2, y:3, type:'start'},
    {x:2, y:2, type:'combat'},
    {x:2, y:1, type:'combat'},
    {x:2, y:0, type:'boss'},
  ];

  // Add branch rooms up to roomCount total (start + boss not counted)
  const branchCount = Math.max(0, def.roomCount - 2); // 2 center rooms already placed
  const chosen = pick(BRANCH_CANDIDATES, branchCount, rng);
  for (const c of chosen) cells.push({x:c.x, y:c.y, type:'tbd'});

  // Build lookup
  const placed = new Map(cells.map(c => [`${c.x},${c.y}`, c]));

  // Build connections (orthogonal neighbors that are placed)
  const rooms = {};
  for (const c of cells) {
    const id = roomId(c.x, c.y);
    const connections = adjacentKey(c.x, c.y)
      .filter(n => placed.has(`${n.x},${n.y}`))
      .map(n => roomId(n.x, n.y));

    rooms[id] = {
      id, x: c.x, y: c.y,
      type: c.type === 'tbd' ? assignType(id, connections, rng) : c.type,
      connections,
      cleared: c.type === 'start',
      goldReward: c.type === 'boss' ? def.bossGold
                : c.type === 'start' ? 0
                : 0, // set per-type below
    };
  }

  // Set gold rewards by final type
  for (const r of Object.values(rooms)) {
    if (r.type === 'combat')   r.goldReward = def.goldPerRoom;
    if (r.type === 'elite')    r.goldReward = def.eliteGold;
    if (r.type === 'treasure') r.goldReward = Math.floor(def.goldPerRoom * 1.5);
    if (r.type === 'boss')     r.goldReward = def.bossGold;
  }

  save.activeDungeon = {
    dungeonId,
    seed,
    rooms,
    startRoomId: roomId(2, 3),
    bossRoomId:  roomId(2, 0),
    pendingRoomId: null,   // room the player is about to fight
  };
  writeSave();
  return save.activeDungeon;
}

function assignType(id, connections, rng) {
  const isDeadEnd = connections.length === 1;
  const roll = rng();
  if (isDeadEnd) {
    // dead ends lean treasure or elite
    if (roll < 0.35) return 'treasure';
    if (roll < 0.70) return 'elite';
    return 'combat';
  }
  if (roll < 0.60) return 'combat';
  if (roll < 0.85) return 'elite';
  return 'treasure';
}

// ── Runtime helpers ───────────────────────────────────────────

/** All rooms reachable from cleared rooms (not yet cleared). */
export function getAvailableRooms() {
  const dg = save.activeDungeon;
  if (!dg) return [];
  const available = [];
  for (const room of Object.values(dg.rooms)) {
    if (room.cleared) continue;
    const neighborCleared = room.connections.some(cid => dg.rooms[cid]?.cleared);
    if (neighborCleared) available.push(room.id);
  }
  return available;
}

/** Mark a room as the pending battle target. */
export function setPendingRoom(roomId) {
  if (!save.activeDungeon) return;
  save.activeDungeon.pendingRoomId = roomId;
}

/** Get the room currently queued for battle. */
export function getPendingRoom() {
  const dg = save.activeDungeon;
  if (!dg || !dg.pendingRoomId) return null;
  return dg.rooms[dg.pendingRoomId] || null;
}

/** Mark the pending room cleared; returns true if it was the boss. */
export function clearPendingRoom() {
  const dg = save.activeDungeon;
  if (!dg || !dg.pendingRoomId) return false;
  const room = dg.rooms[dg.pendingRoomId];
  if (room) room.cleared = true;
  const wasBoss = dg.pendingRoomId === dg.bossRoomId;
  dg.pendingRoomId = null;
  writeSave();
  return wasBoss;
}

/** Build enemy array for a given room on demand (functions not serialized). */
export function getRoomEnemies(room) {
  const def = DUNGEON_BY_ID[save.activeDungeon?.dungeonId];
  if (!def) return [];
  if (room.type === 'boss')    return [...def.bossEnemies];
  if (room.type === 'elite')   return pick2(def.eliteEnemies, 2);
  if (room.type === 'treasure') return []; // no fight
  // combat: 2-3 enemies scaled to dungeon progress
  const pool = def.combatEnemies;
  const count = Math.random() < 0.4 ? 3 : 2;
  return pick2(pool, count);
}

function pick2(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/** Get the dungeon definition for the active dungeon. */
export function getActiveDef() {
  return save.activeDungeon ? DUNGEON_BY_ID[save.activeDungeon.dungeonId] : null;
}

/** Abandon the current dungeon run. */
export function abandonDungeon() {
  save.activeDungeon = null;
  writeSave();
}
