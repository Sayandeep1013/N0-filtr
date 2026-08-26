import { RevealText } from '@/components/ui/RevealText';
import { Button } from '@/components/ui/Button';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { ServicesAccordion } from '@/components/services/ServicesAccordion';
import { CultureCollage } from '@/components/motion/CultureCollage';
import { Schematic } from '@/components/ui/Schematic';
import { BlogCard } from '@/components/blog/BlogCard';
import { FEATURED_POSTS } from '@/lib/content/posts';
import { SERVICES_INTRO, CULTURE, BLOG_ROW } from '@/lib/content/site';
import s from './HomeLower.module.css';

/**
 * Everything below the works grid. `30-page-specs.md` §3–§6.
 *
 * Four sections in one file because they share nothing but their order, and
 * four one-section files would each be a wrapper around a single component.
 * Each has its own section element and its own vertical rhythm — this site does
 * not have one `--section-y` that every section obeys, and asserting one would
 * be inventing a system tonik do not have. Their measured offsets:
 *
 *     services   8541 → 9443    (902px)
 *     cta        9443 → 9813    (370px)
 *     culture    9813 → 11594   (1781px)
 *     blogs      11594 → 12226  (632px)
 *
 * The services section leads with a `<RevealText>` — §3 gives it the same
 * scrubbed word reveal the works heading has, in the same 2rem/2.5rem step
 * theirs uses (I-031), sitting in the `1fr 10fr 1fr` grid their `services_grid`
 * carries rather than the works section's `4fr 7fr 1fr`.
 */
export function HomeLower() {
  return (
    <>
      {/* ── services ─────────────────────────────────────────────────────── */}
      <section className={s.services} data-services>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.servicesGrid}>
              <p className={s.label} data-t="label">
                {SERVICES_INTRO.label}
              </p>
              <RevealText as="p" scale="h3" id="services" className={s.servicesLead}>
                {SERVICES_INTRO.lead}
              </RevealText>
            </div>
          </div>
        </div>

        {/* Full-bleed. The accordion's rows carry their own gutter so an open
            row's `--grey-900` ground reaches the viewport edges — a coloured
            row that stops at an 80rem container reads as a card, not a row. */}
        <div className={s.accordionWrap}>
          <ServicesAccordion />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={s.cta}>
        <div className="padding-global">
          <div className="container-large">
            <CtaBlock />
          </div>
        </div>
      </section>

      {/* ── culture ──────────────────────────────────────────────────────── */}
      <section className={s.culture} data-culture>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.cultureHead}>
              <div className={s.cultureLeft}>
                <p className={s.label} data-t="label">
                  {CULTURE.label}
                </p>
                <Schematic className={s.schematic} />
              </div>
              <div className={s.cultureCopy}>
                <p className={s.cultureHeading} data-t="h3">
                  {CULTURE.heading}
                </p>
                <RevealText as="p" scale="p-big" className={s.cultureLead}>
                  {CULTURE.lead}
                </RevealText>
              </div>
            </div>

            <CultureCollage />
          </div>
        </div>
      </section>

      {/* ── blog row ─────────────────────────────────────────────────────── */}
      <section className={s.blog} data-blog-row>
        <div className="padding-global">
          <div className="container-large">
            <div className={s.blogHead}>
              <p className={s.label} data-t="label">
                {BLOG_ROW.label}
              </p>
              <Button href="/blog">{BLOG_ROW.link}</Button>
            </div>

            {/* §7's `blogs_cms-list` is `4fr 4fr 4fr` on the 1.25rem gap —
                three equal twelfths-thirds, measured off their live DOM. */}
            <div className={s.blogRow}>
              {FEATURED_POSTS.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
