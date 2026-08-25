/**
 * Comparison helpers. The whole point of these is that an assertion in a config
 * file should read like the spec it came from — `#3b3b3b`, `0.75rem` — and the
 * translation into whatever Chrome reports back should live here, once.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColour(value: string): Rgba | null {
  const v = value.trim().toLowerCase();

  const hex = /^#([0-9a-f]{3,8})$/.exec(v);
  if (hex?.[1]) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }

  const fn = /^rgba?\(([^)]+)\)$/.exec(v);
  if (fn?.[1]) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const [r, g, b, a] = parts;
    if (r === undefined || g === undefined || b === undefined) return null;
    return { r, g, b, a: a ?? 1 };
  }

  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

/** Chrome rounds alpha to 3dp; 1/255 of tolerance absorbs the hex round-trip. */
export function colourEquals(expected: string, actual: string): boolean {
  const e = parseColour(expected);
  const a = parseColour(actual);
  if (!e || !a) return false;
  return e.r === a.r && e.g === a.g && e.b === a.b && Math.abs(e.a - a.a) <= 0.005;
}

/** Leading number out of '16.45px', '-2.4675px', '32.9', '400'. */
export function toNumber(value: string): number | null {
  const m = /^-?[\d.]+/.exec(value.trim());
  return m ? Number(m[0]) : null;
}

export function numberEquals(expected: number, actual: string, tolerance: number): boolean {
  const a = toNumber(actual);
  return a !== null && Math.abs(a - expected) <= tolerance;
}

/**
 * Expected px for a rem value at a given root size. This is the arithmetic the
 * whole design system rests on: at 1512 the root is 16.45px, so `6rem` is
 * 98.7px and `-0.15rem` of tracking is -2.4675px.
 */
export function remPx(rem: number, root: number): number {
  return rem * root;
}

/** The fluid root itself: 7px + 0.625vw above 1440, locked to 16px at or below. */
export function rootSizeAt(viewportWidth: number): number {
  if (viewportWidth <= 1440) return 16;
  return 0.4375 * 16 + 0.00625 * viewportWidth;
}

/** Does the computed font-family list lead with the expected face? */
export function familyLeadsWith(computed: string, expectedSubstring: string): boolean {
  const first = computed.split(',')[0]?.replace(/["']/g, '').trim().toLowerCase() ?? '';
  return first.includes(expectedSubstring.toLowerCase());
}
