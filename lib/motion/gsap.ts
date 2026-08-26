/**
 * The single place GSAP plugins are registered. Import `gsap` and the plugins
 * from here, never from 'gsap' directly, so registration cannot be forgotten
 * and cannot happen twice.
 *
 * As of GSAP 3.13 the whole plugin set is free — no bonus files, no auth token.
 *
 * ── What is deliberately NOT here ───────────────────────────────────────────
 * `60-architecture-and-build.md` §1 lists Flip and Observer in the stack,
 * because tonik loads them. Registering a plugin is what pulls it into the
 * bundle, so both were shipping on every page for nothing:
 *
 *  · **Flip** has exactly one consumer on the whole site — the showreel
 *    (`20-components-and-motion.md` §15, "the only use of Flip"). It belongs to
 *    phase 3. Add `import { Flip } from 'gsap/Flip'` back to this file when the
 *    showreel needs it, not before.
 *  · **Observer** has no consumer in any component spec at all. It is in the
 *    stack table only because it is in theirs. Leave it out until something
 *    actually asks for it.
 *
 * Removed in phase 2 while measuring the hero's bundle cost (I-019). The point
 * is not the bytes it saved — it is that a budget argument is only honest once
 * everything unused is gone.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);

  // Dev only: verify:motion counts ScrollTriggers across route changes to catch
  // leaks, and it needs a handle to do it. Folded out of production builds.
  if (process.env.NODE_ENV === 'development') {
    Object.assign(window, { gsap, ScrollTrigger });
  }
}

export { gsap, ScrollTrigger, useGSAP };
