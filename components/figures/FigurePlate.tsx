import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import './iso.css';
import s from './FigurePlate.module.css';

/**
 * The card an isometric figure sits in. `[new]` — ours, not tonik's. D-064.
 *
 * ── Why a card ────────────────────────────────────────────────────────────
 *
 * The figures are drawings of instruments, and this site already has a way of
 * presenting a drawing: the specimen plate (D-059) — a ruled mount, mono
 * marginalia, nothing bleeding to the edge. The card is that plate's sibling:
 * `Fig 01` and a title on the top rail, the interaction hint and a live readout
 * on the bottom one, words kept out of the drawing itself.
 *
 * ── What is server and what is client ─────────────────────────────────────
 *
 * Everything here is server-rendered, including the SVG, which is a string
 * built offline by `tools/figures/` and never shipped as JavaScript. `stage` is
 * the one client component: it wraps the SVG and moves the few parts that move.
 * It finds the readout through `[data-readout]` on this figure.
 *
 * `data-trail-ignore`: the figure answers the pointer, so the cursor trail
 * (D-063) stays off it.
 */

export interface FigureKey {
  mark: 'lit' | 'raised' | 'dim';
  label: string;
}

export function FigurePlate({
  fig,
  title,
  hint,
  hintTouch,
  readout,
  stage,
  keys = [],
  caption,
  className,
}: {
  fig: string;
  title: string;
  hint: string;
  /** What the hint says where there is no hover — below 992px. */
  hintTouch?: string;
  readout: string;
  stage: ReactNode;
  keys?: FigureKey[];
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cx('nf-fig', s.figure, className)} data-trail-ignore="">
      <div className={s.plate}>
        <span aria-hidden="true" className={cx(s.corner, s.fig)} data-t="label-sm">
          {fig}
        </span>
        <span aria-hidden="true" className={cx(s.corner, s.title)} data-t="label-sm">
          {title}
        </span>
        <span aria-hidden="true" className={cx(s.corner, s.hint)} data-t="label-sm">
          <span className={hintTouch ? s.hintWide : undefined}>{hint}</span>
          {hintTouch && <span className={s.hintTouch}>{hintTouch}</span>}
        </span>
        <span className={cx(s.corner, s.readout)} data-t="label-sm" data-readout="">
          {readout}
        </span>
        <span aria-hidden="true" className={cx(s.cross, s.tl)} />
        <span aria-hidden="true" className={cx(s.cross, s.tr)} />
        <span aria-hidden="true" className={cx(s.cross, s.bl)} />
        <span aria-hidden="true" className={cx(s.cross, s.br)} />
        {stage}
      </div>
      {(keys.length > 0 || caption) && (
        <figcaption className={s.legend}>
          {keys.length > 0 && (
            <span className={s.keys}>
              {keys.map((key) => (
                <span key={key.label} className={s.key} data-t="label-sm">
                  <svg className={s.swatch} data-mark={key.mark} viewBox="0 0 16 10" aria-hidden="true">
                    <path d="M2 4.5 8 1.5 14 4.5 14 6 8 9 2 6Z" />
                    <path className={s.crease} d="M2 4.5 8 7.5 14 4.5" />
                  </svg>
                  {key.label}
                </span>
              ))}
            </span>
          )}
          {caption && (
            <span className={s.caption} data-t="p-sm">
              {caption}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
