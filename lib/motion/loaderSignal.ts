/**
 * "Starting as the loader clears."
 *
 * `50-brand-and-3d.md` §2 times the hero's load-in against the loader finishing,
 * and phase 3's hero copy has the same dependency. Neither can be built on a
 * guessed delay — the loader's enter timeline is 0.6s normally and 0.2s under
 * reduced motion, so any hard-coded number is wrong in one of the two modes.
 *
 * This is a **latched** signal, not a plain event. The loader is mounted before
 * Hero3D and its timeline is short; a consumer that subscribes after the loader
 * has already finished would otherwise wait forever for an event that has been
 * and gone. Subscribing late fires immediately instead.
 *
 * Deliberately not React context: the loader clears once per session, consumers
 * want it from inside a GSAP callback rather than a render, and a context update
 * would re-render the whole tree for a one-shot fact.
 */

let cleared = false;
const waiting = new Set<() => void>();

/** Called by the Loader when its enter timeline completes. Idempotent. */
export function markLoaderCleared(): void {
  if (cleared) return;
  cleared = true;
  for (const fn of waiting) fn();
  waiting.clear();
}

/**
 * Runs `fn` when the loader has cleared — immediately if it already has.
 * Returns an unsubscribe for the case where the consumer unmounts first.
 */
export function onLoaderCleared(fn: () => void): () => void {
  if (cleared) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => waiting.delete(fn);
}

/**
 * Test seam. The loader rebuilds its timelines when `prefers-reduced-motion`
 * changes, and `verify:motion`'s behaviour checks drive that toggle — without a
 * way back to the unlatched state the second run would see a signal that had
 * already fired. Not called in application code.
 */
export function resetLoaderSignal(): void {
  cleared = false;
  waiting.clear();
}

/** Whether the loader has already finished. For consumers that need to branch. */
export function hasLoaderCleared(): boolean {
  return cleared;
}
