import dynamic from 'next/dynamic';
import type { Block } from '@/content/works/_types';
import { SpecTable } from '@/components/ui/SpecTable';
import { CaseBoard } from './CaseBoard';
import { CodeBlock } from './CodeBlock';
import { RichText } from './RichText';
import s from './CaseBlocks.module.css';

/**
 * The composable block stack. `30-page-specs.md` §`/works/[slug]`, section 2.
 *
 * Eight types, and the author picks the sequence per work. The spec's rhythm
 * rule — *"never more than two prose blocks in a row without a visual"* — is a
 * rule about the **content**, not about this renderer, so it lives with the
 * content in `content/works/<slug>.ts` and `blockRhythm()` below reports on it
 * rather than enforcing it. A renderer that silently refused to draw a third
 * paragraph would be a very confusing thing to debug.
 *
 * ── The slider is the only client component here ─────────────────────────
 *
 * Everything else is server-rendered HTML with no JavaScript attached: images,
 * prose, a table, a pre. The Embla carousel is `dynamic`ally imported so that
 * the eleven case studies without a slider never download it — about 6KB that
 * would otherwise sit in the shared chunk for one block type.
 */
const CaseSlider = dynamic(() => import('./CaseSlider').then((m) => m.CaseSlider));

export function CaseBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className={s.stack}>
      {blocks.map((block, i) => (
        <BlockView key={`${block.type}-${i}`} block={block} index={i} />
      ))}
    </div>
  );
}

function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    /* 7/12 of the container, per the spec. The measure matters more than the
       fraction does — 7/12 of 80rem is about 46rem, which lands a line at
       roughly 75 characters at --t-p. */
    case 'prose':
      return (
        <div className={s.prose}>
          {block.heading ? (
            <h2 data-t="h3" className={s.heading}>
              {block.heading}
            </h2>
          ) : null}
          <RichText body={block.body} className={s.body} />
        </div>
      );

    case 'board':
      return <CaseBoard items={block.items} caption={block.caption} />;

    case 'slider':
      return <CaseSlider items={block.items} label={`Gallery ${index + 1}`} />;

    /* §2: "large pull quote (--t-p-big), 1px left rule". */
    case 'quote':
      return (
        <figure className={s.quote}>
          <blockquote className={s.quoteBody}>
            <p data-t="p-big">{block.text}</p>
          </blockquote>
          {block.attribution ? (
            <figcaption data-t="label" className={s.quoteAttribution}>
              {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      );

    case 'spec':
      return (
        <div className={s.specBlock}>
          <SpecTable rows={block.rows} />
        </div>
      );

    case 'code':
      return <CodeBlock source={block.source} lang={block.lang} caption={block.caption} />;
  }
}

/**
 * Reports the spec's rhythm rule rather than enforcing it: the longest run of
 * consecutive prose blocks. Three or more breaks §2.
 *
 * Used by `tools/verify/behaviour.case.ts`, which is where a content rule
 * belongs — a check that runs over all twelve bodies at once and names the ones
 * that drift, instead of twelve authors each remembering.
 */
export function longestProseRun(blocks: Block[]): number {
  let run = 0;
  let worst = 0;
  for (const block of blocks) {
    run = block.type === 'prose' ? run + 1 : 0;
    if (run > worst) worst = run;
  }
  return worst;
}
