/**
 * Cổng phụ huynh (SPEC mục 3): giữ nút 3 giây → giải phép cộng dành cho người lớn.
 * Sai hoặc hủy → đóng lặng lẽ, trả về false. Không báo lỗi gây chú ý.
 */
import { h, ICONS } from '../ui/dom';

const HOLD_MS = 3000;

export function makeChallenge(rand: () => number = Math.random): { a: number; b: number; answer: number } {
  const a = 11 + Math.floor(rand() * 29); // 11–39
  const b = 11 + Math.floor(rand() * 29);
  return { a, b, answer: a + b };
}

export function openParentGate(): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 200);
      resolve(ok);
    };

    const body = h('div', { class: 'gate-body' });
    const closeBtn = h('button', { class: 'gate-close', 'aria-label': 'Đóng', html: ICONS.close, onclick: () => finish(false) });
    const card = h('div', { class: 'gate-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Dành cho bố mẹ' },
      closeBtn,
      h('div', { class: 'gate-lock', html: ICONS.lock }),
      h('h2', {}, 'Dành cho bố mẹ'),
      body,
    );
    const overlay = h('div', { class: 'gate-overlay' }, card);
    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) finish(false);
    });

    // Bước 1: giữ nút 3 giây
    const fill = h('span', { class: 'hold-fill' });
    const holdBtn = h('button', { class: 'hold-btn' }, fill, h('span', { class: 'hold-label' }, 'Giữ nút này 3 giây'));
    let start = 0;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / HOLD_MS);
      fill.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        stopHold();
        showQuestion();
      } else raf = requestAnimationFrame(tick);
    };
    const startHold = (e: Event) => {
      e.preventDefault();
      start = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const stopHold = () => {
      cancelAnimationFrame(raf);
      fill.style.transform = 'scaleX(0)';
    };
    holdBtn.addEventListener('pointerdown', startHold);
    holdBtn.addEventListener('pointerup', stopHold);
    holdBtn.addEventListener('pointerleave', stopHold);
    holdBtn.addEventListener('pointercancel', stopHold);
    holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    body.append(h('p', { class: 'gate-hint' }, 'Khu vực này dành cho người lớn.'), holdBtn);

    // Bước 2: phép tính
    function showQuestion() {
      const { a, b, answer } = makeChallenge();
      const input = h('input', {
        class: 'gate-input', type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: 3, 'aria-label': 'Kết quả',
      });
      const submit = () => finish(Number(input.value.trim()) === answer);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
      body.replaceChildren(
        h('p', { class: 'gate-question' }, `${a} + ${b} = ?`),
        input,
        h('div', { class: 'gate-actions' },
          h('button', { class: 'btn btn-soft', onclick: () => finish(false) }, 'Hủy'),
          h('button', { class: 'btn btn-green', onclick: submit }, 'Xác nhận'),
        ),
      );
      setTimeout(() => input.focus(), 50);
    }

    document.body.append(overlay);
  });
}
