# No Filter — project context

You are building **nofilter**, a studio site that reproduces the design language and interaction
model of **tonik.com** one-to-one, with our own brand, our own work, and one addition of our own
(a Matter.js block pit below the footer).

This is a **multi-session, multi-agent build.** You are one agent in a sequence. Read this file,
then follow the protocol. Do not start work from this file alone.

---

## ⇢ Start here, every session

```
1. docs/build/STATE.md        ← where the build actually is. Read first, always.
2. docs/build/HANDOFF.md      ← what the previous agent left you. Read second.
3. docs/build/00-PROTOCOL.md  ← how to work. §1 The Loop is mandatory; rest is reference.
4. docs/build/01-PHASES.md    ← your phase brief: tasks, acceptance, and its Reading Map.
5. Only the spec sections that Reading Map names. Nothing more.
6. docs/build/ISSUES.md       ← open problems that may touch your work.
```

**Never read all of `docs/spec/` — it is ~2,500 lines.** Each phase has a Reading Map naming the
exact sections it needs. Reading beyond it wastes the context you need for the work.

---

## What exists

| Path | What it is |
|---|---|
| `docs/spec/` | **8 build specs.** The contract. Extracted from tonik, not invented. |
| `docs/research/` | Teardown, content inventory, 22 screenshots of tonik |
| `docs/research/source/` | **Recovered originals** — their animation bundle, their IX2 interaction data, decoders |
| `docs/build/` | The build system: protocol, phases, state, handoff, decisions, issues |
| `tools/verify/` | The verification harness (built in Phase 0) |
| `src/` | The site |

### The specs

| File | Contains |
|---|---|
| `00-brief-and-decisions.md` | Scope, the 9 locked decisions, honest confidence ratings |
| `10-design-system.md` | Tokens, fluid root, type scale, motion primitives |
| `20-components-and-motion.md` | Every component + exact animation. **The largest and most-used.** |
| `30-page-specs.md` | All 10 page templates, section by section |
| `40-content-model.md` | Schemas, the 12 works, services, blog |
| `50-brand-and-3d.md` | The aperture mark + Three.js/GLSL hero |
| `60-architecture-and-build.md` | Stack, file structure, budgets, phase plan |
| `70-physics-footer.md` | The Matter.js block pit |

---

## Non-negotiables

These are wrong often enough to state up front.

1. **Values in the spec are measured, not suggested.** A duration of `.7s` or a colour of
   `#3b3b3b` came out of their running site. Do not round, adjust, or "improve" them. If a value
   looks wrong, log it in `ISSUES.md` — do not silently change it.
2. **Three animation sources.** Markers in `20-components-and-motion.md`:
   `[src]` = their GSAP bundle · `[ix2]` = their Webflow interactions · `[css]` = their CSS
   `:hover` rules · `[new]` = ours. All three of theirs are reproduced.
3. **The display face is never bolded — in type.** All display weights are 400. Hierarchy comes
   from size and colour only. Introducing a 600 heading breaks the look, and that still holds for
   every heading, label and paragraph on the site.

   **One exception, and only one: the wordmark is 700.** `components/brand/Wordmark.module.css`.
   It is not type set in the system; it is a logo that happens to be drawn with the type face.
   Sayandeep asked for it on 2026-08-26 — see D-017. If you find yourself "fixing" it back to 400,
   read that entry first. Anything else above 400 is drift.
4. **Everything is `rem`** on the fluid root `calc(0.4375rem + 0.625vw)`, locked to `1rem` at
   ≤1440px. Only two exceptions: hairlines (`1px`) and the footer wordmark (`14vw`).
5. **Reverses run faster than forwards** — `timeScale(1.2)` panels, `1.5` buttons. Always.
6. **All hover/parallax/text-reveal is gated at `>991px`** via `gsap.matchMedia`, never a raw
   resize listener.
7. **One animation loop.** GSAP's ticker drives Lenis, ScrollTrigger and Matter. Never add a
   second `requestAnimationFrame` loop or use `Matter.Runner`.
8. **`prefers-reduced-motion` is honoured everywhere.** tonik ships none; we do. This is
   deliberate, documented, and not optional.

---

## Commands

```bash
npm run dev         # dev server on :3000
npm run build       # production build
npm run verify      # THE GATE — visual diff + token + motion + budget checks
npm run verify:visual   # screenshot harness vs tonik
npm run verify:tokens   # computed styles vs the token table
npm run verify:motion   # GSAP timelines vs specced durations/eases
npm run verify:budget   # bundle size + Lighthouse
```

`npm run verify` must pass before any phase is handed off. Its report is committed as evidence.

---

## Stack

Next.js 15 (App Router, TS) · CSS Modules + token sheet · GSAP + ScrollTrigger + Flip ·
Lenis · SplitType · Three.js + custom GLSL · Embla · Matter.js · MDX + Shiki · Vercel.

**Not** Tailwind, Webflow, Spline, jQuery, Barba, Splide, Swiper, Rapier.

---

## Model policy

**Run this build on Opus.** Decided by the user, not a default. Two phases have no reference to
transcribe and rest entirely on judgement — Phase 2 (the aperture mark and its GLSL material) and
Phase 6 (the first case study, whose pattern eleven more inherit) — and the fidelity audits are
where a weaker model quietly passes work that is subtly wrong.

If a session is running on something else, say so in the handoff so the next agent knows which
work to re-check.

## Ground rules for the agent

- **Never mark a task done without evidence.** `npm run verify` output, or a screenshot, or a
  named file. "Implemented" is not evidence.
- **Never guess at a spec gap.** Log it in `ISSUES.md`, choose the most conservative reading,
  and say so in your handoff.
- **Update the docs as you go, not at the end.** A session that dies mid-phase must leave
  `STATE.md` accurate.
- **Commit per completed task**, not per phase. See the protocol for conventions.
- The user is `Sayandeep`. Non-technical decisions (content, brand, scope) are theirs — ask.
  Technical decisions are yours — make them and log them in `DECISIONS.md`.
