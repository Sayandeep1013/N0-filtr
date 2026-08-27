/**
 * A hanging rope, simulated. `[new]` — ours, not tonik's.
 *
 * Sayandeep brought a reference — @akarsh_suhane's *"Electric Wire Stretch
 * Effect"*, made in After Effects — of photographs of electric poles scattered
 * as separate cards, with the wires continuing out of one frame and sagging
 * across the gap into the next. Then: *"i want a way where i can move the pole
 * cards and the wires dynamically acts like real wires."*
 *
 * ── Why this is simulated and not drawn ─────────────────────────────────────
 *
 * The first build drew each wire as a single cubic Bézier and computed its sag
 * from a tension term — sag shrinking as the span grew, so a stretched wire
 * straightened. That is enough while the only input is scroll, and it collapses
 * the moment a visitor can grab a pole, because **a formula has no memory**: the
 * wire would resolve to its correct new shape on every frame, with no swing, no
 * overshoot and no settle. It would read as a rubber band being redrawn.
 *
 * Fourteen points with gravity and distance constraints cost about the same and
 * behave like a wire instead. Two things that had been hand-tuned numbers stop
 * existing:
 *
 *   · **sag** is gravity acting on a rope cut longer than its gap
 *   · **a stretched wire straightens** is no longer a rule anyone wrote — it is
 *     what happens when segments cannot exceed their rest length
 *
 * ── The one non-obvious choice ──────────────────────────────────────────────
 *
 * The distance constraint only ever *shortens*. A rope resists being pulled
 * long and does nothing at all when pushed short — correcting in both
 * directions makes it a spring, and it bounces like one, which is the single
 * clearest way to make a wire look wrong.
 *
 * Verlet rather than a velocity integrator because position *is* the state:
 * moving a pinned endpoint by hand is a legal edit to the system, and the next
 * constraint pass simply drags the rest of the rope after it. That property is
 * the whole reason dragging a card feels physical rather than animated.
 */

export type RopePoint = { x: number; y: number };

/**
 * `Float64Array` rather than `number[]`: the count is fixed at `ROPE_POINTS` and
 * never changes, so a growable array buys nothing and a typed one packs better
 * for a loop that touches every element several thousand times a second.
 *
 * It does **not** get us out of `noUncheckedIndexedAccess` — that applies to any
 * index signature, typed arrays included — so the hot loops below assert their
 * reads with `!`. Every index in this file is derived from `ROPE_POINTS` and is
 * in bounds by construction, and it is the same convention `CaseBoard` already
 * uses for its scrubbed loop. Guarding each read instead would put a branch on
 * a value that cannot be undefined.
 */
export type Rope = {
  /** Current positions. Index 0 and the last are pinned to the anchors. */
  x: Float64Array;
  y: Float64Array;
  /** Where each point was last step. The gap between the two is its velocity. */
  px: Float64Array;
  py: Float64Array;
  /** Rest length of one segment. Fixed at birth; never re-measured. */
  seg: number;
};

/** Fourteen reads as a smooth curve and costs nothing. Below about ten the
    straight segments start to show at the deepest part of the sag. */
export const ROPE_POINTS = 14;

/** Constraint passes per step. Six is where a taut rope stops visibly
    stretching under its own weight; more is spent for no visible return. */
const ITERATIONS = 6;

/**
 * Cut a rope and hang it in a straight line between two anchors.
 *
 * `slack` is how much longer than the gap it is cut — the only reason it sags
 * at all. **The rest length is fixed here and never recomputed**, which is what
 * lets a visitor drag the poles apart until it runs out of length and pulls
 * straight, or push them together and watch it pool. A rope that re-measured
 * itself every frame would have no memory of how long it is and could not be
 * stretched at all.
 */
export function hangRope(a: RopePoint, b: RopePoint, slack: number): Rope {
  const x = new Float64Array(ROPE_POINTS);
  const y = new Float64Array(ROPE_POINTS);
  const px = new Float64Array(ROPE_POINTS);
  const py = new Float64Array(ROPE_POINTS);

  for (let i = 0; i < ROPE_POINTS; i += 1) {
    const t = i / (ROPE_POINTS - 1);
    const ix = a.x + (b.x - a.x) * t;
    const iy = a.y + (b.y - a.y) * t;
    x[i] = ix;
    y[i] = iy;
    px[i] = ix;
    py[i] = iy;
  }

  const span = Math.hypot(b.x - a.x, b.y - a.y);
  return { x, y, px, py, seg: (span * (1 + slack)) / (ROPE_POINTS - 1) };
}

/**
 * Advance one step, with both ends pinned to their anchors.
 *
 * `wind` is a horizontal nudge, not a force with any physics behind it — it
 * exists so a settled rope is not a dead one, which is the same job
 * `<Schematic>` does for the rest of the homepage.
 */
export function stepRope(
  rope: Rope,
  a: RopePoint,
  b: RopePoint,
  gravity: number,
  damping: number,
  wind: number,
): void {
  const { x, y, px, py, seg } = rope;
  const last = ROPE_POINTS - 1;

  const pin = () => {
    x[0] = a.x;
    y[0] = a.y;
    x[last] = b.x;
    y[last] = b.y;
  };

  for (let i = 1; i < last; i += 1) {
    const vx = (x[i]! - px[i]!) * damping + wind;
    const vy = (y[i]! - py[i]!) * damping + gravity;
    px[i] = x[i]!;
    py[i] = y[i]!;
    x[i] = x[i]! + vx;
    y[i] = y[i]! + vy;
  }

  pin();

  for (let k = 0; k < ITERATIONS; k += 1) {
    for (let j = 0; j < last; j += 1) {
      const dx = x[j + 1]! - x[j]!;
      const dy = y[j + 1]! - y[j]!;
      const d = Math.hypot(dx, dy) || 0.0001;
      // Shorten only. See the note at the top of this file.
      if (d <= seg) continue;

      const pull = ((d - seg) / d) * 0.5;
      const ox = dx * pull;
      const oy = dy * pull;
      if (j > 0) {
        x[j] = x[j]! + ox;
        y[j] = y[j]! + oy;
      }
      if (j + 1 < last) {
        x[j + 1] = x[j + 1]! - ox;
        y[j + 1] = y[j + 1]! - oy;
      }
    }
    // Re-pin after every pass, or the constraints walk the ends off their poles.
    pin();
  }
}

/**
 * An SVG path through the points, smoothed at the segment midpoints so fourteen
 * points read as one continuous wire rather than as fourteen.
 */
export function ropePath(rope: Rope): string {
  const { x, y } = rope;
  const last = ROPE_POINTS - 1;
  let d = `M${x[0]!.toFixed(2)},${y[0]!.toFixed(2)}`;

  for (let i = 1; i < last; i += 1) {
    const mx = (x[i]! + x[i + 1]!) / 2;
    const my = (y[i]! + y[i + 1]!) / 2;
    d += ` Q${x[i]!.toFixed(2)},${y[i]!.toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)}`;
  }

  return `${d} L${x[last]!.toFixed(2)},${y[last]!.toFixed(2)}`;
}

/**
 * Settle a rope without animating it — used under `prefers-reduced-motion`,
 * where the wires are drawn hanging correctly and then never move again.
 *
 * Enough steps for the sag to reach its resting depth and stop, run in one
 * synchronous burst at mount. Fourteen points × 240 steps is well under a
 * millisecond.
 */
export function settleRope(
  rope: Rope,
  a: RopePoint,
  b: RopePoint,
  gravity: number,
  damping: number,
): void {
  for (let i = 0; i < 240; i += 1) stepRope(rope, a, b, gravity, damping, 0);
}
