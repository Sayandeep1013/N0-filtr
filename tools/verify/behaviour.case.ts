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
 *       — no longer true, and deliberately. D-048 made it track the pointer,
 *         because D-046 hid the native one and a replacement that is not at the
 *         pointer is broken rather than stylish. What is asserted now is the
 *         thing that was actually wrong: where it appears when you enter
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

/* ── 2. the cursor is at the pointer, and has weight ─────────────────────── */

async function checkCursor(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = CASE.cursor;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForLoaderGone(page);
    await scrollToSelector(page, '[data-cursor]');

    const box = await page.evaluate(() => {
      const el = document.querySelector('[data-cursor]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });
    if (!box) {
      out.push(fail('case cursor: a [data-cursor] target exists', '>= 1', '0'));
      return out;
    }

    /** The disc's centre, in viewport coordinates. */
    const disc = () =>
      page.evaluate(() => {
        const root = document.querySelector('[data-custom-cursor]');
        const wrap = root?.firstElementChild;
        if (!root || !wrap) return null;
        const r = wrap.getBoundingClientRect();
        const cs = getComputedStyle(wrap);
        return {
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          scale: new DOMMatrixReadOnly(cs.transform).a,
          opacity: Number(cs.opacity),
        };
      });

    /* Sayandeep's exact scenario: cross the **right** edge, mid-height. The
       old implementation put the disc at the centre of the card, which is what
       made it feel wrong — so entry position is the assertion, not a detail. */
    const entry = { x: box.x + box.w - 6, y: box.y + Math.round(box.h / 2) };
    await page.mouse.move(entry.x - 240, entry.y);
    await page.mouse.move(entry.x, entry.y);
    await page.waitForTimeout(c.snapSettle);

    const shown = await disc();
    if (!shown) {
      out.push(fail('case cursor: mounted', '[data-custom-cursor]', 'missing'));
      return out;
    }

    /* a-10: it arrives. Read **after** the scale tween rather than with the
       position, because the two happen on different clocks — the snap is one
       frame and the scale is 500ms, and reading both at 140ms reported a disc
       at 0.18 as a failure when it was simply still growing. */
    await page.waitForTimeout(c.scaleSettle);
    const grown = await disc();
    out.push(
      grown && near(grown.scale, 1, 0.05) && grown.opacity > 0.9
        ? pass('case cursor: scales in over media [a-10]', `scale ${grown.scale.toFixed(2)}`)
        : fail(
            'case cursor: scales in over media',
            'scale 1, opacity 1',
            grown ? `scale ${grown.scale.toFixed(2)}, opacity ${grown.opacity}` : 'gone',
          ),
    );

    /* D-048, and the whole reason this component was rewritten: the disc has to
       appear **where the pointer already is**, not where the element is. */
    const entryOffset = Math.hypot(shown.x - entry.x, shown.y - entry.y);
    out.push(
      entryOffset <= c.snapTolerance
        ? pass(`case cursor: appears at the pointer, not the centre (D-048) — ${Math.round(entryOffset)}px off`)
        : fail(
            'case cursor: appears at the pointer on entry',
            `<= ${c.snapTolerance}px from where the pointer crossed`,
            `${Math.round(entryOffset)}px`,
          ),
    );

    /* It tracks: cross the card and let it settle on the pointer. */
    const dest = { x: box.x + 60, y: box.y + 40 };
    for (let i = 1; i <= 20; i += 1) {
      await page.mouse.move(
        entry.x + ((dest.x - entry.x) / 20) * i,
        entry.y + ((dest.y - entry.y) / 20) * i,
      );
    }

    /* Read mid-flight, before the lerp has closed the gap. A disc pinned 1:1
       would be here already; the lag is what gives it weight. */
    const inFlight = await disc();
    const lag = inFlight ? Math.hypot(inFlight.x - dest.x, inFlight.y - dest.y) : 0;

    await page.waitForTimeout(c.trackSettle);
    const settled = await disc();
    const settledOffset = settled ? Math.hypot(settled.x - dest.x, settled.y - dest.y) : Infinity;

    out.push(
      settledOffset <= c.snapTolerance
        ? pass(`case cursor: settles on the pointer — ${Math.round(settledOffset)}px off`)
        : fail(
            'case cursor: settles on the pointer',
            `<= ${c.snapTolerance}px`,
            `${Math.round(settledOffset)}px`,
          ),
    );

    out.push(
      lag >= c.minLag
        ? pass(`case cursor: lags on a fast move, so it has weight — ${Math.round(lag)}px behind`)
        : fail(
            'case cursor: trails the pointer rather than being pinned to it',
            `>= ${c.minLag}px behind mid-move`,
            `${Math.round(lag)}px`,
          ),
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

    /* And the other direction. **Back goes to the top too** — D-053 — which is
       the opposite of what this asserted until Sayandeep asked for it: *"coming
       back and going new .. always sets the position at the top."* */
    await page.goBack();
    await page.waitForTimeout(c.settle);
    const back = await page.evaluate(() => ({
      url: location.pathname,
      scrollY: Math.round(window.scrollY),
    }));
    out.push(
      back.url === '/' && back.scrollY <= c.topTolerance
        ? pass(`case nav: back lands at the top too (D-053) — ${back.scrollY}px, left from ${from}px`)
        : fail(
            'case nav: back lands at the top',
            `/ at <= ${c.topTolerance}px`,
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
