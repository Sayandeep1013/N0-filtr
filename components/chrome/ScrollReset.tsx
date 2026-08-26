'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMotion } from '@/lib/motion/MotionProvider';

/**
 * Puts a new page at the top, and puts a page you came *back* to where you left
 * it. I-050, and then I-058.
 *
 * ── The first bug: the footer ────────────────────────────────────────────
 *
 * Sayandeep: *"whenever i visit a project it takes me to the no filter
 * footer."* Reproduced — leaving the bottom of Tessera landed on CanVas at
 * scrollY 6573 of 7766.
 *
 * Next's App Router scrolls to the top on a push and restores the offset on
 * back and forward. Neither survives Lenis, which holds its own
 * `animatedScroll` and writes it to the window on every tick of the GSAP
 * ticker — so whatever the router sets is overwritten on the next frame by a
 * number left over from the previous page.
 *
 * ── The second bug: it was one frame too late ────────────────────────────
 *
 * The first version corrected the scroll in a `useEffect` + `requestAnimationFrame`,
 * which fixed the position and left something worse behind:
 *
 * ```
 * TypeError: Cannot read properties of undefined (reading 'end')
 *     at ScrollTrigger.refresh  (×8, recursing)
 *     at ScrollTrigger.create   ← WorksGrid, mounting the homepage
 * ```
 *
 * The homepage's triggers are built in a **layout** effect, before paint — and
 * therefore before that rAF. Instrumenting `ScrollTrigger.create` showed all of
 * them being constructed at `scrollY = 6551`, the *outgoing* page's position.
 *
 * At that scroll every `once: true` reveal on the homepage evaluates as already
 * passed. Creating one trigger makes ScrollTrigger recursively refresh the
 * others; each `once` trigger that fires during the cascade **kills itself**,
 * splicing `_triggers` while an outer loop is walking it by index. The next read
 * is a hole, and `curTrigger.end` throws.
 *
 * The damage was not the console line. The exception aborted `WorksGrid`'s
 * `useGSAP`, so the homepage ended up with **zero** ScrollTriggers — no
 * parallax, no reveals, until a reload.
 *
 * ── The fix is ordering, not timing ──────────────────────────────────────
 *
 * The correction now happens in a **layout effect**, synchronously, before any
 * page component builds a trigger. `<ScrollReset />` is rendered in the root
 * layout ahead of `<main>`, and React runs sibling layout effects in order, so
 * this one lands first.
 *
 * Which costs the trick the first version was proud of. It could read
 * `window.scrollY` back and let the router's own decision stand for both push
 * and pop; running earlier means the router has not decided yet, so this has to
 * know which kind of navigation it is:
 *
 *   · **push** — go to the top, now, before anything measures anything.
 *   · **pop**  — the browser restores asynchronously, so let it, and sync Lenis
 *     a frame later. Back-navigation does not hit the crash because the position
 *     it restores *is* the one the page was built for.
 */

/** `useLayoutEffect` warns during SSR, and this component renders on the server. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function ScrollReset() {
  const pathname = usePathname();
  const { lenis } = useMotion();
  /** The first render is a load, not a navigation. The browser owns that one. */
  const first = useRef(true);
  /** Set by `popstate`, read and cleared by the next pathname change. */
  const wasPop = useRef(false);

  useEffect(() => {
    const onPop = () => {
      wasPop.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const pop = wasPop.current;
    wasPop.current = false;

    if (!pop) {
      /* Both, and in this order. The window is what ScrollTrigger measures
         against; Lenis is what would otherwise write the old value back over it
         on the next tick. */
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      return;
    }

    /* Back or forward. The browser restores on its own schedule, so the only
       job here is to stop Lenis fighting it once it has. */
    const id = requestAnimationFrame(() => {
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return null;
}
