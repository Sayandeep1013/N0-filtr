import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tally, type SectionResult } from './types';

const ICON = { pass: '✅', fail: '❌', pending: '⏳', info: 'ℹ️' } as const;

function git(cmd: string, fallback: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

function summaryLine(s: SectionResult): string {
  const t = tally(s.results);
  if (s.name === 'visual') {
    const state = s.judgement ? '⚠️ reviewed by agent — see judgement' : '❌ NO AGENT JUDGEMENT RECORDED';
    return `${s.name.padEnd(7)} ${state}`;
  }
  const icon = t.failed > 0 ? '❌' : t.pendingCount > 0 ? '⚠️' : '✅';
  const owed = t.pendingCount > 0 ? `  (${t.pendingCount} pending, owed by later phases)` : '';
  return `${s.name.padEnd(7)} ${icon} ${t.passed}/${t.total}${owed}`;
}

export function renderReport(sections: SectionResult[], phase: string): string {
  const when = new Date().toISOString();
  const sha = git('rev-parse --short HEAD', 'unknown');
  const branch = git('rev-parse --abbrev-ref HEAD', 'unknown');

  const lines: string[] = [];
  lines.push('# Verification report');
  lines.push(`Run: ${when} · Phase ${phase} · commit \`${sha}\` · branch \`${branch}\``);
  lines.push('');
  lines.push('## Summary');
  lines.push('```');
  for (const s of sections) lines.push(summaryLine(s));
  lines.push('```');
  lines.push('');

  for (const s of sections) {
    lines.push(`## ${s.name}`);
    lines.push('');
    if (s.name === 'visual') {
      lines.push('Contact sheet: `tools/verify/output/contact-sheet.html`');
      lines.push('');
      lines.push(
        `**Agent judgement:** ${
          s.judgement ??
          '_none recorded — this check has not been performed. Open the contact sheet, ' +
            'look at it, and record a specific judgement in visual.config.ts._'
        }`,
      );
      lines.push('');
    }
    for (const r of s.results) {
      const bits = [ICON[r.status], r.label];
      if (r.status === 'fail') bits.push(`— expected ${r.expected}, got ${r.actual}`);
      else if (r.actual) bits.push(`= ${r.actual}`);
      lines.push(bits.join(' '));
    }
    if (s.notes?.length) {
      lines.push('');
      for (const n of s.notes) lines.push(`> ${n}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function writeReport(markdown: string, path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, markdown, 'utf8');
}

export const REPORT_PATH = join(process.cwd(), 'tools', 'verify', 'output', 'report.md');
