/**
 * Chào lại (F-21, F-26): tự tải hồ sơ gần nhất, hiện nhân vật + biệt danh cũ.
 * Chạm avatar khác để đổi bé; "+" thêm bé mới (qua Cổng phụ huynh).
 */
import { type AppCtx, farmBackground, iconButton, musicToggle } from '../app';
import { characterSvg } from '../art/character';
import { ageGroupFor, applyAgeRulesToCss } from '../config/ageRules';
import { getCharacter, withOnesie } from '../content/characters';
import { type ChildProfile, MAX_PROFILES } from '../storage/profiles';
import { openParentGate } from '../systems/parentGate';
import { fromHtml, h, ICONS } from '../ui/dom';
import { canStart, clockText, effectiveLimits, loadParentLimits, loadUsage } from '../systems/playtime';
import { openParentTime } from './parentTime';

export async function welcomeScene(ctx: AppCtx, route: { profileId?: string; fresh?: boolean }): Promise<HTMLElement> {
  const profiles = await ctx.store.list();
  if (profiles.length === 0) {
    queueMicrotask(() => ctx.go({ name: 'create', cancellable: false }));
    return h('div', { class: 'screen' });
  }
  let current: ChildProfile =
    profiles.find((p) => p.id === route.profileId) ?? (await ctx.store.getLastProfile()) ?? profiles[0];
  let fresh = !!route.fresh;

  const art = h('div', { class: 'welcome-art' });
  const greet = h('p', { class: 'welcome-greet' });
  const name = h('h2', { class: 'welcome-name' });
  const others = h('div', { class: 'profile-row' });

  // Nông trại đang ngủ (nghỉ giữa phiên / hết giờ trong ngày — SPEC 17.3)
  const sleepBox = h('div', { class: 'sleep-box', hidden: true });
  const playBtn = h('button', { class: 'play-btn', 'aria-label': "Let's play" },
    h('span', { class: 'play-icon', html: ICONS.play }),
    h('span', {}, "LET'S GO"),
  );
  playBtn.addEventListener('click', async () => {
    ctx.audio.unlock();
    ctx.audio.pop();
    playBtn.disabled = true;
    await ctx.store.setLastProfile(current.id);
    ctx.go({ name: 'farm', profileId: current.id });
  });

  let paintId = 0;
  async function paintRest() {
    const id = ++paintId;
    const p = current;
    const g = ageGroupFor(p.birthYear, p.ageGroupOverride);
    const lim = effectiveLimits(g, await loadParentLimits(ctx.kv, p.id, g));
    const usage = await loadUsage(ctx.kv, p.id);
    if (id !== paintId) return;
    const st = canStart(usage, lim);
    playBtn.hidden = !st.ok;
    playBtn.disabled = !st.ok;
    sleepBox.hidden = st.ok;
    if (!st.ok) {
      sleepBox.replaceChildren(
        h('span', { class: 'sleep-moon' }, '🌙'),
        h('b', {}, 'The farm is sleeping.'),
        h('span', { class: 'sleep-en' }, 'See you later! 💤'),
        h('small', {}, st.reason === 'rest' ? `Bé nghỉ ngơi nhé! Có thể chơi lại lúc ${clockText(st.until)}.` : 'Hôm nay chơi đủ rồi. Hẹn bé ngày mai nhé!'),
      );
      art.querySelector('.character')?.classList.add('sleepy');
    }
  }

  function paint() {
    applyAgeRulesToCss(ageGroupFor(current.birthYear, current.ageGroupOverride));
    void paintRest();
    const c = withOnesie(getCharacter(current.avatarId)!, current.onesie);
    art.replaceChildren(fromHtml(characterSvg(c, 'hop big')));
    greet.textContent = fresh ? 'Hello,' : 'Welcome back,';
    name.textContent = `${current.nickname}!`; // textContent: an toàn với mọi ký tự

    const chips: HTMLElement[] = profiles
      .filter((p) => p.id !== current.id)
      .map((p) => {
        const pc = withOnesie(getCharacter(p.avatarId)!, p.onesie);
        const b = h('button', { class: 'profile-chip', 'aria-label': p.nickname });
        b.append(h('span', { class: 'chip-face', html: characterSvg(pc, '', true) }), h('span', { class: 'chip-name' }, p.nickname));
        b.addEventListener('click', () => {
          ctx.audio.pop();
          current = p;
          fresh = false;
          void ctx.store.setLastProfile(p.id);
          paint();
        });
        return b;
      });
    if (profiles.length < MAX_PROFILES) {
      const add = h('button', { class: 'profile-chip add', 'aria-label': 'Thêm bé (dành cho bố mẹ)' },
        h('span', { class: 'chip-face', html: ICONS.plus }),
        h('span', { class: 'chip-name' }, 'Thêm bé'),
      );
      add.addEventListener('click', async () => {
        ctx.audio.pop();
        if (await openParentGate()) ctx.go({ name: 'create', cancellable: true });
      });
      chips.push(add);
    }
    others.replaceChildren(...chips);
    others.hidden = chips.length === 0;
  }
  paint();

  const screen: HTMLElement = h('div', { class: 'screen welcome' });
  screen.append(
    farmBackground(),
    h('div', { class: 'topbar' },
      iconButton('home', 'Màn hình chờ', () => {
        ctx.audio.pop();
        ctx.go({ name: 'splash' });
      }),
      h('div', { class: 'hud-right' },
        iconButton('lock', 'Dành cho bố mẹ: thời gian chơi', async () => {
          ctx.audio.pop();
          if (await openParentGate()) await openParentTime(ctx, screen, current, () => void paintRest());
        }, 'parent-btn'),
        musicToggle(ctx),
      ),
    ),
    h('main', { class: 'welcome-card' },
      art,
      h('div', { class: 'welcome-text' }, greet, name, playBtn, sleepBox),
    ),
    others,
  );
  return screen;
}
