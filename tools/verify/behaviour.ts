import type { Browser, Page } from 'playwright';
import { newPage } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { BEHAVIOUR } from './behaviour.config';
import { checkHero3d } from './behaviour.hero';
import { checkHomeUpper } from './behaviour.home';

/**
 * Behaviour checks — what a timeline's *shape* cannot tell you.
 *
 * Every check here drives the real interface: it scrolls, hovers, clicks and
 * types the way a visitor would, then reads the DOM back. That is slower than
 * inspecting a registered timeline and it is the only way to catch a handler
 * that was never wired, a matchMedia gate that leaks below 992, or a reverse
 * that runs at the wrong scale.
 *
 * Folded into `verify:motion`. See behaviour.config.ts for why.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/** Move the page to an exact scroll position, past Lenis rather than through it. */
async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((target) => {
    const lenis = (window as unknown as { lenis?: { scrollTo(v: number, o?: object): void } }).lenis;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, y);
  // One frame for ScrollTrigger to see the new position and fire its callbacks.
  await page.waitForTimeout(250);
}

async function hasClass(page: Page, selector: string, className: string): Promise<boolean> {
  return page.evaluate(
    ({ selector, className }) => document.querySelector(selector)?.classList.contains(className) ?? false,
    { selector, className },
  );
}

/* ── 1. the navbar mini threshold ────────────────────────────────────────── */

async function checkNavMini(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.navMini;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.viewport });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const needed = c.abovePx + c.viewport.h;
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (height < needed) {
      out.push(
        fail(`${c.id} — page tall enough to test`, `>= ${needed}px on ${c.page}`, `${height}px`),
      );
      return out;
    }

    await scrollTo(page, c.belowPx);
    const atLow = await hasClass(page, '.nav', c.className);
    out.push(
      atLow === false
        ? pass(`${c.id} — off at ${c.belowPx}px`, 'no is-mini')
        : fail(`${c.id} — off at ${c.belowPx}px`, 'no is-mini', 'is-mini present'),
    );

    await scrollTo(page, c.abovePx);
    const atHigh = await hasClass(page, '.nav', c.className);
    out.push(
      atHigh === true
        ? pass(`${c.id} — on at ${c.abovePx}px`, 'is-mini')
        : fail(`${c.id} — on at ${c.abovePx}px`, 'is-mini', 'absent'),
    );

    // The mini bar has a ground and a tighter top padding. Both, or neither.
    // `.nav` carries `transition: all .3s`, so a computed style read right after
    // the class lands catches the transition mid-flight — 0.799rem on its way to
    // 0.75, and a background still a few percent short of opaque.
    await page.waitForTimeout(500);
    const mini = await page.evaluate(() => {
      const nav = document.querySelector('.nav');
      if (!nav) return null;
      const cs = getComputedStyle(nav);
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return { bg: cs.backgroundColor, padTopRem: parseFloat(cs.paddingTop) / root };
    });
    out.push(
      mini?.bg === 'rgb(33, 33, 33)'
        ? pass(`${c.id} — background`, mini.bg)
        : fail(`${c.id} — background`, 'rgb(33, 33, 33) (--black)', String(mini?.bg)),
    );
    out.push(
      mini && near(mini.padTopRem, 0.75, 0.02)
        ? pass(`${c.id} — padding-top`, `${mini.padTopRem.toFixed(3)}rem`)
        : fail(`${c.id} — padding-top`, '0.75rem', `${mini?.padTopRem.toFixed(3)}rem`),
    );

    // And it comes back off on the way up — onEnterBack, not just onLeave.
    await scrollTo(page, c.belowPx);
    const back = await hasClass(page, '.nav', c.className);
    out.push(
      back === false
        ? pass(`${c.id} — off again after scrolling back up`, 'no is-mini')
        : fail(`${c.id} — off again after scrolling back up`, 'no is-mini', 'is-mini stuck on'),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 2. the footer sibling-dim ───────────────────────────────────────────── */

async function opacities(page: Page, selector: string): Promise<number[]> {
  return page.evaluate(
    (sel) => [...document.querySelectorAll(sel)].map((el) => Number(getComputedStyle(el).opacity)),
    selector,
  );
}

async function checkFooterDim(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.footerDim;
  const out: CheckResult[] = [];

  for (const width of [1512, c.gatedOffAt] as const) {
    const gated = width > c.gatedOffAt;
    const { context, page } = await newPage(browser, { viewport: { w: width, h: 900 } });
    try {
      await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const links = page.locator(c.selector);
      if ((await links.count()) < 2) {
        out.push(fail(`${c.id} @${width}`, `>= 2 ${c.selector}`, `${await links.count()}`));
        continue;
      }

      await links.first().hover();
      // The tween is 400ms; give it a comfortable margin to settle.
      await page.waitForTimeout(700);
      const during = await opacities(page, c.selector);
      const hovered = during[0]!;
      const siblings = during.slice(1);

      if (gated) {
        const allDimmed = siblings.every((o) => near(o, c.dimmed, c.tolerance));
        out.push(
          allDimmed
            ? pass(`${c.id} @${width} — siblings dim`, siblings.map((o) => o.toFixed(2)).join(', '))
            : fail(
                `${c.id} @${width} — siblings dim`,
                `all ${c.dimmed}`,
                siblings.map((o) => o.toFixed(2)).join(', '),
              ),
        );
        out.push(
          near(hovered, 1, c.tolerance)
            ? pass(`${c.id} @${width} — hovered stays lit`, hovered.toFixed(2))
            : fail(`${c.id} @${width} — hovered stays lit`, '1', hovered.toFixed(2)),
        );

        // Moving away restores every one of them.
        await page.mouse.move(2, 2);
        await page.waitForTimeout(700);
        const after = await opacities(page, c.selector);
        out.push(
          after.every((o) => near(o, 1, c.tolerance))
            ? pass(`${c.id} @${width} — restores on leave`, '1 across the list')
            : fail(`${c.id} @${width} — restores on leave`, 'all 1', after.map((o) => o.toFixed(2)).join(', ')),
        );
      } else {
        // Below 992 there is no hover at all — CLAUDE.md non-negotiable §6.
        out.push(
          during.every((o) => near(o, 1, c.tolerance))
            ? pass(`${c.id} @${width} — gated off`, 'nothing dimmed')
            : fail(`${c.id} @${width} — gated off`, 'nothing dimmed', during.map((o) => o.toFixed(2)).join(', ')),
        );
      }
    } finally {
      await context.close();
    }
  }
  return out;
}

/* ── 3. the contact panel, end to end ────────────────────────────────────── */

async function checkContactPanel(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.contactPanel;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: { w: 1512, h: 900 } });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const closed = await page.evaluate(() => getComputedStyle(document.querySelector('.contact')!).display);
    out.push(
      closed === 'none'
        ? pass(`${c.id} — closed at rest`, 'display: none')
        : fail(`${c.id} — closed at rest`, 'display: none', closed),
    );

    await page.locator(c.trigger).first().click();
    // The open timeline is 1.5s.
    await page.waitForTimeout(1900);

    const opened = await page.evaluate(() => {
      const panel = document.querySelector('.contact') as HTMLElement;
      const sidebar = document.querySelector('.contact__sidebar') as HTMLElement;
      const cs = getComputedStyle(panel);
      return {
        display: cs.display,
        opacity: Number(cs.opacity),
        sidebarX: sidebar.getBoundingClientRect().right - window.innerWidth,
        sidebarWidthPct: (sidebar.getBoundingClientRect().width / window.innerWidth) * 100,
        focusInside: panel.contains(document.activeElement),
        role: panel.getAttribute('role'),
        modal: panel.getAttribute('aria-modal'),
      };
    });

    out.push(
      opened.display !== 'none' && near(opened.opacity, 1, 0.02)
        ? pass(`${c.id} — opens`, `display: ${opened.display}, opacity ${opened.opacity}`)
        : fail(`${c.id} — opens`, 'visible, opacity 1', `${opened.display}, ${opened.opacity}`),
    );
    out.push(
      near(opened.sidebarX, 0, 1)
        ? pass(`${c.id} — sidebar rests at x 0%`, `${opened.sidebarX.toFixed(1)}px from the right edge`)
        : fail(`${c.id} — sidebar rests at x 0%`, '0px from the right edge', `${opened.sidebarX.toFixed(1)}px`),
    );
    out.push(
      near(opened.sidebarWidthPct, 56, 0.5)
        ? pass(`${c.id} — sidebar width`, `${opened.sidebarWidthPct.toFixed(1)}%`)
        : fail(`${c.id} — sidebar width`, '56%', `${opened.sidebarWidthPct.toFixed(1)}%`),
    );
    out.push(
      opened.role === 'dialog' && opened.modal === 'true'
        ? pass(`${c.id} — is a modal dialog`, 'role=dialog aria-modal=true')
        : fail(`${c.id} — is a modal dialog`, 'role=dialog aria-modal=true', `${opened.role}/${opened.modal}`),
    );
    out.push(
      opened.focusInside
        ? pass(`${c.id} — focus moves into the panel`, 'yes')
        : fail(`${c.id} — focus moves into the panel`, 'yes', 'focus left outside'),
    );

    /* Escape closes it, and the close runs at the panel scale. Read the scale
       before the reverse finishes — it is a property of the running close. */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    const scale = await page.evaluate(
      (id) =>
        (window as unknown as { __TIMELINES__?: Record<string, { timeScale(): number }> }).__TIMELINES__?.[
          id
        ]?.timeScale() ?? null,
      c.timelineId,
    );
    // GSAP negates timeScale while a timeline runs backwards, so the magnitude
    // is the assertion and the sign is the proof it is actually reversing.
    out.push(
      scale !== null && Math.abs(scale) === c.reverseTimeScale && scale < 0
        ? pass(`${c.id} — close runs at the panel scale`, `${scale} (reversing at ${c.reverseTimeScale})`)
        : fail(`${c.id} — close runs at the panel scale`, `-${c.reverseTimeScale}`, String(scale)),
    );

    await page.waitForTimeout(1600);
    const after = await page.evaluate(() => {
      const panel = document.querySelector('.contact') as HTMLElement;
      return {
        display: getComputedStyle(panel).display,
        focusRestored: document.activeElement?.closest('[data-contact]') !== null,
      };
    });
    out.push(
      after.display === 'none'
        ? pass(`${c.id} — Escape closes it`, 'display: none')
        : fail(`${c.id} — Escape closes it`, 'display: none', after.display),
    );
    out.push(
      after.focusRestored
        ? pass(`${c.id} — focus returns to the trigger`, 'yes')
        : fail(`${c.id} — focus returns to the trigger`, 'yes', 'focus was not restored'),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 4. the button icon-swap reverse scale ───────────────────────────────── */

async function checkButtonIcon(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.buttonIcon;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: { w: 1512, h: 900 } });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await page.locator(c.hoverTarget).first().hover();
    await page.waitForTimeout(500);
    const forwardState = await page.evaluate(
      (id) => {
        const tl = (
          window as unknown as { __TIMELINES__?: Record<string, { timeScale(): number; progress(): number }> }
        ).__TIMELINES__?.[id];
        return tl ? { scale: tl.timeScale(), progress: tl.progress() } : null;
      },
      c.timelineId,
    );

    out.push(
      forwardState && forwardState.progress > 0.9
        ? pass(`${c.id} — plays forward on hover`, `progress ${forwardState.progress.toFixed(2)}`)
        : fail(`${c.id} — plays forward on hover`, 'progress 1', String(forwardState?.progress)),
    );
    out.push(
      forwardState && forwardState.scale === 1
        ? pass(`${c.id} — forward runs at 1`, '1')
        : fail(`${c.id} — forward runs at 1`, '1', String(forwardState?.scale)),
    );

    await page.mouse.move(2, 2);
    await page.waitForTimeout(80);
    const reverseScale = await page.evaluate(
      (id) =>
        (window as unknown as { __TIMELINES__?: Record<string, { timeScale(): number }> }).__TIMELINES__?.[
          id
        ]?.timeScale() ?? null,
      c.timelineId,
    );
    out.push(
      reverseScale !== null && Math.abs(reverseScale) === c.reverseTimeScale && reverseScale < 0
        ? pass(`${c.id} — reverse runs at the button scale`, `${reverseScale} (reversing at ${c.reverseTimeScale})`)
        : fail(`${c.id} — reverse runs at the button scale`, `-${c.reverseTimeScale}`, String(reverseScale)),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 5. the loader under reduced motion ──────────────────────────────────── */

async function checkLoaderReduced(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.loaderReduced;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, {
    viewport: { w: 1512, h: 900 },
    reducedMotion: 'reduce',
  });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    /* Wait for the timeline to be registered rather than assuming it already is.

       The Loader rebuilds its timelines whenever the reduced-motion matchMedia
       context settles, and a rebuild unregisters before it registers. On a route
       that dynamically imports three the page commits later, which widened that
       gap enough for this check to read it and report `loader.enter` missing on
       a page where it was demonstrably present a frame later. */
    await page
      .waitForFunction(
        (id) => Boolean((window as unknown as { __TIMELINES__?: Record<string, unknown> }).__TIMELINES__?.[id]),
        c.timelineId,
        { timeout: 10_000 },
      )
      .catch(() => undefined);

    const shape = await page.evaluate((id) => {
      const tl = (
        window as unknown as {
          __TIMELINES__?: Record<
            string,
            {
              totalDuration(): number;
              getChildren(n: boolean, t: boolean, l: boolean): { duration(): number; vars: Record<string, unknown> }[];
            }
          >;
        }
      ).__TIMELINES__?.[id];
      if (!tl) return null;
      const kids = tl.getChildren(true, true, false);
      return {
        total: tl.totalDuration(),
        // Zero-duration children are gsap.set() calls — resets, not animation.
        // The reduced timeline legitimately *sets* yPercent 0 and scale 1 to put
        // the panel and its mark back where they started.
        props: [...new Set(kids.filter((k) => k.duration() > 0).flatMap((k) => Object.keys(k.vars)))],
      };
    }, c.timelineId);

    if (!shape) {
      out.push(fail(c.id, 'loader.enter registered', 'not found'));
      return out;
    }

    out.push(
      near(shape.total, c.fadeDuration, 0.001)
        ? pass(`${c.id} — a ${c.fadeDuration * 1000}ms fade`, `${shape.total}s`)
        : fail(`${c.id} — a ${c.fadeDuration * 1000}ms fade`, `${c.fadeDuration}s`, `${shape.total}s`),
    );

    const offenders = c.forbiddenProps.filter((p) => shape.props.includes(p));
    out.push(
      offenders.length === 0
        ? pass(`${c.id} — no transform`, shape.props.join(', '))
        : fail(`${c.id} — no transform`, 'opacity and display only', `animates ${offenders.join(', ')}`),
    );

    // The enter timeline runs on mount; give it room to finish before asking
    // whether it cleared the page.
    await page.waitForTimeout(1200);
    const hidden = await page.evaluate(() => getComputedStyle(document.querySelector('.loader')!).display);
    out.push(
      hidden === 'none'
        ? pass(`${c.id} — loader clears the page`, 'display: none')
        : fail(`${c.id} — loader clears the page`, 'display: none', hidden),
    );
  } finally {
    await context.close();
  }
  return out;
}

export async function checkBehaviour(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await checkNavMini(browser, baseUrl)),
    ...(await checkFooterDim(browser, baseUrl)),
    ...(await checkContactPanel(browser, baseUrl)),
    ...(await checkButtonIcon(browser, baseUrl)),
    ...(await checkLoaderReduced(browser, baseUrl)),
    ...(await checkHero3d(browser, baseUrl)),
    ...(await checkHomeUpper(browser, baseUrl)),
  ];
}
