/** Bảng (panel) và thẻ từ dùng trong thế giới game. Mọi nút ≥ --btn-min. */
import { artPicture } from '../art/library';
import { h, ICONS } from './dom';

export interface Panel {
  el: HTMLElement;
  body: HTMLElement;
  close(): void;
  setBody(...nodes: (Node | string)[]): void;
}

export function openPanel(
  host: HTMLElement,
  opts: { title: string; emoji: string; className?: string; onClose?: () => void },
  ...content: (Node | string)[]
): Panel {
  const body = h('div', { class: 'wpanel-body' }, ...content);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 180);
    opts.onClose?.();
  };
  const card = h('div', { class: `wpanel ${opts.className ?? ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title },
    h('header', { class: 'wpanel-head' },
      h('span', { class: 'wpanel-emoji' }, opts.emoji),
      h('h2', {}, opts.title),
      h('button', { class: 'icon-btn wpanel-close', 'aria-label': 'Close', html: ICONS.close, onclick: close }),
    ),
    body,
  );
  const overlay = h('div', { class: 'wpanel-overlay' }, card);
  overlay.addEventListener('pointerdown', (e) => {
    if (e.target === overlay) close();
  });
  host.append(overlay);
  return { el: card, body, close, setBody: (...n) => body.replaceChildren(...n) };
}

/** Lưới thẻ có phân trang: số thẻ mỗi trang = maxChoices của nhóm tuổi. */
export function pagedGrid(cards: HTMLElement[], perPage: number, empty?: HTMLElement): HTMLElement {
  const wrap = h('div', { class: 'paged' });
  if (cards.length === 0) {
    if (empty) wrap.append(empty);
    return wrap;
  }
  let page = 0;
  const pages = Math.ceil(cards.length / perPage);
  const grid = h('div', { class: 'card-grid' });
  const prev = h('button', { class: 'icon-btn page-btn', 'aria-label': 'Previous', html: ICONS.back });
  const next = h('button', { class: 'icon-btn page-btn', 'aria-label': 'Next', html: ICONS.next });
  const dots = h('div', { class: 'page-dots' });
  const paint = () => {
    grid.replaceChildren(...cards.slice(page * perPage, page * perPage + perPage));
    grid.classList.remove('flip');
    void grid.offsetWidth;
    grid.classList.add('flip');
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
    dots.replaceChildren(...Array.from({ length: pages }, (_, i) => h('span', { class: i === page ? 'on' : '' })));
  };
  prev.addEventListener('click', () => { if (page > 0) { page--; paint(); } });
  next.addEventListener('click', () => { if (page < pages - 1) { page++; paint(); } });
  if (pages > 1) wrap.append(h('div', { class: 'paged-row' }, prev, grid, next), dots);
  else wrap.append(grid);
  paint();
  return wrap;
}

/** Thẻ từ: hình + chữ, chạm để nghe. */
export function wordCard(opts: { emoji?: string; color?: string; word: string; sub?: string; badge?: string; onTap?: () => void; action?: HTMLElement; selected?: boolean }): HTMLElement {
  const art = opts.color
    ? h('span', { class: 'wc-color', style: `background:${opts.color}` })
    : /^\d+$/.test(opts.emoji ?? '')
      ? h('span', { class: 'wc-num' }, opts.emoji!)
      : h('span', { class: 'wc-emoji' }, artPicture(opts.word) ?? opts.emoji ?? '');
  const tap = h('button', { class: 'wc-tap', 'aria-label': opts.word }, art, h('span', { class: 'wc-word' }, opts.word), opts.sub ? h('span', { class: 'wc-sub' }, opts.sub) : null);
  tap.addEventListener('click', () => {
    card.classList.remove('boing');
    void card.offsetWidth;
    card.classList.add('boing');
    opts.onTap?.();
  });
  const card = h('div', { class: `word-card${opts.selected ? ' selected' : ''}` }, tap, opts.badge ? h('span', { class: 'wc-badge' }, opts.badge) : null, opts.action ?? null);
  return card;
}

export function emptyNote(emoji: string, text: string): HTMLElement {
  return h('div', { class: 'empty-note' }, h('span', { class: 'empty-emoji' }, emoji), h('p', {}, text));
}
