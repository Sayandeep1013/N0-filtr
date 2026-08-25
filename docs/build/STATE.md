# Build state

**The first file every agent reads. It must always be true.**
If you change the build, change this file in the same session — not later.

Last updated: **2026-08-25** · by: **phase 1 session (Opus)** · commit: `83ff9ae`

---

## Where we are

> **Phase 1 is complete.** All four global components — Loader, Navbar, ContactPanel, Footer —
> are built, mounted in the root layout and verified. The harness gained a behaviour layer that
> drives the real interface. **Phase 2 (brand & 3D hero) is next and unclaimed — it is a GATE.**
>
> ⚠ **One open decision blocks nothing but should be settled in phase 2: I-017.** The spec
> translates Webflow's `inOutQuad` to GSAP's `power2.inOut`, which is cubic, not quadratic.
> Every `[ix2] inOutQuad` timeline is one power too strong. Three-line fix; gets more expensive
> every phase.

| | |
|---|---|
| Current phase | **2 — Brand & 3D hero** 🚦 *(unclaimed, GATE)* |
| Status | ⬜ not started |
| Branch | *(create `phase/02-brand-3d`)* |
| Blocked | no |
| Verify report | `tools/verify/output/report.md` — tokens 136/136, motion 129/132 (3 pending), budget 4/4, visual judged |

---

## Phase ledger

| # | Phase | Status | Branch | Tag | Notes |
|---|---|---|---|---|---|
| 0 | Foundation & harness | ✅ | `phase/00-foundation` | `phase-00-complete` | harness proven by break-test |
| 1 | Global chrome | ✅ | `phase/01-chrome` | `phase-01-complete` | + a behaviour layer in the harness |
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

**Progress: 2 / 13 phases.**

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

### Phase 2 — Brand & 3D hero 🚦 ⬜ not started

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
| Motion durations & eases | ⚠️ | `verify:motion` — tables and CSS mirrors verified. **But see I-017: `EASE.quad` is cubic where the source is quadratic.** The table is self-consistent; its translation from IX2 is not. |
| Timeline shapes | ✅ | 4 registered and asserted — `loader.enter`, `loader.exit`, `contact.open`, `button.icon` — including every resolved position parameter |
| matchMedia gating at ≤991 | ✅ | `verify:motion` asserted inactive @991 / active @1512, **and** the footer sibling-dim asserted inactive at 991 through a real hover |
| Reverse discipline (1.2 / 1.5) | ✅ | behaviour checks, through the real close and mouseleave paths |
| ScrollTrigger leak-free across routes | ✅ | baseline is now **1**, not 0 — the check finally has something to leak |
| Bundle budgets | ⚠️ | JS **170.0KB / 190KB**, total 234.6KB, CLS 0.0018. The three/matter/plyr absence checks are still **vacuous**: not installed. |
| Reduced motion | ✅ | emulated `reduce`: Lenis destroyed, no extra loop, **and the loader asserted as a 200ms fade with no transform** |
| Visual composition vs tonik | ⚠️ | footer and contact panel compared against `s11`/`s12` and judged. Hero and everything above the footer owed by phase 3. |
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
