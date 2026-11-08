import { describe, expect, it } from 'vitest';
import { AGE_RULES, ageGroupFor, selectableBirthYears } from '../config/ageRules';
import { MemoryKV } from './kv';
import { MAX_PROFILES, ProfileStore, sanitizeProfile, validateNickname } from './profiles';

const NOW = new Date('2026-11-08T10:00:00');

describe('ageRules', () => {
  it('tính nhóm tuổi từ năm sinh', () => {
    expect(ageGroupFor(2024, undefined, NOW)).toBe('2-3');
    expect(ageGroupFor(2025, undefined, NOW)).toBe('2-3'); // < 2 tuổi
    expect(ageGroupFor(2022, undefined, NOW)).toBe('4-5');
    expect(ageGroupFor(2019, undefined, NOW)).toBe('6-8');
    expect(ageGroupFor(2015, undefined, NOW)).toBe('6-8'); // > 8 tuổi
    expect(ageGroupFor(2024, '6-8', NOW)).toBe('6-8'); // phụ huynh ghi đè
  });
  it('khớp bảng SPEC', () => {
    expect(AGE_RULES['2-3'].buttonMinPx).toBe(120);
    expect(AGE_RULES['4-5'].buttonMinPx).toBe(96);
    expect(AGE_RULES['6-8'].buttonMinPx).toBe(72);
    expect(AGE_RULES['2-3'].dailyMinutes).toEqual({ default: 15, cap: 20 });
    expect(AGE_RULES['4-5'].dailyMinutes).toEqual({ default: 20, cap: 30 });
    expect(AGE_RULES['6-8'].dailyMinutes).toEqual({ default: 30, cap: 45 });
  });
  it('năm sinh chọn được ứng với tuổi 2–8', () => {
    expect(selectableBirthYears(NOW)).toEqual([2024, 2023, 2022, 2021, 2020, 2019, 2018]);
  });
});

describe('validateNickname', () => {
  it('nhận biệt danh tiếng Việt', () => {
    expect(validateNickname('Bé Na')).toBeNull();
    expect(validateNickname('  Bin   Bon ')).toBeNull();
    expect(validateNickname('Sóc-Nâu')).toBeNull();
  });
  it('chặn số, email, quá dài, rỗng', () => {
    expect(validateNickname('')).toBe('empty');
    expect(validateNickname('   ')).toBe('empty');
    expect(validateNickname('0912345678')).toBe('digits');
    expect(validateNickname('Na2')).toBe('digits');
    expect(validateNickname('na@mail.com')).toBe('invalidChars');
    expect(validateNickname('Abcdefghijklm')).toBe('tooLong');
  });
});

describe('ProfileStore', () => {
  const input = { nickname: 'Bin', birthYear: 2021, avatarId: 'boy-straw' };

  it('tạo, lưu và tự tải lại hồ sơ gần nhất', async () => {
    const kv = new MemoryKV();
    const store = new ProfileStore(kv);
    const a = await store.create(input, NOW);
    const b = await store.create({ ...input, nickname: 'Na', avatarId: 'girl-bow' }, NOW);
    expect(typeof a).toBe('object');
    expect(typeof b).toBe('object');
    // "tải lại trang": store mới trên cùng kho dữ liệu
    const reloaded = new ProfileStore(kv);
    expect((await reloaded.list()).map((p) => p.nickname)).toEqual(['Bin', 'Na']);
    expect((await reloaded.getLastProfile())?.nickname).toBe('Na');
    await reloaded.setLastProfile((a as { id: string }).id);
    expect((await new ProfileStore(kv).getLastProfile())?.nickname).toBe('Bin');
  });

  it('chỉ lưu các trường cho phép', async () => {
    const kv = new MemoryKV();
    const store = new ProfileStore(kv);
    await store.create({ ...input, email: 'x@y.z', phone: '0900' } as never, NOW);
    const stored = (await kv.get<Record<string, unknown>[]>('profiles'))![0];
    expect(Object.keys(stored).sort()).toEqual(['avatarId', 'birthYear', 'createdAt', 'id', 'nickname']);
  });

  it('màu áo liền thân (giai đoạn 7): chỉ id màu hợp lệ, đổi được trong tủ đồ, không thêm dữ liệu cá nhân', async () => {
    const kv = new MemoryKV();
    const store = new ProfileStore(kv);
    const p = (await store.create({ ...input, onesie: 'mint' }, NOW)) as { id: string };
    expect((await store.get(p.id))?.onesie).toBe('mint');
    expect(await store.setOnesie(p.id, 'pink')).toBe(true);
    expect(await store.setOnesie(p.id, 'gold-diamond')).toBe(false);
    expect((await new ProfileStore(kv).get(p.id))?.onesie).toBe('pink');
    const stored = (await kv.get<Record<string, unknown>[]>('profiles'))![0];
    expect(Object.keys(stored).sort()).toEqual(['avatarId', 'birthYear', 'createdAt', 'id', 'nickname', 'onesie']);
    expect(sanitizeProfile({ ...stored, onesie: 'http://x' })).not.toHaveProperty('onesie');
  });

  it('loại trường lạ khi đọc', () => {
    const p = sanitizeProfile({ id: '1', nickname: 'Bin', birthYear: 2021, avatarId: 'boy-cap', createdAt: 1, email: 'a@b.c' });
    expect(p).not.toHaveProperty('email');
  });

  it('từ chối dữ liệu không hợp lệ', async () => {
    const store = new ProfileStore(new MemoryKV());
    expect(await store.create({ ...input, birthYear: 2010 }, NOW)).toBe('birthYear');
    expect(await store.create({ ...input, avatarId: 'robot' }, NOW)).toBe('avatar');
    expect(await store.create({ ...input, nickname: '123' }, NOW)).toBe('digits');
  });

  it(`tối đa ${MAX_PROFILES} hồ sơ`, async () => {
    const store = new ProfileStore(new MemoryKV());
    for (let i = 0; i < MAX_PROFILES; i++) {
      expect(typeof (await store.create(input, NOW))).toBe('object');
    }
    expect(await store.create(input, NOW)).toBe('full');
  });

  it('mặc định bật nhạc, nhớ trạng thái', async () => {
    const kv = new MemoryKV();
    expect((await new ProfileStore(kv).getMeta()).musicOn).toBe(true);
    await new ProfileStore(kv).setMeta({ musicOn: false });
    expect((await new ProfileStore(kv).getMeta()).musicOn).toBe(false);
  });
});
