import type { Browser, Page } from 'playwright';
import { newPage } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { BEHAVIOUR } from './behaviour.config';

/**
 * The 3D hero's behaviour checks. `50-brand-and-3d.md` §2.
 *
 * Split into its own file rather than added to `behaviour.ts` because it is the
 * largest single check on the harness and it needs three separate browser
 * contexts — desktop, reduced-motion and mobile — where every other check needs
 * one.
 *
 * Everything asserted here is invisible to the other four checks. A registered
 * timeline cannot hold a *relationship between two objects' rotations*; a
 * screenshot cannot show whether a render loop is still burning frames behind a
 * faded canvas; and the triangle count is a runtime figure that does not exist
 * in the source. Each assertion is either a §2 performance rule or a phase-2
 * acceptance criterion.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

interface HeroDebugRead {
  tipX: number;
  tipY: number;
  actuation: number;
  spin: number;
  cameraZ: number;
  blades: number;
  bladeReach: number;
  barrelOuter: number;
}

interface HeroStateRead {
  mode: string;
  running: boolean;
  triangles: number;
}

/** Read the scene's live rotations out of the dev-only handle. */
async function heroDebug(page: Page): Promise<HeroDebugRead | null> {
  return page.evaluate(() => {
    const w = window as unknown as { __HERO_SCENE__?: { debug(): HeroDebugRead } };
    return w.__HERO_SCENE__ ? w.__HERO_SCENE__.debug() : null;
  });
}

async function heroState(page: Page): Promise<HeroStateRead | null> {
  return page.evaluate(() => {
    const w = window as unknown as { __HERO__?: HeroStateRead };
    return w.__HERO__ ?? null;
  });
}

/** Wait for the scene to report itself live, rather than sleeping and hoping. */
async function waitForHero(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const w = window as unknown as { __HERO__?: { mode: string } };
        return Boolean(w.__HERO__ && w.__HERO__.mode !== 'probing');
      },
      null,
      { timeout: 30_000 },
    )
    .catch(() => undefined);
}

/** Move the page past Lenis rather than through it. */
async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((target) => {
    const lenis = (window as unknown as { lenis?: { scrollTo(v: number, o?: object): void } }).lenis;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, y);
  // One frame for Lenis to apply the jump and the observer to see it.
  await page.waitForTimeout(250);
}

/**
 * Wait for the loop to reach a state, rather than sleeping and hoping.
 *
 * An IntersectionObserver callback lands on its own schedule and then has to
 * cross a React state update before it reaches the debug object. A fixed 400ms
 * was enough locally and not enough in the harness, where headless Chromium runs
 * the ticker near 20fps — the suspend was working and the check was reading it
 * too early. Polling for the condition removes the frame rate from the question
 * entirely; a genuine failure still costs the full timeout and no more.
 */
async function waitForRunning(page: Page, expected: boolean): Promise<boolean> {
  return page
    .waitForFunction(
      (want) => {
        const w = window as unknown as { __HERO__?: { running: boolean } };
        return w.__HERO__?.running === want;
      },
      expected,
      { timeout: 5_000 },
    )
    .then(() => true)
    .catch(() => false);
}


/**
 * Why the hero did not suspend. A bare `running: true` sends the next reader
 * hunting through the component; nine times in ten the answer is that the page
 * never actually scrolled, and this says so.
 */
async function suspendDiagnostic(page: Page): Promise<string> {
  const d = await page.evaluate(() => {
    const el = document.querySelector('[data-hero-3d]');
    const rect = el?.getBoundingClientRect();
    const w = window as unknown as { __HERO__?: { running: boolean } };
    return {
      running: w.__HERO__?.running,
      scrollY: Math.round(window.scrollY),
      docHeight: document.documentElement.scrollHeight,
      viewport: window.innerHeight,
      heroBottom: rect ? Math.round(rect.bottom) : null,
    };
  });
  return (
    `running: ${d.running} — scrollY ${d.scrollY}, document ${d.docHeight}px, ` +
    `viewport ${d.viewport}px, hero bottom at ${d.heroBottom}px` +
    (d.heroBottom !== null && d.heroBottom > 0 ? ' (still on screen — the page did not scroll)' : '')
  );
}

/* ── desktop: budget, the two parallax curves, and both suspend paths ─────── */

async function desktopChecks(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.hero3d;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForHero(page);

    const state = await heroState(page);
    if (!state || state.mode !== 'webgl') {
      out.push(fail(`${c.id} — WebGL context`, 'mode webgl', state?.mode ?? 'never reported'));
      return out;
    }

    out.push(
      state.triangles > 0 && state.triangles < c.maxTriangles
        ? pass(`${c.id} — triangle budget`, `${state.triangles} / ${c.maxTriangles}`)
        : fail(`${c.id} — triangle budget`, `< ${c.maxTriangles}`, String(state.triangles)),
    );

    /* The pointer response. Sweep across the viewport, then top to bottom, and
       read the two channels apart.

       This replaced §2's recovered ring/mark curves when the object was rebuilt
       as one housed mechanism — see D-014. The old assertion checked that the
       blades outran the ring by 1.5x, which was true and which was also the bug:
       ours are inside a bore, and outrunning the housing meant leaving it. */
    await page.mouse.move(c.desktop.w / 2, c.desktop.h / 2);
    await page.waitForTimeout(c.settleMs);
    const centre = await heroDebug(page);

    await page.mouse.move(2, c.desktop.h / 2);
    await page.waitForTimeout(c.settleMs);
    const left = await heroDebug(page);

    await page.mouse.move(c.desktop.w - 2, c.desktop.h / 2);
    await page.waitForTimeout(c.settleMs);
    const right = await heroDebug(page);

    await page.mouse.move(c.desktop.w / 2, 2);
    await page.waitForTimeout(c.settleMs);
    const top = await heroDebug(page);

    await page.mouse.move(c.desktop.w / 2, c.desktop.h - 2);
    await page.waitForTimeout(c.settleMs);
    const bottom = await heroDebug(page);

    if (!centre || !left || !right || !top || !bottom) {
      out.push(fail(`${c.id} — pointer response readable`, 'scene debug handle', 'not exposed'));
    } else {
      /* ── THE invariant ──────────────────────────────────────────────────
         The blades are housed. Nothing the pointer does may take any blade
         vertex outside the barrel it sits in, at any pointer position — and
         because the only differential is a rotation about the bore axis, the
         reach is mathematically constant rather than merely small. Checked at
         all five positions so a future change that reintroduces a radial
         differential fails here rather than in someone's eye. */
      const reaches = [centre, left, right, top, bottom].map((d) => d.bladeReach);
      const worst = Math.max(...reaches);
      const drift = Math.max(...reaches) - Math.min(...reaches);
      out.push(
        worst < centre.barrelOuter && drift < 1e-6
          ? pass(
              `${c.id} — the blades never leave the barrel`,
              `reach ${worst.toFixed(3)} of ${centre.barrelOuter}, invariant`,
            )
          : fail(
              `${c.id} — the blades never leave the barrel`,
              `reach < ${centre.barrelOuter} and constant`,
              `reach ${worst.toFixed(3)}, drift ${drift.toExponential(1)}`,
            ),
      );

      // The housing tips, on both axes.
      const tipSweepX = Math.abs(right.tipX - left.tipX);
      const tipSweepY = Math.abs(bottom.tipY - top.tipY);
      out.push(
        tipSweepX > c.respondMin && tipSweepX < c.tipMax * 2 + 0.02
          ? pass(`${c.id} — the housing tips across the viewport`, tipSweepX.toFixed(3))
          : fail(
              `${c.id} — the housing tips across the viewport`,
              `> ${c.respondMin} and <= ${(c.tipMax * 2).toFixed(2)}`,
              tipSweepX.toFixed(3),
            ),
      );
      out.push(
        tipSweepY > c.respondMin && tipSweepY < c.tipMax * 2 + 0.02
          ? pass(`${c.id} — the housing tips top to bottom`, tipSweepY.toFixed(3))
          : fail(
              `${c.id} — the housing tips top to bottom`,
              `> ${c.respondMin} and <= ${(c.tipMax * 2).toFixed(2)}`,
              tipSweepY.toFixed(3),
            ),
      );

      // The iris actuates, and it leads the housing rather than echoing it.
      const actuation = Math.abs(right.actuation - left.actuation);
      out.push(
        actuation > c.actuateMin
          ? pass(`${c.id} — the iris actuates`, `${actuation.toFixed(3)} rad about the bore`)
          : fail(`${c.id} — the iris actuates`, `> ${c.actuateMin}`, actuation.toFixed(3)),
      );
      out.push(
        actuation > tipSweepX
          ? pass(`${c.id} — the blades lead the housing`, `${(actuation / tipSweepX).toFixed(2)}x`)
          : fail(
              `${c.id} — the blades lead the housing`,
              'iris sweep > housing tip',
              `${actuation.toFixed(3)} vs ${tipSweepX.toFixed(3)}`,
            ),
      );

      /* Subtlety is a requirement, not a side effect. tonik's object barely
         moves; the first build swung 0.6 rad and read as a thing being waved
         around. A regression that doubles these is a regression. */
      const biggest = Math.max(
        ...[left, right, top, bottom].flatMap((d) => [
          Math.abs(d.tipX),
          Math.abs(d.tipY),
          Math.abs(d.actuation),
        ]),
      );
      out.push(
        biggest <= c.tipMax
          ? pass(`${c.id} — the response stays subtle`, `max ${biggest.toFixed(3)} rad`)
          : fail(`${c.id} — the response stays subtle`, `<= ${c.tipMax} rad`, biggest.toFixed(3)),
      );
    }

    /* §2 performance: the render loop is suspended when the hero is off-screen.

       **Phase 3 deleted the fixture this used to need.** Until the stack wall
       and the works heading gave the homepage height, there was nothing to
       scroll: the check grew `<body>` by five viewports and called
       `lenis.resize()` so the hero could leave the screen at all. Two earlier
       attempts are worth keeping on the record, because both failed silently —
       a spacer appended into `<main>` is reconciled away by React's next
       render, and growing `<html>` survives React but not Lenis, which caches
       its scroll limit from the CONTENT element and clamps `scrollTo` to the
       stale one without erroring.

       None of that is needed now. We scroll past the hero's own bottom edge,
       read off the element rather than guessed from a viewport multiple, so
       this keeps working when the section's height changes again. */
    const heroBottom = await page.evaluate(() => {
      const hero = document.querySelector('[data-hero]');
      return hero ? Math.round(hero.getBoundingClientRect().bottom + window.scrollY) : 0;
    });
    if (heroBottom === 0) {
      out.push(fail(`${c.id} — hero section has height to scroll past`, '[data-hero] present', 'not found'));
    }

    await scrollTo(page, heroBottom + 300);
    const suspended = await waitForRunning(page, false);
    out.push(
      suspended
        ? pass(`${c.id} — loop suspends off-screen`, 'running: false')
        : fail(`${c.id} — loop suspends off-screen`, 'running: false', await suspendDiagnostic(page)),
    );

    await scrollTo(page, 0);
    const resumed = await waitForRunning(page, true);
    out.push(
      resumed
        ? pass(`${c.id} — loop resumes on-screen`, 'running: true')
        : fail(
            `${c.id} — loop resumes on-screen`,
            'running: true',
            `running: ${(await heroState(page))?.running}`,
          ),
    );

    /* §2 route change: the canvas PERSISTS, its opacity goes to 0 and its loop
       suspends. Asserting the context survived is half the point — an unmounted
       hero would also read as "not running", and unmounting is the one thing
       this component exists to avoid. */
    await page.goto(`${baseUrl}${c.awayPage}`, { waitUntil: 'networkidle' });
    await waitForHero(page);
    await waitForRunning(page, false);
    await page.waitForTimeout(900); // the opacity tween is DUR.slow
    const away = await heroState(page);
    const awayOpacity = await page.evaluate(() => {
      const el = document.querySelector('[data-hero-3d]');
      return el ? Number(getComputedStyle(el).opacity) : null;
    });

    out.push(
      away?.mode === 'webgl' && away.running === false
        ? pass(`${c.id} — suspended off the homepage`, 'context kept, loop stopped')
        : fail(
            `${c.id} — suspended off the homepage`,
            'mode webgl, running false',
            `mode ${away?.mode}, running ${away?.running}`,
          ),
    );
    out.push(
      awayOpacity !== null && awayOpacity < 0.05
        ? pass(`${c.id} — faded off the homepage`, `opacity ${awayOpacity}`)
        : fail(`${c.id} — faded off the homepage`, 'opacity ~0', String(awayOpacity)),
    );
  } finally {
    await context.close();
  }

  return out;
}

/* ── reduced motion: one frame at the specced pose, then nothing ──────────── */

async function reducedChecks(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.hero3d;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, {
    viewport: c.desktop,
    reducedMotion: 'reduce',
  });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForHero(page);
    await page.waitForTimeout(1200);

    const state = await heroState(page);
    out.push(
      state?.mode === 'webgl' && state.running === false
        ? pass(`${c.id} — reduced motion renders one frame and stops`, 'running: false')
        : fail(
            `${c.id} — reduced motion renders one frame and stops`,
            'mode webgl, running false',
            `mode ${state?.mode}, running ${state?.running}`,
          ),
    );

    /* The pose is specced, not incidental: rotation.y = 0.4. The baked no-WebGL
       fallback is rendered through this same path, so if the pose drifts the
       two degraded paths stop matching each other. */
    const dbg = await heroDebug(page);
    out.push(
      dbg && near(dbg.spin, c.reducedPose, 0.001)
        ? pass(`${c.id} — reduced-motion pose`, `spin ${dbg.spin}`)
        : fail(`${c.id} — reduced-motion pose`, `spin ${c.reducedPose}`, String(dbg?.spin)),
    );
  } finally {
    await context.close();
  }

  return out;
}

/* ── mobile: fewer blades, and a camera that pulls back ───────────────────── */

async function mobileChecks(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.hero3d;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.mobile });

  try {
    await page.goto(`${baseUrl}${c.page}`, { waitUntil: 'networkidle' });
    await waitForHero(page);

    const dbg = await heroDebug(page);
    out.push(
      dbg?.blades === c.mobileBlades
        ? pass(`${c.id} — ${c.mobileBlades} blades at ${c.mobile.w}`, String(c.mobileBlades))
        : fail(`${c.id} — ${c.mobileBlades} blades at ${c.mobile.w}`, String(c.mobileBlades), String(dbg?.blades)),
    );

    /* The camera distance is fitted to the viewport rather than fixed, so a
       portrait viewport must pull it back past the desktop framing distance.
       Without this the ring is 183% of the width at 390 and reads as a bare arc
       with one blade on it — which is what the first mobile capture showed. */
    out.push(
      (dbg?.cameraZ ?? 0) > c.minMobileCameraZ
        ? pass(`${c.id} — camera pulls back on a portrait viewport`, `z ${dbg?.cameraZ.toFixed(2)}`)
        : fail(
            `${c.id} — camera pulls back on a portrait viewport`,
            `z > ${c.minMobileCameraZ}`,
            String(dbg?.cameraZ),
          ),
    );
  } finally {
    await context.close();
  }

  return out;
}

export async function checkHero3d(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await desktopChecks(browser, baseUrl)),
    ...(await reducedChecks(browser, baseUrl)),
    ...(await mobileChecks(browser, baseUrl)),
  ];
}
