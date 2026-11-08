/**
 * Dữ liệu mini-game (SPEC 16.3): kho từ theo tuổi, câu đố nông trại, lời khen.
 * Mọi từ đều có trong kho từ vựng (có test).
 */
import type { AgeGroup } from '../config/ageRules';

export type GameId = 'find' | 'listen' | 'match' | 'quiz' | 'zfind' | 'zsound' | 'zhome' | 'zcount';

export const GAMES: readonly { id: GameId; title: string; emoji: string; vi: string; place: 'farm' | 'zoo' }[] = [
  { id: 'find', title: 'Find the Word', emoji: '🔤', vi: 'Nhìn hình, chọn chữ', place: 'farm' },
  { id: 'listen', title: 'Listen and Choose', emoji: '👂', vi: 'Nghe từ, chọn hình', place: 'farm' },
  { id: 'match', title: 'Match the Words', emoji: '🧩', vi: 'Nối chữ với hình', place: 'farm' },
  { id: 'quiz', title: 'Farm Quiz', emoji: '❓', vi: 'Câu đố nông trại', place: 'farm' },
  // Sở thú (SPEC 19.7)
  { id: 'zfind', title: 'Find the Animal', emoji: '🔎', vi: 'Nghe tên, tìm con vật', place: 'zoo' },
  { id: 'zsound', title: 'Animal Sounds', emoji: '🔊', vi: 'Nghe tiếng, chọn con vật', place: 'zoo' },
  { id: 'zhome', title: 'Animal Homes', emoji: '🏞️', vi: 'Nối con vật với nơi sống', place: 'zoo' },
  { id: 'zcount', title: 'Count the Animals', emoji: '🔢', vi: 'Đếm con vật', place: 'zoo' },
];

/** Con vật sở thú cho Find the Animal / Count, theo tuổi (con quen thuộc trước). */
export const ZOO_GAME_WORDS: readonly { word: string; minGroup: AgeGroup }[] = [
  ...['lion', 'elephant', 'giraffe', 'zebra', 'monkey', 'tiger', 'bear', 'penguin', 'dolphin', 'owl'].map((w) => ({ word: w, minGroup: '2-3' as const })),
  ...['rhinoceros', 'deer', 'fox', 'polar bear', 'seal', 'shark', 'turtle', 'octopus', 'parrot', 'flamingo'].map((w) => ({ word: w, minGroup: '4-5' as const })),
  ...['clownfish', 'peacock'].map((w) => ({ word: w, minGroup: '6-8' as const })),
];

/** Animal Sounds: con vật + khoá âm (zoo: AudioEngine.zoo, farm: AudioEngine.animal). */
export const SOUND_ANIMALS: readonly { word: string; sound: string; bank: 'zoo' | 'farm'; minGroup: AgeGroup }[] = [
  { word: 'lion', sound: 'roar', bank: 'zoo', minGroup: '2-3' },
  { word: 'elephant', sound: 'trumpet', bank: 'zoo', minGroup: '2-3' },
  { word: 'monkey', sound: 'monkey', bank: 'zoo', minGroup: '2-3' },
  { word: 'owl', sound: 'owl', bank: 'zoo', minGroup: '2-3' },
  { word: 'cow', sound: 'cow', bank: 'farm', minGroup: '2-3' },
  { word: 'duck', sound: 'duck', bank: 'farm', minGroup: '2-3' },
  { word: 'cat', sound: 'cat', bank: 'farm', minGroup: '2-3' },
  { word: 'dog', sound: 'dog', bank: 'farm', minGroup: '2-3' },
  { word: 'sheep', sound: 'sheep', bank: 'farm', minGroup: '4-5' },
  { word: 'pig', sound: 'pig', bank: 'farm', minGroup: '4-5' },
  { word: 'seal', sound: 'seal', bank: 'zoo', minGroup: '4-5' },
  { word: 'penguin', sound: 'penguin', bank: 'zoo', minGroup: '4-5' },
  { word: 'dolphin', sound: 'dolphin', bank: 'zoo', minGroup: '4-5' },
  { word: 'horse', sound: 'horse', bank: 'farm', minGroup: '4-5' },
  { word: 'parrot', sound: 'parrot', bank: 'zoo', minGroup: '6-8' },
  { word: 'flamingo', sound: 'flamingo', bank: 'zoo', minGroup: '6-8' },
  { word: 'tiger', sound: 'growl', bank: 'zoo', minGroup: '6-8' },
  { word: 'chicken', sound: 'chicken', bank: 'farm', minGroup: '6-8' },
];

/** Từ cho Find / Listen / Match, kèm nhóm tuổi nhỏ nhất (từ có hình rõ, không trùng nhau). */
export const GAME_WORDS: readonly { word: string; minGroup: AgeGroup }[] = [
  // 2–3: con vật, quả cơ bản, đồ quen thuộc
  ...['cow', 'pig', 'chicken', 'duck', 'sheep', 'dog', 'cat', 'apple', 'banana', 'egg', 'milk', 'ball', 'car', 'tree', 'flower'].map((w) => ({ word: w, minGroup: '2-3' as const })),
  // 4–5: trái cây/rau, làm bánh, nông trại
  ...['horse', 'strawberry', 'watermelon', 'orange', 'carrot', 'tomato', 'corn', 'grapes', 'cake', 'bread', 'cookies', 'sun hat', 'water', 'seed', 'house', 'kite', 'balloon', 'teddy bear'].map((w) => ({ word: w, minGroup: '4-5' as const })),
  // 6–8: quần áo, đồ trong nhà, món ăn
  ...['shirt', 'pants', 'shoes', 'backpack', 'glasses', 'crown', 'scarf', 'sofa', 'bed', 'clock', 'lamp', 'piano', 'fridge', 'pancakes', 'milkshake', 'robot', 'sunflower', 'rainbow'].map((w) => ({ word: w, minGroup: '6-8' as const })),
];

export interface QuizQuestion {
  id: string;
  q: string; // câu hỏi tiếng Anh (đọc to)
  vi: string; // nghĩa (chỉ hiển thị nhỏ)
  /** Hình minh họa câu hỏi (VD 🥚🥚 để đếm). */
  picture?: string;
  /** Đáp án đúng ở vị trí 0. Mỗi đáp án là một từ trong kho từ. */
  options: string[];
  minGroup: AgeGroup;
}

export const QUIZ: readonly QuizQuestion[] = [
  { id: 'moo', q: 'Which animal says moo?', vi: 'Con nào kêu "moo"?', options: ['cow', 'chicken', 'pig'], minGroup: '2-3' },
  { id: 'quack', q: 'Which animal says quack?', vi: 'Con nào kêu "quack"?', options: ['duck', 'cow', 'sheep'], minGroup: '2-3' },
  { id: 'baa', q: 'Which animal says baa?', vi: 'Con nào kêu "baa"?', options: ['sheep', 'pig', 'duck'], minGroup: '2-3' },
  { id: 'oink', q: 'Which animal says oink?', vi: 'Con nào kêu "oink"?', options: ['pig', 'cow', 'chicken'], minGroup: '2-3' },
  { id: 'red', q: 'Which one is red?', vi: 'Cái nào màu đỏ?', options: ['apple', 'banana', 'corn'], minGroup: '2-3' },
  { id: 'yellow', q: 'Which one is yellow?', vi: 'Cái nào màu vàng?', options: ['banana', 'apple', 'watermelon'], minGroup: '2-3' },
  { id: 'milk', q: 'Which animal gives us milk?', vi: 'Con nào cho chúng ta sữa?', options: ['cow', 'chicken', 'duck'], minGroup: '4-5' },
  { id: 'eggs', q: 'Which animal gives us eggs?', vi: 'Con nào cho chúng ta trứng?', options: ['chicken', 'cow', 'pig'], minGroup: '4-5' },
  { id: 'need', q: 'What do plants need?', vi: 'Cây cần gì?', options: ['water', 'cake', 'shoes'], minGroup: '4-5' },
  { id: 'swim', q: 'Which animal can swim?', vi: 'Con nào biết bơi?', options: ['duck', 'cow', 'pig'], minGroup: '4-5' },
  { id: 'head', q: 'What do we wear on our head?', vi: 'Mình đội gì trên đầu?', options: ['hat', 'shoes', 'pants'], minGroup: '4-5' },
  { id: 'oven', q: 'Where do we bake a cake?', vi: 'Mình nướng bánh ở đâu?', options: ['oven', 'bed', 'sink'], minGroup: '6-8' },
  { id: 'flour', q: 'What do we need to make a cake?', vi: 'Làm bánh kem cần gì?', options: ['flour', 'ball', 'car'], minGroup: '6-8' },
  { id: 'garden', q: 'Where do plants grow?', vi: 'Cây lớn lên ở đâu?', options: ['garden', 'kitchen', 'bedroom'], minGroup: '6-8' },
  { id: 'veg', q: 'Which one is a vegetable?', vi: 'Cái nào là rau củ?', options: ['carrot', 'apple', 'strawberry'], minGroup: '6-8' },
  { id: 'see', q: 'What helps us see?', vi: 'Cái gì giúp mình nhìn rõ?', options: ['glasses', 'scarf', 'shoes'], minGroup: '6-8' },
];

/** Đếm trứng (G4): phạm vi số theo tuổi (SPEC 16.3). */
export const COUNT_RANGE: Record<AgeGroup, [number, number]> = { '2-3': [1, 3], '4-5': [1, 5], '6-8': [1, 10] };
export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export const PRAISES = ['Great job!', 'Well done!', 'Super!', 'You did it!', 'Awesome!', 'Yay!', 'Good job!', "You're a super farmer!"];
