'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, REVERSE_SCALE } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { cx } from '@/lib/cx';
import s from './FaqAccordion.module.css';

/**
 * `<FaqAccordion />`. `20-components-and-motion.md` §7, `01-PHASES.md` T7.5.
 *
 * ```js
 * open:  gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .6 });
 * close: gsap.to(body, { height: 0, duration: .5 });
 * ```
 *
 * ── The numerals are generated, never authored ───────────────────────────
 *
 * §7 states it as a rule and gives their own line for it:
 *
 * ```js
 * head.querySelector('.faq__num').textContent = `[${String(i + 1).padStart(2, '0')}]`;
 * ```
 *
 * So the content files carry questions and answers and nothing else. A
 * hand-written `[03]` survives a reorder and then lies quietly, on a page nobody
 * proof-reads twice.
 *
 * ── `height: auto` is the animation, and it is the awkward part ──────────
 *
 * GSAP can tween to `auto` — it measures the natural height, animates to it and
 * then sets `auto` so the row stays responsive afterwards. That last step is why
 * this cannot be a CSS transition: a row left at a pixel height stops reflowing
 * when the window narrows, and a two-line answer becomes four lines inside a
 * box built for two.
 *
 * ── One row at a time, and reverses run faster ───────────────────────────
 *
 * Opening a row closes whichever was open, the same as `<ServicesAccordion>` in
 * phase 5. Closes run at `REVERSE_SCALE` — the site-wide rule from
 * `CLAUDE.md` non-negotiable 5, and §7's own .6/.5 split says the same thing in
 * different units.
 *
 * ── The markup is a definition list of buttons ───────────────────────────
 *
 * `<dt><button>` and `<dd>`, with `aria-expanded` and `aria-controls`. A FAQ is
 * a list of terms and their definitions and a screen reader already knows how to
 * read one; the buttons are what make it operable without a pointer.
 */
export function FaqAccordion({
  items,
  className,
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const bodies = useRef<(HTMLElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      /* Every panel starts closed, including on a rebuild — `height: 0` is set
         here rather than in CSS so that the one open row keeps its `auto`. */
      bodies.current.forEach((body, i) => {
        if (!body) return;
        gsap.set(body, { height: i === open ? 'auto' : 0 });
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  const toggle = (index: number) => {
    const next = open === index ? null : index;
    const previous = open;
    setOpen(next);

    const close = (i: number | null) => {
      const body = i === null ? null : bodies.current[i];
      if (!body) return;
      if (reducedMotion) {
        gsap.set(body, { height: 0 });
        return;
      }
      gsap.to(body, {
        height: 0,
        duration: DUR.mid / REVERSE_SCALE,
        ease: EASE.inOut,
        overwrite: true,
      });
    };

    if (previous !== null && previous !== next) close(previous);

    if (next === null) {
      close(index);
      return;
    }

    const body = bodies.current[next];
    if (!body) return;
    if (reducedMotion) {
      gsap.set(body, { height: 'auto' });
      return;
    }
    gsap.fromTo(
      body,
      { height: 0 },
      { height: 'auto', duration: DUR.slow, ease: EASE.inOut, overwrite: true },
    );
  };

  return (
    <div ref={root} className={cx(s.faq, className)}>
      <dl className={s.list}>
        {items.map((item, i) => {
          const isOpen = open === i;
          const panelId = `faq-panel-${i}`;
          const headId = `faq-head-${i}`;
          return (
            <div key={item.q} className={cx(s.row, isOpen && s.rowOpen)}>
              <dt className={s.head}>
                <button
                  id={headId}
                  type="button"
                  className={s.button}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                >
                  <sup data-t="label-sm" className={s.numeral}>
                    [{String(i + 1).padStart(2, '0')}]
                  </sup>
                  <span data-t="h4" className={s.question}>
                    {item.q}
                  </span>
                  <span className={cx(s.arrow, isOpen && s.arrowOpen)} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12h15M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={headId}
                className={s.body}
                ref={(el) => {
                  bodies.current[i] = el;
                }}
              >
                <p data-t="p" className={s.answer}>
                  {item.a}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
