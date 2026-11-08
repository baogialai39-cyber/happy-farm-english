/** Tiện ích DOM nhỏ gọn. */

/** Namespace chuẩn của SVG (định danh XML, KHÔNG phải đường link — không có lệnh mạng). */
export const SVG_NS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number | boolean | undefined | EventListener>;
type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'html') {
      el.innerHTML = String(v);
    } else if (v === true) {
      el.setAttribute(k, '');
    } else {
      el.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c);
  }
  return el;
}

/** Tạo phần tử từ chuỗi HTML/SVG tin cậy do app tự sinh (không chứa dữ liệu người dùng). */
export function fromHtml(html: string): Element {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild!;
}

export const ICONS = {
  play: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 12 Q16 10 16 15 V49 Q16 54 20 52 L50 35 Q54 32 50 29Z" fill="currentColor"/></svg>',
  musicOn:
    '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 44 V16 L50 10 V38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="45" r="8" fill="currentColor"/><circle cx="44" cy="39" r="8" fill="currentColor"/></svg>',
  musicOff:
    '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 44 V16 L50 10 V38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/><circle cx="18" cy="45" r="8" fill="currentColor" opacity=".45"/><circle cx="44" cy="39" r="8" fill="currentColor" opacity=".45"/><path d="M10 10 L54 54" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 30 L32 12 L54 30 V52 Q54 54 52 54 H40 V40 H24 V54 H12 Q10 54 10 52Z" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M40 12 L20 32 L40 52" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 12 L44 32 L24 52" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 34 L27 47 L50 18" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 14 V50 M14 32 H50" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 18 L46 46 M46 18 L18 46" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="28" width="36" height="28" rx="8" fill="currentColor"/><path d="M22 28 V20 Q22 10 32 10 Q42 10 42 20 V28" fill="none" stroke="currentColor" stroke-width="6"/></svg>',
};
