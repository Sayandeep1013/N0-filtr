import { cx } from '@/lib/cx';
import s from './Wordmark.module.css';

/**
 * `no filter` — docs/spec/50-brand-and-3d.md §1.
 *
 * The two words are separate elements so the 0.22em gap between them is an exact
 * measurement rather than whatever the face's space glyph happens to be. The
 * readable name is carried by a visually-hidden span, so a screen reader hears
 * "No Filter" and not "nofilter".
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx(s.wordmark, 'wordmark', className)}>
      <span className="visually-hidden">No Filter</span>
      <span aria-hidden="true">no</span>
      <span aria-hidden="true" className={s.gap} />
      <span aria-hidden="true">filter</span>
    </span>
  );
}
