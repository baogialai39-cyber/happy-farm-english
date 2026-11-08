/**
 * Thế giới nông trại (F-90 → F-109): canvas 2.5D + HUD cảm ứng.
 */
import { type AppCtx, iconButton, musicToggle } from '../app';
import { AGE_RULES, ageGroupFor, allowsJoystick, applyAgeRulesToCss } from '../config/ageRules';
import { getCharacter, withOnesie } from '../content/characters';
import { ANIMALS, ITEMS, SHOPS, type ShopId } from '../content/items';
import { speak } from '../systems/speech';
import { Teacher } from '../learning/teacher';
import {
  REMINDER_SEC, backupUsage, beginSession, canStart, dayProgress, effectiveLimits, endSession, loadParentLimits, loadUsage,
  remainingSec, skyPhase, storeUsage, tick,
} from '../systems/playtime';
import { nightFarmSvg } from '../art/nightFarm';
import { VOCAB } from '../content/vocab';
import { h } from '../ui/dom';
import { emptyNote, openPanel, pagedGrid, wordCard } from '../ui/panel';
import { Grid, distToRect, nearestInteractable } from '../world/grid';
import { interact, type WorldApi } from '../world/interactions';
import { TILE as T, WORLD, type WorldObject, type Zone, isPlantable, parsePlotKey, plotKey, plotObject, zoneAt } from '../world/map';
import { Player, RUN_PATH_TILES } from '../world/player';
import { type Camera, type Entity, type RenderState, animalEntities, buildGround, buildStatics, drawWorld, plotEntities } from '../world/render';
import { ZooHerd, type ZooActor } from '../world/zooWorld';
import { ZOO_MAP } from '../world/zooMap';
import { openCare, openMap, openZooBook } from '../world/zooUi';
import { zooTap, type ZooReward } from '../world/save';
import { ZOO_BADGES, type ZooZone } from '../content/zoo';
import { animalBox, FALL_MS, fruitAt, fruitRadius, furnitureBox, preloadWorldArt, treeGeom, treePoint } from '../world/renderArt';
import { fruitRipe, harvestFruit } from '../world/save';
import { countLabel, countSentence, countVi } from '../content/counting';
import type { ScreenRect } from '../learning/teacher';
import { type WorldSave, backupSave, activeDecor, applyUnlocks, count, ensureQuests, loadSave, plotStage, questEvent, storeSave } from '../world/save';
import { claimableCount, openHub } from '../world/hub';
import { openMiniGame } from '../games/miniGame';
import type { UnlockDef } from '../content/rewards';
import { ITEM_BY_ID } from '../content/items';
import { shopView } from '../world/shop';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const stripEmoji = (s: string) => s.replace(/\p{Extended_Pictographic}|️|[×]/gu, '').replace(/\s+/g, ' ').trim();

/** Vùng chạm để chọn đồ vật (bao cả phần cao của hình). */
function pickRect(o: WorldObject): { x: number; y: number; w: number; h: number } {
  switch (o.kind) {
    case 'shop': return { x: o.x * T, y: (o.y - 1.7) * T, w: o.w * T, h: (o.h + 1.7) * T };
    case 'barn': return { x: o.x * T, y: (o.y - 1.9) * T, w: o.w * T, h: (o.h + 1.9) * T };
    case 'furniture': return furnitureBox(o) ?? { x: o.x * T, y: o.y * T - (o.height ?? 36) - 10, w: o.w * T, h: o.h * T + (o.height ?? 36) + 10 };
    case 'animal': return animalBox(o);
    case 'tree': {
      const g = treeGeom(o)!;
      return { x: g.cx - g.W * 0.36, y: g.gy - g.H * 0.92, w: g.W * 0.72, h: g.H * 0.92 };
    }
    case 'sign': return { x: (o.x - 0.5) * T, y: (o.y - 0.6) * T, w: 2 * T, h: 1.6 * T };
    case 'well': return { x: o.x * T, y: (o.y - 0.9) * T, w: T, h: 1.9 * T };
    case 'nature': return o.word === 'tree' ? { x: (o.x - 0.4) * T, y: (o.y - 1.6) * T, w: 1.8 * T, h: 2.6 * T } : { x: (o.x - 0.1) * T, y: (o.y - 0.5) * T, w: 1.2 * T, h: 1.5 * T };
    default: return { x: o.x * T, y: o.y * T, w: o.w * T, h: o.h * T };
  }
}

function labelFor(o: WorldObject, save: WorldSave, now: number): { emoji: string; word: string } {
  if (o.kind === 'plot') {
    const p = save.plots[o.plot!];
    const stage = plotStage(p, now);
    if (stage === 'empty') return { emoji: '🌱', word: 'plant' };
    if (stage === 'dry') return { emoji: '💧', word: 'water' };
    if (stage === 'weeds') return { emoji: '🌿', word: 'weeds' };
    const crop = ITEM_BY_ID.get(ITEM_BY_ID.get(p!.crop)!.grows!)!;
    return { emoji: crop.emoji, word: stage === 'ready' ? `pick ${crop.word}` : crop.word };
  }
  if (o.kind === 'shop') return { emoji: SHOPS[o.shop!].keeper, word: SHOPS[o.shop!].name };
  if (o.kind === 'animal') return { emoji: ANIMALS[o.animal!].emoji, word: ANIMALS[o.animal!].word };
  return { emoji: o.emoji, word: o.word };
}

export async function worldScene(ctx: AppCtx, route: { profileId: string }): Promise<HTMLElement> {
  const profile = await ctx.store.get(route.profileId);
  if (!profile) {
    queueMicrotask(() => ctx.go({ name: 'welcome' }));
    return h('div', { class: 'screen' });
  }
  const group = ageGroupFor(profile.birthYear, profile.ageGroupOverride);
  applyAgeRulesToCss(group);
  const rules = AGE_RULES[group];
  let character = withOnesie(getCharacter(profile.avatarId)!, profile.onesie);
  // ---------- THỜI GIAN AN TOÀN (SPEC 17): kiểm tra trước khi vào ----------
  let lim = effectiveLimits(group, await loadParentLimits(ctx.kv, profile.id, group));
  const usage = await loadUsage(ctx.kv, profile.id);
  if (!canStart(usage, lim).ok) {
    // nông trại đang ngủ (nghỉ giữa phiên / hết giờ trong ngày) → về màn chào lại
    queueMicrotask(() => ctx.go({ name: 'welcome', profileId: profile.id }));
    return h('div', { class: 'screen' });
  }
  beginSession(usage);
  await storeUsage(ctx.kv, profile.id, usage);
  const save = await loadSave(ctx.kv, profile.id);
  // Nơi đang chơi: nông trại hoặc sở thú (SPEC 19.1) — cùng một cảnh, khác bản đồ
  const MAP = save.place === 'zoo' ? ZOO_MAP : WORLD;
  const isZoo = MAP.id === 'zoo';
  const herd = isZoo ? new ZooHerd(MAP) : null;
  applyUnlocks(save); // phòng khi save cũ có đủ sao mà chưa ghi mốc
  ensureQuests(save, group);
  let decorOn = activeDecor(save);
  const isActive = (o: WorldObject) => !o.decor || decorOn.has(o.decor);
  let grid = new Grid(MAP, isActive);
  const startPos = isZoo ? save.zooPos : save.pos;
  const start = startPos && !grid.boxHits(startPos.x, startPos.y) ? startPos : MAP.spawn;
  const player = new Player(start.x, start.y);
  await player.setLook(character, save.equipped);

  const st: RenderState = { save, now: Date.now(), lampOn: true, fedAt: {} };
  const ground = buildGround(MAP);
  const activeMap = () => ({ ...MAP, objects: MAP.objects.filter(isActive) });
  let statics = buildStatics(activeMap(), st);

  // ---------- DOM ----------
  const canvas = h('canvas', { class: 'world-canvas', 'aria-label': 'Farm world' });
  const c = canvas.getContext('2d')!;
  const coinPill = h('div', { class: 'coin-pill', 'aria-label': 'coins' });
  const starBtn = h('button', { class: 'star-btn', 'aria-label': 'Play and learn' });
  const skyOrb = h('span', { class: 'sky-orb' }, '☀️');
  const skyPill = h('div', { class: 'sky-pill phase-day', 'aria-label': 'Day' }, skyOrb, h('b', { class: 'sky-day' }, `Day ${usage.farmDay}`));
  const questToast = h('div', { class: 'quest-toast', hidden: true });
  const zonePill = h('div', { class: 'zone-pill', hidden: true });
  const interactBtn = h('button', { class: 'interact-btn', hidden: true });
  const root = h('div', { class: 'screen world' });

  const paintCoins = () => {
    coinPill.textContent = `🪙 ${save.coins}`;
    starBtn.replaceChildren(h('span', {}, `⭐ ${save.stars}`));
    const n = (save.quests?.list ?? []).filter((q) => !q.claimed && q.progress >= q.target).length;
    if (n) starBtn.append(h('span', { class: 'hub-badge' }, String(n)));
  };
  paintCoins();

  // ---------- trạng thái vòng lặp ----------
  let paused = false;
  let dirty = false;
  let lastSaveAt = performance.now();
  let pendingObj: WorldObject | undefined;
  let joyVec: { x: number; y: number } | null = null;
  const keys = new Set<string>();
  let near: WorldObject | undefined;
  let nearSig = '';
  let zone: Zone | undefined;
  const cam: Camera = { x: player.x * T, y: player.y * T, scale: 1 };
  const view = { w: 1, h: 1, dpr: 1 };

  /** Ghi vị trí vào đúng nơi đang chơi (nông trại / sở thú). */
  const storePos = () => {
    const here = { x: Math.round(player.x * 100) / 100, y: Math.round(player.y * 100) / 100 };
    if (isZoo) save.zooPos = here;
    else save.pos = here;
  };
  const persist = async () => {
    dirty = false;
    lastSaveAt = performance.now();
    storePos();
    await storeSave(ctx.kv, profile.id, save);
  };

  /** Lời nói thường (không phải bài học) — cùng một kênh giọng với ô từ vựng. */
  const sayText = (text: string) => speak(stripEmoji(text), rules.speechRate);

  // ---------- HỆ THỐNG HỌC (SPEC 15): ô từ vựng cạnh nhân vật ----------
  const teacher = new Teacher(root, rules, (key) => {
    if (!VOCAB.has(key) && !key.startsWith('sentence:')) return;
    const rec = save.learn[key] ?? { n: 0, t: 0 };
    save.learn[key] = { n: rec.n + 1, t: Date.now() };
    dirty = true;
  });
  let inShop = false;

  // ---------- Hiệu ứng vào/ra cửa hàng ----------
  const iris = async (x: number, y: number, closing: boolean, el?: HTMLElement): Promise<HTMLElement> => {
    const ring = el ?? h('div', { class: 'iris' });
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    if (!ring.isConnected) root.append(ring);
    const big = Math.hypot(view.w, view.h) * 2.2;
    const frames = closing ? [{ width: `${big}px`, height: `${big}px` }, { width: '0px', height: '0px' }] : [{ width: '0px', height: '0px' }, { width: `${big}px`, height: `${big}px` }];
    const dur = reducedMotion() ? 1 : 620;
    const anim = ring.animate(frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
    // Dự phòng: nếu trình duyệt tạm dừng hoạt ảnh (tab nền), vẫn hoàn tất để màn hình không kẹt tối
    await Promise.race([anim.finished, new Promise((r) => setTimeout(r, dur + 200))]);
    anim.finish();
    if (!closing) ring.remove();
    return ring;
  };

  const screenPos = () => ({
    x: (player.x * T - cam.x) * cam.scale + view.w / 2,
    y: (player.y * T - 40 - cam.y) * cam.scale + view.h / 2,
  });

  const enterShop = async (id: ShopId) => {
    if (paused) return;
    paused = true;
    player.path = [];
    pendingObj = undefined;
    const p = screenPos();
    inShop = true;
    ctx.audio.bell();
    const ring = await iris(p.x, p.y, true);
    const shop = shopView(api, id, async () => {
      const r2 = await iris(view.w / 2, view.h / 2, true, h('div', { class: 'iris' }));
      shop.remove();
      const door = WORLD.objects.find((o) => o.shop === id)!.hit!;
      player.x = door.x + 0.5;
      player.y = door.y + door.h + 0.5;
      cam.x = player.x * T;
      cam.y = player.y * T;
      clampCam();
      const q = screenPos();
      r2.remove();
      paused = false;
      inShop = false;
      await iris(q.x, q.y, false);
      void persist();
    });
    root.append(shop);
    ring.remove();
    const ring2 = h('div', { class: 'iris' });
    root.append(ring2); // vòng tròn mở ra phía trên cửa hàng
    await iris(view.w / 2, view.h / 2, false, ring2);
  };

  // ---------- Ngủ ----------
  const sleep = async () => {
    paused = true;
    const back = { x: player.x, y: player.y };
    const bed = WORLD.objects.find((o) => o.id === 'bed')!;
    player.x = bed.x + 1;
    player.y = bed.y + 1.5;
    player.state = 'sleep';
    const night = h('div', { class: 'night' }, h('div', { class: 'night-moon' }, '🌙'), h('p', {}, 'Good night!'));
    root.append(night);
    sayText('Good night!');
    await new Promise((r) => setTimeout(r, 2600));
    night.classList.add('morning');
    night.replaceChildren(h('div', { class: 'night-moon' }, '☀️'), h('p', {}, 'Good morning!'));
    sayText('Good morning!');
    await new Promise((r) => setTimeout(r, 1800));
    night.classList.add('out');
    setTimeout(() => night.remove(), 500);
    player.x = back.x;
    player.y = back.y;
    player.state = 'idle';
    player.act('🌞', Date.now());
    paused = false;
  };

  // ---------- API cho các tương tác ----------
  const api: WorldApi = {
    save,
    get character() { return character; },
    get onesie() { return profile.onesie; },
    setOnesie: async (id: string) => {
      if (!(await ctx.store.setOnesie(profile.id, id))) return;
      profile.onesie = id;
      character = withOnesie(getCharacter(profile.avatarId)!, id);
      await player.setLook(character, save.equipped);
    },
    rules,
    audio: ctx.audio,
    host: root,
    now: () => Date.now(),
    learn: (word, sentence, then) => teacher.teach(word, sentence, then),
    say: sayText,
    act: (emoji) => player.act(emoji, Date.now()),
    sitOn: () => {
      player.path = [];
      player.state = 'sit';
      player.say('😊', Date.now());
    },
    sleep,
    changed: () => {
      dirty = true;
      paintCoins();
    },
    refreshLook: () => player.setLook(character, save.equipped),
    anchorEl: (el: HTMLElement) => teacher.setAnchor(() => {
      const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
      return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height };
    }),
    enterShop: (id) => void enterShop(id),
    lamp: {
      get on() { return st.lampOn; },
      set on(v: boolean) { st.lampOn = v; },
    },
    fed: (id) => {
      st.fedAt[id] = Date.now();
    },
    pause: (on) => {
      paused = on;
      if (on) {
        player.path = [];
        pendingObj = undefined;
      }
    },
    event: (ev, n = 1) => {
      const done = questEvent(save, ev, n);
      dirty = true;
      if (done.length) {
        ctx.audio.chime();
        questToast.textContent = '⭐ Quest done!';
        questToast.hidden = false;
        questToast.classList.remove('pop');
        void questToast.offsetWidth;
        questToast.classList.add('pop');
        window.setTimeout(() => (questToast.hidden = true), 2600);
      }
      paintCoins();
    },
    openHub: (tab) => showHub(tab),
  };

  // ---------- Play & Learn: nhiệm vụ, mini-game, phần thưởng (SPEC 16) ----------
  const celebrate = async (list: UnlockDef[]) => {
    for (const u of list) {
      if (u.kind === 'decor') {
        decorOn = activeDecor(save);
        grid = new Grid(MAP, isActive);
        statics = buildStatics(activeMap(), st);
      }
      ctx.audio.fanfare();
      const pop = h('div', { class: 'unlock-pop' },
        h('p', { class: 'unlock-new' }, 'NEW!'),
        h('span', { class: 'unlock-emoji' }, u.emoji),
        h('b', {}, u.word),
        h('small', {}, u.kind === 'crop' ? '🌱 in the Seed Shop' : u.kind === 'accessory' ? '👕 in your wardrobe' : '🏡 on your farm'),
      );
      root.append(pop);
      teacher.teach(u.word);
      await new Promise((r) => setTimeout(r, 2600));
      pop.classList.add('out');
      setTimeout(() => pop.remove(), 400);
    }
    paintCoins();
  };
  const playGame = (id: Parameters<typeof openMiniGame>[1]) => {
    teacher.hide();
    api.pause(true);
    root.append(openMiniGame(api, id, {
      onUnlocks: (list) => void celebrate(list),
      onClose: () => {
        api.pause(false);
        paintCoins();
        void persist();
      },
    }));
  };
  const showHub = (tab: 'quests' | 'games' | 'rewards') => {
    teacher.hide();
    openHub(api, tab, { playGame, celebrate: (l) => void celebrate(l), refresh: paintCoins });
  };
  starBtn.addEventListener('click', () => {
    ctx.audio.pop();
    showHub(claimableCount(api) > 0 ? 'quests' : 'games');
  });
  paintCoins();

  /** Đồ vật tương tác: cố định + cây đã trồng + ô đất trống bé đang đứng (SPEC 14.3). */
  const interactables = (): WorldObject[] => {
    const list = MAP.objects.filter((o) => isActive(o) && o.kind !== 'zoo');
    if (isZoo) return list;
    for (const k of Object.keys(save.plots)) {
      const pos = parsePlotKey(k);
      if (pos) list.push(plotObject(pos.x, pos.y));
    }
    const tx = Math.floor(player.x), ty = Math.floor(player.y);
    if (isPlantable(MAP, tx, ty) && !save.plots[plotKey(tx, ty)]) list.push(plotObject(tx, ty));
    return list;
  };

  // ---------- Khung từ cạnh vật (SPEC 18.7): toạ độ thế giới → màn hình ----------
  const toScreen = (r: ScreenRect): ScreenRect => ({
    x: (r.x - cam.x) * cam.scale + view.w / 2, y: (r.y - cam.y) * cam.scale + view.h / 2, w: r.w * cam.scale, h: r.h * cam.scale,
  });
  const playerRect = (): ScreenRect => ({ x: player.x * T - 32, y: player.y * T - 124, w: 64, h: 128 });
  const union = (a: ScreenRect, b: ScreenRect): ScreenRect => {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
  };
  /** Khung cần tránh che = vật ∪ nhân vật (nếu nhân vật ở gần vật). */
  const anchorWorld = (rect: () => ScreenRect) => () => {
    const r = rect(), p = playerRect();
    const close = Math.abs(r.x + r.w / 2 - (p.x + p.w / 2)) < 3 * T && Math.abs(r.y + r.h - (p.y + p.h)) < 3 * T;
    return toScreen(close ? union(r, p) : r);
  };

  // ---------- Vườn cây ăn quả: chạm quả 2 lần (SPEC 18.5) ----------
  const fruitRect = (o: WorldObject, slot: number): ScreenRect => {
    const g = treeGeom(o)!;
    const sl = g.def.slots[slot];
    const p = treePoint(g, sl.x, sl.y), r = fruitRadius(g, slot);
    return { x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r };
  };
  const fruitTap = (o: WorldObject, slot: number) => {
    const g = treeGeom(o);
    if (!g) return;
    const fx = (st.orchard ??= { falling: [] });
    const now = Date.now();
    const kind = g.def.fruit;
    if (!fruitRipe(save, g.def.id, slot, now)) {
      // quả non / đang rơi: không hái, nhắc nhẹ
      if (fx.falling.some((f) => f.tree === g.def.id && f.slot === slot && now - f.t0 < FALL_MS)) return;
      player.act('⏳', now);
      ctx.audio.hmm();
      sayText('Not yet!');
      return;
    }
    const marked = fx.marked && fx.marked.tree === g.def.id && fx.marked.slot === slot;
    if (!marked) {
      // LẦN 1: khung từ cạnh quả, đọc 3 lần, tự đóng
      fx.marked = { tree: g.def.id, slot };
      player.act('👀', now);
      teacher.setAnchor(anchorWorld(() => fruitRect(o, slot)));
      api.learn(kind);
      return;
    }
    // LẦN 2: quả rơi vào giỏ, đếm bằng tiếng Anh
    const got = harvestFruit(save, g.def.id, slot, now);
    if (!got) return;
    fx.marked = undefined;
    fx.falling = fx.falling.filter((f) => now - f.t0 < FALL_MS);
    fx.falling.push({ tree: g.def.id, slot, t0: now });
    teacher.hide();
    ctx.audio.pop();
    api.event('harvest');
    if (kind === 'apple') api.event('harvest:apple');
    api.changed();
    const n = got.count;
    const basket = () => {
      const b = treePoint(g, g.def.basket.x, g.def.basket.y);
      const w = 54 * g.k;
      return { x: b.x - w / 2, y: b.y - w * 1.2, w, h: w * 1.2 };
    };
    setTimeout(() => {
      if (!root.isConnected) return;
      ctx.audio.coin();
      player.act('🧺', Date.now());
      teacher.setAnchor(anchorWorld(basket));
      teacher.count(kind, countLabel(kind, n), countSentence(kind, n), countVi(kind, n), ITEM_BY_ID.get(kind)?.emoji ?? '🧺');
    }, FALL_MS * 0.8);
  };

  // ---------- HAPPY ZOO: chạm con vật, thưởng khám phá, đi lại giữa 2 nơi (SPEC 19) ----------
  const toast = (text: string) => {
    questToast.textContent = text;
    questToast.hidden = false;
    questToast.classList.remove('pop');
    void questToast.offsetWidth;
    questToast.classList.add('pop');
    window.setTimeout(() => (questToast.hidden = true), 2600);
  };
  const zooReward = (r: ZooReward, newAnimal?: string) => {
    if (newAnimal) toast(`🛂 New friend! +${r.stars - r.badges.length * 2} ⭐`);
    r.badges.forEach((b, i) => setTimeout(() => {
      ctx.audio.fanfare();
      const pop = h('div', { class: 'unlock-pop' }, h('p', { class: 'unlock-new' }, 'BADGE!'), h('span', { class: 'unlock-emoji' }, b.emoji), h('b', {}, b.title), h('small', {}, '🛂 Zoo Passport'));
      root.append(pop);
      setTimeout(() => {
        pop.classList.add('out');
        setTimeout(() => pop.remove(), 400);
      }, 2400);
    }, 1200 + i * 2800));
    if (r.unlocked.length) setTimeout(() => void celebrate(r.unlocked), 1200 + r.badges.length * 2800);
    void ZOO_BADGES;
    paintCoins();
  };
  const zooHooks = {
    get herd() { return herd!; },
    anchorAnimal: (id: string) => {
      const a = herd?.byId(id);
      if (a) teacher.setAnchor(anchorWorld(() => a.rect()));
    },
    reward: (r: ZooReward) => zooReward(r),
  };
  const zooTapActor = (a: ZooActor) => {
    if (paused) return;
    const now = Date.now();
    ctx.audio.pop();
    if (Math.abs(a.x - player.x) > 0.2) player.facing = a.x > player.x ? 1 : -1;
    const r = zooTap(save, a.def.id);
    dirty = true;
    a.hopAt = now;
    teacher.setAnchor(anchorWorld(() => a.rect()));
    if (r.n % 2 === 1) {
      // LẦN 1 (và mọi lần lẻ): khung tên — hình, tên Anh, nghĩa Việt, loa; đọc 3 lần, tự đóng
      if (r.n === 1) player.act('👀', now);
      api.learn(a.def.id);
    } else {
      // LẦN 2 (và mọi lần chẵn): hoạt động đặc trưng + tiếng kêu + câu ngắn
      const act = a.def.actions[(r.n / 2 - 1) % a.def.actions.length];
      a.perform(act.anim, now, act.anim === 'sleep' ? 6500 : 4500);
      if (act.anim !== 'sleep') ctx.audio.zoo(a.def.sound ?? 'bubble');
      player.act('😊', now, 1100, 'happy');
      api.learn('', { key: `zoo:${a.def.id}:${act.anim}`, entry: { en: act.en, vi: act.vi, emoji: '🐾', art: a.def.id }, force: true });
    }
    zooReward(r.reward, r.n === 1 ? a.def.id : undefined);
  };
  let traveled = false;
  const travel = async (place: 'farm' | 'zoo') => {
    if (place === (isZoo ? 'zoo' : 'farm') || ended) return;
    paused = true;
    teacher.hide();
    await persist(); // lưu vị trí ở nơi hiện tại
    save.place = place;
    await persist();
    await storeUsage(ctx.kv, profile.id, usage);
    traveled = true; // cảnh cũ không ghi đè dữ liệu sau khi cảnh mới đã tải
    ctx.audio.bell();
    const p = screenPos();
    await iris(p.x, p.y, true);
    ctx.go({ name: 'farm', profileId: profile.id });
  };
  const openMapPanel = () => {
    ctx.audio.pop();
    openMap(api, isZoo ? 'zoo' : 'farm', (pl) => void travel(pl));
  };

  const doInteract = (o: WorldObject) => {
    if (paused) return;
    const r = o.hit ?? o;
    const cx = r.x + r.w / 2;
    if (Math.abs(cx - player.x) > 0.2) player.facing = cx > player.x ? 1 : -1;
    if (o.action === 'fruit') return fruitTap(o, o.slot ?? 0);
    if (o.action === 'care') {
      ctx.audio.pop();
      return openCare(api, o.zooZone as ZooZone, zooHooks);
    }
    if (o.action === 'zoobook') {
      ctx.audio.pop();
      api.learn('book');
      return openZooBook(api);
    }
    if (o.action === 'gate') {
      ctx.audio.pop();
      api.learn('zoo');
      return openMap(api, 'zoo', (pl) => void travel(pl));
    }
    teacher.setAnchor(anchorWorld(() => pickRect(o)));
    void interact(api, o);
  };

  // ---------- Chạm để đi ----------
  const goTo = (goals: { x: number; y: number }[], obj?: WorldObject) => {
    const from = { x: Math.floor(player.x), y: Math.floor(player.y) };
    const path = grid.findPath(from, goals);
    if (!path) return false;
    player.standUp();
    // bắt đầu từ tâm ô hiện tại → không bao giờ vướng góc tường khi đi chéo
    const off = Math.hypot(player.x - (from.x + 0.5), player.y - (from.y + 0.5));
    player.path = off > 0.05 && path.length ? [from, ...path] : path;
    player.running = path.length > RUN_PATH_TILES;
    pendingObj = obj;
    const end = path.length ? path[path.length - 1] : from;
    st.target = { x: end.x + 0.5, y: end.y + 0.5 };
    if (path.length === 0 && obj) {
      pendingObj = undefined;
      if (obj.kind === 'shop') void enterShop(obj.shop!);
      else doInteract(obj);
    }
    return true;
  };

  const onTap = (sx: number, sy: number) => {
    if (paused) return;
    const wx = (sx - view.w / 2) / cam.scale + cam.x;
    const wy = (sy - view.h / 2) / cam.scale + cam.y;
    // quả trên cây được ưu tiên (vùng chạm riêng từng quả)
    // sở thú: chạm con vật từ ngoài rào (không cần đi vào chuồng — SPEC 19.4)
    const zooHit = herd?.hit(wx, wy);
    if (zooHit) return zooTapActor(zooHit);
    const fr = fruitAt(MAP.objects, wx, wy);
    if (fr) {
      ctx.audio.pop();
      if (goTo(grid.standTiles(fr.o), { ...fr.o, action: 'fruit', slot: fr.slot })) return;
    }
    let best: WorldObject | undefined;
    let bestBase = -Infinity;
    for (const o of interactables()) {
      const r = pickRect(o);
      if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
        const base = (o.y + o.h) * T;
        if (base > bestBase) {
          best = o;
          bestBase = base;
        }
      }
    }
    if (best) {
      ctx.audio.pop();
      // giường: chạm gối → PILLOW, chạm chăn → BLANKET, đầu giường → đi ngủ (SPEC 18.6)
      if (best.id === 'bed') {
        const box = furnitureBox(best);
        const rel = box ? (wy - box.y) / box.h : 0;
        if (rel >= 0.3) best = { ...best, id: rel < 0.52 ? 'bed-pillow' : 'bed-blanket', action: 'item', word: rel < 0.52 ? 'pillow' : 'blanket', emoji: '🛏️' };
      }
      if (goTo(grid.standTiles(best), best)) return;
    }
    const tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    // chạm ô đất trống trong vườn → đi tới và gieo hạt ở đúng ô đó
    if (isPlantable(MAP, tx, ty) && !save.plots[plotKey(tx, ty)]) {
      ctx.audio.pop();
      if (goTo([{ x: tx, y: ty }], plotObject(tx, ty))) return;
    }
    const goals: { x: number; y: number }[] = [];
    for (let rad = 0; rad <= 2 && goals.length === 0; rad++)
      for (let y = ty - rad; y <= ty + rad; y++) for (let x = tx - rad; x <= tx + rad; x++) if (!grid.isSolid(x, y)) goals.push({ x, y });
    goTo(goals);
  };

  let down: { id: number; x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    down = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || down.id !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved < 18) {
      const r = canvas.getBoundingClientRect();
      onTap(e.clientX - r.left, e.clientY - r.top);
    }
  });

  // ---------- Cần điều khiển ảo (nhóm 4–8) ----------
  let joy: HTMLElement | null = null;
  if (allowsJoystick(group)) {
    const knob = h('div', { class: 'joy-knob' });
    joy = h('div', { class: 'joy', 'aria-label': 'Joystick' }, h('div', { class: 'joy-ring' }), knob);
    let jid: number | null = null;
    const update = (e: PointerEvent) => {
      const r = joy!.getBoundingClientRect();
      const R = r.width / 2;
      let dx = (e.clientX - (r.left + R)) / R, dy = (e.clientY - (r.top + R)) / R;
      const m = Math.hypot(dx, dy);
      if (m > 1) { dx /= m; dy /= m; }
      joyVec = { x: dx, y: dy };
      knob.style.transform = `translate(${dx * R * 0.55}px, ${dy * R * 0.55}px)`;
      joy!.classList.toggle('run', Math.hypot(dx, dy) > 0.8);
    };
    joy.addEventListener('pointerdown', (e) => {
      jid = e.pointerId;
      joy!.setPointerCapture(e.pointerId);
      st.target = undefined;
      pendingObj = undefined;
      update(e);
    });
    joy.addEventListener('pointermove', (e) => { if (e.pointerId === jid) update(e); });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== jid) return;
      jid = null;
      joyVec = null;
      knob.style.transform = '';
      joy!.classList.remove('run');
    };
    joy.addEventListener('pointerup', end);
    joy.addEventListener('pointercancel', end);
  }

  // ---------- Bàn phím (tùy chọn) ----------
  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift'].includes(k)) {
      if (e.type === 'keydown') keys.add(k);
      else keys.delete(k);
      e.preventDefault();
    } else if (e.type === 'keydown' && (k === ' ' || k === 'enter') && near && !paused) {
      e.preventDefault();
      doInteract(near);
    }
  };
  const keyVec = () => {
    const x = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
    const y = (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0);
    if (!x && !y) return null;
    const m = Math.hypot(x, y);
    const sp = keys.has('shift') ? 1 : 0.7;
    return { x: (x / m) * sp, y: (y / m) * sp };
  };
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);

  interactBtn.addEventListener('click', () => {
    if (near) doInteract(near);
  });

  // ---------- Túi đồ ----------
  const openBag = () => {
    ctx.audio.pop();
    api.pause(true);
    const items = ITEMS.filter((i) => count(save, i.id) > 0);
    openPanel(root, { title: 'My Bag', emoji: '🎒', onClose: () => api.pause(false) },
      h('p', { class: 'bag-coins' }, `🪙 ${save.coins} coins`),
      pagedGrid(
        items.map((i) => wordCard({ emoji: i.emoji, word: i.word, sub: i.kind === 'seed' ? '🌱 seeds' : undefined, badge: `×${count(save, i.id)}`, onTap: () => api.learn(i.word) })),
        rules.maxChoices,
        emptyNote('🎒', 'Empty bag!'),
      ),
    );
  };

  // ---------- Kích thước ----------
  const clampCam = () => {
    const hw = view.w / 2 / cam.scale, hh = view.h / 2 / cam.scale;
    const mw = MAP.w * T, mh = MAP.h * T;
    cam.x = hw * 2 >= mw ? mw / 2 : Math.min(Math.max(cam.x, hw), mw - hw);
    cam.y = hh * 2 >= mh ? mh / 2 : Math.min(Math.max(cam.y, hh), mh - hh);
  };
  const resize = () => {
    const r = root.getBoundingClientRect();
    view.w = Math.max(1, r.width);
    view.h = Math.max(1, r.height);
    view.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(view.w * view.dpr);
    canvas.height = Math.round(view.h * view.dpr);
    cam.scale = Math.min(1.3, Math.max(0.55, Math.min(view.w / (12 * T), view.h / (8.5 * T))));
    clampCam();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(root);

  const onHide = () => {
    if (document.hidden) {
      backupSave(profile.id, save);
      backupUsage(profile.id, usage);
      void persist();
      void storeUsage(ctx.kv, profile.id, usage);
    } else lastUsageTick = Date.now(); // không tính thời gian lúc ẩn (F-15)
  };
  document.addEventListener('visibilitychange', onHide);
  // Đóng tab / tải lại: ghi đồng bộ để không mất dữ liệu (SPEC 17.5)
  const onPageHide = () => {
    storePos();
    backupSave(profile.id, save);
    backupUsage(profile.id, usage);
  };
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('beforeunload', onPageHide);

  // ---------- NGÀY & ĐÊM (SPEC 17.2) ----------
  let lastUsageTick = Date.now();
  let lastUsageSave = 0;
  let lastLimitsLoad = Date.now();
  let lastSkyPaint = 0;
  let ended = false;
  let lampAuto = false;
  const LIGHTS: [number, number, number][] = [
    [17.5, 5.5, 3.4], [27, 5.5, 3.2], [17.5, 11, 3.2], [27, 11, 3.2], [21.5, 12.5, 2.2],
    [18.5, 27.6, 1.8], [25.5, 27.6, 1.8], [32.5, 27.6, 1.8], [39.5, 27.6, 1.8], [38, 5.2, 2],
  ];
  const paintSky = (p: number) => {
    const ph = skyPhase(p);
    skyPill.className = `sky-pill phase-${ph}`;
    skyOrb.textContent = ph === 'dusk' || ph === 'night' ? '🌙' : ph === 'sunset' ? '🌇' : '☀️';
    // mặt trời đi theo cung từ trái qua phải và lặn xuống dần
    skyOrb.style.left = `${8 + p * 70}%`;
    skyOrb.style.top = `${Math.round(30 - Math.sin(Math.min(1, p) * Math.PI * 0.85) * 22 + (p > 0.75 ? (p - 0.75) * 60 : 0))}%`;
  };
  const drawNight = (p: number) => {
    if (p < 0.75) return;
    c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    const k1 = Math.min(1, (p - 0.75) / 0.17); // hoàng hôn
    const k2 = p >= 0.92 ? Math.min(1, (p - 0.92) / 0.08) : 0; // chạng vạng
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = `rgba(255,${Math.round(200 - 40 * k1)},${Math.round(170 - 60 * k1)},${0.45 * k1})`;
    c.fillRect(0, 0, view.w, view.h);
    if (k2 > 0) {
      c.fillStyle = `rgba(70,70,150,${0.6 * k2})`;
      c.fillRect(0, 0, view.w, view.h);
    }
    // ánh đèn vàng ấm trong nhà, cửa hàng, chuồng
    c.globalCompositeOperation = 'lighter';
    const a = Math.min(1, (p - 0.75) / 0.1) * (0.22 + 0.18 * k2);
    for (const [lx, ly, r] of LIGHTS) {
      const sx = (lx * T - cam.x) * cam.scale + view.w / 2, sy = (ly * T - cam.y) * cam.scale + view.h / 2;
      const rad = r * T * cam.scale;
      if (sx < -rad || sy < -rad || sx > view.w + rad || sy > view.h + rad) continue;
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, rad);
      g.addColorStop(0, `rgba(255,214,140,${a})`);
      g.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = g;
      c.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
    }
    c.globalCompositeOperation = 'source-over';
  };

  /** Hết phiên: dừng mọi thứ, lưu, kết thúc phiên NGAY (tải lại cũng không vượt) rồi hiện màn kết thúc ngày. */
  const endOfDay = async () => {
    if (ended) return;
    ended = true;
    paused = true;
    player.path = [];
    pendingObj = undefined;
    joyVec = null;
    teacher.hide();
    root.querySelectorAll('.wpanel-overlay, .shop-scene, .minigame, .unlock-pop, .iris, .night').forEach((e) => e.remove());
    inShop = false;
    endSession(usage, lim);
    await storeUsage(ctx.kv, profile.id, usage);
    await persist();
    ctx.audio.setMood('evening');
    const good = h('button', { class: 'btn btn-blue goodnight-btn' }, '🌙 GOOD NIGHT!');
    const overlay = h('div', { class: 'day-end', role: 'dialog', 'aria-modal': 'true' },
      h('div', { class: 'day-end-art', html: nightFarmSvg() }),
      h('div', { class: 'day-end-card' },
        h('p', { class: 'day-end-title' }, 'Trời tối rồi, chúng ta ngủ thôi nào!'),
        h('p', { class: 'day-end-en' }, "It's night time. Let's go to sleep! 😴"),
      ),
      h('div', { class: 'day-end-bottom' },
        h('p', { class: 'day-end-note' }, `Day ${usage.farmDay} ✓ · ⭐ ${save.stars} · 🪙 ${save.coins}`),
        good,
      ),
    );
    good.addEventListener('click', async () => {
      good.disabled = true;
      ctx.audio.pop();
      sayText('Good night!');
      await persist();
      await storeUsage(ctx.kv, profile.id, usage);
      ctx.audio.setMood('day');
      ctx.go({ name: 'splash' });
    });
    root.append(overlay);
    setTimeout(() => sayText("It's night time. Let's go to sleep!"), 600);
  };

  /** Mỗi khung hình: cộng thời gian (chỉ khi hiển thị), đổi bầu trời, đèn, nhạc; hết giờ → kết thúc ngày. */
  const timeStep = async () => {
    if (ended) return;
    const nowMs = Date.now();
    if (!document.hidden) tick(usage, (nowMs - lastUsageTick) / 1000, nowMs);
    lastUsageTick = nowMs;
    if (nowMs - lastLimitsLoad > 15_000) {
      lastLimitsLoad = nowMs; // giới hạn phụ huynh áp dụng ngay cả khi bé đang chơi
      lim = effectiveLimits(group, await loadParentLimits(ctx.kv, profile.id, group));
    }
    const p = dayProgress(usage, lim);
    const ph = skyPhase(p);
    if (ph !== 'day' && !lampAuto) {
      lampAuto = true;
      st.lampOn = true; // đèn trong nhà tự bật
    }
    ctx.audio.setMood(ph === 'day' ? 'day' : 'evening');
    if (nowMs - lastSkyPaint > 500) {
      lastSkyPaint = nowMs;
      paintSky(p);
    }
    const rem = remainingSec(usage, lim);
    if (rem <= REMINDER_SEC && rem > 0 && !usage.reminded) {
      usage.reminded = true; // nhắc nhẹ một lần, không đếm ngược (A10)
      questToast.textContent = '🐔 Almost time to rest!';
      questToast.hidden = false;
      questToast.classList.remove('pop');
      void questToast.offsetWidth;
      questToast.classList.add('pop');
      window.setTimeout(() => (questToast.hidden = true), 4000);
      sayText('Almost time to rest!');
    }
    if (nowMs - lastUsageSave > 5000) {
      lastUsageSave = nowMs;
      void storeUsage(ctx.kv, profile.id, usage);
    }
    if (rem <= 0) void endOfDay();
  };

  // ---------- Vòng lặp ----------
  let last = performance.now();
  let started = false;
  const frame = (t: number) => {
    if (started && !root.isConnected) return cleanup();
    if (root.isConnected) started = true;
    const dt = Math.max(0, Math.min(0.05, (t - last) / 1000)); // không bao giờ âm (khung đầu / bước giả lập)
    last = t;
    st.now = Date.now();

    if (!paused) {
      const input = joyVec ?? keyVec();
      if (input) st.target = undefined;
      const arrived = player.update(dt, st.now, grid, input);
      if (arrived) {
        st.target = undefined;
        const o = pendingObj;
        pendingObj = undefined;
        if (o) {
          if (o.kind === 'shop') void enterShop(o.shop!);
          else doInteract(o);
        }
      }
      if (!player.path.length && !pendingObj) st.target = undefined;
      // cần điều khiển đẩy lên khi đứng trước cửa → vào cửa hàng
      if (near?.kind === 'shop' && input && input.y < -0.6 && distToRect(player.x, player.y, near.hit!) < 0.62) void enterShop(near.shop!);
    }

    // camera mượt theo nhân vật
    const k = Math.min(1, dt * 7);
    cam.x += (player.x * T - cam.x) * k;
    cam.y += (player.y * T - 30 - cam.y) * k;
    clampCam();

    // đồ vật gần + nút tương tác
    const n = paused ? undefined : nearestInteractable(interactables(), player.x, player.y);
    const label = n ? labelFor(n, save, st.now) : undefined;
    const sig = n ? `${n.id}|${label!.emoji}|${label!.word}` : '';
    near = n;
    st.highlight = n;
    if (sig !== nearSig) {
      nearSig = sig;
      if (n) {
        const l = label!;
        interactBtn.replaceChildren(h('span', { class: 'ib-emoji' }, l.emoji), h('span', { class: 'ib-word' }, n.kind === 'shop' ? 'Go in' : l.word));
        interactBtn.setAttribute('aria-label', l.word);
        interactBtn.hidden = false;
        interactBtn.classList.remove('pop');
        void interactBtn.offsetWidth;
        interactBtn.classList.add('pop');
      } else interactBtn.hidden = true;
    }

    // khu vực
    const z = zoneAt(MAP, Math.floor(player.x), Math.floor(player.y));
    if (z?.id !== zone?.id) {
      zone = z;
      if (z) {
        zonePill.hidden = false;
        zonePill.textContent = `${z.emoji} ${z.name}`;
        zonePill.classList.remove('pop');
        void zonePill.offsetWidth;
        zonePill.classList.add('pop');
        if (!paused) teacher.ambient(z.vocab); // dạy tên khu vực khi đang rảnh (SPEC 15.3)
      } else zonePill.hidden = true;
    }

    // ô từ vựng đi theo nhân vật (trong cửa hàng: neo cố định)
    teacher.position(inShop ? null : teacher.anchorFn?.() ?? toScreen(playerRect()), view);

    // vẽ
    herd?.update(paused ? 0 : dt, st.now);
    const dyn: Entity[] = isZoo
      ? [...herd!.entities(save, st.now), player.entity(st.now)]
      : [...plotEntities(MAP, st), ...animalEntities(MAP, st), player.entity(st.now)];
    drawWorld(c, view, cam, ground, statics.concat(dyn), (cc) => drawOverlay(cc, t), t);
    drawNight(dayProgress(usage, lim));
    void timeStep();

    if ((dirty && t - lastSaveAt > 600) || t - lastSaveAt > 15000) void persist();
    raf = requestAnimationFrame(frame);
  };

  const drawOverlay = (cc: CanvasRenderingContext2D, t: number) => {
    // khung nét đứt: ô đất trống bé đang đứng có thể trồng
    const ptx = Math.floor(player.x), pty = Math.floor(player.y);
    if (!paused && isPlantable(MAP, ptx, pty) && !save.plots[plotKey(ptx, pty)]) {
      cc.strokeStyle = 'rgba(255,255,255,.95)';
      cc.lineWidth = 4;
      cc.setLineDash([10, 8]);
      cc.lineDashOffset = -t / 40;
      cc.beginPath();
      cc.roundRect(ptx * T + 4, pty * T + 4, T - 8, T - 8, 12);
      cc.stroke();
      cc.setLineDash([]);
    }
    if (st.target) {
      const r = 14 + Math.sin(t / 180) * 3;
      cc.strokeStyle = 'rgba(255,255,255,.9)';
      cc.lineWidth = 5;
      cc.beginPath();
      cc.ellipse(st.target.x * T, st.target.y * T, r, r * 0.5, 0, 0, 7);
      cc.stroke();
    }
    const onPlotTile = near?.kind === 'plot' && near.x === ptx && near.y === pty;
    if (near && !paused && !onPlotTile) {
      const r = pickRect(near);
      const bob = Math.abs(Math.sin(t / 260)) * 8;
      // mũi tên chỉ đồ vật đang chọn (vẽ tay, không phụ thuộc emoji)
      const ax = r.x + r.w / 2, ay = r.y - 14 - bob;
      cc.fillStyle = '#FFB347';
      cc.strokeStyle = '#FFFFFF';
      cc.lineWidth = 5;
      cc.lineJoin = 'round';
      cc.beginPath();
      cc.moveTo(ax - 16, ay - 22);
      cc.lineTo(ax + 16, ay - 22);
      cc.lineTo(ax, ay);
      cc.closePath();
      cc.stroke();
      cc.fill();
    }
  };

  // tải trước hình vẽ (đồ đạc, con vật, cây, quả) để khung hình đầu đã rõ nét — tối đa 2,5 giây
  {
    const off = document.createElement('canvas').getContext('2d')!;
    for (const e of [...statics, ...(herd ? herd.entities(save, Date.now()) : animalEntities(MAP, st))]) e.draw(off, 0);
    await Promise.race([preloadWorldArt(), new Promise((r) => setTimeout(r, 2500))]);
  }
  let raf = requestAnimationFrame(frame);
  setTimeout(() => teacher.sentence(isZoo ? 'zoo' : 'hello'), 900); // câu đầu tiên: Hello! / Welcome to Happy Zoo!
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__world = {
      player, save, api, grid, world: MAP, herd, travel, cam, near: () => near, tap: onTap, goTo, usage, limits: () => lim, endOfDay, st, teacher,
      /** Toạ độ màn hình của một quả (để test chạm). */
      fruitScreen: (treeId: string, slot: number) => { const o = MAP.objects.find((x) => x.tree === treeId)!; const r = toScreen(fruitRect(o, slot)); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; },
      toScreen,
      /** Chỉ dùng khi test lúc khung trình duyệt bị ẩn (rAF không chạy). */
      step: (frames: number) => { for (let i = 0; i < frames; i++) frame(last + 16.7); },
    };
  const cleanup = () => {
    cancelAnimationFrame(raf);
    teacher.destroy();
    ro.disconnect();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKey);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('beforeunload', onPageHide);
    if (traveled) return;
    void persist();
    if (!ended) void storeUsage(ctx.kv, profile.id, usage);
  };

  root.append(
    canvas,
    h('div', { class: 'topbar' },
      h('div', { class: 'hud-left' },
        iconButton('home', 'Home', async () => {
          ctx.audio.pop();
          await persist();
          await storeUsage(ctx.kv, profile.id, usage);
          ctx.go({ name: 'welcome', profileId: profile.id });
        }),
        skyPill,
      ),
      h('div', { class: 'hud-right' },
        starBtn,
        coinPill,
        h('button', { class: 'icon-btn map-btn', 'aria-label': 'Map', onclick: openMapPanel }, h('span', { class: 'bag-emoji' }, '🗺️')),
        h('button', { class: 'icon-btn bag-btn', 'aria-label': 'My bag', onclick: openBag }, h('span', { class: 'bag-emoji' }, '🎒')),
        musicToggle(ctx),
      ),
    ),
    zonePill,
    questToast,
    ...(joy ? [joy] : []),
    interactBtn,
  );
  return root;
}
