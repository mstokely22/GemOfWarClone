// ============================================================
//  GEMS OF COMBAT — Match Detection + Valid Move Finder
// ============================================================
import { BOARD_SIZE } from '../data/constants.js';

// Find all matched gem coordinates on the given board.
// Returns a Set of "r,c" coordinate string keys.
export function findAllMatches(board) {
  const matched = new Set();

  // Horizontal runs
  for (let r = 0; r < BOARD_SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= BOARD_SIZE; c++) {
      const same = c < BOARD_SIZE && board[r][c] && board[r][c-1] &&
                   board[r][c].type === board[r][c-1].type;
      if (same) { run++; }
      else {
        if (run >= 3) for (let k = c - run; k < c; k++) matched.add(`${r},${k}`);
        run = 1;
      }
    }
  }

  // Vertical runs
  for (let c = 0; c < BOARD_SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= BOARD_SIZE; r++) {
      const same = r < BOARD_SIZE && board[r][c] && board[r-1][c] &&
                   board[r][c].type === board[r-1][c].type;
      if (same) { run++; }
      else {
        if (run >= 3) for (let k = r - run; k < r; k++) matched.add(`${k},${c}`);
        run = 1;
      }
    }
  }

  return matched;
}

// BFS flood-fill on the matched cells to find the size of the
// largest connected group of same-color matched gems.
export function largestMatchGroup(board, matched) {
  if (!matched.size) return 0;
  const visited = new Set();
  let largest = 0;

  for (const key of matched) {
    if (visited.has(key)) continue;
    const [r, c] = key.split(',').map(Number);
    const color  = board[r][c] ? board[r][c].type : null;
    const queue  = [key];
    visited.add(key);
    let count = 0;

    while (queue.length) {
      const cur = queue.shift();
      count++;
      const [cr, cc] = cur.split(',').map(Number);
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = cr + dr, nc = cc + dc;
        const nk = `${nr},${nc}`;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE &&
            matched.has(nk) && !visited.has(nk) &&
            board[nr][nc] && board[nr][nc].type === color) {
          visited.add(nk);
          queue.push(nk);
        }
      }
    }
    if (count > largest) largest = count;
  }

  return largest;
}

// Brute-force all valid swaps on the board.
// Returns array of { r, c, nr, nc }.
export function findValidMoves(board) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of [[0,1],[1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= BOARD_SIZE || nc >= BOARD_SIZE) continue;
        const b = board.map(row => [...row]);
        [b[r][c], b[nr][nc]] = [b[nr][nc], b[r][c]];
        if (findAllMatches(b).size > 0) moves.push({ r, c, nr, nc });
      }
    }
  }
  return moves;
}
