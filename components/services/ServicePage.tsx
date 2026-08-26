import type { Service } from '@/lib/content/services';
import type { Work } from '@/content/works/_types';
import { SERVICES_FULL } from '@/lib/content/services';
import { INDUSTRIES } from '@/lib/content/works';
import { ServiceNav } from '@/components/chrome/ServiceNav';
import { SpecTable, type SpecRow } from '@/components/ui/SpecTable';
import { FaqAccordion } from './FaqAccordion';
import { WorksGrid } from '@/components/works/WorksGrid';
import { Button } from '@/components/ui/Button';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { BlogRow } from '@/components/blog/BlogRow';
import s from './ServicePage.module.css';

/**
 * `/services/[slug]`. `30-page-specs.md` §`/services/[slug]`, target ~5,330px.
 *
 * ```
 * ├ <ServiceNav />     5 numbered items + industry filter
 * ├ .svc-hero          left 7/12: h1 + lead + "LET'S TALK" · right 4/12: SpecTable
 * ├ .svc-works         <WorksGrid> filtered to this service
 * ├ .svc-faq           left 5/12: "More about {service}" · right 7/12: <FaqAccordion>
 * ├ <CtaBlock />
 * └ blog row
 * ```
 *
 * ── The spec table's five rows, and the two that are claims ──────────────
 *
 * §`/services/[slug]` names them: SKILLS · DELIVERABLES · INDUSTRIES WE WORK IN
 * · PROJECTS SHIPPED · TEAM SIZE. The first three come straight off the content.
 *
 * The last two are **facts about the studio**, and they are derived rather than
 * typed: PROJECTS SHIPPED counts the works that actually carry this service, so
 * it cannot drift from the grid immediately below it, and TEAM SIZE is one
 * constant in `lib/content/site.ts`. A number in a table that disagrees with the
 * twelve cards under it is worse than no number.
 *
 * ── `branding` has no supporting work, and the page says so ──────────────
 *
 * `01-PHASES.md`'s acceptance criterion for this phase: *"The `branding` page
 * handles its empty works grid gracefully."* It does not have one — no work in
 * the repository lists Branding as a service — so the grid falls back to
 * selected work across the studio, under a heading that says that is what it is.
 * Pretending otherwise would be the one thing this site is named after not
 * doing.
 */

/** §17's items, in `index` order. One list, every service page. */
const NAV_ITEMS = [...SERVICES_FULL]
  .sort((a, b) => a.index - b.index)
  .map((service) => ({ label: service.name, href: `/services/${service.slug}` }));

export function ServicePage({
  service,
  works,
  fallbackWorks,
  teamSize,
}: {
  service: Service;
  /** Every work carrying this service, in reading order. */
  works: Work[];
  /** Shown instead when a service has none of its own. See the note above. */
  fallbackWorks: Work[];
  teamSize: string;
}) {
  const hasOwnWork = works.length > 0;
  const shown = hasOwnWork ? works : fallbackWorks;

  const rows: SpecRow[] = [
    { key: 'Skills', value: service.output.slice(0, 4) },
    { key: 'Deliverables', value: service.output.slice(4) },
    { key: 'Industries we work in', value: INDUSTRIES },
    /* Derived, so it cannot disagree with the grid below. */
    { key: 'Projects shipped', value: [String(works.length).padStart(2, '0')] },
    { key: 'Team size', value: [teamSize] },
  ].filter((row) => row.value.length > 0);

  return (
    <>
      <ServiceNav items={NAV_ITEMS} activeHref={`/services/${service.slug}`} />

      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.heroGrid}>
              <div className={s.heroCopy}>
                <h1 data-t="h2" className={s.title}>
                  {service.headline}
                </h1>
                <p data-t="p" className={s.lead}>
                  {service.lead}
                </p>
                {service.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} data-t="p" className={s.body}>
                    {paragraph}
                  </p>
                ))}
                {/* `contact` rather than an href: the contact panel is a panel,
                    and §3 opens it on any `[data-contact]` click. */}
                <Button contact className={s.cta}>
                  Let&rsquo;s talk
                </Button>
              </div>
              <SpecTable rows={rows} className={s.table} />
            </div>
          </div>
        </div>
      </header>

      <section className={s.works} aria-labelledby="svc-works-heading">
        <div className="padding-global">
          <div className="container-large">
            <h2 id="svc-works-heading" data-t="label" className={s.sectionLabel}>
              {hasOwnWork ? `${service.name} — selected work` : 'Selected work across the studio'}
            </h2>
            {hasOwnWork ? null : (
              /* See the note above. The honest version of an empty facet — said
                 once, in a sentence, rather than by showing an empty box. */
              <p data-t="p" className={s.empty}>
                Nothing in the twelve lists {service.name.toLowerCase()} as its lead service yet.
                It shows up inside the others rather than on its own, so the work below is the
                studio&rsquo;s rather than this page&rsquo;s.
              </p>
            )}
            <WorksGrid works={shown} />
          </div>
        </div>
      </section>

      <section className={s.faq} aria-labelledby="svc-faq-heading">
        <div className="padding-global">
          <div className="container-large">
            <div className={s.faqGrid}>
              <h2 id="svc-faq-heading" data-t="h2" className={s.faqTitle}>
                More about {service.name.toLowerCase()}
              </h2>
              <FaqAccordion items={service.faq} className={s.faqList} />
            </div>
          </div>
        </div>
      </section>

      <CtaBlock />
      <BlogRow />
    </>
  );
}
