import type { PostBlock } from '@/content/posts/_types';
import { CodeBlock } from '@/components/case/CodeBlock';
import { RichText } from '@/components/case/RichText';
import s from './PostBody.module.css';

/**
 * The post body. `30-page-specs.md` §`/blog/[slug]`:
 *
 * ```
 * .post-body   7/12 column
 *   h2 --t-h3 · h3 --t-h5 · p --t-p · blockquote with 1px left rule
 *   figure + mono caption · <pre><code> syntax-highlighted
 * ```
 *
 * Typed blocks rather than MDX — see `content/posts/_types.ts` and D-042.
 *
 * ── Two components it does not own ───────────────────────────────────────
 *
 * `<CodeBlock>` and `<RichText>` are the case studies', reused unchanged.
 * `<CodeBlock>` is where Shiki runs at build time, so the spec's *"Shiki at
 * build time — same visual result, correct tokenisation, zero runtime cost"*
 * is satisfied by the component that already did it rather than by a second
 * one. `<RichText>` brings the rule that matters most: emphasis moves up the
 * palette, never up the weight scale, because the display face on this site is
 * never bolded.
 */
export async function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className={s.body}>
      {blocks.map((block, i) => (
        <Block key={`${block.type}-${i}`} block={block} />
      ))}
    </div>
  );
}

async function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case 'p':
      return <RichText body={block.text} className={s.prose} />;

    case 'h2':
      return (
        <h2 data-t="h3" className={s.h2}>
          {block.text}
        </h2>
      );

    case 'h3':
      return (
        <h3 data-t="h5" className={s.h3}>
          {block.text}
        </h3>
      );

    /* §: "blockquote with 1px left rule". The accent is allowed at that width —
       D-036 keeps it for single lines and small marks. */
    case 'quote':
      return (
        <blockquote className={s.quote}>
          <p data-t="p-big">{block.text}</p>
        </blockquote>
      );

    case 'list':
      return (
        <ul className={s.list}>
          {block.items.map((item) => (
            <li key={item.slice(0, 24)} className={s.listItem}>
              <RichText body={item} className={s.prose} />
            </li>
          ))}
        </ul>
      );

    case 'code':
      return (
        <div className={s.code}>
          <CodeBlock source={block.source} lang={block.lang} caption={block.caption} />
        </div>
      );
  }
}
