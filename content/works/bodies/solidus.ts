import type { Block } from '../_types';

/**
 * Solidus's case-study body.
 *
 * Split out of `content/works/solidus.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const solidusBody: Block[] = [
  {
    type: "prose",
    heading: "A sideloaded app can still be updated",
    body: "Ship an Android app outside a store and you gain everything except the one thing the store was quietly doing for you: **Android will never update anyone automatically.** Every install is frozen at the version it arrived as, on a device you cannot reach, belonging to someone who will not reinstall.\n\nThat is fine until the backend moves. And the backend always moves.",
  },
  {
    type: "board",
    caption:
      "Ranked bingo, and the update problem that comes free with sideloading.",
    items: [
      { art: "mosaic/solidus-board-1", caption: "Ranked, or a private room" },
      { art: "orbit/solidus-board-2", caption: "Realtime and derived state" },
      { art: "strata/solidus-board-3", caption: "Two update paths" },
    ],
  },
  {
    type: "prose",
    heading: "Two mechanisms, because one cannot cover it",
    body: "**OTA updates** carry JavaScript-only changes: publish a new bundle and installed apps pick it up in the background, applying on next launch with no reinstall. That handles most of what changes in a React Native app and it handles none of what changes in the native shell.\n\nSo there is a second, blunter path: a **`min_supported_version` gate**. An APK below the floor gets an *update required* screen instead of a game. It is not elegant and it is the only thing that works when the shape of the data has changed underneath everybody.",
  },
  {
    type: "quote",
    text: "A backend change can break every old install without touching their phones — the Supabase project is shared by every version that has ever shipped.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Game",
        value: ["Ranked auto-matchmaking", "Private rooms", "Bot practice"],
      },
      {
        key: "Realtime",
        value: [
          "Supabase Realtime",
          "Derived state via hooks",
          "Edge Functions",
        ],
      },
      {
        key: "Client",
        value: [
          "Expo / React Native",
          "Expo Router",
          "Zustand",
          "TypeScript",
        ],
      },
      {
        key: "Delivery",
        value: ["EAS Build", "Android APK / AAB", "OTA + version floor"],
      },
    ],
  },
  {
    type: "slider",
    items: [
      {
        art: "orbit/solidus-slide-1",
        caption: "Every result feeds the ladder",
      },
      { art: "mosaic/solidus-slide-2", caption: "Host or join" },
      { art: "iris/solidus-slide-3", caption: "Sideloaded, still current" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: '**The version floor has to be raised deliberately and rarely.** It is the only lever that can force a reinstall, and every use of it costs some fraction of the players who will not bother — so it is reserved for changes that genuinely cannot be carried over the air, and everything else is shaped to fit through OTA.\n\nThat constraint runs backwards into the design: schema changes get planned as additive first, because *"add a column"* is an OTA-compatible change and *"rename a column"* is a forced reinstall.',
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "The matchmaking is auto-matchmaking without much of an opinion — it pairs whoever is waiting, and a real ladder eventually needs rating bands, or the top of the leaderboard is decided by who plays at quiet hours.\n\nAnd the honest structural risk is the one already quoted: one Supabase project serves every version that has ever been installed. There is no staging boundary between a change and the oldest APK in the wild, and that is a thing to fix before it fixes itself loudly.",
  },
];
