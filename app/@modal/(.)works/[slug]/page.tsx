import { notFound } from 'next/navigation';
import { WORKS, workBySlug } from '@/lib/content/works';
import { CaseStudy } from '@/components/case/CaseStudy';
import { CaseHero } from '@/components/case/CaseHero';
import { CaseBlocks } from '@/components/case/CaseBlocks';
import { CaseFooter } from '@/components/case/CaseFooter';
import { WorkLightbox } from '@/components/case/WorkLightbox';
import s from '@/components/case/CaseStudy.module.css';

/**
 * The intercepted case study — the lightbox. `01-PHASES.md` T6.6,
 * `20-components-and-motion.md` §16.
 *
 * `(.)works/[slug]` intercepts soft navigations to a case study **from the root
 * level** — the homepage's works grid today, and `/works` when phase 7 builds
 * it. A hard load of the same URL falls through to `app/works/[slug]/page.tsx`
 * and renders the full page, which is why the same content is composed twice
 * here rather than shared through a component that would have to know which of
 * the two it was inside.
 *
 * It deliberately does **not** intercept `<NextWork>`: that link is rendered
 * from `/works/[slug]`, which is a level below the interceptor, so clicking it
 * is a real navigation with the loader sweep and the accent tint (T6.7). Moving
 * from one case study to another should feel like moving, not like the drawer
 * reloading itself.
 */
export default async function WorkLightboxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) notFound();

  const ordered = [...WORKS].sort((a, b) => a.order - b.order);
  const at = ordered.findIndex((w) => w.slug === work.slug);
  const next = ordered[(at + 1) % ordered.length]!;
  const previous = ordered[(at - 1 + ordered.length) % ordered.length]!;

  return (
    <WorkLightbox title={work.title}>
      <CaseStudy work={work}>
        <CaseHero work={work} previous={previous} next={next} />
        <div className={s.content}>
          <div className="padding-global">
            <div className="container-large">
              <CaseBlocks blocks={work.blocks} />
            </div>
          </div>
        </div>
        <CaseFooter work={work} next={next} />
      </CaseStudy>
    </WorkLightbox>
  );
}
