import { describe, expect, it } from 'vitest';
import { AGE_RULES } from '../config/ageRules';
import { ACCESSORIES, BAKERY_FOODS, FURNITURE, FURNITURE_BY_ID, ITEM_BY_ID, ITEMS, SHOPS, ZOO_TICKET_PRICE } from '../content/items';
import { canPlace, furnitureObject, validSpots } from './furniture';
import { Grid } from './grid';
import { WORLD } from './map';
import {
  HARVEST_YIELD, SURPRISE_TOYS, WHEEL_SEEDS, addCorrect, buyFurniture, buyZooTicket, count, endZooVisit, harvest, moveFurniture,
  newSave, placeFurniture, plant, sanitizeSave, sleepThroughNight, spinWheel, storeFurniture,
} from './save';

const T = 1_000_000;
const def = (id: string) => FURNITURE_BY_ID.get(id)!;

describe('kinh tế (SPEC 21.5)', () => {
  it('giá bán nông sản đúng bảng yêu cầu', () => {
    const sell = (id: string) => ITEM_BY_ID.get(id)!.sell;
    expect([sell('carrot'), sell('tomato'), sell('apple'), sell('banana'), sell('orange'), sell('strawberry'), sell('watermelon')])
      .toEqual([1, 1, 2, 2, 2, 3, 3]);
  });
  it('trồng 1 hạt rồi bán không lãi quá nhiều; mua vào luôn đắt hơn bán ra', () => {
    for (const it of ITEMS) {
      if (it.kind === 'seed' && !it.special) {
        const crop = ITEM_BY_ID.get(it.grows!)!;
        expect((crop.sell ?? 0) * HARVEST_YIELD, it.id).toBeLessThanOrEqual((it.buy ?? 0) * 3);
      }
      if (it.buy && it.sell) expect(it.buy, it.id).toBeGreaterThan(it.sell);
    }
  });
  it('quần áo / phụ kiện có giá 4–5 xu (trừ đồ mở khóa bằng sao)', () => {
    for (const a of ACCESSORIES) if (a.price > 0) expect(a.price, a.id).toBeGreaterThanOrEqual(4), expect(a.price, a.id).toBeLessThanOrEqual(5);
  });
  it('đồ ăn bán ở tiệm bánh có giá 4–5 xu', () => {
    for (const id of BAKERY_FOODS) {
      const b = ITEM_BY_ID.get(id)!.buy!;
      expect(b, id).toBeGreaterThanOrEqual(4);
      expect(b, id).toBeLessThanOrEqual(5);
    }
    expect(SHOPS.baking.items()).toEqual(expect.arrayContaining(BAKERY_FOODS));
  });
  it('nội thất đủ 10 món, 50–100 xu; TV/bàn/ghế/sofa/tranh = 100', () => {
    expect(FURNITURE.map((f) => f.word)).toEqual(expect.arrayContaining(
      ['television', 'table', 'chair', 'sofa', 'wardrobe', 'bed', 'painting', 'lamp', 'rug', 'flower pot']));
    for (const f of FURNITURE) expect(f.price).toBeGreaterThanOrEqual(50), expect(f.price).toBeLessThanOrEqual(100);
    for (const id of ['f-tv', 'f-table', 'f-chair', 'f-sofa', 'f-painting']) expect(def(id).price).toBe(100);
    expect(SHOPS.decor.items()).toEqual(FURNITURE.map((f) => f.id));
  });
});

describe('vé sở thú 30 xu (SPEC 21.6)', () => {
  it('thiếu xu → không vào, không trừ xu', () => {
    const s = newSave();
    s.coins = 29;
    expect(buyZooTicket(s)).toBe('coins');
    expect(s.coins).toBe(29);
    expect(s.zooTicket).toBe(false);
  });
  it('đủ xu → trừ đúng 30 một lần; không trừ lần hai cho cùng lượt', () => {
    const s = newSave();
    s.coins = 100;
    expect(ZOO_TICKET_PRICE).toBe(30);
    expect(buyZooTicket(s)).toBe('bought');
    expect(s.coins).toBe(70);
    expect(buyZooTicket(s)).toBe('has');
    expect(s.coins).toBe(70);
    endZooVisit(s);
    expect(buyZooTicket(s)).toBe('bought'); // lượt mới
    expect(s.coins).toBe(40);
  });
  it('tải lại khi đang ở sở thú vẫn giữ vé (không trừ lại); save cũ ở sở thú được tặng vé', () => {
    expect(sanitizeSave({ ...newSave(), place: 'zoo', zooTicket: true }).zooTicket).toBe(true);
    const old = { ...newSave(), place: 'zoo' } as Record<string, unknown>;
    delete old.zooTicket;
    expect(sanitizeSave(old).zooTicket).toBe(true);
    expect(sanitizeSave({ ...newSave(), place: 'farm', zooTicket: true }).zooTicket).toBe(false);
  });
});

describe('nội thất: mua, đặt, di chuyển, cất (SPEC 21.2–21.3)', () => {
  it('thiếu xu không mua được; đủ xu vào kho', () => {
    const s = newSave();
    s.coins = 99;
    expect(buyFurniture(s, 'f-tv')).toBe('coins');
    expect(s.coins).toBe(99);
    s.coins = 150;
    expect(buyFurniture(s, 'f-tv')).toBe('ok');
    expect(s.coins).toBe(50);
    expect(s.furniture.inv['f-tv']).toBe(1);
    expect(buyFurniture(s, 'nope')).toBe('none');
  });
  it('đặt → ra khỏi kho; di chuyển; cất lại vào kho; lưu/tải lại giữ nguyên', () => {
    const s = newSave();
    s.coins = 500;
    buyFurniture(s, 'f-sofa');
    expect(placeFurniture(s, 'f-tv', 1, 1)).toBeNull(); // chưa có
    const p = placeFurniture(s, 'f-sofa', 5, 5)!;
    expect(s.furniture.inv['f-sofa']).toBeUndefined();
    expect(moveFurniture(s, p.uid, 6, 5)).toBe(true);
    const back = sanitizeSave(JSON.parse(JSON.stringify(s)));
    expect(back.furniture.placed).toEqual([{ uid: p.uid, id: 'f-sofa', x: 6, y: 5 }]);
    expect(back.furniture.nextUid).toBeGreaterThan(p.uid);
    expect(storeFurniture(back, p.uid)).toBe(true);
    expect(back.furniture.inv['f-sofa']).toBe(1);
    expect(back.furniture.placed).toEqual([]);
  });
  it('dữ liệu nội thất lạ bị lọc', () => {
    const s = sanitizeSave({ furniture: { inv: { 'f-tv': 2, gun: 1, 'f-bed': -3 }, placed: [{ uid: 1, id: 'bomb', x: 1, y: 1 }], nextUid: 1 } });
    expect(s.furniture.inv).toEqual({ 'f-tv': 2 });
    expect(s.furniture.placed).toEqual([]);
  });
  it('chỉ đặt được trên sàn trong nhà, không đè đồ có sẵn, không đè bé, không chặn lối', () => {
    const chair = def('f-chair');
    const spots = validSpots(WORLD, WORLD.objects, chair);
    expect(spots.length).toBeGreaterThan(5);
    for (const sp of spots) expect('LBKCW').toContain(WORLD.tiles[sp.y][sp.x]);
    expect(canPlace(WORLD, WORLD.objects, chair, Math.floor(WORLD.spawn.x), Math.floor(WORLD.spawn.y))).toBe(false); // ngoài trời
    const busy = WORLD.objects.find((o) => o.solid && 'LBKCW'.includes(WORLD.tiles[o.y]?.[o.x] ?? '.'))!;
    expect(canPlace(WORLD, WORLD.objects, chair, busy.x, busy.y)).toBe(false);
    const sp = spots[0];
    expect(canPlace(WORLD, WORLD.objects, chair, sp.x, sp.y, { x: sp.x + 0.5, y: sp.y + 0.5 })).toBe(false);
  });
  it('đặt kín nhà bằng ghế: luôn còn đường tới mọi cửa và đồ vật trong nhà', () => {
    const chair = def('f-chair');
    let objects = [...WORLD.objects];
    for (let i = 0; i < 200; i++) {
      const spots = validSpots(WORLD, objects, chair);
      if (!spots.length) break;
      objects = [...objects, furnitureObject({ uid: 1000 + i, id: 'f-chair', ...spots[0] })];
    }
    const grid = new Grid({ ...WORLD, objects });
    const spawn = { x: Math.floor(WORLD.spawn.x), y: Math.floor(WORLD.spawn.y) };
    for (const o of WORLD.objects) {
      if (o.wall) continue;
      expect(grid.findPath(spawn, grid.standTiles(o)), o.id).not.toBeNull();
    }
  });
  it('tranh chỉ treo trên tường ngay trên sàn trong nhà; thảm không chặn đường', () => {
    const painting = def('f-painting'), rug = def('f-rug');
    const walls = validSpots(WORLD, WORLD.objects, painting);
    expect(walls.length).toBeGreaterThan(0);
    for (const w of walls) expect(WORLD.tiles[w.y][w.x]).toBe('#');
    expect(furnitureObject({ uid: 1, id: 'f-rug', x: 1, y: 1 }).solid).toBe(false);
    expect(rug.flat).toBe(true);
  });
});

describe('LUCKY SEED WHEEL (SPEC 21.4)', () => {
  it('số câu đúng cho 1 lượt quay theo tuổi: 5 / 7 / 10', () => {
    expect([AGE_RULES['2-3'].correctPerSpin, AGE_RULES['4-5'].correctPerSpin, AGE_RULES['6-8'].correctPerSpin]).toEqual([5, 7, 10]);
    const s = newSave();
    for (let i = 1; i <= 4; i++) expect(addCorrect(s, 5)).toBe(false);
    expect(addCorrect(s, 5)).toBe(true);
    expect(s.wheel).toMatchObject({ progress: 0, spins: 1 });
  });
  it('quay: trừ lượt + chốt hạt vào túi + lịch sử NGAY; hết lượt không quay', () => {
    const s = newSave();
    expect(spinWheel(s, T)).toBeNull();
    s.wheel.spins = 1;
    const seed = spinWheel(s, T, () => 0.99)!;
    expect(seed).toBe('toy-seed');
    expect(s.wheel.spins).toBe(0);
    expect(count(s, 'toy-seed')).toBe(1);
    expect(s.wheel.history).toEqual([{ seed: 'toy-seed', at: T }]);
    expect(spinWheel(s, T)).toBeNull();
    // tải lại trang: lượt đã dùng không quay lại
    expect(sanitizeSave(JSON.parse(JSON.stringify(s))).wheel.spins).toBe(0);
  });
  it('ô nào cũng là hạt giống (không có ô trượt); lịch sử tối đa 50', () => {
    const s = newSave();
    s.wheel.spins = 60;
    const got = new Set<string>();
    for (let i = 0; i < 60; i++) got.add(spinWheel(s, T + i, () => (i % 5) / 5)!);
    expect([...got].sort()).toEqual([...WHEEL_SEEDS].sort());
    expect(s.wheel.history.length).toBe(50);
    const clean = sanitizeSave({ wheel: { progress: 3, spins: 2, history: [{ seed: 'diamond', at: 1 }, { seed: 'candy-seed', at: 2 }] } });
    expect(clean.wheel).toEqual({ progress: 3, spins: 2, history: [{ seed: 'candy-seed', at: 2 }] });
  });
  it('gieo hạt đặc biệt → lớn → thu hoạch đúng phần thưởng', () => {
    const cases: [string, (s: ReturnType<typeof newSave>, got: string) => void][] = [
      ['candy-seed', (s, g) => { expect(g).toBe('candy'); expect(count(s, 'candy')).toBe(1); }],
      ['balloon-seed', (s, g) => { expect(g).toBe('balloon'); }],
      ['car-seed', (s, g) => { expect(g).toBe('toy-car'); }],
      ['star-seed', (s, g) => { expect(g).toBe('gold-star'); expect(s.stars).toBe(2); }],
      ['toy-seed', (s, g) => { expect(SURPRISE_TOYS).toContain(g); expect(count(s, g)).toBe(1); }],
    ];
    for (const [seed, check] of cases) {
      const s = newSave();
      s.inv[seed] = 1;
      expect(plant(s, '4,26', seed, T), seed).toBe(true);
      sleepThroughNight(s, T + 10);
      const got = harvest(s, '4,26', T + 10, () => 0.3)!;
      expect(ITEM_BY_ID.get(got), got).toBeDefined();
      check(s, got);
    }
  });
});

describe('hiệu ứng vòng quay (F-229)', async () => {
  const { segmentAt, targetAngle, easeOutQuart } = await import('../games/wheel');
  it('góc dừng luôn nằm trong đúng ô đã chốt, kể cả có lệch ngẫu nhiên', () => {
    for (let idx = 0; idx < WHEEL_SEEDS.length; idx++) for (const from of [0, 37, 725.5, -16]) for (const j of [-17, 0, 17]) {
      const end = targetAngle(from, idx, 5, j);
      expect(segmentAt(end), `${idx} ${from} ${j}`).toBe(idx);
      expect(end - from).toBeGreaterThanOrEqual(360 * 4); // quay đủ nhiều vòng
    }
  });
  it('chậm dần: bắt đầu 0, kết thúc 1, không vượt quá (không giật lùi suýt trúng)', () => {
    expect(easeOutQuart(0)).toBe(0);
    expect(easeOutQuart(1)).toBe(1);
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.01) { const v = easeOutQuart(t); expect(v).toBeGreaterThanOrEqual(prev); expect(v).toBeLessThanOrEqual(1); prev = v; }
  });
});
