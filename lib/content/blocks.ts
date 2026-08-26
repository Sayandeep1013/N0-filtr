import type { Block } from '@/content/works/_types';

/**
 * Facts about a case-study body that are true without rendering it.
 *
 * A plain module with no React and no CSS import, which is the whole reason it
 * is not in `components/case/CaseBlocks.tsx` where it started. `verify` runs
 * under tsx, and tsx cannot load a `.module.css` — importing the renderer to
 * reach one pure function took the harness down with
 * `ERR_UNKNOWN_FILE_EXTENSION`. Content rules belong next to the content.
 */

/**
 * The longest run of consecutive prose blocks. `30-page-specs.md` §2:
 * *"never more than two prose blocks in a row without a visual."*
 *
 * Reported rather than enforced. A renderer that silently refused to draw a
 * third paragraph would be a very confusing thing to debug, and this is a rule
 * about what was written, not about what the component can do — so
 * `tools/verify/behaviour.case.ts` runs it over all twelve bodies at once and
 * names the ones that drift.
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
