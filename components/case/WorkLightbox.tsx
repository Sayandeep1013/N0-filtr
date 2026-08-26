'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, REVERSE_SCALE } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import s from './WorkLightbox.module.css';

/**
 * `<WorkLightbox />`. `20-components-and-motion.md` §16.
 *
 * Their version is an Ajax modal: `fetch` the case study, parse it with
 * `DOMParser`, lift `[data-modal-content]` out of the result, push the URL with
 * `history.replaceState`, then play the slide-in.
 *
 * §16's own adaptation note: *"rather than `fetch` + `DOMParser`, use a parallel
 * route (`@modal/(.)works/[slug]`) with the same Flip-less slide-in timeline.
 * Identical feel, real routing, no HTML parsing."* That is what this is — the
 * content arrives as `children` from the intercepting route, already rendered
 * on the server.
 *
 * The timeline is theirs, unchanged:
 *
 * ```js
 * tl.set  (lightbox, { display: 'flex', onComplete: () => modal.scrollTop = 0 })
 *   .fromTo(lightbox,{ opacity: 0 }, { opacity: 1, duration: .4 })
 *   .fromTo(wrapper, { x: '120%' },  { x: '0%',   duration: .7 }, '>-0.1');
 * ```
 *
 * ── Closing ─────────────────────────────────────────────────────────────
 *
 * §16: *"Closes on ×, scrim, outside click, and `Escape`."* All four, and all
 * four go through `router.back()` rather than through an `open` boolean —
 * the modal's existence *is* the route, so unwinding the history entry is what
 * actually closes it. Anything else leaves the URL claiming a case study is
 * open when it is not.
 *
 * The close runs the timeline in reverse at `REVERSE_SCALE`, per the site-wide
 * rule that reverses run faster, and navigates from `onReverseComplete` so the
 * panel is gone before the grid comes back rather than during.
 *
 * ── The focus trap ──────────────────────────────────────────────────────
 *
 * §16 describes theirs: *"the last focusable element's `focusout` returns focus
 * to the close button."* That is a one-way trap — it catches tab-forward off
 * the end and does nothing for shift-tab off the front, which walks straight
 * out into the page underneath. Ours wraps in both directions, from a keydown
 * on Tab rather than from `focusout`, because `focusout` fires before the next
 * element is focused and cannot tell a wrap from a click into the page.
 *
 * `inert` on the rest of the document would be the modern answer and is not
 * available: the page underneath is a sibling in the same layout tree and
 * marking it inert from here means reaching outside this component into markup
 * it does not own.
 */
export function WorkLightbox({ children, title }: { children: ReactNode; title: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);

  const router = useRouter();
  const { reducedMotion } = useMotion();

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const tl = timelineRef.current;
    if (!tl) {
      router.back();
      return;
    }
    tl.eventCallback('onReverseComplete', () => router.back());
    tl.timeScale(REVERSE_SCALE).reverse();
  }, [router]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const wrap = wrapRef.current;
      const scroller = scrollRef.current;
      if (!root || !wrap) return;

      const tl = gsap.timeline({ paused: true });

      if (reducedMotion) {
        /* No slide. The panel is simply there, and the opacity step is short
           enough to read as an appearance rather than as motion. */
        tl.set(root, { display: 'flex' })
          .set(wrap, { x: '0%' })
          .fromTo(root, { opacity: 0 }, { opacity: 1, duration: DUR.micro, ease: EASE.linear });
      } else {
        tl.set(root, {
          display: 'flex',
          onComplete: () => {
            if (scroller) scroller.scrollTop = 0;
          },
        })
          .fromTo(root, { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: EASE.linear })
          .fromTo(wrap, { x: '120%' }, { x: '0%', duration: DUR.slower, ease: EASE.out }, '>-0.1');
      }

      timelineRef.current = tl;
      registerTimeline('lightbox.open', tl);
      tl.play();

      return () => {
        unregisterTimeline('lightbox.open');
        timelineRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  /* Escape, the focus wrap, and the scroll lock. One effect because all three
     belong to "the modal is open" and unwinding them separately is how one gets
     left behind. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [close]);

  return (
    <div
      ref={rootRef}
      className={s.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — case study`}
    >
      {/* The scrim. A button rather than a div with an onClick: "outside click"
          and "× " are the same affordance to a screen reader, and one of them
          should be reachable without a pointer. */}
      <button type="button" className={s.scrim} onClick={close} aria-label="Close case study" />

      <div ref={wrapRef} className={s.wrap}>
        <button ref={closeRef} type="button" className={s.close} onClick={close}>
          <span data-t="label">Close</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={s.cross}>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div ref={scrollRef} className={s.scroller}>
          {children}
        </div>
      </div>
    </div>
  );
}
