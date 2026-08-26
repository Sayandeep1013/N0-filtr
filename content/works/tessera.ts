import type { Work } from './_types';

/** 01 · Tessera. `40-content-model.md` §2. */
export const tessera: Work = {
  slug: 'tessera',
  title: 'Tessera',
  order: 1,
  thesis: 'A drawing is a document an AI can edit.',
  summary:
    'Code-native pixel-art editor — the canvas is a JSON document with an AI editing agent proposing reviewable pixel diffs on top.',
  services: ['Product Design', 'Engineering'],
  tools: ['TypeScript', 'React', 'Canvas', 'LLM APIs'],
  industries: ['AI', 'Creative Coding'],
  year: 2026,
  status: 'live',
  links: { live: 'https://tessera-brown-pi.vercel.app', repo: 'https://github.com/Sayandeep1013/Tessera' },
  accent: { light: '#2595E4', dark: '#125C91' },
  invertsPage: false,
  card: { width: 'full', poster: '/media/works/tessera.webp' },
  blocks: [],
};
