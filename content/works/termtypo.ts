import type { Work } from "./_types";

/** 07 · TermTypo. `40-content-model.md` §2. */
export const termtypo: Work = {
  slug: "termtypo",
  title: "TermTypo",
  order: 7,
  thesis: "A terminal can be a ranked competitive arena.",
  summary:
    "Terminal-first multiplayer typing test — ranked 1v1 races, an ELO ladder and a global leaderboard, cross-play between the CLI and a companion web app.",
  services: ["Product Design", "Engineering"],
  tools: ["Python", "TypeScript", "WebSockets"],
  industries: ["Dev Tools", "Realtime"],
  year: 2026,
  status: "live",
  links: {
    live: "https://termtypo.vercel.app",
    repo: "https://github.com/Sayandeep1013/TermTypo",
  },
  accent: { light: "#5C9C32", dark: "#39631D" },
  invertsPage: false,
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: {
    width: "half",
    poster: "/media/works/termtypo.webp",
    art: "termtypo-01",
  },
  blocks: [],
};
