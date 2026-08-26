'use client';

import { useCallback } from 'react';
import { useShowreel } from '@/components/motion/Showreel';
import s from './PlaySquare.module.css';

/**
 * The showreel control that sits **inline in the headline's second line**.
 * `30-page-specs.md` §1: "The play button sits INLINE in the text flow on
 * line 2."
 *
 * Transcribed from `docs/research/screens/tonik-hero-01.png`: a light square
 * carrying a white disc with a dark triangle in it. Three layers, not one icon
 * — the square's background is the Flip target that becomes the full-screen
 * player in §15, so it has to be its own element rather than a glyph inside
 * the disc.
 *
 * ── It is a real control, or it is not a control at all ────────────────────
 *
 * Phase 3 built the showreel (T3.6), so this is now the Flip trigger it was
 * always shaped to be. But it renders as a `<button>` **only when a reel file
 * actually exists** — `SHOWREEL.src` in `lib/content/site.ts`, which phase 10
 * (T10.2) fills. With no reel it renders exactly as it did in phase 2: a
 * `<span>`, `aria-hidden`, no handler, no focus ring, no pointer cursor.
 *
 * That branch is the honest one in both directions. A button that opens an
 * empty player is a worse promise than a shape that never claimed to be a
 * button, and a screen reader announcing "play" on a control that cannot play
 * is worse still. The moment a file lands, one constant changes and this is
 * live — no markup edit, no second implementation. See I-033.
 *
 * The two refs are how `<Showreel>` gets hold of the nodes it reparents: the
 * background layer flies to the player, the icon fades out under it, and the
 * trigger is what focus returns to on close.
 */
export function PlaySquare() {
  const showreel = useShowreel();
  const live = showreel?.available ?? false;

  const onActivate = useCallback(() => showreel?.open(), [showreel]);
  const onWarm = useCallback(() => showreel?.prefetch(), [showreel]);

  const layers = (
    <>
      <span
        className={s.background}
        data-flip-id="showreel"
        ref={live ? showreel?.registerBackground : undefined}
      />
      <span className={s.disc} ref={live ? showreel?.registerIcon : undefined}>
        <svg viewBox="0 0 12 14" className={s.triangle} focusable="false">
          {/* A triangle, not a glyph — it has to stay optically centred in the
              disc at every root size, and the optical centre of a play mark is
              right of its geometric one. */}
          <path d="M1 1.2v11.6L11.4 7z" fill="currentColor" />
        </svg>
      </span>
    </>
  );

  if (!live) {
    return (
      <span className={s.square} aria-hidden="true">
        {layers}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`${s.square} ${s.live}`}
      onClick={onActivate}
      /* Warm the Flip and Plyr chunks before the click that needs them.
         Pointer-enter covers the mouse; focus covers the keyboard. */
      onPointerEnter={onWarm}
      onFocus={onWarm}
      ref={showreel?.registerTrigger}
    >
      {layers}
      <span className="visually-hidden">Play the showreel</span>
    </button>
  );
}
