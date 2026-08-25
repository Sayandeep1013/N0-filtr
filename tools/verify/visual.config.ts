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
  'Phase 1. Eight captures at 1512 and 390: footer, contact panel, mobile menu, and the phase-0',
  'type scale carried forward. Three have tonik references — footer (s11), contact panel (s12) —',
  'and the composition judgement below is against those. The homepage above the footer is still',
  'blank, so there is no hero comparison to make; that is owed by phase 3.',
  '',
  'FOOTER @1512 vs s11-footer.png. The composition lands. Both start one gutter (41px) from the',
  'left; both put the services list at the same height under the hairline; both run the enquiry',
  'column from x≈1238 to the right gutter with the social bars flush to it. The wordmark is the',
  'test I expected to fail and did not: "no filter" at 14vw ends at x≈737 against tonik’s 737,',
  'because 14vw is a proportion and both words happen to occupy the same fraction of the line.',
  'Three differences, all deliberate and all content: we have one social bar where they have four,',
  'a STUDIO row carrying the locality where they have a three-line street address, and five service',
  'rows whose icons are placeholders (I-014) — theirs are drawn, ours are geometric stand-ins and',
  'read thinner. The gap between the services block and the tagline is larger on theirs because',
  'their enquiry column is taller and stretches the row; that closes when the socials are real.',
  '',
  'Two real errors found here and fixed. The meta row had the year before the mark — tonik puts the',
  'mark first, then 2026, then PRIVACY POLICY hard right. And the grid was written `3fr 2fr 1fr`,',
  'which has an `auto` minimum, so the contact email — 312px of unbreakable string against a 311.5px',
  'track — was quietly widening its own column and taking the space from the other two. Now',
  '`minmax(0, Nfr)`, verified holding exactly 3:2:1 at 1024, 1200 and 1512. The email wraps instead,',
  'at a `<wbr>` after the @ so it breaks as `sayandeepmondal1013@` / `gmail.com` rather than',
  'mid-domain. Both corrected, re-captured, confirmed.',
  '',
  'CONTACT PANEL @1512 vs s12-contact.png. The sidebar geometry is right — 56% of the viewport,',
  'flush right, full height, over a --black-50 scrim with the page legible behind it. The heading,',
  'lead and divider stack at the same rhythm as theirs and the divider lands at the same place',
  'relative to the first field.',
  '',
  'Looking at this pair is what caught three form errors, none of which any assertion would have:',
  'the fieldsets were rendering their native browser border with the legend notched into it; the',
  'chips were small rounded pills huddled at the left where tonik’s are square and fill the row in',
  'five and four equal columns; and every text field carried a visible label above it where tonik',
  'uses the placeholder as the label. All three fixed. This is the second phase running where the',
  'visual check found what the assertions could not — the 132 token assertions were green',
  'throughout.',
  '',
  'One difference left standing: their fields are ~51px tall against our ~40px, so their form runs',
  'about 170px longer. That is roughly 1.125rem of vertical input padding against our 0.75rem. I',
  'have not changed it — 51px is measured off a screenshot rather than off computed styles, 0.75rem',
  'is the value the rest of the site actually uses, and guessing a third number would be worse than',
  'either. Noted for whoever next opens tonik with a panel on screen.',
  '',
  'MOBILE @390. The footer collapses to one column in the right order and the gutter steps to',
  '1.25rem. The burger is a clean "+" of two 1px strokes, and opening it slides the panel down and',
  'rotates the vertical stroke onto the horizontal — which makes a dash, not an ×. That is what',
  'their code does and what their site does; it looks like a bug and is not.',
  '',
  'The 390 footer is where I-013 becomes obvious rather than theoretical. Our wordmark at 14vw is',
  '~180px of a 350px column; tonik’s fills the column, because theirs is an SVG scaled to 100%',
  'width and only *happens* to equal 14vw at 1512. Desktop is right and mobile is visibly under-',
  'scaled. Left as specced — 14vw is one of only two rem exceptions CLAUDE.md names — and logged.',
  '',
  'TYPE SCALE @390. Re-checked deliberately, because this phase changed it. h1 and h1-sm now render',
  'at the same size, which resolves the inversion phase 0 flagged as I-005: below 768 tonik has no',
  'separate secondary hero step at all. h1 no longer reads tighter than everything around it',
  '(I-006). The three mono label steps are unchanged from 1512, which is the property most likely',
  'to be broken by a careless mobile override later.',
].join('\n');
