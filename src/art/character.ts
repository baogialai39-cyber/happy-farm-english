/** Vẽ nhân vật em bé áo liền thân kiểu 3D mềm bằng SVG (không dùng ảnh) — SPEC 18.2. */
import type { CharacterDef } from '../content/characters';
import { ACCESSORY_BY_ID, type AccessorySlot } from '../content/items';
import { blob3d, nextUid, shade } from './color';

function hairShape(c: CharacterDef, fill: string): string {
  const cap = `<path d="M40 100 Q38 36 100 34 Q162 36 160 100 Q150 70 112 66 Q84 64 66 74 Q50 84 40 100Z" fill="${fill}"/>`;
  switch (c.hairStyle) {
    case 'short':
      return cap;
    case 'spiky':
      return `<path d="M40 100 Q36 50 58 44 L62 26 L78 40 L90 20 L104 38 L120 22 L128 42 L146 32 L144 52 Q164 66 160 100 Q150 70 112 66 Q80 64 62 76 Q48 86 40 100Z" fill="${fill}"/>`;
    case 'curly': {
      const pts = [
        [50, 80], [56, 56], [74, 40], [98, 34], [122, 38], [142, 52], [150, 76], [64, 66], [88, 52], [114, 52], [134, 66],
      ];
      return pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${fill}"/>`).join('');
    }
    case 'pigtails':
      return `<circle cx="34" cy="118" r="22" fill="${fill}"/><circle cx="166" cy="118" r="22" fill="${fill}"/>${cap}`;
    case 'bun':
      return `<circle cx="100" cy="30" r="24" fill="${fill}"/>${cap}`;
    case 'bob':
      return `<path d="M36 140 Q26 40 100 34 Q174 40 164 140 Q156 128 152 100 Q140 72 104 68 Q70 68 52 90 Q46 112 48 128 Q42 136 36 140Z" fill="${fill}"/>`;
  }
}

function hatShape(c: CharacterDef, u: string): string {
  const hc = c.hatColor;
  switch (c.hat) {
    case 'none':
      return '';
    case 'straw':
      return `<ellipse cx="100" cy="58" rx="86" ry="20" fill="url(#${u}hat)"/>
        <path d="M58 58 Q60 14 100 14 Q140 14 142 58 Z" fill="url(#${u}hat)"/>
        <path d="M60 50 Q100 60 140 50 L141 58 Q100 68 59 58Z" fill="#FF8FA3"/>
        <ellipse cx="84" cy="28" rx="14" ry="7" fill="#fff" opacity=".35"/>`;
    case 'cap':
      return `<path d="M44 74 Q44 22 100 20 Q156 22 156 74 Q100 60 44 74Z" fill="url(#${u}hat)"/>
        <path d="M120 66 Q176 58 186 76 Q170 84 128 78Z" fill="${shade(hc, -0.15)}"/>
        <circle cx="100" cy="22" r="7" fill="${shade(hc, -0.2)}"/>
        <ellipse cx="78" cy="38" rx="16" ry="8" fill="#fff" opacity=".35"/>`;
    case 'bow':
      return `<g transform="translate(140 44) rotate(18)">
        <path d="M0 0 L-30 -18 Q-36 0 -30 18Z" fill="url(#${u}hat)"/>
        <path d="M0 0 L30 -18 Q36 0 30 18Z" fill="url(#${u}hat)"/>
        <circle r="9" fill="${shade(hc, -0.15)}"/></g>`;
    case 'flower': {
      const petals = [0, 72, 144, 216, 288]
        .map((a) => `<ellipse rx="10" ry="15" transform="rotate(${a}) translate(0 -13)" fill="#fff"/>`)
        .join('');
      return `<g transform="translate(132 30)">${petals}<circle r="9" fill="url(#${u}hat)"/></g>`;
    }
  }
}

/** Phụ kiện vẽ chồng lên nhân vật (SPEC 13.4). Phụ kiện đầu thay mũ gốc. */
export type AccessoryLayer = Partial<Record<AccessorySlot, string>>;

function accessorySvg(id: string): string {
  switch (id) {
    case 'sunglasses':
      return `<g><rect x="60" y="92" width="34" height="24" rx="10" fill="#3A2B35"/><rect x="106" y="92" width="34" height="24" rx="10" fill="#3A2B35"/>
        <path d="M94 100 h12" stroke="#3A2B35" stroke-width="5"/><rect x="66" y="96" width="10" height="5" rx="2" fill="#fff" opacity=".6"/><rect x="112" y="96" width="10" height="5" rx="2" fill="#fff" opacity=".6"/></g>`;
    case 'bow-tie':
      return `<g transform="translate(100 150)"><path d="M0 0 L-24 -13 Q-28 0 -24 13Z M0 0 L24 -13 Q28 0 24 13Z" fill="#FF7FA8"/><circle r="7" fill="#E25E8C"/></g>`;
    case 'scarf':
      return `<g><rect x="58" y="140" width="84" height="20" rx="10" fill="#FF9B85"/><path d="M118 152 l10 34 l-16 0z" fill="#FF8A73"/>
        <path d="M70 142 v16 M84 142 v16 M98 142 v16" stroke="#fff" stroke-width="4" opacity=".6"/></g>`;
    case 'party-hat':
      return `<g><path d="M100 -4 L74 52 Q100 62 126 52Z" fill="#8EC5FC"/><path d="M90 18 L112 22 M84 34 L118 38" stroke="#FFD36E" stroke-width="7" stroke-linecap="round"/>
        <circle cx="100" cy="-6" r="10" fill="#FF8FAB"/></g>`;
    case 'flower-crown': {
      const fl = [52, 72, 100, 128, 148].map((x, i) => {
        const y = i === 2 ? 34 : i === 1 || i === 3 ? 40 : 54;
        const col = ['#FF9CC2', '#FFD36E', '#FFFFFF', '#C3B1E1', '#9EE6CF'][i];
        return `<g transform="translate(${x} ${y})"><circle cx="-6" r="7" fill="${col}"/><circle cx="6" r="7" fill="${col}"/><circle cy="-6" r="7" fill="${col}"/><circle cy="6" r="7" fill="${col}"/><circle r="4.5" fill="#FFB347"/></g>`;
      });
      return `<g><path d="M48 58 Q100 22 152 58" fill="none" stroke="#7BC67B" stroke-width="6"/>${fl.join('')}</g>`;
    }
    case 'cap':
    case 'sun-hat':
    case 'top-hat':
    case 'round-glasses':
    case 'heart-glasses':
    case 'star-glasses':
      return styledAccessory(id);
    case 'crown':
      return `<g><path d="M66 46 L60 8 L82 28 L100 0 L118 28 L140 8 L134 46Z" fill="#FFD36E" stroke="#F2B63C" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="100" cy="30" r="6" fill="#FF8FAB"/><circle cx="78" cy="36" r="4.5" fill="#8EC5FC"/><circle cx="122" cy="36" r="4.5" fill="#8EC5FC"/></g>`;
  }
  return '';
}

function styledAccessory(id: string): string {
  const a = ACCESSORY_BY_ID.get(id);
  if (!a) return '';
  const col = a.color ?? '#8EC5FC';
  switch (a.style) {
    case 'cap':
      return `<g><path d="M44 74 Q44 22 100 20 Q156 22 156 74 Q100 60 44 74Z" fill="${col}"/>
        <path d="M120 66 Q176 58 186 76 Q170 84 128 78Z" fill="${shade(col, -0.18)}"/>
        <circle cx="100" cy="22" r="7" fill="${shade(col, -0.25)}"/><ellipse cx="78" cy="38" rx="16" ry="8" fill="#fff" opacity=".35"/></g>`;
    case 'sunhat':
      return `<g><ellipse cx="100" cy="58" rx="92" ry="22" fill="${col}"/><path d="M58 58 Q60 12 100 12 Q140 12 142 58 Z" fill="${shade(col, 0.2)}"/>
        <path d="M60 48 Q100 58 140 48 L141 57 Q100 67 59 57Z" fill="#FF7FA8"/>
        <g transform="translate(138 48)"><circle cx="-6" r="7" fill="#fff"/><circle cx="6" r="7" fill="#fff"/><circle cy="-6" r="7" fill="#fff"/><circle cy="6" r="7" fill="#fff"/><circle r="4.5" fill="#FFD36E"/></g></g>`;
    case 'tophat':
      return `<g><ellipse cx="100" cy="54" rx="62" ry="12" fill="${col}"/><rect x="66" y="-6" width="68" height="60" rx="10" fill="${col}"/>
        <rect x="66" y="34" width="68" height="12" fill="#FF8FAB"/><rect x="76" y="2" width="12" height="28" rx="6" fill="#fff" opacity=".18"/></g>`;
    case 'round':
      return `<g fill="none" stroke="#6D4C41" stroke-width="5"><circle cx="78" cy="104" r="16"/><circle cx="122" cy="104" r="16"/><path d="M94 102 h12"/></g>`;
    case 'starglasses': {
      const star = (x: number) => `<path transform="translate(${x} 104)" d="M0 -17 L5 -6 L17 -5 L8 3 L11 15 L0 9 L-11 15 L-8 3 L-17 -5 L-5 -6Z" fill="${col}" stroke="#F2B63C" stroke-width="3" stroke-linejoin="round"/>`;
      return `<g>${star(78)}${star(122)}<path d="M94 102 h12" stroke="#F2B63C" stroke-width="5"/></g>`;
    }
    case 'heart': {
      const heart = (x: number) => `<path d="M${x} 116 C${x - 26} 100 ${x - 16} 84 ${x} 96 C${x + 16} 84 ${x + 26} 100 ${x} 116Z" fill="${col}" stroke="#fff" stroke-width="3"/>`;
      return `<g>${heart(78)}${heart(122)}<path d="M94 102 h12" stroke="${col}" stroke-width="5"/></g>`;
    }
  }
  return '';
}

/** Hoa văn trên áo (vẽ trong vùng thân). */
function shirtPattern(id: string | undefined): string {
  const a = id ? ACCESSORY_BY_ID.get(id) : undefined;
  if (a?.style === 'stripes') return `<g clip-path="none"><rect x="60" y="152" width="80" height="7" rx="3" fill="#fff" opacity=".85"/><rect x="58" y="166" width="10" height="7" rx="3" fill="#fff" opacity=".85"/><rect x="132" y="166" width="10" height="7" rx="3" fill="#fff" opacity=".85"/></g>`;
  if (a?.style === 'rainbow') {
    const cols = ['#FF8A8A', '#FFB86B', '#FFE07A', '#8FD9A8', '#8EC5FC', '#C3B1E1'];
    return `<g>${cols.map((c, i) => `<rect x="58" y="${148 + i * 7}" width="84" height="7" fill="${c}"/>`).join('')}</g>`;
  }
  if (a?.style === 'star') return `<path d="M100 150 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#fff" opacity=".9"/>`;
  return '';
}

/** Ba lô: vẽ SAU thân (lộ hai bên) + quai đeo vẽ TRƯỚC thân. */
function backpackBehind(id: string | undefined): string {
  const a = id ? ACCESSORY_BY_ID.get(id) : undefined;
  if (!a) return '';
  const col = a.color ?? '#FF8A8A';
  if (a.style === 'cape') {
    return `<g><path d="M60 146 Q100 136 140 146 L168 232 Q100 246 32 232 Z" fill="${col}"/><path d="M60 146 Q100 136 140 146 L150 170 Q100 160 50 170Z" fill="${shade(col, -0.15)}"/>
      <path transform="translate(100 210)" d="M0 -12 L4 -4 L12 -3 L6 2 L8 11 L0 6 L-8 11 L-6 2 L-12 -3 L-4 -4Z" fill="#FFD84D"/></g>`;
  }
  const ears = a.style === 'bunny'
    ? `<ellipse cx="40" cy="128" rx="9" ry="20" fill="${col}" transform="rotate(-18 40 128)"/><ellipse cx="160" cy="128" rx="9" ry="20" fill="${col}" transform="rotate(18 160 128)"/>
       <ellipse cx="40" cy="130" rx="4" ry="12" fill="#FF9CC2" transform="rotate(-18 40 130)"/><ellipse cx="160" cy="130" rx="4" ry="12" fill="#FF9CC2" transform="rotate(18 160 130)"/>`
    : '';
  return `<g>${ears}<rect x="34" y="146" width="132" height="74" rx="26" fill="${col}"/><rect x="34" y="190" width="132" height="22" rx="10" fill="${shade(col, -0.15)}"/></g>`;
}
function backpackStraps(id: string | undefined): string {
  const a = id ? ACCESSORY_BY_ID.get(id) : undefined;
  if (!a) return '';
  const col = shade(a.color ?? '#FF8A8A', -0.2);
  return `<path d="M62 150 Q60 172 64 196 M138 150 Q140 172 136 196" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
}

/** Giày (chỉ vẽ khi cần chân, VD gương thử đồ). Màu mặc định: nâu. */
export function shoeLook(acc: AccessoryLayer): { color: string; boots: boolean } {
  const a = acc.feet ? ACCESSORY_BY_ID.get(acc.feet) : undefined;
  return { color: a?.color ?? '#7A5A4C', boots: a?.style === 'boots' };
}
function feetSvg(acc: AccessoryLayer): string {
  const { color, boots } = shoeLook(acc);
  const shoe = (x: number) => boots
    ? `<rect x="${x - 13}" y="214" width="26" height="24" rx="8" fill="${color}"/><ellipse cx="${x}" cy="236" rx="16" ry="6" fill="${shade(color, -0.2)}"/>`
    : `<ellipse cx="${x}" cy="232" rx="16" ry="9" fill="${color}"/><ellipse cx="${x - 4}" cy="229" rx="6" ry="3" fill="#fff" opacity=".45"/>`;
  return `<g>${shoe(80)}${shoe(120)}</g>`;
}

/** Khung cao hơn để chứa vương miện / mũ tiệc (dùng trong thế giới game). Tỉ lệ 200 : 254. */
export const CHAR_VIEWBOX_TALL = '0 -14 200 254';

export type Expression = 'normal' | 'happy' | 'surprised';

/** Màu tay/chân (để canvas vẽ tay chân chuyển động khớp với hình — SPEC 18.2). */
export function bodyColors(c: CharacterDef, acc: AccessoryLayer = {}): { sleeve: string; skin: string; leg: string; foot: string; boots: boolean } {
  const top = (acc.body && ACCESSORY_BY_ID.get(acc.body)?.color) || c.outfit;
  const leg = (acc.legs && ACCESSORY_BY_ID.get(acc.legs)?.color) || c.outfit;
  const shoe = shoeLook(acc);
  return { sleeve: top, skin: c.skin, leg, foot: acc.feet ? shoe.color : shade(c.outfit, -0.18), boots: shoe.boots };
}

/** Mắt to tròn long lanh (2 điểm sáng) theo biểu cảm. */
function eyesSvg(c: CharacterDef, expr: Expression, u: string): string {
  const lash = c.kind === 'girl';
  if (expr === 'happy') {
    return [76, 124].map((x) => `<path d="M${x - 12} 108 Q${x} 92 ${x + 12} 108" fill="none" stroke="#3A2B35" stroke-width="5.5" stroke-linecap="round"/>`).join('');
  }
  const big = expr === 'surprised';
  const rx = big ? 13 : 12, ry = big ? 16 : 14;
  return [76, 124].map((x) => `
    <ellipse cx="${x}" cy="106" rx="${rx}" ry="${ry}" fill="#2B1D24"/>
    <ellipse cx="${x}" cy="108" rx="${rx - 3}" ry="${ry - 3}" fill="url(#${u}iris)"/>
    <ellipse cx="${x}" cy="109" rx="${rx - 7}" ry="${ry - 7}" fill="#1E1418"/>
    <circle cx="${x + 4}" cy="100" r="${big ? 5 : 4.6}" fill="#fff"/>
    <circle cx="${x - 4}" cy="113" r="2.2" fill="#fff" opacity=".85"/>
    ${lash ? `<path d="M${x + (x < 100 ? -11 : 11)} 98 l${x < 100 ? -6 : 6} -5" stroke="#2B1D24" stroke-width="3" stroke-linecap="round"/>` : ''}`).join('')
    + (big ? `<path d="M64 84 Q76 76 88 84 M112 84 Q124 76 136 84" fill="none" stroke="${shade(c.hair, 0.1)}" stroke-width="4" stroke-linecap="round"/>` : '');
}

function mouthSvg(expr: Expression): string {
  if (expr === 'happy') return `<path d="M84 124 Q100 148 116 124 Q100 130 84 124Z" fill="#B23A56"/><path d="M92 136 Q100 142 108 136 Q100 132 92 136Z" fill="#FF8FA3"/>`;
  if (expr === 'surprised') return `<ellipse cx="100" cy="132" rx="8" ry="10" fill="#B23A56"/><ellipse cx="100" cy="136" rx="5" ry="4" fill="#FF8FA3"/>`;
  return `<path d="M88 126 Q100 139 112 126" fill="none" stroke="#3A2B35" stroke-width="5" stroke-linecap="round"/>`;
}

/** Tay (ống tay áo + bàn tay) và chân (ống quần + bàn chân) cho hình tĩnh. */
function staticLimbs(c: CharacterDef, acc: AccessoryLayer, u: string, expr: Expression, shoes: boolean): { back: string; front: string } {
  const col = bodyColors(c, acc);
  const up = expr === 'happy';
  const arm = (side: -1 | 1) => {
    const sx = 100 + side * 34, sy = 152;
    const hx = up ? 100 + side * 62 : 100 + side * 50, hy = up ? 112 : 196;
    return `<path d="M${sx} ${sy} L${hx} ${hy}" stroke="${shade(col.sleeve, -0.25)}" stroke-width="25" stroke-linecap="round"/>
      <path d="M${sx} ${sy} L${hx} ${hy}" stroke="${col.sleeve}" stroke-width="21" stroke-linecap="round"/>
      <circle cx="${hx}" cy="${hy + (up ? -4 : 4)}" r="11" fill="url(#${u}skin)" stroke="${shade(c.skin, -0.25)}" stroke-width="1.5"/>`;
  };
  const leg = (side: -1 | 1) => {
    const x = 100 + side * 16;
    const foot = shoes ? '' : `<ellipse cx="${x + side * 2}" cy="228" rx="15" ry="9" fill="${col.foot}"/><ellipse cx="${x - 2}" cy="225" rx="6" ry="3" fill="#fff" opacity=".35"/>`;
    return `<path d="M${x} 196 L${x} 222" stroke="${shade(col.leg, -0.25)}" stroke-width="29" stroke-linecap="round"/><path d="M${x} 196 L${x} 222" stroke="${col.leg}" stroke-width="25" stroke-linecap="round"/>${foot}`;
  };
  return { back: leg(-1) + leg(1), front: arm(-1) + arm(1) };
}

export interface CharacterOpts { feet?: boolean; limbs?: boolean; expr?: Expression }

/**
 * Em bé mặc áo liền thân (SPEC 18.2). portrait = chỉ khung đầu (avatar tròn). acc = phụ kiện đang đeo.
 * limbs=false → không vẽ tay chân (canvas tự vẽ tay chân chuyển động). Cùng một hàm cho mọi màn hình.
 */
export function characterSvg(
  c: CharacterDef, extraClass = '', portrait = false, acc: AccessoryLayer = {}, pixelSize?: { w: number; h: number }, opts: CharacterOpts = {},
): string {
  const u = nextUid('ch');
  const expr = opts.expr ?? 'normal';
  const limbs = opts.limbs ?? true;
  const top = (acc.body && ACCESSORY_BY_ID.get(acc.body)?.color) || c.outfit;
  const onesie = c.outfit;
  const skinDark = shade(c.skin, -0.12);
  const size = pixelSize ? ` width="${pixelSize.w}" height="${pixelSize.h}"` : '';
  const ns = pixelSize ? ` xmlns="${'http'}://www.w3.org/2000/svg"` : ''; // cần khi vẽ SVG thành ảnh cho canvas (namespace, không phải link)
  const lim = limbs ? staticLimbs(c, acc, u, expr, !!opts.feet) : { back: '', front: '' };
  const tee = acc.body
    ? `<path d="M64 150 Q62 140 76 136 H124 Q138 140 136 150 L139 178 Q100 186 61 178 Z" fill="url(#${u}shirt)"/>`
    : '';
  return `<svg${ns}${size} class="character ${extraClass}" viewBox="${portrait ? '14 0 172 172' : pixelSize || acc.head || opts.feet ? CHAR_VIEWBOX_TALL : '0 0 200 240'}" role="img" aria-label="${c.label}">
  <defs>
    ${blob3d(`${u}skin`, c.skin, 0.4, -0.12)}
    ${blob3d(`${u}hair`, c.hair, 0.3, -0.25)}
    ${blob3d(`${u}outfit`, onesie, 0.35, -0.2)}
    ${blob3d(`${u}shirt`, top, 0.3, -0.12)}
    ${blob3d(`${u}hat`, c.hatColor, 0.4, -0.2)}
    <radialGradient id="${u}iris" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#A8744F"/><stop offset="1" stop-color="#4A2E22"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="232" rx="56" ry="8" fill="#5b4a6b" opacity=".14"/>
  ${opts.feet ? feetSvg(acc) : ''}
  ${lim.back}
  ${backpackBehind(acc.back)}
  <!-- áo liền thân -->
  <path d="M64 150 Q62 140 76 136 H124 Q138 140 136 150 L142 194 Q142 214 120 214 H80 Q58 214 58 194 Z" fill="url(#${u}outfit)" stroke="${shade(onesie, -0.3)}" stroke-width="2"/>
  <ellipse cx="100" cy="188" rx="24" ry="18" fill="#fff" opacity=".28"/>
  ${tee}
  ${shirtPattern(acc.body)}
  <path d="M100 142 V176" stroke="${shade(top, -0.28)}" stroke-width="3" stroke-dasharray="3 3"/>
  <rect x="96" y="150" width="8" height="12" rx="3" fill="#F5F5F5" stroke="${shade(top, -0.3)}" stroke-width="1.5"/>
  <path d="M76 140 Q100 156 124 140" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".85"/>
  <circle cx="86" cy="205" r="3.5" fill="#fff" opacity=".8"/><circle cx="114" cy="205" r="3.5" fill="#fff" opacity=".8"/>
  ${lim.front}
  ${backpackStraps(acc.back)}
  <!-- đầu -->
  <circle cx="42" cy="104" r="13" fill="${skinDark}"/>
  <circle cx="158" cy="104" r="13" fill="${skinDark}"/>
  <circle cx="100" cy="98" r="60" fill="url(#${u}skin)"/>
  <g>${hairShape(c, `url(#${u}hair)`)}</g>
  <!-- mặt: mắt to long lanh, má hồng -->
  ${eyesSvg(c, expr, u)}
  <ellipse cx="100" cy="119" rx="4" ry="3" fill="${skinDark}"/>
  <ellipse cx="60" cy="126" rx="11" ry="7" fill="#FF8FA3" opacity=".5"/>
  <ellipse cx="140" cy="126" rx="11" ry="7" fill="#FF8FA3" opacity=".5"/>
  ${mouthSvg(expr)}
  <ellipse cx="80" cy="66" rx="18" ry="9" fill="#fff" opacity=".18"/>
  ${acc.neck ? accessorySvg(acc.neck) : ''}
  ${acc.face ? accessorySvg(acc.face) : ''}
  ${acc.head ? accessorySvg(acc.head) : hatShape(c, u)}
</svg>`;
}
