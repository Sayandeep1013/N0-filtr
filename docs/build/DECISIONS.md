# Decisions log

Append-only. Every technical decision a future agent could reasonably question.
Newest at the bottom. Never edit or delete an entry — supersede it with a new one.

**Format**

```
## D-NNN · <short title>
**Phase:** NN · **Date:** YYYY-MM-DD · **Status:** active | superseded by D-NNN

**Context:** what forced a choice
**Decision:** what was chosen
**Alternatives:** what else was considered, and why not
**Consequence:** what this makes easier or harder later
```

Decisions made *before* the build (scope, brand, content, stack) live in
`docs/spec/00-brief-and-decisions.md`. This file is for decisions made *during* implementation.

---

## D-001 · Verification harness before components

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** A 13-phase build across many sessions will drift. The dominant failure mode is an
agent asserting a phase is done when details were skipped.

**Decision:** Build the full verification harness in Phase 0, before any component exists. Every
subsequent phase extends it with assertions for what it built, and commits its report as evidence.

**Alternatives:** Checklist-based self-review (cheapest, depends entirely on agent honesty);
visual diff only (misses timing); assertions only (misses composition). All rejected as
individually insufficient.

**Consequence:** Phase 0 is ~1.5 sessions instead of ~0.5. Every phase after is provable rather
than asserted, and a fresh agent can trust the build without re-reading everything.

---

## D-002 · tonik's recovered source is gitignored

**Phase:** — · **Date:** 2026-08-25 · **Status:** active

**Context:** `docs/research/source/` held tonik's de-minified animation bundle, their IX2
interaction store, and their Spline scene binary. The repo was public at the time.

**Decision:** Gitignore the three tonik-owned files. Commit our decoders, our analysis, and their
public sitemap. Every value extracted from them is written into `docs/spec/`, which is our work.

**Alternatives:** Commit everything (republishes their assets); commit nothing from research
(loses our own analysis).

**Consequence:** A fresh clone cannot re-verify a disputed spec value from the local files.
`docs/research/source/README.md` documents how to regenerate all four. The repo has since been
made private, but the separation is still correct and stays.

---

## D-003 · Font cuts: General Sans variable, IBM Plex Mono 400/500 only

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** `10-design-system.md` §3 lists General Sans at 300/400/500/600 and IBM Plex Mono at
300/400/500/600/700. That column describes what the families offer; nothing in the spec asks for
all nine cuts to be loaded, and `next/font/local` preloads every declared file.

**Decision:** Ship General Sans as its **variable** cut (`weight: '200 700'`, one 38KB file
covering every weight the system names) and IBM Plex Mono as **400 and 500 statics** (~15KB each).

**Alternatives:** Four General Sans statics (4 requests, more bytes, no more coverage). All five
Plex cuts (75KB and five preloads, when the three mono tokens are uppercase labels and the scale
table names no weight for them, i.e. 400). A variable Plex — does not exist on Fontsource.

**Consequence:** Three font files instead of nine. Adding a mono weight later is one line in
`app/fonts/fonts.ts` plus a woff2 — cheap, and cheaper than carrying unused cuts through twelve
phases. The display face has its full range available, which phase 2 needs for the wordmark, and
the never-bold rule is enforced by `verify:tokens`, not by withholding the weights.

---

## D-004 · The one-rAF-loop rule is checked by classification, not by counting

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** CLAUDE.md §7 says never add a second `requestAnimationFrame` loop. The first version
of the check simply counted self-rescheduling rAF callbacks and expected 1. It failed with 2 —
and the second one was legitimate: GSAP's ScrollTrigger runs `_rafBugFix`, a no-op keep-alive
that exists because Firefox does not repaint consistently unless something is queued
(`node_modules/gsap/ScrollTrigger.js:61`). It drives nothing.

**Decision:** Classify rather than count. Every persistent rAF loop must match one of two
allowlisted library internals (`gsap-core.js` `_tick`, ScrollTrigger's `_rafBugFix`), and the
ticker must appear exactly once. Anything else fails and prints its own stack.

**Alternatives:** Expect 2 (a magic number that stops meaning anything the moment GSAP changes,
and would silently absorb a real third loop). Drop the check (loses the rule entirely).

**Consequence:** The check now catches what the rule is actually about — a stray rAF in a
component, a video sync loop, `Matter.Runner` in phase 11 — while tolerating GSAP's internals.
If a future GSAP release adds or renames an internal loop, the allowlist in
`tools/verify/motion.config.ts` `RUNTIME.sanctionedRaf` is where to say so, deliberately.

---

## D-005 · A dev-only `/probe` route is the token surface

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** `02-VERIFICATION.md` writes its token assertions against selectors on the real page
(`[data-t="h1"]`, `.padding-global`). In phase 0 there is no real page, and the acceptance
criterion for T0.1 is that `/` serves a *blank* page.

**Decision:** A `/probe` route, `notFound()` in production, carrying one element per scale,
colour and layout token. Assertions default to it and each may name its own `page`.

**Alternatives:** Put probes on `/` (contradicts the blank-page acceptance and would have to be
torn out in phase 3). Inject probes at runtime from the checker (tests the injection, not the
stylesheet, and cannot catch a cascade or media-query bug).

**Consequence:** Every token is verified from phase 0 rather than from whenever a component
happens to use it, and the type scale is visible in one place for the visual check. Later phases
should point *component* assertions at real pages; `/probe` stays as the canonical scale
reference. It costs 127B in the production build and renders nothing.

---

## D-006 · ESLint set up properly, `next lint` removed

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** The scaffold's `npm run lint` used `next lint`, which is deprecated in Next 15.5 and
drops into an interactive prompt — under a non-interactive agent shell it hangs or half-runs.

**Decision:** eslint 9 flat config extending `next/core-web-vitals` and `next/typescript`.
`docs/**` is ignored: it contains tonik's recovered minifier output, which produced ~100 warnings
about code that is not ours and is gitignored anyway.

**Alternatives:** Delete the lint script (loses `react-hooks/exhaustive-deps` across 13 phases of
GSAP effects, which is exactly where this build will leak). Leave it broken (worse than absent).

**Consequence:** `npm run lint` is real and clean. It is not part of `npm run verify` — verify is
about spec fidelity, lint is about code health, and conflating them would make a token failure
and an unused import look like the same kind of problem.

---

## D-007 · Animated elements carry a BEM hook class as well as their module class

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** The stack is CSS Modules, which hash every class name — `.loader__mark` compiles to
`Loader_mark__6dBzw`. But `verify:motion` identifies a tween's target by matching a substring
against the target's className, and `02-VERIFICATION.md` seeds those assertions with the spec's
names (`target: '.loader__mark'`). Behaviour checks, the visual harness's `prepare` steps and
anything a future agent types into devtools have the same problem.

**Decision:** Anything GSAP animates, anything the harness queries, and anything a JS handler
toggles carries **two** classes: the hashed module class for styling and an unhashed BEM class
for behaviour. `cx(s.mark, 'loader__mark')`. The BEM names are the spec's names, which are
tonik's names, so the DOM reads like the teardown.

Classes toggled from JS — `is-mini` — are the hook class **only**, with the module styling it
through `.nav:global(.is-mini)`. Otherwise the toggle has to know both names.

**Alternatives:** Plain global CSS for the chrome (abandons the stack decision for a quarter of
the site). Data attributes (`[data-motion="loader-mark"]`) — cleaner in principle, but the tween
serialiser reads className, so it would mean rewriting the harness to match assertions written
before this phase. Configuring Next's `localIdentName` to keep names readable (fragile, global,
and still not stable across a production build).

**Consequence:** Two class names on perhaps thirty elements. In exchange the motion assertions
work as written, the visual harness can drive real interactions by selector, and inspecting the
running site shows the same class names as `docs/research/`. The cost is discipline: a new
animated element needs its hook class or its assertion silently matches nothing.

---

## D-008 · `verify:motion` gains a behaviour layer

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** `02-VERIFICATION.md` says phase 1 owes the harness "loader, navbar mini threshold,
contact panel timeline, footer sibling-dim". Only the first and third are timeline shapes. The
phase-0 checker could assert what a registered timeline *is*; it had no way to assert what the
interface *does*.

Worse, `TimelineAssertion.reverseTimeScale` — the phase-0 mechanism for the "reverses run faster"
rule — cannot work. It calls `reverse()` on the registered timeline and reads the scale back,
which passes only if the timeline is already sitting at that scale. Every component on this site
applies the scale inside its handler, so on **correct** code it reads 1 and fails.

**Decision:** A `behaviour.ts` / `behaviour.config.ts` pair, folded into the `motion` section
rather than made a fifth check. Each check drives the real interface — scrolls, hovers, clicks,
presses Escape — and reads the DOM back. Values live in the config; the interactions are code,
because each one is genuinely bespoke.

**Alternatives:** A declarative DSL for interactions (more machinery than five checks justify).
Leaving these unverified and asserting them in prose (the failure mode the whole harness exists
to prevent). Making it a fifth report section (five sections is harder to read than four, and
these *are* motion).

**Consequence:** `verify:motion` went from ~40 to 132 assertions and takes about 40s instead of
20s. It immediately found five real problems, including one that reached users: the loader ran
its full sweep before the provider reported reduced motion. Later phases should add behaviour
checks, not just timeline shapes — a timeline can be perfectly shaped and never wired to
anything.

---

## D-009 · Two `ui/` primitives and the 2D mark are built in phase 1

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** Phase 1's four components need three things the phase brief assigns elsewhere.
`IconCircle` (§9) has three consumers inside this phase alone — the nav CTA, the footer social
bars, the form submit. `Button` (§9) is the nav CTA. And the loader has nothing to render
without the aperture glyph, which `50-brand-and-3d.md` §1 specifies and phase 2 approves.

**Decision:** Build all three here. §9, §21.3 and `50-brand-and-3d.md` §1 were added to phase 1's
Reading Map in `01-PHASES.md`, per protocol §2.

The mark's geometry is fully specified — a ring of stroke 1/12 the diameter, six ticks at 60°,
each 1/6 of the radius, rotated 8° off-radial — so this is transcription, not design. The
**concept** remains un-approved; `50-brand-and-3d.md` §5 makes user approval a precondition and
phase 2 is that gate. Everything brand-shaped is confined to `components/brand/`, two files.

**Alternatives:** Ad-hoc markup inside Navbar and Footer, rebuilt properly in phase 3 — which
guarantees two implementations that diverge, and would have hidden the §9 fill-overlay hover
that the re-measure found. A placeholder glyph for the loader (a square, a dot): dishonest in a
different way, and it would have to be found and replaced rather than simply approved.

**Consequence:** Phase 3 inherits `Button` and `IconCircle` working, with the §21.3 diagonal
swap and the §9 fill overlay already asserted. If phase 2's gate rejects the aperture, the
replacement is `ApertureMark.tsx` and `Wordmark.tsx` and nothing else — every consumer takes
`currentColor` and sizes from its container.

---

## D-010 · The Open Aperture is the mark; the gate was cleared with a rendered sheet

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** `50-brand-and-3d.md` §5 makes user approval a precondition for the 3D hero, and
`01-PHASES.md` marks T2.1 **"STOP. Present to user. Do not proceed without approval."** Phase 2
is a gate, so everything after T2.1 was blocked on a decision that is Sayandeep's to make —
brand is a non-technical decision under CLAUDE.md's ground rules.

Two things made the presentation unusual. The mark already existed, because phase 1 built it
under D-009 — the loader had nothing to render without a glyph. And the *concept* still needed
approving even though the *drawing* was already in three shipped components.

**Decision:** Present the mark as a published sign-off sheet rather than as a static render, and
generate every glyph on that sheet from the same four ratios `ApertureMark.tsx` uses rather than
redrawing them. The sheet is set in the project's own tokens and in the real General Sans and
IBM Plex Mono, inlined from `app/fonts/`.

Two consequences follow from generating rather than redrawing. The approved drawing and the
shipping drawing **cannot drift apart** — there is no second source. And the I-009 tick-weight
options could be rendered as live variants of one function at both 48px and 16px, so the choice
was made by eye instead of from a description.

Setting it in the real faces is not a nicety: a wordmark whose whole specification is
`General Sans 400 / -0.02em / 0.22em word gap` cannot be approved in a substitute face, and the
0.22em gap is invisible as a decision unless you can see the two words set.

**Sayandeep's answers, 2026-08-26:**

1. **The Open Aperture, approved** over the three alternates in §1.
2. **I-009 — half the ring's weight**, taking the recommendation. Resolved; written into the
   spec, which had omitted it. No code change: the provisional value was the chosen one.
3. **I-014 — the footer service icons stay placeholder until phase 10.** Phase 2 owns the brand
   and could have taken them; he chose not to spend the phase on them.

**Alternatives:** A static PNG render of the assembly, which §5 point 2 literally asks for — but
the 3D assembly does not exist yet, and rendering the 2D mark to a bitmap to approve a vector is
a worse artefact than the vector. Asking in prose with no visual, which is how a brand gets
approved by someone who cannot see it. Building the hero first and asking afterwards, which is
the failure mode the gate exists to prevent.

**Consequence:** T2.2–T2.9 are unblocked. The 3D assembly still owes its **own** sign-off — the
phase-2 acceptance criteria require a screen recording of the hero before phase 3 starts, and
that is a second gate, not the same one. The tick weight is now a specced value, so it falls
under CLAUDE.md non-negotiable §1 like any other: it may not be silently adjusted.

---

## D-011 · `NO FiLTER`, and Creative Development replaces No-Code

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** Two content changes from Sayandeep, both arriving after the T2.1 gate had already
cleared and neither of them a technical call. They are recorded together because they came in
one message and both are corrections to things the build had inherited rather than chosen.

### The wordmark casing

Spec §1 set the wordmark lowercase throughout, reasoning that it matched tonik's own lowercase
`tonik` and kept the mono labels doing the shouting. Sayandeep asked for `No FiLTER`
*"…something like that"* — a direction, not a final form.

**Decision:** Render four candidates and let him choose by eye rather than pick one from the
description. `NO FiLTER`, `No FiLTER`, `No Filter` and `NO FILTER`, each set in the real
General Sans 400 with the specced `0.22em` word gap, at display size and at the 1.0625rem the
navbar actually uses. **He chose `NO FiLTER`.**

Both words in caps make the lone lowercase `i` unmistakably deliberate rather than a slip — with
only `F` capitalised in `No FiLTER`, the odd letter reads as a typo. And it earns its keep: the
`i` drops a dot into a run of caps, a small void inside the letterform that rhymes with the
aperture's empty centre. The two halves of the identity now say the same thing.

**The casing is authored as literal text in `Wordmark.tsx`; `text-transform` is `none`.** Not
`uppercase` — a transform would eat the lowercase `i`, which is the entire device. That is worth
stating because `uppercase` is the reflex for a caps wordmark and it would silently destroy this
one.

**Two values were deliberately *not* changed, then measured in the same session.**
`letter-spacing: -0.02em` and the footer's `14vw` were both verified in phase 1 against the
lowercase form. Both are specced, so under CLAUDE.md non-negotiable §1 they get measured before
they get touched. Logged as **I-018**, measured immediately rather than deferred, and **both
hold** — the footer wordmark fills 82.5% of its column at 1512 and 71.6% at 390 and overflows at
neither. It grew from ~59% and ~51%, which halves the gap I-013 complains about at no cost.

**The measurement found a real overrun somewhere else: the navbar.** §4 fixes the logo box at
`4.25rem × 1.25rem` and `flex: none` reserves that width in the nav row, so the box is measured
and the face size is not — phase 1 had set `font-size: 1rem` because that is what made the
*lowercase* wordmark fill 4.25rem exactly. Caps measured **4.59rem in a 4.25rem box, an 8%
overrun into the links group.** `4.25 / 4.59 = 0.926` → `font-size: 0.925rem`, re-measured at
99.9% of the box at both 1512 and 390. One value moved and it is the fitted one, not the
measured one. This is the lesson worth carrying: **a casing change is a metrics change**, and
every box the wordmark sits in had been fitted to the old metrics.

### Service 04

The five services were transcribed from tonik, and slot 04 was **No-Code Development** — "Launch
10× faster. Conserve capital, validate early." tonik build in Webflow. This site is Next.js with
hand-written GSAP timelines, a custom GLSL material and a Matter.js floor. Offering a no-code
service line underneath that is a claim the codebase directly contradicts, and Sayandeep caught
it.

**Decision: `creative-development` / Creative Development**, chosen over Motion & Interaction,
AI Products, and dropping to four services. "The web, doing things the web isn't supposed to do."

It is the exact inverse of the slot it replaces, it is the industry's own term for WebGL, scroll
choreography and physics, and it is **evidenced rather than asserted** — its strongest portfolio
piece is the site the claim is written on. That matters here: `40-content-model.md` §3 recorded
slot 04 as having **zero** supporting works, and `30-page-specs.md` already specified a fallback
for its empty grid. One rename fixes a positioning lie and a content gap at once.

Motion & Interaction was the runner-up and reads as a discipline inside Product Design rather
than a service beside it. AI Products would have repeated slot 04's original problem — an
unevidenced service — with a more fashionable word.

**Consequence:** The slug change touches `lib/content/site.ts`, `ServiceIcon.tsx`, and four spec
files (`20` §17, `30` §/services, `40` §3, `01-PHASES` phase 7). Done in this commit, before
phase 7 builds five pages against the old name.

The service icon was re-keyed and **redrawn**: the old glyph was stacked blocks clicking
together, a no-code metaphor that means nothing under the new name. It is a wireframe cube now.
Still placeholder art like the other four — I-014 stands, and phase 10 still owns the set.

`docs/research/02-content-inventory.md` is left untouched. It records "No-Code Development —
nothing; no Webflow/no-code work exists", which is the evidence trail that led to this decision.
Research files are snapshots of what was found; rewriting them to match a later choice would
destroy the reasoning.

---

## D-012 · The hero's material, and four places §2 could not be transcribed literally

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** `50-brand-and-3d.md` §2 is the only spec section on this build with **no reference
to transcribe.** tonik's hero object is a Spline binary the brief deliberately does not copy, so
§2's scene graph and its GLSL are *authored design intent*, not measurements — which is a
different kind of document from §1's ratios or §20's IX2 curves, and has to be read differently.

Four things in it do not survive literal transcription. Each was rendered, looked at against
`docs/research/screens/tonik-hero-01.png`, and logged as its own issue. This decision records the
reasoning they share.

### 1. The lights had to actually light something

§2 offers a choice: *"`MeshPhysicalMaterial` extended via `onBeforeCompile`, or a full
`ShaderMaterial`"*. Its fragment sketch is the second shape — it builds `col` from the base
colour, a fresnel term and the grain, with no light loop at all. But the scene graph specifies a
key light at 2.4, a rim light at 1.8 and a hemisphere at 0.18, with exact positions.

Taken together literally, those three lights are inert objects in the graph.

**Decision: a full `ShaderMaterial`, with the specced lights as its uniforms.** The three lights
are real objects in the scene as §2 draws them, and the material reads its directions and
intensities *off those objects* rather than duplicating the numbers — change a light and the
material follows. `MeshPhysicalMaterial` was rejected on weight: it pulls three's entire physical
shader stack into a bundle that is already the subject of I-019.

Every term §2 *does* give is verbatim: `#2a2a2a`, `pow(…, 2.8)`, `vec3(0.55) * fresnel * 0.85`,
`mix(0.88, 1.06, grain)`, `uGrainScale 18.0`, `uGrainAmount 0.35`.

**The normalisation took two attempts and the first one was wrong.** Dividing the lambert term by
`ambient + key + rim` looks obviously right and is not: the two lights sit on **opposite sides**
of the object, so no surface can ever face both, and the achievable maximum was about 0.59. The
whole object rendered as a near-black silhouette. It now divides by `ambient + key`, so a
key-facing surface lands exactly on `uBaseColor`, a rim-facing one at ~0.77, and a clamp holds the
overlap. Only the fresnel goes above the base colour — which is precisely what §2 says the base
colour is for.

### 2. The output colour space (no issue — a local implementation choice)

§2's numbers are written as values you see: `#2a2a2a` is described as *"a shade off the `#212121`
ground"*, a statement about the screen. three's default colour management would convert the base
colour into linear working space on the way in and back out on the way out — which round-trips the
base correctly but silently triples the literal `vec3(0.55)` rim term, because that one is added
in the middle.

**Decision: `renderer.outputColorSpace = LinearSRGBColorSpace`, and the base colour passed as a
raw `Vector3` rather than a `THREE.Color`.** The shader then writes display values and every
specced number means what it says. Local to this renderer rather than a global
`ColorManagement.enabled = false`, and nothing else on the site uses three.

### 3. The grain had to reach the output — **I-021**

§2's sketch computes a `roughness` from the grain and never reads it again, so the grain reaches
the pixel through one ±9% albedo term and is invisible. The first render was a smooth dark torus,
against a reference that is visibly speckled. §2's prose says the surface *"has a fine granular
roughness that catches the rim light"*, so the sketch is missing the line that connects them. The
roughness now drives the fresnel falloff and its brightness.

### 4. The blades share the ring's tilt (no issue — reading the graph correctly)

§2 hangs `rotation.x = -0.55, rotation.z = 0.30` off the **Ring** line, because that is where the
ellipse presentation is described. Applied only to the torus it leaves six bars standing upright
through a tipped hoop — which is exactly what the first render showed. Ring and blades are one
mechanism and lie in one plane.

The tilt therefore sits on an inner node of **both**, below each parallax group. The ordering
matters: parallax stays on the outer groups so its axes remain the world X and Y the recovered
IX2 curves were measured in, rather than rotating the axes those curves act on.

### Also settled here

**I-022 — the camera.** §2's `position (0, 0, 6.5)` and §2's composition target contradict each
other; the composition is the half that can be checked against a capture, so `CAMERA_Z = 7.5` and
the distance is fitted to the viewport below the desktop aspect.

**I-023 — per-frame vs per-second.** §2's idle spin and parallax damp are stated as durations and
written as per-frame increments. Both are now applied per second of elapsed time, evaluating to
exactly the specced constants at 60fps.

**Alternatives:** Transcribe §2 literally and ship it. That produces an object twice the intended
size, with no visible grain, lit by nothing, whose blades stand in a different plane from its
ring — and it would have passed a token check and a screenshot diff, because there is nothing to
diff it against. This is the phase CLAUDE.md's model policy singles out as resting entirely on
judgement, and this is what that meant in practice.

**Consequence:** Thirteen behaviour assertions now hold the result in place — the triangle budget,
both parallax sweeps, the 1.5× ratio, the counter-rotation, both suspend paths, the reduced-motion
pose, the mobile blade count and the fitted camera. Four of the five deviations are still owed
Sayandeep's eye at the phase-2 gate, which already required a hero recording.

---

## D-013 · The JS budget is 320KB, because 190 was arithmetic and not a measurement

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** Installing Three took `/` from 170.1KB to 302.8KB against a specced ceiling of
190KB, and `npm run verify` went red on it. The ceiling could not be met by any means short of
removing the hero.

The 190 was wrong in two separate ways, and both are visible in §5's own itemisation —
*"GSAP ~55, Three ~150 raw/~48 gz, Lenis ~4, app ~40"*:

1. It **sums to 147, not 190**, and it **omits React and Next entirely.** They measure ~92KB
   gzipped here, so half the ceiling was gone before a line of our code was counted. The
   framework was never in the budget at all.
2. It estimates Three at **48KB**. Three 0.185 with a `WebGLRenderer`, a `TorusGeometry` and an
   `ExtrudeGeometry` measures **141.3KB transferred across two chunks.** `WebGLRenderer` pulls
   the entire shader library and tree-shaking barely touches it.

**Decision: `BUDGETS.homeJsGzipKb` is 320.** Sayandeep's call, put to him with the measurements
and three options. §5 now carries the corrected itemisation and the measured breakdown instead of
the original arithmetic, so the number stops looking like a target someone chose and starts
looking like what it is.

**What was done before asking**, because a budget argument is only honest once everything unused
is gone:

- **Three is dynamically imported.** `verify:budget`'s `three absent from the eagerly-loaded
  bundle` check passes and is no longer vacuous — the first time that assertion has meant
  anything since phase 0 wrote it.
- **Flip and Observer were removed** from `lib/motion/gsap.ts`. Registering a plugin is what pulls
  it into the bundle, and both were shipping on every page for nothing: Flip has exactly one
  consumer on the whole site (the showreel, §15, "the only use of Flip") and belongs to phase 3;
  Observer has no consumer in any component spec and was in the stack table only because tonik
  loads it. **−8.6KB.**

**What was deliberately not done.** Deferring Three's import to `requestIdleCallback` would move
the download outside `verify:budget`'s measurement window and turn the check green **without
saving the visitor a single byte.** That is gaming the instrument rather than meeting the budget,
and it would have quietly destroyed the check's meaning for every later phase. It was offered as
an explicit option — with the honest note that the budget would then have to be redefined as
*JS before interactive* — and not chosen.

**Alternatives:** Leave the check red until phase 12 — which hands every intervening phase a gate
that is already failing, and a gate nobody expects to be green stops being read. Drop the 3D hero
for the baked still on every visit, saving the full 141.3KB and ending phase 2's reason to exist.
Both were put to Sayandeep; both were declined.

**Consequence:** `npm run verify` is green. **The headroom is thin — 302.8 of 320, about 17KB —
and phases 3 to 5 add real code to this route.** Plyr and Matter must never appear in the figure:
both are specced lazy, so if either turns up that is a bug in the import and not a reason to raise
the ceiling again. The warning is in `budget.config.ts` beside the number, which is where whoever
next hits it will be looking.

Note that §3 "Why not Spline" survives intact. Its numbers were wrong, its conclusion was not —
Spline is ~380KB of runtime plus a ~200KB scene, so Three is still the smaller of the two even at
141KB.

---

## D-014 · The hero object is one housed mechanism, not a ring with parts near it

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** The first build followed `50-brand-and-3d.md` §2 literally: a `TorusGeometry(2.0,
0.075, …)` — a wire — with six thin bars floating at its inner edge, and §2's recovered parallax
curves driving the bars independently of the ring.

Sayandeep's verdict was exact: *"make it a singular object not a circle and some lines"*, and
*"it should subtly react to mouse movement … not loosing its teeth"*. Both were right, and the
second is the interesting one.

**The teeth came off because the spec's curves are correct for tonik and wrong for us.** Their
glyph floats free inside their ring, so driving the two at different rates on a shared axis costs
them nothing. Ours is housed. The same differential slid the blades out of the bore.

**Decision: rebuild it as a machined barrel with six blades inside its bore, and move the
differential to the axis where it is mechanically true.**

- **The barrel** is an extruded annulus with real depth, not a tube. `R_OUT` stays §2's 2.0; the
  cross-section does not. The band is **7% of the radius** — the 2D mark's own ring is 16.7%, and
  taken literally in 3D that is mostly side wall and reads as a bracelet. Measured against a live
  capture of theirs, 7% is the weight that reads as a slim bright ellipse rather than a dark mass.
- **The blades** are plates with a curved outer edge tucked under the bore and a straight inner
  edge, which is what makes six of them read as a polygonal opening rather than as spokes. 32°
  each, so more than half the bore stays open — "retracted" has to look retracted. The 8°
  off-radial lean is built into the outline, because a symmetric plate rotated about the bore axis
  just moves round the circle and leans nowhere.
- **The differential** is now: the housing tips as one object, and the blades **actuate about the
  bore's own axis**. That is what a real iris does, and it sweeps them within the housing.

**Why this is stronger than what it replaced, not just different.** A rotation about the bore axis
cannot change a radius. The blades are therefore *structurally* incapable of leaving the barrel —
it is not a tuning that happens to be small. `verify:motion` asserts exactly that: the furthest any
blade vertex sits from the axis is 1.930 against a 2.0 barrel, **constant to six decimal places**
across every pointer position. See I-025.

Triangles went **down**, 13,064 to 5,232. The first object was expensive because a 200-segment
torus is expensive, not because it was detailed.

**Alternatives:** Keep §2's curves and accept the blades detaching — the literal reading, and
visibly broken. Shrink the differential until the detachment is small enough to miss — which is
the same bug with a smaller number and no invariant to protect it. Float the blades free inside
the ring as tonik's glyph is, which would make the curves transfer directly but abandons the Open
Aperture: the blades belong to the mechanism, and a floating asterisk is their mark, not ours.

**Consequence:** Four §2 statements are now deliberately not transcribed — I-024 the ellipse,
I-025 the curves, I-026 the idle axis, I-027 the missing specular — each logged with its
measurement. Fifteen behaviour assertions hold the result. The old assertions asserted the wrong
thing correctly: "the blades outrun the ring by 1.5×" was true, and it was the bug.

---

## D-015 · Phase 3's hero was built in phase 2

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** Phase 2's acceptance requires the 3D hero to be judged against tonik's framing. With
the homepage empty, the footer's 14vw wordmark sat near the top of the document under a
full-height canvas and stood in for a headline — 971px of it, where a real tagline is ~700. Every
judgement about whether the object cleared the copy was being made against a stand-in that will
never exist.

Sayandeep asked for the hero copy directly, with the play control, so the composition could be
seen.

**Decision:** Build `30-page-specs.md` §1's hero copy in phase 2 — headline, inline play control,
foot rail — and leave the rest of phase 3 alone.

Explicitly **not** built, and still phase 3's: the scrubbed word reveal (T3.3), the showreel Flip
choreography (T3.6), the stack wall (T3.4, T3.5). `PlaySquare` renders the control and is inert
and `aria-hidden` — a button that looks live and does nothing is worse than no button, and a
screen reader announcing "play" on a control that cannot play is worse still.

**The tagline is ours, and its length is a design constraint.** "Design and build / with nothing
lost" — the same claim the footer tagline makes without repeating its words. The first draft,
"Design and engineering", wrapped to three lines and broke the two-line composition. Both lines
live in `HERO` in `lib/content/site.ts` so changing them needs no knowledge of the markup.

**Consequence:** Phase 3 inherits a working hero and the `data-hero` anchor, which closes I-020.
Its brief should be re-read before it is claimed — roughly a third of T3.1 and T3.2 is done.

---

## D-016 · Measure their live DOM, not their screenshots

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** Phase 2 spent most of a session correcting the hero's layout by eye against
`docs/research/screens/tonik-hero-01.png`, one number at a time. The foot rail was 29px too high.
The copy column was 57px too far left. The play control was 0.2rem out with the wrong gap. The
label colour was wrong. Each was found, fixed, and followed by another.

Sayandeep, reasonably: *"why getting so many issues in this just getting the very first page"*.

**Every one of those values was sitting in `getComputedStyle` the whole time.**

**Decision: extract their design system from the live DOM before building anything, and keep the
extraction in the repo.** `tools/extract/tonik.mjs`, `npm run extract:tonik`, written to
`docs/research/03-tonik-extract.md`.

**A capture shows where an element is. It never shows the rule that put it there.** That is the
whole difference: correcting from a picture converges slowly *and teaches nothing reusable*,
because the next component has the same rule behind it and you rediscover it from scratch.

The proof is the finding that ended it. `.container-large` is `max-width: 80rem`, centred — 1316px
at a 16.45 root, 1520px at 19, with a `unl-width` modifier for full-bleed. Ten of their eleven
instances are capped. That single value is why their copy starts at x=98 rather than the 41px
gutter, and it explains **every** alignment miss at once. Our own spec documented that class as
the gutter width. See I-030.

The same pass also gave the type scale as rendered, the colour set, the transition vocabulary and
the section rhythm — and turned up a border we do not have (`1px solid rgba(59,59,59,.3)`, their
most-used, the hairline on light surfaces) that phase 4 would otherwise have hit blind.

**On the engine.** Sayandeep asked for a non-Chromium browser. Firefox is the extractor's default,
and it is worth being precise about what that buys: computed styles are computed styles, and
Firefox exposes nothing Chromium hides. What it gives is an *independent renderer* — a figure both
engines agree on is a property of their CSS, and one they disagree on is a property of the engine
and must not be copied. `--chromium` runs the same pass for the diff.

**On what is and is not collected.** Measurements and structure: sizes, spacing, colour, timing,
section rhythm. Facts about a layout, and the same class of thing `docs/spec/` was already built
from. Their copy, their imagery, their Spline scene and their logo are **not** collected and are
not ours to ship — CLAUDE.md's line holds, *our own brand, our own work*. This is also the cheaper
path: a layout tuned to their string lengths has to be re-tuned to ours anyway, which is exactly
what happened when "Design and engineering" wrapped to three lines.

**Alternatives:** Keep correcting from captures — demonstrably slow and it produced a session of
one-number fixes. Copy their stylesheet wholesale — collects their content with their layout,
crosses the line above, and still needs re-tuning to our copy.

**Consequence:** Every later phase should **check the extract before measuring anything**, and
extend `tools/extract/tonik.mjs` rather than opening a screenshot. Protocol §2 and every phase's
Reading Map now say so.

---

## D-017 · The wordmark is 700 — the one exception to "never bolded"

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** CLAUDE.md non-negotiable §3 is unambiguous: *"The display face is never bolded. All
display weights are 400. Hierarchy comes from size and colour only."* The wordmark was 400, and
its CSS cited that rule.

Sayandeep, looking at the running site: *"our no filter text logo .. make it bold"*.

**Decision: the wordmark is `font-weight: 700`, and §3 is amended to name that exception rather
than left to be silently contradicted.**

The distinction that makes this coherent rather than drift: **§3 is a rule about type, and the
wordmark is not type.** It is a logo that happens to be drawn with the type face. Every heading,
label and paragraph on the site stays at 400, and `verify:tokens` still asserts that with an
every-match on `[data-t^=h], [data-t^=p]` — the wordmark carries no `data-t`, so the check is
unaffected and still meaningful.

At 14vw a 400 weight reads as a headline that happens to say the studio's name. At 700 it reads as
a mark. That is the difference the rule was never actually about.

**Why amend CLAUDE.md rather than just make the change.** A non-negotiable that the codebase
quietly violates is worse than either honouring it or changing it: the next agent reads §3, finds
a 700 wordmark, and "fixes" it. §3 now names the exception, points at this entry, and closes with
"anything else above 400 is drift" so the rule keeps its force everywhere it still applies.

**Consequence:** The wordmark is wider at 700, which touches I-018's arithmetic again — the footer
mark now ends around x=1100 at 1512 against ~1010 at 400. It still sits inside its column with
room. Noted there rather than re-opened.

---

## D-018 · `<RevealText>` does not re-split on resize

**Phase:** 3 · **Date:** 2026-08-26 · **Status:** active

**Context:** `20-components-and-motion.md` §4 ends with an implementation note: *"Re-split on
resize via `ScrollTrigger.addEventListener('refreshInit')`."*

**Decision: we split once, after `document.fonts.ready`, and never again.**

The note is correct advice for a **lines** split and unnecessary for a **words** split, which is
what §4 actually specifies (`types: 'words'`).

A line is a measurement — where a line breaks depends on the container's width, so a resize
invalidates every line box and the split has to be redone. A word is not. `split-type` gives each
`.word` `display: inline-block` and leaves it in the normal flow with the original whitespace
intact between them, so the block re-wraps on resize exactly as it did before it was split, and
the word *count* cannot change at any width.

Re-splitting on `refreshInit` would also be actively harmful here: it destroys and recreates the
very elements the live timeline is tweening, in the middle of a ScrollTrigger refresh. The tween
would be left pointing at detached nodes.

**Consequence:** If a future component needs a `lines` or `chars` split, this decision does not
cover it — it will need the re-split, and it should rebuild the timeline as well.

---

## D-019 · The stack wall is set as type, and it has a label we invented

**Phase:** 3 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep to confirm the label**

**Context:** `40-content-model.md` §6 calls for "monochrome wordmarks" of the 22 tools, replacing
tonik's client-logo wall.

**Two decisions, both mine.**

**1. The marks are type, not logos.** A "wordmark" for React, Vercel or Supabase means that
vendor's own lettering, and shipping twenty-two companies' trademarks to make a wall look busy is
a different act from naming what we build with. tonik's marks are their *clients*, which are
theirs to display; ours are tools, and we are not their customer in any way that grants a logo
licence. Set in the display face at `--t-h5`, twenty-two names fill the 80rem measure at about the
density §6 wants — "close to tonik's 28, so the wall reads at the same density."

**2. There is a label above it, and the spec does not have one.** `30-page-specs.md` §1 gives the
wall no label; tonik's has none either. Twenty-two bare product names under a headline read as
debris rather than as a statement, and every other section on this site opens with a mono label.
It says `THE STACK`.

**Consequence:** The label is content, and content is Sayandeep's. Flagged in the handoff. Changing
it is one constant — `STACK_LABEL` in `lib/content/site.ts`.

---

## D-020 · The showreel ships with a labelled placeholder reel

**Phase:** 3 · **Date:** 2026-08-26 · **Status:** temporary — T10.2 closes it

**Context:** T3.6 builds §15's Flip choreography. `01-PHASES.md` T10.2 captures the actual reel, in
phase 10. Built in that order, phase 3 would ship a transition that has never once run.

**The options, and why the third one wins.**

*Leave `SHOWREEL.src` empty and keep the button inert.* Honest, and the component's evidence would
have been the word "implemented" — which protocol §6 explicitly does not accept. §15 is the only
use of Flip on the site and its correctness is a claim about where a DOM node ends up; that is not
checkable by reading.

*Point at a file that does not exist.* A live-looking button that opens a broken player.

*Bake a real one and say what it is.* `npm run showreel:placeholder` records eight seconds of our
own hero with the pointer moving across it, using Playwright's own video recorder — there is no
ffmpeg on this machine and Playwright writes webm natively. The panel renders
`PLACEHOLDER REEL — REAL FOOTAGE LANDS WITH THE CASE STUDIES` next to the title, on screen, not in
a comment.

**What this bought.** Driving the real thing found two defects a reading pass would not have: Plyr's
stylesheet was never imported, so its SVG control icons rendered at intrinsic size — enormous black
arrows across the hero — and the reparented layer is appended last, so with no stacking order it
covered the video and the player read as a flat grey rectangle.

**The switch stays honest in both directions.** `<PlaySquare>` renders a `<span>` with `aria-hidden`
and no handler whenever `SHOWREEL.src` and `.srcWebm` are both empty, and the behaviour check
reports that state as a pass rather than a failure. Emptying the constant is all it takes to go
back.

**Consequence:** `public/media/showreel-placeholder.webm` is 2.27MB in the repo. It is
`preload="none"`, so it costs nothing until someone opens the panel and does not enter
`verify:budget`'s page-weight figure. T10.2 replaces the file and touches no code.

---

## D-021 · One word in the headline is drawn as selected

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's**

**Context:** Sayandeep, looking at the running hero: *"you know how we select texts right — the
tagline of design and build with nothing lost, I want the word 'build' to be selected, it creates
a depth effect."*

**Decision: `build` renders with the site's own `::selection` colours — `#efefef` ground, `#212121`
text.**

It does create depth, and the reason is worth writing down rather than filing as a flourish.

**It is not a new visual language.** `10-design-system.md` §6 already inverts `::selection`
site-wide, so a visitor who drags across the rest of the headline sees their own selection match
this word exactly. The effect works *because* the page already behaves this way; the same treatment
in any other two colours would read as a highlighter pen.

**A selection sits behind the glyphs and spans the full line box** — not the glyph bounds. At
`--t-h1`'s 6rem line-height that is a tall, flat plane with type sitting on it, which is what
reads as a different depth. This is why the CSS sets no padding: a browser's selection hugs the
line box exactly, and padding would break the illusion by making the box a shape of its own.

**Implementation.** `HERO.selectedWord` is a string, and `Hero.tsx` splits whichever line contains
it. Not an index and not hard-coded markup: rewriting the headline can then never leave the
highlight on the wrong word, which is the worst kind of content bug because it looks deliberate.
If the word matches nothing, the line renders plain.

A plain `<span>`, not `<mark>`. `<mark>` means "relevant to the user's current activity" and some
screen readers announce it; this is a visual treatment of one word in a headline and should be
read as ordinary text — which is exactly what a real selection is.

---

## D-022 · The work card's hover sheet is a drawer that fades, not a curtain that appears

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · **deviates from §5**

**Context:** `20-components-and-motion.md` §5 specifies the hover sheet as a full-bleed `#EFEFEF`
panel over the card's media, revealed with:

```js
onMouseEnter: gsap.set('.work__sheet', { opacity: 1 });
```

`gsap.set()` — no duration at all. Built exactly as written, which it was, a 1316×822 card goes
from `#212121` to pure white in one frame, twelve times over as you move down the page.

Sayandeep, on the running build: *"the case study cards take up a lot of space in the page. Okay,
but hovering them turns them white — basically immediately you get so much exposure, from dark
grey to pure white. Use some light colours or white in a proper way so people don't get
flashbanged. Also add a transition effect there, not just hovering and instant."*

**Decision: two changes, fixing different halves of the complaint.**

**1. It is a drawer.** Anchored to the foot of the media and sized by its own content instead of
filling the frame — 62% of a `half` card and 33% of the `full` opener, against 100% before. The
cover art stays visible above it, so the card still reads as the work with its specifications drawn
across the bottom. It also scales properly: a five-row table in an 822px-tall white rectangle
looked lost, and the same table in a drawer does not.

**2. It arrives.** 500ms in, 400ms out, matching §21.2's overlay so the two layers move together.
The overlay is already darkening the media to `.55` over the same 500ms, so the sequence a visitor
sees is *media dims, drawer rises into the dimmed area*. The eye is led rather than hit.

**The ground stays `#EFEFEF`.** The complaint was about area and abruptness, not about the colour,
and the light panel is the site's own inverted surface — the one `20-components-and-motion.md` §8's
`SpecTable` already knows how to sit on. Changing it would have cost the contrast that makes the
specifications readable and gained nothing the other two changes had not already got.

**Why this is a deviation and not a correction.** §5's `gsap.set()` is a faithful transcription of
what tonik do; nothing here says they got it wrong on *their* cards, which are smaller and carry
photographs rather than flat accent fields. It is wrong on ours. CLAUDE.md's rule against silently
changing specced values is satisfied by this entry and by the assertion below.

**Consequence:** `behaviour.config.ts` now asserts `sheetIn: 0.5`, `sheetOut: 0.4` and
`sheetMaxCoverage: 0.8`, read off the live tweens. A requirement nobody checks is one that
regresses the next time somebody reads §5 and "fixes" it back.

---

## D-023 · The placeholder reel shows the works, not the hero

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** temporary — T10.2 closes it · **supersedes part of D-020**

**Context:** D-020 baked a placeholder showreel so §15's Flip choreography could actually be
exercised. It recorded the **hero**: eight seconds of the aperture turning under a moving pointer.

Sayandeep: *"the play icon in the tagline — the play icon opens up the hero section itself. Does
that seem right? No. Need to find a proper solution for that."*

**Decision: the reel records the works grid instead — eleven seconds panning down the twelve cards.**

He is right, and the objection is about content, not machinery. A showreel that plays you the page
you are standing on is circular. Pressing play should show you *the work*, and now it does — the
closest thing to a reel this build has until T10.2 captures the deploys themselves.

Two details the script had to get right, both learned by watching the first take: the recording
starts at the grid rather than at the top of the page, and the pointer is parked at `(4, 4)` before
it runs. A cursor left resting on a card dims the other eleven to `.3` for the entire recording,
which is a hover state rather than a reel.

**What did not change:** the panel still says `PLACEHOLDER REEL — REAL FOOTAGE LANDS WITH THE CASE
STUDIES` on screen, the file is still 2.3MB behind `preload="none"`, and emptying `SHOWREEL.src`
still returns `<PlaySquare>` to an inert `aria-hidden` span. T10.2 replaces the file and touches no
code.


---

## D-024 · The work card's hover panel is dark and tinted with the work's accent

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · **deviates from §5**

**Context:** D-022 made the hover sheet a drawer and gave it a transition, but kept §5's `#EFEFEF`
ground on the reading that the complaint was about area and abruptness rather than colour. It was
about the colour too. Sayandeep, on that build: *"the total white, change that to a milder dim
colour."*

**Decision: the panel is `color-mix(in srgb, var(--work-accent) 14%, var(--black))` — the page's own
ground with 14% of that work's accent mixed in — with white text and a full-strength accent hairline
along its top edge.**

Chosen from three options put to him with previews; he took the dark accent-tinted one over a
neutral `#2e2e2e` and over a muted light grey.

**Three things fall out of it, and all three are improvements:**

- There is **no bright surface anywhere on the page**, at any moment. That was the actual request,
  and a dark panel satisfies it by construction rather than by tuning.
- Each panel is visibly **that card's** panel — Tessera a dark blue-grey, CanVas a dark red-brown,
  Solidus a dark green. Twelve identical white rectangles never were.
- The `SpecTable` drops back to its **ordinary palette** — grey keys, white values, `white-30`
  rules — so the `invert` variant is not needed here at all.

**14% is the whole of the tuning.** Below about 10% the accents stop being distinguishable from one
another and the panels all read as the same near-black; above about 20% the darker accents start
fighting the white text for contrast.

**Consequence:** the assertion is a **property, not a hex**: relative luminance ≤ 0.10, and still
lighter than the page ground. All twelve panels are different colours by design, so pinning one
value would pass vacuously for eleven of them and go stale the moment an accent is re-sampled.
Measured at 0.0211 against the page's 0.0152.

One harness bug came out of this and is worth remembering: `color-mix()` computes to
`color(srgb 0.194 0.143 0.121)`, with components in **0..1**, while an ordinary declaration computes
to `rgb(33, 33, 33)` in **0..255**. A luminance helper that assumes one scale reports near-zero for
the other — which would have sailed through "must be dark" for entirely the wrong reason.

---

## D-025 · The card's caption is never covered and never moves

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · **deviates from §5**

**Context:** Sayandeep, on the build with the dark drawer: *"the info at the bottom of the actual
card, such as project name and the right side description — those are getting covered too. I don't
want that getting covered. Just cover the card image itself, not the info."*

**Two separate causes, and only one of them was a design choice.**

**1. A positioning bug.** The sheet is `position: absolute; bottom: 0`, and there was no relative
ancestor between it and `.card` — so `bottom` resolved against the whole card, caption included.
Fixed by introducing `.frame`, a `position: relative` wrapper that is exactly the media's box, with
the caption outside it. The panel now cannot reach the caption at any size.

**2. §5's caption rise, removed.** §5's `[src]` slides `.work__info` to `yPercent: -110` on hover.
Built faithfully, that makes the work's name and summary disappear at the moment you are reading
about them — and with the specifications now drawn over the media beside it, there is no reason to
take the name away. The caption stays put, at full opacity, while the panel is open.

**Consequence:** the card's hover timeline is now **empty and therefore gone.** §5 gives it two
children; the sibling-dim moved to the grid in I-039 and the caption rise is removed here, so there
is nothing left to register. `work-card.hover` was deleted from `motion.config.ts` rather than left
as an empty entry, which would read as a timeline somebody forgot to finish. What replaced it — the
sheet's wipe, the overlay's asymmetric fade, the reel swap — are separate tweens on separate targets
by design, and all of them are asserted in `behaviour.works.ts` by reading each live tween's own
`duration()`.

---

## D-026 · The full-width card is a 21:9 band

**Phase:** 4 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's**

**Context:** `40-content-model.md` §2 makes Tessera the one `full` card, and §5 gives every card a
16:10 media box. Across all twelve columns that is **1316 × 822** at 1512 — most of a viewport for
one card, before its caption. Sayandeep: *"the big card Tessera, that's so big, doesn't look good."*

**Decision: `full` cards use 21:9. Everything else keeps 16:10.**

The fix is the aspect ratio rather than the span. A full-width card should be the **widest** thing
on the page, not the tallest; at 21:9 it is 1316 × 564, a cinematic band that opens the section and
then gets out of the way.

The `wide` cards keep 16:10, which at eight columns is 870 × 544 — now the *deeper* of the two
shapes, so the section's rhythm still alternates between a long band and a tall block rather than
flattening into one proportion.


---

## D-027 · The works grid's sibling-dim is off

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · **overrides §5**

**Context:** `20-components-and-motion.md` §5 calls dimming the other eleven cards to `.3` on hover
*"the single most striking interaction on the site"*, and §21.1 makes it one of three components
sharing a `useSiblingDim(0.3)` primitive. Phase 4 built it, hoisted it to the grid, and asserted it
at exactly 0.3 against all eleven others.

Sayandeep, on the running build: *"when I hover over one card the rest also gets dimmed — fix that
too."*

**Decision: the dim is off.**

He is right, and the cause is a change we made earlier the same day. **The dim was legible when the
hovered card turned white.** One card lit, eleven receded, and the contrast pointed at the one you
were on. D-024 made the hovered card's panel dark, so hovering anything now makes the entire grid
darker and nothing brighter — the page reads as *dimming* rather than as *focusing*. The
interaction did not stop working; the thing it was contrasting against went away.

**Consequence:** `useSiblingDim` is untouched and still used by the footer, so nothing is stranded,
and the call site in `WorksGrid` is left in place as a comment. The assertion was **inverted rather
than deleted**, behind `expectDim: false` in `behaviour.config.ts` — a removed behaviour whose
check went with it is indistinguishable from one that broke, and this is one line away from coming
back. Softening it to `0.55` instead of removing it is the obvious middle path if it is ever
revisited.

---

## D-028 · The loader draws the aperture before it sweeps

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · `[new]`

**Context:** Sayandeep: *"animate the logo and loader for the initial page."* tonik's loader shows a
static logo behind a panel sweep; there is nothing to transcribe.

**Decision: on the first paint only, the mark draws itself — the ring by dash-offset, then the six
ticks staggered — and hands over to `loader.enter`.**

The animation was already in the glyph. `50-brand-and-3d.md` §1 draws the aperture with its blades
**retracted**: a ring with six short radial ticks at its inner edge. So a ring arriving first and
the ticks then pulling back to it is *an iris opening* — the one motion this mark was always going
to have, rather than a fade or a spin that could have been any logo.

**It is a separate timeline from `loader.enter`, and that is the load-bearing part.** `enter` is a
transcription of IX2 `a-23` and `verify:motion` asserts its exact shape — five children, 0.6s, both
tweens at `startTime 0`. Adding the draw to it would mean either breaking that assertion or
loosening it, and **a loosened assertion is how a transcription quietly stops being one.**

**First visit only.** On a route change the mark has already introduced itself, and 0.7s of it
again is a toll rather than a flourish. Under reduced motion it does not run at all — the loader
stays the 200ms fade §1 specifies.

**Consequence, and it was the expensive half.** The loader now covers the page for ~1.3s instead of
0.6s, and **four harness checks that had been implicitly relying on the shorter number failed at
once**: hovers intercepted by the panel, visual shots of a covered page, a ScrollTrigger baseline
of 0 read before any trigger existed, and a phantom rAF loop. Every one of them was already fragile
and none had ever failed. See I-043.

---

## D-029 · Opening an accordion row scrolls to it; closing returns you

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's** · not in §6

**Context:** Sayandeep: *"when I click on Product Design and all, it opens up where I click — but as
the content is that big, what it should do is it should get clipped up to the top and open the
content, and you click it again it clips back down from where you left."*

Neither §6 nor tonik covers this. Their rows are shorter; ours carries a lead, two paragraphs, a
pill CTA and a three-block inverted panel, which comes to most of a viewport.

**Decision: opening a row scrolls its head to 6rem below the top; closing returns to the scroll
position the visitor had before they opened anything.**

Two details that are not obvious:

**The target is predicted, not measured after the fact.** Scrolling only once the layout has
settled means waiting out the 0.7s open, which reads as lag rather than as a response. The row's
final top is knowable at click time: it moves only if the row that is *closing* sits above it, and
by exactly that row's body height. One subtraction, and the scroll starts on the same frame as the
click.

**Switching rows keeps the original restore point.** Open A, then B, then close B, and you return
to where you entered the section — not to the middle of the row you just left.

Under reduced motion it is an instant jump rather than a 0.6s Lenis scroll: moving someone through
space over time is precisely what they asked not to have.

**Consequence:** 6rem is the offset because the navbar is `position: fixed`. If the navbar's height
ever changes, `OPEN_SCROLL_OFFSET_REM` is the one number to revisit.

---

## D-030 · The loader is an opening iris; the schematic is three shapes

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active · **Sayandeep's, via a brainstorm**

**Context:** Two `[new]` animations, both rejected on sight and both for the same underlying reason.

The loader had been built twice — a dash-offset stroke drawing the mark, then a rotating version of
the same. *"The loader for the loading page — I don't like that animation there."* The schematic was
a technical instrument: twenty-four rim ticks, four broken arcs, a crosshair and a sweeping
indicator. *"Way too convoluted — make it simple, line arts, shapes."*

Three options were put for each, with previews. He took the recommendation both times.

### The loader: the mark stops being drawn and starts working

`50-brand-and-3d.md` §1 draws the aperture **with its blades retracted** — a ring, and six short
blades sitting at its inner edge. The mark is a shutter that has already opened. So the loader is
that mechanism arriving at the pose the mark is drawn in: the blades start closed over the bore and
retract to their stations, turning as they go.

**Nothing is drawn.** The ring is present from the first frame because it is present in the mark.
That is the whole difference from the two rejected versions — "the logo appears" is something done
*to* a logo, and dash-drawing a hairline on a 5rem mark is scratchy besides. This is something the
logo *does*, and a visitor who watches it once understands what the glyph is.

Two motions, both starting at zero, in unison rather than staggered: six blades opening one after
another is a fan, six opening together is a shutter.

**The retraction is an `attr` tween on `y2`, not a transform**, and that is the one piece of craft
in it. The blades already carry two rotations from the mark's own markup (`rotate(station)` then
`rotate(8°)` about their own anchor), and a scale composed on top of those would shear them off
their radial line. Moving the endpoint keeps every blade exactly on its own axis, which is what
§1's geometry *is*.

### The schematic: thirty elements to three

A circle, a square and a triangle, nested, on one hairline weight, turning at 90 / 60 / 40 seconds a
revolution in alternating directions. The periods never come back into phase, so the figure is never
twice the same.

**The circle is a 330° arc rather than a closed ring.** A closed circle rotating is
indistinguishable from a circle standing still, so the outermost shape would have been doing nothing
at all. The gap is what makes its rotation legible, and at 330° it still reads as a circle.

**Why the figure exists at all is worth restating**, because it is not decoration. Every other
motion on the homepage is *reactive* — the word reveal, the card reveals, the parallax, the marquee,
the culture wipes, the accordion. Nothing moves until you move, so the instant you stop scrolling
the page is a photograph. That is why it read as bland with all that choreography in it. This is the
one thing on the site that does not wait to be asked.

**Consequence:** `ApertureMark` gained a `<g data-mark-blades>` wrapper so the six can be turned as
one. It carries no transform at rest, so the mark is unchanged at 16px in the navbar and 14vw in the
footer. Both timelines are asserted — `loader.mark` at 0.9s / 5 children, `schematic.draw` at 0.94s
/ 3 — and both remain **separate from `loader.enter`**, which is an IX2 transcription whose exact
shape this harness asserts.

---

## D-031 · The 404 was brought forward from phase 12

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active

**Context:** The site was deployed to Vercel for the team to review, and **four of the five links in
the navbar do not resolve yet** — `/works` and `/services/[slug]` are phase 7, `/about` is phase 8,
`/blog` is phase 9. Anyone clicking one got the bare framework 404.

**Decision: build `01-PHASES.md` T12.1's `/404` now.**

A framework 404 reads as *the site is broken*. This one reads as *that page has not been built yet*,
and those are very different messages to send someone you have asked to review your work. It lists
the pending routes and links home.

The route list is read from `NAV_LINKS` rather than written out, so a section that ships stops being
described as pending without anyone having to remember — and the copy is written to be true for a
genuine mistyped URL as much as for an unbuilt section.

T12.1's blur reveal (`blur(24px) → 0` after `.5s`) is done in **CSS, not GSAP**. This route has no
other motion, and pulling the whole animation runtime onto a page whose only job is to apologise is
a strange way to spend a JS budget that has already been raised once. `prefers-reduced-motion` is
handled by the global reset, which flattens every animation to 0.01ms.

**Consequence:** T12.1 is done. Phase 12 should re-check it against the finished site rather than
rebuild it.


---

## D-032 · The 3D object gets line-art edges

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active

**Context:** Sayandeep, on the running hero: *"in the 3d object for the wheel give proper border
edges .. line art edges"*, and then *"lets get rid of texture too for now."*

**Decision: the aperture assembly carries `EdgesGeometry` contours at one device pixel.**

`THREE.EdgesGeometry` extracts only the edges where two faces meet above a threshold angle, which is
the difference between a wireframe (every triangle, a mesh) and a contour (the silhouette and the
creases, a drawing). At one device pixel the lines read as ink rather than as geometry, which is the
register the rest of the site is in.

The texture came off at the same time and stayed off. The object is now form and line.

**Consequence:** the mark's own geometry is drawn to the same rule — see D-033.

---

## D-033 · The wordmark carries a tilted aperture, and so does the tab

**Phase:** 5 · **Date:** 2026-08-26 · **Status:** active

**Context:** Sayandeep: *"add a logo ... tilted wheel kinda"*, then twice more that the favicon was
still not visible in the tab.

**Decision: one mark, tilted to match the 3D hero, with the tilt baked into the geometry.**

The tilt is `51.1` degrees about its own axis with a `0.7247` squash, **computed** rather than
applied as a CSS or SVG `transform`. A transform squashes the *stroke* along with the shape, and at
16px that broke the ring into a "C" — the reason the first two attempts at the favicon failed.

`icon.svg` additionally takes a heavier optical cut (`BOLD_RING 1.5`, `BOLD_TICK 1.7`,
`BOLD_TICK_LENGTH 1.2`). The shape is identical and only the stroke weights differ, which is
ordinary practice for a mark that has to survive a 16px raster and a 512px tile. Tuned by rendering
at 16 / 24 / 32 / 64: at 1.9x / 2.3x the bore closes and it reads as a cog; at 1.5x / 1.7x the bore
stays at about 57% of the radius.

**Consequence:** `scripts/brand-assets.mjs` is the single source for every rendering of the mark.

---

## D-034 · Every product screenshot sits on a plate

**Phase:** 6 · **Date:** 2026-08-26 · **Status:** active

**Context:** Sayandeep, on the first build of the case study: *"i really really dont like the project
images there it breaks the immersion that we had throughout the site before the project images came
... idk what to do to keep the symmetry and immersion alive."*

**The diagnosis is not the obvious one.** The problem was never that the screenshots are colourful.
It is that they were **whole application screenshots bleeding to the container edge** — toolbars,
side rails, tiny UI text — butted straight against a page built from hairlines and 400-weight type.

Looking at tonik's own screens settled it. Their work cards are not screenshots at all: they are
single art-directed key images — a 3D render on a flat ground, a rendered landscape — one subject,
one dominant colour, a great deal of empty space (`docs/research/screens/s03-projects.png`). The one
genuine UI screenshot on their Supabase case study sits **inset on a lighter plate with heavy
padding**, floating, never touching an edge (`s20-cs-content.png`).

**Decision: `components/ui/Plate.tsx`. Every work image floats inset on a `--grey-900` plate with a
hairline and real padding, and full-bleed is retired for screenshots.**

`bleed` widens the *plate* to the viewport while the picture inside stays inset — so the bleed kept
its meaning and lost the thing that made it loud. Padding scales with the slot: `lg` 3.5rem for the
hero and the boards, `md` 2rem for slider slides, `sm` 1.25rem for grid cards, all collapsing below
992 where 3.5rem of plate would leave 280px of picture on a phone.

Four treatments were rendered on the real page before choosing —
`docs/research/screens/ours/image-treatments.png`. The plate was chosen over a desaturating grade
because a grade misrepresents the product. That last reasoning was overtaken a few minutes later by
D-035, which adopts the grade anyway on Sayandeep's explicit instruction; the plate stands
regardless, because it fixes composition rather than colour.

`<NextWork>` was recomposed at the same time. Its title used to lie across a full-bleed screenshot,
which is the same collision plus one of its own: a title over a screenshot is a title whose
legibility depends on what happens to be in that corner of someone else's interface. Copy now sits
beside the picture.

**Consequence:** `<WorkCover>`, the generated accent plate standing in for the four works with no
deploy, is not plated. It is already our own material.

---

## D-035 · The board replaces the three visual blocks, and product images are grey

**Phase:** 6 · **Date:** 2026-08-26 · **Status:** active

**Context:** Sayandeep, after the plate landed: *"for the case studies .. instead of using one image
.. use multiple images on a board type one with animations and the coloured info do it grey and
white too."*

Two decisions, taken together.

### The board

`30-page-specs.md` §2 lists `visual-full`, `visual-2up` and `visual-bleed` as three block types.
They are one instruction at three widths, and all three are now **`board`** —
`components/case/CaseBoard.tsx`, two to five images composed onto a twelve-column plate.

**The author supplies pictures, not a layout.** Twelve case studies get written by hand in phase 10,
and a block that accepts a layout produces twelve different-looking pages, so the arrangement is
chosen by **count**: each of 2, 3, 4 and 5 has one composition, authored the way `WORKS_LAYOUT` is —
explicit `grid-column` and `grid-row` on a fixed row unit. Auto-placement was tried and cannot make
the shape: a board's character is tiles that overlap each other's rows, and auto-placement will not
overlap.

Two animations, and they are different things. A **reveal** that runs once as the board enters —
each tile rises 48px and fades, staggered 90ms — and a scrubbed **parallax** at §5's own
-6 / -10 / -14 spread, which is what stops four pictures reading as one slab sliding past. One
ScrollTrigger each, never one per tile: phase 5 paid for that lesson twice with `curTrigger is
undefined`.

### Grey and white

`--media-grade: grayscale(1) contrast(1.03)`, applied to every product screenshot on the site — grid
cards, case-study boards, the hero reel, `<NextWork>`.

This makes a rule out of what was nearly true already: **the page has exactly one colour, the work's
accent**, and that is now the only colour a product image can carry — through the accent wash on
`<NextWork>`, and nowhere else.

The cost is real and was put to Sayandeep before he chose: a visitor never sees what the products
actually look like without opening the live link. A grey-until-hover variant was offered as the
recommendation and **declined in favour of permanent grey.** Recorded here so a later agent does not
quietly "fix" it back.

One exception: `<WorkCover>` is drawn *in* the accent rather than photographed, so grading it would
grey out the one colour the system permits.

**Consequence:** `visual-full`, `visual-2up` and `visual-bleed` no longer exist in `Block`. Phase 10
authors boards.


---

## D-036 · One tilt, and the accent narrows to hairlines

**Phase:** 6 · **Date:** 2026-08-27 · **Status:** active

Two corrections from the same review, both about consistency.

### The tilt

Sayandeep: *"the 3d is right tilted the logos and loaders are left tilted .. align them .. either all right or all left."*

`apertureScene.ts` and `ApertureMark.tsx` both carried the axis as **0.892 rad / 51.1 degrees**, read
off the same measurement — and for five phases they tilted in opposite directions. Nothing was
mistyped: **Three's y axis points up and SVG's points down**, so the identical angle about the
identical axis mirrors between them.

The magnitude is the measurement and the sign is the coordinate system, so **the sign is what
changed**. The 3D object keeps the number the spec measured; the mark — which is ours — turns to
meet it. `TILT_AXIS_DEGREES` is now `-51.1` in the component and in `scripts/brand-assets.mjs`, and
the brand assets were regenerated.

### The accent

D-035 graded every product screenshot to grey, which left the work card's hover sheet as the last
coloured surface on the site. Sayandeep: *"those are coloured .. initially that was intentional ..
now when everything is greyscaled .. keep it white."*

**The accent now appears only where it is a single line or a small mark.** It survives on:

- the hairline under the case-study hero (the `.7s` crossfade target)
- the pull quote's left rule
- code strings and inline code (`--accent-ink`)
- the custom cursor's disc
- the work card's top hairline
- one rule per generated plate

It is gone from the hover sheet, which is now `--grey-900`, and from `<NextWork>`'s wash, which is
now a neutral scrim with an accent hairline down the picture's inside edge.

**The loader tint moved rather than being deleted.** `10-design-system.md` §2 says the loader "tints
to `darken(accent, 10%)`"; `50-brand-and-3d.md` §4 says the **glyph** is tinted. It was built as the
panel — the first reading — and a full-screen colour fill is exactly what this decision removes. It
now tints the glyph, which is what the brand doc always said, and T6.7 survives intact.

---

## D-037 · The case-study lightbox is deleted

**Phase:** 6 · **Date:** 2026-08-27 · **Status:** active · **supersedes T6.6**

**Context:** Sayandeep, on the drawer built for T6.6: *"whenever i click on a work case study .. it
opens up .. but the content there isnt clear .. first of all why taking me to a new page and opening
a side panel for that page itself .. if u are taking me to a new page for something i clicked that
page should be for it u do not need to show me that in a sideview."*

He is right, and the incoherence was in the design rather than the implementation. An intercepted
parallel route changes the URL to `/works/tessera` **and** renders a drawer over the previous page —
so the address bar says you have arrived somewhere and the screen says you have not.

**Decision: a work card navigates. `app/@modal/`, `WorkLightbox`, the `modal` slot and the
intercepting route are all removed.**

`20-components-and-motion.md` §16 describes tonik's Ajax lightbox and its own adaptation note offers
the parallel route as *our* substitution — it is not a measured behaviour of theirs that we owe
fidelity to. The case study is a page. It has a URL, it can be shared, the back button returns you
to the grid at the card you left from, and there is one way in.

**Consequence:** `<WorkCard>`'s link lost `data-no-loader`, so the loader's exit sweep is now the
transition into a case study — which is the moment T6.7's glyph tint was designed for.
`behaviour.case.ts` keeps a check that no visible dialog appears over a case study, because a
parallel route is nearly invisible in a diff and easy to reintroduce.

---

## D-038 · Case-study imagery is generated in code

**Phase:** 6 · **Date:** 2026-08-27 · **Status:** active

**Context:** Sayandeep: *"change the tessera's case study image .. use a artsy generated image which
suits the theme .. may not be related to tessera if needed be"*, then *"like the tessera thumbnail ..
do the similar thing for the rest too."*

Three options were put to him: generated in code, offline renders of the 3D aperture, or an image
model. **He chose code.**

`components/art/Artwork.tsx` draws a plate from four motifs — `mosaic`, `iris`, `strata`, `orbit` —
every one built from something already on the page: the aperture's tilted ellipse and six blades,
`<Schematic>`'s fields of straight hairlines, the twelve-column grid, the 1px rule. Nothing here
introduces a shape the site does not already use, which is the difference between generated art and
generated wallpaper.

The motif is chosen by the seed unless the content names one. Tessera names `mosaic`, because a
*tessera* is a single tile in a mosaic and leaving that to a coin toss would waste the one joke the
naming affords.

**Two things this got wrong first, both worth keeping written down.**

It read as **noise** — an even field of speckle with no subject. The fix was to couple two values
that were independent: density falls off from a seeded centre on a curve, and brightness is a
function of that same distance. Twelve plates still differ; they differ as compositions rather than
as different noise.

And it produced a **hydration mismatch** — 177 tiles on the server, 271 in the browser — from a
single `random` closure passed as a prop to `<Mosaic>` and then `<Rule>`. A generator created during
render is mutable state in a render function, and React does not guarantee a parent and its children
re-render together. Every motif now derives its own generator from its own seed and none is ever
passed across a component boundary. See I-052.

**Consequence:** all twelve works carry `card.art`. The screenshots that remain in Tessera's board
are the ones that are *evidence* — the sprite, the document, the ASCII — rather than decoration.


---

## D-039 · `/services` exists, and the industries live on it

**Phase:** 7 · **Date:** 2026-08-27 · **Status:** active

`30-page-specs.md` lists five `/services/[slug]` pages and no index. Our navbar has said SERVICES
since phase 1, so that route had to exist or the link had to move.

**Decision: build the index.** A redirect to `/services/product-design` was the alternative and is
worse — it makes one of the five look canonical, and the back button then lands you where you
already are.

The template is ours rather than the spec's, so it is assembled from shapes the spec already
established: the case-study footer's big link rows, and the generated numerals from §7 and §17.

The five **industries** are listed on it too. `/industries/[slug]` is five real routes that nothing
linked to — reachable from the works filter in spirit and from nowhere in the markup. A section here
is the honest home for them until phase 12 revisits the navigation. See I-054.

---

## D-040 · The work card carries its own name

**Phase:** 7 · **Date:** 2026-08-27 · **Status:** active

Sayandeep: *"show the name of the projects on top of the card like tonik does."*

It matters more for us than it does for them. Their cards are key images of recognisable clients;
ours are **generated plates** (D-038), so without a name on the picture there is no way to tell one
card from another until you read the caption underneath it.

The name takes the strong position — top left, where the eye lands — and the CASE STUDY chip moves
opposite it. Both sit in one wrapper carrying `data-work-badge`, so they wipe in on the tween the
badge already had rather than needing a second one.

---

## D-041 · The phone hero gets buttons, and loses the play square

**Phase:** 7 · **Date:** 2026-08-27 · **Status:** active

Sayandeep: *"in mobile the hero section is way too long with nothing in it .. add a button of some
sort or something to fill that empty space"*, then *"the play button is also misplaced in phone
view .. the buttons need to shift down."*

**The void is structural.** On desktop the hero's height is filled by the 3D assembly and the
headline sharing a row. Below 768 the object drops behind the copy, the two stop sharing anything,
and the column the object used to occupy becomes dead space above the rail.

So it gets the thing it should always have had: **SEE THE WORK** and **LET'S TALK**, below the
headline. The desktop hero's only affordance was `<PlaySquare>`, which is a showreel control rather
than a way into the site — a phone visitor had nothing to press until they had scrolled past the
fold.

A first attempt gave the row `margin-top: auto`, and `.rail` already had one, so the two shared the
free space and dropped the buttons into the middle of the 3D object. They are anchored to the
headline instead.

**`<PlaySquare>` is hidden below 768.** It is not misplaced so much as unreadable at that size: a
36px dark rectangle with a small glyph, shorter than the line it sits in, indenting line two while
line one starts at the gutter. It reads as a rendering fault. Hiding it costs nothing today because
the reel behind it is still the placeholder recorded off our own works grid (I-033); when T10.2
supplies real footage it should return as a labelled control in the actions row rather than as a
square in the headline.

Hidden above 767 deliberately — the desktop composition is approved and has no room for a button row.


---

## D-042 · Post bodies are typed blocks, not MDX

**Phase:** 9 · **Date:** 2026-08-27 · **Status:** active

`30-page-specs.md` §`/blog/[slug]` specifies MDX with Shiki at build time.

**It gets the Shiki half and not the MDX half.** `components/case/CodeBlock.tsx` already runs Shiki
at build time for the case studies, so the spec's stated benefit — *"same visual result, correct
tokenisation, zero runtime cost"* — is delivered by the component that already did it.

MDX buys two things: authoring in markdown, and components inside prose. Neither is worth a second
content mechanism here. The same people who write the code write the posts; the site already has a
typed block union that twelve case studies use; and the union is what makes a body **checkable** — a
missing `alt`, an unknown language or a heading level out of order become type errors rather than
things a reader finds.

The rendered result is what §`/blog/[slug]` describes: `h2` at `--t-h3`, `h3` at `--t-h5`,
paragraphs at `--t-p`, a blockquote with a 1px left rule, and syntax-highlighted `<pre>`.

**Consequence:** no `@next/mdx`, no MDX loader, no second highlighting path. If a post ever needs a
live component in the middle of it, that is the moment to revisit this.

---

## D-043 · Only written posts are routes

**Phase:** 9 · **Date:** 2026-08-27 · **Status:** active

`lib/content/posts.ts` carries metadata for **twelve** articles. **Three** have bodies.

`generateStaticParams` reads the bodies rather than the metadata, so the other nine are not routes
and `/blog` lists only what exists. The alternative was twelve stubs — a blog that looks finished
and is not, on a site whose entire argument is that the work behind it is real. Nine empty articles
would be the most expensive thing on it.

The three written are the ones the homepage's blog row already featured, so nothing that linked
somewhere now links nowhere.

**Consequence:** the remaining nine are a content task, not a code task. Adding one is a file in
`content/posts/` and a line in its index.

---

## D-044 · The card name is centred, faded, and rises on hover

**Phase:** 7 · **Date:** 2026-08-27 · **Status:** active · **supersedes the top-left version in D-040**

Sayandeep, on the first placement: *"not at top left corner .. at the centre .. initially faded and u
hover it pops up."*

Centred and faded is the better answer for the reason D-040 gave in the first place: our cards are
generated plates, so at rest the name should be a **watermark** that says which work this is without
competing with the artwork, and on hover it should become the label.

It travels to **20% from the top**, not a nudge, and that is not decoration. The hover sheet wipes up
from the foot of the card and its top edge crosses the middle — a name that stayed centred would be
*behind the drawer* at exactly the moment it was meant to be legible. Rising clear of it is both the
effect asked for and the only position where the effect is visible.

Animated on `top` rather than `transform`: a percentage translate resolves against the element's own
height, and the distance needed is a fraction of the card's.
