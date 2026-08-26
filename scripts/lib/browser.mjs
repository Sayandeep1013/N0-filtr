import { chromium } from 'playwright';

/**
 * Launch a browser that cannot outlive the script that launched it.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Every capture script here followed the same shape: `launch()` at the top,
 * `browser.close()` at the bottom, and a hundred lines of work in between that
 * can throw. When it did — a dead deploy, a selector that moved, a bad
 * `extract` region — the script died and **the browser did not.**
 *
 * That is not a tidy-up issue on this project. The pages these scripts open run
 * a Three.js hero with a `requestAnimationFrame` loop, so a leaked headless
 * Chromium is not an idle process: it is a process rendering WebGL forever. On
 * 2026-08-27 there were thirteen of them, and Sayandeep's second GPU was pinned
 * at 100% by what Task Manager reported as `node.exe`. See I-057.
 *
 * `try/finally` in each script would work and would have to be remembered five
 * times. This is remembered once, at the only place a browser is created.
 *
 * ── What it covers ──────────────────────────────────────────────────────────
 *
 * The three ways one of these scripts actually ends badly: a rejected promise
 * nobody caught (top-level `await` with no `try`), a synchronous throw, and
 * Ctrl-C. Playwright cleans up after a *graceful* exit on its own; these are the
 * paths where it does not get the chance.
 */
export async function launchGuarded(options = {}) {
  const browser = await chromium.launch(options);

  let closing = false;
  const shutdown = async (code) => {
    if (closing) return;
    closing = true;
    await browser.close().catch(() => undefined);
    process.exit(code);
  };

  process.on('unhandledRejection', (reason) => {
    console.error('\n✗ unhandled rejection — closing the browser first\n', reason);
    void shutdown(1);
  });
  process.on('uncaughtException', (error) => {
    console.error('\n✗ uncaught exception — closing the browser first\n', error);
    void shutdown(1);
  });
  /* Ctrl-C. Without this the script stops and Chromium keeps rendering, which
     is the specific way the thirteen accumulated: interrupted runs. */
  process.on('SIGINT', () => void shutdown(130));
  process.on('SIGTERM', () => void shutdown(143));

  return browser;
}
