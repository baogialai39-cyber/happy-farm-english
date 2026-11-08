import { describe, expect, it } from 'vitest';
import { ACCESSORIES, ACCESSORY_TABS, BAKERY_INGREDIENTS, ITEMS, RECIPES, SHOPS, matchRecipe } from '../content/items';
import { Grid, PLAYER_R, nearestInteractable } from './grid';
import { WORLD, isPlantable, zoneAt } from './map';
import {
  MAX_PLANTS, buyAccessory, buyItem, canMake, care, collectFromAnimal, cook, count, feedAnimal, harvest, mixBowl, newSave, plant,
  plotStage, sanitizeSave, sellItem, sleepThroughNight, startBake, takeFromOven, toggleAccessory, water,
} from './save';

const grid = new Grid(WORLD);
const spawn = { x: Math.floor(WORLD.spawn.x), y: Math.floor(WORLD.spawn.y) };

describe('bản đồ', () => {
  it('điểm xuất phát đứng được', () => {
    expect(grid.boxHits(WORLD.spawn.x, WORLD.spawn.y)).toBe(false);
  });

  it('MỌI đồ vật tương tác đều đi tới được từ điểm xuất phát', () => {
    for (const o of WORLD.objects) {
      const stands = grid.standTiles(o);
      expect(stands.length, o.id).toBeGreaterThan(0);
      const path = grid.findPath(spawn, stands);
      expect(path, `không tới được ${o.id}`).not.toBeNull();
      // đứng ở cuối đường → nút tương tác chọn đúng đồ vật này hoặc một đồ vật kề bên
      const end = path!.length ? path![path!.length - 1] : spawn;
      const near = nearestInteractable(WORLD.objects, end.x + 0.5, end.y + 0.5);
      expect(near, o.id).toBeDefined();
    }
  });

  it('đủ các khu vực yêu cầu', () => {
    const ids = WORLD.zones.map((z) => z.id);
    for (const z of ['living', 'bedroom', 'kitchen', 'baking', 'garden', 'pen', 'shop-accessory', 'shop-seed', 'shop-market', 'shop-baking'])
      expect(ids).toContain(z);
    // mỗi khu vực (trừ sân) có ít nhất 1 đồ vật tương tác
    for (const z of WORLD.zones) expect(WORLD.objects.some((o) => o.zone === z.id), z.id).toBe(true);
    expect(zoneAt(WORLD, 15, 10)?.id).toBe('living');
  });

  it('4 cửa hàng đều có cửa đi vào được', () => {
    for (const shop of Object.keys(SHOPS)) {
      const o = WORLD.objects.find((x) => x.shop === shop)!;
      expect(grid.findPath(spawn, grid.standTiles(o))).not.toBeNull();
    }
  });
});

describe('va chạm', () => {
  it('không đi xuyên tường nhà dù tốc độ lớn', () => {
    // đứng trong phòng khách, lao lên tường ngang (y = 8) ở chỗ không có cửa
    const pos = { x: 19.5, y: 10.5 };
    grid.move(pos, 0, -5);
    expect(pos.y).toBeGreaterThanOrEqual(9 + PLAYER_R - 1e-9);
    expect(grid.boxHits(pos.x, pos.y)).toBe(false);
  });

  it('trượt dọc tường khi đi chéo', () => {
    const pos = { x: 15.5, y: 3.31 }; // phòng ngủ (giữa giường và tủ), sát tường trên
    const r = grid.move(pos, -0.5, -0.5);
    expect(r.blockedY).toBe(true);
    expect(pos.x).toBeLessThan(15.5);
  });

  it('không đi xuyên đồ đạc', () => {
    const pos = { x: 25.5, y: 4.5 }; // ngay dưới bàn trộn (25..26, 3)
    grid.move(pos, 0, -3);
    expect(pos.y).toBeGreaterThanOrEqual(4 + PLAYER_R - 1e-9);
  });

  it('tìm đường không cắt góc tường', () => {
    const path = grid.findPath(spawn, [{ x: 15, y: 5 }])!; // vào phòng ngủ
    expect(path).not.toBeNull();
    let prev = spawn;
    for (const p of path) {
      expect(grid.isSolid(p.x, p.y)).toBe(false);
      if (p.x !== prev.x && p.y !== prev.y) {
        expect(grid.isSolid(p.x, prev.y) || grid.isSolid(prev.x, p.y)).toBe(false);
      }
      prev = p;
    }
  });
});

describe('kinh tế trong game', () => {
  const T = 1_000_000;

  it('vòng chơi: chọn ô → gieo → tưới → chăm sóc → thu hoạch → bán', () => {
    const s = newSave();
    const K = '5,27';
    expect(plant(s, '20,20', 'carrot-seed', T)).toBe(false); // không phải đất vườn
    expect(plant(s, '10,25', 'carrot-seed', T)).toBe(false); // giếng
    expect(plant(s, K, 'carrot-seed', T)).toBe(true);
    expect(plant(s, K, 'carrot-seed', T)).toBe(false); // ô đã có cây
    expect(count(s, 'carrot-seed')).toBe(1);
    expect(plotStage(s.plots[K], T + 999_999)).toBe('dry'); // chưa tưới thì không lớn
    expect(water(s, K, T)).toBe(true);
    expect(plotStage(s.plots[K], T + 1000)).toBe('growing');
    expect(plotStage(s.plots[K], T + 10_000)).toBe('weeds'); // nửa chừng: cỏ dại, dừng lớn
    expect(plotStage(s.plots[K], T + 999_999)).toBe('weeds');
    expect(harvest(s, K, T + 999_999)).toBeNull();
    expect(care(s, K, T + 15_000)).toBe(true);
    expect(plotStage(s.plots[K], T + 16_000)).toBe('growing');
    expect(harvest(s, K, T + 24_000)).toBeNull();
    expect(harvest(s, K, T + 25_000)).toBe('carrot');
    expect(s.plots[K]).toBeUndefined();
    expect(count(s, 'carrot')).toBe(2);
    const before = s.coins;
    expect(sellItem(s, 'carrot')).toBe('ok');
    expect(s.coins).toBe(before + 3);
  });

  it('xu không bao giờ âm', () => {
    const s = newSave();
    s.coins = 1;
    expect(buyItem(s, 'watermelon-seed')).toBe('coins');
    expect(s.coins).toBe(1);
    expect(buyAccessory(s, 'crown')).toBe('coins');
    expect(sellItem(s, 'egg')).toBe('none');
  });

  it('phụ kiện: mua → đeo ngay; tủ quần áo tháo/đeo', () => {
    const s = newSave();
    s.coins = 100;
    expect(buyAccessory(s, 'crown')).toBe('ok');
    expect(s.equipped.head).toBe('crown');
    expect(buyAccessory(s, 'crown')).toBe('owned');
    expect(buyAccessory(s, 'flower-crown')).toBe('ok');
    expect(s.equipped.head).toBe('flower-crown'); // cùng chỗ đeo → thay
    toggleAccessory(s, 'flower-crown');
    expect(s.equipped.head).toBeUndefined();
  });

  it('con vật có thời gian chờ; heo ăn cà rốt', () => {
    const s = newSave();
    expect(collectFromAnimal(s, 'chicken', T)).toBe('egg');
    expect(collectFromAnimal(s, 'chicken', T + 1000)).toBeNull();
    expect(collectFromAnimal(s, 'chicken', T + 30_000)).toBe('egg');
    expect(feedAnimal(s, 'pig')).toBeNull();
    s.inv.carrot = 1;
    expect(feedAnimal(s, 'pig')).toBe('carrot');
    expect(count(s, 'carrot')).toBe(0);
  });

  it('nấu và nướng trừ đúng nguyên liệu', () => {
    const s = newSave();
    Object.assign(s.inv, { egg: 1, milk: 2, flour: 1 });
    expect(cook(s, 'soup')).toBe(false);
    expect(cook(s, 'omelette')).toBe(true);
    expect(count(s, 'omelette')).toBe(1);
    expect(startBake(s, 'bread', T)).toBe(true);
    expect(count(s, 'flour')).toBe(0);
    expect(startBake(s, 'bread', T)).toBe(false); // lò đang bận
    expect(takeFromOven(s, T + 100)).toBeNull();
    expect(takeFromOven(s, T + 8000)).toBe('bread');
  });

  it('ngủ: cây lớn hết, con vật sẵn sàng', () => {
    const s = newSave();
    plant(s, '4,26', 'carrot-seed', T);
    collectFromAnimal(s, 'cow', T);
    sleepThroughNight(s, T + 10);
    expect(plotStage(s.plots['4,26'], T + 10)).toBe('ready');
    expect(collectFromAnimal(s, 'cow', T + 10)).toBe('milk');
  });

  it('dữ liệu lạ bị lọc khi đọc', () => {
    const s = sanitizeSave({ coins: -5, inv: { carrot: 2, diamond: 99, egg: -1 }, owned: ['crown', 'gun'], equipped: { head: 'crown', face: 'crown' }, email: 'x@y.z' });
    expect(s.coins).toBe(15);
    expect(s.inv).toEqual({ carrot: 2 });
    expect(s.owned).toEqual(['crown']);
    expect(s.equipped).toEqual({ head: 'crown' });
    expect(s).not.toHaveProperty('email');
  });

  it('mọi công thức chỉ dùng vật phẩm có thể kiếm được', () => {
    const obtainable = new Set(ITEMS.filter((i) => i.buy !== undefined).map((i) => i.id));
    for (const i of ITEMS) if (i.grows) obtainable.add(i.grows);
    obtainable.add('egg').add('milk');
    for (const r of RECIPES) for (const id of Object.keys(r.need)) expect(obtainable.has(id), `${r.id}: ${id}`).toBe(true);
    expect(ACCESSORIES.length).toBeGreaterThan(0);
    expect(canMake(newSave(), RECIPES[0])).toBe(false);
  });
});

describe('giai đoạn 3 — hệ thống hoạt động', () => {
  const T = 2_000_000;

  it('save v1 (6 luống) tự chuyển sang toạ độ, không mất cây', () => {
    const s = sanitizeSave({ v: 1, plots: [{ crop: 'carrot-seed', plantedAt: 1, wateredAt: 5 }, {}, {}, {}, {}, { crop: 'tomato-seed', plantedAt: 2 }] });
    expect(Object.keys(s.plots).sort()).toEqual(['4,26', '8,28']);
    expect(s.plots['4,26'].caredAt).toBe(5); // save cũ chưa có bước chăm sóc → coi như đã chăm
    expect(s.v).toBe(2);
  });

  it('vườn: mọi ô đất đều trồng được, tối đa MAX_PLANTS cây', () => {
    let soil = 0;
    for (let y = 0; y < WORLD.h; y++) for (let x = 0; x < WORLD.w; x++) if (isPlantable(WORLD, x, y)) soil++;
    expect(soil).toBeGreaterThan(30);
    const s = newSave();
    s.inv['carrot-seed'] = 99;
    let n = 0;
    for (let y = 24; y <= 30; y++) for (let x = 3; x <= 11; x++) if (plant(s, `${x},${y}`, 'carrot-seed', T)) n++;
    expect(n).toBe(MAX_PLANTS);
    // mọi ô đất đều đi tới được
    const spawn = { x: Math.floor(WORLD.spawn.x), y: Math.floor(WORLD.spawn.y) };
    for (let y = 0; y < WORLD.h; y++) for (let x = 0; x < WORLD.w; x++) if (isPlantable(WORLD, x, y)) expect(grid.findPath(spawn, [{ x, y }]), `${x},${y}`).not.toBeNull();
  });

  it('Accessory Shop có đủ 6 loại: mũ, áo, quần, giày, ba lô, kính', () => {
    for (const slot of ['head', 'body', 'legs', 'feet', 'back', 'face'] as const) {
      expect(ACCESSORIES.filter((a) => a.slot === slot).length, slot).toBeGreaterThanOrEqual(2);
      expect(ACCESSORY_TABS.some((t) => t.slot === slot)).toBe(true);
    }
    const s = newSave();
    s.coins = 100;
    for (const id of ['red-shirt', 'blue-jeans', 'rain-boots', 'bunny-backpack', 'round-glasses', 'cap']) expect(buyAccessory(s, id)).toBe('ok');
    expect(s.equipped).toEqual({ body: 'red-shirt', legs: 'blue-jeans', feet: 'rain-boots', back: 'bunny-backpack', face: 'round-glasses', head: 'cap' });
    expect(sanitizeSave(JSON.parse(JSON.stringify(s))).equipped).toEqual(s.equipped);
  });

  it('Seed Shop bán đủ 6 loại hạt yêu cầu', () => {
    const items = SHOPS.seed.items();
    for (const id of ['apple-seed', 'carrot-seed', 'tomato-seed', 'strawberry-seed', 'sunflower-seed', 'watermelon-seed']) expect(items).toContain(id);
  });

  it('Bakery bán đủ 7 nguyên liệu; giá mua > giá bán (không lách kiếm xu)', () => {
    expect([...BAKERY_INGREDIENTS].sort()).toEqual(['butter', 'chocolate', 'egg', 'flour', 'milk', 'strawberry', 'sugar']);
    for (const id of SHOPS.baking.items()) {
      const it = ITEMS.find((i) => i.id === id)!;
      expect(it.buy, id).toBeDefined();
      if (it.sell !== undefined) expect(it.buy!).toBeGreaterThan(it.sell);
    }
  });

  it('quầy trộn: khớp đúng công thức thì ra món, sai thì không mất nguyên liệu', () => {
    const s = newSave();
    Object.assign(s.inv, { flour: 1, egg: 1, milk: 1, sugar: 1, strawberry: 1 });
    expect(mixBowl(s, ['flour', 'egg'])).toBeNull();
    expect(count(s, 'flour')).toBe(1); // trả lại
    expect(mixBowl(s, ['strawberry', 'sugar', 'milk', 'egg', 'flour'])).toBe('strawberry-cake');
    expect(count(s, 'strawberry-cake')).toBe(1);
    expect(count(s, 'flour')).toBe(0);
    expect(mixBowl(s, ['milk', 'chocolate'])).toBeNull(); // không có sô-cô-la → không làm được
  });

  it('không có 2 công thức trùng nguyên liệu (quầy trộn không mơ hồ)', () => {
    const sigs = RECIPES.map((r) => Object.entries(r.need).sort().map(([k, v]) => `${k}${v}`).join('+'));
    expect(new Set(sigs).size).toBe(sigs.length);
    for (const r of RECIPES) expect(matchRecipe(Object.entries(r.need).flatMap(([k, n]) => Array(n).fill(k)))?.id).toBe(r.id);
    // mọi bánh kem đều làm được từ 7 nguyên liệu của Bakery
    for (const id of ['cake', 'strawberry-cake', 'choco-cupcake', 'cookie', 'pancake', 'milkshake', 'hot-chocolate']) {
      const r = RECIPES.find((x) => x.id === id)!;
      for (const k of Object.keys(r.need)) expect(BAKERY_INGREDIENTS as readonly string[]).toContain(k);
    }
  });
});
