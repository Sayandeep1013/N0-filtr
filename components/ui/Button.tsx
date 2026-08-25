'use client';

import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import Link from 'next/link';
import { cx } from '@/lib/cx';
import { useIconSwap } from '@/lib/motion/useIconSwap';
import { IconCircle } from './IconCircle';
import s from './Button.module.css';

/**
 * <Button /> — the button family, docs/spec/20-components-and-motion.md §9.
 *
 *   ghost     the pill — "LET'S TALK", "MORE ABOUT PRODUCT DESIGN"
 *   inverted  the navbar CTA — light ground, dark text, dark disc
 *   bar       the footer social row — full width, label left, disc right
 *
 * Renders `<a>` for an href and `<button>` otherwise. The trailing circle is not
 * decoration: it carries the §21.3 diagonal swap, and on `inverted`/`bar` the
 * whole button also runs the §9 fill overlay. Both are hover, both are gated at
 * >991px — the swap in `useIconSwap`, the fill in the stylesheet.
 */

export type ButtonVariant = 'ghost' | 'inverted' | 'bar';

export function Button({
  children,
  href,
  external = false,
  onClick,
  variant = 'ghost',
  className,
  timelineId,
  contact = false,
  ariaHasPopup,
  ariaExpanded,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  /** Opens in a new tab, and skips the loader's link interception. */
  external?: boolean;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  /** Register the icon-swap timeline for verify:motion. One call site only. */
  timelineId?: string;
  /** Marks the button as a contact-panel trigger — §3 opens on any [data-contact]. */
  contact?: boolean;
  ariaHasPopup?: 'dialog';
  ariaExpanded?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useIconSwap(ref, timelineId);

  const content = (
    <>
      <span className={s.label}>{children}</span>
      <IconCircle inverted={variant === 'inverted'} />
      {variant !== 'ghost' && <span className={cx(s.overlay, 'button-icon-overlay')} aria-hidden="true" />}
    </>
  );

  const classes = cx(s.button, s[variant], 'button', className);

  if (href) {
    if (external) {
      return (
        <a
          ref={ref as RefObject<HTMLAnchorElement>}
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <Link ref={ref as RefObject<HTMLAnchorElement>} href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      className={classes}
      onClick={onClick}
      data-contact={contact ? '' : undefined}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
