import { gsap } from '@/lib/motion/gsap';
import { hangRope, ropePath, settleRope, stepRope, type Rope, type RopePoint } from '@/lib/motion/rope';

/**
 * The wire rig over the culture collage. `[new]` — ours, not tonik's.
 *
 * Four of the six frames grow an electric pole, and ropes hang between them —
 * out of one frame, across the gap, into the next. The rope physics is in
 * `lib/motion/rope.ts`; everything here is the part that touches the DOM.
 *
 * ── Where the composition came from ─────────────────────────────────────────
 *
 * It was already there. §12's six frames are scattered at three sizes with no
 * two sharing a top edge, and two of them parallax at a different rate from
 * their neighbours — which is a set of cards at varying distances that pull
 * apart as they pass, i.e. exactly the arrangement the reference had to build
 * by hand. The wires only had to connect what the section already was.
 *
 * It is also the section that most needed something. Until T10.4 lands
 * photographs, the six frames are generated fields on a dark ground (I-042),
 * and §12 rates itself the lowest-confidence layout on the site.
 *
 * ── Four frames, not six ────────────────────────────────────────────────────
 *
 * A chain of 01 → 02 → 03 → 04, leaving 05 and 06 clean. A real street does not
 * wire every building, and six wired frames stops being an object in a
 * composition and becomes a pattern over one.
 *
 * The chain is a Z — across the top, a long diagonal down through the middle,
 * across again. An earlier version ran 02 → 04, which sit in the same column,
 * and a vertical wire is a thing wires do not do.
 *
 * ── The poles are drawn, and the wires are light ────────────────────────────
 *
 * This site has no photographs (D-038); everything is drawn. That turned out to
 * suit the idea rather than limit it — a pole is a vertical rule, two crossarms
 * and four insulator ticks, which is `<Schematic>`'s vocabulary already, and a
 * photographic pole would have been the foreign object here.
 *
 * The wires are **light**, which is the one value that had to be inverted
 * rather than transcribed. They are black in the reference because they hang
 * against a bright sky; ours hang against `--black`, and the first build
 * inherited the colour along with the idea and drew nine invisible lines.
 *
 * Each pole fades out at its base. Drawn at a flat weight, a full-height
 * vertical reads as a seam dividing the plate in two rather than as an object
 * standing in it — the reference gets away with it because its poles stand in a
 * photograph of sky and ours stand on a flat field.
 *
 * ── Above 992 only ──────────────────────────────────────────────────────────
 *
 * The plan had been static wires on mobile, on the grounds that the frames
 * still stack and can still be connected. Building it proved that wrong: in one
 * column the spans become long near-vertical cables running down the page,
 * cutting across the very frames they are meant to link. The rig needs frames
 * sitting *beside* each other with a gap to cross, and below 992 that
 * composition does not exist. Same gate as every other hover and parallax on
 * the site, and it costs the phone nothing.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

type PoleGeometry = {
  /** Where the pole stands, as a fraction of the frame's width. */
  x: number;
  /** Where its head is, as a fraction of the frame's height. Negative crops it. */
  top: number;
  /** The two crossarms, as fractions of the frame's height from its top edge. */
  a1: number;
  a2: number;
  /** Half the upper crossarm's span, as a fraction of the frame's width. */
  arm: number;
};

/** A wired frame: which of `CULTURE.frames` it is, and the pole standing in it.

    Written as an ordered list rather than as a pole table plus a list of index
    pairs. The chain is simply consecutive entries — 01 → 02 → 03 → 04 — which
    is both what it means and the version that does not need four separate
    lookups to be individually proved non-empty. */
type Node = { frame: number; pole: PoleGeometry };

/** Tuned against the six real frame ratios, so each pole sits in its own plate
    rather than at a shared fraction that suits none of them.

    **Four frames, not six.** 05 and 06 stay clean: a real street does not wire
    every building, and six wired frames stops being an object in a composition
    and becomes a pattern over one. The chain is a Z — across the top, a long
    diagonal down through the middle, across again. An earlier version paired
    02 with 04, which sit in the same column, and a vertical wire is a thing
    wires do not do.

    Frame 03's `top` is negative on purpose: its own frame edge crops the head
    off, the way the bottom-left card is cropped in the reference. */
const NODES: readonly Node[] = [
  { frame: 0, pole: { x: 0.8, top: 0.1, a1: 0.16, a2: 0.25, arm: 0.085 } },
  { frame: 1, pole: { x: 0.2, top: 0.08, a1: 0.14, a2: 0.23, arm: 0.08 } },
  { frame: 2, pole: { x: 0.62, top: -0.18, a1: 0.12, a2: 0.21, arm: 0.105 } },
  { frame: 3, pole: { x: 0.22, top: 0.09, a1: 0.15, a2: 0.24, arm: 0.09 } },
];

/** Three wires per span, at different slack so they never hang as one thick
    line, and at different weights so the bundle has a front and a back.

    `anchor` is which of the pole's three attachment points this wire takes, and
    it is a literal so the tuple index below stays typed. */
const WIRES = [
  { anchor: 0, slack: 0.12, width: 1.5, colour: '#efefef8c' },
  { anchor: 1, slack: 0.162, width: 1.1, colour: '#efefef66' },
  { anchor: 2, slack: 0.094, width: 1.1, colour: '#efefef59' },
] as const;

const GRAVITY = 0.42;
const DAMPING = 0.96;
const BREEZE = 0.03;

type Box = { x: number; y: number; w: number; h: number };

type Wire = {
  el: SVGPathElement;
  /** The two nodes it hangs between, resolved once at build. */
  from: Node;
  to: Node;
  /** Which of each pole's three attachment points it takes. */
  anchor: 0 | 1 | 2;
  slack: number;
  /** Only for phasing the breeze, so nine wires do not breathe in unison. */
  phase: number;
  rope: Rope | null;
};

/** A pole's three attachment points. `side` is −1 for its left face and +1 for
    its right, so a span always leaves from the face it is heading towards. */
function anchors(
  pole: PoleGeometry,
  box: Box,
  side: number,
): readonly [RopePoint, RopePoint, RopePoint] {
  const cx = box.x + pole.x * box.w;
  const arm = pole.arm * box.w;
  return [
    { x: cx + side * arm, y: box.y + pole.a1 * box.h },
    { x: cx + side * arm * 0.58, y: box.y + pole.a2 * box.h },
    { x: cx, y: box.y + Math.max(pole.top, 0.02) * box.h + 1 },
  ];
}

function polePath(pole: PoleGeometry, box: Box): string {
  const cx = box.x + pole.x * box.w;
  const arm = pole.arm * box.w;
  const y1 = box.y + pole.a1 * box.h;
  const y2 = box.y + pole.a2 * box.h;

  let d = `M${cx},${box.y + pole.top * box.h}L${cx},${box.y + box.h}`;
  d += `M${cx - arm},${y1}L${cx + arm},${y1}`;
  d += `M${cx - arm * 0.58},${y2}L${cx + arm * 0.58},${y2}`;

  // Insulators — four short verticals at the arm ends. Without them the pole
  // reads as a plus sign.
  for (const [f, y] of [
    [-1, y1],
    [1, y1],
    [-0.58, y2],
    [0.58, y2],
  ] as const) {
    const x = cx + f * arm;
    d += `M${x},${y - 6}L${x},${y}`;
  }
  return d;
}

export type WireRigOptions = {
  /** Under `reduce` the ropes are settled once and never touched again. */
  reduced: boolean;
};

/**
 * Build the rig inside `scope`. Returns a cleanup that removes everything it
 * added, including the drag listeners and the ticker callback.
 */
export function createWireRig(scope: HTMLElement, options: WireRigOptions): () => void {
  const svg = scope.querySelector<SVGSVGElement>('[data-wire-rig]');
  const frames = [...scope.querySelectorAll<HTMLElement>('[data-culture-frame]')];
  if (!svg || frames.length < 4) return () => {};

  const defs = document.createElementNS(SVG_NS, 'defs');
  const poleGroup = document.createElementNS(SVG_NS, 'g');
  const wireGroup = document.createElementNS(SVG_NS, 'g');
  svg.append(defs, poleGroup, wireGroup);

  // One gradient, shared. `objectBoundingBox` units, so each pole fades over
  // its own height rather than over the collage's.
  const gradient = document.createElementNS(SVG_NS, 'linearGradient');
  gradient.setAttribute('id', 'wire-rig-pole');
  gradient.setAttribute('x1', '0');
  gradient.setAttribute('y1', '0');
  gradient.setAttribute('x2', '0');
  gradient.setAttribute('y2', '1');
  for (const [offset, opacity] of [
    ['0', '1'],
    ['0.3', '1'],
    ['0.68', '0.25'],
    ['1', '0'],
  ] as const) {
    const stop = document.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', '#efefef');
    stop.setAttribute('stop-opacity', opacity);
    gradient.append(stop);
  }
  defs.append(gradient);

  /* One drawn pole per node, each clipped to its own frame — which is what
     lets 03's head be cropped by the frame edge rather than by a guess. */
  const drawn = NODES.map((node) => {
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', `wire-rig-clip-${node.frame}`);
    const rect = document.createElementNS(SVG_NS, 'rect');
    clip.append(rect);
    defs.append(clip);

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'url(#wire-rig-pole)');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('clip-path', `url(#wire-rig-clip-${node.frame})`);
    poleGroup.append(path);

    return { node, path, rect };
  });

  /* Spans are consecutive nodes. Built in a loop with both ends resolved here,
     so nothing downstream has to look a pole up by index and prove it exists. */
  const wires: Wire[] = [];
  for (let i = 0; i + 1 < NODES.length; i += 1) {
    const from = NODES[i];
    const to = NODES[i + 1];
    if (!from || !to) continue;

    for (const spec of WIRES) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-width', String(spec.width));
      path.setAttribute('stroke', spec.colour);
      wireGroup.append(path);
      wires.push({
        el: path,
        from,
        to,
        anchor: spec.anchor,
        slack: spec.slack,
        phase: i * 2.1 + spec.anchor,
        rope: null,
      });
    }
  }

  /* ── dragging ──────────────────────────────────────────────────────────────
     Written as two custom properties on an inner wrapper, which CSS applies
     with the `translate` property. §12's parallax owns the *frame's* transform
     through GSAP, so the two compose without either knowing about the other:
     a card a visitor has moved still drifts with the scroll like its
     neighbours.

     It is a separate element on purpose. The frame's transform belongs to
     §12's parallax, and two writers on one transform is a race worth not
     having — CSS composing an independent `translate` with GSAP's `transform`
     costs nothing and cannot be got wrong.

     **Mouse and pen only.** A touchscreen laptop is above 992 and would
     otherwise have its vertical scroll captured the moment a finger landed on a
     frame — the cards are decoration, and taking scrolling away from someone to
     protect a toy is the wrong trade. */
  let held: { frame: HTMLElement; x: number; y: number } | null = null;

  const listeners = frames.map((frame) => {
    const offset = { x: 0, y: 0 };
    const target = frame.querySelector<HTMLElement>('[data-culture-drag]') ?? frame;
    const set = (x: number, y: number) => {
      target.style.setProperty('--drag-x', `${x}px`);
      target.style.setProperty('--drag-y', `${y}px`);
    };

    const down = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      held = { frame, x: event.clientX, y: event.clientY };
      frame.setPointerCapture(event.pointerId);
      frame.dataset.held = '';
      event.preventDefault();
    };

    const move = (event: PointerEvent) => {
      if (held?.frame !== frame) return;
      offset.x += event.clientX - held.x;
      offset.y += event.clientY - held.y;
      held.x = event.clientX;
      held.y = event.clientY;
      set(offset.x, offset.y);
    };

    const up = () => {
      if (held?.frame !== frame) return;
      held = null;
      delete frame.dataset.held;
    };

    frame.addEventListener('pointerdown', down);
    frame.addEventListener('pointermove', move);
    frame.addEventListener('pointerup', up);
    frame.addEventListener('pointercancel', up);
    return { frame, target, down, move, up };
  });

  /* ── the loop ──────────────────────────────────────────────────────────────
     On GSAP's ticker, never a second `requestAnimationFrame` — CLAUDE.md
     non-negotiable 7, and `verify:motion` probes for exactly this. */
  const boxes = new Map<number, Box>();

  const measure = () => {
    const rigBox = svg.getBoundingClientRect();
    frames.forEach((frame, index) => {
      const media = frame.querySelector('[data-culture-media]') ?? frame;
      const box = media.getBoundingClientRect();
      boxes.set(index, {
        x: box.left - rigBox.left,
        y: box.top - rigBox.top,
        w: box.width,
        h: box.height,
      });
    });
  };

  const drawPoles = () => {
    for (const { node, path, rect } of drawn) {
      const box = boxes.get(node.frame);
      if (!box) continue;
      path.setAttribute('d', polePath(node.pole, box));
      rect.setAttribute('x', String(box.x));
      rect.setAttribute('y', String(box.y));
      rect.setAttribute('width', String(box.w));
      rect.setAttribute('height', String(box.h));
    }
  };

  /* Which face of each pole the span leaves from is decided by where the other
     pole actually is on screen — not by a fixed left/right — so a card dragged
     across its neighbour re-hangs its wires on the correct side instead of
     looping them back through the pole. */
  const endpoints = (wire: Wire): readonly [RopePoint, RopePoint] | null => {
    const a = boxes.get(wire.from.frame);
    const b = boxes.get(wire.to.frame);
    if (!a || !b) return null;

    const direction = b.x + b.w * wire.to.pole.x > a.x + a.w * wire.from.pole.x ? 1 : -1;
    return [
      anchors(wire.from.pole, a, direction)[wire.anchor],
      anchors(wire.to.pole, b, -direction)[wire.anchor],
    ];
  };

  const step = (time: number) => {
    measure();
    drawPoles();

    for (const wire of wires) {
      const ends = endpoints(wire);
      if (!ends) continue;
      const [a, b] = ends;

      if (!wire.rope) {
        wire.rope = hangRope(a, b, wire.slack);
        if (options.reduced) settleRope(wire.rope, a, b, GRAVITY, DAMPING);
      } else if (!options.reduced) {
        const wind = Math.sin(time * 0.8 + wire.phase) * BREEZE;
        stepRope(wire.rope, a, b, GRAVITY, DAMPING, wind);
      }

      wire.el.setAttribute('d', ropePath(wire.rope));
    }
  };

  if (options.reduced) {
    // Drawn once, hanging correctly, and then never touched again.
    step(0);
  } else {
    gsap.ticker.add(step);
  }

  const onResize = () => {
    // Every rope was cut for a span that no longer exists.
    for (const wire of wires) wire.rope = null;
  };
  window.addEventListener('resize', onResize);

  return () => {
    gsap.ticker.remove(step);
    window.removeEventListener('resize', onResize);
    for (const { frame, target, down, move, up } of listeners) {
      frame.removeEventListener('pointerdown', down);
      frame.removeEventListener('pointermove', move);
      frame.removeEventListener('pointerup', up);
      frame.removeEventListener('pointercancel', up);
      delete frame.dataset.held;
      target.style.removeProperty('--drag-x');
      target.style.removeProperty('--drag-y');
    }
    svg.replaceChildren();
  };
}
