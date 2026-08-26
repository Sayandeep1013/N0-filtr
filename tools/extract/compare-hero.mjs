/**
 * Head-to-head: our hero against tonik's, at four viewports, from both DOMs.
 *
 *   npm run compare:hero
 *   node tools/extract/compare-hero.mjs --chromium
 *
 * Needs `npm run dev` running on :3000.
 *
 * ── What this proves, and what it cannot ────────────────────────────────────
 * It compares **structural** values — where the copy column starts, how wide it
 * is, the headline's type metrics, the play control's box, where the foot rule
 * lands, the canvas wrapper. Those are properties of the layout and they must
 * agree.
 *
 * It does **not** compare anything downstream of content. Our headline is a
 * different string from theirs, so its rendered width differs and should; our
 * rail carries different labels. Comparing those would be comparing our copy to
 * theirs, which is neither the goal nor ours to do.
 *
 * The point of running it at four viewports is that only one of them was ever
 * tuned. If the rules were copied rather than the positions, the other three
 * come out right on their own — and if they do not, the method did not work.
 */
import { firefox, chromium } from 'playwright';

const useChromium = process.argv.includes('--chromium');
const launcher = useChromium ? chromium : firefox;
const engine = useChromium ? 'chromium' : 'firefox';

const OURS = process.env.OURS_URL ?? 'http://localhost:3000/';
const THEIRS = process.env.TONIK_URL ?? 'https://tonik.com/';

const VIEWPORTS = [
  { w: 1512, h: 900, tuned: true },
  { w: 1920, h: 1080 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
];

/** Runs in either page. Structural values only. */
function probe() {
  const num = (v) => Math.round(parseFloat(v) * 100) / 100;
  const h1 = document.querySelector('h1');
  const heroRoot =
    document.querySelector('[data-hero]') ?? h1?.closest('section');

  // The capped copy column: the nearest ancestor whose width is not the viewport.
  let column = h1;
  while (column && column.getBoundingClientRect().width >= window.innerWidth - 1) {
    column = column.parentElement;
  }
  const colRect = column?.getBoundingClientRect();

  // The foot rail: the wide element in the first viewport with a bottom border.
  let rail = null;
  for (const el of document.querySelectorAll('div')) {
    const r = el.getBoundingClientRect();
    if (r.width < 400 || r.top < 600 || r.top > 950) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderBottomWidth) > 0) {
      rail = { el, r, cs };
      break;
    }
  }

  // The play control: the first square box inside the headline.
  let play = null;
  for (const el of h1?.querySelectorAll('*') ?? []) {
    const r = el.getBoundingClientRect();
    if (r.width > 20 && Math.abs(r.width - r.height) < 2) {
      play = r;
      break;
    }
  }

  const canvasWrap = document.querySelector('canvas')?.parentElement;
  const cwRect = canvasWrap?.getBoundingClientRect();
  const cwCs = canvasWrap ? getComputedStyle(canvasWrap) : null;
  const h1Cs = h1 ? getComputedStyle(h1) : null;

  return {
    root: num(getComputedStyle(document.documentElement).fontSize),
    heroHeight: heroRoot ? num(heroRoot.getBoundingClientRect().height) : null,

    columnX: colRect ? num(colRect.x) : null,
    columnW: colRect ? num(colRect.width) : null,

    h1X: h1 ? num(h1.getBoundingClientRect().x) : null,
    h1Y: h1 ? num(h1.getBoundingClientRect().y) : null,
    h1Size: h1Cs ? num(h1Cs.fontSize) : null,
    h1Leading: h1Cs ? num(h1Cs.lineHeight) : null,
    h1Track: h1Cs ? num(h1Cs.letterSpacing) : null,
    h1Weight: h1Cs ? h1Cs.fontWeight : null,

    playX: play ? num(play.x) : null,
    playY: play ? num(play.y) : null,
    playSize: play ? num(play.width) : null,

    railX: rail ? num(rail.r.x) : null,
    railY: rail ? num(rail.r.y) : null,
    railW: rail ? num(rail.r.width) : null,
    railRule: rail ? num(rail.r.bottom) : null,
    railPadB: rail ? num(rail.cs.paddingBottom) : null,
    railBorder: rail ? `${num(rail.cs.borderBottomWidth)} ${rail.cs.borderBottomColor}` : null,

    canvasX: cwRect ? num(cwRect.x) : null,
    canvasW: cwRect ? num(cwRect.width) : null,
    canvasH: cwRect ? num(cwRect.height) : null,
    canvasPos: cwCs ? cwCs.position : null,
    canvasZ: cwCs ? cwCs.zIndex : null,
  };
}

/** Fields whose values are properties of the layout, so they must agree. */
const STRUCTURAL = [
  ['root', 0],
  /* The hero SECTION's height, added in phase 3 when the stack wall gave it one.
     §1 of 30-page-specs.md gives theirs 1361px at a 900 viewport — the viewport
     plus the wall below the fold — and ours is built to the same rule, so the
     figure is a property of the layout and belongs here.

     The tolerance is one row of the wall, deliberately. Our wall holds 22 marks
     and theirs holds 28 client logos; both wrap, and a viewport that puts one
     more mark on a row changes the height by a whole row and neither of us
     controls where the other's row breaks. What a 80px tolerance still catches
     is the failure that matters: a wall that is missing (−461), collapsed, or
     twice the height it should be. */
  ['heroHeight', 80],
  ['columnX', 1],
  ['columnW', 1],
  ['h1X', 1],
  ['h1Y', 1],
  ['h1Size', 0.5],
  ['h1Leading', 0.5],
  ['h1Track', 0.05],
  ['h1Weight', 0],
  ['playX', 1],
  ['playY', 1],
  ['playSize', 1],
  ['railX', 1],
  ['railY', 1],
  ['railW', 1],
  ['railRule', 1],
  ['railPadB', 0.5],
  ['railBorder', 0],
  ['canvasX', 1],
  ['canvasW', 1],
  ['canvasH', 1],
  ['canvasPos', 0],
  ['canvasZ', 0],
];

async function read(browser, url, vp) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);
    return await page.evaluate(probe);
  } finally {
    await page.close();
  }
}

const browser = await launcher.launch();
let failures = 0;
let checks = 0;

try {
  for (const vp of VIEWPORTS) {
    const theirs = await read(browser, THEIRS, vp);
    const ours = await read(browser, OURS, vp);

    console.log(
      `\n══ ${vp.w}×${vp.h} ${vp.tuned ? '(the one that was tuned)' : '(never tuned)'} ══`,
    );
    console.log('  field           tonik            ours             ');
    for (const [field, tol] of STRUCTURAL) {
      const t = theirs[field];
      const o = ours[field];
      checks += 1;
      let ok;
      if (typeof t === 'number' && typeof o === 'number') ok = Math.abs(t - o) <= tol;
      else ok = String(t) === String(o);
      if (!ok) failures += 1;
      const mark = ok ? '✓' : '✗';
      console.log(
        `  ${mark} ${field.padEnd(13)} ${String(t).padEnd(16)} ${String(o).padEnd(16)}` +
          (ok ? '' : `  ← differs by ${typeof t === 'number' ? (o - t).toFixed(2) : 'value'}`),
      );
    }
  }
} finally {
  await browser.close();
}

console.log(
  `\n${failures === 0 ? '✓ PASS' : '✗ FAIL'} — ${checks - failures}/${checks} structural values agree (${engine})`,
);
process.exit(failures === 0 ? 0 : 1);
