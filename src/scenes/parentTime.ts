/**
 * KHU PHỤ HUYNH — THỜI GIAN CHƠI (SPEC 17.4). Chỉ mở sau Cổng phụ huynh. Giao diện tiếng Việt.
 * Phụ huynh chỉ được GIẢM thời gian; không vượt trần theo tuổi (CLAUDE.md A9).
 */
import type { AppCtx } from '../app';
import { AGE_RULES, ageGroupFor } from '../config/ageRules';
import type { ChildProfile } from '../storage/profiles';
import {
  canStart, clockText, effectiveLimits, loadParentLimits, loadUsage, parentEndBreak, storeParentLimits, storeUsage,
} from '../systems/playtime';
import { h } from '../ui/dom';
import { openPanel } from '../ui/panel';

const GROUP_VI = { '2-3': '2–3 tuổi', '4-5': '4–5 tuổi', '6-8': '6–8 tuổi' } as const;

export async function openParentTime(ctx: AppCtx, host: HTMLElement, profile: ChildProfile, onChange: () => void): Promise<void> {
  const g = ageGroupFor(profile.birthYear, profile.ageGroupOverride);
  const rules = AGE_RULES[g];
  const parent = await loadParentLimits(ctx.kv, profile.id, g);
  const usage = await loadUsage(ctx.kv, profile.id);
  const p = openPanel(host, { title: `Thời gian chơi — ${profile.nickname}`, emoji: '⏰', className: 'parent-time' });

  const daily = h('input', { type: 'range', min: 5, max: rules.dailyMinutes.cap, step: 5, value: parent.dailyMin ?? rules.dailyMinutes.default, 'aria-label': 'Phút mỗi ngày' });
  const session = h('input', { type: 'range', min: 5, max: rules.playSessionMinutes.cap, step: 5, value: parent.sessionMin ?? rules.playSessionMinutes.default, 'aria-label': 'Phút mỗi phiên' });
  const dailyOut = h('b');
  const sessionOut = h('b');
  const status = h('p', { class: 'pt-status' });
  const saved = h('p', { class: 'pt-saved', role: 'status' });

  const paint = () => {
    const lim = effectiveLimits(g, { dailyMin: Number(daily.value), sessionMin: Number(session.value) });
    const dMin = lim.dailySec / 60; // luôn hiện giá trị ĐÃ chặn theo trần tuổi
    dailyOut.textContent = `${dMin} phút (tối đa ${rules.dailyMinutes.cap})`;
    sessionOut.textContent = `${lim.sessionSec / 60} phút (tối đa ${rules.playSessionMinutes.cap})`;
    const used = Math.floor(usage.usedSec / 60);
    const st = canStart(usage, lim);
    status.textContent = st.ok
      ? `✅ Bé có thể chơi. Hôm nay đã chơi ${used} / ${dMin} phút.`
      : st.reason === 'rest'
        ? `🌙 Bé đang nghỉ giữa hai phiên đến ${clockText(st.until)}. Hôm nay đã chơi ${used} / ${dMin} phút.`
        : `🌙 Đã hết giờ chơi hôm nay (${used} / ${dMin} phút). Bé chơi lại vào ngày mai.`;
    endBreak.hidden = st.ok || st.reason !== 'rest';
  };

  const saveBtn = h('button', { class: 'btn btn-green pt-btn' }, 'Lưu');
  saveBtn.addEventListener('click', async () => {
    await storeParentLimits(ctx.kv, profile.id, g, { dailyMin: Number(daily.value), sessionMin: Number(session.value) });
    saved.textContent = 'Đã lưu. Áp dụng ngay (kể cả khi bé đang chơi).';
    paint();
    onChange();
  });
  const endBreak = h('button', { class: 'btn btn-soft pt-btn' }, 'Cho bé chơi tiếp (bỏ giờ nghỉ)');
  endBreak.addEventListener('click', async () => {
    const lim = effectiveLimits(g, { dailyMin: Number(daily.value), sessionMin: Number(session.value) });
    if (parentEndBreak(usage, lim)) {
      await storeUsage(ctx.kv, profile.id, usage);
      saved.textContent = 'Đã bỏ giờ nghỉ. Giới hạn trong ngày vẫn giữ nguyên.';
    }
    paint();
    onChange();
  });
  daily.addEventListener('input', paint);
  session.addEventListener('input', paint);

  p.setBody(
    h('div', { class: 'pt' },
      h('p', { class: 'pt-info' }, `Nhóm tuổi: ${GROUP_VI[g]} · Ngày trong game: Day ${usage.farmDay}`),
      status,
      h('label', { class: 'pt-row' }, h('span', {}, 'Thời gian chơi mỗi ngày'), daily, dailyOut),
      h('label', { class: 'pt-row' }, h('span', {}, 'Một phiên chơi (một "ngày" trong game)'), session, sessionOut),
      h('p', { class: 'pt-note' },
        `Nghỉ bắt buộc giữa hai phiên: ${rules.restBreakMinutes} phút (theo độ tuổi). ` +
        'Bố mẹ chỉ có thể giảm, không thể vượt mức khuyến nghị theo tuổi. Thời gian chỉ được tính khi ứng dụng đang mở trên màn hình.'),
      h('div', { class: 'pt-actions' }, endBreak, saveBtn),
      saved,
    ),
  );
  paint();
}
