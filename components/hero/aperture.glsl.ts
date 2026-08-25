/**
 * The aperture's material. docs/spec/50-brand-and-3d.md §2 "Material".
 *
 * tonik's hero object is dark, matte and visibly **gritty** — a fine granular
 * roughness that catches the rim light. That grain is the whole character of the
 * material, which is why it is a shader and not a texture: procedural grain is
 * resolution-independent and costs no bytes.
 *
 * Two things carry the form:
 *
 *  · **Grain, sampled in OBJECT space.** This is the detail that makes it read
 *    as a material rather than as noise. Sampled in world or screen space the
 *    grain swims across the surface as the object turns; sampled in object space
 *    it is glued to the surface and turns with it.
 *  · **A fresnel rim.** On a `#212121` ground a `#2a2a2a` object has almost no
 *    silhouette. The rim term is what separates the two, and it is the only
 *    thing on this object permitted to be brighter than its base colour.
 *
 * ── On the lighting term ────────────────────────────────────────────────────
 * §2's fragment sketch computes `col` from the base colour, the fresnel and the
 * grain, with no light loop — while §2's scene graph specifies a key light, a
 * rim light and a hemisphere with exact intensities. Taken literally together,
 * the three lights would be inert objects in the graph.
 *
 * So the specced terms are reproduced verbatim — base colour, `pow(…, 2.8)`
 * fresnel, `vec3(0.55) * fresnel * 0.85`, `mix(0.88, 1.06, grain)` on the albedo
 * — and a lambert term is added that the three specced intensities actually
 * drive. It is normalised so that a surface facing the **key** light lands
 * exactly on `uBaseColor` and everything else is darker, and clamped so nothing
 * exceeds it. The object therefore still never becomes bright, which is what §2
 * says the base colour is for; only the fresnel rim goes above it. See D-012.
 *
 * The numbers here are **display-space**, not linear-light: `apertureScene.ts`
 * sets `outputColorSpace` to linear so `#2a2a2a` and `vec3(0.55)` mean on screen
 * exactly what §2 wrote down.
 */

/**
 * Ashima's simplex noise, the "standard" one §2 names. Public domain / MIT —
 * https://github.com/ashima/webgl-noise, Stefan Gustavson et al.
 */
const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const APERTURE_VERTEX = /* glsl */ `
varying vec3 vObjectPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

void main() {
  /* Object space, deliberately. Grain sampled here is glued to the surface and
     turns with the object; sampled in world space it would swim. §2. */
  vObjectPos = position;

  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const APERTURE_FRAGMENT = /* glsl */ `
uniform vec3  uBaseColor;
uniform float uGrainScale;
uniform float uGrainAmount;
uniform vec3  uKeyDir;
uniform float uKeyIntensity;
uniform vec3  uRimDir;
uniform float uRimIntensity;
uniform float uAmbient;
uniform float uOpacity;

varying vec3 vObjectPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

${SIMPLEX_3D}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);

  // fine granular roughness, sampled in object space so it sticks to the surface
  float grain = snoise(vObjectPos * uGrainScale) * 0.5 + 0.5;
  float roughness = mix(0.62, 0.95, grain * uGrainAmount + (1.0 - uGrainAmount));

  /* Two directional lights, lambert, softened by the roughness — a matte
     surface spreads its terminator rather than breaking sharply.

     Normalised by ambient + KEY, not by ambient + key + rim. The two lights sit
     on opposite sides of the object, so no surface can face both: dividing by
     the sum of all three capped the achievable maximum near 0.59 and crushed
     the object to near-black. Dividing by what a key-facing surface actually
     receives puts that surface exactly on uBaseColor and leaves a rim-facing
     one around 0.77; the clamp stops the overlap band going above. */
  float key = pow(max(dot(N, normalize(uKeyDir)), 0.0), mix(1.0, 0.65, roughness));
  float rim = pow(max(dot(N, normalize(uRimDir)), 0.0), mix(1.0, 0.65, roughness));
  float lit = min(1.0, (uAmbient + key * uKeyIntensity + rim * uRimIntensity)
                     / (uAmbient + uKeyIntensity));

  /* Fresnel rim — this is what separates the silhouette from the near-black
     ground, and it is where the grain becomes visible.

     Section 2's prose says the surface "has a fine granular roughness that
     CATCHES THE RIM LIGHT", but its snippet never connects the two: it computes
     a roughness from the grain and then never reads it again, and the grain
     reaches the output only through mix(0.88, 1.06, grain) on the albedo —
     about 9% either way on a base of 0.165, which is invisible. Rendered
     literally, the whole character of the material is missing. That is a
     sketch, not a shader. See I-021.

     So the roughness is wired to the thing the prose says it drives. A rougher
     patch scatters more, so it both widens the rim falloff and brightens it;
     the grain then reads as the glitter along the lit arc that the reference
     capture shows, instead of as nothing at all. */
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), mix(3.4, 2.2, roughness));
  fresnel *= mix(0.75, 1.45, grain);

  vec3 col = uBaseColor * lit;
  col += vec3(0.55) * fresnel * 0.85;          // rim
  col *= mix(0.88, 1.06, grain);               // grain modulates albedo slightly too

  gl_FragColor = vec4(col, uOpacity);
}
`;
