import { beforeEach, describe, expect, it } from 'vitest';
import { AGE_RULES, type AgeGroup } from '../config/ageRules';
import { MemoryKV } from '../storage/kv';
import { loadSave, newSave, storeSave } from '../world/save';
import {
  ABSOLUTE_SESSION_MAX_MIN, backupUsage, beginSession, canStart, dayProgress, effectiveLimits, endSession, loadUsage, newUsage,
  parentEndBreak, remainingSec, sanitizeParentLimits, skyPhase, storeUsage, tick,
} from './playtime';

const GROUPS: AgeGroup[] = ['2-3', '4-5', '6-8'];
const T0 = new Date('2026-11-08T09:00:00').getTime();
const MIN = 60_000;

// localStorage giả cho bản sao đồng bộ (môi trường test là Node)
beforeEach(() => {
  const m = new Map<string, string>();
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
});

/** Chơi liên tục `sec` giây (mỗi bước 1 giây). */
function play(u: ReturnType<typeof newUsage>, sec: number, start: number): number {
  let t = start;
  for (let i = 0; i < sec; i++) {
    t += 1000;
    tick(u, 1, t);
  }
  return t;
}

describe('giới hạn theo tuổi (SPEC 2 + 17)', () => {
  it('phiên mặc định 10 / 15 / 20 phút — luôn ngắn hơn 60 phút và ≤ thời gian trong ngày', () => {
    expect(GROUPS.map((g) => effectiveLimits(g).sessionSec / 60)).toEqual([10, 15, 20]);
    for (const g of GROUPS) {
      const r = AGE_RULES[g];
      expect(r.playSessionMinutes.cap).toBeLessThan(ABSOLUTE_SESSION_MAX_MIN);
      expect(r.dailyMinutes.cap).toBeLessThan(ABSOLUTE_SESSION_MAX_MIN);
      expect(r.playSessionMinutes.cap).toBeLessThanOrEqual(r.dailyMinutes.cap);
      expect(r.restBreakMinutes).toBeGreaterThanOrEqual(30);
    }
  });

  it('phụ huynh chỉ GIẢM được; đặt cao hơn trần → bị chặn ở trần tuổi', () => {
    expect(effectiveLimits('4-5', { dailyMin: 10, sessionMin: 15 })).toMatchObject({ dailySec: 600, sessionSec: 600 }); // phiên ≤ ngày
    expect(effectiveLimits('2-3', { dailyMin: 999, sessionMin: 999 })).toMatchObject({ dailySec: 20 * 60, sessionSec: 15 * 60 });
    expect(effectiveLimits('6-8', { sessionMin: 5 }).sessionSec).toBe(300);
    expect(sanitizeParentLimits('4-5', { dailyMin: 500, sessionMin: -3, hack: 1 })).toEqual({ dailyMin: 30, sessionMin: 5 });
  });
});

describe('ngày & đêm', () => {
  it('trời chuyển: ngày → hoàng hôn (75%) → chạng vạng (92%) → đêm (100%)', () => {
    const lim = effectiveLimits('4-5'); // phiên 15 phút
    const u = newUsage(T0);
    beginSession(u, T0);
    expect(skyPhase(dayProgress(u, lim))).toBe('day');
    let t = play(u, 0.76 * 900, T0);
    expect(skyPhase(dayProgress(u, lim))).toBe('sunset');
    t = play(u, 0.17 * 900, t);
    expect(skyPhase(dayProgress(u, lim))).toBe('dusk');
    play(u, 900, t);
    expect(remainingSec(u, lim)).toBe(0);
    expect(skyPhase(dayProgress(u, lim))).toBe('night');
  });

  it('giới hạn phụ huynh làm trời tối SỚM hơn (ưu tiên hơn thời gian trong game)', () => {
    const u = newUsage(T0);
    beginSession(u, T0);
    play(u, 5 * 60, T0);
    expect(remainingSec(u, effectiveLimits('6-8'))).toBe(15 * 60);
    expect(remainingSec(u, effectiveLimits('6-8', { sessionMin: 5 }))).toBe(0); // bố mẹ đặt 5 phút → đêm ngay
  });

  it('phần còn lại của ngày cũng rút ngắn phiên', () => {
    const lim = effectiveLimits('6-8'); // 30 phút/ngày, phiên 20
    const u = newUsage(T0);
    u.usedSec = 25 * 60; // đã chơi 25 phút trước đó
    beginSession(u, T0);
    expect(remainingSec(u, lim)).toBe(5 * 60);
  });
});

describe('kết thúc phiên & nghỉ', () => {
  it('GOOD NIGHT → nghỉ bắt buộc theo tuổi; không chơi tiếp trong lúc nghỉ; sau nghỉ là ngày mới trong game', () => {
    const g: AgeGroup = '4-5';
    const lim = effectiveLimits(g);
    const u = newUsage(T0);
    beginSession(u, T0);
    expect(u.farmDay).toBe(1);
    let t = play(u, 15 * 60, T0);
    endSession(u, lim, t);
    const c1 = canStart(u, lim, t + 60_000);
    expect(c1.ok).toBe(false);
    expect(c1.ok === false && c1.reason).toBe('rest');
    expect(canStart(u, lim, t + 44 * MIN).ok).toBe(false);
    t += 46 * MIN;
    expect(canStart(u, lim, t).ok).toBe(true);
    beginSession(u, t);
    expect(u.farmDay).toBe(2);
    expect(u.sessionSec).toBe(0);
  });

  it('hết giờ trong ngày → khóa tới ngày mai; ngày mai chơi lại được', () => {
    const lim = effectiveLimits('2-3'); // 15 phút/ngày, phiên 10
    const u = newUsage(T0);
    beginSession(u, T0);
    let t = play(u, 600, T0);
    endSession(u, lim, t);
    t += 61 * MIN;
    beginSession(u, t);
    t = play(u, 300, t); // hết 15 phút
    expect(remainingSec(u, lim)).toBe(0);
    endSession(u, lim, t);
    const c = canStart(u, lim, t + 3 * 60 * MIN);
    expect(c.ok === false && c.reason).toBe('daily');
    expect(parentEndBreak(u, lim, t)).toBe(false); // bố mẹ cũng không vượt được giới hạn ngày
    const tomorrow = new Date('2026-11-09T08:00:00').getTime();
    expect(canStart(u, lim, tomorrow).ok).toBe(true);
    expect(u.usedSec).toBe(0);
  });

  it('phụ huynh có thể bỏ giờ nghỉ giữa phiên (không vượt giới hạn ngày)', () => {
    const lim = effectiveLimits('6-8');
    const u = newUsage(T0);
    beginSession(u, T0);
    const t = play(u, 10 * 60, T0);
    endSession(u, lim, t);
    expect(canStart(u, lim, t + MIN).ok).toBe(false);
    expect(parentEndBreak(u, lim, t + MIN)).toBe(true);
    expect(canStart(u, lim, t + MIN).ok).toBe(true);
  });

  it('tải lại trang giữa phiên → vẫn là phiên cũ (không tính thêm ngày)', () => {
    const lim = effectiveLimits('4-5');
    const u = newUsage(T0);
    beginSession(u, T0);
    const t = play(u, 120, T0);
    expect(canStart(u, lim, t + 5000).ok).toBe(true);
    expect(beginSession(u, t + 5000).resumed).toBe(true);
    expect(u.farmDay).toBe(1);
    expect(u.sessionSec).toBe(120);
  });

  it('đóng app đúng lúc trời tối (chưa kịp ghi kết thúc) → mở lại vẫn phải nghỉ', () => {
    const lim = effectiveLimits('4-5');
    const u = newUsage(T0);
    beginSession(u, T0);
    const t = play(u, 15 * 60, T0); // hết phiên, nhưng không gọi endSession
    const c = canStart(u, lim, t + 2 * MIN);
    expect(c.ok).toBe(false);
  });

  it('không tính bước nhảy thời gian lớn (máy ngủ, tab treo)', () => {
    const u = newUsage(T0);
    beginSession(u, T0);
    tick(u, 3600, T0 + 3600_000);
    expect(u.sessionSec).toBeLessThanOrEqual(5);
  });
});

describe('lưu chống mất dữ liệu (SPEC 17.5)', () => {
  it('thời gian dùng: chọn bản mới nhất giữa IndexedDB và bản sao đồng bộ', async () => {
    const kv = new MemoryKV();
    const u = newUsage(Date.now());
    u.farmDay = 3;
    await storeUsage(kv, 'p1', u);
    u.usedSec = 300;
    await new Promise((r) => setTimeout(r, 5));
    backupUsage('p1', u); // đóng trang: chỉ kịp ghi bản sao
    const back = await loadUsage(kv, 'p1');
    expect(back.usedSec).toBe(300);
    expect(back.farmDay).toBe(3);
  });

  it('nông trại: xu, cây, vật phẩm, nhiệm vụ, sao, từ vựng còn nguyên sau khi tải lại', async () => {
    const kv = new MemoryKV();
    const s = newSave();
    s.coins = 42;
    s.inv.apple = 3;
    s.plots['5,27'] = { crop: 'carrot-seed', plantedAt: 1, wateredAt: 2 };
    s.stars = 7;
    s.unlocked = ['u-orange'];
    s.learn.apple = { n: 2, t: 5 };
    s.quests = { day: '2026-11-08', list: [{ id: 'plant', target: 2, progress: 1, claimed: false }] };
    await storeSave(kv, 'p1', s);
    const back = await loadSave(kv, 'p1');
    expect(back).toMatchObject({ coins: 42, stars: 7, unlocked: ['u-orange'] });
    expect(back.inv.apple).toBe(3);
    expect(back.plots['5,27'].crop).toBe('carrot-seed');
    expect(back.learn.apple.n).toBe(2);
    expect(back.quests!.list[0].progress).toBe(1);
  });
});
