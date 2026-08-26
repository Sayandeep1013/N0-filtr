'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE } from '@/lib/motion/tokens';
import type { Work } from '@/content/works/_types';
import { CaseImage } from './CaseImage';
import { IconCircle } from '@/components/ui/IconCircle';

import s from './NextWork.module.css';

/**
 * `<NextWork />`. `30-page-specs.md` §3: *"full-bleed next-project card, accent
 * crossfading to the next."*
 *
 * ── What crossfades, and what it means ───────────────────────────────────
 *
 * The page's `--accent` is the *current* work's. As this card scrolls into
 * view, that variable is tweened toward the **next** work's accent, so by the
 * time the visitor reaches the link the page has already changed colour to the
 * one they are about to land on. Scroll back up and it returns. It is the same
 * `.7s` value §2 gives for the mount crossfade, run on a scrub instead of a
 * clock, which is why `DUR.slower` appears here as the tween duration rather
 * than as a scrub setting — the trigger toggles it, it does not scrub it.
 *
 * A scrubbed version was tried first and is wrong: scrubbing means the colour
 * sits at some arbitrary blend of the two whenever the visitor stops, and a
 * half-mixed accent looks like a rendering bug rather than a transition.
 *
 * ── One trigger, and it is registered ────────────────────────────────────
 *
 * Phase 5's lesson, paid for twice: `ScrollTrigger.refresh()` in a cleanup
 * walks `_triggers` while React is shrinking it, and Fast Refresh turns that
 * into `curTrigger is undefined`. `useGSAP` reverts the context and the trigger
 * dies with it — nothing here refreshes anything.
 *
 * ── The variable is set on the element, not the document ─────────────────
 *
 * `gsap.to(root, { '--accent': … })` writes an inline custom property on this
 * section. Setting it on `<html>` from here would fight `<CaseStudy>`, which
 * owns the page-level value and resets it on unmount — two owners for one
 * variable is how a colour survives a navigation it should not have survived.
 * Everything inside this card reads the local one, which shadows the page's.
 *
 * `from` is passed rather than read back off the cascade for the same reason a
 * tween needs it: GSAP interpolates two *colours*, and the computed value of
 * `--accent` at this point is the string `var(--accent-page)` on some browsers
 * and a resolved hex on others. Handing it both endpoints removes the question.
 */
export function NextWork({ next, from }: { next: Work; from: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      gsap.set(el, { '--accent': from });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'top 30%',
        onEnter: () => tint(el, next.accent.dark),
        onLeaveBack: () => tint(el, from),
      });
    },
    { scope: root, dependencies: [next.slug, from] },
  );

  return (
    <section ref={root} className={s.next} aria-labelledby="next-work-title">
      {/* The loader sweeps up in the *next* work's colour — T6.7. */}
      <Link href={`/works/${next.slug}`} className={s.link} data-accent-ink={next.accent.light}>
        {/* Copy beside the picture, not over it. D-034: the first version laid
            the title across a full-bleed screenshot, which is the same collision
            the plate exists to stop — and it made the title's legibility depend
            on whatever happened to be in that corner of the next work's UI. */}
        <div className={s.copy}>
          <span data-t="label" className={s.label}>
            Next project
          </span>
          <h2 id="next-work-title" data-t="h2" className={s.title}>
            {next.title}
          </h2>
          <p data-t="p" className={s.thesis}>
            {next.thesis}
          </p>
          <IconCircle size="cta" className={s.icon} />
        </div>

        <div className={s.media}>
          {next.card.poster ? (
            <CaseImage
              src={next.card.poster}
              alt=""
              sizes="(max-width: 991px) 100vw, 55vw"
              ratio="16 / 10"
              className={s.image}
            />
          ) : (
            <div className={s.blank} aria-hidden="true" />
          )}
          {/* The accent's largest appearance on the page, and the element the
              crossfade is actually visible on. Multiply keeps the screenshot
              underneath readable — a flat accent panel at any alpha strong
              enough to read as colour buries it. */}
          <span className={s.tint} aria-hidden="true" />
        </div>
      </Link>
    </section>
  );
}

function tint(el: HTMLElement, colour: string) {
  gsap.to(el, { '--accent': colour, duration: DUR.slower, ease: EASE.inOut, overwrite: true });
}
