/**
 * The Open Aperture as a 3D object. docs/spec/50-brand-and-3d.md §2.
 *
 * This module is the **only** place `three` is imported, and it is reached
 * exclusively through a dynamic `import()` in Hero3D.tsx. Nothing here may be
 * imported statically from a component, or three lands in the initial bundle
 * and `verify:budget`'s FORBIDDEN_IN_INITIAL check fails — correctly.
 *
 * It exports a plain factory rather than a React component on purpose: the
 * scene owns no React state, and keeping it outside the component tree is what
 * lets one WebGL context survive every route change.
 *
 * ── The one loop ────────────────────────────────────────────────────────────
 * There is no `requestAnimationFrame` in this file. `tick()` is called by
 * Hero3D from `gsap.ticker`, which is the single loop the whole site runs on
 * (CLAUDE.md non-negotiable §7). A `renderer.setAnimationLoop` here would be a
 * second one.
 *
 * ── It is ONE mechanism, not a ring with things near it ─────────────────────
 * The first build was a thin torus with six thin bars floating at its inner
 * edge, and the pointer rotated the bars independently of the ring — so they
 * slid out of it. It read as a circle and some lines, and it lost its teeth the
 * moment the pointer moved.
 *
 * This is a machined barrel with six blades **housed inside its bore**. The
 * blades pivot about the barrel's own axis, which is what a real iris does, so
 * they sweep within the housing and cannot leave it. See D-014.
 */
import {
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  LinearSRGBColorSpace,
  Mesh,
  Path,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Shape,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { APERTURE_FRAGMENT, APERTURE_VERTEX } from './aperture.glsl';

/* ── camera ──────────────────────────────────────────────────────────────── */

const CAMERA_FOV = 35;

/**
 * §2 gives 6.5. It is **7.5 here** — see I-022. §2's camera and §2's own
 * composition target cannot both hold: at 6.5 a 4-unit ring is 98% of the
 * viewport height before perspective and overflows on every side, where §2 asks
 * for "the right ~55% of the viewport, cropped by the right edge" and tonik's
 * capture shows 51%, contained. Sayandeep kept 7.5.
 */
const CAMERA_Z = 7.13;

/**
 * Below the desktop breakpoint the viewport is taller than it is wide, and a
 * distance chosen for a 1.68 aspect leaves the assembly at 183% of the width at
 * 390. The distance is fitted instead: never closer than CAMERA_Z, pulled back
 * as far as it takes to stay inside this fraction of the viewport width.
 */
const MAX_WIDTH_FRACTION = 1.05;

/* Placement, measured against docs/research/screens/tonik-hero-01.png rather
   than judged. Their object's centre sits at 72.0% across and 48.5% down a
   1512x900 frame; at CAMERA_Z these two put ours on the same point. */

/** The assembly sits right-of-centre so the headline stays clear of it. */
const ASSEMBLY_X = 1.85;
/**
 * Slightly below the optical centre. Their object hangs lower than the middle —
 * it nearly reaches the foot rule, which is what stops the composition floating
 * — and centring ours left a 94px gap where theirs leaves 47.
 */
const ASSEMBLY_Y = -0.069;

/* ── the barrel ──────────────────────────────────────────────────────────────
   §2's ring is `TorusGeometry(2.0, 0.075, …)` — a wire. The outer radius is
   kept; the cross-section is not. A tube that thin cannot read as a housing,
   and it is half of why the first build looked like a diagram. */

const R_OUT = 2.0;
/**
 * The bore, and the single number that decides whether this reads as jewellery
 * or as a tyre.
 *
 * The 2D mark's ring is 1/12 of its diameter — a band 16.7% of the radius —
 * and taken literally in 3D it is mostly side wall at this tilt. 11% was better
 * and still too heavy: side by side with a live capture of tonik's, ours read as
 * a dark mass filling the right half where theirs is a slim bright ellipse.
 *
 * 7% is the band they carry. A flat annulus that thin, lit hard, is the whole
 * difference between an object that looks cast and one that looks moulded — and
 * it gives the blades room to be the thing you actually look at.
 */
const R_IN = 1.86;
const BARREL_DEPTH = 0.115;
const BARREL_BEVEL = 0.022;
/** Enough to keep the silhouette clean at 2400px; the cost is checked by the harness. */
const BARREL_SEGMENTS = 84;

/* ── the blades ──────────────────────────────────────────────────────────────
   Proportioned off components/brand/ApertureMark.tsx so the 3D object and the
   2D glyph describe the same mechanism: the 2D tick reaches inward from the
   ring's inner edge by 1/6 of the radius, and the blade tip lands at the same
   fraction of R_OUT.

   Each blade tucks under the barrel's inner wall rather than butting against
   it, so there is no seam for the light to catch. */

const BLADE_OUTER = R_IN + 0.05;
const BLADE_INNER = 1.48;
/**
 * 32° each. Six of them cover 192° of the 360, so more than half the bore is
 * open — which is what "retracted" has to look like.
 *
 * 46° was the first pass and read heavy: against a live capture of tonik's the
 * interior was busy where theirs is open. The 2D mark's ticks are barely 6°
 * wide; plates are right for 3D, but they have to stay closer to ticks than to
 * a closed iris or the centre stops being clear.
 */
const BLADE_ARC = (32 * Math.PI) / 180;
/** The 8° off-radial lean the 2D mark has, built into the blade's own outline. */
const BLADE_SKEW = (8 * Math.PI) / 180;
const BLADE_DEPTH = 0.105;
const BLADE_BEVEL = 0.02;

/* ── presentation ────────────────────────────────────────────────────────────
   §2 gives `rotation.x = -0.55, rotation.z = 0.30`, which produces an ellipse
   squashed to 0.85 of its width and rolled 17°. tonik's is nearer 0.65 rolled
   45°, with the major axis running lower-left to upper-right — the long
   diagonal pointing away from the headline, which is what keeps the object
   clear of the copy instead of lying across it.

   Expressed as one tilt about an in-plane axis rather than two Euler terms,
   because that is the quantity that actually matters: the axis you tilt about is
   the axis the ellipse keeps, and everything perpendicular to it foreshortens by
   its cosine. See I-024. */

/**
 * The kept axis: lower-left ↔ upper-right, so the ellipse stretches that way.
 *
 * 51° off horizontal, not 45°. Measured: theirs boxes 658 x ~755 in a 1512x900
 * frame — taller than it is wide — where a 45° axis gives a square-ish box and
 * 55° overshoots into too narrow. Leaning the axis toward vertical redistributes
 * the ellipse into their proportion without changing which corners the stretched
 * ends point at.
 */
const TILT_AXIS = new Vector3(Math.cos(0.892), Math.sin(0.892), 0).normalize();
/** cos(0.76) ≈ 0.72. Measured off tonik-hero-01.png, then opened a little: the
 *  barrel has depth where their tube is round, so the same tilt reads narrower. */
const TILT_ANGLE = 0.76;

/* ── lights and material, §2 verbatim ────────────────────────────────────── */

const KEY_INTENSITY = 2.4;
const KEY_POSITION: [number, number, number] = [4, 5, 3];
const RIM_INTENSITY = 1.8;
const RIM_POSITION: [number, number, number] = [-5, 1, -4];
const AMBIENT_INTENSITY = 0.18;
/**
 * Not in §2 — §2 has no specular term at all, which is why a literal reading
 * renders a matte body that never glints. See I-027.
 */
const SPECULAR = 2.4;

/** `#2a2a2a`, as display-space components. See the note on outputColorSpace. */
const BASE_COLOR: [number, number, number] = [0x2a / 255, 0x2a / 255, 0x2a / 255];
/* ── the line-art edges ──────────────────────────────────────────────────────
   Sayandeep, on the running hero: *"in the 3D object for the wheel give proper
   border edges — line art edges."*

   The barrel and the blades are shaded solids on a `#212121` ground, and the
   grain and the fresnel both work *across* a surface rather than at its
   boundary — so the object's silhouette and its internal creases were being
   read entirely from a lighting gradient. On a dark ground that reads as soft,
   which is the opposite of what the 2D mark is: a drawn ring with drawn ticks.

   `EdgesGeometry` extracts only the edges where two faces meet at more than a
   threshold angle, so the bevels and the 96-segment barrel curve contribute
   nothing and the result is the object's actual creases — the outer rim, the
   bore, the blade outlines — rather than a wireframe of every triangle.

   The threshold matters. At 1° every bevel ring is an edge and the object
   becomes a scribble; at 30° the blade's own outline drops out along its curved
   back. 18° keeps the silhouette and the creases and discards the tessellation.

   ⚠️ `LineBasicMaterial` ignores `linewidth` on every platform that matters —
   the WebGL spec allows a driver to clamp it to 1, and they all do. These are
   one device pixel wide, and that is the whole reason they read as line art
   rather than as an outline: at any greater weight they would have to be built
   from geometry, which is a different component and a different budget. */
const EDGE_THRESHOLD_DEGREES = 18;
/** Bright enough to draw the shape, dim enough not to become the object. */
const EDGE_OPACITY = 0.55;

const GRAIN_SCALE = 18.0;
/**
 * **0 — the grain is off.** Sayandeep, 2026-08-26: *"let's get rid of texture
 * too for now, just to see how it looks."*
 *
 * The value is not deleted, and neither is the shader path: `aperture.glsl`
 * still computes the object-space simplex noise and still mixes it in, at
 * strength zero. Deleting it would mean re-deriving it to try it again, and it
 * was not cheap the first time — §2 specifies a grain that sticks to the
 * surface under rotation rather than swimming across it, which is why it is
 * sampled in object space and not in screen space.
 *
 * **0.35 is the value it was, and the value to restore.** With the line-art
 * edges now drawing the object's creases (D-032), the shading has less work to
 * do, so a lower grain than the original may be right rather than none — worth
 * trying 0.15 before going back to 0.35.
 */
const GRAIN_AMOUNT = 0.0;

/* ── motion ──────────────────────────────────────────────────────────────────
   §2 states its idle spin as "~7.5s per revolution" and its smoothing as
   "500ms", and writes both as per-frame increments — which are only those
   durations at 60fps. Both are applied per second here and evaluate to exactly
   the specced constants at 60. See I-023. */

/**
 * The idle drift.
 *
 * §2 asks for `rotation.y += 0.0022` per frame and calls it "~7.5s per
 * revolution" — those two do not describe the same motion. 0.0022 rad/frame at
 * 60fps is 0.132 rad/s, which is **47 seconds** per revolution, not 7.5. A
 * revolution in 7.5s needs 0.014 rad/frame, six times faster. §2 contradicts
 * itself and either reading is defensible. I-029.
 *
 * Neither is used. Sayandeep asked for it stopped or "wayy slower", so it was
 * 0.02 rad/s — about five minutes a revolution.
 *
 * **0.1 now**, at his request on 2026-08-26: *"increase the wheel moving speed
 * a bit."* That is a revolution a minute — slow enough to stay calm, fast
 * enough that the object is visibly alive rather than a still that happens to
 * be rendered. 0.02 was imperceptible frame to frame, which was the point at
 * the time and is not any more.
 *
 * **Set it to 0 for a dead-still object**; nothing else depends on it.
 */
const IDLE_SPIN_PER_SECOND = 0.1;
const DAMP = 0.08;
const dampFactor = (dt: number) => 1 - Math.pow(1 - DAMP, dt * 60);

/**
 * Pointer response. **Subtle, and it cannot detach anything.**
 *
 * §2 recovered tonik's curves as ±0.2 rad on the ring and −0.1→+0.5 on the
 * mark, driving two *separate* objects — their glyph floats free inside their
 * ring, so a large differential costs them nothing. Ours is housed. Applying
 * that differential to a barrel and its blades slid the blades out of the bore.
 *
 * So the differential moved to the axis where it is mechanically true. The
 * assembly tips as one object, and the blades **actuate about the bore's own
 * axis** — which is what an iris does, and which sweeps them within the housing
 * rather than out of it. The mechanism still answers at two rates; it just
 * cannot come apart. See D-014 and I-025.
 */
const TIP = { x: 0.13, y: 0.16 };
/** Blade sweep about the bore axis, in radians, across the full viewport. */
const ACTUATE = 0.16;
/**
 * A small positional lean, opposite the pointer.
 *
 * Rotation alone reads as a thing being turned; adding a shift reads as a thing
 * being looked around, because the near and far edges then move by different
 * amounts on screen. It is the cheapest parallax there is and it is most of what
 * separates a response that feels three-dimensional from one that feels like a
 * transform. Units, not radians.
 */
const SHIFT = { x: 0.11, y: 0.075 };

/** [ix2 a-15] — a ~0.975 rad sweep as the hero leaves, on mobile. */
const MOBILE_SCROLL = { from: -0.525, to: -1.5 } as const;

/** §2: render exactly one frame at this pose under reduced motion, then stop. */
const REDUCED_MOTION_POSE = 0.4;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface ApertureSceneOptions {
  /** ≤767. Fewer blades, no antialiasing, and the scroll drive instead of the pointer. */
  mobile: boolean;
  /** Render one frame at REDUCED_MOTION_POSE and never start the loop. */
  reducedMotion: boolean;
}

export interface ApertureScene {
  /** Called from gsap.ticker. `dt` is seconds since the previous frame. */
  tick(dt: number): void;
  /** Pointer position normalised 0..1 across the viewport. Desktop only. */
  setPointer(px: number, py: number): void;
  /** Hero scroll progress 0..1. Mobile only. */
  setScrollProgress(p: number): void;
  /** Drives the load-in tween: 0.85→1 scale, 0→1 opacity. */
  setReveal(scale: number, opacity: number): void;
  resize(width: number, height: number, dpr: number): void;
  /** One frame, on demand — for the reduced-motion path and for resizes while suspended. */
  renderOnce(): void;
  /** Triangles actually submitted. §2 budgets under 40k. */
  triangleCount(): number;
  /**
   * Live state, for `verify:motion`'s behaviour layer.
   *
   * `bladeReach` is the invariant that matters: the furthest any blade vertex
   * sits from the bore axis. It must stay inside the barrel's outer radius, or
   * the mechanism has come apart — which is exactly the failure the first build
   * shipped and the reason this value is exposed at all.
   */
  debug(): {
    tipX: number;
    tipY: number;
    actuation: number;
    spin: number;
    cameraZ: number;
    blades: number;
    bladeReach: number;
    barrelOuter: number;
    /** The load-in's scale, so the reveal can be asserted rather than assumed. */
    scale: number;
    opacity: number;
  };
  dispose(): void;
}

export function createApertureScene(
  canvas: HTMLCanvasElement,
  options: ApertureSceneOptions,
): ApertureScene {
  const { mobile, reducedMotion } = options;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !mobile, // §2: true desktop, false ≤767
    alpha: true, // the page ground shows through; the canvas paints no background
    powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);
  /* §2's material numbers — `#2a2a2a`, `vec3(0.55)`, `mix(0.88, 1.06, …)` — are
     written as values you see on screen, not as linear-light values. three's
     default colour management would convert the base colour into linear working
     space on the way in and back out again on the way out, which round-trips the
     base but silently triples the literal `0.55` rim term.

     Taking the output space linear means the shader writes display values
     directly and every specced number means exactly what it says. */
  renderer.outputColorSpace = LinearSRGBColorSpace;

  const scene = new Scene();

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  /* ── lights ───────────────────────────────────────────────────────────────
     Real objects in the graph, as §2 specifies, and also the single source of
     the numbers the shader uses — the material reads its directions and
     intensities off these rather than duplicating them. */
  const keyLight = new DirectionalLight(0xffffff, KEY_INTENSITY);
  keyLight.position.set(...KEY_POSITION);
  const rimLight = new DirectionalLight(0xffffff, RIM_INTENSITY);
  rimLight.position.set(...RIM_POSITION);
  const ambient = new HemisphereLight(0xffffff, 0x080808, AMBIENT_INTENSITY);
  scene.add(keyLight, rimLight, ambient);

  const material = new ShaderMaterial({
    vertexShader: APERTURE_VERTEX,
    fragmentShader: APERTURE_FRAGMENT,
    transparent: true,
    side: DoubleSide,
    uniforms: {
      uBaseColor: { value: new Vector3(...BASE_COLOR) },
      uGrainScale: { value: GRAIN_SCALE },
      uGrainAmount: { value: GRAIN_AMOUNT },
      uKeyDir: { value: keyLight.position.clone().normalize() },
      uKeyIntensity: { value: keyLight.intensity },
      uRimDir: { value: rimLight.position.clone().normalize() },
      uRimIntensity: { value: rimLight.intensity },
      uAmbient: { value: ambient.intensity },
      uSpecular: { value: SPECULAR },
      uOpacity: { value: 1 },
    },
  });

  /* ── assembly ─────────────────────────────────────────────────────────────
     Four levels, and the nesting is the whole design.

       assembly   — position, idle spin, mobile scroll drive
       tipper     — the pointer's tip. ONE node, so the barrel and the blades tip
                    together and the object reads as a single thing.
       presenter  — the ellipse tilt, about the in-plane axis it keeps
       barrel + blades — coplanar and concentric by construction

     The blades hang off `presenter` alongside the barrel, so the only motion
     that can separate them from it is a rotation about the bore axis — which
     sweeps them *within* the bore. There is no longer an axis on which they can
     slide out. */
  const assembly = new Group();
  assembly.position.set(ASSEMBLY_X, ASSEMBLY_Y, 0);
  scene.add(assembly);

  const tipper = new Group();
  assembly.add(tipper);

  const presenter = new Group();
  presenter.quaternion.setFromAxisAngle(TILT_AXIS, TILT_ANGLE);
  tipper.add(presenter);

  /* Dev only: a yaw knob on the whole assembly, so "what does it look like
     turned round?" is a console call rather than a source edit and two dev
     reloads. Folded out of production with everything else behind this guard.

     Note what 180° does and does not mean here. The object is six-fold
     symmetric about its bore, so spinning it 180° about that axis is a no-op —
     three blade positions, same picture. A yaw of π is the one that changes
     anything: it looks at the barrel from behind, which mirrors the ellipse's
     long diagonal from "/" to "\" and puts the key light behind the object
     instead of in front of it. */
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    Object.assign(window, {
      __APERTURE_YAW__: (radians: number) => {
        assembly.rotation.y = radians;
      },
    });
  }

  /* Everything that turns idly turns about the BORE AXIS, not about world Y.

     §2 spins the assembly on Y, which is right for tonik: their object is a
     torus with a glyph floating inside it, and it reads from any angle. Ours is
     an annulus. Rotating an annulus about a world axis in its own plane sweeps
     it through edge-on twice a revolution — the silhouette collapses to a line,
     the composition changes under the headline, and the ellipse the whole
     presentation is built on stops existing.

     About its own axis the silhouette is invariant: the ellipse never moves, and
     what you see turning is the grain and the six blades. A lens barrel idling
     in its mount. See I-026. */
  const spinner = new Group();
  presenter.add(spinner);

  /* The barrel: a machined annulus with real depth, not a wire. */
  const barrelShape = new Shape();
  barrelShape.absarc(0, 0, R_OUT, 0, Math.PI * 2, false);
  const bore = new Path();
  bore.absarc(0, 0, R_IN, 0, Math.PI * 2, true);
  barrelShape.holes.push(bore);

  const barrelGeometry = new ExtrudeGeometry(barrelShape, {
    depth: BARREL_DEPTH,
    bevelEnabled: true,
    bevelThickness: BARREL_BEVEL,
    bevelSize: BARREL_BEVEL,
    bevelSegments: 2,
    curveSegments: BARREL_SEGMENTS,
  });
  barrelGeometry.translate(0, 0, -BARREL_DEPTH / 2);
  spinner.add(new Mesh(barrelGeometry, material));

  /* One material for every edge on the object. `transparent` with
     `depthWrite: false` so a line behind the barrel does not punch a hole in
     the depth buffer and take a bite out of whatever is drawn after it. */
  const edgeMaterial = new LineBasicMaterial({
    color: 0xefefef,
    transparent: true,
    opacity: EDGE_OPACITY,
    depthWrite: false,
  });

  const barrelEdges = new EdgesGeometry(barrelGeometry, EDGE_THRESHOLD_DEGREES);
  spinner.add(new LineSegments(barrelEdges, edgeMaterial));

  /* The blade: a plate with a curved outer edge that tucks under the bore and a
     straight inner edge, which is what makes six of them read as a polygonal
     opening rather than as spokes. The straight edge is swung 8° off-radial —
     the same lean the 2D mark's ticks have, built into the outline rather than
     applied as a rotation, because a symmetric plate rotated about the bore axis
     just moves round the circle and leans nowhere. */
  const half = BLADE_ARC / 2;
  const points: Vector2[] = [];
  const ARC_SAMPLES = 14;
  for (let i = 0; i <= ARC_SAMPLES; i += 1) {
    const a = -half + (i / ARC_SAMPLES) * BLADE_ARC;
    points.push(new Vector2(Math.cos(a) * BLADE_OUTER, Math.sin(a) * BLADE_OUTER));
  }
  points.push(
    new Vector2(
      Math.cos(half + BLADE_SKEW) * BLADE_INNER,
      Math.sin(half + BLADE_SKEW) * BLADE_INNER,
    ),
    new Vector2(
      Math.cos(-half + BLADE_SKEW) * BLADE_INNER,
      Math.sin(-half + BLADE_SKEW) * BLADE_INNER,
    ),
  );

  const bladeGeometry = new ExtrudeGeometry(new Shape(points), {
    depth: BLADE_DEPTH,
    bevelEnabled: true,
    bevelThickness: BLADE_BEVEL,
    bevelSize: BLADE_BEVEL,
    bevelSegments: 2,
    curveSegments: 1,
  });
  bladeGeometry.translate(0, 0, -BLADE_DEPTH / 2);
  /* Built once and shared by all six, like the geometry itself — six copies of
     the same edge set is six times the memory for an identical picture. */
  const bladeEdges = new EdgesGeometry(bladeGeometry, EDGE_THRESHOLD_DEGREES);

  /* One group for every blade, rotating about the bore axis. That single node is
     the iris actuation, and it is the only differential the pointer drives. */
  const blades = new Group();
  spinner.add(blades);

  // §2: 4 blades on mobile instead of 6.
  const bladeCount = mobile ? 4 : 6;
  for (let i = 0; i < bladeCount; i += 1) {
    /* Mesh and edges in one group per blade, so the rotation that puts the
       blade at its station carries its outline with it. Rotating them
       separately would work and would be two places to get the same number
       right. */
    const blade = new Group();
    blade.add(new Mesh(bladeGeometry, material));
    blade.add(new LineSegments(bladeEdges, edgeMaterial));
    blade.rotation.z = (i / bladeCount) * Math.PI * 2;
    blades.add(blade);
  }

  /* The invariant the harness asserts: how far any blade vertex actually reaches
     from the bore axis.

     Read off the vertices, not off the bounding box. A blade spans an arc, so
     its box corners sit outside the geometry — the box put the reach at 2.018
     against a 2.0 barrel and would have failed a correct object. */
  const bladePositions = bladeGeometry.getAttribute('position');
  let bladeReach = 0;
  for (let i = 0; i < bladePositions.count; i += 1) {
    const r = Math.hypot(bladePositions.getX(i), bladePositions.getY(i));
    if (r > bladeReach) bladeReach = r;
  }

  /* ── state ────────────────────────────────────────────────────────────────
     Targets are set by input; the rendered values chase them at DAMP. */
  const target = { tipX: 0, tipY: 0, actuation: 0, shiftX: 0, shiftY: 0 };
  let scrollProgress = 0;

  function applyMobileScroll() {
    // §2's range, on the bore axis rather than world Y. Same sweep, and the
    // silhouette survives it. See I-026.
    /* The scroll pose **plus** the idle spin, not instead of it.

       This used to assign the scroll pose outright, which meant the idle
       rotation existed on desktop and nowhere else — on a phone the object only
       moved while you were scrolling and was frozen the moment you stopped.
       Sayandeep: *"the wheel doesn't spin on mobile view."*

       The two are independent rotations about the same axis, so they add. The
       accumulator is what makes that possible: an idle spin written straight
       into `rotation.z` would be overwritten by the next scroll update. */
    spinner.rotation.z = lerp(MOBILE_SCROLL.from, MOBILE_SCROLL.to, scrollProgress) + idleSpin;
  }

  /**
   * Total idle rotation so far, in radians.
   *
   * Accumulated rather than added straight into `rotation.z`, because on mobile
   * the scroll drive *assigns* that property every frame — anything written
   * into it directly is gone by the next update. Keeping the spin as its own
   * quantity lets both paths compose it with whatever else they are doing.
   */
  let idleSpin = 0;

  function render() {
    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    /* §2: exactly one frame at rotation.y = 0.4, then nothing. `tick` is never
       registered by Hero3D in this mode, so this pose is final. */
    spinner.rotation.z = REDUCED_MOTION_POSE;
  } else if (mobile) {
    applyMobileScroll();
  }

  return {
    tick(dt) {
      /* Advanced once, before either branch, so the two paths cannot drift
         apart — the object turns at the same rate on a phone and on a desktop,
         and only what is composed on top of it differs. */
      idleSpin += IDLE_SPIN_PER_SECOND * dt;

      if (mobile) {
        applyMobileScroll();
      } else {
        spinner.rotation.z = idleSpin;

        const k = dampFactor(dt);
        tipper.rotation.y += (target.tipX - tipper.rotation.y) * k;
        tipper.rotation.x += (target.tipY - tipper.rotation.x) * k;
        tipper.position.x += (target.shiftX - tipper.position.x) * k;
        tipper.position.y += (target.shiftY - tipper.position.y) * k;
        blades.rotation.z += (target.actuation - blades.rotation.z) * k;
      }

      render();
    },

    setPointer(px, py) {
      // Centred on the viewport, so a pointer in the middle leaves it at rest.
      const cx = px * 2 - 1;
      const cy = py * 2 - 1;
      target.tipX = cx * TIP.x;
      target.tipY = cy * TIP.y;
      /* The blades lead the housing. The mechanism answering a moment before its
         shell does is what carries the sense of depth, now that the two cannot
         be pulled apart. */
      target.actuation = -cx * ACTUATE;
      // Opposite the pointer, so the object leans away from the hand.
      target.shiftX = -cx * SHIFT.x;
      target.shiftY = cy * SHIFT.y;
    },

    setScrollProgress(p) {
      scrollProgress = p;
    },

    setReveal(scale, opacity) {
      assembly.scale.setScalar(scale);
      material.uniforms.uOpacity!.value = opacity;
    },

    resize(w, h, dpr) {
      const width = Math.max(1, Math.round(w));
      const height = Math.max(1, Math.round(h));
      const aspect = width / height;
      camera.aspect = aspect;

      /* Fit the distance to the viewport. `2 * tan(fov/2) * aspect` is the
         visible width one unit from the camera, so the distance at which the
         assembly fills MAX_WIDTH_FRACTION of it falls straight out. */
      const perUnitWidth = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * aspect;
      const fitted = (R_OUT * 2) / (perUnitWidth * MAX_WIDTH_FRACTION);
      camera.position.z = Math.max(CAMERA_Z, fitted);
      camera.updateProjectionMatrix();

      /* `false` — do not let three write width/height back onto the element's
         style. The canvas is sized by CSS to fill its container. */
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
    },

    renderOnce: render,

    debug: () => ({
      tipX: tipper.rotation.y,
      tipY: tipper.rotation.x,
      actuation: blades.rotation.z,
      spin: spinner.rotation.z,
      cameraZ: camera.position.z,
      blades: bladeCount,
      bladeReach,
      barrelOuter: R_OUT,
      scale: assembly.scale.x,
      opacity: material.uniforms.uOpacity!.value as number,
    }),

    triangleCount() {
      // three counts triangles only after a render; read it off the info block.
      render();
      return renderer.info.render.triangles;
    },

    dispose() {
      barrelGeometry.dispose();
      bladeGeometry.dispose();
      /* The edge geometries and their shared material too. `EdgesGeometry`
         allocates its own buffers, and the barrel's is not small — leaking
         them on a route change is a leak per navigation, which is the shape of
         bug this scene's single-context design exists to avoid. */
      bladeEdges.dispose();
      barrelEdges.dispose();
      edgeMaterial.dispose();
      material.dispose();
      renderer.dispose();
      /* Frees the GPU context rather than waiting for GC. Without it a hot
         reload leaks contexts until the browser starts dropping the oldest. */
      renderer.forceContextLoss();
    },
  };
}

/** §2's fallback path is chosen on capability, not on user-agent. */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('WebGLRenderingContext' in window)) return false;
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}
