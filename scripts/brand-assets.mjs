/**
 * Generates every raster brand asset from one source of truth.
 *
 *   npm run brand:assets
 *
 * Outputs (all committed):
 *   app/icon.svg              64×64   the favicon, scalable — covers the 32 case
 *   app/apple-icon.png        180×180 the iOS home-screen tile
 *   public/icon-512.png       512×512 referenced by app/manifest.ts
 *   app/opengraph-image.png   1200×630 glyph + wordmark on --black
 *
 * docs/spec/50-brand-and-3d.md §4 names 32 / 180 / 512 for the favicon and
 * 1200×630 for the OG card.
 *
 * WHY A SCRIPT AND NOT next/og. `ImageResponse` cannot load a woff2, and
 * General Sans ships from Fontshare as a variable woff2 only — an OG card set in
 * a substitute face would misrepresent the wordmark, which is the one thing the
 * card exists to show. Playwright is already a devDependency for the verify
 * harness, it renders the real face, and the output is a static file with zero
 * runtime cost. The trade is that the assets are generated at author time and
 * committed rather than rendered on request; they change about as often as the
 * brand does.
 *
 * The aperture below is the same four ratios as components/brand/ApertureMark.tsx.
 * If those ever diverge, this comment is the bug report.
 */
import { launchGuarded } from './lib/browser.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ── the mark, from the spec's ratios ─────────────────────────────────────── */
const SIZE = 48;
const C = SIZE / 2;
const RING = SIZE / 12; // stroke weight: 1/12 of the diameter
const R = (SIZE - RING) / 2; // centreline radius
const TICK = R / 6; // tick length: 1/6 of the radius
const TICK_STROKE = RING / 2; // half the ring's weight — I-009
const OFF = 8; // degrees off-radial

/* ── the tilt ────────────────────────────────────────────────────────────────
   Sayandeep, 2026-08-26: *"add a logo, tilted wheel kinda"*, then *"the logo at
   the tab bar still isn't visible."* The two numbers are the same ones
   `components/brand/ApertureMark.tsx` uses, which are themselves read off
   `apertureScene.ts` — the exact attitude of the 3D object in the hero.

   ── Why the tilt is computed rather than applied as a transform ─────────────

   It was `rotate(A) scale(1, k) rotate(-A)` first, which is the obvious way and
   **squashes the stroke**. At 64px that is invisible; at the 16px a browser tab
   actually asks for, the two thin sides of the ellipse fall below a pixel and
   drop out, and the ring renders as a broken C. Which is what "not visible in
   the tab" turned out to mean — it was there, and it was not a ring.

   A circle tilted by φ about an in-plane axis projects to an ellipse with
   semi-axes `R` along the axis and `R·cos φ` across it, so it can be drawn
   directly, with a stroke that never scales. The blades go through the same
   matrix as points.

   This also has to survive being rasterised: `sharp` renders this SVG to the
   apple icon, the 512 tile and the OG card, and `vector-effect:
   non-scaling-stroke` — the one-line alternative — is a browser feature that
   non-browser rasterisers do not reliably implement. Computed geometry needs
   nothing from the renderer. */
/* Negative, to match the 3D object. Three's y axis points up and SVG's points
   down, so the same angle mirrors between them — see the long note on
   `TILT_AXIS_DEGREES` in `components/brand/ApertureMark.tsx`, and D-036. Keep
   this in step with that file: they draw the same mark. */
const TILT_AXIS = -51.1;
const TILT_SQUASH = 0.7247;

/**
 * A point pushed through the tilt: rotate(-A), squash Y, rotate(A), about the
 * mark's centre. SVG's y axis points down, so rotate is clockwise and its
 * matrix is [cos, -sin; sin, cos].
 */
function tiltPoint(x, y) {
  const a = (TILT_AXIS * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = x - C;
  const dy = y - C;
  const rx = dx * cos + dy * sin;
  const ry = (-dx * sin + dy * cos) * TILT_SQUASH;
  return [C + rx * cos - ry * sin, C + rx * sin + ry * cos];
}

const round = (n) => +n.toFixed(4);

/* ── the favicon is a different cut of the same mark ─────────────────────────
   Sayandeep, twice: *"the logo at the tab bar still isn't visible."* The first
   answer was the tilt squashing the stroke, and fixing that was necessary and
   not sufficient.

   The remaining problem is simply that **a browser tab is 16 pixels.** The mark
   is drawn at the spec's ratios — a ring 1/12 of the diameter, six blades at
   half that — and at 16px those come out at roughly one device pixel and one
   half of one. A half-pixel line does not render; it renders as a suggestion.

   So the icon gets its own weights. This is what a type designer would call an
   optical size and it is the ordinary practice for marks that have to work at
   16px and at 512: the *shape* is identical — the same tilted ring, the same
   six blades at the same stations and the same 8 degree lean — and the strokes
   are cut heavier so they survive the raster.

   `emphasis` is 1 for the large renderings, where the spec's own ratios are
   correct and a heavier mark would look clumsy. The 512 tile and the OG card
   pass 1; only `icon.svg` asks for more. */
/* Tuned by rendering, not by taste. At 1.9x / 2.3x the ring and the six blades
   very nearly met and the mark read as a cog — recognisable, and not this mark.
   These keep the bore open at roughly 57% of the radius, which is where the
   thing still reads as a ring with its blades retracted. */
const BOLD_RING = 1.5;
const BOLD_TICK = 1.7;
const BOLD_TICK_LENGTH = 1.2;

/**
 * The mark's inner geometry, unpositioned. `stroke` is a literal colour.
 *
 * `bold` cuts the strokes heavier for the favicon — see above. It changes no
 * position and no angle, so the two renderings are the same drawing.
 */
function apertureGroup(stroke, bold = false) {
  const ring = bold ? RING * BOLD_RING : RING;
  const tickStroke = bold ? TICK_STROKE * BOLD_TICK : TICK_STROKE;
  const tickLength = bold ? TICK * BOLD_TICK_LENGTH : TICK;
  /* The ring grows inward from the same centreline, so the mark keeps its
     footprint in the tile however heavy the stroke is. */
  const radius = R - (ring - RING) / 2;
  const inner = radius - ring / 2;

  const lean = (OFF * Math.PI) / 180;

  const ticks = Array.from({ length: 6 }, (_, i) => {
    const station = ((i * 60) * Math.PI) / 180;

    /* The blade's own two rotations resolved as points, then tilted — see the
       note on TILT_AXIS. A point `r` along the blade from its anchor on the
       inner edge starts at (C, C - INNER + r); rotate it 8 degrees about that
       anchor, then to its 60 degree station about the centre, then tilt. */
    const place = (r) => {
      const px = C - Math.sin(lean) * r;
      const py = C - inner + Math.cos(lean) * r;
      const dx = px - C;
      const dy = py - C;
      const rx = C + dx * Math.cos(station) - dy * Math.sin(station);
      const ry = C + dx * Math.sin(station) + dy * Math.cos(station);
      return tiltPoint(rx, ry);
    };

    const [x1, y1] = place(0);
    const [x2, y2] = place(tickLength);
    return `      <line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"/>`;
  }).join('\n');

  return [
    `  <g fill="none" stroke="${stroke}">`,
    `    <ellipse cx="${C}" cy="${C}" rx="${radius}" ry="${round(radius * TILT_SQUASH)}" stroke-width="${round(ring)}" transform="rotate(${TILT_AXIS} ${C} ${C})"/>`,
    `    <g stroke-width="${round(tickStroke)}" stroke-linecap="round">`,
    ticks,
    `    </g>`,
    `  </g>`,
  ].join('\n');
}

/* An XML comment may not contain a double hyphen — the spec is unambiguous and
   the consequence is total: a strict parser rejects the whole document, and
   every SVG parser is strict.

   `app/icon.svg` shipped with `--black` inside its banner from phase 2 until
   phase 6, which made it **invalid XML**. Browsers did not draw a broken icon;
   they drew no icon, because the file never parsed. Sayandeep reported the
   favicon missing three times and the first two fixes were real improvements to
   a file that was never being read. See I-049.

   So the banner is written with the token names spelled out rather than quoted,
   and this guard turns any that creep back into an en dash. Cheap, and it
   removes a whole class of "why is the icon gone" from the future. */
const banner = (body) => `<!--${body.replace(/--+/g, '–')}-->`;

const SVG_HEADER = banner(`
  GENERATED by scripts/brand-assets.mjs — run \`npm run brand:assets\`. Do not
  hand-edit; edit the script.

  The No Filter mark as the favicon. docs/spec/50-brand-and-3d.md §1 and §4. Its
  geometry is the same four ratios as components/brand/ApertureMark.tsx, so the
  favicon and the on-page glyph cannot drift apart.

  Two differences from the component, both forced by the medium. The colours are
  literal, because a standalone SVG has nothing to inherit \`currentColor\` from.
  And it sits on a filled black tile rather than on transparency: a white mark
  on a transparent ground disappears against a light browser tab and a black one
  disappears against a dark tab, so the tile is what makes it survive both.

  The mark occupies 48 of the 64-unit tile — a 12.5% safe area on each side,
  which keeps it clear of the rounding some platforms apply.
`);

/** A standalone tile: the mark on a filled --black ground, with a safe area. */
/**
 * `bold` cuts heavier strokes for the raster sizes a browser tab actually asks
 * for. Only `icon.svg` passes it — the apple icon, the 512 tile and the OG card
 * are all rendered large, where the spec's own ratios are right and a heavier
 * mark would look clumsy. See the note on BOLD_RING.
 */
function tileSvg(px, header = false, bold = false) {
  const TILE = 64;
  const pad = (TILE - SIZE) / 2;
  return [
    ...(header ? [SVG_HEADER] : []),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="${px}" height="${px}">`,
    `  <rect width="${TILE}" height="${TILE}" fill="#212121"/>`,
    `  <g transform="translate(${pad} ${pad})">`,
    apertureGroup('#efefef', bold)
      .split('\n')
      .map((l) => '  ' + l)
      .join('\n'),
    `  </g>`,
    `</svg>`,
  ].join('\n');
}

/* ── rendering ────────────────────────────────────────────────────────────── */

async function shoot(page, html, width, height, out) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ omitBackground: false });
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buf);
  console.log(`  ${out.replace(ROOT, '.')}  ${width}×${height}`);
}

const shell = (body, css = '') => `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:#212121;}
  ${css}
</style></head><body>${body}</body></html>`;

async function main() {
  console.log('▸ brand assets');

  // The real display face, inlined — the OG card exists to show the wordmark and
  // a fallback would defeat it.
  const gs = await readFile(resolve(ROOT, 'app/fonts/GeneralSans-Variable.woff2'));
  const face = `@font-face{font-family:'General Sans';font-weight:200 700;font-display:block;
    src:url(data:font/woff2;base64,${gs.toString('base64')}) format('woff2');}`;

  // 1. the scalable favicon
  await writeFile(resolve(ROOT, 'app/icon.svg'), tileSvg(64, true, true) + '\n');
  console.log('  ./app/icon.svg  64×64');

  const browser = await launchGuarded();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  // 2 & 3. the raster tiles
  for (const [px, out] of [
    [180, resolve(ROOT, 'app/apple-icon.png')],
    [512, resolve(ROOT, 'public/icon-512.png')],
  ]) {
    await shoot(page, shell(tileSvg(px)), px, px, out);
  }

  // 4. the OG card — glyph and wordmark on --black, left-aligned on a
  //    12-column-ish rhythm rather than centred, which is how the site is set.
  const og = shell(
    `<div class="card">
       <div class="mark">${tileSvg(120).replace(/<rect[^>]*\/>/, '')}</div>
       <div class="wm"><span>NO</span><span class="gap"></span><span>FiLTER</span></div>
       <div class="line"></div>
       <div class="tag">A studio for work that does not need softening.</div>
     </div>`,
    `${face}
     .card{width:1200px;height:630px;background:#212121;box-sizing:border-box;
       padding:96px;display:flex;flex-direction:column;justify-content:flex-end;gap:40px;}
     .mark{width:120px;height:120px;position:absolute;top:96px;left:96px;}
     .mark svg{width:120px;height:120px;display:block;}
     .wm{font-family:'General Sans',sans-serif;font-weight:400;letter-spacing:-0.02em;
       line-height:1;color:#efefef;font-size:168px;display:flex;align-items:baseline;}
     .wm .gap{display:inline-block;width:0.22em;}
     .line{height:1px;background:rgba(255,255,255,.3);}
     .tag{font-family:'General Sans',sans-serif;font-weight:400;font-size:30px;
       line-height:1.3;color:#737373;letter-spacing:-0.01em;}`
  );
  await shoot(page, og, 1200, 630, resolve(ROOT, 'app/opengraph-image.png'));

  await browser.close();
  console.log('✓ brand assets written');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
