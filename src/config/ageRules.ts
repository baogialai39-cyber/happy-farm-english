/**
 * Luật theo tuổi — NGUỒN DUY NHẤT (xem docs/SPEC.md mục 2).
 * Không hard-code kích thước nút / cỡ chữ / thời lượng ở nơi khác.
 */

export type AgeGroup = '2-3' | '4-5' | '6-8';

export interface AgeRule {
  group: AgeGroup;
  /** Kích thước vùng chạm tối thiểu (px). */
  buttonMinPx: number;
  /** Khoảng cách tối thiểu giữa các nút (px). */
  gapPx: number;
  /** Số lựa chọn tối đa trên một màn hình. */
  maxChoices: number;
  /** Cỡ chữ nội dung tối thiểu (px). */
  fontMinPx: number;
  /** Cỡ chữ tiêu đề (px). */
  titlePx: number;
  wrongAnswer: {
    /** Số lần thử trước khi tự hiện đáp án. 0 = hiện gợi ý ngay. */
    attemptsBeforeReveal: number;
    /** Lần thử bắt đầu có gợi ý. */
    hintFromAttempt: number;
    voiceLine: string;
  };
  sessionMinutes: { min: number; max: number };
  questionsPerSession: { min: number; max: number };
  dailyMinutes: { default: number; cap: number };
  /** Một phiên chơi = một ngày trong game (SPEC 17): mặc định + trần phụ huynh được chỉnh. */
  playSessionMinutes: { default: number; cap: number };
  /** Nghỉ bắt buộc giữa hai phiên (phút). */
  restBreakMinutes: number;
  breakAfterSessions: number;
  breakSeconds: number;
  interactions: ReadonlyArray<'tap' | 'drag' | 'match' | 'order'>;
  speechRate: number;
  /** Số lần đọc một từ trong ô từ vựng (SPEC 15.2: luôn 3 lần). */
  speechRepeat: number;
  /** Khoảng nghỉ giữa các lần đọc (ms). */
  speechPauseMs: number;
  /** Câu ngắn thay cho 1 từ (nhóm 6–8). */
  sentences: boolean;
}

export const AGE_RULES: Readonly<Record<AgeGroup, AgeRule>> = {
  '2-3': {
    group: '2-3',
    buttonMinPx: 120,
    gapPx: 32,
    maxChoices: 3,
    fontMinPx: 40,
    titlePx: 48,
    wrongAnswer: { attemptsBeforeReveal: 0, hintFromAttempt: 0, voiceLine: 'Hmm?' },
    sessionMinutes: { min: 3, max: 5 },
    questionsPerSession: { min: 4, max: 5 },
    dailyMinutes: { default: 15, cap: 20 },
    playSessionMinutes: { default: 10, cap: 15 },
    restBreakMinutes: 60,
    breakAfterSessions: 1,
    breakSeconds: 30,
    interactions: ['tap'],
    speechRate: 0.85,
    speechRepeat: 3,
    speechPauseMs: 1200,
    sentences: false,
  },
  '4-5': {
    group: '4-5',
    buttonMinPx: 96,
    gapPx: 24,
    maxChoices: 4,
    fontMinPx: 32,
    titlePx: 40,
    wrongAnswer: { attemptsBeforeReveal: 2, hintFromAttempt: 1, voiceLine: 'Try again!' },
    sessionMinutes: { min: 5, max: 8 },
    questionsPerSession: { min: 6, max: 8 },
    dailyMinutes: { default: 20, cap: 30 },
    playSessionMinutes: { default: 15, cap: 20 },
    restBreakMinutes: 45,
    breakAfterSessions: 1,
    breakSeconds: 30,
    interactions: ['tap', 'drag'],
    speechRate: 0.9,
    speechRepeat: 3,
    speechPauseMs: 1000,
    sentences: false,
  },
  '6-8': {
    group: '6-8',
    buttonMinPx: 72,
    gapPx: 16,
    maxChoices: 6,
    fontMinPx: 24,
    titlePx: 32,
    wrongAnswer: { attemptsBeforeReveal: 3, hintFromAttempt: 2, voiceLine: 'Almost! Try again!' },
    sessionMinutes: { min: 8, max: 12 },
    questionsPerSession: { min: 8, max: 12 },
    dailyMinutes: { default: 30, cap: 45 },
    playSessionMinutes: { default: 20, cap: 30 },
    restBreakMinutes: 30,
    breakAfterSessions: 2,
    breakSeconds: 60,
    interactions: ['tap', 'drag', 'match', 'order'],
    speechRate: 0.95,
    speechRepeat: 3,
    speechPauseMs: 800,
    sentences: true,
  },
};

/** Có hiện cần điều khiển ảo không (cần kéo → chỉ nhóm có tương tác 'drag'). */
export function allowsJoystick(group: AgeGroup): boolean {
  return AGE_RULES[group].interactions.includes('drag');
}

/** Nhóm dùng trước khi biết tuổi bé (màn chờ, tạo hồ sơ): nhóm nhỏ nhất → nút to nhất. */
export const DEFAULT_GROUP: AgeGroup = '2-3';

export const MIN_AGE = 2;
export const MAX_AGE = 8;

export function ageFromBirthYear(birthYear: number, now: Date = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function ageGroupForAge(age: number): AgeGroup {
  if (age <= 3) return '2-3'; // < 2 tuổi cũng xếp vào 2-3
  if (age <= 5) return '4-5';
  return '6-8'; // > 8 tuổi cũng xếp vào 6-8
}

export function ageGroupFor(
  birthYear: number,
  override?: AgeGroup,
  now: Date = new Date(),
): AgeGroup {
  return override ?? ageGroupForAge(ageFromBirthYear(birthYear, now));
}

/** Các năm sinh được chọn khi tạo hồ sơ (tuổi 2 → 8), mới nhất trước. */
export function selectableBirthYears(now: Date = new Date()): number[] {
  const y = now.getFullYear();
  const years: number[] = [];
  for (let age = MIN_AGE; age <= MAX_AGE; age++) years.push(y - age);
  return years;
}

/** Gắn luật tuổi vào CSS custom properties để mọi màn hình dùng chung. */
export function applyAgeRulesToCss(group: AgeGroup, root: HTMLElement = document.documentElement): void {
  const r = AGE_RULES[group];
  root.style.setProperty('--btn-min', `${r.buttonMinPx}px`);
  root.style.setProperty('--gap', `${r.gapPx}px`);
  root.style.setProperty('--font-min', `${r.fontMinPx}px`);
  root.style.setProperty('--title', `${r.titlePx}px`);
  root.dataset.ageGroup = group;
}
