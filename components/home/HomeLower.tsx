import { RevealText } from '@/components/ui/RevealText';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { ServicesAccordion } from '@/components/services/ServicesAccordion';
import { CultureCollage } from '@/components/motion/CultureCollage';
import { Schematic } from '@/components/ui/Schematic';
import { BlogRow } from '@/components/blog/BlogRow';
import { SERVICES_INTRO, CULTURE } from '@/lib/content/site';
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
        {/* The right-hand half of the pair. Sayandeep asked for one on that side
            too, and a mirrored instance is the answer rather than a second
            figure: the two bracket the page and their draws run towards each
            other. Absolutely positioned against the section rather than placed
            in the grid — their `services_grid` is `1fr 10fr 1fr` and the third
            track is one twelfth, far too narrow to put anything in. */}
        <Schematic className={s.schematicRight} mirrored />
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

      {/* The blog row moved to `<BlogRow>` in phase 7 — `/works`, five
          service pages and five industry pages all close with it. */}
      <BlogRow />
    </>
  );
}
