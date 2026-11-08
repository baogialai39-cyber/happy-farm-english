/**
 * 4 MINI-GAME (SPEC 16.3) — chơi thật: Find the Word, Listen and Choose, Match the Words, Farm Quiz.
 * Đúng: chỉ "ting" nhẹ + sáng xanh rồi sang câu ngay; LỜI KHEN dồn vào màn tổng kết cuối lượt (SPEC 16.3, F-170).
 * Sai: không trừ điểm, không X đỏ, gợi ý bằng hình + âm (luật tuổi).
 */
import { artPicture } from '../art/library';
import type { AgeGroup } from '../config/ageRules';
import { GAMES, type GameId } from '../content/gamesData';
import { GAME_REWARD, type UnlockDef } from '../content/rewards';
import { resolveVocab } from '../content/vocab';
import { h, ICONS, SVG_NS } from '../ui/dom';
import type { WorldApi } from '../world/interactions';
import { finishGame } from '../world/save';
import {
  type ChoiceQuestion, type QuizItem, makeChoiceRound, makeCountRound, makeHomeBoards, makeMatchBoards, makeQuizRound, makeSoundRound,
  makeZooFindRound, nextPraise, shuffle, wrongFeedback,
} from './engine';
import { NUMBER_WORDS } from '../content/gamesData';
import { numberWord } from '../content/counting';
import { pluralAnimal } from '../content/zoo';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 200) : ms));
const emojiOf = (w: string) => resolveVocab(w)?.emoji ?? '❓';
/** Hình thư viện nếu có (đồng nhất với thế giới), không thì emoji. */
const picOf = (w: string): HTMLElement | string => artPicture(w) ?? emojiOf(w);
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

function bump(el: HTMLElement, cls: string) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

interface Ctx {
  api: WorldApi;
  group: AgeGroup;
  stage: HTMLElement;
  praise: HTMLElement;
  lastPraise?: string;
  learned: Set<string>;
  /** Số câu / bảng đã hoàn thành (hiện ở màn tổng kết). */
  solved: number;
  setProgress(i: number, n: number): void;
}

/** Trả lời đúng: "ting" nhẹ, ghi nhận từ, sang câu tiếp ngay — KHÔNG khen giữa chừng (F-170). */
async function correct(c: Ctx, word: string) {
  c.api.audio.ting();
  c.learned.add(word);
  c.solved++;
  await wait(650);
}

// =====================================================================
// Câu hỏi nhiều lựa chọn (Find the Word, Listen and Choose, Farm Quiz)
// =====================================================================
type OptionLook = 'word' | 'picture' | 'both';

function choiceQuestion(c: Ctx, q: { answer: string; options: string[] }, prompt: HTMLElement, look: OptionLook, replay: () => void, label?: (w: string) => Node | string): Promise<void> {
  return new Promise((resolve) => {
    let wrong = 0;
    let done = false;
    const buttons = new Map<string, HTMLButtonElement>();
    const grid = h('div', { class: `mg-options n${q.options.length}` });
    for (const w of q.options) {
      const b = label
        ? h('button', { class: `mg-option look-${look}`, 'aria-label': w }, label(w))
        : h('button', { class: `mg-option look-${look}`, 'aria-label': w },
          look !== 'word' ? h('span', { class: 'mg-opt-emoji' }, picOf(w)) : null,
          look !== 'picture' || c.group !== '2-3' ? h('span', { class: 'mg-opt-word' }, look === 'word' ? w.toUpperCase() : w) : null,
        );
      b.addEventListener('click', async () => {
        if (done || b.classList.contains('nope')) return;
        if (w === q.answer) {
          done = true;
          b.classList.add('right');
          grid.classList.add('solved');
          await correct(c, q.answer);
          resolve();
          return;
        }
        // SAI: không trừ điểm, không X đỏ — chỉ lắc nhẹ, mờ đi, gợi ý
        wrong++;
        c.api.audio.hmm();
        b.classList.add('nope');
        bump(b, 'shake');
        const fb = wrongFeedback(c.group, wrong);
        const right = buttons.get(q.answer)!;
        if (fb.hint === 'reveal') {
          right.classList.add('reveal');
          c.api.say(`${fb.voice ?? ''} ${cap(q.answer)}.`);
        } else if (fb.hint === 'bounce') {
          bump(right, 'hint');
          c.api.say(fb.voice ?? '');
          setTimeout(replay, 900);
        } else if (fb.hint === 'eliminate') {
          const others = [...buttons.entries()].filter(([k, el]) => k !== q.answer && !el.classList.contains('nope'));
          if (others.length) others[0][1].classList.add('nope', 'gone');
          c.api.say(fb.voice ?? '');
          setTimeout(replay, 900);
        } else {
          c.api.say(fb.voice ?? '');
        }
      });
      buttons.set(w, b);
      grid.append(b);
    }
    c.stage.replaceChildren(prompt, grid);
  });
}

function speakerButton(onClick: () => void, big = false): HTMLButtonElement {
  const b = h('button', { class: `mg-speaker${big ? ' big' : ''}`, 'aria-label': 'Listen again', html: ICONS.musicOn });
  b.addEventListener('click', onClick);
  return b;
}

async function findTheWord(c: Ctx) {
  const qs: ChoiceQuestion[] = makeChoiceRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const pic = h('button', { class: 'mg-picture', 'aria-label': 'picture' }, picOf(q.answer));
    pic.addEventListener('click', () => bump(pic, 'wiggle')); // không đọc đáp án — bé tự tìm chữ
    const prompt = h('div', { class: 'mg-prompt' }, pic, h('p', { class: 'mg-ask' }, 'Find the word!'));
    if (i === 0) c.api.say('Find the word!');
    await choiceQuestion(c, q, prompt, 'word', () => bump(pic, 'wiggle'));
  }
}

async function listenAndChoose(c: Ctx) {
  const qs: ChoiceQuestion[] = makeChoiceRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const play = () => c.api.say(cap(q.answer));
    const prompt = h('div', { class: 'mg-prompt' }, speakerButton(play, true), h('p', { class: 'mg-ask' }, 'Listen and choose!'));
    setTimeout(play, 350);
    await choiceQuestion(c, q, prompt, 'picture', play);
  }
}

async function farmQuiz(c: Ctx) {
  const qs: QuizItem[] = makeQuizRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const play = () => c.api.say(q.q);
    const prompt = h('div', { class: 'mg-prompt quiz' },
      h('div', { class: 'mg-quiz-q' }, speakerButton(play), h('p', { class: 'mg-ask' }, q.q)),
      h('p', { class: 'mg-vi' }, q.vi),
      q.picture ? h('div', { class: 'mg-quiz-pic' }, q.picture) : null,
    );
    setTimeout(play, 350);
    await choiceQuestion(c, q, prompt, 'both', play);
  }
}

// =====================================================================
// Match the Words — chạm chữ rồi chạm hình (chỉ chạm, hợp mọi tuổi)
// =====================================================================
async function matchTheWords(c: Ctx) {
  const boards = makeMatchBoards(c.group).map((b) => b.map((w) => ({ key: w, left: () => w, right: () => picOf(w), sayLeft: cap(w), learn: [w] })));
  await matchBoards(c, boards, 'Match the words!', 'mg-word');
}

/** Animal Homes (SPEC 19.7): nối con vật ↔ nơi sống. */
async function animalHomes(c: Ctx) {
  const boards = makeHomeBoards(c.group).map((b) => b.map((p) => ({
    key: p.animal,
    left: () => h('span', { class: 'mg-home-animal' }, picOf(p.animal), c.group !== '2-3' ? h('small', {}, p.animal) : ''),
    right: () => h('span', { class: 'mg-home' }, h('span', { class: 'mg-home-emoji' }, emojiOf(p.home)), h('b', {}, p.home)),
    sayLeft: cap(p.animal),
    sayRight: cap(p.home),
    learn: [p.animal, p.home],
  })));
  await matchBoards(c, boards, 'Where do they live?', 'mg-pic');
}

interface MatchPair { key: string; left: () => Node | string; right: () => Node | string; sayLeft: string; sayRight?: string; learn: string[] }

/** Bảng nối chung: chạm bên trái rồi chạm bên phải (chỉ chạm, hợp mọi tuổi). */
async function matchBoards(c: Ctx, boards: MatchPair[][], ask: string, leftClass: string) {
  for (let bi = 0; bi < boards.length; bi++) {
    c.setProgress(bi, boards.length);
    await new Promise<void>((resolve) => {
      const pairs = boards[bi];
      const rights = shuffle(pairs);
      const wrongs = new Map<string, number>();
      let selWord: string | null = null;
      let selPic: string | null = null;
      let matched = 0;
      const lines = document.createElementNS(SVG_NS, 'svg');
      lines.setAttribute('class', 'mg-lines');
      const wordBtns = new Map<string, HTMLButtonElement>();
      const picBtns = new Map<string, HTMLButtonElement>();
      const colL = h('div', { class: 'mg-col' });
      const colR = h('div', { class: 'mg-col' });
      const board = h('div', { class: 'mg-board' }, colL, colR);
      board.prepend(lines as unknown as HTMLElement);

      const drawLine = (w: string) => {
        const a = wordBtns.get(w)!.getBoundingClientRect(), b = picBtns.get(w)!.getBoundingClientRect(), r = board.getBoundingClientRect();
        const ln = document.createElementNS(SVG_NS, 'line');
        ln.setAttribute('x1', String(a.right - r.left));
        ln.setAttribute('y1', String(a.top + a.height / 2 - r.top));
        ln.setAttribute('x2', String(b.left - r.left));
        ln.setAttribute('y2', String(b.top + b.height / 2 - r.top));
        lines.append(ln);
      };
      const clearSel = () => {
        selWord = selPic = null;
        board.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
      };
      const tryPair = async () => {
        if (!selWord || !selPic) return;
        const w = selWord, p = selPic;
        const pair = pairs.find((x) => x.key === w)!;
        if (w === p) {
          wordBtns.get(w)!.classList.add('matched');
          picBtns.get(w)!.classList.add('matched');
          drawLine(w);
          clearSel();
          matched++;
          pair.learn.forEach((x) => c.learned.add(x));
          c.api.audio.ting();
          if (pair.sayRight) c.api.say(`${pair.sayLeft}. ${pair.sayRight}.`);
          if (matched === pairs.length) {
            await wait(900);
            await correct(c, pair.key);
            resolve();
          }
          return;
        }
        // nối sai: lắc nhẹ, gợi ý ô đúng
        const n = (wrongs.get(w) ?? 0) + 1;
        wrongs.set(w, n);
        c.api.audio.hmm();
        bump(picBtns.get(p)!, 'shake');
        const fb = wrongFeedback(c.group, n);
        const right = picBtns.get(w)!;
        if (fb.hint === 'reveal') {
          right.classList.add('reveal');
          c.api.say(`${fb.voice ?? ''} ${pair.sayRight ?? pair.sayLeft}.`);
        } else {
          if (fb.hint !== 'none') bump(right, 'hint');
          c.api.say(fb.voice ?? '');
        }
        picBtns.get(p)!.classList.remove('sel');
        selPic = null;
      };
      for (const pr of pairs) {
        const b = h('button', { class: leftClass, 'aria-label': pr.key }, pr.left());
        b.addEventListener('click', () => {
          if (b.classList.contains('matched')) return;
          wordBtns.forEach((x) => x.classList.remove('sel'));
          b.classList.add('sel');
          selWord = pr.key;
          c.api.say(pr.sayLeft);
          void tryPair();
        });
        wordBtns.set(pr.key, b);
        colL.append(b);
      }
      for (const pr of rights) {
        const b = h('button', { class: 'mg-pic', 'aria-label': pr.sayRight ?? 'picture' }, pr.right());
        b.addEventListener('click', () => {
          if (b.classList.contains('matched')) return;
          picBtns.forEach((x) => x.classList.remove('sel', 'reveal'));
          b.classList.add('sel');
          selPic = pr.key;
          if (pr.sayRight) c.api.say(pr.sayRight);
          void tryPair();
        });
        picBtns.set(pr.key, b);
        colR.append(b);
      }
      c.stage.replaceChildren(h('p', { class: 'mg-ask' }, ask), board);
      if (bi === 0) c.api.say(ask);
    });
  }
}

// =====================================================================
// Sở thú: Find the Animal · Animal Sounds · Count the Animals (SPEC 19.7)
// =====================================================================
async function findTheAnimal(c: Ctx) {
  const qs = makeZooFindRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const play = () => c.api.say(`${cap(q.answer)}!`);
    const prompt = h('div', { class: 'mg-prompt' }, speakerButton(play, true), h('p', { class: 'mg-ask' }, 'Find the animal!'));
    setTimeout(play, 350);
    await choiceQuestion(c, q, prompt, 'picture', play);
  }
}

async function animalSounds(c: Ctx) {
  const qs = makeSoundRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const play = () => (q.bank === 'zoo' ? c.api.audio.zoo(q.sound) : c.api.audio.animal(q.sound));
    const prompt = h('div', { class: 'mg-prompt' }, speakerButton(play, true), h('p', { class: 'mg-ask' }, 'Who says this?'));
    if (i === 0) c.api.say('Who says this?');
    setTimeout(play, i === 0 ? 1400 : 350);
    await choiceQuestion(c, q, prompt, 'picture', play);
  }
}

async function countTheAnimals(c: Ctx) {
  const qs = makeCountRound(c.group);
  for (let i = 0; i < qs.length; i++) {
    c.setProgress(i, qs.length);
    const q = qs[i];
    const ask = `How many ${q.n === 1 ? q.animal : pluralAnimal(q.animal)}?`;
    const play = () => c.api.say(ask);
    const crowd = h('div', { class: 'mg-crowd' }, ...Array.from({ length: q.n }, () => h('span', { class: 'mg-crowd-one' }, picOf(q.animal))));
    const prompt = h('div', { class: 'mg-prompt' }, h('div', { class: 'mg-quiz-q' }, speakerButton(play), h('p', { class: 'mg-ask' }, ask)), crowd);
    setTimeout(play, 350);
    await choiceQuestion(c, q, prompt, 'word', play, (w) => h('span', { class: 'mg-num' }, h('b', {}, String(NUMBER_WORDS.indexOf(w))), c.group !== '2-3' ? h('small', {}, w) : ''));
    c.learned.add(q.animal);
    // nói câu đếm ("Three monkeys.") — nội dung học, không phải lời khen
    c.api.say(`${cap(numberWord(q.n))} ${q.n === 1 ? q.animal : pluralAnimal(q.animal)}.`);
    await wait(1300);
  }
}

// =====================================================================
// Khung trò chơi + màn tổng kết
// =====================================================================
export interface MiniGameHooks {
  /** Gọi ngay khi xong lượt (để chúc mừng mốc mở khóa mới). */
  onUnlocks(list: UnlockDef[]): void;
  /** Bé bấm EXIT / BACK. */
  onClose(): void;
}

export function openMiniGame(api: WorldApi, game: GameId, hooks: MiniGameHooks): HTMLElement {
  const def = GAMES.find((g) => g.id === game)!;
  const dots = h('div', { class: 'mg-dots' });
  const stage = h('div', { class: 'mg-stage' });
  const praise = h('div', { class: 'mg-praise', 'aria-live': 'polite' });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.remove();
    hooks.onClose();
  };
  const exit = h('button', { class: 'btn btn-blue exit-btn', html: `${ICONS.back}<span>EXIT</span>` });
  exit.addEventListener('click', () => {
    api.audio.pop();
    close();
  });
  const root = h('div', { class: `minigame mg-${game}` },
    h('header', { class: 'mg-head' }, exit, h('h2', {}, `${def.emoji} ${def.title}`), dots),
    stage, praise,
  );
  const c: Ctx = {
    api, group: api.rules.group, stage, praise, learned: new Set(), solved: 0,
    setProgress(i, n) {
      dots.replaceChildren(...Array.from({ length: n }, (_, k) => h('span', { class: k < i ? 'done' : k === i ? 'on' : '' })));
    },
  };
  const run = async () => {
    if (game === 'find') await findTheWord(c);
    else if (game === 'listen') await listenAndChoose(c);
    else if (game === 'match') await matchTheWords(c);
    else if (game === 'zfind') await findTheAnimal(c);
    else if (game === 'zsound') await animalSounds(c);
    else if (game === 'zhome') await animalHomes(c);
    else if (game === 'zcount') await countTheAnimals(c);
    else await farmQuiz(c);
    if (closed) return;
    // Hoàn thành → luôn đủ sao (dựa vào hoàn thành, không dựa vào số lần sai)
    const unlocked = finishGame(api.save, game, GAME_REWARD);
    api.changed();
    summary();
    if (unlocked.length) hooks.onUnlocks(unlocked);
  };
  const summary = () => {
    c.setProgress(99, 0);
    api.audio.fanfare();
    // Lời khen DUY NHẤT của lượt: đọc to ở cuối (F-170)
    const p = nextPraise(c.lastPraise);
    c.praise.textContent = p;
    bump(c.praise, 'show');
    api.say(`${p} You did it!`);
    const again = h('button', { class: 'btn btn-green mg-big-btn' }, '🔁 PLAY AGAIN');
    again.addEventListener('click', () => {
      api.audio.pop();
      closed = true; // khung cũ được thay bằng lượt mới (không tự chơi tiếp — bé tự bấm)
      root.replaceWith(openMiniGame(api, game, hooks));
    });
    const back = h('button', { class: 'btn btn-soft mg-big-btn' }, '🏡 BACK');
    back.addEventListener('click', () => {
      api.audio.pop();
      close();
    });
    stage.replaceChildren(
      h('div', { class: 'mg-summary' },
        h('p', { class: 'mg-sum-title' }, p),
        h('p', { class: 'mg-sum-done' }, `✅ ${c.solved} / ${c.solved}`),
        h('div', { class: 'mg-stars' }, ...Array.from({ length: GAME_REWARD.stars }, (_, i) => h('span', { style: `--d:${i * 0.25}s` }, '⭐'))),
        h('p', { class: 'mg-sum-coins' }, `+${GAME_REWARD.stars} ⭐   +${GAME_REWARD.coins} 🪙`),
        h('div', { class: 'mg-learned' },
          ...[...c.learned].map((w) => {
            const chip = h('button', { class: 'mg-chip', 'aria-label': w }, h('span', {}, picOf(w)), h('b', {}, w));
            chip.addEventListener('click', () => api.learn(w));
            return chip;
          }),
        ),
        h('div', { class: 'mg-sum-actions' }, back, again),
      ),
    );
  };
  void run();
  return root;
}
