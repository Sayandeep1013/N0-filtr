import { gsap } from '@/lib/motion/gsap';
import { MQ, REVERSE_SCALE } from '@/lib/motion/tokens';
import { P_IN, STROKE, readingAt, readoutOf } from '@/lib/figures/handover';
import { LIVE } from './generated/handover.live';
import { follow, needleD, spring, type Spring } from './live';

/**
 * The moving parts of /about's Fig. 01 — the slide plate and two needles. D-064.
 *
 * Imported by `HandoverLive` on mount. The SVG is server-rendered; this finds its parts by
 * `data-part` and writes attributes on them. Nothing re-renders per frame.
 *
 * · **One loop.** The site's GSAP ticker (non-negotiable 7), added only while
 *   the figure is on screen and something is still moving.
 * · **Hover is desktop-only** (`MQ.desktop`, non-negotiable 6): the pointer's
 *   position across the figure scrubs the plate. Click, tap, Space or Enter
 *   toggles it everywhere; arrows, Home and End step it.
 * · **Reverses run faster** (non-negotiable 5): pulling the screen back out
 *   eases over `TAU / REVERSE_SCALE`.
 * · **An idle tour** pushes the screen in and pulls it out again when nobody is
 *   touching the figure, so the page still says what the figure is for.
 * · **Reduced motion**: no tour, and every change lands at once. Input still
 *   works — the figure explains itself on a click instead.
 *
 * The readout is computed from where the plate *is*, not where it is going,
 * so the phase word and the number always come from the same instant.
 */

const TAU = 0.3;
const TOUR_FIRST = 1.4;
const TOUR_OUT = 2.6;
const TOUR_IN = 3.0;
const IDLE_BACK = 3.6;

/** Starts the figure on its stage; returns the teardown. */
export function run(stage: HTMLElement): () => void {
  const figure = stage.closest('figure');
  if (!figure) return () => undefined;
  const readout = figure.querySelector<HTMLElement>('[data-readout]');
  const slides = Array.from(stage.querySelectorAll<SVGGElement>('[data-part="slide"]'));
  const needleIn = stage.querySelector<SVGPathElement>('[data-part="up.tap.gauge.needle"]');
  const needleOut = stage.querySelector<SVGPathElement>('[data-part="down.tap.gauge.needle"]');

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, reduced: MQ.reduced }, (context) => {
    const { desktop, reduced } = context.conditions as Record<string, boolean>;
    const calm = Boolean(reduced);
    const state = { t: 0, target: 0 };
    const pIn: Spring = { at: P_IN, rate: 0 };
    const pOut: Spring = { at: readingAt(0).pOut, rate: 0 };
    let touring = !calm;
    let clock = 0;
    let running = false;
    let visible = false;
    let lastText = '';
    let lastPhase = '';
    let idle: gsap.core.Tween | undefined;

    const draw = () => {
      const r = readingAt(state.t);
      const off = state.t * STROKE;
      const transform = `translate(${(LIVE.slide[0] * off).toFixed(2)} ${(LIVE.slide[1] * off).toFixed(2)})`;
      for (const g of slides) g.setAttribute('transform', transform);
      needleIn?.setAttribute('d', needleD(LIVE.gauges.in, pIn.at));
      needleOut?.setAttribute('d', needleD(LIVE.gauges.out, pOut.at));
      const text = readoutOf(r);
      if (readout && text !== lastText) {
        readout.textContent = text;
        lastText = text;
      }
      /* The slider's value text changes when the phase does — not every
         frame, or a screen reader would read out a stream of numbers. */
      if (r.phase !== lastPhase && (r.phase === 'in' || r.phase === 'out')) {
        stage.setAttribute('aria-valuetext', text);
        lastPhase = r.phase;
      }
      return r;
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      if (touring) {
        clock += dt;
        const at = clock < TOUR_FIRST ? 0 : (clock - TOUR_FIRST) % (TOUR_OUT + TOUR_IN);
        state.target = clock < TOUR_FIRST || at >= TOUR_IN ? 0 : 1;
      }
      const tau = state.target < state.t ? TAU / REVERSE_SCALE : TAU;
      state.t = calm ? state.target : follow(state.t, state.target, dt, tau);
      const r = readingAt(state.t);
      const a = spring(pIn, r.pIn, dt, 90, 14, calm);
      const b = spring(pOut, r.pOut, dt, 90, 14, calm);
      draw();
      if (!touring && a && b && state.t === state.target) stop();
    };

    const start = () => {
      if (running || !visible) return;
      running = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };

    const steer = (target: number) => {
      touring = false;
      state.target = Math.min(1, Math.max(0, target));
      stage.setAttribute('aria-valuenow', String(Math.round(state.target * 100)));
      idle?.kill();
      idle = gsap.delayedCall(IDLE_BACK, () => {
        touring = !calm;
        clock = TOUR_FIRST;
        start();
      });
      start();
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]?.isIntersecting ?? visible;
        if (visible) start();
        else stop();
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(stage);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = stage.getBoundingClientRect();
      steer(((event.clientX - box.left) / box.width - 0.3) / 0.4);
    };
    const onClick = () => steer(state.target > 0.5 ? 0 : 1);
    const onKey = (event: KeyboardEvent) => {
      let to: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') to = state.target + 0.25;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') to = state.target - 0.25;
      if (event.key === 'Home') to = 0;
      if (event.key === 'End') to = 1;
      if (event.key === ' ' || event.key === 'Enter') to = state.target > 0.5 ? 0 : 1;
      if (to === null) return;
      event.preventDefault();
      steer(to);
    };

    if (desktop) stage.addEventListener('pointermove', onMove);
    stage.addEventListener('click', onClick);
    stage.addEventListener('keydown', onKey);
    draw();

    return () => {
      io.disconnect();
      stop();
      idle?.kill();
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('click', onClick);
      stage.removeEventListener('keydown', onKey);
    };
  });
  return () => mm.revert();
}
