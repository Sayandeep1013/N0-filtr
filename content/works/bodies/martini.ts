import type { Block } from '../_types';

/**
 * Santioni's case-study body.
 *
 * Split out of `content/works/martini.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const martiniBody: Block[] = [
  {
    type: "prose",
    heading: "A closed WebGL system can be read",
    body: "santionispirits.com renders **eighteen scenes into a single canvas** through a 2MB proprietary bundle. There is no DOM to inspect, no stylesheet to read, and no meaningful source: the entire experience is a shader pipeline and a scroll controller compiled past recognition.\n\nThe question this project exists to answer is whether a site like that can be *understood* — not copied, understood — from the outside.",
  },
  {
    type: "board",
    caption:
      "Two tiers: an exact mirror, and a rebuild that proves the reading.",
    items: [
      {
        art: "orbit/martini-board-1",
        caption: "Eighteen scenes, one canvas",
      },
      { art: "strata/martini-board-2", caption: "Ten scroll acts, rebuilt" },
      { art: "mosaic/martini-board-3", caption: "205 assets, 15.3MB" },
    ],
  },
  {
    type: "prose",
    heading:
      "The site refused to be looked at, so it was looked at differently",
    body: "The first obstacle was not technical subtlety, it was a wall: the original **blocks headless Chrome via `GPU.BLOCKLIST`**, so every standard mirroring tool gets a redirect instead of a page.\n\nThe way through was to stop pretending to be a normal browser and start being an honest one with no GPU. Rendered under Playwright with SwiftShader and `window.__WEBGL_CONTEXT_LOSS` pre-set to `true`, the bundle takes its own non-redirecting fallback path — the one it keeps for machines that cannot run the shaders — and the content structure becomes readable.",
  },
  {
    type: "quote",
    text: "Tier A is a 1:1 offline mirror. Tier C is a DOM rebuild with real fonts, real 2D artwork, and all ten scroll acts reconstructed in GSAP.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Original",
        value: ["Hydrax 1.1.20", "18 scenes, one canvas", "2MB bundle"],
      },
      {
        key: "Mirror",
        value: ["205 asset files", "15.3MB", "Exact, offline"],
      },
      {
        key: "Rebuild",
        value: [
          "Next.js 15 + Tailwind 4",
          "GSAP + Lenis + ScrollTrigger",
          "Zustand",
        ],
      },
      { key: "Type", value: ["Charles Rosie", "PP Nikkei Maru", "GT Era"] },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "strata/martini-slide-1", caption: "Blocked, then read" },
      { art: "orbit/martini-slide-2", caption: "Ten acts in GSAP" },
      { art: "iris/martini-slide-3", caption: "Reduced motion honoured" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**The rebuild is the proof, not the deliverable.** Anyone can mirror a site; a mirror demonstrates nothing about whether you understood it. Reconstructing all ten scroll acts in GSAP against DOM elements is what turns a copy into a reading — every act you can rebuild is an act you actually decoded.\n\nThis is also where the method that built *this* site came from. The technique in the blog post about reading a closed WebGL system is this project's method, generalised.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "Three things are named as gaps rather than glossed:\n\nThe **character illustrations are `.bin` mesh geometry with hatching shaders** — they are generated, not drawn, and cannot be reproduced as flat images. The rebuild substitutes; it does not match.\n\nThe **cursor-fluid simulation and the draggable nodes are simplified to scroll-driven motion.** Those are the two interactions where the original is doing something the rebuild is only gesturing at.\n\nAnd `prefers-reduced-motion` is honoured with instant reveals — which the original does not do at all, and is the one place the rebuild is deliberately better than its subject.",
  },
];
