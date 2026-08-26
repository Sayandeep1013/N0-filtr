import type { Work } from './_types';

/**
 * 04 · ReIN Bot. `40-content-model.md` §2.
 *
 * ⚠️ The only work with no imagery in its repo at all. `01-PHASES.md` T10.3
 * marks capturing it as a priority for exactly that reason.
 */
export const reinBot: Work = {
  slug: 'rein-bot',
  title: 'ReIN Bot',
  order: 4,
  thesis: 'A free tier can host realtime multiplayer.',
  summary:
    'Guess the anime from its opening — multiplayer party game with server-side fuzzy answer matching, curated 20s clips, and an all-free-tier stack.',
  services: ['Product Design', 'Engineering'],
  tools: ['PostgreSQL', 'Supabase', 'FFmpeg', 'GitHub Actions'],
  industries: ['Realtime'],
  year: 2026,
  status: 'live',
  links: { live: 'https://sayandeep1013.github.io/Rein-Bot', repo: 'https://github.com/Sayandeep1013/Rein-Bot' },
  accent: { light: '#DE54AB', dark: '#A31F72' },
  invertsPage: false,
  card: { width: 'half', poster: '/media/works/rein-bot.webp' },
  blocks: [],
};
