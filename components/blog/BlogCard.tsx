import Link from 'next/link';
import type { Post } from '@/lib/content/posts';
import s from './BlogCard.module.css';

/**
 * A blog card. `20-components-and-motion.md` §19.
 *
 * ```
 * .post   background var(--grey-800); padding 1.5rem; min-height 22rem
 *         flex column, space-between
 *   title     --t-h3, top
 *   divider   var(--hairline), above the footer row
 *   category  --t-label, bottom-left  ·  "READ ARTICLE" --t-label, bottom-right
 * ```
 *
 * `justify-content: space-between` on a fixed minimum height is what makes a row
 * of three cards line up: the titles all start at the top and the footers all
 * sit on the bottom, however long the titles are. Three cards centred on their
 * own content would give three different baselines.
 *
 * §19's hover is marked `[new]` — a cover cross-fading in behind at .25 and the
 * title shifting 0.25rem. The cover half waits for phase 9's imagery; the title
 * shift ships now, because it is the half that says the card is a link.
 */
export function BlogCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className={s.post} data-blog-card>
      <span className={s.title} data-t="h3">
        {post.title}
      </span>

      <span className={s.foot}>
        <span className={s.category} data-t="label">
          {post.category}
        </span>
        <span className={s.read} data-t="label">
          Read article
        </span>
      </span>
    </Link>
  );
}
