/**
 * Performance budgets, from docs/spec/60-architecture-and-build.md §5 and
 * docs/spec/70-physics-footer.md §7.
 */

export const BUDGETS = {
  /** JS on `/`, gzipped. GSAP ~55, Three ~48gz, Lenis ~4, app ~40. */
  homeJsGzipKb: 190,
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
