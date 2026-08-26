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
  ringY: number;
  ringX: number;
  bladesY: number;
  bladesX: number;
  assemblyY: number;
  cameraZ: number;
  blades: number;
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

    /* §2 [ix2 a-3]. Sweep the pointer across the viewport and read the ring and
       the blades apart. This is the phase's headline acceptance criterion —
       "the blades outrun the ring; if it looks flat, the curves are wrong" —
       and it is a relationship between two numbers that nothing else can see. */
    await page.mouse.move(2, c.desktop.h / 2);
    await page.waitForTimeout(c.settleMs);
    const left = await heroDebug(page);

    await page.mouse.move(c.desktop.w - 2, c.desktop.h / 2);
    await page.waitForTimeout(c.settleMs);
    const right = await heroDebug(page);

    if (!left || !right) {
      out.push(fail(`${c.id} — parallax readable`, 'scene debug handle', 'not exposed'));
    } else {
      const ring = Math.abs(right.ringY - left.ringY);
      const blades = Math.abs(right.bladesY - left.bladesY);

      out.push(
        near(ring, c.ringSweep, c.sweepTolerance)
          ? pass(`${c.id} — ring sweeps ${c.ringSweep} rad across the viewport`, ring.toFixed(3))
          : fail(`${c.id} — ring sweep`, `${c.ringSweep} +/- ${c.sweepTolerance}`, ring.toFixed(3)),
      );
      out.push(
        near(blades, c.bladeSweep, c.sweepTolerance)
          ? pass(`${c.id} — blades sweep ${c.bladeSweep} rad`, blades.toFixed(3))
          : fail(
              `${c.id} — blade sweep`,
              `${c.bladeSweep} +/- ${c.sweepTolerance}`,
              blades.toFixed(3),
            ),
      );

      const ratio = ring > 0.001 ? blades / ring : 0;
      out.push(
        ratio >= c.minRatio
          ? pass(`${c.id} — the blades outrun the ring`, `${ratio.toFixed(2)}x`)
          : fail(`${c.id} — the blades outrun the ring`, `>= ${c.minRatio}x`, `${ratio.toFixed(2)}x`),
      );

      /* On vertical movement the two OPPOSE each other: the ring pitches down
         as the blades pitch up. That shearing is why the object reads as a
         mechanism rather than an image, and a single-object rotation cannot
         produce it — which is exactly the mistake the spec originally made and
         the IX2 pass corrected. */
      await page.mouse.move(c.desktop.w / 2, 2);
      await page.waitForTimeout(c.settleMs);
      const top = await heroDebug(page);
      await page.mouse.move(c.desktop.w / 2, c.desktop.h - 2);
      await page.waitForTimeout(c.settleMs);
      const bottom = await heroDebug(page);

      if (top && bottom) {
        const ringPitch = bottom.ringX - top.ringX;
        const bladePitch = bottom.bladesX - top.bladesX;
        const detail = `ring ${ringPitch.toFixed(3)}, blades ${bladePitch.toFixed(3)}`;
        out.push(
          ringPitch * bladePitch < 0
            ? pass(`${c.id} — ring and blades counter-rotate on Y`, detail)
            : fail(`${c.id} — ring and blades counter-rotate on Y`, 'opposite signs', detail),
        );
      }
    }

    /* §2 performance: the render loop is suspended when the hero is off-screen.

       The homepage has no height of its own until phase 3 fills it, so there is
       nothing to scroll and the hero can never leave the viewport. A spacer is
       injected to give the document somewhere to go. This is a fixture, not a
       workaround: the IntersectionObserver, the scroll and the suspend are all
       the real ones, and phase 3 can delete these two lines once the hero
       section has height. */
    await page.evaluate((h) => {
      /* On <body>, and Lenis is told to re-measure.

         Two false starts worth recording. Appending a spacer into <main> works
         until React re-renders and reconciles the injected node away. Growing
         <html> instead survives React but not Lenis: Lenis caches its scroll
         limit from the CONTENT element, so `scrollTo(2700)` clamped silently to
         a limit of about a hundred pixels and the page never moved — which is
         what the diagnostic in this check now says out loud.

         Body is not given an inline style by React, and `lenis.resize()` makes
         the new limit real. */
      document.body.style.minHeight = `${h}px`;
      (window as unknown as { lenis?: { resize(): void } }).lenis?.resize();
    }, c.desktop.h * 5);
    await page.waitForTimeout(300);

    await scrollTo(page, c.desktop.h * 3);
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
      dbg && near(dbg.assemblyY, c.reducedPose, 0.001)
        ? pass(`${c.id} — reduced-motion pose`, `rotation.y ${dbg.assemblyY}`)
        : fail(`${c.id} — reduced-motion pose`, `rotation.y ${c.reducedPose}`, String(dbg?.assemblyY)),
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
