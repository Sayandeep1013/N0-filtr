'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMotion } from '@/lib/motion/MotionProvider';

/**
 * Puts a new page at the top, and puts a page you came *back* to where you left
 * it. `01-PHASES.md` has no task for this; it is I-050.
 *
 * ── The bug ──────────────────────────────────────────────────────────────
 *
 * Sayandeep: *"whenever i visit a project it takes me to the no filter footer."*
 * Reproduced exactly — scrolled to the bottom of Tessera, clicked "next
 * project", landed on CanVas at **scrollY 6573 of 7766**. The footer.
 *
 * Next's App Router does scroll to the top on a push navigation, and it does
 * restore the offset on back and forward. Neither survives Lenis. Lenis holds
 * its own `animatedScroll` and `targetScroll` and writes them to the window on
 * every tick of the GSAP ticker, so whatever the router sets is overwritten on
 * the very next frame by a number left over from the previous page — clamped to
 * the new page's height, which is why it lands *near* the bottom rather than at
 * the same offset.
 *
 * ── The fix is one rule, not two ─────────────────────────────────────────
 *
 * The obvious version branches: scroll to 0 on a push, restore on a pop, and
 * then needs to know which it was and what the offset used to be. It does not
 * have to.
 *
 * **Whatever the router just did is right.** It puts the window at 0 for a push
 * and at the remembered offset for a pop, and it has already done so by the time
 * this effect runs. So the only thing missing is telling Lenis — and reading
 * `window.scrollY` back gets the correct answer in both cases from one line.
 *
 * The read happens in a `requestAnimationFrame`, after paint, for a reason that
 * is easy to get wrong: on the frame the effect runs, Lenis may already have
 * written its stale value over the router's. One frame later the router's
 * scroll has settled and Lenis has not yet had a chance to fight it, because
 * `force: true` overrules the animation it is in the middle of.
 *
 * ── Why not `lenis.stop()` during the transition ─────────────────────────
 *
 * Because the loader is over the page for exactly that window and a stopped
 * Lenis would swallow a wheel event from someone scrolling before the sweep
 * finishes. Correcting the position is cheaper and does not take the scroll
 * away from anyone.
 */
export function ScrollReset() {
  const pathname = usePathname();
  const { lenis } = useMotion();
  /* The first render is a load, not a navigation. The browser has its own
     restoration for that and it does not need help. */
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!lenis) return;

    const id = requestAnimationFrame(() => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return null;
}
