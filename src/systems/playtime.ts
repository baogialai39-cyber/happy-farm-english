/**
 * THỜI GIAN CHƠI AN TOÀN (SPEC 2 + 17, CLAUDE.md A9, A10).
 * Một phiên chơi = một ngày trong game. Trời tối khi phiên hết — độ dài phiên là GIÁ TRỊ NHỎ NHẤT của:
 *   giới hạn phụ huynh · bảng tuổi · thời gian còn lại trong ngày · trần kỹ thuật 60 phút.
 * Hàm thuần (dễ test) + lưu trữ theo hồ sơ (IndexedDB + bản sao localStorage).
 */
import { AGE_RULES, type AgeGroup } from '../config/ageRules';
import { dayKey } from '../content/quests';
import { type KV, readBackup, writeBackup } from '../storage/kv';

/** Trần kỹ thuật tuyệt đối của một phiên (yêu cầu "60 phút") — bảng tuổi luôn thấp hơn. */
export const ABSOLUTE_SESSION_MAX_MIN = 60;
/** Quay lại trong khoảng này (VD lỡ tải lại trang) → vẫn là phiên cũ, không tính ngày mới. */
export const RESUME_WINDOW_MS = 10 * 60_000;
/** Nhắc nhẹ khi còn ~2 phút (SPEC 2). */
export const REMINDER_SEC = 120;
export const MIN_PARENT_MIN = 5;

export interface ParentLimits {
  dailyMin?: number;
  sessionMin?: number;
}

export interface Usage {
  date: string; // YYYY-MM-DD (giờ thiết bị)
  usedSec: number; // đã dùng trong ngày
  sessionSec: number; // đã dùng trong phiên hiện tại
  inSession: boolean;
  lastTick: number; // ms
  restUntil: number; // ms — trước mốc này không được bắt đầu phiên mới
  farmDay: number; // số ngày trong game
  reminded: boolean;
  savedAt: number;
}

export function newUsage(now = Date.now()): Usage {
  return { date: dayKey(new Date(now)), usedSec: 0, sessionSec: 0, inSession: false, lastTick: 0, restUntil: 0, farmDay: 0, reminded: false, savedAt: now };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface Limits {
  dailySec: number;
  sessionSec: number;
  breakSec: number;
}

/** Giới hạn thực tế: phụ huynh chỉ được GIẢM; không bao giờ vượt trần theo tuổi / 60 phút. */
export function effectiveLimits(g: AgeGroup, parent: ParentLimits = {}): Limits {
  const r = AGE_RULES[g];
  const daily = clamp(Math.round(parent.dailyMin ?? r.dailyMinutes.default), MIN_PARENT_MIN, r.dailyMinutes.cap);
  const session = clamp(Math.round(parent.sessionMin ?? r.playSessionMinutes.default), MIN_PARENT_MIN, r.playSessionMinutes.cap);
  return {
    dailySec: daily * 60,
    sessionSec: Math.min(session, daily, ABSOLUTE_SESSION_MAX_MIN) * 60,
    breakSec: r.restBreakMinutes * 60,
  };
}

export function sanitizeParentLimits(g: AgeGroup, raw: unknown): ParentLimits {
  const r = AGE_RULES[g];
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: ParentLimits = {};
  if (typeof o.dailyMin === 'number' && Number.isFinite(o.dailyMin)) out.dailyMin = clamp(Math.round(o.dailyMin), MIN_PARENT_MIN, r.dailyMinutes.cap);
  if (typeof o.sessionMin === 'number' && Number.isFinite(o.sessionMin)) out.sessionMin = clamp(Math.round(o.sessionMin), MIN_PARENT_MIN, r.playSessionMinutes.cap);
  return out;
}

/** Sang ngày mới (giờ thiết bị) → thời gian trong ngày về 0. */
export function rollDate(u: Usage, now = Date.now()): Usage {
  const today = dayKey(new Date(now));
  if (u.date !== today) {
    u.date = today;
    u.usedSec = 0;
  }
  return u;
}

export function nextMidnight(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export type StartCheck = { ok: true } | { ok: false; reason: 'daily' | 'rest'; until: number };

export function canStart(u: Usage, lim: Limits, now = Date.now()): StartCheck {
  rollDate(u, now);
  if (u.inSession && now - u.lastTick < RESUME_WINDOW_MS && remainingSec(u, lim) > 0) return { ok: true }; // tiếp tục phiên dở
  // Phiên đã hết giờ nhưng chưa kịp ghi "kết thúc" (VD đóng app đúng lúc trời tối) → vẫn coi là đã hết phiên
  if (u.inSession && remainingSec(u, lim) <= 0) {
    const daily = u.usedSec >= lim.dailySec;
    const until = daily ? nextMidnight(now) : u.lastTick + lim.breakSec * 1000;
    if (daily || now < until) return { ok: false, reason: daily ? 'daily' : 'rest', until };
  }
  if (u.usedSec >= lim.dailySec) return { ok: false, reason: 'daily', until: nextMidnight(now) };
  if (now < u.restUntil) return { ok: false, reason: 'rest', until: u.restUntil };
  return { ok: true };
}

/** Vào thế giới: tiếp tục phiên dở (tải lại trang) hoặc bắt đầu ngày mới trong game. */
export function beginSession(u: Usage, now = Date.now()): { resumed: boolean } {
  rollDate(u, now);
  if (u.inSession && now - u.lastTick < RESUME_WINDOW_MS) {
    u.lastTick = now;
    return { resumed: true };
  }
  u.inSession = true;
  u.sessionSec = 0;
  u.reminded = false;
  u.farmDay += 1;
  u.lastTick = now;
  return { resumed: false };
}

/** Cộng thời gian (chỉ gọi khi app đang hiển thị). */
export function tick(u: Usage, sec: number, now = Date.now()): void {
  rollDate(u, now);
  const s = Math.max(0, Math.min(sec, 5)); // chặn bước nhảy lớn (máy ngủ, tab treo)
  u.usedSec += s;
  u.sessionSec += s;
  u.lastTick = now;
}

export function remainingSec(u: Usage, lim: Limits): number {
  return Math.max(0, Math.min(lim.sessionSec - u.sessionSec, lim.dailySec - u.usedSec));
}

/** Tiến độ ngày trong game 0..1 (1 = đêm). */
export function dayProgress(u: Usage, lim: Limits): number {
  const rem = remainingSec(u, lim);
  const total = u.sessionSec + rem;
  return total <= 0 ? 1 : Math.min(1, u.sessionSec / total);
}

export type SkyPhase = 'day' | 'sunset' | 'dusk' | 'night';
export function skyPhase(p: number): SkyPhase {
  if (p >= 1) return 'night';
  if (p >= 0.92) return 'dusk';
  if (p >= 0.75) return 'sunset';
  return 'day';
}

/** Kết thúc phiên (GOOD NIGHT): nghỉ bắt buộc theo tuổi, hoặc tới ngày mai nếu hết giờ trong ngày. */
export function endSession(u: Usage, lim: Limits, now = Date.now()): void {
  rollDate(u, now);
  u.inSession = false;
  u.sessionSec = 0;
  u.restUntil = u.usedSec >= lim.dailySec ? nextMidnight(now) : now + lim.breakSec * 1000;
}

/** Phụ huynh cho bé chơi tiếp: chỉ bỏ giờ nghỉ giữa phiên, KHÔNG vượt giới hạn trong ngày. */
export function parentEndBreak(u: Usage, lim: Limits, now = Date.now()): boolean {
  rollDate(u, now);
  if (u.usedSec >= lim.dailySec) return false;
  u.restUntil = 0;
  return true;
}

export function sanitizeUsage(raw: unknown, now = Date.now()): Usage {
  const u = newUsage(now);
  if (!raw || typeof raw !== 'object') return u;
  const r = raw as Record<string, unknown>;
  const num = (k: string) => (typeof r[k] === 'number' && Number.isFinite(r[k] as number) && (r[k] as number) >= 0 ? (r[k] as number) : undefined);
  if (typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) u.date = r.date;
  u.usedSec = num('usedSec') ?? 0;
  u.sessionSec = num('sessionSec') ?? 0;
  u.inSession = r.inSession === true;
  u.lastTick = num('lastTick') ?? 0;
  u.restUntil = num('restUntil') ?? 0;
  u.farmDay = Math.floor(num('farmDay') ?? 0);
  u.reminded = r.reminded === true;
  u.savedAt = num('savedAt') ?? 0;
  return rollDate(u, now);
}

// ---------- Lưu trữ theo hồ sơ ----------
const usageKey = (pid: string) => `usage:${pid}`;
const limitKey = (pid: string) => `limits:${pid}`;

/** Đọc bản mới nhất giữa IndexedDB và bản sao đồng bộ (localStorage). */
export async function loadUsage(kv: KV, pid: string, now = Date.now()): Promise<Usage> {
  const a = sanitizeUsage(await kv.get(usageKey(pid)), now);
  const b = sanitizeUsage(readBackup(usageKey(pid)), now);
  return b.savedAt > a.savedAt ? b : a;
}

export async function storeUsage(kv: KV, pid: string, u: Usage): Promise<void> {
  u.savedAt = Date.now();
  writeBackup(usageKey(pid), u);
  await kv.set(usageKey(pid), u);
}

/** Ghi đồng bộ (khi trang bị đóng — IndexedDB có thể không kịp). */
export function backupUsage(pid: string, u: Usage): void {
  u.savedAt = Date.now();
  writeBackup(usageKey(pid), u);
}

export async function loadParentLimits(kv: KV, pid: string, g: AgeGroup): Promise<ParentLimits> {
  return sanitizeParentLimits(g, await kv.get(limitKey(pid)));
}

export async function storeParentLimits(kv: KV, pid: string, g: AgeGroup, l: ParentLimits): Promise<void> {
  await kv.set(limitKey(pid), sanitizeParentLimits(g, l));
}

/** Giờ dạng HH:MM cho bố mẹ. */
export function clockText(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
