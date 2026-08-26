import { BLOG_ROW } from '@/lib/content/site';
import { FEATURED_POSTS } from '@/lib/content/posts';
import { Button } from '@/components/ui/Button';
import { BlogCard } from './BlogCard';
import s from './BlogRow.module.css';

/**
 * The blog row. `30-page-specs.md` closes the homepage, `/works`, every service
 * page and every industry page with it — five templates, one component.
 *
 * It was inline in `<HomeLower>` until phase 7 needed it four more times.
 * Nothing about it changed in the move; the CSS came across verbatim, including
 * §7's measured `4fr 4fr 4fr` on the 1.25rem gap, which is three equal thirds
 * of the twelve-column grid.
 *
 * `/blog` itself deliberately does **not** use it — a blog row on the blog index
 * is the index twice.
 */
export function BlogRow() {
  return (
    <section className={s.blog} data-blog-row>
      <div className="padding-global">
        <div className="container-large">
          <div className={s.blogHead}>
            <p className={s.label} data-t="label">
              {BLOG_ROW.label}
            </p>
            <Button href="/blog">{BLOG_ROW.link}</Button>
          </div>

          <div className={s.blogRow}>
            {FEATURED_POSTS.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
