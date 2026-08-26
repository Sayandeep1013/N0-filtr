import type { Block } from '../_types';

/**
 * ReIN Bot's case-study body.
 *
 * Split out of `content/works/rein-bot.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const reinBotBody: Block[] = [
  {
    type: "prose",
    heading: "Realtime multiplayer, on nothing",
    body: "Eight people, twenty-second clips, and a race to type the right answer first. The interesting constraint was not the game — it was the bill. **The whole thing had to fit inside free tiers**, which rules out a game server, a queue, a worker pool, and most of the shapes this problem usually takes.\n\nWhat it leaves is a database that can broadcast, and the discovery that this is enough.",
  },
  {
    type: "board",
    caption: "A room code, a clip, and a grader that lives in the database.",
    items: [
      {
        art: "mosaic/rein-bot-board-1",
        caption: "Four characters, no account",
      },
      { art: "iris/rein-bot-board-2", caption: "Broadcast, not polled" },
      { art: "strata/rein-bot-board-3", caption: "Graded in PL/pgSQL" },
    ],
  },
  {
    type: "prose",
    heading: "The grader is the game, and it runs in Postgres",
    body: "Anime titles are a naming disaster: romanisations differ, seasons are written four ways, and half the audience knows a show by an abbreviation. A strict comparison makes the game unplayable and a loose one makes it cheatable.\n\nSo grading runs **server-side in PL/pgSQL, in tiers** — exact, near (bounded Levenshtein), season-lenient, prefix — with normalisation for case, punctuation, long vowels and variant phrasing like *season 2* against *2nd season*. It is in the database because that is the only place a client cannot see it.",
  },
  {
    type: "quote",
    text: "The clip is named by a random UUID, so nobody can read the answer out of a network request.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Realtime",
        value: [
          "Supabase Realtime broadcast",
          "Round start and reveal",
          "No polling",
        ],
      },
      {
        key: "Grading",
        value: ["PL/pgSQL RPCs", "Four match tiers", "Server-side, always"],
      },
      {
        key: "Content",
        value: [
          "GitHub Actions + ffmpeg",
          "480p VP9 + Opus",
          "Metadata stripped",
        ],
      },
      {
        key: "Client",
        value: [
          "Static HTML",
          "Vanilla JavaScript",
          "No framework, no build",
        ],
      },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "iris/rein-bot-slide-1", caption: "2–8 players, one room" },
      { art: "strata/rein-bot-slide-2", caption: "Clips curated in CI" },
      {
        art: "orbit/rein-bot-slide-3",
        caption: "Row-level security throughout",
      },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**Curation moved to CI, and that is what made it free.** Compressing clips on demand needs a worker; compressing them once in a GitHub Action needs nothing. The clips are pre-cut, re-encoded to 480p VP9 with Opus audio, stripped of metadata, and stored under a UUID — so the runtime does no media work at all.\n\nThe **client is deliberately dumb**: static HTML and vanilla JavaScript, no framework and no build step, served from GitHub Pages. Not for purity — because a build pipeline is another thing to host, and the game did not need one.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "The deploy is live and **two dashboard steps stand between it and a playable game**: anonymous sign-in has to be enabled on Supabase, and the publishable key added to `app/config.js`. Until then it loads and does not start, which is exactly what the live link will show you.\n\nThere are also no persistent profiles and no lifetime stats, on purpose. It is a party game for a room of people who are already together, and a leaderboard would make it a different one.",
  },
];
