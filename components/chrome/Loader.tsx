'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { useMotion } from '@/lib/motion/MotionProvider';
import { ApertureMark } from '@/components/brand/ApertureMark';
import { cx } from '@/lib/cx';
import s from './Loader.module.css';

/**
 * <Loader /> — docs/spec/20-components-and-motion.md §1.
 *
 * Two timelines, both built once and paused, per 10-design-system.md §5 rule 3.
 *
 *  · **enter** — the panel sweeps up off the page. Transcribed from IX2 `a-23`
 *    "preload-load-animation-in". The mark fade and the panel slide start
 *    together (`'<'`): in the recovered action list they are two items of the
 *    *same* actionItemGroup, and IX2 runs a group concurrently. Total 0.6s, not
 *    0.4 + 0.6. See I-010 — the harness had 1.0s seeded from the verification
 *    doc, and the recovered source settles it.
 *
 *  · **exit** — the panel sweeps up *over* the outgoing page before the router
 *    navigates. `100 → 0`, which is our one deliberate correction to tonik: they
 *    animate `200 → 100`, leaving the panel below the fold, so their exit tween
 *    is invisible and the handoff can flash.
 *
 * Under reduced motion both become a 200ms opacity fade with no transform.
 */

/** [new] — the reduced-motion fade, 200ms both directions. Not a DUR token: the
 *  vocabulary in 10-design-system.md §5 has no 0.2, and verify:motion rejects
 *  additions to it. */
const REDUCED_FADE = 0.2;

export function Loader() {
  const panelRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  /** Where the intercepted click was going. Read by the exit's onComplete. */
  const pendingHref = useRef<string | null>(null);
  /** False until the first enter has run, so a rebuild does not re-cover the page. */
  const hasEntered = useRef(false);

  const { reducedMotion } = useMotion();
  const router = useRouter();
  const pathname = usePathname();

  useGSAP(
    () => {
      const panel = panelRef.current;
      const mark = markRef.current;
      if (!panel || !mark) return;

      const navigate = () => {
        const href = pendingHref.current;
        pendingHref.current = null;
        if (href) router.push(href);
      };

      /* ── enter ───────────────────────────────────────────────────────────
         The trailing reset restores `scale` as well as `opacity`. tonik's does
         not need to: Barba throws their loader element away and builds a new
         one per page, so its scale resets for free. Ours is mounted once in the
         root layout and survives every route change, so a mark left at 0.5
         would make the second page's fade start half-size. */
      const enter = gsap.timeline({ paused: true });
      if (reducedMotion) {
        enter
          .set(panel, { display: 'flex', yPercent: 0, opacity: 1 })
          .to(panel, { opacity: 0, duration: REDUCED_FADE, ease: EASE.linear })
          .set(panel, { display: 'none' })
          .set(mark, { opacity: 1, scale: 1 });
      } else {
        enter
          .set(panel, { display: 'flex', yPercent: 0, opacity: 1 })
          .to(mark, { opacity: 0, scale: 0.5, duration: DUR.base, ease: EASE.quad })
          .to(panel, { yPercent: -100, duration: DUR.slow, ease: EASE.quad }, '<')
          .set(panel, { display: 'none' })
          .set(mark, { opacity: 1, scale: 1 });
      }

      /* ── exit ────────────────────────────────────────────────────────────
         Built paused and restarted per click rather than created inside the
         handler, so it can be registered and asserted. */
      const exit = gsap.timeline({ paused: true, onComplete: navigate });
      if (reducedMotion) {
        exit
          .set(panel, { display: 'flex', yPercent: 0, opacity: 0 })
          .set(mark, { opacity: 1, scale: 1 })
          .to(panel, { opacity: 1, duration: REDUCED_FADE, ease: EASE.linear });
      } else {
        exit
          .set(panel, { yPercent: 100, display: 'flex', opacity: 1 })
          .set(mark, { opacity: 1, scale: 1 })
          .to(panel, { yPercent: 0, duration: DUR.mid, ease: EASE.out });
      }

      /* A rebuild — the visitor toggled prefers-reduced-motion mid-session —
         reverts GSAP's inline styles, which puts the panel back over the page.
         Jump the fresh timeline to its end so it stays gone. */
      if (hasEntered.current) enter.progress(1).pause();

      enterRef.current = enter;
      exitRef.current = exit;
      registerTimeline('loader.enter', enter);
      registerTimeline('loader.exit', exit);

      return () => {
        unregisterTimeline('loader.enter');
        unregisterTimeline('loader.exit');
        enterRef.current = null;
        exitRef.current = null;
      };
    },
    { scope: panelRef, dependencies: [reducedMotion] },
  );

  /* Enter runs on mount and on every route change — tonik fires `a-23` on
     PAGE_START, PAGE_SCROLL_UP and PAGE_FINISH alike. */
  useEffect(() => {
    hasEntered.current = true;
    enterRef.current?.restart();
  }, [pathname]);

  /* ── link interception ──────────────────────────────────────────────────
     Delegated at the document, so every internal link on the site is covered
     without any component having to opt in. `data-no-loader` opts out. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.dataset.noLoader !== undefined) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same document — an in-page hash. The router is not involved and neither
      // are we; covering the page for an anchor jump would be absurd.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      pendingHref.current = `${url.pathname}${url.search}${url.hash}`;
      exitRef.current?.restart();
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* bfcache guard [src]. Restoring from the back/forward cache replays the DOM
     exactly as it was left — including a loader mid-sweep. */
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) gsap.set(panelRef.current, { display: 'none' });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return (
    <>
      {/* Without JS the enter timeline never runs, and the panel would cover the
          page forever. The markup is inert to assistive tech either way. */}
      <noscript>
        <style>{`.loader { display: none !important; }`}</style>
      </noscript>
      <div ref={panelRef} className={cx(s.loader, 'loader')} aria-hidden="true">
        <div ref={markRef} className={cx(s.mark, 'loader__mark')}>
          <ApertureMark />
        </div>
      </div>
    </>
  );
}
