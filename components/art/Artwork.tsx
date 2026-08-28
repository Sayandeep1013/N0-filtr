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
 * ── It is a specimen plate, not a field ──────────────────────────────────
 *
 * The first version of this file drew **fields**: a mosaic, a set of arcs, a
 * stack of rules, each filling the whole 1600×1000 frame. Sayandeep, 2026-08-28:
 * *"the casestudy cards thumbnail — i need better thumbnails for those,"* with
 * `kojima-san.vercel.app` as the reference: *"the svg styling like these ..
 * understand the intent and implement accordingly."*
 *
 * The intent, read off their generator rather than copied from it, is that
 * **the annotation is the artwork**. Their plate is a printed figure — a ruled
 * frame with registration crosses at the corners, a header rail carrying a
 * catalogue number and a figure number, one or two small precise instruments
 * on a great deal of empty ground with a part name under each, and a footer
 * rail with a spec line and an edition. The drawing is spare on purpose. What
 * makes it read as a considered object is the apparatus around it.
 *
 * That is a better fit for this site than it is for theirs, for a reason worth
 * writing down: **their labels are fiction and ours are facts.** `FIG.04` is
 * the work's actual position in the twelve, the code is the plate's actual
 * seed, the spec line names the instruments actually drawn and the hash they
 * came from. A studio called No Filter should not put a decorative serial
 * number on its own work. Everything on the rails is true or it is not there —
 * `edition` is optional and omitted rather than invented. See D-059.
 *
 * ── The apparatus is DOM and the instruments are SVG ─────────────────────
 *
 * Not a stylistic split — a correctness one, and it is the thing most likely to
 * be "simplified" back by someone who has not hit it.
 *
 * These plates are drawn into boxes whose aspect ratios are **not known here
 * and not the same**: 16:10 on a half card, 21:9 on the full one, whatever a
 * board tile's column and row spans work out to, 4:3 on a phone. The old file
 * met that with one 1600×1000 viewBox and `preserveAspectRatio="slice"`, which
 * covers the box and crops the overflow. A field does not care — it is texture
 * either way. **A frame does.** On the 21:9 card, slice crops about 170 units
 * off the top and the bottom, which is the header rail, the footer rail and
 * both rows of corner marks.
 *
 * Passing the ratio in was tried on paper and does not survive contact: the
 * plate is inset from its box by `--card-plate`, in `rem`, on a *fluid* root —
 * so the true ratio of the drawn area moves with the viewport and no caller can
 * state it.
 *
 * So the apparatus is laid out by the box itself, in flexbox, and cannot be
 * cropped by construction. The instruments keep their own square viewBoxes and
 * are centred with `meet`, so each one is whole at any size. It buys two more
 * things: the micro-type is real type at `--t-label-sm-size` rather than SVG
 * text scaled by the box — legible at 500px wide and not shouting at 1300 — and
 * `vector-effect: non-scaling-stroke` makes every instrument line a true 1px
 * hairline, which is the width the rest of the site is drawn in.
 *
 * ── Grey, white, and one line of accent ──────────────────────────────────
 *
 * D-035 and D-036, unchanged. The single accent element is the **datum** — one
 * hairline across the field with a tick at each end, placed by the seed, which
 * is the "one rule per generated plate" D-036 budgets. It reads the *light*
 * member of the work's accent pair (`--work-accent-ink` on a card,
 * `--accent-ink` on a case study): a 1px line in the dark member disappears
 * into a `--grey-900` ground, which is the same distinction I-046 drew.
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

const MOTIFS = ['mosaic', 'strata', 'grid', 'stack', 'iris', 'orbit', 'burst'] as const;
type Motif = (typeof MOTIFS)[number];

/**
 * The instruments with no round part in them.
 *
 * Sayandeep, 2026-08-28: *"dont use the circular ones where we have hover
 * effect as in the casestudy cards .. in the about section those look good
 * tho."*
 *
 * Which is a distinction about **what else is moving**, not about the drawings.
 * A work card is the one place a plate is under something: the title watermark
 * sits over its middle and travels to the corner on hover, and the info drawer
 * wipes across it (D-051). All of that is straight-line motion over a
 * rectilinear layout, and a ring or an arc underneath it reads as a second,
 * unrelated system rather than as the ground the movement happens on. The
 * `/about` tiles have nothing over them, so there is nothing for a circle to
 * argue with — and they keep all seven.
 *
 * `grid` and `stack` exist because of this. Cutting the three round instruments
 * left the cards with two, which is not a set — twelve plates drawn from
 * `mosaic` and `strata` alone is a pattern, and the whole point of a generated
 * plate is that no two are the same picture.
 */
const RECTILINEAR = ['mosaic', 'strata', 'grid', 'stack'] as const;

type Family = 'all' | 'rectilinear';

/**
 * How many instruments stand on the plate. Named after what they look like
 * rather than after their count, because the count is not the point — `solo` is
 * one instrument on a great deal of empty ground, which is a different
 * composition from `trio` and not a smaller one.
 *
 * `duo` twice, so it comes up half the time: it is the shape that suits a
 * landscape plate best, and the other two are the variation.
 */
const LAYOUTS = ['solo', 'duo', 'duo', 'trio'] as const;
type Layout = (typeof LAYOUTS)[number];

/** Every instrument is drawn in this box and centred in whatever it is given. */
const I = 100;

/** Panel letters, in the order the field reads. */
const LETTERS = ['A', 'B', 'C'] as const;

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
 * Two decimal places on a 100-unit instrument is well under a device pixel at
 * any size these are drawn, so nothing is lost but the disagreement. See I-053.
 */
const n = (value: number) => Math.round(value * 100) / 100;

export function Artwork({
  seed,
  motif,
  compact = false,
  family = 'all',
  figure,
  series = 'No Filter',
  code,
  edition,
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
  /** Force the first panel's motif. Overrides a prefix in `seed`. */
  motif?: Motif;
  /**
   * The instrument alone, on the ground, with no rails and no frame. For plates
   * drawn small and in quantity — `/about` puts **forty-five** of these in one
   * pinned grid, and micro-type at 0.5rem inside a 180px tile is a grey smudge
   * that costs a dozen DOM nodes apiece to draw.
   *
   * It is not "the plate, smaller". It is the instrument without its plate,
   * which is a thing this vocabulary already contains.
   */
  compact?: boolean;
  /**
   * Which instruments this plate may draw from. `rectilinear` drops the three
   * with a round part in them; see `RECTILINEAR` for why the work cards ask for
   * it and nothing else does.
   */
  family?: Family;
  /**
   * The figure number, right of the header rail. A work passes its own position
   * in the twelve. Omitted, it is read off the seed's trailing digits —
   * `tessera-01` is `FIG.01` — because that is what the number already means.
   */
  figure?: string | number;
  /** The centre of the header rail. The studio, unless a set has its own name. */
  series?: string;
  /** The catalogue code, left of the header rail. Defaults to the seed body. */
  code?: string;
  /**
   * The footer's right-hand fraction — `04/12`. **Optional, and omitted rather
   * than invented**: an edition number the studio does not actually keep is the
   * one piece of the reference that would have been a lie. See D-059.
   */
  edition?: string;
  className?: string;
}) {
  const slash = seed.indexOf('/');
  const named = slash > 0 ? (seed.slice(0, slash) as Motif) : undefined;
  const body = slash > 0 ? seed.slice(slash + 1) : seed;

  /* The layout is drawn from its **own** hash, for the reason the motif is: an
     LCG's first value tracks its seed closely, so sharing one generator couples
     every choice on the plate to every other, and changing one changes them
     all. */
  const pool: readonly Motif[] = family === 'rectilinear' ? RECTILINEAR : MOTIFS;

  const layout: Layout = pick(makeRandom(seedFrom(`${body}:layout`)), LAYOUTS);
  /* Clamped to the pool, so a `trio` can never be asked for three distinct
     instruments out of two. It does not bite at either family's real size — it
     is the guard that keeps a narrowed pool from silently reintroducing the
     duplicate panels the dedupe below exists to prevent. */
  const count = Math.min(layout === 'solo' ? 1 : layout === 'duo' ? 2 : 3, pool.length);

  /* The first panel honours a forced motif or a `motif/` prefix; the rest are
     drawn per panel and deduplicated against what is already on the plate. Two
     copies of the same instrument side by side read as a rendering fault rather
     than as a pair. */
  const forced = motif ?? (named && MOTIFS.includes(named) ? named : undefined);
  const motifs: Motif[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i === 0 && forced) {
      motifs.push(forced);
      continue;
    }
    const random = makeRandom(seedFrom(`${body}:motif:${i}`));
    const free = pool.filter((m) => !motifs.includes(m));
    motifs.push(pick(random, free.length > 0 ? free : pool));
  }

  /* The instrument, with no plate around it. Everything below this line is the
     apparatus, and `compact` wants none of it. */
  if (compact) {
    return (
      <span className={cx(s.plate, s.bare, className)} role="presentation" aria-hidden="true">
        <Instrument motif={motifs[0]!} seed={`${body}:p0`} />
      </span>
    );
  }

  const hash = seedFrom(body);
  const trailing = /(\d+)\s*$/.exec(body)?.[1];
  const fig = String(figure ?? trailing ?? ((hash % 24) + 1)).padStart(2, '0');
  const plateCode = code ?? body.replace(/\//g, '-');

  /* ── the datum ────────────────────────────────────────────────────────────
     Where D-036's one line of colour sits, as percentages of the field.

     **Off the middle band, vertically.** A hairline across the centre cuts
     every instrument through the eye, and one that sits high or low reads as a
     measurement taken across them instead. The card's title watermark is parked
     dead centre as well (D-051), which is the second reason to stay out of
     there.

     **Not the full width, horizontally.** A line that runs edge to edge is a
     border the plate has grown; one that starts and stops somewhere particular
     has measured something. `span` is a little over a third to a little under
     three quarters, and `x` is anywhere it still fits. */
  const datumRandom = makeRandom(seedFrom(`${body}:datum`));
  const datum = datumRandom() > 0.5 ? between(datumRandom, 12, 28) : between(datumRandom, 72, 88);
  const datumSpan = between(datumRandom, 34, 72);
  const datumX = between(datumRandom, 0, 100 - datumSpan);

  /* Which side a lone instrument hangs off. See `.solo` in the stylesheet for
     why it is never the middle. */
  const soloRight = makeRandom(seedFrom(`${body}:solo`))() > 0.5;

  return (
    <span className={cx(s.plate, className)} role="presentation" aria-hidden="true">
      {/* The mount: one ruled rectangle inside the plate's edge, with a
          registration cross at each corner. Both are decoration in the strict
          sense — nothing reads them — so they are empty spans drawn entirely
          from their own borders and pseudo-elements. */}
      <span className={s.mount} />
      <span className={cx(s.mark, s.markTL)} />
      <span className={cx(s.mark, s.markTR)} />
      <span className={cx(s.mark, s.markBL)} />
      <span className={cx(s.mark, s.markBR)} />

      <span className={s.head}>
        <span className={s.headL}>{plateCode.toUpperCase()}</span>
        <span className={s.headC}>{series.toUpperCase()}</span>
        <span className={s.headR}>FIG.{fig}</span>
      </span>

      <span className={cx(s.field, count === 1 && s.solo, count === 1 && soloRight && s.soloRight)}>
        {motifs.map((m, i) => (
          <span key={`${m}-${i}`} className={s.panel}>
            <span className={s.panelNo}>{String(i + 1).padStart(2, '0')}</span>
            <span className={s.glyph}>
              <Instrument motif={m} seed={`${body}:p${i}`} />
            </span>
            <span className={s.panelName}>
              {LETTERS[i]}/{m.toUpperCase()}
            </span>
          </span>
        ))}

        {/* Between the panels, not around them: `count - 1` dividers, each on a
            seam. Dashed rather than solid, so it reads as a fold in the sheet
            and not as a fourth drawn line. */}
        {motifs.slice(1).map((_, i) => (
          <span
            key={`div-${i}`}
            className={s.divider}
            style={{ left: `${n(((i + 1) / count) * 100)}%` }}
          />
        ))}

        {/* D-036's one line of colour. The ticks at each end are what make it a
            datum and not a stray rule. */}
        <span
          className={s.datum}
          style={
            {
              top: `${n(datum)}%`,
              '--datum-x': `${n(datumX)}%`,
              '--datum-span': `${n(datumSpan)}%`,
            } as React.CSSProperties
          }
        />
      </span>

      <span className={s.foot}>
        <span className={s.spec}>
          {layout.toUpperCase()} · {motifs.map((m) => m.toUpperCase()).join(' · ')} ·{' '}
          {hash.toString(16).toUpperCase().padStart(8, '0')}
        </span>
        <span className={s.footR}>
          <Ticks seed={body} />
          {edition ? <span className={s.edition}>{edition}</span> : null}
        </span>
      </span>
    </span>
  );
}

/** The five instruments, behind one name so the field does not carry a switch. */
function Instrument({ motif, seed }: { motif: Motif; seed: string }) {
  return (
    <svg
      viewBox={`0 0 ${I} ${I}`}
      className={s.art}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      /* `meet`, not `slice`. A cropped instrument is a fault; a panel with air
         around it is the composition. */
      preserveAspectRatio="xMidYMid meet"
    >
      {motif === 'mosaic' ? <Mosaic seed={seed} /> : null}
      {motif === 'strata' ? <Strata seed={seed} /> : null}
      {motif === 'grid' ? <Grid seed={seed} /> : null}
      {motif === 'stack' ? <Stack seed={seed} /> : null}
      {motif === 'iris' ? <Iris seed={seed} /> : null}
      {motif === 'orbit' ? <Orbit seed={seed} /> : null}
      {motif === 'burst' ? <Burst seed={seed} /> : null}
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
function Mosaic({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:mosaic`));
  /* An instrument, not a field: the grid is coarse enough that a tile reads as
     a tile at the ~90px a panel gives it on a half card. */
  const cells = 9 + Math.floor(random() * 4);
  const cell = I / cells;
  const cx0 = between(random, 0.36, 0.64) * cells;
  const cy0 = between(random, 0.36, 0.64) * cells;
  const reach = between(random, 0.44, 0.62);
  const falloff = between(random, 1.4, 2.3);
  const tiles: React.ReactElement[] = [];

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const dx = (x - cx0) / cells;
      const dy = (y - cy0) / cells;
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
          x={n(x * cell)}
          y={n(y * cell)}
          width={n(cell - 1.1)}
          height={n(cell - 1.1)}
          className={level > 0.72 ? s.tileBright : level > 0.38 ? s.tileMid : s.tileDim}
        />,
      );
    }
  }
  return <g>{tiles}</g>;
}

/* ── grid ──────────────────────────────────────────────────────────────────
   The twelve-column reference the whole site is set on, drawn as the object it
   is. A ruled field, one heavier pair of axes crossing it, and a handful of
   cells filled — which is what a layout looks like before anything is in it.

   It is the most literal of the seven, and that is the point: on a work card
   this sits under a title and a spec drawer, and a plate that reads as "the
   grid this was laid out on" is the only one of the instruments that is
   actually about the thing the card is selling. */
function Grid({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:grid`));
  const divisions = 6 + Math.floor(random() * 4);
  const pad = 12;
  const span = I - pad * 2;
  const step = span / divisions;
  const items: React.ReactElement[] = [];

  /* The interior at the faintest weight and the boundary at the middle one: a
     field ruled edge to edge at one weight reads as graph paper, and the plate
     already has enough hairlines on it without a second sheet of them. */
  for (let i = 1; i < divisions; i += 1) {
    const at = pad + step * i;
    items.push(
      <line key={`v${i}`} x1={n(at)} y1={pad} x2={n(at)} y2={n(pad + span)} className={s.strokeDim} />,
    );
    items.push(
      <line key={`h${i}`} x1={pad} y1={n(at)} x2={n(pad + span)} y2={n(at)} className={s.strokeDim} />,
    );
  }
  items.push(
    <rect key="edge" x={pad} y={pad} width={n(span)} height={n(span)} className={s.strokeMid} />,
  );

  /* The axes: one column and one row promoted out of the field. Seeded, so the
     crossing is somewhere particular on each plate rather than in the middle of
     every one. */
  const ax = 1 + Math.floor(random() * (divisions - 1));
  const ay = 1 + Math.floor(random() * (divisions - 1));
  items.push(
    <line
      key="ax"
      x1={n(pad + step * ax)}
      y1={pad}
      x2={n(pad + step * ax)}
      y2={n(pad + span)}
      className={s.strokeBright}
    />,
  );
  items.push(
    <line
      key="ay"
      x1={pad}
      y1={n(pad + step * ay)}
      x2={n(pad + span)}
      y2={n(pad + step * ay)}
      className={s.strokeBright}
    />,
  );

  /* And two to four occupied cells, on the axes where possible — a grid with
     something placed on it, rather than graph paper. */
  const filled = 2 + Math.floor(random() * 3);
  for (let i = 0; i < filled; i += 1) {
    const cx0 = Math.floor(random() * divisions);
    const cy0 = random() > 0.5 ? ay - 1 : Math.floor(random() * divisions);
    items.push(
      <rect
        key={`c${i}`}
        x={n(pad + step * cx0 + 1)}
        y={n(pad + step * cy0 + 1)}
        width={n(step - 2)}
        height={n(step - 2)}
        className={i === 0 ? s.tileBright : s.tileMid}
      />,
    );
  }

  return <g>{items}</g>;
}

/* ── stack ─────────────────────────────────────────────────────────────────
   Sheets, seen from above and slightly out of register. Nested rectangles each
   stepped a little off the last, with the top one drawn heavy and a pair of
   leaders running out to the corner of the bottom one.

   The one instrument about the *process* rather than the product: everything
   this studio makes goes through a stack of these — a spec, a plate, a page —
   and a printer's misregistration is the visual joke the reference's `RISO
   PRINT` toggle is making as well. Rectilinear throughout, so it is in the work
   cards' family. */
function Stack({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:stack`));
  const sheets = 4 + Math.floor(random() * 4);
  const w = between(random, 40, 52);
  const h = w * between(random, 0.62, 0.86);
  /* One direction for the whole stack, so it reads as a pile pushed rather than
     as sheets scattered.

     **Signed magnitude, not a symmetric range.** `between(-5, 5)` puts about
     one plate in twenty-five near zero on both axes, and a stack with no offset
     is six coincident rectangles — one rectangle, and two leader lines of zero
     length. The direction is a coin and the distance has a floor, so every
     stack is a stack. */
  const dx = (random() > 0.5 ? 1 : -1) * between(random, 2.2, 5);
  const dy = (random() > 0.5 ? 1 : -1) * between(random, 2, 4.5);
  const items: React.ReactElement[] = [];

  for (let i = sheets - 1; i >= 0; i -= 1) {
    items.push(
      <rect
        key={i}
        x={n(I / 2 - w / 2 + dx * i)}
        y={n(I / 2 - h / 2 + dy * i)}
        width={n(w)}
        height={n(h)}
        className={i === 0 ? s.strokeBright : s.strokeDim}
      />,
    );
  }

  /* Two leaders from the top sheet's corner out to the bottom one's, which is
     what turns a set of rectangles into a measured offset. */
  const top = { x: I / 2 - w / 2, y: I / 2 - h / 2 };
  const base = { x: top.x + dx * (sheets - 1), y: top.y + dy * (sheets - 1) };
  items.push(
    <line key="l1" x1={n(top.x)} y1={n(top.y)} x2={n(base.x)} y2={n(base.y)} className={s.strokeDash} />,
  );
  items.push(
    <line
      key="l2"
      x1={n(top.x + w)}
      y1={n(top.y + h)}
      x2={n(base.x + w)}
      y2={n(base.y + h)}
      className={s.strokeDash}
    />,
  );

  return <g>{items}</g>;
}

/* ── iris ──────────────────────────────────────────────────────────────────
   The mark, exploded. Concentric tilted ellipses with the six blades pushed out
   past them, and a dashed aperture ring at the centre — the same construction
   as `<ApertureMark>`, drawn as a diagram of the thing rather than as the logo
   again. It is the one instrument that is literally the brand, which is why a
   `motif/` prefix most often names this one. */
function Iris({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:iris`));
  const c = I / 2;
  const rings = 3 + Math.floor(random() * 3);
  const outer = between(random, 30, 38);
  const squash = 0.7247;

  const items: React.ReactElement[] = [];
  for (let i = 0; i < rings; i += 1) {
    const r = outer * (1 - i / (rings + 1));
    items.push(
      <ellipse
        key={`r${i}`}
        cx={c}
        cy={c}
        rx={n(r)}
        ry={n(r * squash)}
        transform={`rotate(${TILT} ${c} ${c})`}
        className={i === 0 ? s.strokeBright : s.strokeDim}
      />,
    );
  }

  /* Six blades, on the stations the mark uses, each a chord across the field. */
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + random() * 0.12;
    const inner = outer * between(random, 0.24, 0.46);
    const reach = outer * between(random, 1.08, 1.42);
    const t = (TILT * Math.PI) / 180;
    const project = (r: number) => {
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * squash;
      return [
        c + px * Math.cos(t) - py * Math.sin(t),
        c + px * Math.sin(t) + py * Math.cos(t),
      ] as const;
    };
    const [x1, y1] = project(inner);
    const [x2, y2] = project(reach);
    items.push(
      <line key={`b${i}`} x1={n(x1)} y1={n(y1)} x2={n(x2)} y2={n(y2)} className={s.strokeMid} />,
    );
  }

  items.push(<circle key="ap" cx={c} cy={c} r={n(outer * 0.3)} className={s.strokeDash} />);

  return <g>{items}</g>;
}

/* ── strata ────────────────────────────────────────────────────────────────
   `<Schematic>`'s language at instrument scale: a field of straight hairlines
   whose lengths fall away, stacked. The one motif that is pure rule-work, and
   the quietest of the five. */
function Strata({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:strata`));
  const count = 13 + Math.floor(random() * 8);
  const top = 14;
  const gap = (I - top * 2) / (count - 1);
  const left = between(random, 12, 22);
  const bias = between(random, 0.28, 0.72);
  const lines: React.ReactElement[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    /* A soft peak at `bias`, so the field has a waist rather than a ramp. */
    const shape = 1 - Math.abs(t - bias) * between(random, 1.1, 1.8);
    const width = Math.max(0.08, shape) * (I - left - 14);
    const y = top + gap * i;
    lines.push(
      <line
        key={i}
        x1={n(left)}
        y1={n(y)}
        x2={n(left + width)}
        y2={n(y)}
        className={i % 6 === 0 ? s.strokeBright : s.strokeDim}
      />,
    );
  }
  return <g>{lines}</g>;
}

/* ── orbit ─────────────────────────────────────────────────────────────────
   Arcs at the brand's tilt, crossing. Built from the ellipse again, but cut
   into segments so it reads as a path rather than a ring — the closest of the
   five to the 3D object as it turns. */
function Orbit({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:orbit`));
  const c = I / 2;
  const count = 4 + Math.floor(random() * 3);
  const arcs: React.ReactElement[] = [];

  for (let i = 0; i < count; i += 1) {
    const r = between(random, 16, 44);
    const ry = r * 0.7247;
    const start = random() * Math.PI * 2;
    const sweep = between(random, 1.1, 2.8);
    const p = (a: number) => `${n(c + Math.cos(a) * r)} ${n(c + Math.sin(a) * ry)}`;
    const large = sweep > Math.PI ? 1 : 0;
    arcs.push(
      <path
        key={i}
        d={`M ${p(start)} A ${n(r)} ${n(ry)} 0 ${large} 1 ${p(start + sweep)}`}
        transform={`rotate(${TILT} ${c} ${c})`}
        className={i === 0 ? s.strokeBright : s.strokeMid}
      />,
    );
  }
  return <g>{arcs}</g>;
}

/* ── burst ─────────────────────────────────────────────────────────────────
   The one instrument the reference contributed rather than the site: a ring of
   radial ticks at varying length, which is what a lens flare, a compass rose
   and a spectrum plot all look like from far enough away.

   It earns its place because the other four are all rectilinear or elliptical
   at one tilt — without a mark that has true radial symmetry, every field read
   as a variation on the same diagram. */
function Burst({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:burst`));
  const c = I / 2;
  const spokes = 28 + Math.floor(random() * 18);
  const inner = between(random, 17, 23);
  const outer = between(random, 34, 45);
  const swell = between(random, 1, 3);
  const items: React.ReactElement[] = [];

  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    /* Length modulated on a slow wave rather than at random, so the ring has a
       long side and a short one instead of a ragged edge. */
    const reach = inner + (outer - inner) * (0.55 + 0.45 * Math.sin(a * swell));
    items.push(
      <line
        key={i}
        x1={n(c + Math.cos(a) * inner)}
        y1={n(c + Math.sin(a) * inner)}
        x2={n(c + Math.cos(a) * reach)}
        y2={n(c + Math.sin(a) * reach)}
        className={i % 7 === 0 ? s.strokeBright : s.strokeMid}
      />,
    );
  }

  items.push(<circle key="ring" cx={c} cy={c} r={n(inner - 3)} className={s.strokeDash} />);
  return <g>{items}</g>;
}

/* ── the tick strip ────────────────────────────────────────────────────────
   The reference's barcode, and the one piece of it that is pure texture. Kept
   because a rail with type at one end and nothing at the other reads as an
   unfinished row, and because a measured strip is the cheapest way to say
   "printed" without adding another word to a plate that already has enough.

   One `<svg>` rather than twenty spans: the works grid draws twelve of these,
   and the DOM cost of the apparatus is the only thing this design spends that
   the field it replaced did not. */
function Ticks({ seed }: { seed: string }) {
  const random = makeRandom(seedFrom(`${seed}:ticks`));
  const bars: React.ReactElement[] = [];
  let x = 0;
  let i = 0;
  while (x < 116) {
    const w = pick(random, [1, 1, 1.5, 2.5, 3.5]);
    bars.push(<rect key={i} x={n(x)} y={0} width={n(w)} height={16} className={s.tick} />);
    x += w + pick(random, [1.5, 2, 2, 3]);
    i += 1;
  }
  return (
    <svg
      viewBox="0 0 120 16"
      className={s.ticks}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMid meet"
    >
      {bars}
    </svg>
  );
}
