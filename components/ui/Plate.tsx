import { cx } from '@/lib/cx';
import s from './Plate.module.css';

/**
 * The plate. Every screenshot on this site sits on one.
 *
 * ── Why it exists ─────────────────────────────────────────────────────────
 *
 * Sayandeep, on the first build of the case study: *"i really really dont like
 * the project images there it breaks the immersion that we had throughout the
 * site before the project images came."*
 *
 * He was right, and the diagnosis is not the obvious one. The problem is not
 * that the screenshots are colourful — it is that they are **whole application
 * screenshots bleeding to the container edge**: toolbars, side rails, tiny UI
 * text, a second interface's worth of visual noise butted straight against a
 * page built out of hairlines and 400-weight type.
 *
 * tonik do not do this, and it took looking at their own screens to see it.
 * Their work cards are single art-directed key images — a 3D render on a flat
 * ground, a rendered landscape — one subject, one dominant colour, a great deal
 * of empty space. The one genuine UI screenshot on their Supabase case study
 * sits **inset on a lighter plate with heavy padding**, floating, never touching
 * an edge. See `docs/research/screens/s20-cs-content.png`.
 *
 * So a plate: the site's own material, a hairline, real padding, and the
 * screenshot floating inside it under a soft shadow. The picture becomes an
 * artefact placed on a surface rather than a hole cut in the page — and the
 * colours inside it stay exactly as they are, which matters on a site called No
 * Filter. Graded and duotoned variants were rendered and rejected for that
 * reason; see `docs/research/screens/ours/image-treatments.png` and D-034.
 *
 * ── Sizes ─────────────────────────────────────────────────────────────────
 *
 * The padding is what does the work, so it scales with the slot rather than
 * being one value that is too tight in a hero and absurd in a card:
 *
 *   · `lg` — 3.5rem · the case-study hero, `visual-full`, `visual-bleed`
 *   · `md` — 2rem   · `visual-2up`, slider slides
 *   · `sm` — 1.25rem · works-grid cards, `<NextWork>`
 *
 * `bleed` widens the plate itself to the viewport while the image inside stays
 * inset. That is what `visual-bleed` means now: the *plate* reaches the edges,
 * not the screenshot. A block type that used to say "put the screenshot edge to
 * edge" is the one this component exists to prevent.
 */
export function Plate({
  size = 'lg',
  bleed = false,
  className,
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  bleed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cx(s.plate, s[size], bleed && s.bleed, className)}>{children}</div>;
}
