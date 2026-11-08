/**
 * Nhân vật bé điều khiển (SPEC 13.4): di chuyển có va chạm, đi theo đường, hoạt ảnh.
 */
import { type AccessoryLayer, bodyColors, characterSvg, type Expression } from '../art/character';
import { shade } from '../art/color';
import type { CharacterDef } from '../content/characters';
import { Grid } from './grid';
import { TILE as T } from './map';
import { bubble, drawEmoji, type Entity } from './render';

export const WALK_SPEED = 3.2; // ô / giây
export const RUN_SPEED = 5.4;
export const RUN_PATH_TILES = 7;

export type PlayerState = 'idle' | 'walk' | 'run' | 'action' | 'sit' | 'sleep';
/** Kiểu hoạt ảnh khi làm việc gì đó (SPEC 18.2): nhảy, vui mừng (giơ tay), ngạc nhiên (dang tay, miệng O). */
export type Pose = 'jump' | 'happy' | 'surprised';

const SURPRISED = new Set(['⏳', '👀', '❓', '🕰️', '💡']);
const HAPPY = new Set(['💖', '😋', '🌞', '⭐', '🎉', '🧺', '🥚', '🎵', '😊']);
/** Chọn hoạt ảnh theo biểu tượng của hành động (không cần sửa mọi nơi gọi). */
export function poseFor(emoji: string): Pose {
  if (SURPRISED.has(emoji)) return 'surprised';
  if (HAPPY.has(emoji)) return 'happy';
  return 'jump';
}
const ACTION_MS = 750;

const SPRITE_W = 76;
const SPRITE_H = (SPRITE_W * 254) / 200;
const K = SPRITE_W / 200; // 1 đơn vị SVG → điểm ảnh

export class Player {
  x: number;
  y: number;
  facing: 1 | -1 = 1;
  state: PlayerState = 'idle';
  phase = 0;
  actionUntil = 0;
  emote?: { emoji: string; until: number };
  path: { x: number; y: number }[] = [];
  running = false;
  pose: Pose = 'jump';
  imgs: Partial<Record<Expression, HTMLImageElement>> = {};
  colors = { sleeve: '#7EC8F7', skin: '#F6D3B3', leg: '#7EC8F7', foot: '#5E9BC4', boots: false };
  private dust: { x: number; y: number; t: number }[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Tạo ảnh nhân vật từ SVG (kèm phụ kiện). */
  async setLook(c: CharacterDef, acc: AccessoryLayer): Promise<void> {
    this.colors = bodyColors(c, acc);
    const exprs: Expression[] = ['normal', 'happy', 'surprised'];
    const imgs: Partial<Record<Expression, HTMLImageElement>> = {};
    await Promise.all(exprs.map(async (expr) => {
      // tay chân vẽ riêng trên canvas để chuyển động (limbs: false)
      const svg = characterSvg(c, '', false, acc, { w: SPRITE_W * 2, h: SPRITE_H * 2 }, { limbs: false, expr });
      const img = new Image();
      img.decoding = 'async';
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode().catch(() => undefined);
      imgs[expr] = img;
    }));
    this.imgs = imgs;
  }

  /** Ảnh hiện tại (để kiểm thử). */
  get img(): HTMLImageElement | undefined {
    return this.imgs.normal;
  }

  get busy(): boolean {
    return this.state === 'sit' || this.state === 'sleep';
  }

  standUp(): void {
    if (this.busy) this.state = 'idle';
  }

  /** Hành động vui (nhảy + biểu tượng trên đầu). */
  act(emoji: string, now: number, ms = 1100, pose: Pose = poseFor(emoji)): void {
    this.standUp();
    this.path = [];
    this.state = 'action';
    this.pose = pose;
    this.actionUntil = now + ACTION_MS;
    this.emote = { emoji, until: now + ms };
  }

  say(emoji: string, now: number, ms = 1400): void {
    this.emote = { emoji, until: now + ms };
  }

  /**
   * Cập nhật mỗi khung hình. input = hướng cần điều khiển (độ dài 0..1), null nếu không điều khiển.
   * Trả về true nếu vừa đi tới cuối đường.
   */
  update(dt: number, now: number, grid: Grid, input: { x: number; y: number } | null): boolean {
    let arrived = false;
    let vx = 0, vy = 0, speed = 0;
    if (this.state === 'action' && now > this.actionUntil) this.state = 'idle';

    if (input && Math.hypot(input.x, input.y) > 0.15) {
      this.path = [];
      this.standUp();
      const mag = Math.min(1, Math.hypot(input.x, input.y));
      this.running = mag > 0.8;
      speed = this.running ? RUN_SPEED : WALK_SPEED * Math.max(0.55, mag);
      vx = (input.x / mag) * speed * mag;
      vy = (input.y / mag) * speed * mag;
    } else if (this.path.length) {
      this.standUp();
      const next = this.path[0];
      const tx = next.x + 0.5, ty = next.y + 0.5;
      const dx = tx - this.x, dy = ty - this.y;
      const dist = Math.hypot(dx, dy);
      speed = this.running ? RUN_SPEED : WALK_SPEED;
      if (dist < speed * dt + 0.02) {
        this.x = tx;
        this.y = ty;
        this.path.shift();
        if (!this.path.length) arrived = true;
      } else {
        vx = (dx / dist) * speed;
        vy = (dy / dist) * speed;
      }
    }

    if (vx || vy) {
      const r = grid.move(this, vx * dt, vy * dt);
      if (r.blockedX && r.blockedY && this.path.length) this.path = []; // kẹt → dừng nhẹ nhàng
      if (Math.abs(vx) > 0.05) this.facing = vx > 0 ? 1 : -1;
      if (this.state !== 'action') this.state = this.running && speed > WALK_SPEED ? 'run' : 'walk';
      this.phase += dt * speed * 3.1;
      if (this.state === 'run' && Math.random() < dt * 12) this.dust.push({ x: this.x, y: this.y, t: now });
    } else if (this.state === 'walk' || this.state === 'run') {
      this.state = 'idle';
      this.running = false;
    }
    this.dust = this.dust.filter((d) => now - d.t < 500);
    return arrived;
  }

  entity(now: number): Entity {
    const px = this.x * T, py = this.y * T;
    return {
      y: py, x0: px - 50, x1: px + 50, top: py - 130,
      draw: (c, t) => this.draw(c, px, py, now, t),
    };
  }

  private draw(c: CanvasRenderingContext2D, px: number, py: number, now: number, t: number) {
    // bụi khi chạy
    for (const d of this.dust) {
      const k = (now - d.t) / 500;
      c.fillStyle = `rgba(255,255,255,${0.7 * (1 - k)})`;
      c.beginPath();
      c.arc(d.x * T - this.facing * 14 * k, d.y * T - 4 - 8 * k, 5 + 6 * k, 0, 7);
      c.fill();
    }
    const moving = this.state === 'walk' || this.state === 'run';
    const running = this.state === 'run';
    const swing = moving ? Math.sin(this.phase) : 0;
    const acting = this.state === 'action';
    const actK = acting ? 1 - Math.max(0, this.actionUntil - now) / ACTION_MS : 0;
    let lift = 0, tilt = 0, squash = 1;
    if (moving) {
      lift = Math.abs(swing) * (running ? 7 : 3.5);
      tilt = running ? 0.13 : swing * 0.04; // chạy: nghiêng người về trước
    } else if (acting && this.pose === 'jump') {
      lift = Math.sin(actK * Math.PI) * 26;
      squash = actK < 0.12 ? 0.94 : 1; // nhún trước khi bật
    } else if (acting && this.pose === 'happy') {
      lift = Math.abs(Math.sin(actK * Math.PI * 2)) * 12; // nhún nhảy vui
    } else if (this.state === 'idle') {
      squash = 1 + Math.sin(t / 420) * 0.015; // thở
    }

    // bóng
    c.fillStyle = 'rgba(80,60,100,.2)';
    c.beginPath();
    c.ellipse(px, py, 22 - lift * 0.4, 7, 0, 0, 7);
    c.fill();

    const img = this.imgs[acting && this.pose !== 'jump' ? this.pose : acting ? 'happy' : 'normal'] ?? this.imgs.normal;
    if (this.state === 'sleep') {
      c.save();
      c.translate(px, py - 34);
      c.rotate(-Math.PI / 2);
      if (img) c.drawImage(img, -SPRITE_W / 2, -SPRITE_H / 2, SPRITE_W, SPRITE_H);
      c.restore();
      drawEmoji(c, '💤', px + 30, py - 70 - Math.sin(t / 500) * 6, 28);
      return;
    }

    const sitDrop = this.state === 'sit' ? 14 : 0;
    c.save();
    c.translate(px, py - 6 - lift + sitDrop);
    c.rotate(tilt * this.facing);
    c.scale(this.facing, squash);
    // từ đây vẽ theo đơn vị của hình SVG (viewBox 0 -14 200 254)
    c.save();
    c.translate(-SPRITE_W / 2, -SPRITE_H + 4);
    c.scale(K, K);
    c.translate(0, 14);
    this.drawLegs(c, swing, running, acting, actK);
    c.restore();
    if (img) c.drawImage(img, -SPRITE_W / 2, -SPRITE_H + 4, SPRITE_W, SPRITE_H);
    c.save();
    c.translate(-SPRITE_W / 2, -SPRITE_H + 4);
    c.scale(K, K);
    c.translate(0, 14);
    this.drawArms(c, swing, running, acting, actK, t);
    c.restore();
    c.restore();

    if (this.emote && now < this.emote.until) {
      bubble(c, px + 26, py - SPRITE_H - 18 - lift, this.emote.emoji, 30);
    }
  }

  /** Chân: đi = hai chân nhấc xen kẽ; chạy = nhấc cao; nhảy = co chân; ngồi = duỗi ra trước. */
  private drawLegs(c: CanvasRenderingContext2D, swing: number, running: boolean, acting: boolean, actK: number) {
    const col = this.colors;
    for (const side of [-1, 1] as const) {
      const hx = 100 + side * 16, hy = 196;
      let fx = hx + side * 2, fy = 224;
      if (this.state === 'walk' || this.state === 'run') {
        const s = Math.sin(this.phase + (side > 0 ? Math.PI : 0));
        fy -= Math.max(0, s) * (running ? 16 : 10);
        fx += side * Math.abs(swing) * (running ? 4 : 2);
      } else if (acting && this.pose === 'jump') {
        const tuck = Math.sin(actK * Math.PI);
        fy -= tuck * 14;
        fx += side * tuck * 8;
      } else if (this.state === 'sit') {
        fy = 214;
        fx = hx + side * 10;
      }
      c.lineCap = 'round';
      c.strokeStyle = shade(col.leg, -0.25);
      c.lineWidth = 29;
      line(c, hx, hy, fx, fy - 4);
      c.strokeStyle = col.leg;
      c.lineWidth = 25;
      line(c, hx, hy, fx, fy - 4);
      // bàn chân (giày đã mua hoặc chân áo liền thân)
      c.fillStyle = col.foot;
      if (col.boots) {
        c.beginPath();
        c.roundRect(fx - 14, fy - 20, 28, 22, 8);
        c.fill();
      }
      c.beginPath();
      c.ellipse(fx + side * 2, fy + 2, 16, 9.5, 0, 0, 7);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)';
      c.beginPath();
      c.ellipse(fx - 2, fy - 1, 6, 3, 0, 0, 7);
      c.fill();
    }
  }

  /** Tay: đi = vung ngược nhịp chân; chạy = vung mạnh, co khuỷu; nhảy/vui = giơ cao; ngạc nhiên = dang ra. */
  private drawArms(c: CanvasRenderingContext2D, swing: number, running: boolean, acting: boolean, actK: number, t: number) {
    const col = this.colors;
    for (const side of [-1, 1] as const) {
      const sx = 100 + side * 33, sy = 152;
      let a = 0.36; // góc so với phương thẳng đứng (ra ngoài)
      let len = 48;
      if (this.state === 'walk' || this.state === 'run') {
        a += side * swing * (running ? 0.75 : 0.4);
        if (running) len = 40;
      } else if (acting && this.pose === 'jump') {
        a = 0.36 + Math.sin(actK * Math.PI) * 2.2;
      } else if (acting && this.pose === 'happy') {
        a = 2.55 + Math.sin(t / 90) * 0.25; // giơ hai tay vẫy vẫy
      } else if (acting && this.pose === 'surprised') {
        a = 1.25 + Math.sin(actK * Math.PI) * 0.15; // dang tay
      } else if (this.state === 'sit') {
        a = 0.2;
      } else if (this.state === 'idle') {
        a = 0.36 + Math.sin(t / 420) * 0.03;
      }
      const hx = sx + side * Math.sin(a) * len;
      const hy = sy + Math.cos(a) * len;
      c.lineCap = 'round';
      c.strokeStyle = shade(col.sleeve, -0.25);
      c.lineWidth = 25;
      line(c, sx, sy, hx, hy);
      c.strokeStyle = col.sleeve;
      c.lineWidth = 21;
      line(c, sx, sy, hx, hy);
      c.fillStyle = col.skin;
      c.strokeStyle = shade(col.skin, -0.25);
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(sx + side * Math.sin(a) * (len + 6), sy + Math.cos(a) * (len + 6), 11, 0, 7);
      c.fill();
      c.stroke();
    }
  }
}

function line(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();
}
