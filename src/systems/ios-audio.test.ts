/**
 * Âm thanh trên iPhone (F-210 → F-212): mở khóa giọng đọc trong thao tác chạm, dự phòng giọng mặc định
 * khi iOS chưa trả danh sách giọng, lỗi trước khi mở khóa không làm tắt giọng vĩnh viễn, WAV tạo tại chỗ.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasVoice, isIOS, setSpeechBackend, speakPlan, testSpeech, unlockSpeech, voiceInfo } from './speech';
import { readFileSync } from 'node:fs';

interface FakeU { text: string; lang: string; volume: number; voice?: unknown; onstart?: () => void; onend?: () => void; onerror?: (e: { error: string }) => void }

function backend(voices: SpeechSynthesisVoice[], mode: 'ok' | 'blocked' = 'ok') {
  const spoken: FakeU[] = [];
  const b = {
    getVoices: () => voices,
    speak(u: SpeechSynthesisUtterance) {
      const fu = u as unknown as FakeU;
      spoken.push(fu);
      if (mode === 'blocked') return; // iOS chưa mở khóa: không bao giờ bắt đầu đọc
      setTimeout(() => { fu.onstart?.(); fu.onend?.(); }, 200);
    },
    cancel() {},
    resume() {},
    paused: false,
    makeUtterance: (text: string) => ({ text, lang: '', volume: 1 }) as unknown as SpeechSynthesisUtterance,
    onVoicesChanged() {},
  };
  return { b, spoken };
}
const voice = (name: string, lang: string, localService = true) => ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice;
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  setSpeechBackend(null);
});

describe('giọng đọc trên iPhone (F-211)', () => {
  it('nhận diện iPhone và iPad (iPadOS báo Macintosh + màn cảm ứng)', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE, maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
    vi.stubGlobal('navigator', { userAgent: DESKTOP, maxTouchPoints: 0 });
    expect(isIOS()).toBe(false);
  });

  it('mở khóa: đọc một câu rỗng âm lượng 0 NGAY (đồng bộ) trong thao tác chạm, chỉ một lần', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE, maxTouchPoints: 5 });
    const f = backend([voice('Samantha', 'en-US')]);
    setSpeechBackend(f.b as never);
    unlockSpeech();
    expect(f.spoken.length).toBe(1); // không chờ timer nào
    expect(f.spoken[0].volume).toBe(0);
    expect(f.spoken[0].lang).toBe('en-US');
    unlockSpeech();
    expect(f.spoken.length).toBe(1);
  });

  it('iOS chưa trả danh sách giọng → vẫn đọc bằng giọng tiếng Anh mặc định của máy (en-US)', async () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE, maxTouchPoints: 5 });
    const f = backend([]);
    setSpeechBackend(f.b as never);
    expect(hasVoice()).toBe(true);
    expect(voiceInfo()?.lang).toBe('en-US');
    const p = speakPlan({ text: 'Hello!', times: 3, pauseMs: 800, rate: 0.9 });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await p).toBe('done');
    expect(f.spoken.map((u) => u.text)).toEqual(['Hello!', 'Hello!', 'Hello!']);
    expect(f.spoken.every((u) => u.lang === 'en-US')).toBe(true);
  });

  it('máy tính không có giọng cục bộ → KHÔNG dự phòng (giữ luật chỉ dùng giọng trên máy)', () => {
    vi.stubGlobal('navigator', { userAgent: DESKTOP, maxTouchPoints: 0 });
    setSpeechBackend(backend([]).b as never);
    expect(hasVoice()).toBe(false);
    setSpeechBackend(backend([voice('Google US English', 'en-US', false)]).b as never);
    expect(hasVoice()).toBe(false);
  });

  it('lỗi lúc CHƯA mở khóa không làm tắt giọng vĩnh viễn: lần chạm sau đọc lại được', async () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE, maxTouchPoints: 5 });
    const blocked = backend([voice('Samantha', 'en-US')], 'blocked');
    setSpeechBackend(blocked.b as never);
    for (let i = 0; i < 2; i++) {
      const p = speakPlan({ text: 'Hello!', times: 2, pauseMs: 100, rate: 1 });
      await vi.advanceTimersByTimeAsync(20_000);
      await p;
    }
    expect(hasVoice()).toBe(false); // ≥ 3 lần lỗi liên tiếp → tạm im lặng
    unlockSpeech(); // bé chạm màn hình
    expect(hasVoice()).toBe(true);
  });

  it('TEST SOUND báo thật: đọc xong → ended; bị chặn → timeout (không giả là thành công)', async () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE, maxTouchPoints: 5 });
    setSpeechBackend(backend([voice('Samantha', 'en-US')]).b as never);
    const ok = testSpeech('Hello!');
    await vi.advanceTimersByTimeAsync(1000);
    expect(await ok).toEqual({ started: true, ended: true });
    setSpeechBackend(backend([voice('Samantha', 'en-US')], 'blocked').b as never);
    const bad = testSpeech('Hello!');
    await vi.advanceTimersByTimeAsync(7000);
    expect(await bad).toEqual({ started: false, ended: false, error: 'timeout' });
  });
});

describe('file âm thanh đi kèm (public/sounds — F-210, F-212)', () => {
  const read = (n: string) => readFileSync(new URL(`../../public/sounds/${n}`, import.meta.url));
  it('silence.wav: WAV PCM 16-bit mono hợp lệ, toàn im lặng', () => {
    const bin = read('silence.wav');
    expect(bin.toString('ascii', 0, 4)).toBe('RIFF');
    expect(bin.toString('ascii', 8, 12)).toBe('WAVE');
    expect(bin.readUInt16LE(20)).toBe(1); // PCM
    expect(bin.readUInt16LE(22)).toBe(1); // mono
    expect(bin.readUInt16LE(34)).toBe(16);
    expect(bin.readUInt32LE(40)).toBe(bin.length - 44);
    expect([...bin.subarray(44)].every((b) => b === 0)).toBe(true);
  });
  it('test-beep.wav: hợp lệ, biên độ vừa phải (không giật mình), vào/ra mềm', () => {
    const bin = read('test-beep.wav');
    expect(bin.toString('ascii', 0, 4)).toBe('RIFF');
    expect(bin.readUInt32LE(40)).toBe(bin.length - 44);
    let peak = 0;
    for (let i = 44; i < bin.length; i += 2) peak = Math.max(peak, Math.abs(bin.readInt16LE(i)));
    expect(peak).toBeGreaterThan(0.3 * 32767);
    expect(peak).toBeLessThanOrEqual(Math.ceil(0.35 * 32767));
    expect(bin.readInt16LE(44)).toBe(0);
  });
});
