'use client';

import { useId, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import s from './Schematic.module.css';

/**
 * A field of straight lines. `[new]` — ours, not tonik's.
 *
 * ── Why it exists ─────────────────────────────────────────────────────────
 *
 * Every other motion on the homepage is **reactive** — the scrubbed word
 * reveal, twelve card reveals, the differential parallax, the marquee, the
 * culture wipes, the accordion. Nothing moves until you move, so the instant
 * you stop scrolling the page is a photograph. That is why it read as bland
 * with all that choreography in it.
 *
 * This is the one thing on the site that does not wait to be asked.
 *
 * ── Third design, and this one is the brief ───────────────────────────────
 *
 * It was a technical instrument first — twenty-four rim ticks, four broken
 * arcs, a crosshair, a sweeping indicator — and Sayandeep called it convoluted.
 * Then three nested shapes, which he also did not want. The brief he gave for
 * this one is exact: *"sharp straight lines that fade in background."*
 *
 * So: **nothing but straight lines.** No arcs, no closed shapes, no glyph.
 * Twenty-two horizontal rules, all the same weight, left-aligned on a common
 * margin.
 *
 * They form a **right triangle**: all flush on one edge, the top line full
 * width, each one below shorter by the same amount — so the flush edge and the
 * top line meet at 90° and the falling ends make the hypotenuse. Twenty-two
 * straight lines and no diagonal anywhere, describing a shape that is mostly
 * diagonal. That is the studio's argument in a figure, and it costs a
 * subtraction per line.
 *
 * The page carries **two**, mirrored, one against each margin. See `mirrored`.
 *
 * **The fade is a mask, not an opacity.** A gradient mask across the whole
 * field makes each line dissolve *into the ground* at its own ends rather than
 * making all of them uniformly faint, so the lines stay sharp where they are
 * visible. Fading the strokes instead would have made them grey rather than
 * absent, which is the difference between receding and being washed out.
 *
 * Under reduced motion nothing draws and nothing travels — the field is simply
 * there. Below 992px it is not rendered: it lives in a column that does not
 * exist on a phone.
 */

const LINES = 22;
const VIEW = 120;
/** Where every line begins. A common left margin is what makes them a field. */
const LEFT = 6;
const RIGHT_MAX = 114;
/** Seconds for the highlight to travel the field once. */
const TRAVEL = 5.5;

/**
 * Line `i`'s far end.
 *
 * A **linear** ramp, which makes the field a right triangle: every line starts
 * on the same edge, the top one is full width, and each one below is shorter by
 * the same amount. Those two facts put a 90° corner where the flush edge meets
 * the top line, and the falling ends form the hypotenuse.
 *
 * It was a pair of sines before — the ends traced a curve, which was a nice
 * idea and not the one asked for. Sayandeep: *"instead of the wave create a
 * triangle where the top right corner is a right angle."* Confirmed with him
 * that the flush edge is the LEFT one, so the corner lands at top-left in the
 * default orientation and at top-right when the figure is mirrored — which is
 * what the right-hand instance is for.
 *
 * Deterministic, obviously, but worth stating: no `Math.random` anywhere, so
 * the server and the client agree and a screenshot diff is stable between runs.
 */
function endOf(i: number): number {
  const t = i / (LINES - 1);
  /* Never quite zero. A final line of no length is a gap in the stack rather
     than the point of a triangle. */
  const extent = Math.max(0.04, 1 - t);
  return LEFT + (RIGHT_MAX - LEFT) * extent;
}

export function Schematic({
  className,
  /**
   * Flip the figure horizontally, so the flush edge and its right angle land on
   * the right instead of the left.
   *
   * A CSS `scaleX(-1)` on the wrapper rather than a second set of coordinates:
   * the geometry is identical and mirrored, and two copies of the same maths
   * with the signs changed is two places for it to drift. It also means the
   * draw still runs left-to-right in the figure's own space, which after the
   * flip reads as right-to-left — the two instances animate towards each other,
   * which is the reason to have a pair at all.
   */
  mirrored = false,
  /** Registers the draw for `verify:motion`. One call site only. */
  timelineId,
}: {
  className?: string;
  mirrored?: boolean;
  timelineId?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  /* `useId` rather than a constant: two of these render on the homepage, and
     two identical `<mask id>`s means the second one wins for both. */
  const maskId = `schematic-fade-${useId().replace(/:/g, '')}`;

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        const lines = [...scope.querySelectorAll<SVGLineElement>('[data-line]')];
        if (lines.length === 0) return;

        /* ── the draw, once ───────────────────────────────────────────────
           Each line extends from its left margin to its own length, top to
           bottom on a tight stagger. `scaleX` from the left edge rather than an
           `x2` tween: it is one composited property per line rather than a
           layout-affecting attribute, and the ends are the only thing moving. */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: scope, start: 'top 85%', once: true },
        });

        tl.fromTo(
          lines,
          { scaleX: 0, transformOrigin: '0% 50%', svgOrigin: `${LEFT} 0` },
          {
            scaleX: 1,
            duration: DUR.slower,
            ease: EASE.out,
            stagger: 0.022,
          },
        );

        if (timelineId) registerTimeline(timelineId, tl);

        /* ── and then it never stops ────────────────────────────────────────
           A band of slightly brighter lines travels down the field and wraps.
           It is the only continuous motion on the page, and it is deliberately
           almost nothing: four lines lifted from 0.35 to 1 as it passes.

           Driven by one tween on a plain object rather than by twenty-two
           staggered repeating tweens — one interpolation, twenty-two writes,
           and nothing to fall out of phase. */
        const head = { at: 0 };
        const setters = lines.map((line) => gsap.quickSetter(line, 'opacity'));

        const paint = () => {
          for (let i = 0; i < lines.length; i += 1) {
            /* Distance from the travelling head, wrapped, so the band crosses
               the bottom edge and reappears at the top without a seam. */
            const raw = Math.abs(i - head.at);
            const distance = Math.min(raw, lines.length - raw);
            const lit = Math.max(0, 1 - distance / 4);
            setters[i]?.(0.35 + lit * 0.65);
          }
        };

        const travel = gsap.to(head, {
          at: lines.length,
          duration: TRAVEL,
          ease: 'none',
          repeat: -1,
          onUpdate: paint,
        });

        return () => {
          if (timelineId) unregisterTimeline(timelineId);
          tl.scrollTrigger?.kill();
          tl.kill();
          travel.kill();
          gsap.set(lines, { clearProps: 'opacity,transform' });
        };
      });

      /* No cleanup returned. `useGSAP` reverts its context, and the matchMedia
         created inside it reverts with it — running every `mm.add()` cleanup
         exactly once. An explicit `mm.revert()` here ran them twice, and a
         second kill on an already-removed ScrollTrigger splices `_triggers` a
         second time. That array is what `ScrollTrigger.create()` walks, and a
         hole in it is `curTrigger is undefined`. See I-051. */
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={[s.schematic, mirrored ? s.mirrored : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} focusable="false">
        <defs>
          {/* The fade. White is opaque, black is invisible — so the field
              dissolves into the ground at the top, the bottom and the right
              rather than being uniformly dimmed. The lines stay sharp wherever
              they are visible at all, which is the point. */}
          <linearGradient id={`${maskId}-v`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="18%" stopColor="#fff" />
            <stop offset="72%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <linearGradient id={`${maskId}-h`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="62%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>

          <mask id={maskId}>
            <rect width={VIEW} height={VIEW} fill={`url(#${maskId}-v)`} />
            <rect width={VIEW} height={VIEW} fill={`url(#${maskId}-h)`} style={{ mixBlendMode: 'multiply' }} />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`} stroke="currentColor" strokeWidth="1" strokeLinecap="butt">
          {Array.from({ length: LINES }, (_, i) => {
            /* +0.5 puts each rule on a half-pixel of the viewBox, which is
               where a 1-unit stroke lands on a whole device pixel instead of
               straddling two. Sharp lines, as asked, rather than grey ones. */
            const y = ((i + 0.5) * VIEW) / LINES;
            return (
              <line
                key={i}
                data-line
                x1={LEFT}
                y1={y.toFixed(2)}
                x2={endOf(i).toFixed(2)}
                y2={y.toFixed(2)}
                opacity="0.35"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
