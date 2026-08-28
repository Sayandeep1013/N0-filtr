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
   Sayandeep, 2026-08-26: *"add a logo — tilted wheel kinda"*, and then *"the
   logo at the tab bar still isn't visible."*

   The mark is drawn at the exact attitude of the 3D object, so the two stop
   being separate drawings of the same idea. The numbers are not chosen here —
   they are read off `apertureScene.ts`, which measured them against tonik's
   capture:

       TILT_AXIS   = 0.892 rad off horizontal   → 51.1°
       TILT_ANGLE  = 0.76 rad                   → cos = 0.7247

   ── Why the tilt is baked into the geometry rather than applied as a
      transform ───────────────────────────────────────────────────────────────

   It *was* a transform — `rotate(A) scale(1, k) rotate(-A)` around the centre —
   and that is the obvious way to do it. It also **squashes the stroke**, which
   is correct for a photograph of a tilted ring and wrong for a drawing of one.

   At 64px nobody notices. At the 16px a browser tab actually asks for, the two
   thin sides of the ellipse fall below a pixel and drop out: the ring renders
   as a broken **C**. Which is exactly what Sayandeep was looking at when he
   said the logo was not visible in the tab — it was there, and it was not a
   ring.

   So the ellipse is computed instead. A circle tilted by φ about an in-plane
   axis projects to an ellipse with semi-axes `R` along the axis and `R·cos φ`
   across it — so it can be drawn as an `<ellipse>` rotated to the axis, with a
   normal stroke width that never scales. The blades are pushed through the same
   matrix by hand, two endpoints each.

   The uniform weight is not a compromise. Line art is what this brand is, and
   the 3D object's own edges (D-032) are drawn one device pixel wide for the
   same reason — a technical drawing of a tilted wheel does not thin its lines
   at the far side.

   It is also **rasteriser-independent**, which `vector-effect: non-scaling-stroke`
   is not: `scripts/brand-assets.mjs` renders this same geometry to PNG for the
   apple icon, the 512 tile and the OG card, and support for that property
   outside a browser is not something to rely on. */
/* The sign is negative, and that is the whole of the alignment fix.

   `apertureScene.ts` and this file both carry the axis as 0.892 rad / 51.1
   degrees, read off the same measurement — and for five phases they tilted in
   **opposite directions**. Sayandeep: *"the 3d is right tilted the logos and
   loaders are left tilted .. align them."*

   Nothing was mistyped. Three's y axis points **up** and SVG's points **down**,
   so the identical angle about the identical axis mirrors between them. The
   magnitude is the measurement and the sign is the coordinate system, so the
   sign is what changes here: the 3D object keeps the number the spec measured,
   and the mark — which is ours — turns to meet it. See D-036. */
/* Exported because the loader spins this mark, and a wheel drawn in projection
   cannot be spun by rotating it on screen — that tumbles the ellipse instead of
   turning the wheel. `Loader.tsx` composes `tilt ∘ rotate(θ) ∘ tilt⁻¹` out of
   exactly these two numbers, so it needs them rather than a copy of them. See
   D-061 and the standing rule in this file: `ApertureMark` owns the geometry. */
export const TILT_AXIS_DEGREES = -51.1;
export const TILT_SQUASH = 0.7247;

/**
 * A point pushed through the tilt: `rotate(A) ∘ scale(1, k) ∘ rotate(−A)`,
 * about the mark's centre.
 *
 * SVG's y axis points down, so `rotate(a)` is clockwise and its matrix is
 * `[cos a, −sin a; sin a, cos a]`. Getting that sign wrong tilts the mark the
 * other way, which looks deliberate and is not.
 */
function tilt(x: number, y: number): [number, number] {
  const a = (TILT_AXIS_DEGREES * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  const dx = x - C;
  const dy = y - C;

  // rotate(−A)
  const rx = dx * cos + dy * sin;
  const ry = -dx * sin + dy * cos;
  // scale(1, k)
  const sy = ry * TILT_SQUASH;
  // rotate(A)
  return [C + rx * cos - sy * sin, C + rx * sin + sy * cos];
}

const round = (n: number) => +n.toFixed(3);

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
      {/* The ring. A tilted circle IS an ellipse — semi-axis `R` along the tilt
          axis, `R × 0.7247` across it — so it is drawn as one rather than as a
          circle inside a squashing transform. The stroke then stays the weight
          it is declared at, at every size. See the note above. */}
      {flat ? (
        <circle cx={C} cy={C} r={R} strokeWidth={RING_STROKE} data-mark-ring />
      ) : (
        <ellipse
          cx={C}
          cy={C}
          rx={R}
          ry={round(R * TILT_SQUASH)}
          strokeWidth={RING_STROKE}
          transform={`rotate(${TILT_AXIS_DEGREES} ${C} ${C})`}
          data-mark-ring
        />
      )}

      {/* Wrapped so the loader can turn all six as one mechanism. The group has
          no transform of its own at rest, so the mark is unchanged everywhere
          else it is used. See D-030. */}
      <g data-mark-blades>
        {TICKS.map((angle) => {
          /* Each blade's own two rotations, resolved here rather than left as a
             `transform` attribute: its endpoints have to go through the tilt
             matrix as points, and a transform would put the squash back on the
             stroke. Read right to left as before — pivoted 8° about its own
             anchor on the inner edge, then swung to its 60° station. */
          const station = (angle * Math.PI) / 180;
          const lean = (OFF_RADIAL * Math.PI) / 180;

          /**
           * A point `radius` along the blade, from its anchor on the ring's
           * inner edge, resolved through both of the blade's own rotations and
           * then through the tilt.
           *
           * The blade's untransformed points are `(C, C − INNER + r)` — it
           * starts on the inner edge and runs inward. From there:
           *
           *   1. rotate by 8° about its OWN anchor, which is what gives six
           *      ticks a mechanism's lean rather than a compass rose's symmetry
           *   2. rotate to its 60° station about the mark's centre
           *   3. tilt
           *
           * SVG rotation is clockwise, so a point at `(0, r)` from the pivot
           * lands at `(−r sin, r cos)`.
           */
          const place = (radius: number): [number, number] => {
            // 1 — about the anchor at (C, C − INNER)
            const px = C - Math.sin(lean) * radius;
            const py = C - INNER + Math.cos(lean) * radius;

            // 2 — about the centre
            const dx = px - C;
            const dy = py - C;
            const rx = C + dx * Math.cos(station) - dy * Math.sin(station);
            const ry = C + dx * Math.sin(station) + dy * Math.cos(station);

            // 3
            return flat ? [rx, ry] : tilt(rx, ry);
          };

          const [x1, y1] = place(0);
          const [x2, y2] = place(TICK);

          return (
            <line
              key={angle}
              x1={round(x1)}
              y1={round(y1)}
              x2={round(x2)}
              y2={round(y2)}
              strokeWidth={TICK_STROKE}
              strokeLinecap="round"
              data-mark-tick
            />
          );
        })}
      </g>
    </svg>
  );
}
