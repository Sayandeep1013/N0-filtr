# Build state

**The first file every agent reads. It must always be true.**
If you change the build, change this file in the same session — not later.

Last updated: **2026-08-25** · by: **spec/system session (Opus)** · commit: `43b2f1f`

---

## Where we are

> **Phase 0 has not started.** The repo contains specs and the build system only —
> no scaffold, no `package.json`, no `src/`. The next agent starts Phase 0 from scratch.

| | |
|---|---|
| Current phase | **0 — Foundation & verification harness** |
| Status | ⬜ not started |
| Branch | *(none yet — create `phase/00-foundation`)* |
| Blocked | no |
| Verify report | *(none yet)* |

---

## Phase ledger

| # | Phase | Status | Branch | Tag | Notes |
|---|---|---|---|---|---|
| 0 | Foundation & harness | ⬜ | `phase/00-foundation` | — | start here |
| 1 | Global chrome | ⬜ | `phase/01-chrome` | — | needs 0 |
| 2 | Brand & 3D hero 🚦 | ⬜ | `phase/02-brand-3d` | — | **GATE** · needs 0 |
| 3 | Homepage upper | ⬜ | `phase/03-home-upper` | — | needs 1, 2 |
| 4 | Works grid | ⬜ | `phase/04-works-grid` | — | needs 3 |
| 5 | Homepage lower | ⬜ | `phase/05-home-lower` | — | needs 4 |
| 6 | Case study 🚦 | ⬜ | `phase/06-case-study` | — | **GATE** · needs 4 |
| 7 | Service & industry | ⬜ | `phase/07-service-pages` | — | needs 6 |
| 8 | About | ⬜ | `phase/08-about` | — | needs 5 |
| 9 | Blog | ⬜ | `phase/09-blog` | — | needs 5 · parallel-safe |
| 10 | Content & assets | ⬜ | `phase/10-assets` | — | needs 6 · parallel-safe |
| 11 | Block pit | ⬜ | `phase/11-block-pit` | — | needs 1 · parallel-safe |
| 12 | Polish & launch | ⬜ | `phase/12-polish` | — | needs all |

**Progress: 0 / 13 phases.**

---

## Current phase task board

Copy the task table from `01-PHASES.md` for the active phase and track it here.
Update status **as you complete each task**, not at the end of the session.

### Phase 0 — Foundation & verification harness

| id | task | status | evidence |
|---|---|---|---|
| T0.1 | Next.js scaffold | ⬜ | |
| T0.2 | Fonts | ⬜ | |
| T0.3 | Token sheet | ⬜ | |
| T0.4 | Fluid root + reset + global chrome | ⬜ | |
| T0.5 | Lenis + GSAP + MotionProvider | ⬜ | |
| T0.6 | `verify:tokens` | ⬜ | |
| T0.7 | `verify:motion` | ⬜ | |
| T0.8 | `verify:visual` | ⬜ | |
| T0.9 | `verify:budget` | ⬜ | |
| T0.10 | `npm run verify` aggregator | ⬜ | |

---

## What is verified

Nothing yet. This table is the honest record of what has actually been *proven*, as distinct
from what has been written.

| Area | Verified? | By what |
|---|---|---|
| Fluid root at 1440 / 1512 / 1920 | ❌ | — |
| Colour tokens | ❌ | — |
| Type scale | ❌ | — |
| Display weight never > 400 | ❌ | — |
| Motion durations & eases | ❌ | — |
| matchMedia gating at ≤991 | ❌ | — |
| ScrollTrigger leak-free across routes | ❌ | — |
| Bundle budgets | ❌ | — |
| Reduced motion | ❌ | — |
| Visual composition vs tonik | ❌ | — |

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
