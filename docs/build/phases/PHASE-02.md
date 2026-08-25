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
| T2.2 | Three.js scene — persistent mount outside `<main>` | ⬜ next | — |
| T2.3 | Geometry — torus ring + 6 extruded bevelled blades | ⬜ next | — |
| T2.4 | GLSL material — object-space simplex grain + fresnel rim | ⬜ next | — |
| T2.5 | Mouse parallax — the exact tonik curves | ⬜ next | — |
| T2.6 | Mobile — scroll-driven `rotationY −0.525 → −1.5` | ⬜ next | — |
| T2.7 | Perf — DPR clamp, IntersectionObserver suspend, route fade | ⬜ next | — |
| T2.8 | Reduced motion — one static frame; no-WebGL → WebP fallback | ⬜ next | — |
| T2.9 | Mark applied to loader, nav, footer, favicon, OG | ⬜ next | loader / nav / footer done in phase 1; favicon + OG owed |

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

## Deviations from the phase brief

*(none yet)*

## Self-review

*(pending — protocol §6, at the end of the phase)*

## Handed off to

*(pending)*
