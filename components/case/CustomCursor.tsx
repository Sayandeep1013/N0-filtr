'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import s from './CustomCursor.module.css';

/**
 * `<CustomCursor />`. Case-study pages only.
 * `20-components-and-motion.md` §18 and §21.5 [ix2 `a-10`–`a-14`].
 *
 * ```
 * hover in  [a-10]  wrapper  scale 0→1, 500ms easeInOut · opacity 0→1, 200ms
 * hover out [a-11]  wrapper  scale 1→0, 400ms easeInOut · opacity → 0, instant
 * move      [a-14]  cursor   x −50→+50px, y −50→+50px across the viewport
 * click     [a-12]  labels   y → −100%, 500ms easeInOut
 * 2nd click [a-13]  labels   y → 0%,    500ms easeInOut
 * ```
 *
 * ── It follows the pointer, and §21.5 says it should not ─────────────────
 *
 * §21.5 is emphatic: *"The move is a ±50px range, not 1:1 tracking. The cursor
 * element is centred and drifts within a small window as the pointer crosses
 * the viewport — it reads as a considered object, not a mouse follower."* That
 * was built exactly as written, and it was wrong here.
 *
 * **It is wrong because of a decision made after it.** §21.5 describes an object
 * that sits *alongside* a visible arrow — tonik never hide theirs. D-046 hid
 * ours (`cursor: none` on every target, I-059), and a replacement pointer that
 * is not at the pointer is not stylish, it is broken: you lose the only feedback
 * telling you where you are about to click.
 *
 * Sayandeep, precisely: *"the mouse cursor enters the card from right .. the
 * view circle appears right exactly the mouse cursor would have been."*
 *
 * So it tracks. §18's own earlier line is the one that survives —
 * `pos += (mouse - pos) * 0.15` — and it is applied to the **pointer** rather
 * than to a mapped drift window. The lag is what gives it weight; the fact that
 * it is a lag rather than an offset is what makes it a cursor. See D-048.
 *
 * ── Click toggles the label ──────────────────────────────────────────────
 *
 * Two stacked captions slide together. `a-12` and `a-13` are one toggle in
 * their data and one boolean here; the pair is `DRAG` ↔ `RELEASE` on their
 * sliders and `VIEW` ↔ `OPEN` on ours, because our media are links rather than
 * carousels and "drag" would be a promise the page does not keep.
 *
 * ── Where it appears ─────────────────────────────────────────────────────
 *
 * On `[data-cursor]`, set by the case study on its media. The attribute's value
 * is the label, so a block can say `data-cursor="OPEN"` and get its own.
 *
 * ── The three gates ──────────────────────────────────────────────────────
 *
 * Desktop only (`>991px`, via `gsap.matchMedia` — CLAUDE.md non-negotiable 6,
 * never a resize listener), off under `prefers-reduced-motion`, and off on
 * anything without a fine pointer. A custom cursor on a touch screen is an
 * element following a pointer that does not exist.
 */

/**
 * §18's lerp, applied to the pointer. Fifteen percent of the remaining distance
 * per frame: it trails on a fast sweep and settles when the pointer stops, which
 * is the weight. Higher reads as stuck to the pointer, lower as swimming behind
 * it.
 */
const LERP = 0.15;

export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('View');
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const root = rootRef.current;
      const wrap = wrapRef.current;
      const labels = labelsRef.current;
      if (!root || !wrap || !labels) return;

      const mm = gsap.matchMedia();

      /* `(pointer: fine)` alongside the width query: a 1200px-wide tablet is
         desktop by width and has no cursor to replace. */
      mm.add(`${MQ.desktop} and (pointer: fine)`, () => {
        const setX = gsap.quickSetter(root, 'x', 'px');
        const setY = gsap.quickSetter(root, 'y', 'px');

        const target = { x: 0, y: 0 };
        const current = { x: 0, y: 0 };
        let toggled = false;
        let active: HTMLElement | null = null;

        gsap.set(wrap, { scale: 0, opacity: 0 });
        gsap.set(labels, { yPercent: 0 });

        /* The pointer, in viewport coordinates. The root is `position: fixed`
           at the origin, so the transform below *is* the position — no `left`
           or `top` to keep in step, and nothing to recompute on scroll. */
        const onMove = (event: PointerEvent) => {
          target.x = event.clientX;
          target.y = event.clientY;
        };

        /* ── a-10 / a-11: in and out ──────────────────────────────────────
           The asymmetry is theirs, and it is the reverse-runs-faster rule in
           its original form: 500ms in, 400ms out. Opacity is 200ms in and
           **instant** out — the cursor vanishes the moment the pointer leaves
           and shrinks afterwards, which is what stops it trailing off the edge
           of an image. */
        /* The disc takes the colour of whatever it is over.
 
           On a case study `--accent` is set on <html>, so it was blue there and
           **black on the works grid**, where nothing sets it — Sayandeep liked
           "the blue view circle" and on `/works` it was a dark disc on a dark
           page. Each card already publishes its own `--work-accent`, so the
           cursor reads that off the element it entered.

           The chain prefers the **light** member of each pair, because the disc
           is a mid-size mark on a dark page and the dark accents disappear into
           it — the same distinction `--accent-ink` exists for (I-046). Card
           first, then the page, then the fills as a floor. */
        const tint = (el: HTMLElement) => {
          const styles = getComputedStyle(el);
          const colour =
            styles.getPropertyValue('--work-accent-ink').trim() ||
            styles.getPropertyValue('--accent-ink').trim() ||
            styles.getPropertyValue('--work-accent').trim() ||
            styles.getPropertyValue('--accent').trim();
          if (colour) wrap.style.backgroundColor = colour;
        };

        const onEnter = (event: PointerEvent) => {
          const el = (event.target as Element | null)?.closest?.('[data-cursor]');
          if (!(el instanceof HTMLElement)) return;
          active = el;
          setLabel(el.dataset.cursor || 'View');
          tint(el);

          /* **Snap, do not ease in.** The disc has to appear exactly where the
             pointer already is — that is the whole of Sayandeep's note. Easing
             from wherever it was left is how it ended up sliding in from the
             middle of the card, or from the last card entirely. */
          target.x = event.clientX;
          target.y = event.clientY;
          current.x = event.clientX;
          current.y = event.clientY;
          setX(current.x);
          setY(current.y);

          gsap.to(wrap, { scale: 1, duration: 0.5, ease: 'power1.inOut', overwrite: true });
          gsap.to(wrap, { opacity: 1, duration: 0.2, ease: 'power1.inOut' });
        };

        const onLeave = (event: PointerEvent) => {
          if (!active) return;
          const to = event.relatedTarget as Element | null;
          if (to && active.contains(to)) return;
          active = null;
          gsap.to(wrap, { scale: 0, duration: 0.4, ease: 'power1.inOut', overwrite: true });
          gsap.set(wrap, { opacity: 0 });
        };

        /* ── a-12 / a-13: the label toggle ────────────────────────────────
           One boolean, because their two action lists are one toggle. */
        const onClick = () => {
          if (!active) return;
          toggled = !toggled;
          gsap.to(labels, {
            yPercent: toggled ? -100 : 0,
            duration: 0.5,
            ease: 'power1.inOut',
            overwrite: true,
          });
        };

        const tick = () => {
          current.x += (target.x - current.x) * LERP;
          current.y += (target.y - current.y) * LERP;
          setX(current.x);
          setY(current.y);
        };

        /* §21.2 and CLAUDE.md non-negotiable 7: one loop. This joins GSAP's
           ticker; it does not start a second requestAnimationFrame. */
        gsap.ticker.add(tick);

        document.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerover', onEnter);
        document.addEventListener('pointerout', onLeave);
        document.addEventListener('click', onClick);

        return () => {
          gsap.ticker.remove(tick);
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerover', onEnter);
          document.removeEventListener('pointerout', onLeave);
          document.removeEventListener('click', onClick);
        };
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
         component that actually caused it. See I-051.

         The listener cleanup inside `mm.add()` stays: `document.addEventListener`
         and `gsap.ticker.add` are not GSAP objects in a context and nothing else
         will take them back. */
    },
    { dependencies: [reducedMotion] },
  );

  /* `aria-hidden` and `pointer-events: none`: it decorates the pointer, and it
     must never intercept the click it is decorating. */
  return (
    <div ref={rootRef} className={s.cursor} aria-hidden="true" data-custom-cursor>
      <div ref={wrapRef} className={s.wrap}>
        <div ref={labelsRef} className={s.labels}>
          <span data-t="label-sm" className={s.label}>
            {label}
          </span>
          <span data-t="label-sm" className={s.label}>
            Open
          </span>
        </div>
      </div>
    </div>
  );
}
