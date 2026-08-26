import type { Work } from "./_types";

/**
 * 05 · Santioni. `40-content-model.md` §2 — "the strongest evidence for the
 * Websites service."
 */
export const martini: Work = {
  slug: "martini",
  title: "Santioni",
  order: 5,
  thesis: "A closed WebGL system can be read.",
  summary:
    "A study of santionispirits.com's WebGL experience at two fidelity tiers: an exact offline mirror and a Next.js/GSAP DOM rebuild of the scroll-driven acts.",
  services: ["Websites", "Engineering"],
  tools: ["GLSL", "WebGL", "Next.js", "GSAP"],
  industries: ["Creative Coding"],
  year: 2026,
  status: "archived",
  links: { repo: "https://github.com/Sayandeep1013/Martini-Recreation" },
  accent: { light: "#E25F5A", dark: "#B8241F" },
  invertsPage: false,
  /* No poster. This one is archived, native or terminal — there is no URL to
     point a browser at, so `scripts/capture.mjs` skips it and the card draws
     its generated accent cover instead. Recording these needs a screen capture
     by hand; see I-035. */
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: { width: "wide", poster: "", art: "martini-01" },
  blocks: [],
};
