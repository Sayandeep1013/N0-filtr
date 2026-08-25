# Phase 01 — Global chrome

**Branch:** `phase/01-chrome` · **Started:** 2026-08-25 · **Completed:** —
**Sessions:** 1 · **Model:** Opus · **Final commit:** — · **Tag:** `phase-01-complete`

> Permanent record. Not overwritten. One file per phase in `docs/build/phases/`.

---

## Plan

Build the four global components — Loader, Navbar, ContactPanel, Footer — so that every later
phase inherits working chrome and can concentrate on page content. They mount in the root
layout, outside `<main>`, so they survive route changes.

Deviations from the phase brief, decided at step 3:

1. **Two `components/ui/` primitives are built here rather than in phase 3.** `IconCircle` (the
   circle arrow, `20-components-and-motion.md` §9) is required by the nav CTA pill, the footer
   social bars *and* the form submit bar — three consumers inside this phase alone. `Button`
   (the pill, same section) is required by the nav CTA. Building them ad-hoc inside Navbar and
   Footer would guarantee they are rebuilt and diverge in phase 3. **§9 has been added to this
   phase's Reading Map** in `01-PHASES.md`, per protocol §2.

2. **The 2D aperture mark is built here**, from `50-brand-and-3d.md` §1, because the loader and
   the navbar have nothing to render without it. Its geometry is fully specified — a circle of
   stroke 1/12 diameter, six ticks at 60°, each 1/6 of the radius, rotated 8° off-radial — so
   this is transcription, not design. **The concept is still un-approved by the user**; phase 2
   is the gate that approves it. Isolated in `components/brand/` so replacing it is one file.

3. **The harness gains a fourth motion check, `BEHAVIOUR`.** Three of the four things
   `02-VERIFICATION.md` says phase 1 owes — the navbar mini threshold, the footer sibling-dim,
   the loader's reduced-motion path — are DOM behaviours, not registered timelines, and the
   phase-0 checker had no way to express them. See D-008.

## Tasks

| id | task | status | commit | evidence |
|---|---|---|---|---|
| T1.1 | Loader — IX2 enter timeline | ⬜ | | |
| T1.2 | Loader exit + link interception | ⬜ | | |
| T1.3 | Navbar — layout, `WORKS¹²`, active pill, CTA pill | ⬜ | | |
| T1.4 | Navbar `is-mini` | ⬜ | | |
| T1.5 | Navbar mobile | ⬜ | | |
| T1.6 | Footer | ⬜ | | |
| T1.7 | Contact panel | ⬜ | | |
| T1.8 | Contact form | ⬜ | | |
| T1.9 | CSS hover states from §22 | ⬜ | | |

## Decisions made
<filled at completion>

## Issues found
<filled at completion>

## Assertions added to the harness
<filled at completion>

## Verification at completion

```
<paste the summary block from tools/verify/output/report.md>
```

**Visual judgement:** <filled at completion>

## Self-review

Protocol §6, worked through honestly.

- [ ] Values spot-checked against spec (list the five you checked)
- [ ] Reverse timeScales correct
- [ ] All hover/parallax/reveal inside matchMedia
- [ ] One rAF loop
- [ ] Reduced motion tested by toggling
- [ ] No dead code, logs, or unlogged TODOs
- [ ] Every "done" has evidence
- [ ] Every gap written into HANDOFF

**What I found and fixed during self-review:**
<filled at completion>

## Handed off to
Phase 02 · see HANDOFF.md at commit `<sha>`
