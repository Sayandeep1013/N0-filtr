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
 */
import {
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  Shape,
  ShaderMaterial,
  LinearSRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

import { APERTURE_FRAGMENT, APERTURE_VERTEX } from './aperture.glsl';

/* ── the scene graph's numbers, §2 verbatim ─────────────────────────────────
   Every value in this block is specced. CLAUDE.md non-negotiable §1: they are
   measured, not suggested. Do not round them. */

const CAMERA_FOV = 35;
/**
 * §2 gives 6.5. It is **7.5 here** — the one specced number in this file that is
 * not reproduced verbatim, and the reason is that §2 specifies two things which
 * cannot both hold.
 *
 * The scene graph's camera puts a 4-unit ring at 98% of the viewport height
 * before perspective, and the tilt then brings its near edge 1.04 units closer,
 * magnifying it another ~19%. The result overflows the viewport on all sides.
 * §2's own composition target says the assembly should occupy "the right ~55% of
 * the viewport, cropped by the right edge", and `docs/research/screens/
 * tonik-hero-01.png` shows their ring at 51% of the width, fully contained.
 *
 * At 7.5 ours measures 53% and sits where theirs sits. The composition is the
 * part of §2 you can hold against the reference capture, and unlike the scene
 * graph — which §2 authored rather than recovered, since tonik's object is a
 * Spline binary we deliberately did not copy — it is checkable. Logged as I-022
 * and put to Sayandeep with the hero recording the phase-2 gate already requires.
 */
const CAMERA_Z = 7.5;

/**
 * Below the desktop breakpoint the viewport is taller than it is wide, and a
 * distance chosen for a 1.68 aspect leaves the ring at 183% of the width at 390
 * — a bare arc with one blade on it, where tonik's mobile hero (s17) still reads
 * as a ring with the mark inside at about 103%.
 *
 * So the distance is fitted rather than hard-coded a second time: never closer
 * than the framing distance above, and pulled back as far as it takes to keep
 * the assembly within this fraction of the viewport width. One rule, correct at
 * every width, and it resolves to exactly CAMERA_Z on any desktop aspect.
 */
const MAX_WIDTH_FRACTION = 1.05;

/** The assembly sits right-of-centre so the headline can sit over its left third. */
const ASSEMBLY_X = 1.6;

const RING_RADIUS = 2.0;
const RING_TUBE = 0.075;
const RING_RADIAL_SEGMENTS = 32;
const RING_TUBULAR_SEGMENTS = 200;
/** Presented as an ellipse rather than face-on. */
const RING_TILT_X = -0.55;
const RING_TILT_Z = 0.3;

/** §2 gives the blade centre. See BLADE_LENGTH for why the two agree. */
const BLADE_RADIUS = 1.55;
const BLADE_BEVEL = 0.02;

const KEY_INTENSITY = 2.4;
const KEY_POSITION: [number, number, number] = [4, 5, 3];
const RIM_INTENSITY = 1.8;
const RIM_POSITION: [number, number, number] = [-5, 1, -4];
const AMBIENT_INTENSITY = 0.18;

/** `#2a2a2a`, as display-space components. See the note on outputColorSpace. */
const BASE_COLOR: [number, number, number] = [0x2a / 255, 0x2a / 255, 0x2a / 255];
const GRAIN_SCALE = 18.0;
const GRAIN_AMOUNT = 0.35;

/**
 * §2 gives `rotation.y += 0.0022` per frame, "~7.5s per revolution" — which is
 * only true at 60fps. The revolution time is the specced quantity, so the same
 * per-second correction as the damp applies: 0.0022 x 60 rad/s is 7.5s per
 * revolution at any frame rate.
 */
const IDLE_SPIN_PER_SECOND = 0.0022 * 60;
/** Each blade's radial offset oscillates by this much, on its own phase. */
const BREATH_AMPLITUDE = 0.012;

/**
 * §2: "Smoothing: **500ms** on every channel", implemented in its snippet as a
 * per-frame `* 0.08`, with the note "~500ms smoothing = damp factor 0.08 at
 * 60fps".
 *
 * A per-frame factor is only 500ms at 60fps. At 30 it is a second; on a
 * throttled tab it is several. The spec's intent is a **duration**, so this is
 * applied per second of elapsed time instead — see `dampFactor` — which
 * evaluates to exactly 0.08 at 60fps and holds the specced 500ms everywhere
 * else. Caught by the behaviour check, which reads the sweep at 0.319 rad
 * instead of 0.4 because headless Chromium runs the ticker near 20fps.
 */
const DAMP = 0.08;

/**
 * The specced per-frame damp, generalised to real elapsed time.
 * `dampFactor(1/60) === DAMP` exactly; longer frames catch up proportionally.
 */
const dampFactor = (dt: number) => 1 - Math.pow(1 - DAMP, dt * 60);

/* ── derived, and why ────────────────────────────────────────────────────────
   The 2D mark anchors each tick on the ring's INNER EDGE and pivots it 8° about
   that anchor (components/brand/ApertureMark.tsx). The 3D blade does exactly the
   same thing, which fixes its length: the tip sits at the inner edge, and §2's
   blade radius of 1.55 is the blade's centre, so

       length = 2 × (inner edge − centre) = 2 × (1.925 − 1.55) = 0.75

   The specced radius and the 2D construction agree on their own. That is the
   check that this is the right reading of "radius 1.55". */
const RING_INNER_EDGE = RING_RADIUS - RING_TUBE;
/** The assembly's widest extent — the torus, outer edge to outer edge. */
const ASSEMBLY_DIAMETER = (RING_RADIUS + RING_TUBE) * 2;
const BLADE_LENGTH = 2 * (RING_INNER_EDGE - BLADE_RADIUS);
/** 8° off-radial — so six blades read as a mechanism, not a compass rose. */
const OFF_RADIAL = (8 * Math.PI) / 180;

/** Proportioned off the 2D mark's tick, which is half the ring's stroke wide. */
const BLADE_HALF_WIDTH_OUTER = 0.085;
const BLADE_HALF_WIDTH_INNER = 0.045;
const BLADE_DEPTH = 0.09;

/* ── the recovered parallax curves ──────────────────────────────────────────
   [ix2 a-3 "home-hero_spline-desktop"]. tonik drives two objects at different
   rates and COUNTER-rotates them on Y. The mark swings 0.6 rad across the
   viewport where the ring swings 0.4, so the inner element consistently outruns
   its frame — that is what reads as depth. On vertical movement they oppose, and
   that shearing is why it feels like a mechanism rather than an image. */
const CURVE = {
  ring: { yFrom: -0.2, yTo: 0.2, xFrom: 0.0, xTo: 0.2 },
  blades: { yFrom: -0.1, yTo: 0.5, xFrom: 0.1, xTo: -0.1 },
} as const;

/** [ix2 a-15 "hero-spline-scroll-mobile"] — a ~0.975 rad sweep as the hero leaves. */
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
   * Live rotations, for `verify:motion`'s behaviour layer.
   *
   * §2's headline acceptance criterion — "the blades outrun the ring; if it
   * looks flat, the curves are wrong" — is a relationship between two numbers
   * that no registered timeline holds and no screenshot can show. This is how it
   * gets asserted rather than admired.
   */
  debug(): {
    ringY: number;
    ringX: number;
    bladesY: number;
    bladesX: number;
    assemblyY: number;
    cameraZ: number;
    blades: number;
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
     directly and every specced number means exactly what it says. Nothing else
     on the site uses three, so this is local rather than a global override, and
     the base colour is passed as a raw Vector3 for the same reason — a
     THREE.Color would convert it on the way in. */
  renderer.outputColorSpace = LinearSRGBColorSpace;

  const scene = new Scene();

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  /* ── lights ───────────────────────────────────────────────────────────────
     Real objects in the graph, as §2 specifies, and they are also the single
     source of the numbers the shader uses — the material reads its directions
     and intensities off these rather than duplicating them. Change a light and
     the material follows. */
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
    // The blades are thin extrusions seen from both sides as the assembly turns.
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
      uOpacity: { value: 1 },
    },
  });

  /* ── assembly ─────────────────────────────────────────────────────────────
     Three nested levels, and the nesting is the point. The assembly carries the
     idle spin and the mobile scroll drive; the ring and blade groups carry the
     two parallax curves independently; the ring MESH carries its own
     presentation tilt, so parallax on the ring group cannot overwrite it. */
  const assembly = new Group();
  assembly.position.x = ASSEMBLY_X;
  scene.add(assembly);

  const ringGroup = new Group();
  const bladeGroup = new Group();
  assembly.add(ringGroup, bladeGroup);

  /* §2 hangs the ellipse tilt off the Ring line, because that is where the
     presentation is described — but ring and blades are one mechanism and have
     to lie in the same plane. Tilting only the torus leaves six bars standing
     upright through a tipped hoop, which is what the first render showed.

     The tilt therefore sits on an inner node of BOTH, below each parallax
     group. That ordering matters: parallax stays on the outer groups so its
     axes remain the world-ish X and Y the recovered IX2 curves were measured
     in, and the tilt is applied after it rather than rotating the axes the
     curves act on. */
  const bladeTilt = new Group();
  bladeTilt.rotation.x = RING_TILT_X;
  bladeTilt.rotation.z = RING_TILT_Z;
  bladeGroup.add(bladeTilt);

  const ringGeometry = new TorusGeometry(
    RING_RADIUS,
    RING_TUBE,
    RING_RADIAL_SEGMENTS,
    RING_TUBULAR_SEGMENTS,
  );
  const ring = new Mesh(ringGeometry, material);
  ring.rotation.x = RING_TILT_X;
  ring.rotation.z = RING_TILT_Z;
  ringGroup.add(ring);

  /* The blade profile: a tapered plate lying along its own +Y, centred on its
     own origin, extruded through Z and bevelled. Wider at the outer end than the
     inner, which is what stops six of them reading as spokes. */
  const profile = new Shape();
  const half = BLADE_LENGTH / 2;
  profile.moveTo(-BLADE_HALF_WIDTH_INNER, -half);
  profile.lineTo(BLADE_HALF_WIDTH_INNER, -half);
  profile.lineTo(BLADE_HALF_WIDTH_OUTER, half);
  profile.lineTo(-BLADE_HALF_WIDTH_OUTER, half);
  profile.closePath();

  const bladeGeometry = new ExtrudeGeometry(profile, {
    depth: BLADE_DEPTH,
    bevelEnabled: true,
    bevelThickness: BLADE_BEVEL,
    bevelSize: BLADE_BEVEL,
    bevelSegments: 2,
    curveSegments: 1,
  });
  bladeGeometry.translate(0, 0, -BLADE_DEPTH / 2);

  // §2: 4 blades on mobile instead of 6.
  const bladeCount = mobile ? 4 : 6;
  /** The pivots, kept so `breathe` can move each blade along its own radius. */
  const bladePivots: Group[] = [];

  for (let i = 0; i < bladeCount; i += 1) {
    const station = new Group();
    station.rotation.z = (i / bladeCount) * Math.PI * 2;

    /* The tip sits on the ring's inner edge and the blade pivots 8° about it —
       the same anchor and the same pivot as the 2D mark's ticks. */
    const tip = new Group();
    tip.position.y = RING_INNER_EDGE;
    tip.rotation.z = OFF_RADIAL;

    const blade = new Mesh(bladeGeometry, material);
    blade.position.y = -half; // hangs inward from the tip
    tip.add(blade);

    station.add(tip);
    bladeTilt.add(station);
    bladePivots.push(tip);
  }

  /* ── state ────────────────────────────────────────────────────────────────
     Targets are set by input; the rendered rotations chase them at DAMP. */
  const target = { ringY: 0, ringX: 0, bladesY: 0, bladesX: 0 };
  let scrollProgress = 0;
  let elapsed = 0;

  function applyMobileScroll() {
    assembly.rotation.y = lerp(MOBILE_SCROLL.from, MOBILE_SCROLL.to, scrollProgress);
  }

  function breathe() {
    for (let i = 0; i < bladePivots.length; i += 1) {
      const pivot = bladePivots[i];
      if (!pivot) continue;
      // A per-blade phase offset, so they never pulse in unison.
      const phase = elapsed * 0.9 + (i / bladePivots.length) * Math.PI * 2;
      pivot.position.y = RING_INNER_EDGE + Math.sin(phase) * BREATH_AMPLITUDE;
    }
  }

  function render() {
    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    /* §2: exactly one frame at rotation.y = 0.4, then nothing. No idle spin, no
       parallax, no scroll response. `tick` is never registered by Hero3D in this
       mode, so this pose is final. */
    assembly.rotation.y = REDUCED_MOTION_POSE;
  } else if (mobile) {
    applyMobileScroll();
  }

  return {
    tick(dt) {
      elapsed += dt;

      if (mobile) {
        applyMobileScroll();
      } else {
        assembly.rotation.y += IDLE_SPIN_PER_SECOND * dt;

        const k = dampFactor(dt);
        ringGroup.rotation.y += (target.ringY - ringGroup.rotation.y) * k;
        ringGroup.rotation.x += (target.ringX - ringGroup.rotation.x) * k;
        bladeGroup.rotation.y += (target.bladesY - bladeGroup.rotation.y) * k;
        bladeGroup.rotation.x += (target.bladesX - bladeGroup.rotation.x) * k;
      }

      breathe();
      render();
    },

    setPointer(px, py) {
      target.ringY = lerp(CURVE.ring.yFrom, CURVE.ring.yTo, px);
      target.ringX = lerp(CURVE.ring.xFrom, CURVE.ring.xTo, py);
      target.bladesY = lerp(CURVE.blades.yFrom, CURVE.blades.yTo, px);
      target.bladesX = lerp(CURVE.blades.xFrom, CURVE.blades.xTo, py);
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
      const fitted = ASSEMBLY_DIAMETER / (perUnitWidth * MAX_WIDTH_FRACTION);
      camera.position.z = Math.max(CAMERA_Z, fitted);
      camera.updateProjectionMatrix();
      /* `false` — do not let three write width/height back onto the element's
         style. The canvas is sized by CSS to fill its container and three
         setting inline dimensions would fight it. */
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
    },

    renderOnce: render,

    debug: () => ({
      ringY: ringGroup.rotation.y,
      ringX: ringGroup.rotation.x,
      bladesY: bladeGroup.rotation.y,
      bladesX: bladeGroup.rotation.x,
      assemblyY: assembly.rotation.y,
      cameraZ: camera.position.z,
      blades: bladePivots.length,
    }),

    triangleCount() {
      // three counts triangles only after a render; read it off the info block.
      render();
      return renderer.info.render.triangles;
    },

    dispose() {
      ringGeometry.dispose();
      bladeGeometry.dispose();
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
