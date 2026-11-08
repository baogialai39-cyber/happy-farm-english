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
const CHILD = /child|kid|junior|ana/i;
const YOUNG_FEMALE = /samantha|ava|allison|aria|jenny|zira|susan|michelle|emma|ana/i;
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

function refresh() {
  voice = backend ? pickLocalEnglishVoice(backend.getVoices()) : null;
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
  return voice !== null && consecutiveFailures < 3;
}

export function voiceInfo(): { name: string; lang: string } | null {
  return voice ? { name: voice.name, lang: voice.lang } : null;
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
    if (!backend || !voice) return resolve(false);
    let finished = false;
    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const u = backend.makeUtterance(text);
    u.voice = voice;
    u.lang = voice.lang; // luôn là tiếng Anh
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
