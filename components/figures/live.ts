/**
 * The small amount of geometry the figures' client components need: a gauge
 * needle as a path, and a spring to swing it. Mirrors `needlePath` in
 * `tools/figures/parts.mjs`, which draws the needle's rest position.
 */

export interface GaugeGeom {
  readonly centre: readonly [number, number] | readonly number[];
  readonly kx: number;
  readonly ky: number;
  readonly tip: number;
  readonly tail: number;
  readonly sweep: number;
  readonly max: number;
}

/** Needle path for a reading, in the SVG's viewBox units. */
export function needleD(g: GaugeGeom, value: number): string {
  const v = Math.min(g.max * 1.02, Math.max(-0.02 * g.max, value));
  const theta = -g.sweep + (2 * g.sweep * v) / g.max;
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const [cx, cy] = g.centre as [number, number];
  const ax = cx - s * g.tail * g.kx;
  const ay = cy + c * g.tail * g.ky;
  const bx = cx + s * g.tip * g.kx;
  const by = cy - c * g.tip * g.ky;
  return `M${ax.toFixed(2)} ${ay.toFixed(2)}L${bx.toFixed(2)} ${by.toFixed(2)}`;
}

export interface Spring {
  at: number;
  rate: number;
}

/**
 * A sub-stepped spring — a Bourdon tube is a damped spring, so the needle
 * overshoots a little and settles. Returns true once it has.
 */
export function spring(state: Spring, target: number, dt: number, stiffness = 90, damping = 14, calm = false): boolean {
  if (calm) {
    state.at = target;
    state.rate = 0;
    return true;
  }
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.rate += ((target - state.at) * stiffness - state.rate * damping) * h;
    state.at += state.rate * h;
  }
  if (Math.abs(target - state.at) < 5e-4 && Math.abs(state.rate) < 5e-4) {
    state.at = target;
    state.rate = 0;
    return true;
  }
  return false;
}

/** Exponential follow toward a target over `tau` seconds. */
export function follow(at: number, target: number, dt: number, tau: number): number {
  const next = at + (target - at) * (1 - Math.exp(-dt / tau));
  return Math.abs(target - next) < 1e-4 ? target : next;
}

export interface WheelGeom {
  readonly centre: readonly number[];
  /** Screen vectors of one world unit along x and y — the wheel lies flat. */
  readonly ex: readonly number[];
  readonly ey: readonly number[];
  readonly hub: number;
  readonly rim: number;
  readonly spokes: number;
}

/**
 * A handwheel's spokes at `angle` (radians, counter-clockwise from above), as
 * one path: each spoke two parallel strokes from the hub's edge to the rim's
 * inner edge, so every line ends on a stroke. Used by the build for the rest
 * pose and by the client every frame.
 */
export function spokesD(w: WheelGeom, angle: number, half = 0.75): string {
  const [cx, cy] = w.centre as [number, number];
  const [xx, xy] = w.ex as [number, number];
  const [yx, yy] = w.ey as [number, number];
  const pt = (x: number, y: number) => `${(cx + x * xx + y * yx).toFixed(2)} ${(cy + x * xy + y * yy).toFixed(2)}`;
  let d = '';
  for (let i = 0; i < w.spokes; i++) {
    const a = angle + (i * 2 * Math.PI) / w.spokes;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (const side of [-half, half]) {
      const ox = -s * side;
      const oy = c * side;
      const r0 = Math.sqrt(w.hub * w.hub - side * side);
      const r1 = Math.sqrt(w.rim * w.rim - side * side);
      d += `M${pt(c * r0 + ox, s * r0 + oy)}L${pt(c * r1 + ox, s * r1 + oy)}`;
    }
  }
  return d;
}
