/**
 * SỔ HÌNH CHUNG (SPEC 18.1): một hình cho mỗi sự vật, dùng ở MỌI nơi (thế giới, khung từ, mini-game, sách tranh).
 * Tra theo từ tiếng Anh. Không có hình riêng → trả null (nơi gọi dùng emoji dự phòng).
 */
import { ANIMAL_ARTS, type AnimalArt, animalSvg } from './animals';
import { FRUIT_KINDS, type FruitKind, fruitIcon } from './fruits';
import { HOUSEHOLD_IDS, householdAspect, householdSvg } from './household';
import { TREES } from './trees';
import { ZOO_ANIMALS, type ZooAnimal, zooGeom, zooSvg } from './zooAnimals';

const ALIAS: Record<string, string> = {
  fridge: 'refrigerator',
  grape: 'grapes',
  book: 'bookshelf',
  tv: 'television',
  toys: 'toybox',
  'teddy bear': 'toybox',
  rhino: 'rhinoceros',
  'polar bears': 'polar bear',
};

export function artKey(word: string): string {
  const w = word.toLowerCase().trim();
  return ALIAS[w] ?? w;
}

export function hasArt(word: string): boolean {
  const k = artKey(word);
  return (ZOO_ANIMALS as readonly string[]).includes(k) || (ANIMAL_ARTS as readonly string[]).includes(k) || (FRUIT_KINDS as readonly string[]).includes(k) || HOUSEHOLD_IDS.includes(k) || TREES.some((t) => t.word === k);
}

/** SVG đầy đủ (có xmlns) cho một từ, hoặc null. */
export function artSvg(word: string, label?: string): string | null {
  const k = artKey(word);
  if ((ZOO_ANIMALS as readonly string[]).includes(k)) return zooSvg(k as ZooAnimal, label);
  if ((ANIMAL_ARTS as readonly string[]).includes(k)) return animalSvg(k as AnimalArt, label);
  if ((FRUIT_KINDS as readonly string[]).includes(k)) return fruitIcon(k as FruitKind, true, label);
  const tree = TREES.find((t) => t.word === k);
  if (tree) return tree.svg();
  return householdSvg(k, label);
}

/** Tỉ lệ cao/rộng của hình (để vẽ đúng, không méo). */
export function artAspect(word: string): number {
  const k = artKey(word);
  if ((ZOO_ANIMALS as readonly string[]).includes(k)) return zooGeom(k as ZooAnimal).aspect;
  if ((ANIMAL_ARTS as readonly string[]).includes(k)) return 180 / 220;
  if ((FRUIT_KINDS as readonly string[]).includes(k)) return 1;
  if (TREES.some((t) => t.word === k)) return 320 / 260;
  return householdAspect(k);
}

// ---------- Ảnh cho canvas (vẽ SVG thành ảnh 1 lần, dùng lại) ----------
const imgCache = new Map<string, HTMLImageElement>();

/** Lấy ảnh đã sẵn sàng (hoặc undefined nếu đang tải). key tùy ý — svg() chỉ gọi lần đầu. */
export function cachedImage(key: string, svg: () => string | null, pxW: number, pxH: number): HTMLImageElement | undefined {
  const k = `${key}@${Math.round(pxW)}x${Math.round(pxH)}`;
  let img = imgCache.get(k);
  if (!img) {
    const src = svg();
    if (!src) return undefined;
    img = new Image(pxW, pxH);
    img.decoding = 'async';
    // đặt kích thước điểm ảnh để trình duyệt rasterize sắc nét
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src.replace('<svg ', `<svg width="${Math.round(pxW)}" height="${Math.round(pxH)}" `));
    imgCache.set(k, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : undefined;
}

/** Tải trước (đợi giải mã) để khung hình đầu tiên đã có đủ hình. */
export async function preloadImages(list: { key: string; svg: () => string | null; w: number; h: number }[]): Promise<void> {
  await Promise.all(
    list.map(async (it) => {
      cachedImage(it.key, it.svg, it.w, it.h);
      const img = imgCache.get(`${it.key}@${Math.round(it.w)}x${Math.round(it.h)}`);
      await img?.decode().catch(() => undefined);
    }),
  );
}

/** Hình minh họa dạng <img> (tách biệt, không trùng id gradient) cho thẻ từ / mini-game; null nếu không có hình. */
export function artPicture(word: string, cls = 'art-pic'): HTMLImageElement | null {
  const svg = hasArt(word) ? artSvg(word) : null;
  if (!svg) return null;
  const img = document.createElement('img');
  img.className = cls;
  img.alt = '';
  img.draggable = false;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}
