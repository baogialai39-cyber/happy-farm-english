/**
 * Bảng "Play & Learn" (SPEC 16.1): Quests · Games · Rewards.
 * Nhiệm vụ không bắt buộc, không đếm ngược, không hết hạn (CLAUDE.md A10).
 */
import { GAMES, type GameId } from '../content/gamesData';
import { templateOf } from '../content/quests';
import { UNLOCKS, type UnlockDef } from '../content/rewards';
import { h } from '../ui/dom';
import { openPanel } from '../ui/panel';
import type { WorldApi } from './interactions';
import { claimQuest, ensureQuests } from './save';

export type HubTab = 'quests' | 'games' | 'rewards';

export interface HubHooks {
  playGame(id: GameId): void;
  celebrate(list: UnlockDef[]): void;
  /** Cập nhật HUD (sao, xu, chấm báo nhiệm vụ). */
  refresh(): void;
}

export function claimableCount(api: WorldApi): number {
  return (api.save.quests?.list ?? []).filter((q) => !q.claimed && q.progress >= q.target).length;
}

export function openHub(api: WorldApi, tab: HubTab, hooks: HubHooks): void {
  api.pause(true);
  const p = openPanel(api.host, { title: 'Play & Learn', emoji: '⭐', className: 'hub', onClose: () => api.pause(false) });
  const tabs = h('div', { class: 'acc-tabs hub-tabs', role: 'tablist' });
  const body = h('div', { class: 'hub-body' });
  const TABS: [HubTab, string, string][] = [['quests', 'Quests', '📜'], ['games', 'Games', '🎲'], ['rewards', 'Rewards', '🎁']];

  const paintTabs = () => {
    tabs.replaceChildren(
      ...TABS.map(([id, title, emoji]) => {
        const b = h('button', { class: `acc-tab${id === tab ? ' on' : ''}`, role: 'tab', 'aria-selected': String(id === tab) },
          h('span', { class: 'acc-tab-emoji' }, emoji), h('span', {}, title),
          id === 'quests' && claimableCount(api) > 0 ? h('span', { class: 'hub-badge' }, String(claimableCount(api))) : null);
        b.addEventListener('click', () => {
          tab = id;
          api.audio.pop();
          api.learn(title);
          paint();
        });
        return b;
      }),
    );
  };

  // ---------- Quests ----------
  const paintQuests = () => {
    const list = ensureQuests(api.save, api.rules.group);
    api.changed();
    const cards = list.map((q) => {
      const t = templateOf(q)!;
      const text = t.en(q.target);
      const done = q.progress >= q.target;
      const tap = h('button', { class: 'quest-tap', 'aria-label': text },
        h('span', { class: 'quest-emoji' }, t.emoji),
        h('span', { class: 'quest-text' }, text),
      );
      tap.addEventListener('click', () => api.learn('', { key: `quest:${q.id}`, entry: { en: text, vi: t.vi(q.target), emoji: t.emoji }, force: true }));
      const prog = h('div', { class: 'quest-prog', 'aria-label': `${q.progress} / ${q.target}` },
        ...Array.from({ length: q.target }, (_, i) => h('span', { class: i < q.progress ? 'on' : '' }, i < q.progress ? '⭐' : '')));
      let action: HTMLElement;
      if (q.claimed) action = h('span', { class: 'quest-done' }, '✓');
      else if (done) {
        const claim = h('button', { class: 'btn btn-green card-btn quest-claim' }, '🎁 CLAIM');
        claim.addEventListener('click', () => {
          const r = claimQuest(api.save, q.id, api.rules.group);
          if (!r) return;
          api.audio.fanfare();
          api.changed();
          api.say('Great job!');
          hooks.refresh();
          paint();
          if (r.unlocked.length) hooks.celebrate(r.unlocked);
        });
        action = claim;
      } else action = h('span', { class: 'quest-count' }, `${q.progress} / ${q.target}`);
      return h('div', { class: `quest-card${done ? ' done' : ''}${q.claimed ? ' claimed' : ''}` }, tap, prog, action);
    });
    body.replaceChildren(
      h('p', { class: 'hub-note' }, 'Just for fun! 😊'),
      h('div', { class: 'quest-list' }, ...cards),
    );
  };

  // ---------- Games ----------
  const paintGames = () => {
    const section = (place: 'farm' | 'zoo') => h('div', { class: 'game-grid' },
        ...GAMES.filter((g) => g.place === place).map((g) => {
          const play = h('button', { class: 'btn btn-green card-btn' }, '▶ PLAY');
          play.addEventListener('click', () => {
            api.audio.pop();
            p.close();
            hooks.playGame(g.id);
          });
          const tap = h('button', { class: 'game-tap', 'aria-label': g.title }, h('span', { class: 'game-emoji' }, g.emoji), h('b', {}, g.title), h('small', {}, g.vi));
          tap.addEventListener('click', () => api.say(g.title));
          return h('div', { class: 'game-card' }, tap, h('span', { class: 'game-plays' }, `⭐ ×${api.save.games[g.id] ?? 0}`), play);
        }),
      );
    body.replaceChildren(
      h('p', { class: 'game-section' }, '🏡 Farm games'), section('farm'),
      h('p', { class: 'game-section' }, '🦁 Zoo games'), section('zoo'),
    );
  };

  // ---------- Rewards (con đường sao) ----------
  const paintRewards = () => {
    const stars = api.save.stars;
    const rows = UNLOCKS.map((u) => {
      const got = api.save.unlocked.includes(u.id);
      const pct = Math.min(100, Math.round((stars / u.stars) * 100));
      const row = h('button', { class: `reward-row${got ? ' got' : ''}`, 'aria-label': u.word },
        h('span', { class: 'reward-emoji' }, got ? u.emoji : '🔒'),
        h('span', { class: 'reward-word' }, got ? u.word : `${u.emoji} ${u.word}`),
        h('span', { class: 'reward-kind' }, u.kind === 'crop' ? '🌱 seeds' : u.kind === 'accessory' ? '👕 clothes' : '🏡 decoration'),
        got ? h('span', { class: 'reward-state' }, '✓') : h('span', { class: 'reward-bar' }, h('i', { style: `width:${pct}%` }), h('b', {}, `⭐ ${u.stars}`)),
      );
      row.addEventListener('click', () => api.learn(u.word));
      return row;
    });
    body.replaceChildren(h('p', { class: 'hub-stars' }, `⭐ ${stars} stars`), h('div', { class: 'reward-list' }, ...rows));
  };

  const paint = () => {
    paintTabs();
    if (tab === 'quests') paintQuests();
    else if (tab === 'games') paintGames();
    else paintRewards();
  };
  p.setBody(tabs, body);
  paint();
}
