'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
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

  /* ── the sibling-dim is OFF, and that is a decision ─────────────────────
     §5 calls dimming the other eleven cards to .3 "the single most striking
     interaction on the site", and phase 4 built it, hoisted it to this
     component per §21.1, and asserted it. Sayandeep, on the running build:
     *"when I hover over one card the rest also gets dimmed — fix that too."*

     He is right, and the reason is a change we made earlier the same day. The
     dim was legible when the hovered card turned WHITE: one card lit, eleven
     receded, and the contrast pointed at the one you were on. Now the hovered
     card's panel is dark too (D-024), so hovering anything makes the entire
     grid darker and nothing brighter — the page reads as dimming rather than
     as focusing. The interaction did not stop working; what it was contrasting
     against went away.

     One line brings it back, and `useSiblingDim` still exists and is still used
     by the footer, so nothing is stranded. See D-027.

         useSiblingDim(root, { selector: '[data-work-card]' });
  */

  useGSAP(
    () => {
      const grid = root.current;
      if (!grid) return;

      const mm = gsap.matchMedia();

      /* §5: desktop only. Below 992 the grid is one column and a drifting card
         would simply overlap the one under it. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        const cells = [...grid.querySelectorAll<HTMLElement>('[data-parallax]')]
          .map((el) => ({ el, rate: Number(el.dataset.parallax ?? 0) }))
          .filter(({ rate }) => rate !== 0);
        if (cells.length === 0) return;

        /* ── one trigger, not eleven ──────────────────────────────────────
           The first build gave every cell its own scrubbed tween, which is the
           obvious reading of §5 and was wrong twice over.

           **It crashed.** Constructing a ScrollTrigger makes it walk the global
           trigger list and read `.end` off every earlier entry
           (ScrollTrigger.js:1366). If that array shrinks mid-walk — a sibling
           context reverting, which is exactly what React Fast Refresh does —
           the walk falls into an `undefined` hole:

               can't access property "end", curTrigger is undefined

           Eleven constructions per mount is eleven chances to land in that
           window. One is one. Reproduced deliberately by editing a file with
           the grid on screen; see I-044.

           **And it was slower.** Eleven scrubbed tweens is eleven independent
           smoothing loops fighting over the same scroll value. One trigger with
           cached metrics and `quickSetter` writes the same eleven transforms
           per frame with no per-frame layout reads at all.

           The visual result is identical: each cell still drifts by its own
           percentage across its own passage through the viewport, because the
           progress is computed per cell from its cached top rather than shared
           from the trigger. */
        const setters = cells.map(({ el, rate }) => ({
          rate,
          el,
          set: gsap.quickSetter(el, 'yPercent', '%') as (value: number) => void,
          top: 0,
          height: 0,
        }));

        /* Measured on refresh, never during a scroll. A `getBoundingClientRect`
           inside `onUpdate` is a forced synchronous layout on every frame, and
           eleven of them is the difference between 60fps and not. */
        const measure = () => {
          for (const m of setters) {
            const box = m.el.getBoundingClientRect();
            m.top = box.top + window.scrollY;
            m.height = box.height;
          }
        };

        const apply = () => {
          const scroll = window.scrollY;
          const viewport = window.innerHeight;
          for (const m of setters) {
            /* 0 as the cell's top edge enters the bottom of the viewport, 1 as
               its bottom edge leaves the top — its own passage, not the grid's. */
            const span = viewport + m.height;
            const progress = span > 0 ? (scroll + viewport - m.top) / span : 0;
            m.set(m.rate * Math.min(1, Math.max(0, progress)));
          }
        };

        const st = ScrollTrigger.create({
          trigger: grid,
          start: 'top bottom',
          end: 'bottom top',
          onRefresh: () => {
            measure();
            apply();
          },
          onUpdate: apply,
        });

        return () => {
          st.kill();
          /* Hand the transforms back. `quickSetter` writes straight to the
             element and leaves nothing for the context to revert. */
          gsap.set(
            setters.map((m) => m.el),
            { clearProps: 'transform' },
          );
        };
      });

      /* No refresh here. A cleanup has nothing left to measure — the component
         is going away — and refreshing while sibling contexts are still
         reverting is what threw `can't access property "end", curTrigger is
         undefined` from this exact line. */
      return () => mm.revert();
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
