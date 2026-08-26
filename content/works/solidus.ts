import type { Work } from './_types';

/** 09 · Solidus. `40-content-model.md` §2. */
export const solidus: Work = {
  slug: 'solidus',
  title: 'Solidus',
  order: 9,
  thesis: 'A sideloaded app can still be updated.',
  summary:
    'Real-time multiplayer Bingo on Expo and Supabase — ranked auto-matchmaking, private rooms and bot practice, with a leaderboard tracking wins and win rate.',
  services: ['Product Design', 'Engineering'],
  tools: ['Expo', 'React Native', 'Supabase'],
  industries: ['Mobile', 'Realtime'],
  year: 2026,
  status: 'live',
  links: { repo: 'https://github.com/Sayandeep1013/Solidus' },
  accent: { light: '#1BA755', dark: '#106534' },
  invertsPage: false,
  /* No poster. This one is archived, native or terminal — there is no URL to
     point a browser at, so `scripts/capture.mjs` skips it and the card draws
     its generated accent cover instead. Recording these needs a screen capture
     by hand; see I-035. */
  card: { width: 'half', poster: '' },
  blocks: [],
};
