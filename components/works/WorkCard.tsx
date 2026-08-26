'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ, REVERSE_SCALE } from '@/lib/motion/tokens';
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
 *   2. hover layer 1   caption rises, every OTHER card dims to .3
 *   3. hover layer 2   `.fade-away-overlay` to .55 in 500ms, out in 400ms
 *   4. hover layer 3   the sheet fades in, the reel replaces the still
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
        if (!info || !sheet) return;

        /* The caption rise, and only that.

           §5's [src] puts the sibling-dim in this same timeline. **§21.1 says
           not to**, in as many words: "Treat this as one shared primitive,
           `useSiblingDim(0.3)`, not three implementations." Phase 4 is where
           the instruction earns itself.

           Twelve cards each owning a tween over the other eleven means that
           sliding the pointer from one card to the next has card A reversing
           every sibling back to 1 while card B drives every sibling to .3 — on
           the same ten elements, at the same time, with neither knowing about
           the other. It flickers, and it flickers for 400ms.

           The dim now lives once, on the grid, in `useSiblingDim`. See I-039. */
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(info, { yPercent: 0 }, { yPercent: -110, duration: DUR.micro, ease: EASE.inOut });

        tl.eventCallback('onReverseComplete', () => gsap.set(sheet, { opacity: 0 }));

        const enter = () => {
          gsap.set(sheet, { opacity: 1 });
          tl.timeScale(1).play();
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
          tl.timeScale(REVERSE_SCALE).reverse();
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
        card.addEventListener('focusin', () => gsap.set(sheet, { opacity: 1 }));
        card.addEventListener('focusout', () => {
          if (!card.matches(':hover')) gsap.set(sheet, { opacity: 0 });
        });

        if (work.order === 1) registerTimeline('work-card.hover', tl);

        return () => {
          card.removeEventListener('mouseenter', enter);
          card.removeEventListener('mouseleave', leave);
          if (work.order === 1) unregisterTimeline('work-card.hover');
          tl.kill();
        };
      });

      return () => {
        mm.revert();
        ScrollTrigger.refresh();
      };
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
    >
      <Link href={`/works/${work.slug}`} className={s.link}>
        <div className={s.media} data-work-media>
          <div className={s.still} data-work-still>
            {work.card.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={work.card.poster} alt="" className={s.image} loading="lazy" />
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
            768 it is absolutely positioned over the media's box and revealed on
            hover; at ≤767 it drops into the flow and becomes the card's second
            block. One element, two layouts, and only the second one is what a
            phone ever sees. */}
        <div className={s.sheet} data-work-sheet>
          <SpecTable rows={specRows} invert className={s.sheetTable} />
        </div>

        {/* The caption is clipped by its own wrapper. §5 slides it to -110% of
            its own height on hover, which is a disappearance rather than a
            move: without something to clip it, it would ride up over the media
            and sit there. */}
        <div className={s.infoClip}>
          <div className={s.info} data-work-info>
            <span className={s.client} data-t="label">
              {work.title}
            </span>
            <span className={s.summary} data-t="p-sm">
              {work.summary}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
