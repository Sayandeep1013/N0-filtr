import { gsap } from '@/lib/motion/gsap';
import { MQ, REVERSE_SCALE } from '@/lib/motion/tokens';
import { LIFT, TURNS, readoutOf, stepLine, type Line } from '@/lib/figures/deadEnd';
import { LIVE } from './generated/deadEnd.live';
import { follow, needleD, spokesD, spring, type Spring } from './live';
export { SVG } from './generated/deadEnd.svg';

/**
 * The moving parts of the 404's figure — handwheel spokes, the rising stem and
 * the needle. D-064. The same rules as `HandoverLive`: the one GSAP ticker,
 * only while on screen and moving; hover-scrub gated to `MQ.desktop`; click,
 * tap, Space or Enter toggles; closing runs `REVERSE_SCALE` faster; an idle
 * tour opens and shuts the valve; reduced motion lands every change at once.
 *
 * The wheel turns with the valve's opening — `TURNS` full turns from shut to
 * open, counter-clockwise seen from above, as every gate valve opens.

 *
 * Imported by `DeadEndLive` on mount, with the drawing, as one chunk.
 */

const TAU = 0.55;
const TOUR_FIRST = 1.4;
const TOUR_OPEN = 3.4;
const TOUR_SHUT = 2.6;
const IDLE_BACK = 3.6;

/** Starts the figure on its stage; returns the teardown. */
export function run(stage: HTMLElement): () => void {
  const figure = stage.closest('figure');
  if (!figure) return () => undefined;
  const readout = figure.querySelector<HTMLElement>('[data-readout]');
  const spokes = stage.querySelector<SVGPathElement>('[data-part="spokes"]');
  const stem = stage.querySelector<SVGGElement>('[data-part="stem"]');
  const needle = stage.querySelector<SVGPathElement>('[data-part="down.tap.gauge.needle"]');

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, reduced: MQ.reduced }, (context) => {
    const { desktop, reduced } = context.conditions as Record<string, boolean>;
    const calm = Boolean(reduced);
    const line: Line = { open: 0, p: 0 };
    const gauge: Spring = { at: 0, rate: 0 };
    let target = 0;
    let touring = !calm;
    let clock = 0;
    let running = false;
    let visible = false;
    let lastText = '';
    let lastWord = '';
    let idle: gsap.core.Tween | undefined;

    const draw = () => {
      spokes?.setAttribute('d', spokesD(LIVE.wheel, line.open * TURNS * 2 * Math.PI));
      const rise = line.open * LIFT;
      stem?.setAttribute('transform', `translate(${(LIVE.up[0] * rise).toFixed(2)} ${(LIVE.up[1] * rise).toFixed(2)})`);
      needle?.setAttribute('d', needleD(LIVE.gauge, gauge.at));
      const text = readoutOf(line);
      if (readout && text !== lastText) {
        readout.textContent = text;
        lastText = text;
      }
      /* Value text on the settled phases only, never per frame. */
      const word = text.split(' · ')[0];
      if (word !== lastWord && (word === 'valve open' || word === 'valve shut')) {
        stage.setAttribute('aria-valuetext', text);
        lastWord = word;
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      if (touring) {
        clock += dt;
        const at = clock < TOUR_FIRST ? -1 : (clock - TOUR_FIRST) % (TOUR_OPEN + TOUR_SHUT);
        target = at >= 0 && at < TOUR_OPEN ? 1 : 0;
      }
      const tau = target < line.open ? TAU / REVERSE_SCALE : TAU;
      line.open = calm ? target : follow(line.open, target, dt, tau);
      const filled = stepLine(line, dt, calm);
      const swung = spring(gauge, line.p, dt, 90, 14, calm);
      draw();
      if (!touring && filled && swung && line.open === target) stop();
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

    const steer = (to: number) => {
      touring = false;
      target = Math.min(1, Math.max(0, to));
      stage.setAttribute('aria-valuenow', String(Math.round(target * 100)));
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
    const onClick = () => steer(target > 0.5 ? 0 : 1);
    const onKey = (event: KeyboardEvent) => {
      let to: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') to = target + 0.25;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') to = target - 0.25;
      if (event.key === 'Home') to = 0;
      if (event.key === 'End') to = 1;
      if (event.key === ' ' || event.key === 'Enter') to = target > 0.5 ? 0 : 1;
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
