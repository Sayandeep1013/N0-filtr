/**
 * /about, Fig. 01 — "The handover". A slide-plate screen changer on a bench line.
 *
 *   node tools/figures/handover.mjs            build
 *   node tools/figures/handover.mjs --audit    build, then prove the geometry
 *
 * Flow runs +x (left to right on screen). The slide plate runs along y, toward
 * the viewer: at rest its open bore is in line and its screen pack sits pulled
 * out in front of the body, which is the studio's whole argument as a machine.
 * Pushed in by `STROKE`, the screen is in line and the outlet gauge drops.
 *
 * The plate is drawn twice, each copy clipped by a fixed half-space at one face
 * of the body: the part behind the far face is painted before the body, the
 * part in front of the near face after it, and the part inside is never drawn.
 * The clips do not move; the plate moves inside them.
 */

import { BORE, STROKE, P_IN, readingAt, readoutOf } from '../../lib/figures/handover.ts';
import { k, G, A, S, L, D, figure, finish, TEE_IN, basePlate, ruler, labelPlate, alongX, pipe, flange, gaugeTap, pipeStand, hexNut, regulator } from './parts.mjs';
import { emit } from './emit.mjs';

const WIDTH = 640;
const HEIGHT = 360;
const Z = 48; // pipe axis above the plate
const RP = 6; // pipe outer radius
const PLATE = { x: -172, y: -84, w: 344, d: 180, r: 8 };

const BODY = { x: -22, y: -22, w: 44, d: 44, r: 3 };
const BODY_Z = [10, 84];
const SLIDE = { x: -6, w: 12, z0: 28, z1: 68 };
const SLIDE_Y = [-16, 70]; // at rest
const SCREEN_Y = STROKE; // the screen station, at rest
/* T-handle: a neck off the plate's end and a bar across it, far enough out that
   the bar clears the front cut even with the plate pushed fully home. */
const NECK = 8;
const BAR = { y: SLIDE_Y[1] + NECK + 2.6, half: 9, r: 2.6 };
const SCREEN_R = 13.2;
const MESH_R = 11.4;

const REG = { x: -158, y: -14, w: 30, d: 28, r: 3 };
const RX = REG.x + REG.w / 2;
const RECV = { x: 130, y: -20, w: 32, d: 40, r: 3 };

const fig = figure({
  width: WIDTH,
  height: HEIGHT,
  azimuth: 57,
  pad: 22,
  points: [...k.boxCorners(PLATE, -15, 0), [-60, 0, 98], [60, 0, 98], [RX, 0, 88], [0, 0, 90]],
});
const { P, at, put, under } = fig;

/* ── base ─────────────────────────────────────────────────────────────── */
basePlate(fig, PLATE, {
  /* T-slots, as on any bench plate: the line bolts down through them. */
  slots: [
    { x: -150, y: -66, w: 300, d: 5, r: 2.5 },
    { x: -150, y: 56, w: 120, d: 5, r: 2.5 },
    { x: 26, y: 56, w: 124, d: 5, r: 2.5 },
  ],
});
ruler(fig, { x: -152, y: 80, w: 112, d: 7, r: 1 });
labelPlate(fig, { x: 44, y: 72, w: 46, d: 16, r: 1.6 }, { text: 'NF-01' });

/* ── regulator: the supply, held at P_IN ──────────────────────────────── */
regulator(fig, REG);

/* ── upstream line ────────────────────────────────────────────────────── */
const REG_FACE = REG.x + REG.w;
flange(fig, 'up.flange.reg', REG_FACE + 1.5, 0, Z, { facing: 1 });
const stand1 = pipeStand(fig, 'up.stand', -104, 0, Z, RP);
pipe(fig, 'up.pipe.a', REG_FACE + 3, stand1.from, 0, Z, RP);
pipe(fig, 'up.pipe.b', stand1.to, -74 - TEE_IN, 0, Z, RP, { owner: 'up.tap' });
const gIn = gaugeTap(fig, 'up.tap', -74, 0, Z, { value: P_IN });
pipe(fig, 'up.pipe.c', -74 + TEE_IN, BODY.x - 3, 0, Z, RP, { owner: 'up.tap' });
flange(fig, 'up.flange.body', BODY.x - 1.5, 0, Z, { facing: -1 });

/* ── the changer body ─────────────────────────────────────────────────── */
{
  const ped = k.insetPlan(BODY, -4);
  const [z0, z1] = BODY_Z;
  const cover = k.insetPlan(BODY, -1);
  const slotFront = [
    [SLIDE.x - 1.2, BODY.y + BODY.d, SLIDE.z0 - 1.2],
    [SLIDE.x + SLIDE.w + 1.2, BODY.y + BODY.d, SLIDE.z0 - 1.2],
    [SLIDE.x + SLIDE.w + 1.2, BODY.y + BODY.d, SLIDE.z1 + 1.2],
    [SLIDE.x - 1.2, BODY.y + BODY.d, SLIDE.z1 + 1.2],
  ];
  const screws = k.corners(cover, 5);
  put(
    'changer.body',
    [0, 0, (z0 + z1) / 2],
    S(k.slabOf(ped, 0, z0, P, 4, 0.6), { tone: 'mid' }) +
      D(k.corners(ped, 3).map(([x, y]) => at([x, y, z0])), { size: 0.5 }) +
      S(k.slabOf(BODY, z0, z1 - z0, P, 4, 0.8), { tone: 'mid', inner: L(k.sideSeam(BODY, 22, P, 4) + k.sideSeam(BODY, 76, P, 4), { tone: 'faint' }) }) +
      L(k.pathOf(slotFront.map(at), true), { tone: 'lo' }) +
      S(k.slabOf(cover, z1, 4, P, 4, 0.6), { tone: 'mid' }) +
      L(screws.map(([x, y]) => k.ring(x, y, 1.8, z1 + 4, P, 14)).join(''), { tone: 'lo' }) +
      D(screws.map(([x, y]) => at([x, y, z1 + 4])), { size: 0.5 }),
    [A.slab(ped, 0, z0, {}, 4), A.slab(BODY, z0, z1 - z0, {}, 4), A.slab(cover, z1, 4, {}, 4)],
  );

  /* guide rails the plate rides on, front and back, each on a pillar */
  for (const [side, y0, y1, py] of [
    ['front', BODY.y + BODY.d, 84, 70],
    ['back', -74, BODY.y, -74],
  ]) {
    const rail = { x: -9, y: y0, w: 18, d: y1 - y0, r: 1 };
    const pillar = { x: -7, y: py, w: 14, d: 12, r: 1.4 };
    const foot = k.insetPlan(pillar, -3);
    const ends = side === 'front' ? [y1 - 4, y0 + 6] : [y0 + 4, y1 - 6];
    put(
      `changer.rail.${side}`,
      [0, (y0 + y1) / 2, 14],
      S(k.slabOf(foot, 0, 2.4, P, 3, 0.4), { tone: 'mid' }) +
        S(k.slabOf(pillar, 2.4, 15.6, P, 3, 0.4), { tone: 'mid' }) +
        S(k.slabOf(rail, 18, 10, P, 3, 0.5), { tone: 'mid', inner: L(k.sideSeam(rail, 23, P, 3), { tone: 'faint' }) }) +
        D(ends.flatMap((y) => [at([-7.6, y, 28]), at([7.6, y, 28])]), { size: 0.45 }),
      [A.slab(foot, 0, 2.4, {}, 3), A.slab(pillar, 2.4, 15.6, {}, 3), A.slab(rail, 18, 10, {}, 3)],
    );
  }
  const stop = { x: -9, y: 84, w: 18, d: 4, r: 0.8 };
  put('changer.stop', [0, 86, 26], S(k.slabOf(stop, 18, 14, P, 2, 0.4), { tone: 'mid' }) + D([at([-5, 86, 32]), at([5, 86, 32])], { size: 0.45 }), [A.slab(stop, 18, 14, {}, 2)]);
}

/* ── the slide plate: open bore, web, screen pack, T-handle ───────────── */
function slidePlate() {
  const plan = { x: SLIDE.x, y: SLIDE_Y[0], w: SLIDE.w, d: SLIDE_Y[1] - SLIDE_Y[0], r: 1 };
  const face = SLIDE.x + SLIDE.w;
  const zc = Z;
  const onFace = (y, z) => at([face, y, z]);
  const circle = (yc, r, n = 72) => k.pathOf(Array.from({ length: n }, (_, i) => onFace(yc + r * Math.cos((i / n) * 2 * Math.PI), zc + r * Math.sin((i / n) * 2 * Math.PI))), true);
  const mesh = [];
  for (let u = -MESH_R + 1.4; u < MESH_R - 0.6; u += 1.6) {
    const w = Math.sqrt(MESH_R * MESH_R - u * u);
    mesh.push(k.pathOf([onFace(SCREEN_Y + u, zc - w), onFace(SCREEN_Y + u, zc + w)]));
    mesh.push(k.pathOf([onFace(SCREEN_Y - w, zc + u), onFace(SCREEN_Y + w, zc + u)]));
  }
  const holes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * 2 * Math.PI + Math.PI / 6;
    return onFace(SCREEN_Y + (SCREEN_R - 0.8) * Math.cos(a), zc + (SCREEN_R - 0.8) * Math.sin(a));
  });
  const bore = circle(0, BORE);
  const handleF = alongX([-BAR.half, BAR.y, zc]);
  const neck = { x: -2.5, y: SLIDE_Y[1], w: 5, d: NECK + 0.2, r: 1 };
  return (
    S(k.slabOf(plan, SLIDE.z0, SLIDE.z1 - SLIDE.z0, P, 2, 0.4), { tone: 'hi', lit: true }) +
    `<path class="iso-void" d="${bore}"/>` +
    L(bore, { tone: 'mid' }) +
    `<path class="iso-void" data-depth="screen" d="${circle(SCREEN_Y, MESH_R)}"/>` +
    L(mesh.join(''), { tone: 'mid' }) +
    L(circle(SCREEN_Y, MESH_R), { tone: 'hi' }) +
    L(circle(SCREEN_Y, SCREEN_R), { tone: 'lit' }) +
    D(holes, { size: 0.45, tone: 'hi' }) +
    S(k.slabOf(neck, zc - 4, 8, P, 2, 0.3), { tone: 'hi', lit: true }) +
    S(G.disc(0, 2 * BAR.half, BAR.r, handleF, P), { tone: 'hi', lit: true, inner: L(G.arcOf(handleF, 3.5, BAR.r, P) + G.arcOf(handleF, 2 * BAR.half - 3.5, BAR.r, P), { tone: 'lo' }) })
  );
}

const plateSvg = slidePlate();
/*
 * The cuts. Each is the plate's own visible surface split at a face plane of the
 * body — along the top face and down the +x face — not the hull of a box, whose
 * projection would take in plate that sits a few units *behind* the face.
 *
 * Front (drawn after the body): below the top-face cut line, left of the +x cut
 * line, left of the +x face's bottom edge running on toward the viewer.
 * Back (drawn before the body): the plate's silhouette beyond the far face; what
 * it over-includes lies inside the body, which paints over it.
 */
const yF = BODY.y + BODY.d;
const yB = BODY.y;
const { x: px0, w: pw, z0: pz0, z1: pz1 } = SLIDE;
const px1 = px0 + pw;
const FAR = 400;
const frontCut = k.pathOf(
  [
    [-FAR, yF, pz1],
    [px0, yF, pz1],
    [px1, yF, pz1],
    [px1, yF, pz0],
    [px1, FAR, pz0],
    [-FAR, FAR, pz0],
  ].map(at),
  true,
);
const backCut = k.pathOf(G.hullOf(k.boxCorners({ x: px0, y: -FAR, w: pw, d: FAR + yB }, pz0, pz1).map(at)), true);
under.push(`<defs><clipPath id="hv-front"><path d="${frontCut}"/></clipPath><clipPath id="hv-back"><path d="${backCut}"/></clipPath></defs>`);
const slideGroup = (clip) => `<g clip-path="url(#${clip})"><g data-part="slide">${plateSvg}</g></g>`;
put('changer.slide.back', [0, -43, Z], slideGroup('hv-back'), [A.slab({ x: SLIDE.x, y: SLIDE_Y[0] - STROKE, w: SLIDE.w, d: BODY.y - (SLIDE_Y[0] - STROKE), r: 1 }, SLIDE.z0, SLIDE.z1 - SLIDE.z0)]);
put('changer.slide.front', [0, 50, Z], slideGroup('hv-front'), [
  A.slab({ x: SLIDE.x, y: BODY.y + BODY.d, w: SLIDE.w, d: SLIDE_Y[1] - BODY.y - BODY.d, r: 1 }, SLIDE.z0, SLIDE.z1 - SLIDE.z0),
  A.slab({ x: -2.5, y: SLIDE_Y[1], w: 5, d: NECK + 0.2, r: 1 }, Z - 4, 8, {}, 2),
  A.disc(alongX([-BAR.half, BAR.y, Z]), 0, 2 * BAR.half, BAR.r),
]);

/* ── downstream line ──────────────────────────────────────────────────── */
const BX = BODY.x + BODY.w;
flange(fig, 'down.flange.body', BX + 1.5, 0, Z, { facing: 1 });
pipe(fig, 'down.pipe.a', BX + 3, 60 - TEE_IN, 0, Z, RP, { owner: 'down.tap' });
const gOut = gaugeTap(fig, 'down.tap', 60, 0, Z, { value: readingAt(0).pOut });
const stand2 = pipeStand(fig, 'down.stand', 98, 0, Z, RP);
pipe(fig, 'down.pipe.b', 60 + TEE_IN, stand2.from, 0, Z, RP, { owner: 'down.tap' });
pipe(fig, 'down.pipe.c', stand2.to, RECV.x - 3, 0, Z, RP);
flange(fig, 'down.flange.recv', RECV.x - 1.5, 0, Z, { facing: -1 });

/* ── receiver: a sight tank with a nozzle inside, a vent and a drain ───── */
{
  const pad = k.insetPlan(RECV, -3);
  const top = 72;
  const cx = RECV.x + RECV.w / 2;
  const glass = { x: RECV.x + 11, y: RECV.y + RECV.d, w: 9, z0: 10, z1: 62 };
  const face = RECV.y + RECV.d;
  const slot = k.pathOf(
    [
      [glass.x, glass.z0],
      [glass.x + glass.w, glass.z0],
      [glass.x + glass.w, glass.z1],
      [glass.x, glass.z1],
    ].map(([x, z]) => at([x, face, z])),
    true,
  );
  const level = 38;
  put(
    'recv.body',
    [cx, 0, top / 2],
    S(k.slabOf(pad, 0, 3, P, 4, 0.5), { tone: 'mid' }) +
      S(k.slabOf(RECV, 3, top - 3, P, 4, 0.8), { tone: 'mid', inner: L(k.sideSeam(RECV, 66, P, 4), { tone: 'faint' }) }) +
      `<path class="iso-void" d="${slot}"/>` +
      L(k.pathOf([at([glass.x, face, level]), at([glass.x + glass.w, face, level])]), { tone: 'mid' }) +
      L(slot, { tone: 'lo' }) +
      D([at([glass.x + glass.w / 2, face, glass.z1 + 3.4]), at([glass.x + glass.w / 2, face, glass.z0 - 3.4])], { size: 0.5 }) +
      S(k.slabOf(k.insetPlan(RECV, -0.8), top, 3, P, 4, 0.5), { tone: 'mid' }) +
      D(k.corners(RECV, 3).map(([x, y]) => at([x, y, top + 3])), { size: 0.5 }),
    [A.slab(pad, 0, 3, {}, 4), A.slab(RECV, 3, top - 3, {}, 4), A.slab(k.insetPlan(RECV, -0.8), top, 3, {}, 4)],
  );
  hexNut(fig, 'recv.vent.nut', cx + 6, 6, top + 3, 2.6, 3.4);
  put('recv.vent', [cx + 6, 6, top + 8], S(k.cylinder(cx + 6, 6, 2.2, top + 5.6, 5, P, 18), { tone: 'mid' }) + S(k.cylinder(cx + 6, 6, 3.4, top + 10.6, 1.4, P, 20), { tone: 'mid' }), [
    A.cylinder(cx + 6, 6, 2.2, top + 5.6, 5),
    A.cylinder(cx + 6, 6, 3.4, top + 10.6, 1.4),
  ]);
  /* drain cock on the near face */
  const F = G.frameOf([RECV.x + RECV.w, 8, 9], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const cock = [
    [0, 3.4],
    [2, 3.4],
    [2, 2.4],
    [6, 2.4],
    [6, 1.6],
    [9, 1.6],
  ];
  put('recv.drain', G.pointOf(F, 4, 0, 0), S(G.solidOf(cock, F, P), { tone: 'mid' }), [A.solid(F, cock)]);
}

/* The two plate copies are clipped, so their markup's box is the whole plate
   while each records only the part its clip lets through. */
/* Each run's rim sits 0.2 inside its tee ball, so a ~2 px² sliver of the run is
   nearer than the ball's limb where it enters. Looked at 6×: the ball's outline
   crosses the run at the joint, which is what a cast tee looks like. */
const body = finish(fig, {
  cover: ['changer.slide.*'],
  allow: [
    ['up.pipe.b', 'up.tap.tee'],
    ['down.pipe.a', 'down.tap.tee'],
  ],
});

const r0 = readingAt(0);
const label =
  'A bench line in isometric. A regulator holds water at 3 bar; it runs past an inlet gauge into a slide-plate screen changer, past an outlet gauge and into a receiver. The plate carries an open bore and a four-layer screen. At rest the screen is pulled out and both gauges read the same; slide it in and the outlet gauge drops by a fifth.';
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label, body });

emit('handover', {
  svg,
  title: 'The handover',
  hint: 'Hover to slide the screen',
  readout: readoutOf(r0),
  live: {
    width: WIDTH,
    height: HEIGHT,
    /** Screen offset of one unit of plate travel toward the body (−y). */
    slide: k.axisVector(P, [0, -1, 0]),
    gauges: { in: gIn, out: gOut },
  },
});
