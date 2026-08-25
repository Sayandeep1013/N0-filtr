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

---

## I-004 · `normalizeWheel` no longer exists in Lenis 1.x  🟢

**Found:** phase 00, 2026-08-25 · **Area:** `10-design-system.md` §5 Smooth scroll

**Problem:** The specced Lenis config passes `normalizeWheel: false`. That option was removed
from Lenis; it is absent from the options type in the installed 1.3.26 and passing it does
nothing. Every other specced option (`lerp`, `wheelMultiplier`, `gestureOrientation`,
`smoothWheel`, `syncTouch`) still exists and is passed verbatim.

**Impact:** None. Wheel normalisation is handled internally now.

**Workaround:** Dropped the key rather than passing a dead option. Noted in
`lib/motion/MotionProvider.tsx` at the config site.

**Needs:** Nothing. Recorded so a future agent comparing the spec to the code does not think
the option was forgotten.

---

## I-005 · At ≤767, `h1-sm` (3.25rem) is larger than `h1` (3rem)  🟡

**Found:** phase 00, 2026-08-25 · **Area:** `10-design-system.md` §3 Mobile step-down

**Problem:** The mobile step-down names `--t-h1: 3rem`, `--t-h2: 2.5rem`, `--t-h3/-h4: 1.5rem`.
It does not mention `--t-h1-sm`, which therefore stays at its desktop 3.25rem. Implemented as
written, the "secondary hero" style renders **larger than the primary hero style** on mobile —
visible in `tools/verify/output/shots/type-scale-390.png`, where h1-sm is plainly the biggest
thing on the page.

**Impact:** Any page using `h1-sm` on mobile will out-rank the homepage hero. Phase 3 (hero)
and phase 7 (service/industry heroes, which are the `h1-sm` consumers) are where this bites.

**Workaround:** Implemented the spec literally — `h1-sm` is unchanged at ≤767. Not silently
"fixed", per protocol §4. The probe page makes the inversion obvious to the next agent.

**Needs:** A re-measure of tonik at 390 on a page with a secondary hero (a service page), to see
what their `h1-sm` actually does below 768. Cheap — do it at the start of phase 7. If they do
step it down, the value goes in the spec first, then here.

---

## I-006 · `h1` tracking is not stepped down with `h1` size  🟡

**Found:** phase 00, 2026-08-25 · **Area:** `10-design-system.md` §3 Mobile step-down

**Problem:** `--t-h1-track` is `-0.15rem` at every breakpoint. At the desktop 6rem that is
-2.5% of the font size; at the mobile 3rem it is -5%, i.e. twice as tight proportionally.
Visible at 390 in the probe capture: h1 is noticeably tighter than the untracked h1-sm beside it.

**Impact:** Cosmetic, but it is the hero headline on every mobile view.

**Workaround:** Left at the specced value. The spec's step-down list names sizes and
line-heights only, and the most conservative reading of "the rest is unchanged" is that tracking
does not move.

**Needs:** Measure `letter-spacing` on tonik's mobile h1 at 390 and put the answer in the spec.
Bundle it with the I-005 re-measure — same page, same session, one trip.

---

## I-007 · The `small` (≤479) breakpoint has no values  🟡

**Found:** phase 00, 2026-08-25 · **Area:** `10-design-system.md` §1 Breakpoints

**Problem:** The breakpoint table lists `small` (≤479) as "tighter gutters, heading scale
step-down" but gives no numbers, and no other section supplies them.

**Impact:** Below 480px the site currently renders with the ≤767 values. Nothing is broken;
the intended tightening simply does not happen.

**Workaround:** Not implemented. No values were invented.

**Needs:** Measured values, or a decision that ≤767 is good enough down to 320. Owner: whichever
phase first has a real page to look at below 480 — realistically phase 3.

---

## I-008 · Next 15.5 pulls transitively vulnerable postcss and sharp  🟡

**Found:** phase 00, 2026-08-25 · **Area:** dependencies

**Problem:** `npm audit` reports 3 high-severity advisories, all inside Next's own dependency
tree (`postcss` <=8.5.22, `sharp` <0.35.0). `npm audit fix --force` resolves them only by
installing Next 16, which the stack decision in `60-architecture-and-build.md` §1 does not call
for and which is a breaking change mid-build.

**Impact:** None at runtime for a static marketing site — both advisories need attacker-supplied
CSS or images, and all of ours are in-repo. It is a build-time surface only.

**Workaround:** Staying on Next 15 per spec. Recorded rather than silently accepted.

**Needs:** A Next patch release that bumps them, or a deliberate decision to move to Next 16.
Re-check at phase 12 before launch.
