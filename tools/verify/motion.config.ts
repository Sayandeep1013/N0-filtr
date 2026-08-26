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
  quad: 'power1.inOut',
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
  /**
   * The GSAP position parameter as the spec writes it. Documentation only —
   * `startTime` is the checked form, because a position string is relative to
   * whatever came before it and only the resolved playhead can be read back.
   * Write both: the string says what the spec asked for, the number says what
   * it must resolve to.
   */
  position?: string;
  /** Seconds into the timeline this tween must start. */
  startTime?: number;
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
  /**
   * 1.2 for panels, 1.5 for buttons. Checked by invoking `reverse()` on the
   * registered timeline and reading the scale back — which only passes if the
   * timeline is *already sitting* at that scale.
   *
   * Every component on this site applies the scale inside its own handler
   * (`tl.timeScale(1.2).reverse()`), so on correct code this reads 1 and fails.
   * Prefer a behaviour check that drives the real close or mouseleave: see
   * behaviour.config.ts, `contactPanel` and `buttonIcon`. Left here because a
   * timeline that *is* parked at its reverse scale can still be asserted cheaply.
   */
  reverseTimeScale?: number;
}

export const TIMELINE_ASSERTIONS: TimelineAssertion[] = [
  /**
   * IX2 `a-23` "preload-load-animation-in". The mark fade and the panel slide
   * are two items of the SAME actionItemGroup, and IX2 runs a group
   * concurrently — so the spec's `'<'` is right and the 1.0s seeded here from
   * 02-VERIFICATION.md was wrong. Total is 0.6s. See I-010.
   *
   * Indices count gsap.set() calls, because they are zero-duration tweens and
   * getChildren() returns them.
   */
  {
    id: 'loader.enter',
    phase: 1,
    pending: false,
    totalDuration: 0.6,
    tweenCount: 5,
    tweens: [
      { target: '.loader', duration: 0, props: ['display', 'yPercent'], startTime: 0 },
      {
        target: '.loader__mark',
        duration: 0.4,
        ease: 'power1.inOut',
        props: ['opacity', 'scale'],
        startTime: 0,
      },
      {
        target: '.loader',
        duration: 0.6,
        ease: 'power1.inOut',
        props: ['yPercent'],
        position: '<',
        startTime: 0,
      },
      { target: '.loader', duration: 0, props: ['display'], startTime: 0.6 },
      { target: '.loader__mark', duration: 0, props: ['opacity', 'scale'], startTime: 0.6 },
    ],
  },
  /**
   * Our one deliberate correction to tonik: they animate the exit panel
   * `200 → 100`, which never brings it on screen. We animate `100 → 0`.
   */
  {
    id: 'loader.exit',
    phase: 1,
    pending: false,
    totalDuration: 0.5,
    tweenCount: 3,
    tweens: [
      { target: '.loader', duration: 0, props: ['yPercent', 'display'], startTime: 0 },
      { target: '.loader__mark', duration: 0, props: ['opacity', 'scale'], startTime: 0 },
      { target: '.loader', duration: 0.5, ease: 'power3.out', props: ['yPercent'], startTime: 0 },
    ],
  },
  /**
   * [src] `initContact`. Seven children, not the six seeded here — the two
   * gsap.set() calls are zero-duration tweens and getChildren() returns them.
   *
   * tween[5] reports a duration of **1.0s**, not the .5s it was given: GSAP
   * folds a stagger's `amount` into the tween's own duration, so a .5s tween
   * staggered across .5s spans 1.0s. That is also why the total is 1.5s
   * whatever the meta count turns out to be — `amount` distributes a fixed
   * total rather than adding per item.
   *
   * No `reverseTimeScale` here. The checker reads it by calling reverse() on
   * the registered timeline, which only works if the timeline is already
   * sitting at that scale; this component applies 1.2 inside its close path,
   * like every component on this site. The behaviour check drives the real
   * close instead — behaviour.config.ts `contactPanel`.
   */
  {
    id: 'contact.open',
    phase: 1,
    pending: false,
    totalDuration: 1.5,
    tweenCount: 7,
    tweens: [
      { target: '.contact__heading', duration: 0, props: ['opacity'], startTime: 0 },
      { target: '.contact__meta', duration: 0, props: ['opacity', 'x'], startTime: 0 },
      { target: '.contact', duration: 0.4, props: ['opacity'], startTime: 0 },
      { target: '.contact__sidebar', duration: 0.7, props: ['x'], position: '<+0.3', startTime: 0.3 },
      { target: '.contact__heading', duration: 0.3, props: ['opacity'], position: '<+0.2', startTime: 0.5 },
      {
        target: '.contact__meta',
        duration: 1.0,
        ease: 'power3.out',
        props: ['opacity', 'x'],
        position: '<',
        startTime: 0.5,
      },
      { target: '.contact__gif', duration: 0.5, props: ['y'], position: '<+0.2', startTime: 0.7 },
    ],
  },
  /**
   * §5's [src] builds this with two children — the caption rise and the
   * sibling-dim, on one paused timeline. **Ours has one**, and the missing
   * tween is not missing.
   *
   * §21.1 is explicit that the dim is one shared primitive across three
   * components and not three implementations, and phase 4 is where that
   * instruction pays: twelve cards each owning a tween over the other eleven
   * means sliding the pointer between two cards has one timeline reversing
   * every sibling to 1 while the next drives every sibling to .3, on the same
   * ten elements, for 400ms. The dim lives once, on the grid, in
   * `useSiblingDim`, and the behaviour check drives it there — that is the
   * assertion that actually matches phase 4's acceptance criterion, because
   * "dims all eleven others to exactly 0.3" is a fact about eleven elements
   * and not about a tween's duration. See I-039.
   *
   * `yPercent`, not §5's `y: '-110%'`: identical in effect — GSAP resolves the
   * percentage against the element's own height either way — and the name says
   * which it is.
   */
  {
    id: 'work-card.hover',
    phase: 4,
    pending: false,
    totalDuration: 0.25,
    tweenCount: 1,
    tweens: [{ duration: 0.25, ease: 'power1.inOut', props: ['yPercent'], startTime: 0 }],
  },
  /**
   * The reveal. §5, one-shot and guarded.
   *
   * The `'>-0.2'` and `'<'` positions are why this is asserted by resolved
   * `startTime` rather than by the strings: the wipe runs 0 → 0.75, the badge
   * starts 0.2 before the wipe ends, and the info starts with the badge. So
   * 0.55 and 0.55, and the total is 1.05 rather than the 1.75 that three
   * sequential tweens would give.
   */
  {
    id: 'work-card.reveal',
    phase: 4,
    pending: false,
    totalDuration: 1.05,
    tweenCount: 3,
    tweens: [
      { duration: 0.75, ease: 'power3.out', props: ['width'], startTime: 0 },
      { duration: 0.5, props: ['opacity'], position: '>-0.2', startTime: 0.55 },
      { duration: 0.5, props: ['opacity'], position: '<', startTime: 0.55 },
    ],
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
