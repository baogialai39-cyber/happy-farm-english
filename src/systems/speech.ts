/**
 * BỘ ĐỌC TIẾNG ANH (SPEC 13.7, 15.2) — một kênh giọng duy nhất cho cả game.
 *
 * - Chỉ dùng giọng tiếng Anh CÓ SẴN TRÊN MÁY (`localService`) → chạy khi không có mạng,
 *   không gửi chữ lên máy chủ. Ưu tiên giọng Mỹ (en-US).
 * - Không bao giờ dùng giọng không phải tiếng Anh (không đọc tiếng Việt thay tiếng Anh).
 * - Lời mới hủy lời cũ (token) → không bao giờ chồng giọng.
 * - Mỗi lần đọc có hạn giờ dự phòng: trình duyệt "kẹt"/báo lỗi vẫn đi tiếp, không treo.
 */

export interface SpeechBackend {
  getVoices(): SpeechSynthesisVoice[];
  speak(u: SpeechSynthesisUtterance): void;
  cancel(): void;
  resume(): void;
  readonly paused: boolean;
  makeUtterance(text: string): SpeechSynthesisUtterance;
  onVoicesChanged(cb: () => void): void;
}

function browserBackend(): SpeechBackend | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return null;
  const synth = window.speechSynthesis;
  return {
    getVoices: () => synth.getVoices(),
    speak: (u) => synth.speak(u),
    cancel: () => synth.cancel(),
    resume: () => synth.resume(),
    get paused() { return synth.paused; },
    makeUtterance: (t) => new SpeechSynthesisUtterance(t),
    onVoicesChanged: (cb) => synth.addEventListener?.('voiceschanged', cb),
  };
}

let backend: SpeechBackend | null = browserBackend();
let voice: SpeechSynthesisVoice | null = null;
let token = 0;
let consecutiveFailures = 0;

/**
 * Giọng em bé (SPEC 18.8): ưu tiên giọng TRẺ EM có sẵn trên máy (tên chứa child/kid/junior hoặc "Ana"),
 * rồi giọng NỮ trẻ vui tươi, rồi giọng Mỹ khác. Không giả giọng một em bé cụ thể.
 */
const CHILD = /child|kid|junior|\bana\b/i;
const YOUNG_FEMALE = /samantha|ava|allison|aria|jenny|zira|susan|michelle|emma|ana\b/i;
const US_OTHER = /alex|guy|david|mark/i;

/** Chọn giọng: tiếng Anh + cục bộ; en-US (trẻ em → nữ trẻ → khác), rồi en-GB, rồi tiếng Anh khác. */
export function pickLocalEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const local = voices.filter((v) => v.localService && /^en([-_]|$)/i.test(v.lang));
  const us = local.filter((v) => /^en[-_]US/i.test(v.lang));
  return us.find((v) => CHILD.test(v.name)) ?? us.find((v) => YOUNG_FEMALE.test(v.name)) ?? us.find((v) => US_OTHER.test(v.name)) ?? us[0]
    ?? local.find((v) => CHILD.test(v.name)) ?? local.find((v) => /^en[-_]GB/i.test(v.lang)) ?? local[0] ?? null;
}

/** Cao độ: giọng trẻ em giữ tự nhiên (1,1); giọng người lớn nâng nhẹ (1,3) cho trong trẻo, vẫn rõ chữ. */
export function pitchFor(v: SpeechSynthesisVoice | null): number {
  return v && CHILD.test(v.name) ? 1.1 : 1.3;
}

/** Số giọng máy đã trả về (iOS có lúc trả danh sách rỗng ở lần đầu). */
let voiceCount = 0;
function refresh() {
  const list = backend ? backend.getVoices() : [];
  voiceCount = list.length;
  voice = backend ? pickLocalEnglishVoice(list) : null;
}

/** iPhone / iPad (kể cả iPadOS báo là Macintosh). */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && (navigator.maxTouchPoints ?? 0) > 1);
}

/**
 * iOS chưa trả danh sách giọng → vẫn đọc bằng giọng tiếng Anh MẶC ĐỊNH của máy (chạy trên thiết bị, SPEC 9).
 * Máy tính: không dự phòng (chỉ giọng cục bộ đã chọn — SPEC 15.2).
 */
function useDefaultVoice(): boolean {
  return !!backend && !voice && voiceCount === 0 && isIOS();
}

let speechUnlocked = false;
/**
 * Mở khóa giọng đọc trên iOS: PHẢI gọi đồng bộ trong sự kiện chạm (touchend / click).
 * iOS chỉ cho đọc sau khi lần speak() đầu tiên xảy ra trong một thao tác của người dùng.
 * Mỗi lần chạm cũng xóa bộ đếm lỗi (lỗi trước khi mở khóa không được làm tắt giọng vĩnh viễn).
 */
export function unlockSpeech(): void {
  consecutiveFailures = 0;
  if (!backend) return;
  if (!voice) refresh();
  if (speechUnlocked) return;
  speechUnlocked = true;
  try {
    const u = backend.makeUtterance(' ');
    u.volume = 0;
    u.lang = voice?.lang ?? 'en-US';
    if (voice) u.voice = voice;
    if (backend.paused) backend.resume();
    backend.speak(u);
  } catch {
    speechUnlocked = false; // thử lại ở lần chạm sau
  }
}
refresh();
backend?.onVoicesChanged(refresh);

/** Dùng cho test: thay trình đọc của trình duyệt bằng bản giả. */
export function setSpeechBackend(b: SpeechBackend | null): void {
  backend = b;
  token++;
  consecutiveFailures = 0;
  refresh();
  b?.onVoicesChanged(refresh);
}

export function hasVoice(): boolean {
  if (!voice) refresh();
  return (voice !== null || useDefaultVoice()) && consecutiveFailures < 3;
}

export function voiceInfo(): { name: string; lang: string } | null {
  if (voice) return { name: voice.name, lang: voice.lang };
  return useDefaultVoice() ? { name: 'Giọng tiếng Anh mặc định của máy', lang: 'en-US' } : null;
}

/** Số giọng máy đang có (để TEST SOUND hiển thị). */
export function voiceTotal(): number {
  refresh();
  return voiceCount;
}

/** Ước lượng thời gian đọc (ms) — dùng làm hạn giờ dự phòng và khi máy không có giọng. */
export function estimateMs(text: string, rate: number): number {
  return Math.round(500 + (text.length * 70) / Math.max(0.5, rate));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Dừng mọi lời đang đọc / đang chờ đọc. */
export function stopSpeech(): void {
  token++;
  try {
    backend?.cancel();
  } catch {
    /* bỏ qua */
  }
}

/** Đọc một lần; luôn kết thúc (xong / lỗi / hạn giờ). Trả về true nếu đọc thành công. */
function speakOnce(text: string, rate: number, myToken: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (!backend || (!voice && !useDefaultVoice())) return resolve(false);
    let finished = false;
    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const u = backend.makeUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US'; // luôn là tiếng Anh
    u.rate = rate;
    u.pitch = pitchFor(voice);
    u.volume = 1;
    u.onend = () => finish(true);
    u.onerror = (e: SpeechSynthesisErrorEvent | Event) => {
      const err = (e as SpeechSynthesisErrorEvent).error;
      // bị chính ta hủy → không tính là lỗi
      finish(err === 'interrupted' || err === 'canceled' ? myToken === token : false);
    };
    const timer = setTimeout(() => finish(false), estimateMs(text, rate) + 2500);
    try {
      if (backend.paused) backend.resume(); // Chrome đôi khi tự "pause"
      backend.speak(u);
    } catch {
      finish(false);
    }
  });
}

export type SpeechResult = 'done' | 'silent' | 'cancelled';

export interface SpeakPlan {
  text: string;
  times: number;
  pauseMs: number;
  rate: number;
  /** Gọi ngay trước mỗi lần đọc (i = 0, 1, 2…) — để tô chấm tiến độ. */
  onRead?: (i: number) => void;
}

/**
 * Đọc `text` đủ `times` lần, nghỉ `pauseMs` giữa các lần. Hủy mọi lời cũ trước khi bắt đầu.
 * Máy không có giọng → vẫn "chạy" theo thời gian ước lượng để ô từ vựng hiện đủ lâu, trả 'silent'.
 */
export async function speakPlan(plan: SpeakPlan): Promise<SpeechResult> {
  stopSpeech();
  const my = token;
  await sleep(60); // Chrome bỏ qua lời đọc nếu speak() ngay sau cancel()
  if (my !== token) return 'cancelled';
  let spokeAny = false;
  for (let i = 0; i < plan.times; i++) {
    if (my !== token) return 'cancelled';
    plan.onRead?.(i);
    const canSpeak = hasVoice();
    const ok = canSpeak ? await speakOnce(plan.text, plan.rate, my) : (await sleep(estimateMs(plan.text, plan.rate)), false);
    if (my !== token) return 'cancelled';
    if (canSpeak) consecutiveFailures = ok ? 0 : consecutiveFailures + 1;
    spokeAny ||= ok;
    if (i < plan.times - 1) await sleep(plan.pauseMs);
  }
  if (my !== token) return 'cancelled';
  return spokeAny ? 'done' : 'silent';
}

/** Đọc một câu ngắn một lần (lời người bán, chào…). Cũng đi qua kênh chung → hủy lời cũ. */
export function speak(text: string, rate = 1): void {
  void speakPlan({ text, times: 1, pauseMs: 0, rate });
}

/**
 * TEST SOUND (F-212): đọc thử một câu và báo THẬT điều gì đã xảy ra (bắt đầu? kết thúc? lỗi gì?).
 * Gọi trong sự kiện chạm để iOS cho phép đọc.
 */
export function testSpeech(text: string, rate = 0.9): Promise<{ started: boolean; ended: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!backend) return resolve({ started: false, ended: false, error: 'no-speech-synthesis' });
    stopSpeech();
    let started = false;
    const done = (r: { started: boolean; ended: boolean; error?: string }) => {
      clearTimeout(timer);
      resolve(r);
    };
    const u = backend.makeUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.rate = rate;
    u.pitch = pitchFor(voice);
    u.volume = 1;
    u.onstart = () => { started = true; };
    u.onend = () => done({ started: true, ended: true });
    u.onerror = (e: SpeechSynthesisErrorEvent | Event) => done({ started, ended: false, error: (e as SpeechSynthesisErrorEvent).error ?? 'error' });
    const timer = setTimeout(() => done({ started, ended: false, error: started ? undefined : 'timeout' }), 6000);
    try {
      if (backend.paused) backend.resume();
      backend.speak(u);
    } catch (err) {
      done({ started: false, ended: false, error: String(err) });
    }
  });
}
