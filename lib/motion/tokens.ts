/**
 * Motion primitives. Transcribed verbatim from docs/spec/10-design-system.md §5.
 *
 * The site has a narrow, consistent motion vocabulary; this is the only place it
 * is written down in code. `tools/verify/motion.config.ts` asserts against these
 * names, and app/styles/tokens.css mirrors the durations for CSS-side hovers.
 */

export const DUR = {
  micro: 0.25, // caption slide, small opacity swaps
  fast: 0.3, // colour transitions, chevron fades
  base: 0.4, // the default — most opacity and colour tweens
  mid: 0.5, // panel slides, label rises
  slow: 0.6, // loader exit, accordion close
  slower: 0.7, // accordion open, sidebar slide-in, accent crossfade
  wipe: 0.75, // reveal overlays
} as const;

export const EASE = {
  out: 'power3.out', // things arriving
  in: 'power3.in', // things leaving
  soft: 'power2.out', // Flip transitions
  quad: 'power2.inOut', // the loader — Webflow's inOutQuad          [ix2]
  circ: 'circ.out', // button icon diagonal swap                     [ix2]
  inOut: 'power1.inOut', // hover state changes, IX2 'ease'
  gentle: 'power1.out', // staggered text
  sine: 'sine', // the pinned people scroll
  linear: 'none', // anything scrubbed
} as const;

/**
 * Webflow IX2 easing → GSAP. Keep this table next to the eases it produces;
 * every [ix2]-marked timeline in 20-components-and-motion.md was converted
 * through it.
 *
 *   inOutQuad → power2.inOut      outCirc → circ.out
 *   easeInOut → power1.inOut      ease    → power1.inOut
 */
export const IX2_EASE = {
  inOutQuad: EASE.quad,
  outCirc: EASE.circ,
  easeInOut: EASE.inOut,
  ease: EASE.inOut,
} as const;

/**
 * Reverses run faster than forwards. Always. Nothing on this site closes at the
 * speed it opened — it is one of the defining properties of the motion.
 */
export const REVERSE_SCALE = 1.2; // panels
export const REVERSE_SCALE_FAST = 1.5; // buttons

/** The three JS thresholds tonik actually branches on, and we mirror exactly. */
export const MQ = {
  /** hover, parallax, text reveal, works interactions */
  desktop: '(min-width: 992px)',
  /** accordion layout, stack wall marquee */
  above767: '(min-width: 768px)',
  reduced: '(prefers-reduced-motion: reduce)',
  noPreference: '(prefers-reduced-motion: no-preference)',
} as const;

export type DurationName = keyof typeof DUR;
export type EaseName = keyof typeof EASE;
