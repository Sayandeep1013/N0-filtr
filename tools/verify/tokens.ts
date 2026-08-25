import type { Browser } from 'playwright';
import { newPage, platformFontFor } from './lib/browser';
import { colourEquals, familyLeadsWith, numberEquals, remPx, rootSizeAt, toNumber } from './lib/css';
import { fail, pass, type CheckResult, type SectionResult } from './lib/types';
import { TOKEN_ASSERTIONS, type Assertion } from './tokens.config';

/**
 * verify:tokens — computed styles versus the token table.
 *
 * Catches: wrong hex, wrong rem, wrong tracking, a broken fluid root, a bolded
 * heading, a font that failed to load.
 * Misses: wrong layout. That is verify:visual's job.
 */

function describe(a: Assertion): string {
  const page = ('page' in a && a.page) || '/probe';
  const sel = 'selectorAll' in a ? a.selectorAll : a.selector;
  const what =
    a.kind === 'font' ? 'painted-with' : 'prop' in a ? a.prop : '';
  return `${sel} @${a.at}${page === '/probe' ? '' : ` (${page})`} ${what}`.trim();
}

function expectedText(a: Assertion, root: number): string {
  switch (a.kind) {
    case 'length':
      return `${a.rem}rem = ${remPx(a.rem, root).toFixed(3)}px`;
    case 'px':
      return `${a.px.toFixed(3)}px`;
    case 'colour':
      return a.hex;
    case 'exact':
      return a.value;
    case 'ratio':
      return `${a.ratio} × ${a.ofRem}rem = ${(a.ratio * remPx(a.ofRem, root)).toFixed(3)}px`;
    case 'every':
      return `${a.value} (all matches)`;
    case 'font':
      return a.family;
  }
}

export async function checkTokens(browser: Browser, baseUrl: string): Promise<SectionResult> {
  const results: CheckResult[] = [];

  // Group by viewport so each width costs one context, not one per assertion.
  const byViewport = new Map<number, Assertion[]>();
  for (const a of TOKEN_ASSERTIONS) {
    const list = byViewport.get(a.at) ?? [];
    list.push(a);
    byViewport.set(a.at, list);
  }

  for (const [width, assertions] of [...byViewport.entries()].sort((x, y) => x[0] - y[0])) {
    const root = rootSizeAt(width);
    const { context, page } = await newPage(browser, { viewport: { w: width, h: 900 } });

    try {
      // Group again by page so we navigate as little as possible.
      const byPage = new Map<string, Assertion[]>();
      for (const a of assertions) {
        const p = ('page' in a && a.page) || '/probe';
        const list = byPage.get(p) ?? [];
        list.push(a);
        byPage.set(p, list);
      }

      for (const [path, group] of byPage) {
        await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
        // SplitType and the whole type system measure against the real face;
        // never assert before the fonts have actually swapped in.
        await page.evaluate(() => document.fonts.ready);

        for (const a of group) {
          const label = describe(a);
          const expected = expectedText(a, root);

          if (a.kind === 'font') {
            const actual = await platformFontFor(page, a.selector);
            const computedFamily = await page.evaluate((s) => {
              const el = document.querySelector(s);
              return el ? getComputedStyle(el).fontFamily : null;
            }, a.selector);
            if (actual === null && computedFamily === null) {
              results.push(fail(label, expected, 'element not found'));
            } else if (actual && familyLeadsWith(actual, a.family)) {
              results.push(pass(label, actual));
            } else {
              results.push(fail(label, expected, actual ?? `unresolved (declared: ${computedFamily})`));
            }
            continue;
          }

          if (a.kind === 'every') {
            const values: string[] | null = await page.evaluate(
              ({ sel, prop }) =>
                [...document.querySelectorAll(sel)].map((el) =>
                  getComputedStyle(el).getPropertyValue(prop).trim(),
                ),
              { sel: a.selectorAll, prop: a.prop },
            );
            if (!values || values.length === 0) {
              results.push(fail(label, expected, 'no elements matched'));
            } else {
              const offenders = values.filter((v) => v !== a.value);
              results.push(
                offenders.length === 0
                  ? pass(label, `${values.length} elements, all ${a.value}`)
                  : fail(label, expected, `${offenders.length}/${values.length} wrong: ${[...new Set(offenders)].join(', ')}`),
              );
            }
            continue;
          }

          const actual: string | null = await page.evaluate(
            ({ sel, prop }) => {
              const el = document.querySelector(sel);
              return el ? getComputedStyle(el).getPropertyValue(prop).trim() : null;
            },
            { sel: a.selector, prop: a.prop },
          );

          if (actual === null) {
            results.push(fail(label, expected, 'element not found'));
            continue;
          }

          let ok = false;
          switch (a.kind) {
            case 'length':
              ok = numberEquals(remPx(a.rem, root), actual, a.tolerance ?? 0.05);
              break;
            case 'px':
              ok = numberEquals(a.px, actual, a.tolerance ?? 0.05);
              break;
            case 'colour':
              ok = colourEquals(a.hex, actual);
              break;
            case 'exact':
              ok = actual === a.value;
              break;
            case 'ratio':
              ok = numberEquals(a.ratio * remPx(a.ofRem, root), actual, a.tolerance ?? 0.1);
              break;
          }

          const shown =
            a.kind === 'length' || a.kind === 'px' || a.kind === 'ratio'
              ? `${toNumber(actual)?.toFixed(3) ?? actual}px`
              : actual;
          results.push(ok ? pass(label, shown) : fail(label, expected, shown));
        }
      }
    } finally {
      await context.close();
    }
  }

  return { name: 'tokens', results };
}
