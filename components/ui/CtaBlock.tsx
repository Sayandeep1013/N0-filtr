'use client';

import { useRef } from 'react';
import { IconCircle } from './IconCircle';
import { useIconSwap } from '@/lib/motion/useIconSwap';
import s from './CtaBlock.module.css';

/**
 * The CTA block. `20-components-and-motion.md` §10, `30-page-specs.md` §4.
 *
 * ```
 * .cta   background var(--grey-900); padding 3rem; min-height 23rem
 *        cursor pointer; THE WHOLE BLOCK opens the contact panel
 *   label    "WORK WITH US" — --t-label, top-left
 *   heading  "Get in touch." — --t-h1 (6rem), bottom-left
 *   arrow    IconCircle 6rem, right, vertically centred
 * ```
 *
 * ── The whole block is the trigger, and that has to be honest ──────────────
 *
 * §10 is explicit that the entire 23rem panel is clickable, not just the arrow.
 * So it *is* a `<button>` — one element, the real one — rather than a `<div>`
 * with a click handler and a decorative button inside it. A div that opens a
 * dialog is unreachable by keyboard and announces as nothing; a button that
 * happens to be 23rem tall is simply a large button.
 *
 * That also means the `IconCircle` inside it must not be a button of its own.
 * It is not: `IconCircle` renders a `<span>`, which is why §9's icon swap can be
 * reused here without nesting an interactive element inside another.
 *
 * `data-contact` is what the contact panel listens for — §3 opens on any
 * `[data-contact]` click, so this component needs no knowledge of the panel.
 */
export function CtaBlock({
  label = 'Work with us',
  heading = 'Get in touch.',
}: {
  label?: string;
  heading?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  /* §21.3's diagonal swap, the same one the nav CTA runs. Gated at >991 inside
     the hook, so a touch device gets a static arrow rather than a stuck one. */
  useIconSwap(ref);

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={s.cta}
      /* A hook for `verify:motion`. It used to be found as "the first
         `button[data-contact]` on the page", which held right up until the hero
         grew a "Let's talk" button above it and the check started measuring a
         pill. A component that has to be identified should say what it is. */
      data-cta-block
      data-contact
      aria-haspopup="dialog"
    >
      <span className={s.text}>
        <span className={s.label} data-t="label">
          {label}
        </span>
        <span className={s.heading} data-t="h1">
          {heading}
        </span>
      </span>

      <span className={s.arrow}>
        <IconCircle />
      </span>
    </button>
  );
}
