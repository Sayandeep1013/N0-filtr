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
