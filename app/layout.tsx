import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import 'lenis/dist/lenis.css';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

import { displayFont, monoFont } from './fonts/fonts';
import { MotionProvider } from '@/lib/motion/MotionProvider';

export const metadata: Metadata = {
  title: {
    default: 'No Filter',
    template: '%s — No Filter',
  },
  description: 'A studio for work that does not need softening.',
};

export const viewport: Viewport = {
  themeColor: '#212121',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body>
        <MotionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          {/* Chrome — Loader, Navbar, ContactPanel, Hero3D, Footer — mounts here
              in phase 1. It lives outside <main> so it survives route changes. */}
          <main id="main">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
