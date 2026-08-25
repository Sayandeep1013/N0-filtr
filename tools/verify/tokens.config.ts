/**
 * The token table, machine-readable.
 *
 * This file is a transcription of docs/spec/10-design-system.md §2, §3, §4 — the
 * same numbers, in a form a browser can be held to. When the spec and this file
 * disagree, the spec wins and this file is wrong.
 *
 * Expected values are written the way the spec writes them: `#3b3b3b`, `6rem`,
 * `-0.15rem`. tools/verify/tokens.ts does the arithmetic against the fluid root
 * for the viewport under test, so an assertion never hard-codes a px figure that
 * would silently rot if the root changed.
 */

import { rootSizeAt } from './lib/css';

export type Assertion =
  | {
      kind: 'length'; // a rem value, resolved against the fluid root
      at: number;
      page?: string;
      selector: string;
      prop: string;
      rem: number;
      tolerance?: number;
    }
  | {
      kind: 'px'; // an absolute px value that must not scale
      at: number;
      page?: string;
      selector: string;
      prop: string;
      px: number;
      tolerance?: number;
    }
  | {
      kind: 'colour';
      at: number;
      page?: string;
      selector: string;
      prop: string;
      hex: string;
    }
  | {
      kind: 'exact';
      at: number;
      page?: string;
      selector: string;
      prop: string;
      value: string;
    }
  | {
      kind: 'ratio'; // unitless line-height: expected = ratio × font-size
      at: number;
      page?: string;
      selector: string;
      prop: string;
      ratio: number;
      ofRem: number;
      tolerance?: number;
    }
  | {
      kind: 'every'; // every element matching must report the same value
      at: number;
      page?: string;
      selectorAll: string;
      prop: string;
      value: string;
    }
  | {
      kind: 'font'; // the typeface Chrome actually painted with
      at: number;
      page?: string;
      selector: string;
      family: string;
    };

const PROBE = '/probe';

/* ── the fluid root ────────────────────────────────────────────────────────
   The single most important assertion on the site. Every other dimension is a
   multiple of this number, so it is checked first and at five widths: side of
   the lock, on the lock, and three above it. */
const fluidRoot: Assertion[] = [1280, 1440, 1441, 1512, 1920, 2560].map((w) => ({
  kind: 'px' as const,
  at: w,
  selector: 'html',
  prop: 'font-size',
  px: rootSizeAt(w),
  tolerance: 0.05,
}));

/* ── the type scale at 1512 ────────────────────────────────────────────────
   docs/spec/10-design-system.md §3. size / line-height / tracking, exactly as
   the table gives them. All display weights are 400 — there is no exception. */
interface ScaleRow {
  token: string;
  size: number;
  lh: number | { ratio: number };
  track: number;
  mono?: true;
}

export const SCALE: ScaleRow[] = [
  { token: 'h1', size: 6, lh: 6, track: -0.15 },
  { token: 'h1-sm', size: 3.25, lh: 3.25, track: 0 },
  { token: 'h2', size: 5, lh: 5, track: 0 },
  { token: 'h3', size: 2, lh: 2.5, track: 0 },
  { token: 'h4', size: 2, lh: 2, track: 0 },
  { token: 'h5', size: 1.5, lh: 1.75, track: 0 },
  { token: 'h6', size: 1, lh: 1.25, track: 0 },
  { token: 'p-big', size: 1.25, lh: { ratio: 1.6 }, track: 0 },
  { token: 'p', size: 1, lh: 1.25, track: 0 },
  { token: 'p-sm', size: 0.625, lh: 0.75, track: 0 },
  { token: 'label-big', size: 0.875, lh: 0.875, track: -0.0175, mono: true },
  { token: 'label', size: 0.75, lh: 0.75, track: -0.015, mono: true },
  { token: 'label-sm', size: 0.5, lh: 0.5, track: -0.01, mono: true },
];

function scaleAssertions(at: number, rows: ScaleRow[]): Assertion[] {
  const out: Assertion[] = [];
  for (const r of rows) {
    const sel = `[data-t="${r.token}"]`;
    out.push({ kind: 'length', at, selector: sel, prop: 'font-size', rem: r.size, tolerance: 0.05 });
    out.push(
      typeof r.lh === 'number'
        ? { kind: 'length', at, selector: sel, prop: 'line-height', rem: r.lh, tolerance: 0.05 }
        : { kind: 'ratio', at, selector: sel, prop: 'line-height', ratio: r.lh.ratio, ofRem: r.size, tolerance: 0.1 },
    );
    out.push(
      r.track === 0
        ? { kind: 'exact', at, selector: sel, prop: 'letter-spacing', value: 'normal' }
        : { kind: 'length', at, selector: sel, prop: 'letter-spacing', rem: r.track, tolerance: 0.05 },
    );
    out.push({ kind: 'exact', at, selector: sel, prop: 'font-weight', value: '400' });
    if (r.mono) {
      out.push({ kind: 'exact', at, selector: sel, prop: 'text-transform', value: 'uppercase' });
    }
  }
  return out;
}

/* ── mobile step-down (≤767) ───────────────────────────────────────────────
   Sizes only. Labels are deliberately unchanged at every breakpoint. */
const MOBILE_SCALE: ScaleRow[] = [
  { token: 'h1', size: 3, lh: 3, track: -0.15 },
  { token: 'h2', size: 2.5, lh: 2.5, track: 0 },
  { token: 'h3', size: 1.5, lh: 1.75, track: 0 },
  { token: 'h4', size: 1.5, lh: 1.75, track: 0 },
  // The three that must NOT move.
  { token: 'label-big', size: 0.875, lh: 0.875, track: -0.0175, mono: true },
  { token: 'label', size: 0.75, lh: 0.75, track: -0.015, mono: true },
  { token: 'label-sm', size: 0.5, lh: 0.5, track: -0.01, mono: true },
];

/* ── colour ────────────────────────────────────────────────────────────────
   Every primitive, alpha and semantic token in §2, read back as a resolved
   computed colour off a 1px swatch on the probe page. */
const COLOURS: Record<string, string> = {
  black: '#212121',
  white: '#efefef',
  'grey-900': '#2e2e2e',
  'grey-800': '#3b3b3b',
  'grey-700': '#737373',
  'grey-600': '#e0e0e0',
  'white-30': '#ffffff4d',
  'white-10': '#ffffff1a',
  'white-50': '#efefef80',
  'black-50': '#21212180',
  'black-70': '#212121b3',
  'bg-primary': '#212121',
  'bg-secondary': '#2e2e2e',
  'bg-tertiary': '#3b3b3b',
  'bg-alternate': '#efefef',
  'bg-transparent': '#ffffff1a',
  'text-primary': '#efefef',
  'text-secondary': '#737373',
  'text-alternate': '#212121',
  'border-primary': '#ffffff4d',
  'border-alternate': '#212121',
  success: '#027a48',
  'success-bg': '#ecfdf3',
  error: '#b42318',
  'error-bg': '#fef3f2',
  accent: '#212121',
};

const colourAssertions: Assertion[] = Object.entries(COLOURS).map(([token, hex]) => ({
  kind: 'colour',
  at: 1512,
  selector: `[data-probe-colour="${token}"]`,
  prop: 'background-color',
  hex,
}));

export const TOKEN_ASSERTIONS: Assertion[] = [
  ...fluidRoot,

  // ground and text
  { kind: 'colour', at: 1512, page: '/', selector: 'body', prop: 'background-color', hex: '#212121' },
  { kind: 'colour', at: 1512, page: '/', selector: 'body', prop: 'color', hex: '#efefef' },

  ...scaleAssertions(1512, SCALE),
  ...scaleAssertions(390, MOBILE_SCALE),
  ...colourAssertions,

  /* ── the display-weight rule, enforced ───────────────────────────────────
     No display text may ever be bolder than 400. This catches the single
     easiest way to break the look, and it is why it is checked as an `every`
     rather than element by element. */
  { kind: 'every', at: 1512, selectorAll: '[data-t^="h"], [data-t^="p"]', prop: 'font-weight', value: '400' },

  /* ── layout ─────────────────────────────────────────────────────────────
     §4. The gutter is asserted where it is applied, not as a variable. */
  { kind: 'length', at: 1512, selector: '[data-probe="gutter"]', prop: 'padding-left', rem: 2.5, tolerance: 0.05 },
  { kind: 'length', at: 1512, selector: '[data-probe="gutter"]', prop: 'padding-right', rem: 2.5, tolerance: 0.05 },
  { kind: 'length', at: 390, selector: '[data-probe="gutter"]', prop: 'padding-left', rem: 1.25, tolerance: 0.05 },
  { kind: 'length', at: 1512, selector: '[data-probe-length="grid-gap"]', prop: 'width', rem: 1.5, tolerance: 0.05 },
  { kind: 'length', at: 1512, selector: '[data-probe-length="section-y"]', prop: 'width', rem: 8, tolerance: 0.05 },
  { kind: 'length', at: 390, selector: '[data-probe-length="section-y"]', prop: 'width', rem: 4, tolerance: 0.05 },
  // --content = 100vw - 2 × gutter. At 1512: 1512 - 2×41.125 = 1429.75px.
  { kind: 'px', at: 1512, selector: '[data-probe-length="content"]', prop: 'width', px: 1512 - 2 * 2.5 * rootSizeAt(1512), tolerance: 0.6 },
  // --col = (content - 11 × 1.5rem) / 12.
  {
    kind: 'px',
    at: 1512,
    selector: '[data-probe-length="col"]',
    prop: 'width',
    px: (1512 - 2 * 2.5 * rootSizeAt(1512) - 11 * 1.5 * rootSizeAt(1512)) / 12,
    tolerance: 0.6,
  },

  /* ── the faces actually painted ──────────────────────────────────────────
     Proves the fonts loaded, not merely that we asked for them. */
  { kind: 'font', at: 1512, selector: '[data-t="h1"]', family: 'General Sans' },
  { kind: 'font', at: 1512, selector: '[data-t="label"]', family: 'IBM Plex Mono' },

  /* ── global chrome ──────────────────────────────────────────────────────
     Hidden scrollbars and inverted selection are load-bearing for the look. */
  { kind: 'exact', at: 1512, page: '/', selector: 'html', prop: 'scrollbar-width', value: 'none' },
];
