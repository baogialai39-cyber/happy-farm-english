/**
 * Vẽ thế giới bằng thư viện hình gần thực tế (SPEC 18.1): đồ đạc, con vật, cây ăn quả + quả + giỏ.
 * Hình SVG được vẽ thành ảnh 1 lần (cache). Khi ảnh chưa sẵn sàng → nơi gọi dùng hình dự phòng.
 */
import { artAspect, artSvg, cachedImage, hasArt, preloadImages } from '../art/library';
import { type AnimalArt, animalSvg } from '../art/library/animals';
import { type FruitKind, fruitIcon } from '../art/library/fruits';
import { TREE_BY_ID, type TreeDef } from '../art/library/trees';
import { TILE as T, type WorldObject } from './map';
import { count, FRUIT_REGROW_MS, fruitRipe, type WorldSave } from './save';

/** Độ nét khi vẽ SVG thành ảnh (bù camera phóng to + màn hình mật độ cao). */
const RASTER = 3;

type Want = { key: string; svg: () => string | null; w: number; h: number };
const wanted = new Map<string, Want>();

function img(key: string, svg: () => string | null, w: number, h: number): HTMLImageElement | undefined {
  const W = Math.round(w * RASTER), H = Math.round(h * RASTER);
  const k = `${key}@${W}x${H}`;
  if (!wanted.has(k)) wanted.set(k, { key, svg, w: W, h: H });
  return cachedImage(key, svg, W, H);
}

/** Tải trước mọi hình đã đăng ký (gọi sau khi dựng danh sách vật thể). */
export function preloadWorldArt(): Promise<void> {
  return preloadImages([...wanted.values()]);
}

// ---------- ĐỒ ĐẠC ----------
/** id đồ vật trên bản đồ → tên hình trong thư viện. */
const ART_FOR: Record<string, string> = {
  mixing: 'mixing bowl', fridge: 'refrigerator', table: 'dining table', 'coffee-table': 'table',
  'bed-lamp': 'lamp', shelf: 'kitchen shelf', 'window-1': 'window', 'window-2': 'window',
};
/** Đồ nhỏ vẽ nhỏ hơn ô chân. */
const SMALL: Record<string, number> = { toothbrush: 0.8, soap: 0.75, towel: 0.9, chair: 0.9, table: 0.95, television: 0.95, lamp: 0.85 };

export function artKeyFor(o: WorldObject): string | null {
  const k = ART_FOR[o.id] ?? o.id;
  if (hasArt(k)) return k;
  return hasArt(o.word) ? o.word : null;
}

/** Khung vẽ của đồ vật (px thế giới) — dùng chung cho vẽ và chạm. */
export function furnitureBox(o: WorldObject): { x: number; y: number; w: number; h: number } | null {
  const key = artKeyFor(o);
  if (!key) return null;
  const w = o.w * T * (SMALL[key] ?? 1) - (o.w > 1 ? 6 : 2);
  const h = w * artAspect(key);
  const cx = (o.x + o.w / 2) * T;
  if (o.wall) {
    const ww = T * 0.78, hh = ww * artAspect(key);
    return { x: cx - ww / 2, y: (o.y + 1) * T - 4 - hh, w: ww, h: hh };
  }
  const base = (o.y + o.h) * T - 2;
  return { x: cx - w / 2, y: base - h, w, h };
}

/** Vẽ đồ đạc bằng hình. Trả false nếu ảnh chưa sẵn sàng. */
export function drawFurnitureArt(c: CanvasRenderingContext2D, o: WorldObject): boolean {
  const key = artKeyFor(o);
  const box = furnitureBox(o);
  if (!key || !box) return false;
  const im = img(`h:${key}`, () => artSvg(key), box.w, box.h);
  if (!im) return false;
  c.drawImage(im, box.x, box.y, box.w, box.h);
  return true;
}

// ---------- CON VẬT ----------
/** Bề ngang con vật (số ô) — giữ tỉ lệ thật: ngựa/bò to, gà/thỏ/mèo nhỏ. */
const ANIMAL_SIZE: Record<AnimalArt, number> = { cow: 1.9, horse: 2.0, pig: 1.5, sheep: 1.5, dog: 1.25, cat: 1.05, rabbit: 1.0, chicken: 1.0, duck: 1.1 };

export function animalBox(o: WorldObject): { x: number; y: number; w: number; h: number } {
  const kind = o.animal as AnimalArt;
  const w = (ANIMAL_SIZE[kind] ?? 1.3) * T, h = (w * 180) / 220;
  const cx = (o.x + 0.5) * T, gy = (o.y + 0.85) * T;
  return { x: cx - w / 2, y: gy - (h * 168) / 180, w, h };
}

/**
 * Con vật: thở (phập phồng), bước nhẹ tại chỗ, thỉnh thoảng quay đầu (SPEC 18.3).
 * Trả false nếu ảnh chưa sẵn sàng.
 */
export function drawAnimalArt(c: CanvasRenderingContext2D, o: WorldObject, t: number, tapAt?: number): boolean {
  const kind = o.animal as AnimalArt;
  const box = animalBox(o);
  const im = img(`a:${kind}`, () => animalSvg(kind), box.w, box.h);
  if (!im) return false;
  const cx = box.x + box.w / 2, gy = (o.y + 0.85) * T;
  const ph = t / 600 + o.x * 1.7;
  const water = kind === 'duck';
  let bob = water ? Math.sin(ph) * 2.5 : 0;
  if (kind === 'rabbit') bob = Math.max(0, Math.sin(t / 380 + o.y)) ** 6 * 10; // thỏ nhảy lò cò
  else if (!water) bob = Math.max(0, Math.sin(ph * 2)) * 1.6; // bước nhẹ tại chỗ
  const breathe = 1 + Math.sin(ph * 1.6) * 0.022;
  // vui khi được chạm: nhún lên
  let hop = 0;
  if (tapAt !== undefined) {
    const k = (Date.now() - tapAt) / 600;
    if (k >= 0 && k < 1) hop = Math.sin(k * Math.PI) * 12;
  }
  const flip = Math.sin(t / 2600 + o.y * 1.3) > 0.35 ? -1 : 1; // thỉnh thoảng quay đầu
  c.save();
  c.translate(cx, gy - bob - hop);
  c.scale(flip, breathe);
  if (water) {
    // phần dưới chìm trong nước
    c.beginPath();
    c.rect(-box.w / 2 - 2, -box.h - 10, box.w + 4, box.h + 2 - box.h * 0.1);
    c.clip();
  }
  c.drawImage(im, -box.w / 2, -(box.h * 168) / 180, box.w, box.h);
  c.restore();
  if (water) {
    c.strokeStyle = 'rgba(255,255,255,.7)';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, gy - box.h * 0.08, box.w * 0.42 + Math.sin(ph) * 2, 5, 0, 0, 7);
    c.stroke();
  }
  return true;
}

// ---------- CÂY ĂN QUẢ ----------
/** Một quả đang rơi xuống giỏ (hiệu ứng, không lưu). */
export interface FallingFruit { tree: string; slot: number; t0: number }
export const FALL_MS = 900;

export interface TreeGeom { def: TreeDef; cx: number; gy: number; k: number; W: number; H: number }

export function treeGeom(o: WorldObject): TreeGeom | null {
  const def = o.tree ? TREE_BY_ID.get(o.tree) : undefined;
  if (!def) return null;
  const W = 3.3 * T, k = W / 260;
  return { def, cx: (o.x + o.w / 2) * T, gy: (o.y + 0.92) * T, k, W, H: 320 * k };
}

/** Toạ độ thế giới của một điểm trong hình cây (viewBox 260×320, gốc ở (130,308)). */
export function treePoint(g: TreeGeom, ax: number, ay: number): { x: number; y: number } {
  return { x: g.cx + (ax - 130) * g.k, y: g.gy + (ay - 308) * g.k };
}

/** Bán kính chạm của quả (px thế giới), đủ lớn cho ngón tay bé. */
export function fruitRadius(g: TreeGeom, slot: number): number {
  return Math.max(24, 26 * g.def.slots[slot].s * g.k);
}

const FRUIT_PX = 44; // ảnh quả vẽ sẵn (đơn vị icon 68 → cỡ ảnh)

function fruitImg(kind: FruitKind, ripe: boolean) {
  return img(`f:${kind}:${ripe ? 1 : 0}`, () => fruitIcon(kind, ripe), FRUIT_PX, FRUIT_PX);
}

/** Vẽ 1 quả quanh điểm (x,y): kích thước theo hệ số s. */
function drawFruit(c: CanvasRenderingContext2D, kind: FruitKind, ripe: boolean, x: number, y: number, size: number) {
  const im = fruitImg(kind, ripe);
  if (!im) return;
  // icon viewBox -34 -38 68 68: tâm quả ở (34,38)
  c.drawImage(im, x - (34 / 68) * size, y - (38 / 68) * size, size, size);
}

function drawBasket(c: CanvasRenderingContext2D, x: number, y: number, w: number, kind: FruitKind, n: number) {
  const h = w * 0.62;
  // quả trong giỏ (nhô lên)
  if (n > 0) {
    const shown = Math.min(n, 3);
    for (let i = 0; i < shown; i++) drawFruit(c, kind, true, x + (i - (shown - 1) / 2) * w * 0.28, y - h * 0.55 - (i === 1 ? 4 : 0), w * 0.62);
  }
  const g = c.createLinearGradient(0, y - h, 0, y);
  g.addColorStop(0, '#D7A86E');
  g.addColorStop(1, '#A1714A');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x - w / 2, y - h * 0.62);
  c.lineTo(x + w / 2, y - h * 0.62);
  c.lineTo(x + w * 0.38, y);
  c.lineTo(x - w * 0.38, y);
  c.closePath();
  c.fill();
  c.strokeStyle = '#7B5233';
  c.lineWidth = 1.5;
  c.stroke();
  // đan nan
  c.strokeStyle = 'rgba(123,82,51,.55)';
  for (let i = 1; i < 4; i++) {
    const yy = y - h * 0.62 + (h * 0.62 * i) / 4;
    c.beginPath();
    c.moveTo(x - w / 2 + (w * 0.12 * i) / 4, yy);
    c.lineTo(x + w / 2 - (w * 0.12 * i) / 4, yy);
    c.stroke();
  }
  c.fillStyle = '#E8C391';
  c.beginPath();
  c.ellipse(x, y - h * 0.62, w / 2, h * 0.12, 0, 0, 7);
  c.fill();
  c.stroke();
  // số lượng trong túi
  if (n > 0) {
    const label = String(n);
    c.font = `800 ${Math.round(w * 0.32)}px "Baloo 2",system-ui,sans-serif`;
    const bw = Math.max(w * 0.42, c.measureText(label).width + 12);
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.roundRect(x + w * 0.22, y - h * 1.15, bw, w * 0.36, w * 0.18);
    c.fill();
    c.strokeStyle = '#7ED492';
    c.lineWidth = 2.5;
    c.stroke();
    c.fillStyle = '#2E7D32';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(label, x + w * 0.22 + bw / 2, y - h * 1.15 + w * 0.19);
  }
}

export interface OrchardFx {
  marked?: { tree: string; slot: number };
  falling: FallingFruit[];
}

/** Vẽ cây + quả (chín / non / đang rơi) + giỏ. */
export function drawTreeArt(c: CanvasRenderingContext2D, o: WorldObject, save: WorldSave, fx: OrchardFx, now: number, t: number): boolean {
  const g = treeGeom(o);
  if (!g) return false;
  const im = img(`t:${g.def.id}`, () => g.def.svg(), g.W, g.H);
  if (!im) return false;
  const sway = Math.sin(t / 1400 + o.x) * 0.012;
  c.save();
  c.translate(g.cx, g.gy);
  c.rotate(sway);
  c.drawImage(im, -g.W / 2, -g.H + (320 - 308) * g.k, g.W, g.H);
  c.restore();
  const kind = g.def.fruit;
  const basket = treePoint(g, g.def.basket.x, g.def.basket.y);
  const basketW = 54 * g.k;
  // quả đang rơi
  const falling = fx.falling.filter((f) => f.tree === g.def.id && now - f.t0 < FALL_MS);
  g.def.slots.forEach((sl, i) => {
    const p = treePoint(g, sl.x, sl.y);
    const size = 68 * sl.s * g.k;
    const ready = save.orchard[g.def.id]?.[i] ?? 0;
    const ripe = fruitRipe(save, g.def.id, i, now);
    const isFalling = falling.some((f) => f.slot === i);
    if (ripe && !isFalling) {
      const wob = Math.sin(t / 700 + i * 1.9) * 1.5;
      if (fx.marked && fx.marked.tree === g.def.id && fx.marked.slot === i) {
        // quả đã chạm lần 1: viền sáng nhẹ (không nhấp nháy nhanh — A8)
        const a = 0.45 + 0.2 * Math.sin(t / 500);
        c.fillStyle = `rgba(255,236,120,${a})`;
        c.beginPath();
        c.arc(p.x, p.y, size * 0.55, 0, 7);
        c.fill();
        c.strokeStyle = '#FFFFFF';
        c.lineWidth = 3;
        c.stroke();
      }
      drawFruit(c, kind, true, p.x, p.y + wob, size);
    } else {
      // quả non nhỏ xanh lớn dần (không biến mất vô lý)
      const prog = Math.max(0, Math.min(1, 1 - (ready - now) / FRUIT_REGROW_MS));
      drawFruit(c, kind, false, p.x, p.y, size * (0.4 + 0.35 * prog));
    }
  });
  drawBasket(c, basket.x, basket.y, basketW, kind, count(save, kind));
  for (const f of falling) {
    const sl = g.def.slots[f.slot];
    const from = treePoint(g, sl.x, sl.y);
    const k = (now - f.t0) / FALL_MS;
    const size = 68 * sl.s * g.k;
    // rơi có trọng lực rồi nảy nhẹ vào giỏ
    const fall = Math.min(1, k / 0.75);
    let x = from.x + (basket.x - from.x) * fall;
    let y = from.y + (basket.y - basketW * 0.45 - from.y) * fall * fall;
    if (k > 0.75) {
      const b = (k - 0.75) / 0.25;
      y -= Math.sin(b * Math.PI) * 10;
      x = basket.x;
    }
    drawFruit(c, kind, true, x, y, size * (1 - 0.25 * fall));
  }
  return true;
}

/** Tìm quả dưới điểm chạm (px thế giới). */
export function fruitAt(objects: readonly WorldObject[], wx: number, wy: number): { o: WorldObject; slot: number } | null {
  let best: { o: WorldObject; slot: number; d: number } | null = null;
  for (const o of objects) {
    if (o.kind !== 'tree') continue;
    const g = treeGeom(o);
    if (!g) continue;
    g.def.slots.forEach((sl, i) => {
      const p = treePoint(g, sl.x, sl.y);
      const d = Math.hypot(p.x - wx, p.y - wy);
      if (d <= fruitRadius(g, i) && (!best || d < best.d)) best = { o, slot: i, d };
    });
  }
  return best ? { o: (best as { o: WorldObject }).o, slot: (best as { slot: number }).slot } : null;
}
