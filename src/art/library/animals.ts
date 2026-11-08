/**
 * 9 CON VẬT vẽ gần thực tế (SPEC 18.3): đúng tỉ lệ & đặc điểm nhận dạng, màu tươi, ánh sáng trên-trái.
 * viewBox 0 0 220 180, chân chạm đất ở y ≈ 168, con vật nhìn sang PHẢI.
 */
import { Art, edge, eye, groundShadow, shade, shine } from './kit';

export type AnimalArt = 'cow' | 'chicken' | 'duck' | 'pig' | 'sheep' | 'horse' | 'rabbit' | 'dog' | 'cat';
const VB = '0 0 220 180';

function leg(a: Art, x: number, top: number, w: number, c: string, hoof?: string): string {
  return `<rect x="${x}" y="${top}" width="${w}" height="${168 - top}" rx="${w / 2.4}" fill="${a.side(c)}" ${edge(c, 2)}/>` +
    (hoof ? `<rect x="${x - 1}" y="160" width="${w + 2}" height="9" rx="3" fill="${hoof}"/>` : '');
}

const DRAW: Record<AnimalArt, (a: Art) => string> = {
  cow(a) {
    const w = '#FAFAFA';
    return `${groundShadow(110, 170, 86, 8)}
      <path d="M36 82 Q22 110 28 140" stroke="#E0E0E0" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="28" cy="144" rx="6" ry="9" fill="#3E2723"/>
      ${leg(a, 52, 110, 18, '#E0E0E0', '#5D4037')}${leg(a, 132, 110, 18, '#E0E0E0', '#5D4037')}
      <ellipse cx="104" cy="92" rx="72" ry="44" fill="${a.ball(w, 0.2, -0.12)}" ${edge('#D0D0D0', 2.5)}/>
      <path d="M60 60 Q80 52 90 70 Q84 92 62 88 Q50 76 60 60Z M112 96 Q130 84 146 98 Q144 120 120 118 Q106 110 112 96Z M80 110 Q92 104 98 116 Q90 128 78 122Z" fill="#2B2B2B"/>
      <ellipse cx="108" cy="134" rx="16" ry="9" fill="${a.ball('#F8BBD0')}"/><circle cx="102" cy="142" r="2.5" fill="#F48FB1"/><circle cx="114" cy="142" r="2.5" fill="#F48FB1"/>
      ${leg(a, 66, 118, 18, w, '#5D4037')}${leg(a, 148, 118, 18, w, '#5D4037')}
      <path d="M160 62 Q172 46 190 52" stroke="#F5F5F5" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M170 44 q-6 -10 -2 -16 M194 44 q6 -10 2 -16" stroke="#EFE3C8" stroke-width="6" stroke-linecap="round" fill="none"/>
      <ellipse cx="160" cy="54" rx="13" ry="7" fill="${a.ball('#F5F5F5')}" transform="rotate(-20 160 54)" ${edge('#D0D0D0', 1.5)}/>
      <ellipse cx="204" cy="54" rx="13" ry="7" fill="${a.ball('#F5F5F5')}" transform="rotate(20 204 54)" ${edge('#D0D0D0', 1.5)}/>
      <path d="M166 50 Q182 38 198 50 Q206 70 200 88 Q182 100 166 88 Q160 70 166 50Z" fill="${a.ball(w, 0.15, -0.1)}" ${edge('#D0D0D0', 2)}/>
      <path d="M172 52 Q182 46 190 54 Q184 62 174 60Z" fill="#2B2B2B"/>
      <ellipse cx="184" cy="88" rx="20" ry="13" fill="${a.ball('#F8BBD0', 0.3, -0.15)}" ${edge('#F48FB1', 1.5)}/>
      <ellipse cx="177" cy="88" rx="3" ry="4" fill="#AD5A73"/><ellipse cx="191" cy="88" rx="3" ry="4" fill="#AD5A73"/>
      ${eye(174, 68, 5)}${eye(194, 68, 5)}`;
  },
  chicken(a) {
    const w = '#FFFDF7';
    return `${groundShadow(104, 170, 52, 7)}
      <path d="M90 140 L88 166 M88 166 l-10 2 M88 166 l8 3 M112 140 L114 166 M114 166 l-9 2 M114 166 l9 2" stroke="#FFA726" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M58 92 Q30 50 46 34 Q56 60 70 70 Q62 40 78 30 Q80 64 88 74Z" fill="${a.ball('#F5F0E6', 0.3, -0.15)}" ${edge('#D7CCC8', 2)}/>
      <ellipse cx="100" cy="110" rx="50" ry="40" fill="${a.ball(w, 0.2, -0.15)}" ${edge('#D7CCC8', 2.5)}/>
      <path d="M76 104 Q100 92 120 108 Q108 130 82 124 Z" fill="${a.ball('#F1EADB')}" ${edge('#D7CCC8', 1.5)}/>
      <path d="M84 112 q10 4 18 0 M86 118 q10 4 18 0" stroke="#D7CCC8" stroke-width="1.5" fill="none"/>
      <circle cx="140" cy="66" r="26" fill="${a.ball(w, 0.2, -0.15)}" ${edge('#D7CCC8', 2)}/>
      <path d="M126 46 q2 -14 10 -8 q4 -12 10 -2 q6 -10 10 2 q4 8 -6 10 h-22z" fill="${a.ball('#E53935')}" ${edge('#B71C1C', 1.5)}/>
      <path d="M164 64 l18 6 l-18 7z" fill="${a.ball('#FFC107')}" ${edge('#F57F17', 1.5)}/>
      <path d="M160 80 q8 4 4 16 q-10 -2 -8 -14z" fill="${a.ball('#E53935')}"/>
      ${eye(150, 60, 5)}`;
  },
  duck(a) {
    const w = '#FFFFFF';
    return `${groundShadow(104, 170, 58, 7)}
      <path d="M92 146 L90 162 M116 146 L118 162" stroke="#FF8F00" stroke-width="5"/>
      <path d="M78 160 L102 160 L90 168Z M106 160 L130 160 L118 168Z" fill="${a.ball('#FFA000')}"/>
      <path d="M30 96 Q40 80 60 92 L52 82 Q66 84 70 94" fill="${a.ball(w)}" ${edge('#CFD8DC', 1.5)}/>
      <path d="M40 104 Q60 72 120 82 Q160 92 160 116 Q154 148 104 150 Q52 150 40 104Z" fill="${a.ball(w, 0.15, -0.15)}" ${edge('#CFD8DC', 2.5)}/>
      <path d="M70 100 Q100 90 130 104 Q118 128 82 124 Z" fill="${a.ball('#F4F6F8')}" ${edge('#CFD8DC', 1.5)}/>
      <path d="M140 100 Q132 70 148 50" stroke="#FFFFFF" stroke-width="22" fill="none" stroke-linecap="round"/>
      <circle cx="152" cy="44" r="24" fill="${a.ball(w, 0.15, -0.12)}" ${edge('#CFD8DC', 2)}/>
      <path d="M170 46 Q196 44 198 54 Q192 62 170 58Z" fill="${a.ball('#FF8F00', 0.3, -0.2)}" ${edge('#E65100', 1.5)}/>
      <path d="M172 52 L196 54" stroke="#E65100" stroke-width="1.5"/>
      ${eye(158, 38, 4.5)}`;
  },
  pig(a) {
    const p = '#F8A5C2';
    return `${groundShadow(108, 170, 78, 8)}
      <path d="M34 88 q-14 -6 -10 8 q6 8 -4 12 q-8 4 -2 10" stroke="${shade(p, -0.1)}" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${leg(a, 52, 120, 18, shade(p, -0.08), '#AD5A73')}${leg(a, 132, 120, 18, shade(p, -0.08), '#AD5A73')}
      <ellipse cx="100" cy="100" rx="70" ry="44" fill="${a.ball(p, 0.3, -0.18)}" ${edge(p, 2.5)}/>
      ${leg(a, 70, 126, 18, p, '#AD5A73')}${leg(a, 144, 126, 18, p, '#AD5A73')}
      <circle cx="166" cy="82" r="36" fill="${a.ball(p, 0.3, -0.18)}" ${edge(p, 2)}/>
      <path d="M146 54 l-6 -24 l22 14z M180 50 l12 -22 l2 26z" fill="${a.ball(shade(p, -0.05))}" ${edge(p, 1.5)}/>
      <ellipse cx="196" cy="92" rx="16" ry="14" fill="${a.ball('#F48FB1', 0.3, -0.2)}" ${edge('#EC407A', 1.5)}/>
      <ellipse cx="191" cy="92" rx="3" ry="5" fill="#AD1457"/><ellipse cx="201" cy="92" rx="3" ry="5" fill="#AD1457"/>
      ${eye(162, 74, 5)}${eye(184, 72, 4.5)}
      <path d="M160 106 q8 6 16 0" stroke="#AD1457" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  },
  sheep(a) {
    const wool = '#FFFBF2';
    const puffs: [number, number, number][] = [[50, 98, 26], [72, 76, 28], [102, 70, 28], [132, 78, 26], [146, 104, 24], [124, 124, 26], [92, 128, 26], [62, 120, 24], [98, 100, 30]];
    return `${groundShadow(104, 170, 72, 8)}
      ${leg(a, 62, 124, 13, '#5D4F55', '#3E2F35')}${leg(a, 84, 128, 13, '#5D4F55', '#3E2F35')}${leg(a, 116, 128, 13, '#5D4F55', '#3E2F35')}${leg(a, 138, 124, 13, '#5D4F55', '#3E2F35')}
      ${puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.ball(wool, 0.2, -0.12)}" ${edge('#E0D6C8', 2)}/>`).join('')}
      <ellipse cx="160" cy="64" rx="16" ry="7" fill="#4E4248" transform="rotate(-25 160 64)"/>
      <ellipse cx="196" cy="64" rx="16" ry="7" fill="#4E4248" transform="rotate(25 196 64)"/>
      <path d="M164 56 Q178 44 192 56 Q200 84 186 100 Q178 106 170 100 Q156 84 164 56Z" fill="${a.ball('#5D4F55', 0.3, -0.25)}" ${edge('#3E2F35', 2)}/>
      ${[[170, 50], [180, 44], [190, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${a.ball(wool)}"/>`).join('')}
      ${eye(171, 72, 4.5)}${eye(187, 72, 4.5)}
      <path d="M174 92 q4 4 8 0" stroke="#FFF" stroke-width="2" fill="none"/>`;
  },
  horse(a) {
    const c = '#A0522D';
    const mane = '#3E2723';
    return `${groundShadow(104, 170, 80, 8)}
      <path d="M34 66 Q12 90 20 140 Q26 124 32 112 Q30 134 40 146 Q40 100 44 74Z" fill="${a.ball(mane, 0.3, -0.2)}"/>
      ${leg(a, 46, 96, 14, shade(c, -0.15), '#212121')}${leg(a, 126, 96, 14, shade(c, -0.15), '#212121')}
      <ellipse cx="94" cy="80" rx="62" ry="32" fill="${a.ball(c, 0.3, -0.22)}" ${edge(c, 2.5)}/>
      ${leg(a, 60, 100, 14, c, '#212121')}${leg(a, 138, 100, 14, c, '#212121')}
      <path d="M138 70 Q150 40 164 22 L184 28 Q172 52 160 84Z" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2)}/>
      <path d="M140 66 Q148 36 164 18 Q160 40 156 50 Q154 60 146 72Z" fill="${mane}"/>
      <path d="M160 16 Q182 8 200 30 Q206 44 196 50 Q182 52 164 40Z" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2)}/>
      <path d="M164 14 l2 -14 l8 12z" fill="${a.ball(c)}" ${edge(c, 1.5)}/>
      <path d="M176 18 Q188 22 196 40" stroke="#FFF8E1" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="196" cy="44" rx="4" ry="3" fill="#3E2723"/>
      ${eye(176, 24, 4.5)}${shine(80, 64, 26, 7, -8, 0.25)}`;
  },
  rabbit(a) {
    const c = '#BCAAA4';
    return `${groundShadow(108, 170, 56, 7)}
      <circle cx="56" cy="140" r="14" fill="${a.ball('#FFFFFF')}" ${edge('#E0E0E0', 1.5)}/>
      <path d="M60 160 Q52 100 100 94 Q146 92 148 140 Q148 166 120 168 L74 168 Q60 168 60 160Z" fill="${a.ball(c, 0.35, -0.2)}" ${edge(c, 2.5)}/>
      <ellipse cx="116" cy="150" rx="20" ry="14" fill="${a.ball('#F5F0EC')}"/>
      <ellipse cx="128" cy="164" rx="18" ry="7" fill="${a.ball(shade(c, 0.1))}" ${edge(c, 1.5)}/>
      <ellipse cx="128" cy="30" rx="11" ry="38" fill="${a.ball(c, 0.35, -0.2)}" transform="rotate(-12 128 30)" ${edge(c, 2)}/>
      <ellipse cx="128" cy="32" rx="5" ry="28" fill="#F8BBD0" transform="rotate(-12 128 32)"/>
      <ellipse cx="156" cy="32" rx="11" ry="38" fill="${a.ball(c, 0.35, -0.2)}" transform="rotate(12 156 32)" ${edge(c, 2)}/>
      <ellipse cx="156" cy="34" rx="5" ry="28" fill="#F8BBD0" transform="rotate(12 156 34)"/>
      <circle cx="144" cy="86" r="30" fill="${a.ball(c, 0.35, -0.2)}" ${edge(c, 2)}/>
      <ellipse cx="152" cy="100" rx="15" ry="11" fill="#F5F0EC"/>
      <path d="M148 94 l5 4 l5 -4z" fill="#F06292"/>
      <path d="M146 100 l-20 -4 M146 102 l-20 4 M162 100 l20 -4 M162 102 l20 4" stroke="#8D6E63" stroke-width="1" opacity=".7"/>
      ${eye(134, 80, 5.5)}${eye(160, 80, 5.5)}`;
  },
  dog(a) {
    const c = '#E0A458';
    return `${groundShadow(108, 170, 64, 8)}
      <path d="M50 120 Q26 100 30 76" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>
      ${leg(a, 62, 124, 18, shade(c, -0.12))}
      <path d="M58 166 Q50 120 82 100 Q120 86 140 112 Q150 140 140 166Z" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2.5)}/>
      <ellipse cx="114" cy="140" rx="18" ry="20" fill="#FFF3E0"/>
      ${leg(a, 112, 120, 18, c)}${leg(a, 134, 120, 18, c)}
      <ellipse cx="122" cy="166" rx="14" ry="6" fill="${a.ball('#FFF3E0')}"/><ellipse cx="144" cy="166" rx="14" ry="6" fill="${a.ball('#FFF3E0')}"/>
      <path d="M110 96 Q130 104 150 96" stroke="#E53935" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="132" cy="106" r="6" fill="${a.ball('#FFD54F')}"/>
      <circle cx="136" cy="62" r="34" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2)}/>
      <path d="M110 40 Q94 56 102 90 Q114 84 116 56Z M160 40 Q178 56 170 90 Q158 84 156 56Z" fill="${a.ball(shade(c, -0.3))}" ${edge(shade(c, -0.3), 1.5)}/>
      <ellipse cx="140" cy="80" rx="20" ry="15" fill="#FFF3E0"/>
      <ellipse cx="140" cy="72" rx="8" ry="6" fill="#2B2024"/>${shine(137, 70, 2.5, 1.5, 0, 0.7)}
      <path d="M140 78 L140 84 M140 84 q-6 6 -12 2 M140 84 q6 6 12 2" stroke="#2B2024" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M134 88 q6 14 12 0z" fill="#F06292"/>
      ${eye(124, 56, 5.5)}${eye(156, 56, 5.5)}`;
  },
  cat(a) {
    const c = '#F4A340';
    const stripe = shade(c, -0.25);
    return `${groundShadow(104, 170, 58, 8)}
      <path d="M58 156 Q24 150 28 120 Q32 104 46 108" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M36 112 q4 -4 10 -2" stroke="${stripe}" stroke-width="4"/>
      <path d="M60 166 Q54 118 86 102 Q118 94 132 118 Q140 146 132 166Z" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2.5)}/>
      <path d="M70 120 q8 4 14 -2 M66 136 q10 4 16 -2" stroke="${stripe}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="108" cy="146" rx="16" ry="18" fill="#FFF3E0"/>
      <ellipse cx="96" cy="166" rx="13" ry="6" fill="${a.ball('#FFF3E0')}"/><ellipse cx="122" cy="166" rx="13" ry="6" fill="${a.ball('#FFF3E0')}"/>
      <path d="M86 52 L90 18 L112 42Z M136 42 L156 18 L160 52Z" fill="${a.ball(c)}" ${edge(c, 2)}/>
      <path d="M92 44 L93 28 L104 40Z M142 40 L153 28 L154 44Z" fill="#F8BBD0"/>
      <ellipse cx="122" cy="70" rx="40" ry="34" fill="${a.ball(c, 0.3, -0.2)}" ${edge(c, 2)}/>
      <path d="M112 40 l2 10 M122 38 v12 M132 40 l-2 10" stroke="${stripe}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="122" cy="84" rx="16" ry="11" fill="#FFF3E0"/>
      <path d="M118 80 l4 4 l4 -4z" fill="#F06292"/>
      <path d="M116 88 q6 5 12 0" stroke="#5D4037" stroke-width="2" fill="none"/>
      <path d="M106 82 l-24 -4 M106 86 l-24 4 M138 82 l24 -4 M138 86 l24 4" stroke="#5D4037" stroke-width="1.2" opacity=".7"/>
      <ellipse cx="106" cy="66" rx="7" ry="8" fill="#7CB342"/><ellipse cx="138" cy="66" rx="7" ry="8" fill="#7CB342"/>
      <ellipse cx="106" cy="67" rx="2.5" ry="6" fill="#1B1B1B"/><ellipse cx="138" cy="67" rx="2.5" ry="6" fill="#1B1B1B"/>
      <circle cx="108" cy="63" r="2" fill="#fff"/><circle cx="140" cy="63" r="2" fill="#fff"/>`;
  },
};

export const ANIMAL_ARTS: readonly AnimalArt[] = ['cow', 'chicken', 'duck', 'pig', 'sheep', 'horse', 'rabbit', 'dog', 'cat'];

export function animalSvg(kind: AnimalArt, label?: string): string {
  const a = new Art(`an${kind}`);
  return a.svg(VB, DRAW[kind](a), { label });
}
