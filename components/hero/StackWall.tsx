'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { STACK, STACK_LABEL } from '@/lib/content/site';
import s from './StackWall.module.css';

/**
 * The stack wall. `20-components-and-motion.md` §11, `40-content-model.md` §6.
 *
 * It sits inside the hero section, below the first viewport fold —
 * `30-page-specs.md` §1 puts it there and gives the whole section 1361px at a
 * 900 viewport, which is 900 of hero and 461 of wall. It replaces tonik's
 * client-logo wall: their marks are clients, ours are tools.
 *
 * **Two behaviours, one markup.**
 *
 * `≥768` — a static centred flex-wrap grid at `opacity: .7`, `gap: 3rem 4rem`,
 * hovering a mark takes it to 1.
 *
 * `≤767` — the same track becomes an infinite marquee. tonik drive theirs with
 * Splide's auto-scroll (`speed: .8, pauseOnHover: false, autoWidth: true,
 * loop: true`); §11 says to do it with a GSAP loop and no library, which is one
 * tween:
 *
 * ```js
 * gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
 * ```
 *
 * `-50%` of a track that holds the set **twice** is exactly one set, so the
 * wrap is invisible. That is the whole trick, and it is why the clone below is
 * not decoration — remove it and the marquee jumps once per lap.
 *
 * ── Why the clone is in the markup rather than added by the marquee ─────────
 *
 * Because it has to be there before hydration. Rendering it only when the
 * marquee is live would mean a client-only DOM change on every phone visit,
 * and the wall is above the fold on a 390 viewport. It is `aria-hidden` — a
 * screen reader must not read twenty-two tools twice — and CSS hides it
 * outright wherever the marquee does not run, which is `≥768` and under
 * reduced motion at any width.
 *
 * ── Reduced motion ─────────────────────────────────────────────────────────
 *
 * The marquee does not run, and the track wraps instead of overflowing. That is
 * not a degraded state: a wrapped list of the same twenty-two names is the same
 * information sitting still. CLAUDE.md §8.
 */
export function StackWall() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      /* Composed, not nested — see the note in RevealText. §11 gates the
         marquee at ≤767; CLAUDE.md §8 gates it again on no-preference. */
      mm.add(`(max-width: 767px) and ${MQ.noPreference}`, () => {
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(el, { xPercent: -50, duration: 30, ease: 'none' });

        registerTimeline('stack-wall.marquee', tl);
        return () => unregisterTimeline('stack-wall.marquee');
      });

      /* No cleanup returned, and that is the fix rather than an omission.

         `useGSAP` reverts its own context on unmount, and a `gsap.matchMedia()`
         created inside that context is reverted **with** it — which runs every
         `mm.add()` cleanup exactly once. An explicit `mm.revert()` here made
         that happen twice, and a second `ScrollTrigger.kill()` on an instance
         already removed from `_triggers` splices the array a second time.

         That array is what `ScrollTrigger.create()` walks. A hole in it is
         `can't access property "end", curTrigger is undefined` — thrown from
         whichever component happened to be constructing a trigger at that
         moment, which is why it kept surfacing in `WorksGrid` and never in the
         component that actually caused it. See I-051. */
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.wall}>
      <div className="padding-global">
        <div className="container-large">
          <p className={s.label} data-t="label">
            {STACK_LABEL}
          </p>

          {/* One list, one clone. The clone carries no semantics at all: it is
              the second half of a 200%-wide track, and only the marquee ever
              sees it. */}
          <div className={s.viewport}>
            <ul ref={track} className={s.track}>
              {STACK.map((name) => (
                <li key={name} className={s.mark} data-t="h5">
                  {name}
                </li>
              ))}
              {STACK.map((name) => (
                <li key={`clone-${name}`} className={`${s.mark} ${s.clone}`} data-t="h5" aria-hidden>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
