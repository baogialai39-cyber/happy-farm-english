/**
 * Vật phẩm trong thế giới nông trại (dữ liệu, tách khỏi logic).
 * Giá tính bằng "xu nông trại" — chỉ kiếm được trong game (SPEC 13.6, CLAUDE.md A3).
 */

export type ItemKind = 'seed' | 'crop' | 'animal' | 'ingredient' | 'food' | 'toy';

export interface ItemDef {
  id: string;
  word: string; // từ tiếng Anh được đọc to
  emoji: string;
  kind: ItemKind;
  buy?: number; // giá mua ở cửa hàng
  sell?: number; // giá Fruit Market trả
  grows?: string; // hạt giống → id nông sản
  growMs?: number; // thời gian lớn sau khi tưới
  /** Số sản phẩm mỗi lần thu hoạch (mặc định HARVEST_YIELD = 2). Hạt đặc biệt: 1. */
  yield?: number;
  /** Hạt đặc biệt từ Lucky Seed Wheel (SPEC 21.4) — không bán ở Seed Shop. */
  special?: boolean;
}

const SEC = 1000;

export const ITEMS: readonly ItemDef[] = [
  // Hạt giống (Seed Shop)
  { id: 'orange-seed', word: 'orange seeds', emoji: '🍊', kind: 'seed', buy: 2, grows: 'orange', growMs: 50 * SEC },
  { id: 'banana-seed', word: 'banana seeds', emoji: '🍌', kind: 'seed', buy: 2, grows: 'banana', growMs: 55 * SEC },
  { id: 'grape-seed', word: 'grape seeds', emoji: '🍇', kind: 'seed', buy: 3, grows: 'grapes', growMs: 55 * SEC },
  { id: 'apple-seed', word: 'apple seeds', emoji: '🍎', kind: 'seed', buy: 2, grows: 'apple', growMs: 50 * SEC },
  { id: 'carrot-seed', word: 'carrot seeds', emoji: '🥕', kind: 'seed', buy: 1, grows: 'carrot', growMs: 20 * SEC },
  { id: 'sunflower-seed', word: 'sunflower seeds', emoji: '🌻', kind: 'seed', buy: 1, grows: 'sunflower', growMs: 20 * SEC },
  { id: 'tomato-seed', word: 'tomato seeds', emoji: '🍅', kind: 'seed', buy: 1, grows: 'tomato', growMs: 30 * SEC },
  { id: 'corn-seed', word: 'corn seeds', emoji: '🌽', kind: 'seed', buy: 1, grows: 'corn', growMs: 30 * SEC },
  { id: 'strawberry-seed', word: 'strawberry seeds', emoji: '🍓', kind: 'seed', buy: 3, grows: 'strawberry', growMs: 40 * SEC },
  { id: 'watermelon-seed', word: 'watermelon seeds', emoji: '🍉', kind: 'seed', buy: 3, grows: 'watermelon', growMs: 45 * SEC },
  // Hạt đặc biệt — chỉ có từ LUCKY SEED WHEEL (SPEC 21.4), không bán
  { id: 'candy-seed', word: 'candy seeds', emoji: '🍭', kind: 'seed', grows: 'candy', growMs: 40 * SEC, yield: 1, special: true },
  { id: 'balloon-seed', word: 'balloon seeds', emoji: '🎈', kind: 'seed', grows: 'balloon', growMs: 40 * SEC, yield: 1, special: true },
  { id: 'car-seed', word: 'car seeds', emoji: '🚗', kind: 'seed', grows: 'toy-car', growMs: 45 * SEC, yield: 1, special: true },
  { id: 'star-seed', word: 'star seeds', emoji: '⭐', kind: 'seed', grows: 'gold-star', growMs: 45 * SEC, yield: 1, special: true },
  { id: 'toy-seed', word: 'toy seeds', emoji: '🎁', kind: 'seed', grows: 'surprise', growMs: 50 * SEC, yield: 1, special: true },
  // Phần thưởng thu hoạch từ hạt đặc biệt (đồ sưu tầm, không bán ở chợ)
  { id: 'candy', word: 'candy', emoji: '🍭', kind: 'toy' },
  { id: 'balloon', word: 'balloon', emoji: '🎈', kind: 'toy' },
  { id: 'toy-car', word: 'car', emoji: '🚗', kind: 'toy' },
  { id: 'gold-star', word: 'star', emoji: '⭐', kind: 'toy' },
  { id: 'surprise', word: 'surprise', emoji: '🎁', kind: 'toy' },
  { id: 'teddy-bear', word: 'teddy bear', emoji: '🧸', kind: 'toy' },
  { id: 'kite', word: 'kite', emoji: '🪁', kind: 'toy' },
  { id: 'robot', word: 'robot', emoji: '🤖', kind: 'toy' },
  { id: 'ball', word: 'ball', emoji: '⚽', kind: 'toy' },
  { id: 'blocks', word: 'blocks', emoji: '🧱', kind: 'toy' },
  // Nông sản (thu hoạch → bán ở Fruit Market)
  { id: 'apple', word: 'apple', emoji: '🍎', kind: 'crop', sell: 2 },
  { id: 'orange', word: 'orange', emoji: '🍊', kind: 'crop', sell: 2 },
  { id: 'banana', word: 'banana', emoji: '🍌', kind: 'crop', sell: 2 },
  { id: 'grapes', word: 'grapes', emoji: '🍇', kind: 'crop', sell: 3 },
  { id: 'carrot', word: 'carrot', emoji: '🥕', kind: 'crop', sell: 1 },
  { id: 'sunflower', word: 'sunflower', emoji: '🌻', kind: 'crop', sell: 1 },
  { id: 'tomato', word: 'tomato', emoji: '🍅', kind: 'crop', sell: 1 },
  { id: 'corn', word: 'corn', emoji: '🌽', kind: 'crop', sell: 1 },
  { id: 'strawberry', word: 'strawberry', emoji: '🍓', kind: 'crop', sell: 3, buy: 4 },
  { id: 'watermelon', word: 'watermelon', emoji: '🍉', kind: 'crop', sell: 3 },
  // Chỉ có ở vườn cây ăn quả (SPEC 18.4)
  { id: 'mango', word: 'mango', emoji: '🥭', kind: 'crop', sell: 2 },
  { id: 'coconut', word: 'coconut', emoji: '🥥', kind: 'crop', sell: 3 },
  // Từ con vật
  { id: 'egg', word: 'egg', emoji: '🥚', kind: 'animal', sell: 1, buy: 2 },
  { id: 'milk', word: 'milk', emoji: '🥛', kind: 'animal', sell: 2, buy: 3 },
  // Nguyên liệu (Baking & Cooking Shop)
  { id: 'flour', word: 'flour', emoji: '🌾', kind: 'ingredient', buy: 1 },
  { id: 'sugar', word: 'sugar', emoji: '🍬', kind: 'ingredient', buy: 1 },
  { id: 'butter', word: 'butter', emoji: '🧈', kind: 'ingredient', buy: 1 },
  { id: 'chocolate', word: 'chocolate', emoji: '🍫', kind: 'ingredient', buy: 1 },
  // Món ăn (nấu / nướng)
  { id: 'soup', word: 'soup', emoji: '🍲', kind: 'food', buy: 4 },
  { id: 'salad', word: 'salad', emoji: '🥗', kind: 'food', buy: 4 },
  { id: 'omelette', word: 'omelette', emoji: '🍳', kind: 'food', buy: 4 },
  { id: 'popcorn', word: 'popcorn', emoji: '🍿', kind: 'food', buy: 4 },
  { id: 'juice', word: 'juice', emoji: '🧃', kind: 'food', buy: 4 },
  { id: 'bread', word: 'bread', emoji: '🍞', kind: 'food', buy: 4 },
  { id: 'cake', word: 'cake', emoji: '🎂', kind: 'food', buy: 5 },
  { id: 'cookie', word: 'cookies', emoji: '🍪', kind: 'food', buy: 4 },
  { id: 'pie', word: 'pie', emoji: '🥧', kind: 'food', buy: 5 },
  { id: 'strawberry-cake', word: 'strawberry cake', emoji: '🍰', kind: 'food', buy: 5 },
  { id: 'choco-cupcake', word: 'chocolate cupcake', emoji: '🧁', kind: 'food', buy: 5 },
  { id: 'pancake', word: 'pancakes', emoji: '🥞', kind: 'food', buy: 4 },
  { id: 'milkshake', word: 'milkshake', emoji: '🥤', kind: 'food', buy: 5 },
  { id: 'hot-chocolate', word: 'hot chocolate', emoji: '☕', kind: 'food', buy: 5 },
];

export const ITEM_BY_ID: ReadonlyMap<string, ItemDef> = new Map(ITEMS.map((i) => [i.id, i]));

export function item(id: string): ItemDef {
  const it = ITEM_BY_ID.get(id);
  if (!it) throw new Error(`Unknown item ${id}`);
  return it;
}

// ---------- Phụ kiện (Accessory Shop) ----------
export type AccessorySlot = 'head' | 'face' | 'neck' | 'body' | 'legs' | 'feet' | 'back';
export interface AccessoryDef {
  id: string;
  word: string;
  emoji: string;
  slot: AccessorySlot;
  price: number;
  color?: string; // màu áo / quần / giày / ba lô / mũ
  style?: string; // kiểu vẽ đặc biệt (stripes, star, boots, bunny, cap, sunhat, tophat, round, heart)
}

/** Nhóm hiển thị trong Accessory Shop (SPEC 14.1). */
export const ACCESSORY_TABS: readonly { slot: AccessorySlot; title: string; emoji: string }[] = [
  { slot: 'head', title: 'Hats', emoji: '👒' },
  { slot: 'body', title: 'Shirts', emoji: '👕' },
  { slot: 'legs', title: 'Pants', emoji: '👖' },
  { slot: 'feet', title: 'Shoes', emoji: '👟' },
  { slot: 'back', title: 'Bags', emoji: '🎒' },
  { slot: 'face', title: 'Glasses', emoji: '👓' },
  { slot: 'neck', title: 'More', emoji: '🎀' },
];

export const ACCESSORIES: readonly AccessoryDef[] = [
  // Mũ
  { id: 'cap', word: 'cap', emoji: '🧢', slot: 'head', price: 4, color: '#8EC5FC', style: 'cap' },
  { id: 'sun-hat', word: 'sun hat', emoji: '👒', slot: 'head', price: 4, color: '#FFD1E3', style: 'sunhat' },
  { id: 'party-hat', word: 'party hat', emoji: '🎉', slot: 'head', price: 4 },
  { id: 'top-hat', word: 'top hat', emoji: '🎩', slot: 'head', price: 4, color: '#4A3B55', style: 'tophat' },
  { id: 'flower-crown', word: 'flower crown', emoji: '🌸', slot: 'head', price: 4 },
  { id: 'crown', word: 'crown', emoji: '👑', slot: 'head', price: 4 },
  // Áo
  { id: 'red-shirt', word: 'red shirt', emoji: '👕', slot: 'body', price: 5, color: '#FF8A8A' },
  { id: 'green-shirt', word: 'green shirt', emoji: '👕', slot: 'body', price: 5, color: '#8FD9A8' },
  { id: 'striped-shirt', word: 'striped shirt', emoji: '👕', slot: 'body', price: 5, color: '#8EC5FC', style: 'stripes' },
  { id: 'star-shirt', word: 'star shirt', emoji: '⭐', slot: 'body', price: 5, color: '#FFD84D', style: 'star' },
  // Quần
  { id: 'blue-jeans', word: 'blue jeans', emoji: '👖', slot: 'legs', price: 5, color: '#6FA8DC' },
  { id: 'pink-overalls', word: 'pink overalls', emoji: '👖', slot: 'legs', price: 5, color: '#FFB5D0' },
  { id: 'purple-overalls', word: 'purple overalls', emoji: '👖', slot: 'legs', price: 5, color: '#C3B1E1' },
  { id: 'yellow-shorts', word: 'yellow shorts', emoji: '🩳', slot: 'legs', price: 5, color: '#FFD84D' },
  // Giày
  { id: 'red-sneakers', word: 'red sneakers', emoji: '👟', slot: 'feet', price: 5, color: '#FF6B6B' },
  { id: 'blue-shoes', word: 'blue shoes', emoji: '👞', slot: 'feet', price: 5, color: '#6FB8F5' },
  { id: 'rain-boots', word: 'rain boots', emoji: '🥾', slot: 'feet', price: 5, color: '#FFD84D', style: 'boots' },
  { id: 'pink-sandals', word: 'pink sandals', emoji: '🩴', slot: 'feet', price: 5, color: '#FF9CC2' },
  // Ba lô
  { id: 'red-backpack', word: 'red backpack', emoji: '🎒', slot: 'back', price: 5, color: '#FF8A8A' },
  { id: 'blue-backpack', word: 'blue backpack', emoji: '🎒', slot: 'back', price: 5, color: '#8EC5FC' },
  { id: 'bunny-backpack', word: 'bunny backpack', emoji: '🐰', slot: 'back', price: 5, color: '#FFD1E3', style: 'bunny' },
  // Mở khóa bằng sao (SPEC 16.4) — được tặng khi đủ sao, không bán
  { id: 'star-glasses', word: 'star glasses', emoji: '⭐', slot: 'face', price: 0, color: '#FFD84D', style: 'starglasses' },
  { id: 'rainbow-shirt', word: 'rainbow shirt', emoji: '🌈', slot: 'body', price: 0, color: '#FFB3B3', style: 'rainbow' },
  { id: 'hero-cape', word: 'hero cape', emoji: '🦸', slot: 'back', price: 0, color: '#FF6B6B', style: 'cape' },
  // Kính
  { id: 'sunglasses', word: 'sunglasses', emoji: '🕶️', slot: 'face', price: 4 },
  { id: 'round-glasses', word: 'round glasses', emoji: '👓', slot: 'face', price: 4, style: 'round' },
  { id: 'heart-glasses', word: 'heart glasses', emoji: '💖', slot: 'face', price: 4, color: '#FF7FA8', style: 'heart' },
  // Khác (đồ cũ giữ nguyên)
  { id: 'bow-tie', word: 'bow tie', emoji: '🎀', slot: 'neck', price: 4 },
  { id: 'scarf', word: 'scarf', emoji: '🧣', slot: 'neck', price: 4 },
];
export const ACCESSORY_BY_ID: ReadonlyMap<string, AccessoryDef> = new Map(ACCESSORIES.map((a) => [a.id, a]));

// ---------- Công thức ----------
export type Station = 'stove' | 'bake';
export interface RecipeDef {
  id: string; // = id món tạo ra
  station: Station;
  need: Readonly<Record<string, number>>;
  bakeMs?: number;
}

export const RECIPES: readonly RecipeDef[] = [
  { id: 'soup', station: 'stove', need: { carrot: 1, tomato: 1 } },
  { id: 'salad', station: 'stove', need: { tomato: 1, corn: 1 } },
  { id: 'omelette', station: 'stove', need: { egg: 1, milk: 1 } },
  { id: 'popcorn', station: 'stove', need: { corn: 1, butter: 1 } },
  { id: 'juice', station: 'stove', need: { strawberry: 1, watermelon: 1 } },
  { id: 'bread', station: 'bake', need: { flour: 1, milk: 1 }, bakeMs: 8000 },
  { id: 'cookie', station: 'bake', need: { flour: 1, butter: 1, chocolate: 1 }, bakeMs: 8000 },
  { id: 'cake', station: 'bake', need: { flour: 1, egg: 1, milk: 1, sugar: 1 }, bakeMs: 12000 },
  { id: 'pie', station: 'bake', need: { flour: 1, strawberry: 1, sugar: 1 }, bakeMs: 12000 },
  { id: 'strawberry-cake', station: 'bake', need: { flour: 1, egg: 1, milk: 1, sugar: 1, strawberry: 1 }, bakeMs: 12000 },
  { id: 'choco-cupcake', station: 'bake', need: { flour: 1, egg: 1, sugar: 1, chocolate: 1 }, bakeMs: 10000 },
  { id: 'pancake', station: 'stove', need: { flour: 1, egg: 1, milk: 1 } },
  { id: 'milkshake', station: 'stove', need: { milk: 1, strawberry: 1 } },
  { id: 'hot-chocolate', station: 'stove', need: { milk: 1, chocolate: 1 } },
];

/** Quầy trộn (SPEC 14.5): nguyên liệu trong bát khớp ĐÚNG một công thức (kể cả số lượng). */
export function matchRecipe(bowl: readonly string[]): RecipeDef | undefined {
  const counts: Record<string, number> = {};
  for (const id of bowl) counts[id] = (counts[id] ?? 0) + 1;
  const keys = Object.keys(counts);
  return RECIPES.find((r) => {
    const need = Object.entries(r.need);
    return need.length === keys.length && need.every(([id, n]) => counts[id] === n);
  });
}
export const RECIPE_BY_ID: ReadonlyMap<string, RecipeDef> = new Map(RECIPES.map((r) => [r.id, r]));

// ---------- Cửa hàng ----------
/** 7 nguyên liệu của Bakery (SPEC 14.5). */
export const BAKERY_INGREDIENTS = ['flour', 'sugar', 'milk', 'egg', 'butter', 'strawberry', 'chocolate'] as const;
/** Đồ ăn làm sẵn bán ở Baking Shop (SPEC 21.5: 4–5 xu). */
export const BAKERY_FOODS = ['bread', 'cookie', 'pancake', 'cake', 'pie', 'choco-cupcake', 'strawberry-cake'] as const;

// ---------- Nội thất (HOME DECOR SHOP — SPEC 21.2) ----------
export interface FurnitureDef {
  id: string;
  word: string; // từ tiếng Anh (cũng là tên hình trong thư viện)
  vi: string;
  emoji: string;
  price: number;
  w: number;
  h: number;
  /** Đi xuyên qua được (thảm). */
  flat?: boolean;
  /** Treo tường (tranh). */
  wall?: boolean;
}
export const FURNITURE: readonly FurnitureDef[] = [
  { id: 'f-tv', word: 'television', vi: 'Ti vi', emoji: '📺', price: 100, w: 1, h: 1 },
  { id: 'f-table', word: 'table', vi: 'Bàn gỗ', emoji: '🪵', price: 100, w: 1, h: 1 },
  { id: 'f-chair', word: 'chair', vi: 'Ghế', emoji: '🪑', price: 100, w: 1, h: 1 },
  { id: 'f-sofa', word: 'sofa', vi: 'Ghế sofa', emoji: '🛋️', price: 100, w: 2, h: 1 },
  { id: 'f-wardrobe', word: 'wardrobe', vi: 'Tủ quần áo', emoji: '🚪', price: 90, w: 2, h: 1 },
  { id: 'f-bed', word: 'bed', vi: 'Giường ngủ', emoji: '🛏️', price: 100, w: 2, h: 2 },
  { id: 'f-painting', word: 'painting', vi: 'Tranh treo tường', emoji: '🖼️', price: 100, w: 1, h: 1, wall: true },
  { id: 'f-lamp', word: 'lamp', vi: 'Đèn trang trí', emoji: '💡', price: 60, w: 1, h: 1 },
  { id: 'f-rug', word: 'rug', vi: 'Thảm trải sàn', emoji: '🟪', price: 50, w: 2, h: 1, flat: true },
  { id: 'f-plant', word: 'flower pot', vi: 'Chậu hoa trang trí', emoji: '🪴', price: 50, w: 1, h: 1 },
];
export const FURNITURE_BY_ID: ReadonlyMap<string, FurnitureDef> = new Map(FURNITURE.map((f) => [f.id, f]));

/** Vé sở thú mỗi lượt (SPEC 21.6). */
export const ZOO_TICKET_PRICE = 30;

/** 6 loại hạt yêu cầu + corn (giữ cho công thức cũ). */
export const SEED_SHOP_ITEMS = ['apple-seed', 'carrot-seed', 'tomato-seed', 'strawberry-seed', 'sunflower-seed', 'watermelon-seed', 'corn-seed', 'orange-seed', 'banana-seed', 'grape-seed'] as const;

export type ShopId = 'accessory' | 'seed' | 'market' | 'baking' | 'decor';
export interface ShopDef {
  id: ShopId;
  name: string; // tiếng Anh, đọc khi vào
  keeper: string; // người bán (emoji thú dễ thương)
  mode: 'buy' | 'sell';
  color: string;
  roof: string;
  items: () => string[]; // id vật phẩm / phụ kiện
}

export const SHOPS: Readonly<Record<ShopId, ShopDef>> = {
  accessory: {
    id: 'accessory', name: 'Accessory Shop', keeper: '🐰', mode: 'buy', color: '#FFD1E3', roof: '#8E3FD8',
    items: () => ACCESSORIES.map((a) => a.id),
  },
  seed: {
    id: 'seed', name: 'Seed Shop', keeper: '🐹', mode: 'buy', color: '#D8F3C8', roof: '#E53935',
    items: () => [...SEED_SHOP_ITEMS],
  },
  market: {
    id: 'market', name: 'Fruit Market', keeper: '🐻', mode: 'sell', color: '#FFE8B8', roof: '#FFC107',
    items: () => ITEMS.filter((i) => i.sell !== undefined).map((i) => i.id),
  },
  baking: {
    id: 'baking', name: 'Baking Shop', keeper: '🐼', mode: 'buy', color: '#E3DAFA', roof: '#8E3FD8',
    items: () => [...BAKERY_INGREDIENTS, ...BAKERY_FOODS],
  },
  decor: {
    id: 'decor', name: 'Home Decor Shop', keeper: '🦊', mode: 'buy', color: '#FFE3C7', roof: '#E53935',
    items: () => FURNITURE.map((f) => f.id),
  },
};

// ---------- Con vật ----------
export type AnimalId = 'chicken' | 'cow' | 'sheep' | 'pig' | 'duck' | 'horse' | 'rabbit' | 'dog' | 'cat';
export interface AnimalDef {
  id: AnimalId;
  word: string;
  sound: string;
  emoji: string;
  gives?: string; // vật phẩm nhận được
  cooldownMs?: number;
  eats?: string[];
}
export const ANIMALS: Readonly<Record<AnimalId, AnimalDef>> = {
  chicken: { id: 'chicken', word: 'chicken', sound: 'cluck cluck', emoji: '🐔', gives: 'egg', cooldownMs: 30_000 },
  cow: { id: 'cow', word: 'cow', sound: 'moo', emoji: '🐄', gives: 'milk', cooldownMs: 45_000 },
  sheep: { id: 'sheep', word: 'sheep', sound: 'baa', emoji: '🐑' },
  pig: { id: 'pig', word: 'pig', sound: 'oink oink', emoji: '🐖', eats: ['carrot', 'corn'] },
  duck: { id: 'duck', word: 'duck', sound: 'quack quack', emoji: '🦆' },
  horse: { id: 'horse', word: 'horse', sound: 'neigh', emoji: '🐴', eats: ['carrot', 'apple'] },
  rabbit: { id: 'rabbit', word: 'rabbit', sound: 'thump thump', emoji: '🐰', eats: ['carrot'] },
  dog: { id: 'dog', word: 'dog', sound: 'woof woof', emoji: '🐶' },
  cat: { id: 'cat', word: 'cat', sound: 'meow', emoji: '🐱' },
};
