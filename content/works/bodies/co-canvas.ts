import type { Block } from '../_types';

/**
 * CanVas's case-study body.
 *
 * Split out of `content/works/co-canvas.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const coCanvasBody: Block[] = [
  {
    type: "prose",
    heading: "Accounts are the tax you pay before the useful part",
    body: "Two people want to think about the same thing at the same time. Between them and that stands a sign-up form, an email confirmation, a workspace, an invite, a permission model and a seat licence. Every one of those exists for a real reason and none of them is the thing anyone came to do.\n\nCo-Canvas removes all of it. **You type a room name to join it; if it does not exist yet, typing it creates it.** The URL is the whole account system — sharing it grants access, presence cursors and all.",
  },
  {
    type: "board",
    caption: "A room is a name. Two surfaces, one document, no sign-up.",
    items: [
      { art: "mosaic/co-canvas-board-1", caption: "The room, from a name" },
      { art: "orbit/co-canvas-board-2", caption: "Presence, live" },
      { art: "strata/co-canvas-board-3", caption: "Two surfaces, one state" },
    ],
  },
  {
    type: "prose",
    heading: "Two surfaces, because one would be a bad version of both",
    body: 'The obvious build is a single canvas that also accepts text. It is obvious and it is wrong, and the README says why in one line: *"Text and flows, canvas is spatial — so cramming both into one editor makes a bad version of each."*\n\nSo a room is a **BlockNote document** and an **Excalidraw canvas**, bound together and synchronised as one. Different people can be on different surfaces at the same time, which turns out to be how pairs actually work — one writing while the other draws, both watching the same room.',
  },
  {
    type: "quote",
    text: "Each room slug maps to a Cloudflare Durable Object holding the Yjs document, so a room survives with zero connected clients.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Sync",
        value: ["Yjs CRDTs", "y-partyserver", "Cloudflare Durable Objects"],
      },
      {
        key: "Surfaces",
        value: [
          "BlockNote document",
          "Excalidraw canvas",
          "Presence cursors",
        ],
      },
      {
        key: "Access",
        value: ["No accounts", "No passwords", "The URL is the grant"],
      },
      {
        key: "Stack",
        value: ["Next.js on Vercel", "Cloudflare Worker", "pnpm workspaces"],
      },
    ],
  },
  {
    type: "slider",
    items: [
      {
        art: "orbit/co-canvas-slide-1",
        caption: "CRDTs mean no merge conflict",
      },
      {
        art: "mosaic/co-canvas-slide-2",
        caption: "The document persists in the DO",
      },
      { art: "iris/co-canvas-slide-3", caption: "Anyone with the link" },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: '**Durable Objects are the design, not the deployment.** A room that has to survive with nobody in it needs somewhere to live, and the choice between "a database row you load and save" and "an object that simply stays" decides the shape of everything above it. Picking the second made presence, persistence and the room lifecycle one problem rather than three.\n\nThe **two-surface binding** was the fiddly part. Yjs handles the merge; what it does not handle is two editors with different ideas about what a document is, sharing one awareness channel so that a cursor on the canvas and a cursor in the text read as the same person.',
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "The trade is stated plainly rather than hidden: **no accounts means no recovery.** Lose the room name and the room is gone, because there is no list of your rooms — there is no you. That is the correct trade for a scratchpad and the wrong one for anything you would be upset to lose, and the product should probably say so louder than it does.\n\nThe roadmap under `docs/` is honest about what is next. This is a working thing rather than a finished one.",
  },
];
