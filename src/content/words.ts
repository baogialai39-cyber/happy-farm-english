/** Từ vựng cho sách tranh, piano màu, hộp đồ chơi (SPEC 6). Tách khỏi logic. */
import type { AgeGroup } from '../config/ageRules';

export interface WordCard {
  word: string;
  emoji?: string;
  color?: string; // thẻ màu
  minGroup?: AgeGroup; // chỉ hiện từ nhóm tuổi này trở lên
  sentence?: string; // thẻ câu: khóa trong SENTENCES
}

const ORDER: Record<AgeGroup, number> = { '2-3': 0, '4-5': 1, '6-8': 2 };
export const allowedFor = (card: WordCard, g: AgeGroup) => ORDER[g] >= ORDER[card.minGroup ?? '2-3'];

export const BOOK_TOPICS: { id: string; title: string; emoji: string; cards: WordCard[] }[] = [
  {
    id: 'farm', title: 'Farm', emoji: '🚜',
    cards: [{ word: 'farm', emoji: '🚜' }, { word: 'tree', emoji: '🌳' }, { word: 'flower', emoji: '🌸' }, { word: 'garden', emoji: '🏡' }, { word: 'water', emoji: '💧' }],
  },
  {
    id: 'gardening', title: 'Gardening', emoji: '🌱',
    cards: [{ word: 'seed', emoji: '🌱' }, { word: 'plant', emoji: '🪴' }, { word: 'water', emoji: '💧' }, { word: 'grow', emoji: '🌿' }, { word: 'harvest', emoji: '🧺' }],
  },
  {
    id: 'fruits', title: 'Fruits', emoji: '🍓',
    cards: [{ word: 'apple', emoji: '🍎' }, { word: 'banana', emoji: '🍌' }, { word: 'orange', emoji: '🍊' }, { word: 'strawberry', emoji: '🍓' }, { word: 'watermelon', emoji: '🍉' }],
  },
  {
    id: 'baking', title: 'Baking', emoji: '🧁',
    cards: [{ word: 'cake', emoji: '🎂' }, { word: 'milk', emoji: '🥛' }, { word: 'egg', emoji: '🥚' }, { word: 'sugar', emoji: '🍬' }, { word: 'flour', emoji: '🌾' }],
  },
  {
    id: 'sentences', title: 'Sentences', emoji: '💬',
    cards: [
      { word: 'Hello!', emoji: '👋', sentence: 'hello' },
      { word: "Let's plant a seed!", emoji: '🌱', sentence: 'plantSeed' },
      { word: 'Water the flowers!', emoji: '💧', sentence: 'waterFlowers' },
      { word: 'I have an apple!', emoji: '🍎', sentence: 'haveApple' },
      { word: "Let's make a cake!", emoji: '🎂', sentence: 'makeCake' },
    ],
  },
  {
    id: 'animals', title: 'Animals', emoji: '🐮',
    cards: [
      { word: 'cow', emoji: '🐄' }, { word: 'pig', emoji: '🐖' }, { word: 'chicken', emoji: '🐔' },
      { word: 'duck', emoji: '🦆' }, { word: 'sheep', emoji: '🐑' }, { word: 'horse', emoji: '🐴' },
      { word: 'dog', emoji: '🐶' }, { word: 'cat', emoji: '🐱' },
    ],
  },
  {
    id: 'colors', title: 'Colors', emoji: '🎨',
    cards: [
      { word: 'red', color: '#FF7B7B' }, { word: 'yellow', color: '#FFD84D' }, { word: 'blue', color: '#6FB8F5' },
      { word: 'green', color: '#7ED492', minGroup: '4-5' }, { word: 'orange', color: '#FFA94D', minGroup: '4-5' },
      { word: 'pink', color: '#FF9CC2', minGroup: '4-5' }, { word: 'purple', color: '#B39DDB', minGroup: '4-5' },
      { word: 'brown', color: '#B68C6E', minGroup: '4-5' },
    ],
  },
  {
    id: 'numbers', title: 'Numbers', emoji: '🔢',
    cards: [
      ...['one', 'two', 'three'].map((w, i) => ({ word: w, emoji: String(i + 1) })),
      ...['four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].map((w, i) => ({ word: w, emoji: String(i + 4), minGroup: '4-5' as const })),
      ...['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'].map((w, i) => ({
        word: w, emoji: String(i + 11), minGroup: '6-8' as const,
      })),
    ],
  },
];

/** Đàn piano màu: 7 phím = 7 nốt + 7 màu. */
export const PIANO_KEYS = [
  { word: 'red', color: '#FF7B7B', freq: 261.63 },
  { word: 'orange', color: '#FFA94D', freq: 293.66 },
  { word: 'yellow', color: '#FFD84D', freq: 329.63 },
  { word: 'green', color: '#7ED492', freq: 349.23 },
  { word: 'blue', color: '#6FB8F5', freq: 392.0 },
  { word: 'purple', color: '#B39DDB', freq: 440.0 },
  { word: 'pink', color: '#FF9CC2', freq: 493.88 },
];

export const TOYS: WordCard[] = [
  { word: 'ball', emoji: '⚽' }, { word: 'teddy bear', emoji: '🧸' }, { word: 'kite', emoji: '🪁' },
  { word: 'blocks', emoji: '🧱' }, { word: 'car', emoji: '🚗' }, { word: 'robot', emoji: '🤖' }, { word: 'balloon', emoji: '🎈' },
];

const NUM_WORDS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
export function clockPhrase(d: Date): string {
  return `It is ${NUM_WORDS[d.getHours() % 12]} o'clock`;
}
