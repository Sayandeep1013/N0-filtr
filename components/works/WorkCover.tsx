import { makeRandom, seedFrom } from '@/lib/art/seed';
import s from './WorkCover.module.css';

/**
 * The stand-in cover a card draws while it has no poster.
 *
 * ── Why this exists rather than a grey box ─────────────────────────────────
 *
 * `01-PHASES.md` T10.1 captures the eight live deploys and T10.5 generates a
 * per-work shader cover; both are phase 10. Phase 4's acceptance criteria are
 * about *composition* — "hovering one card dims all eleven others", the grid's
 * rhythm, the mobile variant — and none of them can be judged against twelve
 * empty rectangles. A grid of grey boxes tells you nothing about whether the
 * grid works.
 *
 * So each card draws its own cover from the one thing it already has: its
 * accent, which `40-content-model.md` §2 sampled from the real project. It is
 * **deterministic** — seeded off the slug, no `Math.random`, so the server and
 * the client agree and a screenshot diff is stable between runs.
 *
 * It is also deliberately *not* the aperture mark. The mark is the studio's;
 * putting it on twelve cards would make the grid look like twelve pieces of our
 * branding rather than twelve pieces of work.
 *
 * T10.5 replaces this by setting `card.poster`. See I-035.
 */

/**
 * `aria-hidden`, and it stays that way when T10.5 supplies a real image. The
 * card's own caption already carries the title and the summary as text, so a
 * label here would make a screen reader read the work's name twice — once as an
 * image description and again as the heading two lines below it.
 */
export function WorkCover({
  slug,
  accent,
  order,
}: {
  slug: string;
  accent: { light: string; dark: string };
  order: number;
}) {
  const random = makeRandom(seedFrom(slug));

  /* The composition: an off-centre ring group over a graded ground. Four rings
     rather than six, so it never reads as the aperture; the offset and the
     radii are the only things the seed touches, which keeps twelve covers
     recognisably one family while none of them is another's twin. */
  const cx = 30 + random() * 45;
  const cy = 26 + random() * 48;
  const base = 12 + random() * 10;
  const rings = [0, 1, 2, 3].map((i) => base * (1 + i * (0.55 + random() * 0.3)));
  const tilt = -30 + random() * 60;

  const gradientId = `cover-grad-${slug}`;
  const numeral = String(order).padStart(2, '0');

  return (
    <svg
      className={s.cover}
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent.dark} />
          {/* Toward the page ground rather than to black: the card has to sit
              on #212121 without a visible edge where the artwork stops. */}
          <stop offset="100%" stopColor="#212121" />
        </linearGradient>
      </defs>

      <rect width="160" height="100" fill={`url(#${gradientId})`} />

      <g
        transform={`rotate(${tilt.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)})`}
        stroke={accent.light}
        fill="none"
      >
        {rings.map((r, i) => (
          <ellipse
            key={r}
            cx={cx.toFixed(2)}
            cy={cy.toFixed(2)}
            rx={r.toFixed(2)}
            /* Squashed, so the rings read as a plane seen at an angle rather
               than as targets. The same 0.62 for every card: it is the camera,
               not the subject, and a seeded one would look like a mistake. */
            ry={(r * 0.62).toFixed(2)}
            strokeWidth={i === 1 ? 0.9 : 0.35}
            opacity={0.5 - i * 0.09}
          />
        ))}
      </g>

      <text className={s.numeral} x="6" y="94" fill={accent.light} opacity="0.5">
        {numeral}
      </text>
    </svg>
  );
}
