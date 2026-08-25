import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import 'lenis/dist/lenis.css';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

import { displayFont, monoFont } from './fonts/fonts';
import { MotionProvider } from '@/lib/motion/MotionProvider';
import { Loader } from '@/components/chrome/Loader';
import { Navbar } from '@/components/chrome/Navbar';
import { Footer } from '@/components/chrome/Footer';

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
          {/* Chrome lives outside <main> so it survives route changes — the
              loader in particular has to persist across the navigation it is
              covering. Hero3D joins them in phase 2. */}
          <Loader />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
