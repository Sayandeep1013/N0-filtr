import { cx } from '@/lib/cx';
import s from './Wordmark.module.css';

/**
 * `NO FiLTER` — docs/spec/50-brand-and-3d.md §1.
 *
 * The two words are separate elements so the 0.22em gap between them is an exact
 * measurement rather than whatever the face's space glyph happens to be. The
 * readable name is carried by a visually-hidden span, so a screen reader hears
 * "No Filter" — not "nofilter", and not the shouted "NO FILTER" that a screen
 * reader may spell out letter by letter.
 *
 * **The casing is authored here, not imposed by CSS.** `text-transform` is
 * `none` precisely so the one lowercase `i` survives: a `uppercase` rule would
 * eat the whole idea. Anyone changing this file has to type the case they mean.
 *
 * Chosen by Sayandeep, 2026-08-26, over `No FiLTER`, `No Filter` and
 * `NO FILTER`, all four set in the real face and compared at display and navbar
 * size. Both words in caps make the lone lowercase `i` unmistakably deliberate
 * rather than a typo, and it drops a dot into a run of caps — a small void
 * inside the letterform that rhymes with the aperture's empty centre. See D-011.
 */
/**
 * `decorative` drops the readable name and hides the whole mark from assistive
 * technology. It exists for `<HollowMark>`, which stacks two identical copies of
 * the word to light one of them — without it a screen reader would hear "No
 * Filter" twice in the footer, which is worse than either fix for it.
 */
export function Wordmark({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span className={cx(s.wordmark, 'wordmark', className)} aria-hidden={decorative || undefined}>
      {!decorative && <span className="visually-hidden">No Filter</span>}
      <span aria-hidden="true">NO</span>
      <span aria-hidden="true" className={s.gap} />
      <span aria-hidden="true">FiLTER</span>
    </span>
  );
}
