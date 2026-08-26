import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Browser } from 'playwright';
import { newPage, waitForLoaderGone } from './lib/browser';
import { fail, info, pass, pending, type CheckResult, type SectionResult } from './lib/types';
import { AGENT_JUDGEMENT, SHOTS, VIEWPORTS, type Shot } from './visual.config';

/**
 * verify:visual — composition, ours against theirs.
 *
 * Catches: wrong layout, spacing, vertical rhythm, type scale in situ.
 * Misses: timing. That is verify:motion's job.
 *
 * This check does not pass or fail on its own. It produces a contact sheet and
 * requires the agent to look at it and record a judgement — see AGENT_JUDGEMENT
 * in visual.config.ts.
 */

const OUT_DIR = join(process.cwd(), 'tools', 'verify', 'output');
const SHOT_DIR = join(OUT_DIR, 'shots');
const REF_DIR = join(process.cwd(), 'docs', 'research', 'screens');

interface Taken {
  shot: Shot;
  viewport: { w: number; h: number };
  ourPath: string;
  refPath: string | null;
}

function contactSheet(taken: Taken[]): string {
  const rel = (p: string) => relative(OUT_DIR, p).replaceAll('\\', '/');

  const rows = taken
    .map(({ shot, viewport, ourPath, refPath }) => {
      const theirs = refPath
        ? `<img src="${rel(refPath)}" alt="tonik ${shot.name}">`
        : `<div class="none">no reference capture for this shot</div>`;
      return `
    <section>
      <h2>${shot.name} <span class="vp">${viewport.w}×${viewport.h}</span>
        <span class="route">${shot.ours}${shot.scroll ? ` @ scroll ${shot.scroll}` : ''}</span></h2>
      <div class="pair">
        <figure><figcaption>ours</figcaption><img src="${rel(ourPath)}" alt="ours ${shot.name}"></figure>
        <figure><figcaption>tonik</figcaption>${theirs}</figure>
      </div>
    </section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>No Filter — visual contact sheet</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; padding:2rem; background:#161616; color:#efefef;
         font:14px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
  h1 { font-size:1.25rem; font-weight:400; margin:0 0 .25rem; }
  .lede { color:#9a9a9a; margin:0 0 2rem; max-width:64ch; }
  section { margin-bottom:3rem; }
  h2 { font-size:.8rem; font-weight:400; text-transform:uppercase; letter-spacing:.06em;
       margin:0 0 .5rem; display:flex; gap:1rem; align-items:baseline; }
  .vp, .route { color:#737373; text-transform:none; letter-spacing:0; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  figure { margin:0; }
  figcaption { color:#737373; font-size:.7rem; text-transform:uppercase;
               letter-spacing:.06em; margin-bottom:.35rem; }
  img { width:100%; height:auto; display:block; border:1px solid #3b3b3b; background:#212121; }
  .none { border:1px dashed #3b3b3b; color:#737373; padding:2rem; text-align:center; }
</style></head><body>
<h1>Visual contact sheet</h1>
<p class="lede">Ours on the left, tonik on the right. Content differs by design — judge
<strong>composition</strong>: gutters, type scale, vertical rhythm, and the relationship of
elements to each other. Record your judgement in <code>tools/verify/visual.config.ts</code>.</p>
${rows}
</body></html>`;
}

export async function checkVisual(browser: Browser, baseUrl: string): Promise<SectionResult> {
  const results: CheckResult[] = [];
  mkdirSync(SHOT_DIR, { recursive: true });

  const taken: Taken[] = [];
  const live = SHOTS.filter((s) => !s.pending);

  for (const s of SHOTS.filter((x) => x.pending)) {
    results.push(pending(`${s.name} — owed by phase ${s.phase}`));
  }

  for (const viewport of VIEWPORTS) {
    const { context, page } = await newPage(browser, { viewport: { w: viewport.w, h: viewport.h } });
    try {
      for (const shot of live) {
        /* A shot can be desktop-only. See `minWidth` in visual.config.ts. */
        if (shot.minWidth !== undefined && viewport.w < shot.minWidth) continue;
        const label = `${shot.name} @${viewport.w}`;
        try {
          await page.goto(`${baseUrl}${shot.ours}`, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          /* Wait for the loader to be GONE, not for a guess at how long it
             takes. Phase 5 gave it a mark animation on first paint, so 900ms
             stopped being enough and every shot was of a covered page. */
          await waitForLoaderGone(page);

          const target = shot.ourSection ?? shot.ourScroll ?? shot.scroll;
          if (target !== undefined) {
            await page.evaluate((y) => {
              const max = document.documentElement.scrollHeight - window.innerHeight;
              let to: number;
              if (typeof y === 'string' && y !== 'bottom') {
                /* A selector. Resolved here rather than passed in as a number,
                   because the number is different every phase — see
                   `ourSection` in visual.config.ts. */
                const el = document.querySelector(y);
                to = el ? Math.min(el.getBoundingClientRect().top + window.scrollY, max) : 0;
              } else {
                to = y === 'bottom' ? max : Math.min(y as number, max);
              }
              // Go past Lenis rather than through it: window.scrollTo fights a
              // smooth-scroll library and lands somewhere between the two.
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
            }, target);
            /* Long enough for what a scroll starts to finish.

               600ms was fine while the only scrolled shot was the footer.
               Phase 4's cards reveal on entry over 1.05s — a 0.75s wipe, then
               the badge and the caption fading in behind it — so a 600ms
               settle photographed every card mid-reveal: half-faded chips and
               captions at a third opacity, which reads as a styling bug in a
               contact sheet and is not one. The scrubbed word reveal has the
               same shape of problem: `scrub: 1` eases the playhead over about a
               second after the scroll stops.

               Same lesson as SCRUB_SETTLE_MS in behaviour.home.ts — when a
               check looks wrong around an animation, ask what the animation was
               doing when you looked. */
            await page.waitForTimeout(1800);
          }

          if (shot.prepare === 'contact-open') {
            // Below 992 the CTA lives inside the collapsed menu — the same place
            // tonik puts it — so the burger has to come first.
            const burger = page.locator('.nav__burger');
            if (await burger.isVisible()) {
              await burger.click();
              await page.waitForTimeout(700);
            }
            await page.locator('[data-contact]').first().click();
            // The open timeline is 1.5s.
            await page.waitForTimeout(1900);
          } else if (shot.prepare === 'nav-menu-open') {
            const burger = page.locator('.nav__burger');
            if (await burger.isVisible()) {
              await burger.click();
              await page.waitForTimeout(800);
            }
          } else if (shot.prepare === 'accordion-open') {
            /* Open the first row, then re-settle: the row grows by most of a
               viewport, so everything the shot is aimed at has moved. Scrolling
               again after the open is not belt-and-braces, it is the only way
               the frame contains what it is supposed to. */
            const head = page.locator('[data-service-row] button').first();
            if ((await head.count()) > 0) {
              await head.click();
              await page.waitForTimeout(1600);
              await page.evaluate(() => {
                const section = document.querySelector('[data-services]');
                if (!section) return;
                const to = section.getBoundingClientRect().top + window.scrollY;
                const raw = (window as unknown as { lenis?: { scrollTo?: unknown } }).lenis;
                const lenis =
                  raw && typeof raw.scrollTo === 'function'
                    ? (raw as { scrollTo(v: number, o?: object): void })
                    : null;
                if (lenis) lenis.scrollTo(to, { immediate: true, force: true });
                else window.scrollTo(0, to);
              });
              await page.waitForTimeout(900);
            }
          } else if (shot.prepare === 'showreel-open') {
            /* The trigger only exists when a reel file does — `<PlaySquare>` is
               a plain span otherwise, deliberately (I-033). No trigger means the
               shot is of the resting hero, which is the honest picture of that
               state rather than a failure. */
            const trigger = page.locator('h1 button').first();
            if ((await trigger.count()) > 0) {
              await trigger.click();
              // Flip is 1s and the open timeline runs to 1.3s; let it settle,
              // and give the video a moment to paint its first frame.
              await page.waitForTimeout(2600);
            }
          }

          const ourPath = join(SHOT_DIR, `${shot.name}-${viewport.w}.png`);
          await page.screenshot({ path: ourPath });

          const refPath = shot.reference ? join(REF_DIR, shot.reference) : null;
          const refExists = refPath !== null && existsSync(refPath);
          taken.push({ shot, viewport, ourPath, refPath: refExists ? refPath : null });

          results.push(
            pass(label, refExists ? 'captured, reference paired' : 'captured, no reference'),
          );
        } catch (err) {
          results.push(fail(label, 'screenshot', (err as Error).message));
        }
      }
    } finally {
      await context.close();
    }
  }

  const sheetPath = join(OUT_DIR, 'contact-sheet.html');
  writeFileSync(sheetPath, contactSheet(taken), 'utf8');
  results.push(info('contact sheet', relative(process.cwd(), sheetPath).replaceAll('\\', '/')));

  return {
    name: 'visual',
    results,
    ...(AGENT_JUDGEMENT ? { judgement: AGENT_JUDGEMENT } : {}),
  };
}
