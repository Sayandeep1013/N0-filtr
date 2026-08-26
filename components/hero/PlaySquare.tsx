import s from './PlaySquare.module.css';

/**
 * The showreel control that sits **inline in the headline's second line**.
 * `30-page-specs.md` §1: "The play button sits INLINE in the text flow on
 * line 2."
 *
 * Transcribed from `docs/research/screens/tonik-hero-01.png`: a light square
 * carrying a white disc with a dark triangle in it. Three layers, not one icon
 * — the square is the Flip target that becomes the full-screen player in §15,
 * so it has to be its own element rather than a glyph inside the disc.
 *
 * ⚠ **It does not play anything yet.** The showreel is phase 3's T3.6 — GSAP
 * Flip reparenting this square's background into a full-screen Plyr. Until then
 * it renders as inert decoration with `aria-hidden`, deliberately: a button
 * that looks live and does nothing is worse than no button, and a screen reader
 * announcing "play" on a control that cannot play is worse still.
 *
 * Phase 3 turns this into a real `<button>`. The markup is already the shape
 * Flip needs — see the `data-flip-id` on the background layer.
 */
export function PlaySquare() {
  return (
    <span className={s.square} aria-hidden="true">
      <span className={s.background} data-flip-id="showreel" />
      <span className={s.disc}>
        <svg viewBox="0 0 12 14" className={s.triangle} focusable="false">
          {/* A triangle, not a glyph — it has to stay optically centred in the
              disc at every root size, and the optical centre of a play mark is
              right of its geometric one. */}
          <path d="M1 1.2v11.6L11.4 7z" fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}
