/**
 * NGƯỜI DẠY (SPEC 15, 18.7): khung từ 4×8 (ngang 2:1) cạnh vật được chạm, đọc 3 lần, tự ẩn, nút nghe lại.
 * Chỉ một ô tại một thời điểm; bài mới hủy bài cũ (cả chữ lẫn giọng).
 */
import { artSvg, hasArt } from '../art/library';
import type { AgeRule } from '../config/ageRules';
import { type SentenceEntry, type VocabEntry, SENTENCES, resolveVocab } from '../content/vocab';
import { hasVoice, speakPlan, stopSpeech } from '../systems/speech';
import { h, ICONS } from '../ui/dom';

export type Lesson =
  | { kind: 'word'; entry: VocabEntry }
  | { kind: 'sentence'; key: string; entry: SentenceEntry }
  /** Đếm khi hái quả: hiện "3 APPLES", đọc "Three apples." (SPEC 18.5). */
  | { kind: 'count'; entry: { en: string; title: string; vi: string; emoji: string; art: string } };

/** Khung chữ nhật trên màn hình (px). */
export interface ScreenRect { x: number; y: number; w: number; h: number }

/** Ảnh minh họa cho khung từ: hình thư viện (nếu có) dạng <img> riêng biệt, không thì emoji. */
function pictureFor(word: string, emoji: string): HTMLElement {
  if (hasArt(word)) {
    const svg = artSvg(word);
    if (svg) return h('img', { class: 'vc-art', alt: '', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) });
  }
  return h('span', { class: 'vc-emoji-big' }, emoji);
}

/** Mỗi câu chỉ dạy lại sau ít nhất 3 phút (không lặp dồn dập — SPEC 15.3). */
export const SENTENCE_COOLDOWN_MS = 3 * 60_000;
const LINGER_MS = 1200; // ô còn hiện thêm sau lần đọc thứ 3

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const withDot = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

export class Teacher {
  readonly card: HTMLButtonElement;
  readonly replayBtn: HTMLButtonElement;
  private emojiEl = h('span', { class: 'vc-pic' });
  private wordEl = h('span', { class: 'vc-word' });
  private ipaEl = h('span', { class: 'vc-ipa' });
  private viEl = h('span', { class: 'vc-vi' });
  private dots = h('span', { class: 'vc-dots', 'aria-hidden': 'true' });
  private mute = h('span', { class: 'vc-mute', title: 'Máy chưa có giọng đọc tiếng Anh', hidden: true }, '🔇');
  private run = 0;
  private current?: Lesson;
  private last?: Lesson;
  private sentenceAt = new Map<string, number>();
  private ambientSeen = new Set<string>();
  private docked = false;
  /** Khung vật vừa chạm (đặt sẵn trước khi gọi teach; hết hạn sau 1,5 giây nếu không dùng). */
  private pendingAnchor?: { fn: () => ScreenRect | null; at: number };
  /** Khung vật của bài đang hiện (null = cạnh nhân vật). */
  anchorFn: (() => ScreenRect | null) | null = null;

  constructor(
    host: HTMLElement,
    private rules: AgeRule,
    private onLearn: (key: string) => void = () => undefined,
  ) {
    const speaker = h('span', { class: 'vc-speaker', 'aria-hidden': 'true', html: ICONS.musicOn });
    this.card = h('button', { class: 'vocab-card', hidden: true, 'aria-live': 'polite' },
      this.emojiEl,
      h('span', { class: 'vc-text' }, this.wordEl, this.ipaEl, this.viEl, h('span', { class: 'vc-foot' }, this.dots, speaker)),
      this.mute);
    this.card.addEventListener('click', () => this.replay());
    this.replayBtn = h('button', { class: 'replay-btn', hidden: true, 'aria-label': 'Listen again' },
      h('span', { class: 'rb-emoji' }), h('span', { class: 'rb-icon', html: ICONS.musicOn }));
    this.replayBtn.addEventListener('click', () => this.replay());
    host.append(this.card, this.replayBtn);
  }

  get busy(): boolean {
    return !this.card.hidden;
  }

  /** Đặt khung vật cho bài học kế tiếp (khung từ sẽ nằm cạnh vật, không che vật). */
  setAnchor(fn: (() => ScreenRect | null) | null): void {
    this.pendingAnchor = fn ? { fn, at: Date.now() } : undefined;
  }

  /** Đếm số quả vừa hái: "3 APPLES" + đọc "Three apples." một lần. */
  count(word: string, title: string, say: string, vi: string, emoji: string): void {
    void this.play([{ kind: 'count', entry: { en: say, title, vi, emoji, art: word } }]);
  }

  /** Dạy một từ (và một câu ngắn theo sau nếu câu đó chưa dạy gần đây). */
  teach(word: string | VocabEntry | null, sentence?: { key: string; entry?: SentenceEntry; force?: boolean }, then: string[] = []): void {
    const lessons: Lesson[] = [];
    const entry = typeof word === 'string' ? resolveVocab(word) : word;
    if (entry) lessons.push({ kind: 'word', entry });
    for (const w of then) {
      const e = resolveVocab(w);
      if (e) lessons.push({ kind: 'word', entry: e });
    }
    if (sentence) {
      const s = sentence.entry ?? SENTENCES[sentence.key];
      const lastAt = this.sentenceAt.get(sentence.key) ?? -Infinity;
      // thời gian chờ chỉ tính khi câu THỰC SỰ được hiện (xem show())
      if (s && (sentence.force || Date.now() - lastAt >= SENTENCE_COOLDOWN_MS)) lessons.push({ kind: 'sentence', key: sentence.key, entry: s });
    }
    if (lessons.length) void this.play(lessons);
  }

  /** Chỉ dạy câu (VD "Hello!" khi vào thế giới). */
  sentence(key: string): void {
    this.teach(null, { key });
  }

  /** Dạy "nhẹ": chỉ khi đang không có ô nào, mỗi từ 1 lần mỗi lượt chơi (tên khu vực). */
  ambient(word: string): void {
    if (this.busy || this.ambientSeen.has(word)) return;
    this.ambientSeen.add(word);
    this.teach(word);
  }

  /** Nghe lại bài gần nhất (đọc lại đủ 3 lần). */
  replay(): void {
    const l = this.current ?? this.last;
    if (l) void this.play([l]);
  }

  /**
   * Gọi mỗi khung hình. target = khung vật cần tránh che (vật vừa chạm ∪ nhân vật), null = neo cố định (trong cửa hàng).
   * Thứ tự thử: bên phải → bên trái → phía trên → phía dưới; luôn né mép màn hình.
   */
  position(target: ScreenRect | null, view: { w: number; h: number }): void {
    if (this.card.hidden) return;
    const docked = target === null;
    if (docked !== this.docked) {
      this.docked = docked;
      this.card.classList.toggle('docked', docked);
    }
    if (docked) {
      this.card.style.left = '';
      this.card.style.top = '';
      return;
    }
    const w = this.card.offsetWidth, hgt = this.card.offsetHeight;
    const pos = placeBeside(target, { w, h: hgt }, view);
    this.card.style.left = `${Math.round(pos.left)}px`;
    this.card.style.top = `${Math.round(pos.top)}px`;
    for (const side of ['left', 'above', 'below'] as const) this.card.classList.toggle(side, pos.side === side);
  }

  hide(): void {
    this.run++;
    this.current = undefined;
    stopSpeech();
    this.fadeOut();
  }

  private fadeOut() {
    if (this.card.hidden) return;
    this.card.classList.add('out');
    const myRun = this.run;
    setTimeout(() => {
      if (myRun === this.run) this.card.hidden = true;
    }, 320);
  }

  private show(l: Lesson) {
    if (l.kind === 'sentence') this.sentenceAt.set(l.key, Date.now());
    this.current = l;
    this.last = l;
    const isWord = l.kind === 'word';
    this.emojiEl.replaceChildren(pictureFor(l.kind === 'count' ? l.entry.art : l.kind === 'word' ? l.entry.en : (l.entry.art ?? ''), l.entry.emoji));
    this.wordEl.textContent = l.kind === 'count' ? l.entry.title : isWord ? l.entry.en.toUpperCase() : l.entry.en;
    this.card.classList.toggle('sentence', l.kind === 'sentence');
    this.card.classList.toggle('counting', l.kind === 'count');
    // chữ dài thu nhỏ để nằm gọn 1 dòng (không bẻ giữa từ: GIRAFFE, RHINOCEROS…)
    const longest = Math.max(...this.wordEl.textContent.split(/\s+/).map((x) => x.length));
    this.wordEl.classList.toggle('mid', longest > 5 && longest <= 8);
    this.wordEl.classList.toggle('long', longest > 8);
    this.ipaEl.textContent = isWord ? (l.entry as VocabEntry).ipa : '';
    this.ipaEl.hidden = !isWord;
    this.viEl.textContent = l.kind === 'count' ? l.entry.vi : withDot(l.entry.vi);
    this.dots.replaceChildren(...Array.from({ length: l.kind === 'count' ? 1 : this.rules.speechRepeat }, () => h('i')));
    this.mute.hidden = hasVoice();
    this.card.setAttribute('aria-label', l.entry.en);
    this.card.hidden = false;
    this.card.classList.remove('out', 'pop');
    void this.card.offsetWidth;
    this.card.classList.add('pop');
    (this.replayBtn.firstChild as HTMLElement).textContent = l.entry.emoji;
    this.replayBtn.hidden = false;
    if (l.kind !== 'count') this.onLearn(l.kind === 'word' ? l.entry.en : `sentence:${l.key}`);
  }

  private async play(lessons: Lesson[]) {
    const myRun = ++this.run;
    const pa = this.pendingAnchor;
    this.pendingAnchor = undefined;
    this.anchorFn = pa && Date.now() - pa.at < 1500 ? pa.fn : null;
    for (const l of lessons) {
      if (myRun !== this.run) return;
      this.show(l);
      const res = await speakPlan({
        // "Apple!" — có dấu chấm than cho ngữ điệu vui (SPEC 18.8)
        text: l.kind === 'word' ? `${l.entry.en[0].toUpperCase()}${l.entry.en.slice(1)}!` : l.entry.en,
        times: l.kind === 'count' ? 1 : this.rules.speechRepeat,
        pauseMs: this.rules.speechPauseMs,
        rate: this.rules.speechRate,
        onRead: (i) => {
          if (myRun !== this.run) return;
          [...this.dots.children].forEach((d, k) => d.classList.toggle('on', k <= i));
        },
      });
      if (myRun !== this.run) return; // bài mới đã thay thế
      if (res === 'cancelled') break; // lời khác (VD người bán chào) đã cắt ngang → ẩn ô
      if (res === 'silent') this.mute.hidden = false;
      await sleep(LINGER_MS);
    }
    if (myRun !== this.run) return;
    this.current = undefined;
    this.fadeOut();
  }

  destroy(): void {
    this.hide();
    this.card.remove();
    this.replayBtn.remove();
  }
}

/** Chọn chỗ đặt khung từ cạnh vật (không che vật), né mép màn hình. Hàm thuần — có test. */
export function placeBeside(
  t: ScreenRect, card: { w: number; h: number }, view: { w: number; h: number }, gap = 16, margin = 10,
): { left: number; top: number; side: 'right' | 'left' | 'above' | 'below' } {
  const clampX = (x: number) => Math.max(margin, Math.min(x, view.w - card.w - margin));
  const clampY = (y: number) => Math.max(margin, Math.min(y, view.h - card.h - margin));
  const midY = clampY(t.y + t.h / 2 - card.h / 2);
  if (t.x + t.w + gap + card.w <= view.w - margin) return { left: t.x + t.w + gap, top: midY, side: 'right' };
  if (t.x - gap - card.w >= margin) return { left: t.x - gap - card.w, top: midY, side: 'left' };
  const midX = clampX(t.x + t.w / 2 - card.w / 2);
  if (t.y - gap - card.h >= margin) return { left: midX, top: t.y - gap - card.h, side: 'above' };
  if (t.y + t.h + gap + card.h <= view.h - margin) return { left: midX, top: t.y + t.h + gap, side: 'below' };
  // không đủ chỗ ở đâu cả (màn hình rất nhỏ): bên có nhiều chỗ nhất
  const right = view.w - (t.x + t.w);
  return right >= t.x ? { left: clampX(t.x + t.w + gap), top: midY, side: 'right' } : { left: clampX(t.x - gap - card.w), top: midY, side: 'left' };
}
