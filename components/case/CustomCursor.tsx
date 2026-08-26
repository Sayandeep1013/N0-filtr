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
 * ── It is not a pointer follower, and that is the whole point ────────────
 *
 * §21.5, emphasised there and worth repeating: *"The move is a ±50px range, not
 * 1:1 tracking. The cursor element is centred and drifts within a small window
 * as the pointer crosses the viewport — it reads as a considered object, not a
 * mouse follower."*
 *
 * So the element sits **centred on the media it belongs to** and moves by at
 * most 50px in each axis as the pointer crosses the whole viewport. §18's
 * simpler `pos += (mouse - pos) * 0.15` lerp is the earlier spec of the same
 * thing; §21.5 is the one read off their IX2 data and it wins. The lerp is
 * kept — it is what makes the drift feel weighted rather than linear — but it
 * chases the mapped ±50 target, not the pointer.
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

/** §21.5: the drift is ±50px across the whole viewport, in both axes. */
const DRIFT = 50;
/** §18's lerp. Applied to the mapped target, not to the pointer. */
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

        const place = (el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          gsap.set(root, {
            left: rect.left + rect.width / 2,
            top: rect.top + rect.height / 2,
          });
        };

        /* ── a-14: the ±50px map ──────────────────────────────────────────
           The pointer's position across the viewport, remapped to the drift
           window. `gsap.utils.mapRange` rather than arithmetic so the intent
           reads: the left edge of the screen is −50 and the right edge is +50,
           whatever the screen happens to be. */
        const onMove = (event: PointerEvent) => {
          target.x = gsap.utils.mapRange(0, window.innerWidth, -DRIFT, DRIFT, event.clientX);
          target.y = gsap.utils.mapRange(0, window.innerHeight, -DRIFT, DRIFT, event.clientY);

          /* The element is placed over whatever it is hovering, so it also has
             to follow that element down the page as the visitor scrolls.
             Reading the rect on move rather than caching it is cheap — one
             element, only while hovering — and caching it was wrong the first
             time: a scroll under a still pointer left the cursor behind. */
          if (active) place(active);
        };

        /* ── a-10 / a-11: in and out ──────────────────────────────────────
           The asymmetry is theirs, and it is the reverse-runs-faster rule in
           its original form: 500ms in, 400ms out. Opacity is 200ms in and
           **instant** out — the cursor vanishes the moment the pointer leaves
           and shrinks afterwards, which is what stops it trailing off the edge
           of an image. */
        const onEnter = (event: PointerEvent) => {
          const el = (event.target as Element | null)?.closest?.('[data-cursor]');
          if (!(el instanceof HTMLElement)) return;
          active = el;
          setLabel(el.dataset.cursor || 'View');
          place(el);
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

      return () => mm.revert();
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
