import type { Work } from './_types';

/** 02 · CanVas. `40-content-model.md` §2. */
export const coCanvas: Work = {
  slug: 'co-canvas',
  title: 'CanVas',
  order: 2,
  thesis: 'A URL is the whole account system.',
  summary:
    'Realtime collaborative rooms pairing a shared block-editor document with a shared Excalidraw canvas — join by room name, no accounts, synced live via Yjs over a Cloudflare Worker.',
  services: ['Product Design', 'Engineering'],
  tools: ['TypeScript', 'Yjs', 'Cloudflare Workers', 'WebSockets'],
  industries: ['Realtime', 'Dev Tools'],
  year: 2026,
  status: 'live',
  links: { live: 'https://co-canvas-web.vercel.app', repo: 'https://github.com/Sayandeep1013/co-canvas' },
  accent: { light: '#E75D23', dark: '#973911' },
  invertsPage: false,
  card: { width: 'half', poster: '/media/works/co-canvas.webp' },
  blocks: [],
};
