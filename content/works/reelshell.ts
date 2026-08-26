import type { Work } from './_types';

/** 08 · ReelShell. `40-content-model.md` §2. */
export const reelshell: Work = {
  slug: 'reelshell',
  title: 'ReelShell',
  order: 8,
  thesis: 'A terminal can be a streaming client.',
  summary: 'Terminal-native streaming service.',
  services: ['Engineering'],
  tools: ['Go', 'TUI', 'mpv'],
  industries: ['Dev Tools'],
  year: 2026,
  status: 'archived',
  links: { repo: 'https://github.com/Sayandeep1013/ReelShell' },
  accent: { light: '#12A5AA', dark: '#086063' },
  invertsPage: false,
  /* No poster. This one is archived, native or terminal — there is no URL to
     point a browser at, so `scripts/capture.mjs` skips it and the card draws
     its generated accent cover instead. Recording these needs a screen capture
     by hand; see I-035. */
  card: { width: 'half', poster: '' },
  blocks: [],
};
