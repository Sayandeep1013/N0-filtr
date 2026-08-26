import type { Block } from '../_types';

/**
 * ReelShell's case-study body.
 *
 * Split out of `content/works/reelshell.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const reelshellBody: Block[] = [
  {
    type: "prose",
    heading: "A terminal can be a streaming client",
    body: "Browsing something to watch is a browser activity by convention rather than by necessity. The catalogue is an API, the choice is a list, and the playback is a process — none of which needs a page.\n\nReelShell is a **terminal-native tool to browse movies, series and anime**, built in Go, where selection happens in a TUI and playback is handed to a real player rather than pretended at in text.",
  },
  {
    type: "board",
    caption:
      "Browse in the terminal, hand playback to something that can actually decode.",
    items: [
      { art: "strata/reelshell-board-1", caption: "A TUI catalogue" },
      { art: "mosaic/reelshell-board-2", caption: "Delegated to mpv" },
      { art: "orbit/reelshell-board-3", caption: "Written in Go" },
    ],
  },
  {
    type: "prose",
    heading: "The line between a client and a player",
    body: "The temptation with a project like this is to render video *in* the terminal — half-block characters, colour quantisation, a frame rate that makes it a stunt. It looks impressive in a screen recording and it is unwatchable.\n\nSo playback **delegates to mpv**, which decodes properly, and the terminal does the part it is genuinely better at: a fast, keyboard-driven catalogue with no page loads. Knowing which half of a problem your interface is good at is most of the design.",
  },
  {
    type: "quote",
    text: "Playback currently goes through a dummy provider that always returns a public-domain test clip.",
  },
  {
    type: "spec",
    rows: [
      { key: "Language", value: ["Go", "Single binary", "go.mod / go.sum"] },
      {
        key: "Interface",
        value: ["Terminal UI", "Keyboard-driven", "No page loads"],
      },
      {
        key: "Playback",
        value: [
          "Delegated to mpv",
          "Dummy provider today",
          "Public-domain test clip",
        ],
      },
      {
        key: "Not built",
        value: [
          "Nyaa / torrent provider",
          "Real source resolution",
          "Deliberately absent",
        ],
      },
    ],
  },
  {
    type: "slider",
    items: [
      {
        art: "mosaic/reelshell-slide-1",
        caption: "Browse without a browser",
      },
      { art: "strata/reelshell-slide-2", caption: "One binary, no runtime" },
      { art: "iris/reelshell-slide-3", caption: "The provider is a seam" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**The provider interface is the whole architecture.** Everything above it — the catalogue, the TUI, the playback hand-off — is written against a seam that returns a stream URL. That is what lets the shipped version run against a dummy provider and still be a real program rather than a mock.\n\nGo was chosen for the boring reason that it is right: a single static binary with no runtime to install is what a terminal tool should be, and it is the difference between something people try and something people keep.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: 'This is the one on the list that most needs its own paragraph, because the headline claim and the shipped behaviour are not the same thing.\n\n**Playback always returns a public-domain test clip.** The dummy provider is what is wired up. The real source-resolution providers live in a private companion repository and are **never published here** — and the README says outright that the Nyaa/torrent provider from v2 is *"deliberately not built."*\n\nSo what this repository demonstrates is the client: the catalogue, the interface, the seam and the hand-off. What it does not do, out of the box, is get you a film.',
  },
];
