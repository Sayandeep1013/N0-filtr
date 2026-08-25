'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, REVERSE_SCALE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { useMotion } from '@/lib/motion/MotionProvider';
import { ContactForm } from './ContactForm';
import { cx } from '@/lib/cx';
import s from './ContactPanel.module.css';

/**
 * <ContactPanel /> — docs/spec/20-components-and-motion.md §3.
 *
 * Global, and triggered by **any** `[data-contact]` element: the nav CTA, the
 * CTA block, the footer, the service heroes. The listener is delegated at the
 * document, so a phase that wants a contact trigger adds an attribute and
 * nothing else.
 *
 * The open timeline is [src], transcribed from `initContact` in their bundle
 * and confirmed against it in phase 1:
 *
 *   set  heading  opacity 0
 *   set  meta     opacity 0, x 10%
 *   to   contact  opacity 1            .4s
 *   to   sidebar  x 0%                 .7s   '<+0.3'
 *   to   heading  opacity 1            .3s   '<+0.2'
 *   to   meta     opacity 1, x 0%      .5s   power3.out, stagger amount .5   '<'
 *   to   gif      y 0%                 .5s   '<+0.2'
 *
 * Total 1.5s, and it stays 1.5s whatever the meta count is, because `amount`
 * distributes a fixed total rather than adding per item.
 *
 * Close is `tl.timeScale(1.2).reverse()` — the panel scale, not the button one.
 * Triggers: the × button, a scrim click, and Escape.
 */
export function ContactPanel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  /** What had focus before the panel opened, so it can be given back. */
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const { reducedMotion, stopScroll, startScroll } = useMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const sidebar = root.querySelector('.contact__sidebar');
      const heading = root.querySelector('.contact__heading');
      const meta = root.querySelectorAll('.contact__meta');
      const gif = root.querySelector('.contact__gif');
      if (!sidebar || !heading || !gif) return;

      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          root.style.display = 'none';
        },
      });

      if (reducedMotion) {
        /* [new] No transform, no stagger — the panel simply appears. tonik ships
           no reduced-motion path at all; this is CLAUDE.md non-negotiable §8. */
        tl.set([sidebar, gif], { x: '0%', y: '0%' })
          .set([heading, ...meta], { opacity: 1, x: '0%' })
          .to(root, { opacity: 1, duration: 0.2, ease: EASE.linear });
      } else {
        tl.set(heading, { opacity: 0 })
          .set(meta, { opacity: 0, x: '10%' })
          .to(root, { opacity: 1, duration: DUR.base })
          .to(sidebar, { x: '0%', duration: DUR.slower }, '<+0.3')
          .to(heading, { opacity: 1, duration: DUR.fast }, '<+0.2')
          .to(
            meta,
            {
              opacity: 1,
              x: '0%',
              duration: DUR.mid,
              ease: EASE.out,
              stagger: { amount: 0.5, from: 'start', each: 0.1 },
            },
            '<',
          )
          .to(gif, { y: '0%', duration: DUR.mid }, '<+0.2');
      }

      tlRef.current = tl;
      registerTimeline('contact.open', tl);

      return () => {
        unregisterTimeline('contact.open');
        tlRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const close = useCallback(() => setOpen(false), []);

  /* ── delegated triggers ─────────────────────────────────────────────────
     Any [data-contact] element opens the panel. The loader's own delegated
     click listener ignores these: they are buttons, not anchors. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest?.('[data-contact]');
      if (!trigger) return;
      event.preventDefault();
      restoreFocusTo.current = trigger instanceof HTMLElement ? trigger : null;
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* ── open / close ───────────────────────────────────────────────────────
     display is toggled here rather than inside the timeline: the forward
     direction needs it *before* the first frame, and the reverse needs it after
     the last, which is what onReverseComplete is for. */
  useEffect(() => {
    const root = rootRef.current;
    const tl = tlRef.current;
    if (!root || !tl) return;

    if (open) {
      root.style.display = 'block';
      tl.timeScale(1).play();
      stopScroll();
      // Focus lands on the panel itself; the close button is its first stop.
      root.focus({ preventScroll: true });
    } else if (tl.progress() > 0) {
      tl.timeScale(REVERSE_SCALE).reverse();
      startScroll();
      restoreFocusTo.current?.focus({ preventScroll: true });
      restoreFocusTo.current = null;
    }
  }, [open, stopScroll, startScroll]);

  /* ── Escape, and a focus trap ───────────────────────────────────────────
     60-architecture-and-build.md §6 — the panel is a real dialog: Escape
     closes it, Tab cannot leave it, and focus returns where it came from. */
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    if (!root) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [
        ...root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      className={cx(s.contact, 'contact')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className={s.scrim} onClick={close} aria-hidden="true" />

      <div className={cx(s.gif, 'contact__gif')} aria-hidden="true" />

      <div className={cx(s.sidebar, 'contact__sidebar')}>
        <div className={cx(s.heading, 'contact__heading')}>
          <h2 id="contact-title" data-t="h3" className={s.title}>
            Contact us
          </h2>

          <button
            type="button"
            className={cx(s.close, 'contact-us_close-btn')}
            onClick={close}
            aria-label="Close contact panel"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          <p data-t="p" className={cx(s.lead, 'contact__meta')}>
            Tell us what you are building. We reply to everything, usually within a day.
          </p>

          <div className={cx(s.divider, 'contact__meta')} aria-hidden="true" />
        </div>

        <div className={cx(s.body, 'contact__meta')} data-lenis-prevent>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
