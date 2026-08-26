'use client';

import type { RefObject } from 'react';
import { SHOWREEL } from '@/lib/content/site';
/* Plyr's own stylesheet. Static rather than dynamically imported, deliberately:
   a stylesheet fetched a frame after the player it dresses shows Plyr's SVG
   icons at their intrinsic size, which is a screen full of enormous black
   arrows over the hero. That is what the first build of this component did.
   The JS stays dynamic; CSS is not in the budget under pressure. */
import 'plyr/dist/plyr.css';
import s from './Showreel.module.css';

/**
 * The full-screen player, split out of `Showreel.tsx` and rendered **only after
 * mount** — see the `mounted` flag there for why.
 *
 * The short version: a `<video>` is the favourite target of media extensions,
 * they inject into it before React hydrates, and React reports that as a
 * hydration mismatch naming this file. Not rendering it on the server removes
 * the premise. `suppressHydrationWarning` does not, because it covers text and
 * attributes rather than injected children.
 *
 * It is a separate module rather than a nested component so the provider stays
 * readable: the provider is 250 lines of Flip and Plyr lifecycle, and this is
 * markup.
 */
export default function ShowreelPanel({
  sectionRef,
  playerWrapRef,
  playerRef,
  headingRef,
  videoRef,
  onClose,
  isOpen,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  playerWrapRef: RefObject<HTMLDivElement | null>;
  playerRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      className={s.section}
      aria-modal={isOpen || undefined}
      role="dialog"
      aria-label={SHOWREEL.label}
      aria-hidden={!isOpen}
    >
      {/* The scrim is the section's own background colour, which the open
          timeline tweens from #21212100 to #21212180. Clicking it closes —
          the same affordance the lightbox gets in phase 6. */}
      <button type="button" className={s.scrim} onClick={onClose} aria-label="Close showreel" />

      <div className={s.inner}>
        <div ref={headingRef} className={s.heading}>
          <p data-t="label" className={s.label}>
            {SHOWREEL.label}
          </p>
          <p data-t="h5">{SHOWREEL.title}</p>
          {/* Said out loud, not hidden in a comment. The reel in the player is
              our own hero, baked to give §15's Flip something real to open;
              T10.2 replaces it with the actual work. Anyone who opens this
              deserves to know which one they are watching. */}
          {SHOWREEL.isPlaceholder && (
            <p data-t="label" className={s.label}>
              Placeholder reel — real footage lands with the case studies
            </p>
          )}
        </div>

        {/* THE Flip target's destination. The button's background layer is
            appended here on open and taken back on close; it must therefore be
            an element whose box is the player's box. */}
        <div ref={playerWrapRef} className={s.playerWrap}>
          <div ref={playerRef} className={s.player}>
            {/* `suppressHydrationWarning` is belt to the braces above.

                The module is already `ssr: false`, so there is no server render
                to mismatch against. This stays for the case that survives that:
                a `<video>` whose attributes an extension rewrites between the
                client's own render and its commit. Cheap, scoped to this one
                element, and a genuine mismatch anywhere else still reports. */}
            <video
              ref={videoRef}
              playsInline
              poster={SHOWREEL.poster}
              preload="none"
              suppressHydrationWarning
            >
              {SHOWREEL.srcWebm && <source src={SHOWREEL.srcWebm} type="video/webm" />}
              {SHOWREEL.src && <source src={SHOWREEL.src} type="video/mp4" />}
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
