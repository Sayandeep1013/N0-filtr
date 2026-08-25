'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { MQ } from './tokens';
import { reportMotionState } from './registry';

/**
 * The one place scroll and responsive motion state is owned.
 *
 * Three rules this file exists to enforce, from CLAUDE.md:
 *   · One animation loop. GSAP's ticker drives Lenis, ScrollTrigger and (later)
 *     Matter. There is never a second requestAnimationFrame.
 *   · All hover / parallax / text-reveal is gated at >991px through
 *     gsap.matchMedia — never a raw resize listener.
 *   · prefers-reduced-motion is honoured everywhere. tonik ships none; we do.
 */

interface MotionValue {
  /** null under reduced motion — the page falls back to native scroll. */
  lenis: Lenis | null;
  reducedMotion: boolean;
  /** >991px — hover, parallax, text reveal, works interactions. */
  isDesktop: boolean;
  /** >767px — accordion desktop layout, stack wall is static not a marquee. */
  isAbove767: boolean;
  /** Freeze the page behind a full-screen panel. Safe to call under reduced motion. */
  stopScroll: () => void;
  startScroll: () => void;
}

const MotionContext = createContext<MotionValue | null>(null);

export function useMotion(): MotionValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion must be used inside <MotionProvider>');
  return ctx;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAbove767, setIsAbove767] = useState(false);
  const [, forceLenisRerender] = useState(0);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const active = new Set<string>();

    const publish = () =>
      reportMotionState({
        activeContexts: [...active],
        reducedMotion: active.has(MQ.reduced),
        lenisRunning: lenisRef.current !== null,
        tickerCallbacks: lenisRef.current ? 1 : 0,
      });

    const track = (query: string, on: (v: boolean) => void) => {
      mm.add(query, () => {
        active.add(query);
        on(true);
        publish();
        return () => {
          active.delete(query);
          on(false);
          publish();
        };
      });
    };

    /* ── smooth scroll ─────────────────────────────────────────────────────
       Created only when the visitor has not asked for reduced motion. The
       spec's reduced-motion path calls lenis.destroy(); building it inside a
       matchMedia context gets us that for free, plus correct behaviour if the
       preference is toggled while the page is open.

       Config is docs/spec/10-design-system.md §5 verbatim, less normalizeWheel
       — that option no longer exists in Lenis 1.3. See I-004. */
    mm.add(MQ.noPreference, () => {
      const lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 0.7,
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false, // touch stays native — matches their smoothTouch:false
      });

      lenis.on('scroll', ScrollTrigger.update);

      // THE loop. Nothing else on this site may add a rAF callback.
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      lenisRef.current = lenis;
      forceLenisRerender((n) => n + 1);
      publish();

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef.current = null;
        forceLenisRerender((n) => n + 1);
        publish();
      };
    });

    track(MQ.reduced, setReducedMotion);
    track(MQ.desktop, setIsDesktop);
    track(MQ.above767, setIsAbove767);

    return () => {
      mm.revert();
    };
  }, []);

  const stopScroll = useCallback(() => {
    lenisRef.current?.stop();
    // Under reduced motion there is no Lenis, so freeze the document directly.
    if (!lenisRef.current) document.documentElement.style.overflow = 'hidden';
  }, []);

  const startScroll = useCallback(() => {
    lenisRef.current?.start();
    if (!lenisRef.current) document.documentElement.style.overflow = '';
  }, []);

  const value = useMemo<MotionValue>(
    () => ({
      lenis: lenisRef.current,
      reducedMotion,
      isDesktop,
      isAbove767,
      stopScroll,
      startScroll,
    }),
    // lenisRef.current is not reactive; forceLenisRerender drives the update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reducedMotion, isDesktop, isAbove767, stopScroll, startScroll, lenisRef.current],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
