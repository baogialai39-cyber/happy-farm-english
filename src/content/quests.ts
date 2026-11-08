/**
 * NHIỆM VỤ HẰNG NGÀY (SPEC 16.2) — gợi ý việc vui để làm, KHÔNG bắt buộc.
 * Không hết hạn, không đếm ngược, không streak (CLAUDE.md A10).
 */
import type { AgeGroup } from '../config/ageRules';

/** Sự kiện trong game làm tăng tiến độ nhiệm vụ. */
export type QuestEvent =
  | 'plant' | 'water' | 'harvest' | 'harvest:apple' | 'make:cake' | 'feed:chicken' | 'feed:pig'
  | 'egg' | 'sell' | 'game' | 'book';

export interface QuestTemplate {
  id: string;
  event: QuestEvent;
  emoji: string;
  /** Câu tiếng Anh theo số lượng n. */
  en: (n: number) => string;
  vi: (n: number) => string;
  /** Số lượng theo nhóm tuổi; thiếu nhóm = không dùng cho nhóm đó. */
  amount: Partial<Record<AgeGroup, number>>;
}

const s = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const QUEST_TEMPLATES: readonly QuestTemplate[] = [
  { id: 'plant', event: 'plant', emoji: '🌱', en: (n) => `Plant ${n} ${s(n, 'seed', 'seeds')}`, vi: (n) => `Gieo ${n} hạt giống`, amount: { '4-5': 2, '6-8': 3 } },
  { id: 'water', event: 'water', emoji: '💧', en: (n) => `Water ${n} ${s(n, 'flower', 'flowers')}`, vi: (n) => `Tưới ${n} cây hoa`, amount: { '2-3': 1, '4-5': 2, '6-8': 2 } },
  { id: 'harvest', event: 'harvest', emoji: '🧺', en: (n) => `Harvest ${n} ${s(n, 'plant', 'plants')}`, vi: (n) => `Thu hoạch ${n} cây`, amount: { '4-5': 1 } },
  { id: 'apples', event: 'harvest:apple', emoji: '🍎', en: (n) => `Collect ${n} ${s(n, 'apple', 'apples')}`, vi: (n) => `Hái ${n} quả táo`, amount: { '6-8': 2 } },
  { id: 'cake', event: 'make:cake', emoji: '🎂', en: (n) => `Make ${n} ${s(n, 'cake', 'cakes')}`, vi: (n) => `Làm ${n} bánh kem`, amount: { '6-8': 1 } },
  { id: 'chicken', event: 'feed:chicken', emoji: '🐔', en: (n) => `Feed ${n} ${s(n, 'chicken', 'chickens')}`, vi: (n) => `Cho gà ăn ${n} lần`, amount: { '2-3': 1, '4-5': 1, '6-8': 1 } },
  { id: 'pig', event: 'feed:pig', emoji: '🐖', en: () => 'Feed the pig', vi: () => 'Cho heo ăn', amount: { '4-5': 1 } },
  { id: 'egg', event: 'egg', emoji: '🥚', en: (n) => `Collect ${n} ${s(n, 'egg', 'eggs')}`, vi: (n) => `Nhặt ${n} quả trứng`, amount: { '4-5': 1 } },
  { id: 'sell', event: 'sell', emoji: '🪙', en: (n) => `Sell ${n} ${s(n, 'thing', 'things')}`, vi: (n) => `Bán ${n} món`, amount: { '6-8': 3 } },
  { id: 'game', event: 'game', emoji: '🎲', en: (n) => `Play ${n} ${s(n, 'game', 'games')}`, vi: (n) => `Chơi ${n} trò chơi`, amount: { '2-3': 1, '4-5': 1, '6-8': 2 } },
  { id: 'book', event: 'book', emoji: '📚', en: () => 'Read the picture book', vi: () => 'Đọc sách tranh', amount: { '2-3': 1 } },
];

/** Số nhiệm vụ mỗi ngày theo tuổi. */
export const QUESTS_PER_DAY: Record<AgeGroup, number> = { '2-3': 2, '4-5': 3, '6-8': 4 };

export interface Quest {
  id: string; // = template id
  target: number;
  progress: number;
  claimed: boolean;
}

export const questReward = (g: AgeGroup) => ({ stars: g === '6-8' ? 2 : 1, coins: g === '2-3' ? 3 : 5 });

export function templateOf(q: Quest): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === q.id);
}

/** Ngày theo giờ thiết bị, dạng YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Bảng nhiệm vụ cho hôm nay: GIỮ mọi nhiệm vụ chưa nhận thưởng (không hết hạn),
 * chỉ thay chỗ của nhiệm vụ đã nhận thưởng — và chỉ khi sang ngày mới.
 */
export function refreshQuests(
  current: { day: string; list: Quest[] } | undefined,
  group: AgeGroup,
  today: string,
  rand: () => number = Math.random,
): { day: string; list: Quest[] } {
  if (current && current.day === today) return current;
  const keep = (current?.list ?? []).filter((q) => !q.claimed && templateOf(q));
  const want = QUESTS_PER_DAY[group];
  const pool = QUEST_TEMPLATES.filter((t) => t.amount[group] !== undefined && !keep.some((k) => k.id === t.id));
  const list = keep.slice(0, want);
  while (list.length < want && pool.length) {
    const t = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    list.push({ id: t.id, target: t.amount[group]!, progress: 0, claimed: false });
  }
  return { day: today, list };
}
