# Issues

Open problems, deferred work, and spec values that look wrong.
**Log here instead of guessing.** Never silently change a specced value.

**Status:** 🔴 open · 🟡 worked around · 🟢 resolved · ⚪ won't fix

**Format**

```
## I-NNN · <short title>  🔴
**Found:** phase NN, YYYY-MM-DD · **Area:** <component or spec section>
**Problem:** what's wrong
**Impact:** what it blocks or degrades
**Workaround:** what was done in the meantime, if anything
**Needs:** what would resolve it — a decision, a re-measure, a user answer
```

---

## I-001 · Blog and industry templates are under-specified  🔴

**Found:** spec phase, 2026-08-25 · **Area:** `30-page-specs.md` §/blog, §/industries

**Problem:** Rated 6/10 confidence. Their sections and card design were captured; their interiors
were never crawled. The blog index filter behaviour and post body rhythm are inferred.

**Impact:** Phases 7 and 9 may build something that reads right but isn't faithful.

**Workaround:** None yet.

**Needs:** A ~20-minute re-measure against `tonik.com/blog` and `tonik.com/industries/ai` with
Playwright at the start of phase 9 / phase 7. Cheap. Do it before building, not after.

---

## I-002 · Culture collage composition is unspecified by design  🟡

**Found:** spec phase, 2026-08-25 · **Area:** `20-components-and-motion.md` §12

**Problem:** The parallax and wipe values are exact, but tonik hand-placed their photos and we
only sampled the arrangement once. There is no layout to transcribe.

**Impact:** Phase 5 needs genuine design work, not implementation.

**Workaround:** Treat it as an authored composition. `docs/research/screens/s09-culture.png` is
the one reference capture.

**Needs:** Design judgement in phase 5, then user review. Flag it explicitly in that handoff.

---

## I-003 · Physics feel values are unvalidated  🟡

**Found:** spec phase, 2026-08-25 · **Area:** `70-physics-footer.md` §3

**Problem:** `frictionAir 0.02` and `restitution 0.35` were reasoned from Matter's verified
defaults, not tuned against real content. They decide whether the pit reads "fluffy" or "hard".

**Impact:** The pit may feel wrong on first build. Expected, not a defect.

**Workaround:** Spec marks them as tune-last (T11.10).

**Needs:** Tuning session with the user in phase 11. User has already agreed to iterate here.
