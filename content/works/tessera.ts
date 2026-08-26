import type { Work } from "./_types";

/** 01 · Tessera. `40-content-model.md` §2. */
export const tessera: Work = {
  slug: "tessera",
  title: "Tessera",
  order: 1,
  thesis: "A drawing is a document an AI can edit.",
  summary:
    "Code-native pixel-art editor — the canvas is a JSON document with an AI editing agent proposing reviewable pixel diffs on top.",
  services: ["Product Design", "Engineering"],
  tools: ["TypeScript", "React", "Canvas", "LLM APIs"],
  industries: ["AI", "Creative Coding"],
  year: 2026,
  status: "live",
  links: {
    live: "https://tessera-brown-pi.vercel.app",
    repo: "https://github.com/Sayandeep1013/Tessera",
  },
  accent: { light: "#2595E4", dark: "#125C91" },
  invertsPage: false,
  /* A generated mosaic rather than a screenshot — D-038, and the motif is
     not an accident: a tessera *is* a single tile in a mosaic. */
  card: {
    width: "full",
    poster: "/media/works/tessera-art.webp",
    art: "mosaic/tessera-01",
  },

  /**
   * The case-study body. `30-page-specs.md` §`/works/[slug]`.
   *
   * **This is the one that sets the pattern.** Phase 6 builds one work end to
   * end and eleven inherit its shape, so the sequence below is a template as
   * much as it is a page. It exercises every block type once, in the order §2's
   * rhythm rule asks for — never two prose blocks in a row without a visual.
   *
   * ── Written from the repository, not from the screenshots ──────────────
   *
   * Sayandeep: *"fix the content .. take help from repologs or visit that
   * projects repo itself for more info if needed."* Every claim below comes out
   * of `github.com/Sayandeep1013/Tessera` or out of the running app, and the
   * distinctive phrases are quoted rather than paraphrased — the format line,
   * the ten gates, the one-gesture undo, and the sentence the README is honest
   * enough to include: *"the AI produces valid edits that are not good edits."*
   *
   * That last one is the reason this page is worth reading. A studio site does
   * not print its own nine-out-of-nine failure; the whole argument of this one
   * is that we are the people who built the thing and can therefore tell you
   * where it does not work yet.
   *
   * ── The imagery ────────────────────────────────────────────────────────
   *
   * The hero is a **generated plate** (`components/art/Artwork.tsx`, D-038) —
   * Sayandeep asked for "a artsy generated image which suits the theme", and a
   * mosaic is the honest motif for a project named after a mosaic tile.
   *
   * The board keeps three real screens, because those three are *evidence*
   * rather than decoration: the sprite, the document behind it, and the same
   * document read back as characters. They were captured by driving the live
   * editor with Playwright (`scripts/tessera-states.mjs`) — a cold capture of a
   * drawing tool is an empty canvas, which is an honest picture of nothing.
   */
  blocks: [
    {
      type: "prose",
      heading: "A drawing with no vocabulary for what changed",
      body: "Pixel art is edited one pixel at a time, and every tool that ships stores the result as pixels — a grid of colours, opaque to everything except the tool that wrote it. That is fine until there is a second author. Then you find the file has no way to say *what changed*: two versions of a sprite are two images, and the difference between them is a third image.\n\nThat is the constraint. Not that a model cannot draw — models draw fine — but that a drawing produced by one is unreviewable. You cannot approve half a brushstroke, and you cannot read a diff of two PNGs.",
    },
    {
      type: "board",
      caption:
        "The drawing, the document behind it, and the document read back as characters.",
      items: [
        {
          src: "/media/works/tessera-art.webp",
          alt: "The Tessera editor with a mushroom sprite on a 32 by 32 grid, the tool rail down the left and the agent prompt at the bottom.",
          caption: "32 × 32, sixteen colours",
        },
        {
          src: "/media/works/tessera-code-detail.webp",
          ratio: "4 / 3",
          alt: "The Tessera code panel showing the document as JSON, with tabs for Code, SVG, CSS, React, PNG and ASCII.",
          caption: "One source, six targets",
        },
        {
          src: "/media/works/tessera-ascii-detail.webp",
          ratio: "4 / 3",
          alt: "The same sprite rendered as ASCII characters, marked read-only and generated from the document.",
          caption: '"Generated from the document"',
        },
      ],
    },
    {
      type: "prose",
      heading: "The file is the drawing",
      body: "So the canvas is stored as a document, and the document is designed to be read. A palette of named colours, then each layer as an array of **strings** — one row per string, **one character per pixel**: `.` is transparent, and `1`–`9` and `a`–`z` are palette indices.\n\nIt is a deliberately unclever format and every property that matters follows from it. A row is a line, so a change is a line change, so `git diff` works. A palette entry has a name, so an edit can say `wine` rather than `#b13e53`. Frames are a list, so animation is the same document with more of it. And the same JSON is both the file you export and the panel you read — there is no second representation to keep in step.",
    },
    {
      type: "code",
      lang: "jsonc",
      caption:
        "The sprite above, as it actually serialises. Read out of the running editor, not retyped.",
      source: `{
  "v": 1,
  "w": 32, "h": 32,
  "palette": [
    { "c": "transparent" },
    { "c": "#1a1c2c", "n": "ink" },
    { "c": "#5d275d", "n": "plum" },
    { "c": "#b13e53", "n": "wine" },
    { "c": "#ef7d57", "n": "coral" },
    { "c": "#ffcd75", "n": "sand" },
    // … ten more …
  ],
  "frames": [{ "ms": 100, "layers": [{ "n": "base", "px": [
    ".............333333.............",
    "...........3333333333...........",
    "..........33dd33333333..........",
    ".........333dd3333dd333.........",
    "........3333333dd3dd3333........",
    "........33dd333dd333dd33........",
    ".........3dd33333333dd3.........",
    "..........333333333333..........",
    ".............555555.............",
    ".............555555.............",
    ".............555555.............",
    ".............555555.............",
    ".............555555.............",
    ".............555555.............",
    "............55555555............",
    "...........eeeeeeeeee..........."
  ] }] }]
}`,
    },
    {
      type: "quote",
      text: "The agent never touches the canvas. It proposes an edit to the file, and the edit passes ten validation gates and lands on a clone before anyone sees it.",
    },
    {
      type: "prose",
      heading: "What it cost",
      body: "**Addressing** was harder than it looks. A pixel has coordinates; a region worth talking about — a cap, a highlight, an outline — does not, and inventing stable names for parts of a drawing the author never named is most of the problem. Bounds plus layer is the current answer: coarse, and honest about being coarse.\n\n**Undo** was the other one. Treating *one gesture as one step* sounds obvious and is not: a drag across forty cells is one step, an agent patch of four hundred is one step, and a preview that was never accepted is no step at all. The renderer holds two states while a proposal is on screen and the history has to not know about the one that was refused.",
    },
    {
      type: "spec",
      rows: [
        {
          key: "Document",
          value: [
            "JSON, versioned",
            "Named palette",
            "One character per pixel",
          ],
        },
        {
          key: "Editing",
          value: [
            "Layers and blend modes",
            "Multi-frame animation",
            "One gesture, one undo",
          ],
        },
        {
          key: "Agent",
          value: [
            "Gemini, free tier",
            "Ten validation gates",
            "Applied to a clone first",
          ],
        },
        { key: "Exports", value: ["SVG", "CSS", "React", "PNG", "ASCII"] },
      ],
    },
    {
      type: "slider",
      items: [
        {
          src: "/media/works/tessera-wide.webp",
          alt: "Tessera at 1920 wide.",
          caption: "1920 — everything open",
        },
        {
          src: "/media/works/tessera.webp",
          alt: "Tessera at 1440 wide.",
          caption: "1440 — the working width",
        },
        {
          src: "/media/works/tessera-narrow.webp",
          alt: "Tessera at 900 wide.",
          caption: "900 — the chrome gives way",
        },
      ],
    },
    {
      type: "prose",
      heading: "Where it does not work yet",
      body: "The README says it plainly, so this page will too: **the AI produces valid edits that are not good edits.** A Phase 0 test scored **0 of 9**. Every proposal passed the gates, applied cleanly, and could be read as a diff — and not one of them was a change an artist would have kept.\n\nThat is a useful failure rather than an embarrassing one, because it separates two problems that look like one. Making a model's output *reviewable* is solved here. Making it *good* is a different problem, it is still open, and the hypotheses are written down in the repo rather than quietly dropped.\n\nSharing is unfinished for the same reason — it was the next thing, and the next thing was not the interesting thing. The deploy below runs two free requests before it asks for your own API key.",
    },
  ],
};
