/**
 * Mọi hành động khi bé tương tác với đồ vật (SPEC 13.1). Không có đồ vật "trang trí giả".
 * Mỗi hành động đều DẠY: hiện ô từ vựng cạnh nhân vật + đọc 3 lần (SPEC 15).
 */
import type { AgeRule } from '../config/ageRules';
import type { CharacterDef } from '../content/characters';
import { artSvg } from '../art/library';
import { ANIMALS, ITEM_BY_ID, ITEMS, RECIPES, type RecipeDef, type ShopId, type Station } from '../content/items';
import { type SentenceEntry, SENTENCES, haveSentence } from '../content/vocab';
import { BOOK_TOPICS, PIANO_KEYS, TOYS, allowedFor, clockPhrase } from '../content/words';
import type { AudioEngine } from '../systems/audio';
import { h } from '../ui/dom';
import { emptyNote, openPanel, pagedGrid, type Panel, wordCard } from '../ui/panel';
import type { WorldObject } from './map';
import {
  type WorldSave, HARVEST_YIELD, MAX_PLANTS, canMake, care, collectFromAnimal, cook, count, eat, feedAnimal, harvest, plant, plotStage,
  sleepThroughNight, startBake, takeFromOven, water,
} from './save';
import { dressingRoom } from './shop';
import type { QuestEvent } from '../content/quests';
import type { HubTab } from './hub';

export interface WorldApi {
  save: WorldSave;
  character: CharacterDef;
  rules: AgeRule;
  audio: AudioEngine;
  host: HTMLElement;
  now(): number;
  /** DẠY: ô từ vựng (hình + TỪ + IPA + nghĩa) đọc 3 lần; kèm câu ngắn nếu có (SPEC 15.3). */
  learn(word: string, sentence?: { key: string; entry?: SentenceEntry; force?: boolean }, then?: string[]): void;
  /** Lời nói thường (người bán chào…) — cùng kênh giọng, không chồng giọng. */
  say(text: string): void;
  act(emoji: string): void;
  sitOn(o: WorldObject): void;
  sleep(): Promise<void>;
  changed(): void;
  refreshLook(): Promise<void>;
  /** Khung từ kế tiếp nằm cạnh phần tử này (VD món đồ trong bảng cận cảnh). */
  anchorEl?(el: HTMLElement): void;
  /** Đổi màu áo liền thân (tủ quần áo, SPEC 18.2). */
  setOnesie?(id: string): Promise<void>;
  /** Màu áo đang mặc. */
  onesie?: string;
  enterShop(shop: ShopId): void;
  lamp: { on: boolean };
  fed(objId: string): void;
  pause(on: boolean): void;
  /** Ghi nhận việc bé vừa làm cho nhiệm vụ hằng ngày (SPEC 16.2). */
  event(ev: QuestEvent, n?: number): void;
  /** Mở bảng Play & Learn. */
  openHub(tab: HubTab): void;
}

/** Các món bánh kem → câu "Let's make a cake!". */
const CAKES = new Set(['cake', 'strawberry-cake', 'choco-cupcake']);

function panel(api: WorldApi, title: string, emoji: string, ...content: (Node | string)[]): Panel {
  api.pause(true);
  return openPanel(api.host, { title, emoji, onClose: () => api.pause(false) }, ...content);
}

function bigButton(label: string, cls: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = h('button', { class: `btn ${cls} card-btn` }, label);
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

// ---------- Từng loại tương tác ----------

function bookshelf(api: WorldApi) {
  const g = api.rules.group;
  const p = panel(api, 'Picture Book', '📚');
  const showTopics = () =>
    p.setBody(
      pagedGrid(
        BOOK_TOPICS.map((t) => wordCard({ emoji: t.emoji, word: t.title, onTap: () => { api.learn(t.title); showTopic(t.id); } })),
        api.rules.maxChoices,
      ),
    );
  const showTopic = (id: string) => {
    const t = BOOK_TOPICS.find((x) => x.id === id)!;
    const cards = t.cards.filter((c) => allowedFor(c, g)).map((c) =>
      wordCard({
        ...c,
        onTap: () => (c.sentence ? api.learn('', { key: c.sentence, entry: SENTENCES[c.sentence], force: true }) : api.learn(c.word)),
      }),
    );
    p.setBody(
      h('button', { class: 'btn btn-soft back-link', onclick: () => showTopics() }, `◀ ${t.emoji} Book`),
      pagedGrid(cards, api.rules.maxChoices),
    );
  };
  showTopics();
}

function piano(api: WorldApi) {
  const keys = PIANO_KEYS.map((k) => {
    const b = h('button', { class: 'piano-key', style: `--key:${k.color}`, 'aria-label': k.word }, h('span', {}, k.word));
    b.addEventListener('pointerdown', () => {
      api.audio.tone(k.freq);
      api.learn(k.word);
      b.classList.remove('hit');
      void b.offsetWidth;
      b.classList.add('hit');
    });
    return b;
  });
  panel(api, 'Piano', '🎹', h('div', { class: 'piano' }, ...keys));
  api.act('🎵');
  api.learn('piano');
}

function wardrobe(api: WorldApi) {
  // Tủ quần áo dùng chung gương thử đồ với Accessory Shop (chỉ đồ bé đã có)
  api.learn('wardrobe');
  panel(api, 'Wardrobe', '👕', dressingRoom(api, 'wardrobe'));
}

function recipePanel(api: WorldApi, station: Station) {
  const title = station === 'stove' ? 'Cooking' : 'Baking';
  api.learn(station === 'stove' ? 'stove' : 'mixing bowl');
  const p = panel(api, title, station === 'stove' ? '🍳' : '🥣');
  const paint = () => {
    const cards = RECIPES.filter((r) => r.station === station).map((r) => recipeCard(api, r, () => {
      const out = ITEM_BY_ID.get(r.id)!;
      if (station === 'stove') {
        if (!cook(api.save, r.id)) return;
        api.audio.chime();
        api.changed();
        p.close();
        api.act(out.emoji);
        api.learn(out.word);
      } else {
        if (!startBake(api.save, r.id, api.now())) return;
        api.changed();
        p.close();
        api.act('🥣');
        if (CAKES.has(r.id)) api.event('make:cake');
        api.learn(out.word, CAKES.has(r.id) ? { key: 'makeCake' } : undefined);
      }
    }));
    const note = station === 'bake' && api.save.oven ? h('p', { class: 'soft-note' }, '🔥 The oven is busy') : null;
    p.setBody(...(note ? [note] : []), pagedGrid(cards, api.rules.maxChoices));
  };
  paint();
}

function recipeCard(api: WorldApi, r: RecipeDef, make: () => void): HTMLElement {
  const out = ITEM_BY_ID.get(r.id)!;
  const ok = canMake(api.save, r) && !(r.station === 'bake' && api.save.oven);
  const chips = h('div', { class: 'need-row' },
    ...Object.entries(r.need).map(([id, n]) => {
      const have = count(api.save, id) >= n;
      const chip = h('button', { class: `need${have ? ' have' : ''}`, 'aria-label': ITEM_BY_ID.get(id)!.word }, ITEM_BY_ID.get(id)!.emoji, have ? '✓' : '');
      chip.addEventListener('click', () => api.learn(ITEM_BY_ID.get(id)!.word));
      return chip;
    }),
  );
  return wordCard({
    emoji: out.emoji, word: out.word, onTap: () => api.learn(out.word),
    action: h('div', { class: 'card-foot' }, chips, bigButton(r.station === 'stove' ? 'COOK' : 'MIX', 'btn-green', make, !ok)),
  });
}

function oven(api: WorldApi) {
  const now = api.now();
  if (!api.save.oven) return api.learn('oven');
  const got = takeFromOven(api.save, now);
  if (got) {
    const it = ITEM_BY_ID.get(got)!;
    api.audio.chime();
    api.changed();
    api.act(it.emoji);
    api.learn(it.word);
  } else {
    api.act('⏳');
    api.learn('hot');
  }
}

function fridge(api: WorldApi) {
  api.learn('refrigerator');
  const items = ITEMS.filter((i) => ['crop', 'animal', 'ingredient', 'food'].includes(i.kind) && count(api.save, i.id) > 0);
  panel(api, 'Refrigerator', '🧊',
    pagedGrid(
      items.map((i) => wordCard({ emoji: i.emoji, word: i.word, badge: `×${count(api.save, i.id)}`, onTap: () => api.learn(i.word) })),
      api.rules.maxChoices,
      emptyNote('🛒', 'Empty! Let’s go shopping.'),
    ),
  );
}

function table(api: WorldApi) {
  api.learn('table');
  const p = panel(api, 'Table', '🍽️');
  const paint = () => {
    const foods = ITEMS.filter((i) => i.kind === 'food' && count(api.save, i.id) > 0);
    p.setBody(
      pagedGrid(
        foods.map((f) =>
          wordCard({
            emoji: f.emoji, word: f.word, badge: `×${count(api.save, f.id)}`, onTap: () => api.learn(f.word),
            action: bigButton('EAT', 'btn-green', () => {
              if (!eat(api.save, f.id)) return;
              api.changed();
              p.close();
              api.act('😋');
              api.learn('yummy');
            }),
          }),
        ),
        api.rules.maxChoices,
        emptyNote('🍳', 'No food yet. Let’s cook!'),
      ),
    );
  };
  paint();
}

function plotAction(api: WorldApi, o: WorldObject) {
  const key = o.plot!;
  const now = api.now();
  const p = api.save.plots[key];
  const stage = plotStage(p, now);
  if (stage === 'empty') {
    if (Object.keys(api.save.plots).length >= MAX_PLANTS) return api.learn('full');
    const seeds = ITEMS.filter((it) => it.kind === 'seed' && count(api.save, it.id) > 0);
    if (!seeds.length) return api.learn('seeds');
    const pn = panel(api, 'Plant here', '🌱',
      pagedGrid(
        seeds.map((sd) =>
          wordCard({
            emoji: sd.emoji, word: sd.word, sub: '🌱', badge: `×${count(api.save, sd.id)}`, onTap: () => api.learn(sd.word),
            action: bigButton('PLANT', 'btn-green', () => {
              if (!plant(api.save, key, sd.id, api.now())) return;
              api.changed();
              pn.close();
              api.act('🌱');
              api.event('plant');
              api.learn('seed', { key: 'plantSeed' });
            }),
          }),
        ),
        api.rules.maxChoices,
      ),
    );
    return;
  }
  const crop = ITEM_BY_ID.get(ITEM_BY_ID.get(p!.crop)!.grows!)!;
  if (stage === 'dry') {
    water(api.save, key, now);
    api.event('water');
    api.changed();
    api.act('💧');
    api.learn('water', { key: 'waterFlowers' });
  } else if (stage === 'weeds') {
    care(api.save, key, now);
    api.changed();
    api.act('🌿');
    api.learn('weeds');
  } else if (stage === 'growing') {
    api.act('⏳');
    api.learn('grow');
  } else {
    const got = harvest(api.save, key, now);
    if (!got) return;
    api.event('harvest');
    if (got === 'apple') api.event('harvest:apple', HARVEST_YIELD);
    api.audio.chime();
    api.changed();
    api.act(crop.emoji);
    api.learn(crop.word, { key: `have:${crop.id}`, entry: haveSentence(crop.word, crop.emoji) });
  }
}

function well(api: WorldApi) {
  const now = api.now();
  let n = 0;
  for (const key of Object.keys(api.save.plots)) if (plotStage(api.save.plots[key], now) === 'dry' && water(api.save, key, now)) n++;
  if (n) {
    api.event('water', n);
    api.changed();
  }
  api.act('💧');
  api.learn('water', { key: 'waterFlowers' });
}

function animal(api: WorldApi, o: WorldObject) {
  const a = ANIMALS[o.animal!];
  const now = api.now();
  api.audio.animal(a.id); // tiếng kêu đặc trưng (SPEC 18.3)
  if (a.id === 'chicken') {
    // Cho gà ăn thóc (miễn phí) — SPEC 16.2; nếu có trứng thì nhặt luôn
    api.fed(o.id);
    api.event('feed:chicken');
    const egg = collectFromAnimal(api.save, a.id, now);
    api.changed();
    if (egg) {
      api.event('egg');
      api.act('🥚');
      return api.learn('chicken', undefined, ['egg']); // CHICKEN rồi EGG (SPEC 18.3)
    }
    api.act('🌾');
    return api.learn('chicken');
  }
  if (a.gives) {
    const got = collectFromAnimal(api.save, a.id, now);
    if (got) {
      const it = ITEM_BY_ID.get(got)!;
      api.changed();
      api.fed(o.id);
      if (got === 'egg') api.event('egg');
      api.act(it.emoji);
      api.learn(a.word, undefined, [it.word]); // COW rồi MILK
      return;
    }
    api.act('⏳');
    return api.learn(a.word);
  }
  if (a.eats) {
    const food = feedAnimal(api.save, a.id);
    if (food) {
      api.event(`feed:${a.id}` as QuestEvent);
      api.changed();
    }
    api.fed(o.id);
    api.act(food ? ITEM_BY_ID.get(food)!.emoji : '🥕');
    return api.learn(a.word); // cho vật nuôi ăn → PIG
  }
  api.fed(o.id);
  api.act('💖');
  api.learn(a.word);
}

/** Kệ bếp cận cảnh (SPEC 18.6): 7 món, hình to, mỗi món chạm → học từ. */
export const SHELF_ITEMS = ['spoon', 'fork', 'plate', 'cup', 'bowl', 'pan', 'pot'] as const;
function kitchenShelf(api: WorldApi) {
  const grid = h('div', { class: 'shelf-grid' });
  for (const w of SHELF_ITEMS) {
    const svg = artSvg(w);
    const b = h('button', { class: 'shelf-item', 'aria-label': w },
      svg ? h('img', { class: 'shelf-art', alt: '', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) }) : '',
      h('span', { class: 'shelf-word' }, w));
    b.addEventListener('click', () => {
      api.audio.pop();
      api.anchorEl?.(b);
      api.learn(w);
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    });
    grid.append(b);
  }
  panel(api, 'Kitchen Shelf', '🍽️', grid);
}

async function bed(api: WorldApi) {
  await api.sleep();
  sleepThroughNight(api.save, api.now());
  api.changed();
  api.learn('sleep');
}

export async function interact(api: WorldApi, o: WorldObject): Promise<void> {
  api.audio.pop();
  switch (o.action) {
    case 'sign': api.act('👀'); return api.learn(o.word);
    case 'nature': api.act(o.emoji); return api.learn(o.word); // TREE / FLOWER
    case 'decor': api.act(o.emoji); return api.learn(o.word);
    case 'board': api.learn('games'); return api.openHub('games');
    case 'bookshelf': api.act('📖'); api.learn('book'); api.event('book'); return bookshelf(api);
    case 'piano': return piano(api);
    case 'sofa':
      api.sitOn(o);
      return api.learn('sofa');
    case 'clock': {
      const d = new Date();
      api.act('🕰️');
      const timeSentence = api.rules.group === '2-3' ? undefined : { key: 'clock', entry: { en: clockPhrase(d), vi: `Bây giờ là ${d.getHours() % 12 || 12} giờ`, emoji: '🕰️' } };
      return api.learn('clock', timeSentence);
    }
    case 'lamp':
      api.lamp.on = !api.lamp.on;
      api.act('💡');
      return api.learn('lamp', undefined, [api.lamp.on ? 'light on' : 'light off']);
    case 'bed': return bed(api);
    // Đồ vật chỉ để học (SPEC 18.6): chạm → khung từ cạnh vật, đọc 3 lần
    case 'item': api.act(o.emoji); return api.learn(o.word);
    case 'tree': api.act('🌳'); return api.learn(o.word); // APPLE TREE…
    case 'shelf': api.learn('kitchen shelf'); return kitchenShelf(api);
    case 'wardrobe': return wardrobe(api);
    case 'toybox': {
      const toy = TOYS[Math.floor(Math.random() * TOYS.length)];
      api.act(toy.emoji!);
      return api.learn(toy.word);
    }
    case 'mixing': return recipePanel(api, 'bake');
    case 'oven': return oven(api);
    case 'stove': return recipePanel(api, 'stove');
    case 'fridge': return fridge(api);
    case 'sink':
      api.act('🫧');
      return api.learn('wash');
    case 'table': return table(api);
    case 'plot': return plotAction(api, o);
    case 'well': return well(api);
    case 'animal': return animal(api, o);
    case 'shop': return api.enterShop(o.shop!);
  }
}
