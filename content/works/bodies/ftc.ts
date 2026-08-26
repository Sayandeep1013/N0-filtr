import type { Block } from '../_types';

/**
 * FTC's case-study body.
 *
 * Split out of `content/works/ftc.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const ftcBody: Block[] = [
  {
    type: "prose",
    heading: "Top trumps, and the oldest problem in multiplayer",
    body: "The game is simple: pick a universe, pick a deck, and call the strongest stat on your top card. The problem underneath it is not simple at all, and it is the one every multiplayer game meets on day one — **if the client knows what the other player is holding, the game is over.**\n\nA card game is the purest version of this. Every card is data, the whole deck has to reach the device somehow, and the moment it does, the outcome is decidable before anyone plays.",
  },
  {
    type: "board",
    caption: "A universe, a deck of fifty-two, and eight stats to call.",
    items: [
      { art: "mosaic/ftc-board-1", caption: "Fifty-two cards, eight stats" },
      { art: "iris/ftc-board-2", caption: "Rooms, in realtime" },
      { art: "strata/ftc-board-3", caption: "A cover is a card back" },
    ],
  },
  {
    type: "prose",
    heading: "What a deck has to be before it can be played",
    body: "Decks are content, and content that is wrong breaks a game rather than looking bad. The rule is explicit: a deck needs **fifty-two cards, eight stats, complete stat values for every card, and a cover image** before it can be made playable. The cover doubles as the card back in play, which is a small thing that makes an authored deck feel finished.\n\nRooms and turns run over Supabase Realtime — the same shape as the rest of these projects, because a Postgres that can broadcast removes the need for a game server.",
  },
  {
    type: "quote",
    text: "Every card is data, and data on a client is data the client can read. Where the comparison happens is the whole design.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Game",
        value: [
          "Fantasy trump cards",
          "Universe then deck",
          "Call the strongest stat",
        ],
      },
      {
        key: "Decks",
        value: ["52 cards", "8 stats", "Cover doubles as the back"],
      },
      {
        key: "Realtime",
        value: [
          "Supabase Realtime",
          "Rooms, create or join",
          "Supabase Auth",
        ],
      },
      {
        key: "Stack",
        value: ["Next.js 15", "React 19", "Framer Motion + GSAP", "Vercel"],
      },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "iris/ftc-slide-1", caption: "Pick a universe" },
      { art: "mosaic/ftc-slide-2", caption: "Create or join a room" },
      { art: "orbit/ftc-slide-3", caption: "Call the stat" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**Two animation libraries is one more than a project should have.** Framer Motion and GSAP are both here — Motion for component transitions where it is genuinely nicer, GSAP for anything scrubbed or sequenced. It works and it is a cost, and if this were rebuilt today it would pick one.\n\n**Deck authoring is where the real work is.** Fifty-two complete cards across eight stats is a spreadsheet problem, and the validation rule exists because a deck that is 95% filled in is a deck that produces a broken round somewhere in the middle of a match.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: '**The rules engine is not documented, and this page will not pretend otherwise.** The thesis of the project is that no client decides the outcome; what the repository actually shows is Supabase Realtime, Supabase Auth and a deck schema. Whether comparison is server-side today, and where it runs, is not written down anywhere a reader could check.\n\nThat gap is the next thing worth closing — not because the code is necessarily wrong, but because on a card game *"trust us, the server decides"* is a claim that has to be readable to be worth anything.',
  },
];
