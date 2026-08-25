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

## I-005 · At ≤767, `h1-sm` (3.25rem) is larger than `h1` (3rem)  🟢

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

**Resolved:** phase 01, 2026-08-25. Re-measured on tonik at 390 (root 16px):

| element | class | measured |
|---|---|---|
| homepage hero | `.t-heading-1-rg` | 40px / 40px / **-0.8px** |
| `/product-design` hero | `.t-heading-1-small-rg` | 40px / 40px / **-0.8px** |
| CTA heading | `.cta-heading` | 40px / 40px / **-0.8px** |

They **collapse to the same step**: `2.5rem / 2.5rem / -0.05rem`. There is no inversion because
below 768 there is no distinction — the secondary hero style simply stops being secondary. The
spec's `--t-h1: 3rem` was also wrong; the real value is 2.5rem.

`10-design-system.md` §3 and `app/styles/tokens.css` updated, and `MOBILE_SCALE` in
`tools/verify/tokens.config.ts` with them.

**Needs:** Nothing.

---

## I-006 · `h1` tracking is not stepped down with `h1` size  🟢

**Found:** phase 00, 2026-08-25 · **Area:** `10-design-system.md` §3 Mobile step-down

**Problem:** `--t-h1-track` is `-0.15rem` at every breakpoint. At the desktop 6rem that is
-2.5% of the font size; at the mobile 3rem it is -5%, i.e. twice as tight proportionally.
Visible at 390 in the probe capture: h1 is noticeably tighter than the untracked h1-sm beside it.

**Impact:** Cosmetic, but it is the hero headline on every mobile view.

**Workaround:** Left at the specced value. The spec's step-down list names sizes and
line-heights only, and the most conservative reading of "the rest is unchanged" is that tracking
does not move.

**Resolved:** phase 01, 2026-08-25, in the same trip as I-005. tonik's mobile h1 letter-spacing
is **-0.8px = -0.05rem**, not the desktop -0.15rem — so it *is* stepped down, and by exactly the
same factor as the size (6→2.5rem is ×0.417; -0.15→-0.05rem is ×0.333, holding the optical
tightness roughly constant rather than the ratio exactly). The observation that -0.15rem was
proportionally twice as tight on mobile was correct, and tonik does not do it.

`10-design-system.md` §3, `app/styles/tokens.css` and `tools/verify/tokens.config.ts` updated.

**Needs:** Nothing.

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

---

## I-009 · The aperture mark's tick stroke weight is unspecified  🟡

**Found:** phase 01, 2026-08-25 · **Area:** `50-brand-and-3d.md` §1 The mark

**Problem:** The 2D glyph spec gives the ring's stroke weight (1/12 of the diameter) and each
tick's *length* (1/6 of the radius), but no stroke weight for the ticks. At the ring's own weight
a tick that short renders as a square blob rather than a retracted blade.

**Impact:** Cosmetic, but it is the loader glyph, the nav mark and the favicon.

**Workaround:** Ticks drawn at **half** the ring's weight in `components/brand/ApertureMark.tsx`.
Both numbers are derived from the spec's ratios at the top of that file, so changing the choice is
one constant.

**Needs:** Phase 2 is the brand gate and has to show the mark to the user anyway. Settle it there
and write the number into the spec.

---

## I-010 · `loader.enter` was seeded at 1.0s; IX2 says 0.6s  🟢

**Found:** phase 01, 2026-08-25 · **Area:** `02-VERIFICATION.md` §2, `motion.config.ts`

**Problem:** The seeded assertion gave `loader.enter` a `totalDuration` of 1.0s — the sum of the
mark fade (.4) and the panel slide (.6), i.e. assuming they run in sequence. The timeline in
`20-components-and-motion.md` §1 places them together with `'<'`.

**Evidence:** `docs/research/source/tonik-ix2.json`, action list `a-23`. The scale, opacity and
move items are three `actionItems` of the **same** `actionItemGroup`, and IX2 runs a group
concurrently — groups, not items, are the sequential unit. The spec's `'<'` is right.

**Resolution:** `totalDuration` corrected to 0.6 in `tools/verify/motion.config.ts`. The spec
needed no change. Recorded so nobody re-derives it.

**Needs:** Nothing.

---

## I-011 · The mobile step-down for h3–h6 does not match tonik  🔴

**Found:** phase 01, 2026-08-25 · **Area:** `10-design-system.md` §3 Mobile step-down

**Problem:** Re-measured on tonik at 390 (root 16px) while resolving I-005/I-006:

| token | tonik @390 | our spec ≤767 |
|---|---|---|
| h3 | 1.5rem / **1.5rem** | 1.5rem / 1.75rem |
| h4 | **1.25rem** / **1.5rem** | 1.5rem / 1.75rem |
| h5 | **1.25rem** / **1.5rem** | 1.5rem / 1.75rem (not stepped) |
| h6 | **1.25rem** / **1.25rem** | 1rem / 1.25rem (not stepped) |

Labels are confirmed unchanged at every breakpoint (12px/12px/-0.24px and 8px/8px/-0.16px),
which is the property the spec is most emphatic about and it holds.

**Impact:** Every heading below h2 is one step too large on mobile, and h4/h5 sit at the same
size as h3 rather than below it.

**Workaround:** None. Left at the specced values — unlike h1/h1-sm these have no open issue
against them, they were sampled from one page each, and two of the four elements carried
`is-mobile-*` modifier classes that may be per-instance overrides rather than the base scale.

**Needs:** Twenty minutes at 390 on tonik's `/about` and a case study, confirming the base
classes without modifiers. Owner: **phase 3**, the first phase to render these at 390. If they
confirm, the values go in `10-design-system.md` §3 and in `MOBILE_SCALE` in
`tools/verify/tokens.config.ts` together.

---

## I-012 · tonik's nav link padding is asymmetric — `.4rem .6rem .4rem .5rem`  🟡

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §2 Navbar

**Problem:** The spec gives the nav link `padding: .4rem .5rem`. Measured on `.navbar_link` at
1512: top/bottom 6.58px (.4rem ✓), left 8.225px (.5rem ✓), **right 9.87px (.6rem)**.

**Impact:** The active pill and the hover fill are 0.1rem wider on the right than on the left —
sub-pixel-visible, and only on a filled state.

**Workaround:** Implemented as the spec writes it, `.4rem .5rem`. The asymmetry is more likely a
Webflow inheritance artefact than a design decision, and the conservative reading is the
symmetric one.

**Needs:** A decision, not a measurement. Cheap either way.

---

## I-013 · The footer wordmark fills its column on tonik; ours is `14vw` everywhere  🟡

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §20, CLAUDE.md §4

**Problem:** tonik's footer wordmark is an **SVG sized to 100% of its column**, not type at a
fixed size. At 1512 that lands at 694×211px — 211px being 14vw, which is where the specced
`font-size: 14vw` comes from. At 390 the same SVG is 350×109px, i.e. **28vw**, because it is
still filling the column. Our wordmark is real text at a fixed `14vw`, so at 390 it renders at
54.6px — a quarter the relative size of theirs.

Ours is also a longer word. `no filter` at 14vw is roughly 950px wide at 1512 against tonik's
694px column, so it is laid out across the first two grid columns rather than the first.

**Impact:** The footer's biggest single element is proportionally much smaller than tonik's on
mobile. Desktop is right.

**Workaround:** `14vw` kept at every width — it is one of only two rem exceptions CLAUDE.md §4
names, and inventing a mobile value is not mine to do. The wordmark spans grid columns 1–2 so
the longer word has room.

**Needs:** A value for ≤767 (28vw would match tonik's proportion), or a decision that the
wordmark should be width-fitted rather than size-fixed. Owner: phase 12 polish, or sooner if the
mobile footer looks wrong to the user.

---

## I-014 · The footer's five service icons are placeholder art  🟡

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §20

**Problem:** §20 says the footer service list is "icon + label ×5" and the re-measure fixed the
icon at 1.25rem and 0.5 opacity, but there is no icon set to transcribe — tonik drew their own
line art and it is not ours to copy.

**Impact:** The composition is right and the five rows read correctly, but the glyphs are five
minimal geometric marks drawn to fill the slot, not a designed set.

**Workaround:** `components/ui/ServiceIcon.tsx` — one file, five paths on a 20×20 grid at the
same 1.5-unit stroke as the aperture. Replacing them is one edit and touches nothing else.

**Needs:** Real icons. Phase 2 owns the brand and phase 10 owns assets; either could take it.
Not blocking anything.

---

## I-015 · The contact form's options and its gif have no source  🟡

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §3

**Problem:** Three gaps in one component.

1. **"WHAT BUDGET DO YOU HAVE?"** — the spec gives the field, its type (select) and its styling,
   but no bands.
2. **"WHERE DID YOU FIND US?"** — "chip multi-select ×4", and names none of the four.
3. **`.contact__gif`** — "bottom-left, translated y:100% at rest". There is no asset. tonik loops
   a GIF there; ours has nothing to show until phase 10.

**Impact:** Two fields ship with invented option lists, and the panel's bottom-left quarter is
empty at desktop.

**Workaround:** Budgets are `Under $5k · $5k–$15k · $15k–$50k · $50k+ · Not sure yet`; sources are
`Search · Social · Referral · GitHub`. Both are single constants at the top of
`components/chrome/ContactForm.tsx`. The gif element is **present but empty** — a real box that
the open timeline moves, so the animation and its assertion are honest, with nothing invented
inside it. It is hidden below 992 where tonik hides it too.

There is also no endpoint: with no Tally ID, submit composes a `mailto:` to the business address.
That is a working path, not a stub, but it is not the shipping one.

**Needs:** Content decisions from the user for 1 and 2 — cheap, and they are non-technical, so
they are theirs. A media asset for 3, from phase 10. A form endpoint or a Tally ID before launch,
in phase 12.

---

## I-016 · `'1rem top'` / `'30rem top'` are pixels — ScrollTrigger has no rem  🟢

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §2 Mini toggle

**Problem:** The navbar mini ScrollTrigger is specced — and transcribed from tonik's bundle
verbatim — as `start: '1rem top', end: '30rem top'`. It reads like 30rem of scroll, which at a
16.45px root would be 493.5px. It is not.

**Evidence:** `node_modules/gsap/ScrollTrigger.js:310`, `_offsetToPx` handles `%` and the
top/center/bottom keywords and then falls through to `parseFloat(value) || 0`. `parseFloat('30rem')`
is `30`. There is no rem support anywhere in ScrollTrigger's position parser.

Confirmed on the live site rather than inferred. tonik's own trigger instance reports:

```
vars: { start: '1rem top', end: '30rem top' }   →   start: 1, end: 30
```

and their bar is not mini at scrollY 20 and is mini at scrollY 40.

**Resolution:** Nothing to change in the code — ours was already byte-identical and therefore
already correct. The **harness assertion** was wrong: it tested 300px/700px around an assumed
493.5px boundary and failed a correct implementation. Corrected to 20px/100px around 30px.

**Do not "fix" the specced strings into computed rem.** That would move the threshold sixteen
times further down the page than tonik's, and every phase that touches the navbar will be tempted
to. The note now lives in `behaviour.config.ts` next to the assertion, in
`20-components-and-motion.md` §2 next to the code, and here.

---

## I-017 · `inOutQuad → power2.inOut` is wrong. GSAP's `power2` is cubic.  🔴

**Found:** phase 01, 2026-08-25 · **Area:** `20-components-and-motion.md` §21 easing table,
`10-design-system.md` §5 `EASE.quad`, `lib/motion/tokens.ts` `IX2_EASE`

**Problem:** The spec states, twice and emphatically, that *"GSAP's `power2.inOut` is the exact
equivalent of Webflow's `inOutQuad`"*. It is not. GSAP's `powerN` aliases are offset by one from
the Penner names:

```js
// node_modules/gsap/gsap-core.js:1526
_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
  var power = i < 5 ? i + 1 : i;
  _insertEase(name + ",Power" + (power - 1), …Math.pow(p, power)…);
});
```

| i | Penner name | exponent | GSAP alias |
|---|---|---|---|
| 0 | Linear | 1 | Power0 |
| 1 | **Quad** | **2** | **Power1** |
| 2 | Cubic | 3 | Power2 |
| 3 | Quart | 4 | Power3 |
| 4 | Quint | 5 | Power4 |

`Quad === Power1`. `power2` is **cubic**, one power too strong.

**Confirmed by scrubbing our own loader** rather than by reading the table. Driving
`loader.enter` to 25% put the panel at `-75px` of a 1200px sweep — 6.25%, which is `4p³` (cubic
in-out) exactly. Quadratic in-out would be `2p²` = 12.5% = `-150px`. The mark's opacity at the
same instant read `0.7891`, again cubic to four decimals.

**The token is named `quad`.** GSAP even ships `quad.inOut` as an alias for `power1.inOut`. The
token's *name* and the recovered IX2 value agree with each other; only the transcribed *value*
disagrees with both. That reads like a slip, not a decision.

**Impact:** every `[ix2] inOutQuad` timeline on the site accelerates harder and settles later
than tonik's. In this phase that is `loader.enter` (both tweens) and the footer sibling-dim. It
also reaches §21.7's filter dropdown in phase 7, and every later phase that adds an inOutQuad
timeline inherits it.

There is a second oddity that points the same way: the spec maps `easeInOut` and `ease` to
`power1.inOut` and `inOutQuad` to `power2.inOut`, which would make Webflow's `inOutQuad` sharper
than its `easeInOut`. In Webflow those two are near-identical curves.

**Workaround:** **None — left exactly as specced.** `EASE.quad` is still `power2.inOut`,
`SPEC_EASE.quad` still asserts it, and `verify:motion` is green against it. Protocol §4 is
explicit that a value believed wrong is logged and left, and this one is a named token in the
design-system table that phase 0 asserted and later phases will build on.

**Needs:** A decision from Sayandeep. **Recommendation: change `EASE.quad` to `power1.inOut`.**
The evidence that the transcription slipped is strong and the fidelity cost of leaving it is real.

It is a three-line change today — `lib/motion/tokens.ts`, `tools/verify/motion.config.ts`
`SPEC_EASE`, and the two mapping tables in the specs — and it gets more expensive with every
phase that adds an inOutQuad timeline. **Cheapest to settle in phase 2.** Nothing else in
`EASE` is affected: `circ.out` for `outCirc` is correct, and `power3.out`/`power3.in` are our own
choices rather than IX2 translations.
