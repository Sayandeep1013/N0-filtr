# Build state

**The first file every agent reads. It must always be true.**
If you change the build, change this file in the same session — not later.

Last updated: **2026-08-26** · by: **phases 3-12 session (Opus)** · tag: `phase-05-complete`

---

## ⇢ This session's scope — read before anything else

**Sayandeep's instruction, 2026-08-26: build the rest of the site.** Phases **3 → 12**, in one
run, not one phase and a handoff.

That is a change of *scope*, not of method. **Protocol §1 The Loop still applies per phase** —
claim it, plan it, build it, verify it, self-review it, document it, commit it — and then you
**start the next one instead of stopping.** The Loop is what keeps quality; skipping it to go
faster is how this build acquires the debt it has so far avoided.

Order and dependencies are in the ledger below. `3 → 4 → 5 → 6 → 7`, with **8, 9, 10, 11
parallel-safe** once their dependency is met, and **12 last**.

### Ask these five things FIRST, in one message

They are the only user-owned decisions left, they are scattered across the specs, and each one
blocks a different phase. **Batch them up front** — do not stop five separate times over ten
phases. Each has a working placeholder, so nothing is blocked while you wait.

| Needed | For | Placeholder in place |
|---|---|---|
| **Domain** | phase 12, `SITE.url`, OG tags | `nofilter.studio` / `NEXT_PUBLIC_SITE_URL` |
| **Social handles** — Instagram / LinkedIn / X | phase 1 footer, phase 12 | GitHub only; the rest omitted |
| **Tally form ID** | contact form, phases 10 / 12 | styled native `mailto:` fallback |
| **Footer tagline** | footer, phase 12 | `NO FILTER BETWEEN THE IDEA AND THE THING` |
| **Contact form budget bands + referral chips** | I-015, phase 10 | invented — two constants in `ContactForm.tsx` |

`docs/spec/00-brief-and-decisions.md` "Open items" is the source; keep it in sync as they land.

### The one gate you cannot pass alone

**Phase 6 is a 🚦 GATE.** It builds the first case study, and eleven more inherit its pattern —
`01-PHASES.md` requires presenting it before phase 7. Phase 2's gate is already cleared, so this
is the only one left. **Plan for it**: get phase 6 to a presentable state, show it, and use the
wait to run phases 8–11, which do not depend on it.

### Prove each phase, do not eyeball it

Two tools exist because phase 2 learned this the hard way, and they are the difference between
"looks right" and "matches":

```bash
npm run extract:tonik      # their design system from the live DOM  → docs/research/03-tonik-extract.md
npm run compare:hero       # head-to-head vs tonik at four viewports — currently 92/92
```

**Extend both before building each section, not after.** `compare-hero.mjs` takes a `STRUCTURAL`
field list; adding the works grid's fields costs a line and then the tool tells you whether you
got it right. Protocol §2.9 is the rule.

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
> **The method was then tested.** `npm run compare:hero` diffs our hero against theirs at four
> viewports from both DOMs. **92/92 in Firefox and Chromium** — and only 1512 was ever tuned. The
> first run was 91/92 and the miss was real: their canvas is 110vh at ≥1920, 100vh below, which
> is now implemented.
>
> **Twelve decisions from Sayandeep, none open** — the mark, the tick weight, the footer icons,
> the `NO FiLTER` casing, Creative Development, the camera, the grain, the JS budget, the object
> rebuild, the tagline, the rotation speed, and the wordmark at 700 (D-017).
>
> ⚠️ **Phase 3 has ~16KB of JS budget.** `/` is at 303.7 of 320 and phase 3 adds SplitType, the
> stack wall and the showreel to this route. Read D-013 before spending it.

| | |
|---|---|
| Current phase | **6 — Case study 🚦 GATE** |
| Status | ⬜ not started |
| Branch | *(create `phase/06-case-study`)* |
| Blocked | no |
| Verify report | `tools/verify/output/report.md` — tokens 138/138, motion **241/241** (nothing pending), visual judged, budget 6/6 |
| Budget | JS **322.0KB of 360KB**. Ceiling raised from 320 by Sayandeep on the measurement — I-034 closed. |
| 🚦 | **Phase 6 is the gate.** Present the finished case study before phase 7. |

---

## Phase ledger

| # | Phase | Status | Branch | Tag | Notes |
|---|---|---|---|---|---|
| 0 | Foundation & harness | ✅ | `phase/00-foundation` | `phase-00-complete` | harness proven by break-test |
| 1 | Global chrome | ✅ | `phase/01-chrome` | `phase-01-complete` | + a behaviour layer in the harness |
| 2 | Brand & 3D hero 🚦 | ✅ | `phase/02-brand-3d` | `phase-02-complete` | mark approved · 13 hero assertions · budget re-based |
| 3 | Homepage upper | ✅ | `phase/03-home-upper` | `phase-03-complete` | + the grid system (I-032) · 21 new assertions |
| 4 | Works grid | ✅ | `phase/04-works-grid` | `phase-04-complete` | 35 assertions · 6 changes from review · I-036 |
| 5 | Homepage lower | ✅ | `phase/05-home-lower` | `phase-05-complete` | **the homepage is complete** · 41 assertions · motion 241/241 |
| 6 | Case study 🚦 | 🟡 | `phase/06-case-study` | — | **built, awaiting the gate** · T6.1–T6.5, T6.7 · T6.6 removed (D-037) |
| 7 | Works index, services, industries | 🟡 | `phase/07-service-pages` | — | T7.1, T7.3–T7.8 done · T7.2 (Embla nav carousel) still open |
| 7 | Service & industry | ⬜ | `phase/07-service-pages` | — | needs 6 |
| 8 | About | ⬜ | `phase/08-about` | — | needs 5 |
| 9 | Blog | ⬜ | `phase/09-blog` | — | needs 5 · parallel-safe |
| 10 | Content & assets | ⬜ | `phase/10-assets` | — | needs 6 · parallel-safe |
| 11 | Block pit | ⬜ | `phase/11-block-pit` | — | needs 1 · parallel-safe |
| 12 | Polish & launch | ⬜ | `phase/12-polish` | — | needs all |

**Progress: 6 / 13 phases.**

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

### Phase 6 — Case study template 🚦 built, **gate not yet cleared**

Branch `phase/06-case-study`. One work end to end: **Tessera**. Eleven more inherit the pattern.

| id | what | state |
|---|---|---|
| T6.1 | Route + accent theming, `.7s` crossfade from `#212121` | ✅ `app/works/[slug]` · `--accent` / `--accent-ink` / `--accent-ground` on `<html>`, removed on unmount |
| T6.2 | CS hero — mini-nav, title, reel, spec table | ✅ Plyr behind a reel that no work has yet (T10.2); poster is the supported fallback |
| T6.3 | The block set | ✅ **six types, not eight** — see D-035, and D-038 for the imagery |
| T6.4 | Custom cursor, `a-10`–`a-14` | ✅ ±50px drift, 500/400ms, click toggles the label |
| T6.5 | `<NextWork>` — accent crossfades to the next | ✅ recomposed by D-034: copy beside the picture |
| T6.6 | Lightbox — intercepted parallel route | ⛔ **removed** — D-037. A card navigates; the drawer contradicted the URL |
| T6.7 | Loader accent tint on case-study links | ✅ `data-accent` on work links; `darken(accent, 10%)` before the sweep |

**Two design decisions taken with Sayandeep mid-phase, and they changed the block set.**
D-034 puts every product screenshot on a plate; D-035 replaces `visual-full` / `visual-2up` /
`visual-bleed` with one `board` block and grades every product image to grey. Read both before
authoring a case-study body — the `Block` union is smaller than `30-page-specs.md` §2 describes.

**Evidence:** `npm run verify` green — tokens 138/138, motion **266/266**, budget 6/6. The new
assertions are `tools/verify/behaviour.case.ts`, and they found three bugs nothing else would have:
I-048 (the loader's exit sweep had never run, in five phases), I-050 (Lenis kept its scroll across
routes) and, indirectly, I-051 — the double free behind `curTrigger is undefined`. Page is 8,134px
at 1512 against the spec's 7,700–9,300 target, reviewed at 1512 and 390.

**What the gate still needs:** Sayandeep to see the finished page and say so.

---

### Phase 5 — Homepage: services, CTA, culture, blog row ✅ complete

Full record: `docs/build/phases/PHASE-05.md`. **The homepage is complete, top to bottom** —
12,676px against tonik's 12,884.

| id | task | status | evidence |
|---|---|---|---|
| T5.1 | Services accordion | ✅ | row `rgb(46,46,46)`, arrow `rotate(-90deg)`, one open at a time |
| T5.2 | Open/close sequences | ✅ | open **1.2s @ [0, 0.7, 0.7]**, close **1.1s @ [0, 0.5, 0.5, 0.6]** |
| T5.3 | Body + inverted panel | ✅ | 7fr/5fr, per §6's own instruction for the missing column |
| T5.4 | Accordion ≤767 | ✅ | behaviour at 390: no x-slide, one column |
| T5.5 | `<CtaBlock>` | ✅ | tag `BUTTON`, **0 nested controls**, opens the panel |
| T5.6 | `<CultureCollage>` | ⚠️ | both motions asserted; **no photographs** — I-042 |
| T5.7 | Blog card row | ✅ | one shared top edge and bottom edge across all three |

**Five changes from Sayandeep's mid-phase review:** the `ChunkLoadError` (I-041), the `<video>`
hydration mismatch, the sibling-dim removed (D-027), the loader drawing its own mark (D-028), and
the accordion scrolling to its opened row (D-029).

**The JS ceiling moved 320 → 360**, by Sayandeep, on the measurement. I-034 closed.

### Phase 4 — Works grid ✅ complete

Full record: `docs/build/phases/PHASE-04.md`

| id | task | status | evidence |
|---|---|---|---|
| T4.1 | 12 typed `Work` modules | ✅ | `content/works/*.ts` |
| T4.2 | `<SpecTable>` | ✅ | `1fr 1fr` on the tight gap, measured (I-037) |
| T4.3 | `<WorkCard>`, three widths | ✅ | mix asserted: half ×8, wide ×3, full ×1 |
| T4.4 | Reveal on scroll, one-shot | ✅ | `work-card.reveal` 1.05s / 3 tweens; `data-revealed` |
| T4.5 | Siblings dim to .3 | ✅ | behaviour: **all eleven** at exactly 0.3, back to 1 on leave |
| T4.6 | Overlay .55, 500 in / **400 out** | ✅ | both read off the live tweens |
| T4.7 | Sheet + reel swap | ✅ | wipe 0.5 in / 0.4 out; luminance ≤ 0.10 |
| T4.8 | Parallax −8 / −10 | ✅ | per cell, not per column — I-036 |
| T4.9 | Mobile ≤767 | ✅ | sheet `static` + opacity 1, one column, no transforms |

**Six changes from Sayandeep's mid-phase review**, five of them deviations from §5 — the drawer
(D-022), the right-to-left wipe (D-022), the dark accent-tinted panel (D-024), the caption that is
never covered (D-025), the 21:9 full card (D-026), and a `ChunkLoadError` fix (I-041).

**Also answered:** the block pit waits — finish the homepage first (phase 5), then phase 11.

### Phase 3 — Homepage: hero, stack wall, reveal ✅ complete

Full record: `docs/build/phases/PHASE-03.md`

| id | task | status | evidence |
|---|---|---|---|
| T3.1 | Hero copy — `--t-h1` two lines, inline play control | ✅ | shipped in phase 2 (D-015); `compare:hero` 92/92 |
| T3.2 | Hero bottom rail — two mono labels above a hairline | ✅ | shipped in phase 2 (D-015) |
| T3.3 | `<RevealText>` — SplitType words, scrubbed `top 90%`→`top 10%` | ✅ | behaviour: 0.2 → 1 → **0.2 on the way back**; box x 543.51 / w 743.67 = theirs |
| T3.4 | Stack wall ≥768 — static flex-wrap grid, `.7` opacity | ✅ | `shots/stack-wall-1512.png`; `heroHeight` 1360.6 vs their 1360.63 |
| T3.5 | Stack wall ≤767 — GSAP infinite marquee, no library | ✅ | behaviour: 30s / `none` / `repeat -1` at 390, **absent** at 1512 and under reduce |
| T3.6 | Showreel — Flip open/close choreography, Plyr | ⚠️ | behaviour: 66px → 1234px → **back to 66px exact**; reel is a placeholder (I-033) |
| — | Works section header (§2 heading, in phase 3's Reading Map) | ✅ | the site's first `<RevealText>`; grid is phase 4's |

**The five user decisions were answered on 2026-08-26, up front, in one message:**

| Decision | Answer |
|---|---|
| Domain | **`nofilter.studio`** — open item 5 closed |
| Socials | **GitHub real; Instagram / LinkedIn / X as provisional slots**, hrefs swapped later |
| Tally form id | **none — the mailto fallback is the shipped answer**; open item 7 closed |
| Footer tagline | **"No filter between the idea and the thing"** — open item 6 closed |
| Contact budget bands + referral chips | *not asked* — the invented constants stand; see I-015 |

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
