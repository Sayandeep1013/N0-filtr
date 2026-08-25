# Phase 02 — Brand & 3D hero 🚦 GATE

**Branch:** `phase/02-brand-3d` · **Started:** 2026-08-26 · **Completed:** —
**Sessions:** 1 (in progress) · **Model:** Opus · **Final commit:** — · **Tag:** —

> Permanent record. Not overwritten. One file per phase in `docs/build/phases/`.

---

## Confirming phase 1 before starting

Protocol §1 step 1 and the phase-01 handoff both ask for this, and STATE claiming a phase is
complete is not the same as it being complete. `npm run verify` was re-run at `63f4490` on
`main`, before any phase-2 work and before creating this branch:

```
tokens  ✅ 136/136
motion  ⚠️ 129/132  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 4/4

✓ verify green                                        [exited with code 0]
```

Corroborating evidence, so the conclusion does not rest on one command:

| Claim | Checked how |
|---|---|
| The four chrome components exist | `components/chrome/` holds Loader, Navbar, ContactPanel, ContactForm + modules |
| The phase was tagged | `git tag` → `phase-00-complete`, `phase-01-complete` |
| The tasks were evidenced | PHASE-01.md's T1.1–T1.9 table each cites a report line, a capture or a measurement |
| The post-tag decisions landed | `514b4a9` / `7fe2d24` on `main`: I-017 easing and the real contact details |
| The gate was not skipped | `tools/verify/output/report.md` is committed at `7fe2d24` |

**Phase 1 is complete.** Its three known-incomplete items are all owed by later phases and none
of them block this one: 3 pending motion assertions (phases 4, 5), the empty contact-panel gif
slot (I-015, phase 10), and the placeholder footer service icons (I-014, phase 2 *or* 10).

---

## Plan

Nine tasks from `01-PHASES.md`. T2.1 is a hard gate — `50-brand-and-3d.md` §5 makes user
approval a precondition, and the phase brief says **STOP. Present to user. Do not proceed
without approval.** Everything else in the phase renders the approved mark, so building any of
it first would be building on an unapproved foundation.

**The mark already exists.** Phase 1 built `ApertureMark.tsx` and `Wordmark.tsx` under D-009,
because the loader had nothing to render without a glyph and the geometry was fully specified —
transcription, not design. So T2.1 is not a build task in this session; it is the presentation
and the decision. That is also why the sign-off material could be produced without writing any
code: the mark is already in the loader, the nav and the footer.

### The order after approval

1. **T2.9 first, not last.** Favicon and OG image are the two surfaces the mark isn't on yet,
   they are the cheapest possible confirmation that the approved glyph is the shipping glyph,
   and they need no Three.js.
2. **T2.2 → T2.3 → T2.4** — mount, geometry, material. The scene has to exist before the shader
   has anything to shade.
3. **T2.5 → T2.6** — the recovered parallax curves, then the mobile scroll drive.
4. **T2.7 → T2.8** — perf and the two degraded paths. Both are acceptance criteria, not polish.

### The budget problem, stated up front

`/` is at **170.0KB of a 190KB** JS budget. Three.js is ~48KB gzipped. **It must be dynamically
imported** or this phase blows the budget on its own — `60-architecture-and-build.md` §5 already
requires this and the phase-01 handoff supplies the number. Installing `three` also stops the
`verify:budget` three/matter/plyr absence assertions being vacuous for the first time.

---

## Task table

| id | task | status | evidence |
|---|---|---|---|
| T2.1 | Aperture mark — glyph at 16/32/48px + `NO FiLTER` wordmark | ✅ | approved 2026-08-26 (D-010); casing revised (D-011); nav box re-measured at 99.9% (I-018) |
| T2.2 | Three.js scene — persistent mount outside `<main>` | ✅ | context kept + loop stopped across a route change, asserted |
| T2.3 | Geometry — torus ring + 6 extruded bevelled blades | ✅ | 13,064 / 40,000 triangles asserted |
| T2.4 | GLSL material — object-space simplex grain + fresnel rim | ⚠️ | grain visible; §2 roughness rewired (I-021), lights made real (D-012) |
| T2.5 | Mouse parallax — the exact tonik curves | ✅ | ring 0.394/0.4, blades 0.592/0.6, **1.50×**, counter-rotation ±0.196 |
| T2.6 | Mobile — scroll-driven `rotationY −0.525 → −1.5` | ⚠️ | 4 blades asserted; anchors to `[data-hero]` in phase 3 (I-020) |
| T2.7 | Perf — DPR clamp, IntersectionObserver suspend, route fade | ⚠️ | all three suspend paths asserted; **budget fails, I-019** |
| T2.8 | Reduced motion — one static frame; no-WebGL → WebP fallback | ✅ | `running: false`, pose 0.4; `hero-aperture.webp` 2400×1600 28KB |
| T2.9 | Mark applied to loader, nav, footer, favicon, OG | ✅ | four assets generated + `manifest.ts` + `metadataBase`; all four routes prerendered |

---

## The T2.1 gate — what was presented

A sign-off sheet published as an artifact, rendered in the project's own tokens and set in the
real General Sans and IBM Plex Mono (both inlined from `app/fonts/`), because a wordmark cannot
be approved in a substitute face. Every glyph on the sheet is **generated from the same ratios
`ApertureMark.tsx` uses** rather than redrawn, so what is approved and what ships cannot drift.

It contains: the mark at display size; an annotated construction drawing of the four ratios;
actual-size renders at 16 / 32 / 48px plus an inverted favicon swatch; the wordmark at 14vw;
the mark in situ in the phase-1 loader, navbar and footer; the three specced alternates sketched
at matching weight; the recovered parallax table showing what approval unlocks; and the three
questions.

### Answered, 2026-08-26

**1. The Open Aperture is approved**, over the three alternates. **2. I-009 — half the ring's
weight**, which is what was already built; the value is now in the spec that had omitted it, so
no code changed. **3. I-014 — the footer service icons stay placeholder until phase 10.**
Recorded as D-010.

### Two corrections that arrived after the gate

Neither was a technical call and both were things the build had *inherited* rather than chosen.
Recorded together as D-011.

**The wordmark is `NO FiLTER`.** Spec §1 set it lowercase, reasoning from tonik's own lowercase
`tonik`. Sayandeep asked for `No FiLTER` *"…something like that"* — a direction, not a form — so
four candidates were set in the real face at display and navbar size and he chose from them.
Both words in caps make the lone lowercase `i` unmistakably deliberate rather than a typo, and
the `i` drops a dot into a run of caps: a small void inside the letterform that rhymes with the
aperture's empty centre. `text-transform` is `none`, not `uppercase` — the reflex would have
eaten the whole device.

**Service 04 is Creative Development.** It was *No-Code Development*, transcribed from tonik with
everything else. tonik build in Webflow; this site is Next.js with hand-written GSAP, a custom
GLSL material and a Matter.js floor, so the old line was a claim the codebase contradicts. The
rename also fixes a content gap: `40-content-model.md` §3 recorded slot 04 as having **zero**
supporting works, and the replacement's strongest evidence is the site it is written on.

### What the casing change cost, and how it was found

**A casing change is a metrics change.** Every box the wordmark sits in had been fitted to the
lowercase form, so the two specced values were left untouched and measured instead —
`getBoundingClientRect` on every `.wordmark` at 1512 and 390.

The footer was fine. `14vw` and `-0.02em` both hold: it fills **82.5%** of its column at 1512 and
**71.6%** at 390, up from ~59% and ~51%, and overflows at neither — which halves the gap I-013
complains about at no cost.

**The navbar was not fine: the wordmark was overrunning its box by 8%** — 4.59rem of text in the
4.25rem box §4 measures off tonik, with `flex: none` reserving that width in the nav row. The box
is the measured value and the face size is the fitted one, so the face size took the correction:
`1rem → 0.925rem`, which is `4.25 / 4.59`. Re-measured at **99.9%** of the box at both
breakpoints. Logged and closed as I-018.

This is the argument for measuring instead of looking. The overrun is 5.6px at 1512 and invisible
in a screenshot; it would have surfaced as a mysterious layout shift somewhere in phase 3.

### Original questions as put

### Questions put to Sayandeep

1. **Approve the Open Aperture**, or pick one of the three alternates from
   `50-brand-and-3d.md` §1 (broken mesh, NF ligature, un-screened dot). Rejection costs two
   files today and a great deal more after phase 3.
2. **I-009 — the tick stroke weight.** Half the ring's weight (built, recommended: the only
   weight where six separate blades stay countable at 16px), two-thirds, or full.
3. **I-014, optional** — redraw the five footer service icons now, or leave them for phase 10.

Question 1 is the user's by CLAUDE.md's ground rules — brand is a non-technical decision.
Questions 2 and 3 are offered with a recommendation attached so a delegated answer is cheap.

---

## T2.9 — the mark everywhere

Taken first rather than last. Favicon and OG were the only two surfaces the mark was not on, they
are the cheapest possible confirmation that the approved glyph is the shipping glyph, and they
need no Three.js — so doing them before the 3D means the brand is fully applied even if the hero
slips a session.

**One script, `npm run brand:assets`, writes all four.** It derives the geometry from the same
four ratios as `ApertureMark.tsx` rather than embedding a second copy of the path data, so the
favicon and the on-page glyph cannot drift. The generated `icon.svg` carries a header saying so.

| Output | Size | Why |
|---|---|---|
| `app/icon.svg` | 64×64 | scalable, covers §4's 32 case |
| `app/apple-icon.png` | 180×180 | §4 |
| `public/icon-512.png` | 512×512 | §4 |
| `app/opengraph-image.png` | 1200×630 | §4 — glyph + wordmark on `--black` |

**Why a script and not `next/og`.** `ImageResponse` cannot load a woff2, and General Sans ships
from Fontshare as a variable woff2 only. An OG card set in a fallback face would misrepresent the
wordmark, which is the single thing that card exists to show. Playwright is already a
devDependency for the harness, renders the real face, and the output is static with zero runtime
cost. The trade — assets generated at author time and committed — is right for something that
changes as often as the brand does.

**Three decisions inside it, all small.**

The tiles are the mark on a filled `--black` ground, not on transparency. A white-stroked mark on
transparency vanishes against a light browser tab and a black-stroked one vanishes against a dark
tab; the tile is what makes it survive both. The mark takes 48 of the 64-unit tile — a 12.5% safe
area that keeps it clear of the rounding some platforms apply.

`app/manifest.ts` was added so the 512 asset has a consumer. §4 asks for 512 and Next has no
convention that serves it; an unreferenced file would have been dead weight rather than the thing
it was specced to be.

`metadataBase` was added because without it Next emits relative OG paths and warns — a card that
scrapes to nothing. The domain is still open item 5, so `SITE.url` reads `NEXT_PUBLIC_SITE_URL`
and falls back to `https://nofilter.example`: obviously provisional rather than plausibly real.

Verified by the build, which prerenders all four as routes: `/icon.svg`, `/apple-icon.png`,
`/opengraph-image.png`, `/manifest.webmanifest`. Both raster outputs were opened and looked at.

---

---

## T2.2–T2.8 — the 3D hero

The only phase on this build with no reference to transcribe. §2's scene graph and its GLSL are
authored design intent, not measurements — tonik's object is a Spline binary the brief
deliberately does not copy — and that has to change how the section is read. **Four of its
statements do not survive literal transcription**, and every one of them was found by rendering
the thing and looking at it against `docs/research/screens/tonik-hero-01.png`. All four are in
D-012 with an issue each.

### Structure

| File | What it is |
|---|---|
| `components/hero/Hero3D.tsx` | The mount, the gating, the lifecycle. **No `three` import.** |
| `components/hero/apertureScene.ts` | The scene. The only place `three` is imported, reached through a dynamic `import()`. |
| `components/hero/aperture.glsl.ts` | The material — Ashima simplex, object-space grain, fresnel rim. |
| `lib/motion/loaderSignal.ts` | The latch §2's load-in hangs off. |
| `scripts/hero-fallback.mjs` | Bakes the no-WebGL still. |

The scene exports a factory rather than a component, and lives outside the React tree, because
that is what lets one WebGL context survive every route change. `Hero3D` never imports it
statically — `verify:budget`'s `FORBIDDEN_IN_INITIAL` check enforces that, and it is no longer
vacuous.

**One loop.** `tick()` is called from `gsap.ticker`. There is no `requestAnimationFrame` and no
`setAnimationLoop` anywhere in the hero; either would be the second loop CLAUDE.md §7 forbids.

**"Starting as the loader clears"** needed a real signal, not a guessed delay — the loader's enter
timeline is 0.6s normally and 0.2s under reduced motion, so any hard-coded number is wrong in one
of the two modes. `loaderSignal.ts` is a **latched** signal: a consumer that subscribes after the
loader has already finished fires immediately rather than waiting for an event that has been and
gone. Phase 3's hero copy has the same dependency and can use it.

### What the renders found

**The first render was wrong in three ways at once, and none of them were visible in the source.**

1. **The blades stood upright through a tipped ring.** §2 hangs `rotation.x = -0.55, rotation.z =
   0.30` off the *Ring* line, so applied literally it tilts the torus and leaves the six blades in
   the untilted plane. They are one mechanism. The tilt now sits on an inner node of both, below
   each parallax group, so parallax still acts on the world axes the IX2 curves were measured in.
2. **The object rendered near-black.** The lambert term was normalised by `ambient + key + rim`,
   which no surface can ever receive because the two lights sit on opposite sides — the achievable
   maximum was about 0.59. It divides by `ambient + key` now.
3. **It overflowed the viewport on all four sides.** §2's camera at `z 6.5` puts a 4-unit ring at
   98% of the viewport height *before* perspective, and the tilt magnifies its near edge another
   19%. §2's own composition target says the right ~55%, cropped by the right edge, and their
   capture shows 51% fully contained. `CAMERA_Z = 7.5` measures 53%. **I-022.**

**Then the material had no grain** — §2's snippet computes a `roughness` and never reads it, so
the grain reached the pixel through one ±9% albedo term. Its prose says the surface "catches the
rim light", so the roughness now drives the fresnel. **I-021.**

**And mobile was unusable.** A distance chosen for a 1.68 aspect leaves the ring at 183% of the
width at 390 — a bare arc with one blade on it. The camera distance is fitted to the viewport now:
never closer than 7.5, pulled back as far as it takes to stay within 105% of the width. One rule,
correct at every width, resolving to exactly 7.5 on any desktop aspect.

### What the harness found that the renders could not

Thirteen behaviour assertions, in `tools/verify/behaviour.hero.ts` — its own file because it is
the largest check on the harness and needs three browser contexts where every other check needs
one.

**It found a real bug within minutes of existing.** The pointer sweep read **0.319 rad instead of
0.4**. The curves were right; the convergence was not. §2 states its idle spin and its parallax
damp as *durations* — "~7.5s per revolution", "Smoothing: 500ms" — and implements both as
*per-frame* increments, which are only those durations at 60fps. Headless Chromium runs the ticker
near 20fps. Both are applied per second of elapsed time now, evaluating to exactly the specced
constants at 60fps. **I-023.** No screenshot would ever have shown this, and the site would have
smoothed at half speed on any 30fps machine.

It also caught **`running: true` being reported on every non-home route** — the build effect
claimed the loop was attached before the loop effect had decided, and the loop effect then found
its state already "correct" and never corrected the lie.

Two false starts in the check itself are worth recording, because both looked like product bugs:
the off-screen suspend appeared broken twice. First a spacer injected into `<main>` was reconciled
away by React. Then growing `<html>` survived React but not Lenis, which caches its scroll limit
from the content element and **silently clamped `scrollTo(2700)` to about a hundred pixels** — the
page never moved. The check now grows `<body>`, calls `lenis.resize()`, and prints scroll position
and hero rect on failure so the next reader is not sent hunting.

### T2.8 — both degraded paths, from one source

The no-WebGL still is rendered **through the reduced-motion path**. §2 asks for "the assembly at
its load-in pose", but the load-in ends with the assembly still turning, so there is no single
frame that is *the* pose — while §2 has already chosen one for a different reason: reduced motion
renders exactly one frame at `rotation.y = 0.4` and stops.

Emulating `prefers-reduced-motion` therefore gives a pose that is deterministic, specced and
reproducible, and it means **the two degraded paths show the identical image** — which is the
right answer anyway. A visitor with no WebGL and a visitor who asked for no motion should not see
two different heroes. `npm run hero:fallback` drives the real page rather than re-implementing the
scene, so the still cannot drift from what the scene renders, and it **throws** if the loop is
running under reduced motion rather than quietly baking an arbitrary frame.

2400×1600, 28KB. The first bake came back with the navbar and the wordmark painted over it —
Playwright's element screenshot clips the *page* to the element's box rather than isolating the
element, and the hero is `inset: 0`.

### The budget — I-019, and why the phase is not green

`/` measures **302.8KB against a specced 190KB**. It cannot be met.

§5 itemises the 190 as "GSAP ~55, Three ~150 raw/~48 gz, Lenis ~4, app ~40" — 147, and it **omits
React and Next entirely**, which measure ~92KB here. Three measures **141.3KB transferred**, not
48: `WebGLRenderer` pulls the whole shader library and tree-shaking barely touches it.

Everything available without deleting something the site uses was done. Three is dynamically
imported. Flip and Observer were removed from `lib/motion/gsap.ts` — Flip has one consumer on the
entire site (the showreel, phase 3) and Observer has none in any component spec; they were in the
stack table only because they are in tonik's. That saved 8.6KB.

**Deferring Three's import to idle was considered and rejected.** It would move the download
outside the measurement window and turn the check green without saving the visitor a byte. That is
gaming the instrument, not meeting the budget.

The number is specced, so it has not been edited to fit. The check stays red and reports the true
figure, and **I-019 is Sayandeep's to decide.**

---

## Deviations from the phase brief

**T2.9 was taken first rather than last.** Favicon and OG needed no Three.js and are the cheapest
confirmation that the approved glyph is the shipping glyph, so doing them before the 3D meant the
brand was fully applied even if the hero slipped a session.

**Five §2 values were not transcribed literally**, each rendered, compared against the reference
and logged: the camera distance (I-022), the roughness that reaches nothing (I-021), the per-frame
motion constants (I-023), the tilt's placement and the lighting normalisation (both D-012). None
was changed silently and none of §2's other numbers were touched.

**`lib/motion/gsap.ts` lost two plugins** it had registered since phase 0. Out of scope for phase
2 in the strict sense, and the right thing to do while making a budget argument — that argument is
only honest once everything unused is gone.
