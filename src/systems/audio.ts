/**
 * Âm thanh tạo bằng Web Audio — không file nhạc, không tải mạng.
 * Nhạc nền: giai điệu ngũ cung chậm, âm lượng thấp, lặp lại.
 * Hiệu ứng: "pop" khi chạm, "chime" khi hoàn thành. Không có âm thanh giật mình/thất bại.
 */

const BPM = 76;
const STEP = 60 / BPM / 2; // nốt móc đơn

// Ngũ cung Đô trưởng (Hz). null = nghỉ.
const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.0, A4 = 440.0, C5 = 523.25, D5 = 587.33, E5 = 659.25;
const MELODY: (number | null)[] = [
  E4, null, G4, null, A4, null, G4, E4,
  D4, null, E4, null, G4, null, null, null,
  C5, null, A4, null, G4, null, E4, G4,
  A4, null, G4, null, E4, null, null, null,
  E4, null, G4, null, C5, null, D5, C5,
  A4, null, G4, null, E5, null, D5, null,
  C5, null, A4, G4, E4, null, D4, E4,
  C4, null, null, null, null, null, null, null,
];
// Nốt trầm mỗi 8 bước: C – A – F – G (x2)
const BASS = [130.81, 110.0, 87.31, 98.0, 130.81, 110.0, 87.31, 98.0];

/** Giai điệu BUỔI TỐI (SPEC 17.2): chậm hơn, thấp hơn, êm như hát ru. */
const EVENING_STEP = 60 / 54 / 2;
const G3 = 196.0, A3 = 220.0, C4e = 261.63, D4e = 293.66, E4e = 329.63, G4e = 392.0;
const EVENING: (number | null)[] = [
  E4e, null, null, D4e, C4e, null, null, null,
  D4e, null, E4e, null, G4e, null, null, null,
  E4e, null, null, D4e, C4e, null, A3, null,
  G3, null, null, null, null, null, null, null,
  C4e, null, D4e, null, E4e, null, null, D4e,
  C4e, null, A3, null, G3, null, null, null,
  A3, null, C4e, null, D4e, null, E4e, null,
  C4e, null, null, null, null, null, null, null,
];
const EVENING_BASS = [65.41, 55.0, 43.65, 49.0, 65.41, 55.0, 49.0, 65.41];

import { unlockSpeech } from './speech';

/**
 * 2 file âm thanh nhỏ đi kèm app (public/sounds, Vercel phục vụ như file tĩnh):
 * - silence.wav: đoạn im lặng để mở khóa phiên âm thanh iOS;
 * - test-beep.wav: tiếng bíp cho TEST SOUND.
 * Dùng file thật thay vì data:/blob: URL vì một số trình duyệt nhúng chặn phát media từ URL tạo tại chỗ.
 */
export const SOUND_FILES = {
  silence: `${import.meta.env.BASE_URL}sounds/silence.wav`,
  beep: `${import.meta.env.BASE_URL}sounds/test-beep.wav`,
} as const;

export type MusicMood = 'day' | 'evening';

/** Kết quả kiểm tra Web Audio cho TEST SOUND (F-212). */
export interface AudioDiagnosis {
  supported: boolean;
  state: string;
  sampleRate: number;
  clockRunning: boolean;
  session: string;
  musicOn: boolean;
}

export class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicBus?: GainNode;
  private sfxBus?: GainNode;
  private timer?: number;
  private nextTime = 0;
  private step = 0;
  private wantMusic = true;
  private unlocked = false;
  private primed = false;
  /** Đoạn WAV im lặng phát lặp: giữ iOS ở chế độ "phát media" → không bị nút im lặng tắt tiếng. */
  private media?: HTMLAudioElement;

  constructor(musicOn: boolean) {
    this.wantMusic = musicOn;
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) {
        this.ctx.suspend().catch(() => undefined);
        this.media?.pause();
      } else if (this.unlocked) {
        // có thể bị iOS từ chối khi chưa có thao tác — lần chạm kế tiếp sẽ mở lại (unlock)
        this.ctx.resume().catch(() => undefined);
      }
    });
  }

  get state(): string {
    return this.ctx?.state ?? 'none';
  }

  get musicOn(): boolean {
    return this.wantMusic;
  }

  /**
   * MỞ KHÓA ÂM THANH (F-210) — gọi ĐỒNG BỘ trong sự kiện chạm (touchend / click / pointerup / keydown).
   * Không chờ tác vụ bất đồng bộ nào trước đó (iOS chỉ cho phát trong chính thao tác của người dùng).
   * Gọi lại mỗi lần chạm là an toàn: chỉ làm những việc còn thiếu.
   */
  unlock(): void {
    // iOS 17+: phát như media (không bị nút gạt im lặng tắt tiếng)
    try {
      const as = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (as && as.type !== 'playback') as.type = 'playback';
    } catch {
      /* máy không hỗ trợ */
    }
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      lp.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(lp);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.35;
      this.sfxBus.connect(this.master);
    }
    // resume cả 'suspended' lẫn 'interrupted' (iOS sau cuộc gọi / chuyển app)
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => undefined);
    if (!this.primed) {
      // phát 1 mẫu im lặng qua Web Audio ngay trong thao tác chạm (cách mở khóa kinh điển của iOS)
      try {
        const b = this.ctx.createBuffer(1, 1, 22050);
        const src = this.ctx.createBufferSource();
        src.buffer = b;
        src.connect(this.ctx.destination);
        src.start(0);
        this.primed = true;
      } catch {
        /* thử lại lần chạm sau */
      }
    }
    this.playSilentMedia();
    unlockSpeech();
    this.unlocked = true;
    if (this.wantMusic) this.startMusic();
  }

  /** HTMLAudioElement im lặng: chuyển phiên âm thanh iOS sang "playback" (nghe được khi gạt im lặng). */
  private playSilentMedia(): void {
    if (typeof Audio === 'undefined') return;
    if (!this.media) {
      this.media = new Audio(SOUND_FILES.silence);
      this.media.loop = true;
      this.media.preload = 'auto';
      this.media.setAttribute('playsinline', '');
      this.media.setAttribute('aria-hidden', 'true');
    }
    if (this.media.paused) this.media.play().catch(() => undefined); // bị từ chối → thử lại lần chạm sau
  }

  /** TEST SOUND: kiểm tra THẬT trạng thái Web Audio (đồng hồ âm thanh có chạy không). */
  async diagnose(): Promise<AudioDiagnosis> {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession?.type ?? 'không hỗ trợ';
    if (!this.ctx) return { supported: !!(window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext), state: 'none', sampleRate: 0, clockRunning: false, session, musicOn: this.wantMusic };
    const t0 = this.ctx.currentTime;
    await new Promise((r) => setTimeout(r, 350));
    return { supported: true, state: this.ctx.state, sampleRate: this.ctx.sampleRate, clockRunning: this.ctx.currentTime > t0, session, musicOn: this.wantMusic };
  }

  private mood: MusicMood = 'day';

  /** Đổi giai điệu (ban ngày ↔ buổi tối) — chuyển mềm ở đầu vòng giai điệu kế tiếp. */
  setMood(m: MusicMood): void {
    if (m === this.mood) return;
    this.mood = m;
    this.step = 0;
  }

  get musicMood(): MusicMood {
    return this.mood;
  }

  setMusic(on: boolean): void {
    this.wantMusic = on;
    if (!this.unlocked) return;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  private startMusic(): void {
    if (!this.ctx || !this.musicBus || this.timer !== undefined) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t);
    this.musicBus.gain.linearRampToValueAtTime(0.22, t + 1.5); // tăng dần, không giật
    this.nextTime = t + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 50);
  }

  private stopMusic(): void {
    if (!this.ctx || !this.musicBus) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t);
    this.musicBus.gain.linearRampToValueAtTime(0, t + 0.6);
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private schedule(): void {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + 0.25) {
      const evening = this.mood === 'evening';
      const mel = evening ? EVENING : MELODY;
      const bass = evening ? EVENING_BASS : BASS;
      const step = evening ? EVENING_STEP : STEP;
      const i = this.step % mel.length;
      const f = mel[i];
      if (f) this.note(this.musicBus!, f, this.nextTime, step * (evening ? 3.2 : 2.2), evening ? 0.12 : 0.16, evening ? 'sine' : 'triangle');
      if (i % 8 === 0) this.note(this.musicBus!, bass[(i / 8) % bass.length] * (evening ? 2 : 1), this.nextTime, step * 7, 0.1, 'sine');
      this.nextTime += step;
      this.step++;
    }
  }

  private note(bus: AudioNode, freq: number, at: number, dur: number, vol: number, type: OscillatorType): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g).connect(bus);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  /** Tiếng "pop" nhẹ khi chạm nút. */
  pop(): void {
    if (!this.ctx || !this.sfxBus) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(g).connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Một nốt nhạc (đàn piano trong phòng khách). */
  tone(freq: number, dur = 0.7): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.note(this.sfxBus, freq, t, dur, 0.45, 'triangle');
    this.note(this.sfxBus, freq * 2, t, dur * 0.6, 0.08, 'sine');
  }

  /** Chuông cửa hàng. */
  bell(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.note(this.sfxBus, 1318.5, t, 0.9, 0.22, 'sine');
    this.note(this.sfxBus, 1046.5, t + 0.16, 1.1, 0.22, 'sine');
  }

  /** Tiếng xu. */
  coin(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.note(this.sfxBus, 987.8, t, 0.12, 0.3, 'square');
    this.note(this.sfxBus, 1318.5, t + 0.08, 0.35, 0.25, 'square');
  }

  /** "Hmm?" — một nốt mềm, đi lên như câu hỏi (không phải âm thất bại). */
  hmm(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.note(this.sfxBus, 392, t, 0.22, 0.18, 'sine');
    this.note(this.sfxBus, 440, t + 0.16, 0.3, 0.18, 'sine');
  }

  /** Tràng nốt vui khi trả lời đúng / hoàn thành lượt. */
  fanfare(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.note(this.sfxBus!, f, t + i * 0.1, 0.5, 0.32, 'triangle'));
  }

  /** "Ting" ngắn, nhẹ khi trả lời đúng (không phải lời khen — F-170). */
  ting(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.note(this.sfxBus, 1318.5, t, 0.35, 0.22, 'sine');
    this.note(this.sfxBus, 1975.5, t + 0.06, 0.3, 0.1, 'sine');
  }

  /** Chuỗi nốt vui khi hoàn thành (tạo hồ sơ…). */
  chime(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    [C5, E5, G4 * 2].forEach((f, i) => this.note(this.sfxBus!, f, t + i * 0.12, 0.6, 0.4, 'sine'));
  }

  /**
   * Tiếng con vật (SPEC 18.3) tổng hợp bằng Web Audio: âm lượng vừa phải, vào êm (không giật mình — A8).
   * pts = các điểm [giây, Hz] của đường cao độ; vib = rung (Hz, độ sâu Hz).
   */
  private voice(at: number, dur: number, pts: [number, number][], type: OscillatorType, filter: { type: BiquadFilterType; f: number; q?: number }, vol: number, vib?: [number, number]): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(pts[0][1], at);
    for (const [tt, f] of pts.slice(1)) osc.frequency.linearRampToValueAtTime(f, at + tt);
    if (vib) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = vib[0];
      depth.gain.value = vib[1];
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(at);
      lfo.stop(at + dur + 0.05);
    }
    const flt = ctx.createBiquadFilter();
    flt.type = filter.type;
    flt.frequency.value = filter.f;
    flt.Q.value = filter.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.06, dur / 3));
    g.gain.setValueAtTime(vol, at + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(flt).connect(g).connect(this.sfxBus!);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  /**
   * Tiếng con vật sở thú (SPEC 19.4) — tổng hợp, êm, không giật mình (A8): gầm/gừ đều nhỏ & ngắn.
   * 'bubble' = tiếng bong bóng cho loài dưới nước không có tiếng kêu.
   */
  zoo(kind: string): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + 0.02;
    switch (kind) {
      case 'roar': // sư tử: gầm trầm, ngắn, nhỏ
        return this.voice(t, 1.0, [[0, 120], [0.3, 150], [1.0, 90]], 'sawtooth', { type: 'lowpass', f: 520, q: 1 }, 0.22, [9, 10]);
      case 'trumpet': // voi
        return this.voice(t, 0.9, [[0, 420], [0.15, 620], [0.9, 520]], 'sawtooth', { type: 'bandpass', f: 1100, q: 3 }, 0.18, [6, 20]);
      case 'hum': // hươu cao cổ: ngân rất khẽ
        return this.voice(t, 1.0, [[0, 95], [1.0, 90]], 'sine', { type: 'lowpass', f: 300 }, 0.3);
      case 'zebra': // ngựa vằn: "hí" ngắt quãng
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.16, 0.12, [[0, 520], [0.12, 380]], 'sawtooth', { type: 'bandpass', f: 1200, q: 2 }, 0.16);
        return;
      case 'snort': // tê giác: khịt mũi
        return this.voice(t, 0.35, [[0, 140], [0.35, 90]], 'sawtooth', { type: 'lowpass', f: 380, q: 2 }, 0.26);
      case 'monkey': // "ooh ooh ah ah"
        [[380, 520], [400, 560], [600, 700], [620, 740]].forEach(([a, b], i) => this.voice(t + i * 0.18, 0.15, [[0, a], [0.15, b]], 'triangle', { type: 'bandpass', f: 1200, q: 1.5 }, 0.24));
        return;
      case 'growl': // hổ: gừ nhẹ, ngắn
        return this.voice(t, 0.6, [[0, 110], [0.6, 100]], 'sawtooth', { type: 'lowpass', f: 420, q: 1 }, 0.18, [24, 12]);
      case 'bear':
        return this.voice(t, 0.7, [[0, 130], [0.3, 150], [0.7, 110]], 'sawtooth', { type: 'lowpass', f: 450, q: 1.5 }, 0.2, [18, 8]);
      case 'deer': // tiếng kêu khẽ
        return this.voice(t, 0.4, [[0, 700], [0.4, 520]], 'triangle', { type: 'bandpass', f: 1500, q: 2 }, 0.2);
      case 'fox': // "yip yip"
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.2, 0.1, [[0, 900], [0.1, 700]], 'triangle', { type: 'bandpass', f: 1600, q: 2 }, 0.22);
        return;
      case 'penguin':
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.25, 0.2, [[0, 500], [0.2, 640]], 'sawtooth', { type: 'bandpass', f: 1100, q: 3 }, 0.18);
        return;
      case 'seal': // "ơ ơ" sủa
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.2, 0.13, [[0, 360], [0.13, 280]], 'sawtooth', { type: 'bandpass', f: 900, q: 3 }, 0.22);
        return;
      case 'dolphin': // líu lo, lách cách
        for (let i = 0; i < 5; i++) this.voice(t + i * 0.08, 0.06, [[0, 2200 + i * 150], [0.06, 2600 + i * 150]], 'sine', { type: 'highpass', f: 1200 }, 0.12);
        return;
      case 'parrot':
        return this.voice(t, 0.35, [[0, 1300], [0.12, 1800], [0.35, 1100]], 'sawtooth', { type: 'bandpass', f: 2000, q: 3 }, 0.14);
      case 'peacock':
        return this.voice(t, 0.6, [[0, 900], [0.2, 1400], [0.6, 1000]], 'triangle', { type: 'bandpass', f: 1500, q: 2 }, 0.2);
      case 'flamingo': // "honk"
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.28, 0.2, [[0, 480], [0.2, 420]], 'sawtooth', { type: 'bandpass', f: 900, q: 4 }, 0.2);
        return;
      case 'owl': // "hoo hoo"
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.5, 0.35, [[0, 420], [0.1, 400], [0.35, 360]], 'sine', { type: 'lowpass', f: 900 }, 0.32);
        return;
      default: // bong bóng nước
        for (let i = 0; i < 4; i++) this.voice(t + i * 0.12, 0.08, [[0, 500 + i * 120], [0.08, 900 + i * 150]], 'sine', { type: 'lowpass', f: 2000 }, 0.2);
    }
  }

  animal(kind: string): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + 0.02;
    switch (kind) {
      case 'cow': // "moo" trầm, ngân
        return this.voice(t, 1.1, [[0, 105], [0.35, 128], [1.1, 98]], 'sawtooth', { type: 'lowpass', f: 650 }, 0.3);
      case 'chicken': // "cluck cluck" lách cách
        for (let i = 0; i < 3; i++) this.voice(t + i * 0.13, 0.07, [[0, 620], [0.07, 430]], 'square', { type: 'bandpass', f: 1300, q: 2 }, 0.16);
        return;
      case 'duck': // "quack" giọng mũi
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.26, 0.18, [[0, 400], [0.18, 300]], 'sawtooth', { type: 'bandpass', f: 1050, q: 5 }, 0.3);
        return;
      case 'pig': // "oink oink"
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.22, 0.15, [[0, 240], [0.05, 260], [0.15, 170]], 'sawtooth', { type: 'lowpass', f: 900, q: 3 }, 0.26);
        return;
      case 'sheep': // "baa" rung
        return this.voice(t, 0.75, [[0, 330], [0.2, 350], [0.75, 300]], 'sawtooth', { type: 'bandpass', f: 950, q: 2 }, 0.28, [7, 18]);
      case 'horse': // hí "neigh"
        return this.voice(t, 0.95, [[0, 650], [0.25, 900], [0.95, 480]], 'sawtooth', { type: 'bandpass', f: 1400, q: 2 }, 0.18, [13, 55]);
      case 'rabbit': // "thump thump" nhẹ
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.2, 0.12, [[0, 95], [0.12, 50]], 'sine', { type: 'lowpass', f: 400 }, 0.4);
        return;
      case 'dog': // "woof woof"
        for (let i = 0; i < 2; i++) this.voice(t + i * 0.24, 0.15, [[0, 310], [0.15, 170]], 'sawtooth', { type: 'lowpass', f: 1000, q: 2 }, 0.26);
        return;
      case 'cat': // "meow" lên-xuống
        return this.voice(t, 0.65, [[0, 520], [0.25, 820], [0.65, 460]], 'triangle', { type: 'bandpass', f: 1500, q: 1.5 }, 0.3);
    }
  }
}
