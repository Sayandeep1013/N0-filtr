'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import type { Media } from '@/content/works/_types';
import { posterSrcSet } from '@/lib/media';
import { Artwork } from '@/components/art/Artwork';
import { Plate } from '@/components/ui/Plate';
import s from './CaseBoard.module.css';

/**
 * `<CaseBoard />` — the case study's one way of showing pictures. D-035.
 *
 * Replaces `visual-full`, `visual-2up` and `visual-bleed`, which were three
 * names for the same instruction at three widths. Sayandeep, on the first
 * build: *"instead of using one image .. use multiple images on a board type
 * one with animations."*
 *
 * ── The author supplies pictures, not a layout ───────────────────────────
 *
 * That is the whole design. Twelve case studies get written by hand over phase
 * 10, and a block that accepts a layout is a block that produces twelve
 * different-looking pages. So the arrangement is chosen by **count**: two, three,
 * four or five images each have one composition, and the author's only decision
 * is which pictures and in what order.
 *
 * The compositions are authored the same way the works grid is
 * (`lib/content/works.ts`, `WORKS_LAYOUT`) — explicit `grid-column` and
 * `grid-row` on a twelve-column grid with a fixed row unit. Auto-placement was
 * tried first and cannot make this shape: a board's whole character is tiles
 * that overlap each other's rows, and auto-placement will not overlap.
 *
 * ── Two animations, and they are different things ────────────────────────
 *
 * **The reveal** runs once, when the board enters: each tile rises 48px and
 * fades up, staggered by 90ms. **The parallax** runs continuously, scrubbed,
 * each tile drifting at its own rate — the same −6 / −10 / −14 spread the works
 * grid uses (§5), which is what stops a board of four pictures reading as one
 * flat slab sliding past.
 *
 * Both are gated at `>991px` through `gsap.matchMedia` (CLAUDE.md
 * non-negotiable 6) and both are off under `prefers-reduced-motion`, where the
 * tiles are simply present.
 *
 * ── One trigger for the reveal, one for the parallax ─────────────────────
 *
 * Not one per tile. Phase 5 replaced eleven triggers with one in the works grid
 * after `curTrigger is undefined` turned up twice under Fast Refresh, and the
 * lesson generalises: a component that creates a trigger per child creates a
 * list for React to shrink underneath ScrollTrigger's own walk of it.
 */

interface Tile {
  /** `grid-column`, on the twelve-column board. */
  col: string;
  /** `grid-row`, in units of `--board-row`. */
  row: string;
  /** Scrubbed drift, in percent of the tile's own height. §5's spread. */
  rate: number;
}

/**
 * One composition per count. Every arrangement overlaps rows deliberately —
 * a board whose tiles line up is a grid, and the grid is a different component.
 */
const ARRANGEMENTS: Record<number, Tile[]> = {
  2: [
    { col: '1 / 8', row: '1 / 6', rate: -6 },
    { col: '8 / 13', row: '3 / 8', rate: -13 },
  ],
  3: [
    { col: '1 / 8', row: '1 / 6', rate: -6 },
    { col: '8 / 13', row: '3 / 7', rate: -13 },
    { col: '2 / 9', row: '7 / 11', rate: -9 },
  ],
  4: [
    { col: '1 / 7', row: '1 / 6', rate: -6 },
    { col: '7 / 13', row: '2 / 7', rate: -12 },
    { col: '2 / 8', row: '8 / 12', rate: -9 },
    { col: '8 / 13', row: '9 / 14', rate: -14 },
  ],
  5: [
    { col: '1 / 7', row: '1 / 7', rate: -6 },
    { col: '7 / 13', row: '2 / 6', rate: -12 },
    { col: '7 / 12', row: '6 / 10', rate: -14 },
    { col: '1 / 6', row: '8 / 12', rate: -8 },
    { col: '3 / 11', row: '12 / 17', rate: -10 },
  ],
};

/** Beyond five, the four-up composition repeats. Nothing authored needs it. */
function arrange(count: number): Tile[] {
  if (ARRANGEMENTS[count]) return ARRANGEMENTS[count]!;
  const base = ARRANGEMENTS[4]!;
  return Array.from({ length: count }, (_, i) => base[i % base.length]!);
}

export function CaseBoard({ items, caption }: { items: Media[]; caption?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();
  const tiles = arrange(items.length);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion) return;

      const figures = gsap.utils.toArray<HTMLElement>('[data-board-tile]', el);
      if (figures.length === 0) return;

      const mm = gsap.matchMedia();

      /* The reveal runs at every width — it is an arrival, not a hover — and
         only the parallax is gated. Below 992 the tiles stack, and a stacked
         column drifting at four different rates reads as a rendering fault. */
      gsap.from(figures, {
        y: 48,
        opacity: 0,
        duration: DUR.slower,
        ease: EASE.out,
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });

      mm.add(MQ.desktop, () => {
        const setters = figures.map((figure) => gsap.quickSetter(figure, 'yPercent'));
        const rates = figures.map((_, i) => tiles[i]?.rate ?? -8);

        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            /* One trigger drives every tile. `progress` is 0 as the board's top
               reaches the bottom of the screen and 1 as its bottom leaves the
               top, so each tile's drift is that progress against its own rate. */
            for (let i = 0; i < setters.length; i += 1) {
              setters[i]!(rates[i]! * self.progress);
            }
          },
        });

      });

      /* No cleanup returned, and that is the fix rather than an omission.

         `useGSAP` reverts its own context on unmount, and a `gsap.matchMedia()`
         created inside that context is reverted **with** it — which runs every
         `mm.add()` cleanup exactly once. An explicit `mm.revert()` here made
         that happen twice, and a second `ScrollTrigger.kill()` on an instance
         already removed from `_triggers` splices the array a second time.

         That array is what `ScrollTrigger.create()` walks. A hole in it is
         `can't access property "end", curTrigger is undefined` — thrown from
         whichever component happened to be constructing a trigger at that
         moment, which is why it kept surfacing in `WorksGrid` and never in the
         component that actually caused it. See I-051. */
    },
    { scope: root, dependencies: [reducedMotion, items.length] },
  );

  return (
    <figure className={s.board}>
      <Plate size="lg" bleed className={s.plate}>
        <div ref={root} className={s.grid} data-board={items.length}>
          {items.map((item, i) => {
            const tile = tiles[i]!;
            return (
              <figure
                /* `art ?? src`: a generated plate has no `src`, and keying
                   three tiles on `undefined` is three tiles with the same key. */
                key={item.art ?? item.src ?? i}
                className={s.tile}
                data-board-tile
                style={{ gridColumn: tile.col, gridRow: tile.row }}
              >
                <span className={s.frame} data-cursor="View">
                  {item.art ? (
                    /* Drawn, not fetched — and already grey and white by
                       construction, so no grade and no srcSet. D-038. */
                    <Artwork seed={item.art} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.src}
                      srcSet={posterSrcSet(item.src!)}
                      sizes="(max-width: 991px) 100vw, 50vw"
                      alt={item.alt ?? ''}
                      className={s.img}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
                {item.caption ? (
                  <figcaption data-t="label" className={s.tileCaption}>
                    {item.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </Plate>
      {caption ? (
        <figcaption data-t="label" className={s.caption}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
