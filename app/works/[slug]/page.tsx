import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WORKS, workBySlug } from '@/lib/content/works';
import { SITE } from '@/lib/content/site';
import { CaseStudy } from '@/components/case/CaseStudy';
import { CaseHero } from '@/components/case/CaseHero';
import { CaseBlocks } from '@/components/case/CaseBlocks';
import { CaseFooter } from '@/components/case/CaseFooter';
import s from '@/components/case/CaseStudy.module.css';

/**
 * `/works/[slug]` — the case study. `30-page-specs.md`, `01-PHASES.md` phase 6.
 *
 * A **server** component, and everything it renders is one too except the thin
 * `<CaseStudy>` shell that owns the accent and the cursor. The blocks — images,
 * prose, a syntax-highlighted specimen — reach the browser as HTML with no
 * JavaScript attached to them. On a page that is mostly pictures and paragraphs
 * that is the difference between a case study and an application.
 *
 * ── Neighbours wrap ──────────────────────────────────────────────────────
 *
 * `next` and `previous` are computed in reading order and wrap at the ends, so
 * the twelfth work's "next" is the first. tonik's does the same; an inert arrow
 * at the end of a list is a dead end on the one page whose whole job is to send
 * the reader to another one.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return WORKS.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) return {};

  return {
    title: `${work.title} — ${SITE.name}`,
    description: work.summary,
    openGraph: {
      title: `${work.title} — ${SITE.name}`,
      description: work.summary,
      type: 'article',
      /* The poster if there is one; the site card otherwise. Empty for the four
         works with no live deploy — see `content/works/_types.ts`. */
      images: work.card.poster ? [{ url: work.card.poster }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) notFound();

  /* `at` is never -1 — `work` came out of `workBySlug` and `ordered` is the
     same array — but the non-null assertions are what tell TypeScript that an
     index into a modular ring is always in bounds. It cannot know that, and the
     alternative is a `?? work` fallback that would silently make a page its own
     next project if the reasoning above ever stopped holding. */
  const ordered = [...WORKS].sort((a, b) => a.order - b.order);
  const at = ordered.findIndex((w) => w.slug === work.slug);
  const next = ordered[(at + 1) % ordered.length]!;
  const previous = ordered[(at - 1 + ordered.length) % ordered.length]!;

  return (
    <CaseStudy work={work}>
      <CaseHero work={work} previous={previous} next={next} />

      {/* Not a <main> — the root layout already owns one and nesting a second
          gives the page two "main" landmarks, which is worse for a screen
          reader than having none. */}
      <div className={s.content}>
        <div className="padding-global">
          <div className="container-large">
            <CaseBlocks blocks={work.blocks} />
          </div>
        </div>
      </div>

      <CaseFooter work={work} next={next} />
    </CaseStudy>
  );
}
