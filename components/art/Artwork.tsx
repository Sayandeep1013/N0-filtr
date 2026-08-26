import { cx } from '@/lib/cx';
import { between, makeRandom, pick, seedFrom } from '@/lib/art/seed';
import s from './Artwork.module.css';

/**
 * `<Artwork />` — a generated plate, drawn in code from the site's own language.
 *
 * ── Why the case studies stopped using screenshots ────────────────────────
 *
 * Sayandeep, after the plate and the grade had both landed: *"change the
 * tessera's case study image .. use a artsy generated image which suits the
 * theme .. may not be related to tessera if needed be."*
 *
 * Which is, in the end, what tonik do — their work cards are not screenshots,
 * they are single art-directed key images with one subject and a lot of empty
 * ground (`docs/research/screens/s03-projects.png`). We have no art department,
 * so ours are drawn by a function.
 *
 * Three options were put to him: generated in code, offline renders of the 3D
 * aperture, or an image model. He chose code. It is also the one that survives:
 * no files, no network, no regeneration drift, identical on the server and in
 * the browser, and it scales to any size because it is vector. See D-038.
 *
 * ── The vocabulary is the site's, not a new one ──────────────────────────
 *
 * Every motif is built from something already on the page — the aperture's
 * tilted ellipse and six blades, `<Schematic>`'s fields of straight hairlines,
 * the twelve-column grid, the 1px rule. Nothing here introduces a shape the
 * site does not already use, which is the difference between generated art and
 * generated wallpaper.
 *
 * Grey and white only (D-035). The accent appears in exactly one place per
 * plate — a single hairline — which is the width D-036 allows it.
 *
 * ── Deterministic, and that is load-bearing ──────────────────────────────
 *
 * Seeded from the `seed` string, so `tessera-01` is the same picture forever, on
 * the server and in the browser. A generated image that differs between the two
 * is a hydration error, and one that differs between builds is a poster that
 * changes when somebody redeploys.
 *
 * **Every motif builds its own generator from its own derived seed, and no
 * generator is ever passed as a prop.** The first version did pass one — a
 * single `random` handed to `<Mosaic>` and then to `<Rule>` — and it produced a
 * hydration mismatch on the first render: 177 tiles on the server, 271 in the
 * browser.
 *
 * A generator created during render is *mutable state in a render function*.
 * React renders components twice in development, and it does not guarantee that
 * a parent and its children are re-rendered together — so the second call to a
 * child continued the sequence where the first left off instead of restarting
 * it. Deterministic seeding does not help if the thing consuming the seed is
 * shared and stateful.
 *
 * Derived seeds cost one hash each and remove the whole class of problem: a
 * motif rendered any number of times, in any order, draws the same picture.
 */

/** The tilt the whole brand sits at. Negative, to match the 3D — see D-036. */
const TILT = -51.1;

const MOTIFS = ['mosaic', 'iris', 'strata', 'orbit'] as const;
type Motif = (typeof MOTIFS)[number];

/** The plate's own coordinate space. 16:10, like every capture on the site. */
const W = 1600;
const H = 1000;

/**
 * Every coordinate this file emits goes through here, and it is not cosmetic.
 *
 * `Math.cos` and `Math.sin` are **implementation-defined** in ECMAScript — the
 * standard requires them to be close, not identical — so the same expression can
 * differ in its last bit between the Node process that server-renders a page and
 * the browser that hydrates it. React compares the attribute strings, and
 * `123.45600000000002` against `123.456` is a hydration mismatch.
 *
 * The first version of this file hit exactly that in `<Iris>` and `<Orbit>`, the
 * two motifs built from trigonometry, and nowhere else — `<Mosaic>` places
 * everything on integer multiples of a cell.
 *
 * Two decimal places on a 1600-unit canvas is well under a device pixel at any
 * size these are drawn, so nothing is lost but the disagreement. See I-053.
 */
const n = (value: number) => Math.round(value * 100) / 100;

export function Artwork({
  seed,
  motif,
  compact = false,
  className,
}: {
  /**
   * Anything stable. By convention `<slug>-<nn>`, optionally prefixed with a
   * motif and a slash — `mosaic/tessera-01` — for the cases where the motif is
   * part of the argument rather than a coin toss. Tessera's is a mosaic because
   * a tessera *is* a tile in a mosaic; leaving that to chance would be a waste
   * of the one joke the naming affords.
   */
  seed: string;
  /** Force a motif. Overrides a prefix in `seed`. */
  motif?: Motif;
  /**
   * Fewer, larger elements. For plates drawn small and in quantity — `/about`
   * puts **forty-five** of these in one pinned grid, and a mosaic at the full
   * cell size is up to four hundred rects apiece. Compact roughly quarters the
   * element count, which is the difference between a scrub that holds 60fps and
   * one that does not.
   */
  compact?: boolean;
  className?: string;
}) {
  const slash = seed.indexOf('/');
  const named = slash > 0 ? (seed.slice(0, slash) as Motif) : undefined;
  const body = slash > 0 ? seed.slice(slash + 1) : seed;

  /* The motif is drawn from its **own** hash rather than from the first output
     of this generator. An LCG's first value tracks its seed closely, so picking
     from it gave three of the first four works the same motif — and it also
     coupled the choice to the composition, so changing one changed the other. */
  const fromSeed = pick(makeRandom(seedFrom(`${body}:motif`)), MOTIFS);
  const chosen = motif ?? (named && MOTIFS.includes(named) ? named : fromSeed);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cx(s.art, className)}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={W} height={H} className={s.ground} />
      {chosen === 'mosaic' ? <Mosaic seed={body} compact={compact} /> : null}
      {chosen === 'iris' ? <Iris seed={body} /> : null}
      {chosen === 'strata' ? <Strata seed={body} compact={compact} /> : null}
      {chosen === 'orbit' ? <Orbit seed={body} /> : null}
      {/* The one hairline of colour a plate is allowed. D-036. */}
      <Rule seed={body} />
    </svg>
  );
}

/* ── mosaic ────────────────────────────────────────────────────────────────
   A tessellation, which is what a tessera *is* — the Latin for a single tile in
   a mosaic. It is also a picture of the thing most of these projects are: a
   document made of addressable cells.

   ── Composed, not scattered ─────────────────────────────────────────────

   The first version drew a cell wherever a coin came up, with brightness from a
   second independent coin, and it read as **noise**: an even field of speckle
   with no subject and no empty ground. tonik's plates are the opposite — one
   subject, a great deal of nothing (`docs/research/screens/s03-projects.png`).

   Two changes fixed it and both are about coupling values that were
   independent. Density falls off from a seeded centre on a **curve** rather
   than linearly, so there is a core and a real edge; and **brightness is a
   function of that same distance**, so the light is in the middle instead of
   sprinkled. The seed still moves the centre, the reach and the falloff, so
   twelve plates differ — they just differ as compositions rather than as
   different noise. */
function Mosaic({ seed, compact = false }: { seed: string; compact?: boolean }) {
  const random = makeRandom(seedFrom(`${seed}:mosaic`));
  /* Big enough to read as tiles rather than as grain. Larger again when the
     plate is drawn small and in quantity — see `compact` on `<Artwork>`. */
  const cell = compact ? 128 : 64;
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  const cx0 = between(random, 0.34, 0.66) * cols;
  const cy0 = between(random, 0.36, 0.64) * rows;
  /* In units of the half-diagonal, so it means the same at any cell size. */
  const reach = between(random, 0.46, 0.66);
  const falloff = between(random, 1.5, 2.4);
  const tiles: React.ReactElement[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const dx = (x - cx0) / cols;
      const dy = ((y - cy0) / rows) * 0.8;
      const d = Math.sqrt(dx * dx + dy * dy) / reach;
      if (d >= 1) continue;

      /* Near the centre almost every cell is placed; at the edge almost none. */
      const density = Math.pow(1 - d, falloff);
      if (random() > density) continue;

      /* And the light is where the density is, with a little jitter so the
         gradient does not read as a printed ramp. */
      const level = density + between(random, -0.18, 0.18);
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x * cell}
          y={y * cell}
          width={cell - 3}
          height={cell - 3}
          className={level > 0.72 ? s.tileBright : level > 0.38 ? s.tileMid : s.tileDim}
        />,
      );
    }
  }
  return <g>{tiles}</g>;
}

/* ── iris ──────────────────────────────────────────────────────────────────
   The mark, exploded. Concentric tilted ellipses with the six blades pushed out
   past them — the same construction as `<ApertureMark>`, drawn large enough
   that it reads as a diagram of the thing rather than as the logo again. */
function Iris({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:iris`));
  const cx = W / 2 + between(random, -160, 160);
  const cy = H / 2 + between(random, -80, 80);
  const rings = 4 + Math.floor(random() * 3);
  const outer = between(random, 300, 400);
  const squash = 0.7247;

  const items: React.ReactElement[] = [];
  for (let i = 0; i < rings; i += 1) {
    const r = outer * (1 - i / (rings + 1));
    items.push(
      <ellipse
        key={`r${i}`}
        cx={n(cx)}
        cy={n(cy)}
        rx={n(r)}
        ry={n(r * squash)}
        transform={`rotate(${TILT} ${n(cx)} ${n(cy)})`}
        className={i === 0 ? s.strokeBright : s.strokeDim}
      />,
    );
  }

  /* Six blades, on the stations the mark uses, each a chord across the field. */
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + random() * 0.12;
    const inner = outer * between(random, 0.2, 0.45);
    const reach = outer * between(random, 1.1, 1.5);
    const t = (TILT * Math.PI) / 180;
    const project = (r: number) => {
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * squash;
      return [
        cx + px * Math.cos(t) - py * Math.sin(t),
        cy + px * Math.sin(t) + py * Math.cos(t),
      ] as const;
    };
    const [x1, y1] = project(inner);
    const [x2, y2] = project(reach);
    items.push(
      <line
        key={`b${i}`}
        x1={n(x1)}
        y1={n(y1)}
        x2={n(x2)}
        y2={n(y2)}
        className={s.strokeMid}
      />,
    );
  }

  return <g>{items}</g>;
}

/* ── strata ────────────────────────────────────────────────────────────────
   `<Schematic>`'s language at plate scale: a field of straight hairlines whose
   lengths fall away, stacked. The one motif that is pure rule-work, and the
   quietest of the four. */
function Strata({ seed, compact = false }: { seed: string; compact?: boolean }) {
  const random = makeRandom(seedFrom(`${seed}:strata`));
  const count = (compact ? 12 : 26) + Math.floor(random() * (compact ? 6 : 14));
  const gap = H / (count + 2);
  const left = between(random, 90, 200);
  const bias = between(random, 0.25, 0.75);
  const lines: React.ReactElement[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    /* A soft peak at `bias`, so the field has a waist rather than a ramp. */
    const shape = 1 - Math.abs(t - bias) * between(random, 1.1, 1.8);
    const width = Math.max(0.06, shape) * (W - left - 120);
    const y = gap * (i + 1.5);
    lines.push(
      <line
        key={i}
        x1={n(left)}
        y1={n(y)}
        x2={n(left + width)}
        y2={n(y)}
        className={i % 7 === 0 ? s.strokeBright : s.strokeDim}
      />,
    );
  }
  return <g>{lines}</g>;
}

/* ── orbit ─────────────────────────────────────────────────────────────────
   Arcs at the brand's tilt, crossing. Built from the ellipse again, but cut
   into segments so it reads as a path rather than a ring — the closest of the
   four to the 3D object as it turns. */
function Orbit({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:orbit`));
  const cx = W / 2 + between(random, -220, 220);
  const cy = H / 2 + between(random, -60, 60);
  const count = 5 + Math.floor(random() * 4);
  const arcs: React.ReactElement[] = [];

  for (let i = 0; i < count; i += 1) {
    const r = between(random, 140, 460);
    const ry = r * 0.7247;
    const start = random() * Math.PI * 2;
    const sweep = between(random, 0.9, 2.6);
    const p = (a: number) => `${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * ry)}`;
    const large = sweep > Math.PI ? 1 : 0;
    arcs.push(
      <path
        key={i}
        d={`M ${p(start)} A ${n(r)} ${n(ry)} 0 ${large} 1 ${p(start + sweep)}`}
        transform={`rotate(${TILT} ${n(cx)} ${n(cy)})`}
        className={i === 0 ? s.strokeBright : s.strokeMid}
        fill="none"
      />,
    );
  }
  return <g>{arcs}</g>;
}

/* ── the rule ──────────────────────────────────────────────────────────────
   One hairline in the work's accent, placed by the seed. The only colour on the
   plate, and the only thing that says which work it belongs to. */
function Rule({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:rule`));
  const horizontal = random() > 0.5;
  const at = between(random, 0.18, 0.82);
  return horizontal ? (
    <line x1={0} y1={n(H * at)} x2={W} y2={n(H * at)} className={s.rule} />
  ) : (
    <line x1={n(W * at)} y1={0} x2={n(W * at)} y2={H} className={s.rule} />
  );
}
