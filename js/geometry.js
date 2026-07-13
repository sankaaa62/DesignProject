export const snap = (v, grid = 50) => Math.round(v / grid) * grid;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function footprint(item, cat) {
  const rotated = item.rot % 180 !== 0;
  return { x: item.x, y: item.y, w: rotated ? cat.d : cat.w, h: rotated ? cat.w : cat.d };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
