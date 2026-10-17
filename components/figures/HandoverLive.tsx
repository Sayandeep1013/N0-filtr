'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import s from './Stage.module.css';

/**
 * The stage of /about's Fig. 01 — a focusable slider around the server-rendered
 * SVG. D-064. The motion itself is in `handoverMotion.ts`, imported when this
 * mounts, so its code is a chunk of its own rather than part of the /about
 * page bundle that `/` prefetches (`verify:budget` counts prefetches).
 */
export function HandoverLive({
  children,
  label,
  valueText,
}: {
  children: ReactNode;
  label: string;
  valueText: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let alive = true;
    import('./handoverMotion').then((m) => {
      if (alive && root.current) stop = m.run(root.current);
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
      {children}
    </div>
  );
}
