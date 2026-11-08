/** Màn chờ (F-30, F-84): logo, nông trại 3D pastel, nút PLAY lớn, nhạc nền. */
import { type AppCtx, farmBackground, musicToggle } from '../app';
import { applyAgeRulesToCss, DEFAULT_GROUP } from '../config/ageRules';
import { h, ICONS } from '../ui/dom';

const LOGO_COLORS = ['#FF8FAB', '#FFAA5C', '#F7C948', '#6CCB8A', '#5DB8F0', '#A48BE0'];

function logo(): HTMLElement {
  const top = h('span', { class: 'logo-top' });
  let i = 0;
  for (const ch of 'Happy Farm') {
    if (ch === ' ') {
      top.append(h('span', { class: 'logo-space' }, ' '));
      continue;
    }
    top.append(h('span', { class: 'logo-letter', style: `color:${LOGO_COLORS[i % LOGO_COLORS.length]};--i:${i}` }, ch));
    i++;
  }
  return h('h1', { class: 'logo', 'aria-label': 'Happy Farm English' },
    top,
    h('span', { class: 'logo-ribbon' }, 'English'),
  );
}

export function splashScene(ctx: AppCtx): HTMLElement {
  applyAgeRulesToCss(DEFAULT_GROUP);

  const play = h('button', { class: 'play-btn', 'aria-label': 'Play' },
    h('span', { class: 'play-icon', html: ICONS.play }),
    h('span', {}, 'PLAY'),
  );
  play.addEventListener('click', async () => {
    ctx.audio.unlock();
    ctx.audio.pop();
    play.disabled = true;
    const profiles = await ctx.store.list();
    ctx.go(profiles.length > 0 ? { name: 'welcome' } : { name: 'create', cancellable: false });
  });

  return h('div', { class: 'screen splash' },
    farmBackground(),
    h('div', { class: 'topbar' }, h('span'), musicToggle(ctx)),
    h('div', { class: 'splash-content' }, logo(), play),
  );
}
