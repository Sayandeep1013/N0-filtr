import type { Browser, Page } from 'playwright';
import { newPage } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { BEHAVIOUR } from './behaviour.config';

/**
 * Phase 3's behaviour checks: the showreel, the scrubbed reveal, the marquee.
 *
 * Split out of `behaviour.ts` the way `behaviour.hero.ts` was, and for the same
 * reason — these three drive the page hard (a Flip transition, a scroll sweep in
 * both directions, three viewport/preference combinations) and putting them
 * inline would bury the phase-1 checks they sit next to.
 *
 * What they have in common is that **none of them can be asserted from a
 * timeline's shape.** A Flip is a claim about where a node ended up. A scrub is
 * a claim about what happens on the way *back*. A gated marquee is a claim about
 * an animation that must not exist.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Shape of a registered timeline, read back out of the page. */
interface TimelineShape {
  total: number;
  starts: number[];
  durations: number[];
  eases: string[];
  repeat: number;
}

async function readTimeline(page: Page, id: string): Promise<TimelineShape | null> {
  return page.evaluate((timelineId) => {
    const tl = window.__TIMELINES__?.[timelineId];
    if (!tl) return null;
    const kids = tl.getChildren(false, true, true);
    return {
      total: +tl.totalDuration().toFixed(3),
      starts: kids.map((t) => +t.startTime().toFixed(3)),
      durations: kids.map((t) => +t.duration().toFixed(3)),
      eases: kids.map((t) => (typeof t.vars.ease === 'string' ? t.vars.ease : 'fn')),
      repeat: typeof tl.repeat === 'function' ? tl.repeat() : 0,
    };
  }, id);
}

async function boxOf(page: Page, selector: string): Promise<Box | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x * 100) / 100,
      y: Math.round(r.y * 100) / 100,
      w: Math.round(r.width * 100) / 100,
      h: Math.round(r.height * 100) / 100,
    };
  }, selector);
}

/* ── 1. the showreel: a Flip that must land, and come back ───────────────── */

async function checkShowreel(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.showreel;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);

    const trigger = await page.$(c.trigger);
    if (!trigger) {
      /* Not a failure. `<PlaySquare>` is deliberately inert while
         `SHOWREEL.src` is empty, and reporting that as a broken control would
         punish the honest branch. Say which state we are in and move on. */
      out.push(
        pass(
          'showreel: control is inert (no reel file configured)',
          'SHOWREEL.src and .srcWebm are both empty — <PlaySquare> renders as a span, per I-033',
        ),
      );
      return out;
    }

    const origin = await boxOf(page, c.flipTarget);
    if (!origin) {
      out.push(fail('showreel: Flip target exists', c.flipTarget, 'not found'));
      return out;
    }

    await trigger.click();
    await page.waitForTimeout(2200);

    /* (a) the reparent actually happened */
    const parentClass = await page.evaluate(
      (sel) => document.querySelector(sel)?.parentElement?.className ?? '',
      c.flipTarget,
    );
    out.push(
      parentClass.includes(c.destinationFragment)
        ? pass('showreel: background reparented into the player', parentClass)
        : fail(
            'showreel: background reparented into the player',
            `class containing "${c.destinationFragment}"`,
            parentClass || '(no parent)',
          ),
    );

    /* (b) it grew into a player rather than merely moving */
    const opened = await boxOf(page, c.flipTarget);
    const growth = opened && origin.w > 0 ? opened.w / origin.w : 0;
    out.push(
      growth >= c.minGrowth
        ? pass('showreel: the square became the player', `${growth.toFixed(1)}× the button's width`)
        : fail(
            'showreel: the square became the player',
            `≥ ${c.minGrowth}× the button's width`,
            `${growth.toFixed(1)}×`,
          ),
    );

    /* (c) the scrim reached §15's #21212180 */
    const scrim = await page.evaluate(
      () => getComputedStyle(document.querySelector('[role="dialog"]')!).backgroundColor,
    );
    out.push(
      scrim === c.scrimOpen
        ? pass('showreel: scrim at #21212180', scrim)
        : fail('showreel: scrim at #21212180', c.scrimOpen, scrim),
    );

    /* (d) the open timeline's resolved shape */
    const open = await readTimeline(page, c.openTimelineId);
    if (!open) {
      out.push(fail('showreel: open timeline registered', c.openTimelineId, 'not registered'));
    } else {
      out.push(
        near(open.total, c.openTotal, 0.001)
          ? pass(`showreel: ${c.openTimelineId} total`, `${open.total}s`)
          : fail(`showreel: ${c.openTimelineId} total`, `${c.openTotal}s`, `${open.total}s`),
      );
      out.push(
        JSON.stringify(open.starts) === JSON.stringify([...c.openStarts])
          ? pass('showreel: open positions resolve', JSON.stringify(open.starts))
          : fail(
              'showreel: open positions resolve',
              JSON.stringify(c.openStarts),
              JSON.stringify(open.starts),
            ),
      );
      out.push(
        JSON.stringify(open.durations) === JSON.stringify([...c.openDurations])
          ? pass('showreel: open durations', JSON.stringify(open.durations))
          : fail(
              'showreel: open durations',
              JSON.stringify(c.openDurations),
              JSON.stringify(open.durations),
            ),
      );
    }

    /* (e) Escape closes, and the layer returns to the box it left */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2200);

    const returned = await boxOf(page, c.flipTarget);
    const back =
      returned !== null &&
      near(returned.x, origin.x, c.returnTolerance) &&
      near(returned.y, origin.y, c.returnTolerance) &&
      near(returned.w, origin.w, c.returnTolerance) &&
      near(returned.h, origin.h, c.returnTolerance);
    out.push(
      back
        ? pass(
            'showreel: Flip returns the layer to its exact origin',
            `${JSON.stringify(origin)} → player → ${JSON.stringify(returned)}`,
          )
        : fail(
            'showreel: Flip returns the layer to its exact origin',
            JSON.stringify(origin),
            JSON.stringify(returned),
          ),
    );

    const display = await page.evaluate(
      () => getComputedStyle(document.querySelector('[role="dialog"]')!).display,
    );
    out.push(
      display === 'none'
        ? pass('showreel: panel is display:none after close', display)
        : fail('showreel: panel is display:none after close', 'none', display),
    );

    const focused = await page.evaluate(() => document.activeElement?.tagName ?? '');
    out.push(
      focused === 'BUTTON'
        ? pass('showreel: focus returns to the trigger', focused)
        : fail('showreel: focus returns to the trigger', 'BUTTON', focused || '(none)'),
    );

    const close = await readTimeline(page, c.closeTimelineId);
    if (!close) {
      out.push(fail('showreel: close timeline registered', c.closeTimelineId, 'not registered'));
    } else {
      out.push(
        near(close.total, c.closeTotal, 0.001)
          ? pass(`showreel: ${c.closeTimelineId} total`, `${close.total}s`)
          : fail(`showreel: ${c.closeTimelineId} total`, `${c.closeTotal}s`, `${close.total}s`),
      );
      out.push(
        JSON.stringify(close.starts) === JSON.stringify([...c.closeStarts])
          ? pass('showreel: close positions resolve', JSON.stringify(close.starts))
          : fail(
              'showreel: close positions resolve',
              JSON.stringify(c.closeStarts),
              JSON.stringify(close.starts),
            ),
      );
    }
  } finally {
    await context.close();
  }
  return out;
}

/* ── 2. the reveal: scrubbed, which is only visible on the way back ──────── */

async function wordOpacities(page: Page, selector: string): Promise<number[]> {
  return page.evaluate(
    (sel) => [...document.querySelectorAll(sel)].map((el) => +getComputedStyle(el).opacity),
    selector,
  );
}

/**
 * Scroll, then wait for the **scrub** to catch up — not for the scroll.
 *
 * `scrub: 1` does not mean "follow the scrollbar". It means GSAP eases the
 * timeline's playhead toward the position the scrollbar implies, over roughly a
 * second. So an assertion taken 400ms after a jump is reading a transition, not
 * a state.
 *
 * That is exactly how this check first failed: scrolled back to the top,
 * measured immediately, and reported words at 0.5891 when they were on their
 * way to 0.2 and would have arrived. The failure was real in the sense that the
 * numbers were true — and it was a bug in the check, not in the component. The
 * handoff's rule applies here as much as to `networkidle`: when a check starts
 * failing around an animation, ask what the animation was doing when you looked.
 */
const SCRUB_SETTLE_MS = 1600;

async function scrollRaw(page: Page, y: number): Promise<void> {
  await page.evaluate((target) => {
    const lenis = (window as unknown as { lenis?: { scrollTo(v: number, o?: object): void } }).lenis;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, y);
  await page.waitForTimeout(SCRUB_SETTLE_MS);
}

async function checkRevealText(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.revealText;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    /* The split is deliberately deferred: fonts first, then a dynamic import of
       split-type. Reading before both land reports "not split" for a component
       that is about to be. The handoff's warning about `networkidle` is the
       same trap; wait for the spans, not for the network. */
    await page.waitForSelector(c.selector, { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(600);

    await scrollRaw(page, 0);
    const rest = await wordOpacities(page, c.selector);
    if (rest.length === 0) {
      out.push(fail('reveal: text is split into words', `${c.selector} present`, 'no .word spans'));
      return out;
    }

    out.push(
      rest.every((o) => near(o, c.restOpacity, c.tolerance))
        ? pass(`reveal: ${rest.length} words rest at ${c.restOpacity}`, `min ${Math.min(...rest)}`)
        : fail(
            `reveal: words rest at ${c.restOpacity}`,
            String(c.restOpacity),
            `min ${Math.min(...rest)}, max ${Math.max(...rest)}`,
          ),
    );

    await scrollRaw(page, c.revealedAt);
    const lit = await wordOpacities(page, c.selector);
    out.push(
      lit.every((o) => near(o, 1, c.tolerance))
        ? pass('reveal: fully lit past the end of the scrub', `min ${Math.min(...lit)}`)
        : fail('reveal: fully lit past the end of the scrub', '1', `min ${Math.min(...lit)}`),
    );

    /* The assertion that separates a scrub from a one-shot. */
    await scrollRaw(page, 0);
    const again = await wordOpacities(page, c.selector);
    out.push(
      again.every((o) => near(o, c.restOpacity, c.tolerance))
        ? pass('reveal: scrolling back un-reveals — it is scrubbed, not triggered', `min ${Math.min(...again)}`)
        : fail(
            'reveal: scrolling back un-reveals — it is scrubbed, not triggered',
            String(c.restOpacity),
            `min ${Math.min(...again)}, max ${Math.max(...again)}`,
          ),
    );

    const tl = await readTimeline(page, c.timelineId);
    out.push(
      tl && tl.eases[0] === c.ease
        ? pass(`reveal: ${c.timelineId} ease`, tl.eases[0]!)
        : fail(`reveal: ${c.timelineId} ease`, c.ease, tl ? String(tl.eases[0]) : 'not registered'),
    );
  } finally {
    await context.close();
  }

  /* Gated off below 992: no split at all, and the text at full opacity. */
  const narrow = await newPage(browser, { viewport: { w: c.gatedOffAt, h: 900 } });
  try {
    await narrow.page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await narrow.page.evaluate(() => document.fonts.ready);
    await narrow.page.waitForTimeout(1500);
    const words = await narrow.page.$$(c.selector);
    const hostOpacity = await narrow.page.evaluate(
      (sel) => +getComputedStyle(document.querySelector(sel)!).opacity,
      c.host,
    );
    out.push(
      words.length === 0 && near(hostOpacity, 1, 0.01)
        ? pass(`reveal: not split at ${c.gatedOffAt}px, text at full opacity`)
        : fail(
            `reveal: not split at ${c.gatedOffAt}px`,
            '0 word spans, opacity 1',
            `${words.length} spans, opacity ${hostOpacity}`,
          ),
    );
  } finally {
    await narrow.context.close();
  }

  return out;
}

/* ── 3. the marquee, and the two places it must not exist ────────────────── */

async function marqueeShape(
  browser: Browser,
  baseUrl: string,
  viewport: { w: number; h: number },
  reducedMotion: 'reduce' | 'no-preference',
): Promise<TimelineShape | null> {
  const { context, page } = await newPage(browser, { viewport, reducedMotion });
  try {
    await page.goto(baseUrl + BEHAVIOUR.stackWall.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    return await readTimeline(page, BEHAVIOUR.stackWall.timelineId);
  } finally {
    await context.close();
  }
}

async function checkStackWall(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.stackWall;
  const out: CheckResult[] = [];

  const mobile = await marqueeShape(browser, baseUrl, c.mobile, 'no-preference');
  if (!mobile) {
    out.push(
      fail(`stack wall: marquee runs at ${c.mobile.w}px`, c.timelineId, 'not registered'),
    );
  } else {
    out.push(
      near(mobile.durations[0] ?? 0, c.duration, 0.001)
        ? pass(`stack wall: marquee is ${c.duration}s`, `${mobile.durations[0]}s`)
        : fail('stack wall: marquee duration', `${c.duration}s`, `${mobile.durations[0]}s`),
    );
    out.push(
      mobile.repeat === -1
        ? pass('stack wall: marquee repeats forever', 'repeat -1')
        : fail('stack wall: marquee repeats forever', '-1', String(mobile.repeat)),
    );
    out.push(
      mobile.eases[0] === 'none'
        ? pass("stack wall: marquee ease is 'none'", mobile.eases[0]!)
        : fail("stack wall: marquee ease is 'none'", 'none', String(mobile.eases[0])),
    );
  }

  const desktop = await marqueeShape(browser, baseUrl, c.desktop, 'no-preference');
  out.push(
    desktop === null
      ? pass(`stack wall: no marquee at ${c.desktop.w}px — the wall is a static grid`)
      : fail(`stack wall: no marquee at ${c.desktop.w}px`, 'not registered', 'registered'),
  );

  const reduced = await marqueeShape(browser, baseUrl, c.mobile, 'reduce');
  out.push(
    reduced === null
      ? pass('stack wall: no marquee under prefers-reduced-motion')
      : fail('stack wall: no marquee under prefers-reduced-motion', 'not registered', 'registered'),
  );

  return out;
}

export async function checkHomeUpper(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await checkShowreel(browser, baseUrl)),
    ...(await checkRevealText(browser, baseUrl)),
    ...(await checkStackWall(browser, baseUrl)),
  ];
}
