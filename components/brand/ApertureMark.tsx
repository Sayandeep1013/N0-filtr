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

/* ── the tilt ────────────────────────────────────────────────────────────────
   Sayandeep, 2026-08-26: *"add a logo — tilted wheel kinda."* The navbar had
   only the `NO FiLTER` wordmark; the mark itself lived in the loader, the
   favicon and the OG card and never appeared beside it.

   So the mark is now drawn **tilted to the exact attitude of the 3D object**,
   and the two stop being separate drawings of the same idea. The numbers are
   not chosen here — they are read off `apertureScene.ts`, which measured them
   against tonik's capture:

       TILT_AXIS   = 0.892 rad off horizontal   → 51.1°
       TILT_ANGLE  = 0.76 rad                   → cos = 0.7247

   A circle tilted by φ about an in-plane axis projects to an ellipse: the
   diameter **along** the axis is unchanged, everything perpendicular to it is
   foreshortened by `cos φ`. So the transform is: rotate the geometry until the
   tilt axis is horizontal, squash Y by 0.7247, rotate back.

   SVG applies a transform list right to left, which is why it reads backwards
   from that sentence. And `scale()` is about the origin rather than about a
   point, so it is sandwiched between translates to keep it about the centre.

   ⚠️ **The stroke squashes with the shape**, which is correct — a tilted ring
   really is thinner across its minor axis. It is also why `vector-effect` is
   deliberately NOT set here: `non-scaling-stroke` would hold the weight
   constant and the ellipse would stop reading as a circle seen at an angle. */
const TILT_AXIS_DEGREES = 51.1;
const TILT_SQUASH = 0.7247;
const TILT_TRANSFORM = [
  `rotate(${TILT_AXIS_DEGREES} ${C} ${C})`,
  `translate(${C} ${C})`,
  `scale(1 ${TILT_SQUASH})`,
  `translate(${-C} ${-C})`,
  `rotate(${-TILT_AXIS_DEGREES} ${C} ${C})`,
].join(' ');

export function ApertureMark({
  className,
  /**
   * Draw the mark flat-on instead of tilted.
   *
   * The tilt is the default because it is what the logo is now. This exists for
   * the one place a foreshortened mark would be wrong: a favicon at 16px, where
   * an ellipse squashed to 72% of its height loses the ring to rounding. Nothing
   * in the app passes it yet — `scripts/brand-assets.mjs` draws its own copy of
   * the geometry — but the option belongs with the geometry rather than in a
   * comment somewhere.
   */
  flat = false,
}: {
  className?: string;
  flat?: boolean;
}) {
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
      {/* Everything sits inside the tilt, so the ring and its six blades are
          foreshortened together and the blades stay on their own radial lines.
          Tilting them separately would put them off the ellipse.

          `data-mark-ring` and `data-mark-tick` are the loader's handles. The
          mark itself stays inert — it is used at 16px in a nav and at 14vw in a
          footer, and neither of those should ever animate. Only the loader
          looks for them. See D-028 and D-033. */}
      <g transform={flat ? undefined : TILT_TRANSFORM}>
        <circle cx={C} cy={C} r={R} strokeWidth={RING_STROKE} data-mark-ring />

        {/* Wrapped so the loader can turn all six as one mechanism. The group
            has no transform of its own at rest, so the mark is unchanged
            everywhere else it is used. See D-030. */}
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
      </g>
    </svg>
  );
}
