/**
 * Luật mini-game thuần (dễ test): chọn câu hỏi theo tuổi, tạo lựa chọn, phản hồi khi sai, lời khen.
 */
import { AGE_RULES, type AgeGroup } from '../config/ageRules';
import { COUNT_RANGE, GAME_WORDS, NUMBER_WORDS, PRAISES, QUIZ, type QuizQuestion, SOUND_ANIMALS, ZOO_GAME_WORDS } from '../content/gamesData';
import { HABITATS, ZOO } from '../content/zoo';

const ORDER: Record<AgeGroup, number> = { '2-3': 0, '4-5': 1, '6-8': 2 };
const allowed = (min: AgeGroup, g: AgeGroup) => ORDER[g] >= ORDER[min];

export type Rand = () => number;

export function shuffle<T>(arr: readonly T[], rand: Rand = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Số câu mỗi lượt theo luật tuổi (4 / 6 / 8). */
export const roundLength = (g: AgeGroup) => AGE_RULES[g].questionsPerSession.min;

/** Số lựa chọn: yêu cầu 3 lựa chọn; nhóm 6–8 được 4 (≤ maxChoices). */
export const choiceCount = (g: AgeGroup) => Math.min(AGE_RULES[g].maxChoices, g === '6-8' ? 4 : 3);

/** Số cặp nối mỗi bảng (Match the Words). */
export const matchPairs = (g: AgeGroup) => ({ '2-3': 2, '4-5': 3, '6-8': 4 })[g];

export function wordPool(g: AgeGroup): string[] {
  return GAME_WORDS.filter((w) => allowed(w.minGroup, g)).map((w) => w.word);
}

export interface ChoiceQuestion {
  answer: string; // từ đúng
  options: string[]; // gồm đáp án, đã xáo
}

/** Câu hỏi cho Find the Word / Listen and Choose: đáp án không lặp trong một lượt. */
export function makeChoiceRound(g: AgeGroup, rand: Rand = Math.random, pool: string[] = wordPool(g)): ChoiceQuestion[] {
  const answers = shuffle(pool, rand).slice(0, roundLength(g));
  return answers.map((answer) => {
    const wrong = shuffle(pool.filter((w) => w !== answer), rand).slice(0, choiceCount(g) - 1);
    return { answer, options: shuffle([answer, ...wrong], rand) };
  });
}

/** Các bảng nối (Match the Words): mỗi bảng N cặp khác nhau. */
export function makeMatchBoards(g: AgeGroup, boards = 2, rand: Rand = Math.random): string[][] {
  const pool = shuffle(wordPool(g), rand);
  const n = matchPairs(g);
  return Array.from({ length: boards }, (_, i) => pool.slice(i * n, i * n + n));
}

export interface QuizItem {
  id: string;
  q: string;
  vi: string;
  picture?: string;
  answer: string;
  options: string[];
}

/** Câu đố nông trại theo tuổi + câu đếm trứng (phạm vi số theo tuổi). */
export function makeQuizRound(g: AgeGroup, rand: Rand = Math.random): QuizItem[] {
  const n = roundLength(g);
  const qs: QuizItem[] = shuffle(QUIZ.filter((q) => allowed(q.minGroup, g)), rand).map((q: QuizQuestion) => ({
    id: q.id, q: q.q, vi: q.vi, picture: q.picture, answer: q.options[0], options: shuffle(q.options.slice(0, choiceCount(g)), rand),
  }));
  // luôn có 1–2 câu đếm trứng
  const counts = g === '2-3' ? 1 : 2;
  for (let i = 0; i < counts; i++) qs.splice(Math.min(qs.length, 1 + i * 3), 0, countQuestion(g, rand));
  return qs.slice(0, n);
}

export function countQuestion(g: AgeGroup, rand: Rand = Math.random): QuizItem {
  const [lo, hi] = COUNT_RANGE[g];
  const k = lo + Math.floor(rand() * (hi - lo + 1));
  const others = shuffle(
    Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((x) => x !== k),
    rand,
  ).slice(0, choiceCount(g) - 1);
  return {
    id: `count-${k}`,
    q: 'How many eggs?',
    vi: 'Có mấy quả trứng?',
    picture: '🥚'.repeat(k),
    answer: NUMBER_WORDS[k],
    options: shuffle([k, ...others], rand).map((x) => NUMBER_WORDS[x]),
  };
}

// ---------- Phản hồi khi sai (SPEC 2 + 16.3) ----------
export type HintKind = 'none' | 'bounce' | 'eliminate' | 'reveal';
export interface WrongFeedback {
  /** Lời nhẹ nhàng đọc to (null = đọc đáp án thay vào). */
  voice: string | null;
  hint: HintKind;
}

/**
 * attempt = số lần chọn sai trong câu này (1, 2, 3…). Không bao giờ trừ điểm.
 * 2–3: "Hmm?" + hiện đáp án ngay · 4–5: "Try again!" + nhún; lần 2 hiện đáp án
 * 6–8: "Almost! Try again!"; lần 2 loại bớt 1 lựa chọn + phát lại âm; lần 3 hiện đáp án
 */
export function wrongFeedback(g: AgeGroup, attempt: number): WrongFeedback {
  const r = AGE_RULES[g].wrongAnswer;
  const revealAt = Math.max(1, r.attemptsBeforeReveal);
  const voice = r.voiceLine;
  if (attempt >= revealAt) return { voice, hint: 'reveal' };
  if (attempt >= r.hintFromAttempt && r.hintFromAttempt > 0) return { voice, hint: g === '6-8' ? 'eliminate' : 'bounce' };
  return { voice, hint: 'none' };
}

/** Lời khen không lặp lại câu ngay trước đó (F-43). */
export function nextPraise(last: string | undefined, rand: Rand = Math.random): string {
  const pool = PRAISES.filter((p) => p !== last);
  return pool[Math.floor(rand() * pool.length)];
}

// =====================================================================
// MINI-GAME SỞ THÚ (SPEC 19.7)
// =====================================================================
export const zooPool = (g: AgeGroup) => ZOO_GAME_WORDS.filter((w) => allowed(w.minGroup, g)).map((w) => w.word);

/** Find the Animal: nghe tên → chọn hình. */
export function makeZooFindRound(g: AgeGroup, rand: Rand = Math.random): ChoiceQuestion[] {
  return makeChoiceRound(g, rand, zooPool(g));
}

export interface SoundQuestion extends ChoiceQuestion { sound: string; bank: 'zoo' | 'farm' }
/** Animal Sounds: nghe tiếng → chọn con vật (các lựa chọn có tiếng khác nhau). */
export function makeSoundRound(g: AgeGroup, rand: Rand = Math.random): SoundQuestion[] {
  const pool = SOUND_ANIMALS.filter((a) => allowed(a.minGroup, g));
  const answers = shuffle(pool, rand).slice(0, roundLength(g));
  return answers.map((a) => {
    const wrong = shuffle(pool.filter((x) => x.word !== a.word && x.sound !== a.sound), rand).slice(0, choiceCount(g) - 1).map((x) => x.word);
    return { answer: a.word, options: shuffle([a.word, ...wrong], rand), sound: a.sound, bank: a.bank };
  });
}

export interface HomePair { animal: string; home: string }
/** Animal Homes: mỗi bảng N cặp, nơi sống KHÁC nhau (nối 1–1 không mơ hồ). */
export function makeHomeBoards(g: AgeGroup, boards = 2, rand: Rand = Math.random): HomePair[][] {
  const n = matchPairs(g);
  const young = zooPool(g);
  const pool = ZOO.filter((a) => g !== '2-3' || young.includes(a.id));
  const used = new Set<string>();
  return Array.from({ length: boards }, () => {
    const homes = shuffle(HABITATS.filter((h) => pool.some((a) => a.home === h)), rand).slice(0, n);
    return homes.map((home) => {
      const fresh = pool.filter((a) => a.home === home && !used.has(a.id));
      const pick = shuffle(fresh.length ? fresh : pool.filter((a) => a.home === home), rand)[0];
      used.add(pick.id);
      return { animal: pick.id, home };
    });
  });
}

export interface CountQuestion { animal: string; n: number; answer: string; options: string[] }
/** Count the Animals: phạm vi số theo tuổi (1–3 / 1–5 / 1–10). */
export function makeCountRound(g: AgeGroup, rand: Rand = Math.random): CountQuestion[] {
  const [lo, hi] = COUNT_RANGE[g];
  const animals = shuffle(zooPool(g), rand);
  return Array.from({ length: roundLength(g) }, (_, i) => {
    const n = lo + Math.floor(rand() * (hi - lo + 1));
    const others = shuffle(Array.from({ length: hi - lo + 1 }, (_, k) => lo + k).filter((x) => x !== n), rand).slice(0, choiceCount(g) - 1);
    return { animal: animals[i % animals.length], n, answer: NUMBER_WORDS[n], options: shuffle([n, ...others], rand).map((x) => NUMBER_WORDS[x]) };
  });
}
