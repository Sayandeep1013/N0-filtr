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

  /**
   * The showreel, end to end. `20-components-and-motion.md` §15 — the only use
   * of Flip on the site, and the one component whose correctness is a claim
   * about *where a DOM node ended up*, not about a duration.
   *
   * What makes this worth driving rather than inspecting: the background layer
   * is measured inside the headline, reparented into a full-screen player, and
   * handed back on close. A timeline cannot express that, and a screenshot
   * cannot tell a Flip that landed from one that teleported. So the assertion
   * is the invariant — **the layer comes back to the box it left, exactly** —
   * plus the two registered timelines' resolved shapes.
   *
   * The startTimes below are not guesses. `.to(player, {delay: .6})` puts the
   * first tween at 0.6, so `'<'` on the second resolves to 0.6 + 0.2 = 0.8, and
   * the third `'<'` is relative to the *second* and lands at 0.8 as well. Read
   * back off the live timelines and matched to the spec, both directions.
   */
  showreel: {
    id: 'showreel Flip open/close',
    phase: 3,
    page: '/',
    trigger: 'h1 button',
    flipTarget: '[data-flip-id="showreel"]',
    /** The Flip destination's class fragment — CSS Modules hash the rest. */
    destinationFragment: 'playerWrap',
    openTimelineId: 'showreel.open',
    closeTimelineId: 'showreel.close',
    openTotal: 1.3,
    closeTotal: 0.4,
    openStarts: [0.6, 0.8, 0.8],
    openDurations: [0.4, 0.5, 0.4],
    closeStarts: [0, 0, 0.1],
    closeDurations: [0.4, 0.4, 0.3],
    /** §15's scrim: #21212180. */
    scrimOpen: 'rgba(33, 33, 33, 0.5)',
    /** The player must be at least this many times the button's width. */
    minGrowth: 8,
    /** Flip must return the layer to its exact origin, to the pixel. */
    returnTolerance: 1,
    /**
     * **And the play icon must still be visible afterwards.**
     *
     * The bug this guards against shipped, and it is worth describing because
     * every value involved was correct. Flip takes `.background` out of the
     * button and `appendChild` puts it back — as the LAST child rather than the
     * first. Two positioned siblings with no z-index paint in tree order, so
     * after one open-and-close the grey square covered the play triangle and the
     * button went blank the first time anyone used it.
     *
     * Opacity was 1. The box was right. The Flip round trip was exact to the
     * pixel and the existing assertions all passed. The only thing that was
     * wrong was which element you could see, so that is what this reads:
     * `elementFromPoint` at the button's centre, before and after a full cycle.
     */
    iconVisibleTag: 'path',
    viewport: { w: 1512, h: 900 },
  },

  /**
   * The scrubbed word reveal. `20-components-and-motion.md` §4.
   *
   * `01-PHASES.md`'s acceptance for T3.3 is a *direction*, not a value:
   * "scrolling back un-reveals". A one-shot reveal and a scrubbed one look
   * identical on the way down and differ only on the way up, so the check
   * scrolls past the block and then back, and asserts the words return to rest.
   */
  revealText: {
    id: 'scrubbed word reveal',
    phase: 3,
    page: '/',
    selector: 'h2[data-t] .word',
    host: 'h2[data-t]',
    restOpacity: 0.2,
    tolerance: 0.03,
    timelineId: 'reveal.works',
    ease: 'power1.out',
    /** Desktop only — below this the text renders whole and is never split. */
    gatedOffAt: 991,
    viewport: { w: 1512, h: 900 },
    /** Where the block is fully lit. Past `top 10%` of a 900 viewport. */
    revealedAt: 1600,
  },

  /**
   * The stack wall's marquee. `20-components-and-motion.md` §11.
   *
   * Three states, and the two that are *absences* are the ones worth checking:
   * the marquee must not exist above 767 (where the wall is a static wrapping
   * grid) and must not exist under reduced motion at any width. A marquee is an
   * infinite tween; if its gate leaks it never stops, on a device that asked
   * for stillness.
   */
  stackWall: {
    id: 'stack wall marquee',
    phase: 3,
    page: '/',
    timelineId: 'stack-wall.marquee',
    duration: 30,
    /** The doubled track: xPercent −50 is exactly one set. */
    xPercent: -50,
    desktop: { w: 1512, h: 900 },
    mobile: { w: 390, h: 844 },
  },

  /**
   * The works grid. `20-components-and-motion.md` §5, §21.1, §21.2.
   *
   * Phase 4's acceptance criteria are almost entirely things a timeline's shape
   * cannot express, which is why so much of this phase's verification lives
   * here rather than in `motion.config.ts`:
   *
   *   · "hovering one card dims all eleven others to exactly 0.3" is a fact
   *     about eleven elements
   *   · §21.2's overlay is asymmetric **in the opposite direction to the rest of
   *     the site** — 500ms in, 400ms out — and 500/1.2 is 417, close enough to
   *     400 to look right if it were ever folded into the reversing timeline
   *   · at ≤767 the sheet does not hide, it becomes content
   */
  worksGrid: {
    id: 'works grid',
    phase: 4,
    page: '/',
    cardCount: 12,
    /** Which card the checks hover. Index 1 is a `half` in a two-card row. */
    hoverIndex: 1,
    /**
     * **The sibling-dim is off, and this asserts that it is.**
     *
     * §5 calls dimming the other eleven cards to .3 "the single most striking
     * interaction on the site", and phase 4 built it, hoisted it to the grid per
     * §21.1, and asserted it at exactly 0.3. Sayandeep then asked for it
     * removed, because the change that made the hovered card's panel DARK
     * (D-024) took away the thing the dim was contrasting against — hovering
     * now made the whole grid darker and nothing brighter. See D-027.
     *
     * The assertion is inverted rather than deleted. A removed behaviour with a
     * removed check is indistinguishable from a behaviour that broke, and this
     * one is one line away from coming back — the next person to read §5 will
     * be tempted. `expectDim` is what to flip if it does.
     */
    expectDim: false,
    dimmed: 0.3,
    tolerance: 0.02,
    /** §21.2 [ix2 a-29/a-30]. */
    overlayOpacity: 0.55,
    overlayIn: 0.5,
    overlayOut: 0.4,
    /** 1.25rem at the 16.45 root — I-032's corrected gap. */
    columnGapPx: 20.5625,
    /** `30-page-specs.md` §2: half ×8, wide ×3, full ×1. */
    mix: { half: 8, wide: 3, full: 1 },
    /**
     * The panel must never be a bright surface.
     *
     * §5 specifies `#EFEFEF` and phase 4 built that; Sayandeep asked for it
     * changed twice — once for the abruptness, once for the colour — and it is
     * now the page's black with 14% of the work's accent mixed in (D-024).
     *
     * So this asserts the **property**, not the hex. Each of the twelve panels
     * is a different colour by design, and pinning one value would either
     * pass vacuously for eleven of them or need a table that goes stale the
     * moment an accent is re-sampled. Relative luminance under 0.10 is the
     * thing that was actually asked for: no bright surface, anywhere, ever.
     */
    sheetMaxLuminance: 0.1,
    /**
     * The hover drawer must be TWEENED, not set.
     *
     * §5's [src] reveals it with `gsap.set('.work__sheet', { opacity: 1 })` —
     * no duration at all — and on a 1316x822 card that is #212121 to pure white
     * in one frame. Sayandeep asked for it fixed on 2026-08-26 (D-022), so
     * "there is a transition" is now a requirement rather than a preference,
     * and a requirement nobody checks is one that regresses.
     *
     * Read off the live tweens rather than sampled, for the same reason as the
     * overlay: sampling an eased curve measures the harness's own jitter.
     */
    sheetIn: 0.75,
    sheetOut: 0.75,
    /** It must not fill the media any more. Fraction of the media's height. */
    sheetMaxCoverage: 0.8,
    desktop: { w: 1512, h: 900 },
    mobile: { w: 390, h: 844 },
  },

  /**
   * The services accordion. `20-components-and-motion.md` §6.
   *
   * §6's open and close are **different sequences**, not one timeline played
   * both ways, and that is the whole design: the body opens over .7s and the
   * inverted panel slides in over .5s *after* it, while on the way out the
   * panel leaves first over .6s and the body collapses behind it — so the panel
   * is never caught mid-collapse with its own height changing under it.
   *
   * Which means neither timeline exists on a resting page. They are built per
   * transition, so `motion.config.ts` cannot read them and had both pending
   * since phase 0 waiting for a component that was never going to satisfy that
   * shape. They are driven here instead.
   *
   * Every figure below was read back off the live timelines and matched against
   * §6, both directions.
   */
  accordion: {
    id: 'services accordion',
    phase: 5,
    page: '/',
    rowSelector: '[data-service-row]',
    rowCount: 5,
    openTimelineId: 'accordion.open',
    closeTimelineId: 'accordion.close',
    /* D-052 slowed both directions and moved them onto `power1.inOut`. §6's
       measured `.7 / .5 / .6` are recorded in the component's own note; these
       are the values the site actually runs, and the point of asserting them is
       that a future "tidy-up" back to the spec would be a regression rather than
       a correction. */
    openTotal: 1.55,
    openStarts: [0, 0.9, 0.9],
    openDurations: [0.9, 0, 0.65],
    /* The `set()` lands last in `getChildren()` order because GSAP sorts by
       start time and `'>-0.1'` pulls the body's collapse back ahead of it.
       Documented because it looks like a mis-ordering and is not. */
    closeTotal: 1.5,
    closeStarts: [0, 0.7, 0.7, 0.8],
    closeDurations: [0.8, 0.8, 0.8, 0],
    /** §6: an open row takes `background: var(--grey-900)`. */
    openGround: 'rgb(46, 46, 46)',
    /** §6: the arrow rotates ↓ → →. `rotate(-90deg)`. */
    arrowOpen: 'matrix(0, -1, 1, 0, 0, 0)',
    minBodyHeight: 200,
    desktop: { w: 1512, h: 900 },
    mobile: { w: 390, h: 844 },
  },

  /**
   * The CTA block. §10.
   *
   * "The whole block opens the contact panel" is a claim about the *element*,
   * not about a handler: a `<div>` with an onClick is unreachable by keyboard
   * and announces as nothing, and a nested `<button>` for the arrow would be
   * invalid and would swallow the click on the thing people aim at. Both are
   * asserted, because both are the easy mistake.
   */
  ctaBlock: {
    id: 'cta block',
    phase: 5,
    page: '/',
    ground: 'rgb(46, 46, 46)',
    /** §10: min-height 23rem. 23 × 16.45 at 1512. */
    minHeightPx: 378,
    desktop: { w: 1512, h: 900 },
  },

  /** The culture wipe and the blog row's alignment. §12, §19. */
  homeLower: {
    id: 'culture and blog row',
    phase: 5,
    page: '/',
    cultureFrames: 6,
    blogCards: 3,
    /** §19: `background var(--grey-800)`. */
    blogGround: 'rgb(59, 59, 59)',
    desktop: { w: 1512, h: 900 },
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

/**
 * Phase 6 — the case study. `behaviour.case.ts` drives these.
 *
 * Every value here is a fact about the *first* case study, and Tessera is that
 * case study by `01-PHASES.md`'s "build one work end to end". The slug is named
 * once rather than derived from `WORKS[0]`, because a check that follows the
 * content around is a check that silently starts asserting a different page the
 * day someone reorders the works.
 */
export const CASE = {
  /** §2's block rhythm rule: never more than two prose blocks without a visual. */
  maxProseRun: 2,

  accent: {
    id: 'case accent theming',
    phase: 6,
    page: '/works/tessera',
    viewport: { w: 1512, h: 900 },
    /** `content/works/tessera.ts`. Both members of the pair — see I-046. */
    dark: '#125C91',
    light: '#2595E4',
  },

  cursor: {
    id: 'case custom cursor',
    phase: 6,
    page: '/works/tessera',
    viewport: { w: 1512, h: 900 },
    mobileViewport: { w: 390, h: 844 },
    /**
     * How close the disc has to be to the pointer, on entry and once settled.
     *
     * Six pixels, because that is a tolerance a lerp can genuinely reach and a
     * centred-on-the-element implementation cannot get anywhere near — the bug
     * this replaced put it hundreds of pixels away. See D-048.
     */
    snapTolerance: 6,
    /** Two frames, for the snap to be written and painted. */
    snapSettle: 140,
    /** a-10's scale is 500ms. Read the size after it, not with the position. */
    scaleSettle: 700,
    /** The lerp is 0.15 per frame — about 25 frames to close 95% of the gap. */
    trackSettle: 900,
    /**
     * How far behind it must be **mid-move**, which is what separates a disc
     * with weight from one pinned to the pointer. Measured at ~260px on a fast
     * sweep across a card; 40 is a floor that a 1:1 implementation fails and any
     * reasonable lerp clears.
     */
    minLag: 40,
  },

  navigation: {
    id: 'case study navigation',
    phase: 6,
    viewport: { w: 1512, h: 900 },
    href: '/works/tessera',
    cardSelector: 'a[href="/works/tessera"]',
    /**
     * The loader sweep is `DUR.mid`, the route resolves behind it, and
     * `ScrollReset` corrects Lenis a frame after that. Generous because it also
     * covers a dev-server compile of the case-study route.
     */
    settle: 4000,
    /** "The top" allows a scrubbed reveal settling, not a screenful. */
    topTolerance: 40,

  },

  loaderTint: {
    id: 'loader accent tint',
    phase: 6,
    page: '/works/tessera',
    viewport: { w: 1512, h: 900 },
    /** `<NextWork>` — a real navigation, deliberately not intercepted. */
    linkSelector: '[aria-labelledby="next-work-title"] a',
  },
};
