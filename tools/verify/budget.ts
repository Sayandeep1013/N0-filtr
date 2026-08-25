import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser } from 'playwright';
import { newPage } from './lib/browser';
import { fail, info, pass, type CheckResult, type SectionResult } from './lib/types';
import { BUDGETS, FORBIDDEN_FONT_HOSTS, FORBIDDEN_IN_INITIAL } from './budget.config';

/**
 * verify:budget — bundle size and page weight.
 *
 * Catches: bloat, a library that escaped its dynamic import, an external font
 * request, oversized media.
 * Misses: correctness entirely.
 *
 * Lighthouse itself is not run here. It needs a real throttled profile and it is
 * slow enough that putting it in the per-phase gate would make agents stop
 * running the gate. It belongs to phase 12, via
 * `mcp__chrome-devtools__lighthouse_audit`; the LCP/CLS figures below come from
 * the browser's own PerformanceObserver on an unthrottled local load, which is
 * a useful regression signal rather than a Lighthouse score.
 */

const kb = (bytes: number) => bytes / 1024;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

/**
 * Gzipped weight of everything the homepage actually loads, measured from the
 * network rather than guessed from the build manifest — the manifest does not
 * know which chunks a given route pulls at runtime.
 */
async function measureHome(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: { w: 1512, h: 900 } });

  const js: { url: string; bytes: number }[] = [];
  let totalBytes = 0;
  const fontHosts: string[] = [];

  page.on('response', (res) => {
    const url = res.url();
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return '';
      }
    })();
    if (FORBIDDEN_FONT_HOSTS.some((h) => host.includes(h))) fontHosts.push(host);
  });

  page.on('requestfinished', async (req) => {
    try {
      const sizes = await req.sizes();
      const bytes = sizes.responseBodySize + sizes.responseHeadersSize;
      totalBytes += bytes;
      if (req.resourceType() === 'script') js.push({ url: req.url(), bytes: sizes.responseBodySize });
    } catch {
      /* request was aborted or served from cache; not part of the budget */
    }
  });

  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const jsBytes = js.reduce((n, r) => n + r.bytes, 0);
    out.push(
      kb(jsBytes) <= BUDGETS.homeJsGzipKb
        ? pass(`JS on / (transferred)`, `${kb(jsBytes).toFixed(1)}KB / ${BUDGETS.homeJsGzipKb}KB`)
        : fail(`JS on / (transferred)`, `<= ${BUDGETS.homeJsGzipKb}KB`, `${kb(jsBytes).toFixed(1)}KB`),
    );
    out.push(
      kb(totalBytes) <= BUDGETS.homeTotalKb
        ? pass('home page total weight', `${kb(totalBytes).toFixed(1)}KB / ${BUDGETS.homeTotalKb}KB`)
        : fail('home page total weight', `<= ${BUDGETS.homeTotalKb}KB`, `${kb(totalBytes).toFixed(1)}KB`),
    );

    out.push(
      fontHosts.length === 0
        ? pass('zero network font requests', 'both faces self-hosted')
        : fail('zero network font requests', 'none', [...new Set(fontHosts)].join(', ')),
    );

    /* LCP and CLS off the browser's own observers. Unthrottled and local, so
       these are a regression signal, not a field measurement. */
    const vitals = await page.evaluate(
      () =>
        new Promise<{ lcp: number; cls: number }>((resolve) => {
          let lcp = 0;
          let cls = 0;
          try {
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
            }).observe({ type: 'largest-contentful-paint', buffered: true });
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) {
                const s = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
                if (!s.hadRecentInput) cls += s.value;
              }
            }).observe({ type: 'layout-shift', buffered: true });
          } catch {
            /* unsupported */
          }
          setTimeout(() => resolve({ lcp, cls }), 1500);
        }),
    );
    out.push(
      vitals.cls <= BUDGETS.cls
        ? pass('CLS (local, unthrottled)', vitals.cls.toFixed(4))
        : fail('CLS (local, unthrottled)', `<= ${BUDGETS.cls}`, vitals.cls.toFixed(4)),
    );
    out.push(info('LCP (local, unthrottled — not a Lighthouse score)', `${vitals.lcp.toFixed(0)}ms`));
  } finally {
    await context.close();
  }

  return out;
}

/** Static scan of the built chunks for libraries that must be lazy. */
function scanInitialBundle(): CheckResult[] {
  const out: CheckResult[] = [];
  const chunkDir = join(process.cwd(), '.next', 'static', 'chunks');
  const files = walk(chunkDir).filter((f) => f.endsWith('.js'));

  if (files.length === 0) {
    out.push(info('initial bundle scan', 'no built chunks found — run `npm run build` first'));
    return out;
  }

  // Every chunk the app shell can pull eagerly. Route-level lazy chunks are
  // named separately by Next; anything in the shared/framework set is initial.
  const combined = files.map((f) => readFileSync(f, 'utf8')).join('\n');

  for (const lib of FORBIDDEN_IN_INITIAL) {
    // Look for the module id as webpack writes it into the chunk.
    const needle = new RegExp(`node_modules[\\\\/]+${lib.replace('-', '[-]?')}[\\\\/]`, 'i');
    const present = needle.test(combined);
    // A library that isn't installed is trivially absent. Say so, rather than
    // banking a green tick that proves nothing — the check only starts meaning
    // something once the phase that adds the dependency has run.
    const installed = existsSync(join(process.cwd(), 'node_modules', lib));
    const label = `${lib} absent from the eagerly-loaded bundle`;
    out.push(
      present
        ? fail(label, 'absent', 'found in .next/static/chunks')
        : installed
          ? pass(label, 'absent')
          : info(`${label} — vacuous: ${lib} is not installed yet`),
    );
  }

  const totalGz = files.reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0);
  out.push(info('all built chunks, gzipped (not a per-route figure)', `${kb(totalGz).toFixed(1)}KB`));

  return out;
}

export async function checkBudget(browser: Browser, baseUrl: string): Promise<SectionResult> {
  const results = [...scanInitialBundle(), ...(await measureHome(browser, baseUrl))];
  return {
    name: 'budget',
    results,
    notes: [
      'Poster and reel budgets become binding in phase 10, when assets exist.',
      'Lighthouse scores are a phase 12 deliverable via mcp__chrome-devtools__lighthouse_audit; ' +
        'the figures here are local and unthrottled.',
    ],
  };
}
