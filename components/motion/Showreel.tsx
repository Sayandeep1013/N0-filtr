'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { gsap } from '@/lib/motion/gsap';
import { DUR, EASE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { useMotion } from '@/lib/motion/MotionProvider';
import { SHOWREEL } from '@/lib/content/site';
/* Plyr's own stylesheet, imported statically while the library itself is
   imported on demand. That split is deliberate. The budget under pressure is
   the JS one (D-013), and CSS is not in it; meanwhile a dynamically imported
   stylesheet arrives a frame or two after the player it is meant to dress, and
   the first build of this component shipped a screen full of Plyr's unstyled
   SVG icons rendered at their intrinsic size — enormous black arrows over the
   hero. Static CSS, dynamic JS. */
import 'plyr/dist/plyr.css';
import s from './Showreel.module.css';

/**
 * The showreel. `20-components-and-motion.md` §15 — **the only use of Flip on
 * the site.** The hero's small play button does not open a player; its
 * background *becomes* one.
 *
 * ── Why a context and not props ────────────────────────────────────────────
 *
 * Flip needs two DOM nodes that live in different components: the button's
 * background layer, inside `<PlaySquare>` in the hero's headline, and the
 * player's wrapper, inside this full-screen section. Neither can own the
 * other. The context is the seam, and it carries element registration rather
 * than element rendering — `registerBackground` hands this component a node it
 * will reparent and hand back.
 *
 * ── Why the plugins load on demand ─────────────────────────────────────────
 *
 * Flip and Plyr are both imported inside the open handler, on first use, and
 * pre-warmed on pointer-enter and focus so the click that matters is instant.
 * `/` had ~16KB of JS headroom when this was built (D-013) and Plyr alone is
 * more than that. `lib/motion/gsap.ts` deliberately does not register Flip for
 * the same reason — registering a plugin is what pulls it into the bundle.
 *
 * `Flip.getState()` has to run before anything moves, but "before anything
 * moves" and "after an await" are compatible: the await resolves, nothing has
 * changed, and then we read the state. The order in the handler is load,
 * measure, reparent — never measure, load, reparent.
 *
 * ── Reduced motion ────────────────────────────────────────────────────────
 *
 * No Flip, no scale, no reparent. The section fades in over `DUR.base` and the
 * player is simply there. The button's background stays where it is — moving
 * an element across the screen is precisely what the visitor asked us not to
 * do, and it is not load-bearing for understanding what happened.
 */

interface ShowreelValue {
  /** Whether a reel exists at all. False keeps `<PlaySquare>` inert. */
  available: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Warms the dynamic imports. Safe to call repeatedly. */
  prefetch: () => void;
  /** `<PlaySquare>` hands us the layer Flip reparents. */
  registerBackground: (el: HTMLElement | null) => void;
  registerIcon: (el: HTMLElement | null) => void;
  registerTrigger: (el: HTMLElement | null) => void;
}

const ShowreelContext = createContext<ShowreelValue | null>(null);

/** Null outside a provider, so `<PlaySquare>` degrades to decoration. */
export function useShowreel(): ShowreelValue | null {
  return useContext(ShowreelContext);
}

type PlyrInstance = {
  play: () => void;
  stop: () => void;
  destroy: () => void;
  volume: number;
};

export function ShowreelProvider({ children }: { children: ReactNode }) {
  /* `as string` because SHOWREEL is `as const`: TypeScript narrows each field
     to its literal, and comparing a literal to '' is a compile-time constant it
     rightly complains about. The comparison is not pointless — it is the switch
     that decides whether `<PlaySquare>` is a control at all, and it has to keep
     working when T10.2 changes these strings. */
  const available = (SHOWREEL.src as string) !== '' || (SHOWREEL.srcWebm as string) !== '';
  const [isOpen, setIsOpen] = useState(false);

  const backgroundRef = useRef<HTMLElement | null>(null);
  const iconRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const playerWrapRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const plyrRef = useRef<PlyrInstance | null>(null);
  const libsRef = useRef<Promise<{ Flip: typeof import('gsap/Flip').Flip }> | null>(null);
  const { reducedMotion, stopScroll, startScroll } = useMotion();

  /* One promise, awaited by everyone. A second call while the first is in
     flight must not start a second download. */
  const prefetch = useCallback(() => {
    if (!available) return;
    libsRef.current ??= import('gsap/Flip').then(({ Flip }) => {
      gsap.registerPlugin(Flip);
      return { Flip };
    });
    void libsRef.current;
  }, [available]);

  /* Plyr is separate from Flip: Flip is needed to *start* the transition and
     Plyr is not needed until the player is on screen, so waiting on both before
     the first frame would make the click feel slow for no reason. */
  const ensurePlyr = useCallback(async () => {
    if (plyrRef.current || !videoRef.current) return plyrRef.current;
    const { default: Plyr } = await import('plyr');
    if (!videoRef.current) return null;
    const player = new Plyr(videoRef.current, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      hideControls: true,
      resetOnEnd: true,
    }) as unknown as PlyrInstance;
    // §15: "volume set to .3 on first play".
    player.volume = 0.3;
    plyrRef.current = player;
    return player;
  }, []);

  const open = useCallback(() => {
    if (!available || isOpen) return;
    const section = sectionRef.current;
    const bg = backgroundRef.current;
    const wrap = playerWrapRef.current;
    if (!section || !bg || !wrap) return;

    setIsOpen(true);
    stopScroll();

    const runPlayer = () => {
      void ensurePlyr().then((p) => p?.play());
    };

    if (reducedMotion) {
      /* No Flip, no reparent. The section is simply present. */
      gsap.set(section, { display: 'flex', backgroundColor: '#21212180' });
      gsap.to([playerRef.current, headingRef.current], {
        opacity: 1,
        duration: DUR.base,
        onComplete: runPlayer,
      });
      return;
    }

    void (async () => {
      const { Flip } = await (libsRef.current ??=
        import('gsap/Flip').then(({ Flip: F }) => {
          gsap.registerPlugin(F);
          return { Flip: F };
        }));

      // Measure first, then move. Nothing above this line touched the DOM.
      const state = Flip.getState(bg);
      gsap.set(section, { display: 'flex' });
      wrap.appendChild(bg);

      gsap.to(iconRef.current, { opacity: 0, duration: DUR.base });
      Flip.from(state, { duration: 1, ease: EASE.soft, scale: true });

      const tl = gsap.timeline();
      tl.to(playerRef.current, { opacity: 1, delay: 0.6, duration: DUR.base })
        .to(headingRef.current, { opacity: 1, duration: DUR.mid }, '<+0.2')
        .to(
          section,
          { backgroundColor: '#21212180', duration: DUR.base, onComplete: runPlayer },
          '<',
        );

      registerTimeline('showreel.open', tl);
    })();
  }, [available, isOpen, reducedMotion, stopScroll, ensurePlyr]);

  const close = useCallback(() => {
    if (!isOpen) return;
    const section = sectionRef.current;
    const bg = backgroundRef.current;
    const trigger = triggerRef.current;

    setIsOpen(false);
    startScroll();
    plyrRef.current?.stop();
    trigger?.focus();

    if (!section || !bg || !trigger) return;

    if (reducedMotion) {
      gsap.set([playerRef.current, headingRef.current], { opacity: 0 });
      gsap.set(section, { display: 'none', backgroundColor: '#21212100' });
      return;
    }

    void (async () => {
      const { Flip } = await (libsRef.current ??=
        import('gsap/Flip').then(({ Flip: F }) => {
          gsap.registerPlugin(F);
          return { Flip: F };
        }));

      const state = Flip.getState(bg);
      trigger.appendChild(bg);

      const tl = gsap.timeline();
      tl.to(playerRef.current, { opacity: 0, duration: DUR.base })
        .to(headingRef.current, { opacity: 0, duration: DUR.base }, '<')
        .to(
          section,
          {
            backgroundColor: '#21212100',
            duration: DUR.fast,
            onComplete: () => gsap.set(section, { display: 'none' }),
          },
          '<+0.1',
        );

      registerTimeline('showreel.close', tl);

      Flip.from(state, { delay: 0.3, duration: DUR.slow, ease: EASE.soft, absolute: true });
      gsap.to(iconRef.current, { opacity: 1, delay: DUR.base, duration: DUR.base });
    })();
  }, [isOpen, reducedMotion, startScroll]);

  /* Escape closes, and focus is held inside the panel while it is open — the
     same contract the contact panel has, for the same reason. */
  useEffect(() => {
    if (!isOpen) return;
    const section = sectionRef.current;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !section) return;
      const focusable = section.querySelectorAll<HTMLElement>(
        'button, [href], video, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(
    () => () => {
      unregisterTimeline('showreel.open');
      unregisterTimeline('showreel.close');
      plyrRef.current?.destroy();
      plyrRef.current = null;
    },
    [],
  );

  const value = useMemo<ShowreelValue>(
    () => ({
      available,
      isOpen,
      open,
      close,
      prefetch,
      registerBackground: (el) => {
        backgroundRef.current = el;
      },
      registerIcon: (el) => {
        iconRef.current = el;
      },
      registerTrigger: (el) => {
        triggerRef.current = el;
      },
    }),
    [available, isOpen, open, close, prefetch],
  );

  return (
    <ShowreelContext.Provider value={value}>
      {children}
      {available && (
        <ShowreelPanel
          sectionRef={sectionRef}
          playerWrapRef={playerWrapRef}
          playerRef={playerRef}
          headingRef={headingRef}
          videoRef={videoRef}
          onClose={close}
          isOpen={isOpen}
        />
      )}
    </ShowreelContext.Provider>
  );
}

function ShowreelPanel({
  sectionRef,
  playerWrapRef,
  playerRef,
  headingRef,
  videoRef,
  onClose,
  isOpen,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  playerWrapRef: React.RefObject<HTMLDivElement | null>;
  playerRef: React.RefObject<HTMLDivElement | null>;
  headingRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      className={s.section}
      aria-modal={isOpen || undefined}
      role="dialog"
      aria-label={SHOWREEL.label}
      aria-hidden={!isOpen}
    >
      {/* The scrim is the section's own background colour, which the open
          timeline tweens from #21212100 to #21212180. Clicking it closes —
          the same affordance the lightbox gets in phase 6. */}
      <button type="button" className={s.scrim} onClick={onClose} aria-label="Close showreel" />

      <div className={s.inner}>
        <div ref={headingRef} className={s.heading}>
          <p data-t="label" className={s.label}>
            {SHOWREEL.label}
          </p>
          <p data-t="h5">{SHOWREEL.title}</p>
          {/* Said out loud, not hidden in a comment. The reel in the player is
              our own hero, baked to give §15's Flip something real to open;
              T10.2 replaces it with the actual work. Anyone who opens this
              deserves to know which one they are watching. */}
          {SHOWREEL.isPlaceholder && (
            <p data-t="label" className={s.label}>
              Placeholder reel — real footage lands with the case studies
            </p>
          )}
        </div>

        {/* THE Flip target's destination. The button's background layer is
            appended here on open and taken back on close; it must therefore be
            an element whose box is the player's box. */}
        <div ref={playerWrapRef} className={s.playerWrap}>
          <div ref={playerRef} className={s.player}>
            <video ref={videoRef} playsInline poster={SHOWREEL.poster} preload="none">
              {SHOWREEL.srcWebm && <source src={SHOWREEL.srcWebm} type="video/webm" />}
              {SHOWREEL.src && <source src={SHOWREEL.src} type="video/mp4" />}
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
