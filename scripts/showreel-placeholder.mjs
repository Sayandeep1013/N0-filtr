/**
 * Bakes a placeholder showreel: eight seconds of our own hero, turning.
 *
 *   npm run dev                       # must be running
 *   node scripts/showreel-placeholder.mjs
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `20-components-and-motion.md` §15 is the only use of Flip on the site, and it
 * is choreography you cannot check by reading: a background layer is measured,
 * reparented across two components, and flown into a player. Built against a
 * `src` of `''`, none of it ever runs, and "implemented" would be the only
 * evidence phase 3 could offer for T3.6 — which protocol §6 does not accept.
 *
 * So the reel is real, and it is honestly a placeholder.
 *
 * ── What it shows, and why that changed ─────────────────────────────────────
 *
 * The first version recorded the **hero**: eight seconds of the aperture
 * turning under a moving pointer. Sayandeep, on the running build: *"the play
 * icon opens up the hero section itself — does that seem right? No."*
 *
 * It does not. A showreel that plays you the page you are already standing on
 * is circular, and it is the one thing a reel must not be: pressing play should
 * show you the work. So it records the **works grid** instead — a slow pass
 * down the twelve cards, which is the closest thing to a reel this build
 * actually has until phase 10 captures the deploys themselves.
 *
 * **`01-PHASES.md` T10.2 replaces it** with scripted interaction footage of the
 * eight live deploys. Nothing about the component changes when it does — only
 * the file.
 *
 * ── Why Playwright and not ffmpeg ───────────────────────────────────────────
 *
 * There is no ffmpeg on this machine. Playwright records page video natively
 * and writes webm, which is the format we want first anyway; `<video>` falls
 * back to the mp4 source when a browser cannot take it, and every browser that
 * cannot take webm is one this site's WebGL hero has already lost.
 */
import { launchGuarded } from './lib/browser.mjs';
import { mkdir, rm, rename, readdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = resolve(ROOT, '.showreel-tmp');
const OUT = resolve(ROOT, 'public/media/showreel-placeholder.webm');
const URL_ = process.env.OURS_URL ?? 'http://localhost:3000/';

const W = 1280;
const H = 720;
const SECONDS = 11;

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });
await mkdir(dirname(OUT), { recursive: true });

console.log(`▸ recording ${SECONDS}s of ${URL_} at ${W}x${H}`);

const browser = await launchGuarded();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: TMP, size: { width: W, height: H } },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.goto(URL_, { waitUntil: 'load', timeout: 90_000 });
await page.evaluate(() => document.fonts.ready);
// The loader runs on first paint and the hero fades in behind it. Let both
// finish before the recording has anything worth keeping in it.
await page.waitForTimeout(2500);

/* Start at the works grid, not at the top. The reel is about the work; the
   hero is what the visitor pressed play FROM. */
const { start, end } = await page.evaluate(() => {
  const grid = document.querySelector('[data-works-grid]');
  if (!grid) return { start: 0, end: document.documentElement.scrollHeight };
  const box = grid.getBoundingClientRect();
  return {
    start: Math.round(box.top + window.scrollY - 120),
    end: Math.round(box.bottom + window.scrollY - window.innerHeight + 200),
  };
});

/* Park the pointer off the grid. A cursor resting on a card dims the other
   eleven for the whole recording, which is a hover state rather than a reel. */
await page.mouse.move(4, 4);

/* One slow, even pass down the grid. `ease: none` on purpose — a reel that
   accelerates reads as a page being scrolled, and the cards' own parallax is
   the motion worth showing. */
const steps = SECONDS * 25;
for (let i = 0; i < steps; i += 1) {
  const y = Math.round(start + (end - start) * (i / (steps - 1)));
  await page.evaluate((to) => {
    /* Lenis sets `window.lenis = { version }` itself, so truthiness is not
       enough — see I-045. */
    const lenis = window.lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(to, { immediate: true, force: true });
    }
    else window.scrollTo(0, to);
  }, y);
  await page.waitForTimeout(1000 / 25);
}

await context.close();
await browser.close();

const [file] = await readdir(TMP);
if (!file) throw new Error('playwright wrote no video — check that the dev server is up');
await rm(OUT, { force: true });
await rename(join(TMP, file), OUT);
await rm(TMP, { recursive: true, force: true });

console.log(`✓ ${OUT.replace(ROOT, '.')}`);
console.log('  set SHOWREEL.srcWebm in lib/content/site.ts to /media/showreel-placeholder.webm');
