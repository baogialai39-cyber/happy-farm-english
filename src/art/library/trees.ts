/**
 * 8 CÂY ĂN QUẢ — mỗi cây vẽ RIÊNG (SPEC 18.4): thân, cành, lá, hình dáng đặc trưng.
 * Quả KHÔNG vẽ trong hình cây — vẽ riêng theo từng vị trí (slot) để chín / non / rơi / hái độc lập.
 * Hệ toạ độ: viewBox 0 0 260 320, gốc cây tại (130, 308).
 */
import { Art, edge, groundShadow, shade } from './kit';
import type { FruitKind } from './fruits';

export interface FruitSlot { x: number; y: number; s: number } // toạ độ trong viewBox, s = tỉ lệ quả

export interface TreeDef {
  id: string; // = id cây trong bản đồ
  fruit: FruitKind;
  word: string; // tên tiếng Anh của cây
  slots: FruitSlot[];
  /** Quả rơi xuống giỏ đặt cạnh gốc (toạ độ viewBox). */
  basket: { x: number; y: number };
  svg(): string;
}

const VB = '0 0 260 320';

/** Một chiếc lá thuôn có gân giữa. */
function leaf(a: Art, x: number, y: number, len: number, w: number, rot: number, c: string): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 Q${len * 0.5} ${-w} ${len} 0 Q${len * 0.5} ${w} 0 0Z" fill="${a.ball(c, 0.3, -0.2, '40%', '30%')}" ${edge(c, 1.4)}/><path d="M2 0 L${len - 3} 0" stroke="${shade(c, -0.3)}" stroke-width="1.2"/></g>`;
}

function trunk(a: Art, d: string, c = '#8D6E63'): string {
  return `<path d="${d}" fill="${a.lin([[0, shade(c, 0.15)], [0.5, c], [1, shade(c, -0.3)]], 1, 0)}" ${edge(c, 2.5)}/>`;
}

/** Tán lá dạng nhiều khối tròn (cây táo / cam / xoài khác nhau ở màu, độ dày, hình khối). */
function canopy(a: Art, blobs: [number, number, number][], c: string): string {
  return blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.ball(c, 0.35, -0.3)}" ${edge(c, 2)}/>`).join('');
}

export const TREES: readonly TreeDef[] = [
  {
    id: 'apple-tree', fruit: 'apple', word: 'apple tree',
    slots: [{ x: 92, y: 128, s: 0.9 }, { x: 150, y: 104, s: 0.9 }, { x: 180, y: 150, s: 0.9 }, { x: 118, y: 170, s: 0.9 }, { x: 70, y: 172, s: 0.85 }],
    basket: { x: 196, y: 296 },
    svg() {
      const a = new Art('tA');
      const c = '#5DAE4E';
      return a.svg(VB, `${groundShadow(130, 306, 90, 12)}
        ${trunk(a, 'M118 308 Q122 250 116 210 Q100 186 80 176 L88 166 Q108 178 122 196 Q126 170 128 150 L140 150 Q140 180 142 196 Q160 176 180 168 L186 178 Q160 192 146 214 Q140 254 146 308Z')}
        ${canopy(a, [[72, 140, 52], [130, 104, 62], [190, 136, 54], [104, 162, 50], [160, 168, 50], [130, 140, 56]], c)}
        ${[[96, 96], [158, 82], [70, 128], [196, 120], [130, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="8" fill="#fff" opacity=".18" transform="rotate(-20 ${x} ${y})"/>`).join('')}`);
    },
  },
  {
    id: 'orange-tree', fruit: 'orange', word: 'orange tree',
    slots: [{ x: 96, y: 118, s: 0.85 }, { x: 160, y: 108, s: 0.85 }, { x: 186, y: 162, s: 0.85 }, { x: 130, y: 170, s: 0.85 }, { x: 78, y: 170, s: 0.8 }],
    basket: { x: 196, y: 296 },
    svg() {
      const a = new Art('tO');
      const c = '#2E7D32';
      // tán DÀY, TRÒN như quả cầu, xanh đậm bóng + nhiều lá nhỏ
      const leaves = Array.from({ length: 26 }, (_, i) => {
        const ang = (i / 26) * Math.PI * 2;
        const r = 84 + (i % 3) * 4;
        return leaf(a, 130 + Math.cos(ang) * r, 142 + Math.sin(ang) * r * 0.86, 18, 6, (ang * 180) / Math.PI, '#388E3C');
      }).join('');
      return a.svg(VB, `${groundShadow(130, 306, 80, 11)}
        ${trunk(a, 'M120 308 Q124 262 122 222 L138 222 Q136 262 142 308Z', '#795548')}
        ${leaves}
        <ellipse cx="130" cy="142" rx="88" ry="78" fill="${a.ball(c, 0.32, -0.3)}" ${edge(c, 2.5)}/>
        ${Array.from({ length: 18 }, (_, i) => `<ellipse cx="${70 + ((i * 37) % 120)}" cy="${86 + ((i * 53) % 110)}" rx="9" ry="5" fill="#66BB6A" opacity=".55" transform="rotate(${(i * 40) % 180} ${70 + ((i * 37) % 120)} ${86 + ((i * 53) % 110)})"/>`).join('')}
        <ellipse cx="100" cy="98" rx="30" ry="14" fill="#fff" opacity=".15" transform="rotate(-25 100 98)"/>`);
    },
  },
  {
    id: 'mango-tree', fruit: 'mango', word: 'mango tree',
    slots: [{ x: 70, y: 176, s: 0.85 }, { x: 118, y: 190, s: 0.85 }, { x: 166, y: 186, s: 0.85 }, { x: 206, y: 170, s: 0.8 }],
    basket: { x: 60, y: 298 },
    svg() {
      const a = new Art('tM');
      // tán RỘNG, dẹt hình vòm; lá DÀI NHỌN; vài lá non đỏ; quả treo dưới tán bằng cuống dài
      const leaves = Array.from({ length: 40 }, (_, i) => {
        const t = i / 39;
        const x = 22 + t * 216;
        const y = 132 - Math.sin(t * Math.PI) * 74 + (i % 2) * 14;
        const col = i % 9 === 4 ? '#C0612B' : i % 2 ? '#43A047' : '#2E7D32';
        return leaf(a, x, y, 34, 7, i % 2 ? 70 : 110 + (i % 3) * 8, col);
      }).join('');
      const stalks = [[70, 150], [118, 160], [166, 158], [206, 146]].map(([x, y]) => `<path d="M${x} ${y} Q${x + 2} ${y + 10} ${x} ${y + 18}" stroke="#6D4C41" stroke-width="2.5" fill="none"/>`).join('');
      return a.svg(VB, `${groundShadow(130, 306, 100, 12)}
        ${trunk(a, 'M112 308 Q118 250 108 200 Q86 176 60 168 L66 156 Q96 168 118 190 Q122 166 124 150 L140 150 Q142 170 146 188 Q170 168 200 160 L204 172 Q170 186 154 208 Q144 250 152 308Z', '#6D4C41')}
        <path d="M14 150 Q130 30 248 150 Q130 176 14 150Z" fill="${a.ball('#388E3C', 0.3, -0.3)}" ${edge('#388E3C', 2.5)}/>
        ${leaves}${stalks}`);
    },
  },
  {
    id: 'banana-tree', fruit: 'banana', word: 'banana tree',
    slots: [{ x: 108, y: 170, s: 1.1 }, { x: 150, y: 176, s: 1.1 }, { x: 110, y: 200, s: 1.1 }, { x: 152, y: 206, s: 1.1 }],
    basket: { x: 200, y: 298 },
    svg() {
      const a = new Art('tB');
      // thân giả xanh có bẹ; lá RẤT TO, DÀI, xé tua; cuống buồng + BẮP CHUỐI TÍM
      const bigLeaf = (rot: number, len: number, c: string) =>
        `<g transform="translate(128 108) rotate(${rot})"><path d="M0 0 Q${len * 0.45} -58 ${len} -8 Q${len * 0.55} 40 0 0Z" fill="${a.lin([[0, shade(c, 0.2)], [1, shade(c, -0.15)]])}" ${edge(c, 2)}/>
          <path d="M0 0 Q${len * 0.5} -8 ${len} -6" stroke="#9CCC65" stroke-width="3" fill="none"/>
          ${[0.35, 0.55, 0.75].map((f) => `<path d="M${len * f} ${-14 + f * 8} l6 -12" stroke="#fff" stroke-width="2" opacity=".55"/>`).join('')}</g>`;
      return a.svg(VB, `${groundShadow(130, 306, 70, 10)}
        <path d="M112 308 Q116 200 120 110 L138 110 Q142 200 148 308Z" fill="${a.lin([[0, '#9CCC65'], [0.5, '#7CB342'], [1, '#558B2F']], 1, 0)}" ${edge('#7CB342', 2.5)}/>
        ${[150, 190, 230, 270].map((y) => `<path d="M114 ${y} Q130 ${y - 12} 146 ${y}" stroke="#689F38" stroke-width="2" fill="none"/>`).join('')}
        ${bigLeaf(-160, 120, '#43A047')}${bigLeaf(-120, 128, '#66BB6A')}${bigLeaf(-60, 128, '#4CAF50')}${bigLeaf(-20, 120, '#388E3C')}${bigLeaf(-90, 100, '#81C784')}
        <path d="M128 112 Q140 140 130 160 Q128 200 132 224" stroke="#689F38" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M132 220 Q120 236 132 256 Q146 236 132 220Z" fill="${a.ball('#8E244D', 0.3, -0.3)}" ${edge('#8E244D', 2)}/>`);
    },
  },
  {
    id: 'coconut-tree', fruit: 'coconut', word: 'coconut tree',
    slots: [{ x: 150, y: 104, s: 0.95 }, { x: 184, y: 104, s: 0.95 }, { x: 167, y: 126, s: 0.95 }],
    basket: { x: 70, y: 298 },
    svg() {
      const a = new Art('tC');
      // thân CAO, CONG, có VÒNG ĐỐT; tàu lá dừa dài xòe với lá chét
      const rings = Array.from({ length: 12 }, (_, i) => {
        const t = i / 11;
        const x = 110 + Math.sin(t * 1.4) * 40 + t * 20;
        const y = 300 - t * 220;
        return `<path d="M${x - 11} ${y} Q${x} ${y + 5} ${x + 11} ${y}" stroke="#6D4C41" stroke-width="2" fill="none"/>`;
      }).join('');
      const frond = (rot: number, len: number) => {
        const leaflets = Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          return `<path d="M${len * t} ${-t * 18 + t * t * 30} l${6} ${-18 + i} M${len * t} ${-t * 18 + t * t * 30} l${6} ${16 - i}" stroke="#2E7D32" stroke-width="5" stroke-linecap="round"/>`;
        }).join('');
        return `<g transform="translate(168 76) rotate(${rot})">${leaflets}<path d="M0 0 Q${len * 0.5} -22 ${len} 12" stroke="#558B2F" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
      };
      return a.svg(VB, `${groundShadow(140, 306, 60, 9)}
        <path d="M100 308 Q96 200 140 120 Q160 94 166 82 L178 86 Q170 110 152 130 Q118 200 124 308Z" fill="${a.lin([[0, '#BCAAA4'], [0.5, '#A1887F'], [1, '#795548']], 1, 0)}" ${edge('#A1887F', 2.5)}/>
        ${rings}
        ${frond(-170, 110)}${frond(-140, 118)}${frond(-100, 96)}${frond(-60, 118)}${frond(-20, 110)}${frond(10, 96)}${frond(160, 92)}`);
    },
  },
  {
    id: 'strawberry-plant', fruit: 'strawberry', word: 'strawberry plant',
    slots: [{ x: 84, y: 262, s: 0.8 }, { x: 128, y: 272, s: 0.8 }, { x: 172, y: 264, s: 0.8 }, { x: 206, y: 276, s: 0.75 }],
    basket: { x: 40, y: 300 },
    svg() {
      const a = new Art('tS');
      // cây THẤP sát đất: lá 3 chét RĂNG CƯA, hoa trắng nhụy vàng, cuống quả cong
      const trifoliate = (x: number, y: number, s: number) => {
        const one = (rot: number) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 Q-14 -14 -8 -34 L-5 -30 L-2 -36 L1 -31 L4 -37 L7 -31 L10 -34 Q14 -14 0 0Z" fill="${a.ball('#43A047', 0.3, -0.25)}" ${edge('#43A047', 1.4)}/><path d="M0 -2 L1 -30" stroke="#2E7D32" stroke-width="1.4"/></g>`;
        return `<path d="M${x} ${y} L${x} ${y + 24}" stroke="#558B2F" stroke-width="3"/>${one(-40)}${one(0)}${one(40)}`;
      };
      const flower = (x: number, y: number) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="5" ry="8" transform="rotate(${r}) translate(0 -7)" fill="#fff" ${edge('#E0E0E0', 1)}/>`).join('')}<circle r="4" fill="#FDD835"/></g>`;
      const stems = [[84, 262], [128, 272], [172, 264], [206, 276]].map(([x, y]) => `<path d="M${x - 10} ${y - 34} Q${x - 4} ${y - 20} ${x} ${y - 16}" stroke="#558B2F" stroke-width="2.5" fill="none"/>`).join('');
      return a.svg(VB, `${groundShadow(130, 300, 110, 14, 0.2)}
        <ellipse cx="130" cy="296" rx="108" ry="14" fill="#8D6E63" opacity=".55"/>
        ${trifoliate(70, 250, 1)}${trifoliate(116, 240, 1.15)}${trifoliate(162, 248, 1.05)}${trifoliate(200, 256, 0.9)}
        ${flower(96, 222)}${flower(186, 226)}${stems}`);
    },
  },
  {
    id: 'watermelon-plant', fruit: 'watermelon', word: 'watermelon plant',
    slots: [{ x: 88, y: 272, s: 1.1 }, { x: 178, y: 276, s: 1.1 }],
    basket: { x: 236, y: 300 },
    svg() {
      const a = new Art('tW');
      // DÂY BÒ trên mặt đất, lá XẺ THÙY sâu, TUA CUỐN xoắn, hoa vàng nhỏ
      const lobed = (x: number, y: number, s: number, rot: number) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C-10 -6 -22 -2 -18 -14 C-26 -18 -16 -30 -8 -24 C-8 -36 8 -36 8 -24 C16 -30 26 -18 18 -14 C22 -2 10 -6 0 0Z" fill="${a.ball('#558B2F', 0.3, -0.25)}" ${edge('#558B2F', 1.4)}/><path d="M0 0 L0 -26 M0 -10 L-12 -18 M0 -10 L12 -18" stroke="#33691E" stroke-width="1.3" fill="none"/></g>`;
      const tendril = (x: number, y: number) => `<path d="M${x} ${y} q6 -8 0 -12 q-6 -4 -2 -10 q4 -5 8 -1" stroke="#7CB342" stroke-width="2" fill="none"/>`;
      return a.svg(VB, `${groundShadow(130, 302, 120, 12, 0.18)}
        <ellipse cx="130" cy="296" rx="120" ry="16" fill="#A1887F" opacity=".45"/>
        <path d="M14 286 Q60 262 100 282 Q140 300 180 280 Q220 262 250 288" stroke="#689F38" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${lobed(40, 278, 1.2, -20)}${lobed(126, 290, 1.3, 10)}${lobed(214, 280, 1.2, 20)}${lobed(150, 266, 1, -30)}${lobed(70, 300, 1, 30)}
        ${tendril(108, 278)}${tendril(230, 272)}
        <g transform="translate(140 262)">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="3.5" ry="6" transform="rotate(${r}) translate(0 -5)" fill="#FDD835"/>`).join('')}</g>`);
    },
  },
  {
    id: 'grapevine', fruit: 'grapes', word: 'grapevine',
    slots: [{ x: 64, y: 150, s: 0.95 }, { x: 108, y: 158, s: 0.95 }, { x: 156, y: 152, s: 0.95 }, { x: 200, y: 158, s: 0.95 }],
    basket: { x: 130, y: 300 },
    svg() {
      const a = new Art('tG');
      // GIÀN GỖ + thân nho xoắn + lá nho 5 thùy hình tim
      const grapeLeaf = (x: number, y: number, s: number, rot: number) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 14 C-8 8 -22 10 -20 -2 C-28 -8 -18 -18 -10 -12 C-12 -24 0 -26 0 -16 C0 -26 12 -24 10 -12 C18 -18 28 -8 20 -2 C22 10 8 8 0 14Z" fill="${a.ball('#689F38', 0.3, -0.25)}" ${edge('#689F38', 1.4)}/><path d="M0 12 L0 -14 M0 4 L-14 -6 M0 4 L14 -6" stroke="#33691E" stroke-width="1.2" fill="none"/></g>`;
      const wood = '#A1887F';
      return a.svg(VB, `${groundShadow(130, 306, 120, 10, 0.16)}
        <rect x="22" y="104" width="14" height="204" rx="4" fill="${a.side(wood)}" ${edge(wood, 2)}/>
        <rect x="224" y="104" width="14" height="204" rx="4" fill="${a.side(wood)}" ${edge(wood, 2)}/>
        <rect x="14" y="100" width="232" height="14" rx="6" fill="${a.side(wood)}" ${edge(wood, 2)}/>
        <rect x="14" y="128" width="232" height="8" rx="4" fill="${a.side(wood)}" opacity=".9"/>
        <path d="M128 308 Q120 260 134 220 Q146 180 124 150 Q110 128 132 108" stroke="#6D4C41" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M132 112 Q90 98 40 110 M132 112 Q180 96 226 110" stroke="#795548" stroke-width="5" fill="none"/>
        ${[[40, 96, 1, -10], [72, 116, 1.1, 10], [104, 94, 1, 0], [148, 118, 1.15, -10], [182, 96, 1, 10], [214, 118, 1.05, 0], [58, 128, 0.8, 20], [196, 132, 0.8, -20]].map(([x, y, s, r]) => grapeLeaf(x, y, s, r)).join('')}
        ${[64, 108, 156, 200].map((x) => `<path d="M${x} 112 L${x} 128" stroke="#6D4C41" stroke-width="2.5"/>`).join('')}`);
    },
  },
];

export const TREE_BY_ID: ReadonlyMap<string, TreeDef> = new Map(TREES.map((t) => [t.id, t]));
