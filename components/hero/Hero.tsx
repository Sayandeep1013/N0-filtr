import { HERO } from '@/lib/content/site';
import { PlaySquare } from './PlaySquare';
import { Button } from '@/components/ui/Button';
import { StackWall } from './StackWall';
import s from './Hero.module.css';

/**
 * The homepage hero. `30-page-specs.md` §1.
 *
 * The 3D assembly is **not** rendered here — it is mounted in the root layout,
 * outside `<main>`, so one WebGL context survives every route change. §1 calls
 * that out as a critical architectural note. This section is the copy that sits
 * over it.
 *
 * ⚠ **This is phase 3's T3.1, built in phase 2** at Sayandeep's request, because
 * the hero's composition against the 3D object cannot be judged without it. See
 * D-015.
 *
 * The structure is `padding-global > container-large`, which is tonik's own
 * nesting and the reason their copy starts 98px from the left of a 1512 viewport
 * rather than at the 41px gutter — `container-large` caps the measure at 80rem
 * and centres it inside the gutter. Measured on their live site rather than
 * inferred from a capture. See I-030.
 *
 * ── The section is taller than the viewport, and that is the point ─────────
 *
 * §1 gives `section_home-hero` **1361px** at a 900 viewport: the first 900 is
 * the copy over the 3D assembly, and the remaining 461 is `<StackWall />`,
 * which sits *inside* this section rather than after it — theirs does too. So
 * `.hero` is a plain block of two children, and it is the first child that
 * carries the viewport height.
 *
 * `data-hero` is the anchor `Hero3D` looks for, and it stays on the outer
 * section: the mobile scroll drive turns the object across the hero's whole
 * range, wall included, which is what tonik's own range is. That closes I-020.
 */
/**
 * Renders `HERO.selectedWord` as if it were selected, wherever it falls.
 *
 * The line is split on the word rather than the word being positioned by index,
 * so rewriting the headline can never leave the highlight on the wrong word —
 * the worst kind of content bug, because it looks deliberate.
 *
 * The wrapper is a plain `<span>`, not `<mark>`. `<mark>` means "relevant to
 * the user's current activity" and some screen readers announce it; this is a
 * visual treatment of one word in a headline and should be read as ordinary
 * text, which is exactly what a real selection is.
 */
function withSelectedWord(line: string) {
  const word = HERO.selectedWord;
  const at = word ? line.indexOf(word) : -1;
  if (at === -1) return line;

  return (
    <>
      {line.slice(0, at)}
      <span className={s.selected}>{word}</span>
      {line.slice(at + word.length)}
    </>
  );
}

export function Hero() {
  return (
    <section className={s.hero} data-hero>
      <div className={`${s.viewport} padding-global`}>
        <div className={`${s.inner} container-large`}>
          <h1 className={s.headline} data-t="h1">
            {/* Two lines, hard-broken rather than wrapped: the break is a design
                decision and the play control has to land at the start of line 2,
                which a soft wrap cannot guarantee at any viewport. */}
            <span className={s.line}>{withSelectedWord(HERO.lineOne)}</span>

            {/* Line 2 is a flex row, as theirs is — `home-hero_video-wrapper`,
                `display: flex`, `align-items: flex-end`, `gap: 2.5rem`. The play
                control is a SIBLING of the text, not a glyph inside it, which is
                what lets §15's Flip lift it out to full screen later. */}
            <span className={s.lineTwo}>
              <PlaySquare />
              <span>{withSelectedWord(HERO.lineTwo)}</span>
            </span>
          </h1>

          {/* ── the mobile actions ──────────────────────────────────────
              Sayandeep, on the phone: *"the hero section is way too long with
              nothing in it .. add a button of some sort or something to fill
              that empty space."*

              He is right, and the void is structural rather than accidental.
              On desktop the hero's height is filled by the 3D assembly and the
              headline sitting beside each other; below 768 the object drops
              behind the copy and the two stop sharing a row, which leaves the
              column the object used to occupy as dead space above the rail.

              So the space gets the thing it should have had anyway. The
              desktop hero's only affordance is `<PlaySquare>`, which is a
              showreel control rather than a way into the site — a phone
              visitor had nothing to press until they scrolled past the fold.

              Hidden above 767 deliberately: the desktop composition is
              approved and does not have room for a button row. */}
          <div className={s.actions}>
            <Button href="/works">See the work</Button>
            <Button contact variant="ghost">
              Let&rsquo;s talk
            </Button>
          </div>

          <div className={s.rail}>
            <span data-t="label">{HERO.labelLeft}</span>
            <span data-t="label">{HERO.labelRight}</span>
          </div>
        </div>
      </div>

      <StackWall />
    </section>
  );
}
