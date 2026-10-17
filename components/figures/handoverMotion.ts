import { gsap, ScrollTrigger } from '@/lib/motion/gsap';
import { MQ, REVERSE_SCALE } from '@/lib/motion/tokens';
import { P_IN, STROKE, readingAt, readoutOf } from '@/lib/figures/handover';
import { LIVE } from './generated/handover.live';
import { follow, needleD, spring, type Spring } from './live';
import { explodeOf } from './explode';

/**
 * The moving parts of /about's Fig. 01 — the slide plate and two needles. D-064.
 *
 * Imported by `HandoverLive` on mount. The SVG is server-rendered; this finds its parts by
 * `data-part` and writes attributes on them. Nothing re-renders per frame.
 *
 * · **One loop.** The site's GSAP ticker (non-negotiable 7), added only while
 *   the figure is on screen and something is still moving.
 * · **It assembles as you scroll it in**, desktop only (`MQ.desktop`,
 *   non-negotiable 6, the gate the site's other scroll effects use). It
 *   arrives taken apart and the assemblies land in reverse leaving order, the
 *   gauges last; scrolling back up takes it apart again. Below 992px and under
 *   reduced motion it is simply assembled.
 * · **Water runs only when the line is whole.** Flow marks travel along the
 *   pipes and down the receiver's glass at a speed in proportion to the model's
 *   flow: a tenth slower with the screen in, stopped when the plate shuts the
 *   line. Until it is assembled the gauges read zero; an open line holds
 *   nothing.
 * · **Click, tap, Space or Enter** slides the screen in or out; arrows, Home and
 *   End step it. There is no hover-scrub: it fought the click (D-064).
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
/** Seconds the explode lags the scroll by: a little weight, not a scrub. */
const TAU_APART = 0.22;
/** Flow-mark speed at full flow, viewBox units per second. */
const FLOW_SPEED = 26;
const FLOW_OPEN = readingAt(0).flow;
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
  const flows = Array.from(stage.querySelectorAll<SVGPathElement>('[data-part="flow"]'));
  const explode = explodeOf(stage, LIVE.pieces);

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, reduced: MQ.reduced }, (context) => {
    const { desktop, reduced } = context.conditions as Record<string, boolean>;
    const calm = Boolean(reduced);
    const scrolls = Boolean(desktop) && !calm;
    const state = { t: 0, target: 0, q: scrolls ? 1 : 0, qTarget: scrolls ? 1 : 0 };
    const pIn: Spring = { at: scrolls ? 0 : P_IN, rate: 0 };
    const pOut: Spring = { at: scrolls ? 0 : readingAt(0).pOut, rate: 0 };
    const water = { at: scrolls ? 0 : 1, dash: 0 };
    let touring = !calm;
    let clock = 0;
    let running = false;
    let visible = false;
    let lastText = '';
    let lastPhase = '';
    let idle: gsap.core.Tween | undefined;

    const draw = () => {
      const shares = explode.set(state.q);
      const home = explode.home();
      const r = readingAt(state.t);
      /* The plate's own travel, plus drawn out of the body while apart. */
      const off = state.t * STROKE - LIVE.slideApart * (shares[LIVE.changer] ?? 0);
      const transform = `translate(${(LIVE.slide[0] * off).toFixed(2)} ${(LIVE.slide[1] * off).toFixed(2)})`;
      for (const g of slides) g.setAttribute('transform', transform);
      needleIn?.setAttribute('d', needleD(LIVE.gauges.in, pIn.at));
      needleOut?.setAttribute('d', needleD(LIVE.gauges.out, pOut.at));
      const opacity = (0.85 * water.at).toFixed(3);
      for (const f of flows) {
        f.style.opacity = opacity;
        f.style.strokeDashoffset = water.dash.toFixed(2);
      }
      const away = shares.filter((x) => x > 1e-3).length;
      const text = home
        ? readoutOf(r)
        : shares.every((x) => x > 0.999)
          ? 'taken apart · scroll to assemble'
          : `assembling · ${shares.length - away} of ${shares.length} home`;
      if (readout && text !== lastText) {
        readout.textContent = text;
        lastText = text;
      }
      /* The slider's value text changes when the phase does — not every
         frame, or a screen reader would read out a stream of numbers. */
      if (home && r.phase !== lastPhase && (r.phase === 'in' || r.phase === 'out')) {
        stage.setAttribute('aria-valuetext', text);
        lastPhase = r.phase;
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      /* Coming apart is the reverse, so it runs faster (non-negotiable 5). */
      const tauQ = state.qTarget > state.q ? TAU_APART / REVERSE_SCALE : TAU_APART;
      state.q = calm ? state.qTarget : follow(state.q, state.qTarget, dt, tauQ);
      explode.set(state.q);
      const home = explode.home();
      if (touring && home) {
        clock += dt;
        const at = clock < TOUR_FIRST ? 0 : (clock - TOUR_FIRST) % (TOUR_OUT + TOUR_IN);
        state.target = clock < TOUR_FIRST || at >= TOUR_IN ? 0 : 1;
      }
      const tau = state.target < state.t ? TAU / REVERSE_SCALE : TAU;
      state.t = calm ? state.target : follow(state.t, state.target, dt, tau);
      const r = readingAt(state.t);
      spring(pIn, home ? r.pIn : 0, dt, 90, 14, calm);
      spring(pOut, home ? r.pOut : 0, dt, 90, 14, calm);
      water.at = calm ? (home ? 1 : 0) : follow(water.at, home ? 1 : 0, dt, 0.4);
      if (!calm) water.dash -= FLOW_SPEED * (home ? r.flow / FLOW_OPEN : 0) * water.at * dt;
      draw();
    };

    /* The loop runs whenever the figure is on screen: the water never stops
       while the line is whole. Off screen it costs nothing. */
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
      });
      start();
    };

    /* Assembled by the time the figure's centre is a little above the middle
       of the screen; taken apart again as it scrolls back down out of view. */
    if (scrolls) {
      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        end: 'center 55%',
        onUpdate: (self) => {
          state.qTarget = 1 - self.progress;
          start();
        },
      });
      state.qTarget = 1 - trigger.progress;
      state.q = state.qTarget;
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]?.isIntersecting ?? visible;
        if (visible) start();
        else stop();
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(stage);

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

    stage.addEventListener('click', onClick);
    stage.addEventListener('keydown', onKey);
    draw();

    return () => {
      io.disconnect();
      stop();
      idle?.kill();
      stage.removeEventListener('click', onClick);
      stage.removeEventListener('keydown', onKey);
      explode.set(0);
    };
  });
  return () => mm.revert();
}
