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
}

export type Block =
  | { type: 'prose'; heading?: string; body: string }
  | { type: 'visual-full'; src: string; alt: string; caption?: string }
  | { type: 'visual-2up'; items: [Media, Media] }
  | { type: 'visual-bleed'; src: string; alt: string }
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
     * Phase 10 (T10.1/T10.5) fills these. While `poster` is empty the card
     * draws a deterministic accent cover instead of a broken image — see
     * `components/works/WorkCover.tsx` and I-035.
     */
    poster: string;
    reel?: string;
  };
  /** The case-study body. Phase 6 builds the renderer; phase 10 writes eleven. */
  blocks: Block[];
}
