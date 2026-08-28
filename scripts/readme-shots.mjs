/**
 * Regenerates the screenshots the README embeds.
 *
 *   npm run dev                 # in one terminal
 *   node scripts/readme-shots.mjs
 *   node scripts/readme-shots.mjs works-grid plate   # just these two
 *
 * ── Why this is a script and not a habit ────────────────────────────────────
 *
 * The README's images went stale the moment round 9 landed: the wire rig grew
 * two poles, every card's plate was redrawn, and the services list gained a
 * sixth row. A README whose pictures show a previous version of the site is
 * worse than one with no pictures, because it is confidently wrong.
 *
 * They had been taken by hand. Doing it by hand again means re-deciding seven
 * framings, and re-deciding them differently, which is how a set of screenshots
 * stops looking like a set. Every framing below is now written down.
 *
 * ── The two things that make these usable ───────────────────────────────────
 *
 * **It waits for the loader.** Since D-061 the loader runs a full assembly
 * sequence on first paint and again on every navigation, so a naive screenshot
 * catches a grey panel with a wheel on it. Every shot waits for `.loader` to go
 * `display: none` first.
 *
 * **It scrolls with `window.scrollTo` in a short loop, not `scrollBy`.** Lenis
 * owns the scroll and smooths anything it sees; a single jump gets eased away
 * and a negative delta gets fought. Setting the same absolute target a few
 * times lets the smoothing converge on it.
 *
 * The browser comes from `launchGuarded` — see that file for why a leaked
 * headless Chromium on this site is not an idle process (I-057).
 */
import { launchGuarded } from './lib/browser.mjs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'docs/screenshots');
const BASE = process.env.SHOT_BASE ?? 'http://localhost:3000';

/** 2× everywhere, so the images stay sharp on the retina displays that read a README. */
const SCALE = 2;

/**
 * `element` frames the shot on a selector's box, padded. `scroll` parks the
 * page at an absolute offset first. `viewport` overrides the default desktop.
 */
const SHOTS = [
  {
    name: 'home-hero',
    path: '/',
    note: 'the WebGL aperture, above the fold',
    viewport: { width: 1512, height: 900 },
  },
  {
    name: 'works-grid',
    path: '/works',
    note: 'two cards and their specimen plates',
    viewport: { width: 1512, height: 900 },
    scroll: 700,
  },
  {
    name: 'plate',
    path: '/works',
    note: 'one plate, close — the round-9 headline change',
    viewport: { width: 1512, height: 900 },
    scroll: 380,
    element: '[data-work-card] [data-work-media]',
    pad: 0,
  },
  {
    name: 'case-study',
    path: '/works/tessera',
    note: 'the board, three plates deep',
    viewport: { width: 1512, height: 900 },
    scroll: 2200,
  },
  {
    /* The rig is ~1820px tall at 1512 wide. The viewport has to clear it, or
       the clip falls outside the image and Playwright throws rather than
       cropping — which is the right behaviour and a confusing error. */
    name: 'wire-rig',
    path: '/',
    note: 'all six frames wired, since D-058',
    viewport: { width: 1512, height: 1980 },
    element: '[data-wire-rig]',
    pad: 48,
  },
  {
    name: 'about-people',
    path: '/about',
    note: 'the pinned artefact wall',
    viewport: { width: 1512, height: 900 },
    scroll: 4200,
  },
  {
    name: 'block-pit',
    path: '/',
    note: 'the pit over the hollow wordmark',
    viewport: { width: 1512, height: 900 },
    scroll: 'bottom',
    settle: 3500,
  },
  {
    name: 'mobile-home',
    path: '/',
    note: 'the hero at 390',
    viewport: { width: 390, height: 844 },
  },
];

const wanted = process.argv.slice(2);
const targets = wanted.length > 0 ? SHOTS.filter((s) => wanted.includes(s.name)) : SHOTS;
if (targets.length === 0) {
  console.error(`no shot matched ${wanted.join(', ')}. Known: ${SHOTS.map((s) => s.name).join(', ')}`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const browser = await launchGuarded();

for (const shot of targets) {
  const page = await browser.newPage({
    viewport: shot.viewport ?? { width: 1512, height: 900 },
    deviceScaleFactor: SCALE,
  });

  await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle' });

  /* The loader owns the screen for the length of its sequence plus the curtain.
     Waiting on the element rather than on a duration keeps this correct if the
     timings are ever retuned. */
  await page
    .waitForFunction(
      () => {
        const panel = document.querySelector('.loader');
        return !panel || getComputedStyle(panel).display === 'none';
      },
      { timeout: 20000 },
    )
    .catch(() => console.warn(`  ! ${shot.name}: loader never cleared, shooting anyway`));

  /* An element shot has to be *in* the viewport before it can be clipped, and
     where it is on the page is the element's own business — so the scroll
     target is derived from it rather than written down beside it. */
  if (shot.element && shot.scroll === undefined) {
    const top = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    }, shot.element);
    if (top !== null) shot.scroll = Math.max(0, top - (shot.pad ?? 0) - 12);
  }

  if (shot.scroll !== undefined) {
    const target =
      shot.scroll === 'bottom'
        ? await page.evaluate(() => document.body.scrollHeight)
        : shot.scroll;
    /* Lenis smooths whatever it sees; setting the same absolute target a few
       times lets it converge instead of easing the jump away. */
    for (let i = 0; i < 6; i += 1) {
      await page.evaluate((y) => window.scrollTo(0, y), target);
      await page.waitForTimeout(250);
    }
  }

  await page.waitForTimeout(shot.settle ?? 2200);

  const file = resolve(OUT, `${shot.name}.png`);
  if (shot.element) {
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, shot.element);
    if (!box) {
      console.warn(`  ! ${shot.name}: ${shot.element} not found, shooting the viewport`);
      await page.screenshot({ path: file });
    } else {
      /* Clamped to the viewport on every side. Playwright throws on a clip that
         falls outside the image rather than cropping it, so the arithmetic has
         to be right here rather than forgiving downstream. */
      const pad = shot.pad ?? 0;
      const vw = shot.viewport?.width ?? 1512;
      const vh = shot.viewport?.height ?? 900;
      const x = Math.max(0, Math.min(box.x - pad, vw - 1));
      const y = Math.max(0, Math.min(box.y - pad, vh - 1));
      await page.screenshot({
        path: file,
        clip: {
          x,
          y,
          width: Math.max(1, Math.min(box.width + pad * 2, vw - x)),
          height: Math.max(1, Math.min(box.height + pad * 2, vh - y)),
        },
      });
    }
  } else {
    await page.screenshot({ path: file });
  }

  console.log(`✓ ${shot.name.padEnd(14)} ${shot.note}`);
  await page.close();
}

await browser.close();
console.log(`\n${targets.length} shot(s) → docs/screenshots/`);
