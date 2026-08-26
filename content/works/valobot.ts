import type { Work } from './_types';

/** 06 · ValoBot. `40-content-model.md` §2. */
export const valobot: Work = {
  slug: 'valobot',
  title: 'ValoBot',
  order: 6,
  thesis: 'A model with no cutoff, if it fetches first.',
  summary:
    'Valorant esports intelligence dashboard — live match, team and player data from VLR.gg plus CYPHER, a Groq-powered conversational analyst grounded in that live context.',
  services: ['Product Design', 'Engineering'],
  tools: ['Next.js', 'TypeScript', 'Groq'],
  industries: ['AI'],
  year: 2026,
  status: 'live',
  links: { live: 'https://valobot.vercel.app', repo: 'https://github.com/Sayandeep1013/ValoBot' },
  accent: { light: '#E4587B', dark: '#AB1C40' },
  invertsPage: false,
  card: { width: 'half', poster: '' },
  blocks: [],
};
