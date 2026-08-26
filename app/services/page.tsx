import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICES_FULL } from '@/lib/content/services';
import { INDUSTRIES_FULL } from '@/lib/content/industries';
import { SITE, SERVICES_INTRO } from '@/lib/content/site';
import { IconCircle } from '@/components/ui/IconCircle';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { BlogRow } from '@/components/blog/BlogRow';
import s from './services.module.css';

/**
 * `/services`. **Not in `30-page-specs.md`**, and it exists because the navbar
 * links to it.
 *
 * The spec lists five `/services/[slug]` pages and no index, which is fine on
 * tonik because their nav points elsewhere. Ours has said SERVICES since phase
 * 1, and a nav item that 404s is worse than a page the spec did not anticipate.
 * Logged as I-054.
 *
 * A redirect to `/services/product-design` was the alternative and is worse: it
 * makes one of the five look canonical, and the back button then lands you where
 * you already are.
 *
 * The industries are listed here too. They are five real routes with no other
 * way in — reachable from the works filter in spirit and from nowhere in the
 * markup — and a section on this page is the honest home for them until phase 12
 * revisits the navigation.
 */
export const metadata: Metadata = {
  title: `Services — ${SITE.name}`,
  description: SERVICES_INTRO.lead,
};

export default function ServicesPage() {
  const ordered = [...SERVICES_FULL].sort((a, b) => a.index - b.index);

  return (
    <>
      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <h1 data-t="h1" className={s.title}>
              What we do
            </h1>
            <p data-t="p-big" className={s.lead}>
              {SERVICES_INTRO.lead}
            </p>
          </div>
        </div>
      </header>

      <section className={s.list} aria-label="Services">
        <div className="padding-global">
          <div className="container-large">
            <ul className={s.rows}>
              {ordered.map((service, i) => (
                <li key={service.slug} className={s.row}>
                  <Link href={`/services/${service.slug}`} className={s.link}>
                    {/* Generated, never authored — the same rule as §7 and §17. */}
                    <span data-t="label-sm" className={s.numeral}>
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span className={s.rowCopy}>
                      <span data-t="h3" className={s.rowTitle}>
                        {service.name}
                      </span>
                      <span data-t="p" className={s.rowLead}>
                        {service.headline}
                      </span>
                    </span>
                    <IconCircle size="social" className={s.icon} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={s.industries} aria-labelledby="industries-heading">
        <div className="padding-global">
          <div className="container-large">
            <h2 id="industries-heading" data-t="label" className={s.sectionLabel}>
              Industries we work in
            </h2>
            <ul className={s.chips}>
              {INDUSTRIES_FULL.map((industry) => (
                <li key={industry.slug}>
                  <Link href={`/industries/${industry.slug}`} className={s.chip} data-t="label">
                    {industry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBlock />
      <BlogRow />
    </>
  );
}
