/**
 * The twelve articles. `40-content-model.md` §5, verbatim.
 *
 * **Metadata only.** Phase 9 builds the MDX pipeline and ports the prose out of
 * RepoLogs' `chapters.mjs`; phase 5 needs the titles, the categories and the
 * work each one belongs to, because the homepage's blog row is three cards and
 * a card is entirely metadata.
 *
 * `excerpt` is authored here rather than left empty: `20-components-and-motion.md`
 * §19 gives the card a title, a category and a "READ ARTICLE" link and no
 * excerpt at all, but the `/blog` index in phase 9 needs one and writing twelve
 * of them once is better than writing them twice. They are one line each, drawn
 * from the work's own thesis.
 */

export type PostCategory = 'Design' | 'Engineering' | 'Process' | 'Tools';

export interface Post {
  slug: string;
  title: string;
  category: PostCategory;
  /** Which work it came out of. Drives the cross-link in phase 9. */
  relatedWorkSlug: string;
  excerpt: string;
  /** Phase 9 computes this from the MDX; the row does not use it. */
  readingTime: number;
}

export const POSTS: Post[] = [
  {
    slug: 'attachment-cap-block-size',
    title: 'An attachment cap is a block size',
    category: 'Engineering',
    relatedWorkSlug: 'discvault',
    excerpt: 'What a chat platform calls a limit, a filesystem calls a block.',
    readingTime: 8,
  },
  {
    slug: 'free-tier-realtime-multiplayer',
    title: 'Running realtime multiplayer on a free tier',
    category: 'Engineering',
    relatedWorkSlug: 'rein-bot',
    excerpt: 'Where the latency budget goes when nobody is paying for the servers.',
    readingTime: 9,
  },
  {
    slug: 'url-as-account-system',
    title: 'The URL is the whole account system',
    category: 'Engineering',
    relatedWorkSlug: 'co-canvas',
    excerpt: 'Sharing a room name is the sign-up flow, and it has no failure states.',
    readingTime: 7,
  },
  {
    slug: 'drawing-as-document',
    title: 'A drawing is a document an AI can edit',
    category: 'Design',
    relatedWorkSlug: 'tessera',
    excerpt: 'Once the canvas is JSON, a model can propose a diff you can actually review.',
    readingTime: 10,
  },
  {
    slug: 'terminal-as-client',
    title: 'The terminal is a perfectly good client',
    category: 'Engineering',
    relatedWorkSlug: 'reelshell',
    excerpt: 'Everything a streaming app does, minus the thousand-pixel chrome.',
    readingTime: 6,
  },
  {
    slug: 'ranked-in-a-terminal',
    title: 'Building a ranked ladder in a terminal',
    category: 'Engineering',
    relatedWorkSlug: 'termtypo',
    excerpt: 'ELO, matchmaking and cross-play between a CLI and a web app.',
    readingTime: 8,
  },
  {
    slug: 'no-client-decides',
    title: 'No client decides the outcome',
    category: 'Engineering',
    relatedWorkSlug: 'ftc',
    excerpt: 'A server-authoritative rules engine, and why the alternative always leaks.',
    readingTime: 9,
  },
  {
    slug: 'sideloaded-and-updatable',
    title: 'A sideloaded app can still be updated',
    category: 'Engineering',
    relatedWorkSlug: 'solidus',
    excerpt: 'Shipping outside a store without shipping a dead end.',
    readingTime: 7,
  },
  {
    slug: 'notes-have-coordinates',
    title: 'Notes have coordinates',
    category: 'Design',
    relatedWorkSlug: 'notetakerxx',
    excerpt: 'Spatial memory is a real index, and a list throws it away.',
    readingTime: 6,
  },
  {
    slug: 'grounding-beats-cutoff',
    title: 'A model with no cutoff, if it fetches first',
    category: 'Engineering',
    relatedWorkSlug: 'valobot',
    excerpt: 'Live context turns a stale model into a current analyst.',
    readingTime: 8,
  },
  {
    slug: 'model-on-the-phone',
    title: 'Running the model on the phone',
    category: 'Engineering',
    relatedWorkSlug: 'droiddoodle',
    excerpt: 'On-device inference, and what it costs to draw with it.',
    readingTime: 9,
  },
  {
    slug: 'reading-a-closed-webgl-system',
    title: 'Reading a closed WebGL system',
    category: 'Tools',
    relatedWorkSlug: 'martini',
    excerpt: 'Two fidelity tiers, and what each one teaches you about the original.',
    readingTime: 11,
  },
];

/**
 * The three shown on the homepage.
 *
 * `30-page-specs.md` §6 gives the row three cards and does not say which. These
 * three are chosen so the row is not three Engineering pieces in a stack —
 * §5 notes the set is Engineering-heavy — so it opens with a Design piece, and
 * each card belongs to a different work.
 */
export const FEATURED_POST_SLUGS = [
  'drawing-as-document',
  'attachment-cap-block-size',
  'reading-a-closed-webgl-system',
] as const;

export const FEATURED_POSTS: Post[] = FEATURED_POST_SLUGS.map(
  (slug) => POSTS.find((p) => p.slug === slug)!,
);

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export const POST_CATEGORIES: PostCategory[] = ['Design', 'Engineering', 'Process', 'Tools'];
