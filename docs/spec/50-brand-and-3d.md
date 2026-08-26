# Brand identity and the 3D hero

tonik's hero is their own logo glyph — a dark matte asterisk suspended inside a gritty torus,
rotating slowly, full-bleed behind the headline. We cannot and should not copy that object.
What we copy is its **role, material language and behaviour**. This document specifies our
equivalent.

---

## 1. The mark

### Recommended: **The Open Aperture**

A camera iris rendered with its blades **retracted** — the ring is there, the mechanism is
there, and the centre is completely clear. The filter is absent. That is the name, drawn.

It also maps structurally onto what tonik does: *a mark suspended inside a ring*. Same
composition, same silhouette weight, entirely our own meaning.

**2D logo (loader glyph, nav, footer, favicon)**
```
A circle of stroke weight 1/12 of its diameter.
Six short radial ticks at the inner edge, at 60° intervals, each 1/6 of the radius long,
drawn at HALF the ring's stroke weight — 1/24 of the diameter.
Each tick rotated 8° off-radial so they read as retracted blades rather than a compass rose.
The centre is empty.
```

> **The tick weight was added in phase 2**, not measured — this section originally gave each
> tick's *length* and never its stroke weight, which is I-009. Half was chosen because it is the
> only weight at which six separate blades stay countable at 16px: at the ring's own weight a
> tick 1/6-of-a-radius long is nearly as wide as it is long and renders as a square blob.
> Approved by Sayandeep at the phase-2 gate, alongside the concept itself. I-009 is closed.

Reads as an aperture at 48px and as a clean geometric circle at 16px. Drawn with
`fill="currentColor"` so it inherits from the loader, nav and footer without variants.

**Wordmark**
`NO FiLTER` — General Sans **700**, tracking `-0.02em`, the space between the two words tightened
to `0.22em`. The footer sets it at `14vw` exactly as tonik does.

> **700, not 400 — changed by Sayandeep on 2026-08-26.** This is the single exception to
> CLAUDE.md non-negotiable §3, which is otherwise intact: the display face is still never bolded
> in *type*. The wordmark is a logo drawn with the face rather than type set in the system, and
> at 14vw a 400 weight reads as a headline rather than as a mark. §3 names the exception
> explicitly so it is not mistaken for drift. See D-017.

Both words in caps, **with the `i` of FiLTER left lowercase.** That single letter is the whole
device: it drops a dot into a run of caps — a small void inside the letterform that rhymes with
the aperture's empty centre. The casing is authored as literal text in
`components/brand/Wordmark.tsx`, never via `text-transform: uppercase`, which would eat it.

> **Changed by Sayandeep, 2026-08-26.** This clause originally read *"lowercase throughout,
> matching tonik's own lowercase `tonik`"*. He asked for a mixed case; four candidates —
> `NO FiLTER`, `No FiLTER`, `No Filter`, `NO FILTER` — were set in the real face at display and
> navbar size, and he chose `NO FiLTER`. See D-011.
>
> **The metrics were re-measured in the same session** — a casing change is a metrics change,
> and every box the wordmark sits in had been fitted to the lowercase form. `-0.02em` and the
> footer's `14vw` both **hold**: the footer wordmark fills 82.5% of its column at 1512 and 71.6%
> at 390, up from ~59% and ~51%, and overflows at neither.
>
> The **navbar** did not hold. §4's `4.25rem × 1.25rem` logo box is measured off tonik and
> `flex: none` reserves it, so the box is fixed and the face size is the free variable; caps
> measured 4.59rem inside it, an 8% overrun. The face is `0.925rem` now — `4.25 / 4.59` — and
> lands at 99.9% of the box at both breakpoints. See I-018.

### Alternates (if you'd rather not go aperture)

| Concept | Idea | Trade-off |
|---|---|---|
| **Broken mesh** | A filter screen with a hole punched through it | More literal, more graphic, much weaker as 3D geometry |
| **NF ligature** | Geometric N+F monogram | Safe and legible, says nothing about the name |
| **Un-screened dot** | A halftone screen dissolving to solid | Beautiful in motion, poor as a static mark |

I'd build the aperture. Say the word if you want one of the others and I'll re-spec.

---

## 2. The 3D hero — `<Hero3D />`

### Placement

```
<body>
  <Loader />
  <ContactPanel />
  <div class="hero-3d">        ← position:absolute; inset:0; height:100vh; z-index:0
    <canvas />                    NOT inside <main> — survives route changes
  </div>
  <main> … </main>
</body>
```

Mounted once in the root layout. React state is preserved across navigation, so the WebGL
context is created exactly once per session. On non-home routes it fades to `opacity: 0` and
its render loop is suspended rather than being unmounted.

### Scene graph

```
Scene
├ PerspectiveCamera   fov 35, position (0, 0, 6.5)
├ ApertureAssembly    group, positioned right-of-centre (x: +1.6) to sit behind the headline
│   ├ Ring            TorusGeometry(2.0, 0.075, 32, 200)   — the barrel
│   │                 rotated to present as an ellipse: rotation.x = -0.55, rotation.z = 0.30
│   └ Blades ×6       ExtrudeGeometry from a blade profile, radius 1.55, bevelled 0.02
│                     each retracted outward and rotated 8° off-radial
├ KeyLight            DirectionalLight, intensity 2.4, position (4, 5, 3)
├ RimLight            DirectionalLight, intensity 1.8, position (-5, 1, -4)
└ Ambient             HemisphereLight, intensity 0.18
```

Composition target: the assembly occupies the right ~55% of the viewport, cropped by the right
edge, with the headline sitting over its left third — matching tonik's framing exactly.

### Material — where the GLSL lives

tonik's object is dark, matte and visibly **gritty** — the surface has a fine granular
roughness that catches the rim light. That grain is the whole character of the material, and it
is worth a custom shader rather than a texture.

`MeshPhysicalMaterial` extended via `onBeforeCompile`, or a full `ShaderMaterial`:

```glsl
// fragment — roughness driven by 3D simplex noise, plus a fresnel rim term
uniform float uTime;
uniform vec3  uBaseColor;   // #2a2a2a
uniform float uGrainScale;  // 18.0
uniform float uGrainAmount; // 0.35
varying vec3  vWorldPos;
varying vec3  vNormal;
varying vec3  vViewDir;

float snoise(vec3 v);       // standard Ashima simplex

void main() {
  // fine granular roughness, sampled in object space so it sticks to the surface
  float grain = snoise(vWorldPos * uGrainScale) * 0.5 + 0.5;
  float roughness = mix(0.62, 0.95, grain * uGrainAmount + (1.0 - uGrainAmount));

  // fresnel rim — this is what separates the silhouette from the near-black ground
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.8);

  vec3 col = uBaseColor;
  col += vec3(0.55) * fresnel * 0.85;          // rim
  col *= mix(0.88, 1.06, grain);               // grain modulates albedo slightly too

  gl_FragColor = vec4(col, 1.0);
}
```

- Base colour `#2a2a2a` — a shade off the `#212121` ground so the silhouette reads without
  ever becoming a bright object.
- No environment map. The form is described entirely by the two lights and the fresnel term.
- Grain is sampled in **object space**, so it stays glued to the surface as the object rotates
  rather than swimming — this is the detail that makes it read as material rather than noise.

### Motion

| Behaviour | Spec |
|---|---|
| Idle rotation | `group.rotation.y += 0.0022` per frame (~7.5s per revolution) |
| **Mouse parallax** | **exact tonik curves — see below** |
| **Mobile** | **scroll-driven, not mouse — see below** |
| Blade breathing | each blade's radial offset oscillates `±0.012` on a per-blade phase offset — barely perceptible, keeps it alive |
| Load-in | on first paint: `scale 0.85 → 1` and `opacity 0 → 1` over `1.2s power3.out`, starting as the loader clears |

### Mouse parallax — recovered exactly [ix2 `a-3` "home-hero_spline-desktop"]

This was the most valuable find of the IX2 pass. tonik does **not** move the camera and does
**not** rotate the scene as one object. It drives **two separate objects at different rates**,
and on the Y axis they *counter*-rotate:

| Object | Mouse X (0 → 100%) | Mouse Y (0 → 100%) |
|---|---|---|
| **Ring** (the torus) | `rotationY  −0.2 → +0.2` rad | `rotationX   0.0 → +0.2` rad |
| **Mark** (the glyph) | `rotationY  −0.1 → +0.5` rad | `rotationX  +0.1 → −0.1` rad |

Smoothing: **500ms** on every channel.

Two things fall out of this that a single-object rotation cannot produce:

1. **The mark swings 0.6 rad across the viewport while the ring swings only 0.4** — the
   inner element consistently outruns its frame, which is what reads as depth.
2. **On vertical movement they oppose each other** — the ring pitches down as the mark pitches
   up. That shearing is why the object feels like a mechanism rather than an image.

Our aperture has exactly this structure (ring + blades), so the curves transfer directly:
apply the ring row to the torus and the mark row to the blade group.

```js
// pointer normalised 0..1 across the viewport
const lerp = (a, b, t) => a + (b - a) * t;
target.ring.y   = lerp(-0.2, 0.2, px);   target.ring.x   = lerp( 0.0,  0.2, py);
target.blades.y = lerp(-0.1, 0.5, px);   target.blades.x = lerp( 0.1, -0.1, py);
// ~500ms smoothing ≈ damp factor 0.08 at 60fps
ring.rotation.y   += (target.ring.y   - ring.rotation.y)   * 0.08;
blades.rotation.y += (target.blades.y - blades.rotation.y) * 0.08;
```

> I originally specced "camera lerps toward the mouse". That was a reasonable guess and it was
> **wrong** — it would have produced a flatter, more generic effect. Replaced with the real
> curves.

### Mobile — scroll-driven [ix2 `a-15` "hero-spline-scroll-mobile"]

Below the desktop breakpoint there is no pointer, so the hero is driven by scroll progress
instead. tonik rotates a single object across the hero's scroll range:

```
scroll 0%   →  rotationY −0.525 rad
scroll 100% →  rotationY −1.500 rad
```

A ~0.975 rad sweep as the hero leaves the viewport. We apply the same range to the whole
assembly, scrubbed against the hero section's ScrollTrigger progress.

### Performance budget

| Rule | Value |
|---|---|
| Pixel ratio | `Math.min(devicePixelRatio, 2)` |
| Target | 60fps desktop, 30fps floor on mobile |
| Triangle budget | < 40k |
| Render loop | suspended via IntersectionObserver when the hero is off-screen |
| Route change | canvas persists, `opacity → 0`, loop suspended |
| `powerPreference` | `'high-performance'` |
| Antialias | `true` desktop, `false` ≤767 |

**Mobile (≤767):** the scene renders at reduced DPR with 4 blades instead of 6 and antialias
off. It is not replaced by a static image — tonik keeps the live canvas on mobile and so do we.

**Reduced motion:** render exactly one frame at `rotation.y = 0.4`, then stop the loop entirely.
No idle rotation, no parallax, no scroll response.

### Fallback

No WebGL → render a pre-baked 2400×1600 WebP of the assembly at its load-in pose, with the same
`opacity 0 → 1` fade. Detected via `WebGLRenderingContext` presence, not user-agent.

---

## 3. Why not Spline

tonik uses Spline. We deliberately don't:

| | Spline | Three.js + GLSL (ours) |
|---|---|---|
| Runtime cost | ~380KB runtime + 200KB scene | ~150KB three (tree-shaken) + ~4KB scene code |
| The grain | baked into a texture | procedural, resolution-independent |
| Scroll/mouse binding | via Spline events, limited | direct, arbitrary |
| Source of truth | a `.splinecode` binary in someone's cloud | code in our repo, diffable |
| Editing | requires the Spline editor and account | any editor |

The scene is genuinely simple geometry — a torus and six extruded blades. Spline's value is in
authoring complex scenes visually; we don't have a complex scene. Building it in code is
smaller, faster, more controllable, and ours.

---

## 4. Where the mark appears

| Surface | Treatment |
|---|---|
| Loader | 3rem SVG glyph, `currentColor` = `--white`, on `--grey-800` |
| Navbar | wordmark, `4.25rem × 1.25rem` |
| Hero | the full 3D assembly |
| Footer | wordmark at `14vw` |
| Favicon | glyph only, monochrome, 32/180/512 |
| OG image | glyph + wordmark on `--black`, 1200×630 |
| Case-study loader | glyph tinted to the incoming work's accent |

---

## 5. What I need from you before building this

1. **Approve the aperture concept** (or pick an alternate).
2. I'll produce the 2D glyph as SVG and a static render of the 3D assembly for sign-off
   **before** wiring it into the hero — so we're not iterating on brand inside a scroll page.

> **Settled — phase 2, 2026-08-26.** Sayandeep approved **the Open Aperture**, over the three
> alternates in §1. The tick weight (I-009) was settled in the same conversation at **half the
> ring's weight**, and the footer service icons (I-014) were deferred to phase 10.
>
> Point 2 was satisfied for the 2D glyph by a sign-off sheet rather than a static render:
> the mark, its construction, actual-size renders at 16/32/48px, the wordmark in the real
> General Sans, and the glyph in situ in the shipped loader, navbar and footer. Every glyph on
> the sheet was generated from the same ratios `components/brand/ApertureMark.tsx` uses, so the
> approved drawing and the shipping drawing cannot drift apart. **The 3D assembly still owes its
> own sign-off** — the phase-2 acceptance criteria require a screen recording of the hero before
> phase 3 starts.
