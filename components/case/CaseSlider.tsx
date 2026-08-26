'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Media } from '@/content/works/_types';
import { SIZES_CONTENT } from '@/lib/media';
import { Plate } from '@/components/ui/Plate';
import { CaseImage } from './CaseImage';
import s from './CaseSlider.module.css';

/**
 * The `slider` block. `30-page-specs.md` §2: *"Embla carousel, prev/next,
 * counter — replaces tonik's Swiper."*
 *
 * Embla rather than Swiper for the reason `60-architecture-and-build.md` gives:
 * Swiper is 140KB and ships a router, a virtual list and a lazy loader we would
 * never call. Embla is the transform and the drag, and nothing else.
 *
 * ── It is dynamically imported ───────────────────────────────────────────
 *
 * See `CaseBlocks.tsx`. The eleven case studies without a slider never download
 * this file.
 *
 * ── Keyboard and reduced motion ──────────────────────────────────────────
 *
 * The buttons are real buttons, so tab and enter work for free. The slides are
 * a labelled group and each announces its position, because a carousel whose
 * only affordance is a drag is a carousel a keyboard cannot see.
 *
 * `duration: 20` is Embla's own unit — roughly 300ms — and it drops to 0 under
 * `prefers-reduced-motion`, which is checked here rather than through
 * `useMotion()` because this component can render before the provider's
 * matchMedia has settled and a carousel that animates once before going still
 * is worse than one that never animates.
 */
export function CaseSlider({ items, label }: { items: Media[]; label: string }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const [emblaRef, embla] = useEmblaCarousel({
    loop: false,
    align: 'start',
    duration: reduced ? 0 : 20,
    containScroll: 'trimSnaps',
  });

  const [index, setIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setIndex(embla.selectedScrollSnap());
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    sync();
    embla.on('select', sync).on('reInit', sync);
    return () => {
      embla.off('select', sync).off('reInit', sync);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div className={s.slider}>
      <div className={s.viewport} ref={emblaRef}>
        <div className={s.track} role="group" aria-roledescription="carousel" aria-label={label}>
          {items.map((item, i) => (
            <figure
              key={item.art ?? item.src ?? i}
              className={s.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <Plate size="md">
                <CaseImage
                src={item.src ?? ''}
                art={item.art}
                alt={item.alt ?? ''}
                sizes={SIZES_CONTENT}
                ratio={item.ratio}
              />
              </Plate>
              {item.caption ? (
                <figcaption data-t="label" className={s.caption}>
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>

      <div className={s.controls}>
        {/* The counter is padded so the row does not shift width between 9 and
            10 — a control bar that jitters as you page through it is the sort
            of thing nobody reports and everybody feels. */}
        <p data-t="label" className={s.counter} aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
        <div className={s.buttons}>
          <button type="button" className={s.button} onClick={prev} disabled={!canPrev} aria-label="Previous slide">
            <Chevron direction="left" />
          </button>
          <button type="button" className={s.button} onClick={next} disabled={!canNext} aria-label="Next slide">
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={s.chevron}>
      <path
        d={direction === 'left' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
