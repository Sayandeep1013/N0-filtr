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
 * The five services. Slugs and names are 40-content-model.md §3 verbatim; the
 * footer renders them as the sibling-dim list (§20). Headlines, copy, FAQ and
 * accordion panels are phase 7's.
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
  /** The 2-up mono rail above the hairline at the section's foot. */
  labelLeft: '0→1 design and engineering for founders who ship',
  labelRight: '12 shipped projects · 5 services',
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
  email: 'sayandeepmondal1013@gmail.com',
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
