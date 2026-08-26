"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { Plate } from "@/components/ui/Plate";
import { CaseImage } from "./CaseImage";
import { SIZES_BLEED } from "@/lib/media";
import s from "./CaseHero.module.css";

type PlyrInstance = { destroy: () => void };

/**
 * The case-study hero reel. `30-page-specs.md` §1: *"full-bleed hero video,
 * Plyr, autoplay muted loop, `controls: false`."*
 *
 * Controls off, muted, looping — this is a moving still, not a player, and
 * `controls: false` is what makes Plyr agree to that. Plyr is still worth
 * having over a bare `<video>` for the one thing it does here: it normalises
 * the element across browsers that decorate a native video with their own
 * chrome on hover.
 *
 * ── Two things this component refuses to do ──────────────────────────────
 *
 * **It does not render the video on the server.** The panel-render lesson from
 * phase 5, paid for once already: `suppressHydrationWarning` covers mismatched
 * text and attributes, it does **not** cover children injected into the element
 * — and Video Speed Controller and friends inject a `<div>` into every `<video>`
 * on the page before React reconciles. Rendering after mount is the only fix
 * that holds.
 *
 * **It does not import Plyr until there is a video to give it.** Eleven of the
 * twelve works have no reel today (T10.2), and on those pages this file
 * resolves to an image and nothing is fetched.
 *
 * ── No reel is a supported state, not a broken one ───────────────────────
 *
 * Falls back to the poster at the same aspect ratio. That is the *current*
 * state of every work — the reels are T10.2 and need recording — so the
 * fallback is the path that actually runs today and it is built to be the
 * finished-looking one.
 */
export function CaseReel({
  reel,
  poster,
  art,
  alt,
}: {
  reel?: string;
  poster: string;
  /** A generated plate in place of the poster. See D-038. */
  art?: string;
  alt: string;
}) {
  const { reducedMotion } = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlyrInstance | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !reel || !videoRef.current) return;
    let cancelled = false;

    void import("plyr").then(({ default: Plyr }) => {
      if (cancelled || !videoRef.current) return;
      playerRef.current = new Plyr(videoRef.current, {
        controls: [],
        clickToPlay: false,
        keyboard: { focused: false, global: false },
        muted: true,
        loop: { active: true },
      }) as unknown as PlyrInstance;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mounted, reel]);

  /* Under reduced motion a looping autoplay reel is exactly the thing the
     preference exists to stop, so the poster stands in. tonik ships no such
     branch; CLAUDE.md non-negotiable 8 says ours does. */
  if (!reel || reducedMotion || !mounted) {
    return (
      <div className={s.reel}>
        <Plate size="lg" bleed>
          <CaseImage
            src={poster}
            art={art}
            alt={alt}
            sizes={SIZES_BLEED}
            ratio="21 / 9"
            priority
          />
        </Plate>
      </div>
    );
  }

  return (
    <div className={s.reel}>
      <Plate size="lg" bleed>
        <video
          ref={videoRef}
          className={s.video}
          src={reel}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
        />
      </Plate>
    </div>
  );
}
