'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from './gsap';
import { DUR, EASE, MQ } from './tokens';

/**
 * Sibling-dim — docs/spec/20-components-and-motion.md §21.1.
 *
 * Three separate components on tonik dim their siblings to exactly **0.3** on
 * hover, and §21.1 is explicit that this is one primitive and not three
 * implementations:
 *
 * | Component               | Source           | Duration / ease   |
 * |-------------------------|------------------|-------------------|
 * | Works grid card         | [src] GSAP       | .4s power1.inOut  |
 * | Footer service link     | [ix2] a-17/a-18  | .4s power1.inOut  |
 * | Featured-customer link  | [ix2] a-27/a-28  | .5s power1.inOut  |
 *
 * The footer row is verified against the recovered action lists: `a-17` group 1
 * takes SIBLINGS of `.service-link` to opacity 0.3 over 400ms inOutQuad, and
 * `a-18` takes them back to 1 over the same. Note that this one is symmetric —
 * the site's usual "reverses run faster" rule does not apply, because it is not
 * a reverse: it is a second action list.
 *
 * Gated at >991px, like every hover (CLAUDE.md non-negotiable §6).
 */
export function useSiblingDim(
  scope: RefObject<HTMLElement | null>,
  {
    selector,
    opacity = 0.3,
    duration = DUR.base,
    ease = EASE.quad,
  }: { selector: string; opacity?: number; duration?: number; ease?: string },
): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const items = [...root.querySelectorAll<HTMLElement>(selector)];
        if (items.length < 2) return;

        /* `overwrite: 'auto'` is load-bearing, and phase 4 is where it started
           mattering. Moving the pointer from one item straight to the next
           fires `mouseleave` on the first and `mouseenter` on the second in the
           same turn, so a restore-everything-to-1 tween and a dim-everything-
           but-me tween end up running on the same eight or ten elements at
           once. Without overwrite both survive and the shared targets flicker
           between the two for the length of the slower one. With it, the tween
           that starts later kills the conflicting one — which is the right
           answer, because the later event is the newer intent.

           Two items (the footer) never showed this; twelve cards do. */
        const enter = (hovered: HTMLElement) => () => {
          gsap.to(
            items.filter((el) => el !== hovered),
            { opacity, duration, ease, overwrite: 'auto' },
          );
        };
        const leave = () => {
          gsap.to(items, { opacity: 1, duration, ease, overwrite: 'auto' });
        };

        const handlers = items.map((el) => {
          const on = enter(el);
          el.addEventListener('mouseenter', on);
          el.addEventListener('mouseleave', leave);
          el.addEventListener('focusin', on);
          el.addEventListener('focusout', leave);
          return { el, on };
        });

        return () => {
          for (const { el, on } of handlers) {
            el.removeEventListener('mouseenter', on);
            el.removeEventListener('mouseleave', leave);
            el.removeEventListener('focusin', on);
            el.removeEventListener('focusout', leave);
          }
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope, dependencies: [selector, opacity, duration, ease] },
  );
}
