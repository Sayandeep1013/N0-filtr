import { RevealText } from '@/components/ui/RevealText';
import { Button } from '@/components/ui/Button';
import { Schematic } from '@/components/ui/Schematic';
import { WORKS_INTRO } from '@/lib/content/site';
import { WORKS } from '@/lib/content/works';
import { WorksGrid } from './WorksGrid';
import s from './WorksSection.module.css';

/**
 * The homepage's works section. `30-page-specs.md` §2.
 *
 * The header arrived in phase 3, because §2's heading is the site's first
 * `<RevealText>` and a reveal cannot be judged — or verified — without
 * something to scroll past. Phase 4 filled the grid under it.
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
            {/* The 4/12 track their `home-projects_title-part` leaves empty.
                It is the emptiest column on the page and the one place a figure
                can sit without competing with anything. */}
            <Schematic className={s.schematic} timelineId="schematic.draw" />

            <RevealText as="h2" scale="h3" id="works" className={s.heading}>
              {WORKS_INTRO}
            </RevealText>
          </div>

          <div className={s.grid}>
            <WorksGrid works={WORKS} />
          </div>

          {/* §2's "SEE ALL WORK". §21.4 gives their load-more button three
              media layers tracking the cursor at different depths; we have no
              media for them until phase 10, so this is the plain pill for now.
              I-038. */}
          <div className={s.more}>
            <Button href="/works">See all work</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
