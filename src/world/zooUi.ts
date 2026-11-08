/**
 * Giao diện sở thú (SPEC 19): trạm chăm sóc (Feed / Water / Play / Clean), Zoo Book, bản đồ, Zoo Passport.
 * Không bắt buộc, không đếm ngược, không phạt (A10). Sai → nhẹ nhàng gợi ý (không chê).
 */
import { artPicture } from '../art/library';
import { pluralAnimal, ZOO, ZOO_BADGES, ZOO_FOODS, ZOO_TOPICS, ZOO_ZONES, type ZooZone, zooOfZone } from '../content/zoo';
import { resolveVocab } from '../content/vocab';
import { h } from '../ui/dom';
import { openPanel, pagedGrid, wordCard } from '../ui/panel';
import type { WorldApi } from './interactions';
import { type ZooReward, zooClean, zooFeed } from './save';
import { foodEmoji, type ZooHerd } from './zooWorld';

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const shuffle = <T>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const pic = (w: string) => artPicture(w, 'art-pic') ?? (resolveVocab(w)?.emoji ?? '❓');

export interface ZooHooks {
  herd: ZooHerd;
  /** Khung từ / câu nằm cạnh con vật này. */
  anchorAnimal(id: string): void;
  reward(r: ZooReward): void;
}

/** Câu ngắn (đọc to + nghĩa) — dùng kênh khung từ chung. */
function sentence(api: WorldApi, key: string, en: string, vi: string, emoji: string) {
  api.learn('', { key, entry: { en, vi, emoji }, force: true });
}

// =====================================================================
// Trạm chăm sóc (SPEC 19.5)
// =====================================================================
export function openCare(api: WorldApi, zone: ZooZone, hooks: ZooHooks): void {
  const z = ZOO_ZONES.find((x) => x.id === zone)!;
  api.pause(true);
  const p = openPanel(api.host, { title: `${z.name} Care`, emoji: '🧺', className: 'zoo-care', onClose: () => api.pause(false) });
  const finish = (fn: () => void) => {
    // đóng bảng để bé xem con vật làm việc đó
    setTimeout(() => {
      p.close();
      fn();
    }, 700);
  };
  const tabs = h('div', { class: 'acc-tabs care-tabs', role: 'tablist' });
  const body = h('div', { class: 'care-body' });
  type Tab = 'feed' | 'water' | 'play' | 'clean';
  let tab: Tab = 'feed';
  const TABS: [Tab, string, string][] = [['feed', 'Feed', '🍽️'], ['water', 'Water', '💧'], ['play', 'Play', '⚽'], ['clean', 'Clean', '🧹']];
  const paintTabs = () => tabs.replaceChildren(...TABS.map(([id, title, emoji]) => {
    const b = h('button', { class: `acc-tab${id === tab ? ' on' : ''}`, role: 'tab', 'aria-selected': String(id === tab) }, h('span', { class: 'acc-tab-emoji' }, emoji), h('span', {}, title));
    b.addEventListener('click', () => {
      tab = id;
      api.audio.pop();
      api.say(title);
      paint();
    });
    return b;
  }));

  // ----- Feed: chọn con vật → chọn thức ăn -----
  const paintFeed = (chosen?: string) => {
    if (!chosen) {
      body.replaceChildren(
        h('p', { class: 'care-ask' }, 'Who is hungry?'),
        h('div', { class: 'care-animals' }, ...zooOfZone(zone).map((a) => {
          const b = h('button', { class: 'care-animal', 'aria-label': a.id }, pic(a.id), h('b', {}, a.id));
          b.addEventListener('click', () => {
            api.audio.pop();
            api.anchorEl?.(b);
            api.learn(a.id);
            paintFeed(a.id);
          });
          return b;
        })),
      );
      return;
    }
    const a = ZOO.find((x) => x.id === chosen)!;
    const others = shuffle(ZOO_FOODS.filter((f) => f !== a.food)).slice(0, 2);
    const options = shuffle([a.food, ...others]);
    const buttons = new Map<string, HTMLButtonElement>();
    const grid = h('div', { class: 'care-foods' }, ...options.map((f) => {
      const b = h('button', { class: 'care-food', 'aria-label': f }, h('span', { class: 'care-food-emoji' }, foodEmoji(f)), h('b', {}, f));
      b.addEventListener('click', () => {
        const r = zooFeed(api.save, a.id, f);
        if (r.ok) {
          api.audio.chime();
          b.classList.add('right');
          api.changed();
          finish(() => {
            hooks.herd.feed(zone, a.id, f, Date.now());
            hooks.anchorAnimal(a.id);
            sentence(api, `feed:${a.id}`, `The ${a.id} is eating ${f}.`, `${cap(resolveVocab(a.id)?.vi ?? a.id)} đang ăn ${resolveVocab(f)?.vi.toLowerCase() ?? f}.`, foodEmoji(f));
            hooks.reward(r.reward);
          });
          return;
        }
        // chưa đúng: không chê, không trừ — gợi ý món đúng
        api.audio.hmm();
        b.classList.add('nope');
        const right = buttons.get(a.food)!;
        right.classList.remove('hint');
        void right.offsetWidth;
        right.classList.add('hint');
        api.say(`Hmm! ${cap(pluralAnimal(a.id))} like ${a.food}.`);
      });
      buttons.set(f, b);
      return b;
    }));
    const back = h('button', { class: 'btn btn-soft card-btn' }, '◀');
    back.addEventListener('click', () => paintFeed());
    body.replaceChildren(h('div', { class: 'care-chosen' }, back, pic(a.id), h('p', { class: 'care-ask' }, `What does the ${a.id} eat?`)), grid);
    api.say(`What does the ${a.id} eat?`);
  };

  const bigAction = (emoji: string, label: string, onClick: () => void) => {
    const b = h('button', { class: 'btn btn-green care-big' }, h('span', { class: 'care-big-emoji' }, emoji), label);
    b.addEventListener('click', () => {
      api.audio.chime();
      onClick();
    });
    return b;
  };
  const paintWater = () => body.replaceChildren(
    h('p', { class: 'care-ask' }, 'Fresh water for everyone!'),
    bigAction('💧', 'GIVE WATER', () => finish(() => {
      hooks.herd.water(zone, Date.now());
      hooks.anchorAnimal(zooOfZone(zone)[0].id);
      sentence(api, 'zoo:water', 'The animals are drinking water.', 'Các con vật đang uống nước.', '💧');
    })),
  );
  const paintPlay = () => body.replaceChildren(
    h('p', { class: 'care-ask' }, "Let's play!"),
    bigAction(z.toyEmoji, 'GIVE A TOY', () => finish(() => {
      hooks.herd.play(zone, Date.now());
      hooks.anchorAnimal(zooOfZone(zone)[0].id);
      sentence(api, 'zoo:play', 'The animals are playing!', 'Các con vật đang chơi!', z.toyEmoji);
    })),
  );
  // ----- Clean: chạm từng chiếc lá -----
  const paintClean = () => {
    const field = h('div', { class: `clean-field zone-${zone}` });
    let left = 6;
    for (let i = 0; i < 6; i++) {
      const leaf = h('button', { class: 'clean-leaf', 'aria-label': 'leaf', style: `left:${8 + ((i * 37) % 80)}%;top:${12 + ((i * 53) % 70)}%` }, i % 3 === 2 ? '🟤' : '🍂');
      leaf.addEventListener('click', () => {
        if (leaf.classList.contains('gone')) return;
        leaf.classList.add('gone');
        api.audio.pop();
        left--;
        if (left === 0) {
          api.audio.fanfare();
          const r = zooClean(api.save, zone, Date.now());
          api.changed();
          field.append(h('div', { class: 'clean-done' }, '✨ So clean! ✨'));
          sentence(api, 'zoo:clean', 'So clean! Thank you!', 'Sạch quá! Cảm ơn bé!', '✨');
          hooks.reward(r);
        }
      });
      field.append(leaf);
    }
    body.replaceChildren(h('p', { class: 'care-ask' }, 'Tap the leaves to clean!'), field);
  };

  const paint = () => {
    paintTabs();
    if (tab === 'feed') paintFeed();
    else if (tab === 'water') paintWater();
    else if (tab === 'play') paintPlay();
    else paintClean();
  };
  p.setBody(tabs, body);
  paint();
  api.learn(zone);
}

// =====================================================================
// Zoo Book — 6 chủ đề từ vựng nâng cao (SPEC 19.6)
// =====================================================================
export function openZooBook(api: WorldApi): void {
  api.pause(true);
  const p = openPanel(api.host, { title: 'Zoo Book', emoji: '📖', className: 'zoo-book', onClose: () => api.pause(false) });
  let topic = ZOO_TOPICS[0];
  const tabs = h('div', { class: 'acc-tabs book-tabs', role: 'tablist' });
  const body = h('div', {});
  const paint = () => {
    tabs.replaceChildren(...ZOO_TOPICS.map((t) => {
      const b = h('button', { class: `acc-tab${t === topic ? ' on' : ''}`, role: 'tab', 'aria-selected': String(t === topic) }, h('span', { class: 'acc-tab-emoji' }, t.emoji), h('span', {}, t.title));
      b.addEventListener('click', () => {
        topic = t;
        api.audio.pop();
        api.say(t.title);
        paint();
      });
      return b;
    }));
    const cards = topic.words.map((w) => wordCard({ emoji: resolveVocab(w)?.emoji, word: w, sub: resolveVocab(w)?.vi, onTap: () => api.learn(w) }));
    body.replaceChildren(pagedGrid(cards, Math.max(4, api.rules.maxChoices * 2)));
  };
  p.setBody(tabs, body);
  paint();
}

// =====================================================================
// Bản đồ: Farm ↔ Happy Zoo (SPEC 19.1) + Zoo Passport (19.8)
// =====================================================================
export function openMap(api: WorldApi, here: 'farm' | 'zoo', go: (place: 'farm' | 'zoo') => void): void {
  api.pause(true);
  const p = openPanel(api.host, { title: 'Map', emoji: '🗺️', className: 'zoo-map', onClose: () => api.pause(false) });
  const place = (id: 'farm' | 'zoo', emoji: string, title: string, vi: string) => {
    const b = h('button', { class: `map-place${id === here ? ' here' : ''}`, 'aria-label': title },
      h('span', { class: 'map-emoji' }, emoji), h('b', {}, title), h('small', {}, id === here ? '📍 You are here' : vi));
    b.addEventListener('click', () => {
      api.audio.pop();
      if (id === here) return api.say(title);
      p.close();
      go(id);
    });
    return b;
  };
  const passport = h('button', { class: 'btn btn-blue map-passport' }, '🛂 ZOO PASSPORT');
  passport.addEventListener('click', () => {
    api.audio.pop();
    p.close();
    openPassport(api);
  });
  p.setBody(h('div', { class: 'map-places' }, place('farm', '🏡', 'Farm', 'Nông trại'), place('zoo', '🦁', 'Happy Zoo', 'Sở thú')), passport);
  api.learn('map');
}

export function openPassport(api: WorldApi): void {
  api.pause(true);
  const p = openPanel(api.host, { title: 'Zoo Passport', emoji: '🛂', className: 'zoo-passport', onClose: () => api.pause(false) });
  const seen = (id: string) => (api.save.zoo.seen[id] ?? 0) > 0;
  const n = ZOO.filter((a) => seen(a.id)).length;
  const stamps = ZOO_ZONES.map((z) => h('div', { class: 'pp-zone' },
    h('p', { class: 'pp-zone-title' }, `${z.emoji} ${z.name}`),
    h('div', { class: 'pp-stamps' }, ...zooOfZone(z.id).map((a) => {
      const ok = seen(a.id);
      const b = h('button', { class: `pp-stamp${ok ? ' ok' : ''}`, 'aria-label': ok ? a.id : 'not yet' }, ok ? pic(a.id) : h('span', { class: 'pp-q' }, '?'), h('small', {}, ok ? a.id : '…'));
      b.addEventListener('click', () => (ok ? api.learn(a.id) : api.say('Not yet!')));
      return b;
    })),
  ));
  const badges = h('div', { class: 'pp-badges' }, ...ZOO_BADGES.map((b) => {
    const got = api.save.zoo.badges.includes(b.id);
    const el = h('button', { class: `pp-badge${got ? ' got' : ''}`, 'aria-label': b.title }, h('span', {}, got ? b.emoji : '🔒'), h('b', {}, b.title), h('small', {}, b.vi));
    el.addEventListener('click', () => api.say(b.title));
    return el;
  }));
  p.setBody(h('p', { class: 'hub-note' }, `Just for fun! 😊  ${n} / ${ZOO.length}`), ...stamps, h('p', { class: 'pp-zone-title' }, '🏅 Badges'), badges);
}
