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
 * So the reel is real, and it is honestly a placeholder: our own homepage hero
 * with the pointer moving across it, which is the one piece of finished work
 * this build actually has. **`01-PHASES.md` T10.2 replaces it** with scripted
 * interaction footage of the eight live deploys. Nothing about the component
 * changes when it does — only the file.
 *
 * ── Why Playwright and not ffmpeg ───────────────────────────────────────────
 *
 * There is no ffmpeg on this machine. Playwright records page video natively
 * and writes webm, which is the format we want first anyway; `<video>` falls
 * back to the mp4 source when a browser cannot take it, and every browser that
 * cannot take webm is one this site's WebGL hero has already lost.
 */
import { chromium } from 'playwright';
import { mkdir, rm, rename, readdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = resolve(ROOT, '.showreel-tmp');
const OUT = resolve(ROOT, 'public/media/showreel-placeholder.webm');
const URL_ = process.env.OURS_URL ?? 'http://localhost:3000/';

const W = 1280;
const H = 720;
const SECONDS = 8;

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });
await mkdir(dirname(OUT), { recursive: true });

console.log(`▸ recording ${SECONDS}s of ${URL_} at ${W}x${H}`);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: TMP, size: { width: W, height: H } },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.goto(URL_, { waitUntil: 'load', timeout: 90_000 });
await page.evaluate(() => document.fonts.ready);
// The loader runs on first paint and the hero fades in behind it. Let both finish
// before the recording has anything worth keeping in it.
await page.waitForTimeout(2000);

/* A slow figure-of-eight across the hero. The parallax curves are damped over
   ~500ms, so a path this slow reads as the object leaning rather than snapping
   — which is the thing worth showing. */
const steps = SECONDS * 25;
for (let i = 0; i < steps; i += 1) {
  const t = i / steps;
  const x = W * (0.5 + 0.34 * Math.sin(t * Math.PI * 2));
  const y = H * (0.5 + 0.22 * Math.sin(t * Math.PI * 4));
  await page.mouse.move(x, y);
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
