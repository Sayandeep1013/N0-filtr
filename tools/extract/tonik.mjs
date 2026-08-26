/**
 * The tonik design-system extractor.
 *
 *   node tools/extract/tonik.mjs            # firefox, the default
 *   node tools/extract/tonik.mjs --chromium
 *
 * Writes `tools/extract/output/tonik-<engine>.json` plus a readable summary.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * Phase 2 spent most of its time correcting layout by eye against a screenshot,
 * one number at a time: the rail was 29px high, the copy column 57px too far
 * left, the play control 0.2rem out. Every one of those is a value their live
 * page will simply tell you.
 *
 * A capture shows where things ARE. It never shows why. `getComputedStyle` does,
 * and it costs one pass to read the whole system rather than one number.
 *
 * ── Firefox, not Chromium ───────────────────────────────────────────────────
 * Sayandeep asked for a non-Chromium engine. It is worth being precise about
 * what that buys: computed styles are computed styles, and Firefox does not
 * expose values Chromium hides. What it does give is an independent renderer —
 * if a measurement agrees across two engines it is a property of their CSS, and
 * if it disagrees it is a property of the engine and must not be copied. Run
 * both and diff; that is the point.
 *
 * ── What this is and is not ─────────────────────────────────────────────────
 * It records **measurements and structure**: sizes, spacing, colours, timings,
 * the section rhythm. Those are facts about a layout and they are what
 * `docs/spec/` is built from.
 *
 * It deliberately does **not** collect their copy, their imagery, their Spline
 * scene or their logo. Those are theirs, ours are ours, and CLAUDE.md draws the
 * same line: "our own brand, our own work".
 */
import { firefox, chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'tools/extract/output');

const useChromium = process.argv.includes('--chromium');
const engine = useChromium ? 'chromium' : 'firefox';
const launcher = useChromium ? chromium : firefox;

const URL_ = process.env.TONIK_URL ?? 'https://tonik.com/';
const VIEWPORTS = [
  { w: 1512, h: 900 },
  { w: 1920, h: 1080 },
  { w: 1280, h: 800 },
  { w: 390, h: 844 },
];

/** Runs in the page. Returns the whole design system it can see. */
function harvest() {
  const px = (v) => (v == null ? null : String(v));
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: +r.x.toFixed(1),
      y: +r.y.toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
    };
  };

  /* ── 1. custom properties declared on :root ───────────────────────────── */
  const tokens = {};
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (const rule of Array.from(rules ?? [])) {
      if (!rule.style || !rule.selectorText) continue;
      if (!/^(:root|html|body)\b/.test(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (prop.startsWith('--')) tokens[prop] = rule.style.getPropertyValue(prop).trim();
      }
    }
  }

  /* ── 2. the type scale, derived from what is actually rendered ────────── */
  const typeSeen = new Map();
  const colourSeen = new Map();
  const TEXT = 'h1,h2,h3,h4,h5,h6,p,a,span,li,button,label,div';
  for (const el of Array.from(document.querySelectorAll(TEXT))) {
    const t = el.textContent?.trim();
    if (!t || t.length < 2) continue;
    // Only elements whose own text is a direct child, so wrappers do not count.
    const own = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
    );
    if (!own) continue;
    const cs = getComputedStyle(el);
    const key = [
      cs.fontSize,
      cs.lineHeight,
      cs.letterSpacing,
      cs.fontWeight,
      cs.textTransform,
      cs.fontFamily.split(',')[0].replace(/"/g, ''),
    ].join(' | ');
    const rec = typeSeen.get(key) ?? { key, count: 0, sample: t.slice(0, 40), classes: new Set() };
    rec.count += 1;
    if (el.className) rec.classes.add(String(el.className).split(/\s+/)[0]);
    typeSeen.set(key, rec);

    const c = cs.color;
    colourSeen.set(c, (colourSeen.get(c) ?? 0) + 1);
  }

  /* ── 3. every distinct background and border colour in the document ───── */
  const bgSeen = new Map();
  const borderSeen = new Map();
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgSeen.set(cs.backgroundColor, (bgSeen.get(cs.backgroundColor) ?? 0) + 1);
    }
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const w = parseFloat(cs[`border${side}Width`]);
      if (w > 0) {
        const k = `${cs[`border${side}Width`]} ${cs[`border${side}Style`]} ${cs[`border${side}Color`]}`;
        borderSeen.set(k, (borderSeen.get(k) ?? 0) + 1);
      }
    }
  }

  /* ── 4. the transition vocabulary — their motion durations and eases ──── */
  const motionSeen = new Map();
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    if (cs.transitionDuration && cs.transitionDuration !== '0s') {
      const k = `${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`;
      motionSeen.set(k, (motionSeen.get(k) ?? 0) + 1);
    }
  }

  /* ── 5. the layout skeleton: sections down the page ───────────────────── */
  const sections = Array.from(document.querySelectorAll('section, main > div, [class*=section_]'))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 60),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        padTop: cs.paddingTop,
        padBottom: cs.paddingBottom,
      };
    })
    .filter((s) => s.height > 40)
    .sort((a, b) => a.top - b.top);

  /* ── 6. the container system ──────────────────────────────────────────── */
  const containers = {};
  for (const cls of ['padding-global', 'container-large', 'container-medium', 'container-small']) {
    const el = document.querySelector(`.${cls}`);
    if (!el) continue;
    const cs = getComputedStyle(el);
    containers[cls] = {
      rect: rect(el),
      maxWidth: cs.maxWidth,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      marginInline: cs.marginInlineStart + ' / ' + cs.marginInlineEnd,
    };
  }

  return {
    url: location.href,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    dpr: window.devicePixelRatio,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    documentHeight: document.documentElement.scrollHeight,
    tokens,
    containers,
    typeScale: Array.from(typeSeen.values())
      .map((r) => ({ ...r, classes: Array.from(r.classes).slice(0, 4) }))
      .sort((a, b) => parseFloat(b.key) - parseFloat(a.key)),
    textColours: Array.from(colourSeen, ([k, v]) => ({ colour: k, count: v })).sort((a, b) => b.count - a.count),
    backgrounds: Array.from(bgSeen, ([k, v]) => ({ colour: k, count: v })).sort((a, b) => b.count - a.count),
    borders: Array.from(borderSeen, ([k, v]) => ({ border: k, count: v })).sort((a, b) => b.count - a.count),
    motion: Array.from(motionSeen, ([k, v]) => ({ transition: k, count: v })).sort((a, b) => b.count - a.count),
    sections,
    note: px(null),
  };
}

async function run() {
  console.log(`▸ extracting ${URL_} with ${engine}`);
  const browser = await launcher.launch();
  const result = { engine, url: URL_, capturedAt: new Date().toISOString(), viewports: {} };

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      try {
        await page.goto(URL_, { waitUntil: 'load', timeout: 90_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(2500);
        const data = await page.evaluate(harvest);
        result.viewports[`${vp.w}x${vp.h}`] = data;
        console.log(
          `  ${String(vp.w).padStart(4)}x${vp.h}  root ${data.rootFontSize}` +
            `  type steps ${data.typeScale.length}` +
            `  sections ${data.sections.length}` +
            `  container-large ${data.containers['container-large']?.maxWidth ?? '—'}`,
        );
      } catch (err) {
        console.error(`  ${vp.w}x${vp.h} FAILED: ${err.message}`);
        result.viewports[`${vp.w}x${vp.h}`] = { error: err.message };
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  await mkdir(OUT_DIR, { recursive: true });
  const file = resolve(OUT_DIR, `tonik-${engine}.json`);
  await writeFile(file, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✓ ${file.replace(ROOT, '.')}`);
}

await run();
