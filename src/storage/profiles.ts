/**
 * Hồ sơ bé. Chỉ lưu biệt danh + năm sinh + dữ liệu kỹ thuật không định danh (CLAUDE.md A5).
 */
import { type AgeGroup, selectableBirthYears } from '../config/ageRules';
import { getCharacter, ONESIE_IDS } from '../content/characters';
import type { KV } from './kv';

export interface ChildProfile {
  id: string;
  nickname: string;
  birthYear: number;
  avatarId: string;
  /** Màu áo liền thân (id trong ONESIES) — chỉ là lựa chọn trang phục, không định danh. */
  onesie?: string;
  ageGroupOverride?: AgeGroup;
  createdAt: number;
}

export interface AppMeta {
  lastProfileId?: string;
  musicOn: boolean;
}

export const MAX_PROFILES = 4;
export const NICKNAME_MAX = 12;
const PROFILES_KEY = 'profiles';
const META_KEY = 'meta';
const AGE_GROUPS: readonly AgeGroup[] = ['2-3', '4-5', '6-8'];

export type NicknameError = 'empty' | 'tooLong' | 'digits' | 'invalidChars';

/** Chuẩn hóa: bỏ khoảng trắng thừa, chuẩn Unicode NFC (dấu tiếng Việt). */
export function normalizeNickname(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function validateNickname(raw: string): NicknameError | null {
  const n = normalizeNickname(raw);
  if (n.length === 0) return 'empty';
  if (/\p{Nd}/u.test(n)) return 'digits'; // chặn số điện thoại / số bất kỳ
  if (!/^[\p{L}\p{M}][\p{L}\p{M} '-]*$/u.test(n)) return 'invalidChars'; // chặn @, ., ký tự lạ
  if (Array.from(n).length > NICKNAME_MAX) return 'tooLong';
  return null;
}

export const NICKNAME_ERROR_VI: Record<NicknameError, string> = {
  empty: 'Bố mẹ nhập biệt danh cho bé nhé.',
  tooLong: `Biệt danh ngắn thôi nhé (tối đa ${NICKNAME_MAX} chữ).`,
  digits: 'Biệt danh không dùng chữ số.',
  invalidChars: 'Biệt danh chỉ gồm chữ cái và khoảng trắng.',
};

export function isValidBirthYear(year: number, now: Date = new Date()): boolean {
  return Number.isInteger(year) && selectableBirthYears(now).includes(year);
}

export interface NewProfileInput {
  nickname: string;
  birthYear: number;
  avatarId: string;
  onesie?: string;
}

export type CreateError = NicknameError | 'birthYear' | 'avatar' | 'full';

function randomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Lọc qua danh sách trường cho phép — trường lạ bị loại bỏ. */
export function sanitizeProfile(raw: unknown): ChildProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.nickname !== 'string') return null;
  if (typeof r.birthYear !== 'number' || typeof r.avatarId !== 'string') return null;
  if (validateNickname(r.nickname) !== null || !getCharacter(r.avatarId)) return null;
  const p: ChildProfile = {
    id: r.id,
    nickname: normalizeNickname(r.nickname),
    birthYear: r.birthYear,
    avatarId: r.avatarId,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
  };
  if (typeof r.onesie === 'string' && ONESIE_IDS.includes(r.onesie)) p.onesie = r.onesie;
  if (typeof r.ageGroupOverride === 'string' && AGE_GROUPS.includes(r.ageGroupOverride as AgeGroup)) {
    p.ageGroupOverride = r.ageGroupOverride as AgeGroup;
  }
  return p;
}

export class ProfileStore {
  constructor(private kv: KV) {}

  async list(): Promise<ChildProfile[]> {
    const raw = await this.kv.get<unknown[]>(PROFILES_KEY);
    if (!Array.isArray(raw)) return [];
    return raw.map(sanitizeProfile).filter((p): p is ChildProfile => p !== null);
  }

  async get(id: string): Promise<ChildProfile | undefined> {
    return (await this.list()).find((p) => p.id === id);
  }

  async create(input: NewProfileInput, now: Date = new Date()): Promise<ChildProfile | CreateError> {
    const nickErr = validateNickname(input.nickname);
    if (nickErr) return nickErr;
    if (!isValidBirthYear(input.birthYear, now)) return 'birthYear';
    if (!getCharacter(input.avatarId)) return 'avatar';
    const profiles = await this.list();
    if (profiles.length >= MAX_PROFILES) return 'full';
    const profile: ChildProfile = {
      id: randomId(),
      nickname: normalizeNickname(input.nickname),
      birthYear: input.birthYear,
      avatarId: input.avatarId,
      createdAt: now.getTime(),
    };
    if (input.onesie && ONESIE_IDS.includes(input.onesie)) profile.onesie = input.onesie;
    await this.kv.set(PROFILES_KEY, [...profiles, profile]);
    await this.setLastProfile(profile.id);
    return profile;
  }

  /** Đổi màu áo liền thân (tủ quần áo). Chỉ trường này được sửa. */
  async setOnesie(id: string, onesie: string): Promise<boolean> {
    if (!ONESIE_IDS.includes(onesie)) return false;
    const profiles = await this.list();
    const p = profiles.find((x) => x.id === id);
    if (!p) return false;
    p.onesie = onesie;
    await this.kv.set(PROFILES_KEY, profiles);
    return true;
  }

  async getMeta(): Promise<AppMeta> {
    const m = await this.kv.get<Partial<AppMeta>>(META_KEY);
    return {
      lastProfileId: typeof m?.lastProfileId === 'string' ? m.lastProfileId : undefined,
      musicOn: typeof m?.musicOn === 'boolean' ? m.musicOn : true,
    };
  }

  async setMeta(patch: Partial<AppMeta>): Promise<void> {
    await this.kv.set(META_KEY, { ...(await this.getMeta()), ...patch });
  }

  async setLastProfile(id: string): Promise<void> {
    await this.setMeta({ lastProfileId: id });
  }

  /** Hồ sơ chơi gần nhất; nếu không còn thì lấy hồ sơ đầu tiên. */
  async getLastProfile(): Promise<ChildProfile | undefined> {
    const [profiles, meta] = await Promise.all([this.list(), this.getMeta()]);
    return profiles.find((p) => p.id === meta.lastProfileId) ?? profiles[0];
  }
}
