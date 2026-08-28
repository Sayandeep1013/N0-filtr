'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { EASE, MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { Artwork } from '@/components/art/Artwork';
import s from './Flythrough.module.css';

/**
 * `<Flythrough />`. `20-components-and-motion.md` §13 [src], transcribed.
 *
 * ```js
 * wrapper.style.setProperty('--perspective', '1000px');
 * gsap.fromTo(items, { opacity: 0 },
 *   { opacity: 1, delay: .2, stagger: { amount: .6, from: 'random' } });
 *
 * gsap.timeline({
 *   defaults: { ease: 'none' },
 *   scrollTrigger: { trigger: list, start: 'top bottom+=5%', end: 'bottom top-=5%', scrub: true }
 * })
 *   .set  (list,  { rotationY: 25 })
 *   .set  (items, { z: () => gsap.utils.random(-1600, 200),
 *                   y: () => gsap.utils.random(0, 150) })
 *   .fromTo(items,{ xPercent: () => gsap.utils.random(-1000, -500) },
 *                 { xPercent: () => gsap.utils.random( 500,  1000) }, 0)
 *   .fromTo(imgs, { scale: 2 }, { scale: .5 }, 0);
 * ```
 *
 * Every number above is theirs. The one thing that is not is what the twelve
 * items *contain*: their flythrough is photographs of a studio, ours is twelve
 * generated plates (D-038), because we do not have the photographs and inventing
 * them is the one thing this site is named after not doing.
 *
 * ── It is CSS 3D, not Three.js ───────────────────────────────────────────
 *
 * `30-page-specs.md` calls this a "3D photo flythrough" and their own source is
 * `rotationY`, `z` and `perspective` on DOM elements — so it never needed a
 * renderer, and building it with one would put a second WebGL context on a page
 * that already has the hero's. GSAP writes 3D transforms and the browser
 * composites them.
 *
 * ── Randomness, and why it is allowed here ───────────────────────────────
 *
 * `gsap.utils.random` inside function-based values is theirs, and unlike
 * `<Artwork>` it is safe: these are *transforms applied after mount*, not
 * markup rendered on the server. Nothing about the HTML differs between the two,
 * so there is nothing for hydration to disagree about. See I-052 for the case
 * where that distinction was got wrong.
 *
 * ── Gated ────────────────────────────────────────────────────────────────
 *
 * `>991px` through `matchMedia`, per CLAUDE.md non-negotiable 6, and off under
 * `prefers-reduced-motion` — where the twelve plates simply sit in a static row.
 * A scrubbed 3D flythrough is close to the definition of what that preference
 * exists to stop.
 */
export function Flythrough({ seeds }: { seeds: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion) return;

      const list = el.querySelector<HTMLElement>('[data-fly-list]');
      const items = gsap.utils.toArray<HTMLElement>('[data-fly-item]', el);
      const arts = gsap.utils.toArray<HTMLElement>('[data-fly-art]', el);
      if (!list || items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        /* §13's entrance. Not scrubbed — it plays once as the block arrives. */
        gsap.fromTo(
          items,
          { opacity: 0 },
          { opacity: 1, delay: 0.2, stagger: { amount: 0.6, from: 'random' } },
        );

        gsap
          .timeline({
            defaults: { ease: EASE.linear },
            scrollTrigger: {
              trigger: list,
              start: 'top bottom+=5%',
              end: 'bottom top-=5%',
              scrub: true,
            },
          })
          .set(list, { rotationY: 25 })
          .set(items, {
            z: () => gsap.utils.random(-1600, 200),
            /* ── §13's spread, centred ────────────────────────────────────
               [src] is `random(0, 150)` — downward only. Ours is the same
               150px of spread with the anchor moved to the middle, and the
               deviation is logged as I-070 rather than taken silently
               (CLAUDE.md non-negotiable 1).

               Measured at 1512 before changing it: cards overhang the box by
               up to **166px at the bottom and 0px at the top**, across the
               first half of the scrub. A one-directional offset needs a
               container with room underneath it; ours is centred, so every
               card hangs into the bottom edge and none of them uses the top.

               It survived because the plates used to be texture — a clipped
               field reads as a crop. D-059 gave them a footer rail, and a spec
               line cut in half reads as broken. Sayandeep spotted it the day
               it shipped. */
            y: () => gsap.utils.random(-75, 75),
          })
          .fromTo(
            items,
            { xPercent: () => gsap.utils.random(-1000, -500) },
            { xPercent: () => gsap.utils.random(500, 1000) },
            0,
          )
          .fromTo(arts, { scale: 2 }, { scale: 0.5 }, 0);
      });

      /* No cleanup returned — the context owns the matchMedia and everything
         made inside it. See I-051. */
    },
    { scope: root, dependencies: [reducedMotion, seeds.length] },
  );

  return (
    <div ref={root} className={s.flythrough} aria-hidden="true">
      <div className={s.list} data-fly-list>
        {seeds.map((seed) => (
          <div key={seed} className={s.item} data-fly-item>
            <div className={s.art} data-fly-art>
              <Artwork seed={seed} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
