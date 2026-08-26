'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import s from './Schematic.module.css';

/**
 * Three shapes, turning. `[new]` — ours, not tonik's.
 *
 * ── Why it exists ─────────────────────────────────────────────────────────
 *
 * The homepage is full of motion — a scrubbed word reveal, twelve card
 * reveals, a differential parallax, a marquee, six culture wipes, an accordion
 * — and every one of it is **reactive**. Nothing moves until you move, so the
 * moment you stop scrolling the page is a photograph. That is why it read as
 * bland with all that choreography in it.
 *
 * This is the one thing on the site that does not wait to be asked. It draws
 * itself once on arrival and then never stops.
 *
 * ── Why three shapes ──────────────────────────────────────────────────────
 *
 * The first version was a technical instrument: twenty-four rim ticks, four
 * broken arcs, a crosshair and a sweeping indicator. Sayandeep: *"way too
 * convoluted — make it simple, line arts, shapes."* He is right. Thirty
 * elements read as clutter however carefully they are arranged; three read as
 * a decision.
 *
 * A circle, a square and a triangle, nested, all on one hairline weight. They
 * turn at 90, 60 and 40 seconds a revolution, alternating direction, so the
 * three periods never come back into phase and the figure is never twice the
 * same. Slow enough that you notice it only if you look.
 *
 * **The circle is a 330° arc, not a closed ring**, and that is the one piece of
 * craft in the geometry: a closed circle rotating is indistinguishable from a
 * circle standing still, so the outermost shape would have been doing nothing
 * at all. The gap is what makes its rotation legible, and at 330° it still
 * reads as a circle rather than as an arc.
 *
 * Under reduced motion nothing draws and nothing turns — the three shapes are
 * simply there. Below 992px it is not rendered at all: it lives in a column
 * that does not exist on a phone.
 */

/** Seconds per revolution. Coprime enough that they never re-sync. */
const PERIODS = [90, 60, 40];
const C = 60;

export function Schematic({
  className,
  /** Registers the draw for `verify:motion`. One call site only. */
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
        const shapes = [...scope.querySelectorAll<SVGGElement>('[data-shape]')];
        const strokes = [...scope.querySelectorAll<SVGPathElement>('[data-draw]')];
        if (shapes.length === 0) return;

        /* ── the draw, once ───────────────────────────────────────────────
           Outermost first, on a stagger, so the figure assembles inward. */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: scope, start: 'top 85%', once: true },
        });

        strokes.forEach((stroke, i) => {
          const length = stroke.getTotalLength();
          tl.fromTo(
            stroke,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: DUR.slower, ease: EASE.out },
            i * 0.12,
          );
        });

        if (timelineId) registerTimeline(timelineId, tl);

        /* ── and then they turn, forever ──────────────────────────────────
           Plain `gsap.to` on the shared ticker — not a second rAF, which
           CLAUDE.md forbids and verify:motion enforces. */
        const spins = shapes.map((shape, i) =>
          gsap.to(shape, {
            rotation: i % 2 === 0 ? 360 : -360,
            duration: PERIODS[i] ?? 60,
            ease: 'none',
            repeat: -1,
            transformOrigin: '50% 50%',
            svgOrigin: `${C} ${C}`,
          }),
        );

        return () => {
          if (timelineId) unregisterTimeline(timelineId);
          tl.scrollTrigger?.kill();
          tl.kill();
          spins.forEach((t) => t.kill());
          gsap.set(shapes, { clearProps: 'transform' });
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={[s.schematic, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" focusable="false">
        {/* Outermost: a 330° arc. See the note above on why it is not closed. */}
        <g data-shape>
          <path
            data-draw
            d="M 60 14 A 46 46 0 1 1 36.2 20.6"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* A square, inscribed comfortably inside the circle: half-diagonal is
            39.6 against the circle's 46, so it never touches. */}
        <g data-shape>
          <rect data-draw x="32" y="32" width="56" height="56" strokeWidth="0.8" />
        </g>

        {/* A triangle on a 24 circumradius, point up. */}
        <g data-shape>
          <path data-draw d="M 60 36 L 80.8 72 L 39.2 72 Z" strokeWidth="0.8" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
