import { notFound } from 'next/navigation';

/**
 * The token probe surface. Development only.
 *
 * `verify:tokens` reads getComputedStyle off these elements to assert the token
 * table. Phase 0 has no components yet, so the probes are the only thing on the
 * site carrying a `data-t` attribute — later phases point their assertions at
 * real pages instead, but this route stays as the canonical scale reference and
 * as the thing that catches a token regression before any component notices.
 *
 * Every scale token in docs/spec/10-design-system.md §3 must appear here. If you
 * add a token, add a probe — an unprobed token is an unverified token.
 */

const SCALE = [
  'h1',
  'h1-sm',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p-big',
  'p',
  'p-sm',
  'label-big',
  'label',
  'label-sm',
] as const;

const COLOUR_TOKENS = [
  'black',
  'white',
  'grey-900',
  'grey-800',
  'grey-700',
  'grey-600',
  'white-30',
  'grey-800-30',
  'white-10',
  'white-50',
  'black-50',
  'black-70',
  'bg-primary',
  'bg-secondary',
  'bg-tertiary',
  'bg-alternate',
  'bg-transparent',
  'text-primary',
  'text-secondary',
  'text-alternate',
  'border-primary',
  'border-alternate',
  'success',
  'success-bg',
  'error',
  'error-bg',
  'accent',
] as const;

const LAYOUT_TOKENS = ['gutter', 'content', 'col', 'grid-gap', 'grid-gap-tight', 'section-y'] as const;

export default function ProbePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="padding-global section" data-probe="root">
      {/* Type scale. The harness reads fontSize, lineHeight, letterSpacing,
          fontWeight, fontFamily and textTransform off each of these. */}
      {SCALE.map((token) => (
        <p key={token} data-t={token} data-probe-scale={token}>
          {token} — the quick brown fox jumps over the lazy dog 0123456789
        </p>
      ))}

      {/* Colour tokens, read back as resolved computed colours. A swatch is the
          only way to get a custom property through getComputedStyle as an
          actual rgb() rather than as its raw declaration text. */}
      {COLOUR_TOKENS.map((token) => (
        <span
          key={token}
          data-probe-colour={token}
          style={{ display: 'block', width: 1, height: 1, backgroundColor: `var(--${token})` }}
        />
      ))}

      {/* Layout tokens, read back as resolved lengths via width. */}
      {LAYOUT_TOKENS.map((token) => (
        <span
          key={token}
          data-probe-length={token}
          style={{ display: 'block', height: 1, width: `var(--${token})` }}
        />
      ))}

      {/* The gutter, measured where it is actually applied rather than as a
          variable — this is the assertion in 02-VERIFICATION.md. */}
      <div className="padding-global" data-probe="gutter" />
    </div>
  );
}
