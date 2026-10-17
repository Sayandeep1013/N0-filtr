/**
 * Shared parts for the bench figures (D-064). Built with the anatomy kit, which
 * is vendored beside this file in `kit/` so the repo builds on its own.
 *
 * Both figures are one rig family — the same plate, flanges, pipe, tees, stands
 * and gauges — so the 404 reads as a page torn from the same notebook as /about.
 *
 * Everything here returns strings or records items into a recorder; nothing
 * touches the DOM. `emit.mjs` turns a finished figure into a TS module.
 */

import * as k from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as A from './kit/audit.mjs';

export { k, G, A };

export const S = (paths, style) => k.solidSvg(paths, style);
export const L = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);

/** One figure: a projection, a recorder, and the helpers that put into it. */
export function figure({ width, height, azimuth, pad, points }) {
  const P = k.fitProjection(points, width, height, { pad, azimuth });
  const R = A.recorder(P);
  const V = G.viewOf(P);
  const at = (p) => k.iso(p, P);
  const under = [];
  const put = (name, centre, svg, shapes = [], extra = {}) =>
    R.put({ name: R.nameFor(name), at: centre, svg, shapes: shapes.map((shape) => R.solid({ ...shape, name: shape.name ?? name })), ...extra });
  return { P, R, V, at, put, under, width, height };
}

/** Settles the painter's keys from the recorded shapes and returns the body. */
export function finish(fig, options = {}) {
  A.settle(fig.R, fig.P, { states: [0] });
  fig.R.items.sort((a, b) => a.key - b.key);
  A.auditOrExit(fig.R, fig.P, options);
  return fig.under.join('') + fig.R.items.map((item) => item.svg).join('');
}

const byDepth = (P, points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

/** Base plate on feet, groove, corner screws. Grounds everything (`stand.`). */
export function basePlate(fig, plan, { thick = 10, foot = 5, slots = [] } = {}) {
  const { P, at, put } = fig;
  fig.under.push(`<path class="iso-halo" d="${k.haloOf(plan, -thick - foot, thick, P)}"/>`);
  for (const [x, y] of byDepth(P, k.corners(plan, 20))) {
    put(
      'stand.foot',
      [x, y, -thick - foot],
      S(k.cylinder(x, y, 7, -thick - foot, 1.6, P, 28), { tone: 'lo' }) + S(k.cylinder(x, y, 5.4, -thick - foot + 1.6, foot - 1.6, P, 28), { tone: 'mid' }),
      [A.cylinder(x, y, 7, -thick - foot, 1.6), A.cylinder(x, y, 5.4, -thick - foot + 1.6, foot - 1.6)],
      { key: -1e6 },
    );
  }
  const screws = k.corners(plan, 9);
  put(
    'stand.base',
    [plan.x + plan.w / 2, plan.y + plan.d / 2, -thick],
    S(k.slabOf(plan, -thick, thick, P, 8, 1.6), { tone: 'mid' }) +
      L(k.planOutline(k.insetPlan(plan, 5), 0, P), { tone: 'lo' }) +
      L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }) +
      D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }) +
      L(slots.map((slot) => k.planOutline(slot, 0, P, 4) + k.planOutline(k.insetPlan(slot, 1.1), 0, P, 4)).join(''), { tone: 'faint' }),
    [A.slab(plan, -thick, thick)],
    { key: -1e5 },
  );
}

/** A ruler strip on the plate's top, ticks rooted on its edge. */
export function ruler(fig, strip) {
  const { P, at, put } = fig;
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  put(
    'stand.ruler',
    [strip.x + strip.w / 2, strip.y + strip.d / 2, 0],
    S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }) +
      L(ticks.minor, { tone: 'lo' }) +
      L(ticks.major, { tone: 'mid' }) +
      D([at([strip.x + 2, strip.y + strip.d / 2, 0.6]), at([strip.x + strip.w - 2, strip.y + strip.d / 2, 0.6])], { size: 0.45 }),
    [A.slab(strip, 0, 0.6, {}, 3)],
  );
}

/** A label plate: inset outline, three rule lines that stand for print, two screws. */
export function labelPlate(fig, plan, { text } = {}) {
  const { P, at, put } = fig;
  const z = 0.8;
  const rows = [0.62, 0.86, 0.44];
  const rules = rows
    .map((share, index) => {
      const y = plan.y + 3.6 + index * ((plan.d - 7.2) / (rows.length - 1));
      return k.lineOnTop([plan.x + 5, y], [plan.x + 5 + (plan.w - 12) * share, y], z, P);
    })
    .join('');
  const label = text
    ? k.faceTextSvg(k.topMatrix([plan.x + plan.w - 4.5, plan.y + plan.d - 2.6], z, P, 'x'), text, { size: 2.6, tone: 'mid', anchor: 'end' })
    : '';
  put(
    'stand.label',
    [plan.x + plan.w / 2, plan.y + plan.d / 2, 0],
    S(k.slabOf(plan, 0, z, P, 4), { tone: 'lo', crease: 'none' }) +
      L(k.planOutline(k.insetPlan(plan, 1.6), z, P, 4), { tone: 'faint' }) +
      L(rules, { tone: 'lo', free: true }) +
      label +
      D([at([plan.x + 2.6, plan.y + plan.d / 2, z]), at([plan.x + plan.w - 2.6, plan.y + plan.d / 2, z])], { size: 0.45 }),
    [A.slab(plan, 0, z, {}, 4)],
  );
}

/** Frame along x through a point — the pipe line's own axis. */
export const alongX = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

/** A straight pipe run from x0 to x1 at (y, z). */
export function pipe(fig, name, x0, x1, y, z, r, { tone = 'mid', owner } = {}) {
  const { P, put } = fig;
  const F = alongX([x0, y, z]);
  const len = x1 - x0;
  const seam = len > 30 ? L(G.arcOf(F, len / 2, r, P), { tone: 'faint' }) : '';
  put(name, [(x0 + x1) / 2, y, z], S(G.disc(0, len, r, F, P), { tone, inner: seam }), [A.disc(F, 0, len, r, owner ? { owner } : {})]);
}

/** A bolted flange: disc on the x axis, bolt dots on the face that turns toward you. */
export function flange(fig, name, x, y, z, { r = 11, t = 3, bolts = 4, facing = 1 } = {}) {
  const { P, put } = fig;
  const F = alongX([x - t / 2, y, z]);
  const face = facing > 0 ? t : 0;
  const dots = G.dotsOf(F, face, r * 0.72, bolts, P, { phase: Math.PI / bolts, all: true });
  const seen = G.dot3([facing, 0, 0], fig.V) > 0.12;
  put(name, [x, y, z], S(G.disc(0, t, r, F, P), { tone: 'mid' }) + (seen ? D(dots, { size: 0.55 }) : ''), [A.disc(F, 0, t, r)]);
}

/** Tee ball radius, and where a 6-radius run ends either side of its centre:
 *  rim 0.2 inside the ball, so the run never pokes out past the casting. */
export const TEE_R = 7.4;
export const TEE_IN = 4.0;

/** A cast tee: a ball the run is gapped under, the branch leaving its top. */
export function tee(fig, name, c, r, { owner } = {}) {
  const { P, put } = fig;
  put(name, c, S(G.sphereOf(c, r, P), { tone: 'mid' }), [A.ball(c, r, owner ? { owner } : {})]);
}

/** Vertical round post or riser. */
export function post(fig, name, x, y, z, h, r, { tone = 'mid', seams = [], owner } = {}) {
  const { P, put } = fig;
  const inner = seams.length ? L(seams.map((s) => k.sideArc(x, y, r, s, P, 16)).join(''), { tone: 'faint' }) : '';
  put(name, [x, y, z + h / 2], S(k.cylinder(x, y, r, z, h, P, 24), { tone, crease: 'none', inner }), [A.cylinder(x, y, r, z, h, owner ? { owner } : {})]);
}

/** A hex nut on a vertical axis. */
export function hexNut(fig, name, x, y, z, h, r) {
  const { P, put } = fig;
  const F = G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const hex = Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3 + Math.PI / 6) * r, Math.sin((i * Math.PI) / 3 + Math.PI / 6) * r]);
  put(name, [x, y, z + h / 2], S(G.prismOf(F, hex, 0, h, P), { tone: 'mid' }), [A.prism(F, hex, 0, h)]);
}

/**
 * A pipe stand: a pedestal on the plate and a clamp ring round the pipe. The
 * ring gaps the pipe, so the caller ends its runs on the ring's faces.
 */
export function pipeStand(fig, name, x, y, zPipe, rPipe, { ring = 4 } = {}) {
  const { P, at, put } = fig;
  const rOut = rPipe + 2.4;
  const top = zPipe - rOut;
  const ped = { x: x - 6, y: y - 9, w: 12, d: 18, r: 2 };
  put(
    `${name}.pedestal`,
    [x, y, top / 2],
    S(k.slabOf({ x: x - 9, y: y - 12, w: 18, d: 24, r: 3 }, 0, 3, P, 4, 0.5), { tone: 'mid' }) +
      D([at([x - 6, y + 9, 3]), at([x + 6, y + 9, 3])], { size: 0.45 }) +
      S(k.slabOf(ped, 3, top - 3, P, 3, 0.4), { tone: 'mid', inner: L(k.sideSeam(ped, top - 6, P, 3), { tone: 'faint' }) }),
    [A.slab({ x: x - 9, y: y - 12, w: 18, d: 24, r: 3 }, 0, 3), A.slab(ped, 3, top - 3, {}, 3)],
  );
  const F = alongX([x - ring / 2, y, zPipe]);
  put(
    `${name}.clamp`,
    [x, y, zPipe],
    S(G.ringBand(0, ring, rPipe, rOut, F, P), { tone: 'mid' }) + D([at([x + ring / 2, y - rOut + 0.9, zPipe + 2]), at([x + ring / 2, y + rOut - 0.9, zPipe + 2])], { size: 0.5 }),
    [A.ring(F, 0, ring, rPipe, rOut)],
  );
  return { from: x - ring / 2, to: x + ring / 2 };
}

/**
 * A Bourdon pressure gauge whose face turns horizontally toward the viewer, so
 * its dial projects to an upright ellipse: `kx` screen units per world unit
 * across, `ky` up. That is all the client needs to swing the needle.
 *
 * Bottom-mounted on a riser from a tee; the riser's rim lands on the case side.
 */
export function gauge(fig, name, c, { R = 13, depth = 6, max = 4, label = 'bar', owner = name, value = 0 } = {}) {
  const { P, at, put, V } = fig;
  const { sinA, cosA, cosE, k: kk } = k.cameraOf(P);
  const n = [cosA, sinA, 0];
  const h = [sinA, -cosA, 0];
  const up = [0, 0, 1];
  const back = G.sub3(c, G.mul3(n, depth / 2));
  const F = G.frameOf(back, n, h, up);
  const faceS = depth;
  const face = G.add3(back, G.mul3(n, faceS));
  const P2 = (r, theta) => at(G.add3(face, G.add3(G.mul3(h, r * Math.sin(theta)), G.mul3(up, r * Math.cos(theta)))));
  const SWEEP = (135 * Math.PI) / 180;
  const theta = (value) => -SWEEP + ((2 * SWEEP) * value) / max;
  const rScale = R - 3.4;
  const arc = Array.from({ length: 61 }, (_, i) => P2(rScale, -SWEEP + (2 * SWEEP * i) / 60));
  const minor = [];
  const major = [];
  for (let i = 0; i <= max * 10; i++) {
    const t = theta(i / 10);
    const big = i % 5 === 0;
    (big ? major : minor).push(k.pathOf([P2(rScale, t), P2(rScale - (big ? 2.4 : 1.3), t)]));
  }
  const textAt = (r, t) => {
    const [sx, sy] = P2(r, t);
    return `matrix(${(kk).toFixed(3)} 0 0 ${(kk * cosE).toFixed(3)} ${sx.toFixed(2)} ${sy.toFixed(2)})`;
  };
  const numerals = Array.from({ length: max + 1 }, (_, i) =>
    k.faceTextSvg(textAt(rScale - 5, theta(i)) + ' translate(0 0.9)', String(i), { size: 2.5, tone: 'mid', anchor: 'middle' }),
  ).join('');
  const unit = k.faceTextSvg(textAt(5.4, Math.PI) + ' translate(0 0.9)', label, { size: 2.1, tone: 'lo', anchor: 'middle' });
  const centre = P2(0, 0);
  const hub = G.circleOf(F, faceS + 0.05, 1.3, P);
  const svg =
    S(G.disc(0, faceS, R + 0.5, F, P), { tone: 'mid', inner: L(G.arcOf(F, faceS - 1.4, R + 0.5, P), { tone: 'faint' }) }) +
    L(G.circleOf(F, faceS + 0.05, R - 1.2, P), { tone: 'lo' }) +
    L(k.pathOf(arc), { tone: 'lo' }) +
    L(minor.join(''), { tone: 'lo' }) +
    L(major.join(''), { tone: 'mid' }) +
    numerals +
    unit +
    `<path data-part="${name}.needle" class="iso-line" data-tone="hi" data-free="" style="stroke-width:1.1" d="${needlePath(centre, kk, kk * cosE, R - 4.4, theta(value))}"/>` +
    L(hub, { tone: 'hi' }) +
    D([centre], { size: 0.7, tone: 'hi' });
  put(name, c, svg, [A.disc(F, 0, faceS, R + 0.5, { owner })]);
  void V;
  return {
    centre,
    kx: kk,
    ky: kk * cosE,
    tip: R - 4.4,
    tail: 3,
    sweep: SWEEP,
    max,
    bottom: c[2] - Math.sqrt(R * R - 2.4 * 2.4),
  };
}

/** The needle as a path: tail behind the hub, tip at `tip`. Mirrored in the client. */
export function needlePath([cx, cy], kx, ky, tip, theta, tail = 3) {
  const sx = Math.sin(theta);
  const cy2 = Math.cos(theta);
  const a = [cx - sx * tail * kx, cy + cy2 * tail * ky];
  const b = [cx + sx * tip * kx, cy - cy2 * tip * ky];
  return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
}

/**
 * A gauge tap: tee on the run, riser, hex socket, then the gauge. Returns the
 * gauge's needle data. The run must be gapped by `teeR` either side of `x`.
 */
export function gaugeTap(fig, name, x, y, zPipe, { teeR = TEE_R, rise = 16, R = 13, max = 4, value = 0 } = {}) {
  tee(fig, `${name}.tee`, [x, y, zPipe], teeR, { owner: name });
  const riserR = 2.4;
  const z0 = zPipe + Math.sqrt(teeR * teeR - riserR * riserR);
  const nutZ = z0 + rise * 0.45;
  post(fig, `${name}.riser`, x, y, z0, nutZ - z0, riserR, { owner: name });
  hexNut(fig, `${name}.nut`, x, y, nutZ, 3.6, 3.9);
  const cz = nutZ + 3.6 + 4 + R;
  const bottom = cz - Math.sqrt((R + 0.5) ** 2 - riserR * riserR);
  post(fig, `${name}.stem`, x, y, nutZ + 3.6, bottom - nutZ - 3.6, riserR, { owner: `${name}.gauge` });
  return gauge(fig, `${name}.gauge`, [x, y, cz], { R, max, value });
}

/** A knurled knob on a vertical axis with a pointer line on top. */
export function knob(fig, name, x, y, z, r, h) {
  const { P, at, put } = fig;
  put(
    name,
    [x, y, z + h / 2],
    S(k.cylinder(x, y, r, z, h, P, 32), { tone: 'mid' }) +
      L(k.knurl(x, y, r, z + 0.8, z + h, Math.round(r * 6), P), { tone: 'lo' }) +
      L(k.lineOnTop([x, y], [x + r * 0.75, y], z + h, P), { tone: 'hi', free: 'end' }) +
      D([at([x, y, z + h])], { size: 0.5, tone: 'hi' }),
    [A.cylinder(x, y, r, z, h)],
  );
}

/**
 * The supply: a pressure regulator on a pad — body, bonnet, lock nut, knurled
 * adjusting knob — with a hose barb out of its near face where the line is fed.
 * Its outlet face is at `reg.x + reg.w`; the caller bolts a flange to it.
 */
export function regulator(fig, REG) {
  const { P, at, put } = fig;
  const rx = REG.x + REG.w / 2;

  const pad = k.insetPlan(REG, -4);
  const bodyTop = 64;
  put(
    'reg.body',
    [rx, 0, bodyTop / 2],
    S(k.slabOf(pad, 0, 3, P, 4, 0.5), { tone: 'mid' }) +
      D(k.corners(pad, 2.4).map(([x, y]) => at([x, y, 3])), { size: 0.45 }) +
      S(k.slabOf(REG, 3, bodyTop - 3, P, 4, 0.8), { tone: 'mid', inner: L(k.sideSeam(REG, 54, P, 4) + k.sideSeam(REG, 14, P, 4), { tone: 'faint' }) }) +
      D(k.corners(REG, 3.2).map(([x, y]) => at([x, y, bodyTop])), { size: 0.5 }),
    [A.slab(pad, 0, 3, {}, 4), A.slab(REG, 3, bodyTop - 3, {}, 4)],
  );
  const bonnet = { r: 9.5, z: bodyTop, h: 11 };
  put(
    'reg.bonnet',
    [rx, 0, bonnet.z + bonnet.h / 2],
    S(k.cylinder(rx, 0, bonnet.r + 1.6, bonnet.z, 2.4, P, 40), { tone: 'mid' }) +
      S(k.cylinder(rx, 0, bonnet.r, bonnet.z + 2.4, bonnet.h - 2.4, P, 40), { tone: 'mid', inner: L(k.sideArc(rx, 0, bonnet.r, bonnet.z + 7, P, 24), { tone: 'faint' }) }),
    [A.cylinder(rx, 0, bonnet.r + 1.6, bonnet.z, 2.4), A.cylinder(rx, 0, bonnet.r, bonnet.z + 2.4, bonnet.h - 2.4)],
  );
  hexNut(fig, 'reg.locknut', rx, 0, bonnet.z + bonnet.h, 3, 5.6);
  knob(fig, 'reg.knob', rx, 0, bonnet.z + bonnet.h + 3, 6.6, 8);

  /* inlet: a hose barb out of the near face — where the idea comes in */
  const F = G.frameOf([rx, REG.y + REG.d, 22], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const barb = [
    [0, 5.2],
    [3, 5.2],
    [3, 4.4],
    [6.5, 4.4],
    [6.5, 3.1],
    [9, 3.1],
    [9, 3.7],
    [11.5, 2.6],
    [12.2, 3.5],
    [14.6, 2.4],
    [17, 2.4],
  ];
  put('reg.inlet', G.pointOf(F, 8, 0, 0), S(G.solidOf(barb, F, P), { tone: 'mid' }), [A.solid(F, barb)]);
}
