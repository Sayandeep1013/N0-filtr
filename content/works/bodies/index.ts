import type { Block } from '../_types';
import { coCanvasBody } from './co-canvas';
import { discvaultBody } from './discvault';
import { droiddoodleBody } from './droiddoodle';
import { ftcBody } from './ftc';
import { martiniBody } from './martini';
import { notetakerxxBody } from './notetakerxx';
import { reelshellBody } from './reelshell';
import { reinBotBody } from './rein-bot';
import { solidusBody } from './solidus';
import { termtypoBody } from './termtypo';
import { tesseraBody } from './tessera';
import { valobotBody } from './valobot';

/**
 * Case-study bodies, keyed by slug.
 *
 * ── Why the prose does not live next to the metadata ──────────────────────
 *
 * It did, and it cost the homepage 12KB of JavaScript it had no use for.
 *
 * `<WorksGrid>` is a client component and receives whole `Work` objects, so
 * every field on them is serialised into the payload for **every page that
 * renders a card** — the homepage, `/works`, five service pages and five
 * industry pages. Twelve case-study bodies is roughly thirteen thousand words
 * of prose, and none of those pages renders a single one of them. It pushed
 * `/` from 350.7KB to 362.8KB and broke the 360KB budget, which is how it was
 * noticed. See I-061.
 *
 * So `Work` is metadata — the things a card, a filter and a spec table need —
 * and the body is fetched by slug on the one route that renders it. Same split
 * as the blog: `lib/content/posts.ts` carries metadata and
 * `content/posts/index.ts` carries prose.
 *
 * Both are static imports, so the case-study route still prerenders at build
 * time. The point is not lazy loading; it is that eleven other page types stop
 * importing something they never use.
 */
export const WORK_BODIES: Record<string, Block[]> = {
  'co-canvas': coCanvasBody,
  'discvault': discvaultBody,
  'droiddoodle': droiddoodleBody,
  'ftc': ftcBody,
  'martini': martiniBody,
  'notetakerxx': notetakerxxBody,
  'reelshell': reelshellBody,
  'rein-bot': reinBotBody,
  'solidus': solidusBody,
  'termtypo': termtypoBody,
  'tessera': tesseraBody,
  'valobot': valobotBody,
};

export function bodyFor(slug: string): Block[] {
  return WORK_BODIES[slug] ?? [];
}
