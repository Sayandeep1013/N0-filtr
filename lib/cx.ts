/**
 * Join class names, dropping anything falsy.
 *
 * Used everywhere a CSS-Module class is paired with a stable BEM hook class —
 * see D-007 for why animated elements carry both.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
