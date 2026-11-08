/**
 * Bản đồ nông trại (SPEC 13.1). Lưới ô được dựng bằng code cho dễ đọc/sửa;
 * đồ vật & khu vực khai báo dạng dữ liệu bên dưới.
 */
import type { AnimalId, ShopId } from '../content/items';

export const TILE = 64;
export const MAP_W = 44;
export const MAP_H = 44;

/**
 * Loại ô:
 * . cỏ   , cỏ có hoa   = đường đất   ~ nước   # tường
 * L sàn phòng khách  B thảm phòng ngủ  K gạch bếp  C gạch khu làm bánh  D cửa / ngưỡng cửa
 * s đất vườn   h rơm (chuồng)   f hàng rào   T cây   * bụi hoa   W gạch phòng tắm
 * (sở thú) g cỏ khô đồng cỏ   F đất rừng   S tuyết   A nước biển (bể)   v cỏ vườn chim
 */
export type TileChar = '.' | ',' | '=' | '~' | '#' | 'L' | 'B' | 'K' | 'C' | 'D' | 's' | 'h' | 'f' | 'T' | '*' | 'W' | 'g' | 'F' | 'S' | 'A' | 'v';
export const SOLID_TILES: ReadonlySet<TileChar> = new Set(['~', '#', 'f', 'T', '*', 'A']);

export type ZoneId =
  | 'living' | 'bedroom' | 'kitchen' | 'baking' | 'bathroom'
  | 'garden' | 'pen' | 'pond' | 'yard' | 'orchard'
  | 'zoo-grassland' | 'zoo-forest' | 'zoo-ice' | 'zoo-ocean' | 'zoo-birds' | 'zoo-plaza' | 'zoo-lake'
  | 'shop-accessory' | 'shop-seed' | 'shop-market' | 'shop-baking';

export interface Zone {
  id: ZoneId;
  name: string; // tiếng Anh, hiện trên nhãn khu vực
  emoji: string;
  vocab: string; // từ dạy khi bước vào (SPEC 15.3)
  x: number; y: number; w: number; h: number;
}

export type ObjectKind = 'furniture' | 'plot' | 'animal' | 'shop' | 'barn' | 'sign' | 'well' | 'nature' | 'decor' | 'board' | 'tree' | 'zoo' | 'care' | 'gate' | 'kiosk';

export interface WorldObject {
  id: string;
  kind: ObjectKind;
  x: number; y: number; w: number; h: number; // chân đồ vật (ô)
  solid: boolean;
  word: string; // từ tiếng Anh hiển thị trên nút tương tác
  emoji: string;
  action: string; // xử lý trong interactions.ts
  zone: ZoneId;
  color?: string; // màu khối đồ đạc
  height?: number; // độ cao khối (px)
  shop?: ShopId;
  animal?: AnimalId;
  plot?: string; // 'x,y' — ô đất trong vườn
  /** Vật trang trí mở khóa bằng sao: chỉ có mặt khi đã mở khóa (SPEC 16.4). */
  decor?: string;
  /** Vùng đứng để tương tác (mặc định = chân đồ vật). Cửa hàng: ô cửa. */
  hit?: { x: number; y: number; w: number; h: number };
  /** Cây ăn quả: id trong TREES (src/art/library/trees.ts). */
  tree?: string;
  /** Vị trí quả trên cây (khi chạm vào một quả). */
  slot?: number;
  /** Chữ hiển thị trên biển (mặc định = word). */
  label?: string;
  /** Sở thú: khu của con vật / trạm chăm sóc (ZooZone). */
  zooZone?: string;
  /** Gắn trên tường (cửa sổ): vẽ trên mặt tường, không đổ bóng sàn. */
  wall?: boolean;
}

export interface WorldMap {
  id?: 'farm' | 'zoo';
  w: number;
  h: number;
  tiles: TileChar[][];
  objects: WorldObject[];
  zones: Zone[];
  spawn: { x: number; y: number };
}

function build(): WorldMap {
  const t: TileChar[][] = Array.from({ length: MAP_H }, () => Array<TileChar>(MAP_W).fill('.'));
  const fill = (x0: number, y0: number, x1: number, y1: number, c: TileChar) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) t[y][x] = c;
  };
  const outline = (x0: number, y0: number, x1: number, y1: number, c: TileChar) => {
    for (let x = x0; x <= x1; x++) { t[y0][x] = c; t[y1][x] = c; }
    for (let y = y0; y <= y1; y++) { t[y][x0] = c; t[y][x1] = c; }
  };
  const set = (x: number, y: number, c: TileChar) => { t[y][x] = c; };

  // Hoa rải rác trên cỏ (cố định, không ngẫu nhiên)
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) if ((x * 7 + y * 13) % 11 === 0) t[y][x] = ',';

  // Viền cây
  outline(0, 0, MAP_W - 1, MAP_H - 1, 'T');

  // ----- Ao (trên trái) -----
  for (let y = 3; y <= 10; y++) for (let x = 2; x <= 9; x++) {
    const dx = (x - 5.5) / 3.6, dy = (y - 6.5) / 3.6;
    if (dx * dx + dy * dy <= 1) t[y][x] = '~';
  }

  // ----- Nhà (x 12..31, y 2..13) -----
  fill(13, 3, 21, 7, 'B'); // phòng ngủ
  fill(23, 3, 30, 7, 'C'); // khu làm bánh
  fill(13, 9, 21, 12, 'L'); // phòng khách
  fill(23, 9, 30, 12, 'K'); // bếp
  outline(12, 2, 31, 13, '#');
  fill(13, 8, 30, 8, '#'); // tường ngang giữa
  fill(22, 3, 22, 12, '#'); // tường dọc giữa
  set(16, 8, 'D'); // phòng ngủ ↔ phòng khách
  set(27, 8, 'D'); // làm bánh ↔ bếp
  set(22, 5, 'D'); // phòng ngủ ↔ làm bánh
  set(22, 11, 'D'); // phòng khách ↔ bếp
  set(17, 13, 'D'); // cửa chính
  // Phòng tắm (SPEC 18.6): tách từ phòng ngủ bằng tường x=18, cửa (18,5)
  fill(18, 3, 18, 7, '#');
  fill(19, 3, 21, 7, 'W');
  set(18, 5, 'D');

  // Bụi hoa trước nhà
  fill(13, 14, 15, 14, '*');
  fill(19, 14, 21, 14, '*');
  fill(24, 14, 26, 14, '*');

  // ----- Đường đi -----
  fill(16, 14, 18, 14, '=');
  fill(17, 15, 17, 19, '=');
  fill(1, 20, 42, 21, '='); // đường chính
  fill(7, 22, 7, 23, '='); // tới cổng vườn
  fill(37, 16, 37, 19, '='); // tới cổng chuồng
  fill(14, 22, 14, 29, '='); // nối xuống phố chợ
  fill(29, 22, 29, 29, '=');
  fill(14, 28, 42, 29, '='); // phố cửa hàng
  // Lối xuống vườn cây ăn quả (SPEC 18.4)
  fill(22, 30, 23, 38, '=');
  fill(15, 37, 40, 38, '='); // lối đi giữa hai hàng cây

  // ----- Vườn (x 2..12, y 23..31) -----
  fill(3, 24, 11, 30, 's');
  outline(2, 23, 12, 31, 'f');
  set(7, 23, '='); // cổng

  // ----- Chuồng vật nuôi (x 33..42, y 3..16) -----
  fill(34, 6, 41, 14, 'h');
  outline(33, 2, 42, 15, 'f');
  set(37, 15, '='); // cổng

  // Cây trang trí (không chắn đường)
  for (const [x, y] of [[10, 15], [3, 13], [24, 17], [31, 17], [11, 18], [40, 18], [2, 17], [27, 31], [35, 31], [19, 31], [42, 25], [8, 12]] as const) {
    if (t[y][x] === '.' || t[y][x] === ',') t[y][x] = 'T';
  }

  const objects: WorldObject[] = [];
  const add = (o: WorldObject) => objects.push(o);

  // ----- Phòng khách -----
  add({ id: 'bookshelf', kind: 'furniture', x: 13, y: 9, w: 1, h: 1, solid: true, word: 'book', emoji: '📚', action: 'bookshelf', zone: 'living', color: '#D9B38C', height: 70 });
  add({ id: 'television', kind: 'furniture', x: 15, y: 9, w: 1, h: 1, solid: true, word: 'television', emoji: '📺', action: 'item', zone: 'living', color: '#444', height: 50 });
  add({ id: 'coffee-table', kind: 'furniture', x: 19, y: 11, w: 1, h: 1, solid: true, word: 'table', emoji: '🪵', action: 'item', zone: 'living', color: '#E0B48C', height: 26 });
  add({ id: 'chair', kind: 'furniture', x: 20, y: 11, w: 1, h: 1, solid: true, word: 'chair', emoji: '🪑', action: 'item', zone: 'living', color: '#C89F83', height: 40 });
  add({ id: 'window-1', kind: 'furniture', x: 14, y: 13, w: 1, h: 1, solid: true, word: 'window', emoji: '🪟', action: 'item', zone: 'living', wall: true });
  add({ id: 'window-2', kind: 'furniture', x: 20, y: 13, w: 1, h: 1, solid: true, word: 'window', emoji: '🪟', action: 'item', zone: 'living', wall: true });
  add({ id: 'sofa', kind: 'furniture', x: 19, y: 9, w: 2, h: 1, solid: true, word: 'sofa', emoji: '🛋️', action: 'sofa', zone: 'living', color: '#F7B2C4', height: 30 });
  add({ id: 'piano', kind: 'furniture', x: 21, y: 9, w: 1, h: 1, solid: true, word: 'piano', emoji: '🎹', action: 'piano', zone: 'living', color: '#6E5A7E', height: 46 });
  add({ id: 'clock', kind: 'furniture', x: 13, y: 12, w: 1, h: 1, solid: true, word: 'clock', emoji: '🕰️', action: 'clock', zone: 'living', color: '#C89F83', height: 64 });
  add({ id: 'lamp', kind: 'furniture', x: 21, y: 12, w: 1, h: 1, solid: true, word: 'lamp', emoji: '💡', action: 'lamp', zone: 'living', color: '#FFE59A', height: 50 });
  // ----- Phòng ngủ -----
  add({ id: 'bed', kind: 'furniture', x: 13, y: 3, w: 2, h: 2, solid: true, word: 'bed', emoji: '🛏️', action: 'bed', zone: 'bedroom', color: '#C3B1E1', height: 26 });
  add({ id: 'wardrobe', kind: 'furniture', x: 16, y: 3, w: 2, h: 1, solid: true, word: 'wardrobe', emoji: '👕', action: 'wardrobe', zone: 'bedroom', color: '#E8C9A8', height: 80 });
  add({ id: 'toybox', kind: 'furniture', x: 13, y: 7, w: 1, h: 1, solid: true, word: 'toys', emoji: '🧸', action: 'toybox', zone: 'bedroom', color: '#9EE6CF', height: 30 });
  add({ id: 'bed-lamp', kind: 'furniture', x: 17, y: 7, w: 1, h: 1, solid: true, word: 'lamp', emoji: '💡', action: 'lamp', zone: 'bedroom', color: '#FFE59A', height: 50 });
  // ----- Phòng tắm -----
  add({ id: 'mirror', kind: 'furniture', x: 19, y: 3, w: 1, h: 1, solid: true, word: 'mirror', emoji: '🪞', action: 'item', zone: 'bathroom' });
  add({ id: 'toothbrush', kind: 'furniture', x: 20, y: 3, w: 1, h: 1, solid: true, word: 'toothbrush', emoji: '🪥', action: 'item', zone: 'bathroom' });
  add({ id: 'towel', kind: 'furniture', x: 21, y: 3, w: 1, h: 1, solid: true, word: 'towel', emoji: '🧺', action: 'item', zone: 'bathroom' });
  add({ id: 'soap', kind: 'furniture', x: 21, y: 7, w: 1, h: 1, solid: true, word: 'soap', emoji: '🧼', action: 'item', zone: 'bathroom' });
  // ----- Khu làm bánh -----
  add({ id: 'mixing', kind: 'furniture', x: 25, y: 3, w: 2, h: 1, solid: true, word: 'mixing bowl', emoji: '🥣', action: 'mixing', zone: 'baking', color: '#F4D9B8', height: 40 });
  add({ id: 'oven', kind: 'furniture', x: 29, y: 3, w: 1, h: 1, solid: true, word: 'oven', emoji: '🔥', action: 'oven', zone: 'baking', color: '#E9E3EF', height: 54 });
  // ----- Bếp -----
  add({ id: 'sink', kind: 'furniture', x: 24, y: 9, w: 1, h: 1, solid: true, word: 'sink', emoji: '🚰', action: 'sink', zone: 'kitchen', color: '#CDE7FF', height: 40 });
  add({ id: 'stove', kind: 'furniture', x: 28, y: 9, w: 2, h: 1, solid: true, word: 'stove', emoji: '🍳', action: 'stove', zone: 'kitchen', color: '#F3C6C6', height: 40 });
  add({ id: 'fridge', kind: 'furniture', x: 30, y: 9, w: 1, h: 1, solid: true, word: 'refrigerator', emoji: '🧊', action: 'fridge', zone: 'kitchen', color: '#F7FBFF', height: 76 });
  add({ id: 'shelf', kind: 'furniture', x: 23, y: 12, w: 1, h: 1, solid: true, word: 'kitchen shelf', emoji: '🍽️', action: 'shelf', zone: 'kitchen' });
  add({ id: 'table', kind: 'furniture', x: 26, y: 11, w: 2, h: 1, solid: true, word: 'dining table', emoji: '🍽️', action: 'table', zone: 'kitchen', color: '#E0B48C', height: 30 });

  // ----- Vườn: mọi ô đất 's' đều trồng được (SPEC 14.3) + giếng -----
  add({ id: 'well', kind: 'well', x: 10, y: 25, w: 1, h: 1, solid: true, word: 'water', emoji: '💧', action: 'well', zone: 'garden' });

  // ----- Chuồng -----
  add({ id: 'barn', kind: 'barn', x: 35, y: 3, w: 6, h: 2, solid: true, word: 'barn', emoji: '🏚️', action: 'sign', zone: 'pen' });
  for (const [id, x, y] of [['chicken', 35, 9], ['cow', 39, 8], ['sheep', 35, 12], ['pig', 39, 12], ['horse', 40, 10], ['rabbit', 36, 10]] as const) {
    add({ id, kind: 'animal', x, y, w: 1, h: 1, solid: true, word: id, emoji: '', action: 'animal', zone: 'pen', animal: id });
  }
  // Vịt bơi ở mép ao (ô nước sát bờ phải hàng 6)
  const duckX = t[6].lastIndexOf('~');
  add({ id: 'duck', kind: 'animal', x: duckX, y: 6, w: 1, h: 1, solid: true, word: 'duck', emoji: '', action: 'animal', zone: 'pond', animal: 'duck' });

  // Chó ngoài sân, mèo trong phòng khách (SPEC 18.3)
  add({ id: 'dog', kind: 'animal', x: 23, y: 16, w: 1, h: 1, solid: true, word: 'dog', emoji: '', action: 'animal', zone: 'yard', animal: 'dog' });
  add({ id: 'cat', kind: 'animal', x: 14, y: 11, w: 1, h: 1, solid: true, word: 'cat', emoji: '', action: 'animal', zone: 'living', animal: 'cat' });

  // ----- Vườn cây ăn quả: 8 cây vẽ riêng (SPEC 18.4), chân 2×1 -----
  const orchard: [string, number, number][] = [
    ['apple-tree', 15, 35], ['orange-tree', 19, 35], ['mango-tree', 26, 35], ['banana-tree', 31, 35],
    ['coconut-tree', 15, 41], ['strawberry-plant', 19, 41], ['watermelon-plant', 26, 41], ['grapevine', 31, 41],
  ];
  for (const [tree, x, y] of orchard) {
    add({ id: tree, kind: 'tree', x, y, w: 2, h: 1, solid: true, word: tree.replace('-', ' '), emoji: '🌳', action: 'tree', zone: 'orchard', tree });
  }
  add({ id: 'sign-orchard', kind: 'sign', x: 24, y: 31, w: 1, h: 1, solid: true, word: 'orchard', emoji: '🍎', action: 'sign', zone: 'yard' });

  // ----- Cửa hàng (5 × 3, cửa ở giữa hàng dưới) -----
  const shops: [ShopId, number, ZoneId][] = [['accessory', 16, 'shop-accessory'], ['seed', 23, 'shop-seed'], ['market', 30, 'shop-market'], ['baking', 37, 'shop-baking']];
  for (const [shop, x, zone] of shops) {
    add({ id: `shop-${shop}`, kind: 'shop', x, y: 25, w: 5, h: 3, solid: true, word: 'shop', emoji: '🏪', action: 'shop', zone, shop, hit: { x: x + 2, y: 27, w: 1, h: 1 } });
  }

  // ----- Cây & hoa chạm được (dạy TREE / FLOWER — SPEC 15.4) -----
  add({ id: 'tree-yard', kind: 'nature', x: 10, y: 15, w: 1, h: 1, solid: true, word: 'tree', emoji: '🌳', action: 'nature', zone: 'yard' });
  add({ id: 'tree-road', kind: 'nature', x: 24, y: 17, w: 1, h: 1, solid: true, word: 'tree', emoji: '🌳', action: 'nature', zone: 'yard' });
  add({ id: 'flower-house', kind: 'nature', x: 15, y: 14, w: 1, h: 1, solid: true, word: 'flower', emoji: '🌸', action: 'nature', zone: 'yard' });
  add({ id: 'flower-house-2', kind: 'nature', x: 19, y: 14, w: 1, h: 1, solid: true, word: 'flower', emoji: '🌸', action: 'nature', zone: 'yard' });

  // ----- Bảng trò chơi (mở Play & Learn — SPEC 16.1) -----
  add({ id: 'game-board', kind: 'board', x: 20, y: 17, w: 1, h: 1, solid: true, word: 'games', emoji: '🎲', action: 'board', zone: 'yard' });

  // ----- Vật trang trí mở khóa bằng sao (vị trí cố định, không chắn đường — có test) -----
  for (const [id, x, y, word, emoji] of [
    ['flower-pot', 21, 15, 'flower pot', '🪴'], ['bench', 14, 16, 'bench', '🪑'], ['fountain', 27, 18, 'fountain', '⛲'],
    ['birdhouse', 33, 18, 'birdhouse', '🐦'], ['rainbow', 6, 16, 'rainbow', '🌈'],
  ] as const) {
    add({ id: `decor-${id}`, kind: 'decor', x, y, w: 1, h: 1, solid: true, word, emoji, action: 'decor', zone: 'yard', decor: id });
  }

  // ----- Biển tên -----
  add({ id: 'sign-house', kind: 'sign', x: 18, y: 15, w: 1, h: 1, solid: true, word: 'house', emoji: '🏠', action: 'sign', zone: 'yard' });
  add({ id: 'sign-garden', kind: 'sign', x: 8, y: 22, w: 1, h: 1, solid: true, word: 'garden', emoji: '🌱', action: 'sign', zone: 'yard' });
  add({ id: 'sign-pen', kind: 'sign', x: 38, y: 16, w: 1, h: 1, solid: true, word: 'farm animals', emoji: '🐮', action: 'sign', zone: 'yard' });
  add({ id: 'sign-pond', kind: 'sign', x: 10, y: 8, w: 1, h: 1, solid: true, word: 'pond', emoji: '🦆', action: 'sign', zone: 'yard' });

  const zones: Zone[] = [
    { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', vocab: 'bedroom', x: 13, y: 3, w: 5, h: 5 },
    { id: 'bathroom', name: 'Bathroom', emoji: '🛁', vocab: 'bathroom', x: 19, y: 3, w: 3, h: 5 },
    { id: 'orchard', name: 'Orchard', emoji: '🍎', vocab: 'orchard', x: 14, y: 33, w: 28, h: 10 },
    { id: 'baking', name: 'Baking Corner', emoji: '🧁', vocab: 'baking', x: 23, y: 3, w: 8, h: 5 },
    { id: 'living', name: 'Living Room', emoji: '🛋️', vocab: 'living room', x: 13, y: 9, w: 9, h: 4 },
    { id: 'kitchen', name: 'Kitchen', emoji: '🍳', vocab: 'kitchen', x: 23, y: 9, w: 8, h: 4 },
    { id: 'garden', name: 'Garden', emoji: '🌱', vocab: 'garden', x: 3, y: 24, w: 9, h: 7 },
    { id: 'pen', name: 'Farm Animals', emoji: '🐮', vocab: 'farm', x: 34, y: 3, w: 8, h: 12 },
    { id: 'pond', name: 'Pond', emoji: '🦆', vocab: 'pond', x: 1, y: 2, w: 10, h: 10 },
    { id: 'shop-accessory', name: 'Accessory Shop', emoji: '🎀', vocab: 'shop', x: 16, y: 28, w: 5, h: 2 },
    { id: 'shop-seed', name: 'Seed Shop', emoji: '🌱', vocab: 'seeds', x: 23, y: 28, w: 5, h: 2 },
    { id: 'shop-market', name: 'Fruit Market', emoji: '🍓', vocab: 'market', x: 30, y: 28, w: 5, h: 2 },
    { id: 'shop-baking', name: 'Baking Shop', emoji: '🧁', vocab: 'bakery', x: 37, y: 28, w: 5, h: 2 },
  ];

  return { id: 'farm', w: MAP_W, h: MAP_H, tiles: t, objects, zones, spawn: { x: 17.5, y: 16.5 } };
}

export const WORLD: WorldMap = build();

/** Ô đất trồng được: đất vườn và không có vật cứng (giếng). */
export function isPlantable(map: WorldMap, x: number, y: number): boolean {
  if (map.tiles[y]?.[x] !== 's') return false;
  return !map.objects.some((o) => o.solid && x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
}

export const plotKey = (x: number, y: number) => `${x},${y}`;
export function parsePlotKey(k: string): { x: number; y: number } | null {
  const m = /^(\d+),(\d+)$/.exec(k);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
}

/** Đồ vật "luống" ảo cho một ô đất (đã trồng hoặc ô trống bé chọn). */
export function plotObject(x: number, y: number): WorldObject {
  return { id: `plot-${x}-${y}`, kind: 'plot', x, y, w: 1, h: 1, solid: false, word: 'garden', emoji: '🌱', action: 'plot', zone: 'garden', plot: plotKey(x, y) };
}

export function zoneAt(map: WorldMap, x: number, y: number): Zone | undefined {
  return map.zones.find((z) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
}
