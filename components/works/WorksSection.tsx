import { RevealText } from '@/components/ui/RevealText';
import { WORKS_INTRO } from '@/lib/content/site';
import s from './WorksSection.module.css';

/**
 * The homepage's works section. `30-page-specs.md` §2.
 *
 * **Phase 3 builds the header only.** The twelve-card grid, its three hover
 * layers and its differential parallax are phase 4's, and they go where the
 * comment says. The header is here because §2's heading is the site's first
 * `<RevealText>`, and a reveal cannot be judged — or verified — without
 * something to scroll past.
 *
 * ── The grid, which is theirs and was not guessed ──────────────────────────
 *
 * `.header` is `4fr 7fr 1fr` on a 1.25rem gap, with the heading in the middle
 * track. That is `home-projects_title-part` exactly, read out of their live DOM
 * by the extractor's §7 pass: their used track widths are 424.95px, 743.675px
 * and 106.25px at 1512, which are 4/12, 7/12 and 1/12 of what is left after the
 * gaps.
 *
 * It is deliberately **not** a 12-column grid with the heading at
 * `grid-column: 5 / 12`. That places the heading in the same spot — 543.5px,
 * to two decimals — and makes it 759px wide instead of 744, because spanning
 * seven columns swallows six internal gaps that a single 7fr track does not
 * have. Same left edge, wrong measure. See I-032.
 */
export function WorksSection() {
  return (
    <section className={s.section} data-works>
      <div className="padding-global">
        <div className="container-large">
          <div className={s.header}>
            <RevealText as="h2" scale="h3" id="works" className={s.heading}>
              {WORKS_INTRO}
            </RevealText>
          </div>

          {/* Phase 4: <WorksGrid /> — 12 cards, two columns, differential
              parallax at −8% / −10%, then <LoadMoreButton>. */}
        </div>
      </div>
    </section>
  );
}
