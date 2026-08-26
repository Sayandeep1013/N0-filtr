import { STACK } from './site';
import { WORKS } from './works';

/**
 * The block pit's contents. `70-physics-footer.md` §10, §2.
 *
 * ── The idea, and why it earns its place ─────────────────────────────────
 *
 * §2: *"This is not a bag of primary-coloured kids' blocks. It is **the stack
 * wall, made physical.**"* The same technology wordmarks that sit as a static
 * grid in the hero fall into a pile at the bottom of the page — the site opens
 * with our stack stated flatly and closes with it as something you can shove
 * around.
 *
 * So the labels are **not a second list**. They are `STACK`, the same constant
 * `<StackWall>` reads, which is what makes the two ends of the page the same
 * claim rather than two claims that happen to agree today.
 *
 * `MATTER.JS` is appended because §10 says to: *"`MATTER.JS` being in the pit,
 * made of Matter.js, is the joke. Leave it in."*
 */
export const PIT_LABELS: string[] = [...STACK, 'Matter.js'];

/**
 * The accent tiles. §2: *"Accent tiles are drawn from the twelve works' sampled
 * accents — the same values that theme the case-study pages. The pit is the only
 * other place on the site where those colours appear together, which quietly
 * links it to the work."*
 *
 * The **light** member of each pair, because a tile is a fill with text on it and
 * the dark accents are the ones that theme a page rather than carry a label.
 */
export const PIT_ACCENTS: string[] = [...WORKS]
  .sort((a, b) => a.order - b.order)
  .map((work) => work.accent.light);

/** §7's budget: 44 bodies on desktop, 24 at ≤767. */
export const PIT_BODIES = { desktop: 44, mobile: 24 } as const;
