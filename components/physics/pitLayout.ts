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

export type TileShape = 'square' | 'pill' | 'disc';
export type TileTone = 'grey800' | 'grey900' | 'white' | 'accent';

export interface Tile {
  id: string;
  shape: TileShape;
  tone: TileTone;
  /** Empty for a disc — §2's shape mix has them unlabelled. */
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

/** §2: three sizes only, "on the same modular feel as the type scale". */
const SQUARE_SIZES = [64, 88, 112];
const DISC_SIZES = [56, 66, 76];

/**
 * §2's shape mix: square 60%, wide pill 25%, disc 15%.
 *
 * Taken in order from a shuffled deck rather than rolled per tile, so the counts
 * come out at the specified proportions instead of near them. Forty-four rolls
 * of a weighted die is a small enough sample to land visibly wrong.
 */
function shapeDeck(count: number, random: () => number): TileShape[] {
  const squares = Math.round(count * 0.6);
  const pills = Math.round(count * 0.25);
  const deck: TileShape[] = [
    ...Array<TileShape>(squares).fill('square'),
    ...Array<TileShape>(pills).fill('pill'),
    ...Array<TileShape>(count - squares - pills).fill('disc'),
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

  /* Labels first, so every wordmark gets a tile before the filler starts. §10:
     twenty-two wordmarks plus filler to reach the body count. On mobile there
     are fewer bodies than labels, so it takes the first `count` of them — the
     stack's own order, which puts the front-end names first. */
  const labels = [...PIT_LABELS];

  const tiles: Tile[] = [];
  for (let i = 0; i < count; i += 1) {
    /* A disc is never labelled (§2), so it does not consume a wordmark. */
    const shape = shapes[i] ?? 'square';
    const label = shape === 'disc' ? '' : (labels.shift() ?? '');
    const tone = toneFor(i, count, random);

    const scale = mobile ? 0.72 : 1;
    let w: number;
    let h: number;
    if (shape === 'pill') {
      /* §2: 140–190 × 56. Wide enough for `CLOUDFLARE WORKERS`, which is why
         the longest labels are steered here. */
      w = Math.round((140 + random() * 50) * scale);
      h = Math.round(56 * scale);
    } else if (shape === 'disc') {
      const size = Math.round(DISC_SIZES[Math.floor(random() * DISC_SIZES.length)]! * scale);
      w = size;
      h = size;
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

  /* A pill whose label does not fit is worse than a square one. Longest labels
     to the widest tiles, resolved here rather than left to chance. */
  const pills = tiles.filter((t) => t.shape === 'pill' && t.label);
  const byLength = [...pills].sort((a, b) => b.label.length - a.label.length);
  const byWidth = [...pills].sort((a, b) => b.w - a.w);
  byLength.forEach((tile, i) => {
    const target = byWidth[i]!;
    const label = tile.label;
    tile.label = target.label;
    target.label = label;
  });

  return tiles;
}
