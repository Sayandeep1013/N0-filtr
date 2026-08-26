import type { Block } from '../_types';

/**
 * NoteTakerXX's case-study body.
 *
 * Split out of `content/works/notetakerxx.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const notetakerxxBody: Block[] = [
  {
    type: "prose",
    heading: "Notes have coordinates",
    body: "Every note app is a list. Lists are excellent for things that are genuinely sequential and quietly terrible for everything else — because the moment you have twenty notes, the relationship between them is the information, and a list has nowhere to put it.\n\nSo the notes get **coordinates**. An infinite canvas with a dot grid, notes you place where they belong relative to each other, and curved rope lines drawn between the ones that are connected.",
  },
  {
    type: "board",
    caption: "Place, connect, zoom out. The arrangement is the argument.",
    items: [
      { art: "mosaic/notetakerxx-board-1", caption: "A reactive dot grid" },
      {
        art: "orbit/notetakerxx-board-2",
        caption: "Rope curves between notes",
      },
      { art: "strata/notetakerxx-board-3", caption: "Grid-aligned dragging" },
    ],
  },
  {
    type: "prose",
    heading: "Where the spatial part actually lives",
    body: "A note carries its position, dimensions, colour, rotation, content and metadata — so the arrangement is **data, not view state**, and it survives a reload on another machine. That distinction is the whole project: a canvas that forgets where you put things is a drawing, not a document.\n\nDragging is grid-aligned so a board stays legible without anyone tidying it, and the zoom is Excalidraw-style because that is the interaction people already have in their hands.",
  },
  {
    type: "quote",
    text: "Guest notes live in localStorage and stay tied to that browser profile until they are merged into an account.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Canvas",
        value: [
          "Infinite, free-form",
          "Reactive dot grid",
          "Grid-aligned drag",
        ],
      },
      {
        key: "Connections",
        value: [
          "Shift-click to link",
          "Rope-style curves",
          "Client state today",
        ],
      },
      {
        key: "Data",
        value: [
          "Supabase Postgres",
          "Coordinates and rotation stored",
          "RLS on profiles",
        ],
      },
      {
        key: "Stack",
        value: ["Next.js 16", "React 19", "Zustand", "@use-gesture/react"],
      },
    ],
  },
  {
    type: "slider",
    items: [
      {
        art: "orbit/notetakerxx-slide-1",
        caption: "Guest first, account later",
      },
      {
        art: "mosaic/notetakerxx-slide-2",
        caption: "Zoom to the whole board",
      },
      {
        art: "iris/notetakerxx-slide-3",
        caption: "Notes carry their own geometry",
      },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**Guest mode is a data-migration problem wearing a friendly hat.** Letting someone use the thing before signing up means their notes exist in localStorage under no user, and the merge into an account has to happen exactly once, without duplicating and without losing the ones made in the tab that was open at the time.\n\n**Gesture handling on an infinite canvas** is the other quiet cost: pan, zoom, drag-a-note and drag-a-connection all start as a pointer going down, and telling them apart cleanly is most of the interaction code.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "The connections between notes — the rope curves, the thing that makes it spatial rather than just scattered — **currently live in client state for the active session and do not persist to Supabase.** Reload and the notes are where you left them; the lines between them are not.\n\nThat is the next thing, and it is worth naming because it is the gap between what the project demonstrates and what it claims.",
  },
];
