/**
 * Screenshot pairs, ours versus tonik.
 *
 * Scroll positions are tonik's *measured* section offsets from the teardown. Our
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
  scroll?: number;
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
  { name: 'footer', ours: '/', reference: 's11-footer.png', scroll: 11984, phase: 1, pending: true },
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
  'Phase 0, /probe at 1512 and 390. There is no page yet, so this is a judgement about the type',
  'system, not about composition against tonik — the first real composition judgement is owed by',
  'phase 1 (footer) and phase 3 (hero).',
  '',
  'At 1512: the thirteen steps descend cleanly and h1 dominates. Every display step reads at the',
  'same weight — no step looks bolder than its neighbours, so the 400-only rule holds visually and',
  'not merely in the computed styles. General Sans is unmistakably the face that painted it: the',
  'single-storey g is clearly visible in "dog" and "jumps", which is the specific detail',
  '10-design-system.md §3 chose the family for. The three mono steps are visibly a different',
  'family, uppercase and tighter-tracked. h3 and h4 correctly render at the same size and differ',
  'only in leading. Text begins one gutter (41px) from the left edge, as measured.',
  '',
  'At 390 two things are worth recording. First, the h1/h2/h3/h4 steps have stepped down and the',
  'three mono label steps have visibly NOT — which is the property that keeps the interface',
  'technical on small screens, and is the thing most likely to be broken by a careless mobile',
  'override later. Second, a real defect surfaced: h1-sm (3.25rem, not stepped down) renders',
  'LARGER than h1 (3rem, stepped down), so the secondary hero style out-ranks the primary one on',
  'mobile. It is the biggest thing on the 390 capture. Logged as I-005, implemented as specced',
  'rather than silently corrected. h1 also reads noticeably tighter than the untracked h1-sm',
  'beside it, because -0.15rem of tracking is 2.5% of a 6rem face but 5% of a 3rem one — logged',
  'as I-006.',
  '',
  'One further observation, not a defect: at ≤767 h3, h4 and h5 all resolve to 1.5rem/1.75rem, so',
  'three consecutive steps collapse into one size. That follows from the specced step-down and is',
  'a legitimate compression of the scale, but a phase choosing between h4 and h5 on mobile should',
  'know the choice is invisible there.',
].join('\n');
