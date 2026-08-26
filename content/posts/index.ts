import type { PostBody } from './_types';
import { drawingAsDocument } from './drawing-as-document';
import { attachmentCapBlockSize } from './attachment-cap-block-size';
import { readingAClosedWebglSystem } from './reading-a-closed-webgl-system';

/**
 * The written posts.
 *
 * `lib/content/posts.ts` carries metadata for **twelve**; three of them have
 * bodies. That gap is deliberate and it is the honest shape: `/blog` lists what
 * is written, `/blog/[slug]` generates params from this map, and the nine
 * without a body are not routes.
 *
 * The alternative was twelve stubs, which is a blog that looks finished and is
 * not — and on a site whose whole argument is that the work is real, nine empty
 * articles would be the most expensive thing on it.
 */
export const POST_BODIES: Record<string, PostBody> = {
  [drawingAsDocument.slug]: drawingAsDocument,
  [attachmentCapBlockSize.slug]: attachmentCapBlockSize,
  [readingAClosedWebglSystem.slug]: readingAClosedWebglSystem,
};

export function postBodyBySlug(slug: string): PostBody | undefined {
  return POST_BODIES[slug];
}

/** Slugs that have a body, in the order `POSTS` lists them. */
export function writtenSlugs(): string[] {
  return Object.keys(POST_BODIES);
}
