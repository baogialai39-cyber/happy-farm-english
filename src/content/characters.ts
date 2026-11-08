/** Bộ nhân vật hoạt hình có sẵn. Hồ sơ chỉ lưu `id` (avatarId). */

export type CharacterKind = 'boy' | 'girl';
export type HairStyle = 'short' | 'spiky' | 'curly' | 'pigtails' | 'bun' | 'bob';
export type HatStyle = 'straw' | 'cap' | 'none' | 'bow' | 'flower';

export interface CharacterDef {
  id: string;
  kind: CharacterKind;
  label: string; // tên hiển thị tiếng Anh, ngắn
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  hat: HatStyle;
  hatColor: string;
  outfit: string; // màu áo liền thân mặc định
  shirt: string;
}

export const CHARACTERS: readonly CharacterDef[] = [
  { id: 'boy-straw', kind: 'boy', label: 'Sunny', skin: '#F6D3B3', hair: '#7A4E2D', hairStyle: 'short', hat: 'straw', hatColor: '#F4D58D', outfit: '#8EC5FC', shirt: '#FFF3B0' },
  { id: 'boy-cap', kind: 'boy', label: 'Leo', skin: '#E2B48F', hair: '#2F2A28', hairStyle: 'spiky', hat: 'cap', hatColor: '#FFADAD', outfit: '#A0E7A0', shirt: '#FFFFFF' },
  { id: 'boy-curly', kind: 'boy', label: 'Milo', skin: '#B9825C', hair: '#3B2416', hairStyle: 'curly', hat: 'none', hatColor: '#000000', outfit: '#FFC8A2', shirt: '#CDE7FF' },
  { id: 'girl-bow', kind: 'girl', label: 'Lily', skin: '#F8D9C0', hair: '#8B5A3C', hairStyle: 'pigtails', hat: 'bow', hatColor: '#FF9CC2', outfit: '#FFB5D0', shirt: '#FFFFFF' },
  { id: 'girl-flower', kind: 'girl', label: 'Daisy', skin: '#E6BC98', hair: '#F2C46D', hairStyle: 'bun', hat: 'flower', hatColor: '#FFF07A', outfit: '#C3B1E1', shirt: '#FFF6E5' },
  { id: 'girl-straw', kind: 'girl', label: 'Rosa', skin: '#A8714F', hair: '#24160F', hairStyle: 'bob', hat: 'straw', hatColor: '#F4D58D', outfit: '#9EE6CF', shirt: '#FFE3EE' },
];

export function getCharacter(id: string): CharacterDef | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function charactersOfKind(kind: CharacterKind): CharacterDef[] {
  return CHARACTERS.filter((c) => c.kind === kind);
}

/** 8 màu áo liền thân (SPEC 18.2). Hồ sơ chỉ lưu `onesie` = id màu (không phải thông tin cá nhân). */
export interface OnesieColor { id: string; color: string; en: string; vi: string }
export const ONESIES: readonly OnesieColor[] = [
  { id: 'sky', color: '#7EC8F7', en: 'Blue', vi: 'Xanh dương' },
  { id: 'pink', color: '#FF9EC4', en: 'Pink', vi: 'Hồng' },
  { id: 'mint', color: '#8EDDB8', en: 'Green', vi: 'Xanh lá' },
  { id: 'sun', color: '#FFD45E', en: 'Yellow', vi: 'Vàng' },
  { id: 'lilac', color: '#C3A8F0', en: 'Purple', vi: 'Tím' },
  { id: 'peach', color: '#FFB27A', en: 'Orange', vi: 'Cam' },
  { id: 'red', color: '#FF7A7A', en: 'Red', vi: 'Đỏ' },
  { id: 'cream', color: '#F3E6CF', en: 'White', vi: 'Trắng kem' },
];
export const ONESIE_IDS = ONESIES.map((o) => o.id);

/** Nhân vật mặc màu áo đã chọn (không có/không hợp lệ → màu mặc định của nhân vật). */
export function withOnesie(c: CharacterDef, onesie?: string): CharacterDef {
  const o = ONESIES.find((x) => x.id === onesie);
  return o ? { ...c, outfit: o.color } : c;
}
