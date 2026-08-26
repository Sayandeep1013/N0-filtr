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
import ShowreelPanel from './ShowreelPanel';

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

  /**
   * The panel renders after mount, never on the server.
   *
   * A `<video>` is the favourite target of media extensions — Video Speed
   * Controller injects a `<div class="vsc-controller">` into it *before React
   * hydrates* — and React reports that as a hydration mismatch naming our file.
   *
   * `suppressHydrationWarning` was the first attempt and does not cover it:
   * React applies that to **text content and attributes** on the element it is
   * set on, not to extra or missing children. The warning kept coming.
   *
   * `next/dynamic` with `ssr: false` was the second, and it worked — but it
   * cost 1.7KB of a route that had 2.8KB left (I-034), because the dynamic
   * wrapper ships alongside a chunk that is fetched on mount anyway. A boolean
   * does the same job for nothing: the server sends no `<video>`, so there is
   * nothing for an extension to modify before hydration and nothing for React
   * to compare. The panel appears a frame later, which is a very long time
   * before anyone can click a button to open it.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  /**
   * One promise, awaited by everyone — and **cleared if it rejects.**
   *
   * The first version was `libsRef.current ??= import('gsap/Flip')...`, which
   * has two faults that only show themselves when the network does something
   * other than succeed.
   *
   * A dynamic import that fails leaves a **rejected promise cached in the ref**.
   * `??=` then never reassigns it, so every subsequent hover and every click
   * re-awaits the same failure: the button is dead for the rest of the session
   * and reloading is the only cure. And nothing caught the rejection, so it
   * surfaced as an unhandled `ChunkLoadError` in Next's dev overlay — which is
   * how this was found, on a dev server whose chunks had been rebuilt under a
   * page that was still open.
   *
   * Clearing the ref in a `catch` makes the next attempt a real retry. The
   * `catch` also re-throws, so `open()` can still tell the difference between
   * "loaded" and "did not" and take the no-Flip path rather than doing nothing.
   */
  const loadFlip = useCallback(() => {
    if (!libsRef.current) {
      libsRef.current = import('gsap/Flip')
        .then(({ Flip }) => {
          gsap.registerPlugin(Flip);
          return { Flip };
        })
        .catch((error) => {
          libsRef.current = null;
          throw error;
        });
    }
    return libsRef.current;
  }, []);

  /* Warming is best-effort by definition: it runs on a hover the visitor may
     never follow with a click. A failure here must be silent — the click path
     retries, and a toast about a prefetch is noise about something that has not
     gone wrong yet. */
  const prefetch = useCallback(() => {
    if (!available) return;
    void loadFlip().catch(() => undefined);
  }, [available, loadFlip]);

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

    /* No Flip, no reparent: the section is simply present. Shared by the
       reduced-motion path and by the case where the Flip chunk could not be
       fetched — in both, the visitor still gets the showreel. A player that
       refuses to open because a 5KB plugin is missing is a worse failure than
       one that opens without a flourish. */
    const openWithoutFlip = () => {
      gsap.set(section, { display: 'flex', backgroundColor: '#21212180' });
      gsap.to([playerRef.current, headingRef.current], {
        opacity: 1,
        duration: DUR.base,
        onComplete: runPlayer,
      });
    };

    if (reducedMotion) {
      openWithoutFlip();
      return;
    }

    void (async () => {
      let Flip: typeof import('gsap/Flip').Flip;
      try {
        ({ Flip } = await loadFlip());
      } catch {
        openWithoutFlip();
        return;
      }

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
  }, [available, isOpen, reducedMotion, stopScroll, ensurePlyr, loadFlip]);

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

    /* The mirror of `openWithoutFlip`. If the panel was opened without Flip it
       must close without it too, or the background layer is left in the player
       and the hero's headline has a hole in it. */
    const closeWithoutFlip = () => {
      gsap.set([playerRef.current, headingRef.current], { opacity: 0 });
      gsap.set(section, { display: 'none', backgroundColor: '#21212100' });
      if (bg.parentElement !== trigger) trigger.appendChild(bg);
      gsap.set(bg, { clearProps: 'all' });
      gsap.set(iconRef.current, { opacity: 1 });
    };

    if (reducedMotion) {
      closeWithoutFlip();
      return;
    }

    void (async () => {
      let Flip: typeof import('gsap/Flip').Flip;
      try {
        ({ Flip } = await loadFlip());
      } catch {
        closeWithoutFlip();
        return;
      }

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
  }, [isOpen, reducedMotion, startScroll, loadFlip]);

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
      {available && mounted && (
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
