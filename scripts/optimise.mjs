/**
 * Turns the raw captures into posters the site can actually ship.
 * `01-PHASES.md` T10.6, pulled forward with T10.1.
 *
 *   node scripts/optimise.mjs
 *
 * ── Why it exists ───────────────────────────────────────────────────────────
 *
 * `scripts/capture.mjs` writes 2× PNGs, which is the right thing for a source
 * file and the wrong thing for a page. The largest came back at 980KB against a
 * **250KB** poster budget (`tools/verify/budget.config.ts`) — twelve of those
 * on the homepage would be 11MB of a 1.8MB total.
 *
 * ── What it does ────────────────────────────────────────────────────────────
 *
 * Two widths, WebP, from the same source:
 *
 *   · **1x** at 1440 — what a card asks for at 1512, and what the case-study
 *     hero uses below its own breakpoint
 *   · **2x** at 2880 — for the case-study hero, which is full-bleed, and for
 *     retina cards
 *
 * WebP rather than AVIF, and that is a deliberate choice rather than an
 * oversight. AVIF is smaller at the same quality and it is **slow to decode on
 * a low-end phone** — noticeably so above about a megapixel, which every one of
 * these is. The site's whole argument is that it is fast on a real device, and
 * a format that wins the network and loses the main thread is not the trade to
 * take for a poster behind a hover.
 *
 * The PNGs are kept. They are the negatives: re-deriving a poster from a
 * re-encoded poster loses a generation every time, and the capture script's
 * whole point is that a re-run should be reproducible.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'public/media/works');
const OUT = resolve(ROOT, 'public/media/works');

/** Quality 80 is the knee: below it the UI text in these screenshots softens. */
const QUALITY = 80;
const WIDTHS = [
  { suffix: '', width: 1440 },
  { suffix: '@2x', width: 2880 },
];

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));
if (files.length === 0) {
  console.error('nothing to optimise — run `npm run capture` first');
  process.exit(1);
}

console.log(`▸ optimising ${files.length} captures`);
let worst = 0;
let worstName = '';

for (const file of files.sort()) {
  const slug = basename(file, '.png');
  const source = resolve(SRC, file);

  for (const { suffix, width } of WIDTHS) {
    const out = resolve(OUT, `${slug}${suffix}.webp`);
    await sharp(source)
      /* `withoutEnlargement` so a capture that came back smaller than the
         target is not upscaled into softness — better a slightly small poster
         than a blurred one. */
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);

    const { size } = await stat(out);
    const kb = size / 1024;
    if (suffix === '' && kb > worst) {
      worst = kb;
      worstName = `${slug}.webp`;
    }
    console.log(`  ${slug}${suffix}.webp  ${kb.toFixed(0)}KB`);
  }
}

console.log(`\nlargest 1x poster: ${worstName} at ${worst.toFixed(0)}KB (budget 250KB)`);
if (worst > 250) {
  console.log('⚠ over budget — lower QUALITY or the 1x width in this script.');
}
