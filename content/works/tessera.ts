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
    poster: '',
    art: "mosaic/tessera-01",
  },

  /**
   * The case-study body. `30-page-specs.md` §`/works/[slug]`.
   *
   * **This is the one that sets the pattern.** Phase 6 builds one work end to
   * end and eleven inherit its shape, so the sequence below is a template as
   * much as it is a page.
   *
   * ── No screenshots, and no code specimen ───────────────────────────────
   *
   * Sayandeep: *"remove any real image or code reference from any work .. just
   * links are okay and detailed descriptions .. we have to work on proper
   * images that suits the site."*
   *
   * So every visual here is a **generated plate** (`components/art/Artwork.tsx`,
   * D-038) and the JSON specimen that used to sit in the middle is gone — its
   * argument moved into the prose around it, which is where it reads better
   * anyway: the interesting thing was never the syntax, it was that a row is a
   * line and a line can be diffed.
   *
   * The page shape did not change. The board and the slider are the same blocks
   * holding the same number of items, so real photography drops straight in
   * when there is any. See D-047.
   *
   * ── Written from the repository ────────────────────────────────────────
   *
   * Every claim comes out of `github.com/Sayandeep1013/Tessera` or out of the
   * running app, and the distinctive phrases are quoted rather than paraphrased
   * — the format line, the ten gates, the one-gesture undo, and the sentence the
   * README is honest enough to include: *"the AI produces valid edits that are
   * not good edits."*
   *
   * That last one is why this page is worth reading. A studio site does not
   * print its own nine-out-of-nine failure; the whole argument of this one is
   * that we built the thing and can therefore tell you where it does not work.
   */
  blocks: [
    {
      type: 'prose',
      heading: 'A drawing with no vocabulary for what changed',
      body: "Pixel art is edited one pixel at a time, and every tool that ships stores the result as pixels — a grid of colours, opaque to everything except the tool that wrote it. That is fine until there is a second author. Then you find the file has no way to say *what changed*: two versions of a sprite are two images, and the difference between them is a third image.\n\nThat is the constraint. Not that a model cannot draw — models draw fine — but that a drawing produced by one is unreviewable. You cannot approve half a brushstroke, and you cannot read a diff of two PNGs.",
    },
    {
      type: 'board',
      caption: 'Thirty-two by thirty-two, sixteen colours, and a file you can read.',
      items: [
        { art: 'mosaic/tessera-board-1' },
        { art: 'strata/tessera-board-2', ratio: '4 / 3' },
        { art: 'iris/tessera-board-3', ratio: '4 / 3' },
      ],
    },
    {
      type: 'prose',
      heading: 'The file is the drawing',
      body: "So the canvas is stored as a document, and the document is designed to be read. A palette of named colours, then each layer as an array of **strings** — one row per string, **one character per pixel**: a dot is transparent, and `1`–`9` and `a`–`z` are palette indices. A sixteen-colour sprite is sixteen lines of text.\n\nIt is a deliberately unclever format and every property that matters follows from it. A row is a line, so a change is a line change, so `git diff` works on a drawing. A palette entry has a name, so an edit can say `wine` rather than `#b13e53` — and a model asked to darken the outline has a word for the thing it is darkening. Frames are a list, so animation is the same document with more of it. And the same JSON is both the file you export and the panel you read, so there is no second representation to keep in step.",
    },
    {
      type: 'quote',
      text: 'The agent never touches the canvas. It proposes an edit to the file, and the edit passes ten validation gates and lands on a clone before anyone sees it.',
    },
    {
      type: 'prose',
      heading: 'Why that makes the model useful',
      body: "This is the part worth taking away even if you never touch pixel art. A model asked to **paint** is producing a high-dimensional artefact to an underspecified brief, and it will be confidently mediocre at it. A model asked to **edit a text document with a known shape** is doing the thing it is most reliable at.\n\nWhat renders is a preview over the current state, and it lands only when someone accepts it. Rejecting it costs nothing, which is the property that makes it usable at all — a suggestion you cannot cheaply refuse is not a suggestion.",
    },
    {
      type: 'spec',
      rows: [
        { key: 'Document', value: ['JSON, versioned', 'Named palette', 'One character per pixel'] },
        { key: 'Editing', value: ['Layers and blend modes', 'Multi-frame animation', 'One gesture, one undo'] },
        { key: 'Agent', value: ['Gemini, free tier', 'Ten validation gates', 'Applied to a clone first'] },
        { key: 'Exports', value: ['SVG', 'CSS', 'React', 'PNG', 'ASCII'] },
      ],
    },
    {
      type: 'slider',
      items: [
        { art: 'orbit/tessera-slide-1', caption: 'Layers and blend modes' },
        { art: 'mosaic/tessera-slide-2', caption: 'Frames, and the timeline' },
        { art: 'strata/tessera-slide-3', caption: 'Six export targets, one source' },
      ],
    },
    {
      type: 'prose',
      heading: 'What it cost',
      body: "**Addressing** was harder than it looks. A pixel has coordinates; a region worth talking about — a cap, a highlight, an outline — does not, and inventing stable names for parts of a drawing the author never named is most of the problem. Bounds plus layer is the current answer: coarse, and honest about being coarse.\n\n**Undo** was the other one. Treating *one gesture as one step* sounds obvious and is not: a drag across forty cells is one step, an agent patch of four hundred is one step, and a preview that was never accepted is no step at all. The renderer holds two states while a proposal is on screen and the history has to not know about the one that was refused.",
    },
    {
      type: 'prose',
      heading: 'Where it does not work yet',
      body: "The README says it plainly, so this page will too: **the AI produces valid edits that are not good edits.** A Phase 0 test scored **0 of 9**. Every proposal passed the gates, applied cleanly, and could be read as a diff — and not one was a change an artist would have kept.\n\nThat is a useful failure rather than an embarrassing one, because it separates two problems that look like one. Making a model's output *reviewable* is solved here. Making it *good* is a different problem, it is still open, and the hypotheses are written down in the repo rather than quietly dropped.\n\nSharing is unfinished for the same reason — it was the next thing, and the next thing was not the interesting thing. The deploy below runs two free requests before it asks for your own API key.",
    },
  ],
};
