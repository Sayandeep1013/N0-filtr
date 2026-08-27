import { makeRandom, seedFrom } from '@/lib/art/seed';
import { PIT_ACCENTS, PIT_BODIES, PIT_LABELS } from '@/lib/content/pit';

/**
 * The pit's cast: what each tile is, before any physics exists.
 *
 * Split out of `<BlockPit>` so that the **shape of the pile** can be decided on
 * the server and rendered as ordinary HTML, and Matter only has to attach
 * bodies to elements that are already there. That is what lets the
 * reduced-motion path be a real, laid-out pile rather than an empty box — see
 * `70-physics-footer.md` §9, which is emphatic that under the preference the pit
 * *"does not degrade — it is absent, replaced by a static pile that still says
 * the same thing."*
 *
 * Deterministic, seeded from a constant, for the same reason `<Artwork>` is: a
 * server-rendered arrangement that differs in the browser is a hydration error.
 * See I-052.
 */

export type TileShape = 'square' | 'pill';
export type TileTone = 'grey800' | 'grey900' | 'white' | 'accent';

export interface Tile {
  id: string;
  shape: TileShape;
  tone: TileTone;
  /** Never empty. Every tile carries a real tool name — D-049. */
  label: string;
  w: number;
  h: number;
  /** Set only when `tone` is `accent`. */
  accent?: string;
  /** Where it spawns, as a fraction of the pit's width. */
  x: number;
  /**
   * The static pile's place, for the reduced-motion path: a row counted **up
   * from the floor**, and a fraction of the width within it.
   *
   * Separate from `x` because the two answer different questions. `x` is where a
   * body drops from, and the physics decides where it ends up; these are where a
   * tile sits when there is no physics, and they have to compose on their own —
   * evenly spread within a row rather than randomly placed, or the pile is a
   * heap in one corner.
   */
  row: number;
  rowX: number;
  /** Radians. */
  angle: number;
}

/**
 * §2 gives three square sizes — 64 / 88 / 112 — and a 15% share of unlabelled
 * discs.
 *
 * Both changed on review. Sayandeep: *"make the boxes n all smaller and fill
 * each one of them with proper tech names."*
 *
 * **Smaller**, because the pit now sits over the footer rather than in a 60vh
 * section of its own, and 112px blocks over a 14vw wordmark is a wall rather
 * than a pile. **No discs**, because a disc cannot carry a label legibly at this
 * size and the whole point of the change is that every tile says something.
 *
 * The shape mix is therefore squares and pills, and the pills exist for the long
 * names — `DURABLE OBJECTS`, `FRAMER MOTION` — that a square cannot hold. See
 * D-049.
 */
const SQUARE_SIZES = [48, 60, 74];

/**
 * The shape mix: roughly five squares to three pills.
 *
 * Taken in order from a shuffled deck rather than rolled per tile, so the counts
 * come out at the intended proportions instead of near them. Forty-four rolls of
 * a weighted die is a small enough sample to land visibly wrong.
 */
function shapeDeck(count: number, random: () => number): TileShape[] {
  const squares = Math.round(count * 0.62);
  const deck: TileShape[] = [
    ...Array<TileShape>(squares).fill('square'),
    ...Array<TileShape>(count - squares).fill('pill'),
  ];
  /* Fisher–Yates, so the labelled tiles are not all one shape. */
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

/**
 * §2's tone mix: mostly `--grey-800`, some `--grey-900`, about four white tiles
 * with dark text, and about three carrying a work's accent.
 */
function toneFor(index: number, count: number, random: () => number): TileTone {
  const whites = Math.max(2, Math.round(count * 0.09));
  const accents = Math.max(2, Math.round(count * 0.07));
  if (index < accents) return 'accent';
  if (index < accents + whites) return 'white';
  return random() > 0.7 ? 'grey900' : 'grey800';
}

export function buildTiles(mobile: boolean): Tile[] {
  const count = mobile ? PIT_BODIES.mobile : PIT_BODIES.desktop;
  const random = makeRandom(seedFrom(mobile ? 'pit-mobile' : 'pit-desktop'));
  const shapes = shapeDeck(count, random);

  /* One label per tile, in order — the hero's stack first, then the wider set.
     On mobile there are fewer tiles than labels, so it takes the first `count`,
     which is the stack's own order and puts the front-end names first. */
  const labels = [...PIT_LABELS];

  /* Never more tiles than labels: a blank block is the thing this change
     removes, so the pile shortens rather than padding itself. */
  const total = Math.min(count, labels.length);

  const tiles: Tile[] = [];
  for (let i = 0; i < total; i += 1) {
    const shape = shapes[i] ?? 'square';
    const label = labels.shift() ?? '';
    const tone = toneFor(i, count, random);

    const scale = mobile ? 0.78 : 1;
    let w: number;
    let h: number;
    if (shape === 'pill') {
      /* Wide enough for `CLOUDFLARE WORKERS` and `DURABLE OBJECTS`, which is why
         the longest labels are steered here — see the swap at the end. */
      w = Math.round((112 + random() * 46) * scale);
      h = Math.round(42 * scale);
    } else {
      const size = Math.round(SQUARE_SIZES[Math.floor(random() * SQUARE_SIZES.length)]! * scale);
      w = size;
      h = size;
    }

    tiles.push({
      id: `pit-${i}`,
      shape,
      tone,
      label,
      w,
      h,
      accent: tone === 'accent' ? PIT_ACCENTS[i % PIT_ACCENTS.length] : undefined,
      /* Spread across the width, avoiding the very edges so nothing spawns
         inside a wall. */
      x: 0.08 + random() * 0.84,
      /* Filled in below, once the row widths are known. */
      row: 0,
      rowX: 0,
      angle: (random() - 0.5) * 0.8,
    });
  }

  /* ── the static pile ──────────────────────────────────────────────────────
     Four rows counted up from the floor, each evenly spread across the width
     with a little jitter so it reads as a settled heap rather than as a grid.
     Bigger tiles go to the bottom row, which is what a real pile does and what
     stops the tall ones balancing on the small ones. */
  const rows = 4;
  const perRow = Math.ceil(tiles.length / rows);
  const bySize = [...tiles].sort((a, b) => b.w * b.h - a.w * a.h);
  bySize.forEach((tile, index) => {
    const row = Math.floor(index / perRow);
    const withinRow = index % perRow;
    tile.row = row;
    tile.rowX = (withinRow + 0.5) / perRow + (random() - 0.5) * 0.04;
  });

  /* A label that does not fit its tile is worse than an unlabelled one, so the
     longest names go to the widest pills. Resolved here rather than left to
     chance, because `DURABLE OBJECTS` on a 48px square is unreadable and there
     is no runtime measurement to catch it. */
  const pills = tiles.filter((t) => t.shape === 'pill' && t.label);
  const squares = tiles.filter((t) => t.shape === 'square');

  /* First: any long name that landed on a square trades with the shortest name
     sitting on a pill. */
  const LONG = 9;
  squares
    .filter((t) => t.label.length > LONG)
    .forEach((square) => {
      const shortestPill = pills
        .filter((p) => p.label.length <= LONG)
        .sort((a, b) => a.label.length - b.label.length)[0];
      if (!shortestPill) return;
      const label = square.label;
      square.label = shortestPill.label;
      shortestPill.label = label;
    });

  /* Then: among the pills, longest label to widest tile. */
  const byLength = [...pills].sort((a, b) => b.label.length - a.label.length);
  const byWidth = [...pills].sort((a, b) => b.w - a.w);
  const relabelled = byLength.map((t) => t.label);
  byWidth.forEach((tile, i) => {
    tile.label = relabelled[i]!;
  });

  return tiles;
}
