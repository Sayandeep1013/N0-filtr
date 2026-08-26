import type { Block } from '../_types';

/**
 * DroidDoodle's case-study body.
 *
 * Split out of `content/works/droiddoodle.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const droiddoodleBody: Block[] = [
  {
    type: "prose",
    heading: "How much agency fits in a phone",
    body: "The interesting question about small local models is not what they can write. It is how much **agency** they can be given — how far a 1B model can be trusted to act, if the world it acts in is small enough and the tools it has are good enough.\n\nDroidDoodle is that experiment with a drawing canvas as the world: an offline Android app where an on-device model manipulates a structured board through tool calls, rather than generating an image.",
  },
  {
    type: "board",
    caption:
      "A small model, a small world, and tools sharp enough to be worth having.",
    items: [
      { art: "iris/droiddoodle-board-1", caption: "Immutable board" },
      { art: "mosaic/droiddoodle-board-2", caption: "Grid-snapped nodes" },
      { art: "strata/droiddoodle-board-3", caption: "Undo by reference" },
    ],
  },
  {
    type: "prose",
    heading: "The world model is the actual work",
    body: "A model asked to draw produces pixels nobody can review. A model asked to **call tools against a structured board** produces a plan you can read, refuse, and undo — which is the same argument Tessera makes about pixel art, arrived at from the other direction.\n\nSo the board is **immutable, grid-snapped, with undo by reference**: every operation produces a new board rather than mutating one, so undo is holding on to the previous reference rather than reversing anything. That is a boring data-structure decision and it is why a wrong plan costs nothing.",
  },
  {
    type: "quote",
    text: "A learning laboratory for agentic AI — how much agency can be created from small local models with well-defined worlds and excellent tools.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Agent core",
        value: ["Pure Kotlin", "Tool calls, not pixels", "JVM unit tests"],
      },
      {
        key: "World",
        value: ["Immutable board", "Grid-snapped", "Undo by reference"],
      },
      {
        key: "Planned",
        value: ["llama.cpp via JNI", "Jetpack Compose UI", "GBNF grammar"],
      },
      {
        key: "Status",
        value: [
          "Packages P7–P10 unstarted",
          "No device run yet",
          "Plans hand-written",
        ],
      },
    ],
  },
  {
    type: "slider",
    items: [
      {
        art: "strata/droiddoodle-slide-1",
        caption: "Nodes, edges, placement",
      },
      { art: "iris/droiddoodle-slide-2", caption: "Tested on the JVM" },
      { art: "orbit/droiddoodle-slide-3", caption: "Not yet on a phone" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: '**Building the agent core against hand-written plans was the right order and it has a sharp edge.** The board, the tools, the validation and the undo model are all testable on a JVM without a model anywhere near them, which is why they are the parts that are finished.\n\nThe edge is that everything downstream of "a real model produces a plan" is therefore untested by construction — and that is not a small remainder.',
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: 'This one is early, and its own README is the bluntest thing in this repository, so it gets quoted rather than softened: **"nothing has run on a device, no real model has produced a single plan."**\n\nThe GBNF grammar that is supposed to constrain the model\'s output has never been run against llama.cpp. Packages P7 through P10 — the Compose UI, the JNI bridge, the trace UI and on-device measurement — are unstarted. Every plan the agent core has been tested with was written by hand.\n\nIt is on this site because the design work is real and the honest status is more useful than a demo would be. The thesis at the top of this page — *a phone runs the model that drives the canvas* — is the **intent**. It is not yet a fact, and the day it becomes one this paragraph gets rewritten.',
  },
];
