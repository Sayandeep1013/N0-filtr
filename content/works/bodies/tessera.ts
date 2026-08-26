import type { Block } from '../_types';

/**
 * Tessera's case-study body.
 *
 * Split out of `content/works/tessera.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const tesseraBody: Block[] = [
  {
    type: "prose",
    heading: "A drawing with no vocabulary for what changed",
    body: "Pixel art is edited one pixel at a time, and every tool that ships stores the result as pixels — a grid of colours, opaque to everything except the tool that wrote it. That is fine until there is a second author. Then you find the file has no way to say *what changed*: two versions of a sprite are two images, and the difference between them is a third image.\n\nThat is the constraint. Not that a model cannot draw — models draw fine — but that a drawing produced by one is unreviewable. You cannot approve half a brushstroke, and you cannot read a diff of two PNGs.",
  },
  {
    type: "board",
    caption:
      "Thirty-two by thirty-two, sixteen colours, and a file you can read.",
    items: [
      { art: "mosaic/tessera-board-1" },
      { art: "strata/tessera-board-2", ratio: "4 / 3" },
      { art: "iris/tessera-board-3", ratio: "4 / 3" },
    ],
  },
  {
    type: "prose",
    heading: "The file is the drawing",
    body: "So the canvas is stored as a document, and the document is designed to be read. A palette of named colours, then each layer as an array of **strings** — one row per string, **one character per pixel**: a dot is transparent, and `1`–`9` and `a`–`z` are palette indices. A sixteen-colour sprite is sixteen lines of text.\n\nIt is a deliberately unclever format and every property that matters follows from it. A row is a line, so a change is a line change, so `git diff` works on a drawing. A palette entry has a name, so an edit can say `wine` rather than `#b13e53` — and a model asked to darken the outline has a word for the thing it is darkening. Frames are a list, so animation is the same document with more of it. And the same JSON is both the file you export and the panel you read, so there is no second representation to keep in step.",
  },
  {
    type: "quote",
    text: "The agent never touches the canvas. It proposes an edit to the file, and the edit passes ten validation gates and lands on a clone before anyone sees it.",
  },
  {
    type: "prose",
    heading: "Why that makes the model useful",
    body: "This is the part worth taking away even if you never touch pixel art. A model asked to **paint** is producing a high-dimensional artefact to an underspecified brief, and it will be confidently mediocre at it. A model asked to **edit a text document with a known shape** is doing the thing it is most reliable at.\n\nWhat renders is a preview over the current state, and it lands only when someone accepts it. Rejecting it costs nothing, which is the property that makes it usable at all — a suggestion you cannot cheaply refuse is not a suggestion.",
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
      { art: "orbit/tessera-slide-1", caption: "Layers and blend modes" },
      { art: "mosaic/tessera-slide-2", caption: "Frames, and the timeline" },
      {
        art: "strata/tessera-slide-3",
        caption: "Six export targets, one source",
      },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**Addressing** was harder than it looks. A pixel has coordinates; a region worth talking about — a cap, a highlight, an outline — does not, and inventing stable names for parts of a drawing the author never named is most of the problem. Bounds plus layer is the current answer: coarse, and honest about being coarse.\n\n**Undo** was the other one. Treating *one gesture as one step* sounds obvious and is not: a drag across forty cells is one step, an agent patch of four hundred is one step, and a preview that was never accepted is no step at all. The renderer holds two states while a proposal is on screen and the history has to not know about the one that was refused.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "The README says it plainly, so this page will too: **the AI produces valid edits that are not good edits.** A Phase 0 test scored **0 of 9**. Every proposal passed the gates, applied cleanly, and could be read as a diff — and not one was a change an artist would have kept.\n\nThat is a useful failure rather than an embarrassing one, because it separates two problems that look like one. Making a model's output *reviewable* is solved here. Making it *good* is a different problem, it is still open, and the hypotheses are written down in the repo rather than quietly dropped.\n\nSharing is unfinished for the same reason — it was the next thing, and the next thing was not the interesting thing. The deploy below runs two free requests before it asks for your own API key.",
  },
];
