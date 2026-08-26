/**
 * Captures the live deploys. `01-PHASES.md` T10.1, pulled forward.
 *
 *   node scripts/capture.mjs              # everything
 *   node scripts/capture.mjs tessera      # one work
 *
 * ── Why this is running in phase 6 rather than phase 10 ─────────────────────
 *
 * Phase 6 builds the first case study, and eleven more inherit its pattern.
 * A case-study template judged against empty rectangles is a template judged
 * against nothing — the whole question is how the page carries an image, and
 * the generated accent covers (I-035) were built to make the *grid* judgeable,
 * not a full-bleed hero.
 *
 * It also closes I-035 for the works grid at the same time, because a poster is
 * a poster.
 *
 * ── What it does and does not do ────────────────────────────────────────────
 *
 * Stills, at 2×, of pages that are ours. Eight of the twelve works have a live
 * deploy; the other four (Santioni, ReelShell, Solidus, DroidDoodle) are
 * archived, native or terminal apps with nothing to point a browser at, and
 * they keep their generated covers until someone records them by hand.
 *
 * It does **not** capture anyone else's site. Every URL below is a deploy of
 * ours, listed in `40-content-model.md` §2.
 *
 * ── The two things that make a capture usable rather than merely present ────
 *
 * **It waits for the page, not for the network.** `networkidle` on an app that
 * streams or polls never fires; on one that lazy-loads, it fires before the
 * content. So it waits for fonts, then for the first real paint it can detect,
 * then a settle.
 *
 * **It scrolls to the bottom and back before shooting.** Almost every app on
 * this list lazy-loads something below the fold, and a screenshot taken without
 * that shows a page full of placeholder skeletons — which looks exactly like
 * our own site's placeholder problem and would have been a very confusing
 * screenshot to debug later.
 */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/media/works');

/** Every work with something a browser can open. `40-content-model.md` §2. */
const TARGETS = [
  /* Three widths, because the case study has something to say about them: a
     code-native editor whose canvas is a document has to reflow its chrome
     without reflowing the document, and showing that is the point. The extra
     two are real screens of the real app, not crops of the first. */
  { slug: 'tessera', url: 'https://tessera-brown-pi.vercel.app', settle: 6000 },
  { slug: 'tessera-wide', url: 'https://tessera-brown-pi.vercel.app', settle: 6000, viewport: { width: 1920, height: 900 } },
  { slug: 'tessera-narrow', url: 'https://tessera-brown-pi.vercel.app', settle: 6000, viewport: { width: 900, height: 900 } },
  { slug: 'co-canvas', url: 'https://co-canvas-web.vercel.app' },
  /* Render's free tier cold-starts, and the first paint after one is a spinner
     or an error page. */
  { slug: 'discvault', url: 'https://discvault.onrender.com', settle: 9000 },
  { slug: 'rein-bot', url: 'https://sayandeep1013.github.io/Rein-Bot' },
  { slug: 'valobot', url: 'https://valobot.vercel.app', settle: 6000 },
  { slug: 'termtypo', url: 'https://termtypo.vercel.app' },
  /* Caught mid-load on the first run — the title card was up and the progress
     bar was still filling. A game boots on its own schedule and no readiness
     signal we can see from outside covers it. */
  { slug: 'ftc', url: 'https://ftc-game.vercel.app', settle: 9000 },
  { slug: 'notetakerxx', url: 'https://rein-note.vercel.app' },
];

/** The default settle. Overridden per target above where one run proved it. */
const SETTLE = 2500;

/**
 * 16:10 to match the work card's own media box, and 2× so a card that is 1316
 * wide on a retina display still has real pixels behind it.
 */
const SHOT = { width: 1440, height: 900 };
const SCALE = 2;

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.slug === only) : TARGETS;
if (targets.length === 0) {
  console.error(`no target matches "${only}". known: ${TARGETS.map((t) => t.slug).join(', ')}`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const target of targets) {
  const context = await browser.newContext({
    viewport: target.viewport ?? SHOT,
    deviceScaleFactor: SCALE,
    /* Several of these are games and dashboards that ask. Refusing quietly is
       better than a permission dialog in the middle of the screenshot. */
    permissions: [],
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  try {
    console.log(`▸ ${target.slug}  ${target.url}`);
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.evaluate(() => document.fonts.ready).catch(() => undefined);

    /* Wake anything that lazy-loads, then come back. See the note above. */
    await page
      .evaluate(async () => {
        const step = (y) => new Promise((r) => { window.scrollTo(0, y); setTimeout(r, 150); });
        const height = document.documentElement.scrollHeight;
        for (let y = 0; y < height; y += window.innerHeight * 0.9) await step(y);
        await step(0);
      })
      .catch(() => undefined);

    await page.waitForTimeout(target.settle ?? SETTLE);

    const file = resolve(OUT, `${target.slug}.png`);
    await page.screenshot({ path: file });
    results.push({ slug: target.slug, ok: true });
    console.log(`  ✓ ${file.replace(ROOT, '.')}`);
  } catch (error) {
    /* One dead deploy must not cost the other seven. Recorded and reported at
       the end rather than thrown — a partial capture is useful and a crashed
       script is not. */
    results.push({ slug: target.slug, ok: false, why: String(error).split('\n')[0] });
    console.log(`  ✗ ${target.slug}: ${String(error).split('\n')[0]}`);
  } finally {
    await context.close();
  }
}

await browser.close();

/* A manifest, so `lib/content/works.ts` can be told what exists rather than
   guessing, and so a later run can be diffed against this one.

   **Merged, not replaced.** Re-capturing one target is the common case — a
   deploy that cold-started, a game caught mid-load — and writing a fresh
   manifest from a single-target run would delete the other seven entries while
   their PNGs sat right there on disk. The failures list is rebuilt only for the
   targets this run actually attempted, for the same reason. */
const previous = await readFile(resolve(OUT, 'manifest.json'), 'utf8')
  .then((raw) => JSON.parse(raw))
  .catch(() => ({ works: {}, failed: [] }));

const attempted = new Set(results.map((r) => r.slug));
const manifest = {
  capturedAt: new Date().toISOString(),
  viewport: SHOT,
  scale: SCALE,
  works: {
    ...previous.works,
    ...Object.fromEntries(
      results.filter((r) => r.ok).map((r) => [r.slug, `/media/works/${r.slug}.png`]),
    ),
  },
  failed: [
    ...(previous.failed ?? []).filter((f) => !attempted.has(f.slug)),
    ...results.filter((r) => !r.ok),
  ],
};
await writeFile(resolve(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const ok = results.filter((r) => r.ok).length;
console.log(`\n${ok}/${results.length} captured → ${OUT.replace(ROOT, '.')}`);
if (manifest.failed.length > 0) {
  console.log('failed:', manifest.failed.map((f) => f.slug).join(', '));
}
