/**
 * Đếm bằng tiếng Anh (SPEC 18.5): "One apple.", "Two apples.", "Three mangoes."
 * Dữ liệu thuần, có test.
 */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Số → chữ tiếng Anh (0..999). Lớn hơn → chữ số. */
export function numberWord(n: number): string {
  n = Math.floor(n);
  if (n < 0 || n > 999) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  const rest = n % 100;
  return `${ONES[Math.floor(n / 100)]} hundred${rest ? ' and ' + numberWord(rest) : ''}`;
}

/** Danh từ đếm được: số ít / số nhiều đúng. */
const NOUNS: Record<string, [string, string]> = {
  apple: ['apple', 'apples'],
  banana: ['banana', 'bananas'],
  orange: ['orange', 'oranges'],
  mango: ['mango', 'mangoes'],
  coconut: ['coconut', 'coconuts'],
  strawberry: ['strawberry', 'strawberries'],
  watermelon: ['watermelon', 'watermelons'],
  grapes: ['bunch of grapes', 'bunches of grapes'],
};

export function nounFor(word: string, n: number): string {
  const e = NOUNS[word];
  if (!e) return n === 1 ? word : word.endsWith('s') ? word : `${word}s`;
  return n === 1 ? e[0] : e[1];
}

/** Câu đọc to: "Three apples." */
export function countSentence(word: string, n: number): string {
  const w = numberWord(n);
  return `${w[0].toUpperCase()}${w.slice(1)} ${nounFor(word, n)}.`;
}

/** Nhãn hiển thị: "3 APPLES". */
export function countLabel(word: string, n: number): string {
  return `${n} ${nounFor(word, n).toUpperCase()}`;
}

const VI: Record<string, string> = {
  apple: 'quả táo', banana: 'quả chuối', orange: 'quả cam', mango: 'quả xoài', coconut: 'quả dừa',
  strawberry: 'quả dâu tây', watermelon: 'quả dưa hấu', grapes: 'chùm nho',
};
/** Nghĩa tiếng Việt khi đếm: "3 quả táo". */
export function countVi(word: string, n: number): string {
  return `${n} ${VI[word] ?? word}`;
}
