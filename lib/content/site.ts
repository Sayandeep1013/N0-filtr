/**
 * Site-level content constants.
 *
 * Everything here is either transcribed from docs/spec/40-content-model.md or is
 * a placeholder the brief explicitly names in docs/spec/00-brief-and-decisions.md
 * "Open items" — the user replaces those, not us.
 *
 * The per-entity content modules (works.ts, services.ts, posts.ts, per
 * 60-architecture-and-build.md §2) arrive with the phases that need them.
 */

/**
 * The superscript on the navbar's WORKS link. 40-content-model.md §2 names
 * twelve works. Bound to a constant rather than typed into the markup so it
 * cannot drift from reality; phase 4 replaces this with `WORKS.length` once
 * lib/content/works.ts exists.
 */
export const WORKS_COUNT = 12;

export interface NavLink {
  label: string;
  href: string;
  /** Renders the works count as a superscript after the label. */
  count?: number;
}

/** 20-components-and-motion.md §2 — WORKS¹² · ABOUT · SERVICES · BLOG. */
export const NAV_LINKS: NavLink[] = [
  { label: 'Works', href: '/works', count: WORKS_COUNT },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
];

/**
 * The six services. Slugs and names for 01–05 are 40-content-model.md §3
 * verbatim; the footer renders them as the sibling-dim list (§20). Headlines,
 * copy, FAQ and accordion panels are phase 7's.
 *
 * **06 has no §3 entry** — §3 transcribes tonik's five and tonik do not build
 * apps. See `lib/content/services.ts` and D-062.
 */
export interface ServiceSummary {
  slug: string;
  name: string;
}

/* Service 04 was `no-code` / "No-Code Development" — inherited straight from tonik,
   who build in Webflow. We do not. Replaced with Creative Development by Sayandeep
   on 2026-08-26; see D-011. */
export const SERVICES: ServiceSummary[] = [
  { slug: 'product-design', name: 'Product Design' },
  { slug: 'branding', name: 'Branding' },
  { slug: 'websites', name: 'Websites' },
  { slug: 'creative-development', name: 'Creative Development' },
  { slug: 'engineering', name: 'Engineering' },
  /* Ours, not §3's. D-062. */
  { slug: 'app-development', name: 'App Development' },
];

/* ── the hero ──────────────────────────────────────────────────────────────
   `30-page-specs.md` §1 gives the structure and a placeholder line — "Design
   and engineering" / "for people who ship" — which is tonik's cadence with our
   services dropped in. It says what we do and nothing about who we are.

   This one earns the name. "Nothing lost" is the same claim the footer tagline
   makes ("No filter between the idea and the thing") without repeating its
   words, and the first line names both halves of what we actually sell.

   Length is a design constraint here, not a preference. At `--t-h1` (6rem) a
   line much past sixteen characters wraps inside the headline's 60% measure,
   and the measure is what keeps the copy off the 3D assembly — so a longer line
   does not just look worse, it puts the headline under the object. "Design and
   engineering" was the first draft and wrapped to three lines.

   Written in phase 2 at Sayandeep's request; the hero itself is phase 3's T3.1.
   Both lines are here rather than in the component so changing them is one
   edit and needs no knowledge of the markup. */

export const HERO = {
  /** Line 1. */
  lineOne: 'Design and build',
  /** Line 2. The play control sits inline before it, in the text flow. */
  lineTwo: 'with nothing lost',
  /**
   * One word in the headline is drawn as if the visitor had selected it.
   *
   * Sayandeep's, 2026-08-26: *"the word 'build' to be selected — it creates a
   * depth effect."* It does, and the reason is worth writing down, because it
   * is not an arbitrary flourish. The site already inverts `::selection` to
   * `#efefef` on `#212121` (`10-design-system.md` §6), so a selected word here
   * is not a new visual language — it is the one the page already uses, applied
   * on purpose instead of by accident. A selection highlight also sits *behind*
   * the glyphs and spans the full line box, so it reads as a plane at a
   * different depth from the type rather than as a coloured word.
   *
   * It has to be a word that actually appears in `lineOne` or `lineTwo`; the
   * component splits the line on it rather than being told where it is, so
   * rewriting the headline cannot leave a stale index behind. If it matches
   * nothing, the line renders plain. See D-021.
   */
  selectedWord: 'build',
  /** The 2-up mono rail above the hairline at the section's foot. */
  labelLeft: '0→1 design and engineering for founders who ship',
  labelRight: '12 shipped projects · 6 services',
} as const;

/* ── identity ──────────────────────────────────────────────────────────────
   The canonical origin, used for `metadataBase`, the OG card's absolute URLs
   and the manifest. **Chosen by Sayandeep on 2026-08-26**: `nofilter.studio`.
   Open item 5 is closed. It still reads from an env var first so a preview
   deploy can point at its own origin without a code change. */

export const SITE = {
  name: 'No Filter',
  /** The wordmark's own casing. Used where the brand is set, not where it is read aloud. */
  wordmark: 'NO FiLTER',
  description: 'A studio for work that does not need softening.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nofilter.studio',
} as const;

/* ── contact details ───────────────────────────────────────────────────────
   Supplied by Sayandeep, 2026-08-25. One real address for everything; there is
   deliberately no street address, so the studio row carries the locality and the
   offset instead of an address block. 00-brief-and-decisions.md open items 1
   and 3 are closed.

   Closed on 2026-08-26: the domain, the footer tagline, and the Tally form id
   (there is none — the mailto fallback is the shipped answer). The social hrefs
   beyond GitHub are deliberately provisional; see SOCIALS. */

export const CONTACT = {
  /* Changed from a personal gmail address to the studio's own on 2026-08-26,
     at Sayandeep's request. Worth one line: `support@` at the studio's domain
     is the difference between a site that looks like a studio and one that
     looks like a person with a portfolio, and it is the address the contact
     form's `mailto:` composes to.

     ⚠️ Note the domain. The site's canonical origin is **nofilter.studio**
     (chosen the same day, open item 5), and this address is at **nofilter.com**.
     They may well be deliberate — a .com for mail is common — but a visitor
     reading `support@nofilter.com` in the footer of `nofilter.studio` will read
     it as a typo, and mail sent to an unowned domain bounces silently. Flagged
     in the handoff; see I-040. */
  email: 'support@nofilter.com',
  /**
   * tonik's second footer row is "OPPORTUNITIES AT TONIK → Work with us",
   * linking to their careers page. Decision 2 dropped careers, and printing the
   * same address twice two rows apart reads as a copy-paste bug — so the row
   * keeps its label and its "Work with us" wording and routes to the same
   * mailbox with a subject that sorts it.
   */
  opportunitiesLabel: 'Work with us',
  opportunitiesSubject: 'Opportunities',
  /** No street address. The locality and the offset are the whole row. */
  city: 'Kolkata, IN',
  gmt: 'GMT+5:30',
} as const;

export interface SocialLink {
  label: string;
  href: string;
  /** The href is a stand-in for a profile that does not exist yet. */
  provisional?: boolean;
}

/**
 * The footer's social row and the `sameAs` array in the site's structured data.
 *
 * **GitHub is the only real one.** Sayandeep asked on 2026-08-26 for the other
 * three slots to exist so the row's composition is final, with the hrefs to be
 * swapped for real profiles later — so the three placeholders carry
 * `provisional: true` and route to each platform's bare origin rather than to a
 * fabricated handle. A link to `instagram.com/nofilterstudio` that nobody owns
 * is a broken promise in the footer of a studio site; a link to `instagram.com`
 * is merely a slot that has not been filled.
 *
 * `provisional` is not decoration: `verify` and phase 12's metadata pass both
 * read it, and the flag is what stops an unfilled slot being emitted into
 * `sameAs`, where a search engine would treat it as a claim of identity.
 */
export const SOCIALS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/Sayandeep1013' },
  { label: 'Instagram', href: 'https://instagram.com', provisional: true },
  { label: 'LinkedIn', href: 'https://linkedin.com', provisional: true },
  { label: 'X', href: 'https://x.com', provisional: true },
];

/** Every social slot whose href is a real destination. Metadata uses this one. */
export const SOCIALS_CONFIRMED: SocialLink[] = SOCIALS.filter((s) => !s.provisional);

/**
 * The 14vw line under the footer wordmark. **Chosen by Sayandeep on
 * 2026-08-26** over two alternates; open item 6 is closed. tonik's is
 * "DESIGNING A VISION OF BIG THINKING FOUNDERS".
 */
export const FOOTER_TAGLINE = 'No filter between the idea and the thing';

/**
 * Tally form id for the contact panel. Empty means the styled native fallback
 * renders instead — 20-components-and-motion.md §3, and the acceptance
 * criterion for T1.8 is that it renders without one.
 *
 * **It is empty, and that is the decision, not an omission.** Sayandeep chose
 * the mailto fallback on 2026-08-26: it works today, needs no third party and
 * costs no bundle. The env var stays so wiring Tally later is a deploy setting
 * rather than a code change. Open item 7 is closed.
 */
export const TALLY_FORM_ID = process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? '';

/* ── the stack wall ────────────────────────────────────────────────────────
   `40-content-model.md` §6, verbatim and in its order. Twenty-two marks,
   "all drawn from the works' actual tools" — this list is a claim about what
   the twelve works are built with, so it is not a place to add something
   aspirational. Phase 4 brings `lib/content/works.ts`; when it does, this list
   should be checked against the union of every work's `tools`.

   They are set as **type, not logos.** tonik's equivalent wall is client
   logos, which are theirs to show because those are their clients. Ours are
   tools, and shipping twenty-two vendors' trademarks to make a wall look busy
   is a different thing from naming what we build with. The display face at one
   size gives the same density §6 is after — "coincidentally close to tonik's
   28, so the wall reads at the same density" — without borrowing anyone's
   lettering. See D-019. */
export const STACK: readonly string[] = [
  'React',
  'Next.js',
  'TypeScript',
  'Three.js',
  'GLSL',
  'GSAP',
  'Lenis',
  'Supabase',
  'PostgreSQL',
  'Cloudflare Workers',
  'Yjs',
  'Expo',
  'React Native',
  'Kotlin',
  'Go',
  'Python',
  'Node',
  'FFmpeg',
  'Vercel',
  'Groq',
  'Excalidraw',
  'WebSockets',
] as const;

/**
 * The label above the wall. **Authored, not specified** — `30-page-specs.md` §1
 * gives the wall no label at all, and twenty-two bare product names under a
 * headline read as debris rather than as a statement. Every other section on
 * this site opens with a mono label; this one now does too. Flagged for
 * Sayandeep. See D-019.
 */
export const STACK_LABEL = 'The stack';

/* ── the works section ─────────────────────────────────────────────────────
   It is the site's first `<RevealText>` and the reason phase 3's Reading Map
   includes §2's heading even though the grid under it belongs to phase 4.

   **The line is ours now.** §2 gave it verbatim — "A studio that defines,
   designs, and builds products and other digital machinery" — and that is
   tonik's sentence about tonik: three verbs of increasing abstraction and a
   noun ("digital machinery") doing the work a claim should be doing. See D-060
   for the copy pass this belongs to and why the specs and the strings now
   deliberately disagree.

   Set in `--t-h3` (2rem / 2.5rem), not `--t-h2`. That is measured, not chosen:
   tonik's equivalent heading is `t-heading-3-rg`, 32.9px on a 41.125px leading
   at a 16.45 root, and there is no 5rem step anywhere on their site. See I-031. */
export const WORKS_INTRO = 'We draw it, we build it, we deploy it. The same hands do all three.';

/* ── the showreel ──────────────────────────────────────────────────────────
   `20-components-and-motion.md` §15. The hero's play control *becomes* the
   full-screen player, via the only use of GSAP Flip on the site.

   **An empty `src` makes the control inert**, on purpose: `<PlaySquare>` then
   renders as it did in phase 2 — a `<span>`, `aria-hidden`, no handler. A
   control that opens a player with nothing in it is a worse promise than a
   shape that never claimed to be a control.

   What is in it today is **a placeholder, and it says so**: eleven seconds
   panning down the works grid, baked by `npm run showreel:placeholder`. It is
   here because §15's choreography is the only use of Flip on the site and
   cannot be checked by reading — a background layer is measured, reparented
   across two components and flown into a player, and with no file none of that
   ever runs. Protocol §6 does not accept "implemented" as evidence.

   **It used to record the hero, and that was wrong.** Sayandeep, 2026-08-26:
   *"the play icon opens up the hero section itself — does that seem right? No."*
   It does not. A reel that plays you the page you are standing on is circular,
   and pressing play should show you the work. So it shows the work — the twelve
   cards — which is the closest thing to a reel this build has until T10.2
   captures the deploys themselves.

   **`01-PHASES.md` T10.2 replaces the file**, with scripted 6–10s interaction
   footage of the eight live deploys, encoded to mp4 *and* webm. Nothing in the
   component changes when it does. See I-033.

   ⚠️ **Sayandeep asked to be reminded (2026-08-26):** he wants the shipped reel
   to be *"our own original team members video showcasing ourselves"* rather
   than work footage. That is a different brief from T10.2's and it needs
   filming, so it is recorded here and in I-033 rather than assumed. */
export const SHOWREEL = {
  /** mp4, for anything that cannot take webm. T10.2 produces it. */
  src: '',
  /** Offered first. Placeholder until T10.2 — see the note above. */
  srcWebm: '/media/showreel-placeholder.webm',
  poster: '/hero-aperture.webp',
  /** The mono label above the player. */
  label: 'Showreel',
  /** The heading that fades in beside the player. */
  title: 'Twelve things, built end to end.',
  /** Rendered next to the title while `srcWebm` is still the baked stand-in. */
  isPlaceholder: true,
} as const;

/* ── the services section ──────────────────────────────────────────────────
   `30-page-specs.md` §3. The label, then a `<RevealText>` lead, then the
   accordion. The lead is §3's verbatim. */
export const SERVICES_INTRO = {
  label: 'Our services',
  /* §3 gave this verbatim as "Design is the API between vision and reality.
     Consider us your gateway." — a metaphor borrowed from a discipline the
     reader may not have, resolved with an offer to be a doorway. Ours says the
     thing the six services actually have in common. D-060, and it counted
     five until D-062 added App Development. */
  lead: 'Six services. No handover between any of them.',
} as const;

/* ── the culture section ───────────────────────────────────────────────────
   `30-page-specs.md` §5 gives the structure — a mono label in the left column,
   a heading and lead in the right, then the photo scatter — and leaves the copy
   and the composition to us. §12 rates the composition our lowest-confidence
   layout on the site and says why: the motion is transcribed, the arrangement
   is a design act we perform ourselves.

   **There are no photographs yet.** T10.4 imports the real imagery. The frames
   below carry their captions and their placements; each draws a neutral field
   until there is something to put in it. See I-042.

   Only ONE frame is portrait. Three were, in the first pass, and the section
   came out 2748px against tonik's 1781 — a portrait frame five columns wide is
   670px tall on its own, and three of them stacked made a section nobody would
   scroll through to reach the blog row. The ratios below are the tuning; the
   placements are unchanged. */
export const CULTURE = {
  label: 'Our studio',
  heading: 'A studio the size of the work.',
  lead: 'No account layer, no handover, no telephone game between the person who drew it and the person who built it. The constraint is the point — it is why the work ships.',

  /**
   * Six frames on the twelve-column grid.
   *
   * Deliberately uneven: three tall, three wide, none sharing a top edge with
   * its neighbour, and the rows overlap so the scatter reads as placed rather
   * than as a gallery. `parallax` is per frame and only two carry it — §12
   * flags it per photo, and drifting all six moves the section as a block,
   * which is the version that looks like a mistake.
   */
  frames: [
    { caption: 'The desk, most days', column: '1 / 6', row: 1, ratio: '4 / 3', parallax: false },
    { caption: 'Reading a closed system', column: '7 / 13', row: 1, ratio: '5 / 4', parallax: true },
    { caption: 'Where the grain came from', column: '2 / 6', row: 2, ratio: '4 / 5', parallax: true },
    { caption: 'Twelve repositories, one voice', column: '7 / 12', row: 2, ratio: '4 / 3', parallax: false },
    { caption: 'Shipping on a free tier', column: '1 / 7', row: 3, ratio: '16 / 10', parallax: false },
    { caption: 'The part that took the longest', column: '8 / 13', row: 3, ratio: '4 / 3', parallax: true },
  ],
} as const;

/* ── the blog row ──────────────────────────────────────────────────────────
   `30-page-specs.md` §6: three cards and a link to the index. */
export const BLOG_ROW = {
  label: 'From the blog',
  /* "Check out our blog" was tonik's. A link label is the shortest copy on a
     page and the easiest place to sound like everyone else. D-060. */
  link: 'Read the blog',
} as const;

/**
 * `/works`. `30-page-specs.md` §`/works` gives the heading as "Selected work";
 * the lead is ours, and it says the thing that actually distinguishes this list
 * from a studio's — every one of them is a repository you can open.
 */
export const WORKS_INDEX = {
  heading: 'Selected work',
  lead: 'Twelve products, each one built rather than art-directed. Every card below goes to a case study, and every case study ends in a deploy and a repository you can read.',
} as const;

/**
 * Facts about the studio that appear as claims on a page.
 *
 * One place, because they are the values most likely to be repeated across
 * templates and least likely to be updated everywhere when they change. The
 * service pages' TEAM SIZE row reads from here; PROJECTS SHIPPED is derived from
 * the works rather than typed, because a number that can disagree with the grid
 * under it eventually will.
 */
export const STUDIO = {
  teamSize: '2 to 5, per project',
} as const;
