'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMotion } from '@/lib/motion/MotionProvider';

/**
 * Every navigation lands at the top. I-050, I-058, I-062, and now D-053.
 *
 * ── What this is for ─────────────────────────────────────────────────────
 *
 * Next scrolls to the top on a push and restores the offset on a pop. Neither
 * survives Lenis, which holds its own `animatedScroll` and writes it to the
 * window on every tick of the GSAP ticker — so whatever the router sets is
 * overwritten on the next frame by a number left over from the previous page.
 * Leaving the bottom of one case study landed on the next at scrollY 6573: the
 * footer (I-050).
 *
 * ── And why it does not restore ──────────────────────────────────────────
 *
 * It used to. Sayandeep: *"if i open a page and scrolls and thn go to another
 * page .. if i come back to the page i have scrolled before when i come back if
 * opens there .. make it so like a new page alway opens at the top .. coming
 * back and going new .. always sets the position at the top of the page."*
 *
 * So both directions go to **0**, and everything the previous version needed in
 * order to restore — `history.scrollRestoration = 'manual'`, a `popstate`
 * listener, a per-path position map, a scroll listener to keep it current — is
 * gone with it. The behaviour got simpler and so did the file. See D-053.
 *
 * `scrollRestoration` stays manual, because that is the one part that was doing
 * real work: without it the browser restores a pop on its own schedule and
 * fights the value set here.
 *
 * ── The ordering is the load-bearing part ────────────────────────────────
 *
 * This runs in a **layout** effect, synchronously, and `<ScrollReset>` is
 * rendered in the root layout ahead of `<main>` — so it lands before any page
 * component builds a ScrollTrigger. That is not tidiness. Triggers created while
 * the window still holds the *previous* page's offset evaluate every `once`
 * reveal as already passed, and a trigger that fires during ScrollTrigger's own
 * refresh cascade takes the rest of the page's triggers down with it (I-058,
 * I-062). Correcting the scroll after the fact is a repaint, not a fix.
 */

/** `useLayoutEffect` warns during SSR, and this component renders on the server. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function ScrollReset() {
  const pathname = usePathname();
  const { lenis } = useMotion();

  /** The first render is a load, not a navigation. */
  const first = useRef(true);

  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    /* Both, in this order, synchronously. The window is what ScrollTrigger
       measures against; Lenis is what would otherwise write the old value back
       over it on the next tick. */
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  /* ── and again, after paint ─────────────────────────────────────────────
     `history.scrollRestoration = 'manual'` stops the **browser** restoring.
     It does not stop **Next**, which keeps its own scroll positions in router
     state and applies them on a pop after the commit — so back-navigation
     landed at 1618px with the layout effect above having already set 0, and the
     harness caught it.

     The layout effect still has to run first: it is what guarantees triggers
     are built at the top, which is the whole of I-058 and I-062. This second
     pass is what makes the position stick afterwards. Two writes, one frame
     apart, and only the first one is load-bearing. */
  useEffect(() => {
    if (first.current) return;
    const id = requestAnimationFrame(() => {
      if (window.scrollY === 0) return;
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return null;
}
