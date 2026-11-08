/**
 * Kiểm thử giai đoạn 8 — HAPPY ZOO (SPEC 19) + khen cuối lượt (16.3).
 */
import { describe, expect, it } from 'vitest';
import { ZOO_ANIMALS, zooSvg } from '../art/library/zooAnimals';
import { artSvg, hasArt } from '../art/library';
import { COUNT_RANGE, GAMES, NUMBER_WORDS, SOUND_ANIMALS } from '../content/gamesData';
import { HABITATS, pluralAnimal, ZOO, ZOO_BADGES, ZOO_BY_ID, ZOO_FOODS, ZOO_TOPICS, ZOO_ZONES } from '../content/zoo';
import { resolveVocab, VOCAB, VOCAB_ROWS } from '../content/vocab';
import { choiceCount, makeCountRound, makeHomeBoards, makeSoundRound, makeZooFindRound, matchPairs, roundLength, zooPool } from '../games/engine';
import { Grid } from './grid';
import { zoneAt } from './map';
import { ZOO_AREAS, ZOO_MAP } from './zooMap';
import { newSave, sanitizeSave, zooClean, zooDirty, zooFeed, zooTap } from './save';

const GROUPS = ['2-3', '4-5', '6-8'] as const;

describe('22 loài vẽ riêng (SPEC 19.3)', () => {
  it('đủ loài theo 5 khu, mỗi loài có hình hợp lệ và KHÁC nhau', () => {
    expect(ZOO.length).toBe(22);
    const byZone = Object.fromEntries(ZOO_ZONES.map((z) => [z.id, ZOO.filter((a) => a.zone === z.id).map((a) => a.id).sort()]));
    expect(byZone).toEqual({
      grassland: ['elephant', 'giraffe', 'lion', 'rhinoceros', 'zebra'],
      forest: ['bear', 'deer', 'fox', 'monkey', 'tiger'],
      ice: ['penguin', 'polar bear', 'seal'],
      ocean: ['clownfish', 'dolphin', 'octopus', 'shark', 'turtle'],
      birds: ['flamingo', 'owl', 'parrot', 'peacock'],
    });
    const shapes = new Set<string>();
    for (const a of ZOO_ANIMALS) {
      const svg = zooSvg(a);
      expect(svg.startsWith('<svg'), a).toBe(true);
      expect(svg, a).not.toMatch(/NaN|undefined/);
      expect((svg.match(/<g[\s>]/g) ?? []).length, a).toBe((svg.match(/<\/g>/g) ?? []).length);
      expect(hasArt(a), a).toBe(true);
      shapes.add(svg.replace(/#[0-9A-Fa-f]{3,6}/g, '').replace(/id="[^"]*"|url\(#[^)]*\)/g, ''));
    }
    expect(shapes.size).toBe(22); // không dùng chung một mô hình
    expect(artSvg('rhino')).toBeTruthy(); // tên gọi khác
  });
  it('mỗi loài có thức ăn, nơi sống, bộ phận, ít nhất 1 hoạt động + câu tiếng Anh/Việt', () => {
    for (const a of ZOO) {
      expect(ZOO_FOODS, a.id).toContain(a.food);
      expect(HABITATS, a.id).toContain(a.home);
      expect(a.actions.length, a.id).toBeGreaterThan(0);
      for (const act of a.actions) {
        expect(act.en, a.id).toMatch(/^The .+[.!]$/);
        expect(act.vi.length, a.id).toBeGreaterThan(3);
      }
    }
    expect(ZOO_BY_ID.get('lion')!.actions[0].en).toBe('The lion is sleeping.');
    expect(ZOO_BY_ID.get('elephant')!.actions.some((x) => x.en === 'The elephant is drinking water.')).toBe(true);
    expect(ZOO_BY_ID.get('monkey')!.actions.some((x) => x.en === 'The monkey is eating a banana.')).toBe(true);
  });
  it('không cảnh bạo lực: câu & hoạt động không có từ săn/đánh/cắn', () => {
    const text = ZOO.flatMap((a) => a.actions.map((x) => x.en.toLowerCase())).join(' ');
    expect(text).not.toMatch(/hunt|fight|attack|bite|kill|blood/);
  });
});

describe('bản đồ sở thú (SPEC 19.2)', () => {
  const grid = new Grid(ZOO_MAP);
  const spawn = { x: Math.floor(ZOO_MAP.spawn.x), y: Math.floor(ZOO_MAP.spawn.y) };
  it('điểm vào đứng được; mọi trạm, biển, sách, cổng đi tới được', () => {
    expect(grid.boxHits(ZOO_MAP.spawn.x, ZOO_MAP.spawn.y)).toBe(false);
    for (const o of ZOO_MAP.objects.filter((x) => x.kind !== 'zoo')) {
      const stands = grid.standTiles(o);
      expect(stands.length, o.id).toBeGreaterThan(0);
      expect(grid.findPath(spawn, stands), o.id).not.toBeNull();
    }
  });
  it('bé KHÔNG vào được trong chuồng (rào bảo vệ) — con vật ở trong chuồng của khu mình', () => {
    for (const z of ZOO_ZONES) {
      const a = ZOO_AREAS[z.id];
      const inside = { x: Math.floor(a.x + a.w / 2), y: Math.floor(a.y + a.h / 2) };
      expect(grid.findPath(spawn, [inside]), z.id).toBeNull();
    }
    for (const o of ZOO_MAP.objects.filter((x) => x.kind === 'zoo')) {
      const a = ZOO_AREAS[o.zooZone as keyof typeof ZOO_AREAS];
      expect(o.x >= a.x && o.x < a.x + a.w && o.y >= a.y && o.y < a.y + a.h, o.id).toBe(true);
    }
  });
  it('5 khu có bảng tên tiếng Anh + trạm chăm sóc; có cổng, hồ, cây, hoa, đường', () => {
    for (const z of ZOO_ZONES) {
      expect(ZOO_MAP.objects.some((o) => o.kind === 'sign' && o.zooZone === z.id && o.label === z.name), z.id).toBe(true);
      expect(ZOO_MAP.objects.some((o) => o.kind === 'care' && o.zooZone === z.id), z.id).toBe(true);
      expect(zoneAt(ZOO_MAP, ZOO_AREAS[z.id].x + 1, ZOO_AREAS[z.id].y + 1)?.name).toBe(z.name);
    }
    const tiles = ZOO_MAP.tiles.flat();
    for (const t of ['~', 'T', ',', '=', 'f', '*'] as const) expect(tiles, t).toContain(t);
    expect(ZOO_MAP.objects.some((o) => o.kind === 'gate')).toBe(true);
  });
});

describe('từ vựng sở thú (SPEC 19.6)', () => {
  it('mọi tên, thức ăn, tiếng kêu, bộ phận, nơi sống, hoạt động, biển, khu đều có mục từ', () => {
    const words = [
      ...ZOO.map((a) => a.id), ...ZOO.map((a) => a.part), ...ZOO.map((a) => a.food), ...ZOO.map((a) => a.home),
      ...ZOO_TOPICS.flatMap((t) => t.words), ...ZOO_MAP.objects.map((o) => o.word), ...ZOO_MAP.zones.map((z) => z.vocab),
      ...ZOO.flatMap((a) => (a.soundWord ? [a.soundWord] : [])), 'map', 'zoo',
    ];
    expect([...new Set(words)].filter((w) => !resolveVocab(w))).toEqual([]);
    expect(ZOO_TOPICS.map((t) => t.id)).toEqual(['names', 'sounds', 'food', 'parts', 'homes', 'actions']);
  });
  it('kho từ không có mục trùng', () => {
    expect(VOCAB.size).toBe(VOCAB_ROWS);
  });
});

describe('khám phá, chăm sóc, huy hiệu (SPEC 19.5, 19.8)', () => {
  it('chạm lần 1 → +1 sao + "First Friend"; lần 2 không cộng thêm; số lần chạm đếm đúng', () => {
    const s = newSave();
    const a = zooTap(s, 'lion');
    expect(a.n).toBe(1);
    expect(a.reward.badges.map((b) => b.id)).toEqual(['first']);
    expect(s.stars).toBe(1 + 2);
    const b = zooTap(s, 'lion');
    expect(b.n).toBe(2);
    expect(b.reward.stars).toBe(0);
    expect(zooTap(s, 'dragon').n).toBe(0);
  });
  it('gặp đủ một khu → huy hiệu khu; đủ 22 → Zoo Explorer; mỗi huy hiệu chỉ 1 lần', () => {
    const s = newSave();
    for (const a of ZOO.filter((x) => x.zone === 'ice')) zooTap(s, a.id);
    expect(s.zoo.badges).toContain('zone:ice');
    for (const a of ZOO) zooTap(s, a.id);
    expect(s.zoo.badges).toEqual(expect.arrayContaining(['first', 'zone:grassland', 'zone:forest', 'zone:ice', 'zone:ocean', 'zone:birds', 'all']));
    expect(new Set(s.zoo.badges).size).toBe(s.zoo.badges.length);
    expect(s.stars).toBe(22 + 7 * 2);
  });
  it('cho ăn đúng món mới tính; sai không trừ gì; 5 lần đúng → Kind Keeper', () => {
    const s = newSave();
    expect(zooFeed(s, 'elephant', 'meat').ok).toBe(false);
    expect(s.zoo.fedOk).toBe(0);
    for (let i = 0; i < 5; i++) expect(zooFeed(s, 'elephant', 'hay').ok).toBe(true);
    expect(s.zoo.badges).toContain('keeper');
  });
  it('dọn chuồng: lá chỉ là trang trí, quay lại sau 15 phút; dọn cả 5 khu → Clean Zoo', () => {
    const s = newSave();
    const T0 = 1_000_000;
    expect(zooDirty(s, 'forest', T0)).toBe(true);
    for (const z of ZOO_ZONES) zooClean(s, z.id, T0);
    expect(zooDirty(s, 'forest', T0 + 60_000)).toBe(false);
    expect(zooDirty(s, 'forest', T0 + 16 * 60_000)).toBe(true);
    expect(s.zoo.badges).toContain('clean');
    expect(ZOO_BADGES.length).toBe(9);
  });
  it('lưu & đọc lại: nơi đang chơi, vị trí sở thú, tiến trình; dữ liệu lạ bị lọc', () => {
    const s = newSave();
    s.place = 'zoo';
    s.zooPos = { x: 19.5, y: 30.5 };
    zooTap(s, 'owl');
    zooFeed(s, 'owl', 'bugs');
    zooClean(s, 'birds', 5);
    const back = sanitizeSave(JSON.parse(JSON.stringify({ ...s, zoo: { ...s.zoo, seen: { ...s.zoo.seen, dragon: 3 }, badges: [...s.zoo.badges, 'hack'] } })));
    expect(back.place).toBe('zoo');
    expect(back.zooPos).toEqual({ x: 19.5, y: 30.5 });
    expect(back.zoo.seen).toEqual({ owl: 1 });
    expect(back.zoo.fedOk).toBe(1);
    expect(back.zoo.cleanAt).toEqual({ birds: 5 });
    expect(back.zoo.badges).toEqual(['first']);
    expect(sanitizeSave({}).place).toBe('farm');
  });
});

describe('mini-game sở thú (SPEC 19.7)', () => {
  it('có 4 game sở thú, giữ nguyên 4 game nông trại', () => {
    expect(GAMES.filter((g) => g.place === 'farm').map((g) => g.id)).toEqual(['find', 'listen', 'match', 'quiz']);
    expect(GAMES.filter((g) => g.place === 'zoo').map((g) => g.title)).toEqual(['Find the Animal', 'Animal Sounds', 'Animal Homes', 'Count the Animals']);
  });
  for (const g of GROUPS) {
    it(`theo tuổi ${g}: số câu, số lựa chọn, đáp án luôn có trong lựa chọn`, () => {
      const find = makeZooFindRound(g);
      expect(find.length).toBe(Math.min(roundLength(g), zooPool(g).length));
      for (const q of find) {
        expect(q.options).toContain(q.answer);
        expect(q.options.length).toBe(choiceCount(g));
        expect(zooPool(g)).toContain(q.answer);
      }
      for (const q of makeSoundRound(g)) {
        expect(q.options).toContain(q.answer);
        const sounds = q.options.map((w) => SOUND_ANIMALS.find((a) => a.word === w)!.sound);
        expect(new Set(sounds).size).toBe(sounds.length); // không có 2 con cùng tiếng
      }
      for (const board of makeHomeBoards(g)) {
        expect(board.length).toBe(matchPairs(g));
        expect(new Set(board.map((p) => p.home)).size).toBe(board.length); // nối 1–1
        for (const p of board) expect(ZOO_BY_ID.get(p.animal)!.home).toBe(p.home);
      }
      const [lo, hi] = COUNT_RANGE[g];
      for (const q of makeCountRound(g)) {
        expect(q.n).toBeGreaterThanOrEqual(lo);
        expect(q.n).toBeLessThanOrEqual(hi);
        expect(q.answer).toBe(NUMBER_WORDS[q.n]);
        expect(q.options).toContain(q.answer);
        expect(new Set(q.options).size).toBe(q.options.length);
      }
    });
  }
  it('số nhiều đúng khi đếm', () => {
    expect(pluralAnimal('monkey')).toBe('monkeys');
    expect(pluralAnimal('fox')).toBe('foxes');
    expect(pluralAnimal('deer')).toBe('deer');
    expect(pluralAnimal('octopus')).toBe('octopuses');
  });
});

describe('con vật luôn ở trong chuồng (an toàn — SPEC 19.2)', () => {
  it('chạy mô phỏng 10 phút với bước thời gian lộn xộn: không con nào ra khỏi chuồng', async () => {
    const { ZooHerd } = await import('./zooWorld');
    const herd = new ZooHerd(ZOO_MAP);
    let now = 1_000_000;
    const anims = ['sleep', 'eat', 'drink', 'play', 'walk', 'run', 'swim', 'fly', 'climb', 'splash', 'call'] as const;
    for (let i = 0; i < 36_000; i++) {
      const dt = i % 97 === 0 ? -0.5 : i % 89 === 0 ? 3 : 0.016;
      now += 16;
      if (i % 500 === 0) herd.actors.forEach((a, k) => a.perform(anims[(i / 500 + k) % anims.length], now, 3000));
      herd.update(dt, now);
    }
    for (const a of herd.actors) {
      const ar = ZOO_AREAS[a.def.zone];
      expect(a.x >= ar.x && a.x <= ar.x + ar.w && a.y >= ar.y && a.y <= ar.y + ar.h, `${a.def.id} ${a.x},${a.y}`).toBe(true);
    }
  });
});
