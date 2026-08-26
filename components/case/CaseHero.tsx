import Link from 'next/link';
import type { Work } from '@/content/works/_types';
import { SpecTable, type SpecRow } from '@/components/ui/SpecTable';
import { CaseReel } from './CaseReel';
import s from './CaseHero.module.css';

/**
 * The case-study hero. `30-page-specs.md` §`/works/[slug]` section 1, ~1550px.
 *
 * ```
 * .cs__mini-nav   BACK TO WORK · slug · next →
 * h1              work title (--t-h1)
 * .cs__reel       full-bleed reel
 * .cs__info       2-up: lead paragraph (--t-p-big) | <SpecTable>
 * ```
 *
 * ── The spec table's five rows ───────────────────────────────────────────
 *
 * §1 names them: SERVICES · INDUSTRIES · TOOLS · HIGHLIGHT · LIVE. Four map
 * straight onto the schema. **HIGHLIGHT** does not, and the honest reading is
 * the work's `thesis` — the one-line constraint it breaks — because that is the
 * only field in the schema that is a claim rather than a list, and a table row
 * called HIGHLIGHT that repeated the services would be furniture.
 *
 * **LIVE** is the deploy's host, not its full URL: the row is 1fr wide and a
 * full Vercel URL wraps to three lines in it. The link itself is in the footer's
 * outcome rows, at a size worth clicking.
 *
 * ── Which ratio ──────────────────────────────────────────────────────────
 *
 * I-037 left this open: §8 writes `4fr 8fr` and tonik's live DOM computes
 * `1fr 1fr`, and phase 6 was told to measure the case-study hero rather than
 * inherit either. Measured here at 1512: the table sits in 4/12 of an 80rem
 * container — about 26rem — and at `4fr 8fr` the key column is 8.7rem, which is
 * narrower than the word INDUSTRIES at `--t-label`. It takes `even`, same as
 * the work card. §8's written ratio stays available and stays unused.
 */
export function CaseHero({
  work,
  previous,
  next,
}: {
  work: Work;
  previous: Work;
  next: Work;
}) {
  const rows: SpecRow[] = [
    { key: 'Services', value: work.services },
    { key: 'Industries', value: work.industries },
    { key: 'Tools', value: work.tools },
    { key: 'Highlight', value: [work.thesis] },
    { key: 'Live', value: [liveLabel(work)] },
  ];

  return (
    <header className={s.hero}>
      <div className="padding-global">
        <div className="container-large">
          {/* BACK TO WORK · slug · next →. A nav landmark because that is what
              it is, and because a case study is a page a keyboard visitor will
              want to leave by something other than the browser's back button. */}
          <nav className={s.miniNav} aria-label="Case study">
            <Link href="/works" data-t="label" className={s.miniLink}>
              ← Back to work
            </Link>
            <span data-t="label" className={s.slug} aria-hidden="true">
              {work.slug}
            </span>
            <Link
              href={`/works/${next.slug}`}
              data-t="label"
              className={s.miniLink}
              /* The previous work is reachable too, but only to a screen reader
                 and only as context — tonik's mini-nav is next-only and adding a
                 second visible link changes the composition. */
              aria-describedby={`cs-prev-${previous.slug}`}
            >
              Next: {next.title} →
            </Link>
            <span id={`cs-prev-${previous.slug}`} className="visually-hidden">
              Previous work is {previous.title}
            </span>
          </nav>

          <h1 data-t="h1" className={s.title}>
            {work.title}
          </h1>
        </div>
      </div>

      <div className={s.reelWrap}>
        <CaseReel
          reel={work.card.reel}
          poster={work.card.poster}
          art={work.card.art}
          alt={`${work.title} — ${work.summary}`}
        />
        {/* The accent's arrival. `10-design-system.md` §2 crossfades the
            accent-filled elements from `#212121` over `.7s` on mount, and this
            hairline is the one that carries it: full-bleed, one pixel, directly
            under the reel. `<CaseStudy>` finds it by the attribute rather than
            by a selector list, so a later block can opt in without that file
            learning about it. */}
        <span className={s.rule} data-accent-fill aria-hidden="true" />
      </div>

      <div className="padding-global">
        <div className="container-large">
          <div className={s.info}>
            <p data-t="p-big" className={s.lead}>
              {work.summary}
            </p>
            <SpecTable rows={rows} className={s.table} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** `https://tessera-brown-pi.vercel.app` → `tessera-brown-pi.vercel.app`. */
function liveLabel(work: Work): string {
  if (!work.links.live) return work.status === 'archived' ? 'Archived' : 'Not deployed';
  try {
    return new URL(work.links.live).host;
  } catch {
    return work.links.live;
  }
}
