import type { Work } from './_types';

/** 12 · DroidDoodle. `40-content-model.md` §2. */
export const droiddoodle: Work = {
  slug: 'droiddoodle',
  title: 'DroidDoodle',
  order: 12,
  thesis: 'A phone runs the model that drives the canvas.',
  summary: 'On-device agentic AI driving a drawing canvas on Android.',
  services: ['Product Design', 'Engineering'],
  tools: ['Kotlin', 'C++', 'on-device LLM'],
  industries: ['AI', 'Mobile'],
  year: 2026,
  status: 'archived',
  links: { repo: 'https://github.com/Sayandeep1013/DroidDoodle' },
  accent: { light: '#A36EE7', dark: '#6F22D3' },
  invertsPage: false,
  card: { width: 'half', poster: '' },
  blocks: [],
};
