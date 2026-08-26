import type { Browser, Page } from 'playwright';
import { newPage, waitForLoaderGone } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { BEHAVIOUR } from './behaviour.config';

/**
 * Phase 5's behaviour checks: the services accordion, the CTA, the blog row.
 *
 * The accordion's two timelines are **built per state and registered on the
 * transition**, not once on mount — a closed row has no open timeline, because
 * §6's open and close are different sequences rather than one timeline played
 * both ways. So they cannot be read from a resting page the way `loader.enter`
 * can, and `motion.config.ts` had them pending since phase 0 waiting for a
 * component that was never going to satisfy that shape.
 *
 * They are asserted here instead, by clicking the row and reading the timeline
 * that the click created. Same reasoning as the showreel in `behaviour.home.ts`.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

interface Shape {
  total: number;
  starts: number[];
  durations: number[];
}

async function readTimeline(page: Page, id: string): Promise<Shape | null> {
  return page.evaluate((timelineId) => {
    const tl = window.__TIMELINES__?.[timelineId];
    if (!tl) return null;
    const kids = tl.getChildren(false, true, true);
    return {
      total: +tl.totalDuration().toFixed(3),
      starts: kids.map((t) => +t.startTime().toFixed(3)),
      durations: kids.map((t) => +t.duration().toFixed(3)),
    };
  }, id);
}

function compare(
  out: CheckResult[],
  label: string,
  actual: Shape | null,
  expected: { total: number; starts: readonly number[]; durations: readonly number[] },
): void {
  if (!actual) {
    out.push(fail(`${label}: registered`, 'a timeline', 'not registered'));
    return;
  }
  out.push(
    near(actual.total, expected.total, 0.001)
      ? pass(`${label}: total`, `${actual.total}s`)
      : fail(`${label}: total`, `${expected.total}s`, `${actual.total}s`),
  );
  out.push(
    JSON.stringify(actual.durations) === JSON.stringify([...expected.durations])
      ? pass(`${label}: durations`, JSON.stringify(actual.durations))
      : fail(`${label}: durations`, JSON.stringify(expected.durations), JSON.stringify(actual.durations)),
  );
  out.push(
    JSON.stringify(actual.starts) === JSON.stringify([...expected.starts])
      ? pass(`${label}: positions resolve`, JSON.stringify(actual.starts))
      : fail(`${label}: positions resolve`, JSON.stringify(expected.starts), JSON.stringify(actual.starts)),
  );
}

async function scrollToSection(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const to = el.getBoundingClientRect().top + window.scrollY;
    /* `typeof …scrollTo === 'function'`, not just truthiness. Lenis sets
         `window.lenis = { version }` itself as a build stamp, so the property
         exists before — and in production, instead of — the real instance our
         MotionProvider puts there for this harness. A truthiness check passes
         on the stamp and then throws. See I-045. */
      const raw = (window as unknown as { lenis?: { scrollTo?: unknown } }).lenis;
      const lenis =
        raw && typeof raw.scrollTo === 'function'
          ? (raw as { scrollTo(v: number, o?: object): void })
          : null;
    if (lenis) lenis.scrollTo(to, { immediate: true, force: true });
    else window.scrollTo(0, to);
  }, selector);
  await page.waitForTimeout(700);
}

/* ── 1. the accordion, driven ────────────────────────────────────────────── */

async function checkAccordion(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.accordion;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await waitForLoaderGone(page);
    await page.waitForTimeout(1500);
    await scrollToSection(page, '[data-services]');

    const heads = page.locator(`${c.rowSelector} button`);
    const rowCount = await heads.count();
    out.push(
      rowCount === c.rowCount
        ? pass(`accordion: ${rowCount} rows`, String(rowCount))
        : fail('accordion: row count', String(c.rowCount), String(rowCount)),
    );

    /* Every row closed on arrival. §3: "5 rows, first closed by default." */
    const openOnLoad = await page.locator(`${c.rowSelector}[data-open="true"]`).count();
    out.push(
      openOnLoad === 0
        ? pass('accordion: every row closed on load')
        : fail('accordion: every row closed on load', '0 open', `${openOnLoad} open`),
    );

    await heads.first().click();
    await page.waitForTimeout(1800);

    compare(out, `accordion: ${c.openTimelineId}`, await readTimeline(page, c.openTimelineId), {
      total: c.openTotal,
      starts: c.openStarts,
      durations: c.openDurations,
    });

    const opened = await page.evaluate((sel) => {
      const row = document.querySelector<HTMLElement>(`${sel}[data-open="true"]`);
      if (!row) return null;
      const panel = row.querySelector<HTMLElement>('[data-service-panel]')!;
      const arrow = row.querySelector<HTMLElement>('button > span:last-of-type')!;
      const body = row.querySelector<HTMLElement>('[data-service-body]')!;
      return {
        rowBackground: getComputedStyle(row).backgroundColor,
        panelOpacity: +getComputedStyle(panel).opacity,
        panelTransform: getComputedStyle(panel).transform,
        arrowTransform: getComputedStyle(arrow).transform,
        bodyHeight: Math.round(body.getBoundingClientRect().height),
        expanded: row.querySelector('button')?.getAttribute('aria-expanded'),
      };
    }, c.rowSelector);

    if (!opened) {
      out.push(fail('accordion: a row opens', 'one row with data-open', 'none'));
    } else {
      out.push(
        opened.rowBackground === c.openGround
          ? pass('accordion: an open row takes #2e2e2e', opened.rowBackground)
          : fail('accordion: open row ground', c.openGround, opened.rowBackground),
      );
      out.push(
        /* §6's arrow rotates ↓ → →. `rotate(-90deg)` is matrix(0,-1,1,0,0,0). */
        opened.arrowTransform === c.arrowOpen
          ? pass('accordion: the arrow rotates to →', opened.arrowTransform)
          : fail('accordion: arrow rotation', c.arrowOpen, opened.arrowTransform),
      );
      out.push(
        near(opened.panelOpacity, 1, 0.02) && opened.panelTransform === 'matrix(1, 0, 0, 1, 0, 0)'
          ? pass('accordion: the inverted panel has slid fully in', opened.panelTransform)
          : fail(
              'accordion: the panel slides fully in',
              'opacity 1, no translate',
              `opacity ${opened.panelOpacity}, ${opened.panelTransform}`,
            ),
      );
      out.push(
        opened.bodyHeight > c.minBodyHeight
          ? pass('accordion: the body opens to its content', `${opened.bodyHeight}px`)
          : fail('accordion: body opens', `> ${c.minBodyHeight}px`, `${opened.bodyHeight}px`),
      );
      out.push(
        opened.expanded === 'true'
          ? pass('accordion: aria-expanded tracks the state', 'true')
          : fail('accordion: aria-expanded', 'true', String(opened.expanded)),
      );
    }

    /* §6/§3: opening one closes the other. */
    await heads.nth(1).click();
    await page.waitForTimeout(1800);
    const openCount = await page.locator(`${c.rowSelector}[data-open="true"]`).count();
    out.push(
      openCount === 1
        ? pass('accordion: opening one row closes the other', 'exactly 1 open')
        : fail('accordion: one open at a time', '1 open', `${openCount} open`),
    );

    /* Now close it and read the close sequence. */
    await heads.nth(1).click();
    await page.waitForTimeout(1900);

    compare(out, `accordion: ${c.closeTimelineId}`, await readTimeline(page, c.closeTimelineId), {
      total: c.closeTotal,
      starts: c.closeStarts,
      durations: c.closeDurations,
    });

    const closedHeight = await page.evaluate(
      (sel) =>
        Math.round(
          document.querySelector<HTMLElement>(`${sel} [data-service-body]`)!.getBoundingClientRect()
            .height,
        ),
      c.rowSelector,
    );
    out.push(
      closedHeight < 2
        ? pass('accordion: the body collapses to 0', `${closedHeight}px`)
        : fail('accordion: body collapses to 0', '0px', `${closedHeight}px`),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 2. ≤767 drops the x-slide entirely ─────────────────────────────────── */

async function checkAccordionMobile(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.accordion;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.mobile });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await waitForLoaderGone(page);
    await page.waitForTimeout(1500);
    await scrollToSection(page, '[data-services]');

    await page.locator(`${c.rowSelector} button`).first().click();
    await page.waitForTimeout(1800);

    const state = await page.evaluate((sel) => {
      const row = document.querySelector<HTMLElement>(`${sel}[data-open="true"]`);
      if (!row) return null;
      const panel = row.querySelector<HTMLElement>('[data-service-panel]')!;
      const body = row.querySelector<HTMLElement>('[data-service-body]')!;
      return {
        panelTransform: getComputedStyle(panel).transform,
        panelOpacity: +getComputedStyle(panel).opacity,
        bodyHeight: Math.round(body.getBoundingClientRect().height),
        columns: getComputedStyle(body.firstElementChild!).gridTemplateColumns.split(' ').length,
      };
    }, c.rowSelector);

    if (!state) {
      out.push(fail('accordion ≤767: a row opens', 'one row with data-open', 'none'));
      return out;
    }

    /* §6's ≤767 timeline animates height alone. A panel that still carries an
       x-translate is one that would slide a full-width element across a 390
       viewport — which is why §6 gives mobile its own sequence rather than a
       disabled tween. */
    out.push(
      state.panelTransform === 'none' || state.panelTransform === 'matrix(1, 0, 0, 1, 0, 0)'
        ? pass('accordion ≤767: no x-slide — height only, per §6', state.panelTransform)
        : fail('accordion ≤767: no x-slide', 'no translate', state.panelTransform),
    );
    out.push(
      state.columns === 1
        ? pass('accordion ≤767: the body is one column')
        : fail('accordion ≤767: one column', '1 track', `${state.columns} tracks`),
    );
    out.push(
      state.bodyHeight > c.minBodyHeight
        ? pass('accordion ≤767: the body still opens', `${state.bodyHeight}px`)
        : fail('accordion ≤767: body opens', `> ${c.minBodyHeight}px`, `${state.bodyHeight}px`),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 3. the CTA block is one real control ───────────────────────────────── */

async function checkCta(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.ctaBlock;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await waitForLoaderGone(page);
    await page.waitForTimeout(1500);

    const shape = await page.evaluate(() => {
      const cta = document.querySelector<HTMLElement>('[data-cta-block]');
      if (!cta) return null;
      const cs = getComputedStyle(cta);
      const box = cta.getBoundingClientRect();
      return {
        tag: cta.tagName,
        background: cs.backgroundColor,
        minHeight: cs.minHeight,
        height: Math.round(box.height),
        /* §10: "the whole block opens the contact panel". A nested button would
           make the arrow a second control inside the first — invalid, and it
           would swallow the click on exactly the element people aim at. */
        nestedButtons: cta.querySelectorAll('button, a').length,
        cursor: cs.cursor,
      };
    });

    if (!shape) {
      out.push(fail('cta: present', 'button[data-contact]', 'not found'));
      return out;
    }

    out.push(
      shape.tag === 'BUTTON'
        ? pass('cta: the whole block is one real button', shape.tag)
        : fail('cta: the whole block is a button', 'BUTTON', shape.tag),
    );
    out.push(
      shape.nestedButtons === 0
        ? pass('cta: no interactive element nested inside it', '0')
        : fail('cta: no nested controls', '0', String(shape.nestedButtons)),
    );
    out.push(
      shape.background === c.ground
        ? pass('cta: #2e2e2e ground', shape.background)
        : fail('cta: ground', c.ground, shape.background),
    );
    out.push(
      shape.height >= c.minHeightPx
        ? pass(`cta: at least 23rem tall`, `${shape.height}px`)
        : fail('cta: min-height 23rem', `>= ${c.minHeightPx}px`, `${shape.height}px`),
    );

    /* It has to actually open the panel — §3 listens for any [data-contact]. */
    await page.evaluate(() => {
      const cta = document.querySelector<HTMLElement>('[data-cta-block]');
      const to = (cta?.getBoundingClientRect().top ?? 0) + window.scrollY - 200;
      /* `typeof …scrollTo === 'function'`, not just truthiness. Lenis sets
         `window.lenis = { version }` itself as a build stamp, so the property
         exists before — and in production, instead of — the real instance our
         MotionProvider puts there for this harness. A truthiness check passes
         on the stamp and then throws. See I-045. */
      const raw = (window as unknown as { lenis?: { scrollTo?: unknown } }).lenis;
      const lenis =
        raw && typeof raw.scrollTo === 'function'
          ? (raw as { scrollTo(v: number, o?: object): void })
          : null;
      if (lenis) lenis.scrollTo(to, { immediate: true, force: true });
      else window.scrollTo(0, to);
    });
    await page.waitForTimeout(700);
    await page.locator('button[data-contact]').last().click();
    await page.waitForTimeout(1900);
    const panelOpen = await page.evaluate(
      () => +getComputedStyle(document.querySelector('.contact')!).opacity,
    );
    out.push(
      panelOpen > 0.9
        ? pass('cta: clicking the block opens the contact panel', String(panelOpen))
        : fail('cta: opens the contact panel', 'opacity > 0.9', String(panelOpen)),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 4. the culture wipe, and the blog row's shape ──────────────────────── */

async function checkCultureAndBlog(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.homeLower;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await waitForLoaderGone(page);
    await page.waitForTimeout(1500);

    const before = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-culture-overlay]')].map((el) =>
        Math.round(el.getBoundingClientRect().width),
      ),
    );
    out.push(
      before.length === c.cultureFrames
        ? pass(`culture: ${before.length} frames`, String(before.length))
        : fail('culture: frame count', String(c.cultureFrames), String(before.length)),
    );
    out.push(
      before.every((w) => w > 10)
        ? pass('culture: every frame starts covered')
        : fail('culture: frames start covered', 'all overlays at full width', JSON.stringify(before)),
    );

    await scrollToSection(page, '[data-culture]');
    await page.waitForTimeout(1800);

    const after = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-culture-overlay]')].map((el) =>
        Math.round(el.getBoundingClientRect().width),
      ),
    );
    out.push(
      after.some((w, i) => w < (before[i] ?? 0))
        ? pass('culture: the wipe uncovers on scroll', `${JSON.stringify(before)} → ${JSON.stringify(after)}`)
        : fail('culture: the wipe uncovers on scroll', 'narrower overlays', JSON.stringify(after)),
    );

    const blog = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>('[data-blog-row]');
      const cards = [...(row?.querySelectorAll<HTMLElement>('[data-blog-card]') ?? [])];
      const grid = cards[0]?.parentElement;
      return {
        count: cards.length,
        tracks: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
        tops: [...new Set(cards.map((el) => Math.round(el.getBoundingClientRect().top)))],
        bottoms: [...new Set(cards.map((el) => Math.round(el.getBoundingClientRect().bottom)))],
        background: cards[0] ? getComputedStyle(cards[0]).backgroundColor : '',
      };
    });

    out.push(
      blog.count === c.blogCards && blog.tracks === 3
        ? pass('blog row: three cards in three tracks')
        : fail('blog row: three cards', '3 cards, 3 tracks', `${blog.count} cards, ${blog.tracks} tracks`),
    );
    /* §19's `justify-content: space-between` on a fixed minimum is what makes a
       row line up. Three cards centred on their own content give three
       different baselines, and the row stops reading as a row. */
    out.push(
      blog.tops.length === 1 && blog.bottoms.length === 1
        ? pass('blog row: all three cards share a top and a bottom edge')
        : fail(
            'blog row: cards align',
            'one top, one bottom',
            `tops ${JSON.stringify(blog.tops)}, bottoms ${JSON.stringify(blog.bottoms)}`,
          ),
    );
    out.push(
      blog.background === c.blogGround
        ? pass('blog row: #3b3b3b card ground', blog.background)
        : fail('blog row: card ground', c.blogGround, blog.background),
    );
  } finally {
    await context.close();
  }
  return out;
}

export async function checkHomeLower(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await checkAccordion(browser, baseUrl)),
    ...(await checkAccordionMobile(browser, baseUrl)),
    ...(await checkCta(browser, baseUrl)),
    ...(await checkCultureAndBlog(browser, baseUrl)),
  ];
}
