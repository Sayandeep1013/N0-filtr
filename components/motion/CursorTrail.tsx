'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import s from './CursorTrail.module.css';

/**
 * `<CursorTrail />`. `[new]` — ours, after githubuniverse.com. See D-063.
 *
 * ── What theirs does (chunk 834, `CursorTrailAnimation`) ─────────────────
 *
 * ```
 * grid     the viewport cut into 20px cells — Math.floor(clientX / 20) * 20
 * pool     10 fixed tiles, reused round-robin; never more on screen
 * fire     only when the pointer crosses into a NEW cell, and only on empty
 *          ground: never over a text leaf, an <a> or a <button>, never inside
 *          `.trailAnimationIgnore`, only inside `.trailAnimationArea`
 * in       scale 0 → 1, 0.1s cubic-bezier(.3,.41,.04,1.01)
 * hold     100 + 300·random ms
 * out      scale 1 → 0, same transition
 * content  one of six saturated colours, one of `- / ) . + = > < * & (`,
 *          blank 30% of the time
 * ```
 *
 * ── What ours changes, and why ───────────────────────────────────────────
 *
 * The mechanics are kept as measured: cell, pool, hold and the in-curve. The
 * look is ours, chosen by Sayandeep on 2026-10-06:
 *
 * - **Greys and one accent**, not six colours. D-035 and D-057 graded every
 *   image and the cursor itself to grey and white; a rainbow trail would be the
 *   only colour on the page. About one tile in six takes `--accent-ink`, which
 *   is the work's colour on a case study and white everywhere else.
 * - **Specimen-plate marks**, not code punctuation: the registration cross, the
 *   rule, the tick and the ring that the plates are drawn with (D-059).
 * - **The cell is `1.25rem`**, not 20px. It is 20px at a 16px root, and it
 *   scales with the fluid root above 1440 like everything else (non-negotiable
 *   4). Measured off a tile with a ResizeObserver, so nothing reads computed
 *   style on every pointer move.
 * - **The out runs faster than the in** — 1/1.2 of it, non-negotiable 5. Theirs
 *   is symmetrical.
 * - **The hold is a `gsap.delayedCall`**, not `setTimeout`, so it rides GSAP's
 *   ticker (non-negotiable 7) and dies with the matchMedia context.
 *
 * ── Where it fires ───────────────────────────────────────────────────────
 *
 * Their area/ignore classes are inverted here: it runs on every page's empty
 * ground and stands down over anything in `IGNORE`. That list is every object
 * that already answers the pointer — the hero's 3D mark, the work cards' VIEW
 * disc, the wire rig, the meetup list, the footer and its pit — plus text and
 * controls, which is their rule. A tile is 1.25rem; a heading is not empty
 * ground, and covering a word someone is reading is the failure to avoid.
 */

/** The pool. Theirs, and the reason the trail is short. */
const POOL = 10;

/** Their hold window — 100ms plus up to 300ms more — in seconds. */
const HOLD_MIN = 0.1;
const HOLD_SPREAD = 0.3;

/** Their blank rate: three tiles in ten carry no mark. */
const BLANK = 0.3;

/** One tile in six takes the accent. */
const ACCENT = 1 / 6;

/** Tones in `CursorTrail.module.css`. The grey ramp from tokens.css, light to dark. */
const TONES = ['white', 'pale', 'mid', 'dark'] as const;

/** Glyph marks. `ring` is drawn in CSS — Plex Mono's Latin cut has no U+25CB. */
const MARKS = ['+', '×', '·', '/', '—', '|', 'ring'] as const;

const IGNORE = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '[role="button"]',
  '[role="dialog"]',
  'dialog',
  'nav',
  'header',
  'img',
  'video',
  'canvas',
  'iframe',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'blockquote',
  'figcaption',
  'pre',
  'code',
  '[data-cursor]',
  '[data-hero]',
  '[data-trail-ignore]',
].join(',');

/**
 * Empty ground: not inside anything in `IGNORE`, and not a text leaf — their
 * rule, that an element with no children and some text *is* the text.
 * Containers pass; the words inside them do not.
 */
function isGround(el: Element | null): boolean {
  if (!el) return false;
  if (el.closest(IGNORE)) return false;
  return !(el.children.length === 0 && (el.textContent ?? '').trim() !== '');
}

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

export function CursorTrail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      const root = rootRef.current;
      if (!root) return;
      const tiles = Array.from(root.children) as HTMLElement[];
      if (tiles.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(`${MQ.desktop} and (pointer: fine)`, () => {
        /* The cell, in px, kept current by the tile's own size rather than by a
           resize listener: the tile is 1.25rem, so it resizes exactly when the
           fluid root does. */
        const probe = tiles[0]!;
        /* `getBoundingClientRect`, not `offsetWidth`: above 1440 the root is
           fractional and `offsetWidth` rounds, which walks the grid off by a
           pixel per cell across the screen. */
        const measure = () => probe.getBoundingClientRect().width || 20;
        let cell = measure();
        const ro = new ResizeObserver(() => {
          cell = measure();
        });
        ro.observe(probe);

        let lastX = NaN;
        let lastY = NaN;
        let next = 0;
        const holds: (gsap.core.Tween | null)[] = tiles.map(() => null);

        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          if (!isGround(event.target as Element | null)) return;

          const x = Math.floor(event.clientX / cell) * cell;
          const y = Math.floor(event.clientY / cell) * cell;
          if (x === lastX && y === lastY) return;
          lastX = x;
          lastY = y;

          /* ── the whole cell, not just the pointer ────────────────────────
             The tile snaps to its cell, so it covers up to a cell's width of
             ground the pointer is not on. Theirs only tests the pointer, and a
             pointer a few pixels under a line of text draws a tile over the
             line. Testing the four corners costs four hit-tests per new cell —
             not per move — and keeps the trail off the words. */
          const e = 1;
          const far = cell - 1;
          if (
            !isGround(document.elementFromPoint(x + e, y + e)) ||
            !isGround(document.elementFromPoint(x + far, y + e)) ||
            !isGround(document.elementFromPoint(x + e, y + far)) ||
            !isGround(document.elementFromPoint(x + far, y + far))
          )
            return;

          next = (next + 1) % tiles.length;
          const tile = tiles[next]!;
          const mark = Math.random() < BLANK ? '' : pick(MARKS);

          tile.style.transform = `translate(${x}px, ${y}px)`;
          tile.dataset.tone = Math.random() < ACCENT ? 'accent' : pick(TONES);
          tile.dataset.mark = mark === 'ring' ? 'ring' : '';
          tile.firstElementChild!.textContent = mark === 'ring' ? '' : mark;
          tile.dataset.on = '';

          /* A tile reused before its hold ran out takes the new position and a
             fresh hold; the old one must not switch it off early. */
          holds[next]?.kill();
          holds[next] = gsap.delayedCall(HOLD_MIN + HOLD_SPREAD * Math.random(), () => {
            delete tile.dataset.on;
          });
        };

        document.addEventListener('pointermove', onMove, { passive: true });

        return () => {
          document.removeEventListener('pointermove', onMove);
          ro.disconnect();
          holds.forEach((h) => h?.kill());
          tiles.forEach((t) => delete t.dataset.on);
        };
      });

      /* No `mm.revert()` — `useGSAP` reverts the context and the matchMedia
         with it. Reverting twice is I-051; see CustomCursor.tsx. */
    },
    { dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className={s.trail} aria-hidden="true" data-cursor-trail>
      {Array.from({ length: POOL }, (_, i) => (
        <div key={i} className={s.tile}>
          <span className={s.face} />
        </div>
      ))}
    </div>
  );
}
