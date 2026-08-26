import type { Browser, Page } from 'playwright';
import { newPage, waitForLoaderGone } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { CASE } from './behaviour.config';

/**
 * Phase 6's behaviour checks: the case study.
 *
 * `01-PHASES.md`'s acceptance criteria for this phase are three claims, and not
 * one of them is a fact about a timeline's shape:
 *
 *   "`--accent` drives nav, overlays, tints"
 *       — a fact about a custom property on `<html>`, and about it being
 *         *removed* again, which is the half that breaks silently
 *   "Cursor is a ±50px drifting object, **not** a 1:1 pointer follower"
 *       — the one assertion that separates this component from the naive
 *         version of itself, and the naive version looks fine in a screenshot
 *   "Escape, scrim and outside-click close it"
 *       — three handlers and a history entry
 *
 * Everything here drives the real page: it navigates, hovers, moves a pointer
 * across the viewport and presses Escape, then reads the DOM back.
 *
* ── Why the navigation check clicks rather than navigates ────────────────
 *
 * `page.goto` exercises a cold load, which is not what a visitor does and not
 * where the bug was. I-050 only appears on a **soft** navigation, because it is
 * Lenis writing a stale scroll position over the one the router just set — and a
 * fresh document has no stale position to write. So the check scrolls to a card,
 * clicks it, and reads where it landed.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/** Scroll past Lenis rather than through it. See I-045 on the truthiness trap. */
async function scrollTo(page: Page, y: number, settle = 700): Promise<void> {
  await page.evaluate((target) => {
    const raw = (window as unknown as { lenis?: { scrollTo?: unknown } }).lenis;
    const lenis =
      raw && typeof raw.scrollTo === 'function'
        ? (raw as { scrollTo(v: number, o?: object): void })
        : null;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, y);
  await page.waitForTimeout(settle);
}

async function scrollToSelector(page: Page, selector: string): Promise<void> {
  const y = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.round(rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2);
  }, selector);
  await scrollTo(page, Math.max(0, y));
}

/* ── 1. accent theming, and its cleanup ──────────────────────────────────── */

async function checkAccent(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.accent;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);

    const set = await page.evaluate(() => {
      const style = document.documentElement.style;
      return {
        accent: style.getPropertyValue('--accent').trim(),
        ink: style.getPropertyValue('--accent-ink').trim(),
        ground: style.getPropertyValue('--accent-ground').trim(),
        fills: document.querySelectorAll('[data-accent-fill]').length,
      };
    });

    out.push(
      set.accent.toLowerCase() === c.dark.toLowerCase()
        ? pass(`case accent: --accent is ${c.dark}`, set.accent)
        : fail('case accent: --accent', c.dark, set.accent || '(unset)'),
    );
    out.push(
      set.ink.toLowerCase() === c.light.toLowerCase()
        ? pass(`case accent: --accent-ink is ${c.light} (I-046)`, set.ink)
        : fail('case accent: --accent-ink', c.light, set.ink || '(unset)'),
    );
    out.push(
      set.ground.toLowerCase() === c.light.toLowerCase()
        ? pass(`case accent: --accent-ground is ${c.light}`, set.ground)
        : fail('case accent: --accent-ground', c.light, set.ground || '(unset)'),
    );
    /* The crossfade needs something to crossfade. An accent theme with no fill
       target is a theme that sets three variables and animates nothing, which
       is exactly what this looked like before the hero's rule became an
       element — and nothing would have reported it. */
    out.push(
      set.fills >= 1
        ? pass(`case accent: ${set.fills} [data-accent-fill] target(s) for the .7s crossfade`)
        : fail('case accent: crossfade target', '>= 1 [data-accent-fill]', '0'),
    );

    /* The half that breaks silently. `--accent` lives on <html>, which outlives
       the route — leaving it set means the homepage inherits this work's blue on
       every element that reads the token. */
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    const cleared = await page.evaluate(() => ({
      accent: document.documentElement.style.getPropertyValue('--accent').trim(),
      ink: document.documentElement.style.getPropertyValue('--accent-ink').trim(),
    }));
    out.push(
      cleared.accent === '' && cleared.ink === ''
        ? pass('case accent: removed from <html> on leaving the page')
        : fail(
            'case accent: removed on unmount',
            'both unset',
            `--accent "${cleared.accent}", --accent-ink "${cleared.ink}"`,
          ),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 2. the cursor is a drifting object, not a follower ──────────────────── */

async function checkCursor(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.cursor;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    await scrollToSelector(page, '[data-cursor]');

    const tile = await page.evaluate(() => {
      const el = document.querySelector('[data-cursor]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!tile) {
      out.push(fail('case cursor: a [data-cursor] target exists', '>= 1', '0'));
      return out;
    }

    await page.mouse.move(tile.x, tile.y);
    await page.waitForTimeout(c.settle);

    const shown = await page.evaluate(() => {
      const root = document.querySelector('[data-custom-cursor]');
      const wrap = root?.firstElementChild;
      if (!root || !wrap) return null;
      const cs = getComputedStyle(wrap);
      const r = root.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(cs.transform);
      return { x: r.x, y: r.y, scale: m.a, opacity: Number(cs.opacity) };
    });

    if (!shown) {
      out.push(fail('case cursor: mounted', '[data-custom-cursor]', 'missing'));
      return out;
    }

    /* a-10: scale 0→1, opacity 0→1. Read after the settle rather than sampled,
       because the shape of the tween is `verify:motion`'s job and whether the
       handler is wired at all is this one's. */
    out.push(
      near(shown.scale, 1, 0.02) && shown.opacity > 0.9
        ? pass('case cursor: scales in over media [a-10]', `scale ${shown.scale.toFixed(2)}`)
        : fail('case cursor: scales in over media', 'scale 1, opacity 1', `scale ${shown.scale.toFixed(2)}, opacity ${shown.opacity}`),
    );

    /* a-14, and the acceptance criterion. Move the pointer to the far corner of
       the viewport. A 1:1 follower travels the whole distance; a ±50px drifting
       object cannot move more than 100px on either axis however far the pointer
       goes, and the element also has to have moved *something* or it is not
       tracking at all. */
    await page.mouse.move(c.far.x, c.far.y, { steps: 12 });
    await page.waitForTimeout(c.settle);
    const moved = await page.evaluate(() => {
      const r = document.querySelector('[data-custom-cursor]')!.getBoundingClientRect();
      return { x: r.x, y: r.y };
    });

    const dx = Math.abs(moved.x - shown.x);
    const dy = Math.abs(moved.y - shown.y);
    const pointerTravel = Math.abs(c.far.x - tile.x);

    out.push(
      dx <= c.driftMax && dy <= c.driftMax
        ? pass(
            `case cursor: drifts, does not follow [a-14] — moved ${Math.round(dx)}×${Math.round(dy)}px while the pointer moved ${Math.round(pointerTravel)}px`,
          )
        : fail(
            'case cursor: ±50px drift, not 1:1 tracking',
            `<= ${c.driftMax}px on each axis`,
            `${Math.round(dx)}×${Math.round(dy)}px`,
          ),
    );
    out.push(
      dx + dy > c.driftMin
        ? pass('case cursor: is tracking at all', `${Math.round(dx + dy)}px combined`)
        : fail('case cursor: tracking', `> ${c.driftMin}px combined`, `${Math.round(dx + dy)}px`),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 3. the cursor is gated ──────────────────────────────────────────────── */

async function checkCursorGate(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.cursor;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.mobileViewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    const display = await page.evaluate(() => {
      const el = document.querySelector('[data-custom-cursor]');
      return el ? getComputedStyle(el).display : 'absent';
    });
    out.push(
      display === 'none' || display === 'absent'
        ? pass(`case cursor: off at ${c.mobileViewport.w} (${display})`)
        : fail(`case cursor: off at ${c.mobileViewport.w}`, 'display none', display),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 4. a card goes to the page, and lands at the top of it ─────────────── */

async function checkNavigation(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.navigation;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    await scrollToSelector(page, c.cardSelector);
    const from = await page.evaluate(() => Math.round(window.scrollY));

    await page.click(c.cardSelector);
    await page.waitForTimeout(c.settle);

    const landed = await page.evaluate(() => ({
      url: location.pathname,
      /* **Visible** dialogs. The contact panel and the showreel are both
         `role="dialog"` and both live in the root layout at `display: none`
         whether or not they are open — counting them found one on a page with
         no drawer on it, which is a check reporting on the wrong thing. */
      dialog: [...document.querySelectorAll('[role="dialog"]')].filter(
        (d) => getComputedStyle(d).display !== 'none',
      ).length,
      h1: document.querySelector('h1')?.textContent ?? '',
      scrollY: Math.round(window.scrollY),
    }));

    out.push(
      landed.url === c.href
        ? pass(`case nav: a card goes to ${c.href}`, landed.url)
        : fail('case nav: a card navigates', c.href, landed.url),
    );
    /* D-037 deleted the drawer. This stays as a guard: the parallel route was
       almost invisible in a diff and is very easy to reintroduce by accident. */
    out.push(
      landed.dialog === 0
        ? pass('case nav: no drawer over the page it just navigated to (D-037)')
        : fail('case nav: no modal drawer', '0 dialogs', String(landed.dialog)),
    );
    out.push(
      landed.h1.length > 0
        ? pass(`case nav: the page renders its own title ("${landed.h1}")`)
        : fail('case nav: the case study renders', 'an h1', '(none)'),
    );
    /* I-050. Lenis holds its own scroll and writes it back over whatever the
       router set, so leaving a scrolled page used to land you at the same
       offset on the next one — the footer, in practice. */
    out.push(
      landed.scrollY <= c.topTolerance
        ? pass(
            `case nav: lands at the top, not where you left (I-050) — ${landed.scrollY}px, left from ${from}px`,
          )
        : fail(
            'case nav: lands at the top of the new page',
            `<= ${c.topTolerance}px`,
            `${landed.scrollY}px (left the previous page at ${from}px)`,
          ),
    );

    /* And the other direction: back must restore, not reset. */
    await page.goBack();
    await page.waitForTimeout(c.settle);
    const back = await page.evaluate(() => ({
      url: location.pathname,
      scrollY: Math.round(window.scrollY),
    }));
    out.push(
      back.url === '/' && Math.abs(back.scrollY - from) <= c.restoreTolerance
        ? pass(`case nav: back restores the grid position — ${back.scrollY}px against ${from}px`)
        : fail(
            'case nav: back restores the scroll position',
            `/ at ~${from}px`,
            `${back.url} at ${back.scrollY}px`,
          ),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 5. the loader tints before it navigates ─────────────────────────────── */

async function checkLoaderTint(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.loaderTint;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    await scrollToSelector(page, c.linkSelector);

    /* The tint exists so the colour lands *during* the sweep, so a check that
       waits for the next page has measured nothing — and the loader clears the
       tint on arrival, so by then it is gone either way.

       A MutationObserver rather than a read, because the window is one exit
       timeline wide. Set up first, then a real Playwright click: a synthetic
       `element.click()` would work too, but the bug this check exists to catch
       was about *event phases*, and only a trusted click exercises those the way
       a visitor does. */
    await page.evaluate(() => {
      const mark = document.querySelector('.loader__mark') as HTMLElement | null;
      const seen: string[] = [];
      (window as unknown as { __tints: string[] }).__tints = seen;
      if (!mark) return;
      new MutationObserver(() => {
        if (mark.style.color) seen.push(mark.style.color);
      }).observe(mark, { attributes: true, attributeFilter: ['style'] });
    });

    const accent = await page.evaluate(
      (sel) => (document.querySelector(sel) as HTMLAnchorElement | null)?.dataset.accentInk ?? '',
      c.linkSelector,
    );
    await page.click(c.linkSelector);
    await page.waitForTimeout(400);

    const tint = {
      accent,
      background:
        (await page.evaluate(() => (window as unknown as { __tints: string[] }).__tints[0] ?? ''))
        || '',
    };

    out.push(
      tint.accent !== ''
        ? pass(`loader tint: the link declares data-accent-ink (${tint.accent})`)
        : fail('loader tint: data-accent-ink on the link', 'a hex', '(absent)'),
    );
    out.push(
      tint.background !== ''
        ? pass(`loader tint: the glyph tints before navigating [T6.7] (${tint.background})`)
        : fail('loader tint: glyph colour set on click', 'darken(accent-ink, 10%)', '(unset)'),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 6. the block rhythm, across every work ──────────────────────────────── */

async function checkBlockRhythm(): Promise<CheckResult[]> {
  const { WORKS } = await import('../../lib/content/works');
  const { bodyFor } = await import('../../content/works/bodies');
  const { longestProseRun } = await import('../../lib/content/blocks');

  /* Bodies come from `content/works/bodies`, not from the work — I-061 moved
     them so that eleven page types stop bundling prose they never render. */
  const offenders = WORKS.filter((w) => longestProseRun(bodyFor(w.slug)) > CASE.maxProseRun).map(
    (w) => `${w.slug} (${longestProseRun(bodyFor(w.slug))})`,
  );

  return [
    offenders.length === 0
      ? pass(
          `case rhythm: no work runs more than ${CASE.maxProseRun} prose blocks without a visual (§2)`,
        )
      : fail(
          `case rhythm: ≤ ${CASE.maxProseRun} consecutive prose blocks (§2)`,
          'none over',
          offenders.join(', '),
        ),
  ];
}

export async function checkCaseStudy(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await checkBlockRhythm()),
    ...(await checkAccent(browser, baseUrl)),
    ...(await checkCursor(browser, baseUrl)),
    ...(await checkCursorGate(browser, baseUrl)),
    ...(await checkNavigation(browser, baseUrl)),
    ...(await checkLoaderTint(browser, baseUrl)),
  ];
}
