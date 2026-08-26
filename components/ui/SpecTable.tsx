import s from './SpecTable.module.css';

/**
 * The spec table. `20-components-and-motion.md` §8 — **the most reused
 * component on the site.** Four places, identical construction: the work
 * hover sheet, the case-study hero, the service hero, and the accordion's
 * inverted right panel.
 *
 * ── One measured correction to §8 ──────────────────────────────────────────
 *
 * §8 gives `grid-template-columns: 4fr 8fr`. Their `project-item_table-item`
 * computes to **`1fr 1fr`** with a `12.3375px` column gap — 0.75rem, the tight
 * gap, not the 1.25rem section gap — and `padding: 0 0 0.5rem` above a
 * `rgba(59,59,59,.3)` bottom hairline. Read off their live DOM. The spec's
 * ratio is kept available behind a prop rather than deleted, so phase 6 can
 * measure the case-study hero's own table instead of inheriting an assumption
 * in either direction. See I-037.
 *
 * ── Values are lists, always ───────────────────────────────────────────────
 *
 * §8: "Values are always a plain vertical list — never comma-separated, never
 * chips." That is why `value` is `string[]` and not `string`. A comma-joined
 * value would read fine and would be the wrong component.
 *
 * ── Inversion ──────────────────────────────────────────────────────────────
 *
 * §8: "On inverted surfaces the colours swap via the `--text-alternate` pair;
 * no separate component." `invert` does exactly that and nothing else — the
 * geometry is identical, which is the whole point of it being one component.
 *
 * It is a `<dl>` because that is what it is: keys and their values. The rows
 * are `<div>`s inside it, which is valid in HTML5 and is what lets each row own
 * its own two-track grid.
 */
export interface SpecRow {
  key: string;
  value: string[];
}

export function SpecTable({
  rows,
  invert = false,
  ratio = 'even',
  className,
}: {
  rows: SpecRow[];
  /** Dark text and a dark hairline, for a light ground. */
  invert?: boolean;
  /** `'even'` is theirs (1fr 1fr); `'key-narrow'` is §8's written 4fr 8fr. */
  ratio?: 'even' | 'key-narrow';
  className?: string;
}) {
  const classes = [
    s.spec,
    invert ? s.invert : '',
    ratio === 'even' ? s.even : s.keyNarrow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <dl className={classes} data-spec>
      {rows.map((row) => (
        <div key={row.key} className={s.row}>
          <dt className={s.key} data-t="label">
            {row.key}
          </dt>
          <dd className={s.value}>
            {row.value.map((v) => (
              <span key={v} data-t="p-sm" className={s.item}>
                {v}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
