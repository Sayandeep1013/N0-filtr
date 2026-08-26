import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

export interface Viewport {
  w: number;
  h: number;
}

export async function launch(): Promise<Browser> {
  return chromium.launch({ args: ['--font-render-hinting=none'] });
}

export interface PageOptions {
  viewport: Viewport;
  reducedMotion?: 'reduce' | 'no-preference';
  /** Install the rAF instrumentation before any page script runs. */
  instrumentRaf?: boolean;
}

/**
 * Counts *persistent* requestAnimationFrame loops — callbacks that reschedule
 * themselves. A one-shot rAF (React, Lenis's own internals during a scrollTo)
 * is not a loop and must not be counted; a driver that keeps re-arming is.
 *
 * This is how CLAUDE.md's "one animation loop" rule becomes checkable rather
 * than aspirational. GSAP's ticker is the one legitimate loop, so the expected
 * answer is exactly 1.
 */
const RAF_PROBE = `
(() => {
  const native = window.requestAnimationFrame.bind(window);
  const loops = new Map();
  window.__RAF__ = { loops };
  let depth = 0;
  let current = null;

  window.requestAnimationFrame = function (cb) {
    // A call made from inside another rAF callback is that callback rescheduling
    // itself — i.e. a loop. Attribute it to the outermost frame's site.
    const site = depth > 0 && current
      ? current
      : (new Error().stack || '').split('\\n').slice(1, 4).join(' | ');

    if (depth > 0) {
      const entry = loops.get(site) || { site, ticks: 0 };
      entry.ticks++;
      loops.set(site, entry);
    }

    return native(function (t) {
      const prev = current;
      current = site;
      depth++;
      try { return cb(t); } finally { depth--; current = prev; }
    });
  };
})();
`;

/**
 * A one-line shim for a helper esbuild injects and the browser has never heard of.
 *
 * The harness runs through `tsx`, which compiles with esbuild's `keepNames`
 * behaviour: a function assigned to a variable is rewritten as
 * `var wait = __name((ms) => ..., "wait")` so that `fn.name` survives
 * minification. That rewrite applies to the callbacks we hand to
 * `page.evaluate` as well — and those are serialised and run **in the browser**,
 * where `__name` does not exist.
 *
 * The failure is `ReferenceError: __name is not defined`, thrown from inside
 * `page.evaluate`, pointing at a line of perfectly ordinary code. Nothing in
 * the message suggests a build tool. It cost phase 4 a verify run to find.
 *
 * The workaround everyone reaches for first is "don't name functions inside
 * evaluate", which is a rule nobody remembers and which quietly bans the
 * clearest way to write a multi-step in-page check. Defining the helper is one
 * line and it is what esbuild would have emitted itself in a bundle.
 */
const KEEP_NAMES_SHIM = 'globalThis.__name = globalThis.__name || function (fn) { return fn; };';

export async function newPage(browser: Browser, opts: PageOptions): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: opts.viewport.w, height: opts.viewport.h },
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion ?? 'no-preference',
  });
  await context.addInitScript({ content: KEEP_NAMES_SHIM });
  if (opts.instrumentRaf) await context.addInitScript(RAF_PROBE);
  const page = await context.newPage();
  return { context, page };
}

/**
 * The *actual* typeface Chrome used to paint an element, via CDP. Reading
 * font-family off getComputedStyle only proves what we asked for; this proves
 * what we got, which is the assertion that catches a font that failed to load.
 */
export async function platformFontFor(page: Page, selector: string): Promise<string | null> {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const doc = (await cdp.send('DOM.getDocument')) as { root: { nodeId: number } };
    const found = (await cdp.send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector,
    })) as { nodeId: number };
    if (!found.nodeId) return null;
    const res = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: found.nodeId })) as {
      fonts: { familyName: string; glyphCount: number }[];
    };
    const dominant = [...res.fonts].sort((a, b) => b.glyphCount - a.glyphCount)[0];
    return dominant?.familyName ?? null;
  } catch {
    return null;
  } finally {
    await cdp.detach().catch(() => undefined);
  }
}

/** getComputedStyle for one element, as a plain record of the props asked for. */
export async function computed(
  page: Page,
  selector: string,
  props: string[],
): Promise<Record<string, string> | null> {
  return page.evaluate(
    ({ selector, props }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const out: Record<string, string> = {};
      for (const p of props) out[p] = cs.getPropertyValue(p);
      return out;
    },
    { selector, props },
  );
}

/**
 * Wait until the loader panel is actually gone.
 *
 * Phase 5 gave the loader a mark animation on first paint — the aperture's ring
 * draws, then its six blades — so the panel now covers the page for about 1.3s
 * rather than 0.6s (D-028). Every check that hovers or clicks early was
 * implicitly relying on the shorter number, and they started failing with
 * Playwright's most misleading message:
 *
 *     <div class="loader"> intercepts pointer events
 *     - element was detached from the DOM, retrying
 *
 * which names the element it could not reach and says nothing about why. The
 * fix is not a longer `waitForTimeout` — that is the same guess with a bigger
 * number, and it breaks again the next time the loader changes. Wait for the
 * state.
 *
 * ── Why this polls by hand instead of using `waitForFunction` ──────────────
 *
 * Because `waitForFunction` **injects a poller into the page**, and this
 * harness counts persistent rAF loops to enforce CLAUDE.md's "one animation
 * loop" rule. Playwright's default polling is `raf`, so the first version of
 * this helper failed the very check it was written to help other checks reach —
 * the report named an anonymous frame inside `eval at evaluate`, which points
 * at nothing you can grep for.
 *
 * Setting `polling: 100` was the obvious next move and did not fix it: the
 * injected poller is still Playwright's own code running in the page, and the
 * probe is deliberately indiscriminate about whose loop it is. A loop of
 * `page.evaluate` from the Node side injects nothing that outlives the call.
 */
export async function waitForLoaderGone(page: Page, timeoutMs = 12_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const gone = await page
      .evaluate(() => {
        const loader = document.querySelector('.loader');
        if (!loader) return true;
        return getComputedStyle(loader).display === 'none';
      })
      .catch(() => true);
    if (gone) break;
    await page.waitForTimeout(100);
  }
  // One frame past the sweep, so nothing is mid-transform when we measure.
  await page.waitForTimeout(120);
}
