'use client';

import { gsap, ScrollTrigger } from './gsap';

/**
 * One coalesced `ScrollTrigger.refresh()`, scheduled on the shared ticker.
 *
 * ── The crash this exists to stop ─────────────────────────────────────────
 *
 * ```
 * can't access property "end", curTrigger is undefined
 *   at WorksGrid.useGSAP.tweens
 * ```
 *
 * `ScrollTrigger.refresh()` walks the global trigger list and reads `.end` off
 * each entry. Five components were calling it directly, and **four of those
 * calls were inside cleanup functions** — right after `mm.revert()`, which is
 * itself killing triggers. React unmounts a whole subtree in one commit, so
 * component A's cleanup would refresh while component B's revert was still
 * removing entries from the array A was walking. A killed trigger leaves an
 * `undefined` hole, and the walk falls into it.
 *
 * It only ever showed up on a route change or a fast-refresh, which is exactly
 * the class of bug that survives a whole build and then greets a visitor.
 *
 * ── Two rules, and this file is both of them ──────────────────────────────
 *
 * **Never refresh from a cleanup.** There is nothing left to measure — the
 * component is going away. Every one of those four calls was cargo.
 *
 * **Refresh once, after everything has settled.** `gsap.ticker.add` defers to
 * the next frame of the loop this site already runs, so however many callers
 * ask during one commit, the list is walked once and only after every revert in
 * that commit has finished. It is also not a second `requestAnimationFrame`,
 * which CLAUDE.md forbids and `verify:motion` enforces.
 *
 * The remaining legitimate caller is the accordion: opening a row changes the
 * height of everything below it, so every trigger further down the page is
 * measuring against a stale position until this runs.
 */
let scheduled = false;

export function refreshScrollTriggers(): void {
  if (scheduled) return;
  scheduled = true;

  const once = () => {
    gsap.ticker.remove(once);
    scheduled = false;
    ScrollTrigger.refresh();
  };

  gsap.ticker.add(once);
}
