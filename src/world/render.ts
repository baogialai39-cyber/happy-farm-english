/**
 * Vẽ thế giới 2.5D (SPEC 13.1): nền vẽ sẵn 1 lần, vật thể cao sắp xếp theo chân (y) mỗi khung hình.
 * Đồ đạc, con vật, cây ăn quả dùng thư viện hình SVG gần thực tế (SPEC 18.1, renderArt.ts); emoji chỉ còn làm dự phòng.
 */
import { ANIMALS, ITEM_BY_ID, RECIPE_BY_ID, SHOPS, type ShopId } from '../content/items';
import { TILE as T, type TileChar, type WorldMap, type WorldObject } from './map';
import { plotProgress, plotStage, type WorldSave, animalReadyIn } from './save';
import { drawAnimalArt, drawFurnitureArt, drawTreeArt, furnitureBox, type OrchardFx, treeGeom } from './renderArt';

export const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
const TEXT_FONT = '"Baloo 2","Comic Sans MS",system-ui,sans-serif';
const RES = 2; // độ phân giải sprite

export interface Entity {
  y: number; // chân (px thế giới) để sắp xếp chiều sâu
  x0: number; x1: number; top: number; // khung để bỏ qua khi ngoài màn hình
  flat?: boolean; // vẽ trước tất cả (sát mặt đất)
  draw(c: CanvasRenderingContext2D, t: number): void;
}

export interface RenderState {
  save: WorldSave;
  now: number;
  lampOn: boolean;
  highlight?: WorldObject;
  target?: { x: number; y: number };
  fedAt: Record<string, number>; // hiệu ứng tim khi vừa cho ăn/vuốt ve
  /** Vườn cây ăn quả: quả đã chạm lần 1 + quả đang rơi (SPEC 18.5). */
  orchard?: OrchardFx;
}

// ---------- tiện ích ----------
const rand = (x: number, y: number, i = 0) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + i * 37.719) * 43758.5453;
  return v - Math.floor(v);
};

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

function shadow(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a = 0.16) {
  c.fillStyle = `rgba(80,60,100,${a})`;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

const spriteCache = new Map<string, HTMLCanvasElement>();
function sprite(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  let s = spriteCache.get(key);
  if (!s) {
    s = document.createElement('canvas');
    s.width = Math.ceil(w * RES);
    s.height = Math.ceil(h * RES);
    const c = s.getContext('2d')!;
    c.scale(RES, RES);
    draw(c);
    spriteCache.set(key, s);
  }
  return s;
}

/** Emoji vẽ sẵn thành ảnh (vẽ emoji mỗi khung hình rất chậm). */
export function emojiSprite(emoji: string, size: number): HTMLCanvasElement {
  return sprite(`e:${emoji}:${size}`, size * 1.25, size * 1.25, (c) => {
    c.font = `${size}px ${EMOJI_FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(emoji, size * 0.625, size * 0.68);
  });
}

export function drawEmoji(c: CanvasRenderingContext2D, emoji: string, x: number, y: number, size: number) {
  const s = emojiSprite(emoji, size);
  const w = size * 1.25;
  c.drawImage(s, x - w / 2, y - w / 2, w, w);
}

// ---------- NỀN (vẽ 1 lần) ----------
const FLOOR: Partial<Record<TileChar, [string, string]>> = {
  L: ['#F6D8B4', '#EEC79D'],
  B: ['#EAE0F8', '#DED0F2'],
  K: ['#FFF6EC', '#FFE3EA'],
  C: ['#FFF8DE', '#FCE8C6'],
  D: ['#F6D8B4', '#EEC79D'],
  W: ['#E6F6FB', '#CDEAF4'],
  '#': ['#E9D7CB', '#E9D7CB'],
};

function region(c: CanvasRenderingContext2D, map: WorldMap, set: ReadonlySet<TileChar>, color: string, detail?: (x: number, y: number) => void) {
  const inSet = (x: number, y: number) => x >= 0 && y >= 0 && x < map.w && y < map.h && set.has(map.tiles[y][x]);
  const R = T * 0.42;
  c.fillStyle = color;
  for (let y = 0; y < map.h; y++)
    for (let x = 0; x < map.w; x++) {
      if (!inSet(x, y)) continue;
      const u = inSet(x, y - 1), d = inSet(x, y + 1), l = inSet(x - 1, y), r = inSet(x + 1, y);
      rr(c, x * T - 0.5, y * T - 0.5, T + 1, T + 1, [!u && !l ? R : 0, !u && !r ? R : 0, !d && !r ? R : 0, !d && !l ? R : 0]);
      c.fill();
    }
  if (detail) for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) if (inSet(x, y)) detail(x, y);
}

export function buildGround(map: WorldMap): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = map.w * T;
  cv.height = map.h * T;
  const c = cv.getContext('2d')!;

  // Cỏ
  for (let y = 0; y < map.h; y++)
    for (let x = 0; x < map.w; x++) {
      c.fillStyle = (x + y) % 2 ? '#C3ECB2' : '#BDE8AB';
      c.fillRect(x * T, y * T, T, T);
      c.strokeStyle = '#A9DB98';
      c.lineWidth = 2;
      c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const bx = x * T + rand(x, y, i) * T, by = y * T + rand(y, x, i) * T;
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx + 2, by - 6);
        c.stroke();
      }
    }
  // Hoa nhỏ
  const fcol = ['#FF9CB0', '#FFD36E', '#C3B1E1', '#FFFFFF', '#FFB38A'];
  for (let y = 0; y < map.h; y++)
    for (let x = 0; x < map.w; x++) {
      if (map.tiles[y][x] !== ',') continue;
      for (let i = 0; i < 3; i++) {
        const fx = x * T + 10 + rand(x, y, i + 5) * (T - 20), fy = y * T + 10 + rand(x, y, i + 9) * (T - 20);
        c.fillStyle = fcol[Math.floor(rand(x, y, i) * fcol.length)];
        for (let k = 0; k < 4; k++) {
          c.beginPath();
          c.arc(fx + Math.cos(k * 1.57) * 4, fy + Math.sin(k * 1.57) * 4, 3.6, 0, 7);
          c.fill();
        }
        c.fillStyle = '#FFF2A8';
        c.beginPath();
        c.arc(fx, fy, 2.6, 0, 7);
        c.fill();
      }
    }

  // Đường đất
  region(c, map, new Set(['=']), '#F4E0C2', (x, y) => {
    c.fillStyle = '#E6CBA6';
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(x * T + 8 + rand(x, y, i) * 48, y * T + 8 + rand(y, x, i) * 48, 5, 3.5, 0, 0, 7);
      c.fill();
    }
  });
  // Đất vườn
  region(c, map, new Set(['s']), '#DDB993', (x, y) => {
    c.strokeStyle = '#CDA57D';
    c.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
      c.beginPath();
      c.moveTo(x * T + 4, y * T + i * 16);
      c.lineTo(x * T + T - 4, y * T + i * 16);
      c.stroke();
    }
  });
  // Rơm trong chuồng
  region(c, map, new Set(['h']), '#F6E6A8', (x, y) => {
    c.strokeStyle = '#E8D27F';
    c.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const sx = x * T + rand(x, y, i) * T, sy = y * T + rand(y, x, i) * T;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + 10, sy + 3);
      c.stroke();
    }
  });
  // ----- Nền sở thú (SPEC 19.2) -----
  region(c, map, new Set(['g']), '#EADF98', (x, y) => {
    c.strokeStyle = '#D2C26A';
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const sx = x * T + rand(x, y, i) * T, sy = y * T + rand(y, x, i) * T;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + 2, sy - 8);
      c.moveTo(sx + 4, sy);
      c.lineTo(sx + 8, sy - 6);
      c.stroke();
    }
  });
  region(c, map, new Set(['F']), '#A7D38F', (x, y) => {
    c.fillStyle = '#8CBF74';
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.ellipse(x * T + rand(x, y, i) * T, y * T + rand(y, x, i) * T, 6, 3, rand(x, y, i + 5) * 3, 0, 7);
      c.fill();
    }
  });
  region(c, map, new Set(['S']), '#F2F7FC', (x, y) => {
    c.fillStyle = '#DDEAF5';
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.arc(x * T + rand(x, y, i) * T, y * T + rand(y, x, i) * T, 3 + rand(x, y, i + 2) * 4, 0, 7);
      c.fill();
    }
  });
  region(c, map, new Set(['v']), '#CBEFB5', (x, y) => {
    for (let i = 0; i < 2; i++) {
      c.fillStyle = ['#FFD54F', '#F48FB1', '#FFFFFF'][Math.floor(rand(x, y, i) * 3)];
      c.beginPath();
      c.arc(x * T + rand(x, y, i + 1) * T, y * T + rand(y, x, i + 1) * T, 3, 0, 7);
      c.fill();
    }
  });
  region(c, map, new Set(['A']), '#3F9BDB', (x, y) => {
    const g = c.createLinearGradient(0, y * T, 0, y * T + T);
    g.addColorStop(0, 'rgba(255,255,255,.08)');
    g.addColorStop(1, 'rgba(0,40,90,.08)');
    c.fillStyle = g;
    c.fillRect(x * T, y * T, T, T);
    c.strokeStyle = 'rgba(255,255,255,.35)';
    c.lineWidth = 2.5;
    c.lineCap = 'round';
    if (rand(x, y) > 0.4) {
      c.beginPath();
      c.arc(x * T + 16 + rand(x, y, 3) * 30, y * T + 18 + rand(x, y, 4) * 26, 9, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    }
    if (rand(y, x, 9) > 0.8) {
      c.fillStyle = 'rgba(120,200,120,.6)'; // rong biển
      c.beginPath();
      c.ellipse(x * T + 20, y * T + 44, 4, 14, 0.2, 0, 7);
      c.fill();
    }
  });

  // Nước
  region(c, map, new Set(['~']), '#A9DCFF', (x, y) => {
    c.strokeStyle = 'rgba(255,255,255,.65)';
    c.lineWidth = 3;
    c.lineCap = 'round';
    if (rand(x, y) > 0.45) {
      const wx = x * T + 12 + rand(x, y, 3) * 30, wy = y * T + 14 + rand(x, y, 4) * 30;
      c.beginPath();
      c.arc(wx, wy, 8, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    }
  });

  // Sàn trong nhà
  for (let y = 0; y < map.h; y++)
    for (let x = 0; x < map.w; x++) {
      const ch = map.tiles[y][x];
      const f = FLOOR[ch];
      if (!f) continue;
      c.fillStyle = f[0];
      c.fillRect(x * T, y * T, T, T);
      if (ch === 'L' || ch === 'D') {
        c.fillStyle = f[1];
        for (let i = 0; i < 4; i++) c.fillRect(x * T, y * T + i * 16 + 15, T, 2);
        c.fillRect(x * T + ((y * 3 + x * 5) % 4) * 16, y * T, 2, T);
      } else if (ch === 'K' || ch === 'C' || ch === 'W') {
        c.fillStyle = f[1];
        c.fillRect(x * T, y * T, 32, 32);
        c.fillRect(x * T + 32, y * T + 32, 32, 32);
      } else if (ch === 'B') {
        c.fillStyle = f[1];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
          c.beginPath();
          c.arc(x * T + 8 + i * 16, y * T + 8 + j * 16, 2.2, 0, 7);
          c.fill();
        }
      }
    }
  if (map.id && map.id !== 'farm') return cv; // thảm trong nhà chỉ có ở nông trại
  // Thảm
  c.fillStyle = '#FFD1E3';
  c.beginPath();
  c.ellipse(17.5 * T, 10.9 * T, 2.6 * T, 1.15 * T, 0, 0, 7);
  c.fill();
  c.strokeStyle = '#FFF';
  c.lineWidth = 6;
  c.setLineDash([10, 10]);
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = '#D3C2F0';
  c.beginPath();
  c.ellipse(15.6 * T, 5.7 * T, 1.7 * T, 0.95 * T, 0, 0, 7); // phòng ngủ (x 13..17)
  c.fill();
  // thảm chùi chân phòng tắm
  c.fillStyle = '#A8DAF0';
  rr(c, 19.3 * T, 5.2 * T, 2.4 * T, 0.7 * T, 18);
  c.fill();
  // Thảm chùi chân ở cửa chính
  c.fillStyle = '#F7A9BD';
  rr(c, 17 * T + 8, 14 * T + 10, T - 16, T - 24, 10);
  c.fill();
  return cv;
}

// ---------- TƯỜNG ----------
const WALL_H = 34;
function wallEntity(map: WorldMap, x: number, y: number): Entity {
  const isWall = (tx: number, ty: number) => map.tiles[ty]?.[tx] === '#';
  const front = !isWall(x, y + 1);
  const outer = x === 12 || x === 31 || y === 2 || y === 13;
  return {
    y: (y + 1) * T,
    x0: x * T, x1: (x + 1) * T, top: y * T - WALL_H,
    draw(c) {
      const px = x * T, py = y * T - WALL_H;
      if (front) {
        const g = c.createLinearGradient(0, (y + 1) * T - WALL_H, 0, (y + 1) * T);
        g.addColorStop(0, outer ? '#F7C6BC' : '#FAD8CF');
        g.addColorStop(1, outer ? '#E8A99E' : '#EFC0B5');
        c.fillStyle = g;
        c.fillRect(px, (y + 1) * T - WALL_H, T, WALL_H);
        c.fillStyle = 'rgba(255,255,255,.35)';
        c.fillRect(px, (y + 1) * T - WALL_H + 6, T, 3);
      }
      c.fillStyle = outer ? '#FFEDE4' : '#FFF5EE';
      c.fillRect(px, py, T, T);
      c.fillStyle = '#E7C3B7';
      if (!isWall(x, y - 1)) c.fillRect(px, py, T, 4);
      if (!isWall(x - 1, y)) c.fillRect(px, py, 4, T);
      if (!isWall(x + 1, y)) c.fillRect(px + T - 4, py, 4, T);
      if (front) c.fillRect(px, py + T - 3, T, 3);
    },
  };
}

// ---------- CÂY, BỤI, HÀNG RÀO ----------
const treeSprite = () =>
  sprite('tree', 120, 150, (c) => {
    shadow(c, 60, 140, 46, 11);
    const tg = c.createLinearGradient(50, 0, 72, 0);
    tg.addColorStop(0, '#C89F83');
    tg.addColorStop(1, '#A57C62');
    c.fillStyle = tg;
    rr(c, 50, 78, 20, 64, 9);
    c.fill();
    const blob = (x: number, y: number, r: number) => {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, '#CDF2C2');
      g.addColorStop(0.55, '#9ED99A');
      g.addColorStop(1, '#79BE7A');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
    };
    blob(34, 78, 30);
    blob(86, 78, 31);
    blob(60, 48, 38);
    c.fillStyle = '#FF9CB0';
    for (const [fx, fy] of [[42, 46], [80, 64], [58, 82], [30, 72], [70, 30]]) {
      c.beginPath();
      c.arc(fx, fy, 5.5, 0, 7);
      c.fill();
    }
  });

const bushSprite = () =>
  sprite('bush', 76, 60, (c) => {
    shadow(c, 38, 52, 32, 7);
    const g = c.createRadialGradient(28, 18, 4, 38, 32, 34);
    g.addColorStop(0, '#C8F0BC');
    g.addColorStop(1, '#86C985');
    c.fillStyle = g;
    for (const [x, y, r] of [[22, 34, 18], [52, 34, 18], [38, 24, 20]]) {
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
    }
    const cols = ['#FF9CC2', '#FFD36E', '#FFFFFF'];
    [[24, 26], [44, 18], [56, 32], [34, 38]].forEach(([x, y], i) => {
      c.fillStyle = cols[i % 3];
      c.beginPath();
      c.arc(x, y, 4.5, 0, 7);
      c.fill();
    });
  });

function fenceEntity(map: WorldMap, x: number, y: number): Entity {
  const isF = (tx: number, ty: number) => map.tiles[ty]?.[tx] === 'f';
  const gy = (y + 0.62) * T;
  return {
    y: gy, x0: x * T - 8, x1: (x + 1.5) * T, top: gy - 50,
    draw(c) {
      const cx = (x + 0.5) * T;
      c.fillStyle = '#F2E2D2';
      if (isF(x + 1, y)) {
        rr(c, cx, gy - 30, T, 8, 4); c.fill();
        rr(c, cx, gy - 16, T, 8, 4); c.fill();
      }
      if (isF(x, y + 1)) {
        rr(c, cx - 3, gy - 30, 6, T + 10, 3);
        c.fill();
      }
      shadow(c, cx, gy, 10, 4, 0.12);
      c.fillStyle = '#FFF9F2';
      rr(c, cx - 7, gy - 42, 14, 44, [7, 7, 3, 3]);
      c.fill();
      c.fillStyle = '#EADBCB';
      c.fillRect(cx + 3, gy - 36, 3, 36);
    },
  };
}

// ---------- NHÀ CỬA HÀNG / CHUỒNG ----------
const SHOP_WINDOW: Record<ShopId, [string, string]> = {
  accessory: ['👑', '🕶️'],
  seed: ['🌱', '🥕'],
  market: ['🍓', '🍉'],
  baking: ['🧁', '🌾'],
};

function shopSprite(id: ShopId) {
  const def = SHOPS[id];
  const W = 5 * T, UP = 1.7 * T, H = 3 * T + UP;
  return sprite(`shop:${id}`, W, H, (c) => {
    shadow(c, W / 2, H - 6, W / 2 - 4, 14, 0.18);
    // thân
    const bodyTop = UP + 0.6 * T;
    const g = c.createLinearGradient(0, bodyTop, 0, H);
    g.addColorStop(0, def.color);
    g.addColorStop(1, '#FFFFFF');
    c.fillStyle = g;
    rr(c, 14, bodyTop, W - 28, H - bodyTop - 4, [6, 6, 14, 14]);
    c.fill();
    c.strokeStyle = 'rgba(120,90,110,.15)';
    c.lineWidth = 3;
    c.stroke();
    // mái hiên sọc
    const roofY = UP - 0.2 * T;
    c.fillStyle = def.roof;
    c.beginPath();
    c.moveTo(6, bodyTop + 10);
    c.lineTo(34, roofY);
    c.lineTo(W - 34, roofY);
    c.lineTo(W - 6, bodyTop + 10);
    c.closePath();
    c.fill();
    const stripes = 10;
    for (let i = 0; i < stripes; i += 2) {
      c.fillStyle = 'rgba(255,255,255,.75)';
      const x0 = 6 + ((W - 12) * i) / stripes, x1 = 6 + ((W - 12) * (i + 1)) / stripes;
      c.beginPath();
      c.moveTo(x0, bodyTop + 10);
      c.lineTo(34 + ((W - 68) * i) / stripes, roofY);
      c.lineTo(34 + ((W - 68) * (i + 1)) / stripes, roofY);
      c.lineTo(x1, bodyTop + 10);
      c.fill();
    }
    // mép rèm lượn sóng
    for (let i = 0; i < stripes; i++) {
      c.fillStyle = i % 2 ? '#FFFFFF' : def.roof;
      c.beginPath();
      const sx = 6 + ((W - 12) * i) / stripes, sw = (W - 12) / stripes;
      c.arc(sx + sw / 2, bodyTop + 10, sw / 2, 0, Math.PI);
      c.fill();
    }
    // biển tên
    c.font = `800 26px ${TEXT_FONT}`;
    const label = def.name;
    const tw = c.measureText(label).width + 70;
    c.fillStyle = '#FFFFFF';
    rr(c, W / 2 - tw / 2, roofY - 46, tw, 48, 24);
    c.fill();
    c.strokeStyle = def.roof;
    c.lineWidth = 4;
    c.stroke();
    c.fillStyle = '#4A3B55';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(label, W / 2 - tw / 2 + 52, roofY - 21);
    c.font = `28px ${EMOJI_FONT}`;
    c.fillText(def.keeper, W / 2 - tw / 2 + 14, roofY - 20);
    // cửa
    const dw = 58, dh = 86, dx = W / 2 - dw / 2, dy = H - 4 - dh;
    c.fillStyle = '#B68C6E';
    rr(c, dx - 5, dy - 5, dw + 10, dh + 5, [30, 30, 0, 0]);
    c.fill();
    c.fillStyle = '#E2B48F';
    rr(c, dx, dy, dw, dh, [26, 26, 0, 0]);
    c.fill();
    c.fillStyle = '#BFE3FF';
    rr(c, dx + 12, dy + 12, dw - 24, 26, 12);
    c.fill();
    c.fillStyle = '#FFD36E';
    c.beginPath();
    c.arc(dx + dw - 12, dy + dh / 2 + 8, 4.5, 0, 7);
    c.fill();
    // cửa sổ trưng bày
    const [e1, e2] = SHOP_WINDOW[id];
    for (const [wx, e] of [[38, e1], [W - 38 - 74, e2]] as const) {
      c.fillStyle = '#FFFFFF';
      rr(c, wx - 4, dy + 2, 82, 60, 14);
      c.fill();
      c.fillStyle = '#D6EEFF';
      rr(c, wx, dy + 6, 74, 52, 11);
      c.fill();
      c.font = `34px ${EMOJI_FONT}`;
      c.textAlign = 'center';
      c.fillText(e, wx + 37, dy + 34);
    }
  });
}

function barnSprite() {
  const W = 6 * T, UP = 1.9 * T, H = 2 * T + UP;
  return sprite('barn', W, H, (c) => {
    shadow(c, W / 2, H - 6, W / 2 - 6, 14, 0.18);
    const top = UP;
    const g = c.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, '#FFB8B8');
    g.addColorStop(1, '#F29191');
    c.fillStyle = g;
    rr(c, 20, top - 10, W - 40, H - top + 6, 10);
    c.fill();
    c.fillStyle = '#9277C8';
    c.beginPath();
    c.moveTo(6, top + 4);
    c.lineTo(W / 2, 8);
    c.lineTo(W - 6, top + 4);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(255,255,255,.2)';
    c.beginPath();
    c.moveTo(6, top + 4);
    c.lineTo(W / 2, 8);
    c.lineTo(W / 2, 30);
    c.lineTo(36, top + 4);
    c.fill();
    // cửa chữ X
    const dw = 92, dh = 92, dx = W / 2 - dw / 2, dy = H - 6 - dh;
    c.fillStyle = '#FFF4EC';
    c.fillRect(dx - 6, dy - 6, dw + 12, dh + 6);
    c.fillStyle = '#E07B7B';
    c.fillRect(dx, dy, dw, dh);
    c.strokeStyle = '#FFF4EC';
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(dx, dy);
    c.lineTo(dx + dw, dy + dh);
    c.moveTo(dx + dw, dy);
    c.lineTo(dx, dy + dh);
    c.stroke();
    c.fillStyle = '#FFF4EC';
    c.beginPath();
    c.arc(W / 2, top - 30, 24, 0, 7);
    c.fill();
    c.font = `28px ${EMOJI_FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('🐮', W / 2, top - 28);
  });
}

// ---------- ĐỒ ĐẠC ----------
const TALL = new Set(['bookshelf', 'wardrobe', 'fridge', 'clock', 'oven']);

function furnitureEntity(o: WorldObject, st: RenderState): Entity {
  const h = o.height ?? 36;
  const x = o.x * T + 5, y = o.y * T + 6, w = o.w * T - 10, d = o.h * T - 12;
  const base = (o.y + o.h) * T;
  const box = furnitureBox(o);
  return {
    y: o.wall ? (o.y + 1) * T + 1 : base - 4, x0: Math.min(x, box?.x ?? x), x1: Math.max(x + w, box ? box.x + box.w : 0), top: Math.min(y - h - 40, (box?.y ?? 1e9) - 40),
    draw(c, t) {
      if (drawFurnitureArt(c, o)) return furnitureOverlay(c, o, st, t);
      if (o.wall) return;
      shadow(c, x + w / 2, base - 6, w / 2 + 4, 8);
      // mặt trước
      const g = c.createLinearGradient(0, y + d - h, 0, y + d);
      g.addColorStop(0, o.color ?? '#EED');
      g.addColorStop(1, shadeHex(o.color ?? '#EEDDCC', -0.14));
      c.fillStyle = g;
      rr(c, x, y + d - h, w, h + 2, [4, 4, 12, 12]);
      c.fill();
      // mặt trên
      c.fillStyle = shadeHex(o.color ?? '#EEDDCC', 0.35);
      rr(c, x, y - h, w, d, 12);
      c.fill();
      c.strokeStyle = 'rgba(90,60,100,.12)';
      c.lineWidth = 2;
      c.stroke();
      if (o.id === 'wardrobe' || o.id === 'fridge') {
        c.strokeStyle = 'rgba(90,60,100,.18)';
        c.beginPath();
        if (o.id === 'wardrobe') {
          c.moveTo(x + w / 2, y + d - h + 6);
          c.lineTo(x + w / 2, y + d - 4);
        } else {
          c.moveTo(x + 4, y + d - h * 0.45);
          c.lineTo(x + w - 4, y + d - h * 0.45);
        }
        c.stroke();
      }
      if (o.id === 'bed') {
        // gối + chăn
        c.fillStyle = '#FFFFFF';
        rr(c, x + 10, y - h + 8, w - 20, 26, 12);
        c.fill();
        c.fillStyle = '#FFB5D0';
        rr(c, x + 6, y - h + 44, w - 12, d - 52, 14);
        c.fill();
      }
      const size = Math.min(w, d) * (TALL.has(o.id) ? 0.62 : 0.7);
      const ey = TALL.has(o.id) ? y + d - h / 2 : y - h + d / 2;
      // trạng thái đặc biệt
      if (o.id === 'lamp' && st.lampOn) {
        const gl = c.createRadialGradient(x + w / 2, y - h, 4, x + w / 2, y - h, 150);
        gl.addColorStop(0, 'rgba(255,236,150,.55)');
        gl.addColorStop(1, 'rgba(255,236,150,0)');
        c.fillStyle = gl;
        c.beginPath();
        c.arc(x + w / 2, y - h, 150, 0, 7);
        c.fill();
      }
      if (o.id === 'oven' && st.save.oven) {
        const ready = st.now >= st.save.oven.doneAt;
        c.fillStyle = ready ? 'rgba(255,214,110,.9)' : `rgba(255,150,90,${0.55 + 0.25 * Math.sin(t / 200)})`;
        rr(c, x + 10, y + d - h + 10, w - 20, h - 22, 8);
        c.fill();
        if (ready) {
          drawEmoji(c, ITEM_BY_ID.get(st.save.oven.recipe)?.emoji ?? '✨', x + w / 2, y - h - 26 - Math.abs(Math.sin(t / 300)) * 8, 34);
        } else {
          const p = 1 - (st.save.oven.doneAt - st.now) / (RECIPE_BY_ID.get(st.save.oven.recipe)?.bakeMs ?? 8000);
          ring(c, x + w / 2, y - h - 24, 16, Math.max(0.05, Math.min(1, p)));
        }
        return drawEmoji(c, '🍞', x + w / 2, ey, size * 0.8);
      }
      drawEmoji(c, o.id === 'oven' ? '🧁' : o.emoji, x + w / 2, ey, size);
    },
  };
}

/** Trạng thái vẽ thêm trên hình đồ đạc: đèn sáng, lò đang nướng. */
function furnitureOverlay(c: CanvasRenderingContext2D, o: WorldObject, st: RenderState, t: number) {
  const box = furnitureBox(o)!;
  const cx = box.x + box.w / 2;
  if ((o.id === 'lamp' || o.id === 'bed-lamp') && st.lampOn) {
    const ly = box.y + box.h * 0.2;
    const gl = c.createRadialGradient(cx, ly, 4, cx, ly, 140);
    gl.addColorStop(0, 'rgba(255,236,150,.5)');
    gl.addColorStop(1, 'rgba(255,236,150,0)');
    c.fillStyle = gl;
    c.beginPath();
    c.arc(cx, ly, 140, 0, 7);
    c.fill();
  }
  if (o.id === 'oven' && st.save.oven) {
    const ready = st.now >= st.save.oven.doneAt;
    c.fillStyle = ready ? 'rgba(255,214,110,.55)' : `rgba(255,150,90,${0.35 + 0.15 * Math.sin(t / 400)})`;
    rr(c, box.x + box.w * 0.2, box.y + box.h * 0.4, box.w * 0.6, box.h * 0.35, 8);
    c.fill();
    if (ready) drawEmoji(c, ITEM_BY_ID.get(st.save.oven.recipe)?.emoji ?? '✨', cx, box.y - 22 - Math.abs(Math.sin(t / 300)) * 8, 34);
    else {
      const p = 1 - (st.save.oven.doneAt - st.now) / (RECIPE_BY_ID.get(st.save.oven.recipe)?.bakeMs ?? 8000);
      ring(c, cx, box.y - 20, 16, Math.max(0.05, Math.min(1, p)));
    }
  }
}

function ring(c: CanvasRenderingContext2D, x: number, y: number, r: number, p: number) {
  c.lineWidth = 7;
  c.strokeStyle = 'rgba(255,255,255,.9)';
  c.beginPath();
  c.arc(x, y, r, 0, 7);
  c.stroke();
  c.strokeStyle = '#7ED492';
  c.beginPath();
  c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
  c.stroke();
}

export function shadeHex(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)));
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------- BIỂN TÊN, GIẾNG ----------
function signEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.85) * T;
  return {
    y: gy, x0: cx - 60, x1: cx + 60, top: gy - 90,
    draw(c) {
      const sp = sprite(`sign:${o.id}`, 140, 96, (s) => {
        shadow(s, 70, 90, 20, 5);
        s.fillStyle = '#C89F83';
        rr(s, 64, 40, 12, 52, 5);
        s.fill();
        s.font = `800 20px ${TEXT_FONT}`;
        const tw = Math.max(70, s.measureText((o.label ?? o.word)).width + 48);
        s.fillStyle = '#FFF6EA';
        rr(s, 70 - tw / 2, 6, tw, 40, 14);
        s.fill();
        s.strokeStyle = '#D9B38C';
        s.lineWidth = 3;
        s.stroke();
        s.fillStyle = '#4A3B55';
        s.textAlign = 'left';
        s.textBaseline = 'middle';
        s.fillText((o.label ?? o.word), 70 - tw / 2 + 38, 27);
        s.font = `20px ${EMOJI_FONT}`;
        s.fillText(o.emoji, 70 - tw / 2 + 9, 27);
      });
      c.drawImage(sp, cx - 70, gy - 90, 140, 96);
    },
  };
}

function wellEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.9) * T;
  return {
    y: gy, x0: cx - 40, x1: cx + 40, top: gy - 110,
    draw(c) {
      const sp = sprite('well', 90, 120, (s) => {
        shadow(s, 45, 112, 36, 8);
        s.fillStyle = '#C9C3D6';
        rr(s, 10, 64, 70, 46, 18);
        s.fill();
        s.fillStyle = '#A9DCFF';
        s.beginPath();
        s.ellipse(45, 68, 30, 10, 0, 0, 7);
        s.fill();
        s.fillStyle = '#B68C6E';
        s.fillRect(12, 18, 7, 54);
        s.fillRect(71, 18, 7, 54);
        s.fillStyle = '#F59494';
        s.beginPath();
        s.moveTo(2, 26);
        s.lineTo(45, 2);
        s.lineTo(88, 26);
        s.closePath();
        s.fill();
        s.font = `22px ${EMOJI_FONT}`;
        s.textAlign = 'center';
        s.fillText('🪣', 45, 54);
      });
      c.drawImage(sp, cx - 45, gy - 112, 90, 120);
    },
  };
}

// ---------- CÂY TRONG VƯỜN (động, theo toạ độ ô) ----------
export function plotEntities(_map: WorldMap, st: RenderState): Entity[] {
  const out: Entity[] = [];
  for (const [key, p] of Object.entries(st.save.plots)) {
    const [tx, ty] = key.split(',').map(Number);
    const x = tx * T, y = ty * T;
    out.push({
      flat: true, y, x0: x, x1: x + T, top: y,
      draw(c) {
        c.fillStyle = p.wateredAt !== undefined ? '#B88A63' : '#C99C74';
        rr(c, x + 4, y + 6, T - 8, T - 10, 14);
        c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)';
        rr(c, x + 8, y + 9, T - 16, 8, 4);
        c.fill();
      },
    });
    const stage = plotStage(p, st.now);
    const prog = plotProgress(p, st.now);
    const crop = ITEM_BY_ID.get(ITEM_BY_ID.get(p.crop)!.grows!)!;
    const isTree = crop.id === 'apple';
    out.push({
      y: y + T - 6, x0: x - 20, x1: x + T + 20, top: y - 90,
      draw(c, t) {
        const cx = x + T / 2, by = y + T - 14;
        if (stage === 'ready') {
          const bob = Math.abs(Math.sin(t / 350)) * 5;
          if (isTree) drawEmoji(c, '🌳', cx, by - 34, 58);
          drawEmoji(c, crop.emoji, cx + (isTree ? 10 : 0), by - (isTree ? 40 : 22) - bob, isTree ? 26 : 40);
          drawEmoji(c, '✨', cx + 22, by - 50, 18);
          return;
        }
        // mầm cây lớn dần
        const s = stage === 'dry' ? 0.35 : 0.45 + prog * 0.55;
        c.strokeStyle = isTree ? '#A57C62' : '#6DBB6A';
        c.lineWidth = isTree ? 6 : 4;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(cx, by);
        c.lineTo(cx, by - 30 * s);
        c.stroke();
        c.fillStyle = '#8FD48B';
        for (const dir of [-1, 1]) {
          c.beginPath();
          c.ellipse(cx + dir * 10 * s, by - 28 * s, 11 * s, 6 * s, dir * -0.5, 0, 7);
          c.fill();
        }
        if (stage === 'weeds') {
          drawEmoji(c, '🌿', cx - 18, by - 6, 22);
          drawEmoji(c, '🌿', cx + 18, by - 4, 20);
          bubble(c, cx + 18, by - 50 - Math.abs(Math.sin(t / 400)) * 5, '🌿', 24);
        } else if (stage === 'dry') drawEmoji(c, '💧', cx + 16, by - 40 - Math.abs(Math.sin(t / 400)) * 5, 22);
        else ring(c, cx + 20, by - 44, 9, prog);
      },
    });
  }
  return out;
}

// ---------- CON VẬT (động) ----------
export function animalEntities(map: WorldMap, st: RenderState): Entity[] {
  return map.objects
    .filter((o) => o.kind === 'animal')
    .map((o) => {
      const a = ANIMALS[o.animal!];
      const cx = (o.x + 0.5) * T, gy = (o.y + 0.85) * T;
      const onWater = o.animal === 'duck';
      return {
        y: gy, x0: cx - 70, x1: cx + 70, top: gy - 130,
        draw(c, t) {
          const ph = t / 500 + o.x;
          const bob = onWater ? Math.sin(ph) * 3 : Math.abs(Math.sin(ph)) * 5;
          shadow(c, cx, gy, o.animal === 'cow' || o.animal === 'horse' ? 46 : 28, 8, onWater ? 0.08 : 0.16);
          if (!drawAnimalArt(c, o, t, st.fedAt[o.id])) {
            c.save();
            c.translate(cx, gy - 30 - bob);
            if (Math.sin(t / 2600 + o.y) > 0) c.scale(-1, 1); // thỉnh thoảng quay đầu
            drawEmoji(c, a.emoji, 0, 0, o.animal === 'cow' ? 62 : 54);
            c.restore();
          }
          // gợi ý: có trứng / sữa
          if (a.gives && animalReadyIn(st.save, a.id, st.now) === 0) {
            bubble(c, cx + 26, gy - 78 - Math.abs(Math.sin(t / 420)) * 4, ITEM_BY_ID.get(a.gives)!.emoji);
          }
          const fed = st.fedAt[o.id];
          if (fed && st.now - fed < 1800) {
            const k = (st.now - fed) / 1800;
            c.globalAlpha = 1 - k;
            drawEmoji(c, '💖', cx, gy - 80 - k * 40, 30);
            c.globalAlpha = 1;
          }
        },
      };
    });
}

export function bubble(c: CanvasRenderingContext2D, x: number, y: number, emoji: string, size = 26) {
  c.fillStyle = '#FFFFFF';
  c.beginPath();
  c.arc(x, y, size * 0.8, 0, 7);
  c.fill();
  c.beginPath();
  c.moveTo(x - 6, y + size * 0.7);
  c.lineTo(x - 12, y + size * 1.1);
  c.lineTo(x + 4, y + size * 0.75);
  c.fill();
  c.strokeStyle = 'rgba(90,60,100,.12)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, size * 0.8, 0, 7);
  c.stroke();
  drawEmoji(c, emoji, x, y + 1, size);
}

// ---------- VẬT TRANG TRÍ & BẢNG TRÒ CHƠI (SPEC 16) ----------
const DECOR_SIZE: Record<string, number> = { 'flower-pot': 48, bench: 56, fountain: 70, birdhouse: 40, rainbow: 96 };

function decorEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.85) * T;
  const size = DECOR_SIZE[o.decor ?? ''] ?? 50;
  return {
    y: gy, x0: cx - 70, x1: cx + 70, top: gy - 160,
    draw(c, t) {
      shadow(c, cx, gy, size * 0.45, 8);
      if (o.decor === 'birdhouse') {
        c.fillStyle = '#B68C6E';
        rr(c, cx - 4, gy - 70, 8, 70, 4);
        c.fill();
        c.fillStyle = '#FFD1E3';
        rr(c, cx - 22, gy - 104, 44, 38, 8);
        c.fill();
        c.fillStyle = '#A992E2';
        c.beginPath();
        c.moveTo(cx - 28, gy - 100);
        c.lineTo(cx, gy - 124);
        c.lineTo(cx + 28, gy - 100);
        c.closePath();
        c.fill();
        c.fillStyle = '#6D4C41';
        c.beginPath();
        c.arc(cx, gy - 86, 7, 0, 7);
        c.fill();
        drawEmoji(c, '🐦', cx + 26, gy - 120 - Math.abs(Math.sin(t / 500)) * 6, 26);
        return;
      }
      if (o.decor === 'rainbow') {
        drawEmoji(c, '🌈', cx, gy - 70 - Math.sin(t / 900) * 4, size);
        drawEmoji(c, '☁️', cx - 40, gy - 30, 34);
        drawEmoji(c, '☁️', cx + 40, gy - 30, 34);
        return;
      }
      if (o.decor === 'fountain') {
        c.fillStyle = '#D9E8F5';
        c.beginPath();
        c.ellipse(cx, gy - 10, 34, 14, 0, 0, 7);
        c.fill();
        c.fillStyle = '#A9DCFF';
        c.beginPath();
        c.ellipse(cx, gy - 12, 26, 9, 0, 0, 7);
        c.fill();
      }
      drawEmoji(c, o.emoji, cx, gy - size * 0.5, size);
      if (o.decor === 'fountain') {
        for (let i = 0; i < 3; i++) {
          const k = ((t / 600 + i / 3) % 1);
          c.fillStyle = `rgba(169,220,255,${1 - k})`;
          c.beginPath();
          c.arc(cx + (i - 1) * 12, gy - 60 - k * 20, 4, 0, 7);
          c.fill();
        }
      }
    },
  };
}

function boardEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.85) * T;
  return {
    y: gy, x0: cx - 60, x1: cx + 60, top: gy - 120,
    draw(c, t) {
      const sp = sprite('gameboard', 120, 120, (s) => {
        shadow(s, 60, 114, 44, 7);
        s.fillStyle = '#B68C6E';
        rr(s, 22, 60, 8, 56, 4);
        s.fill();
        rr(s, 90, 60, 8, 56, 4);
        s.fill();
        s.fillStyle = '#C89F83';
        rr(s, 6, 8, 108, 72, 12);
        s.fill();
        s.fillStyle = '#7DBF8E';
        rr(s, 13, 15, 94, 58, 8);
        s.fill();
        s.fillStyle = '#FFFFFF';
        s.font = `800 18px ${TEXT_FONT}`;
        s.textAlign = 'center';
        s.textBaseline = 'middle';
        s.fillText('GAMES', 60, 56);
        s.font = `22px ${EMOJI_FONT}`;
        s.fillText('🎲⭐🧩', 60, 32);
      });
      c.drawImage(sp, cx - 60, gy - 114 - Math.abs(Math.sin(t / 700)) * 2, 120, 120);
    },
  };
}

// ---------- SỞ THÚ: cổng, trạm chăm sóc, ki-ốt sách (SPEC 19.2) ----------
function zooGateEntity(o: WorldObject): Entity {
  // cổng phủ từ x=16 đến x=24 (2 trụ + vòm), lối vào ở giữa
  const x0 = o.x * T, x1 = (o.x + 8) * T, gy = (o.y + 0.95) * T;
  const W = x1 - x0, H = 3.4 * T;
  return {
    y: gy, x0, x1, top: gy - H,
    draw(c) {
      const sp = sprite('zoo-gate', W, H, (s) => {
        const pill = (px: number) => {
          shadow(s, px + 0.75 * T, H - 6, 0.9 * T, 10, 0.18);
          const g = s.createLinearGradient(px, 0, px + 1.5 * T, 0);
          g.addColorStop(0, '#E9C79A');
          g.addColorStop(1, '#C99B66');
          s.fillStyle = g;
          rr(s, px + 8, H * 0.28, 1.5 * T - 16, H * 0.72 - 6, 10);
          s.fill();
          s.fillStyle = '#B07D4B';
          rr(s, px, H * 0.24, 1.5 * T, 22, 8);
          s.fill();
          s.font = `40px ${EMOJI_FONT}`;
          s.textAlign = 'center';
          s.textBaseline = 'middle';
          s.fillText(px < W / 2 ? '🦁' : '🐘', px + 0.75 * T, H * 0.55);
        };
        pill(0.6 * T);
        pill(W - 2.1 * T);
        // vòm + bảng tên
        s.strokeStyle = '#7CB342';
        s.lineWidth = 16;
        s.lineCap = 'round';
        s.beginPath();
        s.moveTo(1.35 * T, H * 0.28);
        s.quadraticCurveTo(W / 2, -10, W - 1.35 * T, H * 0.28);
        s.stroke();
        s.fillStyle = '#FFF8E1';
        rr(s, W / 2 - 2.3 * T, H * 0.1, 4.6 * T, 0.95 * T, 22);
        s.fill();
        s.strokeStyle = '#FF9800';
        s.lineWidth = 6;
        s.stroke();
        s.font = `800 ${Math.round(0.56 * T)}px ${TEXT_FONT}`;
        s.textAlign = 'center';
        s.textBaseline = 'middle';
        const letters = 'HAPPY ZOO'.split('');
        const cols = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '', '#8E24AA', '#E53935', '#FB8C00'];
        const total = s.measureText('HAPPY ZOO').width;
        let lx = W / 2 - total / 2;
        letters.forEach((ch, i) => {
          const w = s.measureText(ch).width;
          s.fillStyle = cols[i] || '#000';
          s.fillText(ch, lx + w / 2, H * 0.1 + 0.5 * T);
          lx += w;
        });
        s.font = `30px ${EMOJI_FONT}`;
        s.fillText('🦒', W / 2 - 2.7 * T, H * 0.2);
        s.fillText('🐧', W / 2 + 2.7 * T, H * 0.2);
      });
      c.drawImage(sp, x0, gy - H, W, H);
    },
  };
}

function careEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.9) * T;
  return {
    y: gy, x0: cx - 50, x1: cx + 50, top: gy - 110,
    draw(c, t) {
      const sp = sprite('care-stall', 100, 110, (s) => {
        shadow(s, 50, 104, 40, 7);
        s.fillStyle = '#C89F83';
        rr(s, 14, 50, 72, 54, 8);
        s.fill();
        s.fillStyle = '#A1714A';
        s.fillRect(14, 64, 72, 5);
        s.fillStyle = '#7CB342';
        s.beginPath();
        s.moveTo(4, 50);
        s.lineTo(50, 18);
        s.lineTo(96, 50);
        s.closePath();
        s.fill();
        s.fillStyle = '#FFF';
        for (let i = 0; i < 4; i++) {
          s.beginPath();
          s.moveTo(14 + i * 22, 50);
          s.lineTo(25 + i * 22, 50);
          s.lineTo(36 + i * 22 - 11, 38);
          s.fill();
        }
        s.font = `26px ${EMOJI_FONT}`;
        s.textAlign = 'center';
        s.textBaseline = 'middle';
        s.fillText('🧺', 36, 84);
        s.fillText('🪣', 66, 84);
      });
      c.drawImage(sp, cx - 50, gy - 104 - Math.abs(Math.sin(t / 900)) * 1.5, 100, 110);
    },
  };
}

function kioskEntity(o: WorldObject): Entity {
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.9) * T;
  return {
    y: gy, x0: cx - 50, x1: cx + 50, top: gy - 120,
    draw(c) {
      const sp = sprite('zoo-book', 100, 120, (s) => {
        shadow(s, 50, 114, 34, 6);
        s.fillStyle = '#8D6E63';
        rr(s, 44, 56, 12, 58, 4);
        s.fill();
        s.fillStyle = '#FFF8E1';
        rr(s, 8, 10, 84, 52, 12);
        s.fill();
        s.strokeStyle = '#FFB300';
        s.lineWidth = 4;
        s.stroke();
        s.font = `800 15px ${TEXT_FONT}`;
        s.fillStyle = '#6D4C41';
        s.textAlign = 'center';
        s.textBaseline = 'middle';
        s.fillText('ZOO BOOK', 50, 48);
        s.font = `22px ${EMOJI_FONT}`;
        s.fillText('📖🦁🐧', 50, 26);
      });
      c.drawImage(sp, cx - 50, gy - 116, 100, 120);
    },
  };
}

// ---------- DỰNG DANH SÁCH VẬT TĨNH ----------
export function buildStatics(map: WorldMap, st: RenderState): Entity[] {
  const out: Entity[] = [];
  for (let y = 0; y < map.h; y++)
    for (let x = 0; x < map.w; x++) {
      const ch = map.tiles[y][x];
      if (ch === '#') out.push(wallEntity(map, x, y));
      else if (ch === 'f') out.push(fenceEntity(map, x, y));
      else if (ch === 'T') {
        const cx = (x + 0.5) * T, gy = (y + 0.9) * T;
        out.push({ y: gy, x0: cx - 60, x1: cx + 60, top: gy - 145, draw: (c) => c.drawImage(treeSprite(), cx - 60, gy - 142, 120, 150) });
      } else if (ch === '*') {
        const cx = (x + 0.5) * T, gy = (y + 0.9) * T;
        out.push({ y: gy, x0: cx - 38, x1: cx + 38, top: gy - 56, draw: (c) => c.drawImage(bushSprite(), cx - 38, gy - 54, 76, 60) });
      }
    }
  for (const o of map.objects) {
    if (o.kind === 'furniture') out.push(furnitureEntity(o, st));
    else if (o.kind === 'sign') out.push(signEntity(o));
    else if (o.kind === 'well') out.push(wellEntity(o));
    else if (o.kind === 'decor') out.push(decorEntity(o));
    else if (o.kind === 'board') out.push(boardEntity(o));
    else if (o.kind === 'gate' && o.id === 'zoo-gate') out.push(zooGateEntity(o));
    else if (o.kind === 'care') out.push(careEntity(o));
    else if (o.kind === 'kiosk') out.push(kioskEntity(o));
    else if (o.kind === 'tree') {
      const g = treeGeom(o);
      if (!g) continue;
      out.push({
        y: g.gy, x0: g.cx - g.W / 2, x1: g.cx + g.W / 2, top: g.gy - g.H,
        draw(c, t) {
          shadow(c, g.cx, g.gy - 4, g.W * 0.3, 10, 0.14);
          st.orchard ??= { falling: [] };
          if (!drawTreeArt(c, o, st.save, st.orchard, st.now, t)) drawEmoji(c, '🌳', g.cx, g.gy - 60, 110);
        },
      });
    }
    else if (o.kind === 'shop') {
      const W = 5 * T, UP = 1.7 * T;
      const x = o.x * T, top = o.y * T - UP;
      out.push({ y: (o.y + o.h) * T, x0: x, x1: x + W, top, draw: (c) => c.drawImage(shopSprite(o.shop!), x, top, W, 3 * T + UP) });
    } else if (o.kind === 'barn') {
      const W = 6 * T, UP = 1.9 * T;
      const x = o.x * T, top = o.y * T - UP;
      out.push({ y: (o.y + o.h) * T, x0: x, x1: x + W, top, draw: (c) => c.drawImage(barnSprite(), x, top, W, 2 * T + UP) });
    }
  }
  return out;
}

// ---------- CAMERA + KHUNG HÌNH ----------
export interface Camera { x: number; y: number; scale: number }

export function drawWorld(
  c: CanvasRenderingContext2D,
  view: { w: number; h: number; dpr: number },
  cam: Camera,
  ground: HTMLCanvasElement,
  entities: Entity[],
  overlay: (c: CanvasRenderingContext2D) => void,
  t: number,
) {
  const { w, h, dpr } = view;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#A9DB98';
  c.fillRect(0, 0, w, h);
  const s = cam.scale;
  c.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - cam.x * s), dpr * (h / 2 - cam.y * s));
  const vx0 = cam.x - w / 2 / s, vy0 = cam.y - h / 2 / s, vx1 = cam.x + w / 2 / s, vy1 = cam.y + h / 2 / s;
  const sx = Math.max(0, Math.floor(vx0)), sy = Math.max(0, Math.floor(vy0));
  const sw = Math.min(ground.width, Math.ceil(vx1)) - sx, sh = Math.min(ground.height, Math.ceil(vy1)) - sy;
  if (sw > 0 && sh > 0) c.drawImage(ground, sx, sy, sw, sh, sx, sy, sw, sh);

  const visible = entities.filter((e) => e.x1 >= vx0 - 20 && e.x0 <= vx1 + 20 && e.y >= vy0 - 20 && e.top <= vy1 + 20);
  for (const e of visible) if (e.flat) e.draw(c, t);
  const tall = visible.filter((e) => !e.flat).sort((a, b) => a.y - b.y);
  for (const e of tall) e.draw(c, t);
  overlay(c);
}
