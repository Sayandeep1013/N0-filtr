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
   * Resolve our scroll from a selector at capture time instead of from a number.
   *
   * Every fixed offset on our side is a guess that goes stale the moment a
   * phase adds a section above it — phase 5's `culture` shot was aimed at 10200
   * and landed on the blog row, because our document is 12,676px where tonik's
   * is 12,884 and the difference is not evenly distributed. A selector cannot
   * drift: it is the section, wherever the section now is.
   *
   * Their `scroll` stays a number, because their page is not moving.
   */
  ourSection?: string;
  /**
   * A named interaction to perform before the shutter. Some of this site's most
   * expensive composition is behind a click — the contact panel is 56% of the
   * viewport and a phase that only ever screenshots the resting page has never
   * looked at it. Implemented in visual.ts.
   */
  prepare?: 'contact-open' | 'nav-menu-open' | 'showreel-open' | 'accordion-open';
  /**
   * Skip this shot below a width. For controls that do not exist on a phone —
   * which is a design decision rather than a gap, and therefore something the
   * harness should be told rather than something it should trip over.
   */
  minWidth?: number;
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
    /* Desktop only, because the control is. `<PlaySquare>` is hidden below 768
       — at that size it rendered as a 36px dark rectangle in the middle of the
       headline rather than as a play button, and Sayandeep read it as a fault.
       See the note in `Hero.module.css`.

       This shot failed with a click timeout the moment that landed, which is
       the harness working: a scenario that opens something unreachable should
       say so rather than pass. */
    minWidth: 768,
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
  /* Their s07 is captured with a row already open, which is the only state the
     accordion is worth looking at — closed it is five rules and five words. */
  {
    name: 'services',
    ours: '/',
    reference: 's07-services-open.png',
    scroll: 8250,
    prepare: 'accordion-open',
    phase: 5,
  },
  { name: 'cta', ours: '/', scroll: 9320, ourSection: '[data-services] ~ section', phase: 5 },
  { name: 'culture', ours: '/', reference: 's08-cta-culture.png', scroll: 10200, ourSection: '[data-culture]', phase: 5 },
  { name: 'blog-row', ours: '/', ourSection: '[data-blog-row]', phase: 5 },
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
  "Phase 5. Twenty captures at 1512 and 390. Phase 4's judgement was reset before this run.",
  "",
  "THE HOMEPAGE IS COMPLETE, top to bottom. 12,676px against tonik's 12,884 — and that number is",
  "not a target I aimed at, it is what falls out of building each section to its own measured",
  "rhythm. Their offsets and ours: services 902 / 863, cta 370 / 370, culture 1781 / 2050, blogs",
  "632 / 710. Culture is the one that is out, and it is out because it is the one section whose",
  "composition §12 explicitly hands to us.",
  "",
  "THE ACCORDION is the best thing in this contact sheet. An open row on #2e2e2e with the arrow",
  "rotated to a right-pointer, the prose column at 7/12 with its pill CTA, and the inverted panel",
  "at 5/12 carrying OUTPUT, TOOLS and a featured work. §6 gives the body three columns — prose,",
  "testimonial, spec panel — and says what to do about the testimonial we do not have: columns 1",
  "and 3 widen to 7/12 and 5/12. They do.",
  "",
  "Its motion is the part worth defending. §6's open and close are DIFFERENT sequences rather than",
  "one timeline played both ways: the body opens over .7s and the panel slides in over .5s after",
  "it; on the way out the panel leaves first over .6s and the body collapses behind it, so the",
  "panel is never caught mid-collapse with its own height changing under it. Read back off the",
  "live timelines: open 1.2s at [0, 0.7, 0.7], close 1.1s at [0, 0.5, 0.5, 0.6]. Both match §6.",
  "",
  "Neither exists on a resting page, which is why they sat `pending` in motion.config.ts since",
  "phase 0 — that checker reads window.__TIMELINES__ off a page that has just loaded, and a closed",
  "accordion has no open timeline to read. They are driven in the behaviour layer now, and the two",
  "pending entries are gone. Motion is 241/241 with nothing outstanding for the first time.",
  "",
  "ONE THING §6 DOES NOT COVER, and Sayandeep caught it: an open row is most of a viewport tall,",
  "so opening it in place leaves the thing you asked to see below the fold. The row now scrolls to",
  "the top on open and returns you to where you were on close. The target is PREDICTED rather than",
  "measured after the layout settles — waiting out the .7s open would read as lag — and the",
  "prediction is exact: the row only moves if the row that is closing sits above it, and by",
  "exactly that row's body height. One subtraction, and the scroll starts on the same frame as the",
  "click. D-029.",
  "",
  "THE CTA is §10 to the number: #2e2e2e, 3rem padding, 23rem minimum, a 6rem heading and a 6rem",
  "circle. The thing I checked hardest is that it is ONE REAL BUTTON. §10 says the whole block",
  "opens the contact panel, and the two easy ways to build that are both wrong — a div with an",
  "onClick is unreachable by keyboard and announces as nothing, and a nested button for the arrow",
  "would be invalid and would swallow the click on the element people actually aim at. Asserted:",
  "tag is BUTTON, zero interactive descendants, and clicking it opens the panel.",
  "",
  "THE BLOG ROW lines up, and that is the whole component. Three cards on #3b3b3b, title top,",
  "hairline above the foot, category left and READ ARTICLE right. §19's space-between on a fixed",
  "22rem minimum is what makes three cards with three different title lengths share a top edge and",
  "a bottom edge; centred on their own content they would give three baselines and stop reading as",
  "a row. Asserted as one distinct top and one distinct bottom across all three.",
  "",
  "THE CULTURE SECTION IS THE WEAKEST THING ON THE PAGE AND I WILL NOT PRETEND OTHERWISE. §12",
  "rates it our lowest-confidence layout at 7/10 and splits it exactly right: the motion is exact",
  "and the composition is a design act we perform ourselves. The motion is there — every frame's",
  "overlay wipes from full width to 0 on scroll, two of the six carry the -20% parallax, and both",
  "are asserted. The composition is six frames on the twelve-column grid, uneven by design.",
  "",
  "What is not there is photographs. T10.4 imports them. Each frame draws a neutral seeded field",
  "until then, deliberately NOT accent-tinted — the works grid uses accent fields to mean 'this is",
  "a project' and reusing them here would say these are projects too. The first pass ran the",
  "gradient down to --black, which on a #212121 page is eleven values of difference and effectively",
  "invisible: six frames that read as gaps rather than as frames. They have a hairline and a",
  "lighter midpoint now. An empty frame that announces itself is a placeholder; an invisible one is",
  "an accident. I-042.",
  "",
  "It was also 2748px on the first build against tonik's 1781 — three portrait frames stacked, each",
  "670px on its own. One portrait frame now, and 2050. Still over, and I am leaving it there: our",
  "six frames are our composition and matching their pixel count would mean matching a photo",
  "arrangement we do not have.",
  "",
  "THE LOADER DRAWS ITS OWN MARK NOW. Sayandeep asked for the logo animated, and the aperture had",
  "one obvious animation in it the whole time: §1 of 50-brand-and-3d draws the mark with its blades",
  "RETRACTED, so the ring arriving first and the six ticks then pulling back to the inner edge is",
  "an iris opening. Separate timeline from loader.enter on purpose — enter is a transcription of",
  "IX2 a-23 and this harness asserts its exact five-child shape; adding to it would mean breaking",
  "that assertion or loosening it, and a loosened assertion is how a transcription quietly stops",
  "being one. First visit only. D-028.",
  "",
  "THAT CHANGE BROKE FOUR HARNESS CHECKS AND ALL FOUR WERE ALREADY WRONG. The loader now covers",
  "the page for 1.3s rather than 0.6, and everything that had been implicitly relying on the",
  "shorter number surfaced at once: hovers intercepted by the loader panel, shots of a covered",
  "page, a ScrollTrigger baseline of 0 read before any trigger existed, and — the good one — a",
  "phantom rAF loop.",
  "",
  "That last one is worth the space. readMotionState used page.waitForFunction, which polls on",
  "requestAnimationFrame by default and therefore installs a self-rescheduling rAF loop IN THE",
  "PAGE. This file counts persistent rAF loops to enforce CLAUDE.md's one-animation-loop rule, so",
  "the helper was failing the check twenty lines below it. It had always been fragile and never",
  "failed: the non-reduced block reads the probe before calling it, and __MOTION__ used to appear",
  "fast enough that the poller resolved on its first tick, under the five-tick threshold that",
  "separates a driver from an incidental reschedule. Delaying the provider's first publish by 700ms",
  "pushed it over. It polls by hand from the Node side now, and so does the loader helper.",
  "",
  "THE JS BUDGET went to Sayandeep rather than being edited, which is the standard D-013 set when",
  "it raised the last one. 321.7KB against a 320 ceiling: React and Next ~103, three ~141, GSAP and",
  "ScrollTrigger ~50, all of our own components ~28. The only lever big enough to matter is three,",
  "and pulling it means dropping the hero. Raised to 360 with the measurement recorded. Plyr, Flip,",
  "split-type and Matter all still load on demand and three of the four are asserted absent.",
  "",
  "WHAT I AM NOT CLAIMING. The culture frames are placeholders. The service leads and OUTPUT/TOOLS",
  "lists are authored to fill the accordion and T10.8 writes the real ones. The blog cards link to",
  "/blog/[slug], which does not exist until phase 9. And every nav destination still 404s.",
].join('\n');
