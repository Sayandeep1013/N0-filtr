import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch } from './lib/browser';
import { REPORT_PATH, renderReport, writeReport } from './lib/report';
import { tally, type SectionResult } from './lib/types';
import { checkTokens } from './tokens';
import { checkMotion } from './motion';
import { checkVisual } from './visual';
import { checkBudget } from './budget';
import { startServer, type Server } from './lib/server';

/**
 * `npm run verify` — the gate.
 *
 * One command, one report, non-zero exit on failure. Nothing is handed off
 * without it green and `tools/verify/output/report.md` committed as evidence.
 *
 *   npm run verify                  all four
 *   npm run verify:tokens           one of them
 *   npm run verify -- --keep        leave the server up (debugging the harness)
 */

type CheckName = 'tokens' | 'motion' | 'visual' | 'budget';
const ALL: CheckName[] = ['tokens', 'motion', 'visual', 'budget'];

function currentPhase(): string {
  try {
    const state = readFileSync(join(process.cwd(), 'docs', 'build', 'STATE.md'), 'utf8');
    const m = /\|\s*Current phase\s*\|\s*\*\*(\d+)/.exec(state);
    return m?.[1]?.padStart(2, '0') ?? '??';
  } catch {
    return '??';
  }
}

function parseArgs(argv: string[]): { only: CheckName[]; keep: boolean } {
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const requested = onlyArg?.slice('--only='.length).split(',').filter(Boolean) ?? [];
  const invalid = requested.filter((r) => !ALL.includes(r as CheckName));
  if (invalid.length) {
    console.error(`unknown check(s): ${invalid.join(', ')}. Valid: ${ALL.join(', ')}`);
    process.exit(2);
  }
  return {
    only: requested.length ? (requested as CheckName[]) : ALL,
    keep: argv.includes('--keep'),
  };
}

async function main(): Promise<void> {
  const { only, keep } = parseArgs(process.argv.slice(2));
  const sections: SectionResult[] = [];

  // tokens / motion / visual run against the dev server: the timeline registry
  // and the probe route are development-only by design. budget must run against
  // a production build, because that is the artefact the budget is about.
  const needsDev = only.some((c) => c !== 'budget');
  const needsProd = only.includes('budget');

  const browser = await launch();
  let server: Server | null = null;

  try {
    if (needsDev) {
      console.log('▸ starting dev server…');
      server = await startServer('dev');
      for (const name of only.filter((c) => c !== 'budget')) {
        console.log(`▸ ${name}…`);
        if (name === 'tokens') sections.push(await checkTokens(browser, server.url));
        if (name === 'motion') sections.push(await checkMotion(browser, server.url));
        if (name === 'visual') sections.push(await checkVisual(browser, server.url));
      }
      if (!keep) {
        await server.stop();
        server = null;
      }
    }

    if (needsProd) {
      console.log('▸ production build…');
      const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      if (build.status !== 0) throw new Error('production build failed — fix that before checking budgets');

      console.log('▸ starting production server…');
      server = await startServer('prod');
      console.log('▸ budget…');
      sections.push(await checkBudget(browser, server.url));
      if (!keep) {
        await server.stop();
        server = null;
      }
    }
  } finally {
    await browser.close();
    if (server && !keep) await server.stop();
  }

  const markdown = renderReport(sections, currentPhase());
  writeReport(markdown, REPORT_PATH);

  console.log('\n' + markdown.split('## Summary')[1]?.split('##')[0]?.trim());
  console.log(`\nreport → ${REPORT_PATH.replace(process.cwd(), '.')}`);

  const failed = sections.reduce((n, s) => n + tally(s.results).failed, 0);

  // visual has no automatic verdict; an unrecorded judgement is a failed check,
  // because it means nobody looked. That is the whole point of the check.
  const visual = sections.find((s) => s.name === 'visual');
  const noJudgement = visual !== undefined && !visual.judgement;
  if (noJudgement) {
    console.error(
      '\n✗ visual: no agent judgement recorded. Open tools/verify/output/contact-sheet.html,\n' +
        '  look at it, and set AGENT_JUDGEMENT in tools/verify/visual.config.ts.',
    );
  }

  if (failed > 0) console.error(`\n✗ ${failed} assertion(s) failed.`);
  if (failed > 0 || noJudgement) process.exit(1);
  console.log('\n✓ verify green');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
