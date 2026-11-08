import { describe, expect, it } from 'vitest';
import type { AgeGroup } from '../config/ageRules';
import { GAME_WORDS, PRAISES, QUIZ } from '../content/gamesData';
import { QUESTS_PER_DAY, refreshQuests, templateOf } from '../content/quests';
import { UNLOCKS } from '../content/rewards';
import { resolveVocab } from '../content/vocab';
import { Grid } from '../world/grid';
import { WORLD } from '../world/map';
import {
  activeDecor, addStars, buyAccessory, buyItem, claimQuest, ensureQuests, finishGame, newSave, questEvent, sanitizeSave,
} from '../world/save';
import {
  choiceCount, countQuestion, makeChoiceRound, makeMatchBoards, makeQuizRound, matchPairs, nextPraise, roundLength, wrongFeedback,
} from './engine';

const GROUPS: AgeGroup[] = ['2-3', '4-5', '6-8'];
const seeded = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

describe('nhiệm vụ hằng ngày', () => {
  it('số nhiệm vụ & số lượng theo tuổi, không trùng loại', () => {
    for (const g of GROUPS) {
      const q = refreshQuests(undefined, g, '2026-11-08', seeded(1));
      expect(q.list.length).toBe(QUESTS_PER_DAY[g]);
      expect(new Set(q.list.map((x) => x.id)).size).toBe(q.list.length);
      for (const x of q.list) expect(x.target).toBe(templateOf(x)!.amount[g]);
    }
    expect(QUESTS_PER_DAY).toEqual({ '2-3': 2, '4-5': 3, '6-8': 4 });
  });

  it('không hết hạn: sang ngày mới vẫn giữ nhiệm vụ chưa xong, chỉ thay nhiệm vụ đã nhận thưởng', () => {
    const d1 = refreshQuests(undefined, '6-8', '2026-11-08', seeded(2));
    d1.list[0].progress = 1; // đang làm dở
    d1.list[1].progress = d1.list[1].target;
    d1.list[1].claimed = true; // đã nhận thưởng
    const same = refreshQuests(d1, '6-8', '2026-11-08');
    expect(same).toBe(d1);
    const d2 = refreshQuests(d1, '6-8', '2026-11-09', seeded(3));
    expect(d2.list.find((q) => q.id === d1.list[0].id)?.progress).toBe(1);
    expect(d2.list.some((q) => q.id === d1.list[1].id && q.claimed)).toBe(false);
    expect(d2.list.length).toBe(4);
  });

  it('việc thật trong nông trại cộng tiến độ → nhận thưởng sao + xu', () => {
    const s = newSave();
    s.quests = { day: 'x', list: [{ id: 'plant', target: 3, progress: 0, claimed: false }, { id: 'apples', target: 2, progress: 0, claimed: false }] };
    expect(questEvent(s, 'plant')).toEqual([]);
    questEvent(s, 'plant');
    expect(claimQuest(s, 'plant', '6-8')).toBeNull(); // chưa xong
    expect(questEvent(s, 'plant').map((q) => q.id)).toEqual(['plant']);
    expect(questEvent(s, 'harvest:apple', 2).map((q) => q.id)).toEqual(['apples']);
    const coins = s.coins;
    const r = claimQuest(s, 'plant', '6-8')!;
    expect(r.stars).toBe(2);
    expect(s.stars).toBe(2);
    expect(s.coins).toBe(coins + r.coins);
    expect(claimQuest(s, 'plant', '6-8')).toBeNull(); // không nhận 2 lần
  });

  it('ensureQuests tạo bảng cho hôm nay và dữ liệu lưu được lọc', () => {
    const s = newSave();
    ensureQuests(s, '2-3', new Date('2026-11-08T10:00:00'));
    expect(s.quests!.day).toBe('2026-11-08');
    const back = sanitizeSave(JSON.parse(JSON.stringify({ ...s, quests: { day: 'd', list: [...s.quests!.list, { id: 'hack', target: 1, progress: 1 }] } })));
    expect(back.quests!.list.map((q) => q.id)).toEqual(s.quests!.list.map((q) => q.id));
  });
});

describe('sao & mở khóa', () => {
  it('sao chỉ tăng; mở khóa đúng mốc; phụ kiện được tặng; cây bị khóa thì không mua được', () => {
    const s = newSave();
    s.coins = 100;
    expect(buyItem(s, 'orange-seed')).toBe('locked');
    expect(buyAccessory(s, 'star-glasses')).toBe('locked');
    expect(addStars(s, 2)).toEqual([]);
    expect(addStars(s, 1).map((u) => u.id)).toEqual(['u-orange']);
    expect(buyItem(s, 'orange-seed')).toBe('ok');
    const got = addStars(s, 7).map((u) => u.id); // 10 sao
    expect(got).toEqual(['u-flowerpot', 'u-starglasses']);
    expect(s.owned).toContain('star-glasses');
    expect([...activeDecor(s)]).toEqual(['flower-pot']);
    expect(addStars(s, 0)).toEqual([]); // không mở lại
  });

  it('hoàn thành mini-game luôn được đủ sao (không dựa vào số lần sai) và tính nhiệm vụ "Play a game"', () => {
    const s = newSave();
    s.quests = { day: 'x', list: [{ id: 'game', target: 1, progress: 0, claimed: false }] };
    finishGame(s, 'quiz', { stars: 3, coins: 5 });
    expect(s.stars).toBe(3);
    expect(s.games.quiz).toBe(1);
    expect(s.quests.list[0].progress).toBe(1);
  });

  it('mọi mốc có từ vựng; vật trang trí nằm trên cỏ và không chắn đường (kể cả khi mở hết)', () => {
    for (const u of UNLOCKS) expect(resolveVocab(u.word), u.word).toBeDefined();
    const decor = WORLD.objects.filter((o) => o.kind === 'decor');
    expect(decor.map((d) => d.decor).sort()).toEqual(UNLOCKS.filter((u) => u.kind === 'decor').map((u) => u.target).sort());
    for (const d of decor) expect(['.', ','].includes(WORLD.tiles[d.y][d.x]), d.id).toBe(true);
    const grid = new Grid(WORLD); // mọi vật trang trí đều có mặt
    const spawn = { x: Math.floor(WORLD.spawn.x), y: Math.floor(WORLD.spawn.y) };
    for (const o of WORLD.objects) expect(grid.findPath(spawn, grid.standTiles(o)), o.id).not.toBeNull();
  });
});

describe('mini-game', () => {
  it('Find the Word / Listen and Choose: số câu & lựa chọn theo tuổi, có đáp án, không trùng, hình khác nhau', () => {
    for (const g of GROUPS) {
      for (let seed = 1; seed < 6; seed++) {
        const qs = makeChoiceRound(g, seeded(seed));
        expect(qs.length).toBe(roundLength(g));
        expect(new Set(qs.map((q) => q.answer)).size).toBe(qs.length);
        for (const q of qs) {
          expect(q.options.length).toBe(choiceCount(g));
          expect(q.options).toContain(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
          const emojis = q.options.map((w) => resolveVocab(w)!.emoji);
          expect(new Set(emojis).size, emojis.join(' ')).toBe(emojis.length);
        }
      }
    }
    expect(choiceCount('2-3')).toBe(3);
    expect(choiceCount('4-5')).toBe(3);
    expect(choiceCount('6-8')).toBe(4);
  });

  it('Match the Words: 2/3/4 cặp mỗi bảng, không trùng', () => {
    for (const g of GROUPS) {
      const boards = makeMatchBoards(g, 2, seeded(7));
      expect(boards.length).toBe(2);
      for (const b of boards) expect(b.length).toBe(matchPairs(g));
      expect(new Set(boards.flat()).size).toBe(boards.flat().length);
    }
  });

  it('Farm Quiz: câu theo tuổi, đáp án nằm trong lựa chọn, có câu đếm trứng đúng phạm vi', () => {
    for (const g of GROUPS) {
      const qs = makeQuizRound(g, seeded(3));
      expect(qs.length).toBe(roundLength(g));
      for (const q of qs) {
        expect(q.options).toContain(q.answer);
        for (const o of q.options) expect(resolveVocab(o), o).toBeDefined();
      }
      expect(qs.some((q) => q.id.startsWith('count-'))).toBe(true);
    }
    const max: Record<AgeGroup, number> = { '2-3': 3, '4-5': 5, '6-8': 10 };
    for (const g of GROUPS)
      for (let i = 1; i < 40; i++) {
        const q = countQuestion(g, seeded(i));
        const n = [...q.picture!].length / [...'🥚'].length;
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(max[g]);
        expect(resolveVocab(q.answer)).toBeDefined();
      }
  });

  it('mọi từ trong game có mục từ (IPA + nghĩa + hình)', () => {
    for (const w of GAME_WORDS) expect(resolveVocab(w.word), w.word).toBeDefined();
    for (const q of QUIZ) for (const o of q.options) expect(resolveVocab(o), o).toBeDefined();
  });

  it('phản hồi khi sai đúng bảng luật tuổi — không bao giờ trừ điểm', () => {
    expect(wrongFeedback('2-3', 1)).toEqual({ voice: 'Hmm?', hint: 'reveal' });
    expect(wrongFeedback('4-5', 1)).toEqual({ voice: 'Try again!', hint: 'bounce' });
    expect(wrongFeedback('4-5', 2).hint).toBe('reveal');
    expect(wrongFeedback('6-8', 1)).toEqual({ voice: 'Almost! Try again!', hint: 'none' });
    expect(wrongFeedback('6-8', 2).hint).toBe('eliminate');
    expect(wrongFeedback('6-8', 3).hint).toBe('reveal');
  });

  it('lời khen đa dạng, không lặp lại câu ngay trước', () => {
    let last: string | undefined;
    const r = seeded(5);
    for (let i = 0; i < 200; i++) {
      const p = nextPraise(last, r);
      expect(p).not.toBe(last);
      expect(PRAISES).toContain(p);
      last = p;
    }
  });
});
