/**
 * Bakes the hero's no-WebGL fallback still.
 *
 *   npm run dev            # in another shell
 *   npm run hero:fallback
 *
 * Writes `public/hero-aperture.webp` — the 2400×1600 image
 * `50-brand-and-3d.md` §2 "Fallback" specifies, shown when
 * `WebGLRenderingContext` is absent.
 *
 * ── Why it renders through the reduced-motion path ──────────────────────────
 * §2 asks for "the assembly at its load-in pose", and the load-in ends with the
 * assembly still turning — so there is no single frame that is *the* pose unless
 * one is chosen. §2 already chose one for a different reason: the reduced-motion
 * path renders exactly one frame at `rotation.y = 0.4` and stops.
 *
 * Emulating `prefers-reduced-motion: reduce` therefore gives a pose that is
 * deterministic, specced, and reproducible — and it means the two degraded paths
 * show the identical image, which is the right answer anyway. A visitor with no
 * WebGL and a visitor who asked for no motion should not see two different
 * heroes.
 *
 * It drives the real page rather than re-implementing the scene, so the fallback
 * cannot drift from what the scene actually renders.
 */
import { launchGuarded } from './lib/browser.mjs';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/hero-aperture.webp');
const URL_ = process.env.HERO_URL ?? 'http://localhost:3000/';

/** §2: 2400×1600. Rendered at 1200×800 with a 2× device pixel ratio. */
const WIDTH = 1200;
const HEIGHT = 800;
const SCALE = 2;

const browser = await launchGuarded({
  // Headless Chromium has no GPU; SwiftShader gives it a real WebGL context so
  // the still is rendered by the actual scene rather than by a stub.
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));

  await page.goto(URL_, { waitUntil: 'load' });

  await page.waitForFunction(
    () => window.__HERO__ && window.__HERO__.mode === 'webgl',
    null,
    { timeout: 30_000 },
  );

  const state = await page.evaluate(() => window.__HERO__);
  if (state?.running) {
    throw new Error(
      'the hero loop is running under prefers-reduced-motion — the still would ' +
        'catch an arbitrary frame. Fix the reduced-motion path before baking.',
    );
  }
  console.log(`  scene: ${state?.triangles} triangles, loop stopped`);

  /* Playwright's element screenshot clips the PAGE to the element's box — it
     does not isolate the element. The hero is inset:0, so its box is the whole
     viewport and the first bake came back with the navbar, the footer and the
     wordmark painted over the canvas. Hide everything else first. */
  await page.addStyleTag({
    content: 'body > *:not(.hero-3d){visibility:hidden !important}',
  });

  const canvas = page.locator('[data-hero-3d] canvas');
  const png = await canvas.screenshot({ omitBackground: true });

  await mkdir(dirname(OUT), { recursive: true });
  /* Flattened onto the page ground rather than kept transparent: the element is
     an <img> behind the copy, and a transparent WebP would composite against
     whatever is behind it while the real canvas composites against --black. */
  const info = await sharp(png)
    .flatten({ background: '#212121' })
    .resize(WIDTH * SCALE, HEIGHT * SCALE, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(OUT);

  console.log(`  ${OUT.replace(ROOT, '.')}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)}KB`);
  console.log('✓ hero fallback written');
} finally {
  await browser.close();
}
