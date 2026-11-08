/**
 * Trạng thái thế giới theo hồ sơ (SPEC 13.8) + luật kinh tế trong game.
 * Hàm thuần (dễ test). Không chứa thông tin cá nhân. Xu không bao giờ âm.
 */
import {
  ACCESSORY_BY_ID, ANIMALS, type AccessorySlot, type AnimalId, ITEM_BY_ID, RECIPE_BY_ID, type RecipeDef, matchRecipe,
} from '../content/items';
import { type KV, readBackup, writeBackup } from '../storage/kv';
import { WORLD, isPlantable, parsePlotKey, plotKey } from './map';
import { type UnlockDef, UNLOCKS, unlockFor } from '../content/rewards';
import { type Quest, type QuestEvent, QUEST_TEMPLATES, dayKey, questReward, refreshQuests, templateOf } from '../content/quests';
import type { AgeGroup } from '../config/ageRules';
import type { GameId } from '../content/gamesData';
import { TREE_BY_ID } from '../art/library/trees';
import { GAMES } from '../content/gamesData';
import {
  type ZooBadge, ZOO, ZOO_BADGES, ZOO_BY_ID, ZOO_DIRTY_AFTER_MS, ZOO_STAR_BADGE, ZOO_STAR_NEW_ANIMAL, ZOO_ZONES, type ZooZone,
} from '../content/zoo';

/** Tối đa số cây trồng cùng lúc (SPEC 14.3). */
export const MAX_PLANTS = 24;
/** Toạ độ 6 luống cũ (save v1) → chuyển sang ô đất tương ứng. */
const V1_PLOTS = [[4, 26], [6, 26], [8, 26], [4, 28], [6, 28], [8, 28]];

export interface Plot {
  crop: string; // id hạt đã gieo
  plantedAt: number;
  wateredAt?: number;
  caredAt?: number; // đã nhổ cỏ (bước chăm sóc)
}

export interface WorldSave {
  v: 2;
  coins: number;
  inv: Record<string, number>;
  plots: Record<string, Plot>; // key 'x,y'
  owned: string[];
  equipped: Partial<Record<AccessorySlot, string>>;
  oven?: { recipe: string; doneAt: number };
  animalAt: Partial<Record<AnimalId, number>>;
  pos?: { x: number; y: number };
  /** Từ / câu đã gặp (SPEC 15.5): số lần + lần cuối. Chỉ trên máy. */
  learn: Record<string, { n: number; t: number }>;
  /** Tổng sao (chỉ tăng, không bao giờ bị tiêu) — SPEC 16.4. */
  stars: number;
  /** Mốc đã mở khóa (id trong UNLOCKS). */
  unlocked: string[];
  /** Nhiệm vụ hằng ngày (không hết hạn) — SPEC 16.2. */
  quests?: { day: string; list: Quest[] };
  /** Số lượt đã chơi từng mini-game. */
  games: Partial<Record<GameId, number>>;
  /** Thời điểm lưu (ms) — để chọn bản mới nhất giữa IndexedDB và bản sao (SPEC 17.5). */
  savedAt: number;
  /** Vườn cây ăn quả (SPEC 18.5): mỗi cây → thời điểm chín lại của từng vị trí quả (0 = đang chín). */
  orchard: Record<string, number[]>;
  /** Nơi đang chơi (SPEC 19.1). */
  place: 'farm' | 'zoo';
  /** Vị trí trong sở thú (vị trí nông trại là `pos`). */
  zooPos?: { x: number; y: number };
  /** Sở thú (SPEC 19.8): số lần chạm từng loài, lần cho ăn đúng, lần dọn từng khu, huy hiệu. */
  zoo: ZooProgress;
}

export interface ZooProgress {
  seen: Record<string, number>;
  fedOk: number;
  cleanAt: Partial<Record<ZooZone, number>>;
  badges: string[];
}

export function newSave(): WorldSave {
  return {
    v: 2,
    coins: 15,
    inv: { 'carrot-seed': 2, 'sunflower-seed': 1 },
    plots: {},
    owned: [],
    equipped: {},
    animalAt: {},
    learn: {},
    stars: 0,
    unlocked: [],
    games: {},
    savedAt: 0,
    orchard: {},
    place: 'farm',
    zoo: { seen: {}, fedOk: 0, cleanAt: {}, badges: [] },
  };
}

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Lọc dữ liệu đọc từ bộ nhớ: id lạ, số âm, kiểu sai bị loại. */
export function sanitizeSave(raw: unknown): WorldSave {
  const s = newSave();
  if (!raw || typeof raw !== 'object') return s;
  const r = raw as Record<string, unknown>;
  if (isNum(r.coins) && r.coins >= 0) s.coins = Math.floor(r.coins);
  if (r.inv && typeof r.inv === 'object') {
    s.inv = {};
    for (const [k, v] of Object.entries(r.inv as Record<string, unknown>)) {
      if (ITEM_BY_ID.has(k) && isNum(v) && v > 0) s.inv[k] = Math.floor(v);
    }
  }
  // Vườn: v2 = object theo toạ độ; v1 = mảng 6 luống → chuyển sang toạ độ cũ
  const rawPlots: [string, unknown][] = Array.isArray(r.plots)
    ? (r.plots as unknown[]).map((p, i) => [V1_PLOTS[i] ? plotKey(V1_PLOTS[i][0], V1_PLOTS[i][1]) : '', p])
    : r.plots && typeof r.plots === 'object' ? Object.entries(r.plots as Record<string, unknown>) : [];
  for (const [k, raw] of rawPlots) {
    const pos = parsePlotKey(k);
    const p = raw as Record<string, unknown> | undefined;
    if (!pos || !isPlantable(WORLD, pos.x, pos.y) || !p || typeof p.crop !== 'string' || ITEM_BY_ID.get(p.crop)?.kind !== 'seed') continue;
    if (Object.keys(s.plots).length >= MAX_PLANTS) break;
    const out: Plot = { crop: p.crop, plantedAt: isNum(p.plantedAt) ? p.plantedAt : 0 };
    if (isNum(p.wateredAt)) out.wateredAt = p.wateredAt;
    if (isNum(p.caredAt)) out.caredAt = p.caredAt;
    else if (Array.isArray(r.plots) && out.wateredAt !== undefined) out.caredAt = out.wateredAt; // save v1 chưa có bước chăm sóc
    s.plots[k] = out;
  }
  if (Array.isArray(r.owned)) s.owned = [...new Set(r.owned.filter((a): a is string => typeof a === 'string' && ACCESSORY_BY_ID.has(a)))];
  if (r.equipped && typeof r.equipped === 'object') {
    for (const [slot, id] of Object.entries(r.equipped as Record<string, unknown>)) {
      const a = typeof id === 'string' ? ACCESSORY_BY_ID.get(id) : undefined;
      if (a && a.slot === slot && s.owned.includes(a.id)) s.equipped[a.slot] = a.id;
    }
  }
  const oven = r.oven as Record<string, unknown> | undefined;
  if (oven && typeof oven.recipe === 'string' && RECIPE_BY_ID.get(oven.recipe)?.station === 'bake' && isNum(oven.doneAt)) {
    s.oven = { recipe: oven.recipe, doneAt: oven.doneAt };
  }
  if (r.animalAt && typeof r.animalAt === 'object') {
    for (const [k, v] of Object.entries(r.animalAt as Record<string, unknown>)) if (k in ANIMALS && isNum(v)) s.animalAt[k as AnimalId] = v;
  }
  if (r.learn && typeof r.learn === 'object') {
    for (const [k, v] of Object.entries(r.learn as Record<string, unknown>).slice(0, 1000)) {
      const e = v as Record<string, unknown> | undefined;
      if (k.length <= 80 && e && isNum(e.n) && e.n > 0 && isNum(e.t)) s.learn[k] = { n: Math.floor(e.n), t: e.t };
    }
  }
  if (isNum(r.stars) && r.stars >= 0) s.stars = Math.floor(r.stars);
  if (Array.isArray(r.unlocked)) s.unlocked = [...new Set(r.unlocked.filter((u): u is string => typeof u === 'string' && UNLOCKS.some((x) => x.id === u)))];
  const q = r.quests as { day?: unknown; list?: unknown } | undefined;
  if (q && typeof q.day === 'string' && Array.isArray(q.list)) {
    const list: Quest[] = [];
    for (const it of q.list as Record<string, unknown>[]) {
      if (!it || typeof it.id !== 'string' || !QUEST_TEMPLATES.some((t) => t.id === it.id)) continue;
      if (!isNum(it.target) || it.target < 1 || !isNum(it.progress) || it.progress < 0) continue;
      list.push({ id: it.id, target: Math.floor(it.target), progress: Math.min(Math.floor(it.progress), Math.floor(it.target)), claimed: it.claimed === true });
    }
    s.quests = { day: q.day, list };
  }
  if (r.games && typeof r.games === 'object') {
    for (const [k, v] of Object.entries(r.games as Record<string, unknown>)) if (GAMES.some((g) => g.id === k) && isNum(v) && v >= 0) s.games[k as GameId] = Math.floor(v);
  }
  if (isNum(r.savedAt) && r.savedAt > 0) s.savedAt = r.savedAt;
  if (r.place === 'zoo') s.place = 'zoo'; // nơi khác (park/school/library của bản đồ thế giới đã gỡ) → nông trại
  const zp = r.zooPos as Record<string, unknown> | undefined;
  if (zp && isNum(zp.x) && isNum(zp.y)) s.zooPos = { x: zp.x, y: zp.y };
  const z = r.zoo as Record<string, unknown> | undefined;
  if (z && typeof z === 'object') {
    if (z.seen && typeof z.seen === 'object') {
      for (const [k, v] of Object.entries(z.seen as Record<string, unknown>)) if (ZOO_BY_ID.has(k) && isNum(v) && v > 0) s.zoo.seen[k] = Math.floor(v);
    }
    if (isNum(z.fedOk) && z.fedOk > 0) s.zoo.fedOk = Math.floor(z.fedOk);
    if (z.cleanAt && typeof z.cleanAt === 'object') {
      for (const [k, v] of Object.entries(z.cleanAt as Record<string, unknown>)) if (ZOO_ZONES.some((zz) => zz.id === k) && isNum(v)) s.zoo.cleanAt[k as ZooZone] = v;
    }
    if (Array.isArray(z.badges)) s.zoo.badges = [...new Set(z.badges.filter((b): b is string => typeof b === 'string' && ZOO_BADGES.some((x) => x.id === b)))];
  }
  if (r.orchard && typeof r.orchard === 'object') {
    for (const [k, v] of Object.entries(r.orchard as Record<string, unknown>)) {
      const tree = TREE_BY_ID.get(k);
      if (!tree || !Array.isArray(v)) continue;
      s.orchard[k] = tree.slots.map((_, i) => (isNum(v[i]) && v[i] > 0 ? v[i] : 0));
    }
  }
  const pos = r.pos as Record<string, unknown> | undefined;
  if (pos && isNum(pos.x) && isNum(pos.y)) s.pos = { x: pos.x, y: pos.y };
  return s;
}

// ---------- Túi đồ ----------
export const count = (s: WorldSave, id: string) => s.inv[id] ?? 0;
export function addItem(s: WorldSave, id: string, n = 1): void {
  s.inv[id] = count(s, id) + n;
}
export function takeItem(s: WorldSave, id: string, n = 1): boolean {
  if (count(s, id) < n) return false;
  const left = count(s, id) - n;
  if (left > 0) s.inv[id] = left;
  else delete s.inv[id];
  return true;
}

// ---------- Cửa hàng ----------
export type ShopResult = 'ok' | 'coins' | 'none' | 'owned' | 'locked';

export function buyItem(s: WorldSave, id: string): ShopResult {
  const it = ITEM_BY_ID.get(id);
  if (!it || it.buy === undefined) return 'none';
  if (!isUnlocked(s, id)) return 'locked';
  if (s.coins < it.buy) return 'coins';
  s.coins -= it.buy;
  addItem(s, id);
  return 'ok';
}

export function sellItem(s: WorldSave, id: string): ShopResult {
  const it = ITEM_BY_ID.get(id);
  if (!it || it.sell === undefined) return 'none';
  if (!takeItem(s, id)) return 'none';
  s.coins += it.sell;
  return 'ok';
}

export function buyAccessory(s: WorldSave, id: string): ShopResult {
  const a = ACCESSORY_BY_ID.get(id);
  if (!a) return 'none';
  if (s.owned.includes(id)) return 'owned';
  if (!isUnlocked(s, id)) return 'locked';
  if (s.coins < a.price) return 'coins';
  s.coins -= a.price;
  s.owned.push(id);
  s.equipped[a.slot] = id; // đeo ngay
  return 'ok';
}

export function toggleAccessory(s: WorldSave, id: string): boolean {
  const a = ACCESSORY_BY_ID.get(id);
  if (!a || !s.owned.includes(id)) return false;
  if (s.equipped[a.slot] === id) delete s.equipped[a.slot];
  else s.equipped[a.slot] = id;
  return true;
}

// ---------- Vườn (SPEC 14.3) ----------
export type PlotStage = 'empty' | 'dry' | 'growing' | 'weeds' | 'ready';

const growMs = (p: Plot) => ITEM_BY_ID.get(p.crop)?.growMs ?? 20_000;

/**
 * Tiến độ 0..1: tưới → lớn tới 0.5 → cỏ dại mọc, dừng lớn tới khi chăm sóc → lớn tiếp tới 1.
 */
export function plotProgress(p: Plot | undefined, now: number): number {
  if (!p || p.wateredAt === undefined) return 0;
  const half = growMs(p) / 2;
  const first = (now - p.wateredAt) / half;
  if (first < 1) return Math.max(0, first) * 0.5;
  if (p.caredAt === undefined) return 0.5;
  const start = Math.max(p.caredAt, p.wateredAt + half);
  return Math.min(1, 0.5 + Math.max(0, (now - start) / half) * 0.5);
}

export function plotStage(p: Plot | undefined, now: number): PlotStage {
  if (!p) return 'empty';
  if (p.wateredAt === undefined) return 'dry';
  const prog = plotProgress(p, now);
  if (prog >= 1) return 'ready';
  if (prog >= 0.5 && p.caredAt === undefined) return 'weeds';
  return 'growing';
}

export function plant(s: WorldSave, key: string, seedId: string, now: number): boolean {
  const pos = parsePlotKey(key);
  if (!pos || !isPlantable(WORLD, pos.x, pos.y) || s.plots[key]) return false;
  if (Object.keys(s.plots).length >= MAX_PLANTS) return false;
  if (ITEM_BY_ID.get(seedId)?.kind !== 'seed') return false;
  if (!takeItem(s, seedId)) return false;
  s.plots[key] = { crop: seedId, plantedAt: now };
  return true;
}

export function water(s: WorldSave, key: string, now: number): boolean {
  const p = s.plots[key];
  if (!p || p.wateredAt !== undefined) return false;
  p.wateredAt = now;
  return true;
}

/** Chăm sóc: nhổ cỏ dại để cây lớn tiếp. */
export function care(s: WorldSave, key: string, now: number): boolean {
  const p = s.plots[key];
  if (plotStage(p, now) !== 'weeds') return false;
  p.caredAt = now;
  return true;
}

export const HARVEST_YIELD = 2;

/** Thu hoạch → trả về id nông sản nhận được. */
export function harvest(s: WorldSave, key: string, now: number): string | null {
  const p = s.plots[key];
  if (!p || plotStage(p, now) !== 'ready') return null;
  const crop = ITEM_BY_ID.get(p.crop)!.grows!;
  addItem(s, crop, HARVEST_YIELD);
  delete s.plots[key];
  return crop;
}

// ---------- Con vật ----------
export function animalReadyIn(s: WorldSave, id: AnimalId, now: number): number {
  const a = ANIMALS[id];
  if (!a.cooldownMs) return 0;
  const last = s.animalAt[id];
  if (last === undefined) return 0;
  return Math.max(0, last + a.cooldownMs - now);
}

/** Nhặt trứng / vắt sữa. */
export function collectFromAnimal(s: WorldSave, id: AnimalId, now: number): string | null {
  const a = ANIMALS[id];
  if (!a.gives || animalReadyIn(s, id, now) > 0) return null;
  addItem(s, a.gives);
  s.animalAt[id] = now;
  return a.gives;
}

/** Cho heo ăn: dùng 1 món heo thích (ưu tiên cà rốt). */
export function feedAnimal(s: WorldSave, id: AnimalId): string | null {
  for (const food of ANIMALS[id].eats ?? []) if (takeItem(s, food)) return food;
  return null;
}

// ---------- Nấu / nướng ----------
export function canMake(s: WorldSave, r: RecipeDef): boolean {
  return Object.entries(r.need).every(([id, n]) => count(s, id) >= n);
}

function consume(s: WorldSave, r: RecipeDef) {
  for (const [id, n] of Object.entries(r.need)) takeItem(s, id, n);
}

export function cook(s: WorldSave, recipeId: string): boolean {
  const r = RECIPE_BY_ID.get(recipeId);
  if (!r || r.station !== 'stove' || !canMake(s, r)) return false;
  consume(s, r);
  addItem(s, r.id);
  return true;
}

export function startBake(s: WorldSave, recipeId: string, now: number): boolean {
  const r = RECIPE_BY_ID.get(recipeId);
  if (!r || r.station !== 'bake' || s.oven || !canMake(s, r)) return false;
  consume(s, r);
  s.oven = { recipe: r.id, doneAt: now + (r.bakeMs ?? 8000) };
  return true;
}

export function takeFromOven(s: WorldSave, now: number): string | null {
  if (!s.oven || now < s.oven.doneAt) return null;
  const id = s.oven.recipe;
  addItem(s, id);
  delete s.oven;
  return id;
}

/**
 * Quầy trộn ở Bakery (SPEC 14.5): bát khớp đúng một công thức → làm món ngay.
 * Không khớp / thiếu nguyên liệu → không trừ gì (nguyên liệu "trả lại").
 */
export function mixBowl(s: WorldSave, bowl: readonly string[]): string | null {
  const r = matchRecipe(bowl);
  if (!r || !canMake(s, r)) return null;
  consume(s, r);
  addItem(s, r.id);
  return r.id;
}

export function eat(s: WorldSave, foodId: string): boolean {
  if (ITEM_BY_ID.get(foodId)?.kind !== 'food') return false;
  return takeItem(s, foodId);
}

/** Đi ngủ: sáng dậy cây đã gieo lớn hết (đã tưới hay chưa), con vật sẵn sàng, lò nướng xong. */
export function sleepThroughNight(s: WorldSave, now: number): void {
  for (const p of Object.values(s.plots)) {
    const ms = growMs(p);
    p.wateredAt = now - ms;
    p.caredAt = now - ms / 2;
  }
  s.animalAt = {};
  s.orchard = {}; // sáng ra mọi quả đã chín lại
  if (s.oven) s.oven.doneAt = now;
}

// ---------- Lưu trữ ----------
const key = (profileId: string) => `world:${profileId}`;

/** Đọc bản MỚI NHẤT giữa IndexedDB và bản sao đồng bộ trong localStorage (SPEC 17.5). */
export async function loadSave(kv: KV, profileId: string): Promise<WorldSave> {
  const a = sanitizeSave(await kv.get(key(profileId)));
  const b = sanitizeSave(readBackup(key(profileId)));
  return b.savedAt > a.savedAt ? b : a;
}

export async function storeSave(kv: KV, profileId: string, s: WorldSave): Promise<void> {
  s.savedAt = Date.now();
  writeBackup(key(profileId), s);
  await kv.set(key(profileId), s);
}

/** Ghi đồng bộ khi trang bị ẩn/đóng (IndexedDB có thể không kịp hoàn tất). */
export function backupSave(profileId: string, s: WorldSave): void {
  s.savedAt = Date.now();
  writeBackup(key(profileId), s);
}

// ---------- Sao, mở khóa, nhiệm vụ (SPEC 16) ----------

/** Vật phẩm / phụ kiện / trang trí đã mở khóa chưa (không nằm trong con đường sao = có sẵn). */
export function isUnlocked(s: WorldSave, target: string): boolean {
  const u = unlockFor(target);
  return !u || s.unlocked.includes(u.id);
}

/** Cộng sao và áp dụng mọi mốc vừa đạt. Trả về các mốc MỚI để chúc mừng. */
export function addStars(s: WorldSave, n: number): UnlockDef[] {
  s.stars += Math.max(0, Math.floor(n));
  return applyUnlocks(s);
}

export function applyUnlocks(s: WorldSave): UnlockDef[] {
  const fresh: UnlockDef[] = [];
  for (const u of UNLOCKS) {
    if (u.stars > s.stars || s.unlocked.includes(u.id)) continue;
    s.unlocked.push(u.id);
    if (u.kind === 'accessory' && !s.owned.includes(u.target)) s.owned.push(u.target); // tặng luôn
    fresh.push(u);
  }
  return fresh;
}

/** Id vật trang trí đang hiện trên sân. */
export function activeDecor(s: WorldSave): Set<string> {
  return new Set(UNLOCKS.filter((u) => u.kind === 'decor' && s.unlocked.includes(u.id)).map((u) => u.target));
}

export function ensureQuests(s: WorldSave, g: AgeGroup, now: Date = new Date(), rand?: () => number): Quest[] {
  s.quests = refreshQuests(s.quests, g, dayKey(now), rand);
  return s.quests.list;
}

/** Ghi nhận một việc bé vừa làm. Trả về các nhiệm vụ VỪA hoàn thành. */
export function questEvent(s: WorldSave, ev: QuestEvent, n = 1): Quest[] {
  const done: Quest[] = [];
  for (const q of s.quests?.list ?? []) {
    if (q.claimed || q.progress >= q.target || templateOf(q)?.event !== ev) continue;
    q.progress = Math.min(q.target, q.progress + n);
    if (q.progress >= q.target) done.push(q);
  }
  return done;
}

/** Nhận thưởng nhiệm vụ đã xong: sao + xu. Trả về phần thưởng + mốc mở khóa mới, hoặc null. */
export function claimQuest(s: WorldSave, id: string, g: AgeGroup): { stars: number; coins: number; unlocked: UnlockDef[] } | null {
  const q = s.quests?.list.find((x) => x.id === id);
  if (!q || q.claimed || q.progress < q.target) return null;
  q.claimed = true;
  const r = questReward(g);
  s.coins += r.coins;
  return { ...r, unlocked: addStars(s, r.stars) };
}

/** Hoàn thành một lượt mini-game: luôn đủ sao (dựa trên hoàn thành, không dựa vào lỗi). */
export function finishGame(s: WorldSave, game: GameId, reward: { stars: number; coins: number }): UnlockDef[] {
  s.games[game] = (s.games[game] ?? 0) + 1;
  s.coins += reward.coins;
  questEvent(s, 'game');
  return addStars(s, reward.stars);
}

// ---------- Vườn cây ăn quả (SPEC 18.4, 18.5) ----------
/** Quả vừa hái mọc lại (quả non) rồi chín sau ~1 phút. */
export const FRUIT_REGROW_MS = 60_000;

/** Quả ở vị trí `slot` của cây đã chín chưa. */
export function fruitRipe(s: WorldSave, treeId: string, slot: number, now: number): boolean {
  const tree = TREE_BY_ID.get(treeId);
  if (!tree || slot < 0 || slot >= tree.slots.length) return false;
  return (s.orchard[treeId]?.[slot] ?? 0) <= now;
}

/**
 * Hái 1 quả: chỉ quả đã chín; quả non mọc lại tại chỗ; túi +1.
 * Trả về id nông sản + số lượng mới trong túi, hoặc null (chưa chín / không hợp lệ → không đổi gì).
 */
export function harvestFruit(s: WorldSave, treeId: string, slot: number, now: number): { item: string; count: number } | null {
  if (!fruitRipe(s, treeId, slot, now)) return null;
  const tree = TREE_BY_ID.get(treeId)!;
  const ready = s.orchard[treeId] ?? tree.slots.map(() => 0);
  ready[slot] = now + FRUIT_REGROW_MS;
  s.orchard[treeId] = ready;
  addItem(s, tree.fruit);
  return { item: tree.fruit, count: count(s, tree.fruit) };
}

// ---------- Sở thú (SPEC 19.4, 19.5, 19.8) ----------
export interface ZooReward { stars: number; badges: ZooBadge[]; unlocked: UnlockDef[] }

/** Huy hiệu mới đạt được (mỗi cái một lần) — cộng sao. */
function checkZooBadges(s: WorldSave): { stars: number; badges: ZooBadge[] } {
  const seen = (id: string) => (s.zoo.seen[id] ?? 0) > 0;
  const got: ZooBadge[] = [];
  const give = (id: string, ok: boolean) => {
    if (ok && !s.zoo.badges.includes(id)) {
      s.zoo.badges.push(id);
      got.push(ZOO_BADGES.find((b) => b.id === id)!);
    }
  };
  give('first', ZOO.some((a) => seen(a.id)));
  for (const z of ZOO_ZONES) give(`zone:${z.id}`, ZOO.filter((a) => a.zone === z.id).every((a) => seen(a.id)));
  give('all', ZOO.every((a) => seen(a.id)));
  give('keeper', s.zoo.fedOk >= 5);
  give('clean', ZOO_ZONES.every((z) => s.zoo.cleanAt[z.id] !== undefined));
  return { stars: got.length * ZOO_STAR_BADGE, badges: got };
}

function reward(s: WorldSave, extraStars: number): ZooReward {
  const b = checkZooBadges(s);
  const stars = extraStars + b.stars;
  return { stars, badges: b.badges, unlocked: stars ? addStars(s, stars) : [] };
}

/** Chạm một con vật. Trả về số lần đã chạm (1 = lần đầu → khung tên) + phần thưởng khám phá. */
export function zooTap(s: WorldSave, id: string): { n: number; reward: ZooReward } {
  if (!ZOO_BY_ID.has(id)) return { n: 0, reward: { stars: 0, badges: [], unlocked: [] } };
  const n = (s.zoo.seen[id] ?? 0) + 1;
  s.zoo.seen[id] = n;
  return { n, reward: reward(s, n === 1 ? ZOO_STAR_NEW_ANIMAL : 0) };
}

/** Cho ăn: đúng món của loài → true (+ đếm cho huy hiệu Kind Keeper). Sai → false, không trừ gì. */
export function zooFeed(s: WorldSave, id: string, food: string): { ok: boolean; reward: ZooReward } {
  const a = ZOO_BY_ID.get(id);
  if (!a || a.food !== food) return { ok: false, reward: { stars: 0, badges: [], unlocked: [] } };
  s.zoo.fedOk += 1;
  return { ok: true, reward: reward(s, 0) };
}

/** Dọn sạch một khu. */
export function zooClean(s: WorldSave, zone: ZooZone, now: number): ZooReward {
  s.zoo.cleanAt[zone] = now;
  return reward(s, 0);
}

/** Khu có lá rụng cần dọn không (chỉ trang trí — không phạt, không nhắc gây áp lực). */
export function zooDirty(s: WorldSave, zone: ZooZone, now: number): boolean {
  const t = s.zoo.cleanAt[zone];
  return t === undefined || now - t > ZOO_DIRTY_AFTER_MS;
}
