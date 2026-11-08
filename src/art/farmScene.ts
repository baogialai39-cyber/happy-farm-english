/**
 * Cảnh nông trại kiểu 3D mềm, pastel — vẽ hoàn toàn bằng SVG.
 * Chuyển động (mây, cối xay, mặt trời, con vật) điều khiển bằng CSS, tắt khi prefers-reduced-motion.
 */
import { blob3d, nextUid, vgrad } from './color';

function cloud(u: string, x: number, y: number, s: number, cls: string): string {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="cloud ${cls}">
    <ellipse cx="0" cy="40" rx="120" ry="20" fill="#9FB7E0" opacity=".12"/>
    <circle cx="-60" cy="10" r="38" fill="url(#${u}cloud)"/>
    <circle cx="-10" cy="-14" r="52" fill="url(#${u}cloud)"/>
    <circle cx="50" cy="0" r="44" fill="url(#${u}cloud)"/>
    <circle cx="92" cy="18" r="28" fill="url(#${u}cloud)"/>
    <rect x="-92" y="10" width="200" height="36" rx="18" fill="url(#${u}cloud)"/>
  </g></g>`;
}

function tree(u: string, x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="6" rx="70" ry="14" fill="#5E8C5A" opacity=".18"/>
    <rect x="-14" y="-90" width="28" height="96" rx="12" fill="url(#${u}trunk)"/>
    <circle cx="-38" cy="-120" r="52" fill="url(#${u}leaf)"/>
    <circle cx="36" cy="-118" r="54" fill="url(#${u}leaf)"/>
    <circle cx="0" cy="-168" r="62" fill="url(#${u}leaf)"/>
    <circle cx="-30" cy="-150" r="9" fill="#FF9CB0"/><circle cx="30" cy="-128" r="9" fill="#FF9CB0"/>
    <circle cx="10" cy="-190" r="9" fill="#FF9CB0"/>
  </g>`;
}

function barn(u: string): string {
  return `<g transform="translate(250 330)">
    <ellipse cx="160" cy="318" rx="210" ry="26" fill="#5E8C5A" opacity=".2"/>
    <path d="M10 140 L160 30 L310 140 L310 312 L10 312Z" fill="url(#${u}barnWall)"/>
    <path d="M-12 150 L160 14 L332 150 L312 162 L160 46 L8 162Z" fill="url(#${u}roof)"/>
    <path d="M110 190 h100 v122 h-100z" fill="#FFF4EC"/>
    <path d="M118 198 h84 v114 h-84z" fill="url(#${u}door)"/>
    <path d="M118 198 L202 312 M202 198 L118 312" stroke="#FFF4EC" stroke-width="10"/>
    <circle cx="160" cy="112" r="30" fill="#FFF4EC"/>
    <circle cx="160" cy="112" r="22" fill="#FFD9A0"/>
    <path d="M160 92 v40 M140 112 h40" stroke="#FFF4EC" stroke-width="6"/>
    <rect x="30" y="200" width="56" height="56" rx="10" fill="#FFF4EC"/>
    <rect x="36" y="206" width="44" height="44" rx="8" fill="#BFE3FF"/>
    <rect x="234" y="200" width="56" height="56" rx="10" fill="#FFF4EC"/>
    <rect x="240" y="206" width="44" height="44" rx="8" fill="#BFE3FF"/>
    <path d="M10 140 L160 30 L172 40 L30 150Z" fill="#fff" opacity=".18"/>
  </g>`;
}

function windmill(u: string): string {
  const blade = (a: number) =>
    `<path d="M0 0 L-16 -8 L-22 -150 Q0 -164 22 -150 L16 -8Z" transform="rotate(${a})" fill="url(#${u}blade)" stroke="#fff" stroke-width="4"/>`;
  return `<g transform="translate(1260 300)">
    <ellipse cx="0" cy="330" rx="120" ry="20" fill="#5E8C5A" opacity=".2"/>
    <path d="M-60 330 L-34 40 L34 40 L60 330Z" fill="url(#${u}mill)"/>
    <path d="M-34 40 L0 -4 L34 40Z" fill="url(#${u}roof)"/>
    <rect x="-18" y="250" width="36" height="80" rx="18" fill="#C9B6E4"/>
    <circle cx="0" cy="140" r="16" fill="#BFE3FF" stroke="#fff" stroke-width="5"/>
    <g transform="translate(0 40)"><g class="spin">
      <circle r="168" fill="none"/>
      ${blade(0)}${blade(90)}${blade(180)}${blade(270)}
      <circle r="18" fill="url(#${u}hub)"/>
    </g></g>
  </g>`;
}

function chicken(u: string, x: number, y: number, cls: string): string {
  return `<g transform="translate(${x} ${y})"><g class="bob ${cls}">
    <ellipse cx="0" cy="58" rx="54" ry="10" fill="#5E8C5A" opacity=".2"/>
    <path d="M-18 40 v18 M14 40 v18" stroke="#FFAE5C" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="0" cy="12" rx="50" ry="40" fill="url(#${u}white)"/>
    <path d="M-48 4 Q-74 -18 -60 24 Z" fill="url(#${u}white)"/>
    <circle cx="30" cy="-26" r="28" fill="url(#${u}white)"/>
    <path d="M22 -52 q6 -16 14 -4 q8 -14 14 2 q4 10 -8 10 h-18z" fill="#FF8FA3"/>
    <path d="M54 -26 l16 6 l-16 6z" fill="#FFB347"/>
    <path d="M44 -10 q6 10 0 16 q-8 -4 0 -16z" fill="#FF8FA3"/>
    <circle cx="38" cy="-30" r="5" fill="#3A2B35"/><circle cx="39.5" cy="-31.5" r="1.6" fill="#fff"/>
    <ellipse cx="-6" cy="14" rx="22" ry="14" fill="#F1EEF7"/>
  </g></g>`;
}

function pig(u: string, x: number, y: number, cls: string): string {
  return `<g transform="translate(${x} ${y})"><g class="bob ${cls}">
    <ellipse cx="0" cy="62" rx="80" ry="12" fill="#5E8C5A" opacity=".2"/>
    <rect x="-46" y="30" width="20" height="32" rx="9" fill="#F7A9BD"/><rect x="26" y="30" width="20" height="32" rx="9" fill="#F7A9BD"/>
    <ellipse cx="0" cy="12" rx="76" ry="50" fill="url(#${u}pink)"/>
    <path d="M-76 6 q-18 -4 -12 10 q6 8 -4 12" fill="none" stroke="#F7A9BD" stroke-width="5" stroke-linecap="round"/>
    <circle cx="52" cy="-10" r="40" fill="url(#${u}pink)"/>
    <path d="M30 -44 l-6 -22 l22 12z M70 -44 l10 -20 l-24 8z" fill="#F7A9BD"/>
    <ellipse cx="78" cy="2" rx="18" ry="14" fill="#FF9CB6"/>
    <circle cx="72" cy="2" r="3.5" fill="#C9677F"/><circle cx="84" cy="2" r="3.5" fill="#C9677F"/>
    <circle cx="48" cy="-18" r="5" fill="#3A2B35"/><circle cx="68" cy="-22" r="5" fill="#3A2B35"/>
    <circle cx="49.5" cy="-19.5" r="1.6" fill="#fff"/><circle cx="69.5" cy="-23.5" r="1.6" fill="#fff"/>
  </g></g>`;
}

function sheep(u: string, x: number, y: number, cls: string): string {
  const wool = [
    [-50, 0], [-24, -24], [8, -28], [40, -18], [52, 10], [24, 26], [-12, 28], [-44, 22], [0, 0],
  ]
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="30" fill="url(#${u}wool)"/>`)
    .join('');
  return `<g transform="translate(${x} ${y})"><g class="bob ${cls}">
    <ellipse cx="0" cy="66" rx="80" ry="12" fill="#5E8C5A" opacity=".2"/>
    <rect x="-38" y="30" width="14" height="36" rx="7" fill="#6D5C73"/><rect x="22" y="30" width="14" height="36" rx="7" fill="#6D5C73"/>
    ${wool}
    <ellipse cx="-74" cy="-4" rx="28" ry="32" fill="#8A7790"/>
    <ellipse cx="-100" cy="-12" rx="14" ry="7" fill="#8A7790" transform="rotate(-20 -100 -12)"/>
    <circle cx="-74" cy="-34" r="16" fill="url(#${u}wool)"/>
    <circle cx="-84" cy="-6" r="4.5" fill="#fff"/><circle cx="-66" cy="-6" r="4.5" fill="#fff"/>
    <circle cx="-84" cy="-6" r="2.4" fill="#3A2B35"/><circle cx="-66" cy="-6" r="2.4" fill="#3A2B35"/>
    <path d="M-80 12 q6 6 12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </g></g>`;
}

function fence(): string {
  let posts = '';
  for (let x = -40; x <= 1640; x += 70) {
    posts += `<rect x="${x}" y="-46" width="26" height="76" rx="10" fill="#FFF8F0"/><rect x="${x + 4}" y="-42" width="8" height="66" rx="4" fill="#fff"/>`;
  }
  return `<g transform="translate(0 690)" opacity=".95">
    <rect x="-40" y="-30" width="1720" height="16" rx="8" fill="#F3E6DA"/>
    <rect x="-40" y="0" width="1720" height="16" rx="8" fill="#F3E6DA"/>
    ${posts}
  </g>`;
}

function flowers(): string {
  const colors = ['#FF9CB0', '#FFD36E', '#C3B1E1', '#9EE6CF', '#FFB38A'];
  let s = '';
  for (let i = 0; i < 26; i++) {
    const x = 40 + ((i * 263) % 1540);
    const y = 760 + ((i * 97) % 120);
    const c = colors[i % colors.length];
    s += `<g transform="translate(${x} ${y})"><circle cx="-7" cy="0" r="7" fill="${c}"/><circle cx="7" cy="0" r="7" fill="${c}"/><circle cx="0" cy="-7" r="7" fill="${c}"/><circle cx="0" cy="7" r="7" fill="${c}"/><circle r="5" fill="#FFF6B8"/></g>`;
  }
  return s;
}

export function farmSceneSvg(opts: { animals?: boolean } = {}): string {
  const u = nextUid('farm');
  const animals = opts.animals ?? true;
  return `<svg class="farm-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    ${vgrad(`${u}sky`, '#BFE6FF', '#FFE8F2')}
    <radialGradient id="${u}sun" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFFBD6"/><stop offset="1" stop-color="#FFD36E"/></radialGradient>
    ${blob3d(`${u}cloud`, '#FFFFFF', 0, -0.06)}
    ${vgrad(`${u}hillBack`, '#CFF2C2', '#A9DFA0')}
    ${vgrad(`${u}hillMid`, '#BDEBAE', '#93D58F')}
    ${vgrad(`${u}hillFront`, '#B2E79F', '#86CB7F')}
    ${vgrad(`${u}trunk`, '#C89F83', '#A57C62')}
    ${blob3d(`${u}leaf`, '#9ED99A', 0.35, -0.2)}
    ${vgrad(`${u}barnWall`, '#FFB8B8', '#F59494')}
    ${vgrad(`${u}roof`, '#B79CE0', '#9277C8')}
    ${vgrad(`${u}door`, '#F59494', '#E07B7B')}
    ${vgrad(`${u}mill`, '#FFF8F0', '#EADCF5')}
    ${vgrad(`${u}blade`, '#FFE1EC', '#FFC2D6')}
    ${blob3d(`${u}hub`, '#FFD36E')}
    ${blob3d(`${u}white`, '#FFFFFF', 0, -0.1)}
    ${blob3d(`${u}pink`, '#FFC6D5', 0.35, -0.12)}
    ${blob3d(`${u}wool`, '#FFFFFF', 0, -0.08)}
    ${blob3d(`${u}pond`, '#A7DBFF', 0.3, -0.15)}
  </defs>
  <rect width="1600" height="900" fill="url(#${u}sky)"/>
  <g transform="translate(1380 150)">
    <g class="spin slow"><circle r="130" fill="none"/>${[0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `<rect x="-8" y="-128" width="16" height="36" rx="8" fill="#FFE59A" transform="rotate(${a})"/>`)
      .join('')}</g>
    <circle r="80" fill="url(#${u}sun)"/>
    <circle cx="-26" cy="-6" r="7" fill="#7A5C4A"/><circle cx="26" cy="-6" r="7" fill="#7A5C4A"/>
    <path d="M-22 18 Q0 38 22 18" fill="none" stroke="#7A5C4A" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="-44" cy="16" rx="12" ry="7" fill="#FF9CB0" opacity=".5"/><ellipse cx="44" cy="16" rx="12" ry="7" fill="#FF9CB0" opacity=".5"/>
  </g>
  ${cloud(u, 260, 150, 0.9, 'c1')}
  ${cloud(u, 900, 110, 0.7, 'c2')}
  ${cloud(u, 1500, 260, 0.6, 'c3')}
  <path d="M-20 560 Q300 420 640 520 Q980 400 1300 500 Q1500 450 1640 520 L1640 900 L-20 900Z" fill="url(#${u}hillBack)"/>
  ${tree(u, 120, 600, 0.9)}
  ${tree(u, 1480, 590, 0.8)}
  ${windmill(u)}
  <path d="M-20 650 Q400 560 820 640 Q1200 580 1640 650 L1640 900 L-20 900Z" fill="url(#${u}hillMid)"/>
  ${barn(u)}
  ${tree(u, 700, 660, 0.7)}
  ${fence()}
  <path d="M-20 740 Q500 690 900 740 Q1300 700 1640 750 L1640 900 L-20 900Z" fill="url(#${u}hillFront)"/>
  <ellipse cx="1320" cy="820" rx="150" ry="36" fill="url(#${u}pond)"/>
  <ellipse cx="1280" cy="808" rx="50" ry="8" fill="#fff" opacity=".5"/>
  ${flowers()}
  ${animals ? chicken(u, 520, 780, 'd1') + pig(u, 1040, 790, 'd2') + sheep(u, 260, 800, 'd3') : ''}
</svg>`;
}
