import type { Metadata } from 'next';
import { INDUSTRIES, WORKS } from '@/lib/content/works';
import { SITE, WORKS_INDEX } from '@/lib/content/site';
import { WorksIndex } from '@/components/works/WorksIndex';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { BlogRow } from '@/components/blog/BlogRow';

/**
 * `/works`. `01-PHASES.md` T7.7.
 *
 * A server component that hands the twelve works and the industry list to a
 * client shell, because the facet is client-side and the content is not. The
 * works are sorted here rather than in the component: reading order is a
 * property of the content (`40-content-model.md` §2's `#` column), and a
 * component that sorts is a component that can disagree with the grid's own
 * placement map.
 */
export const metadata: Metadata = {
  title: `Work — ${SITE.name}`,
  description: WORKS_INDEX.lead,
};

export default function WorksPage() {
  const ordered = [...WORKS].sort((a, b) => a.order - b.order);

  return (
    <>
      <WorksIndex
        works={ordered}
        industries={INDUSTRIES}
        heading={WORKS_INDEX.heading}
        lead={WORKS_INDEX.lead}
      />
      <CtaBlock />
      <BlogRow />
    </>
  );
}
