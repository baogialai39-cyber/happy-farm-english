/**
 * ĐỒ VẬT TRONG NHÀ vẽ gần thực tế (SPEC 18.6) — nhìn chính diện, đáy hình = chân đồ vật.
 * Mỗi ô bản đồ ≈ 100 đơn vị ngang trong viewBox.
 */
import { Art, edge, groundShadow, shade, shine } from './kit';

interface Def { w: number; h: number; draw(a: Art): string }

const wood = '#B07A4F';
const lightWood = '#D9A877';

const DEFS: Record<string, Def> = {
  sofa: { w: 200, h: 110, draw: (a) => {
    const c = '#E57373';
    return `${groundShadow(100, 106, 96, 6)}
      <rect x="10" y="94" width="10" height="12" fill="#5D4037"/><rect x="180" y="94" width="10" height="12" fill="#5D4037"/>
      <rect x="18" y="18" width="164" height="56" rx="18" fill="${a.side(c)}" ${edge(c)}/>
      <rect x="22" y="58" width="78" height="30" rx="12" fill="${a.ball(c, 0.25, -0.15)}" ${edge(c)}/><rect x="100" y="58" width="78" height="30" rx="12" fill="${a.ball(c, 0.25, -0.15)}" ${edge(c)}/>
      <rect x="4" y="44" width="28" height="54" rx="12" fill="${a.side(shade(c, -0.08))}" ${edge(c)}/><rect x="168" y="44" width="28" height="54" rx="12" fill="${a.side(shade(c, -0.08))}" ${edge(c)}/>
      <rect x="40" y="30" width="40" height="30" rx="10" fill="${a.ball('#FFF59D')}" ${edge('#FBC02D', 1.5)}/>${shine(60, 28, 40, 5, 0, 0.25)}`; } },
  table: { w: 100, h: 80, draw: (a) => `${groundShadow(50, 77, 44, 5)}
      <rect x="16" y="34" width="8" height="44" fill="${a.side(wood)}"/><rect x="76" y="34" width="8" height="44" fill="${a.side(wood)}"/>
      <rect x="6" y="24" width="88" height="14" rx="5" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <ellipse cx="50" cy="22" rx="14" ry="5" fill="${a.ball('#FFFFFF')}" ${edge('#BDBDBD', 1)}/><circle cx="50" cy="14" r="7" fill="${a.ball('#FF8A65')}"/>` },
  chair: { w: 100, h: 110, draw: (a) => `${groundShadow(50, 107, 34, 5)}
      <rect x="24" y="10" width="52" height="54" rx="8" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <rect x="32" y="20" width="36" height="8" rx="3" fill="${shade(lightWood, -0.12)}"/><rect x="32" y="36" width="36" height="8" rx="3" fill="${shade(lightWood, -0.12)}"/>
      <rect x="20" y="62" width="60" height="12" rx="4" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <rect x="24" y="72" width="7" height="34" fill="${a.side(wood)}"/><rect x="69" y="72" width="7" height="34" fill="${a.side(wood)}"/>` },
  television: { w: 100, h: 100, draw: (a) => `${groundShadow(50, 97, 40, 5)}
      <rect x="20" y="72" width="60" height="24" rx="4" fill="${a.side(wood)}" ${edge(wood)}/>
      <rect x="44" y="62" width="12" height="12" fill="#424242"/>
      <rect x="6" y="8" width="88" height="58" rx="6" fill="#263238" ${edge('#263238')}/>
      <rect x="12" y="14" width="76" height="46" rx="3" fill="${a.lin([[0, '#81D4FA'], [1, '#4FC3F7']])}"/>
      <path d="M12 52 Q30 36 50 48 Q70 30 88 44 L88 60 L12 60Z" fill="#81C784"/><circle cx="74" cy="24" r="6" fill="#FFF176"/>
      <path d="M14 16 L40 16 L22 34Z" fill="#fff" opacity=".25"/>` },
  clock: { w: 100, h: 150, draw: (a) => `${groundShadow(50, 147, 30, 5)}
      <rect x="26" y="28" width="48" height="118" rx="8" fill="${a.side(wood)}" ${edge(wood)}/>
      <rect x="36" y="78" width="28" height="56" rx="6" fill="#FFF8E1" opacity=".55"/>
      <line x1="50" y1="80" x2="50" y2="118" stroke="#C9A227" stroke-width="2"/><circle cx="50" cy="120" r="7" fill="${a.ball('#FFD54F')}"/>
      <circle cx="50" cy="40" r="28" fill="${a.ball(wood)}" ${edge(wood)}/>
      <circle cx="50" cy="40" r="21" fill="${a.ball('#FFFDF5', 0.1, -0.08)}" ${edge('#BCAAA4', 1.5)}/>
      ${Array.from({ length: 12 }, (_, i) => { const r = (i * 30 * Math.PI) / 180; return `<circle cx="${50 + Math.sin(r) * 16}" cy="${40 - Math.cos(r) * 16}" r="1.6" fill="#5D4037"/>`; }).join('')}
      <path d="M50 40 L50 27 M50 40 L59 44" stroke="#3E2723" stroke-width="3" stroke-linecap="round"/>` },
  window: { w: 100, h: 90, draw: (a) => `
      <rect x="6" y="6" width="88" height="78" rx="6" fill="${a.side('#FFFFFF')}" ${edge('#BDBDBD', 2)}/>
      <rect x="14" y="14" width="72" height="62" rx="3" fill="${a.lin([[0, '#90CAF9'], [1, '#E3F2FD']])}"/>
      <path d="M14 60 Q34 46 50 56 Q66 44 86 54 L86 76 L14 76Z" fill="#A5D6A7"/><circle cx="70" cy="28" r="7" fill="#FFF59D"/>
      <rect x="47" y="14" width="6" height="62" fill="#FFFFFF"/><rect x="14" y="42" width="72" height="6" fill="#FFFFFF"/>
      <path d="M18 18 L40 18 L18 40Z" fill="#fff" opacity=".35"/>
      <path d="M2 4 Q14 50 8 86 L18 86 Q24 46 16 4Z M98 4 Q86 50 92 86 L82 86 Q76 46 84 4Z" fill="${a.side('#F48FB1')}" opacity=".9"/>` },
  bed: { w: 200, h: 200, draw: (a) => { const b = '#9575CD';
    return `${groundShadow(100, 196, 96, 6)}
      <rect x="6" y="10" width="188" height="60" rx="16" fill="${a.side(wood)}" ${edge(wood)}/>
      <rect x="14" y="40" width="172" height="150" rx="14" fill="${a.side('#FFFFFF')}" ${edge('#CFD8DC')}/>
      <rect x="30" y="48" width="64" height="34" rx="14" fill="${a.ball('#FFFFFF', 0.1, -0.1)}" ${edge('#CFD8DC', 1.5)}/><rect x="106" y="48" width="64" height="34" rx="14" fill="${a.ball('#FFFFFF', 0.1, -0.1)}" ${edge('#CFD8DC', 1.5)}/>
      <path d="M14 96 Q100 84 186 96 L186 176 Q186 190 172 190 L28 190 Q14 190 14 176Z" fill="${a.side(b, 0.25, -0.15)}" ${edge(b)}/>
      ${[110, 130, 150, 170].map((y) => `<path d="M20 ${y} Q100 ${y - 8} 180 ${y}" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`).join('')}
      <rect x="6" y="184" width="10" height="14" fill="#5D4037"/><rect x="184" y="184" width="10" height="14" fill="#5D4037"/>`; } },
  pillow: { w: 100, h: 70, draw: (a) => `${groundShadow(50, 64, 40, 5)}<path d="M10 20 Q50 2 90 20 Q98 36 90 50 Q50 66 10 50 Q2 36 10 20Z" fill="${a.ball('#FFFFFF', 0.1, -0.12)}" ${edge('#B0BEC5')}/><path d="M24 30 Q50 22 76 30" stroke="#CFD8DC" stroke-width="2" fill="none"/>` },
  blanket: { w: 100, h: 80, draw: (a) => `${groundShadow(50, 76, 42, 5)}<path d="M8 14 Q50 4 92 14 L92 66 Q50 76 8 66Z" fill="${a.side('#9575CD', 0.25, -0.15)}" ${edge('#7E57C2')}/>
      ${[24, 38, 52].map((y) => `<path d="M8 ${y} Q50 ${y - 6} 92 ${y}" stroke="#fff" stroke-width="3" opacity=".4" fill="none"/>`).join('')}<path d="M8 66 Q50 76 92 66 L92 72 Q50 82 8 72Z" fill="#B39DDB"/>` },
  wardrobe: { w: 200, h: 170, draw: (a) => `${groundShadow(100, 166, 92, 6)}
      <rect x="10" y="6" width="180" height="156" rx="8" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <rect x="18" y="16" width="78" height="138" rx="5" fill="${a.side(shade(lightWood, 0.06))}" ${edge(wood, 1.5)}/><rect x="104" y="16" width="78" height="138" rx="5" fill="${a.side(shade(lightWood, 0.06))}" ${edge(wood, 1.5)}/>
      <circle cx="88" cy="86" r="4" fill="${a.ball('#FFD54F')}"/><circle cx="112" cy="86" r="4" fill="${a.ball('#FFD54F')}"/>
      <rect x="10" y="160" width="12" height="8" fill="#5D4037"/><rect x="178" y="160" width="12" height="8" fill="#5D4037"/>` },
  lamp: { w: 100, h: 160, draw: (a) => `${groundShadow(50, 157, 26, 5)}
      <ellipse cx="50" cy="152" rx="22" ry="6" fill="${a.ball('#8D6E63')}"/><rect x="47" y="50" width="6" height="102" fill="${a.side('#9E9E9E')}"/>
      <path d="M24 56 L34 14 L66 14 L76 56Z" fill="${a.side('#FFE082', 0.3, -0.1)}" ${edge('#FFB300')}/><circle cx="50" cy="56" r="6" fill="#FFF59D"/>` },
  refrigerator: { w: 100, h: 170, draw: (a) => `${groundShadow(50, 167, 42, 5)}
      <rect x="10" y="6" width="80" height="158" rx="12" fill="${a.side('#F5F7FA', 0.2, -0.1)}" ${edge('#B0BEC5')}/>
      <line x1="10" y1="64" x2="90" y2="64" stroke="#B0BEC5" stroke-width="2.5"/>
      <rect x="74" y="24" width="6" height="28" rx="3" fill="#90A4AE"/><rect x="74" y="78" width="6" height="40" rx="3" fill="#90A4AE"/>
      <circle cx="30" cy="30" r="5" fill="#EF5350"/><rect x="24" y="90" width="20" height="14" rx="2" fill="#FFF59D" transform="rotate(-6 34 97)"/>${shine(26, 100, 6, 40, 0, 0.35)}` },
  'kitchen shelf': { w: 100, h: 140, draw: (a) => `${groundShadow(50, 137, 44, 5)}
      <rect x="6" y="6" width="88" height="128" rx="6" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <rect x="12" y="44" width="76" height="5" fill="${wood}"/><rect x="12" y="88" width="76" height="5" fill="${wood}"/>
      <ellipse cx="32" cy="34" rx="16" ry="8" fill="${a.ball('#FFFFFF')}" ${edge('#BDBDBD', 1)}/><rect x="58" y="18" width="20" height="24" rx="4" fill="${a.ball('#4FC3F7')}"/>
      <path d="M22 70 Q34 86 46 70Z" fill="${a.ball('#FFB74D')}"/><ellipse cx="68" cy="78" rx="14" ry="8" fill="${a.ball('#9E9E9E')}"/><rect x="66" y="58" width="4" height="18" fill="#757575"/>
      <path d="M24 106 L24 128 M34 106 L34 128" stroke="#9E9E9E" stroke-width="4" stroke-linecap="round"/><ellipse cx="62" cy="116" rx="16" ry="10" fill="${a.ball('#455A64')}"/>` },
  stove: { w: 200, h: 120, draw: (a) => `${groundShadow(100, 116, 96, 6)}
      <rect x="6" y="40" width="188" height="74" rx="8" fill="${a.side('#ECEFF1')}" ${edge('#B0BEC5')}/>
      <rect x="20" y="60" width="160" height="40" rx="6" fill="#37474F"/><rect x="28" y="66" width="144" height="28" rx="4" fill="#FF8A65" opacity=".35"/>
      ${[40, 70, 130, 160].map((x) => `<circle cx="${x}" cy="50" r="5" fill="#90A4AE"/>`).join('')}
      <ellipse cx="56" cy="36" rx="34" ry="9" fill="${a.ball('#424242')}" ${edge('#212121', 1.5)}/><rect x="86" y="32" width="34" height="7" rx="3" fill="#212121"/>
      <rect x="128" y="6" width="54" height="32" rx="6" fill="${a.side('#B0BEC5', 0.25, -0.2)}" ${edge('#78909C')}/><rect x="122" y="4" width="66" height="7" rx="3" fill="#90A4AE"/><rect x="148" y="0" width="14" height="6" rx="3" fill="#607D8B"/>` },
  sink: { w: 100, h: 110, draw: (a) => `${groundShadow(50, 107, 44, 5)}
      <rect x="6" y="40" width="88" height="66" rx="6" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <rect x="2" y="32" width="96" height="12" rx="4" fill="${a.side('#ECEFF1')}" ${edge('#B0BEC5')}/>
      <ellipse cx="50" cy="38" rx="30" ry="6" fill="#90A4AE"/>
      <path d="M50 32 L50 14 Q50 8 58 8 L66 8" stroke="#B0BEC5" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="70" r="4" fill="#8D6E63"/><circle cx="70" cy="70" r="4" fill="#8D6E63"/>` },
  'dining table': { w: 200, h: 100, draw: (a) => `${groundShadow(100, 96, 94, 6)}
      <rect x="20" y="36" width="10" height="60" fill="${a.side(wood)}"/><rect x="170" y="36" width="10" height="60" fill="${a.side(wood)}"/>
      <rect x="6" y="24" width="188" height="16" rx="6" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <ellipse cx="60" cy="22" rx="20" ry="6" fill="${a.ball('#FFFFFF')}" ${edge('#BDBDBD', 1)}/><ellipse cx="140" cy="22" rx="20" ry="6" fill="${a.ball('#FFFFFF')}" ${edge('#BDBDBD', 1)}/>
      <path d="M86 22 L86 6 M114 22 L114 6" stroke="#9E9E9E" stroke-width="3" stroke-linecap="round"/><rect x="94" y="8" width="12" height="14" rx="3" fill="${a.ball('#4FC3F7')}"/>` },
  bookshelf: { w: 100, h: 150, draw: (a) => `${groundShadow(50, 147, 44, 5)}
      <rect x="6" y="6" width="88" height="138" rx="6" fill="${a.side(wood)}" ${edge(wood)}/>
      ${[16, 58, 100].map((y, r) => `<rect x="12" y="${y + 34}" width="76" height="5" fill="${shade(wood, -0.2)}"/>` + [0, 1, 2, 3, 4].map((i) => `<rect x="${16 + i * 14}" y="${y + 4 + (i % 2) * 4}" width="11" height="${30 - (i % 2) * 4}" rx="2" fill="${['#EF5350', '#42A5F5', '#66BB6A', '#FFCA28', '#AB47BC'][(i + r) % 5]}"/>`).join('')).join('')}` },
  piano: { w: 100, h: 110, draw: (a) => `${groundShadow(50, 107, 44, 5)}
      <rect x="6" y="6" width="88" height="70" rx="6" fill="${a.side('#3E2723')}" ${edge('#3E2723')}/>
      <rect x="4" y="60" width="92" height="22" rx="3" fill="#FFFFFF" ${edge('#9E9E9E', 1.5)}/>
      ${Array.from({ length: 7 }, (_, i) => `<line x1="${4 + (i + 1) * 13}" y1="60" x2="${4 + (i + 1) * 13}" y2="82" stroke="#BDBDBD"/>`).join('')}
      ${[1, 2, 4, 5, 6].map((i) => `<rect x="${i * 13 - 1}" y="60" width="7" height="13" fill="#212121"/>`).join('')}
      <rect x="10" y="80" width="8" height="26" fill="#3E2723"/><rect x="82" y="80" width="8" height="26" fill="#3E2723"/>` },
  toybox: { w: 100, h: 90, draw: (a) => `${groundShadow(50, 87, 44, 5)}
      <rect x="8" y="34" width="84" height="52" rx="8" fill="${a.side('#4DB6AC')}" ${edge('#00897B')}/>
      <circle cx="30" cy="30" r="14" fill="${a.ball('#EF5350')}"/><path d="M52 34 Q60 6 72 30Z" fill="${a.ball('#FFCA28')}"/><circle cx="74" cy="22" r="10" fill="${a.ball('#A1887F')}"/><circle cx="68" cy="14" r="4" fill="${a.ball('#A1887F')}"/><circle cx="80" cy="14" r="4" fill="${a.ball('#A1887F')}"/>
      <rect x="4" y="30" width="92" height="10" rx="4" fill="${a.side('#26A69A')}"/><path d="M40 60 l6 -10 l6 10z" fill="#FFF59D"/>` },
  'mixing bowl': { w: 200, h: 100, draw: (a) => `${groundShadow(100, 96, 94, 6)}
      <rect x="8" y="40" width="184" height="54" rx="6" fill="${a.side(lightWood)}" ${edge(wood)}/>
      <path d="M40 26 Q70 64 100 26Z" fill="${a.ball('#90CAF9')}" ${edge('#42A5F5', 1.5)}/><ellipse cx="70" cy="26" rx="30" ry="6" fill="#FFF8E1"/>
      <path d="M86 22 L104 4" stroke="#8D6E63" stroke-width="4" stroke-linecap="round"/>
      <rect x="128" y="10" width="22" height="30" rx="4" fill="${a.side('#FFFFFF')}" ${edge('#BDBDBD', 1)}/><text x="139" y="30" font-size="10" text-anchor="middle" fill="#8D6E63">FLOUR</text>
      <ellipse cx="168" cy="34" rx="14" ry="6" fill="${a.ball('#FFFFFF')}"/><circle cx="164" cy="30" r="5" fill="${a.ball('#FFF8E1')}"/><circle cx="172" cy="30" r="5" fill="${a.ball('#FFF8E1')}"/>` },
  oven: { w: 100, h: 120, draw: (a) => `${groundShadow(50, 117, 44, 5)}
      <rect x="6" y="6" width="88" height="108" rx="8" fill="${a.side('#ECEFF1')}" ${edge('#90A4AE')}/>
      ${[24, 42, 60, 78].map((x) => `<circle cx="${x}" cy="18" r="5" fill="#90A4AE"/>`).join('')}
      <rect x="14" y="34" width="72" height="62" rx="6" fill="#455A64"/><rect x="20" y="40" width="60" height="50" rx="4" fill="${a.lin([[0, '#FFCC80'], [1, '#FF8A65']])}" opacity=".75"/>
      <rect x="22" y="100" width="56" height="6" rx="3" fill="#B0BEC5"/>` },
  toothbrush: { w: 100, h: 110, draw: (a) => `${groundShadow(50, 107, 40, 5)}
      <rect x="10" y="74" width="80" height="32" rx="6" fill="${a.side('#FFFFFF')}" ${edge('#B0BEC5')}/>
      <path d="M36 74 L40 40 L60 40 L64 74Z" fill="${a.side('#4FC3F7', 0.3, -0.1)}" ${edge('#0288D1', 1.5)}/>
      <rect x="40" y="6" width="7" height="50" rx="3" fill="#EF5350" transform="rotate(-10 44 30)"/><rect x="36" y="2" width="12" height="12" rx="2" fill="#FFFFFF" transform="rotate(-10 42 8)" ${edge('#B0BEC5', 1)}/>
      <rect x="54" y="8" width="7" height="48" rx="3" fill="#66BB6A" transform="rotate(10 58 32)"/><rect x="52" y="4" width="12" height="12" rx="2" fill="#FFFFFF" transform="rotate(10 58 10)" ${edge('#B0BEC5', 1)}/>
      <rect x="66" y="50" width="16" height="24" rx="4" fill="${a.side('#B39DDB')}"/>` },
  towel: { w: 100, h: 130, draw: (a) => `${groundShadow(50, 127, 30, 5)}
      <rect x="46" y="30" width="8" height="96" fill="${a.side('#B0BEC5')}"/><ellipse cx="50" cy="124" rx="22" ry="5" fill="#90A4AE"/>
      <rect x="14" y="20" width="72" height="8" rx="4" fill="${a.side('#B0BEC5')}" ${edge('#78909C', 1.5)}/>
      <path d="M18 24 L82 24 L80 92 Q50 98 20 92Z" fill="${a.side('#4DD0E1', 0.3, -0.15)}" ${edge('#0097A7')}/>
      <path d="M22 78 L78 78 M22 84 L78 84" stroke="#fff" stroke-width="3" opacity=".7"/>` },
  soap: { w: 100, h: 90, draw: (a) => `${groundShadow(50, 87, 36, 5)}
      <rect x="40" y="40" width="20" height="46" fill="${a.side('#ECEFF1')}"/>
      <ellipse cx="50" cy="40" rx="36" ry="10" fill="${a.ball('#B2EBF2')}" ${edge('#4DD0E1', 1.5)}/>
      <rect x="28" y="20" width="44" height="22" rx="10" fill="${a.ball('#F8BBD0', 0.35, -0.15)}" ${edge('#EC407A', 1.5)}/>
      ${[[24, 14, 6], [78, 10, 5], [64, 4, 4], [36, 6, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#E1F5FE" stroke="#81D4FA" stroke-width="1"/>`).join('')}` },
  mirror: { w: 100, h: 150, draw: (a) => `${groundShadow(50, 147, 34, 5)}
      <rect x="18" y="96" width="64" height="48" rx="6" fill="${a.side('#FFFFFF')}" ${edge('#B0BEC5')}/>
      <ellipse cx="50" cy="52" rx="34" ry="44" fill="${a.side('#FFD54F')}" ${edge('#FFA000')}/>
      <ellipse cx="50" cy="52" rx="27" ry="37" fill="${a.lin([[0, '#E3F2FD'], [1, '#B3E5FC']])}"/>
      <path d="M34 30 L48 22 L36 62Z" fill="#fff" opacity=".6"/>` },
  // ----- đồ nhỏ trong bếp (bảng cận cảnh) -----
  spoon: { w: 100, h: 100, draw: (a) => `<g transform="rotate(-35 50 50)"><ellipse cx="50" cy="26" rx="14" ry="20" fill="${a.ball('#CFD8DC', 0.5, -0.25)}" ${edge('#78909C')}/><rect x="46" y="44" width="8" height="52" rx="4" fill="${a.side('#B0BEC5')}" ${edge('#78909C', 1.5)}/>${shine(45, 20, 4, 9, 0)}</g>` },
  fork: { w: 100, h: 100, draw: (a) => `<g transform="rotate(-35 50 50)"><path d="M36 6 L36 30 Q36 42 46 44 L46 96 L54 96 L54 44 Q64 42 64 30 L64 6 L59 6 L59 28 L55 28 L55 6 L45 6 L45 28 L41 28 L41 6Z" fill="${a.side('#CFD8DC', 0.3, -0.2)}" ${edge('#78909C', 1.5)}/></g>` },
  plate: { w: 100, h: 100, draw: (a) => `<ellipse cx="50" cy="56" rx="44" ry="30" fill="${a.ball('#FFFFFF', 0.1, -0.12)}" ${edge('#B0BEC5')}/><ellipse cx="50" cy="56" rx="28" ry="18" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="2"/><ellipse cx="50" cy="56" rx="38" ry="25" fill="none" stroke="#90CAF9" stroke-width="2.5"/>` },
  cup: { w: 100, h: 100, draw: (a) => `<path d="M22 24 L78 24 L72 86 Q50 94 28 86Z" fill="${a.side('#4FC3F7', 0.35, -0.15)}" ${edge('#0288D1')}/><ellipse cx="50" cy="24" rx="28" ry="7" fill="#B3E5FC" ${edge('#0288D1', 1.5)}/><path d="M76 38 Q96 40 92 58 Q88 72 72 70" stroke="#0288D1" stroke-width="6" fill="none"/>${shine(36, 54, 4, 18, 0, 0.4)}` },
  bowl: { w: 100, h: 100, draw: (a) => `<path d="M10 40 Q50 104 90 40Z" fill="${a.ball('#FFB74D', 0.35, -0.2)}" ${edge('#EF6C00')}/><ellipse cx="50" cy="40" rx="40" ry="9" fill="#FFE0B2" ${edge('#EF6C00', 1.5)}/><path d="M24 56 Q50 70 76 56" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>` },
  pan: { w: 100, h: 100, draw: (a) => `<ellipse cx="40" cy="54" rx="34" ry="26" fill="${a.ball('#424242', 0.3, -0.3)}" ${edge('#212121')}/><ellipse cx="40" cy="52" rx="26" ry="19" fill="#616161"/><rect x="70" y="48" width="28" height="9" rx="4" fill="${a.side('#5D4037')}" transform="rotate(-15 70 52)"/>${shine(30, 44, 8, 4, -10, 0.25)}` },
  pot: { w: 100, h: 100, draw: (a) => `<rect x="16" y="34" width="68" height="54" rx="10" fill="${a.side('#B0BEC5', 0.3, -0.2)}" ${edge('#607D8B')}/><rect x="10" y="28" width="80" height="10" rx="5" fill="#90A4AE" ${edge('#607D8B', 1.5)}/><rect x="40" y="18" width="20" height="10" rx="5" fill="#607D8B"/>
      <rect x="2" y="48" width="14" height="8" rx="4" fill="#607D8B"/><rect x="84" y="48" width="14" height="8" rx="4" fill="#607D8B"/>${shine(30, 60, 4, 16, 0, 0.35)}` },
};

export const HOUSEHOLD_IDS = Object.keys(DEFS);

export function householdSvg(id: string, label?: string): string | null {
  const d = DEFS[id];
  if (!d) return null;
  const a = new Art(`hh${id.replace(/\W/g, '')}`);
  return a.svg(`0 0 ${d.w} ${d.h}`, d.draw(a), { label });
}

export function householdAspect(id: string): number {
  const d = DEFS[id];
  return d ? d.h / d.w : 1;
}
