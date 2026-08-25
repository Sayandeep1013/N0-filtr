# Phase 00 — Foundation & verification harness

**Branch:** `phase/00-foundation` · **Started:** 2026-08-25 · **Completed:** —
**Sessions:** 1 (ongoing) · **Model:** Opus · **Final commit:** — · **Tag:** —

> Permanent record. Not overwritten.

---

## Plan

Build the scaffold and, more importantly, the harness that measures every phase after this one.
Working T0.1 → T0.10 in order, committing each task.

Deliberate ordering choice: the scaffold tasks (T0.1–T0.5) come first not because they matter
more but because the harness has nothing to measure without them. The brief warns that if
context runs short, ship a *smaller scaffold and a complete harness* rather than the reverse —
so the scaffold stays minimal: a blank page carrying one probe element per token, no components.
Components are Phase 1's job.

Harness design intent:
- `verify:tokens` — Playwright reads `getComputedStyle` on `data-t` probes against a
  machine-readable copy of the token table. The fluid root is the first and most important
  assertion.
- `verify:motion` — a dev-only timeline registry; the checker reads back registered GSAP
  timelines and asserts duration/ease/stagger shape, reverse discipline, matchMedia gating,
  ScrollTrigger hygiene and single-loop. Phase 0 ships the *machinery* plus the assertions that
  can exist without components (single-loop, matchMedia gating, ScrollTrigger baseline).
- `verify:visual` — screenshots ours vs tonik's committed reference screens, contact sheet, and
  a mandatory agent judgement recorded in the report.
- `verify:budget` — build output parsing + page weight; Lighthouse via chrome-devtools MCP,
  recorded manually where the CLI cannot run headless in CI.

Then break it deliberately (protocol requirement) and record that it failed.

## Tasks

| id | task | status | commit | evidence |
|---|---|---|---|---|
| T0.1 | Next.js 15 scaffold | ⬜ | | |
| T0.2 | Fonts | ⬜ | | |
| T0.3 | Token sheet | ⬜ | | |
| T0.4 | Fluid root + reset + global chrome | ⬜ | | |
| T0.5 | Lenis + GSAP + MotionProvider | ⬜ | | |
| T0.6 | `verify:tokens` | ⬜ | | |
| T0.7 | `verify:motion` | ⬜ | | |
| T0.8 | `verify:visual` | ⬜ | | |
| T0.9 | `verify:budget` | ⬜ | | |
| T0.10 | `npm run verify` aggregator | ⬜ | | |

## Decisions made
<pending>

## Issues found
<pending>

## Assertions added to the harness
<pending>

## Verification at completion
<pending>

**Visual judgement:** <pending>

## Self-review
<pending>

## Handed off to
Phase 01 · see HANDOFF.md
