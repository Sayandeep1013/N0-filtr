'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR } from '@/lib/motion/tokens';
import type { Work } from '@/content/works/_types';
import { CustomCursor } from './CustomCursor';
import s from './CaseStudy.module.css';

/**
 * The case-study shell. `30-page-specs.md` §`/works/[slug]`,
 * `10-design-system.md` §2 "Accent theming (case studies)".
 *
 * Three jobs, and nothing else — the page's content is passed in as `children`
 * from a **server** component, so all of the hero, the blocks and the footer
 * stay server-rendered even though this wrapper is a client component.
 *
 * ── 1. The accent ────────────────────────────────────────────────────────
 *
 * §2 gives the snippet directly:
 *
 * ```js
 * document.documentElement.style.setProperty('--accent', work.accent.dark);
 * gsap.fromTo(themedEls, { backgroundColor: '#212121' },
 *                        { backgroundColor: work.accent.dark, duration: .7 });
 * ```
 *
 * Both halves are here and they do different things. The custom property is set
 * immediately, so everything that merely *reads* `--accent` — the cursor, the
 * quote's rule, the slider's hover — is correct on the first frame. The `.7s`
 * crossfade then runs on the elements whose **background** is the accent, and
 * only those: they are marked `[data-accent-fill]` rather than enumerated here,
 * so a block added in phase 10 can opt into the crossfade without this file
 * learning about it.
 *
 * The literal `#212121` is the spec's, and it is `--black`. It is written as
 * the token so that a future change to the ground does not leave a crossfade
 * starting from a colour the page no longer uses.
 *
 * ── 2. Cleaning up after itself ──────────────────────────────────────────
 *
 * `--accent` is set on `<html>`, which outlives this page. Leaving it set means
 * the next route — the homepage, a service page — quietly inherits Tessera's
 * blue on every element that reads the token. The cleanup removes the property
 * rather than resetting it to a value, so the cascade falls back to
 * `tokens.css` and there is exactly one place that decides the default.
 *
 * ── 3. Inversion ─────────────────────────────────────────────────────────
 *
 * §2: *"If `work.invertsPage` is true, the ground becomes `work.accent.light`
 * and all text flips to `--text-alternate` — exactly as tonik's Letta page does
 * with `#c9cdd1`."*
 *
 * Implemented, and **no work sets it today**, which is a content judgement
 * rather than an omission. Their Letta accent is `#c9cdd1`, a light grey that
 * works as a page ground. Ours are saturated brand colours sampled from the
 * products — Tessera's light accent is `#2595E4` — and a full page on that
 * ground would be unreadable long before it was tasteful. The branch is here
 * because a work with a paper-coloured light accent is a perfectly reasonable
 * thing for phase 10 to author.
 */
export function CaseStudy({ work, children }: { work: Work; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const html = document.documentElement;
      html.style.setProperty('--accent', work.accent.dark);
      html.style.setProperty('--accent-ink', work.accent.light);
      html.style.setProperty('--accent-ground', work.accent.light);

      /* Scoped to this page's own subtree. A global query would also catch the
         nav and the site footer, which are mounted in the root layout and are
         not part of a case study's theming. */
      const themed = el.querySelectorAll<HTMLElement>('[data-accent-fill]');
      if (themed.length > 0) {
        gsap.fromTo(
          themed,
          { backgroundColor: 'var(--black)' },
          { backgroundColor: work.accent.dark, duration: DUR.slower, ease: 'none' },
        );
      }

      return () => {
        html.style.removeProperty('--accent');
        html.style.removeProperty('--accent-ink');
        html.style.removeProperty('--accent-ground');
      };
    },
    { dependencies: [work.slug, work.accent.dark, work.accent.light] },
  );

  return (
    <div
      ref={root}
      className={work.invertsPage ? `${s.page} ${s.inverted}` : s.page}
      data-case-study={work.slug}
      style={
        work.invertsPage
          ? ({ '--accent-ground': work.accent.light } as React.CSSProperties)
          : undefined
      }
    >
      {children}
      <CustomCursor />
    </div>
  );
}
