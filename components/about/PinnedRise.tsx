'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { EASE, MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { Artwork } from '@/components/art/Artwork';
import s from './PinnedRise.module.css';

/**
 * `<PinnedRise />`. `20-components-and-motion.md` §14 [src] — *"the best motion
 * on the site"* — transcribed.
 *
 * ```js
 * gsap.timeline({
 *   defaults: { ease: 'sine' },
 *   scrollTrigger: { trigger: list, start: 'center center', end: '+=250%',
 *                    pin: wrapper, scrub: 1 }
 * })
 *   .set (list,     { perspective: 1000 })
 *   .from(items,    { y: window.innerHeight, rotationX: -70,
 *                     transformOrigin: '50% 0%', z: 100,
 *                     stagger: { amount: .4, from: 'random', grid: [4, 9] } })
 *   .to  (headline, { opacity: 0 }, '<+0.2');
 * ```
 *
 * Every value is theirs. `grid: [4, 9]` is what makes the count forty-five
 * rather than a round number — it is the shape the stagger was tuned on, and
 * changing the count changes the animation.
 *
 * **Our fill is forty-five project artefacts rather than forty-five faces**, per
 * `00-brief-and-decisions.md` decision 2. We are two to five people per project;
 * a wall of the same three faces is a worse lie than no wall.
 *
 * ── `y: window.innerHeight` is read at build time in theirs ──────────────
 *
 * And it has to be read *again* on refresh in ours, or the cards rise from the
 * wrong place after a rotation or a window resize. It is a function-based value
 * for that reason, which GSAP re-evaluates on `invalidateOnRefresh`.
 *
 * ── The pin, and the one thing pins reliably break ───────────────────────
 *
 * Pinning inserts a spacer into the document, which changes the height of
 * everything below it — so every trigger further down the page is measured
 * against a layout that no longer exists until something refreshes. GSAP handles
 * that itself on load; what it cannot handle is another component refreshing
 * mid-pin, which is why nothing on this page calls `ScrollTrigger.refresh()`.
 *
 * ── Off below 992 and under reduced motion ───────────────────────────────
 *
 * The cards are simply a grid there. A pinned section that holds the page for
 * 250% of the viewport is the least appropriate thing on this site to run on a
 * phone, and `prefers-reduced-motion` is not a preference to negotiate with.
 */
export function PinnedRise({ seeds, heading }: { seeds: string[]; heading: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion) return;

      const wrapper = el.querySelector<HTMLElement>('[data-rise-wrapper]');
      const list = el.querySelector<HTMLElement>('[data-rise-list]');
      const headlineEl = el.querySelector<HTMLElement>('[data-rise-headline]');
      const items = gsap.utils.toArray<HTMLElement>('[data-rise-item]', el);
      if (!wrapper || !list || items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const tl = gsap.timeline({
          defaults: { ease: EASE.sine },
          scrollTrigger: {
            trigger: list,
            start: 'center center',
            end: '+=250%',
            pin: wrapper,
            scrub: 1,
            /* So `y: window.innerHeight` below is re-read rather than frozen at
               whatever the window was when the page loaded. */
            invalidateOnRefresh: true,
          },
        });

        tl.set(list, { perspective: 1000 }).from(items, {
          y: () => window.innerHeight,
          rotationX: -70,
          transformOrigin: '50% 0%',
          z: 100,
          stagger: { amount: 0.4, from: 'random', grid: [4, 9] },
        });

        if (headlineEl) tl.to(headlineEl, { opacity: 0 }, '<+0.2');
      });

      /* No cleanup returned. See I-051. */
    },
    { scope: root, dependencies: [reducedMotion, seeds.length] },
  );

  return (
    <div ref={root} className={s.rise}>
      <div className={s.wrapper} data-rise-wrapper>
        {/* §14: "Headline sits behind the cards and fades as they rise past it." */}
        <h2 className={s.headline} data-t="h1" data-rise-headline>
          {heading}
        </h2>

        <div className={s.list} data-rise-list aria-hidden="true">
          {seeds.map((seed) => (
            <div key={seed} className={s.item} data-rise-item>
              <Artwork seed={seed} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
