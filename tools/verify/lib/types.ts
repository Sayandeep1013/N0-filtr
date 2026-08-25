export type Status = 'pass' | 'fail' | 'pending' | 'info';

export interface CheckResult {
  status: Status;
  /** One line, written for someone reading the report cold. */
  label: string;
  expected?: string;
  actual?: string;
}

export interface SectionResult {
  name: 'tokens' | 'motion' | 'visual' | 'budget';
  results: CheckResult[];
  /** Free-form notes appended under the section in the report. */
  notes?: string[];
  /** Only `visual` sets this — the mandatory agent judgement. */
  judgement?: string;
}

export const pass = (label: string, actual?: string): CheckResult => ({
  status: 'pass',
  label,
  ...(actual !== undefined ? { actual } : {}),
});

export const fail = (label: string, expected: string, actual: string): CheckResult => ({
  status: 'fail',
  label,
  expected,
  actual,
});

export const pending = (label: string): CheckResult => ({ status: 'pending', label });

export const info = (label: string, actual?: string): CheckResult => ({
  status: 'info',
  label,
  ...(actual !== undefined ? { actual } : {}),
});

export function tally(results: CheckResult[]) {
  return {
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    pendingCount: results.filter((r) => r.status === 'pending').length,
    total: results.filter((r) => r.status !== 'info').length,
  };
}
