import type { Work } from "./_types";

/** 12 · DroidDoodle. `40-content-model.md` §2. */
export const droiddoodle: Work = {
  slug: "droiddoodle",
  title: "DroidDoodle",
  order: 12,
  thesis: "A phone runs the model that drives the canvas.",
  summary: "On-device agentic AI driving a drawing canvas on Android.",
  services: ["Product Design", "Engineering"],
  tools: ["Kotlin", "C++", "on-device LLM"],
  industries: ["AI", "Mobile"],
  year: 2026,
  status: "archived",
  links: { repo: "https://github.com/Sayandeep1013/DroidDoodle" },
  accent: { light: "#A36EE7", dark: "#6F22D3" },
  invertsPage: false,
  /* No poster. This one is archived, native or terminal — there is no URL to
     point a browser at, so `scripts/capture.mjs` skips it and the card draws
     its generated accent cover instead. Recording these needs a screen capture
     by hand; see I-035. */
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: { width: "half", poster: "", art: "droiddoodle-01" },
  blocks: [],
};
