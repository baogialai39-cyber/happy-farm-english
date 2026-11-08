/**
 * Kiểm thử giai đoạn 7 (SPEC 18): thư viện hình, vườn cây ăn quả (hái 2 lần), đếm tiếng Anh,
 * khung từ 4×8 đặt cạnh vật, giọng em bé, bản đồ mới, màu áo liền thân.
 */
import { describe, expect, it } from 'vitest';
import { ANIMAL_ARTS, animalSvg } from '../art/library/animals';
import { FRUIT_KINDS, fruitIcon } from '../art/library/fruits';
import { HOUSEHOLD_IDS, householdSvg } from '../art/library/household';
import { artSvg, hasArt } from '../art/library';
import { TREES } from '../art/library/trees';
import { characterSvg } from '../art/character';
import { CHARACTERS, ONESIES, withOnesie } from '../content/characters';
import { countLabel, countSentence, countVi, numberWord } from '../content/counting';
import { ANIMALS, ITEM_BY_ID } from '../content/items';
import { resolveVocab } from '../content/vocab';
import { placeBeside } from '../learning/teacher';
import { pickLocalEnglishVoice, pitchFor } from '../systems/speech';
import { SHELF_ITEMS } from './interactions';
import { Grid } from './grid';
import { WORLD, zoneAt } from './map';
import { FRUIT_REGROW_MS, count, fruitRipe, harvestFruit, newSave, sanitizeSave, sleepThroughNight } from './save';

const wellFormed = (svg: string | null) => {
  expect(svg).toBeTruthy();
  expect(svg!.startsWith('<svg')).toBe(true);
  expect(svg).toContain('viewBox');
  expect(svg).not.toMatch(/NaN|undefined/);
  // thẻ nhóm mở/đóng cân bằng
  expect((svg!.match(/<g[\s>]/g) ?? []).length).toBe((svg!.match(/<\/g>/g) ?? []).length);
};

describe('thư viện hình (SPEC 18.1)', () => {
  it('đủ 9 con vật, 8 cây, 8 quả; mỗi hình hợp lệ', () => {
    expect([...ANIMAL_ARTS].sort()).toEqual(['cat', 'chicken', 'cow', 'dog', 'duck', 'horse', 'pig', 'rabbit', 'sheep']);
    for (const a of ANIMAL_ARTS) wellFormed(animalSvg(a));
    expect(TREES.map((t) => t.id).sort()).toEqual(['apple-tree', 'banana-tree', 'coconut-tree', 'grapevine', 'mango-tree', 'orange-tree', 'strawberry-plant', 'watermelon-plant']);
    for (const t of TREES) wellFormed(t.svg());
    for (const f of FRUIT_KINDS) {
      wellFormed(fruitIcon(f, true));
      wellFormed(fruitIcon(f, false));
    }
  });

  it('mỗi cây vẽ RIÊNG (không cùng một mẫu đổi màu)', () => {
    const shapes = TREES.map((t) => t.svg().replace(/#[0-9A-Fa-f]{3,6}/g, '').replace(/id="[^"]*"|url\(#[^)]*\)/g, ''));
    expect(new Set(shapes).size).toBe(TREES.length);
    for (const t of TREES) expect(t.slots.length, t.id).toBeGreaterThanOrEqual(2);
  });

  it('đủ đồ vật trong nhà theo yêu cầu, mỗi món có hình + mục từ', () => {
    const need = ['sofa', 'table', 'chair', 'television', 'clock', 'window', 'bed', 'pillow', 'blanket', 'wardrobe', 'lamp',
      'refrigerator', 'spoon', 'fork', 'plate', 'cup', 'bowl', 'pan', 'pot', 'toothbrush', 'towel', 'soap', 'mirror'];
    for (const n of need) {
      expect(HOUSEHOLD_IDS, n).toContain(n);
      wellFormed(householdSvg(n));
      expect(resolveVocab(n), n).toBeTruthy();
    }
  });

  it('mọi con vật, cây trên bản đồ và món trên kệ bếp đều có hình', () => {
    for (const a of Object.keys(ANIMALS)) expect(hasArt(a), a).toBe(true);
    for (const o of WORLD.objects.filter((x) => x.kind === 'tree')) expect(hasArt(o.word), o.id).toBe(true);
    for (const w of SHELF_ITEMS) expect(artSvg(w), w).toBeTruthy();
  });
});

describe('bản đồ giai đoạn 7', () => {
  const grid = new Grid(WORLD);
  it('vườn cây ăn quả có 8 cây; phòng tắm có 4 đồ vật', () => {
    const trees = WORLD.objects.filter((o) => o.kind === 'tree');
    expect(trees.length).toBe(8);
    for (const t of trees) expect(zoneAt(WORLD, t.x, t.y)?.id, t.id).toBe('orchard');
    for (const id of ['mirror', 'toothbrush', 'towel', 'soap']) {
      const o = WORLD.objects.find((x) => x.id === id)!;
      expect(zoneAt(WORLD, o.x, o.y)?.id, id).toBe('bathroom');
    }
  });
  it('9 con vật đều có trên bản đồ và có chỗ đứng cạnh', () => {
    const animals = WORLD.objects.filter((o) => o.kind === 'animal').map((o) => o.animal).sort();
    expect(animals).toEqual(['cat', 'chicken', 'cow', 'dog', 'duck', 'horse', 'pig', 'rabbit', 'sheep']);
    for (const o of WORLD.objects.filter((x) => x.kind === 'animal')) expect(grid.standTiles(o).length, o.id).toBeGreaterThan(0);
  });
  it('phòng tắm đi vào được từ phòng ngủ qua cửa', () => {
    expect(grid.findPath({ x: 15, y: 5 }, [{ x: 20, y: 5 }])).not.toBeNull();
  });
});

describe('vườn cây ăn quả — hái quả (SPEC 18.5)', () => {
  const T0 = 1_000_000;
  it('quả chín hái được, túi +1, quả non mọc lại tại chỗ rồi chín lại', () => {
    const s = newSave();
    expect(fruitRipe(s, 'apple-tree', 0, T0)).toBe(true);
    expect(harvestFruit(s, 'apple-tree', 0, T0)).toEqual({ item: 'apple', count: 1 });
    expect(count(s, 'apple')).toBe(1);
    expect(fruitRipe(s, 'apple-tree', 0, T0 + 10)).toBe(false);
    expect(fruitRipe(s, 'apple-tree', 1, T0 + 10)).toBe(true);
    expect(fruitRipe(s, 'apple-tree', 0, T0 + FRUIT_REGROW_MS)).toBe(true);
  });
  it('không hái trùng: quả vừa hái không hái được, số lượng không đổi', () => {
    const s = newSave();
    harvestFruit(s, 'mango-tree', 2, T0);
    expect(harvestFruit(s, 'mango-tree', 2, T0 + 5)).toBeNull();
    expect(harvestFruit(s, 'mango-tree', 2, T0 + 5)).toBeNull();
    expect(count(s, 'mango')).toBe(1);
  });
  it('số lượng chính xác khi hái hết mọi quả của 8 cây; quả bán được ở chợ', () => {
    const s = newSave();
    const start = Object.values(s.inv).reduce((a, b) => a + b, 0);
    let n = 0;
    for (const t of TREES) for (let i = 0; i < t.slots.length; i++) {
      const r = harvestFruit(s, t.id, i, T0)!;
      expect(r.item).toBe(t.fruit);
      expect(ITEM_BY_ID.get(t.fruit)?.sell, t.fruit).toBeGreaterThan(0);
      n++;
    }
    expect(Object.values(s.inv).reduce((a, b) => a + b, 0) - start).toBe(n);
    expect(count(s, 'apple')).toBe(TREES.find((t) => t.id === 'apple-tree')!.slots.length);
  });
  it('vị trí quả/cây không hợp lệ → không làm gì', () => {
    const s = newSave();
    expect(harvestFruit(s, 'banana-tree', 99, T0)).toBeNull();
    expect(harvestFruit(s, 'pear-tree', 0, T0)).toBeNull();
    expect(Object.keys(s.orchard)).toEqual([]);
  });
  it('lưu & đọc lại giữ trạng thái quả; dữ liệu lạ bị lọc; ngủ dậy quả chín lại', () => {
    const s = newSave();
    harvestFruit(s, 'grapevine', 1, T0);
    const back = sanitizeSave(JSON.parse(JSON.stringify({ ...s, orchard: { ...s.orchard, hack: [1, 2], 'apple-tree': ['x', -5] } })));
    expect(back.orchard.grapevine[1]).toBe(T0 + FRUIT_REGROW_MS);
    expect(back.orchard.hack).toBeUndefined();
    expect(back.orchard['apple-tree'].every((v) => v === 0)).toBe(true);
    sleepThroughNight(back, T0 + 10);
    expect(fruitRipe(back, 'grapevine', 1, T0 + 10)).toBe(true);
  });
});

describe('đếm bằng tiếng Anh', () => {
  it('số → chữ', () => {
    expect([1, 2, 3, 11, 20, 21, 45, 100, 101].map(numberWord)).toEqual(
      ['one', 'two', 'three', 'eleven', 'twenty', 'twenty-one', 'forty-five', 'one hundred', 'one hundred and one']);
  });
  it('số ít / số nhiều đúng', () => {
    expect(countSentence('apple', 1)).toBe('One apple.');
    expect(countSentence('apple', 2)).toBe('Two apples.');
    expect(countSentence('mango', 3)).toBe('Three mangoes.');
    expect(countSentence('strawberry', 2)).toBe('Two strawberries.');
    expect(countSentence('grapes', 1)).toBe('One bunch of grapes.');
    expect(countLabel('apple', 1)).toBe('1 APPLE');
    expect(countLabel('apple', 2)).toBe('2 APPLES');
    expect(countVi('orange', 3)).toBe('3 quả cam');
  });
});

describe('khung từ 4×8 đặt cạnh vật (SPEC 18.7)', () => {
  const card = { w: 224, h: 112 }; // 8u × 4u, u = 28 px (điện thoại)
  const overlaps = (a: { left: number; top: number }, t: { x: number; y: number; w: number; h: number }) =>
    !(a.left + card.w <= t.x || t.x + t.w <= a.left || a.top + card.h <= t.y || t.y + t.h <= a.top);
  it('ưu tiên bên phải, không che vật', () => {
    const t = { x: 40, y: 300, w: 80, h: 120 };
    const p = placeBeside(t, card, { w: 375, h: 812 });
    expect(p.side).toBe('right');
    expect(overlaps(p, t)).toBe(false);
  });
  it('điện thoại dọc/ngang, máy tính bảng, máy tính: luôn trong màn hình, không che vật', () => {
    const views = [{ w: 375, h: 812 }, { w: 812, h: 375 }, { w: 768, h: 1024 }, { w: 1280, h: 800 }];
    for (const v of views) {
      for (const t of [{ x: v.w - 90, y: 200, w: 80, h: 100 }, { x: 20, y: 140, w: v.w - 40, h: 90 }, { x: v.w / 2 - 40, y: v.h - 140, w: 80, h: 120 }]) {
        const p = placeBeside(t, card, v);
        expect(p.left).toBeGreaterThanOrEqual(0);
        expect(p.top).toBeGreaterThanOrEqual(0);
        expect(p.left + card.w).toBeLessThanOrEqual(v.w);
        expect(p.top + card.h).toBeLessThanOrEqual(v.h);
        expect(overlaps(p, t), JSON.stringify([v, t])).toBe(false);
      }
    }
  });
});

describe('giọng em bé (SPEC 18.8)', () => {
  const voice = (name: string, lang: string, localService = true) => ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice;
  it('ưu tiên giọng trẻ em cục bộ, rồi giọng nữ trẻ; không chọn giọng mạng', () => {
    expect(pickLocalEnglishVoice([voice('Microsoft David', 'en-US'), voice('Microsoft Zira', 'en-US'), voice('Microsoft Ana Online', 'en-US', false)])?.name).toBe('Microsoft Zira');
    expect(pickLocalEnglishVoice([voice('Microsoft Zira', 'en-US'), voice('Junior', 'en-US')])?.name).toBe('Junior');
    expect(pitchFor(voice('Junior', 'en-US'))).toBeLessThan(pitchFor(voice('Microsoft Zira', 'en-US')));
  });
});

describe('nhân vật em bé (SPEC 18.2)', () => {
  it('8 màu áo; mọi nhân vật × màu × biểu cảm đều vẽ được', () => {
    expect(ONESIES.length).toBe(8);
    for (const c of CHARACTERS) for (const o of ONESIES) for (const expr of ['normal', 'happy', 'surprised'] as const) {
      const svg = characterSvg(withOnesie(c, o.id), '', false, {}, undefined, { expr });
      expect(svg).toContain(o.color);
      expect(svg).not.toMatch(/NaN|undefined/);
    }
    expect(withOnesie(CHARACTERS[0], 'nope')).toEqual(CHARACTERS[0]);
  });
});
