'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, MQ } from '@/lib/motion/tokens';
import { PIT_ACCENTS } from '@/lib/content/pit';
import { cx } from '@/lib/cx';
import { Wordmark } from './Wordmark';
import s from './HollowMark.module.css';

/**
 * The footer wordmark, drawn hollow and lit local to the pointer. `[new]`.
 *
 * Sayandeep brought a reference: *"the hollow letter for the footer no filter
 * and when u hover over it the blue hue appears .. for our a different hue
 * appears."* In the reference the hue sits on two letters and nowhere else —
 * it is a **local** light, not a hover state on the word.
 *
 * ── How it is drawn ─────────────────────────────────────────────────────────
 *
 * Two stacked copies of the same word. The lower one is the hollow mark:
 * transparent fill, hairline stroke. The upper one is identical but stroked in
 * the accent, and masked by a radial gradient that follows the pointer — so
 * only the strokes near the pointer take the colour, and the letters far from
 * it stay grey. A `:hover` rule cannot do this; it would light the whole word.
 *
 * The second copy is `aria-hidden` and carries no readable text, so a screen
 * reader still hears "No Filter" exactly once.
 *
 * ── Where the colour comes from ─────────────────────────────────────────────
 *
 * **A case study lends its own accent.** `<CaseStudy>` writes `--accent-ink`
 * onto the document element as an inline style while a work is open, so
 * standing in Tessera's footer lights the mark in Tessera's blue and DroidDoodle
 * in its violet. Nothing new is introduced — it is the accent system that
 * already themes those pages, spent one more time.
 *
 * **Everywhere else it cycles the twelve.** Sayandeep chose cycling over a
 * single house colour for the pages with no work behind them. The list is
 * `PIT_ACCENTS` rather than a second copy of the same twelve values: the pit
 * already draws from it, and §2's note that the pit is "the only other place on
 * the site where those colours appear together" now has one more member.
 *
 * The swap is a crossfade rather than a cut — `--wordmark-hue` is transitioned,
 * at `DUR.slower`, which the token table already calls the accent crossfade.
 *
 * ── What is gated, and what is not ──────────────────────────────────────────
 *
 * The glow needs a pointer, so it is desktop-only; below 992 the mark is simply
 * hollow, which is the part of the design that does not depend on input.
 *
 * Under `prefers-reduced-motion` the glow **stays** and the cycling stops. A
 * light that answers the pointer is direct manipulation, the same class of
 * thing as a hover, and this site keeps its hovers under `reduce`. A colour
 * that changes on its own with nobody touching it is not, so that is the half
 * that goes.
 */
export function HollowMark({ className }: { className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add({ wide: MQ.desktop, reduced: MQ.reduced }, (context) => {
        const { wide, reduced } = context.conditions as Record<string, boolean | undefined>;
        if (!wide) return undefined;

        const glow = scope.querySelector<HTMLElement>(`.${s.glow}`);
        if (!glow) return undefined;

        const setX = gsap.quickSetter(glow, '--mx', 'px') as (v: number) => void;
        const setY = gsap.quickSetter(glow, '--my', 'px') as (v: number) => void;

        /* Tracked on the window rather than on the mark itself, because the
           block pit is laid over this wordmark (D-050) and, although its stage
           takes no pointer events, the tiles inside it do. A listener on the
           mark would go quiet the moment the pointer crossed a tile — which is
           most of the word. */
        let visible = false;
        const onMove = (event: PointerEvent) => {
          if (!visible) return;
          const box = scope.getBoundingClientRect();
          setX(event.clientX - box.left);
          setY(event.clientY - box.top);
        };

        /* And only while the footer is actually on screen. Two style writes per
           pointer move is cheap, but not cheap enough to spend on every move
           made three pages further up. */
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) visible = entry.isIntersecting;
          },
          { rootMargin: '20% 0px' },
        );
        io.observe(scope);
        window.addEventListener('pointermove', onMove, { passive: true });

        /* The cycle. A repeating timeline rather than an interval, so it rides
           the one ticker and reverts with this context. */
        let cycle: gsap.core.Timeline | undefined;
        if (!reduced && PIT_ACCENTS.length > 0) {
          cycle = gsap.timeline({ repeat: -1 });
          for (const accent of PIT_ACCENTS) {
            cycle
              .call(() => {
                /* A work's own accent wins for as long as it is set. Read from
                   the inline style, not the computed value: `<CaseStudy>` writes
                   there, and the computed value always resolves to something. */
                if (document.documentElement.style.getPropertyValue('--accent-ink')) return;
                scope.style.setProperty('--wordmark-hue', accent);
              })
              .to({}, { duration: 3.2 });
          }
        }

        return () => {
          io.disconnect();
          window.removeEventListener('pointermove', onMove);
          cycle?.kill();
          scope.style.removeProperty('--wordmark-hue');
        };
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className={cx(s.mark, className)}>
      <Wordmark className={s.layer} />
      <Wordmark className={cx(s.layer, s.glow)} decorative />
    </span>
  );
}

/** Exported for the behaviour harness, which asserts the crossfade length. */
export const HOLLOW_MARK_CROSSFADE = DUR.slower;
