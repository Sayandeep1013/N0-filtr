'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { EASE, IX2_EASE } from '@/lib/motion/tokens';
import { cx } from '@/lib/cx';
import s from './ServiceNav.module.css';

/**
 * `<ServiceNav />`. `20-components-and-motion.md` §17, and §21.7 for the filter.
 *
 * ```
 * [01] Product Design  [02] Branding  [03] Websites  [04] Creative Dev  [05] Engineering
 *                                                       FILTER BY INDUSTRY ▾
 * border-bottom: var(--hairline)
 * ```
 *
 * Active item `--white`, the rest `--text-secondary`; the numerals are
 * `--t-label-sm` superscripts. §17 gives all of that literally.
 *
 * ── The numerals are generated ───────────────────────────────────────────
 *
 * `[01]` through `[05]` come from the index, never from the content. It is the
 * same rule §7 states for the FAQ — *"numerals generated, never authored"* — and
 * the reason is the same: a hand-written `[03]` survives a reorder and starts
 * lying, silently, on a page nobody re-reads.
 *
 * ── The filter is optional and the nav does not own it ───────────────────
 *
 * `/works` has a filter and no active item; a service page has an active item
 * and a filter; an industry page has neither. So `items` and `filter` are
 * separate props and either can be absent — the nav renders the rule and
 * whatever it was given.
 *
 * State lives with whoever is filtering (`app/works/page.tsx`), because the
 * result of the filter is a grid this component cannot see.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface FilterConfig {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Shown for the "everything" option. */
  allLabel?: string;
}

export function ServiceNav({
  items,
  activeHref,
  filter,
  className,
}: {
  items?: NavItem[];
  activeHref?: string;
  filter?: FilterConfig;
  className?: string;
}) {
  return (
    <nav className={cx(s.nav, className)} aria-label="Section">
      <div className="padding-global">
        <div className="container-large">
          <div className={s.row}>
            {items && items.length > 0 ? (
              <ul className={s.items}>
                {items.map((item, i) => {
                  const active = item.href === activeHref;
                  return (
                    <li key={item.href} className={s.item}>
                      <Link
                        href={item.href}
                        className={cx(s.link, active && s.active)}
                        aria-current={active ? 'page' : undefined}
                      >
                        {/* Generated, never authored. */}
                        <sup data-t="label-sm" className={s.numeral}>
                          [{String(i + 1).padStart(2, '0')}]
                        </sup>
                        <span data-t="label">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <span />
            )}

            {filter ? <FilterDropdown {...filter} /> : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * The industry filter. §21.7 [ix2 `a-6`/`a-7`]:
 *
 * ```
 * open  .filter-dropdown_list  y 20%→0%, opacity 0→1, 500ms inOutQuad
 *                              chevron rotate → 0°
 * close reverse
 * ```
 *
 * The chevron's resting state is `180°` and it rotates **to** 0 on open, which
 * is theirs and is the opposite of the obvious reading — a chevron that points
 * up when the list is closed. Transcribed rather than corrected.
 *
 * A real `<button>` with `aria-expanded`, and the options are real buttons in a
 * list: this is a filter, not a `<select>`, and a listbox role would promise
 * keyboard semantics that a five-item facet does not need. Escape closes it and
 * returns focus, which is the part people actually miss.
 */
function FilterDropdown({ label, options, value, onChange, allLabel = 'All' }: FilterConfig) {
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const list = listRef.current;
      const chevron = chevronRef.current;
      if (!list || !chevron) return;

      const tl = gsap.timeline({ paused: true });
      tl.set(list, { display: 'block' })
        .fromTo(
          list,
          { yPercent: 20, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5, ease: IX2_EASE.inOutQuad },
          0,
        )
        .fromTo(chevron, { rotate: 180 }, { rotate: 0, duration: 0.5, ease: EASE.inOut }, 0);

      timeline.current = tl;
      /* No cleanup: the context owns the timeline. See I-051. */
    },
    { scope: root },
  );

  useEffect(() => {
    const tl = timeline.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
    } else {
      /* Reverses run faster — the site-wide rule, at the panel scale. */
      tl.timeScale(1.2).reverse();
    }
  }, [open]);

  /* Escape, and a click anywhere else. Both close it; only Escape returns
     focus, because a click has already put focus wherever it landed. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  const choose = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={root} className={s.filter}>
      <button
        ref={buttonRef}
        type="button"
        className={s.trigger}
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
      >
        <span data-t="label">{value ?? label}</span>
        <svg
          ref={chevronRef}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={s.chevron}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <ul ref={listRef} className={s.list}>
        <li>
          <button
            type="button"
            className={cx(s.option, value === null && s.optionActive)}
            onClick={() => choose(null)}
          >
            <span data-t="label">{allLabel}</span>
          </button>
        </li>
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              className={cx(s.option, value === option && s.optionActive)}
              onClick={() => choose(option)}
            >
              <span data-t="label">{option}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
