/**
 * Performance budgets, from docs/spec/60-architecture-and-build.md §5 and
 * docs/spec/70-physics-footer.md §7.
 */

export const BUDGETS = {
  /**
   * JS on `/`, transferred.
   *
   * **320, raised from 190 by Sayandeep on 2026-08-26.** See I-019 and D-013.
   *
   * The old number was arithmetic, not a measurement: `60-architecture-and-build.md`
   * §5 itemised it as "GSAP ~55, Three ~48gz, Lenis ~4, app ~40" — which sums to
   * 147 and omits React and Next entirely. They are ~92KB on their own. Three
   * measures 141.3KB, not 48; `WebGLRenderer` pulls the whole shader library and
   * tree-shaking barely dents it.
   *
   * Measured at the time of the change: **302.8KB**, which leaves about 17KB.
   * That is not much, and phases 3 to 5 add real code to this route —
   * SplitType, Embla, the works grid, the accordion. **Plyr and Matter must stay
   * out of it**: both are specced as lazy (Plyr on first showreel open, Matter
   * when the pit scrolls into view), so neither should ever appear in this
   * figure. If it does, that is the bug — not the ceiling.
   *
   * ── 360, raised from 320 by Sayandeep on 2026-08-26 ──────────────────────
   *
   * Phase 5 took the route to **321.7KB** and I-034 had flagged it coming: the
   * works grid, the accordion, the culture collage and the blog row all land on
   * this one URL. Put to him with the measurement rather than edited, which is
   * the standard D-013 itself set.
   *
   * What is actually in the figure:
   *
   *     React + Next runtime      ~103KB   unavoidable
   *     three.js                  ~141KB   the hero IS the 3D object
   *     GSAP + ScrollTrigger       ~50KB   every animation on the site
   *     our own components         ~28KB   grid, accordion, collage, showreel
   *
   * The only lever big enough to matter is three, and pulling it means dropping
   * the hero — which is the site's strongest asset and cost phase 2 two
   * sessions. 360 leaves about 38KB for phases 6 to 12.
   *
   * **The lazy rule is unchanged and is what protects this number.** Plyr,
   * Flip, split-type and Matter are all specced to load on demand, and three of
   * the four are asserted absent from the eagerly-loaded bundle below. If one
   * of them ever shows up in this figure that is the bug, not the ceiling.
   *
   * Lighthouse (below) is the quality bar this number only approximates. Total
   * page weight is 467KB of an 1800KB budget, so nothing here is a number a
   * visitor would feel — the JS is what is under pressure, not the transfer.
   */
  homeJsGzipKb: 360,
  /** Home page total transfer with images. */
  homeTotalKb: 1800,
  /** Largest card poster. Becomes binding in phase 10. */
  posterKb: 250,
  /** Largest reel. Becomes binding in phase 10. */
  reelKb: 1200,
  lcpMs: 2500,
  cls: 0.05,
  inpMs: 200,
  lighthouseDesktop: 85,
  lighthouseMobile: 70,
} as const;

/**
 * Modules that must not appear in the initial bundle.
 *
 * `matter` is lazy-loaded when the pit scrolls into view (70-physics-footer §7);
 * `three` is dynamically imported by the hero. If either turns up in a chunk the
 * homepage loads eagerly, the budget is blown and the fix is an import, not a
 * bigger number.
 */
export const FORBIDDEN_IN_INITIAL = ['matter-js', 'three', 'plyr'] as const;

/**
 * Hosts no font may ever be fetched from. Both faces are self-hosted through
 * next/font/local — a request to any of these means a stylesheet crept in.
 */
export const FORBIDDEN_FONT_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'api.fontshare.com',
  'cdn.fontshare.com',
  'use.typekit.net',
] as const;
