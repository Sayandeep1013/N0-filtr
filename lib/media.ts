/**
 * Poster sources. One rule, two callers, so they cannot drift.
 *
 * `scripts/optimise.mjs` writes every capture twice — `<slug>.webp` at 1440 and
 * `<slug>@2x.webp` at 2880 — and the 2× name is *derived* rather than stored.
 * `content/works/_types.ts` explains why on the `poster` field: a second field
 * is a second thing to forget, and a poster whose retina pair was never filled
 * in would quietly serve a 1× on every retina screen without anything reporting
 * it.
 *
 * `sizes` is not optional decoration. Without it a browser assumes the image
 * fills the viewport, picks the 2× for every slot, and downloads 249KB of ReIN
 * Bot to fill a 536px box.
 */

/** `<slug>.webp` → `<slug>.webp 1440w, <slug>@2x.webp 2880w`. */
export function posterSrcSet(src: string): string {
  return `${src} 1440w, ${src.replace('.webp', '@2x.webp')} 2880w`;
}

/** A work card in the 12-column grid: full width below 992, ~45% above it. */
export const SIZES_CARD = '(max-width: 991px) 100vw, 45vw';

/** A case-study visual inside the 80rem container, minus the gutter. */
export const SIZES_CONTENT = '(max-width: 991px) 100vw, min(80rem, 100vw - 5rem)';

/** Edge to edge — `visual-bleed`, and the case-study hero. */
export const SIZES_BLEED = '100vw';

/** Half the content column, side by side — `visual-2up`. */
export const SIZES_HALF = '(max-width: 767px) 100vw, min(40rem, 50vw)';
