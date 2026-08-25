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

/* ── identity ──────────────────────────────────────────────────────────────
   The canonical origin, used for `metadataBase`, the OG card's absolute URLs
   and the manifest. **The domain is still a placeholder** — open item 5 in
   00-brief-and-decisions.md — so it reads from an env var and falls back to a
   name that is obviously provisional rather than to something that looks real.
   Set NEXT_PUBLIC_SITE_URL on the deploy and this stops mattering. */

export const SITE = {
  name: 'No Filter',
  /** The wordmark's own casing. Used where the brand is set, not where it is read aloud. */
  wordmark: 'NO FiLTER',
  description: 'A studio for work that does not need softening.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nofilter.example',
} as const;

/* ── contact details ───────────────────────────────────────────────────────
   Supplied by Sayandeep, 2026-08-25. One real address for everything; there is
   deliberately no street address, so the studio row carries the locality and the
   offset instead of an address block. 00-brief-and-decisions.md open items 1
   and 3 are closed.

   Still placeholders below: the domain, the social handles beyond GitHub, the
   footer tagline, and the Tally form id. */

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
}

/** Placeholder — open item 4. GitHub is the one real handle we have. */
export const SOCIALS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/Sayandeep1013' },
];

/** Placeholder — open item 6. tonik's is "DESIGNING A VISION OF BIG THINKING FOUNDERS". */
export const FOOTER_TAGLINE = 'No filter between the idea and the thing';

/**
 * Tally form id for the contact panel. Empty means the styled native fallback
 * renders instead — 20-components-and-motion.md §3, and the acceptance
 * criterion for T1.8 is that it renders without one.
 */
export const TALLY_FORM_ID = process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? '';
