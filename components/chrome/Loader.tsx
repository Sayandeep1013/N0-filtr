'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/motion/gsap';
import { DUR, EASE } from '@/lib/motion/tokens';
import { registerTimeline, unregisterTimeline } from '@/lib/motion/registry';
import { markLoaderCleared } from '@/lib/motion/loaderSignal';
import { useMotion } from '@/lib/motion/MotionProvider';
import { ApertureMark, TILT_AXIS_DEGREES, TILT_SQUASH } from '@/components/brand/ApertureMark';
import { cx } from '@/lib/cx';
import s from './Loader.module.css';

/**
 * <Loader /> — docs/spec/20-components-and-motion.md §1.
 *
 * Two timelines, both built once and paused, per 10-design-system.md §5 rule 3.
 *
 *  · **enter** — the panel sweeps up off the page. Transcribed from IX2 `a-23`
 *    "preload-load-animation-in". The mark fade and the panel slide start
 *    together (`'<'`): in the recovered action list they are two items of the
 *    *same* actionItemGroup, and IX2 runs a group concurrently. Total 0.6s, not
 *    0.4 + 0.6. See I-010 — the harness had 1.0s seeded from the verification
 *    doc, and the recovered source settles it.
 *
 *  · **exit** — the panel sweeps up *over* the outgoing page before the router
 *    navigates. `100 → 0`, which is our one deliberate correction to tonik: they
 *    animate `200 → 100`, leaving the panel below the fold, so their exit tween
 *    is invisible and the handoff can flash.
 *
 * Under reduced motion both become a 200ms opacity fade with no transform.
 */

/** [new] — the reduced-motion fade, 200ms both directions. Not a DUR token: the
 *  vocabulary in 10-design-system.md §5 has no 0.2, and verify:motion rejects
 *  additions to it. */
const REDUCED_FADE = 0.2;

/**
 * [new] — **the wheel is assembled, then spun.** D-061.
 *
 * Sayandeep, 2026-08-28: *"first the ring forms from a line and then the rims
 * appear and connects and then the wheel spins ... first slower then faster and
 * faster eventually very fast and then curtain up to the page."*
 *
 * Four beats, and the file already had the fourth:
 *
 * ```
 *  1  the ring draws        a 14% arc — a line — sweeps closed into the ellipse
 *  2  the blades connect    each grows out of its anchor on the inner edge,
 *                           staggered round the ring, so six spokes are fitted
 *  3  the wheel spins       0 → 1.75 turns on `power2.in`: it starts slow and
 *                           ends at about five revolutions a second
 *  4  the curtain rises     `loader.enter`, untouched
 * ```
 *
 * ── The ring is drawn again, and it was rejected once ────────────────────
 *
 * Two earlier versions dash-drew the mark and Sayandeep called both: *"dash-
 * drawing a hairline on a 5rem mark is scratchy."* This is the same technique
 * and it is being asked for by name, so the note stays as the record of why it
 * failed before — the draw **was the whole animation**, so a thin stroke
 * crawling round an ellipse was the only thing to look at, for a second. Here
 * it is 0.42s of a 1.3s mechanism, it is the ring's own `SIZE/12` stroke rather
 * than a hairline, and it opens onto something. A beat can be wrong alone and
 * right in a sequence.
 *
 * ── Why the spin is not a rotation ───────────────────────────────────────
 *
 * The mark is a **tilted** wheel, drawn in projection: the ring is an ellipse
 * and every blade's endpoints were pushed through the tilt matrix as points
 * (D-033). Rotating that on screen turns the ellipse's major axis, which reads
 * as a coin tumbling — not as a wheel turning on its axle. Under 40° of travel
 * nobody notices, which is why the previous version got away with it; over
 * 630° it is the only thing you can see.
 *
 * So the blade group is spun **in the wheel's own plane**, by composing
 * `tilt ∘ rotate(θ) ∘ tilt⁻¹` about the mark's centre. Written out, and using
 * that rotations commute so `R(−A)·R(θ)·R(A)` collapses to `R(θ)`:
 *
 * ```
 * translate(C,C) rotate(A) scale(1,k) rotate(θ) scale(1,1/k) rotate(−A) translate(−C,−C)
 * ```
 *
 * Right to left: move to the origin, undo the tilt axis, undo the squash — the
 * blades are now on a true circle — turn by θ, then put the projection back.
 * The blades track the ellipse exactly, close at the sides and wide at the top,
 * which is what a spinning tilted wheel does. `A` and `k` are imported from
 * `ApertureMark` rather than retyped; that file owns the geometry.
 *
 * ── It keeps spinning while the route resolves ───────────────────────────
 *
 * The sequence above is finite; a navigation is not. When the intro finishes it
 * hands off to a continuous spin at the exact angular velocity it ended on —
 * `power2.in` finishes at twice its average speed, so the loop's period is
 * `SPIN / (2 × SPIN_TURNS)` and there is no seam. That spin is what fills the
 * wait, and it is the fix for the bug that prompted this: see `play()`.
 *
 * It is a **separate timeline** from `loader.enter`, deliberately. `enter` is a
 * transcription of IX2 `a-23` and `verify:motion` asserts its exact shape.
 * Adding to it would mean either breaking that assertion or loosening it, and a
 * loosened assertion is how a transcription quietly stops being one. See D-030.
 */
/* ── the accent tint on the way out ─────────────────────────────────────────
   `01-PHASES.md` T6.7. Two specs describe this and they do not describe the same
   thing. `10-design-system.md` §2: *"the outgoing loader tints to
   `darken(accent, 10%)` before navigating."* `50-brand-and-3d.md` §4's table,
   one line: *"Case-study loader — **glyph** tinted to the incoming work's
   accent."*

   It was built as the panel, which is the first reading, and D-036 then pulled
   the accent back to hairlines and small marks — a full-screen colour fill being
   neither. Rather than delete the task, it moved to the **glyph**, which is what
   the brand doc says and is a small mark by construction. Both specs are now
   satisfied and the effect survives the colour rule. See D-036.

   The reason it exists is unchanged: a case study sets `--accent` on mount,
   which is *after* the loader has swept. Tinting on the way out means the work's
   colour arrives during the transition rather than a beat after it.

   Which links carry it: any anchor with `data-accent-ink`. The work cards and
   `<NextWork>` set it; nothing else on the site has an accent to declare, and an
   anchor without one gets the default glyph. */

/**
 * `#125C91` → `#105283`. Each channel × 0.9, per §2's darken(10%).
 *
 * Applied to the **light** member of the accent pair, which is what the link
 * carries in `data-accent-ink`: the dark accent as a glyph on the loader's
 * `#3b3b3b` ground is a shape you have to look for. Darkening the light one
 * lands it where §2 was pointing.
 */
function darken(hex: string, amount = 0.1): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const value = Number.parseInt(match[1]!, 16);
  const scale = (channel: number) => Math.round(channel * (1 - amount));
  const r = scale((value >> 16) & 0xff);
  const g = scale((value >> 8) & 0xff);
  const b = scale(value & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/* ── the four beats, in seconds ─────────────────────────────────────────────
   Positions are absolute rather than relative, because the beats **overlap on
   purpose**: the blades start while the ring is still closing and the spin
   starts while the blades are still arriving, so the sequence reads as one
   mechanism coming up to speed rather than as three animations queued.

   The total lands at 1.30s, which is what `tools/verify/motion.ts` already
   budgets for the first-paint loader — the sequence got a beat longer and no
   slower. */

/** The arc visible at t=0, as a fraction of the ring. A line, not a dot. */
const RING_SEED = 0.14;
const RING_DRAW = 0.42;

const BLADES_AT = 0.28;
const BLADES_GROW = 0.36;
/** Round the ring, one spoke at a time. Small enough to still read as a set. */
const BLADES_STAGGER = 0.045;

const SPIN_AT = 0.58;
const SPIN = 0.72;
/** How far it gets before the curtain. `power2.in` spends most of it slow. */
const SPIN_TURNS = 1.75;

/**
 * The period of the continuous spin the intro hands off to, in seconds per
 * revolution.
 *
 * Not a tuned number — a derived one, and deriving it is the whole point. A
 * `power2.in` tween covers `T` degrees in `D` seconds along `T·t²`, so its
 * velocity at the end is `2T/D`: exactly twice its average. A loop set to any
 * other speed would show a step at the handoff, and a step is the one thing
 * that would give away that the spin is two different tweens.
 */
const SPIN_LOOP = SPIN / (2 * SPIN_TURNS);

/**
 * How much faster the whole sequence runs when the site is already loaded.
 *
 * Sayandeep: *"if the site is already loaded then the animation n everything is
 * much faster than when it isn't."* Which is the right instinct and worth
 * saying why: on a first paint the loader is covering real work — fonts,
 * the hero's WebGL context, the route's payload — and 1.3s of mechanism is
 * time the visitor was going to spend anyway. On a client-side navigation
 * there is often nothing left to wait for, and the same 1.3s is 1.3s of the
 * site holding its own door shut.
 *
 * A `timeScale`, not a second set of constants: one sequence, one set of
 * proportions, played at two speeds. 2.4 puts the warm intro at 0.54s.
 */
const WARM_SCALE = 2.4;

export function Loader() {
  const panelRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  /* The spin is built inside the GSAP context — it closes over the mark's
     elements — but it is driven from the effects below, which are outside
     it. Two refs rather than lifting the whole thing out: the context is
     what makes the tween revert cleanly on a rebuild. */
  const startSpinRef = useRef<(() => void) | null>(null);
  const stopSpinRef = useRef<(() => void) | null>(null);
  /** Where the intercepted click was going. Read by the exit's onComplete. */
  const pendingHref = useRef<string | null>(null);
  /** False until the first enter has run, so a rebuild does not re-cover the page. */
  const hasEntered = useRef(false);

  /**
   * The curtain waits on **two** things, and this is the join.
   *
   * ── The bug this exists for ─────────────────────────────────────────────
   *
   * Sayandeep, 2026-08-28: *"sometimes the loader just doesn't animate .. i
   * switch page .. the wheel shows up stuck, after a second the curtain pulls
   * up."*
   *
   * It was not intermittent and it was not a failure to animate. The mark's
   * sequence was gated to the **first paint** — `hasDrawn`, now gone — so on
   * every route change after that the panel swept down over a static mark, sat
   * there for however long Next took to resolve the route, and swept up again.
   * A parked logo for the length of a navigation, which is exactly "stuck for a
   * second and then the curtain". On a fast local route it was brief enough to
   * read as a glitch; on a slow one it was a second of nothing.
   *
   * So the sequence now runs on every navigation, and the wheel keeps spinning
   * until the route lands. Which means the curtain cannot simply follow either
   * event — it has to wait for the later of the two:
   *
   *   · `route`  the new pathname has rendered
   *   · `intro`  the assembly has finished and the spin has taken over
   *
   * Whichever arrives second calls `raise`. `armed` is what keeps a stray
   * pathname change — a back button, a `router.push` from somewhere else —
   * from raising a curtain that was never lowered.
   */
  const latch = useRef({ route: false, intro: false, armed: false });

  const { reducedMotion } = useMotion();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Take the curtain up, but only once both latches are set. See `latch`.
   *
   * Stable across renders — the effects below and the click handler all call
   * it, and a fresh identity each render would put it in three dependency
   * arrays for no reason.
   */
  const raise = useRef(() => {
    const l = latch.current;
    if (!l.armed || !l.route || !l.intro) return;
    l.armed = false;
    stopSpinRef.current?.();
    enterRef.current?.restart();
  }).current;

  /**
   * Cover the page if it is not covered already, run the sequence, and arm the
   * curtain. `scale` is 1 on a cold first paint and `WARM_SCALE` on a warm
   * navigation — one sequence, one set of proportions, two speeds.
   */
  const play = useRef((scale: number) => {
    const l = latch.current;
    l.armed = true;
    l.route = false;
    l.intro = false;

    stopSpinRef.current?.();

    const intro = introRef.current;
    /* Under `prefers-reduced-motion` the sequence has no children at all, so
       there is nothing to wait for and the latch closes immediately. The
       curtain is then the 200ms fade, which is the whole animation that mode
       gets — and should get.

       The mark is revealed here rather than by the sequence, because there is
       no sequence: the stylesheet starts it at `opacity: 0` so a static mark is
       never visible before it animates, and in this mode nothing else would
       ever turn it back on. */
    if (!intro || intro.duration() === 0) {
      gsap.set(markRef.current, { opacity: 1, scale: 1 });
      l.intro = true;
      return;
    }

    intro.timeScale(scale);
    intro.eventCallback('onComplete', () => {
      l.intro = true;
      startSpinRef.current?.();
      raise();
    });
    intro.restart();
  }).current;

  useGSAP(
    () => {
      const panel = panelRef.current;
      const mark = markRef.current;
      if (!panel || !mark) return;

      /* Fired when the exit has finished covering the page.

         **The sequence starts here, not after the route lands.** That ordering
         is the whole fix: the panel is over the page and the navigation has not
         begun, which is precisely the window that used to hold a parked mark.
         The wheel is assembled and spinning throughout it, and `raise` takes
         the curtain up when both the route and the sequence are done. */
      const navigate = () => {
        const href = pendingHref.current;
        pendingHref.current = null;
        play(WARM_SCALE);
        if (href) router.push(href);
      };

      /* ── enter ───────────────────────────────────────────────────────────
         The trailing reset restores `scale` as well as `opacity`. tonik's does
         not need to: Barba throws their loader element away and builds a new
         one per page, so its scale resets for free. Ours is mounted once in the
         root layout and survives every route change, so a mark left at 0.5
         would make the second page's fade start half-size. */
      /* The latch that Hero3D's load-in and phase 3's hero copy hang off.
         It fires from onComplete rather than from a fixed delay because the
         timeline is 0.6s normally and 0.2s under reduced motion — any hard
         number would be wrong in one of the two. See lib/motion/loaderSignal. */
      const enter = gsap.timeline({ paused: true, onComplete: markLoaderCleared });
      if (reducedMotion) {
        enter
          .set(panel, { display: 'flex', yPercent: 0, opacity: 1 })
          .to(panel, { opacity: 0, duration: REDUCED_FADE, ease: EASE.linear })
          .set(panel, { display: 'none' })
          .set(mark, { opacity: 1, scale: 1 });
      } else {
        enter
          .set(panel, { display: 'flex', yPercent: 0, opacity: 1 })
          .to(mark, { opacity: 0, scale: 0.5, duration: DUR.base, ease: EASE.quad })
          .to(panel, { yPercent: -100, duration: DUR.slow, ease: EASE.quad }, '<')
          .set(panel, { display: 'none' })
          .set(mark, { opacity: 1, scale: 1 });
      }

      /* ── the wheel is assembled ──────────────────────────────────────────
         See the block comment at the top of the file for the four beats and for
         why the spin is a composed transform rather than a rotation.

         Separate from `enter` so the IX2 transcription keeps its asserted
         shape. */
      const ticks = [...mark.querySelectorAll<SVGLineElement>('[data-mark-tick]')];

      const intro = gsap.timeline({ paused: true });
      const svg = mark.querySelector<SVGSVGElement>('svg');
      const ring = mark.querySelector<SVGGeometryElement>('[data-mark-ring]');
      const blades = mark.querySelector<SVGGElement>('[data-mark-blades]');

      /* The spin's angle lives on a proxy rather than on the element, because
         what the element needs is a whole composed transform and GSAP has no
         property for "rotate within a projected plane". One number tweened,
         one attribute written per frame. */
      const spinState = { angle: 0 };
      let spinLoop: gsap.core.Tween | null = null;

      const centre = svg ? svg.viewBox.baseVal.width / 2 : 0;

      /** `tilt ∘ rotate(θ) ∘ tilt⁻¹`, about the mark's centre. */
      const spinTransform = (angle: number) =>
        `translate(${centre} ${centre}) rotate(${TILT_AXIS_DEGREES}) scale(1 ${TILT_SQUASH})` +
        ` rotate(${angle}) scale(1 ${1 / TILT_SQUASH}) rotate(${-TILT_AXIS_DEGREES})` +
        ` translate(${-centre} ${-centre})`;

      const applySpin = () => blades?.setAttribute('transform', spinTransform(spinState.angle));

      if (!reducedMotion && svg && ring && blades && ticks.length > 0) {
        /* Each blade's anchor on the ring's inner edge, and its rest length,
           read off the elements rather than duplicated here. `ApertureMark`
           owns the geometry, and a second copy of it in this file is a copy
           that can drift. */
        const anchor = ticks.map((tick) => ({
          x: Number(tick.getAttribute('x1')),
          y: Number(tick.getAttribute('y1')),
        }));
        const rest = ticks.map((tick) => ({
          x2: Number(tick.getAttribute('x2')),
          y2: Number(tick.getAttribute('y2')),
        }));

        /* The ellipse's circumference, from the browser rather than from
           Ramanujan's approximation — `getTotalLength` is on every
           SVGGeometryElement and is exact for the path the browser will draw.
           The fallback is only for a rasteriser that does not implement it: the
           perimeter of a circle at the mean radius is within a percent of an
           ellipse this round, and a percent of a dash length is invisible. */
        const length =
          typeof ring.getTotalLength === 'function'
            ? ring.getTotalLength()
            : Math.PI * 2 * centre * ((1 + TILT_SQUASH) / 2);

        intro
          .set(mark, { opacity: 1, scale: 1 })

          /* ── 1. the ring forms from a line ──────────────────────────────
             One dash the length of the whole ellipse, with the offset carrying
             all but `RING_SEED` of it off the end — so the first frame is a
             short arc and the last is a closed ring. Only the offset moves,
             which is one animatable number and no string interpolation. */
          .set(ring, { strokeDasharray: length })
          .fromTo(
            ring,
            { strokeDashoffset: length * (1 - RING_SEED) },
            { strokeDashoffset: 0, duration: RING_DRAW, ease: 'power2.out' },
            0,
          )

          /* ── 2. the blades appear and connect ───────────────────────────
             Each grows **out of its own anchor on the ring's inner edge**, not
             inward from the bore — the previous version ran the other way,
             because it was drawing an iris retracting rather than a wheel
             being built.

             `attr`, not a transform: the blades already carry two rotations
             from the mark's own markup, and a scale composed on top of those
             would shear them off their radial line. Moving the endpoint keeps
             every blade exactly on its own axis, which is what §1's geometry
             is. */
          .fromTo(
            ticks,
            {
              attr: {
                x2: (i: number) => anchor[i]?.x ?? centre,
                y2: (i: number) => anchor[i]?.y ?? centre,
              },
            },
            {
              attr: {
                x2: (i: number) => rest[i]?.x2 ?? centre,
                y2: (i: number) => rest[i]?.y2 ?? centre,
              },
              duration: BLADES_GROW,
              ease: 'power2.out',
              stagger: BLADES_STAGGER,
            },
            BLADES_AT,
          )

          /* ── 3. the wheel spins, slow then very fast ────────────────────
             `power2.in` is the ease that means "starts slow and keeps gaining":
             it covers a quarter of the travel in the first half of the time.
             It ends at twice its average speed, which is what `SPIN_LOOP` is
             derived from so the handoff below has no step in it. */
          .fromTo(
            spinState,
            { angle: 0 },
            {
              angle: SPIN_TURNS * 360,
              duration: SPIN,
              ease: 'power2.in',
              onUpdate: applySpin,
            },
            SPIN_AT,
          )

          /* Hand the ring back. The blade group's transform is deliberately
             NOT cleared here — the continuous spin picks up from this exact
             angle the moment this timeline completes, and clearing it would
             snap the spokes back to zero on the seam. It is cleared when the
             spin stops instead. */
          .set(ring, { clearProps: 'strokeDasharray,strokeDashoffset' });
      }

      /* ── the spin that outlives the sequence ─────────────────────────────
         Started when the intro completes and stopped when the curtain goes up,
         so the wheel is turning for the whole of however long a navigation
         actually takes. This is the fix for the stuck mark — see `play`.

         Not registered as a timeline: it repeats forever, and an assertion on
         `repeat: -1` says nothing a duration can express. It is a plain
         `gsap.to` on the shared ticker rather than a second rAF, which is the
         property that matters and which the runtime rAF check already
         enforces — the same reasoning the schematic's travelling band uses. */
      const startSpin = () => {
        if (reducedMotion || !blades || spinLoop) return;
        spinLoop = gsap.to(spinState, {
          angle: '+=360',
          duration: SPIN_LOOP,
          ease: 'none',
          repeat: -1,
          onUpdate: applySpin,
        });
      };

      const stopSpin = () => {
        spinLoop?.kill();
        spinLoop = null;
        spinState.angle = 0;
        /* Removed rather than reset to zero. The loader is mounted once in the
           root layout and never rebuilt, so a transform left on the blade group
           would tilt this same mark for the rest of the session. */
        blades?.removeAttribute('transform');
      };

      /* ── exit ────────────────────────────────────────────────────────────
         Built paused and restarted per click rather than created inside the
         handler, so it can be registered and asserted. */
      const exit = gsap.timeline({ paused: true, onComplete: navigate });
      if (reducedMotion) {
        exit
          .set(panel, { display: 'flex', yPercent: 0, opacity: 0 })
          .set(mark, { opacity: 1, scale: 1 })
          .to(panel, { opacity: 1, duration: REDUCED_FADE, ease: EASE.linear });
      } else {
        exit
          .set(panel, { yPercent: 100, display: 'flex', opacity: 1 })
          /* **Zero, not one.** The mark used to ride up with the panel fully
             drawn, and then — the instant the panel landed and `play` started
             the sequence — snap back to a bare arc and redraw itself. A visible
             reset, and the same fault the stylesheet fixes at first paint
             (D-061): a finished logo shown before it animates.

             The panel is a plain grey field for the length of the sweep, and
             the wheel starts assembling the moment it lands. `scale` is still
             set because `enter` leaves it at 0.5.

             The reduced-motion branch above keeps `opacity: 1`: there is no
             sequence in that mode to reveal it, and a 200ms fade onto an empty
             panel is not a loader. */
          .set(mark, { opacity: 0, scale: 1 })
          .to(panel, { yPercent: 0, duration: DUR.mid, ease: EASE.out });
      }

      /* A rebuild — the visitor toggled prefers-reduced-motion mid-session —
         reverts GSAP's inline styles, which puts the panel back over the page.
         Jump the fresh timeline to its end so it stays gone. */
      if (hasEntered.current) {
        enter.progress(1).pause();
        // `progress(1)` does not fire onComplete, and the loader has in fact
        // already cleared — latch it directly so a rebuild cannot un-signal it.
        markLoaderCleared();
      }

      enterRef.current = enter;
      exitRef.current = exit;
      introRef.current = intro;
      startSpinRef.current = startSpin;
      stopSpinRef.current = stopSpin;
      registerTimeline('loader.enter', enter);
      registerTimeline('loader.exit', exit);
      registerTimeline('loader.mark', intro);

      return () => {
        unregisterTimeline('loader.enter');
        unregisterTimeline('loader.exit');
        unregisterTimeline('loader.mark');
        enterRef.current = null;
        exitRef.current = null;
        introRef.current = null;
        /* The spin is a bare `gsap.to`, not a context-managed timeline, and
           the transform it writes is an attribute GSAP never recorded — so
           neither goes away on its own when the context reverts. */
        stopSpin();
        startSpinRef.current = null;
        stopSpinRef.current = null;
      };
    },
    { scope: panelRef, dependencies: [reducedMotion, play] },
  );

  /* Runs on mount and on every route change — tonik fires `a-23` on
     PAGE_START, PAGE_SCROLL_UP and PAGE_FINISH alike. */
  useEffect(() => {
    const first = !hasEntered.current;
    hasEntered.current = true;

    if (first) {
      /* Cold. The panel is already covering the page from CSS, the route is by
         definition here, and the sequence runs at its full length because the
         loader is covering real work — fonts, the hero's WebGL context, the
         first route's payload. */
      play(1);
      latch.current.route = true;
      raise();
      return;
    }

    /* Warm. If our own exit covered the page then `play` already started when
       it finished, and the wheel has been spinning since; this is just the
       second latch closing. If it did not — a back button, a `router.push`
       from elsewhere — nothing has covered the page and nothing is armed, so
       cover it and run the sequence now rather than letting `enter` flash a
       panel up from nowhere. */
    if (!latch.current.armed) {
      gsap.set(panelRef.current, { display: 'flex', yPercent: 0, opacity: 1 });
      play(WARM_SCALE);
    }
    latch.current.route = true;
    raise();

    /* The tint belongs to the transition, not to the page. Cleared here rather
       than in the exit's onComplete because the exit completes *before* the
       route resolves, and clearing it there would show the grey panel again for
       the length of a navigation. */
    const mark = markRef.current;
    return () => {
      if (mark) mark.style.color = '';
    };
  }, [pathname, play, raise]);

  /* ── link interception ──────────────────────────────────────────────────
     Delegated at the document, so every internal link on the site is covered
     without any component having to opt in. `data-no-loader` opts out.

     ── It listens in the CAPTURE phase, and that is load-bearing ──────────

     It was a bubble-phase listener until phase 6, and **the exit timeline never
     ran once in five phases.** React attaches its own listeners to the root
     container, which is a descendant of `document`, so on the way *up* React
     sees the click first — and `next/link`'s handler calls `preventDefault()`
     and routes. By the time this listener ran, `event.defaultPrevented` was
     already true and the first guard below sent it home.

     Nothing looked wrong, which is why it survived: `enter` fires on every
     pathname change, so the loader still swept on arrival. What was missing was
     the sweep *before* leaving — and, once T6.7 existed, the accent tint that
     rides on it. `behaviour.case.ts` caught it by asserting the tint.

     Capture means this runs before React, so `stopPropagation()` below is what
     stops `<Link>` navigating out from under the animation. `preventDefault()`
     alone is not enough: it suppresses the browser's navigation, not React's. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.dataset.noLoader !== undefined) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same document — an in-page hash. The router is not involved and neither
      // are we; covering the page for an anchor jump would be absurd.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      /* Keeps the click away from `<Link>`'s own handler — see the note above.
         Only for anchors this listener is actually taking over; anything that
         reached one of the `return`s above is left entirely alone. */
      event.stopPropagation();
      pendingHref.current = `${url.pathname}${url.search}${url.hash}`;

      /* T6.7. Set before the exit restarts, so the sweep is already the right
         colour on its first frame rather than crossfading into it. Cleared on
         arrival by the effect below — a tint left behind would make the *next*
         navigation, to anywhere, sweep up in the last work's blue. */
      const mark = markRef.current;
      if (mark) {
        const ink = anchor.dataset.accentInk;
        /* `<ApertureMark>` draws in `currentColor`, so one property on the
           wrapper tints the whole glyph — ring and blades together. */
        mark.style.color = ink ? darken(ink) : '';
      }

      exitRef.current?.restart();
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  /* bfcache guard [src]. Restoring from the back/forward cache replays the DOM
     exactly as it was left — including a loader mid-sweep. */
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) gsap.set(panelRef.current, { display: 'none' });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return (
    <>
      {/* Without JS the enter timeline never runs, and the panel would cover the
          page forever. The markup is inert to assistive tech either way. */}
      <noscript>
        <style>{`.loader { display: none !important; }`}</style>
      </noscript>
      <div ref={panelRef} className={cx(s.loader, 'loader')} aria-hidden="true">
        <div ref={markRef} className={cx(s.mark, 'loader__mark')}>
          <ApertureMark />
        </div>
      </div>
    </>
  );
}
