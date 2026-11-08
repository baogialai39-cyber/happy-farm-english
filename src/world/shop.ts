/**
 * Bên trong 4 cửa hàng (SPEC 13.5, 14.1–14.5). Mỗi cửa hàng một giao diện riêng.
 * Chỉ dùng xu nông trại kiếm trong game — không có tiền thật (CLAUDE.md A3).
 */
import { characterSvg, type AccessoryLayer } from '../art/character';
import { ONESIES } from '../content/characters';
import {
  ACCESSORIES, ACCESSORY_TABS, type AccessorySlot, ITEM_BY_ID, RECIPES, SHOPS, type ShopId,
} from '../content/items';
import { h, ICONS } from '../ui/dom';
import { emptyNote, openPanel, pagedGrid } from '../ui/panel';
import type { WorldApi } from './interactions';
import { buyAccessory, buyItem, canMake, count, isUnlocked, mixBowl, sellItem, toggleAccessory } from './save';
import { unlockFor } from '../content/rewards';

/** Nút khóa: cần thêm sao (SPEC 16.4) — không mua bằng xu hay tiền thật. */
function lockedButton(target: string): HTMLButtonElement {
  const b = h('button', { class: 'btn btn-soft card-btn locked-btn' }, `🔒 ⭐ ${unlockFor(target)?.stars ?? ''}`);
  b.disabled = true;
  return b;
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

interface Frame {
  root: HTMLElement;
  body: HTMLElement;
  coins: HTMLElement;
  keeper: HTMLElement;
  talk(text: string, speak?: boolean): void;
  paintCoins(): void;
  happy(): void;
}

function frame(api: WorldApi, id: ShopId, onExit: () => void): Frame {
  const def = SHOPS[id];
  const coins = h('div', { class: 'coin-pill big' });
  const speech = h('p', { class: 'keeper-speech' }, `Welcome to the ${def.name}!`);
  const keeper = h('span', { class: 'keeper-emoji' }, def.keeper);
  const body = h('div', { class: 'shop-body' });
  const exit = h('button', { class: 'btn btn-blue exit-btn', html: `${ICONS.back}<span>EXIT</span>` });
  exit.addEventListener('click', () => {
    api.audio.pop();
    onExit();
  });
  const root = h('div', { class: `shop-scene shop-${id}`, style: `--shop:${def.color};--roof:${def.roof}` },
    h('div', { class: 'shop-awning' }),
    h('div', { class: 'shop-decor', 'aria-hidden': 'true' }),
    h('header', { class: 'shop-head' }, exit, h('h2', {}, def.name), coins),
    h('div', { class: 'shop-keeper' }, keeper, speech),
    body,
  );
  const f: Frame = {
    root, body, coins, keeper,
    talk(text, speak = false) {
      speech.textContent = text;
      speech.classList.remove('pop');
      void speech.offsetWidth;
      speech.classList.add('pop');
      if (speak) api.say(text);
    },
    paintCoins() {
      coins.textContent = `🪙 ${api.save.coins}`;
    },
    happy() {
      keeper.classList.remove('jump');
      void keeper.offsetWidth;
      keeper.classList.add('jump');
    },
  };
  f.paintCoins();
  setTimeout(() => f.talk(`Welcome to the ${def.name}!`, true), 350);
  return f;
}

const noCoins = (f: Frame) => f.talk("Let's grow more! 🌱", true);

/** Bay một phần tử (emoji) từ A tới B (hoạt ảnh bán / mua). */
async function fly(host: HTMLElement, text: string, from: DOMRect, to: DOMRect, cls = '') {
  const hb = host.getBoundingClientRect();
  const el = h('div', { class: `flyer ${cls}` }, text);
  el.style.left = `${from.left + from.width / 2 - hb.left}px`;
  el.style.top = `${from.top + from.height / 2 - hb.top}px`;
  host.append(el);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const dur = reducedMotion() ? 1 : 650;
  const anim = el.animate(
    [
      { transform: 'translate(-50%,-50%) scale(1)' },
      { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 80}px)) scale(1.3)`, offset: 0.5 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.8)` },
    ],
    { duration: dur, easing: 'ease-in-out', fill: 'forwards' },
  );
  await Promise.race([anim.finished, new Promise((r) => setTimeout(r, dur + 150))]);
  el.remove();
}

function bump(el: HTMLElement, cls = 'bump') {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// =====================================================================
// 1) Accessory Shop + tủ quần áo: gương thử đồ (SPEC 14.1)
// =====================================================================
export function dressingRoom(api: WorldApi, mode: 'shop' | 'wardrobe', f?: Frame): HTMLElement {
  let tab: AccessorySlot = 'head';
  const tryOn: AccessoryLayer = {};
  const mirrorArt = h('div', { class: 'mirror-art' });
  const mirrorLabel = h('p', { class: 'mirror-label' });
  const tabs = h('div', { class: 'acc-tabs', role: 'tablist' });
  const grid = h('div', { class: 'acc-grid' });

  const look = (): AccessoryLayer => ({ ...api.save.equipped, ...tryOn });
  const paintMirror = (label = '') => {
    mirrorArt.innerHTML = characterSvg(api.character, 'mirror-char', false, look(), undefined, { feet: true });
    mirrorLabel.textContent = label;
  };
  const say = (t: string) => f?.talk(t); // người bán chỉ hiện chữ; giọng dành cho ô từ vựng

  const paintTabs = () => {
    tabs.replaceChildren(
      ...ACCESSORY_TABS.map((t) => {
        const b = h('button', { class: `acc-tab${t.slot === tab ? ' on' : ''}`, role: 'tab', 'aria-selected': String(t.slot === tab) },
          h('span', { class: 'acc-tab-emoji' }, t.emoji), h('span', {}, t.title));
        b.addEventListener('click', () => {
          tab = t.slot;
          api.audio.pop();
          api.learn(t.title);
          paintTabs();
          paintGrid();
        });
        return b;
      }),
    );
  };

  const paintGrid = () => {
    const list = ACCESSORIES.filter((a) => a.slot === tab && (mode === 'shop' || api.save.owned.includes(a.id)));
    const cards = list.map((a) => {
      const owned = api.save.owned.includes(a.id);
      const wearing = api.save.equipped[a.slot] === a.id;
      const tap = h('button', { class: 'acc-tap', 'aria-label': a.word },
        h('span', { class: 'acc-swatch', style: `--sw:${a.color ?? '#FFFFFF'}` }, a.emoji),
        h('span', { class: 'acc-word' }, a.word));
      tap.addEventListener('click', () => {
        tryOn[a.slot] = a.id; // mặc thử
        api.audio.pop();
        api.learn(a.word);
        paintMirror(owned ? `✓ ${a.word}` : `👀 ${a.word}`);
        bump(mirrorArt, 'sparkle');
        paintGrid();
      });
      let action: HTMLButtonElement;
      if (!owned && !isUnlocked(api.save, a.id)) {
        action = lockedButton(a.id);
      } else if (!owned) {
        action = h('button', { class: 'btn btn-green card-btn' }, `BUY 🪙${a.price}`);
        action.addEventListener('click', async () => {
          const r = buyAccessory(api.save, a.id);
          if (r === 'coins') return f ? noCoins(f) : undefined;
          if (r !== 'ok') return;
          api.audio.coin();
          api.changed();
          delete tryOn[a.slot];
          await api.refreshLook();
          f?.paintCoins();
          f?.happy();
          say(`A ${a.word}! You look great!`);
          api.learn(a.word); // mua mũ → HAT…
          paintMirror(`✓ ${a.word}`);
          paintGrid();
        });
      } else {
        action = h('button', { class: `btn ${wearing ? 'btn-soft' : 'btn-green'} card-btn` }, wearing ? 'TAKE OFF' : 'WEAR');
        action.addEventListener('click', async () => {
          toggleAccessory(api.save, a.id);
          delete tryOn[a.slot];
          api.changed();
          await api.refreshLook();
          api.audio.pop();
          api.learn(a.word);
          paintMirror();
          paintGrid();
        });
      }
      const trying = tryOn[a.slot] === a.id;
      return h('div', { class: `acc-card${wearing ? ' wearing' : ''}${trying ? ' trying' : ''}` }, tap, action);
    });
    const empty = mode === 'wardrobe' ? emptyNote('🎀', 'Visit the Accessory Shop!') : emptyNote('🧺', 'Coming soon!');
    grid.replaceChildren(pagedGrid(cards, api.rules.maxChoices, empty));
  };

  // Tủ quần áo: đổi màu áo liền thân (miễn phí, SPEC 18.2)
  const onesieRow = h('div', { class: 'onesie-row', role: 'group', 'aria-label': 'Onesie' });
  const paintOnesies = () => {
    onesieRow.replaceChildren(
      ...ONESIES.map((o) => {
        const sel = (api.onesie ?? '') === o.id;
        const b = h('button', { class: `onesie-dot${sel ? ' selected' : ''}`, 'aria-pressed': String(sel), 'aria-label': `${o.en} – ${o.vi}`, style: `--dot:${o.color}` });
        b.addEventListener('click', async () => {
          api.audio.pop();
          await api.setOnesie?.(o.id);
          api.learn(o.en.toLowerCase());
          paintMirror(`✓ ${o.en}`);
          bump(mirrorArt, 'sparkle');
          paintOnesies();
        });
        return b;
      }),
    );
  };
  if (mode === 'wardrobe' && api.setOnesie) paintOnesies();

  paintTabs();
  paintGrid();
  paintMirror();
  return h('div', { class: 'dressing' },
    h('div', { class: 'mirror' }, h('div', { class: 'mirror-frame' }, mirrorArt), mirrorLabel),
    h('div', { class: 'dressing-side' }, mode === 'wardrobe' && api.setOnesie ? onesieRow : '', tabs, grid),
  );
}

function boutique(api: WorldApi, f: Frame) {
  f.body.append(dressingRoom(api, 'shop', f));
}

// =====================================================================
// 2) Seed Shop — gói hạt (SPEC 14.2)
// =====================================================================
function seedCenter(api: WorldApi, f: Frame) {
  const shelf = h('div', { class: 'seed-shelf' });
  const paint = () => {
    const cards = SHOPS.seed.items().map((iid) => {
      const it = ITEM_BY_ID.get(iid)!;
      const crop = ITEM_BY_ID.get(it.grows!)!;
      const have = count(api.save, iid);
      const packet = h('button', { class: 'packet', 'aria-label': it.word, style: `--band:${PACKET_COLORS[crop.id] ?? '#8FD18B'}` },
        h('span', { class: 'packet-band' }, 'SEEDS'),
        h('span', { class: 'packet-art' }, crop.emoji),
        h('span', { class: 'packet-word' }, crop.word),
        h('span', { class: 'packet-info' }, `⏱ ${Math.round((it.growMs ?? 0) / 1000)}s · ${crop.emoji}×2`),
        have ? h('span', { class: 'wc-badge' }, `×${have}`) : null,
      );
      packet.addEventListener('click', () => {
        bump(packet, 'boing');
        api.learn(crop.word);
      });
      if (!isUnlocked(api.save, iid)) {
        packet.classList.add('locked');
        return h('div', { class: 'packet-card' }, packet, lockedButton(iid));
      }
      const buy = h('button', { class: 'btn btn-green card-btn' }, `BUY 🪙${it.buy}`);
      buy.addEventListener('click', async () => {
        const r = buyItem(api.save, iid);
        if (r === 'coins') return noCoins(f);
        if (r !== 'ok') return;
        api.audio.coin();
        api.changed();
        f.paintCoins();
        f.happy();
        f.talk(`${it.word}!`);
        api.learn(crop.word); // mua hạt táo → APPLE (SPEC 15.1)
        await fly(f.root, '🌱', buy.getBoundingClientRect(), f.coins.getBoundingClientRect());
        paint();
      });
      return h('div', { class: 'packet-card' }, packet, buy);
    });
    shelf.replaceChildren(pagedGrid(cards, api.rules.maxChoices));
  };
  paint();
  f.body.append(shelf);
}

const PACKET_COLORS: Record<string, string> = {
  apple: '#FF8A8A', carrot: '#FFAA5C', tomato: '#FF7B7B', strawberry: '#FF9CC2', sunflower: '#FFD84D', watermelon: '#7ED492', corn: '#F7D774',
};

// =====================================================================
// 3) Fruit Market — sạp trái cây + hoạt ảnh bán hàng (SPEC 14.4)
// =====================================================================
function fruitStand(api: WorldApi, f: Frame) {
  const basket = h('div', { class: 'basket-list' });
  const scale = h('div', { class: 'scale' }, h('span', { class: 'scale-plate' }), h('span', { class: 'scale-emoji' }, '⚖️'));
  const cash = h('div', { class: 'cashbox' }, '🪙');
  const counter = h('div', { class: 'counter' }, scale, cash);
  const paint = () => {
    const ids = SHOPS.market.items().filter((iid) => count(api.save, iid) > 0);
    if (!ids.length) {
      basket.replaceChildren(emptyNote('🧺', 'Bring me fruit and vegetables!'));
      return;
    }
    basket.replaceChildren(
      pagedGrid(
        ids.map((iid) => {
          const it = ITEM_BY_ID.get(iid)!;
          const em = h('button', { class: 'basket-emoji', 'aria-label': it.word }, it.emoji);
          em.addEventListener('click', () => {
            bump(em, 'boing');
            api.learn(it.word);
          });
          const sell = h('button', { class: 'btn btn-green card-btn' }, `SELL 🪙${it.sell}`);
          sell.addEventListener('click', async () => {
            if (sell.disabled) return;
            sell.disabled = true;
            const from = em.getBoundingClientRect();
            if (sellItem(api.save, iid) !== 'ok') return;
            api.event('sell');
            api.changed();
            // hoạt ảnh: món hàng bay lên cân → cân nhún → xu bay lên ô xu
            await fly(f.root, it.emoji, from, scale.getBoundingClientRect());
            bump(scale);
            api.audio.coin();
            f.happy();
            f.talk(`Thank you for the ${it.word}!`);
            api.learn(it.word);
            await fly(f.root, `+${it.sell} 🪙`, cash.getBoundingClientRect(), f.coins.getBoundingClientRect(), 'coin-flyer');
            f.paintCoins();
            bump(f.coins);
            paint();
          });
          return h('div', { class: 'basket-card' }, em, h('span', { class: 'basket-word' }, it.word), h('span', { class: 'wc-badge' }, `×${count(api.save, iid)}`), sell);
        }),
        api.rules.maxChoices,
      ),
    );
  };
  paint();
  f.body.append(h('div', { class: 'stand' }, h('section', { class: 'basket' }, h('h3', {}, '🧺 My basket'), basket), counter));
}

// =====================================================================
// 4) Bakery — 7 nguyên liệu + quầy trộn (SPEC 14.5)
// =====================================================================
const BOWL_MAX = 5;
const CAKE_IDS = new Set(['cake', 'strawberry-cake', 'choco-cupcake']);

function bakery(api: WorldApi, f: Frame) {
  let mode: 'buy' | 'mix' = 'buy';
  const tabBuy = h('button', { class: 'acc-tab on' }, h('span', { class: 'acc-tab-emoji' }, '🛒'), h('span', {}, 'Buy'));
  const tabMix = h('button', { class: 'acc-tab' }, h('span', { class: 'acc-tab-emoji' }, '🥣'), h('span', {}, 'Mix'));
  const content = h('div', { class: 'bakery-content' });
  const setMode = (m: 'buy' | 'mix') => {
    mode = m;
    tabBuy.classList.toggle('on', m === 'buy');
    tabMix.classList.toggle('on', m === 'mix');
    api.audio.pop();
    api.learn(m === 'buy' ? 'buy' : 'mix');
    paint();
  };
  tabBuy.addEventListener('click', () => setMode('buy'));
  tabMix.addEventListener('click', () => setMode('mix'));

  // ----- Kệ nguyên liệu -----
  const paintBuy = () => {
    const cards = SHOPS.baking.items().map((iid) => {
      const it = ITEM_BY_ID.get(iid)!;
      const jar = h('button', { class: 'jar', 'aria-label': it.word }, h('span', { class: 'jar-lid' }), h('span', { class: 'jar-emoji' }, it.emoji));
      jar.addEventListener('click', () => {
        bump(jar, 'boing');
        api.learn(it.word);
      });
      const have = count(api.save, iid);
      const buy = h('button', { class: 'btn btn-green card-btn' }, `BUY 🪙${it.buy}`);
      buy.addEventListener('click', async () => {
        const r = buyItem(api.save, iid);
        if (r === 'coins') return noCoins(f);
        if (r !== 'ok') return;
        api.audio.coin();
        api.changed();
        f.paintCoins();
        f.happy();
        f.talk(`${it.word}!`);
        api.learn(it.word);
        await fly(f.root, it.emoji, jar.getBoundingClientRect(), f.coins.getBoundingClientRect());
        paint();
      });
      return h('div', { class: 'jar-card' }, jar, h('span', { class: 'jar-word' }, it.word), have ? h('span', { class: 'wc-badge' }, `×${have}`) : null, buy);
    });
    content.replaceChildren(pagedGrid(cards, api.rules.maxChoices));
  };

  // ----- Quầy trộn -----
  let bowl: string[] = [];
  const inBowl = (id: string) => bowl.filter((b) => b === id).length;
  const paintMix = () => {
    const bowlEl = h('div', { class: 'bowl' },
      h('span', { class: 'bowl-emoji' }, '🥣'),
      h('div', { class: 'bowl-items' },
        ...bowl.map((id, i) => {
          const chip = h('button', { class: 'bowl-chip', 'aria-label': ITEM_BY_ID.get(id)!.word }, ITEM_BY_ID.get(id)!.emoji);
          chip.addEventListener('click', () => {
            bowl.splice(i, 1); // lấy ra lại
            api.audio.pop();
            paint();
          });
          return chip;
        }),
        ...Array.from({ length: BOWL_MAX - bowl.length }, () => h('span', { class: 'bowl-slot' })),
      ),
    );
    // nguyên liệu bé đang có (trong túi) để cho vào bát
    const pantryIds = [...new Set([...SHOPS.baking.items(), 'carrot', 'tomato', 'corn', 'watermelon'])].filter((id) => count(api.save, id) - inBowl(id) > 0);
    const pantry = h('div', { class: 'pantry' },
      ...pantryIds.map((id) => {
        const it = ITEM_BY_ID.get(id)!;
        const b = h('button', { class: 'pantry-btn', 'aria-label': it.word },
          h('span', { class: 'pantry-emoji' }, it.emoji), h('span', { class: 'pantry-word' }, it.word), h('span', { class: 'wc-badge' }, `×${count(api.save, id) - inBowl(id)}`));
        b.addEventListener('click', async () => {
          if (bowl.length >= BOWL_MAX) return f.talk('The bowl is full!');
          api.learn(it.word);
          await fly(f.root, it.emoji, b.getBoundingClientRect(), bowlEl.getBoundingClientRect());
          bowl.push(id);
          paint();
        });
        return b;
      }),
    );
    const mix = h('button', { class: 'btn btn-green mix-btn' }, '🥄 MIX!');
    mix.disabled = bowl.length === 0;
    mix.addEventListener('click', async () => {
      bump(bowlEl, 'stir');
      api.audio.pop();
      await new Promise((r) => setTimeout(r, reducedMotion() ? 0 : 900));
      const made = mixBowl(api.save, bowl);
      bowl = [];
      if (made) {
        const it = ITEM_BY_ID.get(made)!;
        if (CAKE_IDS.has(made)) api.event('make:cake');
        api.changed();
        api.audio.chime();
        f.happy();
        f.talk(`You made ${it.word}! Yummy!`);
        api.learn(it.word, CAKE_IDS.has(made) ? { key: 'makeCake' } : undefined);
        const pop = h('div', { class: 'made-pop' }, h('span', {}, it.emoji), h('b', {}, it.word));
        f.root.append(pop);
        setTimeout(() => pop.remove(), 1800);
      } else {
        f.talk("Hmm, let's try another mix!", true); // nhẹ nhàng, nguyên liệu trả lại túi
      }
      paint();
    });
    const clear = h('button', { class: 'btn btn-soft mix-btn' }, '↩');
    clear.setAttribute('aria-label', 'Empty the bowl');
    clear.disabled = bowl.length === 0;
    clear.addEventListener('click', () => {
      bowl = [];
      api.audio.pop();
      paint();
    });
    const book = h('button', { class: 'btn btn-blue mix-btn' }, '📖 Recipes');
    book.addEventListener('click', () => recipeBook());
    content.replaceChildren(
      h('div', { class: 'mix-counter' },
        h('div', { class: 'mix-left' }, bowlEl, h('div', { class: 'mix-actions' }, clear, mix, book)),
        h('div', { class: 'mix-right' }, h('h3', {}, '👜 My ingredients'), pantryIds.length ? pantry : emptyNote('🛒', 'Buy some ingredients first!')),
      ),
    );
  };

  // ----- Sách công thức: gợi ý bằng hình; "Put in bowl" cho bé nhỏ -----
  const recipeBook = () => {
    api.audio.pop();
    const p = openPanel(f.root, { title: 'Recipe Book', emoji: '📖' });
    const rows = RECIPES.map((r) => {
      const out = ITEM_BY_ID.get(r.id)!;
      const need = Object.entries(r.need).flatMap(([id, n]) => Array.from({ length: n }, () => id));
      const ok = canMake(api.save, r);
      const row = h('div', { class: `recipe-row${ok ? ' ok' : ''}` },
        h('button', { class: 'recipe-out', 'aria-label': out.word, onclick: () => api.learn(out.word) }, h('span', {}, out.emoji), h('b', {}, out.word)),
        h('span', { class: 'recipe-eq' }, '='),
        h('div', { class: 'recipe-need' }, ...need.map((id) => h('span', { class: `need${count(api.save, id) > 0 ? ' have' : ''}` }, ITEM_BY_ID.get(id)!.emoji))),
      );
      const put = h('button', { class: 'btn btn-green card-btn' }, 'PUT IN BOWL');
      put.disabled = !ok;
      put.addEventListener('click', () => {
        bowl = need.slice(0, BOWL_MAX);
        p.close();
        api.learn(out.word);
        paint();
      });
      row.append(put);
      return row;
    });
    p.setBody(h('div', { class: 'recipe-list' }, ...rows));
  };

  const paint = () => {
    if (mode === 'buy') paintBuy();
    else paintMix();
  };
  paint();
  f.body.append(h('div', { class: 'bakery' }, h('div', { class: 'acc-tabs bakery-tabs' }, tabBuy, tabMix), content));
}

export function shopView(api: WorldApi, id: ShopId, onExit: () => void): HTMLElement {
  const f = frame(api, id, onExit);
  if (id === 'accessory') boutique(api, f);
  else if (id === 'seed') seedCenter(api, f);
  else if (id === 'market') fruitStand(api, f);
  else bakery(api, f);
  return f.root;
}

