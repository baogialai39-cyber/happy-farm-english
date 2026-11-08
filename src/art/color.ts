/** Làm sáng (amt > 0) hoặc tối (amt < 0) một màu hex. amt trong [-1, 1]. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt)),
  );
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
}

let uid = 0;
/** Tiền tố id duy nhất cho gradient trong mỗi SVG (tránh trùng id giữa nhiều hình). */
export function nextUid(prefix: string): string {
  uid += 1;
  return `${prefix}${uid}`;
}

/** Gradient tròn "khối 3D": sáng ở góc trên-trái, tối dần ra mép. */
export function blob3d(id: string, base: string, light = 0.45, dark = -0.18): string {
  return `<radialGradient id="${id}" cx="35%" cy="30%" r="75%">
    <stop offset="0" stop-color="${shade(base, light)}"/>
    <stop offset="0.55" stop-color="${base}"/>
    <stop offset="1" stop-color="${shade(base, dark)}"/>
  </radialGradient>`;
}

/** Gradient dọc cho mặt phẳng (tường, mái, đồi). */
export function vgrad(id: string, top: string, bottom: string): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>
  </linearGradient>`;
}
