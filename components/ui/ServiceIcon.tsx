/**
 * Line-art glyphs for the six services, used in the footer list.
 *
 * ⚠ **Placeholder art.** `20-components-and-motion.md` §20 says the footer
 * service list is "icon + label" and gives the icon's size (1.25rem) and its
 * opacity (0.5), but there is no icon set to transcribe — tonik drew their own.
 * These six are minimal geometric marks in the same line weight as the aperture
 * so the footer composes correctly; they are not a designed set. Replacing them
 * is one file. See I-014.
 *
 * Drawn on a 20×20 grid at a 1.5-unit stroke, matching the mark's ratio of
 * stroke to box.
 *
 * The `creative-development` glyph replaced a `no-code` one on 2026-08-26 when
 * that service was renamed (D-011). The old drawing was stacked blocks clicking
 * together — a no-code metaphor that meant nothing under the new name. It is a
 * wireframe cube now, which at least points at the WebGL work. Still placeholder
 * art like the other four.
 */

const PATHS: Record<string, string> = {
  // Product Design — a frame with an inner artboard
  'product-design': 'M3 4h14v12H3zM3 8h14M7 8v8',
  // Branding — three concentric arcs radiating from a point
  branding: 'M5 16a5 5 0 0 1 5-5 5 5 0 0 1 5 5M2 16a8 8 0 0 1 8-8 8 8 0 0 1 8 8M10 5v0',
  // Websites — a browser chrome bar
  websites: 'M3 5h14v10H3zM3 8h14M5.5 6.5h0M8 6.5h0',
  // Creative Development — a cube in wireframe, the 3D the service is about
  'creative-development': 'M10 3l6 3.5v7L10 17l-6-3.5v-7zM10 3v7m0 0l6-3.5M10 10l-6-3.5',
  // Engineering — an angle bracket pair
  engineering: 'M7 6l-4 4 4 4M13 6l4 4-4 4',
  // App Development — a handset outline with a speaker slot and a home line.
  // Placeholder like the other five (D-062, I-014); it is the one shape nobody
  // has to be told the meaning of, which is what a footer icon at 1.25rem and
  // 50% opacity needs.
  'app-development': 'M6 2.5h8v15H6zM8.5 5h3M8.5 15h3',
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
