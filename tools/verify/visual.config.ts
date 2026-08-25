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
export const AGENT_JUDGEMENT: string | null = null;
