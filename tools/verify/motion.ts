import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright';
import { newPage } from './lib/browser';
import { fail, info, pass, pending, type CheckResult, type SectionResult } from './lib/types';
import { checkBehaviour } from './behaviour';
import {
  RUNTIME,
  SPEC_DUR,
  SPEC_EASE,
  SPEC_REVERSE,
  TIMELINE_ASSERTIONS,
  type TimelineAssertion,
} from './motion.config';
import { DUR, EASE, REVERSE_SCALE, REVERSE_SCALE_FAST } from '../../lib/motion/tokens';

/**
 * verify:motion — the hard one, and the most valuable.
 *
 * Catches: a wrong duration or ease, a reverse that doesn't run faster than its
 * forward, a hover that escaped matchMedia, a leaked ScrollTrigger, a second rAF
 * loop, a CSS mirror that drifted from the TS tokens.
 * Misses: whether the result feels right. Nothing automates that.
 */

/* ── 1. the token tables ─────────────────────────────────────────────────── */

function checkMotionTokens(): CheckResult[] {
  const out: CheckResult[] = [];

  for (const [name, expected] of Object.entries(SPEC_DUR)) {
    const actual = (DUR as Record<string, number>)[name];
    out.push(
      actual === expected
        ? pass(`DUR.${name}`, `${actual}s`)
        : fail(`DUR.${name}`, `${expected}s`, actual === undefined ? 'missing' : `${actual}s`),
    );
  }
  for (const extra of Object.keys(DUR).filter((k) => !(k in SPEC_DUR))) {
    out.push(fail(`DUR.${extra}`, 'not in the spec vocabulary', 'present in lib/motion/tokens.ts'));
  }

  for (const [name, expected] of Object.entries(SPEC_EASE)) {
    const actual = (EASE as Record<string, string>)[name];
    out.push(
      actual === expected
        ? pass(`EASE.${name}`, actual)
        : fail(`EASE.${name}`, expected, actual ?? 'missing'),
    );
  }
  for (const extra of Object.keys(EASE).filter((k) => !(k in SPEC_EASE))) {
    out.push(fail(`EASE.${extra}`, 'not in the spec vocabulary', 'present in lib/motion/tokens.ts'));
  }

  out.push(
    REVERSE_SCALE === SPEC_REVERSE.panel
      ? pass('REVERSE_SCALE (panels)', String(REVERSE_SCALE))
      : fail('REVERSE_SCALE (panels)', String(SPEC_REVERSE.panel), String(REVERSE_SCALE)),
  );
  out.push(
    REVERSE_SCALE_FAST === SPEC_REVERSE.button
      ? pass('REVERSE_SCALE_FAST (buttons)', String(REVERSE_SCALE_FAST))
      : fail('REVERSE_SCALE_FAST (buttons)', String(SPEC_REVERSE.button), String(REVERSE_SCALE_FAST)),
  );

  /* The CSS mirrors. tokens.css carries --dur-* for the [css] hover rules in
     20-components-and-motion.md §22; if they drift from the TS tokens the site
     animates at two different speeds depending on which engine drew it. */
  const css = readFileSync(join(process.cwd(), 'app', 'styles', 'tokens.css'), 'utf8');
  for (const [name, expected] of Object.entries(SPEC_DUR)) {
    const m = new RegExp(`--dur-${name}:\\s*([\\d.]+)s`).exec(css);
    const actual = m?.[1] ? Number(m[1]) : null;
    out.push(
      actual === expected
        ? pass(`tokens.css --dur-${name}`, `${actual}s`)
        : fail(`tokens.css --dur-${name}`, `${expected}s`, actual === null ? 'missing' : `${actual}s`),
    );
  }

  return out;
}

/* ── 2. runtime invariants ───────────────────────────────────────────────── */

interface MotionDebugSnapshot {
  tickerCallbacks: number;
  activeContexts: string[];
  reducedMotion: boolean;
  lenisRunning: boolean;
}

/**
 * Read the provider's debug state, once it exists.
 *
 * `networkidle` says the network went quiet, not that React hydrated and ran its
 * effects — in dev those are seconds apart on a cold compile. Reading straight
 * after the goto produced an intermittent "desktop motion context @1512:
 * inactive" against perfectly correct code, which is the worst kind of check:
 * one that fails at random and teaches the next agent to re-run until green.
 *
 * The settle after it covers React StrictMode's mount → unmount → mount, whose
 * middle step reverts every matchMedia context and republishes an empty set.
 */
async function readMotionState(page: Page): Promise<MotionDebugSnapshot | null> {
  await page
    .waitForFunction(() => Boolean((window as unknown as { __MOTION__?: unknown }).__MOTION__), null, {
      timeout: 10_000,
    })
    .catch(() => undefined);
  await page.waitForTimeout(200);
  return page.evaluate(() => (window as unknown as { __MOTION__?: MotionDebugSnapshot }).__MOTION__ ?? null);
}

async function rafLoopSites(page: Page): Promise<string[]> {
  // Let real frames accumulate; a loop is only visible once it has ticked.
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    const probe = (window as unknown as { __RAF__?: { loops: Map<string, { site: string; ticks: number }> } }).__RAF__;
    if (!probe) return [];
    // A handful of ticks separates a real driver from an incidental reschedule.
    return [...probe.loops.values()].filter((l) => l.ticks >= 5).map((l) => l.site);
  });
}

/**
 * Split the observed rAF loops into the two sanctioned library internals and
 * everything else. "Everything else" is what the one-loop rule is actually
 * about, and naming the offending stack is what makes the failure actionable.
 */
function classifyRaf(sites: string[]) {
  const unsanctioned: string[] = [];
  let tickers = 0;
  for (const site of sites) {
    const known = RUNTIME.sanctionedRaf.find((s) => s.match.test(site));
    if (!known) unsanctioned.push(site.slice(0, 200));
    else if (known.isTicker) tickers++;
  }
  return { tickers, unsanctioned };
}

async function checkRuntime(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const out: CheckResult[] = [];

  /* ── one animation loop ────────────────────────────────────────────────
     GSAP's ticker drives Lenis, ScrollTrigger and (from phase 11) Matter.
     There is never a second requestAnimationFrame and never a Matter.Runner. */
  {
    const { context, page } = await newPage(browser, {
      viewport: { w: 1512, h: 900 },
      instrumentRaf: true,
    });
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      const { tickers, unsanctioned } = classifyRaf(await rafLoopSites(page));
      out.push(
        unsanctioned.length === 0
          ? pass('no rAF loop outside the GSAP ticker', '0 unsanctioned')
          : fail('no rAF loop outside the GSAP ticker', '0 unsanctioned', unsanctioned.join(' ;; ')),
      );
      out.push(
        tickers === 1
          ? pass('exactly one GSAP ticker loop', '1')
          : fail('exactly one GSAP ticker loop', '1', String(tickers)),
      );

      const state = await readMotionState(page);
      out.push(
        state?.lenisRunning
          ? pass('Lenis attached to the GSAP ticker', `tickerCallbacks=${state.tickerCallbacks}`)
          : fail('Lenis attached to the GSAP ticker', 'lenisRunning=true', JSON.stringify(state)),
      );
      out.push(
        state?.tickerCallbacks === 1
          ? pass('exactly one Lenis ticker callback', '1')
          : fail('exactly one Lenis ticker callback', '1', String(state?.tickerCallbacks ?? 'unknown')),
      );
    } finally {
      await context.close();
    }
  }

  /* ── matchMedia gating at >991 ─────────────────────────────────────────
     The most common responsive bug on this build: a hover that works on the
     author's screen and fires on a tablet. Checked on both sides of the line. */
  for (const [width, shouldBeActive] of [
    [RUNTIME.gatedOffAt, false],
    [RUNTIME.gatedOnAt, true],
  ] as const) {
    const { context, page } = await newPage(browser, { viewport: { w: width, h: 900 } });
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      const state = await readMotionState(page);
      const active = state?.activeContexts.includes(RUNTIME.desktopQuery) ?? false;
      const label = `desktop motion context ${RUNTIME.desktopQuery} @${width}`;
      out.push(
        active === shouldBeActive
          ? pass(label, active ? 'active' : 'inactive')
          : fail(label, shouldBeActive ? 'active' : 'inactive', active ? 'active' : 'inactive'),
      );
    } finally {
      await context.close();
    }
  }

  /* ── reduced motion ────────────────────────────────────────────────────
     tonik ships none; we do, and it is not optional. Under `reduce` there is
     no Lenis at all — the page falls back to native scroll. */
  {
    const { context, page } = await newPage(browser, {
      viewport: { w: 1512, h: 900 },
      reducedMotion: 'reduce',
      instrumentRaf: true,
    });
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      const state = await readMotionState(page);
      out.push(
        state?.reducedMotion === true
          ? pass('prefers-reduced-motion detected', 'true')
          : fail('prefers-reduced-motion detected', 'true', String(state?.reducedMotion)),
      );
      out.push(
        state?.lenisRunning === false
          ? pass('Lenis destroyed under reduced motion', 'native scroll')
          : fail('Lenis destroyed under reduced motion', 'lenisRunning=false', String(state?.lenisRunning)),
      );
      const { unsanctioned } = classifyRaf(await rafLoopSites(page));
      out.push(
        unsanctioned.length === 0
          ? pass('no rAF loop outside the GSAP ticker, under reduced motion', '0 unsanctioned')
          : fail(
              'no rAF loop outside the GSAP ticker, under reduced motion',
              '0 unsanctioned',
              unsanctioned.join(' ;; '),
            ),
      );
    } finally {
      await context.close();
    }
  }

  /* ── ScrollTrigger hygiene ─────────────────────────────────────────────
     Navigate away and back; the trigger count must return to its baseline.
     This is the leak that plagues sites of this kind, and it only ever shows
     up as "the scroll animations stopped working after a few pages". */
  {
    const { context, page } = await newPage(browser, { viewport: { w: 1512, h: 900 } });
    try {
      await page.goto(`${baseUrl}${RUNTIME.leakRoutes[0]}`, { waitUntil: 'networkidle' });
      const countTriggers = () =>
        page.evaluate(() => {
          const g = (window as unknown as { gsap?: { core?: unknown } }).gsap;
          const ST = (window as unknown as { ScrollTrigger?: { getAll(): unknown[] } }).ScrollTrigger;
          if (ST) return ST.getAll().length;
          return g ? -1 : -1;
        });
      /* Wait for the count to STOP changing before calling it a baseline.

         `networkidle` is not "the page has settled" on a route that
         dynamically imports three — the hero's chunk lands after it, React
         commits, and only then does the navbar create its trigger. Reading
         immediately gave a baseline of 0 against a correct final count of 1,
         and reported a leak that did not exist.

         Three consecutive equal reads, 200ms apart. A real leak still fails;
         a slow route no longer does. */
      const settleTriggers = async () => {
        let last = -2;
        let stable = 0;
        for (let i = 0; i < 40; i += 1) {
          const n = await countTriggers();
          stable = n === last ? stable + 1 : 0;
          last = n;
          if (stable >= 2) return n;
          await page.waitForTimeout(200);
        }
        return last;
      };

      const baseline = await settleTriggers();
      if (baseline < 0) {
        out.push(
          info(
            'ScrollTrigger leak check',
            'skipped — no ScrollTriggers exist yet and gsap is not on window. Becomes binding in phase 1.',
          ),
        );
      } else {
        for (const route of RUNTIME.leakRoutes.slice(1)) {
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
        }
        const after = await settleTriggers();
        out.push(
          after === baseline
            ? pass('ScrollTrigger count returns to baseline after route changes', String(after))
            : fail('ScrollTrigger count returns to baseline after route changes', String(baseline), String(after)),
        );
      }
    } finally {
      await context.close();
    }
  }

  return out;
}

/* ── 3. registered timelines ─────────────────────────────────────────────── */

interface SerialisedTween {
  duration: number;
  ease: string;
  targets: string[];
  props: string[];
  startTime: number;
}

interface SerialisedTimeline {
  totalDuration: number;
  timeScale: number;
  tweens: SerialisedTween[];
}

async function readTimeline(page: Page, id: string): Promise<SerialisedTimeline | null> {
  return page.evaluate((tid) => {
    const reg = (window as unknown as { __TIMELINES__?: Record<string, unknown> }).__TIMELINES__;
    const tl = reg?.[tid] as
      | {
          totalDuration(): number;
          timeScale(): number;
          getChildren(nested: boolean, tweens: boolean, timelines: boolean): unknown[];
        }
      | undefined;
    if (!tl) return null;
    const children = tl.getChildren(true, true, false) as {
      duration(): number;
      startTime(): number;
      vars: Record<string, unknown>;
      targets(): unknown[];
    }[];
    return {
      totalDuration: tl.totalDuration(),
      timeScale: tl.timeScale(),
      tweens: children.map((t) => ({
        duration: t.duration(),
        ease: typeof t.vars.ease === 'string' ? t.vars.ease : 'unknown',
        targets: t.targets().map((el) => {
          const e = el as Element;
          if (!e || !e.tagName) return String(el);
          const cls = typeof e.className === 'string' ? e.className.split(/\s+/).filter(Boolean) : [];
          return `${e.tagName.toLowerCase()}${cls.map((c) => `.${c}`).join('')}`;
        }),
        props: Object.keys(t.vars).filter(
          (k) => !['ease', 'duration', 'delay', 'stagger', 'onComplete', 'onStart', 'overwrite'].includes(k),
        ),
        startTime: t.startTime(),
      })),
    };
  }, id);
}

function assertTimeline(a: TimelineAssertion, tl: SerialisedTimeline): CheckResult[] {
  const out: CheckResult[] = [];
  const near = (x: number, y: number) => Math.abs(x - y) < 0.001;

  if (a.totalDuration !== undefined) {
    out.push(
      near(tl.totalDuration, a.totalDuration)
        ? pass(`${a.id} totalDuration`, `${tl.totalDuration}s`)
        : fail(`${a.id} totalDuration`, `${a.totalDuration}s`, `${tl.totalDuration}s`),
    );
  }
  if (a.tweenCount !== undefined) {
    out.push(
      tl.tweens.length === a.tweenCount
        ? pass(`${a.id} tween count`, String(tl.tweens.length))
        : fail(`${a.id} tween count`, String(a.tweenCount), String(tl.tweens.length)),
    );
  }
  a.tweens?.forEach((want, i) => {
    const got = tl.tweens[i];
    const label = `${a.id} tween[${i}]`;
    if (!got) {
      out.push(fail(label, 'present', 'missing'));
      return;
    }
    if (want.duration !== undefined) {
      out.push(
        near(got.duration, want.duration)
          ? pass(`${label} duration`, `${got.duration}s`)
          : fail(`${label} duration`, `${want.duration}s`, `${got.duration}s`),
      );
    }
    if (want.ease !== undefined) {
      out.push(
        got.ease === want.ease
          ? pass(`${label} ease`, got.ease)
          : fail(`${label} ease`, want.ease, got.ease),
      );
    }
    if (want.target !== undefined) {
      const hit = got.targets.some((t) => t.includes(want.target!.replace(/^\./, '')));
      out.push(
        hit ? pass(`${label} target`, got.targets.join(', ')) : fail(`${label} target`, want.target, got.targets.join(', ')),
      );
    }
    if (want.props !== undefined) {
      const missing = want.props.filter((p) => !got.props.includes(p));
      out.push(
        missing.length === 0
          ? pass(`${label} props`, got.props.join(', '))
          : fail(`${label} props`, want.props.join(', '), `missing ${missing.join(', ')}`),
      );
    }
    /* The position parameter, resolved. `'<+0.3'` is relative to whatever tween
       preceded it, so the only thing that can be read back — and the only thing
       worth asserting — is the playhead it lands on. A wrong position parameter
       is otherwise completely invisible to this check: every duration and ease
       passes while the sequence plays in the wrong order. */
    if (want.startTime !== undefined) {
      const suffix = want.position ? ` (${want.position})` : '';
      out.push(
        near(got.startTime, want.startTime)
          ? pass(`${label} startTime${suffix}`, `${got.startTime}s`)
          : fail(`${label} startTime${suffix}`, `${want.startTime}s`, `${got.startTime}s`),
      );
    }
  });

  return out;
}

async function checkTimelines(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  const live = TIMELINE_ASSERTIONS.filter((a) => !a.pending);

  for (const a of TIMELINE_ASSERTIONS.filter((x) => x.pending)) {
    out.push(pending(`${a.id} — owed by phase ${a.phase}`));
  }
  if (live.length === 0) return out;

  const byPage = new Map<string, TimelineAssertion[]>();
  for (const a of live) {
    const p = a.page ?? '/';
    byPage.set(p, [...(byPage.get(p) ?? []), a]);
  }

  const { context, page } = await newPage(browser, { viewport: { w: 1512, h: 900 } });
  try {
    for (const [path, group] of byPage) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      for (const a of group) {
        const tl = await readTimeline(page, a.id);
        if (!tl) {
          out.push(fail(a.id, 'registered via registerTimeline()', 'not found in window.__TIMELINES__'));
          continue;
        }
        out.push(...assertTimeline(a, tl));

        if (a.reverseTimeScale !== undefined) {
          const ts = await page.evaluate((tid) => {
            const reg = (window as unknown as { __TIMELINES__?: Record<string, { reverse(): void; timeScale(): number }> })
              .__TIMELINES__;
            const t = reg?.[tid];
            if (!t) return null;
            t.reverse();
            return t.timeScale();
          }, a.id);
          const label = `${a.id} reverse timeScale`;
          // GSAP negates timeScale while running backwards; the magnitude is the
          // assertion. Compared as an absolute so a correct reverse does not
          // fail on its sign.
          out.push(
            ts !== null && Math.abs(ts) === a.reverseTimeScale
              ? pass(label, String(ts))
              : fail(label, String(a.reverseTimeScale), String(ts)),
          );
        }
      }
    }
  } finally {
    await context.close();
  }
  return out;
}

export async function checkMotion(browser: Browser, baseUrl: string): Promise<SectionResult> {
  const results = [
    ...checkMotionTokens(),
    ...(await checkRuntime(browser, baseUrl)),
    ...(await checkTimelines(browser, baseUrl)),
    // Behaviour: what a timeline's shape cannot tell you. See behaviour.config.ts.
    ...(await checkBehaviour(browser, baseUrl)),
  ];
  return {
    name: 'motion',
    results,
    notes: [
      'Pending entries are timelines the spec names but no phase has built yet. ' +
        'The phase that builds one flips `pending: false` in motion.config.ts.',
      'Behaviour checks drive the real interface — scroll, hover, click, Escape — ' +
        'rather than reading a registered timeline. They are the only instrument ' +
        'that catches an unwired handler, a matchMedia gate that leaks below 992, ' +
        'or a reverse running at the wrong timeScale. See behaviour.config.ts.',
    ],
  };
}
