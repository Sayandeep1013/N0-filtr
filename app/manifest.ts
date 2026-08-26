import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/content/site';

/**
 * The web app manifest exists mainly so the 512px mark that
 * `50-brand-and-3d.md` §4 asks for has a consumer. An unreferenced 512 file is
 * dead weight; this is what makes it the thing it was specced to be.
 *
 * `theme_color` and `background_color` are the page ground, so an installed
 * shell opens on `--black` rather than flashing white.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#212121',
    theme_color: '#212121',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
