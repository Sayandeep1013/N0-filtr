'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { SpecTable } from '@/components/ui/SpecTable';
import type { Work } from '@/content/works/_types';
import { WorkCover } from './WorkCover';
import s from './WorkCard.module.css';

/**
 * One card in the works grid. `20-components-and-motion.md` §5.
 *
 * **Four independent motions, and they do not know about each other.**
 *
 *   1. the reveal      one-shot, scrubbed in by a ScrollTrigger, guarded
 *   2. hover layer 1   every OTHER card dims to .3 — owned by the GRID (I-039)
 *   3. hover layer 2   `.fade-away-overlay` to .55 in 500ms, out in 400ms
 *   4. hover layer 3   the sheet wipes in, the reel replaces the still
 *
 * Layers 2 and 3 are separate from layer 1 on purpose. §21.2 calls the overlay
 * "an extra layer under the GSAP hover timeline, easy to miss", and its timings
 * are **asymmetric in the opposite direction to the rest of the site**: in over
 * 500ms, out over 400ms. Everything else here reverses at `REVERSE_SCALE`.
 * Folding the overlay into the main timeline would silently make its exit
 * 500/1.2 = 417ms, which is close enough to 400 to look right and would be
 * wrong. So it gets its own two tweens.
 *
 * ── The reveal's guard ─────────────────────────────────────────────────────
 *
 * §5 marks it one-shot and guarded by `data-revealed`. The flag lives on the
 * DOM node rather than in a ref because phase 7 filters this grid, and a
 * filtered card that re-mounts must not replay a wipe it has already played if
 * it is still on screen. A ref would reset with the component; the attribute
 * survives as long as the element does.
 *
 * ── ≤767 is not a smaller version of this ──────────────────────────────────
 *
 * §5, and it is the responsive behaviour most likely to be got wrong: the hover
 * sheet **is not hidden on mobile, it becomes permanent content.** No hover, no
 * dimming, no video. Which means the sheet cannot be built as something that
 * exists only to be revealed — it is real content that desktop happens to hide
 * until you point at it. The CSS carries that; the JS simply never runs.
 */
export function WorkCard({ work, className }: { work: Work; className?: string }) {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const card = root.current;
      if (!card) return;

      const wipe = card.querySelector<HTMLElement>('[data-work-wipe]');
      const badge = card.querySelector<HTMLElement>('[data-work-badge]');
      const info = card.querySelector<HTMLElement>('[data-work-info]');
      const sheet = card.querySelector<HTMLElement>('[data-work-sheet]');
      const overlay = card.querySelector<HTMLElement>('[data-work-overlay]');
      const still = card.querySelector<HTMLElement>('[data-work-still]');
      const video = videoRef.current;

      const mm = gsap.matchMedia();

      /* ── the reveal ───────────────────────────────────────────────────────
         Runs at every width and under any motion preference — it is how the
         card arrives, not an embellishment. Under `reduce` the wipe is resolved
         to its end state instead of played. */
      mm.add(MQ.noPreference, () => {
        if (!wipe || !badge || !info) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'bottom bottom',
            /* §5's guard, as a real one-shot. `once` retires the trigger; the
               attribute is what phase 7's filter will read. */
            once: true,
            onEnter: () => card.setAttribute('data-revealed', 'true'),
          },
        });

        tl.to(wipe, { width: '0%', duration: DUR.wipe, ease: EASE.out })
          .to(badge, { opacity: 1, duration: DUR.mid }, '>-0.2')
          .to(info, { opacity: 1, duration: DUR.mid }, '<');

        if (work.order === 1) registerTimeline('work-card.reveal', tl);
        return () => {
          if (work.order === 1) unregisterTimeline('work-card.reveal');
        };
      });

      mm.add(MQ.reduced, () => {
        gsap.set([wipe], { width: '0%' });
        gsap.set([badge, info], { opacity: 1 });
        card.setAttribute('data-revealed', 'true');
      });

      /* ── hover ────────────────────────────────────────────────────────────
         Desktop only, and only where motion is welcome. One paused timeline
         built on mount, per §5. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        if (!sheet) return;

        /* ── what used to be here ─────────────────────────────────────────
           §5's `[src]` builds one paused hover timeline per card with two
           children: the caption rising to -110%, and the sibling-dim. Neither
           is here any more, and both left for a reason.

           The **sibling-dim** moved to the grid. §21.1 says to, in as many
           words — "one shared primitive, `useSiblingDim(0.3)`, not three
           implementations" — and phase 4 is where that earns itself: twelve
           cards each owning a tween over the other eleven means sliding the
           pointer between two cards has one timeline driving every sibling to 1
           while the next drives every sibling to .3, on the same ten elements,
           for 400ms. I-039.

           The **caption rise** is gone at Sayandeep's request: it hid the
           work's name and summary at the moment you were reading about them.
           D-025.

           So this branch owns the sheet, the overlay and the reel swap, and
           there is no timeline left to register. `work-card.hover` is not
           "missing" — it does not exist. */

        /* ── the drawer wipes in from the right ───────────────────────────
           It rose from the bottom in the first build of this. Sayandeep:
           *"I don't like the info coming from the bottom — do it the same as
           the card appears, from right to left."*

           `clip-path`, not a transform. A panel translated in from the right
           starts a full card-width outside its own box, which means it is
           briefly drawn over the card in the next column unless something
           clips it — and the only element positioned to do that is the media,
           which the sheet is deliberately NOT a child of (§5's anatomy, and
           what lets ≤767 drop it into the flow). An inset clip needs no
           ancestor at all: the panel never moves, its visible region does.

           `inset(0 0 0 100%)` is a zero-width strip against the right edge;
           animating that last value to 0 opens it leftward. Right to left,
           exactly as asked, with nothing to overflow. */
        const CLOSED = 'inset(0% 0% 0% 100%)';
        const OPEN = 'inset(0% 0% 0% 0%)';

        const rows = [...sheet.querySelectorAll<HTMLElement>('[data-spec] > div')];

        gsap.set(sheet, { opacity: 0, clipPath: CLOSED });
        gsap.set(rows, { opacity: 0, x: 14 });

        const showSheet = () => {
          gsap.to(sheet, {
            opacity: 1,
            clipPath: OPEN,
            duration: DUR.mid,
            ease: EASE.soft,
            overwrite: 'auto',
          });
          /* The rows follow the wipe across rather than arriving with it, so
             the panel reads as being drawn rather than switched on. `.04`
             across five rows is 160ms of stagger inside a 500ms wipe — enough
             to see, not enough to wait for. */
          gsap.to(rows, {
            opacity: 1,
            x: 0,
            duration: DUR.base,
            ease: EASE.soft,
            stagger: 0.04,
            overwrite: 'auto',
          });
        };

        const hideSheet = () => {
          gsap.to(sheet, {
            opacity: 0,
            clipPath: CLOSED,
            duration: DUR.base,
            ease: EASE.inOut,
            overwrite: 'auto',
          });
          /* No stagger on the way out. Reverses are faster everywhere on this
             site, and a staggered exit reads as the panel struggling to leave. */
          gsap.to(rows, { opacity: 0, x: 14, duration: DUR.fast, overwrite: 'auto' });
        };

        const enter = () => {
          /* §5 sets the sheet's opacity outright, with no tween, and on a
             1316x822 card that is #212121 to pure white in one frame. It now
             wipes in from the right over the same 500ms the overlay takes to
             darken underneath it, so the media dims first and the drawer is
             drawn across the dimmed area. See D-022. */
          showSheet();
          if (overlay) {
            // §21.2 — in over 500ms. Its own tween; see the component note.
            gsap.to(overlay, { opacity: 0.55, duration: DUR.mid, ease: EASE.inOut });
          }
          if (video && still) {
            gsap.set(still, { opacity: 0 });
            void video.play().catch(() => undefined);
          }
        };

        const leave = () => {
          hideSheet();
          if (overlay) {
            // §21.2 — out over 400ms. Faster than in, the inverse of the site's
            // usual rule, and the reason this is not on the main timeline.
            gsap.to(overlay, { opacity: 0, duration: DUR.base, ease: EASE.inOut });
          }
          if (video && still) {
            gsap.set(still, { opacity: 1 });
            video.pause();
            video.currentTime = 0;
          }
        };

        card.addEventListener('mouseenter', enter);
        card.addEventListener('mouseleave', leave);
        /* Keyboard reaches the card through its link. Focus is not hover — it
           does not dim eleven other cards — but the sheet is real content and a
           keyboard visitor should be able to see it. */
        card.addEventListener('focusin', showSheet);
        card.addEventListener('focusout', () => {
          if (!card.matches(':hover')) hideSheet();
        });

        return () => {
          card.removeEventListener('mouseenter', enter);
          card.removeEventListener('mouseleave', leave);
        };
      });

      /* No refresh from a cleanup — see lib/motion/scrollRefresh.ts. */
      return () => mm.revert();
    },
    { scope: root, dependencies: [work.slug] },
  );

  const specRows = [
    { key: 'Services', value: work.services },
    { key: 'Tools', value: work.tools },
    { key: 'Industries', value: work.industries },
    { key: 'Year', value: [String(work.year)] },
    /* tonik's fifth row is LOCATION. `40-content-model.md` §1 replaces it with
       status, which is the fact about our work that theirs does not have. */
    { key: 'Status', value: [work.status] },
  ];

  return (
    <article
      ref={root}
      className={[s.card, className].filter(Boolean).join(' ')}
      data-work-card
      data-work-width={work.card.width}
      /* The work's own accent, handed to CSS so the hover panel can be tinted
         with it. A custom property rather than an inline background: the
         stylesheet decides how much of it to use and what to mix it into, and
         that ratio is a design decision that belongs next to the other ones. */
      style={{ '--work-accent': work.accent.dark } as React.CSSProperties}
    >
      <Link href={`/works/${work.slug}`} className={s.link}>
        {/* The positioning context for the sheet, and the reason it exists.

            The sheet was `position: absolute; bottom: 0` with no relative
            ancestor between it and `.card` — so "bottom" meant the bottom of
            the whole card, caption included, and the panel covered the work's
            name and summary. Sayandeep: *"the info at the bottom of the actual
            card, the project name and the right side description, those are
            getting covered too. I don't want that getting covered — just cover
            the card image itself, not the info."*

            The frame is exactly the media's box. The caption lives outside it
            and can no longer be reached. See D-025. */}
        <div className={s.frame}>
          <div className={s.media} data-work-media>
          <div className={s.still} data-work-still>
            {work.card.poster ? (
              /* `srcSet` derived from the 1× name rather than stored — see the
                 note on `poster` in `_types.ts`.

                 `sizes` matters here and is easy to leave off: without it the
                 browser assumes the image fills the viewport and picks the 2×
                 for every card, which is 249KB of ReIN Bot to fill a 536px box.
                 A `half` card is about 40% of the viewport at 1512 and the full
                 width below 992. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.card.poster}
                srcSet={`${work.card.poster} 1440w, ${work.card.poster.replace('.webp', '@2x.webp')} 2880w`}
                sizes="(max-width: 991px) 100vw, 45vw"
                alt=""
                className={s.image}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <WorkCover slug={work.slug} accent={work.accent} order={work.order} />
            )}
          </div>

          {work.card.reel && (
            <video
              ref={videoRef}
              className={s.video}
              src={work.card.reel}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            />
          )}

          {/* §21.2's extra layer. Sits over the media and under the sheet. */}
          <div className={s.overlay} data-work-overlay aria-hidden="true" />

          {/* The reveal. `width: 100%` at rest, wiped to 0% on entry — so it
              covers the media until the card has arrived. */}
          <div className={s.wipe} data-work-wipe aria-hidden="true" />

            <span className={s.badge} data-work-badge data-t="label-sm">
              Case study
            </span>
          </div>

          {/* A SIBLING of the media, as §5's anatomy has it — not a child. Above
              768 it is absolutely positioned over the media's box and wiped in
              on hover; at ≤767 it drops into the flow and becomes the card's
              second block. One element, two layouts, and only the second one is
              what a phone ever sees. */}
          <div className={s.sheet} data-work-sheet>
            {/* Not `invert`. The panel is dark now (D-024), so the table wants
                its ordinary palette: grey keys, white values, white-30 rules. */}
            <SpecTable rows={specRows} className={s.sheetTable} />
          </div>
        </div>

        {/* Outside the frame, so nothing can cover it — and it no longer moves.
            §5 slides the caption to -110% of its own height on hover, which
            makes the work's name disappear at the exact moment you are reading
            about it. See D-025. */}
        <div className={s.info} data-work-info>
          <span className={s.client} data-t="label">
            {work.title}
          </span>
          <span className={s.summary} data-t="p-sm">
            {work.summary}
          </span>
        </div>
      </Link>
    </article>
  );
}
