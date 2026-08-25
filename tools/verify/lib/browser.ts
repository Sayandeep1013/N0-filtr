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

export async function newPage(browser: Browser, opts: PageOptions): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: opts.viewport.w, height: opts.viewport.h },
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion ?? 'no-preference',
  });
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
