/**
 * CON ĐƯỜNG SAO (SPEC 16.4) — mở khóa theo TỔNG số sao (sao không bao giờ bị tiêu/trừ).
 * Không có cách nào mua bằng tiền thật (CLAUDE.md A3).
 */

export type UnlockKind = 'crop' | 'accessory' | 'decor';

export interface UnlockDef {
  id: string;
  stars: number;
  kind: UnlockKind;
  /** crop: id hạt giống · accessory: id phụ kiện · decor: id vật trang trí (đối tượng bản đồ có decor = id). */
  target: string;
  word: string; // từ dạy khi mở khóa
  emoji: string;
}

export const UNLOCKS: readonly UnlockDef[] = [
  { id: 'u-orange', stars: 3, kind: 'crop', target: 'orange-seed', word: 'orange', emoji: '🍊' },
  { id: 'u-flowerpot', stars: 6, kind: 'decor', target: 'flower-pot', word: 'flower pot', emoji: '🪴' },
  { id: 'u-starglasses', stars: 9, kind: 'accessory', target: 'star-glasses', word: 'star glasses', emoji: '⭐' },
  { id: 'u-banana', stars: 12, kind: 'crop', target: 'banana-seed', word: 'banana', emoji: '🍌' },
  { id: 'u-bench', stars: 15, kind: 'decor', target: 'bench', word: 'bench', emoji: '🪑' },
  { id: 'u-rainbowshirt', stars: 18, kind: 'accessory', target: 'rainbow-shirt', word: 'rainbow shirt', emoji: '🌈' },
  { id: 'u-fountain', stars: 22, kind: 'decor', target: 'fountain', word: 'fountain', emoji: '⛲' },
  { id: 'u-grapes', stars: 26, kind: 'crop', target: 'grape-seed', word: 'grapes', emoji: '🍇' },
  { id: 'u-cape', stars: 30, kind: 'accessory', target: 'hero-cape', word: 'hero cape', emoji: '🦸' },
  { id: 'u-birdhouse', stars: 35, kind: 'decor', target: 'birdhouse', word: 'birdhouse', emoji: '🐦' },
  { id: 'u-rainbow', stars: 40, kind: 'decor', target: 'rainbow', word: 'rainbow', emoji: '🌈' },
];

/** Mốc mở khóa cần cho một vật phẩm / phụ kiện / vật trang trí (undefined = có sẵn). */
export function unlockFor(target: string): UnlockDef | undefined {
  return UNLOCKS.find((u) => u.target === target);
}

/** Phần thưởng khi hoàn thành (SPEC 16.4). */
export const GAME_REWARD = { stars: 3, coins: 5 };
