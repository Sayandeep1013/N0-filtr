'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Work } from '@/content/works/_types';
import { ServiceNav } from '@/components/chrome/ServiceNav';
import { WorksGrid } from './WorksGrid';
import { refreshScrollTriggers } from '@/lib/motion/scrollRefresh';
import s from './WorksIndex.module.css';

/**
 * `/works`. `30-page-specs.md` §`/works`:
 *
 * ```
 * ├ <ServiceNav />        secondary nav + "FILTER BY INDUSTRY ▾"
 * ├ .works-hero           h1 "Selected work" + lead + count
 * ├ <WorksGrid full />    all 12, same parallax and hover mechanics
 * ├ <CtaBlock />
 * └ blog row
 * ```
 *
 * ── The filter, and the two things it has to remember to do ──────────────
 *
 * §`/works`: *"The industry filter is a client-side facet over
 * `work.industries`. Filtering re-runs `ScrollTrigger.refresh()` and re-arms the
 * reveal timelines (tonik does this with a `ResizeObserver` on the list — we use
 * a layout effect keyed on the filter value)."*
 *
 * **Refresh**, because removing eight cards changes the height of everything
 * below and every trigger on the page is still measured against the old one.
 * Through `refreshScrollTriggers()` rather than `ScrollTrigger.refresh()`
 * directly: the helper coalesces, and phase 5 learned what happens when several
 * components call it inside one commit.
 *
 * **Re-arm**, which the grid does for free here and it is worth saying why.
 * `<WorksGrid>`'s `useGSAP` is keyed on `works.length`, so a filter that changes
 * the count rebuilds its context — new cells, new cached metrics, new trigger.
 * A filter that changes *which* works are shown without changing how many would
 * not, which is why the key below is the filter value rather than the count.
 *
 * ── Why the grid is remounted rather than updated ────────────────────────
 *
 * `key={active ?? 'all'}` on the grid. The alternative is to let React reconcile
 * twelve cards down to four in place, which leaves `quickSetter` closures
 * pointing at elements that are no longer in the document and a cached `top` for
 * every one of them. Remounting is a handful of milliseconds and removes the
 * entire class of problem.
 */
export function WorksIndex({
  works,
  industries,
  heading,
  lead,
}: {
  works: Work[];
  industries: string[];
  heading: string;
  lead: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active ? works.filter((w) => w.industries.includes(active)) : works),
    [works, active],
  );

  /* Keyed on the filter value, not on the count: two industries can produce the
     same number of cards and still be a different grid. */
  useEffect(() => {
    refreshScrollTriggers();
  }, [active]);

  return (
    <>
      <ServiceNav
        filter={{
          label: 'Filter by industry',
          options: industries,
          value: active,
          onChange: setActive,
          allLabel: 'All industries',
        }}
      />

      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <h1 data-t="h1" className={s.title}>
              {heading}
            </h1>
            <div className={s.meta}>
              <p data-t="p-big" className={s.lead}>
                {lead}
              </p>
              {/* The count is derived, and it moves with the filter — a "12" that
                  stays 12 while four cards are on screen is worse than no count. */}
              <p data-t="label" className={s.count} aria-live="polite">
                {String(filtered.length).padStart(2, '0')}
                {active ? ` of ${String(works.length).padStart(2, '0')}` : ''}
                {' — '}
                {active ?? 'All industries'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className={`padding-global ${s.gridWrap}`}>
        <div className="container-large">
          {filtered.length > 0 ? (
            <WorksGrid key={active ?? 'all'} works={filtered} />
          ) : (
            /* Not reachable from the current content — every industry in the
               list came out of a work — but a facet that can produce an empty
               set should say so rather than render an empty box. Phase 7's
               `branding` service page has the same problem for real. */
            <p data-t="p" className={s.empty}>
              Nothing in {active} yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
