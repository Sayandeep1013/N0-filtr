'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { refreshScrollTriggers } from '@/lib/motion/scrollRefresh';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { Button } from '@/components/ui/Button';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { SERVICES_FULL, featuredWorkFor } from '@/lib/content/services';
import { WorkCover } from '@/components/works/WorkCover';
import s from './ServicesAccordion.module.css';

/**
 * How far below the viewport's top an opened row parks.
 *
 * The navbar is `position: fixed` with a 0.75rem padding in its mini state, so
 * a row scrolled to y=0 would sit under it. 6rem clears the bar and leaves the
 * row's own head visible above its content rather than flush against the
 * chrome. In rem, like everything else, so it scales with the fluid root.
 */
const OPEN_SCROLL_OFFSET_REM = 6;

/**
 * The services accordion. `20-components-and-motion.md` §6.
 *
 * Five rows, one open at a time.
 *
 * ── The two-part body, and why it is animated in two parts ─────────────────
 *
 * §6's open and close are not one height tween. The body's height opens over
 * `.7s`, and the inverted right panel *slides in* over `.5s` afterwards. On the
 * way out the panel leaves first, over `.6s`, and the body collapses behind it
 * — so the panel is never caught mid-collapse with its own height changing
 * under it. That ordering is the whole design and it is why the close is a
 * four-step timeline rather than a reverse.
 *
 * ```js
 * open:  .fromTo(body, {height: 0}, {height: 'auto', duration: .7})
 *        .set(right, {opacity: 1})
 *        .to(right, {x: '0%', duration: .5});
 *
 * close: .to(right, {x: '-100%', duration: .6})
 *        .set(right, {opacity: 0})
 *        .to(body, {height: 0, duration: .6}, '>-0.1')
 *        .to(right, {height: '0%', duration: .6}, '<');
 * ```
 *
 * ── ≤767 drops the slide entirely ─────────────────────────────────────────
 *
 * §6 again, and it is a different timeline rather than a disabled tween: both
 * parts animate on height alone. An `x: -100%` panel on a 390 viewport is a
 * full-width element travelling across the screen, which is motion sickness
 * rather than choreography.
 *
 * ── The typo we do not reproduce ──────────────────────────────────────────
 *
 * §6: *"tonik's source contains four `onComplate` typos (sic) in this function,
 * so those callbacks never fire. We implement the evident intent with
 * correctly-spelled `onComplete`."* The evident intent is the featured video —
 * play on open, pause and rewind on close.
 *
 * ── Column 2 does not exist ───────────────────────────────────────────────
 *
 * §6's body is three columns: prose 5/12, testimonial 3/12, spec panel 4/12.
 * Decision 2 dropped testimonials, and §6 says what to do about it: "columns 1
 * and 3 widen to 7/12 and 5/12."
 */
export function ServicesAccordion() {
  /* Closed to start. `30-page-specs.md` §3: "5 rows, first closed by default."
     A pre-opened row would also mean the section's height changes on mount,
     which every ScrollTrigger below it would then have to be refreshed for. */
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  /** Where the visitor was before they opened anything. */
  const restoreY = useRef<number | null>(null);
  const { lenis, reducedMotion } = useMotion();

  /**
   * ── Opening a row takes you to it; closing brings you back ────────────────
   *
   * Sayandeep: *"when I click on Product Design and all, it opens up where I
   * click — but as the content is that big, what it should do is it should get
   * clipped up to the top and open the content, and you click it again it clips
   * back down from where you left."*
   *
   * An open row is most of a viewport tall. Opened in place, its head stays
   * wherever it was and the body unrolls below the fold, so the thing you
   * asked to see is the thing you cannot see. Neither §6 nor tonik covers this
   * — their rows are shorter. See D-029.
   *
   * **The target is predicted, not measured after the fact.** Scrolling only
   * once the layout has settled means waiting out the 0.7s open, which reads as
   * a lag rather than as a response. But the row's own top is knowable now: it
   * only moves if the row that is closing sits *above* it, and by exactly that
   * row's body height. One subtraction, and the scroll starts on the same frame
   * as the click.
   */
  const toggle = useCallback(
    (slug: string) => {
      const opening = openSlug !== slug;
      const previous = openSlug;

      if (opening) {
        /* Only the first open of a sequence is worth remembering. Switching
           from one row to another should still return you to where you came
           into the section, not to the middle of the row you just left. */
        if (previous === null) restoreY.current = window.scrollY;
      }

      setOpenSlug(opening ? slug : null);

      const scope = root.current;
      if (!scope) return;

      const rows = [...scope.querySelectorAll<HTMLElement>('[data-service-row]')];
      const target = rows.find((row) => row.dataset.serviceSlug === slug);
      if (!target) return;

      let to: number;
      if (opening) {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        let shift = 0;
        if (previous) {
          const closing = rows.find((row) => row.dataset.serviceSlug === previous);
          if (closing && rows.indexOf(closing) < rows.indexOf(target)) {
            shift = closing.querySelector<HTMLElement>('[data-service-body]')?.offsetHeight ?? 0;
          }
        }
        to = target.getBoundingClientRect().top + window.scrollY - shift - OPEN_SCROLL_OFFSET_REM * rem;
      } else {
        to = restoreY.current ?? window.scrollY;
        restoreY.current = null;
      }

      to = Math.max(0, to);

      /* ── the instance comes from the provider, never from `window` ──────
         This read `window.lenis` and shipped a production-only crash:

             TypeError: m.scrollTo is not a function

         **Lenis sets `window.lenis = { version }` itself**, as a build stamp.
         In development our own MotionProvider overwrites that global with the
         real instance for the test harness, so the property is a Lenis and
         everything works. In a production build that assignment is compiled
         away — and `window.lenis` is left as the library's version object:
         truthy, and without a `scrollTo` on it.

         So the guard passed, the call threw, and it threw **only in
         production**, on every accordion click. Caught by hammering a real
         `next build` rather than the dev server. See I-045.

         `useMotion()` is the actual API and is null under reduced motion, which
         is the same condition the old code was checking separately. */
      if (lenis && !reducedMotion) {
        /* ── the two directions are not the same journey ───────────────────
           Opening is a response: you clicked a thing and it comes to you, so
           0.6s and out of the way before the 0.7s body open finishes.

           Closing is a return, and Sayandeep was right that it was wrong:
           *"the opening is smooth but the closing needs an ease in — not so
           quick."* You are being carried back somewhere you were not looking,
           over a distance that is usually most of a viewport, so it needs long
           enough to follow and an ease that starts gently rather than snapping
           away from the row you just closed.

           This is the one place on this site where the reverse is SLOWER than
           the forward, and it is deliberate. CLAUDE.md's "reverses run faster"
           rule is about panels and buttons snapping shut — the eye already
           knows where they went. A scroll is the opposite case: nothing on
           screen tells you where you are going, so the motion has to. */
        lenis.scrollTo(to, {
          duration: opening ? 0.6 : 1.15,
          easing: opening
            ? undefined
            : /* easeInOutCubic — a soft departure, a soft arrival. */
              (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        });
      } else {
        /* No Lenis under reduced motion, and no smooth scroll either — an
           instant jump is the honest version of this for someone who asked not
           to be moved through space. */
        window.scrollTo(0, to);
      }
    },
    [openSlug, reducedMotion, lenis],
  );

  return (
    <div ref={root} className={s.accordion} data-accordion>
      {SERVICES_FULL.map((service) => (
        <ServiceRow
          key={service.slug}
          service={service}
          isOpen={openSlug === service.slug}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function ServiceRow({
  service,
  isOpen,
  onToggle,
}: {
  service: (typeof SERVICES_FULL)[number];
  isOpen: boolean;
  onToggle: (slug: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const featured = featuredWorkFor(service);

  /* The first row registers its timelines for `verify:motion`. One call site,
     not five — a registry of five identical shapes says nothing the first one
     does not. */
  const registers = service.index === 1;

  useGSAP(
    () => {
      const bodyEl = body.current;
      const rightEl = right.current;
      if (!bodyEl || !rightEl) return;

      const mm = gsap.matchMedia();

      const buildDesktop = () => {
        if (isOpen) {
          const tl = gsap.timeline();
          tl.fromTo(bodyEl, { height: 0 }, { height: 'auto', duration: DUR.slower, ease: EASE.out })
            .set(rightEl, { opacity: 1, height: 'auto' })
            .to(rightEl, { xPercent: 0, duration: DUR.mid, ease: EASE.out });
          if (registers) registerTimeline('accordion.open', tl);
          return tl;
        }

        const tl = gsap.timeline();
        tl.to(rightEl, { xPercent: -100, duration: DUR.slow, ease: EASE.in })
          .set(rightEl, { opacity: 0 })
          .to(bodyEl, { height: 0, duration: DUR.slow, ease: EASE.in }, '>-0.1')
          .to(rightEl, { height: '0%', duration: DUR.slow, ease: EASE.in }, '<');
        if (registers) registerTimeline('accordion.close', tl);
        return tl;
      };

      /* ≤767: height only, on both parts, in both directions. */
      const buildMobile = () => {
        const tl = gsap.timeline();
        if (isOpen) {
          tl.fromTo(bodyEl, { height: 0 }, { height: 'auto', duration: DUR.slower, ease: EASE.out })
            .fromTo(
              rightEl,
              { height: 0 },
              { height: 'auto', opacity: 1, duration: DUR.slower, ease: EASE.out },
              '<',
            );
        } else {
          tl.to(bodyEl, { height: 0, duration: DUR.slow, ease: EASE.in }).to(
            rightEl,
            { height: 0, duration: DUR.slow, ease: EASE.in },
            '<',
          );
        }
        return tl;
      };

      mm.add(MQ.above767, () => {
        gsap.set(rightEl, isOpen ? {} : { xPercent: -100, opacity: 0 });
        const tl = buildDesktop();
        return () => {
          tl.kill();
          if (registers) {
            unregisterTimeline('accordion.open');
            unregisterTimeline('accordion.close');
          }
        };
      });

      mm.add('(max-width: 767px)', () => {
        /* The x-slide must not survive a viewport crossing 767, or the panel is
           parked off-screen with no timeline left to bring it back. */
        gsap.set(rightEl, { xPercent: 0 });
        const tl = buildMobile();
        return () => tl.kill();
      });

      /* Reduced motion: no heights, no slide. The row is open or it is not. */
      mm.add(MQ.reduced, () => {
        gsap.set(bodyEl, { height: isOpen ? 'auto' : 0 });
        gsap.set(rightEl, { xPercent: 0, opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 });
      });

      /* Anything below this section has moved. Without a refresh the works
         grid's parallax and the reveals keep their pre-open trigger positions,
         which is a bug you only see after opening a row and scrolling down.

         **This is the only legitimate refresh on the site**, and it goes
         through the coalescing helper rather than calling ScrollTrigger
         directly — five rows re-render on one toggle, and five direct calls
         walk the trigger list five times while React is still committing. */
      const refresh = gsap.delayedCall(DUR.slower + 0.1, refreshScrollTriggers);

      /* The matchMedia is the context's to revert — calling it here as well ran
         every `mm.add()` cleanup twice and spliced `_triggers` for a trigger
         already removed from it, which is I-051.

         `refresh.kill()` stays, and the asymmetry is deliberate: a
         `delayedCall` that survives unmount fires `refreshScrollTriggers` at a
         component that no longer exists, and killing a tween twice is harmless
         where killing a ScrollTrigger twice is not. */
      return () => refresh.kill();
    },
    { scope: row, dependencies: [isOpen] },
  );

  const panelId = `svc-panel-${service.slug}`;
  const headId = `svc-head-${service.slug}`;

  return (
    <div
      ref={row}
      className={s.row}
      data-service-row
      data-service-slug={service.slug}
      data-open={isOpen ? 'true' : 'false'}
    >
      <h3 className={s.headWrap}>
        <button
          id={headId}
          type="button"
          className={s.head}
          onClick={() => onToggle(service.slug)}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <ServiceIcon slug={service.slug} className={s.icon} />
          <span className={s.name} data-t="h4">
            {service.name}
          </span>
          {/* §6: the arrow rotates ↓ → → on open. One glyph rotated, not two
              swapped — the rotation is the state, so it cannot disagree with
              `data-open`. */}
          <span ref={arrow} className={s.arrow} aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <path
                d="M8 2v11M3.5 8.5L8 13l4.5-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
          </span>
        </button>
      </h3>

      {/* `height: 0; overflow: hidden` at rest — GSAP owns the height. */}
      <div
        ref={body}
        id={panelId}
        role="region"
        aria-labelledby={headId}
        className={s.body}
        data-service-body
      >
        <div className={s.bodyInner}>
          <div className={s.prose}>
            <p className={s.lead} data-t="h5">
              {service.headline}
            </p>
            {service.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} data-t="p" className={s.paragraph}>
                {paragraph}
              </p>
            ))}
            <div className={s.cta}>
              <Button href={`/services/${service.slug}`}>More about {service.name}</Button>
            </div>
          </div>

          {/* §6's third column. Inverted — a light ground with dark text, the
              one place on this page that is. It is the panel that slides. */}
          <div ref={right} className={s.panel} data-service-panel>
            <div className={s.panelBlock}>
              <p className={s.panelKey} data-t="label">
                Output
              </p>
              <ul className={s.panelList}>
                {service.output.map((item) => (
                  <li key={item} data-t="p-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={s.panelBlock}>
              <p className={s.panelKey} data-t="label">
                Tools
              </p>
              <ul className={s.panelList}>
                {service.tools.map((item) => (
                  <li key={item} data-t="p-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {featured && (
              <div className={s.panelBlock}>
                <p className={s.panelKey} data-t="label">
                  Featured work
                </p>
                {/* §6 gives this slot a video that plays on open. There is no
                    reel until phase 10 (T10.2), so it is the work's own cover —
                    which is the same placeholder the grid uses, not a new one.
                    See I-035. */}
                <div className={s.featured}>
                  <WorkCover
                    slug={featured.slug}
                    accent={featured.accent}
                    order={featured.order}
                  />
                </div>
                <p className={s.featuredTitle} data-t="p-sm">
                  {featured.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
