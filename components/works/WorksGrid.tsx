'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { useSiblingDim } from '@/lib/motion/useSiblingDim';
import type { Work } from '@/content/works/_types';
import { WORKS_LAYOUT, placementFor } from '@/lib/content/works';
import { WorkCard } from './WorkCard';
import s from './WorksGrid.module.css';

/**
 * The works grid. `20-components-and-motion.md` §5, `30-page-specs.md` §2.
 *
 * ── The structure is theirs, and it is not what §5 describes ───────────────
 *
 * §5 says "two independent columns, each an ordinary block flow." Their DOM is
 * a single twelve-column CSS grid — `repeat(12, 90.8125px)` on a 20.5625px gap
 * at 1512 — with every cell carrying an explicit `grid-column` and `grid-row`:
 * `8 / 13`, `7 / 13`, `1 / 7`, `1 / 6`, `1 / 9`, `9 / 13`. Two block columns
 * cannot produce that; an eight-column card at `1 / 9` crosses the middle of
 * the grid. The placement map lives in `lib/content/works.ts`. See I-036.
 *
 * The *motion* half of §5 is correct and the measurement confirms it. At one
 * scroll position their row-1 pair both sat at `translateY(-41.29)` while their
 * row-3 pair sat at `-18.42` and `-23.03` — a ratio of 0.80, which is exactly
 * §5's −8% against −10%.
 *
 * ── The parallax is per cell, not per column ──────────────────────────────
 *
 * Which follows from the above: with no columns to attach a rate to, the rate
 * belongs to the cell. Each wrapper gets its own scrubbed tween across its own
 * range, so a card's drift depends on where *it* is on the screen rather than
 * on where the column it belongs to starts. tonik do the same — their rate is
 * carried by an `is-N` class on each cell wrapper.
 *
 * `yPercent` rather than `y: '-8%'`: identical in effect, and GSAP resolves the
 * percentage against the element's own height either way. `yPercent` says so.
 */
export function WorksGrid({ works }: { works: Work[] }) {
  const root = useRef<HTMLDivElement>(null);

  /* §21.1's shared primitive, and the one place the grid's dim lives.
     "Hovering one card dims all eleven others to exactly 0.3" is phase 4's
     headline acceptance criterion, and it belongs here rather than twelve times
     over inside the cards — see the note in `WorkCard`, and I-039. */
  useSiblingDim(root, { selector: '[data-work-card]' });

  useGSAP(
    () => {
      const grid = root.current;
      if (!grid) return;

      const mm = gsap.matchMedia();

      /* §5: desktop only. Below 992 the grid is one column and a drifting card
         would simply overlap the one under it. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        const cells = [...grid.querySelectorAll<HTMLElement>('[data-parallax]')];
        const tweens = cells.map((cell) => {
          const rate = Number(cell.dataset.parallax ?? 0);
          if (rate === 0) return null;
          return gsap.to(cell, {
            yPercent: rate,
            ease: 'none',
            scrollTrigger: {
              trigger: cell,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });
        });
        return () => tweens.forEach((t) => t?.scrollTrigger?.kill());
      });

      return () => {
        mm.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope: root, dependencies: [works.length] },
  );

  return (
    <div ref={root} className={s.grid} data-works-grid>
      {works.map((work) => {
        const place = placementFor(work.slug);
        return (
          <div
            key={work.slug}
            className={s.cell}
            data-parallax={place?.parallax ?? 0}
            style={
              place
                ? ({
                    '--cell-column': place.column,
                    '--cell-row': String(place.row),
                  } as React.CSSProperties)
                : undefined
            }
          >
            <WorkCard work={work} />
          </div>
        );
      })}
    </div>
  );
}

/** Every slug the layout map places, for the check that they agree. */
export const PLACED_SLUGS = WORKS_LAYOUT.map((p) => p.slug);
