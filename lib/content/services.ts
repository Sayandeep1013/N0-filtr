/**
 * The six services. `40-content-model.md` §3 for the first five.
 *
 * ── What is measured and what is authored ──────────────────────────────────
 *
 * For services 01–05, `slug`, `index`, `name` and `headline` are §3
 * **verbatim**. Everything else on this page — the leads, the OUTPUT and TOOLS
 * lists — is authored, and it is authored from what this studio actually does
 * rather than adapted from tonik's copy. §3 supplies Product Design's two lists
 * as an example and leaves the other four to us.
 *
 * **Service 06, App Development, has no §3 entry at all** — it is ours end to
 * end, headline included. §3 is a transcription of tonik's five, and tonik do
 * not build apps. We do, and had not said so anywhere: three of the twelve
 * works install on a device rather than open in a tab, and two of the blog
 * posts are about shipping them. Sayandeep, 2026-08-28: *"i think we do app dev
 * too but it never got added."* See D-062.
 *
 * `01-PHASES.md` T10.8 still writes the full service pages (~400 words each);
 * `body` is deliberately short until then.
 *
 * **The FAQs are written** — T7.5, six per service, and they are drafts in the
 * sense that Sayandeep owns the content and has not read them yet. They are
 * written from what this studio actually does rather than adapted from
 * tonik's, which means several of them say what we do *not* do. That is
 * deliberate and it is the most likely thing he will want to soften.
 *
 * Service 04 was `no-code` until 2026-08-26. See D-011.
 */

import type { Work } from "@/content/works/_types";
import { WORKS } from "./works";

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
    slug: "product-design",
    index: 1,
    name: "Product Design",
    headline: "Your shortcut from idea to shipped. Where data meets delight.",
    lead: "Most products fail at the join between what was decided and what got built. We work on both sides of it.",
    body: [
      "Flows, states and edge cases first — the parts that decide whether a product is usable long before anyone argues about a colour. Then the interface, drawn against real content and real constraints.",
      "Everything is handed over as something a developer can build from, because the same people build it.",
    ],
    output: [
      "Audit and user tests",
      "User flows",
      "Style guides",
      "Design systems",
      "Interactive prototypes",
      "MVP definition",
      "Product roadmap",
      "Dev handover",
    ],
    tools: ["Figma", "FigJam", "Spline", "Three.js"],
    featuredWorkSlug: "tessera",
    faq: [
      {
        q: "Do you design things you cannot build?",
        a: "No, and that is the constraint the whole studio is arranged around. Every screen is drawn by someone who will be in the repository afterwards, so a flow that cannot survive a slow network or an empty state gets caught while it is still a rectangle rather than a sprint.",
      },
      {
        q: "What do you need from us to start?",
        a: "The problem, whoever is closest to it, and access to whatever already exists — a spreadsheet, a competitor you like, an old build. We do not need a brief written in our language. The first week is usually us writing the brief back to you and you telling us which half is wrong.",
      },
      {
        q: "How do you handle edge cases and empty states?",
        a: "First, not last. Loading, empty, error, one item, four hundred items and the longest name your database will ever hold are drawn before the happy path is polished, because those are the states that decide whether a product feels solid and they are the ones that get skipped when time runs out.",
      },
      {
        q: "Do you do user research?",
        a: "We do audits and usability tests, and we are honest that a five-person test is a smoke alarm rather than a study. For a product that has users already, their behaviour is better evidence than anything we could stage, so we start by reading what is already there.",
      },
      {
        q: "What does handover look like?",
        a: "There isn't one, in the usual sense. The same people build it, so the design system arrives as code with the design file next to it. If you do take it in-house, you get both, and the file is the one we were actually working from rather than a tidied copy.",
      },
      {
        q: "Can you work with our existing design system?",
        a: "Yes, and we would rather extend one than replace it. A system nobody uses is a very expensive PDF; the useful question is which three components are doing all the work and whether they are right.",
      },
    ],
  },
  {
    slug: "branding",
    index: 2,
    name: "Branding",
    headline: "Your culture and DNA, visualised.",
    /* §3 is explicit that this service has **zero** portfolio evidence, and
       says so twice. The lead does not pretend otherwise: it describes the work
       rather than claiming a track record we do not have. Phase 7's page leads
       with the spec table and the FAQ for the same reason. */
    lead: "A mark, a voice and a set of rules that survive contact with a real product.",
    body: [
      "Identity work that is built to be used: a mark that reads at sixteen pixels, a type scale that a developer can implement without guessing, and colour that holds up on a screen rather than only in a deck.",
      "The aperture on this site was drawn the same way — as a component with ratios, not a picture.",
    ],
    output: [
      "Naming",
      "Wordmark and mark",
      "Type scale",
      "Colour system",
      "Brand guidelines",
      "Asset kit",
    ],
    tools: ["Figma", "Illustrator", "SVG", "Variable fonts"],
    featuredWorkSlug: "tessera",
    faq: [
      {
        q: "You are engineers. Why does branding sit here?",
        a: "Because most of what a brand is, for a software company, is the product. The typeface people see most is the one in the interface, and the tone of voice they remember is the error message. We are honest that this is the thinnest of our six services and the page says so.",
      },
      {
        q: "What is actually in a branding engagement?",
        a: "A mark, a type system, a colour system with contrast that survives a real screen, and the rules for using them — written as tokens rather than as a PDF, because tokens are the version that stays true after six months of shipping.",
      },
      {
        q: "Do you do naming?",
        a: "We will argue with you about a name and we will tell you if it is unsearchable or already taken. We do not run naming workshops, and a studio that pretends the name arrives from a process rather than from an afternoon is selling you the afternoon at a markup.",
      },
      {
        q: "How long does it take?",
        a: "A mark and a working type and colour system, three to four weeks. Longer than that usually means the underlying question is not a design question — it is a positioning question wearing one, and those are worth separating out.",
      },
      {
        q: "Do we own the result?",
        a: "Entirely, including the source files and the fonts we licensed on your behalf, transferred to your account rather than ours. If we ever stop answering the phone, nothing you paid for stops working.",
      },
      {
        q: "Can you rebrand without redesigning the product?",
        a: "Yes, and it is the more common ask. Because everything is tokens, a colour and type change is a change to one file and a review of the places that hard-coded something they should not have — which is a useful audit in its own right.",
      },
    ],
  },
  {
    slug: "websites",
    index: 3,
    name: "Websites",
    headline: "Turning browsers into believers.",
    lead: "Sites that load fast, read well and do one thing that nobody expects.",
    body: [
      "Built as applications rather than as pages: real routing, real state, real performance budgets that are measured on every commit rather than checked once before launch.",
      "The motion is written by hand. No page builder has ever produced a scroll that felt like it was designed.",
    ],
    output: [
      "Information architecture",
      "Responsive build",
      "Motion design",
      "CMS or typed content",
      "Performance budget",
      "Analytics and SEO",
    ],
    tools: ["Next.js", "TypeScript", "GSAP", "Lenis", "Vercel"],
    featuredWorkSlug: "martini",
    faq: [
      {
        q: "How fast is fast?",
        a: "This site is the answer we would rather give than a number: it ships a 3D hero, a physics footer and a scroll library inside a JavaScript budget it is measured against on every build. If a page we make is slow, a check fails and it does not deploy.",
      },
      {
        q: "Webflow, WordPress, or code?",
        a: "Code, in almost every case, and we will tell you when it should not be. A marketing site your team edits weekly may genuinely be better in a CMS someone else maintains; a site that has to do something unusual is where a builder starts charging you in workarounds.",
      },
      {
        q: "Who edits the content afterwards?",
        a: "You do. Content lives in typed files or a headless CMS depending on how often it moves and who moves it — and we pick based on your actual editing habits rather than on which answer is more fashionable.",
      },
      {
        q: "Do you do SEO?",
        a: "The parts that are engineering: structure, metadata, real HTML, fast pages, correct headings, sitemaps that are true. We do not sell keyword strategy, and anyone bundling it with a build is selling you two things and doing one.",
      },
      {
        q: "What about accessibility?",
        a: "Keyboard operability, focus that is visible, contrast that passes, motion that respects `prefers-reduced-motion`. That last one is not standard practice and we treat it as though it were — every animation on every site we ship has an off switch that the visitor's own settings throw.",
      },
      {
        q: "Can you take over a site somebody else built?",
        a: "Often, and the first deliverable is an honest read on whether it is worth keeping. Sometimes the answer is that three days of fixes beats three weeks of rebuild, and we would rather tell you that than quote the rebuild.",
      },
    ],
  },
  {
    slug: "creative-development",
    index: 4,
    name: "Creative Development",
    headline: "The web, doing things the web isn't supposed to do.",
    lead: "WebGL, shaders, physics and the kind of interaction that only exists because someone wrote it.",
    body: [
      "Custom GLSL materials, scroll-driven 3D, and simulations that run inside the same animation loop as everything else on the page. Sixty frames a second is a requirement, not an aspiration.",
      "This site is the portfolio piece: a procedural aperture, a grain that sticks to the surface under rotation, and a physics floor under the footer.",
    ],
    output: [
      "WebGL and shader work",
      "Scroll-driven 3D",
      "Physics and simulation",
      "Generative systems",
      "Interaction prototypes",
      "Performance profiling",
    ],
    tools: ["Three.js", "GLSL", "GSAP", "Matter.js", "Canvas"],
    featuredWorkSlug: "martini",
    faq: [
      {
        q: "What counts as creative development?",
        a: "The work that lives between design and engineering and is usually dropped by both: WebGL, canvas, scroll choreography, physics, generative systems. The parts of an interface that have to be *felt* to be evaluated, which means they cannot be specified in a document and signed off.",
      },
      {
        q: "Is this just animation?",
        a: "No. Animation is the visible half. The other half is making it survive a mid-range phone, a slow connection and a visitor who has asked their operating system to stop things moving — which is where most of the engineering actually goes.",
      },
      {
        q: "Will it hurt performance?",
        a: "It is allowed to cost something, and the cost is budgeted rather than discovered. Every build here is checked against a JavaScript budget and a Lighthouse threshold, and a feature that blows it either gets cheaper or does not ship.",
      },
      {
        q: "What do you build it with?",
        a: "Three.js and hand-written GLSL, GSAP, Lenis, Matter.js — libraries chosen for being small and unopinionated. No Spline, no Rive, no drag-and-drop scene tool, because the output of those is a file we cannot debug at two in the morning.",
      },
      {
        q: "Can you do this inside our existing site?",
        a: "Usually yes, as a self-contained component with its own budget and its own kill switch. That is the safer shape anyway: the interesting thing is isolated, measurable, and removable if it turns out not to earn its place.",
      },
      {
        q: "How do we review something that has to be felt?",
        a: "On a link, on your own phone, early and repeatedly. We put a deploy in front of you long before it is finished, because the alternative is you approving a video of something that behaves differently in your hand.",
      },
    ],
  },
  {
    slug: "engineering",
    index: 5,
    name: "Engineering",
    headline: "Your technical co-founder. Minus the equity sacrifice.",
    lead: "Twelve shipped things, most of them realtime, most of them on a free tier.",
    body: [
      "Server-authoritative game loops, CRDT sync over Cloudflare Workers, chunked storage on an attachment cap, on-device inference driving a canvas. The constraint is usually the interesting part.",
      "You get the repository, the deploy pipeline and someone who can explain every decision in it.",
    ],
    output: [
      "Architecture and data model",
      "Realtime and multiplayer",
      "APIs and integrations",
      "Auth and infrastructure",
      "CI and deploy pipeline",
      "Technical documentation",
    ],
    tools: [
      "TypeScript",
      "Node",
      "PostgreSQL",
      "Supabase",
      "Cloudflare Workers",
      "Go",
    ],
    featuredWorkSlug: "discvault",
    faq: [
      {
        q: 'What does "technical co-founder" mean in practice?',
        a: "That we will argue with the spec. You get people who ask what happens at ten thousand rows and who will tell you when the feature you asked for is a symptom of a different problem — which is the part a contractor is not incentivised to do.",
      },
      {
        q: "What is your stack?",
        a: "TypeScript everywhere, React and Next.js on the front, Node or Python behind it, Postgres by default. We are unromantic about it: the stack should be the boring part, and the interesting part should be your problem.",
      },
      {
        q: "Do you work with AI models?",
        a: "Yes, and with a specific opinion about it. A model's output has to be *reviewable* before it is useful — that is the whole argument of Tessera, which puts an editing agent behind a document a person can read a diff of. Anything less is a feature you cannot debug.",
      },
      {
        q: "How do you handle testing?",
        a: "In proportion. Types and a fast build catch most of it; tests go where the cost of being wrong is high — money, data loss, auth. We would rather ship a verification harness that checks the things that actually break than a coverage percentage.",
      },
      {
        q: "Can you join an existing team?",
        a: "Yes. Two or three of us inside your process, reviewing in your repository, is a common shape and usually the most useful one — you keep the context and we bring the hours.",
      },
      {
        q: "What happens when the engagement ends?",
        a: "You have everything, because you always did: your repository, your infrastructure, your accounts. There is no handover event because there was never a wall. If we did our job you should be able to keep going without calling us, and some clients do.",
      },
    ],
  },
  {
    /* Service 06. No §3 entry — headline and all. See the note at the top of
       this file and D-062. */
    slug: "app-development",
    index: 6,
    name: "App Development",
    headline: "Your product in someone's hand. Installed, not bookmarked.",
    lead: "Three of the twelve install on a device rather than open in a tab. Android, cross-platform, and desktop.",
    body: [
      "A phone is a slower computer with a worse connection and a person holding it with one thumb. Everything that is merely inelegant on a laptop is disqualifying there, which is why we build the risky part on a real device in week one rather than in a simulator in week six.",
      "Cross-platform when the product is mostly screens and sync, native when it is not — DroidDoodle runs a language model on the handset itself, and that is not a thing you reach through a bridge.",
    ],
    output: [
      "iOS and Android builds",
      "Offline and sync behaviour",
      "On-device inference",
      "Store listings and signing",
      "Sideload and update channel",
      "Crash and release monitoring",
    ],
    tools: ["Expo", "React Native", "Kotlin", "C++", "Supabase", "EAS"],
    /* Solidus rather than DroidDoodle: both are ours and both are mobile, but
       one is live and the other is archived, and evidence you can install beats
       evidence you can only read about. */
    featuredWorkSlug: "solidus",
    faq: [
      {
        q: "Native or cross-platform?",
        a: "Whichever the product actually needs, and the question is usually settled by one feature rather than by preference. If it is screens, forms and sync, Expo and React Native get it onto both platforms with one team. If it needs the hardware — on-device inference, a custom canvas, anything with a frame budget — it is native, and we say so before you have paid for the other answer.",
      },
      {
        q: "Can you get it into the App Store and Play Store?",
        a: "Yes: signing, listings, review notes, staged rollout. It is the least interesting part of the work and the part most likely to add two weeks if nobody planned for it, so we plan for it. Worth knowing that a first review can take days and a rejection can take a week.",
      },
      {
        q: "Do we have to ship through a store at all?",
        a: "No, and sometimes you should not. DiscVault ships as an apk and a desktop binary alongside its CLI and its website, because its audience already sideloads and a store listing would have bought nothing. A sideloaded app can still update itself — there is a post on this site about exactly how.",
      },
      {
        q: "What about offline?",
        a: "It is a data-model decision, not a feature you add at the end. Who owns the truth, what happens to an edit made on a train, what the second device sees when it comes back. We answer those three before drawing a screen, because every interface question downstream falls out of them.",
      },
      {
        q: "Can you run AI on the device instead of in the cloud?",
        a: "We have. DroidDoodle drives a drawing canvas from a model running on the handset — no round trip, no key, no per-token bill. It is a real trade: you get privacy and latency, you pay in binary size, battery and a much smaller model. It is worth it more often than people assume and not always.",
      },
      {
        q: "Do you maintain apps after launch?",
        a: "If you want us to. An app is the one thing we build that keeps needing us — OS releases break things a website never has to care about, and a build that shipped fine in June can be rejected in September. We would rather agree a small ongoing arrangement than be a phone number you call when the store emails you.",
      },
    ],
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
