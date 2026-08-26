import type { Work } from '@/content/works/_types';
import { tessera } from '@/content/works/tessera';
import { coCanvas } from '@/content/works/co-canvas';
import { discvault } from '@/content/works/discvault';
import { reinBot } from '@/content/works/rein-bot';
import { martini } from '@/content/works/martini';
import { valobot } from '@/content/works/valobot';
import { termtypo } from '@/content/works/termtypo';
import { reelshell } from '@/content/works/reelshell';
import { solidus } from '@/content/works/solidus';
import { ftc } from '@/content/works/ftc';
import { notetakerxx } from '@/content/works/notetakerxx';
import { droiddoodle } from '@/content/works/droiddoodle';

/**
 * The twelve works, in `order`. `40-content-model.md` §2.
 *
 * One module per work in `content/works/`; this file is the only place they are
 * assembled, so a route never imports twelve things to render a grid.
 */
export const WORKS: Work[] = [
  tessera,
  coCanvas,
  discvault,
  reinBot,
  martini,
  valobot,
  termtypo,
  reelshell,
  solidus,
  ftc,
  notetakerxx,
  droiddoodle,
].sort((a, b) => a.order - b.order);

export function workBySlug(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}

/** Every distinct industry, for phase 7's filter facet. */
export const INDUSTRIES: string[] = [...new Set(WORKS.flatMap((w) => w.industries))].sort();

/**
 * Where each card sits in the twelve-column grid, and how fast it drifts.
 *
 * ── This is authored, and it has to be ─────────────────────────────────────
 *
 * `20-components-and-motion.md` §5 describes the grid as "two independent
 * columns, each an ordinary block flow". **Their DOM is not that.** Read off
 * their live page: `home-projects_grid` is `repeat(12, 90.8125px)` on a
 * 20.5625px gap — a real twelve-column CSS grid — and every cell carries an
 * explicit `grid-column` and `grid-row`:
 *
 *     8 / 13   7 / 13   1 / 7   1 / 6   1 / 9   9 / 13
 *
 * Two block columns cannot produce that. An eight-column card at `1 / 9`
 * crosses the middle of the grid, and their DOM order is right-card-first in
 * two of the rows — so placement is authored, not flow. See I-036.
 *
 * The *motion* half of §5 is right, and the measurement confirms it: at one
 * scroll position their row-1 pair both sat at `translateY(-41.29)` and their
 * row-3 pair at `-18.42` and `-23.03`. That second pair is a ratio of 0.80,
 * which is exactly the −8% / −10% §5 gives.
 *
 * ── The composition ────────────────────────────────────────────────────────
 *
 * §2 of `30-page-specs.md`: "Card order interleaves the two columns so the
 * visual weight alternates." Eight rows, and the rhythm is
 * **full · pair · wide-left · pair · wide-right · pair · wide-left · pair** —
 * so no two heavy cells ever land next to each other and the eye is handed
 * from one side to the other on the way down.
 *
 * Widths are §5's: half is 6/12, wide is 8/12, full is 12/12. Rows never quite
 * fill: a pair is 6 + 5 or 5 + 6, never 6 + 6. That column of air is deliberate
 * and it is theirs — every one of their rows leaves one.
 *
 * DOM order stays content order (1…12) for reading and for screen readers;
 * grid placement is what moves. Rows 2, 4, 6 and 8 pair two halves, and the
 * three `wide` cards each take a row alone, alternating which edge they hang
 * from.
 */
export interface CardPlacement {
  slug: string;
  /** CSS `grid-column`, on the twelve-unit track. */
  column: string;
  /** CSS `grid-row`. */
  row: number;
  /**
   * Parallax travel, as §5's percentage of the card's own height. Column A is
   * −8, column B is −10, and a promoted `wide` cell keeps the −12 §5 retains
   * from tonik's testimonial cells so the grid rhythm survives.
   *
   * The `full` opener is 0: it spans the whole measure, so moving it would open
   * a gap at the top or bottom of the section with nothing behind it.
   */
  parallax: number;
}

export const WORKS_LAYOUT: CardPlacement[] = [
  { slug: 'tessera', column: '1 / 13', row: 1, parallax: 0 },

  { slug: 'co-canvas', column: '1 / 7', row: 2, parallax: -8 },
  { slug: 'rein-bot', column: '8 / 13', row: 2, parallax: -10 },

  { slug: 'discvault', column: '1 / 9', row: 3, parallax: -12 },

  { slug: 'valobot', column: '1 / 6', row: 4, parallax: -8 },
  { slug: 'termtypo', column: '7 / 13', row: 4, parallax: -10 },

  { slug: 'martini', column: '5 / 13', row: 5, parallax: -12 },

  { slug: 'reelshell', column: '1 / 7', row: 6, parallax: -8 },
  { slug: 'solidus', column: '8 / 13', row: 6, parallax: -10 },

  { slug: 'notetakerxx', column: '1 / 9', row: 7, parallax: -12 },

  { slug: 'ftc', column: '1 / 6', row: 8, parallax: -8 },
  { slug: 'droiddoodle', column: '7 / 13', row: 8, parallax: -10 },
];

export function placementFor(slug: string): CardPlacement | undefined {
  return WORKS_LAYOUT.find((p) => p.slug === slug);
}
