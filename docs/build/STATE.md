# Build state

**The first file every agent reads. It must always be true.**
If you change the build, change this file in the same session — not later.

Last updated: **2026-08-25** · by: **phase 0 session (Opus)** · commit: `033b3aa`

---

## Where we are

> **Phase 0 is complete.** The scaffold, the token system and all four verification
> checks exist and are green. The harness has been proven by deliberately breaking it.
> **Phase 1 (global chrome) is next and unclaimed.**

| | |
|---|---|
| Current phase | **1 — Global chrome** *(unclaimed)* |
| Status | ⬜ not started |
| Branch | *(create `phase/01-chrome`)* |
| Blocked | no |
| Verify report | `tools/verify/output/report.md` — tokens 132/132, motion 35/40 (5 pending), budget 4/4, visual judged |

---

## Phase ledger

| # | Phase | Status | Branch | Tag | Notes |
|---|---|---|---|---|---|
| 0 | Foundation & harness | ✅ | `phase/00-foundation` | `phase-00-complete` | harness proven by break-test |
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

**Progress: 1 / 13 phases.**

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

### Phase 1 — Global chrome ⬜ not started

Copy the task table from `01-PHASES.md` when you claim it.

| id | task | status | evidence |
|---|---|---|---|
| T1.1 | Loader — IX2 enter timeline | ⬜ | |
| T1.2 | Loader exit + link interception | ⬜ | |
| T1.3 | Navbar — layout, `WORKS¹²`, active pill, CTA pill | ⬜ | |
| T1.4 | Navbar `is-mini` | ⬜ | |
| T1.5 | Navbar mobile | ⬜ | |
| T1.6 | Footer | ⬜ | |
| T1.7 | Contact panel | ⬜ | |
| T1.8 | Contact form | ⬜ | |
| T1.9 | CSS hover states from §22 | ⬜ | |

---

## What is verified

Nothing yet. This table is the honest record of what has actually been *proven*, as distinct
from what has been written.

| Area | Verified? | By what |
|---|---|---|
| Fluid root at 1440 / 1512 / 1920 | ✅ | `verify:tokens` — also 1280, 1441, 2560 |
| Colour tokens | ✅ | `verify:tokens` — all 26, incl. alpha round-trip |
| Type scale | ✅ | `verify:tokens` — 13 steps at 1512, 7 at 390 |
| Display weight never > 400 | ✅ | `verify:tokens` every-match on `[data-t^=h], [data-t^=p]` |
| Motion durations & eases | ⚠️ | `verify:motion` — the DUR/EASE **tables** are verified, incl. the CSS mirrors. No timeline exists yet; 5 are pending. |
| matchMedia gating at ≤991 | ✅ | `verify:motion` — asserted inactive @991, active @1512 |
| ScrollTrigger leak-free across routes | ⚠️ | `verify:motion` — check is live and passing, but baseline is 0 triggers. Meaningful from phase 1. |
| Bundle budgets | ⚠️ | `verify:budget` — JS/total/CLS/fonts real. The three/matter/plyr absence checks are **vacuous**: not installed yet. |
| Reduced motion | ✅ | `verify:motion` — emulated `reduce`: Lenis destroyed, no extra loop |
| Visual composition vs tonik | ❌ | no page to compare yet — owed by phases 1 and 3 |

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
