import { cx } from '@/lib/cx';
import { posterSrcSet } from '@/lib/media';
import s from './CaseImage.module.css';

/**
 * One image inside a case study, at the right density for its slot.
 *
 * A plain `<img>` rather than `next/image`. The posters are already the exact
 * two widths the page asks for (`scripts/optimise.mjs`), already WebP, and
 * already inside the budget — routing them through the optimiser would add a
 * server hop and a second cache to produce files we generated at build time
 * anyway. `next/image` earns its place over sources we do not control; these we
 * do.
 *
 * `ratio` is the aspect box. Every capture is 16:10 (`scripts/capture.mjs`), so
 * that is the default, and reserving the box is what keeps the page from
 * relaying out as each poster lands — CLS on a page that is mostly images is
 * not a rounding error.
 */
export function CaseImage({
  src,
  alt,
  sizes,
  ratio,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** A CSS `aspect-ratio`. Defaults to the capture script's 16:10. */
  ratio?: string;
  /** The hero. Everything below the fold stays lazy. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={cx(s.box, className)} style={{ aspectRatio: ratio ?? '16 / 10' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={posterSrcSet(src)}
        sizes={sizes}
        alt={alt}
        className={s.img}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </span>
  );
}
