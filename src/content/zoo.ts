/**
 * Dữ liệu HAPPY ZOO (SPEC 19): khu, loài, thức ăn, tiếng kêu, hoạt động + câu, nơi sống, huy hiệu.
 * Dữ liệu thuần, tách khỏi logic. Mọi từ đều có trong kho từ vựng (có test).
 */
import type { ZooAnimal } from '../art/library/zooAnimals';

export type ZooZone = 'grassland' | 'forest' | 'ice' | 'ocean' | 'birds';

export const ZOO_ZONES: readonly { id: ZooZone; name: string; vi: string; emoji: string; toy: string; toyEmoji: string }[] = [
  { id: 'grassland', name: 'Grassland', vi: 'Đồng cỏ', emoji: '🦁', toy: 'ball', toyEmoji: '⚽' },
  { id: 'forest', name: 'Forest', vi: 'Khu rừng', emoji: '🌲', toy: 'ball', toyEmoji: '🪵' },
  { id: 'ice', name: 'Ice Land', vi: 'Vùng băng giá', emoji: '❄️', toy: 'ice', toyEmoji: '🧊' },
  { id: 'ocean', name: 'Ocean', vi: 'Đại dương', emoji: '🌊', toy: 'bubbles', toyEmoji: '🫧' },
  { id: 'birds', name: 'Bird Garden', vi: 'Vườn chim', emoji: '🦜', toy: 'swing', toyEmoji: '🪺' },
];

/** Hoạt ảnh con vật làm được (SPEC 19.3). */
export type ZooAnim = 'sleep' | 'eat' | 'drink' | 'play' | 'walk' | 'run' | 'swim' | 'fly' | 'climb' | 'splash' | 'call';

export interface ZooAction { anim: ZooAnim; en: string; vi: string }

export interface ZooAnimalDef {
  id: ZooAnimal;
  zone: ZooZone;
  /** Bề ngang trên bản đồ (số ô) — đúng tỉ lệ thật tương đối. */
  size: number;
  food: string;
  /** Khoá âm thanh tổng hợp (null = không có tiếng → bong bóng nếu dưới nước). */
  sound: string | null;
  soundWord?: string; // "roar"
  home: string; // nơi sống (Animal Homes)
  part: string; // bộ phận đặc trưng (Zoo Book)
  /** Hoạt động khi chạm lần 2, 4, 6… (xoay vòng). */
  actions: ZooAction[];
}

export const ZOO: readonly ZooAnimalDef[] = [
  // Grassland
  { id: 'lion', zone: 'grassland', size: 2.0, food: 'meat', sound: 'roar', soundWord: 'roar', home: 'grassland', part: 'mane', actions: [
    { anim: 'sleep', en: 'The lion is sleeping.', vi: 'Sư tử đang ngủ.' },
    { anim: 'call', en: 'The lion says roar!', vi: 'Sư tử kêu "gừ"!' },
    { anim: 'drink', en: 'The lion is drinking water.', vi: 'Sư tử đang uống nước.' }] },
  { id: 'elephant', zone: 'grassland', size: 3.0, food: 'hay', sound: 'trumpet', soundWord: 'trumpet', home: 'grassland', part: 'trunk', actions: [
    { anim: 'drink', en: 'The elephant is drinking water.', vi: 'Voi đang uống nước.' },
    { anim: 'splash', en: 'The elephant is spraying water.', vi: 'Voi đang phun nước.' },
    { anim: 'eat', en: 'The elephant is eating hay.', vi: 'Voi đang ăn cỏ khô.' }] },
  { id: 'giraffe', zone: 'grassland', size: 2.0, food: 'leaves', sound: 'hum', home: 'grassland', part: 'neck', actions: [
    { anim: 'eat', en: 'The giraffe is eating leaves.', vi: 'Hươu cao cổ đang ăn lá.' },
    { anim: 'walk', en: 'The giraffe is walking.', vi: 'Hươu cao cổ đang đi dạo.' }] },
  { id: 'zebra', zone: 'grassland', size: 2.1, food: 'grass', sound: 'zebra', soundWord: 'neigh', home: 'grassland', part: 'stripes', actions: [
    { anim: 'eat', en: 'The zebra is eating grass.', vi: 'Ngựa vằn đang ăn cỏ.' },
    { anim: 'run', en: 'The zebra is running.', vi: 'Ngựa vằn đang chạy.' }] },
  { id: 'rhinoceros', zone: 'grassland', size: 2.4, food: 'grass', sound: 'snort', home: 'grassland', part: 'horn', actions: [
    { anim: 'sleep', en: 'The rhinoceros is resting.', vi: 'Tê giác đang nghỉ ngơi.' },
    { anim: 'drink', en: 'The rhinoceros is drinking water.', vi: 'Tê giác đang uống nước.' }] },
  // Forest
  { id: 'monkey', zone: 'forest', size: 1.2, food: 'banana', sound: 'monkey', home: 'forest', part: 'tail', actions: [
    { anim: 'eat', en: 'The monkey is eating a banana.', vi: 'Chú khỉ đang ăn chuối.' },
    { anim: 'climb', en: 'The monkey is climbing.', vi: 'Chú khỉ đang leo trèo.' },
    { anim: 'play', en: 'The monkey is playing.', vi: 'Chú khỉ đang chơi.' }] },
  { id: 'tiger', zone: 'forest', size: 2.0, food: 'meat', sound: 'growl', soundWord: 'growl', home: 'forest', part: 'stripes', actions: [
    { anim: 'sleep', en: 'The tiger is sleeping.', vi: 'Hổ đang ngủ.' },
    { anim: 'walk', en: 'The tiger is walking.', vi: 'Hổ đang đi dạo.' },
    { anim: 'drink', en: 'The tiger is drinking water.', vi: 'Hổ đang uống nước.' }] },
  { id: 'bear', zone: 'forest', size: 2.0, food: 'honey', sound: 'bear', soundWord: 'growl', home: 'forest', part: 'paw', actions: [
    { anim: 'eat', en: 'The bear is eating honey.', vi: 'Gấu đang ăn mật ong.' },
    { anim: 'sleep', en: 'The bear is sleeping.', vi: 'Gấu đang ngủ.' }] },
  { id: 'deer', zone: 'forest', size: 1.8, food: 'grass', sound: 'deer', home: 'forest', part: 'antlers', actions: [
    { anim: 'eat', en: 'The deer is eating grass.', vi: 'Hươu đang ăn cỏ.' },
    { anim: 'play', en: 'The deer is jumping.', vi: 'Hươu đang nhảy.' }] },
  { id: 'fox', zone: 'forest', size: 1.4, food: 'berries', sound: 'fox', home: 'forest', part: 'tail', actions: [
    { anim: 'play', en: 'The fox is jumping.', vi: 'Cáo đang nhảy.' },
    { anim: 'sleep', en: 'The fox is sleeping.', vi: 'Cáo đang ngủ.' }] },
  // Ice Land
  { id: 'penguin', zone: 'ice', size: 0.9, food: 'fish', sound: 'penguin', home: 'ice', part: 'wings', actions: [
    { anim: 'swim', en: 'The penguin is swimming.', vi: 'Chim cánh cụt đang bơi.' },
    { anim: 'walk', en: 'The penguin is walking.', vi: 'Chim cánh cụt đang đi.' },
    { anim: 'eat', en: 'The penguin is eating fish.', vi: 'Chim cánh cụt đang ăn cá.' }] },
  { id: 'polar bear', zone: 'ice', size: 2.1, food: 'fish', sound: 'bear', soundWord: 'growl', home: 'ice', part: 'paw', actions: [
    { anim: 'swim', en: 'The polar bear is swimming.', vi: 'Gấu Bắc Cực đang bơi.' },
    { anim: 'sleep', en: 'The polar bear is sleeping.', vi: 'Gấu Bắc Cực đang ngủ.' }] },
  { id: 'seal', zone: 'ice', size: 1.6, food: 'fish', sound: 'seal', soundWord: 'bark', home: 'ice', part: 'flippers', actions: [
    { anim: 'play', en: 'The seal is playing with a ball.', vi: 'Hải cẩu đang chơi bóng.' },
    { anim: 'eat', en: 'The seal is eating fish.', vi: 'Hải cẩu đang ăn cá.' }] },
  // Ocean
  { id: 'dolphin', zone: 'ocean', size: 2.2, food: 'fish', sound: 'dolphin', home: 'ocean', part: 'fin', actions: [
    { anim: 'play', en: 'The dolphin is jumping.', vi: 'Cá heo đang nhảy lên.' },
    { anim: 'swim', en: 'The dolphin is swimming.', vi: 'Cá heo đang bơi.' }] },
  { id: 'shark', zone: 'ocean', size: 2.6, food: 'fish', sound: null, home: 'ocean', part: 'fin', actions: [
    { anim: 'swim', en: 'The shark is swimming.', vi: 'Cá mập đang bơi.' }] },
  { id: 'turtle', zone: 'ocean', size: 1.5, food: 'seaweed', sound: null, home: 'ocean', part: 'shell', actions: [
    { anim: 'swim', en: 'The turtle is swimming.', vi: 'Rùa biển đang bơi.' },
    { anim: 'eat', en: 'The turtle is eating seaweed.', vi: 'Rùa biển đang ăn rong biển.' }] },
  { id: 'octopus', zone: 'ocean', size: 1.3, food: 'shrimp', sound: null, home: 'ocean', part: 'tentacles', actions: [
    { anim: 'play', en: 'The octopus is waving.', vi: 'Bạch tuộc đang vẫy tay.' },
    { anim: 'swim', en: 'The octopus is swimming.', vi: 'Bạch tuộc đang bơi.' }] },
  { id: 'clownfish', zone: 'ocean', size: 0.8, food: 'shrimp', sound: null, home: 'ocean', part: 'fin', actions: [
    { anim: 'swim', en: 'The clownfish is swimming.', vi: 'Cá hề đang bơi.' },
    { anim: 'play', en: 'The clownfish is playing.', vi: 'Cá hề đang chơi.' }] },
  // Bird Garden
  { id: 'parrot', zone: 'birds', size: 0.8, food: 'seeds', sound: 'parrot', soundWord: 'squawk', home: 'tree', part: 'beak', actions: [
    { anim: 'fly', en: 'The parrot is flying.', vi: 'Vẹt đang bay.' },
    { anim: 'eat', en: 'The parrot is eating seeds.', vi: 'Vẹt đang ăn hạt.' }] },
  { id: 'peacock', zone: 'birds', size: 1.8, food: 'corn', sound: 'peacock', home: 'forest', part: 'feathers', actions: [
    { anim: 'play', en: 'The peacock is dancing.', vi: 'Chim công đang múa.' },
    { anim: 'walk', en: 'The peacock is walking.', vi: 'Chim công đang đi dạo.' }] },
  { id: 'flamingo', zone: 'birds', size: 1.0, food: 'shrimp', sound: 'flamingo', soundWord: 'honk', home: 'lake', part: 'legs', actions: [
    { anim: 'sleep', en: 'The flamingo is standing on one leg.', vi: 'Hồng hạc đang đứng một chân.' },
    { anim: 'drink', en: 'The flamingo is drinking water.', vi: 'Hồng hạc đang uống nước.' }] },
  { id: 'owl', zone: 'birds', size: 0.8, food: 'bugs', sound: 'owl', soundWord: 'hoot', home: 'tree', part: 'eyes', actions: [
    { anim: 'sleep', en: 'The owl is sleeping.', vi: 'Cú mèo đang ngủ.' },
    { anim: 'fly', en: 'The owl is flying.', vi: 'Cú mèo đang bay.' }] },
];

export const ZOO_BY_ID: ReadonlyMap<string, ZooAnimalDef> = new Map(ZOO.map((z) => [z.id, z]));
export const zooOfZone = (z: ZooZone) => ZOO.filter((a) => a.zone === z);

/** Mọi thức ăn có ở trạm chăm sóc (Feed: đúng món + 2 món khác). */
export const ZOO_FOODS = ['meat', 'hay', 'leaves', 'grass', 'banana', 'honey', 'berries', 'fish', 'seaweed', 'shrimp', 'seeds', 'corn', 'bugs'] as const;

/** Số nhiều để nói "Elephants like hay." */
export function pluralAnimal(id: string): string {
  if (['sheep', 'deer', 'fish', 'shrimp', 'clownfish'].includes(id)) return id;
  if (id === 'octopus') return 'octopuses';
  if (id === 'fox') return 'foxes';
  return `${id}s`;
}

/** Nơi sống trong trò Animal Homes. */
export const HABITATS = ['grassland', 'forest', 'ice', 'ocean', 'tree', 'lake'] as const;

// ---------- Zoo Book (SPEC 19.6) ----------
export interface ZooTopic { id: string; title: string; vi: string; emoji: string; words: string[] }
export const ZOO_TOPICS: readonly ZooTopic[] = [
  { id: 'names', title: 'Animal names', vi: 'Tên con vật', emoji: '🦁', words: ZOO.map((z) => z.id) },
  { id: 'sounds', title: 'Animal sounds', vi: 'Tiếng kêu', emoji: '🔊', words: ['roar', 'trumpet', 'growl', 'hoot', 'squawk', 'honk', 'bark', 'neigh', 'moo', 'quack', 'meow', 'woof'] },
  { id: 'food', title: 'Animal food', vi: 'Thức ăn', emoji: '🍖', words: [...ZOO_FOODS] },
  { id: 'parts', title: 'Body parts', vi: 'Bộ phận cơ thể', emoji: '🐾', words: ['trunk', 'mane', 'horn', 'neck', 'stripes', 'tail', 'paw', 'antlers', 'wings', 'flippers', 'fin', 'shell', 'tentacles', 'beak', 'feathers', 'legs', 'eyes'] },
  { id: 'homes', title: 'Habitats', vi: 'Nơi sống', emoji: '🏞️', words: [...HABITATS, 'nest'] },
  { id: 'actions', title: 'Animal actions', vi: 'Hoạt động', emoji: '🏃', words: ['eating', 'drinking', 'sleeping', 'swimming', 'flying', 'climbing', 'playing', 'walking', 'running', 'jumping'] },
];

// ---------- Zoo Passport (SPEC 19.8) ----------
export interface ZooBadge { id: string; title: string; vi: string; emoji: string }
export const ZOO_BADGES: readonly ZooBadge[] = [
  { id: 'first', title: 'First Friend', vi: 'Gặp người bạn đầu tiên', emoji: '🤝' },
  ...ZOO_ZONES.map((z) => ({ id: `zone:${z.id}`, title: `${z.name} Explorer`, vi: `Gặp đủ các bạn ở ${z.vi}`, emoji: z.emoji })),
  { id: 'all', title: 'Zoo Explorer', vi: 'Gặp đủ 22 loài', emoji: '🏆' },
  { id: 'keeper', title: 'Kind Keeper', vi: 'Cho thú ăn đúng 5 lần', emoji: '💚' },
  { id: 'clean', title: 'Clean Zoo', vi: 'Dọn sạch cả 5 khu', emoji: '🧹' },
];
/** Sao thưởng: mỗi loài mới +1, mỗi huy hiệu +2 (một lần). */
export const ZOO_STAR_NEW_ANIMAL = 1;
export const ZOO_STAR_BADGE = 2;
/** Lá rụng lại sau ~15 phút (chỉ trang trí, không phạt). */
export const ZOO_DIRTY_AFTER_MS = 15 * 60_000;
