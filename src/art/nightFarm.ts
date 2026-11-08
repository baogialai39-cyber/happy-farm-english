/**
 * Ngôi nhà nông trại BAN ĐÊM (SPEC 17.3) — SVG, màu dịu, sao lấp lánh CHẬM (không nhấp nháy mạnh — A8).
 */
import { nextUid } from './color';

export function nightFarmSvg(): string {
  const u = nextUid('night');
  const stars = [
    [120, 90, 3], [260, 60, 2.5], [420, 120, 3], [560, 50, 2], [700, 100, 3], [860, 70, 2.5], [980, 140, 2],
    [200, 180, 2], [640, 170, 2.5], [900, 210, 2], [340, 230, 2], [760, 250, 2],
  ]
    .map(([x, y, r], i) => `<circle class="twinkle" style="animation-delay:${(i * 0.7) % 4}s" cx="${x}" cy="${y}" r="${r}" fill="#FFF6C8"/>`)
    .join('');
  return `<svg class="night-farm" viewBox="0 0 1100 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2A5C"/><stop offset="0.6" stop-color="#4B4A8C"/><stop offset="1" stop-color="#7A6FB0"/></linearGradient>
    <radialGradient id="${u}moon" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFFBE6"/><stop offset="1" stop-color="#FFE7A3"/></radialGradient>
    <radialGradient id="${u}glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E5A6E"/><stop offset="1" stop-color="#2C4152"/></linearGradient>
    <linearGradient id="${u}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98A9B"/><stop offset="1" stop-color="#A86E80"/></linearGradient>
  </defs>
  <rect width="1100" height="560" fill="url(#${u}sky)"/>
  ${stars}
  <circle cx="880" cy="120" r="120" fill="url(#${u}glow)"/>
  <circle cx="880" cy="120" r="56" fill="url(#${u}moon)"/>
  <circle cx="862" cy="108" r="9" fill="#F6DC92" opacity=".7"/><circle cx="900" cy="140" r="6" fill="#F6DC92" opacity=".7"/>
  <path d="M-20 420 Q260 330 560 400 Q840 330 1120 410 L1120 560 L-20 560Z" fill="url(#${u}hill)"/>
  <!-- nhà -->
  <g transform="translate(330 250)">
    <ellipse cx="200" cy="230" rx="250" ry="22" fill="#1E2B38" opacity=".5"/>
    <rect x="40" y="90" width="320" height="140" rx="10" fill="url(#${u}wall)"/>
    <path d="M10 100 L200 -10 L390 100 Z" fill="#5E4F8C"/>
    <path d="M10 100 L200 -10 L212 0 L36 104Z" fill="#fff" opacity=".08"/>
    <rect x="170" y="140" width="60" height="90" rx="10" fill="#6E4A3A"/>
    <circle cx="218" cy="188" r="4" fill="#FFD36E"/>
    ${[70, 270].map((x) => `<circle cx="${x + 30}" cy="150" r="70" fill="url(#${u}glow)"/><rect x="${x}" y="120" width="60" height="56" rx="10" fill="#FFE29A"/><path d="M${x + 30} 120 v56 M${x} 148 h60" stroke="#C98A9B" stroke-width="5"/>`).join('')}
    <rect x="290" y="20" width="34" height="60" fill="#8A6F9E"/>
  </g>
  <!-- cây & hàng rào tối -->
  <g fill="#2C4A3A"><circle cx="150" cy="380" r="56"/><circle cx="110" cy="410" r="40"/><circle cx="960" cy="400" r="50"/></g>
  <g stroke="#556A7A" stroke-width="8" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => `<line x1="${40 + i * 90}" y1="520" x2="${40 + i * 90}" y2="476"/>`).join('')}<line x1="20" y1="490" x2="1080" y2="490"/></g>
  <!-- đom đóm -->
  ${[[240, 450], [470, 470], [780, 455], [900, 480]].map(([x, y], i) => `<circle class="firefly" style="animation-delay:${i * 1.3}s" cx="${x}" cy="${y}" r="4" fill="#FFF3A0"/>`).join('')}
</svg>`;
}
