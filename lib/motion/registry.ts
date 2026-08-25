/**
 * Dev-only timeline registry — the hook `verify:motion` reads.
 *
 * Components that own a timeline register it here; the checker boots the dev
 * server, reads the registry back out of the page, and asserts that every
 * duration, ease, stagger and position parameter matches the spec.
 *
 * The whole module compiles to nothing meaningful in production: the guards are
 * on `process.env.NODE_ENV`, which the bundler folds to a constant and then
 * dead-code-eliminates.
 */

import type gsap from 'gsap';

export interface MotionDebug {
  /** Lenis callbacks currently attached to the GSAP ticker. Must be 0 or 1. */
  tickerCallbacks: number;
  /** Which gsap.matchMedia contexts are live right now. */
  activeContexts: string[];
  reducedMotion: boolean;
  lenisRunning: boolean;
}

declare global {
  interface Window {
    __TIMELINES__?: Record<string, gsap.core.Timeline>;
    __MOTION__?: MotionDebug;
  }
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Register a timeline under a stable id. The id is what
 * `tools/verify/motion.config.ts` refers to — `loader.enter`, `work-card.hover`,
 * `contact.open` and so on. Use the same id the spec uses.
 */
export function registerTimeline(id: string, tl: gsap.core.Timeline): void {
  if (!isDev || typeof window === 'undefined') return;
  (window.__TIMELINES__ ??= {})[id] = tl;
}

export function unregisterTimeline(id: string): void {
  if (!isDev || typeof window === 'undefined') return;
  if (window.__TIMELINES__) delete window.__TIMELINES__[id];
}

/** Patch the shared debug object. Called by MotionProvider as state changes. */
export function reportMotionState(patch: Partial<MotionDebug>): void {
  if (!isDev || typeof window === 'undefined') return;
  window.__MOTION__ = {
    tickerCallbacks: 0,
    activeContexts: [],
    reducedMotion: false,
    lenisRunning: false,
    ...window.__MOTION__,
    ...patch,
  };
}
