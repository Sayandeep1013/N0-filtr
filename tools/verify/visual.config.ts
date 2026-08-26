/**
 * Screenshot pairs, ours versus tonik.
 *
 * Scroll positions are tonik’s *measured* section offsets from the teardown. Our
 * page will not match them exactly once our content differs — that is expected
 * and fine. What must match is **composition**: gutters, type scale, vertical
 * rhythm, and the relationship of elements to each other.
 *
 * Reference images live in `docs/research/screens/` and are used offline rather
 * than re-fetching tonik on every run. A shot with no reference is still taken —
 * it just appears in the contact sheet without a counterpart.
 */

export interface Shot {
  name: string;
  /** Route on our dev server. */
  ours: string;
  /** Reference capture in docs/research/screens/, if one exists. */
  reference?: string;
  /** tonik’s measured section offset — what the reference capture was taken at. */
  scroll?: number;
  /**
   * Where to scroll *our* page, when it cannot be the same number. tonik’s
   * homepage is 12,884px tall and ours is not yet, so their footer offset means
   * nothing on our side until phase 5. `'bottom'` resolves at capture time.
   */
  ourScroll?: number | 'bottom';
  /**
   * A named interaction to perform before the shutter. Some of this site's most
   * expensive composition is behind a click — the contact panel is 56% of the
   * viewport and a phase that only ever screenshots the resting page has never
   * looked at it. Implemented in visual.ts.
   */
  prepare?: 'contact-open' | 'nav-menu-open' | 'showreel-open';
  /** The phase that makes this shot meaningful. Shots for unbuilt pages are skipped. */
  phase: number;
  /** Flip to false when the page exists. */
  pending?: boolean;
}

export const VIEWPORTS = [
  { w: 1512, h: 900 },
  { w: 390, h: 844 },
] as const;

export const SHOTS: Shot[] = [
  // Phase 0 has no page content; the probe surface is what there is to look at,
  // and looking at it is genuinely useful — it is the type scale rendered.
  { name: 'type-scale', ours: '/probe', scroll: 0, phase: 0 },

  /* Phase 2, not 3. The hero's COPY is phase 3, but the 3D assembly behind it is
     phase 2's whole deliverable and §2's composition target — "the right ~55% of
     the viewport, cropped by the right edge" — is a claim about the object, not
     about the headline. It is checkable now and phase 3 re-judges the same shot
     once the copy sits over it. */
  { name: 'hero', ours: '/', reference: 'tonik-hero-01.png', scroll: 0, phase: 2 },
  /* Their s02 is a client-logo marquee; ours is a wall of tool names. The
     composition question is the same one — does a band of small marks under the
     fold read as a considered section or as debris — so the reference is worth
     keeping even though the content is deliberately different.

     `ourScroll` is 900, the fold, because the wall sits INSIDE the hero section
     immediately below it. Theirs is at 950 in a 12,884px document. */
  {
    name: 'stack-wall',
    ours: '/',
    reference: 's02-marquee.png',
    scroll: 950,
    ourScroll: 900,
    phase: 3,
  },
  /* The showreel is 100% of the viewport and lives behind a click. A phase that
     only screenshots the resting page has never looked at it — the same
     argument the contact panel's shot is here for. */
  {
    name: 'showreel',
    ours: '/',
    prepare: 'showreel-open',
    phase: 3,
  },
  /* Their s03 is taken at 1900 in a 12,884px document. Ours is a different
     height and will be until phase 5, so `ourScroll` is resolved from the grid's
     own position at capture time rather than from a number that means nothing
     on our side. */
  { name: 'works-a', ours: '/', reference: 's03-projects.png', scroll: 1900, ourScroll: 2000, phase: 4 },
  /* A second look further down, where the parallax has had room to separate the
     rows. The first shot cannot show drift — at the top of the section every
     cell is still near its untransformed position. */
  { name: 'works-b', ours: '/', scroll: 4200, ourScroll: 4200, phase: 4 },
  { name: 'services', ours: '/', reference: 's07-services-open.png', scroll: 8250, phase: 5, pending: true },
  { name: 'cta', ours: '/', reference: 's08-cta-culture.png', scroll: 9320, phase: 5, pending: true },
  {
    name: 'footer',
    ours: '/',
    reference: 's11-footer.png',
    scroll: 11984,
    // Our homepage has no content above the footer until phase 3.
    ourScroll: 'bottom',
    phase: 1,
  },
  {
    name: 'contact-panel',
    ours: '/',
    reference: 's12-contact.png',
    prepare: 'contact-open',
    phase: 1,
  },
  {
    name: 'nav-menu',
    ours: '/',
    prepare: 'nav-menu-open',
    phase: 1,
  },
  { name: 'cs-hero', ours: '/works/tessera', reference: 's13-cs-hero.png', scroll: 0, phase: 6, pending: true },
  {
    name: 'service',
    ours: '/services/product-design',
    reference: 's18-service-hero.png',
    scroll: 0,
    phase: 7,
    pending: true,
  },
];

/**
 * The mandatory agent judgement.
 *
 * `verify:visual` does not pass or fail on its own — automating a pixel diff
 * against a site with different content produces noise, not signal. The agent
 * running the phase is required to open `tools/verify/output/contact-sheet.html`,
 * actually look at it, and replace this string with a specific judgement.
 *
 * "Looks good" is not a judgement; it is a failure to perform the check. Say
 * what you compared and what you concluded, including differences you decided
 * were correct and why.
 *
 * Set it back to null at the start of a phase so a stale judgement from the
 * previous phase cannot be mistaken for a fresh one.
 */
export const AGENT_JUDGEMENT: string | null = [
  "Phase 4. Sixteen captures at 1512 and 390. Phase 3's judgement was reset before this run.",
  "",
  "THE GRID vs s03-projects.png. The structure is theirs and it is NOT what §5 describes.",
  "§5 says two independent columns, each an ordinary block flow. Their DOM is one twelve-column",
  "CSS grid — repeat(12, 90.8125px) on a 20.5625px gap at 1512 — with every cell carrying an",
  "explicit grid-column and grid-row: 8/13, 7/13, 1/7, 1/6, 1/9, 9/13. Two block columns cannot",
  "produce that. An eight-column card at 1/9 crosses the middle of the grid, and their DOM order",
  "is right-card-first in two of the rows, so placement is authored rather than flowed. I-036.",
  "",
  "§5's MOTION half is right and the measurement confirms it. At one scroll position their row-1",
  "pair both sat at translateY(-41.29) while their row-3 pair sat at -18.42 and -23.03 — a ratio",
  "of 0.80, which is exactly -8% against -10%. Our own pair reads 3px apart in works-a-1512,",
  "which is the same relationship at the same point in the scroll.",
  "",
  "THE COMPOSITION is ours to author and I authored it: full, pair, wide-left, pair, wide-right,",
  "pair, wide-left, pair. No two heavy cells touch and the eye is handed from one side to the",
  "other on the way down. Rows never quite fill — a pair is 6+5 or 5+6, never 6+6 — and that",
  "column of air is theirs: every one of their rows leaves one.",
  "",
  "THE HOVER SHEET WAS WRONG AND IS THE BEST THING THAT CHANGED THIS PHASE. §5 has it as a",
  "full-bleed #EFEFEF panel appearing with a gsap.set() — no tween at all. Built literally, that",
  "is a 1316x822 card going from #212121 to pure white in one frame, twelve times over as you",
  "move down the page. Sayandeep, on the running build: hovering them turns them white,",
  "immediately you get so much exposure, use light colours properly so people do not get",
  "flashbanged, add a transition, do not bring the info up from the bottom, and change the total",
  "white to a milder dim colour. Three passes, and the third is the one that is right.",
  "",
  "AREA. It is a drawer, not a curtain — anchored to the foot of the media and sized by its own",
  "content. 63% of a half card and 33% of the full opener, against 100% before, and the cover art",
  "stays visible above it so the card still reads as the work.",
  "",
  "DIRECTION. It wipes in from the right, not up from the bottom. clip-path rather than a",
  "transform, and that choice is load-bearing: a panel translated in from the right starts a full",
  "card-width outside its own box and would be drawn over the card in the next column, because the",
  "sheet is deliberately not a child of the media (§5 anatomy, and what lets 767 drop it into the",
  "flow). An inset clip needs no ancestor at all — the panel never moves, its visible region does.",
  "The five rows follow the wipe across on a .04 stagger, so it reads as being drawn rather than",
  "switched on.",
  "",
  "COLOUR. Not #EFEFEF. The panel is the page ground with 14% of the WORK OWN accent mixed in —",
  "Tessera a dark blue-grey, CanVas a dark red-brown, Solidus a dark green — with an accent",
  "hairline at full strength along the top edge. Three things fall out of that and all three are",
  "improvements: there is no bright surface anywhere on the page at any moment; each panel is",
  "visibly the panel of THAT card, which twelve identical white rectangles never were; and the",
  "SpecTable drops back to its ordinary palette, so the invert variant is not needed here at all.",
  "14% is the whole of the tuning — below about 10% the accents stop being distinguishable from",
  "each other, above about 20% the darker ones start fighting the white text. D-022, D-024.",
  "",
  "All four properties are asserted, and the colour one is asserted as a PROPERTY rather than a",
  "hex: relative luminance under 0.10, and still lighter than the page ground. All twelve panels",
  "are different colours by design, so pinning one value would pass vacuously for eleven of them.",
  "Measured: 0.0211 against the page 0.0152. A requirement nobody checks is one that regresses the",
  "next time somebody reads §5 and fixes it back.",
  "",
  "THE COVERS ARE PLACEHOLDERS AND THEY ARE DOING REAL WORK. Twelve grey rectangles cannot be",
  "judged for composition, and composition is the whole of phase 4's acceptance. Each card draws",
  "a deterministic cover from its own accent — seeded off the slug, no Math.random, so the server",
  "and the client agree and a screenshot diff is stable. Four rings rather than six, deliberately:",
  "the aperture is the studio's mark and putting it on twelve cards would make the grid read as",
  "twelve pieces of our branding rather than twelve pieces of work. T10.5 replaces them. I-035.",
  "",
  "ONE DEFECT THE SCREENSHOT FOUND AND NOTHING ELSE WOULD HAVE. The badge is z-index 5 inside the",
  "media; the sheet is z-index 3 and a SIBLING of it. Media had no z-index, so it created no",
  "stacking context and those two numbers competed directly — the white CASE STUDY chip painted",
  "on top of the white hover sheet and read as its first table row. Every computed value involved",
  "was correct. It is only wrong as a picture.",
  "",
  "AND ONE THE HARNESS WAS WRONG ABOUT. Every card in the first run was photographed mid-reveal —",
  "half-faded badges, captions at a third opacity — because the visual check settled 600ms after a",
  "scroll and the reveal runs 1.05s. That reads as a styling bug in a contact sheet and is not one.",
  "Same class as SCRUB_SETTLE_MS in phase 3: when a check looks wrong around an animation, ask what",
  "the animation was doing when you looked.",
  "",
  "AT 390. works-a-390 is the responsive behaviour §5 warns is most likely to be got wrong, and it",
  "is right: the sheet has not hidden, it has become the card's second block — the #EFEFEF panel",
  "with SERVICES / TOOLS / INDUSTRIES / YEAR / STATUS sitting under the media, then the caption.",
  "One column, every card the full measure, no transforms on any cell, no reel playback.",
  "",
  "THE HEADLINE has one word drawn as selected — Sayandeep asked for build to look selected because",
  "it creates a depth effect. It does, and it is not a new visual language: the site already",
  "inverts ::selection to #efefef on #212121, so this is that, applied on purpose rather than by",
  "accident. The highlight sits behind the glyphs and spans the full line box, which is what reads",
  "as a plane at a different depth. D-021.",
  "",
  "WHAT I AM NOT CLAIMING. The homepage still ends after the works grid — no services, no CTA, no",
  "culture, no blog row. The footer sits directly under SEE ALL WORK. That is phase 5. The load-more",
  "button is a plain pill; §21.4 gives theirs three media layers tracking the cursor at different",
  "depths and we have no media for them until phase 10. I-038.",
].join('\n');
