/**
 * TRANG TRÍ NHÀ (SPEC 21.3) — logic thuần (có test):
 * đồ đã đặt → đối tượng bản đồ; ô nào đặt được (sàn trong nhà, không trùng, không phải cửa,
 * KHÔNG chặn đường tới cửa / đồ vật trong nhà; tranh chỉ treo tường phía trên sàn).
 */
import { type FurnitureDef, FURNITURE_BY_ID } from '../content/items';
import { Grid } from './grid';
import type { TileChar, WorldMap, WorldObject, ZoneId } from './map';
import type { PlacedFurniture } from './save';

/** Sàn trong nhà: phòng khách, phòng ngủ, bếp, góc làm bánh, phòng tắm. */
export const HOUSE_FLOOR: ReadonlySet<TileChar> = new Set(['L', 'B', 'K', 'C', 'W']);
export const HOUSE_ZONES: ReadonlySet<ZoneId> = new Set(['living', 'bedroom', 'bathroom', 'kitchen', 'baking']);

/** Đồ đã đặt → đối tượng bản đồ (vẽ bằng hình thư viện theo `word`, có va chạm trừ thảm). */
export function furnitureObject(p: PlacedFurniture): WorldObject {
  const d = FURNITURE_BY_ID.get(p.id)!;
  return {
    id: `pf-${p.uid}`, kind: 'furniture', x: p.x, y: p.y, w: d.w, h: d.h, solid: !d.flat,
    word: d.word, emoji: d.emoji, action: 'placed', zone: 'living', wall: d.wall, flat: d.flat, uid: p.uid,
  };
}

const tileAt = (m: WorldMap, x: number, y: number): TileChar | undefined => m.tiles[y]?.[x];
const covers = (o: WorldObject, x: number, y: number) => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;

/** Ô (x, y) thuộc trong nhà (để biết bé có đang ở trong nhà không). */
export function inHouse(m: WorldMap, x: number, y: number): boolean {
  const t = tileAt(m, Math.floor(x), Math.floor(y));
  return !!t && (HOUSE_FLOOR.has(t) || t === 'D');
}

/**
 * Kiểm tra đặt `def` với góc trên-trái (x, y).
 * objects = mọi đồ vật đang có trên bản đồ (đã gồm đồ đặt trước, TRỪ món đang được di chuyển).
 * blocked = ô bé đang đứng (không đặt đè lên bé).
 */
export function canPlace(m: WorldMap, objects: readonly WorldObject[], def: FurnitureDef, x: number, y: number, blocked?: { x: number; y: number }): boolean {
  if (def.wall) {
    // tranh: trên ô tường mà ngay PHÍA DƯỚI là sàn trong nhà; không trùng đồ treo khác
    if (tileAt(m, x, y) !== '#') return false;
    const below = tileAt(m, x, y + 1);
    if (!below || !HOUSE_FLOOR.has(below)) return false;
    return !objects.some((o) => covers(o, x, y));
  }
  for (let dy = 0; dy < def.h; dy++) for (let dx = 0; dx < def.w; dx++) {
    const tx = x + dx, ty = y + dy;
    const t = tileAt(m, tx, ty);
    if (!t || !HOUSE_FLOOR.has(t)) return false; // chỉ sàn trong nhà (không cửa, không tường)
    if (objects.some((o) => !o.wall && covers(o, tx, ty))) return false;
    if (blocked && Math.floor(blocked.x) === tx && Math.floor(blocked.y) === ty) return false;
  }
  if (def.flat) return true; // thảm: đi lên được, không chặn đường
  return keepsPaths(m, objects, { kind: 'furniture', id: '__candidate', x, y, w: def.w, h: def.h, solid: true, word: '', emoji: '', action: '', zone: 'living' });
}

/** Sau khi đặt `cand`, mọi cửa trong nhà và mọi đồ vật trong nhà vẫn đi tới được từ cửa chính. */
export function keepsPaths(m: WorldMap, objects: readonly WorldObject[], cand: WorldObject): boolean {
  const all = [...objects, cand];
  const grid = new Grid({ ...m, objects: all });
  // cửa chính: ô 'D' ở tường ngoài phía dưới (hàng thấp nhất có cửa)
  const doors: { x: number; y: number }[] = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'D') doors.push({ x, y });
  if (!doors.length) return true;
  const start = doors.reduce((a, b) => (b.y > a.y ? b : a));
  const seen = new Uint8Array(m.w * m.h);
  const q = [start];
  seen[start.y * m.w + start.x] = 1;
  while (q.length) {
    const c = q.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
      const t = m.tiles[ny][nx];
      if (!HOUSE_FLOOR.has(t) && t !== 'D') continue; // chỉ đi trong nhà
      if (seen[ny * m.w + nx] || grid.isSolid(nx, ny)) continue;
      seen[ny * m.w + nx] = 1;
      q.push({ x: nx, y: ny });
    }
  }
  const reached = (x: number, y: number) => seen[y * m.w + x] === 1;
  if (!doors.every((d) => reached(d.x, d.y))) return false;
  // mọi đồ vật trong nhà (trừ đồ treo tường) phải còn ít nhất một ô đứng cạnh đi tới được
  for (const o of all) {
    if (o.wall) continue;
    const insideHouse = HOUSE_FLOOR.has(tileAt(m, o.x, o.y) ?? '.');
    if (!insideHouse) continue;
    const stands = grid.standTiles(o).filter((t) => HOUSE_FLOOR.has(tileAt(m, t.x, t.y) ?? '.') || tileAt(m, t.x, t.y) === 'D');
    if (!stands.some((t) => reached(t.x, t.y))) return false;
  }
  return true;
}

/** Mọi góc đặt hợp lệ trong nhà (để tô sáng ô chọn được). */
export function validSpots(m: WorldMap, objects: readonly WorldObject[], def: FurnitureDef, blocked?: { x: number; y: number }): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = m.tiles[y][x];
    if (def.wall ? t !== '#' : !HOUSE_FLOOR.has(t)) continue;
    if (canPlace(m, objects, def, x, y, blocked)) out.push({ x, y });
  }
  return out;
}
