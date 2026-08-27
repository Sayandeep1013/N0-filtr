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
 * ── Every tile is labelled, and every label is real ──────────────────────
 *
 * Sayandeep: *"fill each one of them with proper tech names."*
 *
 * §10 pairs the twenty-two hero wordmarks with *"~22 unlabelled tiles and discs
 * as filler"*, and filler is exactly what it looked like — half a pile of blank
 * blocks reads as a pile that ran out of ideas.
 *
 * So the vocabulary widens rather than repeating. `STACK` stays first and
 * unchanged, because the hero's claim should not drift; everything after it is
 * a tool that is genuinely in one of the twelve repositories, taken from their
 * READMEs while the case studies were being written. Nothing here is invented
 * to fill a tile, and nothing appears twice. See D-049.
 *
 * `MATTER.JS` is in the list because §10 says to: *"`MATTER.JS` being in the
 * pit, made of Matter.js, is the joke. Leave it in."*
 */

/**
 * The second twenty-two. Sourced from the repositories the case studies were
 * written from — Co-Canvas, DiscVault, Rein-Bot, ValoBot, TermTypo,
 * NoteTakerXX, FTC, Martini, ReelShell, Solidus, DroidDoodle and this site.
 */
const PIT_EXTRA: string[] = [
  'Matter.js',
  'Supabase',
  'Zustand',
  'Playwright',
  'Shiki',
  'Embla',
  'BlockNote',
  'Excalidraw',
  'PL/pgSQL',
  'Durable Objects',
  'llama.cpp',
  'Tailwind',
  'Framer Motion',
  'SplitType',
  'Plyr',
  'mpv',
  'EAS Build',
  'Expo Router',
  'SwiftShader',
  'Sharp',
  'Zod',
  'pnpm',
];

/**
 * Every label in the pit, in order. The hero's stack first, then the wider set.
 *
 * De-duplicated, because `STACK` and the list above can overlap as either
 * changes — and a pile with two `EXPO` tiles reads as a bug rather than as a
 * set.
 */
export const PIT_LABELS: string[] = [...new Set([...STACK, ...PIT_EXTRA])];

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

/**
 * §7's budget: 44 bodies on desktop, 24 at ≤767 — and now also the number of
 * labels, since every tile carries one. If `PIT_LABELS` ever falls short the
 * pile simply gets smaller rather than growing blanks.
 */
export const PIT_BODIES = { desktop: 44, mobile: 24 } as const;
