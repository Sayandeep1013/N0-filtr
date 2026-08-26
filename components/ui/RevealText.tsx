'use client';

import { useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import s from './RevealText.module.css';

/**
 * The site's signature motion. `20-components-and-motion.md` §4.
 *
 * Words rest at 20% opacity and light to full in a scrubbed stagger as the
 * block crosses the viewport. **Scrubbed, not triggered** — scrolling back up
 * un-reveals, which is the whole character of it and the thing a `once: true`
 * reveal gets wrong.
 *
 * ```js
 * const split = new SplitType(el, { types: 'words', tagName: 'span' });
 * gsap.timeline({
 *   scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 10%', scrub: 1 }
 * }).from(split.words, {
 *   opacity: .2, duration: .4, ease: 'power1.out', stagger: { each: .1 }
 * });
 * ```
 *
 * ── Three implementation facts, each of which is load-bearing ──────────────
 *
 * **1. `split-type` is imported dynamically, inside the desktop branch.** The
 * reveal is `>991px` only, so on a phone the library is never fetched at all —
 * and it stays out of `/`'s initial bundle, which had ~16KB of headroom when
 * this was written (D-013). The cost of that is that the tween is created
 * asynchronously, after `gsap.matchMedia` has already returned; a tween created
 * then is **not** captured by the context and would survive `mm.revert()`.
 * `context.add()` is the documented way back in, and it is why the callback
 * takes its `context` argument.
 *
 * **2. The split happens after `document.fonts.ready`.** Splitting against a
 * fallback face measures the wrong word boxes, and every one of them is wrong
 * again the moment the real face swaps in.
 *
 * **3. There is no re-split on resize, and that is deliberate.** §4 asks for one
 * via `refreshInit`. A *words* split does not need it: `split-type` gives each
 * word `display: inline-block` and leaves them in the normal flow, so they
 * re-wrap with the text like any other inline content and the word count cannot
 * change. A *lines* split would need it — lines are a measurement, words are
 * not. Re-splitting on `refreshInit` would also throw away the elements the
 * live timeline is tweening, mid-refresh. See D-018.
 *
 * Under reduced motion, and below 992px, nothing runs and nothing is split: the
 * text renders as ordinary text at full opacity. That is the correct end state,
 * not a degraded one.
 */
export function RevealText({
  as: Tag = 'p',
  children,
  className,
  scale = 'p-big',
  id,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** The `data-t` scale token this block is set in. */
  scale?: string;
  /**
   * Registers the timeline as `reveal.<id>` for `verify:motion`. Only pass it
   * where an assertion refers to it — every instance registering would make the
   * registry a list of duplicates.
   */
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      /* Composed rather than nested: `gsap.matchMedia` treats each query as its
         own context, so a visitor on a wide screen who asks for reduced motion
         has to fall out of THIS branch entirely, not run a quieter version of
         it. §4 is desktop-only; CLAUDE.md §8 makes it no-preference-only. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, (context) => {
        let cancelled = false;
        let revert: (() => void) | null = null;

        void (async () => {
          /* Fonts first — see note 2. `document.fonts.ready` resolves
             immediately once the faces are in, so this is a microtask on any
             visit after the first. */
          await document.fonts.ready;
          if (cancelled) return;

          const { default: SplitType } = await import('split-type');
          if (cancelled) return;

          const split = new SplitType(el, { types: 'words', tagName: 'span' });
          const words = split.words ?? [];
          if (words.length === 0) {
            split.revert();
            return;
          }

          /* Everything created in here is captured by the matchMedia context,
             which is what makes `mm.revert()` below able to kill it. See note 1. */
          context.add(() => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                end: 'top 10%',
                scrub: 1,
              },
            });

            tl.from(words, {
              opacity: 0.2,
              duration: DUR.base,
              ease: EASE.gentle,
              stagger: { each: 0.1 },
            });

            if (id) registerTimeline(`reveal.${id}`, tl);
          });

          revert = () => {
            if (id) unregisterTimeline(`reveal.${id}`);
            split.revert();
          };
        })();

        return () => {
          cancelled = true;
          revert?.();
        };
      });

      return () => {
        mm.revert();
        /* A scrubbed trigger created asynchronously can outlive its own
           refresh cycle if the component unmounts inside one. Cheap insurance;
           the leak check in verify:motion is what would otherwise find it. */
        ScrollTrigger.refresh();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-t={scale} className={className ? `${s.reveal} ${className}` : s.reveal}>
      {children}
    </Tag>
  );
}
