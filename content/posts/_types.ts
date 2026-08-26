/**
 * Post bodies. `30-page-specs.md` §`/blog/[slug]`.
 *
 * ── This is not MDX, and that is a decision ──────────────────────────────
 *
 * The spec says MDX with Shiki at build time. It gets Shiki at build time —
 * `components/case/CodeBlock.tsx`, already built for the case studies — and
 * typed blocks instead of MDX.
 *
 * MDX buys authoring in markdown and components inside prose. Neither is worth
 * a second content mechanism here: the same people who write the code write the
 * posts, the site already has a typed block union that twelve case studies use,
 * and a union is the thing that makes a body checkable — a missing `alt`, an
 * unknown language, a heading level out of order are all type errors rather than
 * things a reader finds. See D-042.
 *
 * The rendered result is what §`/blog/[slug]` describes: `h2` at `--t-h3`, `h3`
 * at `--t-h5`, paragraphs at `--t-p`, a blockquote with a 1px left rule, and
 * syntax-highlighted `<pre>`.
 */

export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; lang: string; source: string; caption?: string };

export interface PostBody {
  slug: string;
  /** One sentence under the title. `--t-p-big`. */
  standfirst: string;
  blocks: PostBlock[];
}
