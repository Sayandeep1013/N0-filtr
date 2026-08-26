import Link from 'next/link';
import { NAV_LINKS } from '@/lib/content/site';
import s from './not-found.module.css';

/**
 * The 404. `01-PHASES.md` T12.1 — brought forward from phase 12.
 *
 * ── Why it exists now rather than in phase 12 ─────────────────────────────
 *
 * The site is deployed for the team to look at, and **four of the five links in
 * the navbar do not resolve yet**: `/works` is phase 7, `/about` is phase 8,
 * `/blog` is phase 9, `/services/[slug]` is phase 7. Anyone clicking one gets a
 * bare framework 404, which reads as *the site is broken* rather than as *that
 * page has not been built*. Those are very different messages to send someone
 * you have asked to review your work.
 *
 * So it says which it is. The routes below are read from `NAV_LINKS` rather
 * than listed here, so a section that ships stops being described as pending
 * without anyone remembering to come back — and the sentence is written to be
 * true either way, for a genuine typo as much as for an unbuilt section.
 *
 * ── The motion ────────────────────────────────────────────────────────────
 *
 * T12.1 specifies a blur reveal — `blur(24px) → 0` after `.5s`. It is done in
 * **CSS, not GSAP**: this page has no other motion, and pulling the whole
 * animation runtime onto a route whose only job is to apologise would be a
 * strange thing to spend the JS budget on. A keyframe honours
 * `prefers-reduced-motion` through the global reset in `global.css`, which
 * flattens every animation to 0.01ms.
 */
export default function NotFound() {
  return (
    <div className={`${s.page} padding-global`}>
      <div className="container-large">
        <div className={s.inner}>
          <p className={s.code} data-t="label">
            404
          </p>

          <h1 className={s.heading} data-t="h1">
            Not here.
          </h1>

          <p className={s.lead} data-t="p-big">
            Either this address is wrong, or the section is still being built. Four of the five
            things in the menu above are — the studio is putting itself together in public.
          </p>

          <ul className={s.routes}>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className={s.route}>
                <span data-t="label" className={s.routePath}>
                  {link.href}
                </span>
                <span data-t="label" className={s.routeState}>
                  in progress
                </span>
              </li>
            ))}
          </ul>

          <Link href="/" className={s.home} data-t="label">
            Back to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
