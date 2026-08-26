import type { Work } from "./_types";

/** 11 · NoteTakerXX. `40-content-model.md` §2. */
export const notetakerxx: Work = {
  slug: "notetakerxx",
  title: "NoteTakerXX",
  order: 11,
  thesis: "Notes have coordinates.",
  summary:
    "Spatial note-taking — notes placed on a dot grid and linked with rope curves.",
  services: ["Product Design", "Engineering"],
  tools: ["TypeScript", "Canvas"],
  industries: ["Dev Tools"],
  year: 2026,
  status: "live",
  links: {
    live: "https://rein-note.vercel.app",
    repo: "https://github.com/Sayandeep1013/NoteTakerXX",
  },
  accent: { light: "#A58812", dark: "#6A570C" },
  invertsPage: false,
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: {
    width: "wide",
    poster: "",
    art: "notetakerxx-01",
  },
};
