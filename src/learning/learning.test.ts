import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AGE_RULES } from '../config/ageRules';
import { ACCESSORIES, ACCESSORY_TABS, ANIMALS, ITEMS } from '../content/items';
import { REQUIRED_SENTENCES, SENTENCES, VOCAB, haveSentence, resolveVocab } from '../content/vocab';
import { BOOK_TOPICS, PIANO_KEYS, TOYS } from '../content/words';
import { type SpeechBackend, pickLocalEnglishVoice, setSpeechBackend, speakPlan } from '../systems/speech';
import { WORLD } from '../world/map';

// ---------------------------------------------------------------------------
// 1) KHO TỪ VỰNG — phủ mọi thứ trong game
// ---------------------------------------------------------------------------
describe('kho từ vựng', () => {
  it('mọi mục từ có IPA (/…/), nghĩa tiếng Việt và hình', () => {
    for (const v of VOCAB.values()) {
      expect(v.ipa, v.en).toMatch(/^\/.+\/$/);
      expect(v.vi.length, v.en).toBeGreaterThan(1);
      expect(v.emoji.length, v.en).toBeGreaterThan(0);
      expect(v.en).toBe(v.en.toLowerCase());
    }
    expect(VOCAB.get('apple')).toEqual({ en: 'apple', ipa: '/ˈæp.əl/', vi: 'Quả táo', emoji: '🍎' });
  });

  it('đủ từ theo 5 chủ đề yêu cầu', () => {
    const topics: Record<string, string[]> = {
      Farm: ['farm', 'tree', 'flower', 'garden', 'water'],
      Gardening: ['seed', 'plant', 'water', 'grow', 'harvest'],
      Fruits: ['apple', 'banana', 'orange', 'strawberry', 'watermelon'],
      Baking: ['cake', 'milk', 'egg', 'sugar', 'flour'],
      Animals: ['cow', 'chicken', 'duck', 'pig', 'sheep'],
    };
    for (const [title, words] of Object.entries(topics)) {
      const t = BOOK_TOPICS.find((b) => b.title === title);
      expect(t, title).toBeDefined();
      for (const w of words) {
        expect(VOCAB.has(w), w).toBe(true);
        expect(t!.cards.some((c) => c.word === w), `${title}: ${w}`).toBe(true);
      }
    }
  });

  it('5 câu ngắn yêu cầu đều có, kèm nghĩa', () => {
    const all = Object.values(SENTENCES).map((s) => s.en);
    for (const s of REQUIRED_SENTENCES) expect(all).toContain(s);
    for (const s of Object.values(SENTENCES)) expect(s.vi.length).toBeGreaterThan(2);
    expect(haveSentence('apple', '🍎').en).toBe('I have an apple!');
    expect(haveSentence('carrot', '🥕').en).toBe('I have a carrot!');
    expect(haveSentence('orange', '🍊').en).toBe('I have an orange!');
  });

  it('mọi vật phẩm, phụ kiện, con vật, đồ vật, khu vực, đồ chơi, màu, số đều có mục từ', () => {
    const words = [
      ...ITEMS.map((i) => i.word),
      ...ACCESSORIES.map((a) => a.word),
      ...ACCESSORY_TABS.map((t) => t.title),
      ...Object.values(ANIMALS).map((a) => a.word),
      ...WORLD.objects.map((o) => o.word),
      ...WORLD.zones.map((z) => z.vocab),
      ...TOYS.map((t) => t.word),
      ...PIANO_KEYS.map((k) => k.word),
      ...BOOK_TOPICS.map((t) => t.title),
      ...BOOK_TOPICS.flatMap((t) => t.cards.filter((c) => !c.sentence).map((c) => c.word)),
    ];
    const missing = [...new Set(words)].filter((w) => !resolveVocab(w));
    expect(missing).toEqual([]);
  });

  it('mọi chỗ gọi learn("…") trong mã nguồn đều có mục từ', () => {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d, { withFileTypes: true })) {
        if (f.isDirectory()) walk(join(d, f.name));
        else if (f.name.endsWith('.ts') && !f.name.endsWith('.test.ts')) files.push(join(d, f.name));
      }
    };
    walk(join(__dirname, '..'));
    const literals = new Set<string>();
    for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/learn\('([^']+)'/g)) literals.add(m[1]);
    expect(literals.size).toBeGreaterThan(15);
    expect([...literals].filter((w) => !resolveVocab(w))).toEqual([]);
  });

  it('mua hạt táo dạy APPLE (không phải "apple seeds")', () => {
    expect(resolveVocab('apple seeds')?.en).toBe('apple');
  });
});

// ---------------------------------------------------------------------------
// 2) BỘ ĐỌC — 3 lần, nghỉ, không chồng giọng, xử lý lỗi
// ---------------------------------------------------------------------------
type FakeU = SpeechSynthesisUtterance & { text: string };
const voice = (name: string, lang: string, localService = true) => ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice;

function fakeBackend(opts: { voices: SpeechSynthesisVoice[]; mode?: 'ok' | 'stuck' | 'error'; durMs?: number }) {
  const log: { text: string; at: number; lang: string }[] = [];
  let active = 0;
  let maxActive = 0;
  let current: FakeU | null = null;
  let cancels = 0;
  const b: SpeechBackend = {
    getVoices: () => opts.voices,
    speak(u) {
      const fu = u as FakeU;
      active++;
      maxActive = Math.max(maxActive, active);
      current = fu;
      log.push({ text: fu.text, at: Date.now(), lang: fu.lang });
      if (opts.mode === 'stuck') return; // trình duyệt "kẹt": không bao giờ báo xong
      setTimeout(() => {
        if (current !== fu) return;
        active--;
        current = null;
        if (opts.mode === 'error') fu.onerror?.({ error: 'synthesis-failed' } as never);
        else fu.onend?.({} as never);
      }, opts.durMs ?? 400);
    },
    cancel() {
      cancels++;
      if (current) {
        const u = current;
        current = null;
        active = 0;
        u.onerror?.({ error: 'interrupted' } as never);
      }
      active = 0;
    },
    resume() {},
    paused: false,
    makeUtterance: (text) => ({ text, onend: null, onerror: null }) as unknown as SpeechSynthesisUtterance,
    onVoicesChanged() {},
  };
  return { b, log, get maxActive() { return maxActive; }, get cancels() { return cancels; } };
}

describe('bộ đọc', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    setSpeechBackend(null);
    vi.useRealTimers();
  });

  it('ưu tiên giọng Mỹ cục bộ; không bao giờ chọn giọng mạng hoặc không phải tiếng Anh', () => {
    const vs = [voice('Vietnamese', 'vi-VN'), voice('Google US English', 'en-US', false), voice('Daniel', 'en-GB'), voice('Microsoft Zira', 'en-US')];
    expect(pickLocalEnglishVoice(vs)?.name).toBe('Microsoft Zira');
    expect(pickLocalEnglishVoice([voice('Daniel', 'en-GB'), voice('Linh', 'vi-VN')])?.name).toBe('Daniel');
    expect(pickLocalEnglishVoice([voice('Linh', 'vi-VN'), voice('Google US English', 'en-US', false)])).toBeNull();
  });

  it('đọc đúng 3 lần, nghỉ giữa các lần, không chồng giọng, giọng en-US', async () => {
    const f = fakeBackend({ voices: [voice('Samantha', 'en-US')] });
    setSpeechBackend(f.b);
    const reads: number[] = [];
    const p = speakPlan({ text: 'apple', times: 3, pauseMs: 1000, rate: 0.9, onRead: (i) => reads.push(i) });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await p).toBe('done');
    expect(f.log.map((l) => l.text)).toEqual(['apple', 'apple', 'apple']);
    expect(f.log.every((l) => l.lang === 'en-US')).toBe(true);
    expect(reads).toEqual([0, 1, 2]);
    expect(f.maxActive).toBe(1);
    // nghỉ ≥ 1 s giữa các lần (đọc 400 ms + nghỉ 1000 ms)
    expect(f.log[1].at - f.log[0].at).toBeGreaterThanOrEqual(1400);
    expect(f.log[2].at - f.log[1].at).toBeGreaterThanOrEqual(1400);
  });

  it('bài mới hủy bài cũ — không bao giờ hai giọng cùng lúc', async () => {
    const f = fakeBackend({ voices: [voice('Samantha', 'en-US')] });
    setSpeechBackend(f.b);
    const p1 = speakPlan({ text: 'apple', times: 3, pauseMs: 1000, rate: 1 });
    await vi.advanceTimersByTimeAsync(700);
    const p2 = speakPlan({ text: 'cake', times: 3, pauseMs: 1000, rate: 1 });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await p1).toBe('cancelled');
    expect(await p2).toBe('done');
    expect(f.maxActive).toBe(1);
    expect(f.log.map((l) => l.text)).toEqual(['apple', 'cake', 'cake', 'cake']);
  });

  it('trình duyệt "kẹt" (không báo xong) → vẫn đi tiếp nhờ hạn giờ, không treo', async () => {
    const f = fakeBackend({ voices: [voice('Samantha', 'en-US')], mode: 'stuck' });
    setSpeechBackend(f.b);
    const p = speakPlan({ text: 'apple', times: 3, pauseMs: 800, rate: 1 });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await p).toBe('silent');
  });

  it('giọng báo lỗi → không treo, trả về "silent" để ô từ vẫn tự ẩn', async () => {
    const f = fakeBackend({ voices: [voice('Samantha', 'en-US')], mode: 'error' });
    setSpeechBackend(f.b);
    const p = speakPlan({ text: 'apple', times: 3, pauseMs: 800, rate: 1 });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await p).toBe('silent');
  });

  it('máy không có giọng tiếng Anh (VD chỉ có tiếng Việt / không mạng) → không đọc gì, vẫn hết giờ bình thường', async () => {
    const f = fakeBackend({ voices: [voice('Linh', 'vi-VN')] });
    setSpeechBackend(f.b);
    const p = speakPlan({ text: 'apple', times: 3, pauseMs: 800, rate: 1 });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await p).toBe('silent');
    expect(f.log).toEqual([]); // không bao giờ đọc bằng giọng tiếng Việt
  });

  it('luật tuổi: mọi nhóm đọc 3 lần, nghỉ giảm dần theo tuổi', () => {
    expect(Object.values(AGE_RULES).map((r) => r.speechRepeat)).toEqual([3, 3, 3]);
    expect(AGE_RULES['2-3'].speechPauseMs).toBeGreaterThan(AGE_RULES['6-8'].speechPauseMs);
  });
});
