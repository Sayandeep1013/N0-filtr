import type { Block } from '../_types';

/**
 * TermTypo's case-study body.
 *
 * Split out of `content/works/termtypo.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const termtypoBody: Block[] = [
  {
    type: "prose",
    heading: "A terminal can be a ranked competitive arena",
    body: "Typing tests live in browsers. That is not a technical fact, it is a habit — and it excludes the people who type most, who are already in a terminal and are not going to leave it to race someone.\n\nTermTypo is a **terminal-first** multiplayer typing test: ranked 1v1 matches, an ELO ladder, and a global leaderboard, played from a shell. The web version exists too, and the interesting part is that they play each other.",
  },
  {
    type: "board",
    caption:
      "A scrolling line, a live keyboard, and an opponent somewhere else.",
    items: [
      {
        art: "strata/termtypo-board-1",
        caption: "Cursor pinned, text flows",
      },
      {
        art: "mosaic/termtypo-board-2",
        caption: "Every keystroke, coloured",
      },
      { art: "orbit/termtypo-board-3", caption: "Cross-play, one ladder" },
    ],
  },
  {
    type: "prose",
    heading: "Cross-play is the design decision everything else follows from",
    body: "A terminal player and a browser player race each other, share a leaderboard and share a match history. That single requirement decides the architecture: the match cannot live in either client, so it lives in Supabase, and both front-ends are views of the same rows.\n\nThe terminal interface is a **scrolling single-line display — the cursor stays pinned at centre as the text flows past** — with a live keyboard visualisation colouring each keystroke green or red. That is more work than a static paragraph and it is what makes the terminal version feel like the real one rather than the fallback.",
  },
  {
    type: "quote",
    text: "Seven separate mode ratings, ±30 per result, a floor at zero, and seven tiers from Bronze to Master.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Modes",
        value: [
          "10 / 25 / 50 / 100 words",
          "10s / 30s / 60s",
          "Seven ELO ratings",
        ],
      },
      {
        key: "Ranked",
        value: [
          "1v1 matchmaking",
          "Cross-play CLI ↔ web",
          "Shared leaderboard",
        ],
      },
      {
        key: "Stack",
        value: [
          "Python 3.10+",
          "Supabase",
          "Google OAuth on localhost:54321",
        ],
      },
      {
        key: "Delivery",
        value: ["PyPI package", "Platform binaries", "Web companion"],
      },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "mosaic/termtypo-slide-1", caption: "Bronze to Master" },
      { art: "strata/termtypo-slide-2", caption: "Live WPM and elapsed" },
      {
        art: "iris/termtypo-slide-3",
        caption: "Disconnect: auto-win at 45s",
      },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**OAuth in a terminal is genuinely awkward.** There is no browser to redirect and no address bar to read a token out of, so the CLI stands up a local callback server on `localhost:54321`, opens a browser, and catches the redirect itself. It works, and it is the part that surprises people who assume a terminal app cannot have real accounts.\n\n**Rating a game with seven modes is seven games.** A single ELO across all of them would let someone farm the easiest mode; seven separate ratings is more state, more UI and the only version that means anything.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "Disconnection is handled by a timer — **45 seconds and the remaining player wins** — which is the blunt version. It cannot tell a rage-quit from a train going into a tunnel, and it should eventually.\n\nAnd distribution is the ongoing cost. A PyPI package and platform binaries are two release paths that have to stay in step with a schema that both of them and the web client share.",
  },
];
