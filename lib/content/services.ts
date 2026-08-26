/**
 * The five services. `40-content-model.md` §3.
 *
 * ── What is measured and what is authored ──────────────────────────────────
 *
 * `slug`, `index`, `name` and `headline` are §3 **verbatim**. Everything else on
 * this page — the leads, the OUTPUT and TOOLS lists — is authored, and it is
 * authored from what this studio actually does rather than adapted from tonik's
 * copy. §3 supplies Product Design's two lists as an example and leaves the
 * other four to us.
 *
 * `01-PHASES.md` T10.8 writes the full service pages (~400 words each) and T7.5
 * writes the six FAQs apiece. Both are deliberately empty here: the accordion
 * needs a lead and two lists, and inventing four hundred words per service to
 * fill a phase-5 panel would be writing that phase 10 then has to throw away.
 *
 * Service 04 was `no-code` until 2026-08-26. See D-011.
 */

import type { Work } from '@/content/works/_types';
import { WORKS } from './works';

export interface Service {
  slug: string;
  /** Drives the `[01]`…`[05]` numerals in phase 7's ServiceNav. */
  index: number;
  name: string;
  /** §3, verbatim. */
  headline: string;
  /** The accordion's opening line. Authored; T10.8 may replace it. */
  lead: string;
  /** Two or three short paragraphs under the lead. T10.8 writes the real ones. */
  body: string[];
  /** The inverted right panel's first list. */
  output: string[];
  /** The inverted right panel's second list. */
  tools: string[];
  /** The work shown as evidence in the accordion's panel. */
  featuredWorkSlug: string;
  /** Phase 7, T7.5. Six each, auto-numbered at render. */
  faq: { q: string; a: string }[];
}

export const SERVICES_FULL: Service[] = [
  {
    slug: 'product-design',
    index: 1,
    name: 'Product Design',
    headline: 'Your shortcut from idea to shipped. Where data meets delight.',
    lead: 'Most products fail at the join between what was decided and what got built. We work on both sides of it.',
    body: [
      'Flows, states and edge cases first — the parts that decide whether a product is usable long before anyone argues about a colour. Then the interface, drawn against real content and real constraints.',
      'Everything is handed over as something a developer can build from, because the same people build it.',
    ],
    output: [
      'Audit and user tests',
      'User flows',
      'Style guides',
      'Design systems',
      'Interactive prototypes',
      'MVP definition',
      'Product roadmap',
      'Dev handover',
    ],
    tools: ['Figma', 'FigJam', 'Spline', 'Three.js'],
    featuredWorkSlug: 'tessera',
    faq: [],
  },
  {
    slug: 'branding',
    index: 2,
    name: 'Branding',
    headline: 'Your culture and DNA, visualised.',
    /* §3 is explicit that this service has **zero** portfolio evidence, and
       says so twice. The lead does not pretend otherwise: it describes the work
       rather than claiming a track record we do not have. Phase 7's page leads
       with the spec table and the FAQ for the same reason. */
    lead: 'A mark, a voice and a set of rules that survive contact with a real product.',
    body: [
      'Identity work that is built to be used: a mark that reads at sixteen pixels, a type scale that a developer can implement without guessing, and colour that holds up on a screen rather than only in a deck.',
      'The aperture on this site was drawn the same way — as a component with ratios, not a picture.',
    ],
    output: [
      'Naming',
      'Wordmark and mark',
      'Type scale',
      'Colour system',
      'Brand guidelines',
      'Asset kit',
    ],
    tools: ['Figma', 'Illustrator', 'SVG', 'Variable fonts'],
    featuredWorkSlug: 'tessera',
    faq: [],
  },
  {
    slug: 'websites',
    index: 3,
    name: 'Websites',
    headline: 'Turning browsers into believers.',
    lead: 'Sites that load fast, read well and do one thing that nobody expects.',
    body: [
      'Built as applications rather than as pages: real routing, real state, real performance budgets that are measured on every commit rather than checked once before launch.',
      'The motion is written by hand. No page builder has ever produced a scroll that felt like it was designed.',
    ],
    output: [
      'Information architecture',
      'Responsive build',
      'Motion design',
      'CMS or typed content',
      'Performance budget',
      'Analytics and SEO',
    ],
    tools: ['Next.js', 'TypeScript', 'GSAP', 'Lenis', 'Vercel'],
    featuredWorkSlug: 'martini',
    faq: [],
  },
  {
    slug: 'creative-development',
    index: 4,
    name: 'Creative Development',
    headline: "The web, doing things the web isn't supposed to do.",
    lead: 'WebGL, shaders, physics and the kind of interaction that only exists because someone wrote it.',
    body: [
      'Custom GLSL materials, scroll-driven 3D, and simulations that run inside the same animation loop as everything else on the page. Sixty frames a second is a requirement, not an aspiration.',
      'This site is the portfolio piece: a procedural aperture, a grain that sticks to the surface under rotation, and a physics floor under the footer.',
    ],
    output: [
      'WebGL and shader work',
      'Scroll-driven 3D',
      'Physics and simulation',
      'Generative systems',
      'Interaction prototypes',
      'Performance profiling',
    ],
    tools: ['Three.js', 'GLSL', 'GSAP', 'Matter.js', 'Canvas'],
    featuredWorkSlug: 'martini',
    faq: [],
  },
  {
    slug: 'engineering',
    index: 5,
    name: 'Engineering',
    headline: 'Your technical co-founder. Minus the equity sacrifice.',
    lead: 'Twelve shipped things, most of them realtime, most of them on a free tier.',
    body: [
      'Server-authoritative game loops, CRDT sync over Cloudflare Workers, chunked storage on an attachment cap, on-device inference driving a canvas. The constraint is usually the interesting part.',
      'You get the repository, the deploy pipeline and someone who can explain every decision in it.',
    ],
    output: [
      'Architecture and data model',
      'Realtime and multiplayer',
      'APIs and integrations',
      'Auth and infrastructure',
      'CI and deploy pipeline',
      'Technical documentation',
    ],
    tools: ['TypeScript', 'Node', 'PostgreSQL', 'Supabase', 'Cloudflare Workers', 'Go'],
    featuredWorkSlug: 'discvault',
    faq: [],
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return SERVICES_FULL.find((s) => s.slug === slug);
}

export function featuredWorkFor(service: Service): Work | undefined {
  return WORKS.find((w) => w.slug === service.featuredWorkSlug);
}

/** Works whose `services` include this one. Phase 7's filtered grids use it. */
export function worksForService(slug: string): Work[] {
  const service = serviceBySlug(slug);
  if (!service) return [];
  return WORKS.filter((w) => w.services.includes(service.name));
}
