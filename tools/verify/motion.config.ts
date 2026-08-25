/**
 * Motion assertions, machine-readable.
 *
 * Two halves:
 *
 *  1. `SPEC_DUR` / `SPEC_EASE` — an independent transcription of
 *     docs/spec/10-design-system.md §5. The checker compares them against
 *     lib/motion/tokens.ts and against the CSS mirrors in app/styles/tokens.css.
 *     Deliberately duplicated: a single source that checked itself would prove
 *     nothing.
 *
 *  2. `TIMELINE_ASSERTIONS` — the shape every named timeline must have. Entries
 *     are seeded from docs/build/02-VERIFICATION.md §2 ahead of the phase that
 *     builds them, and carry `pending: true` until then. A pending entry reports
 *     ⏳ and does not fail the run; the phase that builds the component flips it
 *     to false and it becomes binding.
 *
 *     **If you build a timeline, flip its entry.** A phase that adds no
 *     assertions has not been verified — it has only been checked against
 *     assertions written for someone else's work.
 */

export const SPEC_DUR: Record<string, number> = {
  micro: 0.25,
  fast: 0.3,
  base: 0.4,
  mid: 0.5,
  slow: 0.6,
  slower: 0.7,
  wipe: 0.75,
};

export const SPEC_EASE: Record<string, string> = {
  out: 'power3.out',
  in: 'power3.in',
  soft: 'power2.out',
  quad: 'power2.inOut',
  circ: 'circ.out',
  inOut: 'power1.inOut',
  gentle: 'power1.out',
  sine: 'sine',
  linear: 'none',
};

/** Reverses run faster than forwards. Always. */
export const SPEC_REVERSE = { panel: 1.2, button: 1.5 };

export interface TweenAssertion {
  duration?: number;
  ease?: string;
  /** Substring match against the tween's target selector, when it has one. */
  target?: string;
  /** Property names the tween must animate. */
  props?: string[];
  position?: string;
}

export interface TimelineAssertion {
  id: string;
  /** The phase that builds it. Informational — `pending` is what gates. */
  phase: number;
  pending: boolean;
  /** The page the timeline is registered on. */
  page?: string;
  totalDuration?: number;
  tweenCount?: number;
  tweens?: TweenAssertion[];
  /** 1.2 for panels, 1.5 for buttons. Checked by invoking reverse(). */
  reverseTimeScale?: number;
}

export const TIMELINE_ASSERTIONS: TimelineAssertion[] = [
  {
    id: 'loader.enter',
    phase: 1,
    pending: true,
    totalDuration: 1.0,
    tweens: [
      { target: '.loader__mark', duration: 0.4, ease: 'power2.inOut' },
      { target: '.loader', duration: 0.6, ease: 'power2.inOut' },
    ],
  },
  {
    id: 'contact.open',
    phase: 1,
    pending: true,
    totalDuration: 1.5,
    tweenCount: 6,
    tweens: [{ duration: 0.4 }, { duration: 0.7, position: '<+0.3' }],
    reverseTimeScale: 1.2,
  },
  {
    id: 'work-card.hover',
    phase: 4,
    pending: true,
    tweens: [
      { duration: 0.25, ease: 'power1.inOut', props: ['y'] },
      { duration: 0.4, ease: 'power1.inOut', props: ['opacity'] },
    ],
    reverseTimeScale: 1.2,
  },
  {
    id: 'accordion.open',
    phase: 5,
    pending: true,
    tweens: [{ duration: 0.7 }, { duration: 0.5 }],
  },
  {
    id: 'accordion.close',
    phase: 5,
    pending: true,
    tweens: [{ duration: 0.6 }, { duration: 0.6, position: '>-0.1' }],
  },
];

/**
 * Runtime invariants. These hold from phase 0 onward and are the reason this
 * check has teeth before a single component exists.
 */
export const RUNTIME = {
  /**
   * GSAP's ticker is the one legitimate animation driver. GSAP *also* runs a
   * second, deliberate rAF inside ScrollTrigger — `_rafBugFix`, a no-op
   * keep-alive that exists because Firefox does not repaint consistently
   * unless something is queued. It drives nothing.
   *
   * So the rule "never add a second requestAnimationFrame loop" is checked as:
   * every persistent rAF loop on the page must be one of these two known
   * library internals, and the ticker must be present exactly once. Anything
   * else — a stray rAF in a component, `Matter.Runner`, a video sync loop — is
   * a violation and names itself in the failure. See D-004.
   */
  sanctionedRaf: [
    { name: 'GSAP ticker (gsap-core _tick)', match: /gsap-core\.js/, isTicker: true },
    { name: 'ScrollTrigger repaint keep-alive (_rafBugFix)', match: /_rafBugFix/, isTicker: false },
  ],
  /** Hover, parallax and text reveal are gated at >991px — never at >=991. */
  desktopQuery: '(min-width: 992px)',
  gatedOffAt: 991,
  gatedOnAt: 1512,
  /** Routes used for the ScrollTrigger leak check. */
  leakRoutes: ['/', '/probe', '/'],
};
