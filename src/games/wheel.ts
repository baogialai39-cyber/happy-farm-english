/**
 * LUCKY SEED WHEEL (SPEC 21.4) — phần thưởng của việc học, KHÔNG phải trò may rủi:
 * lượt quay chỉ có từ câu trả lời đúng; không mua lượt (xu hay tiền thật); ô nào cũng trúng một hạt giống;
 * kết quả được chốt + lưu TRƯỚC khi vòng quay chạy (tải lại trang không quay thêm được).
 *
 * Hiệu ứng quay (F-229): lấy đà → quay nhanh rồi chậm dần, tiếng "tích" + kim bật mỗi ô,
 * đèn vành chạy chậm (≤ 1,5 lần/giây — luật A8), ô trúng sáng, pháo giấy. Không có "suýt trúng".
 */
import { h } from '../ui/dom';
import { openPanel } from '../ui/panel';
import type { WorldApi } from '../world/interactions';
import { spinWheel, WHEEL_SEEDS } from '../world/save';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const WHEEL_INFO: Record<string, { label: string; vi: string; reward: string; emoji: string; color: string }> = {
  'candy-seed': { label: 'Candy Seed', vi: 'Hạt giống kẹo', reward: 'candy', emoji: '🍭', color: '#FF8AB8' },
  'balloon-seed': { label: 'Balloon Seed', vi: 'Hạt giống bóng bay', reward: 'balloon', emoji: '🎈', color: '#FF7A7A' },
  'car-seed': { label: 'Car Seed', vi: 'Hạt giống ô tô đồ chơi', reward: 'car', emoji: '🚗', color: '#6FB8F5' },
  'star-seed': { label: 'Star Seed', vi: 'Hạt giống ngôi sao', reward: 'star', emoji: '⭐', color: '#FFD45E' },
  'toy-seed': { label: 'Toy Seed', vi: 'Hạt giống đồ chơi bất ngờ', reward: 'toy', emoji: '🎁', color: '#9EDC8C' },
};

const SEG = 360 / WHEEL_SEEDS.length;
const LIGHTS = 16;

// ---------- Toán thuần (có test) ----------
/** Ô đang nằm dưới kim (kim ở đỉnh) khi vòng quay xoay `angle` độ theo chiều kim đồng hồ. */
export function segmentAt(angle: number): number {
  const a = (((360 - angle) % 360) + 360) % 360;
  return Math.floor(a / SEG) % WHEEL_SEEDS.length;
}
/** Góc dừng: từ `from` quay thêm `turns` vòng rồi dừng ở ô `idx` (lệch ±`jitter` độ quanh giữa ô, vẫn trong ô). */
export function targetAngle(from: number, idx: number, turns: number, jitter = 0): number {
  const want = (((360 - (idx + 0.5) * SEG + jitter) % 360) + 360) % 360;
  const base = from - (((from % 360) + 360) % 360);
  return base + 360 * turns + want;
}
/** Chậm dần mượt (ease-out bậc 4). */
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);

function wheelSvg(): string {
  const n = WHEEL_SEEDS.length, R = 150;
  const seg = WHEEL_SEEDS.map((id, i) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const p = (a: number, r: number) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
    const mid = (a0 + a1) / 2;
    const deg = (mid * 180) / Math.PI + 90;
    const info = WHEEL_INFO[id];
    return `<path class="wseg" data-i="${i}" d="M0 0 L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} Z" fill="${info.color}" stroke="#fff" stroke-width="5"/>
      <g transform="rotate(${deg.toFixed(1)}) translate(0 -${R * 0.62})"><text text-anchor="middle" font-size="44" y="10">${info.emoji}</text>
      <text text-anchor="middle" y="44" font-family="Baloo 2, system-ui, sans-serif" font-weight="800" font-size="19" fill="#4a3b55">${info.label.replace(' Seed', '')}</text></g>`;
  }).join('');
  // đèn quanh vành (đứng yên, không xoay theo bánh xe)
  const lights = Array.from({ length: LIGHTS }, (_, i) => {
    const a = (i / LIGHTS) * Math.PI * 2;
    return `<circle class="wl ${i % 2 ? 'odd' : 'even'}" cx="${(Math.cos(a) * 158).toFixed(1)}" cy="${(Math.sin(a) * 158).toFixed(1)}" r="6"/>`;
  }).join('');
  return `<svg class="wheel-svg" viewBox="-175 -175 350 350" role="img" aria-label="Lucky Seed Wheel">
    <circle r="166" fill="#FFF8E1" stroke="#FFB300" stroke-width="10"/>
    <g class="wheel-rot">${seg}</g>
    <g class="wheel-lights">${lights}</g>
    <circle r="30" fill="#fff" stroke="#FFB300" stroke-width="6"/><text text-anchor="middle" y="10" font-size="28">🌱</text>
  </svg>`;
}

/** Pháo giấy rơi từ trên vòng quay xuống (CSS, tự gỡ). */
function confetti(stage: HTMLElement) {
  const box = h('div', { class: 'wheel-confetti', 'aria-hidden': 'true' });
  const colors = ['#FF8AB8', '#FFD45E', '#6FB8F5', '#9EDC8C', '#FF7A7A', '#C9A7FF'];
  for (let i = 0; i < 28; i++) {
    const s = h('span', { class: 'wc-bit' });
    s.style.left = `${4 + Math.random() * 92}%`;
    s.style.background = colors[i % colors.length];
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
    s.style.setProperty('--rot', `${(Math.random() - 0.5) * 720}deg`);
    s.style.animationDelay = `${Math.random() * 0.35}s`;
    box.append(s);
  }
  stage.append(box);
  window.setTimeout(() => box.remove(), 2600);
}

/** Mở vòng quay. Nếu được mở trong lúc đã tạm dừng (từ mini-game) thì không đổi trạng thái tạm dừng. */
export function openWheel(api: WorldApi, opts: { managePause?: boolean; onClose?: () => void; host?: HTMLElement } = {}): void {
  const manage = opts.managePause ?? true;
  if (manage) api.pause(true);
  let alive = true;
  const p = openPanel(opts.host ?? api.host, { // trong mini-game: mở NGAY TRÊN màn mini-game
    title: 'Lucky Seed Wheel', emoji: '🎡', className: 'wheel-panel',
    onClose: () => {
      alive = false;
      if (manage) api.pause(false);
      opts.onClose?.();
    },
  });
  const stage = h('div', { class: 'wheel-stage', html: wheelSvg() });
  const pointer = h('div', { class: 'wheel-pointer', 'aria-hidden': 'true' });
  stage.prepend(pointer);
  const rot = stage.querySelector('.wheel-rot') as SVGGElement;
  const status = h('p', { class: 'wheel-status' });
  const result = h('div', { class: 'wheel-result', 'aria-live': 'polite' });
  const spinBtn = h('button', { class: 'btn btn-green wheel-spin' }, '🎡 SPIN');
  let angle = 0;
  let spinning = false;

  const per = api.rules.correctPerSpin;
  const paint = () => {
    const w = api.save.wheel;
    if (spinning) {
      status.replaceChildren(h('b', {}, '🎡 Spinning…!'), h('small', {}, 'Vòng quay đang quay… dừng ở ô nào nhỉ?'));
    } else {
      status.replaceChildren(
        h('b', {}, w.spins > 0 ? `🎡 ${w.spins} free spin${w.spins > 1 ? 's' : ''}!` : `Answer ${per - w.progress} more question${per - w.progress > 1 ? 's' : ''} to get a spin!`),
        h('small', {}, w.spins > 0
          ? `Bé có ${w.spins} lượt quay miễn phí. Ô nào cũng có hạt giống!`
          : `Trả lời đúng thêm ${per - w.progress} câu trong trò chơi để được 1 lượt quay (đang có ${w.progress} / ${per}).`),
      );
    }
    spinBtn.disabled = spinning || w.spins <= 0;
  };
  const setAngle = (a: number) => {
    angle = a;
    rot.style.transform = `rotate(${a}deg)`;
  };
  const flick = () => {
    pointer.classList.remove('flick');
    void pointer.offsetWidth;
    pointer.classList.add('flick');
  };

  spinBtn.addEventListener('click', () => {
    if (spinning) return;
    const seed = spinWheel(api.save, Date.now()); // CHỐT kết quả + trừ lượt TRƯỚC khi quay
    if (!seed) return paint();
    api.changed();
    void api.saveNow?.();
    spinning = true;
    paint();
    result.replaceChildren();
    stage.querySelectorAll('.wseg.win').forEach((e) => e.classList.remove('win'));
    api.audio.pop();

    const calm = reducedMotion();
    const idx = WHEEL_SEEDS.indexOf(seed as (typeof WHEEL_SEEDS)[number]);
    const windUp = calm ? 0 : 380; // lấy đà lùi nhẹ
    const back = calm ? 0 : -16;
    const dur = calm ? 2000 : 4500;
    const start = angle;
    const end = targetAngle(start + back, idx, calm ? 2 : 5, (Math.random() - 0.5) * SEG * 0.5);
    if (!calm) stage.classList.add('spinning');
    let lastSeg = segmentAt(start);
    let lastTick = 0;
    const t0 = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setAngle(end);
      stage.classList.remove('spinning');
      spinning = false;
      if (!alive) return;
      const info = WHEEL_INFO[seed];
      stage.querySelector(`.wseg[data-i="${idx}"]`)?.classList.add('win');
      pointer.classList.remove('flick');
      pointer.classList.add('land');
      window.setTimeout(() => pointer.classList.remove('land'), 700);
      api.audio.fanfare();
      if (!calm) confetti(stage);
      result.replaceChildren(
        h('span', { class: 'wheel-prize' }, info.emoji),
        h('b', {}, `🎉 ${info.label.toUpperCase()}!`),
        h('small', {}, `${info.vi} — đã vào ba lô 🎒. Gieo vào ô đất trong vườn nhé!`),
      );
      api.learn(info.reward);
      paint();
      result.scrollIntoView?.({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
    };

    const frame = (now: number) => {
      if (done) return;
      const t = now - t0;
      const a = t < windUp
        ? start + back * easeOutQuart(t / windUp)
        : start + back + (end - start - back) * easeOutQuart((t - windUp) / dur);
      setAngle(a);
      // qua một ô → "tích" + kim bật (tối đa 1 tiếng / 45 ms)
      const s = segmentAt(a);
      if (s !== lastSeg) {
        lastSeg = s;
        if (now - lastTick > 45) {
          lastTick = now;
          api.audio.tick(Math.min(1, t / (windUp + dur)));
          flick();
        }
      }
      if (t >= windUp + dur) finish();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    // dự phòng: tab bị ẩn thì requestAnimationFrame dừng — vẫn hiện kết quả
    window.setTimeout(finish, windUp + dur + 800);
  });

  p.setBody(status, stage, spinBtn, result);
  paint();
}
