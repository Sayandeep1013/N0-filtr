import type { Work } from './_types';

/** 01 · Tessera. `40-content-model.md` §2. */
export const tessera: Work = {
  slug: 'tessera',
  title: 'Tessera',
  order: 1,
  thesis: 'A drawing is a document an AI can edit.',
  summary:
    'Code-native pixel-art editor — the canvas is a JSON document with an AI editing agent proposing reviewable pixel diffs on top.',
  services: ['Product Design', 'Engineering'],
  tools: ['TypeScript', 'React', 'Canvas', 'LLM APIs'],
  industries: ['AI', 'Creative Coding'],
  year: 2026,
  status: 'live',
  links: { live: 'https://tessera-brown-pi.vercel.app', repo: 'https://github.com/Sayandeep1013/Tessera' },
  accent: { light: '#2595E4', dark: '#125C91' },
  invertsPage: false,
  card: { width: 'full', poster: '/media/works/tessera-art.webp' },

  /**
   * The case-study body. `30-page-specs.md` §`/works/[slug]`.
   *
   * **This is the one that sets the pattern.** Phase 6 builds one work end to
   * end and eleven inherit its shape, so the sequence below is a template as
   * much as it is a page. It exercises all eight block types once, in the order
   * §2's rhythm rule asks for — never two prose blocks in a row without a
   * visual between them.
   *
   * ── Every image is a real screen, and one of them was drawn to order ────
   *
   * `scripts/capture.mjs` takes the three widths cold. The sprite and the two
   * document views came from driving the live editor with Playwright — picking
   * a palette colour, dragging rows, opening the code panel — because a cold
   * capture of a drawing tool is an empty canvas, which is an honest picture of
   * nothing.
   *
   * The obvious better version is the agent drawing it, and that was the first
   * attempt: the deploy allows two free requests and then answers *"The AI
   * agent is not configured for this deployment"*, which is the correct trade
   * for a side project and is why the sprite here was drawn by hand. Said so in
   * the body rather than left as a gap for a reader to notice. See I-047.
   *
   * ── The code block is the real document ────────────────────────────────
   *
   * Read out of the running editor's code panel, not written to look plausible.
   * The first draft of this page invented a `replace-region` patch format and
   * it was wrong in every particular — the real thing stores each layer as an
   * array of row strings in base-36 palette indices, which is both simpler than
   * the invention and a much better argument for the thesis.
   */
  blocks: [
    {
      type: 'prose',
      heading: 'A drawing with no vocabulary for what changed',
      body: "Pixel art is edited one pixel at a time, and every tool that ships stores the result as pixels — a grid of colours, opaque to everything except the tool that wrote it. That is fine until there is a second author. Then you find that the file has no way to say *what changed*: two versions of a sprite are two images, and the difference between them is a third image.\n\nThat is the constraint. Not that a model cannot draw — models draw fine — but that a drawing produced by one is unreviewable. You cannot approve half a brushstroke, and you cannot read a diff of two PNGs.",
    },
    {
      type: 'board',
      caption: 'The drawing, the document, and the document read back as characters.',
      items: [
        {
          src: '/media/works/tessera-art.webp',
          alt: 'The Tessera editor with a red-capped mushroom sprite on a 32 by 32 grid, the tool rail down the left and the agent prompt at the bottom.',
          caption: '32 × 32, sixteen colours',
        },
        {
          src: '/media/works/tessera-code-detail.webp',
          alt: 'The Tessera code panel showing the document as JSON, with tabs for Code, SVG, CSS, React, PNG and ASCII.',
          caption: 'One source, six targets',
        },
        {
          src: '/media/works/tessera-ascii-detail.webp',
          alt: 'The same sprite rendered as ASCII characters, marked read-only and generated from the document.',
          caption: 'Generated from the document',
        },
      ],
    },
    {
      type: 'prose',
      heading: 'The file is the drawing',
      body: "So the canvas is stored as a document, and the document is designed to be read. A palette of named colours, then each layer as an array of **strings** — one per row, one character per pixel, the character being that colour's index in base 36 and `.` meaning transparent.\n\nIt is a deliberately unclever format and every property that matters follows from it. A row is a line, so a change is a line change, so `git diff` works. A palette entry has a name, so an edit can say `wine` instead of `#b13e53`. Frames are a list, so animation is the same document with more of it. And a model that has to modify a drawing is now doing the one thing models are reliably good at — editing text with a known shape — instead of the thing they are not, which is painting to a specification.",
    },
    {
      type: 'code',
      lang: 'jsonc',
      caption: 'The sprite above, as it actually serialises. Read out of the running editor, not retyped.',
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
      type: 'quote',
      text: 'Once the drawing is a document, the interesting question stops being what the model can draw and starts being what it can justify.',
    },
    {
      type: 'spec',
      rows: [
        { key: 'Document', value: ['JSON, versioned', 'Named palette', 'Rows as base-36 strings'] },
        { key: 'Editing', value: ['Layers and frames', 'Full undo history', 'Agent edits the file'] },
        { key: 'Exports', value: ['SVG', 'CSS', 'React', 'PNG', 'ASCII'] },
      ],
    },
    {
      type: 'slider',
      items: [
        { src: '/media/works/tessera-wide.webp', alt: 'Tessera at 1920 wide.', caption: '1920 — everything open' },
        { src: '/media/works/tessera.webp', alt: 'Tessera at 1440 wide.', caption: '1440 — the working width' },
        { src: '/media/works/tessera-narrow.webp', alt: 'Tessera at 900 wide.', caption: '900 — the chrome gives way' },
      ],
    },
    {
      type: 'prose',
      heading: 'What it cost',
      body: "Two things were harder than they look. The first is **addressing**. A pixel has coordinates, but a region worth talking about — a cap, a highlight, an outline — does not, and inventing stable names for parts of a drawing the author never named is most of the problem. Bounds plus layer is the current answer: coarse, and honest about being coarse.\n\nThe second is **the preview**. A proposed edit has to be shown over the live document without being committed to it, which means the renderer holds two states at once and the undo stack has to not know about the one that was never accepted. Small code, large amount of care.\n\nThe agent itself is the part that is least finished. The deploy linked below runs two free requests and then asks for your own API key, which is the correct trade for a side project and the reason the screenshots on this page were drawn by hand.",
    },
  ],
};
