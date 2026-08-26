import { WORKS } from './works';
import type { Work } from '@/content/works/_types';

/**
 * The five industries. `40-content-model.md` §4, `30-page-specs.md`
 * §`/industries/[slug]`.
 *
 * Reduced from tonik's thirteen to **the five we can evidence** — the spec is
 * explicit about that, and it is the same rule the services follow: a page that
 * claims a sector with no work behind it is a page that gets found out.
 *
 * ── The name is the join ─────────────────────────────────────────────────
 *
 * `name` here is the same string `work.industries` uses, because that is what
 * `INDUSTRIES` in `lib/content/works.ts` derives from and what the works-index
 * filter offers. A separate slug field on every work would be tidier in the
 * abstract and would be one more thing to keep in step across twelve files.
 *
 * ── What is authored ─────────────────────────────────────────────────────
 *
 * `lead`, `build` and `stack` are ours. `examples` is **derived** from the works
 * rather than typed, for the same reason PROJECTS SHIPPED is on a service page:
 * a list that can disagree with the grid under it eventually will.
 */
export interface Industry {
  slug: string;
  /** Matches `work.industries` exactly. */
  name: string;
  headline: string;
  lead: string;
  /** The spec table's WHAT WE BUILD row. */
  build: string[];
  /** Its TYPICAL STACK row. */
  stack: string[];
}

export const INDUSTRIES_FULL: Industry[] = [
  {
    slug: 'ai',
    name: 'AI',
    headline: 'Models are the easy part. Making their output reviewable is the work.',
    lead: 'Anyone can put a model behind a text box. The interesting engineering starts when a person has to check what it did — which means the thing it edited has to be readable, addressable and cheap to reject.',
    build: [
      'Agent-assisted editors',
      'Structured-output pipelines',
      'Retrieval over your own data',
      'Human-in-the-loop review',
    ],
    stack: ['TypeScript', 'Gemini / Claude APIs', 'Structured output', 'Postgres', 'Vercel'],
  },
  {
    slug: 'dev-tools',
    name: 'Dev Tools',
    headline: 'Software for the people least willing to tolerate bad software.',
    lead: 'Developers notice the second frame of a transition and abandon anything that wastes a keystroke. It is the most demanding audience there is, and the most rewarding: build the fast thing and they will find it themselves.',
    build: [
      'CLIs and terminal interfaces',
      'Editors and playgrounds',
      'Bots and integrations',
      'Documentation that runs',
    ],
    stack: ['TypeScript', 'Node', 'Go', 'WebSockets', 'GitHub Actions'],
  },
  {
    slug: 'realtime',
    name: 'Realtime',
    headline: 'Two people, one document, no refresh button.',
    lead: 'Realtime is not a feature you add. It is a decision about who owns the truth, and every interface question downstream — what happens on a conflict, what happens offline, what the second cursor looks like — falls out of that one answer.',
    build: [
      'Collaborative editing',
      'Presence and cursors',
      'Authoritative game loops',
      'Live dashboards',
    ],
    stack: ['CRDTs / Yjs', 'WebSockets', 'Cloudflare Workers', 'Redis', 'Postgres'],
  },
  {
    slug: 'mobile',
    name: 'Mobile',
    headline: 'The device in the hand, not the one on the desk.',
    lead: 'A phone is a slower computer with a worse connection and a person holding it with one thumb. Everything that is merely inelegant on a laptop is disqualifying here, which makes it the honest place to test whether a product is actually finished.',
    build: [
      'Native and cross-platform apps',
      'Offline-first sync',
      'On-device inference',
      'App-store delivery',
    ],
    stack: ['React Native', 'Expo', 'Kotlin', 'SQLite', 'Fastlane'],
  },
  {
    slug: 'creative-coding',
    name: 'Creative Coding',
    headline: 'The parts of an interface that have to be felt to be judged.',
    lead: 'Some work cannot be signed off from a document, because the only question that matters is how it behaves in your hand. We build those on a link, early, and let you feel it wrong before we make it right.',
    build: [
      'WebGL and custom shaders',
      'Scroll choreography',
      'Physics and simulation',
      'Generative systems',
    ],
    stack: ['Three.js', 'GLSL', 'GSAP', 'Matter.js', 'Canvas 2D'],
  },
];

export function industryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES_FULL.find((industry) => industry.slug === slug);
}

/** Every work in this industry, in reading order. Derived, never typed. */
export function worksInIndustry(industry: Industry): Work[] {
  return [...WORKS]
    .filter((work) => work.industries.includes(industry.name))
    .sort((a, b) => a.order - b.order);
}
