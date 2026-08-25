'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from '@/lib/content/site';
import { cx } from '@/lib/cx';
import s from './Navbar.module.css';

/**
 * <Navbar /> — docs/spec/20-components-and-motion.md §2.
 *
 * Three behaviours, all of them theirs:
 *
 *  · **is-mini** [src] — a ScrollTrigger on `main`, `1rem top` → `30rem top`.
 *    The class goes on at the *end* of that window and comes off on the way
 *    back through it, so the threshold is 30rem of scroll in both directions.
 *  · **the burger** [src] — a "+" of two 1px strokes. Opening rotates only the
 *    vertical stroke, 90° over .5s, which turns the + into a ×… except it does
 *    not, quite: a 90° vertical stroke lies on top of the horizontal one, so the
 *    glyph becomes a single dash. That is what their code does and what it looks
 *    like on their site.
 *  · **WORKS¹²** — the superscript is bound to the works count, never typed.
 */
export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const vLineRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const { stopScroll, startScroll, isDesktop } = useMotion();

  /* ── is-mini ────────────────────────────────────────────────────────────
     Not inside a matchMedia: the mini bar is not a hover, it is layout, and it
     is wanted at every width. */
  useGSAP(
    () => {
      const nav = navRef.current;
      const main = document.querySelector('main');
      if (!nav || !main) return;

      const trigger = ScrollTrigger.create({
        trigger: main,
        start: '1rem top',
        end: '30rem top',
        onLeave: () => nav.classList.add('is-mini'),
        onEnterBack: () => nav.classList.remove('is-mini'),
      });

      return () => trigger.kill();
    },
    { scope: navRef },
  );

  /* The burger. One tween, .5s, on the vertical stroke only [src]. */
  useGSAP(
    () => {
      if (!vLineRef.current) return;
      gsap.to(vLineRef.current, { rotate: open ? 90 : 0, duration: DUR.mid });
    },
    { scope: navRef, dependencies: [open] },
  );

  /* The panel holds the page still while it is open. `stopScroll` handles the
     reduced-motion case, where there is no Lenis to stop. */
  useEffect(() => {
    if (open) stopScroll();
    else startScroll();
  }, [open, stopScroll, startScroll]);

  /* A route change closes the panel — the link that caused it is inside it. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header ref={navRef} className={cx(s.nav, 'nav')}>
      <div className={cx('padding-global', s.inner)}>
        <Link href="/" className={cx(s.logo, 'nav__logo')} aria-label="No Filter — home">
          <Wordmark />
        </Link>

        <div className={cx(s.menuWrap, open && s.menuOpen, 'nav__menu-wrap')}>
          <nav
            id="nav-menu"
            className={cx(s.menu, 'nav__links')}
            aria-label="Primary"
            /* Below 992 the closed panel is off-screen but still in the DOM;
               `inert` keeps it out of the tab order and out of the a11y tree.
               Above 992 there is no panel — the links are the bar. */
            inert={isDesktop || open ? undefined : true}
          >
            {NAV_LINKS.map(({ label, href, count }) => (
              <Link
                key={href}
                href={href}
                className={cx(s.link, isActive(href) && s.active, 'navbar_link')}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
                {count !== undefined && (
                  <>
                    <span className={s.count} aria-hidden="true">
                      {count}
                    </span>
                    <span className="visually-hidden">{` — ${count} projects`}</span>
                  </>
                )}
              </Link>
            ))}

            <Button variant="inverted" contact ariaHasPopup="dialog" timelineId="button.icon">
              Contact
            </Button>
          </nav>
        </div>

        <button
          type="button"
          className={cx(s.burger, 'nav__burger')}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cx(s.stroke, s.strokeH)} />
          <span ref={vLineRef} className={cx(s.stroke, s.strokeV, 'nav__burger-vline')} />
        </button>
      </div>
    </header>
  );
}
