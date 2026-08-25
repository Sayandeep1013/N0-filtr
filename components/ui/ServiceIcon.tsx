/**
 * Line-art glyphs for the five services, used in the footer list.
 *
 * ⚠ **Placeholder art.** `20-components-and-motion.md` §20 says the footer
 * service list is "icon + label" and gives the icon's size (1.25rem) and its
 * opacity (0.5), but there is no icon set to transcribe — tonik drew their own.
 * These five are minimal geometric marks in the same line weight as the aperture
 * so the footer composes correctly; they are not a designed set. Replacing them
 * is one file. See I-014.
 *
 * Drawn on a 20×20 grid at a 1.5-unit stroke, matching the mark's ratio of
 * stroke to box.
 */

const PATHS: Record<string, string> = {
  // Product Design — a frame with an inner artboard
  'product-design': 'M3 4h14v12H3zM3 8h14M7 8v8',
  // Branding — three concentric arcs radiating from a point
  branding: 'M5 16a5 5 0 0 1 5-5 5 5 0 0 1 5 5M2 16a8 8 0 0 1 8-8 8 8 0 0 1 8 8M10 5v0',
  // Websites — a browser chrome bar
  websites: 'M3 5h14v10H3zM3 8h14M5.5 6.5h0M8 6.5h0',
  // No-Code — stacked blocks clicking together
  'no-code': 'M3 4h6v6H3zM11 10h6v6h-6zM9 7h2M9 13h2',
  // Engineering — an angle bracket pair
  engineering: 'M7 6l-4 4 4 4M13 6l4 4-4 4',
};

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const d = PATHS[slug] ?? PATHS.engineering;
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
