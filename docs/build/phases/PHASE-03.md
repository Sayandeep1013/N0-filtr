# Phase 3 — Homepage: hero, stack wall, reveal

**Branch:** `phase/03-home-upper` · **Started:** 2026-08-26 · **Completed:** 2026-08-26
**Sessions:** 1 (part of the phases 3–12 run) · **Model:** Opus · **Tag:** `phase-03-complete`

> Permanent record. Not overwritten.

---

## Plan

T3.1 and T3.2 shipped in phase 2 (D-015), so the phase owned four tasks: the scrubbed word reveal,
the stack wall in both of its behaviours, and the showreel's Flip choreography.

Two deliberate additions to the brief:

- **The works section's header.** Phase 3's Reading Map includes `30-page-specs.md` §2's heading
  because it is the site's first `<RevealText>`. A scrubbed reveal cannot be verified on a page
  with no scroll, so the section shell and its heading were built here and the grid left to
  phase 4.
- **A placeholder reel.** See D-020.

## Tasks

| id | task | status | evidence |
|---|---|---|---|
| T3.1 | Hero copy | ✅ | shipped phase 2; `compare:hero` 96/96 |
| T3.2 | Hero bottom rail | ✅ | shipped phase 2; `railRule 858.87` = theirs |
| T3.3 | `<RevealText>` | ✅ | behaviour: 12 words 0.2 → 1 → **0.2 on the way back**; ease `power1.out`; not split at 991 |
| T3.4 | Stack wall ≥768 | ✅ | `shots/stack-wall-1512.png`; `heroHeight` 1360.6 vs their 1360.63 |
| T3.5 | Stack wall ≤767 | ✅ | behaviour: 30s / `none` / `repeat -1` at 390, **absent** at 1512 and under reduce |
| T3.6 | Showreel Flip + Plyr | ⚠️ done-with-caveat | behaviour: 66px → 1234px (18.7×) → **back to 66px, exact**; reel is a placeholder (I-033) |

## Decisions made

- **D-018** — no re-split on resize. §4's note is right for a `lines` split and unnecessary for a
  `words` split, and re-splitting mid-refresh would detach the nodes the live tween targets.
- **D-019** — the stack wall is set as type, not vendor logos, and carries a label the spec does
  not have. The label is content; flagged for Sayandeep.
- **D-020** — the showreel ships a labelled placeholder reel so §15's Flip is actually exercised.

## Issues found

- **I-031** — `--t-h2` at 5rem may not exist on tonik. Owed to phase 5.
- **I-032** — `--grid-gap` was 1.5rem (theirs is 1.25) and `--col` was a twelfth of the wrong box.
  Both fixed, both asserted. **Resolved this phase.**
- **I-033** — the reel is a placeholder. Owed to phase 10 T10.2.
- **I-034** — 7.7KB of JS budget left. Owed to phase 7, and watched from phase 4.

## The finding this phase turned on

Measuring the reveal's box against theirs exposed the grid system the build had been guessing at
since phase 0. tonik have no grid class, so every previous phase read column offsets off captures.
They have a grid *system*: three-track `fr` grids whose tracks are twelfths, on a 1.25rem gap.
`home-projects_title-part` is `4fr 7fr 1fr`, `services_grid` is `1fr 10fr 1fr`, the blog row is
`4fr 4fr 4fr`, the footer is `6fr 4fr 2fr`, the spec-table row is `6fr 6fr` on the tight gap.

Our heading now lands at x 543.51 / w 743.67 against their 543.52 / 743.67 — not by nudging a
margin but by copying the rule. Phases 4, 5 and 7 each build several components on this system and
would each have rediscovered it alone.

Same lesson as D-016 and I-030, one phase later and in a different variable: **a capture shows
where an element is; it never shows the rule that put it there.**

## Assertions added to the harness

**21 new** (motion 144/147 → 165/168; tokens 136 → 137). All in
`tools/verify/behaviour.home.ts`, because none of the three is a timeline shape.

| what | why it cannot be a timeline assertion |
|---|---|
| reveal rests at .2, lights to 1, **returns to .2** | a scrub and a one-shot are identical on the way down |
| reveal not split at 991, text at opacity 1 | an absence |
| showreel: reparent, 18.7× growth, scrim `#21212180` | a Flip is a claim about where a node ended up |
| showreel: **returns to its exact origin box** | a Flip that lands and one that teleports look the same in a still |
| showreel: `display:none`, focus restored to the trigger | |
| showreel open/close totals and resolved positions | registered only once the panel is opened |
| marquee 30s / `none` / `repeat -1` at 390 | |
| marquee **absent** at 1512 and **absent** under `reduce` | an infinite tween whose gate leaks never stops |

Also: `compare:hero` gained `heroHeight` (96/96, exact at all four viewports);
`tools/extract/tonik.mjs` gained a grids pass and a reveals pass; `tokens.config.ts` gained
`--grid-gap-tight` and a corrected `--col`.

## Harness repairs

1. **`stop()` did not wait for the port.** It fired `taskkill` without awaiting it and slept
   700ms. When the production build then threw, something in the dev server's tree outlived the
   kill and held a handle on `.next`; every `next build` afterwards died in "Collecting page data"
   with a `PageNotFoundError` naming a metadata route — a message that says nothing about a lock.
   `stop()` now awaits the kill and polls until the port refuses a connection.
2. **`startServer` would drive a server it did not start.** `next dev` on an occupied port moves
   to 3001 quietly, so the harness was verifying whatever was already on 3000 — your own dev
   server, with your unsaved edits in it — and then failing at teardown. It now refuses, with the
   command to free the port.
3. The hero's off-screen check no longer injects `document.body.style.minHeight`. The stack wall
   gave the page real height, so it scrolls past `[data-hero]`'s own bottom edge instead.

## One check that failed, and was wrong

`reveal: scrolling back un-reveals` failed at `max 0.5891`. The numbers were true and the component
was correct: `scrub: 1` eases the playhead over roughly a second, so a read taken 400ms after a
jump is measuring a transition, not a state. The settle is now 1600ms, named `SCRUB_SETTLE_MS`,
with the reason next to it. Same class of error as the three `networkidle` races the phase-2
handoff records — when a check starts failing around an animation, ask what the animation was
doing when you looked.

## Verification at completion

```
Run: 2026-08-26 · Phase 03 · branch phase/03-home-upper

tokens  ✅ 137/137
motion  ⚠️ 165/168  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 6/6

JS on /  312.3KB / 320KB   ·  total 441.5KB / 1800KB  ·  CLS 0.0010  ·  LCP 152ms
compare:hero  96/96 (firefox)
```
