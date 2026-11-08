/**
 * Trái cây vẽ gần thực tế (SPEC 18.1, 18.4). Mỗi quả vẽ quanh gốc (0,0), cỡ ~44 đơn vị.
 * ripe=false → quả non (nhỏ, xanh) để mọc lại sau khi hái.
 */
import { Art, edge, shine } from './kit';

export type FruitKind = 'apple' | 'banana' | 'orange' | 'mango' | 'coconut' | 'strawberry' | 'watermelon' | 'grapes';
export const FRUIT_KINDS: readonly FruitKind[] = ['apple', 'banana', 'orange', 'mango', 'coconut', 'strawberry', 'watermelon', 'grapes'];

export function fruitShape(a: Art, kind: FruitKind, ripe = true): string {
  const green = '#8BC34A';
  switch (kind) {
    case 'apple': {
      const c = ripe ? '#E53935' : green;
      return `<path d="M0 -13 C10 -22 25 -14 23 3 C21 18 9 24 0 20 C-9 24 -21 18 -23 3 C-25 -14 -10 -22 0 -13Z" fill="${a.ball(c, 0.5, -0.3)}" ${edge(c, 2)}/>
        <path d="M0 -13 Q1 -20 4 -26" stroke="#6D4C41" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M4 -22 Q14 -30 20 -22 Q12 -16 4 -22Z" fill="${a.ball('#66BB6A')}" ${edge('#66BB6A', 1.5)}/>
        ${shine(-9, -6, 5, 8)}`;
    }
    case 'orange': {
      const c = ripe ? '#FB8C00' : '#7CB342';
      const dots = [[-8, -4], [6, -10], [10, 6], [-4, 10], [-12, 6], [2, 2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${'#000'}" opacity=".12"/>`).join('');
      return `<circle r="21" fill="${a.ball(c, 0.45, -0.28)}" ${edge(c, 2)}/>${dots}
        <circle cx="0" cy="-19" r="2.5" fill="#558B2F"/><path d="M1 -20 Q10 -30 17 -24 Q9 -18 1 -20Z" fill="${a.ball('#43A047')}"/>
        ${shine(-8, -8, 5, 7)}`;
    }
    case 'mango': {
      const c = ripe ? '#FFB300' : '#9CCC65';
      const blush = ripe ? `<ellipse cx="6" cy="-6" rx="10" ry="12" fill="#FF7043" opacity=".45"/>` : '';
      return `<path d="M-2 -22 C14 -22 22 -4 18 10 C14 22 0 26 -10 18 C-20 10 -18 -14 -2 -22Z" fill="${a.ball(c, 0.4, -0.25)}" ${edge(c, 2)}/>${blush}
        <path d="M-2 -22 Q-2 -30 0 -36" stroke="#6D4C41" stroke-width="2.5" fill="none"/>
        ${shine(-8, -4, 4, 8)}`;
    }
    case 'banana': {
      const c = ripe ? '#FDD835' : '#9CCC65';
      return `<path d="M-24 -8 Q-2 26 26 -10 Q28 -4 24 2 Q-2 34 -26 -2 Z" fill="${a.lin([[0, ripe ? '#FFF59D' : '#C5E1A5'], [1, c]])}" ${edge(c, 2)}/>
        <path d="M-25 -6 l-4 -4" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="-9" r="2" fill="#5D4037"/>
        <path d="M-18 4 Q0 22 20 2" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>`;
    }
    case 'coconut': {
      const c = ripe ? '#8D6E63' : '#7CB342';
      return `<circle r="20" fill="${a.ball(c, 0.35, -0.35)}" ${edge(c, 2)}/>
        ${ripe ? '<path d="M-14 -6 Q0 -14 14 -6 M-16 4 Q0 -4 16 4" stroke="#5D4037" stroke-width="1.5" fill="none" opacity=".5"/>' : ''}
        <circle cx="-5" cy="-10" r="2" fill="#3E2723" opacity=".7"/><circle cx="4" cy="-11" r="2" fill="#3E2723" opacity=".7"/><circle cx="0" cy="-5" r="2" fill="#3E2723" opacity=".7"/>
        ${shine(-8, -6, 4, 6, -25, 0.35)}`;
    }
    case 'strawberry': {
      const c = ripe ? '#E53935' : '#DCEDC8';
      const seeds = [[-7, -4], [0, -6], [7, -4], [-5, 4], [3, 3], [-1, 11], [6, 9], [-8, 10]]
        .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="2" fill="${ripe ? '#FFEB3B' : '#AED581'}"/>`).join('');
      return `<path d="M0 22 C-14 12 -19 -4 -14 -11 C-8 -17 8 -17 14 -11 C19 -4 14 12 0 22Z" fill="${a.ball(c, 0.4, -0.3)}" ${edge(c, 2)}/>${seeds}
        <path d="M0 -13 L-12 -18 L-6 -12 L-14 -10 L-4 -9 L0 -16 L4 -9 L14 -10 L6 -12 L12 -18Z" fill="${a.ball('#43A047')}" ${edge('#43A047', 1)}/>
        ${shine(-7, -4, 3, 6, -20, 0.45)}`;
    }
    case 'watermelon': {
      const c = ripe ? '#2E7D32' : '#9CCC65';
      const stripes = [-18, -6, 6, 18].map((x) => `<path d="M${x} -19 Q${x + 4} 0 ${x} 19" stroke="${ripe ? '#66BB6A' : '#C5E1A5'}" stroke-width="5" fill="none" opacity=".85"/>`).join('');
      return `<ellipse rx="30" ry="21" fill="${a.ball(c, 0.35, -0.25)}" ${edge(c, 2)}/>${stripes}
        <path d="M-30 -2 q-6 -6 -2 -10 q4 -2 3 3" stroke="#558B2F" stroke-width="2" fill="none"/>${shine(-12, -9, 8, 4, -10, 0.4)}`;
    }
    case 'grapes': {
      const c = ripe ? '#7E57C2' : '#AED581';
      const rows: [number, number][] = [[-12, -10], [0, -10], [12, -10], [-6, 0], [6, 0], [-12, 0], [12, 0], [0, 10], [-6, 10], [6, 10], [0, 20]];
      const berries = rows.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${a.ball(c, 0.5, -0.3)}" ${edge(c, 1.2)}/><circle cx="${x - 2}" cy="${y - 2.5}" r="1.8" fill="#fff" opacity=".6"/>`).join('');
      return `<path d="M0 -17 Q2 -24 0 -28" stroke="#6D4C41" stroke-width="2.5" fill="none"/>${berries}`;
    }
  }
}

/** Hình icon một quả (dùng cho khung từ vựng, giỏ, mini-game). */
export function fruitIcon(kind: FruitKind, ripe = true, label?: string): string {
  const a = new Art('fr');
  return a.svg('-34 -38 68 68', fruitShape(a, kind, ripe), { label });
}
