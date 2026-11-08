import type { AudioEngine } from './systems/audio';
import type { ProfileStore } from './storage/profiles';
import type { KV } from './storage/kv';
import { farmSceneSvg } from './art/farmScene';
import { fromHtml, h, ICONS } from './ui/dom';

export type Route =
  | { name: 'splash' }
  | { name: 'create'; cancellable: boolean }
  | { name: 'welcome'; profileId?: string; fresh?: boolean }
  | { name: 'farm'; profileId: string };

export interface AppCtx {
  store: ProfileStore;
  kv: KV;
  audio: AudioEngine;
  go(route: Route): void;
}

export type Scene = (ctx: AppCtx, route: never) => HTMLElement | Promise<HTMLElement>;

/** Nền nông trại dùng chung. */
export function farmBackground(opts: { dim?: boolean; animals?: boolean } = {}): HTMLElement {
  const bg = h('div', { class: `scene-bg${opts.dim ? ' dim' : ''}` });
  bg.append(fromHtml(farmSceneSvg({ animals: opts.animals })));
  return bg;
}

/** Nút bật/tắt nhạc — nhớ trạng thái trên thiết bị. */
export function musicToggle(ctx: AppCtx): HTMLButtonElement {
  const btn = h('button', { class: 'icon-btn' });
  const paint = () => {
    const on = ctx.audio.musicOn;
    btn.innerHTML = on ? ICONS.musicOn : ICONS.musicOff;
    btn.setAttribute('aria-label', on ? 'Tắt nhạc' : 'Bật nhạc');
    btn.setAttribute('aria-pressed', String(on));
  };
  btn.addEventListener('click', () => {
    const on = !ctx.audio.musicOn;
    ctx.audio.unlock();
    ctx.audio.setMusic(on);
    ctx.audio.pop();
    void ctx.store.setMeta({ musicOn: on });
    paint();
  });
  paint();
  return btn;
}

export function iconButton(icon: keyof typeof ICONS, label: string, onClick: () => void, cls = ''): HTMLButtonElement {
  return h('button', { class: `icon-btn ${cls}`, 'aria-label': label, html: ICONS[icon], onclick: onClick });
}
