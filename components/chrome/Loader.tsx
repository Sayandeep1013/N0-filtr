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
 * [new] — **the iris opens.** First paint only.
 *
 * The mark drew itself here, twice: a dash-offset stroke, then a rotating
 * version of the same. Sayandeep called both, and he was right — dash-drawing a
 * hairline on a 5rem mark is scratchy, and "the logo appears" is a thing done
 * *to* a logo rather than something the logo does.
 *
 * `50-brand-and-3d.md` §1 draws the aperture **with its blades retracted**: a
 * ring, and six short blades sitting at its inner edge. The mark is a shutter
 * that has already opened. So the loader is simply that mechanism arriving at
 * the pose the mark is drawn in — the blades start closed over the bore and
 * retract to their stations, turning as they go.
 *
 * Nothing is drawn. The ring is present from the first frame, because it is
 * present in the mark; only the blades move, and they move the one way a real
 * iris moves. A visitor who watches it once knows what the logo is.
 *
 * ── Two motions, both starting at zero ────────────────────────────────────
 *
 *   · the blade group **turns** −40° → 0 over 0.9s (`power3.out`)
 *   · each blade **retracts**, its far end travelling from the bore's centre
 *     out to its rest length, over 0.75s (`power2.inOut`)
 *
 * In unison, not staggered. Six blades opening one after another is a fan; six
 * opening together is a shutter, and the turn is what keeps it from reading as
 * a simple scale.
 *
 * It is a **separate timeline** from `loader.enter`, deliberately. `enter` is a
 * transcription of IX2 `a-23` and `verify:motion` asserts its exact shape.
 * Adding to it would mean either breaking that assertion or loosening it, and a
 * loosened assertion is how a transcription quietly stops being one. See D-030.
 *
 * First visit only. On a route change the mark has already introduced itself.
 */
/* ── the accent tint on the way out ─────────────────────────────────────────
   `01-PHASES.md` T6.7, and `10-design-system.md` §2: *"the outgoing loader tints
   to `darken(accent, 10%)` before navigating, so the colour lands before the
   page does."*

   The effect is small and the reason is not: a case study sets `--accent` on
   mount, which is *after* the loader has already swept up in the page's default
   grey. Tinting the panel on the way out means the visitor sees the work's
   colour during the transition rather than a beat after it, and the case-study
   page appears to have been the colour it is all along.

   Which links carry it: any anchor with `data-accent`. The work cards and
   `<NextWork>` set it; nothing else on the site has an accent to declare, and
   an anchor without one gets the default panel. */

/** `#125C91` → `#105283`. Multiplies each channel by 0.9, per §2's darken(10%). */
function darken(hex: string, amount = 0.1): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const value = Number.parseInt(match[1]!, 16);
  const scale = (channel: number) => Math.round(channel * (1 - amount));
  const r = scale((value >> 16) & 0xff);
  const g = scale((value >> 8) & 0xff);
  const b = scale(value & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** The blade group's turn, and the spine of the sequence. */
const IRIS_TURN = 0.9;
/** How far back the blades start, in degrees. */
const IRIS_TURN_FROM = -40;
/** The retraction. Shorter than the turn, so the mechanism settles into it. */
const IRIS_RETRACT = 0.75;

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
      const ticks = [...mark.querySelectorAll<SVGLineElement>('[data-mark-tick]')];

      const draw = gsap.timeline({ paused: true });
      const svg = mark.querySelector<SVGSVGElement>('svg');
      const blades = mark.querySelector<SVGGElement>('[data-mark-blades]');

      if (!reducedMotion && svg && blades && ticks.length > 0) {
        /* The bore's centre and each blade's rest length, read off the elements
           rather than duplicated here. `ApertureMark` owns the geometry, and a
           second copy of it in this file is a copy that can drift. */
        const centre = svg.viewBox.baseVal.width / 2;
        /* Both coordinates, not just `y2`.

           The blades used to be drawn straight up from the ring and swung into
           place by a `transform`, so "retracted to the bore" was a change in
           `y2` alone. The mark is tilted now and each blade's endpoints are
           computed as points (D-033), so every one of the six lies at its own
           angle — moving only `y2` would drag the far ends vertically towards a
           line rather than inwards towards the bore, and the iris would close
           into a slot. */
        const rest = ticks.map((tick) => ({
          x2: Number(tick.getAttribute('x2')),
          y2: Number(tick.getAttribute('y2')),
        }));

        draw
          .set(mark, { opacity: 1, scale: 1 })

          /* The turn. `power3.out` so it arrives quickly and settles slowly,
             which is what a sprung mechanism does. */
          .fromTo(
            blades,
            { rotate: IRIS_TURN_FROM, transformOrigin: '50% 50%', svgOrigin: `${centre} ${centre}` },
            { rotate: 0, duration: IRIS_TURN, ease: 'power3.out' },
            0,
          )

          /* The retraction. Each blade's far end travels from the centre of the
             bore out to its own rest length. `y2` is animated as an ATTRIBUTE
             rather than as a transform: the blades already carry two rotations
             from the mark's own markup, and a scale composed on top of those
             would shear them off their radial line. Moving the endpoint keeps
             every blade exactly on its own axis, which is the whole point of
             the geometry §1 specifies.

             `power2.inOut` rather than an out-ease: an iris does not snap open,
             it eases out of the closed position and eases into the open one. */
          .fromTo(
            ticks,
            { attr: { x2: centre, y2: centre } },
            {
              attr: {
                x2: (i: number) => rest[i]?.x2 ?? centre,
                y2: (i: number) => rest[i]?.y2 ?? centre,
              },
              duration: IRIS_RETRACT,
              ease: 'power2.inOut',
            },
            0,
          )

          /* Hand everything back. The loader is mounted once in the root layout
             and never rebuilt, so a rotation left on the blade group would tilt
             the same mark in the navbar and the footer, and a `y2` left short
             would leave the logo's blades the wrong length for the session. */
          .set(blades, { clearProps: 'rotate,transformOrigin,svgOrigin' })
          .set(ticks, { clearProps: 'attr' });
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

    /* The tint belongs to the transition, not to the page. Cleared here rather
       than in the exit's onComplete because the exit completes *before* the
       route resolves, and clearing it there would show the grey panel again for
       the length of a navigation. */
    const panel = panelRef.current;
    return () => {
      if (panel) panel.style.backgroundColor = '';
    };
  }, [pathname]);

  /* ── link interception ──────────────────────────────────────────────────
     Delegated at the document, so every internal link on the site is covered
     without any component having to opt in. `data-no-loader` opts out.

     ── It listens in the CAPTURE phase, and that is load-bearing ──────────

     It was a bubble-phase listener until phase 6, and **the exit timeline never
     ran once in five phases.** React attaches its own listeners to the root
     container, which is a descendant of `document`, so on the way *up* React
     sees the click first — and `next/link`'s handler calls `preventDefault()`
     and routes. By the time this listener ran, `event.defaultPrevented` was
     already true and the first guard below sent it home.

     Nothing looked wrong, which is why it survived: `enter` fires on every
     pathname change, so the loader still swept on arrival. What was missing was
     the sweep *before* leaving — and, once T6.7 existed, the accent tint that
     rides on it. `behaviour.case.ts` caught it by asserting the tint.

     Capture means this runs before React, so `stopPropagation()` below is what
     stops `<Link>` navigating out from under the animation. `preventDefault()`
     alone is not enough: it suppresses the browser's navigation, not React's. */
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
      /* Keeps the click away from `<Link>`'s own handler — see the note above.
         Only for anchors this listener is actually taking over; anything that
         reached one of the `return`s above is left entirely alone. */
      event.stopPropagation();
      pendingHref.current = `${url.pathname}${url.search}${url.hash}`;

      /* T6.7. Set before the exit restarts, so the sweep is already the right
         colour on its first frame rather than crossfading into it. Cleared on
         arrival by the effect below — a tint left behind would make the *next*
         navigation, to anywhere, sweep up in the last work's blue. */
      const panel = panelRef.current;
      if (panel) {
        const accent = anchor.dataset.accent;
        panel.style.backgroundColor = accent ? darken(accent) : '';
      }

      exitRef.current?.restart();
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
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
