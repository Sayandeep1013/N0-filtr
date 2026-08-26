/**
 * Deterministic randomness. One implementation, shared by everything that draws
 * a generated plate.
 *
 * "Deterministic" is not a nicety here — it is what makes the whole idea work.
 * A generated image on a server-rendered page has to come out **identical** on
 * the server and in the browser or React reports a hydration mismatch, and it
 * has to come out identical on every build or a poster changes because someone
 * redeployed. `Math.random()` fails both.
 *
 * These two functions were `components/works/WorkCover.tsx`'s until the artwork
 * generator needed the same pair. Same code, one home.
 */

/** FNV-1a. Stable across runtimes, which `String.hashCode`-style loops are not. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Lehmer LCG. Same seed, same picture, on the server and in the browser. */
export function makeRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** `random()` in `[min, max)`. */
export function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

/** One of `items`, chosen by the seed. */
export function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length) % items.length]!;
}
