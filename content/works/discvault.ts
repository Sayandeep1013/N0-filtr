import type { Work } from "./_types";

/** 03 · DiscVault. `40-content-model.md` §2. */
export const discvault: Work = {
  slug: "discvault",
  title: "DiscVault",
  order: 3,
  thesis: "An attachment cap is a block size.",
  summary:
    "Chunked large-file storage on Discord's free-tier attachment limits, retrieved via a SHA-256-verified manifest — controlled from CLI, website, desktop exe, and Android apk.",
  services: ["Engineering"],
  tools: ["TypeScript", "Node", "Discord API", "SHA-256"],
  industries: ["Dev Tools"],
  year: 2026,
  status: "live",
  links: {
    live: "https://discvault.onrender.com",
    repo: "https://github.com/Sayandeep1013/DiscVault",
  },
  accent: { light: "#747EF1", dark: "#1627DF" },
  invertsPage: false,
  /* A generated plate rather than a screenshot — D-038. The motif comes from
     the seed, so twelve works differ without twelve decisions. */
  card: {
    width: "wide",
    poster: "/media/works/discvault.webp",
    art: "discvault-01",
  },
  blocks: [],
};
