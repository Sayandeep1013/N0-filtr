/**
 * The work schema. `40-content-model.md` §1, verbatim.
 *
 * Content lives in the repo as typed modules — no CMS. One file per work in
 * this directory, collected by `lib/content/works.ts`.
 */

export interface Media {
  src: string;
  alt: string;
  caption?: string;
  /**
   * The aspect box, as a CSS `aspect-ratio` value. Defaults to `16 / 10`,
   * which is what `scripts/capture.mjs` shoots and therefore what most of these
   * are.
   *
   * It exists because a **crop** is not a capture: a detail lifted out of a UI
   * panel has whatever shape the panel had, and forcing it into 16:10 either
   * cuts the content or floats it in dead space. Authored per image rather than
   * derived, so the box is reserved before the file lands and the page does not
   * relayout as it arrives.
   */
  ratio?: string;
}

export type Block =
  | { type: 'prose'; heading?: string; body: string }
  /**
   * The board. `30-page-specs.md` §2 listed three separate visual blocks —
   * `visual-full`, `visual-2up` and `visual-bleed` — and all three are now this
   * one, because all three were the same instruction with a different width and
   * because Sayandeep asked for the case studies to show *several* pictures
   * arranged together rather than one at a time. See D-035.
   *
   * Two to five images. `components/case/CaseBoard.tsx` composes them onto a
   * twelve-column plate and animates them in; the author supplies pictures, not
   * a layout, which is the property that keeps twelve case studies looking like
   * one site.
   */
  | { type: 'board'; items: Media[]; caption?: string }
  | { type: 'slider'; items: Media[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'spec'; rows: { key: string; value: string[] }[] }
  | { type: 'code'; lang: string; source: string; caption?: string };

/**
 * How wide the card sits in the twelve-column works grid.
 *
 * `30-page-specs.md` §2 gives the mix as half ×8, wide ×3, full ×1, and
 * `20-components-and-motion.md` §5 gives the spans: half is 6/12, wide is 8/12,
 * full is 12/12. Where each one *sits* is authored separately — see
 * `lib/content/works.ts`, `WORKS_LAYOUT`.
 */
export type CardWidth = 'half' | 'wide' | 'full';

export interface Work {
  slug: string;
  title: string;
  /** Grid and reading order. `40-content-model.md` §2's `#` column. */
  order: number;
  /** The one-line "constraint it breaks". */
  thesis: string;
  /** 1–2 sentences, shown on the card. */
  summary: string;
  services: string[];
  tools: string[];
  industries: string[];
  year: number;
  /** Replaces tonik's LOCATION row in the spec table. */
  status: 'live' | 'archived' | 'in-progress';
  links: { live?: string; repo: string; package?: string };
  /** Sampled from the project, contrast-corrected. */
  accent: { light: string; dark: string };
  /** true → the case-study page uses `accent.light` as its ground. */
  invertsPage: boolean;
  card: {
    width: CardWidth;
    /**
     * The 1× poster, 1440 wide. Empty for the four works with no live deploy,
     * and the card then draws a deterministic accent cover rather than a broken
     * image — see `components/works/WorkCover.tsx` and I-035.
     *
     * `npm run capture && npm run optimise` produces these. The 2× is derived
     * from the same name (`<slug>@2x.webp`) rather than stored, because a
     * second field is a second thing to forget: a poster without its retina
     * pair would silently serve a 1× on every retina screen, which is most of
     * them, and nothing would report it.
     */
    poster: string;
    reel?: string;
  };
  /** The case-study body. Phase 6 builds the renderer; phase 10 writes eleven. */
  blocks: Block[];
}
