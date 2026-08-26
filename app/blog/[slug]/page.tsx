import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, postBySlug } from '@/lib/content/posts';
import { POST_BODIES, postBodyBySlug } from '@/content/posts';
import { workBySlug } from '@/lib/content/works';
import { SITE } from '@/lib/content/site';
import { PostBody } from '@/components/blog/PostBody';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { IconCircle } from '@/components/ui/IconCircle';
import s from './post.module.css';

/**
 * `/blog/[slug]`. `30-page-specs.md` §`/blog/[slug]`.
 *
 * ```
 * ├ .post-hero    category (--t-label) · h1 (--t-h1-sm) · date · read time
 * ├ .post-body    7/12 column
 * └ .post-footer  prev/next post + <CtaBlock />
 * ```
 *
 * ── Only written posts are routes ────────────────────────────────────────
 *
 * `lib/content/posts.ts` has metadata for twelve; three have bodies.
 * `generateStaticParams` reads the bodies, not the metadata, so the other nine
 * are not routes and cannot be linked to by accident. See `content/posts/index.ts`.
 *
 * ── There is no date, and that is on purpose ─────────────────────────────
 *
 * §`/blog/[slug]` asks for one and `40-content-model.md` §5 does not carry it.
 * Inventing publication dates for posts written this week would be the one kind
 * of lie this site cannot afford — everything else on it is checkable. The
 * reading time is real: it comes from the body's own word count. Logged as
 * I-056.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(POST_BODIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  const body = postBodyBySlug(slug);
  if (!post || !body) return {};
  return {
    title: `${post.title} — ${SITE.name}`,
    description: body.standfirst,
    openGraph: { title: post.title, description: body.standfirst, type: 'article' },
  };
}

/** Two hundred words a minute, rounded up. Derived, never authored. */
function readingMinutes(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export default async function PostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBySlug(slug);
  const body = postBodyBySlug(slug);
  if (!post || !body) notFound();

  const words = body.blocks
    .map((block) => ('text' in block ? block.text : 'items' in block ? block.items.join(' ') : ''))
    .join(' ');

  /* Prev and next among the **written** posts, in the order the content file
     lists them — so the two arrows never point at a page that does not exist. */
  const written = POSTS.filter((p) => postBodyBySlug(p.slug));
  const at = written.findIndex((p) => p.slug === slug);
  const previous = at > 0 ? written[at - 1] : undefined;
  const next = at < written.length - 1 ? written[at + 1] : undefined;

  const work = workBySlug(post.relatedWorkSlug);

  return (
    <>
      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.column}>
              <Link href="/blog" data-t="label" className={s.back}>
                ← All writing
              </Link>
              <p data-t="label" className={s.category}>
                {post.category}
              </p>
              <h1 data-t="h1-sm" className={s.title}>
                {post.title}
              </h1>
              <p data-t="p-big" className={s.standfirst}>
                {body.standfirst}
              </p>
              <p data-t="label" className={s.meta}>
                {readingMinutes(words)} min read
                {work ? (
                  <>
                    {' · from '}
                    <Link href={`/works/${work.slug}`} className={s.metaLink}>
                      {work.title}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="padding-global">
        <div className="container-large">
          <div className={s.column}>
            <PostBody blocks={body.blocks} />
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.pager}>
              {previous ? (
                <Link href={`/blog/${previous.slug}`} className={s.pagerLink}>
                  <span data-t="label" className={s.pagerLabel}>
                    ← Previous
                  </span>
                  <span data-t="h5" className={s.pagerTitle}>
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/blog/${next.slug}`} className={`${s.pagerLink} ${s.pagerNext}`}>
                  <span data-t="label" className={s.pagerLabel}>
                    Next →
                  </span>
                  <span data-t="h5" className={s.pagerTitle}>
                    {next.title}
                  </span>
                  <IconCircle size="social" className={s.pagerIcon} />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </footer>

      <CtaBlock />
    </>
  );
}
