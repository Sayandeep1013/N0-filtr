/**
 * The No Filter mark — the Open Aperture.
 *
 * A camera iris with its blades **retracted**: the ring is there, the mechanism is
 * there, and the centre is completely clear. The filter is absent. That is the
 * name, drawn. Geometry is docs/spec/50-brand-and-3d.md §1 verbatim:
 *
 *   · a circle of stroke weight 1/12 of its diameter
 *   · six short radial ticks at the inner edge, at 60° intervals
 *   · each tick 1/6 of the radius long
 *   · each rotated 8° off-radial, so they read as retracted blades and not a
 *     compass rose
 *   · the centre empty
 *
 * The numbers below are derived from those ratios rather than typed in, so the
 * mark stays correct at any viewBox and the spec is legible in the code.
 *
 * ⚠ The concept is not yet user-approved — 50-brand-and-3d.md §5 makes approval a
 * precondition, and phase 2 is the gate that does it. Everything brand-shaped is
 * confined to components/brand/ so replacing it is two files.
 *
 * Two notes on what the spec does not say:
 *
 *  · The spec says the mark is drawn with `fill="currentColor"`. A ring and six
 *    ticks are drawn here with `stroke="currentColor"` instead — the same
 *    inheritance, far less path arithmetic, and it keeps the ratios visible.
 *  · The spec gives no stroke weight for the ticks. They are drawn at half the
 *    ring's weight; at the ring's own weight a tick 1/6-of-a-radius long renders
 *    as a square blob rather than a blade. See I-009.
 */

const SIZE = 48;
const C = SIZE / 2;
/** Stroke weight is 1/12 of the diameter. */
const RING_STROKE = SIZE / 12;
/** Centreline radius, so the stroked ring sits exactly inside the viewBox. */
const R = (SIZE - RING_STROKE) / 2;
/** The inner edge of the ring — where the blades retract to. */
const INNER = R - RING_STROKE / 2;
/** Each tick is 1/6 of the radius long. */
const TICK = R / 6;
/** Rotated off-radial so six ticks read as a mechanism, not a compass rose. */
const OFF_RADIAL = 8;
const TICK_STROKE = RING_STROKE / 2;

const TICKS = Array.from({ length: 6 }, (_, i) => i * 60);

export function ApertureMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={C} cy={C} r={R} strokeWidth={RING_STROKE} />
      {TICKS.map((angle) => (
        <line
          key={angle}
          x1={C}
          y1={C - INNER}
          x2={C}
          y2={C - INNER + TICK}
          strokeWidth={TICK_STROKE}
          /* Read right to left: the tick is first pivoted 8° about its own
             anchor on the inner edge, then swung round to its 60° station. */
          transform={`rotate(${angle} ${C} ${C}) rotate(${OFF_RADIAL} ${C} ${C - INNER})`}
        />
      ))}
    </svg>
  );
}
