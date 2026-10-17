/**
 * The 404's figure — "Dead end". D-064.
 *
 *   npx tsx tools/figures/dead-end.mjs            build
 *   npx tsx tools/figures/dead-end.mjs --audit    build, then prove the geometry
 *
 * Same bench, same parts as /about's Fig. 01, so the page reads as torn from the
 * same notebook: a regulator, a block-and-bleed gate valve with a handwheel and
 * a rising stem, a gauge, and a line that ends in a blind flange with a lockout
 * tag on it. Open the valve and the gauge climbs to 4.04 bar and stays there:
 * full pressure, no flow, nowhere to go.
 *
 * The handwheel's spokes turn and the stem rises; both are redrawn by the client
 * from the handful of screen vectors this writes out.
 */

import { P_SET, LIFT } from '../../lib/figures/deadEnd.ts';
import { k, G, A, S, L, D, figure, finish, TEE_IN, basePlate, ruler, labelPlate, alongX, pipe, flange, gaugeTap, pipeStand, hexNut, regulator } from './parts.mjs';
import { emit } from './emit.mjs';
import { spokesD } from '../../components/figures/live.ts';

const WIDTH = 600;
const HEIGHT = 380;
const Z = 48;
const RP = 6;
const PLATE = { x: -130, y: -60, w: 250, d: 118, r: 8 };
const REG = { x: -120, y: -14, w: 30, d: 28, r: 3 };

const VX = -50; // valve centre
const VALVE = { x: VX - 12, y: -12, w: 24, d: 24, r: 4 };
const VZ = [30, 64];
const WHEEL = { z: 104, rIn: 12, rOut: 14.6, h: 2.4, hub: 3.6 };
const TAP_X = -8;
const BLIND_X = 84; // the blind flange's back face

void P_SET;

const fig = figure({
  width: WIDTH,
  height: HEIGHT,
  azimuth: 57,
  pad: 24,
  points: [...k.boxCorners(PLATE, -15, 0), [VX, 0, WHEEL.z + 16 + LIFT], [VX - 15, 0, WHEEL.z], [VX + 15, 0, WHEEL.z], [TAP_X, 0, 98]],
});
const { P, at, put } = fig;

basePlate(fig, PLATE, {
  slots: [
    { x: -110, y: -48, w: 210, d: 5, r: 2.5 },
    { x: -110, y: 36, w: 92, d: 5, r: 2.5 },
  ],
});
ruler(fig, { x: -112, y: 46, w: 84, d: 7, r: 1 });
labelPlate(fig, { x: 4, y: 36, w: 46, d: 16, r: 1.6 }, { text: 'NF-404' });

regulator(fig, REG);
const REG_FACE = REG.x + REG.w;
flange(fig, 'up.flange.reg', REG_FACE + 1.5, 0, Z, { facing: 1 });
pipe(fig, 'up.pipe', REG_FACE + 3, VALVE.x - 3, 0, Z, RP);
flange(fig, 'valve.flange.in', VALVE.x - 1.5, 0, Z, { facing: -1 });

/* ── the valve: body on a support, bonnet, yoke, stem, handwheel ──────── */
{
  const [z0, z1] = VZ;
  const support = { x: VX - 9, y: -10, w: 18, d: 20, r: 2 };
  const foot = k.insetPlan(support, -3);
  put(
    'valve.support',
    [VX, 0, z0 / 2],
    S(k.slabOf(foot, 0, 3, P, 3, 0.5), { tone: 'mid' }) +
      D(k.corners(foot, 2.2).map(([x, y]) => at([x, y, 3])), { size: 0.45 }) +
      S(k.slabOf(support, 3, z0 - 3, P, 3, 0.4), { tone: 'mid', inner: L(k.sideSeam(support, z0 - 5, P, 3), { tone: 'faint' }) }),
    [A.slab(foot, 0, 3, {}, 3), A.slab(support, 3, z0 - 3, {}, 3)],
  );
  put(
    'valve.body',
    [VX, 0, (z0 + z1) / 2],
    S(k.slabOf(VALVE, z0, z1 - z0, P, 5, 0.8), { tone: 'mid', inner: L(k.sideSeam(VALVE, z0 + 6, P, 5) + k.sideSeam(VALVE, z1 - 6, P, 5), { tone: 'faint' }) }),
    [A.slab(VALVE, z0, z1 - z0, {}, 5)],
  );
  /* bonnet with its bolted flange */
  put(
    'valve.bonnet',
    [VX, 0, z1 + 4],
    S(k.cylinder(VX, 0, 10.5, z1, 2.6, P, 40), { tone: 'mid' }) +
      D(Array.from({ length: 6 }, (_, i) => (i / 6) * 2 * Math.PI + 0.3).map((a) => at([VX + Math.cos(a) * 8.6, Math.sin(a) * 8.6, z1 + 2.6])), { size: 0.5 }) +
      S(k.cylinder(VX, 0, 7, z1 + 2.6, 6.4, P, 32), { tone: 'mid', crease: 'none' }),
    [A.cylinder(VX, 0, 10.5, z1, 2.6), A.cylinder(VX, 0, 7, z1 + 2.6, 6.4)],
  );
  /* yoke: two posts and a head the stem nut turns in */
  const yz0 = z1 + 9;
  const head = { x: VX - 7, y: -10, w: 14, d: 20, r: 2.4 };
  const hz = WHEEL.z - 10;
  for (const y of [-6.5, 6.5]) {
    put(`valve.yoke.${y < 0 ? 'back' : 'front'}`, [VX, y, (yz0 + hz) / 2], S(k.cylinder(VX, y, 1.9, yz0, hz - yz0, P, 16), { tone: 'mid', crease: 'none' }), [A.cylinder(VX, y, 1.9, yz0, hz - yz0)]);
  }
  put(
    'valve.yoke.head',
    [VX, 0, hz + 2.5],
    S(k.slabOf(head, hz, 5, P, 3, 0.5), { tone: 'mid' }) + D([at([VX, -7, hz + 5]), at([VX, 7, hz + 5])], { size: 0.45 }),
    [A.slab(head, hz, 5, {}, 3)],
  );
  hexNut(fig, 'valve.stemnut', VX, 0, hz + 5, WHEEL.z - hz - 5, 4.4);

  /* bleed port: a nipple out of the body's near face, open at its tip */
  const F = G.frameOf([VX + 4, VALVE.y + VALVE.d, z0 + 10], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const nipple = [
    [0, 3.4],
    [2.2, 3.4],
    [2.2, 2.1],
    [6.4, 2.1],
    [6.4, 2.7],
    [7.6, 2.7],
  ];
  put(
    'valve.bleed',
    G.pointOf(F, 4, 0, 0),
    S(G.solidOf(nipple, F, P), { tone: 'mid' }) + `<path class="iso-void" d="${G.circleOf(F, 7.6, 1.3, P)}"/>` + L(G.circleOf(F, 7.6, 1.3, P), { tone: 'lo' }),
    [A.solid(F, nipple)],
  );
}

/* the rising stem — moved by the client along z, inside a clip that stays put
   at the hub's top face, so the length still inside the hub is never drawn */
const hubTop = WHEEL.z + WHEEL.h + 0.4;
const STEM = { r: 1.7, z0: hubTop - 0.6, h: 12 };
{
  const front = Array.from({ length: 25 }, (_, i) => {
    const a = Math.PI / 4 + ((i / 24) * Math.PI) - Math.PI / 2 + (57 * Math.PI) / 180 - Math.PI / 4;
    return at([VX + Math.cos(a) * 6, Math.sin(a) * 6, hubTop]);
  });
  const [l, r] = [front[0], front[front.length - 1]];
  const clip = k.pathOf([...front, [r[0], r[1] - 400], [l[0], l[1] - 400]], true);
  fig.under.push(`<defs><clipPath id="de-stem"><path d="${clip}"/></clipPath></defs>`);
  put(
    'valve.stem',
    [VX, 0, STEM.z0 + STEM.h / 2],
    `<g clip-path="url(#de-stem)"><g data-part="stem">${S(k.cylinder(VX, 0, STEM.r, STEM.z0 - LIFT, STEM.h + LIFT, P, 16), { tone: 'mid', crease: 'none', inner: L(k.sideArc(VX, 0, STEM.r, STEM.z0 + STEM.h - 2, P, 12), { tone: 'faint' }) })}</g></g>`,
    [A.cylinder(VX, 0, STEM.r, hubTop, STEM.z0 + STEM.h - hubTop)],
  );
}

/* the handwheel: the rim and hub are round, so only the spokes turn */
const wheelTop = WHEEL.z + WHEEL.h;
const WHEEL_LIVE = { centre: at([VX, 0, wheelTop]), ex: k.axisVector(P, [1, 0, 0]), ey: k.axisVector(P, [0, 1, 0]), hub: WHEEL.hub, rim: WHEEL.rIn, spokes: 3 };
{
  const ringF = G.frameOf([VX, 0, WHEEL.z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  put(
    'valve.wheel',
    [VX, 0, WHEEL.z + 1],
    S(G.ringBand(0, WHEEL.h, WHEEL.rIn, WHEEL.rOut, ringF, P), { tone: 'hi', lit: true }) +
      L(k.ring(VX, 0, WHEEL.rIn, wheelTop, P, 64), { tone: 'lit' }) +
      `<path data-part="spokes" class="iso-line" data-tone="lit" d="${spokesD(WHEEL_LIVE, 0)}"/>` +
      S(k.cylinder(VX, 0, WHEEL.hub, WHEEL.z - 0.4, WHEEL.h + 0.8, P, 24), { tone: 'hi', lit: true }),
    [
      A.ring(ringF, 0, WHEEL.h, WHEEL.rIn, WHEEL.rOut),
      A.cylinder(VX, 0, WHEEL.hub, WHEEL.z - 0.4, WHEEL.h + 0.8),
      /* the spokes, as the bars they stand for, at their rest angle */
      ...[0, 1, 2].map((i) => {
        const a = (i * 2 * Math.PI) / 3;
        const mid = (WHEEL.hub + WHEEL.rIn) / 2;
        return A.orientedBox(
          [VX + Math.cos(a) * mid, Math.sin(a) * mid, WHEEL.z + WHEEL.h / 2],
          [
            [Math.cos(a), Math.sin(a), 0],
            [-Math.sin(a), Math.cos(a), 0],
            [0, 0, 1],
          ],
          [(WHEEL.rIn - WHEEL.hub) / 2 + 0.3, 0.75, WHEEL.h / 2],
        );
      }),
    ],
  );
}

/* ── downstream: valve, gauge tap, stand, blind flange ────────────────── */
const VXR = VALVE.x + VALVE.w;
flange(fig, 'valve.flange.out', VXR + 1.5, 0, Z, { facing: 1 });
pipe(fig, 'down.pipe.a', VXR + 3, TAP_X - TEE_IN, 0, Z, RP, { owner: 'down.tap' });
const gauge = gaugeTap(fig, 'down.tap', TAP_X, 0, Z, { max: 6, value: 0 });
const stand = pipeStand(fig, 'down.stand', 44, 0, Z, RP);
pipe(fig, 'down.pipe.b', TAP_X + TEE_IN, stand.from, 0, Z, RP, { owner: 'down.tap' });
pipe(fig, 'down.pipe.c', stand.to, BLIND_X - 3, 0, Z, RP);
flange(fig, 'end.flange', BLIND_X - 1.5, 0, Z, { r: 12, facing: 1, bolts: 8 });

/* the blind: a plate bolted over the end, eight studs, and a tag on a wire */
const BLIND_T = 4;
const blindFace = BLIND_X + BLIND_T;
{
  const F = alongX([BLIND_X, 0, Z]);
  const studs = Array.from({ length: 8 }, (_, i) => (i / 8) * 2 * Math.PI + Math.PI / 8);
  const studAt = (a, s) => G.pointOf(F, s, 12 * 0.72, a);
  put(
    'end.blind',
    [BLIND_X + BLIND_T / 2, 0, Z],
    S(G.disc(0, BLIND_T, 12.4, F, P), { tone: 'hi', inner: L(G.arcOf(F, 1.2, 12.4, P), { tone: 'faint' }) }) +
      L(studs.map((a) => G.circleOf(alongX(studAt(a, BLIND_T)), 0, 1.25, P)).join(''), { tone: 'mid' }) +
      D(studs.map((a) => at(studAt(a, BLIND_T))), { size: 0.5, tone: 'hi' }) +
      L(G.circleOf(F, BLIND_T, 6.2, P), { tone: 'faint' }),
    [A.disc(F, 0, BLIND_T, 12.4)],
  );
}

/* lockout tag, hung flat on the blind's lowest stud — the stud through its
   eyelet, its top half lying on the plate, the rest hanging below the line */
{
  const studA = (3 * Math.PI) / 2 - Math.PI / 8;
  const stud = G.pointOf(alongX([BLIND_X, 0, Z]), BLIND_T, 12 * 0.72, studA);
  const T = { w: 15, h: 21, t: 0.7, eye: 2.6 };
  const top = [blindFace, stud[1], stud[2] + T.eye];
  const F = G.frameOf(top, [1, 0, 0], [0, -1, 0], [0, 0, 1]);
  const c = 1.8;
  const poly = [
    [-T.w / 2 + c, 0],
    [T.w / 2 - c, 0],
    [T.w / 2, -c],
    [T.w / 2, -T.h],
    [-T.w / 2, -T.h],
    [-T.w / 2, -c],
  ];
  const onTag = (u, v) => at(G.add3(top, [T.t, -u, v]));
  const ax = k.axisVector(P, [0, -1, 0]);
  const ay = k.axisVector(P, [0, 0, -1]);
  const [tx, ty] = onTag(0, -14.6);
  const text = `matrix(${ax[0].toFixed(3)} ${ax[1].toFixed(3)} ${ay[0].toFixed(3)} ${ay[1].toFixed(3)} ${tx.toFixed(2)} ${ty.toFixed(2)})`;
  const eyeF = G.frameOf(G.add3(stud, [T.t, 0, 0]), [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  put(
    'end.tag',
    G.add3(top, [T.t, 0, -T.h / 2]),
    S(G.prismOf(F, poly, 0, T.t, P), { tone: 'hi' }) +
      L(k.pathOf([onTag(-T.w / 2, -17.8), onTag(T.w / 2, -17.8)]), { tone: 'lo' }) +
      k.faceTextSvg(text, '404', { size: 7, tone: 'hi', anchor: 'middle' }) +
      L(G.circleOf(eyeF, 0, 1.5, P), { tone: 'mid' }) +
      S(G.disc(0, 1.4, 1.2, eyeF, P), { tone: 'mid' }),
    [A.prism(F, poly, 0, T.t), A.disc(eyeF, 0, 1.4, 1.2)],
    { bias: 1 },
  );
}

const body = finish(fig, {
  /* The tee sliver, as on /about: looked at 6×, a joint. The stem's recorded
     shape is the part above the hub its clip lets through. */
  allow: [['down.pipe.a', 'down.tap.tee']],
  cover: ['valve.stem'],
});

const label =
  'A bench line in isometric. A regulator set to 4.04 bar feeds a block-and-bleed gate valve with a handwheel; past the valve a gauge, a pipe stand, and a blind flange that closes the end of the line, with a lockout tag reading 404. Open the valve and the gauge climbs to 4.04 bar and stays there, because nothing flows into a line that goes nowhere.';
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label, body });

emit('deadEnd', {
  svg,
  title: 'Dead end',
  hint: 'Hover to open the valve',
  readout: 'valve shut · 0.00 bar · flow 0 L/min',
  live: {
    width: WIDTH,
    height: HEIGHT,
    wheel: WHEEL_LIVE,
    /** Screen offset of one world unit up — the stem's rise. */
    up: k.axisVector(P, [0, 0, 1]),
    gauge,
  },
});
