/**
 * `/about`. `30-page-specs.md` §`/about`, `40-content-model.md`.
 *
 * Everything here is written to be **checkable** — the claims on this page are
 * the ones a visitor can go and verify in a repository, which is the only kind
 * worth making on a studio site nobody has heard of yet.
 *
 * Three of the headings were the spec's verbatim until D-060 and are now ours.
 * The spec is a transcription of tonik; the brief has always said our own
 * brand, our own work, and a heading that says "we are cool humans" is a claim
 * about a company that is not this one.
 *
 * ── What is deliberately not here ────────────────────────────────────────
 *
 * Faces, and the number of them. `00-brief-and-decisions.md` decision 2 replaced
 * tonik's forty-five team photographs with forty-five project artefacts, because
 * we are two to five people per project and a wall of the same three faces is a
 * worse lie than no wall at all.
 */

export const ABOUT = {
  hero: {
    /* Was §`/about`'s verbatim "We are cool humans and we make a fuss". D-060.

       The replacement is the smallest checkable fact about the studio that
       also explains everything else on the page — and it is the one claim a
       visitor tests the moment they use the contact form. */
    heading: 'A studio small enough to answer its own email.',
    /* The email clause moved up into the heading, so the lead stops at the
       handover. It said both, and saying both weakened each. */
    lead: 'No Filter designs and builds software. Small enough that the person who drew the screen is the person who shipped it.',
    body: [
      'Most studios hand a design to a developer and call the join a process. We removed the join. It is the single decision everything else here follows from — the work we take, the way we quote it, the fact that every case study on this site ends in a repository you can read rather than a client logo.',
      'Twelve products so far. All of them ours, all of them running, and several of them still wrong in ways we will tell you about before you ask.',
    ],
  },

  vision: {
    label: 'Agency + builder',
    /* The manifesto, run through <RevealText> — which is why it is one string
       rather than paragraphs: the scrub reads across the whole block. */
    manifesto:
      'We think the gap between deciding something and shipping it is where most software goes wrong. Not the design, not the engineering — the handover. So we do not have one. The studio is arranged so that the same small group carries an idea from the first argument about it to the thing running in production, and everything you can see on this site is the evidence for whether that works.',
  },

  meetup: {
    label: 'How we work',
    heading: 'Five habits, and the reasons we keep them',
    items: [
      {
        title: 'We build the risky part first',
        body: 'The thing nobody is sure about goes in week one, not week six. If a project is going to fail on a technical unknown we would both rather find out while it is still cheap.',
      },
      {
        title: 'You get a link, not a document',
        body: 'Reviews happen on something running, on your own device. A video of an interaction is a review of the video.',
      },
      {
        title: 'We tell you when you are wrong',
        body: 'And we expect the same. A studio that agrees with everything is a studio you are paying to type.',
      },
      {
        title: 'Everything is measured',
        body: 'Bundle size, frame budget, contrast, motion preference. Not because numbers are the point, but because "it feels fast" is not a thing anyone can check.',
      },
      {
        title: 'We finish',
        body: 'Including the empty states, the error copy, the favicon and the thing nobody will notice unless it is missing. Most of the difference between good and unfinished lives there.',
      },
    ],
  },

  people: {
    /* Was §4's verbatim "no filter is people", which is tonik's line about
       tonik's forty-five staff photographs.

       **Ours had stopped being true.** Decision 2 replaced those photographs
       with forty-five project artefacts, precisely because we are two to five
       people per project and a wall of the same three faces is a worse lie
       than no wall at all — so the heading sat above a wall with no people in
       it. Same cadence, accurate subject. D-060. */
    heading: 'no filter is the work',
    lead: 'Forty-five artefacts from twelve products — the screens, the documents, the diagrams and the dead ends. This is what the work actually looks like from the inside.',
  },

  open: {
    /* Was §5's verbatim "Always open to new nodes in our network". A network
       with nodes in it is an org chart; the section is about collaborators.
       D-060. */
    heading: 'There is always room for one more.',
    body: 'Collaborators, contractors, and people with a problem that does not fit anywhere else. If you have read this far you probably know whether we would get on.',
  },
} as const;

/**
 * The forty-five artefacts, as seeds for `<Artwork>`.
 *
 * Generated rather than photographed (D-038), and forty-five of them because
 * that is what §14's `stagger: { grid: [4, 9] }` is built around — thirty-six
 * cells plus the ninth row, which is the shape their animation was tuned on.
 */
export const ARTEFACT_SEEDS: string[] = Array.from(
  { length: 45 },
  (_, i) => `artefact-${String(i + 1).padStart(2, '0')}`,
);

/** The flythrough's twelve. §13 is explicit about the count. */
export const FLYTHROUGH_SEEDS: string[] = Array.from(
  { length: 12 },
  (_, i) => `flythrough-${String(i + 1).padStart(2, '0')}`,
);
