/**
 * Behaviour assertions — the values, machine-readable.
 *
 * `verify:motion` asserts the *shape* of a registered timeline: its durations,
 * eases, positions and targets. Three of the four things `02-VERIFICATION.md`
 * says phase 1 owes are not timeline shapes at all:
 *
 *   · the navbar's mini threshold is a ScrollTrigger boundary
 *   · the footer's sibling-dim is a pair of action lists driven by pointer events
 *   · a reverse `timeScale` is only real if the component's own close path sets it
 *
 * That last one matters more than it looks. `TimelineAssertion.reverseTimeScale`
 * calls `reverse()` on the registered timeline and reads the scale back — which
 * passes only if the timeline happens to be *sitting* at that scale. Every
 * component on this site applies the scale inside its handler, so the assertion
 * would read 1 and fail on correct code. The checks here drive the real UI
 * instead: click the trigger, press Escape, then read the scale. Slower, and the
 * only version that means anything.
 *
 * These extend `verify:motion` rather than forming a fifth check: they are motion,
 * and one report section per concern is easier to read than five.
 */

export interface BehaviourAssertion {
  id: string;
  phase: number;
  pending?: boolean;
}

export const BEHAVIOUR = {
  /**
   * `.nav.is-mini` — ScrollTrigger on `main`, `1rem top` → `30rem top`, with
   * the class going on at the *end* of that window.
   *
   * **The threshold is 30 pixels, not 30rem.** ScrollTrigger's `_offsetToPx`
   * understands `%` and the top/center/bottom keywords and finishes with
   * `parseFloat(value) || 0` — so `"30rem"` is 30. Confirmed on tonik's own
   * running instance in phase 1: the trigger reports `start: 1, end: 30` against
   * `vars.start: "1rem top", vars.end: "30rem top"`, and their bar is not mini
   * at 20px and is mini at 40px.
   *
   * So the specced strings are correct *and* they mean something other than they
   * appear to. Do not "fix" them into computed rem — that would put the
   * threshold sixteen times further down the page than tonik's. See I-016.
   *
   * Checked on `/probe`, the only route with height until phase 3.
   */
  navMini: {
    id: 'nav.is-mini threshold',
    phase: 1,
    page: '/probe',
    thresholdPx: 30,
    /** Below the 30px boundary — the class must be off. */
    belowPx: 20,
    /** Past it — the class must be on. */
    abovePx: 100,
    className: 'is-mini',
    viewport: { w: 1512, h: 900 },
  },

  /**
   * Footer service links, [ix2 a-17/a-18]: hovering one takes its siblings to
   * exactly 0.3 over 400ms inOutQuad, and back to 1 on the way out.
   *
   * The tolerance is for the tween's own settle, not for the value — 0.3 is
   * exact in the action list and must be exact here.
   */
  footerDim: {
    id: 'footer service sibling-dim',
    phase: 1,
    page: '/',
    selector: '.service-link',
    dimmed: 0.3,
    tolerance: 0.02,
    /** Every hover on this site is gated here. Asserted off below it. */
    gatedOffAt: 991,
  },

  /**
   * The contact panel, end to end: a `[data-contact]` click opens it, Escape
   * closes it, the close runs at the panel scale, and focus goes back to the
   * trigger it came from.
   */
  contactPanel: {
    id: 'contact panel open/close',
    phase: 1,
    page: '/',
    trigger: '[data-contact]',
    reverseTimeScale: 1.2,
    timelineId: 'contact.open',
  },

  /**
   * The §21.3 icon swap reverses at the *button* scale, 1.5 — not the 1.2 that
   * panels use. Getting these two the wrong way round is the single easiest
   * motion mistake on this build to make and the hardest to see.
   */
  buttonIcon: {
    id: 'button icon-swap reverse scale',
    phase: 1,
    page: '/',
    hoverTarget: '.nav__links .button',
    timelineId: 'button.icon',
    reverseTimeScale: 1.5,
  },

  /**
   * Under `prefers-reduced-motion: reduce` the loader is a 200ms opacity fade
   * with **no transform** — 20-components-and-motion.md §1. tonik ships no
   * reduced-motion path at all; this one is ours and it is not optional.
   */
  /**
   * The 3D hero. `50-brand-and-3d.md` §2.
   *
   * Everything asserted here is invisible to the other checks. A registered
   * timeline cannot hold a relationship between two objects' rotations; a
   * screenshot cannot show whether a render loop is still running behind a
   * faded canvas; and the triangle budget is a runtime figure, not a source
   * one. All of it is either a §2 performance rule or a phase-2 acceptance
   * criterion.
   */
  hero3d: {
    id: 'hero 3D',
    phase: 2,
    page: '/',
    /** A route without the hero, to prove the canvas suspends rather than unmounts. */
    awayPage: '/probe',
    /** §2 performance budget. */
    maxTriangles: 40_000,
    desktop: { w: 1512, h: 900 },
    mobile: { w: 390, h: 844 },

    /**
     * The pointer response, after the rebuild. See D-014.
     *
     * §2's recovered curves (ring ±0.2, mark −0.1→+0.5) drive two *separate*
     * objects, because tonik's glyph floats free inside their ring. Ours is
     * housed in a barrel, and applying that differential slid the blades out of
     * the bore — the object visibly lost its teeth the moment the pointer moved.
     *
     * The differential now lives on the axis where it is mechanically true: the
     * assembly tips as one object, and the blades actuate about the bore's own
     * axis. What is asserted changed with it — the numbers below are the new
     * model's, and the invariant two lines down is the one that matters.
     */
    tipMax: 0.2,
    actuateMin: 0.06,
    /** Both channels must actually move, or the pointer is not wired at all. */
    respondMin: 0.02,
    settleMs: 1100,

    /** Section 2: 4 blades below the desktop breakpoint instead of 6. */
    mobileBlades: 4,
    /** Section 2: render exactly one frame at this pose, then stop. */
    reducedPose: 0.4,
    /** A portrait viewport must fit further back than the desktop distance of 7.5. */
    minMobileCameraZ: 8,
  },

  loaderReduced: {
    id: 'loader under reduced motion',
    phase: 1,
    page: '/',
    timelineId: 'loader.enter',
    fadeDuration: 0.2,
    /** Properties that must NOT appear anywhere in the reduced timeline. */
    forbiddenProps: ['yPercent', 'y', 'scale'],
  },
} as const;
