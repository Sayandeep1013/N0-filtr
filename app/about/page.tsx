import type { Metadata } from 'next';
import { ABOUT, ARTEFACT_SEEDS, FLYTHROUGH_SEEDS } from '@/lib/content/about';
import { SITE } from '@/lib/content/site';
import { RevealText } from '@/components/ui/RevealText';
import { Button } from '@/components/ui/Button';
import { CtaBlock } from '@/components/ui/CtaBlock';
import { BlogRow } from '@/components/blog/BlogRow';
import { Flythrough } from '@/components/about/Flythrough';
import { PinnedRise } from '@/components/about/PinnedRise';
import { MeetupList } from '@/components/about/MeetupList';
import s from './about.module.css';

/**
 * `/about`. `30-page-specs.md` §`/about`, target ~9,415px. `01-PHASES.md` phase
 * 8 — *"the two best pieces of motion on the site."*
 *
 * ```
 * 1. about-hero   h1 + <Flythrough /> (12) + lead + supporting prose
 * 2. vision       "AGENCY + BUILDER" label, manifesto, <RevealText>
 * 3. meetup       photo/story block — how we work
 * 4. people       <PinnedRise /> — "no filter is people", 45 artefacts, 4×9, pinned 250%
 * 5. open         "Always open to new nodes in our network" + contact link
 * 6. <CtaBlock />
 * 7. blog row
 * ```
 *
 * The two motions are §13 and §14 transcribed value for value. What differs is
 * their contents: their flythrough is studio photographs and their rise is
 * forty-five faces, and we have neither. Both are filled with generated plates
 * (D-038), which is decision 2 of the brief for the faces and I-042 for the
 * photographs.
 */
export const metadata: Metadata = {
  title: `About — ${SITE.name}`,
  description: ABOUT.hero.lead,
};

export default function AboutPage() {
  return (
    <>
      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <h1 data-t="h1" className={s.title}>
              {ABOUT.hero.heading}
            </h1>
          </div>
        </div>

        {/* Full-bleed, between the headline and the copy — §`/about` puts it
            inside the hero rather than after it. */}
        <div className={s.fly}>
          <Flythrough seeds={FLYTHROUGH_SEEDS} />
        </div>

        <div className="padding-global">
          <div className="container-large">
            <div className={s.heroCopy}>
              <p data-t="p-big" className={s.lead}>
                {ABOUT.hero.lead}
              </p>
              <div className={s.body}>
                {ABOUT.hero.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} data-t="p" className={s.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={s.vision} aria-labelledby="vision-heading">
        <div className="padding-global">
          <div className="container-large">
            <p id="vision-heading" data-t="label" className={s.label}>
              {ABOUT.vision.label}
            </p>
            {/* The site's scrubbed word reveal, on the one block of copy that is
                an argument rather than a description. */}
            <RevealText as="p" scale="h3" className={s.manifesto}>
              {ABOUT.vision.manifesto}
            </RevealText>
          </div>
        </div>
      </section>

      <section className={s.meetup} aria-labelledby="meetup-heading">
        <div className="padding-global">
          <div className="container-large">
            <p data-t="label" className={s.label}>
              {ABOUT.meetup.label}
            </p>
            <h2 id="meetup-heading" data-t="h2" className={s.sectionTitle}>
              {ABOUT.meetup.heading}
            </h2>
            <MeetupList items={ABOUT.meetup.items} />
          </div>
        </div>
      </section>

      <section className={s.people} aria-labelledby="people-heading">
        <div className="padding-global">
          <div className="container-large">
            <p data-t="label" className={s.label}>
              Inside the work
            </p>
            <p data-t="p-big" className={s.peopleLead}>
              {ABOUT.people.lead}
            </p>
          </div>
        </div>
        <h2 id="people-heading" className="visually-hidden">
          {ABOUT.people.heading}
        </h2>
        <PinnedRise seeds={ARTEFACT_SEEDS} heading={ABOUT.people.heading} />
      </section>

      <section className={s.open} aria-labelledby="open-heading">
        <div className="padding-global">
          <div className="container-large">
            <div className={s.openGrid}>
              <h2 id="open-heading" data-t="h3" className={s.openTitle}>
                {ABOUT.open.heading}
              </h2>
              <div className={s.openCopy}>
                <p data-t="p" className={s.paragraph}>
                  {ABOUT.open.body}
                </p>
                <Button contact className={s.openCta}>
                  Get in touch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBlock />
      <BlogRow />
    </>
  );
}
