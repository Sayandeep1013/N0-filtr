import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INDUSTRIES_FULL, industryBySlug, worksInIndustry } from '@/lib/content/industries';
import { SITE } from '@/lib/content/site';
import { ServiceNav } from '@/components/chrome/ServiceNav';
import { SpecTable, type SpecRow } from '@/components/ui/SpecTable';
import { WorksGrid } from '@/components/works/WorksGrid';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { BlogRow } from '@/components/blog/BlogRow';
import s from '@/components/services/ServicePage.module.css';

/**
 * `/industries/[slug]` ×5. `30-page-specs.md` §`/industries/[slug]`, T7.8.
 *
 * ```
 * ├ <ServiceNav variant="industry" />
 * ├ .ind-hero    h1 + lead + <SpecTable> (WHAT WE BUILD · TYPICAL STACK · EXAMPLES)
 * ├ <WorksGrid /> filtered to this industry
 * ├ <CtaBlock />
 * └ blog row
 * ```
 *
 * It shares `ServicePage.module.css` rather than owning a near-identical sheet.
 * The two templates are the same shape — a nav, a 7/4 hero, a filtered grid, a
 * CTA and the blog row — and the spec describes them that way; the industry page
 * simply has no FAQ section. Two stylesheets that must agree are two stylesheets
 * that eventually do not.
 *
 * The spec's `variant="industry"` means the nav lists industries rather than
 * services. `<ServiceNav>` takes items instead of a variant, which is the same
 * thing said in a way that does not require the component to know what an
 * industry is.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES_FULL.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = industryBySlug(slug);
  if (!industry) return {};
  return {
    title: `${industry.name} — ${SITE.name}`,
    description: industry.lead,
  };
}

const NAV_ITEMS = INDUSTRIES_FULL.map((industry) => ({
  label: industry.name,
  href: `/industries/${industry.slug}`,
}));

export default async function IndustryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industryBySlug(slug);
  if (!industry) notFound();

  const works = worksInIndustry(industry);

  const rows: SpecRow[] = [
    { key: 'What we build', value: industry.build },
    { key: 'Typical stack', value: industry.stack },
    /* Derived, so it cannot disagree with the grid below it. */
    { key: 'Examples', value: works.map((work) => work.title) },
  ];

  return (
    <>
      <ServiceNav items={NAV_ITEMS} activeHref={`/industries/${industry.slug}`} />

      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.heroGrid}>
              <div className={s.heroCopy}>
                <h1 data-t="h2" className={s.title}>
                  {industry.headline}
                </h1>
                <p data-t="p" className={s.lead}>
                  {industry.lead}
                </p>
              </div>
              <SpecTable rows={rows} className={s.table} />
            </div>
          </div>
        </div>
      </header>

      <section className={s.works} aria-labelledby="ind-works-heading">
        <div className="padding-global">
          <div className="container-large">
            <h2 id="ind-works-heading" data-t="label" className={s.sectionLabel}>
              {industry.name} — selected work
            </h2>
            <WorksGrid works={works} />
          </div>
        </div>
      </section>

      <CtaBlock />
      <BlogRow />
    </>
  );
}
