# Build state

**The first file every agent reads. It must always be true.**
If you change the build, change this file in the same session — not later.

Last updated: **2026-08-26** · by: **phase 2 session (Opus)** · tag: `phase-02-complete`

---

## Where we are

> *Phase 1 was independently re-confirmed before this phase started: `npm run verify` re-run at
> `63f4490`, green, exit 0.*
>
> **Phase 2 is complete, and it went well past its brief.** The Open Aperture is approved and on
> all seven surfaces §4 names. The hero object was **rebuilt from scratch** as one housed
> mechanism after the first build read as "a circle and some lines" and shed its blades under the
> pointer. Phase 3's hero copy was pulled forward so the composition could be judged against real
> text. And the way this build measures tonik changed.
>
> **The method change is the important part.** `tools/extract/tonik.mjs` reads their design system
> off their **live DOM** — container system, type scale, colours, transition vocabulary, section
> rhythm — into `docs/research/03-tonik-extract.md`. It exists because phase 2 spent a session
> correcting the hero by eye against a screenshot, one number at a time, when every value was in
> `getComputedStyle`. **Protocol §2.9 now requires checking the extract before measuring
> anything**, and all 13 Reading Maps point at it. See D-016.
>
> That pass found the rule behind every alignment miss at once: `.container-large` is
> `max-width: 80rem`, centred. Our spec called it the gutter width. **I-030.**
>
> **Eleven decisions from Sayandeep, none open** — the mark, the tick weight, the footer icons,
> the `NO FiLTER` casing, Creative Development, the camera, the grain, the JS budget, the object
> rebuild, the tagline, and the rotation speed.
>
> ⚠️ **Phase 3 has ~16KB of JS budget.** `/` is at 303.7 of 320 and phase 3 adds SplitType, the
> stack wall and the showreel to this route. Read D-013 before spending it.

| | |
|---|---|
| Current phase | **3 — Homepage upper** *(unclaimed)* |
| Status | ⬜ not started |
| Branch | *(create `phase/03-home-upper`)* |
| Blocked | no |
| Verify report | `tools/verify/output/report.md` — tokens 136/136, motion **144/147** (3 pending), visual judged, budget 5/5 |

---

## Phase ledger

| # | Phase | Status | Branch | Tag | Notes |
|---|---|---|---|---|---|
| 0 | Foundation & harness | ✅ | `phase/00-foundation` | `phase-00-complete` | harness proven by break-test |
| 1 | Global chrome | ✅ | `phase/01-chrome` | `phase-01-complete` | + a behaviour layer in the harness |
| 2 | Brand & 3D hero 🚦 | ✅ | `phase/02-brand-3d` | `phase-02-complete` | mark approved · 13 hero assertions · budget re-based |
| 3 | Homepage upper | ⬜ | `phase/03-home-upper` | — | **next** · T3.1/T3.2 already shipped in phase 2 (D-015) |
| 4 | Works grid | ⬜ | `phase/04-works-grid` | — | needs 3 |
| 5 | Homepage lower | ⬜ | `phase/05-home-lower` | — | needs 4 |
| 6 | Case study 🚦 | ⬜ | `phase/06-case-study` | — | **GATE** · needs 4 |
| 7 | Service & industry | ⬜ | `phase/07-service-pages` | — | needs 6 |
| 8 | About | ⬜ | `phase/08-about` | — | needs 5 |
| 9 | Blog | ⬜ | `phase/09-blog` | — | needs 5 · parallel-safe |
| 10 | Content & assets | ⬜ | `phase/10-assets` | — | needs 6 · parallel-safe |
| 11 | Block pit | ⬜ | `phase/11-block-pit` | — | needs 1 · parallel-safe |
| 12 | Polish & launch | ⬜ | `phase/12-polish` | — | needs all |

**Progress: 3 / 13 phases.**

---

## Current phase task board

Copy the task table from `01-PHASES.md` for the active phase and track it here.
Update status **as you complete each task**, not at the end of the session.

### Phase 0 — Foundation & verification harness ✅ complete

Full record: `docs/build/phases/PHASE-00.md`

| id | task | status | evidence |
|---|---|---|---|
| T0.1 | Next.js scaffold | ✅ | `npm run build` passes; 103KB First Load JS |
| T0.2 | Fonts | ✅ | CDP reports pages painted with `General Sans Variable` / `IBM Plex Mono`; zero network font requests |
| T0.3 | Token sheet | ✅ | 26 colour + 13 scale + 5 layout tokens asserted, 132/132 |
| T0.4 | Fluid root + reset + global chrome | ✅ | root = **16.45px @1512**, **16px @1440**, 19px @1920, 23px @2560 |
| T0.5 | Lenis + GSAP + MotionProvider | ✅ | one ticker callback; matchMedia gating asserted at 991 *and* 1512 |
| T0.6 | `verify:tokens` | ✅ | catches a one-hex-digit colour change and a fluid-root change |
| T0.7 | `verify:motion` | ✅ | catches `DUR.slower 0.7 → 0.75` |
| T0.8 | `verify:visual` | ✅ | contact sheet at 1512 + 390; fails the run when no judgement is recorded |
| T0.9 | `verify:budget` | ✅ | JS 159.5KB / 190KB, total 204.5KB / 1800KB, CLS 0 |
| T0.10 | `npm run verify` aggregator | ✅ | one command, one report, non-zero exit |

### Phase 1 — Global chrome ✅ complete

Full record: `docs/build/phases/PHASE-01.md`

| id | task | status | evidence |
|---|---|---|---|
| T1.1 | Loader — IX2 enter timeline | ✅ | `loader.enter` 0.6s, 5 children, both tweens `power2.inOut` at startTime 0 |
| T1.2 | Loader exit + link interception | ✅ | `loader.exit` 0.5s `power3.out`; driven on a real route change in-browser |
| T1.3 | Navbar — layout, `WORKS¹²`, active pill, CTA pill | ✅ | logo 4.25rem×1.25rem, gap 2.5rem, link .4/.5rem — all against tonik's computed styles |
| T1.4 | Navbar `is-mini` | ✅ | behaviour: off at 20px, on at 100px, off again on the way up |
| T1.5 | Navbar mobile | ✅ | `shots/nav-menu-390.png` |
| T1.6 | Footer | ✅ | behaviour: siblings dim to **0.30**, restore to 1, inactive at 991 |
| T1.7 | Contact panel | ✅ | `contact.open` 1.5s / 7 children / every position resolved; opens, traps focus, Escape closes at −1.2, focus restored |
| T1.8 | Contact form | ✅ | `shots/contact-panel-1512.png` — renders with no Tally ID |
| T1.9 | CSS hover states from §22 | ✅ | every `:hover` confirmed inside a `min-width: 992px` query |

### Phase 2 — Brand & 3D hero 🚦 ✅ complete

Full record: `docs/build/phases/PHASE-02.md`.

| id | task | status | evidence |
|---|---|---|---|
| T2.1 | Aperture mark — glyph at 16/32/48px + `NO FiLTER` wordmark | ✅ | **approved by Sayandeep 2026-08-26** (D-010). Casing revised to `NO FiLTER` (D-011); nav box re-fitted and re-measured at 99.9% (I-018) |
| T2.2 | Three.js scene — persistent mount outside `<main>` | ✅ | mounted in the root layout; behaviour: context kept and loop stopped across a route change |
| T2.3 | Geometry — torus ring + 6 extruded bevelled blades | ✅ | 13,064 triangles / 40,000 asserted; blade length falls out of the 2D mark's own construction |
| T2.4 | GLSL material — object-space simplex grain + fresnel rim | ⚠️ done-with-caveat | grain visible in `shots/hero-1512.png`; §2's roughness was wired to the rim it never reached (I-021), lights made real (D-012) |
| T2.5 | Mouse parallax — the exact tonik curves | ✅ | behaviour: ring 0.394/0.4, blades 0.592/0.6, ratio **1.50×**, counter-rotation ±0.196 |
| T2.6 | Mobile — scroll-driven `rotationY −0.525 → −1.5` | ⚠️ done-with-caveat | 4 blades at 390 asserted; scrubs the first viewport until phase 3 marks `[data-hero]` (I-020) |
| T2.7 | Perf — DPR clamp, IntersectionObserver suspend, route fade | ⚠️ done-with-caveat | behaviour: suspends off-screen, resumes, suspends + fades to 0 off `/`. **Bundle budget fails — I-019** |
| T2.8 | Reduced motion — one static frame; no-WebGL → WebP fallback | ✅ | behaviour: `running: false`, pose `rotation.y 0.4`; `public/hero-aperture.webp` 2400×1600, 28KB, baked through that same path |
| T2.9 | Mark applied to loader, nav, footer, favicon, OG | ✅ | `app/icon.svg` · `apple-icon.png` 180 · `public/icon-512.png` · `opengraph-image.png` 1200×630 — all generated by `npm run brand:assets` from the component's own ratios; four asset routes prerendered in the build |

**Answered by Sayandeep, 2026-08-26** — no open questions:
1. **The Open Aperture, approved** over the three alternates. (D-010)
2. **I-009** — ticks at half the ring's weight. Resolved; written into the spec.
3. **I-014** — footer service icons stay placeholder until phase 10.
4. **Wordmark casing** — `NO FiLTER`, over `No FiLTER` / `No Filter` / `NO FILTER`. (D-011)
5. **Service 04** — `creative-development` / Creative Development, replacing No-Code. (D-011)
6. **I-022** — the camera stays at 7.5, not the specced 6.5.
7. **I-021** — the grain is right as built.
8. **I-019** — the JS budget is **320KB**, raised from a 190 that was never a measurement. (D-013)

### Phase 3 — Homepage: hero, stack wall, reveal ⬜ not started

Copy the task table from `01-PHASES.md` when you claim it.

---

## What is verified

The honest record of what has actually been *proven*, as distinct from what has been written.

| Area | Verified? | By what |
|---|---|---|
| Fluid root at 1440 / 1512 / 1920 | ✅ | `verify:tokens` — also 1280, 1441, 2560 |
| Colour tokens | ✅ | `verify:tokens` — all 26, incl. alpha round-trip |
| Type scale | ✅ | `verify:tokens` — 13 steps at 1512, 8 at 390 (h1-sm added in phase 1) |
| Display weight never > 400 | ✅ | `verify:tokens` every-match on `[data-t^=h], [data-t^=p]` |
| Motion durations & eases | ✅ | `verify:motion` — tables and CSS mirrors verified, and the IX2 translation corrected (I-017): `EASE.quad` is `power1.inOut`, which is what Webflow's `inOutQuad` actually is. |
| Timeline shapes | ✅ | 4 registered and asserted — `loader.enter`, `loader.exit`, `contact.open`, `button.icon` — including every resolved position parameter |
| matchMedia gating at ≤991 | ✅ | `verify:motion` asserted inactive @991 / active @1512, **and** the footer sibling-dim asserted inactive at 991 through a real hover |
| Reverse discipline (1.2 / 1.5) | ✅ | behaviour checks, through the real close and mouseleave paths |
| ScrollTrigger leak-free across routes | ✅ | baseline is now **1**, not 0 — the check finally has something to leak |
| Bundle budgets | ✅ | JS **303.7KB / 320KB**, total 369.4KB, CLS 0.0027. The ceiling was re-based on measurements (D-013) after the specced 190 was found to omit React/Next and under-count Three 3×. `three` absent from the initial bundle is asserted and **no longer vacuous**. ~17KB of headroom. |
| Reduced motion | ✅ | emulated `reduce`: Lenis destroyed, no extra loop, **and the loader asserted as a 200ms fade with no transform** |
| Visual composition vs tonik | ⚠️ | footer, contact panel **and now the 3D hero** compared against `s11`/`s12`/`tonik-hero-01` and judged. The hero's composition matched only after correcting the specced camera — I-022. Hero *copy* still owed by phase 3. |
| The hero object cannot shed its blades | ✅ | behaviour: blade reach 1.930 of a 2.0 barrel, **invariant to 6dp** at every pointer position — a rotation about the bore axis cannot change a radius |
| The hero's pointer response stays subtle | ✅ | behaviour: max 0.159 rad across both channels, capped by assertion |
| The hero matches tonik's live layout | ✅ | h1, play control, foot rail, canvas wrapper — every figure read off their DOM and matched |
| tonik's design system is extracted, not guessed | ✅ | `docs/research/03-tonik-extract.md`, regenerable, Firefox + Chromium agree |
| The hero's render loop actually suspends | ✅ | behaviour: off-screen, on-screen again, and off the homepage with the WebGL context kept |
| Triangle budget | ✅ | 13,064 / 40,000 asserted at runtime |
| Reduced motion for the hero | ✅ | one frame at the specced `rotation.y 0.4`, loop never attached; the baked WebP is rendered through that same path |
| Hero composition vs tonik | ✅ | 53% of viewport width against their 51%, judged against `tonik-hero-01.png` at 1512 and 390 |
| Keyboard operation of the contact panel | ✅ | behaviour: focus enters, Escape closes, focus returns to the trigger |

---

## Environment

| | |
|---|---|
| Repo | `D:\Projects\NoFilterPortfolio` |
| Remote | `github.com/Sayandeep1013/N0-filtr` (**private**) |
| Node | v22.19.0 |
| Shell | PowerShell primary; Git Bash available |
| Dev server | `npm run dev` → `:3000` |
| Git identity | inherits global `Sayandeep1013 <saaiyaan1013@gmail.com>` — **never override** |

### Local-only files (gitignored, present on this machine)

`docs/research/source/tonik-animations.js` · `tonik-ix2.json` · `tonik-hero-scene.splinecode` ·
`ix2-hover.txt` — tonik's own assets. See that folder's README to regenerate.

---

## How to update this file

1. **On claiming a phase** — set status `🔨`, branch, date, and commit immediately.
2. **On completing each task** — flip its row, add evidence (a report line, a screenshot path).
3. **On completing a phase** — set `✅`, record the tag, update the progress count, flip the
   relevant rows in *What is verified*, and reset the task board to the next phase.
4. **If you end mid-phase** — leave everything accurate. A half-true STATE is worse than none.
