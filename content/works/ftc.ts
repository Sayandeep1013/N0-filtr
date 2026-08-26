import type { Work } from "./_types";

/** 10 · FTC. `40-content-model.md` §2. */
export const ftc: Work = {
  slug: "ftc",
  title: "FTC",
  order: 10,
  thesis: "No client decides the outcome.",
  summary:
    "Realtime multiplayer card game with a server-authoritative rules engine.",
  services: ["Product Design", "Engineering"],
  tools: ["Next.js", "Supabase", "TypeScript"],
  industries: ["Realtime"],
  year: 2026,
  status: "live",
  links: {
    live: "https://ftc-game.vercel.app",
    repo: "https://github.com/Sayandeep1013/FTC",
  },
  accent: { light: "#C67A10", dark: "#7F4F0A" },
  invertsPage: false,
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: { width: "half", poster: '', art: "ftc-01" },
  blocks: [],
};
