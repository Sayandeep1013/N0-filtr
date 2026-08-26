# Phase 5 — Homepage: services, CTA, culture, blog row

**Branch:** `phase/05-home-lower` · **Started:** 2026-08-26 · **Completed:** 2026-08-26
**Sessions:** 1 (part of the phases 3–12 run) · **Model:** Opus · **Tag:** `phase-05-complete`

> Permanent record. Not overwritten.

---

## Plan

Everything below the works grid, which completes the homepage: the five-row services accordion, the
CTA block, the culture collage and the blog row. Plus the content layers two of them needed —
`lib/content/services.ts` and `lib/content/posts.ts`.

## Tasks

| id | task | status | evidence |
|---|---|---|---|
| T5.1 | Services accordion — 5 rows, one open, arrow rotate, `#2e2e2e` row | ✅ | behaviour: row ground `rgb(46,46,46)`, arrow `rotate(-90deg)`, one open at a time |
| T5.2 | Open/close — `.7 + .5` open, `.6` close sequence | ✅ | open **1.2s @ [0, 0.7, 0.7]**, close **1.1s @ [0, 0.5, 0.5, 0.6]** — read off the live timelines |
| T5.3 | Accordion body — columns + inverted right panel | ✅ | 7fr/5fr per §6's own instruction for the missing testimonial column |
| T5.4 | Accordion ≤767 — height only, no x-slide | ✅ | behaviour at 390: no translate on the panel, one column, body still opens |
| T5.5 | `<CtaBlock>` — `#2e2e2e`, 6rem heading, 6rem circle | ✅ | behaviour: tag is `BUTTON`, **0 nested controls**, opens the contact panel |
| T5.6 | `<CultureCollage>` — parallax −20%, wipe `width→0%` | ⚠️ done-with-caveat | both motions asserted; **no photographs** — I-042 |
| T5.7 | Blog card row — 3 cards, hairline, category label | ✅ | behaviour: one shared top edge and one shared bottom across all three |

## What changed after review

Sayandeep reviewed mid-phase, as in phase 4. Five things came out of it.

| What he said | What changed |
|---|---|
| a `ChunkLoadError` from the showreel prefetch | a rejected dynamic import was cached forever by `??=`. **I-041** |
| a hydration mismatch on the `<video>` | Video Speed Controller injects into it pre-hydration. `suppressHydrationWarning` does **not** cover injected children — the panel renders after mount instead |
| "when I hover one card the rest also gets dimmed — fix that" | §5's signature interaction, removed. It was legible when the hovered card turned white; D-024 made it dark, so hovering dimmed everything and lit nothing. **D-027** |
| "animate the logo and loader for the initial page" | the mark draws itself — ring by dash-offset, then the six ticks. The animation was already in the glyph. **D-028** |
| "it should get clipped up to the top and open, and clip back down from where you left" | opening a row scrolls to it, closing returns you. Not in §6. **D-029** |

## Decisions made

- **D-027** — the works grid's sibling-dim is off; the assertion inverted rather than deleted.
- **D-028** — the loader draws the aperture before it sweeps, on a **separate timeline**.
- **D-029** — opening a row scrolls to it; closing restores the previous position.

## Issues found

- **I-042** — 🟠 the culture collage has no photographs. Phase 10, T10.4.
- **I-043** — four harness checks were relying on the loader being 600ms. **Resolved.**
- **I-034** — the JS budget. **Closed**: raised 320 → 360 by Sayandeep, on the measurement.

## The finding this phase turned on

**D-028 changed one number — the loader is 1.3s instead of 0.6s — and four harness checks failed at
once. All four were already wrong.**

The best of them: `readMotionState` used `page.waitForFunction`, which **polls on
requestAnimationFrame by default** and so installs a self-rescheduling rAF loop *in the page*.
`motion.ts` counts persistent rAF loops to enforce CLAUDE.md's "one animation loop" rule — the
helper was failing the check twenty lines below it, and had been capable of doing so since phase 0.

It never had, for two reasons that both stopped holding here: the non-reduced block reads the rAF
probe *before* calling it, and `__MOTION__` used to appear fast enough that the poller resolved on
its first tick, under the five-tick threshold that separates a driver from an incidental
reschedule. A 700ms delay pushed it over.

The failure names an anonymous frame inside `eval at evaluate`. That is the shape of every bug in
this class, and it is the third time this build has learned the same lesson — phase 2's three
`networkidle` races, phase 3's `SCRUB_SETTLE_MS`, phase 4's 600ms visual settle.

> **When a check fails around a timing change, suspect the check.**

## Assertions added to the harness

**41 new**, and the first run in this build's history with **nothing pending**: motion 199/201 →
**241/241**. Tokens 138/138.

| what | why it cannot be a `motion.config` assertion |
|---|---|
| `accordion.open` 1.2s @ [0, 0.7, 0.7] | built on the transition — a closed row has no open timeline to read |
| `accordion.close` 1.1s @ [0, 0.5, 0.5, 0.6] | same, and it is a different sequence rather than a reverse |
| open row `#2e2e2e`, arrow `rotate(-90deg)`, `aria-expanded` | state, not shape |
| opening one row closes the other | a fact about five elements |
| ≤767: **no x-slide at all**, one column, body still opens | §6 gives mobile its own timeline |
| CTA is a `BUTTON` with **0 nested controls**, and opens the panel | §10's "the whole block" is a claim about the element |
| culture: 6 frames start covered, and the wipe uncovers on scroll | |
| blog row: three cards share one top edge and one bottom edge | §19's `space-between` is what makes a row a row |
| `loader.mark` — 4 children, the ring's draw, the staggered ticks | |

**Two `pending` entries retired.** `accordion.open` and `accordion.close` had sat in
`motion.config.ts` since phase 0 waiting for a component that was never going to satisfy that
file's shape.

## Harness repairs

1. `waitForLoaderGone(page)` — used by every check that interacts, and by the visual harness.
   Polls with `page.evaluate` from the **Node** side rather than `waitForFunction`, precisely so it
   injects nothing that outlives the call.
2. `readMotionState` polls the same way, for the reason above.
3. The ScrollTrigger baseline waits for the loader and requires **four** equal reads, not three —
   phase 5 put a scrubbed reveal, six culture frames and twelve card reveals on this route and they
   arrive in waves.
4. `Shot.ourSection` — a shot's scroll can now be resolved from a **selector** at capture time.
   Fixed offsets on our side go stale every phase; the `culture` shot was aimed at 10,200 and landed
   on the blog row.

## Verification at completion

```
Run: 2026-08-26 · Phase 05 · branch phase/05-home-lower

tokens  ✅ 138/138
motion  ✅ 241/241     ← nothing pending, for the first time
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 6/6

JS on /  322.0KB / 360KB   ·  total 467KB / 1800KB
document 12,676px against tonik's 12,884
```

**The JS ceiling was raised 320 → 360 by Sayandeep**, on the measurement rather than by edit — the
standard D-013 set. Breakdown: React and Next ~103KB, three ~141KB, GSAP and ScrollTrigger ~50KB,
all of our own components ~28KB. Plyr, Flip, split-type and Matter all still load on demand.
