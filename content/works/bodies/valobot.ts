import type { Block } from '../_types';

/**
 * ValoBot's case-study body.
 *
 * Split out of `content/works/valobot.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const valobotBody: Block[] = [
  {
    type: "prose",
    heading: "A model with no cutoff, if it fetches first",
    body: "Ask any language model who won last night and it will tell you something. It will be fluent, it will be specific, and there is no reason at all for it to be true — the match happened after training and the model has no way to know that it does not know.\n\nEsports is the sharpest version of this problem. Rosters change mid-season, results land hourly, and a confident wrong answer about a match somebody watched is worse than no answer at all.",
  },
  {
    type: "board",
    caption: "Live data first, then the model. Never the other way round.",
    items: [
      { art: "orbit/valobot-board-1", caption: "Scraped from VLR.gg" },
      { art: "mosaic/valobot-board-2", caption: "Context, then answer" },
      { art: "strata/valobot-board-3", caption: "Twelve VCT rosters" },
    ],
  },
  {
    type: "prose",
    heading: "The refusal is the feature",
    body: 'CYPHER **fetches live context before answering** — matches, rosters, standings — and answers from that. The part worth building was not the retrieval. It was the branch after it: *if the fetch fails, it refuses rather than guessing.*\n\nThat sounds like a small piece of error handling and it is the whole product. A dashboard that says "I could not reach VLR just now" is trustworthy. One that fills the gap with a plausible sentence is worse than a blank page, because you cannot tell the two apart from the outside.',
  },
  {
    type: "quote",
    text: "It explicitly refuses to fabricate an answer if the fetch fails, rather than guessing.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Data",
        value: [
          "VLR.gg, scraped",
          "Live matches and fixtures",
          "Regional standings",
        ],
      },
      {
        key: "Model",
        value: [
          "Groq SDK",
          "Grounded on fetched context",
          "Refuses on fetch failure",
        ],
      },
      {
        key: "Coverage",
        value: [
          "12 VCT partner teams",
          "Player roles and agent pools",
          "Americas · EMEA · Pacific",
        ],
      },
      { key: "Stack", value: ["Next.js 15", "React 19", "GSAP", "Vercel"] },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "mosaic/valobot-slide-1", caption: "Fixtures and results" },
      { art: "orbit/valobot-slide-2", caption: "Rosters and agent pools" },
      { art: "iris/valobot-slide-3", caption: "Ask it anything, grounded" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**Scraping is a maintenance commitment, not a feature.** VLR.gg owes us nothing and its markup can change on any day; every selector is a small future outage. That is the honest price of building on a source with no API, and it was worth paying because the alternative was no live data at all.\n\nThe **playstyle analyses are model-written**, and the page should keep being clear about which parts of it are reported and which are generated. Fixtures are facts. A paragraph about how a team likes to play is an opinion a model formed, and those two things should never look the same on a screen.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "There is no caching layer worth the name, so a busy page does more fetching than it should — the design trades politeness to the source for freshness, and the balance is not right yet.\n\nAnd the refusal path, which is the thing this project is actually about, is only as good as the failure detection behind it. A fetch that *succeeds* and returns stale or partial data is the case that still gets through, and it is the one worth building next.",
  },
];
