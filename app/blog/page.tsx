import type { Metadata } from 'next';
import { POSTS } from '@/lib/content/posts';
import { postBodyBySlug } from '@/content/posts';
import { SITE } from '@/lib/content/site';
import { BlogIndex } from '@/components/blog/BlogIndex';
import { CtaBlock } from '@/components/ui/CtaBlock';

/**
 * `/blog`. `30-page-specs.md` §`/blog`.
 *
 * ```
 * ├ .blog-hero     h1 "We share what we know." + lead
 * ├ .blog-filters  category radio pills — DESIGN · ENGINEERING · PROCESS · TOOLS
 * └ .blog-grid     3-col <BlogCard /> grid, 1-col ≤767
 * ```
 *
 * `<CtaBlock />` closes it and there is **no blog row**, per the spec — a blog
 * row on the blog index is the index twice.
 *
 * Only posts with a body are listed. The other nine of the twelve are metadata
 * waiting for prose; see `content/posts/index.ts` on why they are not stubs.
 */
export const metadata: Metadata = {
  title: `Writing — ${SITE.name}`,
  description: 'What we learned building the twelve, written down while it was still fresh.',
};

export default function BlogPage() {
  const written = POSTS.filter((post) => postBodyBySlug(post.slug));
  /* Only the categories that have something in them. A filter pill that always
     returns nothing is a filter pill that should not be there. */
  const categories = [...new Set(written.map((post) => post.category))];

  return (
    <>
      {/* The heading was "We share what we know." — the one line on the site
          that read like a post about posting. Every entry here came out of
          shipping one of the twelve, so it now says where they came from.
          D-060. */}
      <BlogIndex
        posts={written}
        categories={categories}
        heading="Notes from the build."
        lead="Everything here came out of building something on this site. No round-ups, no predictions — the specific thing we got wrong and what it cost to find out."
      />
      <CtaBlock />
    </>
  );
}
