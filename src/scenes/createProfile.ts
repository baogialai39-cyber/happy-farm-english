/**
 * Tạo hồ sơ (F-20, F-25): biệt danh → năm sinh → nhân vật → CONFIRM.
 * Chỉ thu thập biệt danh + năm sinh + id nhân vật có sẵn (CLAUDE.md A5).
 */
import { type AppCtx, farmBackground, iconButton, musicToggle } from '../app';
import { characterSvg } from '../art/character';
import { applyAgeRulesToCss, DEFAULT_GROUP, ageFromBirthYear, selectableBirthYears } from '../config/ageRules';
import { type CharacterKind, charactersOfKind, getCharacter, ONESIES, withOnesie } from '../content/characters';
import { NICKNAME_ERROR_VI, NICKNAME_MAX, normalizeNickname, validateNickname } from '../storage/profiles';
import { fromHtml, h, ICONS } from '../ui/dom';

type Step = 0 | 1 | 2;

const STEPS = [
  { title: "What's your name?", hint: 'Bố mẹ giúp bé nhập biệt danh nhé — không dùng họ tên thật.' },
  { title: 'How old are you?', hint: 'Chọn năm sinh của bé.' },
  { title: 'Choose your friend!', hint: 'Chọn bạn trai hoặc bạn gái, rồi chọn nhân vật bé thích.' },
] as const;

export function createProfileScene(ctx: AppCtx, route: { cancellable: boolean }): HTMLElement {
  applyAgeRulesToCss(DEFAULT_GROUP);

  const state = {
    step: 0 as Step,
    nickname: '',
    birthYear: undefined as number | undefined,
    kind: 'boy' as CharacterKind,
    avatarId: undefined as string | undefined,
    onesie: undefined as string | undefined,
    saving: false,
  };

  // ---------- Xem trước ----------
  const previewArt = h('div', { class: 'preview-art' });
  const previewName = h('div', { class: 'name-tag' });
  const previewAge = h('div', { class: 'preview-age' });
  const preview = h('div', { class: 'preview' }, previewArt, previewName, previewAge);

  function paintPreview() {
    const c = getCharacter(state.avatarId ?? '') ?? charactersOfKind(state.kind)[0];
    previewArt.replaceChildren(fromHtml(characterSvg(withOnesie(c, state.onesie), state.avatarId ? 'hop' : 'ghost')));
    const name = normalizeNickname(state.nickname);
    previewName.textContent = name || '???';
    previewName.classList.toggle('empty', !name);
    previewAge.textContent = state.birthYear ? `${ageFromBirthYear(state.birthYear)} tuổi` : '';
  }

  // ---------- Thanh bước ----------
  const stepper = h('ol', { class: 'stepper' });
  function paintStepper() {
    stepper.replaceChildren(
      ...STEPS.map((_, i) => {
        const done = isStepValid(i as Step);
        const li = h('li', { class: `${i === state.step ? 'current' : ''} ${done ? 'done' : ''}` });
        const b = h('button', { 'aria-label': `Bước ${i + 1}` }, String(i + 1));
        b.addEventListener('click', () => {
          if (i <= state.step || canReach(i as Step)) goStep(i as Step);
        });
        li.append(b);
        return li;
      }),
    );
  }

  function isStepValid(s: Step): boolean {
    if (s === 0) return validateNickname(state.nickname) === null;
    if (s === 1) return state.birthYear !== undefined;
    return state.avatarId !== undefined;
  }
  function canReach(s: Step): boolean {
    for (let i = 0; i < s; i++) if (!isStepValid(i as Step)) return false;
    return true;
  }

  // ---------- Nội dung bước ----------
  const title = h('h2', { class: 'step-title' });
  const hint = h('p', { class: 'step-hint' });
  const body = h('div', { class: 'step-body' });
  const message = h('p', { class: 'soft-msg', role: 'status', 'aria-live': 'polite' });
  const backBtn = h('button', { class: 'btn btn-soft nav-btn', html: `${ICONS.back}<span>BACK</span>` });
  const nextBtn = h('button', { class: 'btn btn-blue nav-btn', html: `<span>NEXT</span>${ICONS.next}` });
  const confirmBtn = h('button', { class: 'btn btn-green confirm-btn', html: `${ICONS.check}<span>CONFIRM</span>` });
  const actions = h('div', { class: 'step-actions' }, backBtn, nextBtn, confirmBtn);

  // Bước 1: biệt danh
  const nameInput = h('input', {
    class: 'name-input',
    type: 'text',
    maxlength: NICKNAME_MAX + 8,
    autocomplete: 'off',
    autocapitalize: 'words',
    spellcheck: 'false',
    enterkeyhint: 'next',
    placeholder: 'VD: Bin, Na, Sóc…',
    'aria-label': 'Biệt danh',
  });
  nameInput.addEventListener('input', () => {
    state.nickname = nameInput.value;
    const err = validateNickname(state.nickname);
    message.textContent = err === 'digits' || err === 'invalidChars' || err === 'tooLong' ? NICKNAME_ERROR_VI[err] : '';
    paintPreview();
    paintNav();
  });
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') next();
  });
  const stepName = h('div', { class: 'name-step' }, nameInput,
    h('p', { class: 'privacy-note' }, '🔒 Chỉ lưu biệt danh trên máy này. Không cần email hay số điện thoại.'));

  // Bước 2: năm sinh
  const yearGrid = h('div', { class: 'year-grid' });
  function paintYears() {
    yearGrid.replaceChildren(
      ...selectableBirthYears().map((y) => {
        const b = h('button', { class: `choice year-btn${state.birthYear === y ? ' selected' : ''}`, 'aria-pressed': String(state.birthYear === y) },
          h('span', { class: 'year-age' }, String(ageFromBirthYear(y))),
          h('span', { class: 'year-num' }, String(y)),
        );
        b.addEventListener('click', () => {
          state.birthYear = y;
          ctx.audio.pop();
          paintYears();
          paintPreview();
          paintNav();
        });
        return b;
      }),
    );
  }
  const stepYear = h('div', {}, h('p', { class: 'year-legend' }, 'Số to = tuổi của bé · số nhỏ = năm sinh'), yearGrid);

  // Bước 3: nhân vật
  const kindRow = h('div', { class: 'kind-row' });
  const charRow = h('div', { class: 'char-row' });
  function paintChars() {
    kindRow.replaceChildren(
      ...(['boy', 'girl'] as const).map((k) => {
        const sample = charactersOfKind(k)[0];
        const b = h('button', { class: `choice kind-btn${state.kind === k ? ' selected' : ''}`, 'aria-pressed': String(state.kind === k) });
        b.append(fromHtml(characterSvg(sample, 'mini', true)), h('span', { class: 'kind-label' }, k === 'boy' ? 'Boy' : 'Girl', h('small', {}, k === 'boy' ? 'Bạn trai' : 'Bạn gái')));
        b.addEventListener('click', () => {
          if (state.kind !== k) {
            state.kind = k;
            state.avatarId = undefined;
          }
          ctx.audio.pop();
          paintChars();
          paintPreview();
          paintNav();
        });
        return b;
      }),
    );
    charRow.replaceChildren(
      ...charactersOfKind(state.kind).map((c) => {
        const sel = state.avatarId === c.id;
        const b = h('button', { class: `choice char-card${sel ? ' selected' : ''}`, 'aria-pressed': String(sel), 'aria-label': c.label });
        b.append(fromHtml(characterSvg(withOnesie(c, state.onesie))), h('span', { class: 'char-name' }, c.label));
        b.addEventListener('click', () => {
          state.avatarId = c.id;
          ctx.audio.pop();
          paintChars();
          paintPreview();
          paintNav();
        });
        return b;
      }),
    );
  }
  // Màu áo liền thân (SPEC 18.2) — 8 màu, không bắt buộc
  const onesieRow = h('div', { class: 'onesie-row', role: 'group', 'aria-label': 'Onesie color' });
  function paintOnesies() {
    onesieRow.replaceChildren(
      ...ONESIES.map((o) => {
        const sel = (state.onesie ?? '') === o.id;
        const b = h('button', { class: `onesie-dot${sel ? ' selected' : ''}`, 'aria-pressed': String(sel), 'aria-label': `${o.en} – ${o.vi}`, style: `--dot:${o.color}` });
        b.addEventListener('click', () => {
          state.onesie = o.id;
          ctx.audio.pop();
          paintOnesies();
          paintChars();
          paintPreview();
        });
        return b;
      }),
    );
  }
  paintOnesies();
  const stepChar = h('div', { class: 'char-step' }, kindRow, charRow, onesieRow);

  function paintNav() {
    backBtn.hidden = state.step === 0;
    nextBtn.hidden = state.step === 2;
    confirmBtn.hidden = state.step !== 2;
    nextBtn.disabled = !isStepValid(state.step);
    confirmBtn.disabled = state.saving || !canReach(2) || !isStepValid(2);
    paintStepper();
  }

  function goStep(s: Step) {
    state.step = s;
    title.textContent = STEPS[s].title;
    hint.textContent = STEPS[s].hint;
    message.textContent = '';
    body.replaceChildren([stepName, stepYear, stepChar][s]);
    body.classList.remove('enter');
    void body.offsetWidth; // khởi động lại hiệu ứng
    body.classList.add('enter');
    if (s === 0) setTimeout(() => nameInput.focus(), 60);
    paintNav();
  }

  function next() {
    if (state.step === 0) {
      const err = validateNickname(state.nickname);
      if (err) {
        message.textContent = NICKNAME_ERROR_VI[err];
        return;
      }
    }
    if (!isStepValid(state.step) || state.step === 2) return;
    ctx.audio.pop();
    goStep((state.step + 1) as Step);
  }

  backBtn.addEventListener('click', () => {
    ctx.audio.pop();
    goStep((state.step - 1) as Step);
  });
  nextBtn.addEventListener('click', next);
  confirmBtn.addEventListener('click', async () => {
    if (state.saving || !state.birthYear || !state.avatarId) return;
    state.saving = true;
    paintNav();
    const result = await ctx.store.create({ nickname: state.nickname, birthYear: state.birthYear, avatarId: state.avatarId, onesie: state.onesie });
    if (typeof result === 'string') {
      state.saving = false;
      message.textContent =
        result === 'full' ? 'Máy này đã có đủ 4 hồ sơ.' : result in NICKNAME_ERROR_VI ? NICKNAME_ERROR_VI[result as keyof typeof NICKNAME_ERROR_VI] : 'Bố mẹ kiểm tra lại thông tin nhé.';
      paintNav();
      return;
    }
    ctx.audio.chime();
    ctx.go({ name: 'welcome', profileId: result.id, fresh: true });
  });

  paintYears();
  paintChars();
  paintPreview();
  goStep(0);

  const left = route.cancellable
    ? iconButton('close', 'Quay lại', () => {
        ctx.audio.pop();
        ctx.go({ name: 'welcome' });
      })
    : iconButton('home', 'Màn hình chính', () => {
        ctx.audio.pop();
        ctx.go({ name: 'splash' });
      });

  return h('div', { class: 'screen create' },
    farmBackground({ dim: true, animals: false }),
    h('div', { class: 'topbar' }, left, musicToggle(ctx)),
    h('main', { class: 'create-card' },
      h('div', { class: 'parent-badge' }, '👨‍👩‍👧 Bố mẹ giúp bé nhé'),
      preview,
      h('section', { class: 'step-panel' }, stepper, title, hint, body, message, actions),
    ),
  );
}
