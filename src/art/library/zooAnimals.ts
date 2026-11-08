/**
 * 22 LOÀI SỞ THÚ (SPEC 19.3) — mỗi loài vẽ RIÊNG, đúng tỉ lệ & bộ phận đặc trưng, vẻ hiền (A8: không nhe nanh).
 * Con vật nhìn sang PHẢI. Mỗi loài có khung riêng (w × h) và mức chân chạm đất `feet` (loài bơi: null).
 */
import { Art, edge, eye, groundShadow, shade, shine } from './kit';

export type ZooAnimal =
  | 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'rhinoceros'
  | 'monkey' | 'tiger' | 'bear' | 'deer' | 'fox'
  | 'penguin' | 'polar bear' | 'seal'
  | 'dolphin' | 'shark' | 'turtle' | 'octopus' | 'clownfish'
  | 'parrot' | 'peacock' | 'flamingo' | 'owl';

interface Def { w: number; h: number; feet: number | null; draw(a: Art): string }

/** Chân thú bốn chân (từ `top` xuống tới `ground`). */
function leg(a: Art, x: number, top: number, w: number, c: string, ground: number, foot?: string): string {
  return `<rect x="${x}" y="${top}" width="${w}" height="${ground - top}" rx="${w / 2.4}" fill="${a.side(c)}" ${edge(c, 2)}/>` +
    (foot ? `<rect x="${x - 1}" y="${ground - 8}" width="${w + 2}" height="9" rx="4" fill="${foot}"/>` : '');
}

/** Sọc cắt theo hình thân (hổ, ngựa vằn). */
function striped(a: Art, shape: string, fill: string, stripes: string, stripeColor: string, outline: string): string {
  const id = `${a.u}clip${Math.round(Math.random() * 1e6)}`;
  return `<clipPath id="${id}">${shape.replace(/fill="[^"]*"/, '')}</clipPath>
    ${shape.replace('/>', ` fill="${fill}" ${edge(outline, 2.5)}/>`)}
    <g clip-path="url(#${id})" fill="none" stroke="${stripeColor}" stroke-width="7" stroke-linecap="round">${stripes}</g>`;
}

const DEFS: Record<ZooAnimal, Def> = {
  // ===================== GRASSLAND =====================
  lion: { w: 220, h: 180, feet: 168, draw: (a) => {
    const fur = '#E8B04A';
    return `${groundShadow(110, 170, 84, 8)}
      <path d="M44 96 Q14 96 18 64" stroke="${fur}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="18" cy="60" rx="8" ry="11" fill="#7B4A1E"/>
      ${leg(a, 52, 112, 18, shade(fur, -0.1), 168, '#C98F35')}${leg(a, 128, 112, 18, shade(fur, -0.1), 168, '#C98F35')}
      <ellipse cx="102" cy="100" rx="66" ry="34" fill="${a.ball(fur, 0.3, -0.18)}" ${edge(fur)}/>
      <ellipse cx="100" cy="118" rx="44" ry="12" fill="#F6D38E" opacity=".7"/>
      ${leg(a, 66, 116, 18, fur, 168, '#F2CB7C')}${leg(a, 144, 116, 18, fur, 168, '#F2CB7C')}
      <g transform="translate(168 70)">
        ${Array.from({ length: 14 }, (_, i) => { const r = (i / 14) * Math.PI * 2; return `<ellipse cx="${Math.cos(r) * 30}" cy="${Math.sin(r) * 30}" rx="16" ry="11" transform="rotate(${(r * 180) / Math.PI} ${Math.cos(r) * 30} ${Math.sin(r) * 30})" fill="${a.ball('#B5651D', 0.25, -0.2)}"/>`; }).join('')}
        <circle r="34" fill="${a.ball('#C0702A', 0.25, -0.2)}"/>
        <circle cx="-16" cy="-20" r="8" fill="${a.ball(fur)}" ${edge(fur, 1.5)}/><circle cx="16" cy="-20" r="8" fill="${a.ball(fur)}" ${edge(fur, 1.5)}/>
        <circle r="24" fill="${a.ball(fur, 0.3, -0.12)}" ${edge(fur, 2)}/>
        <ellipse cx="2" cy="10" rx="14" ry="10" fill="#FBE3B0"/>
        <path d="M-4 4 L8 4 L2 11Z" fill="#6D3B2A"/>
        <path d="M2 11 v4 M-6 16 q8 5 16 0" stroke="#6D3B2A" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${eye(-8, -6, 4)}${eye(12, -6, 4)}
      </g>`;
  } },
  elephant: { w: 240, h: 200, feet: 188, draw: (a) => {
    const g = '#9EA7B0';
    return `${groundShadow(116, 190, 96, 9)}
      <path d="M40 92 Q24 110 28 132" stroke="${shade(g, -0.15)}" stroke-width="5" fill="none"/><path d="M24 130 l4 10 l6 -9z" fill="#555"/>
      ${leg(a, 50, 120, 30, shade(g, -0.12), 188, '#D7D2C8')}${leg(a, 134, 120, 30, shade(g, -0.12), 188, '#D7D2C8')}
      <ellipse cx="108" cy="104" rx="80" ry="56" fill="${a.ball(g, 0.25, -0.2)}" ${edge(g)}/>
      ${leg(a, 70, 128, 30, g, 188, '#E6E1D6')}${leg(a, 152, 128, 30, g, 188, '#E6E1D6')}
      <path d="M200 96 Q228 120 222 160 Q220 176 208 174 Q214 150 196 122Z" fill="${a.side(g, 0.15, -0.15)}" ${edge(g, 2)}/>
      <path d="M204 112 q8 4 10 0 M206 128 q8 4 10 0 M206 144 q8 3 10 -1" stroke="${shade(g, -0.3)}" stroke-width="1.5" fill="none"/>
      <circle cx="186" cy="80" r="40" fill="${a.ball(g, 0.25, -0.18)}" ${edge(g, 2)}/>
      <path d="M200 112 Q214 120 222 112" stroke="#FFFDF5" stroke-width="7" stroke-linecap="round" fill="none"/>
      <ellipse cx="160" cy="88" rx="30" ry="42" fill="${a.ball(shade(g, -0.06), 0.15, -0.2)}" ${edge(g, 2)}/>
      <ellipse cx="160" cy="88" rx="19" ry="29" fill="#E5B9B9" opacity=".55"/>
      ${eye(204, 74, 5)}<path d="M196 64 q8 -5 16 0" stroke="${shade(g, -0.35)}" stroke-width="2" fill="none"/>`;
  } },
  giraffe: { w: 200, h: 300, feet: 288, draw: (a) => {
    const c = '#F2C35A', p = '#B86E2E';
    const spots = [[64, 160], [92, 152], [118, 166], [76, 186], [104, 186], [50, 176], [130, 150]]
      .map(([x, y]) => `<path d="M${x - 9} ${y - 6} l10 -5 l9 6 l-1 10 l-11 5 l-8 -6z" fill="${p}" opacity=".9"/>`).join('');
    const nspots = [[132, 132], [140, 110], [146, 88], [152, 66]].map(([x, y]) => `<path d="M${x - 6} ${y - 5} l7 -3 l6 5 l-2 7 l-8 2z" fill="${p}"/>`).join('');
    return `${groundShadow(96, 290, 62, 7)}
      <path d="M40 168 Q24 186 26 214" stroke="${c}" stroke-width="4" fill="none"/><ellipse cx="26" cy="218" rx="5" ry="9" fill="#5D3A1A"/>
      ${leg(a, 50, 186, 12, shade(c, -0.1), 288, '#5D3A1A')}${leg(a, 112, 186, 12, shade(c, -0.1), 288, '#5D3A1A')}
      <path d="M120 166 Q130 120 146 70 Q152 50 166 44 L178 56 Q164 70 160 98 Q150 140 142 176Z" fill="${a.side(c, 0.2, -0.1)}" ${edge(c, 2)}/>
      ${nspots}
      <path d="M140 160 Q148 110 158 68" stroke="${p}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8" transform="translate(-10 0)"/>
      <ellipse cx="90" cy="172" rx="56" ry="30" fill="${a.ball(c, 0.3, -0.15)}" ${edge(c)}/>
      ${spots}
      ${leg(a, 62, 192, 12, c, 288, '#5D3A1A')}${leg(a, 124, 192, 12, c, 288, '#5D3A1A')}
      <path d="M160 40 L158 22 M174 40 L176 22" stroke="${p}" stroke-width="5" stroke-linecap="round"/><circle cx="158" cy="20" r="5" fill="#5D3A1A"/><circle cx="176" cy="20" r="5" fill="#5D3A1A"/>
      <ellipse cx="150" cy="40" rx="10" ry="5" fill="${a.ball(c)}" transform="rotate(-25 150 40)" ${edge(c, 1.5)}/>
      <path d="M156 34 Q178 28 194 46 Q198 58 186 62 Q166 62 156 50Z" fill="${a.ball(c, 0.3, -0.12)}" ${edge(c, 2)}/>
      <ellipse cx="190" cy="54" rx="6" ry="5" fill="#E7A86A"/><circle cx="191" cy="52" r="1.5" fill="#5D3A1A"/>
      ${eye(172, 42, 4.5)}`;
  } },
  zebra: { w: 220, h: 180, feet: 168, draw: (a) => {
    const body = `<path d="M40 100 Q42 66 100 66 Q150 66 160 84 L164 120 Q150 136 100 134 Q46 134 40 100Z"/>`;
    const stripes = [56, 74, 92, 110, 128, 146].map((x) => `<path d="M${x} 60 Q${x + 10} 96 ${x - 4} 140"/>`).join('');
    return `${groundShadow(106, 170, 80, 8)}
      <path d="M42 92 Q26 104 30 132" stroke="#333" stroke-width="5" fill="none"/><path d="M26 130 l4 14 l6 -13z" fill="#222"/>
      ${leg(a, 54, 118, 15, '#E8E8E8', 168, '#222')}${leg(a, 130, 118, 15, '#E8E8E8', 168, '#222')}
      ${striped(a, body, a.ball('#FFFFFF', 0.1, -0.12), stripes, '#2A2A2A', '#BDBDBD')}
      ${leg(a, 68, 122, 15, '#FFFFFF', 168, '#222')}<path d="M68 140 h15 M68 152 h15" stroke="#222" stroke-width="4"/>
      ${leg(a, 146, 122, 15, '#FFFFFF', 168, '#222')}<path d="M146 140 h15 M146 152 h15" stroke="#222" stroke-width="4"/>
      <path d="M150 86 Q160 50 180 40 L196 52 Q178 70 172 98Z" fill="${a.side('#FFFFFF', 0.1, -0.1)}" ${edge('#BDBDBD', 2)}/>
      <path d="M156 70 l14 -8 M162 58 l14 -6 M158 84 l14 -6" stroke="#2A2A2A" stroke-width="5" stroke-linecap="round"/>
      <path d="M150 80 Q156 44 178 34" stroke="#2A2A2A" stroke-width="8" stroke-dasharray="4 3" fill="none"/>
      <path d="M176 34 Q204 36 212 62 Q214 74 202 76 Q186 74 178 56Z" fill="${a.ball('#FFFFFF', 0.1, -0.12)}" ${edge('#BDBDBD', 2)}/>
      <path d="M186 44 l10 6 M184 52 l12 4" stroke="#2A2A2A" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="206" cy="68" rx="9" ry="8" fill="#333"/>
      <path d="M180 34 l-4 -14 l10 10z" fill="#EEE" ${edge('#BDBDBD', 1.5)}/>
      ${eye(192, 50, 4)}`;
  } },
  rhinoceros: { w: 220, h: 180, feet: 168, draw: (a) => {
    const g = '#8F8A86';
    return `${groundShadow(108, 170, 88, 8)}
      <path d="M34 96 Q22 104 24 118" stroke="${g}" stroke-width="4" fill="none"/>
      ${leg(a, 50, 116, 24, shade(g, -0.12), 168, '#6F6A66')}${leg(a, 126, 116, 24, shade(g, -0.12), 168, '#6F6A66')}
      <path d="M34 106 Q34 62 96 60 Q150 58 166 82 L168 122 Q150 140 98 138 Q36 138 34 106Z" fill="${a.ball(g, 0.25, -0.2)}" ${edge(g)}/>
      <path d="M78 64 Q74 100 80 134 M128 62 Q122 98 128 134" stroke="${shade(g, -0.2)}" stroke-width="2.5" fill="none" opacity=".7"/>
      ${leg(a, 64, 120, 24, g, 168, '#77726E')}${leg(a, 140, 120, 24, g, 168, '#77726E')}
      <path d="M156 78 Q170 60 194 70 Q214 82 212 108 Q204 122 184 120 Q160 116 154 98Z" fill="${a.ball(g, 0.25, -0.15)}" ${edge(g, 2)}/>
      <path d="M198 84 Q206 54 214 46 Q214 70 210 90Z" fill="${a.ball('#E8DFD0', 0.2, -0.2)}" ${edge('#A89F90', 1.5)}/>
      <path d="M186 80 Q190 66 196 62 Q196 74 194 84Z" fill="#DCD3C4" ${edge('#A89F90', 1)}/>
      <path d="M164 70 l-6 -14 l12 8z" fill="${g}" ${edge(g, 1.5)}/>
      <path d="M200 108 q6 2 10 -2" stroke="#4E4A47" stroke-width="2" fill="none"/>
      ${eye(176, 86, 4)}`;
  } },

  // ===================== FOREST =====================
  monkey: { w: 180, h: 180, feet: 168, draw: (a) => {
    const b = '#8D5A3B', f = '#F2CFA6';
    return `${groundShadow(90, 170, 46, 6)}
      <path d="M62 140 Q20 140 24 100 Q28 76 48 84" stroke="${b}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="72" cy="158" rx="16" ry="10" fill="${a.ball(b)}"/><ellipse cx="112" cy="158" rx="16" ry="10" fill="${a.ball(b)}"/>
      <ellipse cx="92" cy="124" rx="36" ry="38" fill="${a.ball(b, 0.3, -0.2)}" ${edge(b)}/>
      <ellipse cx="92" cy="132" rx="20" ry="24" fill="${f}"/>
      <path d="M62 108 Q44 128 54 150" stroke="${b}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M122 108 Q148 96 150 70" stroke="${b}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <circle cx="150" cy="66" r="8" fill="${f}"/>
      <path d="M142 52 Q160 40 172 58 Q166 64 150 58Z" fill="${a.ball('#FDD835')}" ${edge('#F9A825', 1.5)}/>
      <circle cx="54" cy="62" r="14" fill="${a.ball(b)}"/><circle cx="54" cy="62" r="8" fill="${f}"/>
      <circle cx="130" cy="62" r="14" fill="${a.ball(b)}"/><circle cx="130" cy="62" r="8" fill="${f}"/>
      <circle cx="92" cy="60" r="34" fill="${a.ball(b, 0.3, -0.2)}" ${edge(b, 2)}/>
      <path d="M68 62 Q70 38 92 44 Q114 38 116 62 Q118 88 92 90 Q66 88 68 62Z" fill="${a.ball(f, 0.2, -0.1)}"/>
      ${eye(82, 58, 5)}${eye(102, 58, 5)}
      <ellipse cx="88" cy="70" rx="2" ry="1.5" fill="#5D3A1A"/><ellipse cx="96" cy="70" rx="2" ry="1.5" fill="#5D3A1A"/>
      <path d="M82 78 q10 7 20 0" stroke="#5D3A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } },
  tiger: { w: 220, h: 180, feet: 168, draw: (a) => {
    const o = '#F28C28';
    const body = `<path d="M38 100 Q40 68 100 68 Q152 68 160 92 L160 118 Q148 134 100 134 Q42 134 38 100Z"/>`;
    const stripes = [58, 78, 98, 118, 138].map((x) => `<path d="M${x} 66 Q${x + 8} 84 ${x - 2} 100"/><path d="M${x + 6} 134 Q${x + 12} 120 ${x + 4} 112"/>`).join('');
    return `${groundShadow(106, 170, 82, 8)}
      <path d="M40 96 Q12 100 16 66" stroke="${o}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M14 76 h10 M16 90 h10" stroke="#2A2A2A" stroke-width="4"/>
      ${leg(a, 52, 116, 18, shade(o, -0.1), 168, '#FFF3E0')}${leg(a, 126, 116, 18, shade(o, -0.1), 168, '#FFF3E0')}
      ${striped(a, body, a.ball(o, 0.3, -0.2), stripes, '#2A2A2A', o)}
      <ellipse cx="100" cy="124" rx="38" ry="9" fill="#FFF3E0" opacity=".85"/>
      ${leg(a, 66, 120, 18, o, 168, '#FFF3E0')}${leg(a, 142, 120, 18, o, 168, '#FFF3E0')}
      <g transform="translate(172 74)">
        <circle cx="-18" cy="-24" r="10" fill="${a.ball(o)}" ${edge(o, 1.5)}/><circle cx="-18" cy="-24" r="5" fill="#FFF3E0"/>
        <circle cx="16" cy="-24" r="10" fill="${a.ball(o)}" ${edge(o, 1.5)}/><circle cx="16" cy="-24" r="5" fill="#FFF3E0"/>
        <circle r="28" fill="${a.ball(o, 0.3, -0.15)}" ${edge(o, 2)}/>
        <path d="M-6 -26 v8 M0 -27 v10 M6 -26 v8 M-26 -2 h8 M18 -2 h8" stroke="#2A2A2A" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="0" cy="12" rx="17" ry="12" fill="#FFF8EE"/>
        <path d="M-5 5 L5 5 L0 11Z" fill="#E57373"/>
        <path d="M0 11 v3 M-7 16 q7 5 14 0" stroke="#5D3A1A" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${eye(-10, -6, 4.5)}${eye(10, -6, 4.5)}
      </g>`;
  } },
  bear: { w: 220, h: 180, feet: 168, draw: (a) => {
    const b = '#7B5034';
    return `${groundShadow(106, 170, 82, 8)}
      ${leg(a, 52, 116, 24, shade(b, -0.12), 168, '#5C3B26')}${leg(a, 124, 116, 24, shade(b, -0.12), 168, '#5C3B26')}
      <path d="M36 108 Q30 64 92 58 Q118 52 140 66 Q166 78 164 110 Q160 138 100 138 Q42 138 36 108Z" fill="${a.ball(b, 0.3, -0.2)}" ${edge(b)}/>
      ${leg(a, 66, 120, 24, b, 168, '#5C3B26')}${leg(a, 138, 120, 24, b, 168, '#5C3B26')}
      <g transform="translate(174 82)">
        <circle cx="-18" cy="-24" r="11" fill="${a.ball(b)}" ${edge(b, 1.5)}/><circle cx="-18" cy="-24" r="5" fill="#C9A27E"/>
        <circle cx="16" cy="-24" r="11" fill="${a.ball(b)}" ${edge(b, 1.5)}/><circle cx="16" cy="-24" r="5" fill="#C9A27E"/>
        <circle r="28" fill="${a.ball(b, 0.3, -0.18)}" ${edge(b, 2)}/>
        <ellipse cx="4" cy="12" rx="17" ry="12" fill="${a.ball('#D7B48E')}"/>
        <ellipse cx="4" cy="6" rx="6" ry="4.5" fill="#2B1D16"/>
        <path d="M4 10 v4 M-3 16 q7 4 14 0" stroke="#2B1D16" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${eye(-8, -6, 4.5)}${eye(14, -6, 4.5)}
      </g>`;
  } },
  deer: { w: 220, h: 180, feet: 168, draw: (a) => {
    const c = '#C68A52';
    const spots = [[76, 84], [96, 80], [116, 86], [86, 98], [106, 98], [126, 100]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#FFF3E0" opacity=".9"/>`).join('');
    return `${groundShadow(104, 170, 70, 7)}
      <path d="M44 88 q-10 -4 -10 -14 q8 2 12 8z" fill="#FFF3E0" ${edge('#C9A27E', 1.5)}/>
      ${leg(a, 58, 106, 11, shade(c, -0.1), 168, '#4E342E')}${leg(a, 130, 106, 11, shade(c, -0.1), 168, '#4E342E')}
      <ellipse cx="100" cy="94" rx="58" ry="26" fill="${a.ball(c, 0.3, -0.18)}" ${edge(c)}/>
      <ellipse cx="100" cy="110" rx="38" ry="8" fill="#F3D9B8" opacity=".8"/>
      ${spots}
      ${leg(a, 70, 110, 11, c, 168, '#4E342E')}${leg(a, 142, 110, 11, c, 168, '#4E342E')}
      <path d="M142 88 Q150 60 162 46 L176 54 Q164 70 160 96Z" fill="${a.side(c, 0.2, -0.1)}" ${edge(c, 2)}/>
      <path d="M164 34 q-8 -14 -2 -26 M164 22 q-12 -4 -14 -12 M176 34 q4 -14 14 -22 M182 22 q10 -2 16 -10" stroke="#8D6E63" stroke-width="4" stroke-linecap="round" fill="none"/>
      <ellipse cx="156" cy="40" rx="12" ry="6" fill="${a.ball(c)}" transform="rotate(-30 156 40)" ${edge(c, 1.5)}/>
      <path d="M160 40 Q176 30 192 46 Q200 56 190 62 Q174 62 164 54Z" fill="${a.ball(c, 0.3, -0.12)}" ${edge(c, 2)}/>
      <ellipse cx="194" cy="56" rx="5" ry="4" fill="#2B1D16"/>
      ${eye(176, 46, 4.5)}`;
  } },
  fox: { w: 220, h: 180, feet: 168, draw: (a) => {
    const o = '#E8762B';
    return `${groundShadow(106, 170, 76, 7)}
      <path d="M48 104 Q6 110 10 72 Q30 80 44 92" fill="${a.ball(o, 0.3, -0.2)}" ${edge(o, 2)}/>
      <path d="M10 72 Q14 64 22 66 Q18 76 20 82Z" fill="#FFFFFF"/>
      ${leg(a, 64, 112, 10, shade(o, -0.15), 168, '#3E2723')}${leg(a, 128, 112, 10, shade(o, -0.15), 168, '#3E2723')}
      <ellipse cx="100" cy="102" rx="54" ry="26" fill="${a.ball(o, 0.3, -0.2)}" ${edge(o)}/>
      ${leg(a, 76, 114, 10, o, 168, '#3E2723')}${leg(a, 140, 114, 10, o, 168, '#3E2723')}<path d="M76 150 h10 M140 150 h10" stroke="#3E2723" stroke-width="8"/>
      <path d="M140 108 Q150 120 160 104 L150 92Z" fill="#FFFFFF"/>
      <g transform="translate(166 80)">
        <path d="M-22 -10 L-18 -40 L-4 -20Z M6 -20 L20 -40 L22 -8Z" fill="${a.ball(o)}" ${edge(o, 1.5)}/>
        <path d="M-17 -36 l-1 6 l4 2z M17 -36 l1 6 l-4 2z" fill="#3E2723"/>
        <path d="M-24 -6 Q0 -30 24 -6 Q30 8 44 12 Q24 26 0 22 Q-22 20 -24 -6Z" fill="${a.ball(o, 0.3, -0.15)}" ${edge(o, 2)}/>
        <path d="M-10 10 Q10 6 44 12 Q24 26 0 22 Q-12 20 -10 10Z" fill="#FFFFFF"/>
        <circle cx="44" cy="11" r="4" fill="#2B1D16"/>
        ${eye(-4, -6, 4)}${eye(14, -6, 4)}
      </g>`;
  } },

  // ===================== ICE LAND =====================
  penguin: { w: 140, h: 180, feet: 168, draw: (a) => `${groundShadow(70, 170, 34, 6)}
      <path d="M52 164 l-12 4 l14 2z M88 164 l12 4 l-14 2z" fill="${a.ball('#FF9800')}"/>
      <path d="M70 18 Q110 22 112 90 Q114 150 70 166 Q26 150 28 90 Q30 22 70 18Z" fill="${a.ball('#263238', 0.25, -0.2)}" ${edge('#263238', 2)}/>
      <path d="M70 46 Q100 56 98 110 Q96 150 70 158 Q44 150 42 110 Q40 56 70 46Z" fill="${a.ball('#FFFFFF', 0.05, -0.1)}"/>
      <path d="M46 52 Q40 46 44 40 Q56 46 54 58Z M94 52 Q100 46 96 40 Q84 46 86 58Z" fill="${a.ball('#FFC107')}"/>
      <path d="M30 80 Q10 108 20 128 Q34 112 36 92Z" fill="${a.ball('#37474F')}" ${edge('#263238', 1.5)}/>
      <path d="M110 80 Q130 108 120 128 Q106 112 104 92Z" fill="${a.ball('#37474F')}" ${edge('#263238', 1.5)}/>
      <path d="M62 50 L84 54 L64 60Z" fill="${a.ball('#FF7043')}" ${edge('#E64A19', 1)}/>
      ${eye(58, 40, 4.5)}${eye(80, 40, 4.5)}
      ${shine(52, 30, 4, 8, -20, 0.35)}` },
  'polar bear': { w: 220, h: 180, feet: 168, draw: (a) => {
    const w = '#F7F4EC';
    return `${groundShadow(106, 170, 84, 8)}
      ${leg(a, 50, 114, 24, '#E6E0D2', 168)}${leg(a, 124, 114, 24, '#E6E0D2', 168)}
      <path d="M34 106 Q30 66 92 64 Q140 60 158 80 Q172 96 166 116 Q158 138 100 138 Q40 138 34 106Z" fill="${a.ball(w, 0.1, -0.14)}" ${edge('#CFC7B6')}/>
      ${leg(a, 64, 118, 24, w, 168)}${leg(a, 138, 118, 24, w, 168)}
      <path d="M150 88 Q166 66 190 68 Q214 72 214 90 Q210 104 188 104 Q164 104 152 98Z" fill="${a.ball(w, 0.1, -0.12)}" ${edge('#CFC7B6', 2)}/>
      <circle cx="170" cy="68" r="7" fill="${a.ball(w)}" ${edge('#CFC7B6', 1.5)}/>
      <ellipse cx="212" cy="86" rx="5" ry="4" fill="#2B1D16"/>
      <path d="M200 96 q6 3 12 -1" stroke="#2B1D16" stroke-width="2" fill="none"/>
      ${eye(188, 80, 4)}`;
  } },
  seal: { w: 220, h: 140, feet: 128, draw: (a) => {
    const g = '#8C9BA5';
    return `${groundShadow(110, 130, 86, 7)}
      <path d="M20 112 L4 100 L8 124Z M20 114 L6 128 L26 124Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <path d="M20 116 Q40 86 100 82 Q150 78 168 62 Q196 50 204 74 Q206 104 170 116 Q130 128 60 128 Q30 128 20 116Z" fill="${a.ball(g, 0.3, -0.18)}" ${edge(g)}/>
      <path d="M60 120 Q90 112 150 108" stroke="#C7D2D8" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M120 112 Q132 132 112 132 Q104 124 110 112Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <ellipse cx="201" cy="74" rx="6" ry="5" fill="#2B1D16"/>
      <path d="M196 80 l-14 2 M196 82 l-14 6 M204 80 l14 0 M204 82 l14 5" stroke="#5D6B74" stroke-width="1.2"/>
      ${eye(184, 64, 5.5)}`;
  } },

  // ===================== OCEAN (bơi — feet null) =====================
  dolphin: { w: 240, h: 140, feet: null, draw: (a) => {
    const g = '#6FA8D6';
    return `<path d="M24 64 L4 44 Q16 66 6 92 Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <path d="M22 70 Q60 34 130 36 Q190 38 206 62 L232 70 Q206 80 190 86 Q140 108 70 98 Q34 92 22 70Z" fill="${a.ball(g, 0.3, -0.2)}" ${edge(g)}/>
      <path d="M60 92 Q130 104 190 84 Q170 72 120 78 Q80 82 60 92Z" fill="#E3F2FD"/>
      <path d="M110 38 Q122 12 140 8 Q132 24 134 40Z" fill="${a.ball(shade(g, -0.05))}" ${edge(g, 1.5)}/>
      <path d="M120 88 Q114 112 98 118 Q104 98 104 88Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <path d="M206 66 q-6 6 -16 6" stroke="#3E6F99" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${eye(180, 56, 4.5)}${shine(110, 46, 30, 5, -5, 0.35)}`;
  } },
  shark: { w: 260, h: 140, feet: null, draw: (a) => {
    const g = '#7E93A6';
    return `<path d="M30 70 L4 30 Q18 64 4 110 Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <path d="M26 70 Q70 36 150 38 Q220 42 248 70 Q220 96 150 100 Q70 104 26 70Z" fill="${a.ball(g, 0.3, -0.2)}" ${edge(g)}/>
      <path d="M60 84 Q150 108 236 78 Q200 92 150 92 Q100 92 60 84Z" fill="#F1F5F8"/>
      <path d="M120 40 Q130 6 148 2 Q144 22 152 40Z" fill="${a.ball(shade(g, -0.05))}" ${edge(g, 1.5)}/>
      <path d="M140 92 Q132 122 112 128 Q118 106 118 94Z" fill="${a.ball(shade(g, -0.1))}" ${edge(g, 1.5)}/>
      <path d="M176 58 v18 M184 56 v20 M192 56 v18" stroke="#5E7183" stroke-width="2" stroke-linecap="round"/>
      <path d="M214 80 q10 4 20 -2" stroke="#4E5F6F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${eye(222, 62, 5)}${shine(140, 48, 34, 5, -4, 0.3)}`;
  } },
  turtle: { w: 200, h: 140, feet: null, draw: (a) => {
    const s = '#5E8C4A';
    const hexes = [[84, 58], [110, 52], [136, 58], [96, 80], [124, 80]].map(([x, y]) => `<path d="M${x - 11} ${y} l6 -10 h11 l6 10 l-6 10 h-11z" fill="${shade(s, 0.15)}" stroke="${shade(s, -0.3)}" stroke-width="1.5"/>`).join('');
    return `<path d="M60 56 Q30 30 20 44 Q32 58 62 70Z M60 96 Q34 120 26 108 Q36 92 62 86Z M150 56 Q176 34 184 46 Q172 58 148 68Z M150 96 Q170 116 178 106 Q170 94 148 86Z" fill="${a.ball('#9CCC65', 0.3, -0.2)}" ${edge('#689F38', 1.5)}/>
      <path d="M40 74 l-16 -4 l2 10z" fill="#9CCC65"/>
      <ellipse cx="108" cy="72" rx="56" ry="36" fill="${a.ball(s, 0.3, -0.2)}" ${edge(s)}/>
      ${hexes}
      <ellipse cx="172" cy="70" rx="20" ry="15" fill="${a.ball('#9CCC65', 0.3, -0.15)}" ${edge('#689F38', 2)}/>
      <path d="M178 78 q6 3 12 -1" stroke="#33691E" stroke-width="2" fill="none"/>
      ${eye(176, 64, 4)}`;
  } },
  octopus: { w: 180, h: 180, feet: null, draw: (a) => {
    const p = '#C46BC0';
    const arms = Array.from({ length: 8 }, (_, i) => {
      const x = 40 + i * 14;
      const dir = i < 4 ? -1 : 1;
      return `<path d="M${x} 100 Q${x + dir * 6} 130 ${x + dir * 14} 150 Q${x + dir * 22} 164 ${x + dir * 12} 168" stroke="${shade(p, -0.05)}" stroke-width="13" fill="none" stroke-linecap="round"/>
        <circle cx="${x + dir * 8}" cy="138" r="2.4" fill="#F8D7F6"/><circle cx="${x + dir * 13}" cy="152" r="2" fill="#F8D7F6"/>`;
    }).join('');
    return `${arms}
      <path d="M36 100 Q30 30 90 24 Q150 30 144 100 Q120 116 90 112 Q60 116 36 100Z" fill="${a.ball(p, 0.3, -0.2)}" ${edge(p)}/>
      <circle cx="62" cy="54" r="5" fill="#E9A3E5"/><circle cx="118" cy="48" r="6" fill="#E9A3E5"/><circle cx="104" cy="34" r="4" fill="#E9A3E5"/>
      ${eye(74, 76, 7)}${eye(106, 76, 7)}
      <path d="M82 94 q8 6 16 0" stroke="#7B2F78" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${shine(66, 44, 12, 7, -30, 0.4)}`;
  } },
  clownfish: { w: 160, h: 110, feet: null, draw: (a) => {
    const o = '#FF7A1A';
    const band = (x: number, w: number) => `<path d="M${x} 20 Q${x + w} 55 ${x} 90" stroke="#FFFFFF" stroke-width="${w}" fill="none"/><path d="M${x - w / 2 - 1} 22 Q${x + w / 2} 55 ${x - w / 2 - 1} 88" stroke="#1E1E1E" stroke-width="2" fill="none"/><path d="M${x + w / 2 + 1} 22 Q${x + w * 1.5} 55 ${x + w / 2 + 1} 88" stroke="#1E1E1E" stroke-width="2" fill="none"/>`;
    const id = `${a.u}fish`;
    return `<path d="M24 55 L4 30 Q12 55 4 82Z" fill="${a.ball(o)}" stroke="#1E1E1E" stroke-width="2"/>
      <path d="M70 22 Q84 4 104 14 Q96 20 96 26Z M76 88 Q88 104 104 96 Q96 90 94 84Z" fill="${a.ball(o)}" stroke="#1E1E1E" stroke-width="2"/>
      <clipPath id="${id}"><ellipse cx="82" cy="55" rx="62" ry="34"/></clipPath>
      <ellipse cx="82" cy="55" rx="62" ry="34" fill="${a.ball(o, 0.35, -0.15)}" stroke="#1E1E1E" stroke-width="2.5"/>
      <g clip-path="url(#${id})">${band(52, 12)}${band(98, 14)}${band(132, 9)}</g>
      <path d="M86 66 Q100 80 88 86 Q82 78 84 68Z" fill="${a.ball(o)}" stroke="#1E1E1E" stroke-width="1.5"/>
      ${eye(122, 46, 6)}`;
  } },

  // ===================== BIRD GARDEN =====================
  parrot: { w: 140, h: 200, feet: 188, draw: (a) => `${groundShadow(70, 190, 30, 5)}
      <path d="M54 140 Q40 176 46 196 Q58 176 64 146Z" fill="${a.ball('#1E88E5')}" ${edge('#1565C0', 1.5)}/>
      <path d="M62 142 Q60 182 70 198 Q78 178 74 146Z" fill="${a.ball('#E53935')}" ${edge('#B71C1C', 1.5)}/>
      <path d="M62 168 L58 188 M80 168 L84 188" stroke="#78909C" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 186 h14 M76 186 h14" stroke="#78909C" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 40 Q108 46 104 100 Q100 150 70 160 Q42 150 40 100 Q38 46 70 40Z" fill="${a.ball('#E53935', 0.3, -0.18)}" ${edge('#B71C1C', 2)}/>
      <path d="M44 92 Q36 130 56 152 Q74 132 72 100 Q60 86 44 92Z" fill="${a.ball('#FDD835', 0.3, -0.15)}"/>
      <path d="M48 112 Q42 140 58 154 Q68 136 64 116Z" fill="${a.ball('#1E88E5')}"/>
      <circle cx="74" cy="40" r="26" fill="${a.ball('#E53935', 0.3, -0.15)}" ${edge('#B71C1C', 2)}/>
      <path d="M78 30 Q92 26 96 40 Q86 44 78 40Z" fill="#FFFFFF"/>
      <path d="M94 34 Q118 36 112 62 Q104 54 96 52Z" fill="${a.ball('#ECEFF1', 0.2, -0.25)}" ${edge('#455A64', 1.5)}/>
      ${eye(86, 36, 4)}` },
  peacock: { w: 220, h: 200, feet: 188, draw: (a) => {
    const fan = Array.from({ length: 11 }, (_, i) => {
      const ang = -160 + i * 14;
      const r = (ang * Math.PI) / 180;
      const x = 90 + Math.cos(r) * 82, y = 120 + Math.sin(r) * 82;
      return `<path d="M90 120 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#4E8F3A" stroke-width="3"/>
        <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="13" ry="16" transform="rotate(${ang + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${a.ball('#43A047', 0.3, -0.2)}"/>
        <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="9" transform="rotate(${ang + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#FFB300"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#1A237E"/>`;
    }).join('');
    return `${groundShadow(110, 190, 60, 6)}
      ${fan}
      <path d="M104 160 L100 186 M120 160 L124 186" stroke="#90A4AE" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="112" cy="136" rx="30" ry="28" fill="${a.ball('#1565C0', 0.35, -0.2)}" ${edge('#0D47A1', 2)}/>
      <path d="M98 128 Q106 150 128 154 Q120 132 98 128Z" fill="${a.ball('#8D6E63')}"/>
      <path d="M126 120 Q134 80 146 60" stroke="#1976D2" stroke-width="16" stroke-linecap="round" fill="none"/>
      <circle cx="150" cy="54" r="14" fill="${a.ball('#1976D2', 0.35, -0.15)}" ${edge('#0D47A1', 1.5)}/>
      <path d="M146 40 l-4 -14 M150 40 l0 -16 M154 40 l4 -14" stroke="#1976D2" stroke-width="2"/>
      <circle cx="142" cy="26" r="3" fill="#1976D2"/><circle cx="150" cy="23" r="3" fill="#1976D2"/><circle cx="158" cy="26" r="3" fill="#1976D2"/>
      <path d="M162 54 l12 3 l-12 4z" fill="#BCAAA4"/>
      <path d="M150 50 q6 -3 10 2" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
      ${eye(154, 52, 3.5)}`;
  } },
  flamingo: { w: 150, h: 240, feet: 228, draw: (a) => {
    const p = '#F48FB1';
    return `${groundShadow(70, 230, 30, 5)}
      <path d="M70 146 L72 228 M72 228 l-10 2 M72 228 l10 2" stroke="#F06292" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M78 146 L86 176 L68 186" stroke="#F06292" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M30 126 Q36 96 76 98 Q112 102 110 128 Q104 152 70 152 Q40 150 30 126Z" fill="${a.ball(p, 0.3, -0.15)}" ${edge('#EC407A', 2)}/>
      <path d="M50 116 Q76 106 98 120 Q84 134 54 130Z" fill="${a.ball('#F06292')}"/>
      <path d="M30 126 l-14 -4 l8 10z" fill="#EC407A"/>
      <path d="M100 108 Q124 86 106 64 Q88 44 98 26" stroke="${p}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="104" cy="24" r="12" fill="${a.ball(p, 0.3, -0.12)}" ${edge('#EC407A', 1.5)}/>
      <path d="M112 20 Q132 22 132 36 Q128 46 120 44 Q124 34 112 30Z" fill="#FFFFFF" ${edge('#9E9E9E', 1)}/>
      <path d="M126 34 Q132 40 120 44 Q124 38 122 36Z" fill="#212121"/>
      ${eye(104, 20, 3.5)}`;
  } },
  owl: { w: 140, h: 170, feet: 158, draw: (a) => {
    const b = '#8D6E4E';
    return `${groundShadow(70, 160, 34, 5)}
      <path d="M56 152 l-4 8 M62 152 l0 8 M78 152 l0 8 M84 152 l4 8" stroke="#F9A825" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 28 Q120 34 118 100 Q116 150 70 156 Q24 150 22 100 Q20 34 70 28Z" fill="${a.ball(b, 0.3, -0.2)}" ${edge(b)}/>
      <path d="M70 80 Q100 88 98 120 Q94 148 70 150 Q46 148 42 120 Q40 88 70 80Z" fill="${a.ball('#D7C2A8')}"/>
      <path d="M56 104 q4 4 8 0 M74 104 q4 4 8 0 M64 120 q4 4 8 0 M56 134 q4 4 8 0 M76 134 q4 4 8 0" stroke="#8D6E4E" stroke-width="2" fill="none"/>
      <path d="M26 90 Q14 120 30 140 Q36 116 34 96Z M114 90 Q126 120 110 140 Q104 116 106 96Z" fill="${a.ball(shade(b, -0.15))}"/>
      <path d="M34 36 L28 14 L50 30Z M106 36 L112 14 L90 30Z" fill="${a.ball(b)}" ${edge(b, 1.5)}/>
      <circle cx="50" cy="60" r="20" fill="#EFE3D0"/><circle cx="90" cy="60" r="20" fill="#EFE3D0"/>
      <circle cx="50" cy="60" r="12" fill="#FFC107"/><circle cx="90" cy="60" r="12" fill="#FFC107"/>
      ${eye(50, 60, 7)}${eye(90, 60, 7)}
      <path d="M64 70 L76 70 L70 82Z" fill="${a.ball('#F9A825')}" ${edge('#F57F17', 1)}/>`;
  } },
};

export const ZOO_ANIMALS = Object.keys(DEFS) as ZooAnimal[];

export function zooSvg(kind: ZooAnimal, label?: string): string {
  const d = DEFS[kind];
  const a = new Art('zoo');
  return a.svg(`0 0 ${d.w} ${d.h}`, d.draw(a), { label });
}

/** Tỉ lệ cao/rộng + mức chân (0..1 theo chiều cao; null = loài bơi, căn giữa). */
export function zooGeom(kind: ZooAnimal): { aspect: number; feet: number | null } {
  const d = DEFS[kind];
  return { aspect: d.h / d.w, feet: d.feet === null ? null : d.feet / d.h };
}
