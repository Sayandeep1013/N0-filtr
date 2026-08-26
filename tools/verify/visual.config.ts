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
  { name: 'works-a', ours: '/', reference: 's03-projects.png', scroll: 1900, phase: 4, pending: true },
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
  "Phase 3. Twelve captures at 1512 and 390, including two new surfaces: the stack wall and the",
  "showreel. The phase-2 judgement was reset to null before this run — it described a hero, a",
  "footer and a contact panel and would have gone green on three things nobody had looked at.",
  "",
  "THE STACK WALL vs s02-marquee.png. Theirs is a client-logo marquee; ours is twenty-two tool",
  "names set as type. The content is deliberately different — their marks are clients, which are",
  "theirs to show, and ours are tools — so what I am judging is density and whether a band of",
  "small marks under the fold reads as a section or as debris.",
  "",
  "It reads as a section. Three rows, centred, resting at .7, with a mono label above it at the",
  "container's left edge while the marks centre — which is the same tension theirs has and it is",
  "load-bearing: a centred label over a centred wall would read as a title card. The density is",
  "close to theirs; 22 marks at 1.5rem fill the 80rem measure about as fully as their 28 logos do.",
  "",
  "The height is not a judgement call and was not treated as one. §1 gives their hero section",
  "1361px at a 900 viewport — the viewport plus the wall below the fold — and compare:hero now",
  "asserts it. First pass came out 1311 against 1360.63, and the same ~49px short at 1280 and",
  "1440, which is what a rem-sized miss looks like when only the root changes. 3rem of padding",
  "split 2/1 in favour of the top closed it: 1360.6 / 1612 / 1248 / 1348 against their 1360.63 /",
  "1612 / 1248 / 1348. 96 of 96 structural values agree, and only 1512 was ever tuned.",
  "",
  "THE REVEAL, and the best thing in this contact sheet. stack-wall-1512.png caught it mid-scrub:",
  "'A studio that defines, designs,' at full opacity, 'and builds products and other digital",
  "machinery' still sitting at .2, with the boundary falling mid-phrase. That is the signature",
  "motion of the whole site and it is a picture of it working, taken by accident.",
  "",
  "Its box is not a judgement either. Their reveal sits at x 543.52 and is 743.67 wide; ours reads",
  "543.51 and 743.67. That did not come from nudging a margin — it came from finding the rule.",
  "tonik have no grid class, so every phase so far has read their offsets off screenshots. They",
  "have a grid SYSTEM: three-track fr grids whose tracks are twelfths, on a 1.25rem gap. The",
  "reveal's parent is 4fr 7fr 1fr. Extending the extractor to divide their used track widths by",
  "the space left after the gaps turned 424.95px / 743.675px / 106.25px back into 4/12, 7/12,",
  "1/12, and the same pass named the rule for services (1fr 10fr 1fr), culture, the blog row",
  "(4fr 4fr 4fr), the footer (6fr 4fr 2fr) and the spec-table row (6fr 6fr on the tight 0.75rem",
  "gap). Phases 4, 5 and 7 all needed this and would each have rediscovered it separately.",
  "",
  "Two of our tokens were wrong and are now corrected: --grid-gap was 1.5rem and is 1.25rem, and",
  "--col was a twelfth of --content when it is a twelfth of the container. That second one is the",
  "same mistake as I-030, made in the same place, a phase later.",
  "",
  "It is NOT a 12-column grid with the heading spanning 5/12. That lands the left edge on the",
  "same pixel and makes the element 759px instead of 744, because seven spanned columns swallow",
  "six internal gaps a single 7fr track does not have. Right edge, wrong measure — the kind of",
  "miss that looks like a rounding error and is a different rule.",
  "",
  "THE TYPE STEP. Their reveal is t-heading-3-rg: 32.9px on 41.125px leading at a 16.45 root, so",
  "2rem/2.5rem, our --t-h3. Not --t-h2. There is no 5rem step anywhere on their site — the",
  "extractor's type pass finds 6.25 (one use), 6, 2, 1.5, 1, .75, .625 and .5, and nothing",
  "between 2 and 6. Our --t-h2 at 5rem may be an invention in the same class as --t-label-big.",
  "Logged as I-031 rather than changed: phase 5's CTA and culture headings are the phases that",
  "will actually find out.",
  "",
  "THE SHOWREEL. showreel-1512 and -390 both show the panel open with the player in it, so the",
  "Flip lands at both viewports. The behaviour check is the real evidence and it is stronger than",
  "the picture: the background layer leaves the headline at {x 98, y 324, w 66, h 66}, becomes a",
  "1234x694 player — 18.7x its own width — and comes back to {x 98, y 324, w 66, h 66} on Escape.",
  "A Flip that lands and a Flip that teleports look identical in a still; the round trip does not.",
  "",
  "Two defects were visible in the first frame I took of it and both are fixed. Plyr's stylesheet",
  "was never imported, so its SVG control icons rendered at intrinsic size — enormous black arrows",
  "across the hero. And the reparented layer is appended last, so with no stacking order it landed",
  "on top of the video and the player was a flat grey rectangle. Static CSS, dynamic JS, and a",
  "z-index on the player.",
  "",
  "The reel in it is our own hero, recorded for eight seconds, and the panel says so on screen:",
  "'PLACEHOLDER REEL — REAL FOOTAGE LANDS WITH THE CASE STUDIES'. T10.2 replaces the file and",
  "nothing else. I would rather ship a labelled placeholder than a control that opens an empty",
  "player, and rather that than choreography no one has ever seen run.",
  "",
  "AT 390. The marquee is moving in stack-wall-390 — three marks across, mid-travel, which is the",
  "doubled track sliding. The showreel opens and the play square is correctly absent from the",
  "headline, because it is in the player. The works heading steps to 1.5rem and the three-track",
  "offset collapses to one column, as every one of their section grids does below 768.",
  "",
  "WHAT I AM NOT CLAIMING. The homepage still ends after the works heading — no grid, no services,",
  "no CTA, no culture, no blog row. The footer sits under a heading with nothing beneath it. That",
  "is phases 4 and 5, and it is why the footer shot is still taken at 'bottom' rather than at",
  "tonik's 11,984.",
].join('\n');
