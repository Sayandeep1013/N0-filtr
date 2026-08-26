'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import s from './Schematic.module.css';

/**
 * An animated schematic. `[new]` — ours, not tonik's.
 *
 * ── Why it exists ─────────────────────────────────────────────────────────
 *
 * Sayandeep, on the finished homepage: *"show some SVG animation in the page —
 * no animation at all seems very bland. Suitable animations are needed."*
 *
 * He is right about the symptom and it is worth being precise about the cause.
 * The page is *full* of motion — a scrubbed word reveal, twelve card reveals, a
 * differential parallax, a marquee, six culture wipes, an accordion. But every
 * one of those is **reactive**: nothing moves until you move, and a page that
 * is perfectly still whenever you stop scrolling reads as static no matter how
 * much choreography it has.
 *
 * So this is the opposite kind of motion, and the only one on the site: it
 * **draws itself once** on arrival and then **never stops**. A slow rotation
 * the eye barely catches, and an indicator that sweeps the ring like something
 * being measured. It gives the page a pulse.
 *
 * ── Why this figure ───────────────────────────────────────────────────────
 *
 * It has to sit beside the aperture without competing with it, so it borrows
 * the mark's vocabulary — concentric rings, radial ticks, everything on the
 * same hairline weight — and deliberately breaks its silhouette: **broken arcs
 * rather than closed circles, and twenty-four ticks rather than six.** Close
 * enough to be family, far enough that nobody reads it as the logo.
 *
 * Under reduced motion it draws nothing and rotates nothing: the figure simply
 * is. Under 992px it is hidden entirely — it lives in a column that does not
 * exist on a phone.
 */

/** Ticks around the outer rim. Not six: six would read as the mark. */
const TICK_COUNT = 24;
/** Degrees per second of the idle rotation. Slow enough to doubt. */
const IDLE_DEG_PER_SECOND = 2.4;
/** Seconds for the indicator to travel once around. */
const SWEEP_PERIOD = 9;

const C = 60;

/** Polar → cartesian on the SVG's own grid. */
function point(angleDeg: number, radius: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
}

/** An arc path between two angles, drawn clockwise. */
function arc(from: number, to: number, radius: number): string {
  const [x1, y1] = point(from, radius);
  const [x2, y2] = point(to, radius);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function Schematic({
  className,
  /** Registers the timeline for `verify:motion`. One call site only. */
  timelineId,
}: {
  className?: string;
  timelineId?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        const strokes = [...scope.querySelectorAll<SVGPathElement | SVGCircleElement>('[data-draw]')];
        const ticks = [...scope.querySelectorAll<SVGLineElement>('[data-tick]')];
        const rim = scope.querySelector<SVGGElement>('[data-rim]');
        const sweep = scope.querySelector<SVGGElement>('[data-sweep]');

        /* ── the draw, once, on arrival ─────────────────────────────────── */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: scope, start: 'top 85%', once: true },
        });

        for (const stroke of strokes) {
          const length = stroke.getTotalLength();
          tl.fromTo(
            stroke,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: DUR.wipe, ease: EASE.out },
            /* Every arc starts together and they differ in length, so the
               longer ones simply take longer — the figure resolves outward
               without anything having to wait for anything. */
            0,
          );
        }

        tl.fromTo(
          ticks,
          { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', svgOrigin: `${C} ${C}` },
          { opacity: 1, scale: 1, duration: DUR.mid, ease: EASE.out, stagger: 0.012 },
          0.15,
        );

        if (timelineId) registerTimeline(timelineId, tl);

        /* ── and then it never stops ────────────────────────────────────── */
        const idle = gsap.to(rim, {
          rotation: 360,
          duration: 360 / IDLE_DEG_PER_SECOND,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50%',
          svgOrigin: `${C} ${C}`,
        });

        const orbit = gsap.to(sweep, {
          rotation: 360,
          duration: SWEEP_PERIOD,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50%',
          svgOrigin: `${C} ${C}`,
        });

        return () => {
          if (timelineId) unregisterTimeline(timelineId);
          tl.scrollTrigger?.kill();
          tl.kill();
          idle.kill();
          orbit.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={[s.schematic, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" focusable="false">
        {/* The rim: twenty-four ticks that turn, forever. */}
        <g data-rim>
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const angle = (i / TICK_COUNT) * 360;
            /* Every sixth tick is long — a quadrant marker, so the slow
               rotation is readable rather than a uniform blur. */
            const long = i % 6 === 0;
            const [x1, y1] = point(angle, long ? 47 : 51);
            const [x2, y2] = point(angle, 55);
            return (
              <line
                key={angle}
                data-tick
                x1={x1.toFixed(2)}
                y1={y1.toFixed(2)}
                x2={x2.toFixed(2)}
                y2={y2.toFixed(2)}
                strokeWidth={long ? 0.9 : 0.5}
                opacity={long ? 0.85 : 0.45}
              />
            );
          })}
        </g>

        {/* Broken arcs, not closed rings. This is what keeps it from reading
            as the aperture. */}
        <path data-draw d={arc(-130, 110, 40)} strokeWidth="0.9" opacity="0.7" />
        <path data-draw d={arc(150, 320, 40)} strokeWidth="0.9" opacity="0.35" />
        <path data-draw d={arc(-60, 200, 27)} strokeWidth="0.6" opacity="0.55" />
        <path data-draw d={arc(30, 140, 14)} strokeWidth="0.6" opacity="0.8" />

        {/* The crosshair. Two hairlines that stop short of the centre, so the
            middle stays open the way the mark's bore does. */}
        <path data-draw d={`M ${C} 18 L ${C} 46 M ${C} 74 L ${C} 102`} strokeWidth="0.4" opacity="0.3" />
        <path data-draw d={`M 18 ${C} L 46 ${C} M 74 ${C} L 102 ${C}`} strokeWidth="0.4" opacity="0.3" />

        {/* The indicator, sweeping the ring like something being measured. */}
        <g data-sweep>
          <path d={arc(-8, 8, 46)} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1={C} y1={14} x2={C} y2={22} strokeWidth="0.6" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
