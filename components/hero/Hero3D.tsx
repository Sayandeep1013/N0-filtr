'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE, MQ } from '@/lib/motion/tokens';
import { useMotion } from '@/lib/motion/MotionProvider';
import { onLoaderCleared } from '@/lib/motion/loaderSignal';
import { reportHeroState } from '@/lib/motion/registry';
import type { ApertureScene } from './apertureScene';
import s from './Hero3D.module.css';

/**
 * The 3D hero's mount, its gating and its lifecycle.
 * docs/spec/50-brand-and-3d.md §2.
 *
 * This file deliberately contains **no `three` import**. The scene lives in
 * `apertureScene.ts` and is reached only through a dynamic `import()` below, so
 * three never enters the initial bundle — `verify:budget`'s FORBIDDEN_IN_INITIAL
 * check enforces exactly that.
 *
 * Mounted once in the root layout, outside `<main>`. React preserves it across
 * navigation, so the WebGL context is created once per session; on non-home
 * routes it fades out and its loop is suspended rather than being unmounted,
 * because unmounting is what would cost a new context.
 */

/**
 * The load-in. §2 gives `scale 0.85 → 1`, `opacity 0 → 1`, `1.2s power3.out`.
 *
 * **Deepened and lengthened on Sayandeep's note** that ours arrived rather than
 * grew. Measured before changing: the specced values were running correctly and
 * were simply not legible — 0.85 to 1 is a 15% move, and `power3.out` spends 60%
 * of its travel in the first fifth of its duration, so the visible entrance was
 * about 250ms of a 15% grow. Sampled at 10ms it was already at 0.919.
 *
 * 0.55 over 1.6s on `power2.out` is a move you can see land: still an ease-out,
 * still settling rather than stopping, but with a tail long enough to read as
 * the object arriving. See I-028.
 */
const REVEAL_FROM_SCALE = 0.55;
const REVEAL_DURATION = 1.6;

/** §2 performance: clamp the pixel ratio. */
const MAX_DPR = 2;

/** The mobile branch: 4 blades, no antialiasing, scroll-driven instead of pointer. */
const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Where the mobile scroll drive is anchored.
 *
 * §2 scrubs it against "the hero section's ScrollTrigger", and the hero section
 * arrives in phase 3. Until it does this falls back to the first viewport of the
 * document, which is the same range the hero will occupy — so the behaviour is
 * right now and stays right when phase 3 marks the real element. See I-020.
 */
const HERO_TRIGGER_SELECTOR = '[data-hero]';

type Mode = 'probing' | 'webgl' | 'fallback';

export function Hero3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ApertureScene | null>(null);

  const { reducedMotion } = useMotion();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [mode, setMode] = useState<Mode>('probing');

  /* ── build the scene ──────────────────────────────────────────────────────
     Runs once. `reducedMotion` is deliberately NOT a dependency: rebuilding the
     renderer on a preference toggle would drop and recreate the WebGL context,
     which is the one thing this component exists to avoid. The preference is
     read at construction for the blade/pose decision and re-read by the ticker
     effect below, which is where it actually matters. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let scene: ApertureScene | null = null;
    let disposed = false;
    let unsubscribeLoader = () => {};

    const mobile = window.matchMedia(MOBILE_QUERY).matches;

    void (async () => {
      const { createApertureScene, hasWebGL } = await import('./apertureScene');

      if (!hasWebGL()) {
        // §2: detected via WebGLRenderingContext presence, not user-agent.
        setMode('fallback');
        reportHeroState({ mode: 'fallback', running: false, triangles: 0 });
        return;
      }
      if (disposed) return;

      scene = createApertureScene(canvas, { mobile, reducedMotion });
      sceneRef.current = scene;
      setMode('webgl');

      /* Dev only, and folded out of production the same way lib/motion/gsap.ts
         exposes its handles: verify:motion's behaviour layer has to read the
         ring's and the blades' rotations apart to assert that the blades
         actually outrun the ring. */
      if (process.env.NODE_ENV === 'development') {
        Object.assign(window, { __HERO_SCENE__: scene });
      }

      const size = host.getBoundingClientRect();
      scene.resize(size.width, size.height, Math.min(window.devicePixelRatio, MAX_DPR));

      if (reducedMotion) {
        /* §2: one frame at rotation.y = 0.4, then stop the loop entirely. The
           object is still there and still composed; it simply does not move. */
        scene.setReveal(1, 1);
        scene.renderOnce();
        reportHeroState({
          mode: 'webgl',
          running: false,
          triangles: scene.triangleCount(),
          reducedMotion: true,
        });
        return;
      }

      scene.setReveal(REVEAL_FROM_SCALE, 0);
      unsubscribeLoader = onLoaderCleared(() => {
        if (disposed || !scene) return;
        const reveal = { scale: REVEAL_FROM_SCALE, opacity: 0 };
        gsap.to(reveal, {
          scale: 1,
          opacity: 1,
          duration: REVEAL_DURATION,
          ease: EASE.soft,
          onUpdate: () => scene?.setReveal(reveal.scale, reveal.opacity),
        });
      });

      /* Deliberately does NOT report `running`. Whether the loop is attached is
         the loop effect's decision — it depends on the route and on whether the
         hero is on screen — and claiming it here reported `running: true` on
         every non-home route, because the loop effect then found its state
         already correct and never corrected the lie. */
      reportHeroState({ mode: 'webgl', triangles: scene.triangleCount() });
    })();

    return () => {
      disposed = true;
      unsubscribeLoader();
      scene?.dispose();
      sceneRef.current = null;
      if (process.env.NODE_ENV === 'development') {
        delete (window as { __HERO_SCENE__?: unknown }).__HERO_SCENE__;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── resize ───────────────────────────────────────────────────────────────
     A ResizeObserver on the host rather than a window listener: the host is
     100dvh, and on mobile the collapsing toolbar changes that without a window
     resize event ever firing. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(([entry]) => {
      const scene = sceneRef.current;
      if (!scene || !entry) return;
      const { width, height } = entry.contentRect;
      scene.resize(width, height, Math.min(window.devicePixelRatio, MAX_DPR));
      // Suspended (off-screen, or reduced motion) means no tick to repaint it.
      scene.renderOnce();
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* ── the loop, and everything that suspends it ────────────────────────────
     One `gsap.ticker` callback. There is no requestAnimationFrame anywhere in
     the hero — CLAUDE.md non-negotiable §7.

     Three independent reasons to be suspended, and the loop runs only when none
     of them holds: the visitor asked for reduced motion, the hero has scrolled
     off-screen, or we are on a route that is not the homepage. */
  useEffect(() => {
    if (mode !== 'webgl' || reducedMotion) return;
    const host = hostRef.current;
    if (!host) return;

    let onScreen = true;
    /* `null`, not `false`: the first sync must always report, even when it
       decides not to run. Seeded false, a non-home mount matches immediately
       and publishes nothing. */
    let running: boolean | null = null;

    const tick = (_time: number, deltaMs: number) => {
      sceneRef.current?.tick(deltaMs / 1000);
    };

    const sync = () => {
      const shouldRun = onScreen && isHome;
      if (shouldRun === running) return;
      running = shouldRun;
      if (shouldRun) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
      reportHeroState({ running: shouldRun });
    };

    // §2 performance: suspend the render loop when the hero is off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(host);
    sync();

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      running = false;
    };
  }, [mode, reducedMotion, isHome]);

  /* ── route change ─────────────────────────────────────────────────────────
     §2: the canvas persists, its opacity goes to 0 and its loop is suspended.
     The fade is a tween rather than a CSS transition so it shares the site's
     easing vocabulary and so it cannot outlive the element. */
  useGSAP(
    () => {
      const host = hostRef.current;
      if (!host) return;
      gsap.to(host, {
        opacity: isHome ? 1 : 0,
        duration: DUR.slow,
        ease: EASE.out,
        overwrite: true,
      });
    },
    { dependencies: [isHome], scope: hostRef },
  );

  /* ── pointer parallax ─────────────────────────────────────────────────────
     Desktop only, through gsap.matchMedia — never a raw resize listener
     (CLAUDE.md non-negotiable §6). matchMedia also gives us the teardown for
     free when the viewport crosses 992. */
  useGSAP(
    () => {
      if (mode !== 'webgl' || reducedMotion) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const onMove = (event: PointerEvent) => {
          // Normalised 0..1 across the viewport, exactly as the IX2 curves expect.
          sceneRef.current?.setPointer(
            event.clientX / window.innerWidth,
            event.clientY / window.innerHeight,
          );
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      });

      /* §2 mobile: no pointer, so scroll progress drives rotationY instead,
         −0.525 → −1.5 across the hero's range. Scrubbed, not triggered. */
      mm.add(MOBILE_QUERY, () => {
        const hero = document.querySelector<HTMLElement>(HERO_TRIGGER_SELECTOR);
        ScrollTrigger.create({
          trigger: hero ?? document.documentElement,
          start: 'top top',
          // With a real hero element, its own height is the range. Without one,
          // the first viewport — which is the range that element will occupy.
          end: hero ? 'bottom top' : () => `+=${window.innerHeight}`,
          scrub: true,
          onUpdate: (self) => sceneRef.current?.setScrollProgress(self.progress),
        });
      });

      /* No cleanup returned, and that is the fix rather than an omission.

         `useGSAP` reverts its own context on unmount, and a `gsap.matchMedia()`
         created inside that context is reverted **with** it — which runs every
         `mm.add()` cleanup exactly once. An explicit `mm.revert()` here made
         that happen twice, and a second `ScrollTrigger.kill()` on an instance
         already removed from `_triggers` splices the array a second time.

         That array is what `ScrollTrigger.create()` walks. A hole in it is
         `can't access property "end", curTrigger is undefined` — thrown from
         whichever component happened to be constructing a trigger at that
         moment, which is why it kept surfacing in `WorksGrid` and never in the
         component that actually caused it. See I-051. */
    },
    { dependencies: [mode, reducedMotion], scope: hostRef },
  );

  return (
    /* aria-hidden: §6 of 60-architecture-and-build.md — the canvas is
       decoration and the headline is the accessible content. */
    <div
      ref={hostRef}
      className={`${s.hero} hero-3d`}
      /* The initial value only. GSAP owns it from the first route change on, and
         an inline value here means a non-home first paint never flashes the
         canvas before the tween can hide it. */
      style={{ opacity: isHome ? 1 : 0 }}
      aria-hidden="true"
      data-hero-3d={mode}
      data-hero-visible={isHome ? 'true' : 'false'}
    >
      {mode === 'fallback' ? (
        /* Deliberately a plain <img>, not next/image. This path exists only for
           a browser with no WebGL at all — the least capable client we serve —
           and next/image would answer that with more JavaScript. The file is a
           fixed-size, pre-baked WebP with explicit dimensions, so there is
           nothing for an optimiser to do. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={s.fallback}
          src="/hero-aperture.webp"
          alt=""
          width={2400}
          height={1600}
          decoding="async"
        />
      ) : (
        <canvas ref={canvasRef} className={s.canvas} />
      )}
    </div>
  );
}
