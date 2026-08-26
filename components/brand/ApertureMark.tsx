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
 * ✓ Approved by Sayandeep at the phase-2 brand gate, 2026-08-26, over the three
 * alternates in 50-brand-and-3d.md §1. See D-010.
 *
 * One note on what the spec does not say, and one on a value it now does:
 *
 *  · The spec says the mark is drawn with `fill="currentColor"`. A ring and six
 *    ticks are drawn here with `stroke="currentColor"` instead — the same
 *    inheritance, far less path arithmetic, and it keeps the ratios visible.
 *  · The tick stroke weight was missing from the spec (I-009) and this file chose
 *    half the ring's weight provisionally. That choice was put to Sayandeep at the
 *    gate against two-thirds and full, rendered side by side at 48px and 16px, and
 *    half was confirmed: it is the only one where six separate blades stay
 *    countable at favicon size. It is now a **specced** value — 50-brand-and-3d.md
 *    §1 carries it — so under CLAUDE.md non-negotiable §1 it may not be adjusted
 *    without logging an issue. I-009 is closed.
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
/** Half the ring's weight — spec §1, settled at the phase-2 gate. See I-009. */
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
      {/* `data-mark-ring` and `data-mark-tick` are the loader's handles. The
          mark itself stays inert — it is used at 16px in a nav and at 14vw in a
          footer, and neither of those should ever animate. Only the loader
          looks for them. See D-028. */}
      <circle cx={C} cy={C} r={R} strokeWidth={RING_STROKE} data-mark-ring />
      {/* Wrapped so the loader can turn all six as one mechanism. The group
          has no transform of its own at rest, so the mark is unchanged
          everywhere else it is used — 16px in the navbar, 14vw in the footer.
          See D-030. */}
      <g data-mark-blades>
        {TICKS.map((angle) => (
          <line
            key={angle}
            x1={C}
            y1={C - INNER}
            x2={C}
            y2={C - INNER + TICK}
            strokeWidth={TICK_STROKE}
            data-mark-tick
            /* Read right to left: the tick is first pivoted 8° about its own
               anchor on the inner edge, then swung round to its 60° station. */
            transform={`rotate(${angle} ${C} ${C}) rotate(${OFF_RADIAL} ${C} ${C - INNER})`}
          />
        ))}
      </g>
    </svg>
  );
}
