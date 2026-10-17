'use client';

import { useEffect, useRef } from 'react';
import s from './Stage.module.css';

/**
 * The stage of the 404's figure. D-064.
 *
 * ── Why the drawing is fetched, not server-rendered ───────────────────────
 *
 * The root `not-found` boundary is serialised into *every* page's RSC payload
 * and its client chunk loads on every page. Server-rendered, the 147 KB SVG
 * rode along on the homepage; and the motion code, imported here directly, put
 * 3.5 KB gz on `/` that `verify:budget` caught. So this shell is all that ships
 * everywhere: on mount it imports `deadEndMotion.ts` — the drawing and the
 * motion, one chunk, requested only on a 404 — writes the SVG into a box held
 * at the drawing's aspect ratio, and starts it. Even the resting value text
 * and that ratio come in as props, so this file imports nothing of the model.
 */
export function DeadEndLive({ label, valueText, ratio }: { label: string; valueText: string; ratio: string }) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let alive = true;
    import('./deadEndMotion').then((m) => {
      if (!alive || !root.current || !host.current) return;
      host.current.innerHTML = m.SVG;
      stop = m.run(root.current);
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, []);

  return (
    <div
      ref={root}
      className={s.stage}
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-valuetext={valueText}
    >
      <div ref={host} className={s.svg} style={{ aspectRatio: ratio }} />
    </div>
  );
}
