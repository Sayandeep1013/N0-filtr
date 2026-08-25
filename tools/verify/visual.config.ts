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

  { name: 'hero', ours: '/', reference: 'tonik-hero-01.png', scroll: 0, phase: 3, pending: true },
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
  "Phase 2, T2.1. Eight captures at 1512 and 390. There is still no hero to compare — the 3D",
  "assembly is the rest of this phase and the homepage is blank above the footer — so this is a",
  "judgement about the two content changes that landed with the brand gate: the wordmark casing",
  "and the rename of service 04. Both surfaces are phase-1 components being re-read, not new ones.",
  "",
  "THE WORDMARK, NOW `NO FiLTER`. Compared footer-1512 and footer-390 against their pre-change",
  "captures and against s11-footer.png. The device works: at 14vw the lone lowercase i sits in a",
  "run of caps as a visible notch with a dot over it, and it reads as deliberate rather than as a",
  "typo — which was the argument for choosing caps-caps over `No FiLTER`. It survives at navbar",
  "size too, which was the real risk. I cropped and upscaled the nav wordmark to check: at a",
  "15.2px face the dot and the shortened stem are both still legible. It does not degrade into",
  "`NO FILTER`.",
  "",
  "AND WHAT THE SCREENSHOTS DID NOT SHOW. The nav wordmark was overrunning its box by 8% and I",
  "could not see it in any capture. `.logo` is `4.25rem` wide with `flex: none`, so an overrun",
  "does not clip and does not visibly collide — it silently eats into the gap before the links",
  "group, 5.6px of it at 1512. It turned up only because I measured `getBoundingClientRect` on",
  "every `.wordmark` instead of trusting the picture: 75.5px of text in a 69.9px box. The box is",
  "the specced value (§4, measured off tonik) and the face size was the one phase 1 fitted to the",
  "lowercase form, so the face size took the correction, 1rem → 0.925rem = 4.25/4.59. Re-measured",
  "at 99.9% of the box at both 1512 and 390. This is the third phase running where the check that",
  "found the real defect was not the one that was supposed to. MEASURE THE WORDMARK, DO NOT LOOK",
  "AT IT.",
  "",
  "THE FOOTER vs s11-footer.png. The composition is unchanged from phase 1's reading and still",
  "lands — same left gutter, same services height, same enquiry column. One difference is new and",
  "large enough to state: our wordmark now ends at x=1012.5 where tonik's ends at 737. That is",
  "275px further right and it is correct. `14vw` is a proportion, our word is longer than `tonik`,",
  "and it is now in caps; the setting is untouched. It stays inside its own column (1177.8px wide)",
  "with 165px of slack, so nothing overlaps the enquiry column. It is also a straight improvement",
  "on I-013: the wordmark fills 82.5% of its column at 1512 against ~59% before, and 71.6% at 390",
  "against ~51%, which is materially closer to tonik's column-filling SVG at no cost. I-013 is",
  "amended rather than closed — 71.6% is not 100% — but it is a smaller issue than it was.",
  "",
  "SERVICE 04, NOW CREATIVE DEVELOPMENT. It renders in three places and I checked all three. The",
  "footer rail reads `Creative Development` at row 4 with the new wireframe-cube glyph, which sits",
  "at the same 1.25rem and 0.5 opacity as its four neighbours and does not read heavier or lighter",
  "than them — it is still placeholder art like the rest of the set (I-014, phase 10), but it no",
  "longer illustrates a service we do not offer. The old drawing was stacked blocks clicking",
  "together, which was a no-code metaphor and would have been quietly wrong under the new name.",
  "",
  "The contact form picked the rename up on its own, because the chips read from SERVICES rather",
  "than from a copy. At 1512 `CREATIVE DEVELOPMENT` is the only chip of five that wraps to two",
  "lines. I looked hard at whether to shorten the label and decided not to: the five chips are a",
  "grid, all five boxes stay exactly the same height, the wrapped label is centred, and the row",
  "reads even. Inventing a short form here would also put it at odds with the canonical name in",
  "SERVICES and in the content model. At 390 the chips are two-up and it fits on one line with",
  "room, so the wrap is a 1512-only artefact of the longest name in the list.",
  "",
  "MOBILE @390. Menu opens, the burger still rotates to a dash rather than an x — phase 1",
  "established that this is what their code does and it is unchanged. Footer collapses in the same",
  "order. Nothing regressed.",
  "",
  "TYPE SCALE. Untouched this phase and re-read only to confirm that: the wordmark carries its own",
  "face size and letter-spacing and does not inherit from the scale, so changing its casing could",
  "not have moved anything on the /probe surface. It did not.",
].join('\n');
