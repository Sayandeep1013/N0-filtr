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

export const SERVICES: ServiceSummary[] = [
  { slug: 'product-design', name: 'Product Design' },
  { slug: 'branding', name: 'Branding' },
  { slug: 'websites', name: 'Websites' },
  { slug: 'no-code', name: 'No-Code Development' },
  { slug: 'engineering', name: 'Engineering' },
];

/* ── placeholders from 00-brief-and-decisions.md "Open items" ──────────────
   Each of these is a stated placeholder the user will replace. They are
   gathered here, and nowhere else, so replacing them is one edit. */

export const CONTACT = {
  /** Placeholder — open item 1. */
  email: 'hello@nofilter.studio',
  /** Placeholder — open item 1. */
  opportunities: 'work@nofilter.studio',
  /** Placeholder — open item 3. */
  city: 'Kolkata, IN',
  gmt: 'GMT+5:30',
  address: '—',
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
