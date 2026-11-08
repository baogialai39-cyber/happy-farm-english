/**
 * Bản đồ HAPPY ZOO (SPEC 19.2) — bản đồ riêng 40 × 34 ô, không thay thế nông trại.
 * Bé luôn đi trên đường/bãi cỏ bên ngoài hàng rào; con vật ở trong chuồng (không tiếp xúc trực tiếp).
 */
import { ZOO, ZOO_ZONES, type ZooZone } from '../content/zoo';
import type { TileChar, WorldMap, WorldObject, Zone } from './map';

export const ZOO_W = 40;
export const ZOO_H = 34;

/** Lòng chuồng (vùng con vật đi lại) + chỗ ăn + chỗ uống của từng khu (toạ độ ô). */
export interface ZooArea { x: number; y: number; w: number; h: number; food: { x: number; y: number }; water: { x: number; y: number }; swim?: boolean }
export const ZOO_AREAS: Record<ZooZone, ZooArea> = {
  grassland: { x: 3, y: 3, w: 14, h: 12, food: { x: 13.5, y: 13.5 }, water: { x: 5.5, y: 6.7 } },
  forest: { x: 23, y: 3, w: 14, h: 12, food: { x: 32.5, y: 13.5 }, water: { x: 34.5, y: 6.7 } },
  ice: { x: 3, y: 21, w: 7, h: 8, food: { x: 8.5, y: 27.6 }, water: { x: 5.5, y: 23.2 } },
  ocean: { x: 12, y: 21, w: 6, h: 8, food: { x: 15, y: 22.2 }, water: { x: 15, y: 25 }, swim: true },
  birds: { x: 23, y: 21, w: 7, h: 8, food: { x: 24.5, y: 27.6 }, water: { x: 27.5, y: 25.3 } },
};

/** Vị trí ban đầu từng con (giữa chuồng, không trùng nhau). */
const START: Record<string, [number, number]> = {
  lion: [8, 11], elephant: [12, 6], giraffe: [15, 9], zebra: [6, 13], rhinoceros: [10, 9],
  monkey: [27, 7], tiger: [31, 10], bear: [35, 12], deer: [26, 13], fox: [30, 6],
  penguin: [4.5, 27.5], 'polar bear': [7, 26], seal: [8.5, 23],
  dolphin: [14.5, 22.5], shark: [15, 25.5], turtle: [13.5, 27.5], octopus: [16.5, 27.6], clownfish: [13, 24],
  parrot: [24.5, 23], peacock: [26.5, 27.5], flamingo: [28.5, 26.8], owl: [28.5, 22.6],
};

function build(): WorldMap {
  const t: TileChar[][] = Array.from({ length: ZOO_H }, () => Array<TileChar>(ZOO_W).fill('.'));
  const fill = (x0: number, y0: number, x1: number, y1: number, c: TileChar) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) t[y][x] = c;
  };
  const outline = (x0: number, y0: number, x1: number, y1: number, c: TileChar) => {
    for (let x = x0; x <= x1; x++) { t[y0][x] = c; t[y1][x] = c; }
    for (let y = y0; y <= y1; y++) { t[y][x0] = c; t[y][x1] = c; }
  };
  const pond = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) t[y][x] = '~';
    }
  };

  // hoa trên cỏ
  for (let y = 1; y < ZOO_H - 1; y++) for (let x = 1; x < ZOO_W - 1; x++) if ((x * 5 + y * 11) % 13 === 0) t[y][x] = ',';
  outline(0, 0, ZOO_W - 1, ZOO_H - 1, 'T');

  // ----- Chuồng (rào bảo vệ) -----
  fill(3, 3, 16, 14, 'g'); outline(2, 2, 17, 15, 'f'); pond(5.5, 5, 2.2, 1.3); // Grassland + vũng nước
  fill(23, 3, 36, 14, 'F'); outline(22, 2, 37, 15, 'f'); pond(34.5, 5, 2.2, 1.3); // Forest + suối
  fill(3, 21, 9, 28, 'S'); outline(2, 20, 10, 29, 'f'); pond(6, 21.8, 2.6, 1.1); // Ice Land + hồ băng
  fill(12, 21, 17, 28, 'A'); outline(11, 20, 18, 29, 'f'); // Ocean (bể nước lớn)
  fill(23, 21, 29, 28, 'v'); outline(22, 20, 30, 29, 'f'); pond(27.5, 24.3, 1.4, 0.9); // Bird Garden + ao nhỏ
  for (const [x, y] of [[15, 4], [9, 4], [25, 4], [36, 10], [24, 10], [29, 13], [23, 22], [29, 22]] as const) t[y][x] = 'T';

  // ----- Đường đi -----
  fill(19, 1, 20, 32, '='); // đường chính từ cổng lên
  fill(1, 17, 38, 18, '='); // đường vòng ngang
  fill(11, 30, 28, 31, '='); // quảng trường trước cổng
  // ----- Hồ lớn + bãi cỏ (góc phải dưới) -----
  pond(35, 24.5, 3.3, 3.4);
  // Bụi hoa dọc quảng trường
  for (const x of [12, 14, 25, 27]) t[32][x] = '*';
  for (const [x, y] of [[33, 30], [38, 19], [1, 30], [21, 1], [18, 1]] as const) t[y][x] = 'T';

  const objects: WorldObject[] = [];
  const add = (o: WorldObject) => objects.push(o);

  // ----- Cổng HAPPY ZOO (2 trụ, lối vào giữa) -----
  add({ id: 'zoo-gate', kind: 'gate', x: 16, y: 32, w: 3, h: 1, solid: true, word: 'zoo', emoji: '🎪', action: 'gate', zone: 'zoo-plaza' });
  add({ id: 'zoo-gate-r', kind: 'gate', x: 21, y: 32, w: 3, h: 1, solid: true, word: 'zoo', emoji: '🎪', action: 'gate', zone: 'zoo-plaza' });

  // ----- Con vật -----
  for (const a of ZOO) {
    const [x, y] = START[a.id];
    add({ id: `zoo-${a.id}`, kind: 'zoo', x: Math.floor(x), y: Math.floor(y), w: 1, h: 1, solid: false, word: a.id, emoji: '', action: 'zoo', zone: `zoo-${a.zone}` as Zone['id'], zooZone: a.zone });
  }

  // ----- Trạm chăm sóc + bảng tên khu (mép đường) -----
  const station = (zone: ZooZone, x: number, y: number, sx: number, sy: number, word: string) => {
    const z = ZOO_ZONES.find((zz) => zz.id === zone)!;
    add({ id: `care-${zone}`, kind: 'care', x, y, w: 1, h: 1, solid: true, word: 'zookeeper', emoji: '🧺', action: 'care', zone: `zoo-${zone}` as Zone['id'], zooZone: zone });
    add({ id: `sign-${zone}`, kind: 'sign', x: sx, y: sy, w: 1, h: 1, solid: true, word, label: z.name, emoji: z.emoji, action: 'sign', zone: `zoo-${zone}` as Zone['id'], zooZone: zone });
  };
  station('grassland', 9, 16, 4, 16, 'grassland');
  station('forest', 29, 16, 35, 16, 'forest');
  station('ice', 6, 19, 3, 19, 'ice');
  station('ocean', 14, 19, 17, 19, 'ocean');
  station('birds', 26, 19, 23, 19, 'birds');

  // ----- Zoo Book + ghế đá + biển hồ -----
  add({ id: 'zoo-book', kind: 'kiosk', x: 25, y: 30, w: 1, h: 1, solid: true, word: 'book', emoji: '📖', action: 'zoobook', zone: 'zoo-plaza' });
  add({ id: 'sign-lake', kind: 'sign', x: 34, y: 20, w: 1, h: 1, solid: true, word: 'lake', label: 'Lake', emoji: '🦢', action: 'sign', zone: 'zoo-lake' });
  add({ id: 'zoo-bench', kind: 'decor', x: 31, y: 21, w: 1, h: 1, solid: true, word: 'bench', emoji: '🪑', action: 'decor', zone: 'zoo-lake' });

  const zones: Zone[] = [
    { id: 'zoo-grassland', name: 'Grassland', emoji: '🦁', vocab: 'grassland', x: 2, y: 2, w: 16, h: 15 },
    { id: 'zoo-forest', name: 'Forest', emoji: '🌲', vocab: 'forest', x: 22, y: 2, w: 16, h: 15 },
    { id: 'zoo-ice', name: 'Ice Land', emoji: '❄️', vocab: 'ice', x: 2, y: 19, w: 9, h: 11 },
    { id: 'zoo-ocean', name: 'Ocean', emoji: '🌊', vocab: 'ocean', x: 11, y: 19, w: 8, h: 11 },
    { id: 'zoo-birds', name: 'Bird Garden', emoji: '🦜', vocab: 'birds', x: 22, y: 19, w: 9, h: 11 },
    { id: 'zoo-lake', name: 'Lake', emoji: '🦢', vocab: 'lake', x: 31, y: 19, w: 8, h: 11 },
    { id: 'zoo-plaza', name: 'Happy Zoo', emoji: '🎪', vocab: 'zoo', x: 11, y: 30, w: 18, h: 3 },
  ];
  return { id: 'zoo', w: ZOO_W, h: ZOO_H, tiles: t, objects, zones, spawn: { x: 19.5, y: 30.5 } };
}

export const ZOO_MAP: WorldMap = build();
