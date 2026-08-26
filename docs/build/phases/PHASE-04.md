# Phase 4 — Works grid

**Branch:** `phase/04-works-grid` · **Started:** 2026-08-26 · **Completed:** 2026-08-26
**Sessions:** 1 (part of the phases 3–12 run) · **Model:** Opus · **Tag:** `phase-04-complete`

> Permanent record. Not overwritten.

---

## Plan

The most intricate component on the site: twelve typed work modules, the reusable `SpecTable`, the
`WorkCard` with three interacting hover layers, the twelve-column grid, and the responsive change
that inverts the whole component below 768.

One thing the brief did not anticipate: **four of the nine tasks were re-done mid-phase** after
Sayandeep reviewed the running build. Those revisions are the most valuable part of the record —
see *What changed after review*.

## Tasks

| id | task | status | evidence |
|---|---|---|---|
| T4.1 | 12 typed `Work` modules | ✅ | `content/works/*.ts`; `WORKS.length === 12` asserted |
| T4.2 | `<SpecTable>` | ✅ | `1fr 1fr` on the tight gap, measured off theirs (I-037) |
| T4.3 | `<WorkCard>` — three widths | ✅ | mix asserted: half ×8, wide ×3, full ×1 |
| T4.4 | Reveal on scroll, one-shot | ✅ | `work-card.reveal` 1.05s / 3 tweens at 0, 0.55, 0.55; `data-revealed` asserted |
| T4.5 | Hover layer 1 — siblings dim to .3 | ✅ | behaviour: **all eleven others at exactly 0.3**, hovered card at 1, all back to 1 on leave |
| T4.6 | Hover layer 2 — overlay .55, 500 in / 400 out | ✅ | both durations read off the live tweens |
| T4.7 | Hover layer 3 — sheet + reel swap | ✅ | sheet wipe 0.5 in / 0.4 out, opens to 1, returns to 0 |
| T4.8 | Differential parallax −8 / −10 | ✅ | per cell, not per column (I-036); ratio matches theirs |
| T4.9 | Mobile ≤767 — sheet becomes content | ✅ | behaviour: `position: static`, opacity 1, one column, no transforms, no reels |

## What changed after review

Sayandeep reviewed the running build twice mid-phase. Six changes came out of it, and five are
deviations from `20-components-and-motion.md` §5 — all logged, none silent.

| What he said | What changed |
|---|---|
| "hovering them turns them white — immediately you get so much exposure" | §5 reveals the sheet with `gsap.set()`, no tween. Now a drawer sized by its content (63% of a half card, 33% of the full one) that wipes in over 500ms and out over 400ms. **D-022** |
| "I don't like the info coming from the bottom — do it right to left" | `clip-path` inset wipe rather than a transform, because a panel translated from the right starts a card-width outside its own box and would be drawn over the next column. The rows follow on a `.04` stagger. **D-022** |
| "the total white — change that to a milder dim colour" | The panel is the page ground with 14% of the **work's own accent** mixed in. No bright surface anywhere, and each panel is visibly that card's. **D-024** |
| "the project name and description are getting covered — just cover the image" | A positioning bug: the sheet's `bottom: 0` resolved against the whole card. `.frame` fixes it. §5's caption rise removed too — it hid the name at the moment you were reading it. **D-025** |
| "the big card Tessera is so big, doesn't look good" | `full` cards go to 21:9 — 1316 × 564 rather than 822. A full card should be the widest thing on the page, not the tallest. **D-026** |
| A `ChunkLoadError` from the showreel's prefetch | A rejected dynamic import was cached forever by `??=`, and nothing caught it. **I-041** |

## Decisions made

- **D-022** — the hover sheet is a drawer that wipes, not a curtain that appears.
- **D-024** — it is dark and tinted with the work's accent; asserted as a luminance property.
- **D-025** — the caption is never covered and never moves; the hover timeline is therefore gone.
- **D-026** — the full-width card is a 21:9 band.

## Issues found

- **I-035** — no posters; cards draw a deterministic accent cover. Phase 10.
- **I-036** — §5's "two independent columns" is not their structure. **Resolved.**
- **I-037** — §8's `4fr 8fr` spec table is `1fr 1fr` on theirs. Phases 6 and 7 measure the rest.
- **I-038** — the load-more button has no cursor parallax. Phase 10.
- **I-039** — twelve sibling-dim timelines fight. **Resolved** via §21.1's shared primitive.
- **I-040** — 🟠 `support@nofilter.com` vs `nofilter.studio`. **Sayandeep, before launch.**
- **I-041** — a failed dynamic import was permanent. **Resolved.**

## The finding this phase turned on

**§5 describes a structure tonik do not have.** "Two independent columns, each an ordinary block
flow" — their DOM is one twelve-column CSS grid with explicit `grid-column` and `grid-row` on every
cell: `8/13`, `7/13`, `1/7`, `1/6`, `1/9`, `9/13`. Two block columns cannot produce that; an
eight-column card at `1/9` crosses the middle of the grid, and their DOM order is right-card-first
in two rows.

§5's *motion* half is right, and the measurement proves it: at one scroll position their row-1 pair
both sat at `translateY(-41.29)` while their row-3 pair sat at `-18.42` and `-23.03` — a ratio of
0.80, exactly −8% against −10%. The rate belongs to the **cell**, carried by an `is-N` class.

The lesson is the phase-3 lesson pointed the other way. Phase 3: a capture shows where an element
is, never the rule that put it there. Phase 4: **a spec can be right about the rule and wrong about
the structure**, and only reading the live DOM separates the two.

## Assertions added to the harness

**35 new** in `tools/verify/behaviour.works.ts`, then 6 removed with `work-card.hover`.
Net: motion 165/168 → 199/201. Tokens 137 → 138.

| what | why it cannot be a timeline assertion |
|---|---|
| all **eleven** other cards at exactly 0.3, hovered card at 1, all back to 1 | a fact about eleven elements |
| overlay 0.55, in 0.5s, **out 0.4s** | §21.2's asymmetry runs opposite to the site's; 500/1.2 = 417 would look right |
| sheet wipes in 0.5s / out 0.4s, opens to 1, returns to 0 | §5 uses `gsap.set()`; "there is a transition" is now a requirement (D-022) |
| sheet luminance ≤ 0.10, still lighter than the page | twelve panels, twelve colours — the property, not a hex |
| sheet ≤ 80% of the media's height | a drawer, not a curtain |
| twelve equal tracks on a 20.5625px gap; mix half ×8 / wide ×3 / full ×1 | |
| reveal wipes to 0% and sets its one-shot guard | |
| ≤767: sheet `static` + opacity 1, one column, no transforms, no reels | §5's "most likely to be got wrong" |

## Harness repairs

1. **`ReferenceError: __name is not defined`**, thrown from inside `page.evaluate` at a line of
   ordinary code. `tsx` compiles with esbuild's `keepNames` behaviour, so a function assigned to a
   variable becomes `__name((ms) => ..., "wait")` — and those callbacks are serialised into the
   *browser*, where `__name` does not exist. Nothing in the message suggests a build tool. Shimmed
   once in `newPage`'s init script rather than banning named helpers in every check.
2. **The visual harness settled 600ms after a scroll.** Cards reveal over 1.05s, so every card was
   photographed mid-reveal — half-faded badges, captions at a third opacity. That reads as a
   styling bug in a contact sheet and is not one. Now 1800ms.
3. **A luminance helper that assumed one colour scale.** `color-mix()` computes to
   `color(srgb 0.194 …)` in 0..1; an ordinary declaration computes to `rgb(33, 33, 33)` in 0..255.
   Reading the first as the second reports near-zero, which would have passed "must be dark" for
   entirely the wrong reason.

## Verification at completion

```
Run: 2026-08-26 · Phase 04 · branch phase/04-works-grid

tokens  ✅ 138/138
motion  ⚠️ 199/201  (2 pending, owed by phase 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 6/6

JS on /  317.2KB / 320KB   ·  total 455.7KB / 1800KB  ·  CLS 0.0025  ·  LCP 128ms
```

⚠️ **2.8KB of JS budget left.** See I-034 — phase 5 has almost nothing to spend and phase 7 wants
Embla. The ceiling needs measuring and putting to Sayandeep, not editing.
