/**
 * Bộ công cụ vẽ SVG "3D gần thực tế" (SPEC 18.1): gradient khối, ánh sáng trên-trái, viền tối nhẹ cho rõ nét.
 */
import { SVG_NS } from '../../ui/dom';
import { nextUid, shade } from '../color';

export { shade };

export class Art {
  readonly u: string;
  private defs: string[] = [];
  private n = 0;
  constructor(prefix: string) {
    this.u = nextUid(prefix);
  }

  /** Gradient tròn: sáng ở trên-trái → màu gốc → tối ở mép. Trả về `url(#…)`. */
  ball(base: string, light = 0.45, dark = -0.25, cx = '35%', cy = '30%'): string {
    const id = `${this.u}g${this.n++}`;
    this.defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="75%"><stop offset="0" stop-color="${shade(base, light)}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, dark)}"/></radialGradient>`);
    return `url(#${id})`;
  }

  /** Gradient thẳng (mặc định dọc trên → dưới). */
  lin(stops: [number, string][], x2 = 0, y2 = 1): string {
    const id = `${this.u}g${this.n++}`;
    this.defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`);
    return `url(#${id})`;
  }

  /** Mặt phẳng có chiều sâu: sáng trên, tối dưới. */
  side(base: string, light = 0.18, dark = -0.18): string {
    return this.lin([[0, shade(base, light)], [1, shade(base, dark)]]);
  }

  svg(viewBox: string, body: string, opts: { w?: number; h?: number; cls?: string; label?: string } = {}): string {
    const size = opts.w ? ` width="${opts.w}" height="${opts.h}"` : '';
    const label = opts.label ? ` role="img" aria-label="${opts.label}"` : ' aria-hidden="true"';
    return `<svg xmlns="${SVG_NS}"${size} class="${opts.cls ?? 'art'}" viewBox="${viewBox}"${label}><defs>${this.defs.join('')}</defs>${body}</svg>`;
  }
}

/** Viền tối nhẹ theo màu nền (rõ nét). */
export const edge = (base: string, w = 2.5) => `stroke="${shade(base, -0.38)}" stroke-width="${w}" stroke-linejoin="round"`;
/** Bóng đổ mềm dưới vật. */
export const groundShadow = (cx: number, cy: number, rx: number, ry: number, o = 0.18) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a2b35" opacity="${o}"/>`;
/** Điểm sáng bóng (ánh sáng trên-trái). */
export const shine = (cx: number, cy: number, rx: number, ry: number, rot = -25, o = 0.55) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity="${o}"/>`;
/** Mắt long lanh (con vật): tròng đen + 2 điểm sáng. */
export const eye = (cx: number, cy: number, r: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2B2024"/><circle cx="${cx + r * 0.35}" cy="${cy - r * 0.35}" r="${r * 0.38}" fill="#fff"/><circle cx="${cx - r * 0.3}" cy="${cy + r * 0.35}" r="${r * 0.16}" fill="#fff" opacity=".8"/>`;
