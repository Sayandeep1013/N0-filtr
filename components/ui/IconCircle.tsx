import { cx } from '@/lib/cx';
import s from './IconCircle.module.css';

/**
 * <IconCircle /> — docs/spec/20-components-and-motion.md §9.
 *
 * The circular arrow that appears on the nav CTA, the footer social bars, the
 * form submit bar and the CTA block. It renders the glyph **twice**: the second
 * copy is the twin the diagonal swap in §21.3 slides in. The swap itself is
 * driven by `useIconSwap` on whatever the hover target is — usually the whole
 * button, not this circle.
 */

export type IconCircleSize = 'inline' | 'social' | 'cta';

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={s.glyph}>
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCircle({
  size = 'inline',
  inverted = false,
  className,
}: {
  size?: IconCircleSize;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <span className={cx(s.circle, s[size], inverted && s.inverted, 'icon-circle', className)} aria-hidden="true">
      <span className={cx(s.icon, 'button-icon')}>
        <Arrow />
      </span>
      <span className={cx(s.icon, s.twin, 'button-icon', 'is-absolute')}>
        <Arrow />
      </span>
    </span>
  );
}
