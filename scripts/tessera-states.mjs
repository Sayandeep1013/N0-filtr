/**
 * Drives the live Tessera and captures three states of it.
 *
 *   node scripts/tessera-states.mjs
 *
 * `scripts/capture.mjs` shoots every deploy cold, which for a drawing tool is a
 * screenshot of an empty canvas — an honest picture of nothing. This one opens
 * the real editor, picks a palette colour, drags rows of cells, and then opens
 * the code and ASCII panels, so the case study has the drawing, the document
 * and the document read back as characters.
 *
 * The agent path was tried first and is out — the deploy answers "The AI agent
 * is not configured for this deployment" once its two free tries are spent, so
 * the case study cannot show agent-made art without an API key. Logged as
 * I-044. This draws with the ordinary tools instead, which is still the real
 * app doing the real thing.
 *
 * Coordinates come from a probe of the running page: the palette popover's
 * swatches sit on a 6-wide grid at 31px pitch, and the canvas is 32×32 cells at
 * 23× zoom with its top-left at (352, 105).
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'public/media/works');
/* The document text is written here for whoever is authoring the case study to
   quote from. It is a scratch artefact, not a build input. */
const TMP = process.env.CLAUDE_JOB_DIR ?? '.';

/** Palette popover swatch centres, in the order the document lists them. */
const SWATCH = {
  ink: [234, 73],
  plum: [265, 73],
  wine: [296, 73],
  coral: [326, 73],
  sand: [357, 73],
  lime: [203, 103],
  white: [234, 133],
  grey: [265, 133],
};

const CELL = 23;
const ORIGIN = { x: 352, y: 105 };
const at = (c, r) => [ORIGIN.x + c * CELL + CELL / 2, ORIGIN.y + r * CELL + CELL / 2];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();
await page.goto('https://tessera-brown-pi.vercel.app', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

async function pick(name) {
  await page.mouse.click(206, 28);
  await page.waitForTimeout(600);
  const [x, y] = SWATCH[name];
  await page.mouse.click(x, y);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
}

/** One horizontal run of cells, as a single drag. */
async function row(r, from, to) {
  const [x1, y1] = at(from, r);
  const [x2, y2] = at(to, r);
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move(x2, y2, { steps: Math.max(4, to - from) });
  await page.mouse.up();
  await page.waitForTimeout(90);
}

async function dot(c, r) {
  const [x, y] = at(c, r);
  await page.mouse.click(x, y);
  await page.waitForTimeout(90);
}

/* the cap */
await pick('wine');
const CAP = [
  [8, 13, 18],
  [9, 11, 20],
  [10, 10, 21],
  [11, 9, 22],
  [12, 8, 23],
  [13, 8, 23],
  [14, 9, 22],
  [15, 10, 21],
];
for (const [r, a, b] of CAP) await row(r, a, b);

/* the spots */
await pick('white');
for (const [c, r] of [
  [12, 10],
  [18, 11],
  [10, 13],
  [20, 13],
  [15, 12],
]) {
  await dot(c, r);
  await dot(c + 1, r);
  await dot(c, r + 1);
  await dot(c + 1, r + 1);
}

/* the stem */
await pick('sand');
for (let r = 16; r <= 21; r++) await row(r, 13, 18);
await row(22, 12, 19);

/* a shadow under it */
await pick('grey');
await row(23, 11, 20);

await page.waitForTimeout(1500);
await page.screenshot({ path: resolve(OUT, 'tessera-art.png') });
console.log('  wrote tessera-art.png');

await page.locator('[title="Code"], [aria-label="Code"]').first().click();
await page.waitForTimeout(3000);
await page.screenshot({ path: resolve(OUT, 'tessera-code.png') });
console.log('  wrote tessera-code.png');

/* The ASCII export tab. The same sprite, as characters — which is the case
   study's argument stated by the product itself. */
await page.getByText('ASCII', { exact: true }).first().click().catch(() => console.log('  ! ascii tab not found'));
await page.waitForTimeout(2000);
await page.screenshot({ path: resolve(OUT, 'tessera-ascii.png') });
console.log('  wrote tessera-ascii.png');

await page.getByText('Code', { exact: true }).first().click().catch(() => {});
await page.waitForTimeout(1500);

const json = await page.evaluate(() => {
  const pre = document.querySelector('pre, code, textarea');
  if (pre instanceof HTMLTextAreaElement) return pre.value;
  return pre ? pre.textContent : null;
});
await writeFile(resolve(TMP, 'tmp/tessera-doc.json'), json ?? '(nothing)');
console.log('  document length', json ? json.length : 0);

await browser.close();
