# Decisions log

Append-only. Every technical decision a future agent could reasonably question.
Newest at the bottom. Never edit or delete an entry — supersede it with a new one.

**Format**

```
## D-NNN · <short title>
**Phase:** NN · **Date:** YYYY-MM-DD · **Status:** active | superseded by D-NNN

**Context:** what forced a choice
**Decision:** what was chosen
**Alternatives:** what else was considered, and why not
**Consequence:** what this makes easier or harder later
```

Decisions made *before* the build (scope, brand, content, stack) live in
`docs/spec/00-brief-and-decisions.md`. This file is for decisions made *during* implementation.

---

## D-001 · Verification harness before components

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** A 13-phase build across many sessions will drift. The dominant failure mode is an
agent asserting a phase is done when details were skipped.

**Decision:** Build the full verification harness in Phase 0, before any component exists. Every
subsequent phase extends it with assertions for what it built, and commits its report as evidence.

**Alternatives:** Checklist-based self-review (cheapest, depends entirely on agent honesty);
visual diff only (misses timing); assertions only (misses composition). All rejected as
individually insufficient.

**Consequence:** Phase 0 is ~1.5 sessions instead of ~0.5. Every phase after is provable rather
than asserted, and a fresh agent can trust the build without re-reading everything.

---

## D-002 · tonik's recovered source is gitignored

**Phase:** — · **Date:** 2026-08-25 · **Status:** active

**Context:** `docs/research/source/` held tonik's de-minified animation bundle, their IX2
interaction store, and their Spline scene binary. The repo was public at the time.

**Decision:** Gitignore the three tonik-owned files. Commit our decoders, our analysis, and their
public sitemap. Every value extracted from them is written into `docs/spec/`, which is our work.

**Alternatives:** Commit everything (republishes their assets); commit nothing from research
(loses our own analysis).

**Consequence:** A fresh clone cannot re-verify a disputed spec value from the local files.
`docs/research/source/README.md` documents how to regenerate all four. The repo has since been
made private, but the separation is still correct and stays.

---

## D-003 · Font cuts: General Sans variable, IBM Plex Mono 400/500 only

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** `10-design-system.md` §3 lists General Sans at 300/400/500/600 and IBM Plex Mono at
300/400/500/600/700. That column describes what the families offer; nothing in the spec asks for
all nine cuts to be loaded, and `next/font/local` preloads every declared file.

**Decision:** Ship General Sans as its **variable** cut (`weight: '200 700'`, one 38KB file
covering every weight the system names) and IBM Plex Mono as **400 and 500 statics** (~15KB each).

**Alternatives:** Four General Sans statics (4 requests, more bytes, no more coverage). All five
Plex cuts (75KB and five preloads, when the three mono tokens are uppercase labels and the scale
table names no weight for them, i.e. 400). A variable Plex — does not exist on Fontsource.

**Consequence:** Three font files instead of nine. Adding a mono weight later is one line in
`app/fonts/fonts.ts` plus a woff2 — cheap, and cheaper than carrying unused cuts through twelve
phases. The display face has its full range available, which phase 2 needs for the wordmark, and
the never-bold rule is enforced by `verify:tokens`, not by withholding the weights.

---

## D-004 · The one-rAF-loop rule is checked by classification, not by counting

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** CLAUDE.md §7 says never add a second `requestAnimationFrame` loop. The first version
of the check simply counted self-rescheduling rAF callbacks and expected 1. It failed with 2 —
and the second one was legitimate: GSAP's ScrollTrigger runs `_rafBugFix`, a no-op keep-alive
that exists because Firefox does not repaint consistently unless something is queued
(`node_modules/gsap/ScrollTrigger.js:61`). It drives nothing.

**Decision:** Classify rather than count. Every persistent rAF loop must match one of two
allowlisted library internals (`gsap-core.js` `_tick`, ScrollTrigger's `_rafBugFix`), and the
ticker must appear exactly once. Anything else fails and prints its own stack.

**Alternatives:** Expect 2 (a magic number that stops meaning anything the moment GSAP changes,
and would silently absorb a real third loop). Drop the check (loses the rule entirely).

**Consequence:** The check now catches what the rule is actually about — a stray rAF in a
component, a video sync loop, `Matter.Runner` in phase 11 — while tolerating GSAP's internals.
If a future GSAP release adds or renames an internal loop, the allowlist in
`tools/verify/motion.config.ts` `RUNTIME.sanctionedRaf` is where to say so, deliberately.

---

## D-005 · A dev-only `/probe` route is the token surface

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** `02-VERIFICATION.md` writes its token assertions against selectors on the real page
(`[data-t="h1"]`, `.padding-global`). In phase 0 there is no real page, and the acceptance
criterion for T0.1 is that `/` serves a *blank* page.

**Decision:** A `/probe` route, `notFound()` in production, carrying one element per scale,
colour and layout token. Assertions default to it and each may name its own `page`.

**Alternatives:** Put probes on `/` (contradicts the blank-page acceptance and would have to be
torn out in phase 3). Inject probes at runtime from the checker (tests the injection, not the
stylesheet, and cannot catch a cascade or media-query bug).

**Consequence:** Every token is verified from phase 0 rather than from whenever a component
happens to use it, and the type scale is visible in one place for the visual check. Later phases
should point *component* assertions at real pages; `/probe` stays as the canonical scale
reference. It costs 127B in the production build and renders nothing.

---

## D-006 · ESLint set up properly, `next lint` removed

**Phase:** 0 · **Date:** 2026-08-25 · **Status:** active

**Context:** The scaffold's `npm run lint` used `next lint`, which is deprecated in Next 15.5 and
drops into an interactive prompt — under a non-interactive agent shell it hangs or half-runs.

**Decision:** eslint 9 flat config extending `next/core-web-vitals` and `next/typescript`.
`docs/**` is ignored: it contains tonik's recovered minifier output, which produced ~100 warnings
about code that is not ours and is gitignored anyway.

**Alternatives:** Delete the lint script (loses `react-hooks/exhaustive-deps` across 13 phases of
GSAP effects, which is exactly where this build will leak). Leave it broken (worse than absent).

**Consequence:** `npm run lint` is real and clean. It is not part of `npm run verify` — verify is
about spec fidelity, lint is about code health, and conflating them would make a token failure
and an unused import look like the same kind of problem.
