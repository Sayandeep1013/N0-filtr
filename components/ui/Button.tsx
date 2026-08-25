'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { cx } from '@/lib/cx';
import { useIconSwap } from '@/lib/motion/useIconSwap';
import { IconCircle } from './IconCircle';
import s from './Button.module.css';

/**
 * <Button /> — the pill, docs/spec/20-components-and-motion.md §9.
 *
 * Renders an `<a>` when given an href and a `<button>` otherwise. The trailing
 * circular icon is not decoration: it carries the §21.3 diagonal swap, which is
 * this button's entire hover vocabulary.
 */
export function Button({
  children,
  href,
  onClick,
  inverted = false,
  className,
  timelineId,
  'data-contact': dataContact,
  'aria-haspopup': ariaHasPopup,
  'aria-expanded': ariaExpanded,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Light pill, dark text, dark circle arrow — the navbar CTA. */
  inverted?: boolean;
  className?: string;
  /** Register the icon-swap timeline for verify:motion. One call site only. */
  timelineId?: string;
  'data-contact'?: boolean | '';
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useIconSwap(ref, timelineId);

  const content = (
    <>
      <span>{children}</span>
      <IconCircle inverted={inverted} />
    </>
  );

  const classes = cx(s.button, inverted && s.inverted, 'button', className);

  if (href) {
    return (
      <Link ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={classes}
      onClick={onClick}
      data-contact={dataContact === true ? '' : dataContact}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
    >
      {content}
    </button>
  );
}
