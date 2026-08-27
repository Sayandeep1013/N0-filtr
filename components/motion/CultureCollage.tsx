'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { MQ } from '@/lib/motion/tokens';
import { CULTURE } from '@/lib/content/site';
import { createWireRig } from './wireRig';
import s from './CultureCollage.module.css';

/**
 * The culture collage. `20-components-and-motion.md` §12, `30-page-specs.md` §5.
 *
 * §12 calls this **the lowest-confidence layout on the site (7/10)** — "the
 * motion is exact but the composition is a design act we perform ourselves."
 * That division holds exactly:
 *
 * ```js
 * // parallax — only on photos flagged for it
 * '.culture__photo[data-parallax]' → gsap.to(el, { y: '-20%' }, { scrub: 1 })
 * // wipe reveal — every photo
 * '.culture__overlay' → gsap.to(el, { width: '0%', duration: 1 })
 * ```
 *
 * Both are transcribed. The positions below are not, and are flagged.
 *
 * ── The composition ───────────────────────────────────────────────────────
 *
 * §12: "absolute positions on a 12-column reference at desktop, collapsing to a
 * simple 1-column stack at ≤767." Ours is a twelve-column grid with authored
 * placements rather than absolute coordinates — the same decision the works
 * grid reached in I-036, and for the same reason: a grid keeps the frames on
 * the site's own column rhythm, where absolute percentages drift off it at
 * every viewport that is not the one they were tuned at.
 *
 * Six frames, deliberately uneven: three tall, three wide, none sharing a top
 * edge with its neighbour. Two carry `data-parallax` so the scatter separates
 * as it passes rather than moving as a block — §12 flags parallax per photo,
 * not per section, and moving all six is the version that looks like a mistake.
 *
 * ── There are no photographs ──────────────────────────────────────────────
 *
 * `01-PHASES.md` T10.4 imports the real imagery. Until then each frame draws a
 * neutral field rather than a broken image or an empty box — dark, seeded off
 * its own caption so the six differ, and deliberately *not* accent-coloured:
 * the works grid uses accent fields to say "this is a project", and reusing
 * them here would say these are projects too. See I-042.
 */

/** FNV-1a, the same one `WorkCover` uses. Deterministic across runtimes. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CultureCollage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      /* §12's wipe. Every frame, at every width, but only where motion is
         welcome — under `reduce` the overlays are resolved to 0 in CSS and the
         photographs are simply there. */
      /* One trigger for all six wipes, for the reason spelled out in
         `WorksGrid` — every ScrollTrigger construction walks the global list,
         and six constructions is six chances to hit a list that a sibling
         context is reverting. I-044. The math is per frame and per overlay, so
         the result is identical to six scrubbed tweens. */
      mm.add(MQ.noPreference, () => {
        const overlays = [...scope.querySelectorAll<HTMLElement>('[data-culture-overlay]')];
        if (overlays.length === 0) return;

        const frames = overlays.map((el) => ({
          el,
          set: gsap.quickSetter(el, 'width', '%') as (value: number) => void,
          top: 0,
          height: 0,
        }));

        const measure = () => {
          for (const f of frames) {
            const box = (f.el.parentElement ?? f.el).getBoundingClientRect();
            f.top = box.top + window.scrollY;
            f.height = box.height;
          }
        };

        const apply = () => {
          const scroll = window.scrollY;
          const viewport = window.innerHeight;
          for (const f of frames) {
            /* §12's window: `start: 'top 70%'` — the frame's top reaching 70%
               down the viewport — through `end: 'bottom bottom'`. */
            const from = f.top - viewport * 0.7;
            const to = f.top + f.height - viewport;
            const span = to - from;
            const progress = span > 0 ? (scroll - from) / span : 1;
            f.set(100 * (1 - Math.min(1, Math.max(0, progress))));
          }
        };

        const st = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onRefresh: () => {
            measure();
            apply();
          },
          onUpdate: apply,
        });

        return () => {
          st.kill();
          gsap.set(
            frames.map((f) => f.el),
            { clearProps: 'width' },
          );
        };
      });

      /* §12's parallax. Desktop only — at ≤767 the frames are a single column
         and a −20% drift would slide each one over the caption below it. */
      /* And one for the two drifting frames. Same pattern, same reason. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        const drifters = [...scope.querySelectorAll<HTMLElement>('[data-parallax]')];
        if (drifters.length === 0) return;

        const items = drifters.map((el) => ({
          el,
          /* **No unit.** `yPercent` is already a percentage, and passing `'%'`
             makes GSAP build the string `"-20%"`, which its transform parser
             drops on the floor — silently, with no error and no warning. The
             setter runs, writes nothing, and the parallax simply does not
             happen. See I-065; `CaseBoard` had it right and was the control. */
          set: gsap.quickSetter(el, 'yPercent') as (value: number) => void,
          top: 0,
          height: 0,
        }));

        const measure = () => {
          for (const it of items) {
            const box = it.el.getBoundingClientRect();
            it.top = box.top + window.scrollY;
            it.height = box.height;
          }
        };

        const apply = () => {
          const scroll = window.scrollY;
          const viewport = window.innerHeight;
          for (const it of items) {
            const span = viewport + it.height;
            const progress = span > 0 ? (scroll + viewport - it.top) / span : 0;
            it.set(-20 * Math.min(1, Math.max(0, progress)));
          }
        };

        const st = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onRefresh: () => {
            measure();
            apply();
          },
          onUpdate: apply,
        });

        return () => {
          st.kill();
          gsap.set(
            items.map((it) => it.el),
            { clearProps: 'transform' },
          );
        };
      });

      /* ── the wire rig ─────────────────────────────────────────────────
         Poles on four frames and simulated ropes between them. `[new]` —
         ours; see `wireRig.ts` for why the composition belongs here and why
         the wires are simulated rather than drawn.

         **Its own matchMedia block, gated on width alone.** Every other
         motion here also requires `noPreference`, because every other motion
         here is something moving. The rig is not: under `reduce` the ropes
         are settled once at mount and drawn hanging correctly, then never
         touched again — no ticker, no drag, no wind. Folding it into the
         `noPreference` block would have deleted the wires outright for anyone
         who asked for less motion, which is a heavier answer than the request
         and would have left four poles carrying nothing. */
      /* The object form, because this block needs to read *two* conditions and
         `context.conditions` only ever carries the queries registered in its
         own `add()`. Named keys, both booleans, and the callback re-runs when
         either flips. */
      mm.add({ wide: MQ.desktop, reduced: MQ.reduced }, (context) => {
        const { wide, reduced } = context.conditions as Record<string, boolean | undefined>;
        if (!wide) return undefined;
        return createWireRig(scope, { reduced: reduced === true });
      });

      /* No refresh from a cleanup — see lib/motion/scrollRefresh.ts. */
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
    <div ref={root} className={s.collage}>
      {CULTURE.frames.map((frame, index) => {
        const seed = seedFrom(frame.caption);
        /* Two values off the seed, so six frames read as six places rather than
           six copies: how far the field is rotated, and where its light falls. */
        const angle = -18 + (seed % 36);
        const light = 20 + ((seed >> 8) % 60);

        return (
          <figure
            key={frame.caption}
            className={s.frame}
            data-culture-frame
            data-parallax={frame.parallax ? '' : undefined}
            style={
              {
                '--frame-column': frame.column,
                '--frame-row': String(frame.row),
                '--frame-ratio': frame.ratio,
              } as React.CSSProperties
            }
          >
            {/* The drag lives on this wrapper, not on the figure.

                §12's parallax owns the figure's `transform` through GSAP, and
                GSAP refuses to write transforms to an element whose cache it
                has flagged `uncache` — which `useGSAP`'s context revert does on
                every StrictMode double-mount (I-065). Routing the drag through
                the same cache made it a coin flip.

                A child GSAP never touches has no such problem, and the two
                compose for free: the figure translates by the parallax, the
                wrapper translates by the drag, and neither needs to know about
                the other. It is also cheaper — two custom properties per
                pointer move instead of a GSAP render. */}
            <div className={s.drag} data-culture-drag>
              <div className={s.media} data-culture-media>
              <div
                className={s.field}
                aria-hidden="true"
                style={
                  {
                    '--field-angle': `${angle}deg`,
                    '--field-light': `${light}%`,
                  } as React.CSSProperties
                }
              />
              {/* §12's wipe. `width: 100%` at rest, tweened to 0% as the frame
                  crosses the viewport — anchored left, so it uncovers rightward
                  like a curtain being drawn. */}
                <div className={s.overlay} data-culture-overlay aria-hidden="true" />
              </div>
              <figcaption className={s.caption} data-t="label">
                <span className={s.captionIndex}>{String(index + 1).padStart(2, '0')}</span>
                {frame.caption}
              </figcaption>
            </div>
          </figure>
        );
      })}
      {/* The rig fills this. Empty on the server and below 992 — it is one
          element either way, and never takes a pointer event. */}
      <svg className={s.rig} data-wire-rig aria-hidden="true" />
    </div>
  );
}
