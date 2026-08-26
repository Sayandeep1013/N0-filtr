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
  prepare?: 'contact-open' | 'nav-menu-open';
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
  { name: 'stack-wall', ours: '/', reference: 's02-marquee.png', scroll: 950, phase: 3, pending: true },
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
  "Phase 2, after the hero rebuild. Ten captures at 1512 and 390. The homepage now has real",
  "copy, so this is the first run where the hero shot shows the composition it is supposed to",
  "show rather than the footer wordmark standing in for a headline.",
  "",
  "THE HERO vs tonik-hero-01.png. The structure now matches theirs line for line: a two-line",
  "headline in the upper third with an inline play square opening the second line, the 3D",
  "assembly right-of-centre, and a two-up mono rail on the foot above a hairline. Ours reads",
  "at 24% down for the headline's first line against their 24%, and the rail sits on the",
  "gutter as theirs does.",
  "",
  "The object was rebuilt entirely between runs and the previous judgement is void. It was a",
  "thin torus with six thin bars floating at its inner edge, and the pointer drove the bars",
  "independently of the ring — the spec's own recovered curves, faithfully applied, and wrong",
  "for our object. tonik's glyph floats free inside their ring so a large differential costs",
  "them nothing; ours is housed, and the same differential slid the blades out of the bore.",
  "It read as a circle and some lines and it lost its teeth whenever the pointer moved.",
  "",
  "It is one machined barrel with six blades inside its bore now, and the differential moved",
  "to the axis where it is mechanically true: the housing tips as one object and the blades",
  "actuate about the bore's own axis, which is what an iris does. Triangles went DOWN, 13,064",
  "to 5,232 — the first object was expensive because a 200-segment torus is expensive, not",
  "because it was detailed.",
  "",
  "MATERIAL. This is the biggest visible change and the spec did not describe it. Section 2",
  "gives a lambert body, a fresnel rim and a grain, and no specular term at all — so a literal",
  "reading has nothing that glints, and against a reference covered in bright flecks along the",
  "lit arc it read as flat shading on a dark shape. There is a specular term now, with the",
  "grain driving both its spread and its strength, and the ring finally reads as something",
  "cast rather than something filled. I-027.",
  "",
  "Honest comparison: theirs still has more surface glitter than ours. Theirs is a baked map",
  "with real specular detail; ours is procedural and reads as a finer, more even tooth. I have",
  "pushed it twice and stopped, because the next step is inventing surface detail the spec",
  "does not describe rather than lighting the surface it does.",
  "",
  "SILHOUETTE. The ellipse now stretches lower-left to upper-right, and it holds still. The",
  "previous build spun the assembly about world Y, which for an annulus sweeps it through",
  "edge-on twice a revolution — the silhouette collapsed to a line and the composition under",
  "the headline changed as it turned. It spins about the bore axis now, so the ellipse is",
  "invariant and what you see turning is the grain and the six blades. I-026.",
  "",
  "The object overlaps the last word of line two by about 50px. Theirs overlaps 'visionaries'",
  "by a similar margin. Judged correct rather than tolerated: the copy sits over the",
  "assembly's left edge in both, and the headline's 60% measure is what stops it becoming more",
  "than an overlap.",
  "",
  "HERO @390. The camera is fitted to the viewport, and this is the shot that forced it. At the",
  "desktop distance a 390-wide viewport put the object at 183% of the width — an arc with one",
  "blade on it. Fitted, it reads as a ring cropped by the right edge, which is how their own",
  "mobile capture frames it.",
  "",
  "WHAT A STILL CANNOT SHOW, and what the behaviour layer now holds instead. Fifteen",
  "assertions, and three of them exist because of defects this phase actually shipped and had",
  "to fix:",
  "",
  "  - the blades never leave the barrel, at every pointer position, with the reach invariant",
  "    to six decimal places rather than merely small. That is the failure the first build had.",
  "  - the response stays subtle. The first build swung 0.6 rad and read as a thing being",
  "    waved about; a regression that doubles the current figures is a regression.",
  "  - the blades lead the housing. The differential survived the rebuild even though the axis",
  "    it lives on changed, and that is worth asserting rather than assuming.",
  "",
  "The load-in was also measured rather than watched. The specced values were running",
  "correctly and were simply illegible: 0.85 to 1 is a 15% move, and power3.out spends most of",
  "its travel in the first fifth of its duration, so sampling at 10ms already found it at",
  "0.919. It is 0.55 over 1.6s on power2.out now and still climbing at 880ms. I-028.",
  "",
  "FOOTER, CONTACT PANEL, MOBILE MENU, TYPE SCALE. Re-read and unchanged from the previous",
  "run's judgement. The footer no longer sits under a full-height canvas near the top of the",
  "document, because the homepage finally has height — which was the one thing the previous",
  "judgement had to explain away.",
  "",
  "MEASURED AGAINST THEIR LIVE DOM, not against a capture. This is the change that ended the",
  "back-and-forth on alignment, and it should have been the first move rather than the last:",
  "every earlier pass read pixel positions out of tonik-hero-01.png, which gives you where",
  "things ARE and never why. Opening tonik.com in Playwright and reading getBoundingClientRect",
  "and getComputedStyle off the hero gave the actual values in one pass.",
  "",
  "Ours now matches theirs on every number in the hero:",
  "",
  "  h1        x 98    y 201.5   1316 x 197.4     font 98.7 / 98.7 / -2.4675   identical",
  "  play      x 98    y 324.1   65.8 x 65.8      4rem square, --grey-800      identical",
  "  line 2    flex, align-items flex-end, gap 41.125px                        identical",
  "  rail      x 98    y 816.8   1316 wide, rule on 858.9                      identical",
  "  rail rule border-bottom 1px rgba(255,255,255,.3), padding-bottom 28.7875  identical",
  "  canvas    position absolute, inset 0, 1512x900, z-index 0                 identical",
  "",
  "Three real errors came out of that read, none of which a screenshot could have shown:",
  "",
  "  1. `.container-large` was `max-width: 100%` and used nowhere. Theirs caps at 80rem and",
  "     centres — 1316px at a 16.45 root, 1520px at 19. That cap is why their copy starts 98px",
  "     from the left where a bare 41px gutter would start it at 41, and it is the whole of the",
  "     alignment drift I had been chasing by eye. 10-design-system.md documents the class as",
  "     the gutter width, which is wrong. I-030.",
  "  2. The foot rail's labels are --white, not the secondary grey. Confirmed twice over: their",
  "     bottom-bar computes to rgb(239,239,239), and the brightest pixel in that row of their",
  "     capture is exactly #efefef. The footer's labels are grey; the hero's are not.",
  "  3. The play control is a 4rem SQUARE sized in rem, sitting in a flex row with a 2.5rem gap",
  "     — not an em-sized glyph inline in the sentence. I had it 0.2rem out with the wrong gap.",
  "",
  "The one thing the live read cannot give is their 3D object: it is a Spline scene, and the",
  "brief deliberately does not copy it. That half stays judgement, and it is the half that took",
  "the iterations — thin barrel against thick, where the specular sits, how wide the blades are.",
  "The layout half should not have.",
].join('\n');
