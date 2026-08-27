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
  /* A third pass, for the larger pile — same rule: every one of these is named
     in a repository the case studies were written from. */
  'Jetpack Compose',
  'JNI',
  'GBNF',
  'Edge Functions',
  'GitHub Actions',
  'Levenshtein',
  'CRDT',
  'WebGL',
  'Canvas 2D',
  'nanoid',
  'use-gesture',
  'localStorage',
  'Hydrax',
  'partyserver',
  'VLR.gg',
  'Lighthouse',
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
 * §7 budgets 44 bodies on desktop and 24 at ≤767. Sayandeep asked for more —
 * *"increase the amount object for matter js obj"* — so it is 56 and 32.
 *
 * The ceiling is the label list, not the physics: every tile carries a real name
 * (D-049), so the pile can only be as large as the vocabulary is honest. If
 * `PIT_LABELS` ever falls short of this the pile gets smaller rather than
 * growing blanks — see `buildTiles`.
 *
 * §7's own note on the budget is about CPU when active, and sleeping is what
 * actually pays for it: a settled pit of 56 costs the same as a settled pit of
 * 44, which is nothing.
 */
export const PIT_BODIES = { desktop: 56, mobile: 32 } as const;
