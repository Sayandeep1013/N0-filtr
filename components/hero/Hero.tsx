import { HERO } from '@/lib/content/site';
import { PlaySquare } from './PlaySquare';
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
 * What is deliberately NOT here, and stays phase 3's:
 *
 *  · the scrubbed word reveal (T3.3) — this copy is static
 *  · the showreel Flip choreography (T3.6) — PlaySquare is inert, and says so
 *  · the stack wall below it (T3.4, T3.5)
 *
 * `data-hero` is the anchor `Hero3D` looks for. With it, the mobile scroll drive
 * scrubs against this section's own range instead of falling back to the first
 * viewport — which closes I-020.
 */
export function Hero() {
  return (
    <section className={s.hero} data-hero>
      <div className={`${s.gutter} padding-global`}>
        <div className={`${s.inner} container-large`}>
          <h1 className={s.headline} data-t="h1">
            {/* Two lines, hard-broken rather than wrapped: the break is a design
                decision and the play control has to land at the start of line 2,
                which a soft wrap cannot guarantee at any viewport. */}
            <span className={s.line}>{HERO.lineOne}</span>

            {/* Line 2 is a flex row, as theirs is — `home-hero_video-wrapper`,
                `display: flex`, `align-items: flex-end`, `gap: 2.5rem`. The play
                control is a SIBLING of the text, not a glyph inside it, which is
                what lets §15's Flip lift it out to full screen later. */}
            <span className={s.lineTwo}>
              <PlaySquare />
              <span>{HERO.lineTwo}</span>
            </span>
          </h1>

          <div className={s.rail}>
            <span data-t="label">{HERO.labelLeft}</span>
            <span data-t="label">{HERO.labelRight}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
