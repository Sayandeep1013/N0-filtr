'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMotion } from '@/lib/motion/MotionProvider';

/**
 * Owns the scroll position across route changes. I-050, I-058, and finally
 * I-062.
 *
 * ── Three bugs, one cause ────────────────────────────────────────────────
 *
 * **I-050 — the footer.** Leaving the bottom of one case study landed on the
 * next at scrollY 6573. Next scrolls to the top on a push and restores on a
 * pop; neither survives Lenis, which holds its own `animatedScroll` and writes
 * it to the window on every tick of the GSAP ticker.
 *
 * **I-058 — no ScrollTriggers.** The first fix corrected the position in a
 * `useEffect` + `requestAnimationFrame`. Page components build their triggers in
 * a **layout** effect, before paint, so every one of them was constructed at the
 * *outgoing* page's scroll. At that position every `once: true` reveal reads as
 * already passed, fires during ScrollTrigger's recursive refresh, and kills
 * itself — splicing the array an outer loop is walking. The exception aborted
 * `WorksGrid`, leaving the homepage with **zero** triggers.
 *
 * **I-062 — the back button.** The second fix moved the correction into a
 * layout effect and branched: push went to the top immediately, and **pop still
 * waited a frame** for the browser to restore. So the crash simply moved to the
 * back button, which is where Sayandeep found it — in production, minified, as
 * `ty[ef] is undefined`.
 *
 * ── The fix is to stop waiting for anyone ────────────────────────────────
 *
 * `history.scrollRestoration = 'manual'` turns off the browser's own
 * restoration, and this component records the scroll position per path as you
 * leave it. Then **both** directions are known synchronously:
 *
 *   · push → 0
 *   · pop  → the position we remembered
 *
 * No rAF, no branch that waits, and nothing else racing for the same value. A
 * layout effect that runs before `<main>` sets the window and Lenis together,
 * and every trigger built afterwards measures against a page that is already
 * where it is going to be.
 *
 * Keyed by pathname rather than by history entry. Two visits to the same path
 * share a remembered position, which is worth knowing and is the correct answer
 * far more often than it is the wrong one.
 */

/** `useLayoutEffect` warns during SSR, and this component renders on the server. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function ScrollReset() {
  const pathname = usePathname();
  const { lenis } = useMotion();

  /** The first render is a load, not a navigation. */
  const first = useRef(true);
  /** Set by `popstate`, read and cleared by the next pathname change. */
  const wasPop = useRef(false);
  /** Where each path was when it was last left. */
  const positions = useRef(new Map<string, number>());
  /** The path currently on screen, so a scroll can be filed against it. */
  const current = useRef(pathname);

  useEffect(() => {
    /* Ours now. Without this the browser restores on its own schedule and
       overwrites a correction that has already been applied. */
    const previous = history.scrollRestoration;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const onPop = () => {
      wasPop.current = true;
    };
    /* Passive and cheap: one map write per scroll event, no layout read beyond
       `scrollY`, which is free. */
    const onScroll = () => {
      positions.current.set(current.current, window.scrollY);
    };

    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('scroll', onScroll);
      if ('scrollRestoration' in history) history.scrollRestoration = previous;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const previousPath = current.current;
    current.current = pathname;

    if (first.current) {
      first.current = false;
      return;
    }

    /* The outgoing page's last known position. The scroll listener has it
       already unless the visitor never scrolled, in which case 0 is right. */
    if (previousPath !== pathname) {
      positions.current.set(previousPath, positions.current.get(previousPath) ?? window.scrollY);
    }

    const pop = wasPop.current;
    wasPop.current = false;
    const target = pop ? (positions.current.get(pathname) ?? 0) : 0;

    /* Both, in this order, synchronously. The window is what ScrollTrigger
       measures against; Lenis is what would otherwise write the old value back
       over it on the next tick. */
    window.scrollTo(0, target);
    lenis?.scrollTo(target, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}
