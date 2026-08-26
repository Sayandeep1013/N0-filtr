import { Fragment } from 'react';
import s from './CaseBlocks.module.css';

/**
 * The prose formatter. Paragraphs on a blank line, `**strong**`, `*emphasis*`
 * and `` `code` `` inline. Deliberately about forty lines rather than a
 * markdown dependency: case-study bodies are authored by us, in TypeScript,
 * under a type — the failure modes a real parser exists to survive are not
 * available here.
 *
 * ── Strong is a colour, not a weight ───────────────────────────────────────
 *
 * `CLAUDE.md` non-negotiable 3: *"the display face is never bolded. Hierarchy
 * comes from size and colour only."* A `<strong>` at 600 would be the single
 * most common way that rule gets broken, because every markdown renderer on
 * earth does it by default and nobody reads the CSS afterwards.
 *
 * So emphasis here moves **up the palette instead of up the weight scale**: the
 * body sits at `--text-secondary` and a strong span steps to `--text-primary`.
 * It is the same contrast move the nav makes between its active and inactive
 * items, and on this ground it reads as more emphatic than bold would.
 */

/** `**strong**`, `*em*`, `` `code` `` — in one pass, longest delimiter first. */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function inline(text: string, keyPrefix: string) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className={s.strong}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className={s.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function RichText({ body, className }: { body: string; className?: string }) {
  return (
    <div className={className}>
      {body.split('\n\n').map((paragraph, i) => (
        <p key={paragraph.slice(0, 24)} data-t="p" className={s.paragraph}>
          {inline(paragraph, `p${i}`)}
        </p>
      ))}
    </div>
  );
}
