import localFont from 'next/font/local';

/**
 * Both faces are self-hosted. There must be zero network font requests at runtime —
 * `verify:budget` asserts this. See docs/spec/10-design-system.md §3.
 *
 * General Sans ships as a single variable file covering 200–700, which is every weight
 * the design system names in one 38KB request. The display face is never rendered above
 * 400 (CLAUDE.md non-negotiable §3) — the range exists so the mark and wordmark work in
 * phase 2, not so headings can be bolded.
 */
export const displayFont = localFont({
  src: [{ path: './GeneralSans-Variable.woff2', weight: '200 700', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  fallback: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: false,
});

/** IBM Plex Mono has no variable cut on Fontsource — see D-003 for why only 400/500 ship. */
export const monoFont = localFont({
  src: [
    { path: './IBMPlexMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: './IBMPlexMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  adjustFontFallback: false,
});
