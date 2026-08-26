'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { Artwork } from '@/components/art/Artwork';
import s from './MeetupList.module.css';

/**
 * The meetup block. `30-page-specs.md` §`/about` section 3,
 * `20-components-and-motion.md` §21.6 [ix2 `a-19`–`a-22`].
 *
 * ```
 * reveal [a-19]  siblings .img-box  scale .7→1, 500ms easeInOut · opacity 0→1, 300ms
 * hide   [a-20]  reverse
 * track X [a-21] .img-box  @15%: x 0%,   rotate −2°   →  @80%: x 100%, rotate +2°
 * track Y [a-22] .img-box  @0%:  y −50%                →  @100%: y −25%
 * ```
 *
 * Every number is theirs, and the two tracking lines are the interesting part.
 *
 * ── The image does not follow the cursor ─────────────────────────────────
 *
 * It is **mapped** to it, over a window. `a-21` maps the pointer's x from 15% to
 * 80% of the *item* onto `x: 0%` → `100%` with a rotation of −2° to +2°; `a-22`
 * maps y across the full height onto `−50%` → `−25%`. So crossing the left
 * eighth of a row does nothing at all, and the image arrives at its extreme
 * before the pointer reaches the right edge.
 *
 * That is the same instinct as the custom cursor's ±50px drift (§21.5): a
 * considered object responding to you, rather than a thing stuck to the pointer.
 * Both were easy to build as 1:1 tracking and both would have been wrong.
 *
 * ── The image is a generated plate ───────────────────────────────────────
 *
 * Theirs is a photograph of a meetup. We have no photographs (I-042), so each
 * row reveals a plate seeded from its own title — which means the five are
 * consistently different and nobody had to choose. See D-038.
 *
 * Desktop only, and off under `prefers-reduced-motion`: it is a hover effect,
 * and on a touch screen there is nothing to hover with.
 */
export function MeetupList({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion) return;

      const rows = gsap.utils.toArray<HTMLElement>('[data-meetup-row]', el);
      if (rows.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(`${MQ.desktop} and (pointer: fine)`, () => {
        const cleanups: (() => void)[] = [];

        rows.forEach((row) => {
          const box = row.querySelector<HTMLElement>('[data-meetup-image]');
          if (!box) return;

          const setX = gsap.quickTo(box, 'xPercent', { duration: 0.4, ease: 'power2.out' });
          const setY = gsap.quickTo(box, 'yPercent', { duration: 0.4, ease: 'power2.out' });
          const setR = gsap.quickTo(box, 'rotate', { duration: 0.4, ease: 'power2.out' });

          /* a-19 / a-20. The asymmetry is theirs: 500ms for the scale and 300ms
             for the opacity, so it fades in ahead of finishing its growth. */
          const show = () =>
            gsap
              .timeline()
              .to(box, { scale: 1, duration: 0.5, ease: 'power1.inOut', overwrite: true }, 0)
              .to(box, { opacity: 1, duration: 0.3, ease: 'power1.inOut' }, 0);

          const hide = () =>
            gsap
              .timeline()
              .to(box, { scale: 0.7, duration: 0.5, ease: 'power1.inOut', overwrite: true }, 0)
              .to(box, { opacity: 0, duration: 0.3, ease: 'power1.inOut' }, 0);

          /* a-21 / a-22. Mapped over a window, not tracked 1:1 — see above. */
          const onMove = (event: PointerEvent) => {
            const rect = row.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            setX(gsap.utils.mapRange(0.15, 0.8, 0, 100, gsap.utils.clamp(0.15, 0.8, px)));
            setR(gsap.utils.mapRange(0.15, 0.8, -2, 2, gsap.utils.clamp(0.15, 0.8, px)));
            setY(gsap.utils.mapRange(0, 1, -50, -25, gsap.utils.clamp(0, 1, py)));
          };

          gsap.set(box, { scale: 0.7, opacity: 0, xPercent: 0, yPercent: -50 });

          row.addEventListener('pointerenter', show);
          row.addEventListener('pointerleave', hide);
          row.addEventListener('pointermove', onMove);
          cleanups.push(() => {
            row.removeEventListener('pointerenter', show);
            row.removeEventListener('pointerleave', hide);
            row.removeEventListener('pointermove', onMove);
          });
        });

        /* Listeners are not GSAP's to take back — this cleanup is the kind that
           stays. See I-051 for the kind that does not. */
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root, dependencies: [reducedMotion, items.length] },
  );

  return (
    <div ref={root} className={s.list}>
      {items.map((item) => (
        <article key={item.title} className={s.row} data-meetup-row>
          <h3 data-t="h4" className={s.title}>
            {item.title}
          </h3>
          <p data-t="p" className={s.body}>
            {item.body}
          </p>

          {/* Decorative: the row already says everything in text. */}
          <span className={s.image} data-meetup-image aria-hidden="true">
            <Artwork seed={`meetup/${item.title.slice(0, 18)}`} compact />
          </span>
        </article>
      ))}
    </div>
  );
}
