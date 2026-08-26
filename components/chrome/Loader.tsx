'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { markLoaderCleared } from '@/lib/motion/loaderSignal';
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

/**
 * [new] — the aperture **operating**, on the first paint only.
 *
 * Sayandeep asked for the logo and the loader animated, then for this to be
 * *"more fluid and animatory"* than its first version. The first version drew
 * the ring by dash-offset and then popped the six blades in by scale — two
 * discrete events with a seam between them, which is exactly what it looked
 * like.
 *
 * This one is a **shutter spinning up**, which is what the glyph already is.
 * `50-brand-and-3d.md` §1 draws the aperture with its blades **retracted**: a
 * ring with six short radial ticks at its inner edge. So:
 *
 *   · the whole mark **rotates** through the sequence and eases to rest, so
 *     every part of it is moving at once and nothing waits its turn
 *   · the ring draws *while* it turns, so the stroke appears to be laid down by
 *     the rotation rather than by a separate animation
 *   · the blades **swing in rotationally** from a third of a turn back, on a
 *     stagger, overlapping the ring's tail — an iris opening, not six ticks
 *     appearing
 *   · a light **overshoot** at the end (`back.out`) so it settles like a
 *     mechanism rather than stopping like a keyframe
 *
 * It is a **separate timeline** from `loader.enter`, deliberately. `enter` is a
 * transcription of IX2 `a-23` and `verify:motion` asserts its exact shape —
 * five children, 0.6s, both tweens at `startTime 0`. Adding tweens to it would
 * mean either breaking that assertion or loosening it, and a loosened assertion
 * is how a transcription quietly stops being one. Ours runs first, then hands
 * over. See D-028.
 *
 * First visit only. On a route change the mark has already introduced itself
 * and a second of it again is a toll, not a flourish.
 */
/** The whole mark's rotation, and the spine everything else overlaps. */
const MARK_SPIN = 1.05;
/** How far back it starts, in degrees. Two blade stations plus a little. */
const MARK_SPIN_FROM = -140;
/** The ring's stroke, laid down while the mark turns. */
const MARK_DRAW = 0.85;
/** Each blade swinging into its station. */
const MARK_TICKS = 0.5;
const TICK_STAGGER = 0.06;

export function Loader() {
  const panelRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  const drawRef = useRef<gsap.core.Timeline | null>(null);
  /** The mark introduces itself once per session, not once per route. */
  const hasDrawn = useRef(false);
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
      /* The latch that Hero3D's load-in and phase 3's hero copy hang off.
         It fires from onComplete rather than from a fixed delay because the
         timeline is 0.6s normally and 0.2s under reduced motion — any hard
         number would be wrong in one of the two. See lib/motion/loaderSignal. */
      const enter = gsap.timeline({ paused: true, onComplete: markLoaderCleared });
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

      /* ── the mark draws itself ───────────────────────────────────────────
         See MARK_DRAW. Separate from `enter` so the IX2 transcription keeps its
         asserted shape.

         The ring is drawn with `stroke-dasharray` set to its own circumference
         and the offset animated to 0 — the standard SVG line-draw, and the
         reason the circumference is read from the element rather than computed
         here is that the mark's geometry lives in `ApertureMark` and this file
         should not have a second copy of it that can drift.

         The ticks scale from their outer end. `transform-origin` is set per
         tick in user units because each one is already carrying two rotations
         from the mark's own markup — a percentage origin would resolve against
         the rotated box and send them wandering. */
      const ring = mark.querySelector<SVGCircleElement>('[data-mark-ring]');
      const ticks = [...mark.querySelectorAll<SVGLineElement>('[data-mark-tick]')];

      const draw = gsap.timeline({ paused: true });
      const svg = mark.querySelector<SVGSVGElement>('svg');
      if (!reducedMotion && ring && svg && ticks.length > 0) {
        const circumference = ring.getTotalLength();

        draw
          .set(mark, { opacity: 1, scale: 1 })

          /* The spine. Everything else happens inside this turn, which is what
             makes the sequence read as one mechanism rather than as a list.
             `back.out` gives the settle a little overshoot — a shutter coming
             to rest against its stop. */
          .fromTo(
            svg,
            { rotate: MARK_SPIN_FROM, transformOrigin: '50% 50%' },
            { rotate: 0, duration: MARK_SPIN, ease: 'back.out(1.4)' },
            0,
          )

          /* The stroke is laid down BY the rotation: same start, and a shorter
             duration so the ring completes while the mark is still turning. */
          .fromTo(
            ring,
            { strokeDasharray: circumference, strokeDashoffset: circumference },
            { strokeDashoffset: 0, duration: MARK_DRAW, ease: 'power2.inOut' },
            0,
          )

          /* The blades swing into their stations rather than growing into
             them. Each tick already carries two rotations from the mark's own
             markup, so this one is added about the SVG's centre and GSAP
             composes it — which is why the origin is the box centre and not the
             tick's own anchor.

             They start a third of the way into the ring's draw. Waiting for the
             ring to finish is what made the first version feel like two
             animations. */
          .fromTo(
            ticks,
            { rotate: -55, opacity: 0, transformOrigin: '50% 50%', svgOrigin: '32 32' },
            {
              rotate: 0,
              opacity: 1,
              duration: MARK_TICKS,
              ease: 'power3.out',
              stagger: TICK_STAGGER,
            },
            MARK_DRAW * 0.3,
          )

          /* Hand back everything we borrowed. This element is mounted once in
             the root layout and never rebuilt, so a stroke left dashed stays
             dashed for every route change afterwards — and a rotation left on
             the svg would tilt the mark in the nav and the footer too. */
          .set(ring, { clearProps: 'strokeDasharray,strokeDashoffset' })
          .set(ticks, { clearProps: 'rotate,transformOrigin,svgOrigin' })
          .set(svg, { clearProps: 'rotate,transformOrigin' });
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
      if (hasEntered.current) {
        enter.progress(1).pause();
        // `progress(1)` does not fire onComplete, and the loader has in fact
        // already cleared — latch it directly so a rebuild cannot un-signal it.
        markLoaderCleared();
      }

      enterRef.current = enter;
      exitRef.current = exit;
      drawRef.current = draw;
      registerTimeline('loader.enter', enter);
      registerTimeline('loader.exit', exit);
      registerTimeline('loader.mark', draw);

      return () => {
        unregisterTimeline('loader.enter');
        unregisterTimeline('loader.exit');
        unregisterTimeline('loader.mark');
        enterRef.current = null;
        exitRef.current = null;
        drawRef.current = null;
      };
    },
    { scope: panelRef, dependencies: [reducedMotion] },
  );

  /* Enter runs on mount and on every route change — tonik fires `a-23` on
     PAGE_START, PAGE_SCROLL_UP and PAGE_FINISH alike. */
  useEffect(() => {
    const first = !hasEntered.current;
    hasEntered.current = true;

    /* First paint: the mark draws, then the panel sweeps. Every route change
       after that is the sweep alone — see MARK_DRAW on why. */
    if (first && !hasDrawn.current && drawRef.current && drawRef.current.duration() > 0) {
      hasDrawn.current = true;
      const draw = drawRef.current;
      draw.eventCallback('onComplete', () => enterRef.current?.restart());
      draw.restart();
      return;
    }

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
