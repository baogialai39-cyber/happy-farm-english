/**
 * HAPPY ZOO — con vật "sống" (SPEC 19.3): đi lại, nghỉ/ngủ, ăn, uống, chơi, bơi, bay, leo; vẽ + chạm.
 * Trạng thái hoạt động chỉ ở trong bộ nhớ (không lưu). Không săn mồi, không đánh nhau (A8).
 */
import { cachedImage } from '../art/library';
import { type ZooAnimal, zooGeom, zooSvg } from '../art/library/zooAnimals';
import { type ZooAnim, type ZooAnimalDef, ZOO_BY_ID, ZOO_ZONES, type ZooZone } from '../content/zoo';
import { TILE as T, type WorldMap, type WorldObject } from './map';
import { drawEmoji, type Entity } from './render';
import { zooDirty, type WorldSave } from './save';
import { ZOO_AREAS } from './zooMap';

const RASTER = 3;
const FOOD_EMOJI: Record<string, string> = {
  meat: '🍖', hay: '🌾', leaves: '🌿', grass: '🌱', banana: '🍌', honey: '🍯', berries: '🫐', fish: '🐟', seaweed: '🌿', shrimp: '🦐', seeds: '🌻', corn: '🌽', bugs: '🐛',
};
export const foodEmoji = (f: string) => FOOD_EMOJI[f] ?? '🍽️';

const rnd = () => Math.random();

export class ZooActor {
  readonly def: ZooAnimalDef;
  x: number; y: number; // ô (số thực) — chân con vật / tâm nếu bơi
  tx: number; ty: number;
  facing: 1 | -1 = 1;
  anim: ZooAnim | 'idle' = 'idle';
  animUntil = 0;
  /** Hoạt động sẽ làm khi tới nơi (ăn ở máng / uống ở chỗ nước). */
  pending?: { anim: ZooAnim; ms: number };
  phase = rnd() * 10;
  hopAt = 0;
  private nextThink = 0;

  constructor(readonly obj: WorldObject) {
    this.def = ZOO_BY_ID.get(obj.word)!;
    this.x = obj.x + 0.5;
    this.y = obj.y + 0.5;
    this.tx = this.x;
    this.ty = this.y;
  }

  get area() { return ZOO_AREAS[this.def.zone]; }
  get swimmer() { return zooGeom(this.def.id).feet === null; }
  get busy() { return this.anim !== 'idle' && this.anim !== 'walk'; }

  /** Kích thước vẽ (px thế giới). */
  size(): { w: number; h: number } {
    const w = this.def.size * T;
    return { w, h: w * zooGeom(this.def.id).aspect };
  }

  /** Khung vẽ hiện tại (để chạm & đặt khung từ). */
  rect(now = Date.now()): { x: number; y: number; w: number; h: number } {
    const { w, h } = this.size();
    const lift = this.lift(now);
    const cx = this.x * T, gy = this.y * T - lift;
    const feet = zooGeom(this.def.id).feet;
    const top = feet === null ? gy - h / 2 : gy - h * feet;
    return { x: cx - w / 2, y: top, w, h };
  }

  private lift(now: number): number {
    const k = this.animProgress(now);
    if (this.anim === 'fly') return Math.sin(k * Math.PI) * 70;
    if (this.anim === 'climb') return Math.sin(k * Math.PI) * 48;
    if (this.anim === 'play') return Math.abs(Math.sin(k * Math.PI * 4)) * (this.def.zone === 'ocean' ? 26 : 14);
    if (this.anim === 'run' || this.anim === 'walk') return Math.abs(Math.sin(this.phase * 2)) * (this.anim === 'run' ? 4 : 2);
    return 0;
  }

  private animProgress(now: number): number {
    const dur = this.animDur || 1;
    return Math.max(0, Math.min(1, 1 - (this.animUntil - now) / dur));
  }
  private animDur = 1;

  /** Bắt đầu một hoạt động; ăn/uống thì đi tới máng/chỗ nước trước. */
  perform(anim: ZooAnim, now: number, ms = 4500): void {
    const a = this.area;
    if ((anim === 'eat' || anim === 'drink') && !this.swimmer) {
      const spot = anim === 'eat' ? a.food : a.water;
      this.tx = spot.x + (rnd() - 0.5) * 0.8;
      this.ty = spot.y + (rnd() - 0.5) * 0.4;
      this.pending = { anim, ms };
      this.anim = 'walk';
      this.animUntil = now + 60_000;
      return;
    }
    if (anim === 'swim' && !this.swimmer) {
      // gấu/chim cánh cụt bơi trong hồ của khu
      this.tx = a.water.x;
      this.ty = a.water.y - 1.1;
      this.pending = { anim: 'swim', ms };
      this.anim = 'walk';
      this.animUntil = now + 60_000;
      return;
    }
    if (anim === 'run' || anim === 'walk') {
      this.pickTarget(anim === 'run' ? 4 : 2.5);
      this.anim = anim;
      this.animDur = ms;
      this.animUntil = now + ms;
      return;
    }
    this.start(anim, now, ms);
  }

  private start(anim: ZooAnim, now: number, ms: number) {
    this.anim = anim;
    this.animDur = ms;
    this.animUntil = now + ms;
    this.pending = undefined;
    if (anim === 'swim' && this.swimmer) this.pickTarget(3);
  }

  private pickTarget(minDist = 1.5) {
    const a = this.area;
    // giữ cả thân con vật trong chuồng (con to như cá mập, voi không chạm rào)
    const mx = Math.min(a.w / 2 - 0.05, Math.max(0.6, this.def.size / 2 + 0.1));
    for (let i = 0; i < 8; i++) {
      const my = this.swimmer ? Math.max(0.9, (this.size().h / T) / 2 + 0.35) : 0.9;
      const x = a.x + mx + rnd() * (a.w - 2 * mx), y = a.y + my + rnd() * Math.max(0.1, a.h - my - 0.5);
      if (Math.hypot(x - this.x, y - this.y) >= minDist || i === 7) {
        this.tx = x;
        this.ty = y;
        return;
      }
    }
  }

  /** Mỗi khung hình: đi tới đích, tự chọn hoạt động khi rảnh. */
  update(dt: number, now: number): void {
    dt = Math.max(0, Math.min(0.1, dt));
    // an toàn: con vật luôn ở trong chuồng của mình (không bao giờ ra đường đi của bé)
    const ar = this.area;
    this.x = Math.max(ar.x + 0.3, Math.min(ar.x + ar.w - 0.3, this.x));
    this.y = Math.max(ar.y + 0.5, Math.min(ar.y + ar.h - 0.2, this.y));
    const moving = this.anim === 'walk' || this.anim === 'run' || this.anim === 'swim' || (this.swimmer && this.anim === 'idle');
    if (moving) {
      const speed = this.anim === 'run' ? 2.4 : this.swimmer || this.anim === 'swim' ? 1.1 : 0.9;
      const dx = this.tx - this.x, dy = this.ty - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.05) {
        const step = Math.min(d, speed * dt);
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
        if (Math.abs(dx) > 0.02) this.facing = dx > 0 ? 1 : -1;
        this.phase += dt * speed * 4;
      } else if (this.pending) {
        this.start(this.pending.anim, now, this.pending.ms);
      } else if (this.anim === 'walk' || this.anim === 'run') {
        this.anim = 'idle';
      } else if (this.swimmer) {
        this.pickTarget(2);
      }
    } else {
      this.phase += dt * 1.5;
    }
    if (this.anim !== 'idle' && this.anim !== 'walk' && now > this.animUntil) {
      this.anim = 'idle';
      this.nextThink = now + 600 + rnd() * 1500;
      if (!this.swimmer) {
        // quay lại chỗ ổn định trong chuồng (lên bờ nếu vừa bơi)
        this.pickTarget(1);
        this.anim = 'walk';
        this.animUntil = now + 60_000;
      }
    }
    if (this.anim === 'idle' && now > this.nextThink) this.think(now);
  }

  /** Vòng hoạt động tự nhiên khi rảnh. */
  private think(now: number) {
    this.nextThink = now + 2500 + rnd() * 4000;
    if (this.swimmer) {
      const r = rnd();
      if (r < 0.12) this.perform('play', now, 2200);
      else if (r < 0.2) this.perform('eat', now, 3000);
      else this.start('swim', now, 6000);
      return;
    }
    const r = rnd();
    const isBird = this.def.zone === 'birds';
    if (r < 0.45) this.perform('walk', now, 4000);
    else if (r < 0.6) this.perform('sleep', now, 5000 + rnd() * 3000);
    else if (r < 0.72) this.perform('eat', now, 4000);
    else if (r < 0.84) this.perform('drink', now, 3500);
    else if (isBird && r < 0.94) this.perform('fly', now, 2600);
    else if (this.def.id === 'monkey') this.perform('climb', now, 3000);
    else this.perform('play', now, 2200);
  }

  draw(c: CanvasRenderingContext2D, now: number, t: number): void {
    const { w, h } = this.size();
    const img = cachedImage(`z:${this.def.id}`, () => zooSvg(this.def.id as ZooAnimal), Math.round(w * RASTER), Math.round(h * RASTER));
    const cx = this.x * T, gy = this.y * T;
    const geom = zooGeom(this.def.id);
    const lift = this.lift(now);
    const k = this.animProgress(now);
    // bóng (nhỏ lại khi bay / nhảy)
    if (!this.swimmer && this.anim !== 'swim') {
      c.fillStyle = `rgba(60,50,80,${0.16 - Math.min(0.1, lift / 600)})`;
      c.beginPath();
      c.ellipse(cx, gy, w * 0.36 * (1 - Math.min(0.4, lift / 150)), 7, 0, 0, 7);
      c.fill();
    }
    let rot = 0, sx = 1, sy = 1;
    const breathe = 1 + Math.sin(t / 650 + this.phase) * 0.018;
    switch (this.anim) {
      case 'sleep': sy = 0.86 + Math.sin(t / 900) * 0.015; break; // nằm, thở chậm
      case 'eat': rot = 0.12 + Math.max(0, Math.sin(t / 220)) * 0.1; break; // cúi đầu ăn
      case 'drink': rot = 0.16 + Math.max(0, Math.sin(t / 300)) * 0.06; break; // cúi đầu uống
      case 'call': sx = sy = 1 + Math.max(0, Math.sin(k * Math.PI * 3)) * 0.07; break;
      case 'play': rot = Math.sin(t / 120) * 0.08; break;
      case 'fly': sy = 1 + Math.sin(t / 70) * 0.06; break; // vỗ cánh
      default: sy = breathe;
    }
    if (this.swimmer) rot = Math.sin(t / 700 + this.phase) * 0.06;
    c.save();
    c.translate(cx, gy - lift);
    c.rotate(rot * this.facing);
    c.scale(this.facing * sx, sy);
    if (this.anim === 'swim' && !this.swimmer) {
      // đang bơi trong hồ: phần dưới chìm
      c.beginPath();
      c.rect(-w, -h * 2, w * 2, h * 2 - h * 0.35);
      c.clip();
    }
    if (img) {
      const top = geom.feet === null ? -h / 2 : -h * geom.feet;
      c.drawImage(img, -w / 2, top, w, h);
    } else drawEmoji(c, '🐾', 0, -h / 2, 40);
    c.restore();
    // biểu tượng hoạt động (dễ hiểu cho bé)
    const r = this.rect(now);
    const bob = Math.sin(t / 400) * 4;
    if (this.anim === 'sleep') drawEmoji(c, '💤', r.x + r.w * 0.85, r.y - 6 + bob, 26);
    else if (this.anim === 'eat') drawEmoji(c, foodEmoji(this.def.food), cx + this.facing * w * 0.42, gy - 10, 26);
    else if (this.anim === 'drink' && !this.swimmer) {
      for (let i = 0; i < 3; i++) {
        const q = (t / 500 + i / 3) % 1;
        c.fillStyle = `rgba(120,190,255,${1 - q})`;
        c.beginPath();
        c.arc(cx + this.facing * w * 0.42, gy - 8 - q * 18, 3.5, 0, 7);
        c.fill();
      }
    } else if (this.anim === 'splash') {
      for (let i = 0; i < 8; i++) {
        const q = (t / 700 + i / 8) % 1;
        c.fillStyle = `rgba(140,205,255,${0.9 - q * 0.8})`;
        c.beginPath();
        c.arc(cx + this.facing * (w * 0.45 + q * 50), r.y + r.h * 0.4 - Math.sin(q * Math.PI) * 50, 4 + q * 3, 0, 7);
        c.fill();
      }
    } else if (this.anim === 'call') drawEmoji(c, '🎵', r.x + r.w * 0.9, r.y - 8 + bob, 26);
    else if (this.anim === 'play' && this.def.zone !== 'ocean') drawEmoji(c, ZOO_ZONES.find((z) => z.id === this.def.zone)!.toyEmoji, cx - this.facing * w * 0.5, gy - 14 - Math.abs(Math.sin(t / 200)) * 20, 24);
    if (this.swimmer && Math.sin(t / 900 + this.phase) > 0.6) drawEmoji(c, '🫧', r.x + r.w * (this.facing > 0 ? 0.95 : 0.05), r.y - 4 + bob, 18);
    // vui khi được chạm
    if (this.hopAt && now - this.hopAt < 1600) {
      const q = (now - this.hopAt) / 1600;
      c.globalAlpha = 1 - q;
      drawEmoji(c, '💖', r.x + r.w / 2, r.y - 10 - q * 30, 26);
      c.globalAlpha = 1;
    }
  }
}

export class ZooHerd {
  readonly actors: ZooActor[];
  /** Máng ăn đầy (đã cho ăn) đến thời điểm này. */
  fedUntil: Partial<Record<ZooZone, { until: number; food: string }>> = {};
  constructor(map: WorldMap) {
    this.actors = map.objects.filter((o) => o.kind === 'zoo').map((o) => new ZooActor(o));
  }
  update(dt: number, now: number) {
    for (const a of this.actors) a.update(dt, now);
  }
  byId(id: string) {
    return this.actors.find((a) => a.def.id === id);
  }
  ofZone(z: ZooZone) {
    return this.actors.filter((a) => a.def.zone === z);
  }
  /**
   * Con vật dưới điểm chạm. Khi nhiều khung chồng nhau: chọn con có TÂM gần điểm chạm nhất
   * (tính theo kích thước) → chạm vào hươu cao cổ đứng cạnh voi vẫn ra hươu cao cổ.
   */
  hit(wx: number, wy: number, now = Date.now()): ZooActor | undefined {
    let best: ZooActor | undefined;
    let bestScore = Infinity;
    for (const a of this.actors) {
      const r = a.rect(now);
      const pad = Math.max(0, 48 - r.w) / 2; // con nhỏ (cá hề, vẹt) vẫn dễ chạm
      if (wx >= r.x - pad && wx <= r.x + r.w + pad && wy >= r.y - pad && wy <= r.y + r.h + pad) {
        const score = Math.hypot((wx - (r.x + r.w / 2)) / (r.w + 2 * pad), (wy - (r.y + r.h / 2)) / (r.h + 2 * pad));
        if (score < bestScore) {
          best = a;
          bestScore = score;
        }
      }
    }
    return best;
  }
  feed(zone: ZooZone, id: string, food: string, now: number) {
    this.fedUntil[zone] = { until: now + 20_000, food };
    this.byId(id)?.perform('eat', now, 5000);
  }
  water(zone: ZooZone, now: number) {
    this.ofZone(zone).forEach((a, i) => setTimeout(() => a.perform(a.swimmer ? 'swim' : 'drink', Date.now(), 4000), i * 500));
    void now;
  }
  play(zone: ZooZone, now: number) {
    this.ofZone(zone).forEach((a, i) => setTimeout(() => a.perform(a.def.zone === 'birds' && i % 2 ? 'fly' : 'play', Date.now(), 3000), i * 350));
    void now;
  }

  /** Thực thể vẽ: con vật + máng ăn + lá rụng (nếu khu chưa dọn). */
  entities(save: WorldSave, now: number): Entity[] {
    const out: Entity[] = [];
    for (const a of this.actors) {
      const r = a.rect(now);
      out.push({ y: a.y * T + (a.swimmer ? 30 : 0), x0: r.x - 20, x1: r.x + r.w + 20, top: r.y - 40, draw: (c, t) => a.draw(c, now, t) });
    }
    for (const z of ZOO_ZONES) {
      const area = ZOO_AREAS[z.id];
      if (!area.swim) {
        const fx = area.food.x * T, fy = area.food.y * T;
        const fed = this.fedUntil[z.id];
        out.push({ y: fy - 2, x0: fx - 30, x1: fx + 30, top: fy - 40, draw: (c) => {
          c.fillStyle = '#8D6E63';
          c.beginPath();
          c.ellipse(fx, fy - 6, 24, 10, 0, 0, 7);
          c.fill();
          c.fillStyle = '#BCAAA4';
          c.beginPath();
          c.ellipse(fx, fy - 10, 20, 6, 0, 0, 7);
          c.fill();
          if (fed && now < fed.until) drawEmoji(c, foodEmoji(fed.food), fx, fy - 18, 26);
        } });
      }
      if (zooDirty(save, z.id, now)) {
        for (let i = 0; i < 5; i++) {
          const lx = (area.x + 0.5 + ((i * 2.7 + area.x) % (area.w - 1))) * T;
          const ly = (area.y + 1 + ((i * 1.9 + area.y) % (area.h - 2))) * T;
          out.push({ flat: true, y: ly, x0: lx - 20, x1: lx + 20, top: ly - 20, draw: (c) => drawEmoji(c, area.swim ? '🍂' : '🍂', lx, ly, 22) });
        }
      }
    }
    return out;
  }
}
