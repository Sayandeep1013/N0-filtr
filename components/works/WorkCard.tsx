'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ, REVERSE_SCALE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { SpecTable } from '@/components/ui/SpecTable';
import { WORKS_COUNT } from '@/lib/content/site';
import type { Work } from '@/content/works/_types';
import { Artwork } from '@/components/art/Artwork';
import { WorkCover } from './WorkCover';
import s from './WorkCard.module.css';

/**
 * One card in the works grid. `20-components-and-motion.md` §5.
 *
 * **Four independent motions, and they do not know about each other.**
 *
 *   1. the reveal      one-shot, scrubbed in by a ScrollTrigger, guarded
 *   2. hover layer 1   every OTHER card dims to .3 — owned by the GRID (I-039)
 *   3. hover layer 2   `.fade-away-overlay` to .55 in 500ms, out in 400ms
 *   4. hover layer 3   the sheet wipes in, the reel replaces the still
 *
 * Layers 2 and 3 are separate from layer 1 on purpose. §21.2 calls the overlay
 * "an extra layer under the GSAP hover timeline, easy to miss", and its timings
 * are **asymmetric in the opposite direction to the rest of the site**: in over
 * 500ms, out over 400ms. Everything else here reverses at `REVERSE_SCALE`.
 * Folding the overlay into the main timeline would silently make its exit
 * 500/1.2 = 417ms, which is close enough to 400 to look right and would be
 * wrong. So it gets its own two tweens.
 *
 * ── The reveal's guard ─────────────────────────────────────────────────────
 *
 * §5 marks it one-shot and guarded by `data-revealed`. The flag lives on the
 * DOM node rather than in a ref because phase 7 filters this grid, and a
 * filtered card that re-mounts must not replay a wipe it has already played if
 * it is still on screen. A ref would reset with the component; the attribute
 * survives as long as the element does.
 *
 * ── ≤767 is not a smaller version of this ──────────────────────────────────
 *
 * §5, and it is the responsive behaviour most likely to be got wrong: the hover
 * sheet **is not hidden on mobile, it becomes permanent content.** No hover, no
 * dimming, no video. Which means the sheet cannot be built as something that
 * exists only to be revealed — it is real content that desktop happens to hide
 * until you point at it. The CSS carries that; the JS simply never runs.
 */
/**
 * The hover sequence's own clock. Sayandeep: *"let the animation breathe .. a
 * bit slower is fine."*
 *
 * The name travels first and the drawer starts partway through its journey, so
 * the two read as one movement rather than as two tweens that happen to
 * overlap. Everything reverses at `REVERSE_SCALE`, which is the site-wide rule.
 */
const NAME_TRAVEL = 0.85;
const SHEET_DELAY = 0.3;
const SHEET_WIPE = 0.75;
/** How far the title sits from the corner it lands in, in pixels. */
const NAME_INSET = 20;
/**
 * The watermark's opacity before a pointer arrives.
 *
 * It was `0.3`, chosen when the plates under it were flat generated fields.
 * D-059 put a ruled plate there instead — rails, a mount, a divider, a drawing
 * — and a title at 30% over line work is two greys at the same value: the
 * letters and the plate mix and neither is readable. Sayandeep, 2026-08-28:
 * *"the casestudy names that are centred, their opacity is too low so the
 * background and the title get mixed and become unreadable."*
 *
 * `0.58` clears the plate at every weight it draws and still reads as a
 * watermark rather than as a caption — which matters, because the hover takes
 * it to 1 and that step has to remain visible. The shadow in the stylesheet
 * does the rest of the work; opacity alone would have had to go far enough to
 * stop being a watermark at all.
 */
const NAME_REST = 0.58;
/** What it shrinks to. `--t-h2` at 0.3 is about the size of a mono label. */
const NAME_SMALL = 0.3;

export function WorkCard({ work, className }: { work: Work; className?: string }) {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const card = root.current;
      if (!card) return;

      const wipe = card.querySelector<HTMLElement>('[data-work-wipe]');
      const badge = card.querySelector<HTMLElement>('[data-work-badge]');
      const info = card.querySelector<HTMLElement>('[data-work-info]');
      const sheet = card.querySelector<HTMLElement>('[data-work-sheet]');
      const overlay = card.querySelector<HTMLElement>('[data-work-overlay]');
      const still = card.querySelector<HTMLElement>('[data-work-still]');
      const name = card.querySelector<HTMLElement>('[data-work-name]');
      const video = videoRef.current;

      const mm = gsap.matchMedia();

      /* ── the reveal ───────────────────────────────────────────────────────
         Runs at every width and under any motion preference — it is how the
         card arrives, not an embellishment. Under `reduce` the wipe is resolved
         to its end state instead of played. */
      mm.add(MQ.noPreference, () => {
        if (!wipe || !badge || !info) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'bottom bottom',
            /* **Not `once: true`.** §5 wants a one-shot and this is one; what
               it must not be is a trigger that *retires itself*.

               `once` calls `kill()` from inside `onEnter`, and `onEnter` can fire
               during ScrollTrigger's recursive refresh when a trigger is created
               on a page that starts scrolled — a restored back-navigation, every
               time. Killing splices the array that refresh is walking by index,
               the next read is a hole, and the page loses every trigger built
               after it. That is I-058 and I-062, and the position fix only moved
               it from one navigation type to the other.

               A timeline that has already played is idempotent, so the one-shot
               is free: the trigger stays alive, `onEnter` sets the attribute the
               filter reads, and nothing removes itself mid-walk. Twelve idle
               triggers cost nothing measurable, and the leak check asserts they
               go when the page does. */
            onEnter: () => card.setAttribute('data-revealed', 'true'),
          },
        });

        tl.to(wipe, { width: '0%', duration: DUR.wipe, ease: EASE.out })
          .to(badge, { opacity: 1, duration: DUR.mid }, '>-0.2')
          .to(info, { opacity: 1, duration: DUR.mid }, '<');

        if (work.order === 1) registerTimeline('work-card.reveal', tl);
        return () => {
          if (work.order === 1) unregisterTimeline('work-card.reveal');
        };
      });

      mm.add(MQ.reduced, () => {
        gsap.set([wipe], { width: '0%' });
        gsap.set([badge, info], { opacity: 1 });
        card.setAttribute('data-revealed', 'true');
      });

      /* ── hover ────────────────────────────────────────────────────────────
         Desktop only, and only where motion is welcome. One paused timeline
         built on mount, per §5. */
      mm.add(`${MQ.desktop} and ${MQ.noPreference}`, () => {
        if (!sheet) return;

        /* ── what used to be here ─────────────────────────────────────────
           §5's `[src]` builds one paused hover timeline per card with two
           children: the caption rising to -110%, and the sibling-dim. Neither
           is here any more, and both left for a reason.

           The **sibling-dim** moved to the grid. §21.1 says to, in as many
           words — "one shared primitive, `useSiblingDim(0.3)`, not three
           implementations" — and phase 4 is where that earns itself: twelve
           cards each owning a tween over the other eleven means sliding the
           pointer between two cards has one timeline driving every sibling to 1
           while the next drives every sibling to .3, on the same ten elements,
           for 400ms. I-039.

           The **caption rise** is gone at Sayandeep's request: it hid the
           work's name and summary at the moment you were reading about them.
           D-025.

           So this branch owns the sheet, the overlay and the reel swap, and
           there is no timeline left to register. `work-card.hover` is not
           "missing" — it does not exist. */

        /* ── the drawer wipes in from the right ───────────────────────────
           It rose from the bottom in the first build of this. Sayandeep:
           *"I don't like the info coming from the bottom — do it the same as
           the card appears, from right to left."*

           `clip-path`, not a transform. A panel translated in from the right
           starts a full card-width outside its own box, which means it is
           briefly drawn over the card in the next column unless something
           clips it — and the only element positioned to do that is the media,
           which the sheet is deliberately NOT a child of (§5's anatomy, and
           what lets ≤767 drop it into the flow). An inset clip needs no
           ancestor at all: the panel never moves, its visible region does.

           `inset(0 0 0 100%)` is a zero-width strip against the right edge;
           animating that last value to 0 opens it leftward. Right to left,
           exactly as asked, with nothing to overflow. */
        const CLOSED = 'inset(0% 0% 0% 100%)';
        const OPEN = 'inset(0% 0% 0% 0%)';

        const rows = [...sheet.querySelectorAll<HTMLElement>('[data-spec] > div')];

        gsap.set(sheet, { opacity: 0, clipPath: CLOSED });
        gsap.set(rows, { opacity: 0, x: 14 });

        /* ── one timeline, played and reversed ────────────────────────────
           Sayandeep: *"the info slider on the case studies stays on even when i
           dont hover sometimes."*

           It did, and there were two ways to get there — which is the argument
           for this being one timeline rather than four independent tweens.

           **A fast in-and-out left a pending tween behind.** The drawer's wipe
           carried `delay: SHEET_DELAY` so it could start partway through the
           name's journey. Leave inside those 300ms and `hideSheet` ran
           immediately, then the delayed tween started afterwards and opened a
           drawer nothing was going to close. `overwrite: 'auto'` does not help:
           it kills tweens that have already rendered conflicting values, and a
           delayed tween has rendered nothing.

           **Focus opened it with no pointer involved.** `focusin` fired whenever
           the card's link received focus — including programmatically, on the
           way back from the page it links to — and the matching `focusout`
           listener was never removed on cleanup either.

           A paused timeline played forward and reversed cannot end up in a state
           nobody asked for: there is one progress value, and `reverse()` from
           anywhere is coherent. It also expresses the sequence in one place
           instead of spreading it across two functions and a delay.

           The name's destination is a corner of its own offset parent, which
           depends on the card's size — so it is a **function-based value**, and
           `invalidate()` before a fresh play re-measures it. Only when progress
           is 0: invalidating a timeline mid-reverse would re-read values it is
           currently interpolating from. */
        const nameTarget = () => {
          const parent = name?.offsetParent as HTMLElement | null;
          if (!parent) return { x: 0, y: 0 };
          const rect = parent.getBoundingClientRect();
          return { x: rect.width / 2 - NAME_INSET, y: -(rect.height / 2 - NAME_INSET) };
        };

        gsap.set(sheet, { opacity: 0, clipPath: CLOSED });
        gsap.set(rows, { opacity: 0, x: 14 });
        if (name) {
          gsap.set(name, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 1,
            opacity: NAME_REST,
            transformOrigin: '100% 0%',
          });
        }

        const hover = gsap.timeline({ paused: true });

        if (name) {
          hover.to(
            name,
            {
              xPercent: -100,
              yPercent: 0,
              x: () => nameTarget().x,
              y: () => nameTarget().y,
              scale: NAME_SMALL,
              opacity: 1,
              transformOrigin: '100% 0%',
              duration: NAME_TRAVEL,
              ease: EASE.inOut,
            },
            0,
          );
        }

        hover
          /* The drawer starts while the name is still travelling, not after it
             lands — "and then the info slider comes" reads as a sequence rather
             than as two things queued. */
          .to(sheet, { opacity: 1, clipPath: OPEN, duration: SHEET_WIPE, ease: EASE.out }, SHEET_DELAY)
          /* The rows follow the wipe across rather than arriving with it, so the
             panel reads as being drawn rather than switched on. */
          .to(
            rows,
            { opacity: 1, x: 0, duration: DUR.mid, ease: EASE.out, stagger: 0.05 },
            SHEET_DELAY + 0.12,
          );

        const open = () => {
          if (hover.progress() === 0) hover.invalidate();
          hover.timeScale(1).play();
        };

        /* Reverses run faster — CLAUDE.md non-negotiable 5. */
        const close = () => hover.timeScale(REVERSE_SCALE).reverse();

        const enter = () => {
          open();
          /* ── the overlay stays off the timeline ────────────────────────────
             §21.2's timings are asymmetric **in the opposite direction to the
             rest of the site**: in over 500ms, out over 400ms, where everything
             else reverses faster than it plays.

             It was briefly folded into the hover timeline while that was being
             rebuilt, and the file's own note had already said why not — a
             reversed timeline runs at `REVERSE_SCALE`, which would have made the
             exit *slower* than 400ms and quietly flattened the one place tonik
             deliberately went the other way. `verify:motion` caught it, which is
             the assertion earning its place.

             Safe to keep separate: the stuck-sheet bug (I-064) came from a tween
             carrying a `delay`, and this one has none — so a leave can never
             arrive before it starts. */
          if (overlay) {
            gsap.to(overlay, { opacity: 0.55, duration: DUR.mid, ease: EASE.inOut, overwrite: 'auto' });
          }
          if (video && still) {
            gsap.set(still, { opacity: 0 });
            void video.play().catch(() => undefined);
          }
        };

        const leave = () => {
          close();
          // §21.2 — out over 400ms, faster than in. See the note in `enter`.
          if (overlay) {
            gsap.to(overlay, { opacity: 0, duration: DUR.base, ease: EASE.inOut, overwrite: 'auto' });
          }
          if (video && still) {
            gsap.set(still, { opacity: 1 });
            video.pause();
            video.currentTime = 0;
          }
        };

        /* Keyboard reaches the card through its link, and the sheet is real
           content a keyboard visitor should be able to see. **`:focus-visible`,
           not `focusin`** — the browser only sets it for focus the visitor
           actually drove, so a link focused programmatically on the way back
           from the page it points at no longer opens a drawer over an untouched
           card. */
        const onFocusIn = (event: FocusEvent) => {
          const target = event.target as Element | null;
          if (target?.matches?.(':focus-visible')) open();
        };

        const onFocusOut = () => {
          /* Still pointed at, or focus simply moved within the card. */
          if (card.matches(':hover') || card.contains(document.activeElement)) return;
          close();
        };

        card.addEventListener('mouseenter', enter);
        card.addEventListener('mouseleave', leave);
        /* `pointercancel` for the case the other three miss: a gesture the
           browser takes over — a scroll started on the card, a context menu —
           ends the pointer without ever sending `mouseleave`. */
        card.addEventListener('pointercancel', leave);
        card.addEventListener('focusin', onFocusIn);
        card.addEventListener('focusout', onFocusOut);

        return () => {
          card.removeEventListener('mouseenter', enter);
          card.removeEventListener('mouseleave', leave);
          card.removeEventListener('pointercancel', leave);
          /* These two were leaking. The old cleanup removed the mouse handlers
             and left the focus ones attached, so a rebuild — a breakpoint
             change, a filter on `/works` — stacked a second pair on the same
             card. */
          card.removeEventListener('focusin', onFocusIn);
          card.removeEventListener('focusout', onFocusOut);
        };
      });

      /* No refresh from a cleanup — see lib/motion/scrollRefresh.ts. */
      return () => mm.revert();
    },
    { scope: root, dependencies: [work.slug] },
  );

  const specRows = [
    { key: 'Services', value: work.services },
    { key: 'Tools', value: work.tools },
    { key: 'Industries', value: work.industries },
    { key: 'Year', value: [String(work.year)] },
    /* tonik's fifth row is LOCATION. `40-content-model.md` §1 replaces it with
       status, which is the fact about our work that theirs does not have. */
    { key: 'Status', value: [work.status] },
  ];

  return (
    <article
      ref={root}
      className={[s.card, className].filter(Boolean).join(' ')}
      data-work-card
      data-work-width={work.card.width}
      /* The work's own accent, handed to CSS so the hover panel can be tinted
         with it. A custom property rather than an inline background: the
         stylesheet decides how much of it to use and what to mix it into, and
         that ratio is a design decision that belongs next to the other ones. */
      style={
        {
          '--work-accent': work.accent.dark,
          /* The light member of the pair, for anything that has to be *read*
             rather than filled. Same distinction as `--accent-ink` on a case
             study (I-046).

             Its consumer changed hands in the same session it nearly lost one:
             the custom cursor's disc read this to tint itself, the disc went
             white (D-057), and the plate's accent datum — a 1px line that
             disappears entirely in the dark member on a `--grey-900` ground —
             picked it up (D-059). */
          '--work-accent-ink': work.accent.light,
        } as React.CSSProperties
      }
    >
      {/* A real navigation to a real page — the lightbox that used to intercept
          this is gone (D-037). `data-accent-ink` tints the loader's glyph on the
          way out, so the work's colour arrives with the transition (T6.7). */}
      <Link href={`/works/${work.slug}`} className={s.link} data-accent-ink={work.accent.light}>
        {/* The positioning context for the sheet, and the reason it exists.

            The sheet was `position: absolute; bottom: 0` with no relative
            ancestor between it and `.card` — so "bottom" meant the bottom of
            the whole card, caption included, and the panel covered the work's
            name and summary. Sayandeep: *"the info at the bottom of the actual
            card, the project name and the right side description, those are
            getting covered too. I don't want that getting covered — just cover
            the card image itself, not the info."*

            The frame is exactly the media's box. The caption lives outside it
            and can no longer be reached. See D-025. */}
        {/* `data-cursor` makes the card a target for `<CustomCursor>` — D-046.
            The label is the verb, and it is what the disc says while you are
            over the card. */}
        <div className={s.frame} data-cursor="View">
          <div className={s.media} data-work-media>
          <div className={s.still} data-work-still>
            {work.card.art ? (
              /* A generated plate. D-038 — the card shows what the case study
                 shows, and neither is a screenshot of somebody else's chrome.

                 The three annotations are **facts about this work**, not
                 decoration: the figure number is its real position in the
                 twelve, and the edition is that position over the real total.
                 D-059 is emphatic about this — the reference generates a
                 catalogue number because it has nothing else to print there,
                 and a studio called No Filter putting an invented serial on its
                 own work would be the one joke on the site that is at its own
                 expense. `code` is left to default to the seed, which is the
                 plate's actual name. */
              <Artwork
                seed={work.card.art}
                figure={work.order}
                /* `WORKS_COUNT`, not `WORKS.length`. This is a client
                   component, and importing the collection here would pull all
                   twelve work modules into the client bundle to read one
                   number — the same shape of mistake as I-061, on a route
                   already at 351.7KB of a 360KB budget. `WORKS_COUNT` is the
                   constant the navbar's superscript already trusts. */
                edition={`${String(work.order).padStart(2, '0')}/${WORKS_COUNT}`}
                /* No rings, no arcs, no radial marks — see `RECTILINEAR` in
                   `Artwork.tsx`. The card is the one place a plate is drawn
                   under moving type, and a round instrument under a title that
                   travels in a straight line to a corner reads as two systems
                   rather than one. `/about` keeps all seven. */
                family="rectilinear"
              />
            ) : work.card.poster ? (
              /* `srcSet` derived from the 1× name rather than stored — see the
                 note on `poster` in `_types.ts`.

                 `sizes` matters here and is easy to leave off: without it the
                 browser assumes the image fills the viewport and picks the 2×
                 for every card, which is 249KB of ReIN Bot to fill a 536px box.
                 A `half` card is about 40% of the viewport at 1512 and the full
                 width below 992. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.card.poster}
                srcSet={`${work.card.poster} 1440w, ${work.card.poster.replace('.webp', '@2x.webp')} 2880w`}
                sizes="(max-width: 991px) 100vw, 45vw"
                alt=""
                className={s.image}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <WorkCover slug={work.slug} accent={work.accent} order={work.order} />
            )}
          </div>

          {work.card.reel && (
            <video
              ref={videoRef}
              className={s.video}
              src={work.card.reel}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            />
          )}

          {/* §21.2's extra layer. Sits over the media and under the sheet. */}
          <div className={s.overlay} data-work-overlay aria-hidden="true" />

          {/* The reveal. `width: 100%` at rest, wiped to 0% on entry — so it
              covers the media until the card has arrived. */}
          <div className={s.wipe} data-work-wipe aria-hidden="true" />

            {/* ── the name, and the chip ───────────────────────────────
                Sayandeep, twice. First: *"show the name of the projects on top
                of the card like tonik does."* Then, on the top-left version:
                *"not at top left corner .. at the centre .. initially faded and
                u hover it pops up."*

                It matters more here than it does for tonik. Their cards are key
                images of recognisable clients; ours are **generated plates**
                (D-038), so without a name on the picture there is no way to tell
                one card from another until you read the caption under it.

                Centred and faded is the better answer for exactly that reason:
                at rest it is a watermark that tells you which work this is
                without competing with the plate, and on hover it becomes the
                label. The CASE STUDY chip stays where tonik has it. */}
            {/* The watermark. `aria-hidden` because the same title is read
                twice otherwise — once here and once as the drawer's heading
                below, which is the element that actually labels the panel. */}
            <span className={s.name} data-t="h2" data-work-name aria-hidden="true">
              {work.title}
            </span>

            <span className={s.rail} data-work-badge>
              <span className={s.badge} data-t="label-sm">
                Case study
              </span>
            </span>
          </div>

          {/* A SIBLING of the media, as §5's anatomy has it — not a child. Above
              768 it is absolutely positioned over the media's box and wiped in
              on hover; at ≤767 it drops into the flow and becomes the card's
              second block. One element, two layouts, and only the second one is
              what a phone ever sees. */}
          <div className={s.sheet} data-work-sheet>
            {/* Not `invert`. The panel is dark now (D-024), so the table wants
                its ordinary palette: grey keys, white values, white-30 rules. */}
            <SpecTable rows={specRows} className={s.sheetTable} />
          </div>
        </div>

        {/* Outside the frame, so nothing can cover it — and it no longer moves.
            §5 slides the caption to -110% of its own height on hover, which
            makes the work's name disappear at the exact moment you are reading
            about it. See D-025. */}
        <div className={s.info} data-work-info>
          <span className={s.client} data-t="label">
            {work.title}
          </span>
          <span className={s.summary} data-t="p-sm">
            {work.summary}
          </span>
        </div>
      </Link>
    </article>
  );
}
