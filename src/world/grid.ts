/**
 * Va chạm & tìm đường trên lưới ô (SPEC 13.2, 13.3).
 * Toạ độ thế giới tính bằng ô (số thực); ô (tx, ty) phủ [tx, tx+1) × [ty, ty+1).
 */
import { SOLID_TILES, type WorldMap, type WorldObject } from './map';

export const PLAYER_R = 0.3;

export class Grid {
  readonly w: number;
  readonly h: number;
  private solid: Uint8Array;

  /** active: lọc đồ vật đang có mặt (VD vật trang trí chưa mở khóa thì không chắn đường). */
  constructor(map: WorldMap, active: (o: WorldObject) => boolean = () => true) {
    this.w = map.w;
    this.h = map.h;
    this.solid = new Uint8Array(map.w * map.h);
    for (let y = 0; y < map.h; y++)
      for (let x = 0; x < map.w; x++) if (SOLID_TILES.has(map.tiles[y][x])) this.solid[y * map.w + x] = 1;
    for (const o of map.objects) {
      if (!o.solid || !active(o)) continue;
      for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) this.solid[y * map.w + x] = 1;
    }
  }

  isSolid(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return true;
    return this.solid[ty * this.w + tx] === 1;
  }

  /** Hộp vuông nửa cạnh r tại (x, y) có chạm ô cứng nào không. */
  boxHits(x: number, y: number, r = PLAYER_R): boolean {
    const x0 = Math.floor(x - r), x1 = Math.floor(x + r - 1e-6);
    const y0 = Math.floor(y - r), y1 = Math.floor(y + r - 1e-6);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.isSolid(tx, ty)) return true;
    return false;
  }

  /**
   * Di chuyển có va chạm, tách trục X rồi Y (trượt dọc tường).
   * Bước nhỏ để không bao giờ "nhảy" qua tường dù tốc độ lớn.
   */
  move(pos: { x: number; y: number }, dx: number, dy: number, r = PLAYER_R): { blockedX: boolean; blockedY: boolean } {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.1));
    const sx = dx / steps, sy = dy / steps;
    let blockedX = false, blockedY = false;
    for (let i = 0; i < steps; i++) {
      if (!blockedX && sx !== 0) {
        if (this.boxHits(pos.x + sx, pos.y, r)) blockedX = true;
        else pos.x += sx;
      }
      if (!blockedY && sy !== 0) {
        if (this.boxHits(pos.x, pos.y + sy, r)) blockedY = true;
        else pos.y += sy;
      }
    }
    return { blockedX, blockedY };
  }

  private static DIRS = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
  ] as const;

  /**
   * Đường đi ngắn nhất (Dijkstra/A* không heuristic, lưới nhỏ) từ ô start tới ô gần nhất trong `goals`.
   * 8 hướng, không cắt góc tường. Trả về danh sách ô (không gồm ô xuất phát), hoặc null.
   */
  findPath(start: { x: number; y: number }, goals: { x: number; y: number }[]): { x: number; y: number }[] | null {
    const W = this.w, N = W * this.h;
    const goalSet = new Set(goals.filter((g) => !this.isSolid(g.x, g.y)).map((g) => g.y * W + g.x));
    if (goalSet.size === 0) return null;
    const s = start.y * W + start.x;
    if (goalSet.has(s)) return [];
    const dist = new Float64Array(N).fill(Infinity);
    const prev = new Int32Array(N).fill(-1);
    const done = new Uint8Array(N);
    dist[s] = 0;
    // Hàng đợi ưu tiên đơn giản (lưới ≤ 1500 ô)
    const heap: number[] = [s];
    const push = (i: number) => {
      heap.push(i);
      let c = heap.length - 1;
      while (c > 0) {
        const p = (c - 1) >> 1;
        if (dist[heap[p]] <= dist[heap[c]]) break;
        [heap[p], heap[c]] = [heap[c], heap[p]];
        c = p;
      }
    };
    const pop = (): number => {
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length > 0) {
        heap[0] = last;
        let c = 0;
        for (;;) {
          const l = 2 * c + 1, r = l + 1;
          let m = c;
          if (l < heap.length && dist[heap[l]] < dist[heap[m]]) m = l;
          if (r < heap.length && dist[heap[r]] < dist[heap[m]]) m = r;
          if (m === c) break;
          [heap[m], heap[c]] = [heap[c], heap[m]];
          c = m;
        }
      }
      return top;
    };
    while (heap.length) {
      const cur = pop();
      if (done[cur]) continue;
      done[cur] = 1;
      if (goalSet.has(cur)) {
        const path: { x: number; y: number }[] = [];
        for (let i = cur; i !== s; i = prev[i]) path.push({ x: i % W, y: Math.floor(i / W) });
        return path.reverse();
      }
      const cx = cur % W, cy = Math.floor(cur / W);
      for (const [ddx, ddy, cost] of Grid.DIRS) {
        const nx = cx + ddx, ny = cy + ddy;
        if (this.isSolid(nx, ny)) continue;
        if (ddx !== 0 && ddy !== 0 && (this.isSolid(cx + ddx, cy) || this.isSolid(cx, cy + ddy))) continue; // không cắt góc
        const ni = ny * W + nx;
        const nd = dist[cur] + cost;
        if (nd < dist[ni]) {
          dist[ni] = nd;
          prev[ni] = cur;
          push(ni);
        }
      }
    }
    return null;
  }

  /** Các ô đứng được kề vùng tương tác của đồ vật (dùng để đi tới đồ vật). */
  standTiles(o: WorldObject): { x: number; y: number }[] {
    const r = o.hit ?? o;
    const out: { x: number; y: number }[] = [];
    if (!o.solid && !o.hit) {
      // đồ vật nằm sát đất (luống rau): đứng ngay trên nó
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (!this.isSolid(x, y)) out.push({ x, y });
      if (out.length) return out;
    }
    for (let y = r.y - 1; y <= r.y + r.h; y++)
      for (let x = r.x - 1; x <= r.x + r.w; x++) {
        const inside = x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
        if (inside) continue;
        const diag = (x === r.x - 1 || x === r.x + r.w) && (y === r.y - 1 || y === r.y + r.h);
        if (diag) continue; // chỉ 4 phía, không góc chéo
        if (o.hit && y !== r.y + r.h) continue; // cửa hàng: chỉ đứng ngay trước cửa
        if (!this.isSolid(x, y)) out.push({ x, y });
      }
    return out;
  }
}

/** Khoảng cách từ điểm tới hình chữ nhật (ô). */
export function distToRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }): number {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy);
}

export const INTERACT_DIST = 0.85;

/** Đồ vật tương tác gần nhất trong tầm với. */
export function nearestInteractable(objects: WorldObject[], px: number, py: number): WorldObject | undefined {
  let best: WorldObject | undefined;
  let bestD = Infinity;
  for (const o of objects) {
    const d = distToRect(px, py, o.hit ?? o);
    if (d <= INTERACT_DIST && d < bestD) {
      best = o;
      bestD = d;
    }
  }
  return best;
}
