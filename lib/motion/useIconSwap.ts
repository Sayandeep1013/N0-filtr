'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from './gsap';
import { DUR, EASE, MQ, REVERSE_SCALE_FAST } from './tokens';
import { registerTimeline, unregisterTimeline } from './registry';

/**
 * The signature button hover — docs/spec/20-components-and-motion.md §21.3,
 * IX2 `a-25` / `a-26`, verified against the recovered action lists.
 *
 * Two stacked icons trade places along a diagonal. The arrow exits toward the
 * top-right and its twin arrives from the bottom-left, so the icon reads as
 * *replaced* rather than moved.
 *
 *   INITIAL  .button-icon              x    0%  y    0%   rotate 325°
 *            .button-icon.is-absolute  x -101%  y  101%
 *   HOVER    .button-icon              x  101%  y -101%   300ms outCirc
 *            .button-icon.is-absolute  x    0%  y    0%   300ms outCirc
 *
 * Both icons travel by the same delta, so both are animated identically here and
 * the twin's resting offset lives in CSS. That keeps the resting composition
 * correct below 992px, where this timeline never runs at all.
 *
 * Gated at >991px — CLAUDE.md non-negotiable §6. Reverse runs at 1.5, the button
 * scale, not the 1.2 panels use.
 *
 * @param scope   the hover target — the whole button, not the icon
 * @param timelineId  register under this id for verify:motion. Exactly one call
 *                    site should pass it, or later instances overwrite earlier ones.
 */
export function useIconSwap(scope: RefObject<HTMLElement | null>, timelineId?: string): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const icons = root.querySelectorAll<HTMLElement>('.button-icon');
      if (icons.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const tl = gsap.timeline({ paused: true });
        tl.to(icons, { xPercent: 101, yPercent: -101, duration: DUR.fast, ease: EASE.circ }, 0);

        if (timelineId) registerTimeline(timelineId, tl);

        const enter = () => tl.timeScale(1).play();
        const leave = () => tl.timeScale(REVERSE_SCALE_FAST).reverse();

        root.addEventListener('mouseenter', enter);
        root.addEventListener('mouseleave', leave);
        // Keyboard users get the same affordance; focus is not a pointer, but the
        // icon swap is the only hover feedback this button has.
        root.addEventListener('focusin', enter);
        root.addEventListener('focusout', leave);

        return () => {
          root.removeEventListener('mouseenter', enter);
          root.removeEventListener('mouseleave', leave);
          root.removeEventListener('focusin', enter);
          root.removeEventListener('focusout', leave);
          if (timelineId) unregisterTimeline(timelineId);
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope, dependencies: [timelineId] },
  );
}
