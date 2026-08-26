import type { PostBody } from './_types';

/** `A drawing is a document`. Out of Tessera. `40-content-model.md` §5. */
export const drawingAsDocument: PostBody = {
  slug: 'drawing-as-document',
  standfirst:
    'Every pixel editor stores a picture. Storing a document instead changes what an AI can be asked to do with it.',
  blocks: [
    {
      type: 'p',
      text: "Here is a problem that sounds like a design problem and is really a file-format problem. You have a sprite. You want a model to change something about it — darken the outline, add a highlight, fix the left pauldron — and you want to look at what it proposes before it lands. That last clause is the whole difficulty.",
    },
    {
      type: 'p',
      text: 'Because a pixel editor stores pixels. Ask a model for a change and you get back an image, and the difference between two images is a third image. There is nothing to read, nothing to argue with, and no way to accept half of it. You are not reviewing an edit; you are comparing two pictures and hoping.',
    },
    {
      type: 'h2',
      text: 'What a document buys you',
    },
    {
      type: 'p',
      text: 'Tessera stores the canvas as JSON, and the layer data as an array of strings — one string per row, one character per pixel. A dot is transparent; `1` through `9` and `a` through `z` are indices into a named palette.',
    },
    {
      type: 'code',
      lang: 'jsonc',
      caption: 'A sixteen-row sprite. Every row is a line, which is the point.',
      source: `{
  "w": 32, "h": 32,
  "palette": [
    { "c": "transparent" },
    { "c": "#b13e53", "n": "wine" },
    { "c": "#ffcd75", "n": "sand" }
  ],
  "frames": [{ "ms": 100, "layers": [{ "n": "base", "px": [
    ".............111111.............",
    "...........1111111111...........",
    "..........11221111111111........"
  ] }] }]
}`,
    },
    {
      type: 'p',
      text: 'It is a deliberately unclever format, and every property that matters falls out of it rather than being designed in.',
    },
    {
      type: 'list',
      items: [
        'A row is a line, so a change is a line change, so `git diff` works on a drawing.',
        'A palette entry has a name, so an edit can say `wine` rather than `#b13e53` — and a model asked to darken the outline has a word for the thing it is darkening.',
        'Frames are a list, so animation is the same document with more of it rather than a second format.',
        'The same JSON is both the export and the panel you read. There is no second representation to keep in step.',
      ],
    },
    {
      type: 'h2',
      text: 'The model is now doing something it is good at',
    },
    {
      type: 'p',
      text: 'This is the part worth stealing even if you never touch pixel art. A model asked to *paint* is being asked to produce a high-dimensional artefact to an underspecified brief, and it will be confidently mediocre at it. A model asked to **edit a text document with a known shape** is doing the thing it is most reliable at.',
    },
    {
      type: 'p',
      text: 'So the agent never touches the canvas. It reads the document and returns a patch — addressed, bounded, with a sentence about why. The patch passes ten validation gates and is applied to a *clone* before anyone sees it, so a malformed proposal cannot corrupt the artwork it was proposing against. What renders is a preview over the current state, and it lands only when someone accepts it.',
    },
    {
      type: 'quote',
      text: 'Rejecting it has to cost nothing. A suggestion you cannot cheaply refuse is not a suggestion.',
    },
    {
      type: 'h2',
      text: 'Where it does not work',
    },
    {
      type: 'p',
      text: 'The honest part. A Phase 0 test scored **0 of 9**: every proposal was valid, applied cleanly, and could be read as a diff — and not one was a change an artist would have kept. The README says it plainly, which is unusual enough to be worth repeating: *the AI produces valid edits that are not good edits.*',
    },
    {
      type: 'p',
      text: 'That is a useful failure rather than an embarrassing one, because it separates two problems that look like one. **Reviewable** is solved. **Good** is not, and it was never going to be solved by the same work. Anyone shipping an AI feature is solving one of those two and it is worth knowing which.',
    },
    {
      type: 'h3',
      text: 'The bit that was actually hard',
    },
    {
      type: 'p',
      text: 'Addressing. A pixel has coordinates; a *region worth talking about* — a cap, a highlight, an outline — does not. Inventing stable names for parts of a drawing the author never named is most of the problem, and bounds-plus-layer is a coarse answer that is at least honest about being coarse.',
    },
    {
      type: 'p',
      text: 'And undo. One gesture is one step, which sounds obvious until a drag across forty cells, an agent patch of four hundred, and a preview that was never accepted all have to be one step, one step, and no step at all.',
    },
  ],
};
