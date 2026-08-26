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

## Index

Newest last. **Owner** is the phase that should resolve it, not the phase that found it.

| # | Title | Status | Owner |
|---|---|---|---|
| I-001 | Blog and industry templates are under-specified | 🔴 open | 7, 9 |
| I-002 | Culture collage composition is unspecified by design | 🟡 worked around | 5 |
| I-003 | Physics feel values are unvalidated | 🟡 worked around | 11 |
| I-004 | `normalizeWheel` no longer exists in Lenis 1.x | 🟢 resolved | — |
| I-005 | At ≤767, `h1-sm` is larger than `h1` | 🟢 resolved in 1 | — |
| I-006 | `h1` tracking is not stepped down with `h1` size | 🟢 resolved in 1 | — |
| I-007 | The `small` (≤479) breakpoint has no values | 🟡 worked around | 3 |
| I-008 | Next 15.5 pulls transitively vulnerable postcss and sharp | 🟡 worked around | 12 |
| I-009 | The aperture mark's tick stroke weight is unspecified | 🟢 resolved in 2 | — |
| I-010 | `loader.enter` was seeded at 1.0s; IX2 says 0.6s | 🟢 resolved in 1 | — |
| I-011 | The mobile step-down for h3–h6 does not match tonik | 🔴 open | **3** |
| I-012 | tonik's nav link padding is asymmetric | 🟡 worked around | any |
| I-013 | The footer wordmark fills its column on tonik; ours is `14vw` | 🟡 worked around | 12 |
| I-014 | The footer's five service icons are placeholder art | 🟡 worked around | 10 |
| I-015 | The contact form's options and its gif have no source | 🟡 part-resolved | user, 10, 12 |
| I-016 | `'1rem top'` / `'30rem top'` are pixels — ScrollTrigger has no rem | 🟢 resolved in 1 | — |
| I-017 | `inOutQuad → power2.inOut` is wrong; GSAP's `power2` is cubic | 🟢 resolved in 1 | — |
| I-018 | The wordmark's fit was measured against the *lowercase* form | 🟢 resolved in 2 | — |
| I-019 | `/` is 302.8KB against a 190KB JS budget the spec under-counted | 🟢 resolved in 2 | — |
| I-020 | The mobile hero has no hero section to scrub against until phase 3 | 🟡 worked around | 3 |
| I-021 | Section 2's fragment sketch computes a roughness it never uses | 🟢 resolved in 2 | — |
| I-022 | Section 2's camera puts the assembly outside its own composition target | 🟢 resolved in 2 | — |
| I-023 | Section 2's motion values are per-frame; its prose says per-second | 🟢 resolved in 2 | — |
| I-024 | Section 2's ellipse is two Euler terms; one axis is the real quantity | 🟢 resolved in 2 | — |
| I-025 | Section 2's parallax curves detach a housed mechanism | 🟢 resolved in 2 | — |
| I-026 | An idle spin about world Y collapses an annulus | 🟢 resolved in 2 | — |
| I-027 | Section 2 has no specular term, so the material cannot glint | 🟢 resolved in 2 | — |
| I-028 | Section 2's load-in is correct and illegible | 🟢 resolved in 2 | — |
| I-029 | Section 2's idle spin contradicts itself | 🟡 worked around | any |
| I-030 | `.container-large` is capped at 80rem on tonik; our spec calls it the gutter width | 🟢 resolved in 2 | — |

**Nothing open blocks phase 2.** I-009 and I-014 were both settled in the conversation that
approved the mark, on 2026-08-26 — I-009 resolved, I-014 explicitly deferred to phase 10.

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

## I-009 · The aperture mark's tick stroke weight is unspecified  🟢

**Found:** phase 01, 2026-08-25 · **Area:** `50-brand-and-3d.md` §1 The mark

**Problem:** The 2D glyph spec gives the ring's stroke weight (1/12 of the diameter) and each
tick's *length* (1/6 of the radius), but no stroke weight for the ticks. At the ring's own weight
a tick that short renders as a square blob rather than a retracted blade.

**Impact:** Cosmetic, but it is the loader glyph, the nav mark and the favicon.

**Workaround:** Ticks drawn at **half** the ring's weight in `components/brand/ApertureMark.tsx`.
Both numbers are derived from the spec's ratios at the top of that file, so changing the choice is
one constant.

**Resolved:** phase 02, 2026-08-26. Sayandeep chose **half the ring's weight** — 1/24 of the
diameter — at the brand gate, taking the recommendation. Half is the only one of the three
candidates at which six separate blades stay countable at 16px; at the ring's own weight a tick
1/6-of-a-radius long is nearly as wide as it is long and renders as a square blob. All three were
rendered side by side at 48px and 16px so the choice was made by eye rather than from a
description. **No code change** — the provisional value was the chosen one. The number is now
written into `50-brand-and-3d.md` §1, which no longer omits it.

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

> **Amended phase 02, 2026-08-26 — this issue is materially smaller than it was.** The numbers
> above describe the *lowercase* wordmark; the casing changed to `NO FiLTER` (D-011) and caps are
> wider. Re-measured: the footer wordmark now fills **71.6%** of its 350px column at 390, not the
> ~51% this issue was written against, and **82.5%** at 1512 against ~59%. The gap to tonik's
> column-filling SVG is roughly halved by the casing change alone, at no cost — `14vw` is
> untouched.
>
> The second paragraph above is also now wrong in its arithmetic: `NO FiLTER` at 14vw measures
> **971px** at 1512, not the ~950px estimated for `no filter`. The conclusion is unchanged — it
> still spans grid columns 1–2 and still has room.
>
> Whether 71.6% is close enough to stop calling this an issue is a judgement for phase 12 with
> the real footer in front of it. Left open, at reduced severity.

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

**Needs:** Real icons. **Phase 10.** Put to Sayandeep at the phase-2 brand gate on 2026-08-26
alongside the mark, since phase 2 could equally have taken it; he chose to leave them until the
assets phase. The owner column is now 10 rather than "2 or 10", and phase 2 will not raise it
again.

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

**Partly resolved 2026-08-25:** Sayandeep supplied the contact address —
`sayandeepmondal1013@gmail.com` — and decided against a physical address. The form's `mailto:`
fallback now goes somewhere real. The budget bands and the four referral chips are **still
invented** and still need his answer; they are two constants at the top of `ContactForm.tsx`.

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

## I-017 · `inOutQuad → power2.inOut` is wrong. GSAP's `power2` is cubic.  🟢

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

**Resolved:** 2026-08-25, immediately after phase 1, by Sayandeep's decision — the call was
delegated back with "you know better than me". `EASE.quad` is now **`power1.inOut`**.

Changed in seven places, all in one commit:

| file | change |
|---|---|
| `lib/motion/tokens.ts` | `EASE.quad` and the `IX2_EASE` comment table |
| `tools/verify/motion.config.ts` | `SPEC_EASE.quad`, and both `loader.enter` ease assertions |
| `lib/motion/useSiblingDim.ts` | the §21.1 provenance table in its doc comment |
| `docs/spec/10-design-system.md` §5 | the `EASE` block and the Webflow mapping |
| `docs/spec/20-components-and-motion.md` §1, §21 | the loader timeline and the mapping table |
| `docs/spec/60-architecture-and-build.md` §8 | the fidelity-verification easing map |
| `docs/build/02-VERIFICATION.md` §2 | the seeded `loader.enter` example |

`EASE.quad` and `EASE.inOut` now hold the same value. That is correct, not a duplicate to be
tidied away — Webflow's `inOutQuad`, `easeInOut` and `ease` are all quadratic-in-out curves
within a hair of each other. The two names are kept apart because they record different
provenance, and a note saying so sits next to both definitions so nobody collapses them.

Nothing else in `EASE` was affected: `circ.out` for `outCirc` is correct, and `power3.out` /
`power3.in` are our own choices rather than IX2 translations.

**Needs:** Nothing. Two live consumers were re-verified after the change — `loader.enter` (both
tweens) and the footer sibling-dim, which still lands on exactly 0.3.


---

## I-018 · The wordmark's fit was measured against the lowercase form  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §1, `components/chrome/Footer`

**Problem:** Phase 1's visual judgement recorded that `no filter` at `14vw` ends at x≈737 at 1512,
against tonik's own 737 — and treated the coincidence as evidence the setting was right. That
measurement was taken on the **lowercase** wordmark. The casing changed to `NO FiLTER` on
2026-08-26 (D-011) and caps are wider, so the number no longer describes what ships.

Two values are implicated, not one. The `14vw` size is one of only two `rem` exceptions
CLAUDE.md names, so it is not free to change. And `letter-spacing: -0.02em` was chosen for
lowercase — caps normally want tracking at or slightly above zero, and −2% on caps is tight.

**Impact:** Cosmetic, and confined to the footer and the navbar. Nothing is broken; the wordmark
may simply overrun its column at 14vw, or read cramped. It also means **I-013 needs re-reading**
— that issue says our mobile wordmark is proportionally a quarter of tonik's, and the arithmetic
behind that claim assumed the lowercase form too.

**Workaround:** Both values left exactly as specced. Under CLAUDE.md non-negotiable §1 a specced
value is not adjusted by feel, and the honest sequence is to measure first.

**Resolved:** phase 02, 2026-08-26, by measuring rather than deferring. `getBoundingClientRect`
on every `.wordmark` at 1512 and 390, against its own container:

| Surface | Width | Container | Fit |
|---|---|---|---|
| Footer @1512 | 971.4px @ 211.68px (=14vw ✓) | 1177.8px | **82.5%** |
| Footer @390 | 250.6px @ 54.6px (=14vw ✓) | 350px | **71.6%** |
| Navbar @1512 | 75.5px **before** | 69.9px (4.25rem) | **108% — overrun** |
| Navbar @1512 | 69.8px **after** | 69.9px | 99.9% |
| Navbar @390 | 67.9px **after** | 68px | 99.9% |

**The footer was never the problem — the navbar was.** `14vw` and `-0.02em` both hold: the
footer wordmark grew from ~59% to 82.5% of its column at 1512 and from ~51% to 71.6% at 390, and
overflows at neither. Both specced values are therefore left exactly as written.

The navbar was overrunning its box by 8%. `50-brand-and-3d.md` §4 fixes the logo at
**4.25rem × 1.25rem**, measured off tonik, and `flex: none` means it reserves that width in the
nav row — so the box is the value that cannot move, and the face size is the free variable.
Phase 1 had set `font-size: 1rem` because that is what made the *lowercase* wordmark fill
4.25rem exactly; caps measured 4.59rem in the same box. `4.25 / 4.59 = 0.926`, so
`font-size: 0.925rem`. Re-measured: 99.9% of the box at both breakpoints. One value changed, and
it is the one that was fitted rather than measured.

**This also moves I-013**, which is written against the old proportions — see the note there.

> **Touched again on 2026-08-26.** The wordmark went to `font-weight: 700` (D-017), which widens
> it a third time — the footer mark now ends near x=1100 at 1512 against ~1010 at 400. Still
> inside its column, still no overflow, and `14vw` is still untouched. Recorded rather than
> re-opened: the fit holds, and the measurement here is the one that matters.


---

## I-019 · `/` is 302.8KB against a 190KB JS budget the spec under-counted  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `60-architecture-and-build.md` §5

**Problem:** `verify:budget` measures **302.8KB** of JavaScript transferred on `/` against a
specced ceiling of **190KB**. The check fails, and `npm run verify` fails with it.

The budget cannot be met, and the reason is arithmetic in the spec rather than weight in the
build. §5 itemises the 190KB as *"GSAP ~55, Three ~150 raw/~48 gz, Lenis ~4, app ~40"* — which
sums to 147 and **omits React and Next entirely**. Measured here they are ~92KB gzipped on their
own, so the framework eats half the ceiling before a line of ours is counted.

The second error is Three. §5 estimates 48KB gzipped. Three 0.185 with a `WebGLRenderer`, a
`TorusGeometry` and an `ExtrudeGeometry` builds to **558KB raw across two chunks and 141.3KB
transferred** — nearly three times the estimate. Tree-shaking barely helps: `WebGLRenderer` pulls
the whole shader library, and that is most of it.

| | Measured on `/` |
|---|---|
| Before this phase (framework + GSAP + Lenis + app) | 170.1KB |
| minus Flip and Observer, registered and never used | −8.6KB → **161.5KB** |
| Three, dynamically imported but still fetched on `/` | **+141.3KB** |
| **Total** | **302.8KB** / 190KB |

**What was already done about it.** Three *is* dynamically imported — `verify:budget`'s
`three absent from the eagerly-loaded bundle` check passes, and it is no longer vacuous. And Flip
and Observer were removed from `lib/motion/gsap.ts`: Flip has exactly one consumer on the whole
site (the showreel, phase 3) and Observer has none in any component spec. That is every byte
available without removing something the site actually uses.

**Impact:** `npm run verify` cannot go green. Phase 2 therefore cannot be handed off clean under
protocol §5 — which is the gate working correctly, not a problem with the gate.

**Workaround:** None. The number is specced, so it is **not** being edited to fit
(CLAUDE.md non-negotiable §1). The check stays red and reports the true figure.

Deferring Three's import to idle would move the download outside the measurement window and turn
the check green **without saving the visitor a single byte**. It was considered and rejected: that
is gaming the instrument, not meeting the budget.

**Resolved:** phase 02, 2026-08-26. **Sayandeep raised the budget to 320KB**, taking option 1.
`BUDGETS.homeJsGzipKb` is 320 and `60-architecture-and-build.md` §5 carries the corrected
itemisation and the measured breakdown rather than the original arithmetic. `npm run verify` is
green.

**The headroom is thin and the next agent should know it.** Measured 302.8 of 320 leaves ~17KB,
and phases 3 to 5 add real code to this route — SplitType, Embla, the works grid, the accordion.
Plyr and Matter must never appear in the figure: both are specced lazy, so if either shows up
that is a bug in the import, not a reason to raise the ceiling again. Re-measure before any
second raise. The note is in `budget.config.ts` where it will be read.

The options as they were put:

1. **Re-budget to ~320KB** and keep the 3D hero. §5's line items were never a measurement;
   Lighthouse (≥85 desktop / ≥70 mobile, §5) stays the real quality bar and is not a byte count.
   Recommended.
2. **Defer Three until idle or first interaction.** The hero appears a beat late; LCP and INP
   genuinely improve, because the canvas is `aria-hidden` decoration and never the LCP element.
   The bytes are unchanged, so the check would have to be redefined as *JS before interactive*
   for it to mean anything.
3. **Drop the 3D hero** and ship the baked WebP on every visit. Saves the full 141.3KB and ends
   phase 2's reason to exist.

§3 "Why not Spline" survives all of this: its numbers were wrong, its conclusion was not — Spline
is ~380KB of runtime plus a ~200KB scene, so Three is still the smaller of the two.

---

## I-020 · The mobile hero has no hero section to scrub against until phase 3  🟡

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Mobile

**Problem:** §2's mobile drive scrubs `rotationY −0.525 → −1.5` against "the hero section's
ScrollTrigger". The hero section belongs to phase 3, so there is no element to anchor to yet.

**Impact:** None visible — the range is identical either way.

**Workaround:** `Hero3D.tsx` looks for `[data-hero]` and falls back to the first viewport of the
document, which is the range the hero section will occupy. `HERO_TRIGGER_SELECTOR` is one constant.

**Needs:** Phase 3 puts `data-hero` on the hero section. Nothing else: the trigger picks it up and
its `end` switches from `+=innerHeight` to the element's own `bottom top`.

---

## I-021 · §2's fragment sketch computes a roughness it never uses  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Material

**Problem:** The GLSL in §2 computes a `roughness` from the grain and then never reads it again.
The grain reaches the output through exactly one term — `col *= mix(0.88, 1.06, grain)` — which is
about 9% either way on a base of 0.165, and invisible.

Transcribed literally the material has **no visible grain at all**, which is the one thing §2 says
is "the whole character of the material". Confirmed by rendering it: the first pass was a smooth
dark torus.

§2's prose is unambiguous about the intent — the surface *"has a fine granular roughness that
catches the rim light"* — so the sketch is missing the line that connects the two, not describing
a material without grain.

**Impact:** The difference between the specced object and the reference capture, which shows a
strongly speckled surface along the lit arc.

**Workaround:** `aperture.glsl.ts` wires the roughness into the fresnel term the prose names — a
rougher patch both widens the rim falloff and brightens it — and the grain then reads as glitter
along the lit edge. Every value §2 *does* give is untouched: `#2a2a2a`, `pow(…, 2.8)`,
`vec3(0.55) * fresnel * 0.85`, `mix(0.88, 1.06, grain)`, `18.0`, `0.35`. See D-012.

**Resolved:** phase 02, 2026-08-26. Sayandeep reviewed the rendered result against the reference
in the phase-2 hero recording and kept it as built — a fine granular tooth that catches the rim
light, without inventing a specular term §2 never describes. tonik's still sparkles harder, which
is a baked map with real specular glitter against our procedural grain; that difference is
accepted rather than chased.

---

## I-022 · §2's camera puts the assembly outside §2's own composition target  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Scene graph

**Problem:** Two things in §2 cannot both be true.

The scene graph says `PerspectiveCamera fov 35, position (0, 0, 6.5)` with a ring of radius 2.0.
At that distance the visible height is `2 × 6.5 × tan(17.5°) = 4.10` units and the ring is 4.0 —
98% of the viewport height before perspective. The specced tilt then brings the near edge 1.04
units closer, magnifying it a further ~19%. **It overflows the viewport on every side.**

The composition target three lines below says the assembly should occupy *"the right ~55% of the
viewport, cropped by the right edge"*, and `docs/research/screens/tonik-hero-01.png` shows their
ring at **51% of the width, fully contained top and bottom.**

**Impact:** Following the numbers gives an object roughly twice the intended size. The first
render is what caught it.

**Workaround:** `CAMERA_Z = 7.5` in `apertureScene.ts`, which measures 53% of the width and sits
where theirs sits. The composition is the half of §2 that can be held against a reference capture;
the scene graph is the half §2 *authored* rather than recovered, since tonik's object is a Spline
binary the brief deliberately does not copy. Every other scene-graph number is verbatim.

A second problem at the same root: a distance chosen for a 1.68 aspect leaves the ring at **183%
of the width at 390**, a bare arc with one blade on it, where tonik's mobile capture
(`s17-mobile-hero.png`) still reads as a ring with the mark inside. The distance is therefore
fitted to the viewport — never closer than 7.5, pulled back as far as it takes to keep the
assembly within 105% of the width. One rule, correct at every width, resolving to exactly 7.5 on
any desktop aspect. Asserted at both breakpoints by `verify:motion`.

**Resolved:** phase 02, 2026-08-26. **Sayandeep kept 7.5**, over going back to 6.5 with a
full-bleed object. §2's scene graph now disagrees with the code by one number, deliberately, and
both this issue and the constant's own comment say so — the composition target is the half of §2
that can be held against a reference capture, and it is the half that holds.

---

## I-023 · §2's motion values are per-frame; the spec's own prose says per-second  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Motion

**Problem:** §2 states two motion quantities as **durations** and implements both as **per-frame
increments**:

| Prose | Snippet | True only at |
|---|---|---|
| "~7.5s per revolution" | `group.rotation.y += 0.0022` per frame | 60fps |
| "Smoothing: **500ms** on every channel" | `+= (target − current) * 0.08` per frame | 60fps |

A per-frame constant is a different duration on every machine: at 30fps the smoothing takes a
second, and on a throttled background tab several.

**Impact:** Found by the new behaviour check, not by eye. It read the pointer sweep at **0.319 rad
instead of 0.4**, because headless Chromium runs the ticker near 20fps — the curves were right and
the convergence was not.

**Resolved:** phase 02. Both are applied per second of real elapsed time:
`IDLE_SPIN_PER_SECOND = 0.0022 × 60` and `dampFactor(dt) = 1 − (1 − 0.08)^(dt × 60)`, which
evaluates to **exactly** the specced 0.08 at 60fps and holds the specced durations everywhere
else. The specced numbers are unchanged; only the unit they are applied in is. Re-measured: ring
0.394 of 0.4, blades 0.592 of 0.6, ratio 1.50×.

The lesson is worth carrying into phases 4, 5 and 11: **a per-frame constant in a spec is a
duration wearing a disguise.** The block pit in phase 11 has exactly the same exposure.


---

## I-030 · `.container-large` is capped at 80rem; our spec calls it the gutter width  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `10-design-system.md`, `app/styles/global.css`

**Problem:** `10-design-system.md` documents `.container-large` as
`--content: calc(100vw - (2 * 2.5rem))` — the page width less the gutters — and `global.css`
implemented it as `max-width: 100%`. Nothing used it, so nothing failed.

tonik's is **`max-width: 80rem`, centred**: 1316px at a 16.45 root, 1520px at 19. Enumerated on
their live DOM, eleven `.container-large` elements on the homepage — **ten capped at 1316px, one
at 100%** carrying a `unl-width` modifier for the hero's full-bleed 3D wrapper.

**Impact: this was the cause of every alignment miss in phase 2's hero.** Their copy column starts
at x=98 in a 1512 viewport because 80rem centred inside a 41.125px gutter lands there. Ours started
at 41 and I moved it three times by eye — 57px, then the foot rail, then the play control — without
ever finding the rule that put it there.

**Resolved:** `.container-large` is `max-width: var(--container-large)` = 80rem, with a
`.unl-width` modifier at 100%. `--container-large` is a token. The hero is
`padding-global > container-large`, which is tonik's own nesting, and every hero figure now matches
theirs exactly.

**The general lesson, and it is the one worth keeping.** Everything corrected in phase 2's hero was
sitting in `getComputedStyle` the whole time. A screenshot shows where an element *is*; it never
shows the rule that put it there, so correcting from a capture converges slowly and teaches you
nothing reusable. `tools/extract/tonik.mjs` and `docs/research/03-tonik-extract.md` exist so no
later phase repeats it — **check the extract before measuring anything.**


---

## I-024 · §2's ellipse is two Euler terms; the quantity that matters is one axis  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Scene graph

**Problem:** §2 presents the ellipse as `rotation.x = -0.55, rotation.z = 0.30`. Two Euler terms
in a fixed order describe *a* result, but they hide the property being chosen: **the axis you tilt
about is the axis the ellipse keeps**, and everything perpendicular to it foreshortens by that
angle's cosine. Reasoning about the shape through two coupled terms is guesswork.

Measured, the specced pair gives an ellipse squashed to 0.85 of its width and rolled 17°. tonik's
is nearer 0.65 rolled ~51°, with the long axis running lower-left to upper-right — the diagonal
that points away from the headline.

**Impact:** Following §2 puts the object's long axis across the copy instead of away from it.

**Resolved:** phase 02. One `setFromAxisAngle` about an in-plane axis, so the two things being
chosen — which diagonal stretches, and how much it foreshortens — are each one number. Fitted to
their capture: 51° off horizontal at 0.76 rad. Sayandeep asked for the stretched ends at top-right
and bottom-left, which is what that axis gives.

---

## I-025 · §2's parallax curves detach a housed mechanism  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Mouse parallax

**Problem:** §2's recovered curves drive the ring `±0.2 rad` and the mark `−0.1 → +0.5` as two
independent objects, and the whole point is that the mark outruns its frame by 1.5×.

That is correct for tonik and wrong for us. **Their glyph floats free inside their ring**, so a
large differential costs them nothing. Ours is a mechanism: the blades are housed in the barrel's
bore. Applying the same differential rotated the blades relative to the barrel on a shared axis
and slid them straight out of it — the object visibly lost its teeth the moment the pointer moved,
which is exactly how Sayandeep described it.

**Impact:** The headline interaction of the phase, broken in the way most likely to be noticed.

**Resolved:** phase 02, by moving the differential to the axis where it is mechanically true. The
housing tips as one object; the blades **actuate about the bore's own axis**, which is what a real
iris does and which sweeps them *within* the housing. The mechanism still answers at two rates and
can no longer come apart.

`verify:motion` asserts the invariant rather than the numbers: the furthest any blade vertex sits
from the bore axis is **1.930 against a barrel of 2.0, and constant to six decimal places** at
every pointer position. A rotation about the bore axis cannot change a radius, so this is a
property of the structure and not of the tuning. See D-014.

---

## I-026 · An idle spin about world Y collapses an annulus  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Motion

**Problem:** §2 spins the assembly on `rotation.y`. That is right for tonik — their object is a
torus with a glyph floating inside it and it reads from any angle.

Ours is an annulus. **Rotating an annulus about an axis lying in its own plane sweeps it through
edge-on twice a revolution**: the silhouette collapses to a line, the ellipse the entire
presentation is built on stops existing, and the composition under the headline changes as it
turns.

**Impact:** The object was unrecognisable for part of every revolution, and the framing measured
against tonik's held only at the instant of capture.

**Resolved:** phase 02. Everything that turns idly turns about the **bore axis** — the idle drift,
the mobile scroll drive and the reduced-motion pose. The silhouette is then invariant and what you
see turning is the grain and the six blades: a lens barrel idling in its mount.

§2's mobile range (`−0.525 → −1.5`) is unchanged; only the axis it is applied to.

---

## I-027 · §2 has no specular term, so the material cannot glint  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Material

**Problem:** §2 gives a lambert body, a fresnel rim and a grain. There is **no specular term at
all**. Rendered literally the object has nothing that can catch a light — a matte shape with a
soft edge — against a reference capture covered in bright flecks along its lit arc.

Sayandeep put it plainly: *"they have a lighting and shader … ours dont"*. He was right, and the
spec is why.

**Impact:** The single largest gap between our object and theirs. Everything else was geometry;
this was the surface.

**Resolved:** phase 02. A Blinn-Phong term driven by the key light, with **the grain modulating
both its spread and its strength** — a rougher patch scatters wider and a proud one catches more.
That is also what makes the grain visible at all: I-021 had already wired roughness into the
fresnel, and the specular is where it actually reads.

The range needed care as much as the strength. `mix(0.08, 2.6)` turned the surface to salt and
pepper; theirs is a fine even tooth with a highlight riding on it, which is a narrower range at a
higher base. Settled at `mix(0.3, 1.85)` with `uSpecular` 2.4.

**Standing difference, accepted:** theirs still glitters harder. Theirs is a baked map with real
specular detail; ours is procedural and reads finer. Pushing further means inventing surface
detail §2 does not describe rather than lighting the surface it does.

---

## I-028 · §2's load-in is correct and illegible  🟢

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Motion

**Problem:** §2's load-in is `scale 0.85 → 1`, `opacity 0 → 1`, `1.2s power3.out`. Sayandeep said
the object arrived rather than grew.

It was **running correctly**, which is worth stating — the first instinct was that the tween was
broken. Sampled: 0.919 at 10ms, 0.985 at 380ms, settled by 880ms. The problem is that 0.85 → 1 is
a 15% move and `power3.out` spends around 60% of its travel in the first fifth of its duration, so
the visible entrance is roughly 250ms of a 15% grow.

**Impact:** The phase's one piece of choreography, invisible.

**Resolved:** phase 02. `0.55` over `1.6s` on `power2.out` — still an ease-out, still settling
rather than stopping, with a tail long enough to read. Re-sampled: 0.700 at 19ms, 0.880 at 381ms,
still climbing at 880ms.

Measuring before changing is the point here. A correct implementation of an illegible value looks
exactly like a broken implementation of a good one, and only the numbers tell them apart.

---

## I-029 · §2's idle spin contradicts itself  🟡

**Found:** phase 02, 2026-08-26 · **Area:** `50-brand-and-3d.md` §2 Motion

**Problem:** §2 gives the idle rotation as `group.rotation.y += 0.0022` per frame and describes it
as **"~7.5s per revolution"**. Those are not the same motion.

`0.0022 rad/frame × 60fps = 0.132 rad/s`, and `2π / 0.132` is **47.6 seconds** per revolution. A
revolution in 7.5s needs `0.014 rad/frame` — six times faster. One of the two is a typo and the
spec does not say which.

**Impact:** Either reading is defensible from the document, and they look completely different.

**Workaround:** Neither is used. Sayandeep asked for the rotation stopped or *"wayy slower"*, so
it is **0.02 rad/s** — about five minutes per revolution, imperceptible frame to frame while
leaving the object never quite the same twice. `IDLE_SPIN_PER_SECOND = 0` gives a dead-still
object and nothing else depends on it.

**Needs:** Nothing blocking. If the hero is ever re-specced, resolve which of the two §2 meant and
write one of them down.

---

## I-031 · `--t-h2` at 5rem may not exist on tonik  🟡

**Found:** phase 03, 2026-08-26 · **Area:** `10-design-system.md` §3, `app/styles/tokens.css`

**Problem:** Our type scale has `--t-h2: 5rem / 5rem`. The extractor's type pass finds no 5rem step
anywhere on tonik's homepage. Their rendered scale is 6.25rem (one use, the CTA heading), 6rem
(h1), 2rem, 1.5rem, 1rem, 0.75rem, 0.625rem and 0.5rem — **nothing at all between 2 and 6.**

The case phase 3 hit: `30-page-specs.md` §2's scrubbed section heading. Their equivalent is
`t-heading-3-rg` — 32.9px on 41.125px leading at a 16.45 root, which is 2rem / 2.5rem, our
`--t-h3`. Not an h2.

Same shape of finding as the note in `03-tonik-extract.md` about `--t-label-big` at 0.875rem, which
is also absent from their site.

**Impact:** Anything set in `--t-h2` is set in a step tonik does not use. `<RevealText>` takes an
explicit `scale` prop and phase 3 passes `h3`, so the homepage is right — but `30-page-specs.md` §5
specifies `--t-h2` for the culture heading, and §4's CTA heading is separately specced at 6rem.

**Workaround:** None needed yet. Phase 3 used the measured value and did not touch the token.

**Needs:** **Phase 5.** It builds the culture section and the CTA block, which are the two places
`--t-h2` is actually called for. Measure both against tonik before using the token; if neither
wants 5rem, the step is an invention and should be removed rather than left as a trap.

---

## I-032 · `--grid-gap` and `--col` were both wrong — fixed  🟢

**Found:** phase 03, 2026-08-26 · **Area:** `app/styles/tokens.css` · **Resolved:** phase 03

**Problem:** Two errors in the layout tokens, found together while measuring the reveal's box.

`tokens.css` described the grid as *"Ours, not theirs — tonik has no formal grid class, but every
one of their layouts resolves to twelfths of `--content`."* Half right, and wrong in the half that
matters. They have no grid *class*; they have a grid *system*, and it is uniform:

| their element | tracks | column gap |
|---|---|---|
| `home-projects_title-part` | `4fr 7fr 1fr` | 1.25rem |
| `home-projects_grid` | `12 x 1fr` | 1.25rem |
| `services_grid` | `1fr 10fr 1fr` | 1.25rem |
| `culture_grid` | `12 x 1fr` | 1.25rem |
| `blogs_cms-list` | `4fr 4fr 4fr` | 1.25rem |
| `footer_content-grid` | `6fr 4fr 2fr` | 1.25rem |
| `project-item_table-item` | `6fr 6fr` | **0.75rem** |
| `service-item_body-content` | `8fr 4fr` | 0 |

1. **`--grid-gap` was `1.5rem`.** Theirs is `1.25rem` — 20.5625px at a 16.45 root, in every section
   grid on the page. There is a second, tighter gap of `0.75rem` used inside card and table rows,
   which we had no token for at all.
2. **`--col` was a twelfth of `--content`** (the viewport minus gutters). Their grids are children
   of `.container-large`, so a column is a twelfth of **80rem**. This is I-030 again, in a
   different variable, one phase later: the container caps the measure and the gutter does not.

**Impact:** Every multi-column layout from phase 4 onward would have been built on a gap 20% too
wide and a column about 9px too narrow at 1512, widening with the viewport.

**Resolved:** phase 03. `--grid-gap: 1.25rem`, `--grid-gap-tight: 0.75rem` added, `--col` computed
off `--container-large`. `verify:tokens` asserts all three (137/137). `tools/extract/tonik.mjs`
grew a section 7 pass that resolves every grid's used track widths back into twelfths, so the rule
is recorded rather than re-derived — and a section 8 pass that reads their scrubbed reveals.

**One trap worth carrying into phase 4.** `4fr 7fr 1fr` is **not** the same as a 12-column grid
with `grid-column: 5 / 12`. Both put the element's left edge on x=543.5 at 1512; the spanning
version is 759px wide against their 743.67, because seven spanned columns swallow six internal gaps
that a single 7fr track does not have. Same left edge, wrong measure.

---

## I-033 · The showreel's reel is a placeholder  🟡

**Found:** phase 03, 2026-08-26 · **Area:** `lib/content/site.ts`, `public/media/`

**Problem:** `SHOWREEL.srcWebm` points at `/media/showreel-placeholder.webm` — eight seconds of our
own hero with the pointer moving across it, baked by `npm run showreel:placeholder`. It is not a
showreel of our work, because none of our work has been captured yet.

**Impact:** Anyone who opens the panel sees the site they are already on. The panel says so on
screen — `PLACEHOLDER REEL — REAL FOOTAGE LANDS WITH THE CASE STUDIES` — so it is disclosed rather
than passed off, but it is still a placeholder on a public surface.

**Why it is there rather than absent:** see D-020. Short version: section 15's Flip is the only one
on the site, its correctness is a claim about where a DOM node lands, and with no file the
choreography never runs and cannot be verified. Building it blind and calling it done is what
protocol section 6 exists to prevent — and driving it against a real file immediately found two
defects.

**Workaround:** The honest branch is one constant away. With `SHOWREEL.src` and `.srcWebm` both
empty, `<PlaySquare>` renders a `<span>` with `aria-hidden` and no handler, exactly as it did in
phase 2, and the behaviour check reports that state as a pass.

**Needs:** **Phase 10, T10.2.** Replace the file with real interaction footage, in mp4 *and* webm,
and set `SHOWREEL.isPlaceholder` to `false`. No component changes.

**⚠️ Updated 2026-08-26 — the brief changed.** Sayandeep: the shipped reel should be *"our own
original team members video showcasing ourselves"*, not work footage. That is a different thing
from what T10.2 was scoped to produce, and it needs **filming** rather than capturing — so it
cannot be generated by a script and is not something this build can close on its own. Recorded here
so it is not quietly forgotten behind a placeholder that technically works.

---

## I-034 · The JS budget has 7.7KB left  🟠

**Found:** phase 03, 2026-08-26 · **Area:** `tools/verify/budget.config.ts`, D-013

**Problem:** `/` measures **312.3KB of 320KB** transferred JS after phase 3, up from 303.7KB. Phase
3 spent 8.6KB on `split-type`, the stack wall, the works section and the showreel's own code. The
dynamic imports worked as intended: `verify:budget` confirms `plyr` and `three` are both absent
from the eagerly-loaded bundle.

**Impact:** Phases 4, 5 and 7 all add code to routes that share this ceiling, and phase 7 wants
**Embla** (about 10KB), which does not fit. Phase 11's Matter is dynamic and behind an
IntersectionObserver, so it should not count.

**Workaround:** None yet. The rule that protects what is left still holds: a library used by one
interaction loads when that interaction first happens, not at import time.

**Needs:** **Phase 7, and possibly earlier.** D-013 raised this ceiling once, from a 190 that was
never a measurement, and the standard it set is the standard for raising it again: **measure, then
put it to Sayandeep — do not edit the number.** Before asking, check whether Embla is needed at
all: section 17's mobile ServiceNav carousel is a horizontal snap list, and `scroll-snap-type: x
mandatory` is CSS.


---

## I-035 · The work cards have no posters  🟡

**Found:** phase 04, 2026-08-26 · **Area:** `content/works/*.ts`, `components/works/WorkCover.tsx`

**Problem:** Every work's `card.poster` is `''`. `01-PHASES.md` T10.1 captures the eight live
deploys and T10.5 generates per-work shader covers; both are phase 10.

**Impact:** None on the layout, and that is the point of how it was handled. Each card draws a
**deterministic generated cover** from its own accent — seeded off the slug with an FNV-1a hash and
a Lehmer LCG, so there is no `Math.random`, the server and the client agree, and a screenshot diff
is stable between runs.

Phase 4's acceptance criteria are about composition — "hovering one card dims all eleven others",
the grid's rhythm, the mobile variant — and twelve grey rectangles cannot be judged for any of it.

The cover is deliberately **not** the aperture mark: four rings rather than six, so it never reads
as the glyph. The mark is the studio's, and putting it on twelve cards would make the grid look
like twelve pieces of our branding rather than twelve pieces of work.

**Workaround:** In place and working. `WorkCard` prefers `card.poster` whenever it is non-empty.

**Needs:** **Phase 10, T10.1 and T10.5.** Set `card.poster` per work; no component changes. ReIN
Bot has no imagery in its repo at all and T10.3 marks it a priority.

---

## I-036 · §5's works grid is "two independent columns". Theirs is not.  🟢

**Found:** phase 04, 2026-08-26 · **Area:** `20-components-and-motion.md` §5 · **Resolved:** phase 04

**Problem:** §5 opens with "Two independent columns, each an ordinary block flow" and gives the
parallax as two selectors, `.works__col:nth-child(2n+1)` at -8% and `2n+2` at -10%.

Their DOM is a single **twelve-column CSS grid** — `repeat(12, 90.8125px)` on a `20.5625px` gap at
1512 — and every cell carries an explicit placement:

```
8 / 13   7 / 13   1 / 7   1 / 6   1 / 9   9 / 13
```

Two block columns cannot produce that. An eight-column card at `1 / 9` crosses the middle of the
grid, and their DOM order is right-card-first in two of the rows, so placement is authored rather
than flowed. They also split it into three separate grids (`is-1`, `is-2`, `is-3`) so row heights
do not couple down the whole section.

**§5's motion half is correct**, and the measurement confirms it: at one scroll position their
row-1 pair both sat at `translateY(-41.29)` while their row-3 pair sat at `-18.42` and `-23.03` — a
ratio of 0.80, which is exactly -8% against -10%. The rate is carried by an `is-N` class on each
**cell**, not by a column.

**Impact:** Building the described structure would have made the layout impossible and the parallax
subtly wrong — a rate attached to a column applies the same drift to a card at the top of the
viewport and one at the bottom.

**Resolved:** phase 04. A twelve-column grid with `WORKS_LAYOUT` in `lib/content/works.ts` carrying
each card's `column`, `row` and `parallax`. The rate is per cell.

---

## I-037 · §8's spec table is `4fr 8fr`. Theirs is `1fr 1fr`.  🟡

**Found:** phase 04, 2026-08-26 · **Area:** `20-components-and-motion.md` §8

**Problem:** §8 gives `.spec { display: grid; grid-template-columns: 4fr 8fr }`. Their
`project-item_table-item` computes to **`1fr 1fr`**, with a `12.3375px` column gap — 0.75rem, the
*tight* gap, not the 1.25rem section gap — `padding: 0 0 0.5rem`, and a `rgba(59,59,59,.3)` bottom
hairline.

**Impact:** §8 calls this "the most reused component on the site" and names four consumers: the work
hover sheet, the case-study hero, the service hero, and the accordion's right panel. Phase 4 only
measured the first.

**Workaround:** `SpecTable` takes a `ratio` prop. `'even'` is the measured default and what the work
card uses; `'key-narrow'` is §8 as written and is currently unused. Neither reading is baked in.

**Needs:** **Phase 6** measures the case-study hero's own table, and **phase 7** the service hero's.
If all four are `1fr 1fr`, delete the prop and correct §8. If they genuinely differ, §8's claim of
"identical construction" is the thing that is wrong.

---

## I-038 · The load-more button has no cursor parallax  🟡

**Found:** phase 04, 2026-08-26 · **Area:** `20-components-and-motion.md` §21.4

**Problem:** §21.4 gives their "SEE ALL WORK" button three media layers behind it, tracking the
cursor at different depths, on **all** breakpoints. Ours is a plain `<Button>` pill.

**Impact:** One missing interaction at the foot of the works section. Nothing else depends on it.

**Workaround:** The button works and routes to `/works`.

**Needs:** **Phase 10** supplies the media the three layers are made of; the interaction itself is
cheap once there is something to put in them.

---

## I-039 · Twelve sibling-dim timelines fight each other  🟢

**Found:** phase 04, 2026-08-26 · **Area:** `20-components-and-motion.md` §5 vs §21.1 · **Resolved:** phase 04

**Problem:** §5's `[src]` builds the sibling-dim into each card's own paused hover timeline. With
two items that is fine. With twelve, sliding the pointer from one card to the next fires
`mouseleave` on the first and `mouseenter` on the second in the same turn — so card A's reverse
drives every sibling back to 1 while card B's play drives every sibling to `.3`, on the same ten
elements, for 400ms, with neither timeline aware of the other.

**§21.1 already said not to do this**, in as many words: "Treat this as one shared primitive,
`useSiblingDim(0.3)`, not three implementations." Phase 1 built the primitive for the footer. Phase
4 is where the instruction earns itself.

**Impact:** A visible flicker across the grid whenever the pointer moves between cards — which is
most of the time anyone is using it.

**Resolved:** phase 04. The dim lives once, on the grid, through `useSiblingDim`, plus
`overwrite: 'auto'` on both of its tweens so the tween that starts later kills the conflicting one.
The later event is the newer intent, and that is the right answer.

---

## I-040 · The contact address is at a different domain from the site  🟠

**Found:** phase 04, 2026-08-26 · **Area:** `lib/content/site.ts`

**Problem:** Two decisions from Sayandeep on the same day do not agree on a domain:

| | |
|---|---|
| `SITE.url` | `https://nofilter.studio` |
| `CONTACT.email` | `support@nofilter.com` |

**Impact:** Three things, in rising order of cost.

1. A visitor reading `support@nofilter.com` in the footer of `nofilter.studio` reads it as a typo.
2. The contact form composes a `mailto:` to it. Mail to an unowned domain **bounces silently** —
   the sender's client reports success and nobody ever receives it. This is the failure mode that
   costs real enquiries.
3. Phase 12's structured data will emit both, and a search engine treats mismatched identity
   signals as exactly that.

A `.com` for mail alongside a `.studio` for the site is a perfectly normal arrangement, so this may
well be deliberate — but it only works if **both** domains are registered and `nofilter.com` has MX
records pointing somewhere real.

**Workaround:** None. The address is live in the footer and in the form.

**Needs:** **Sayandeep, before launch (phase 12, T12.8).** Confirm `nofilter.com` is owned and
receiving mail. If it is not, the address should be `support@nofilter.studio`, which is one
constant.

---

## I-041 · A failed dynamic import used to be permanent  🟢

**Found:** phase 04, 2026-08-26 · **Area:** `components/motion/Showreel.tsx` · **Resolved:** phase 04

**Problem:** Reported by Sayandeep from the running dev server:

```
Runtime ChunkLoadError
Loading chunk _app-pages-browser_node_modules_gsap_Flip_js failed.
  at ShowreelProvider.useCallback[prefetch]
```

Two faults, both invisible until the network does something other than succeed.

1. `libsRef.current ??= import('gsap/Flip')` **caches the rejected promise**. `??=` never
   reassigns, so every later hover and every click re-awaits the same failure: the button is dead
   for the rest of the session and only a reload fixes it.
2. Nothing caught the rejection, so it surfaced as an unhandled error in Next's dev overlay — from
   a *prefetch*, which is best-effort by definition and should never be able to interrupt anyone.

The trigger was mundane: a dev server whose chunks had been rebuilt under a page that was still
open. On a deploy it is a visitor holding a tab open across a release.

**Resolved:** phase 04. `loadFlip()` clears the ref in a `catch` and re-throws, so the next attempt
is a real retry and `open()` can still tell "loaded" from "did not". `prefetch()` swallows failures
silently. And `open()`/`close()` gained a no-Flip path — shared with the reduced-motion branch — so
a missing 5KB plugin costs the flourish rather than the feature.


---

## I-042 · The culture collage has no photographs  🟠

**Found:** phase 05, 2026-08-26 · **Area:** `lib/content/site.ts` `CULTURE`, `components/motion/CultureCollage.tsx`

**Problem:** `30-page-specs.md` §5 gives the culture section a scatter of 6–8 photographs with mono
captions — "workspace, screens, process shots, conference/meetup photos". We have none. T10.4
imports the real imagery.

**Impact:** It is the weakest section on the homepage, and it is 2050px of it. §12 already rates the
composition **our lowest-confidence layout on the site (7/10)** — "the motion is exact but the
composition is a design act we perform ourselves" — and the motion half is genuinely done: every
frame's overlay wipes from full width to 0 on scroll, two of the six carry the −20% parallax, and
both are asserted.

**Workaround:** Each frame draws a deterministic neutral field seeded off its own caption, with a
hairline border. Two things about that are deliberate:

- **Not accent-tinted.** The works grid uses accent fields to mean *this is a project*; reusing them
  here would say these are projects too.
- **Bordered.** The first build ran the gradient down to `--black`, which on a `#212121` page is
  eleven values of difference and effectively invisible — six frames that read as gaps rather than
  as frames. An empty frame that announces itself is a placeholder; an invisible one is an accident.

The section also came out **2748px against tonik's 1781** on the first build — three portrait frames
stacked, each 670px on its own. One portrait frame now, and 2050. Still over, and left there: six
frames is our composition, and matching their pixel count would mean matching a photo arrangement we
do not have.

**Needs:** **Phase 10, T10.4.** Real imagery, then re-judge the composition — it is the one section
where the arrangement cannot be settled until the content exists. Consider dropping the hairline if
the photographs bleed better without it.

---

## I-043 · Four harness checks were relying on the loader being 600ms  🟢

**Found:** phase 05, 2026-08-26 · **Area:** `tools/verify/` · **Resolved:** phase 05

**Problem:** D-028 gave the loader a mark animation on first paint, taking it from ~0.6s to ~1.3s.
Four checks failed at once, and **all four were already wrong** — the change did not break them, it
revealed them.

| Failure | What it actually was |
|---|---|
| `<div class="loader"> intercepts pointer events` | every check that hovers or clicks early had an implicit race with the loader |
| Visual shots of a covered page | `visual.ts` slept 900ms and called it settled |
| `ScrollTrigger count returns to baseline — expected 0, got 36` | the baseline was read before any trigger existed, and four equal reads of `0` in 800ms looked settled |
| `no rAF loop outside the GSAP ticker — got at next (eval at evaluate…)` | **the good one.** See below |

**The rAF one is worth reading.** `readMotionState` used `page.waitForFunction`, which **polls on
requestAnimationFrame by default** and therefore installs a self-rescheduling rAF loop *in the
page*. `motion.ts` counts persistent rAF loops to enforce CLAUDE.md's "one animation loop" rule —
so the helper was failing the check twenty lines below it.

It had always been fragile and had never failed, for two reasons that both stopped holding in phase
5: the non-reduced block reads the rAF probe *before* calling `readMotionState`, and `__MOTION__`
used to appear fast enough that the poller resolved on its first tick, under the five-tick threshold
that separates a real driver from an incidental reschedule. Delaying the provider's first publish
pushed it over.

The failure names an anonymous frame inside `eval at evaluate`, which points at nothing you can
grep for. That is the shape of every bug in this class.

**Resolved:** phase 05.

- `waitForLoaderGone(page)` in `lib/browser.ts`, used by every check that interacts. It polls with
  `page.evaluate` from the **Node** side rather than `waitForFunction`, precisely so it injects
  nothing that outlives the call.
- `readMotionState` polls the same way.
- The visual harness waits for the loader instead of sleeping.
- The ScrollTrigger baseline waits for the loader and requires four equal reads rather than three.

**The durable lesson**, and it is the third time this build has learned a version of it: **when a
check fails around a timing change, suspect the check.** Phase 2 had three `networkidle` races,
phase 3 had `SCRUB_SETTLE_MS`, phase 4 had the 600ms visual settle. Every one reported a bug that
did not exist.


---

## I-044 · `curTrigger is undefined` under Fast Refresh  🟡

**Found:** phase 05, 2026-08-26 (reported by Sayandeep from the dev server)
**Area:** `components/works/WorksGrid.tsx`, `components/motion/CultureCollage.tsx`

**Problem:**

```
can't access property "end", curTrigger is undefined
  components/works/WorksGrid.tsx (76:23) @ WorksGrid.useGSAP.tweens
```

The line it names is a `gsap.to(...)` **construction**, not a refresh — which is
the clue. Constructing a ScrollTrigger makes it walk the global trigger list
backwards from its own index and read `.end` off every earlier entry
(`ScrollTrigger.js:1366`, unguarded). If that array shrinks mid-walk the read
lands on an `undefined` hole.

**What shrinks it:** a sibling `gsap.context` reverting at the same moment — and
that is exactly what **React Fast Refresh** does. Editing any file with the grid
on screen remounts components while others are still constructing triggers.

**Reproduced deliberately**, which is the only reason it is understood: a script
that edits a CSS module six times with the page open and the grid mid-scroll
fails every run. The same script against a `next build` + `next start` is clean,
as is navigating away and back in dev.

**Impact:** Development only, and it is loud — Next's error overlay covers the
page. In production, React serialises a commit's cleanups before its effects,
so the interleave does not arise; two full hammer rounds of a real production
build are clean.

**Mitigated:** phase 05. The exposure is proportional to how many triggers exist
and how often they are constructed, so both came down — and both changes are
better code independent of the crash:

| | before | after |
|---|---|---|
| works grid parallax | 11 triggers | **1** |
| culture wipes | 6 triggers | **1** |
| culture parallax | 2 triggers | **1** |

Each is now one trigger with metrics cached on `onRefresh` and `quickSetter`
writes in `onUpdate`. Identical visually — the progress is still computed per
element from its own cached top, so each still drifts across its own passage —
and materially faster: eleven scrubbed tweens are eleven smoothing loops
fighting over one scroll value, and a `getBoundingClientRect` per element per
frame is a forced synchronous layout that this now never does.

**Needs:** Nothing blocking. If it becomes irritating in dev, the next step is
`ScrollTrigger.batch` for the twelve card reveals, which is the idiomatic API
for exactly that shape and would take the page from ~21 triggers to ~9. Left
undone because it moves the reveal out of `WorkCard` and into the grid, which is
a real restructuring for a development-only symptom.

---

## I-045 · `window.lenis` is not a Lenis in production  🟢

**Found:** phase 05, 2026-08-26 · **Area:** `components/services/ServicesAccordion.tsx` · **Resolved:** phase 05

**Problem:** The accordion's scroll-to-row read the instance off the global:

```ts
const lenis = (window as { lenis?: … }).lenis;
if (lenis && !reducedMotion) lenis.scrollTo(to, { … });
```

In production every accordion click threw:

```
TypeError: m.scrollTo is not a function
```

**Lenis sets `window.lenis = { version }` itself**, as a build stamp. In
development `MotionProvider` overwrites that global with the real instance for
the test harness, so the property is a Lenis and the guard is sound. In a
production build that assignment is compiled out — and the version object is
left in its place. Truthy, and with no `scrollTo` on it.

**Impact:** It would have shipped. Every click on a service row on the live site
would throw, and the row would open with no scroll. **Nothing in the harness
would have caught it**, because every check runs against the dev server where
the global is correct.

**Found by** hammering a real `next build` + `next start` rather than the dev
server — which is now worth doing before any deploy, and is the durable lesson
here: *a dev-only global is a production bug waiting for a truthiness check.*

**Resolved:** phase 05.

- The component takes `lenis` from `useMotion()`, which is the actual API and is
  correctly `null` under reduced motion.
- Every remaining reader — eight in the harness, one in the recorder script —
  now checks `typeof raw.scrollTo === 'function'` rather than truthiness. They
  run in dev where the global is right, but they would have hit the same trap on
  any page whose provider had not mounted yet.


---

## I-046 · `--accent` is a fill, and the spec uses it as ink  🟢

**Raised:** phase 06 · **Resolved:** phase 06

`10-design-system.md` §2 sets `--accent` to the work's **dark** accent, and the code-highlighting
spec then tunes strings to take `--accent`. Both are right on their own and wrong together:
Tessera's dark accent is `#125C91`, which is a fine tint for a panel and close to unreadable as text
on a `#212121` ground.

**Resolved** by adding a third token rather than redefining the first. `--accent-ink` is the light
member of the same pair, used wherever the accent has to be *read* — code strings, inline code, the
pull quote's rule. `--accent` stays the fill it was designed as and is still correct everywhere it is
used as one. Both, plus `--accent-ground`, are set on `<html>` by `<CaseStudy>` and removed on
unmount.

---

## I-047 · Tessera's deploy runs out of agent after two requests  🟡

**Raised:** phase 06 · **Owner:** content · **Status:** open, and disclosed in the case study

The case study's argument is that an AI agent edits the drawing as a document, and the obvious
screenshot is the agent doing exactly that. The live deploy allows **two free requests** and then
answers *"The AI agent is not configured for this deployment"* — it wants the visitor's own API key.

Both free requests were spent confirming this. The first was screenshotted mid-run at "Step 1 of 16"
because the wait loop watched a clock instead of the step counter; the second hit the limit.

**What was done instead:** the sprite on the case study was drawn by driving the real editor with
Playwright — picking a palette colour from the popover, dragging rows of cells — and the code and
ASCII panels were opened and captured the same way. The body **says so** rather than leaving a
reader to notice: *"the deploy linked below runs two free requests and then asks for your own API
key, which is the correct trade for a side project and the reason the screenshots on this page were
drawn by hand."*

**To close:** either configure a key on the deploy, or record the agent working locally and use that
as this work's case-study reel — T10.2 owes it one anyway.


---

## I-048 · The loader's exit sweep never ran, for five phases  🟢

**Raised:** phase 06 · **Resolved:** phase 06

The loader has three timelines. `enter` sweeps the panel off the incoming page,
`exit` sweeps it on over the outgoing one before the router moves, and `mark`
draws the aperture on first paint. **`exit` had never run.**

`components/chrome/Loader.tsx` delegates link clicks at the document, and it did
so in the **bubble** phase. React attaches its own listeners to the root
container, which is a descendant of `document`, so on the way up React sees a
click first — and `next/link`'s handler calls `preventDefault()` and routes
immediately. By the time the loader's listener ran, `event.defaultPrevented` was
already `true`, and its first guard sent it home. Every internal navigation on
the site was a plain `<Link>` navigation with no sweep.

**Nothing looked wrong**, which is why it survived phases 1 through 5: `enter`
fires on every pathname change, so a loader still swept *on arrival*. What was
missing was the half that happens before you leave — and `verify:motion`
asserts the shape of `loader.exit`, not that anything ever plays it.

**Found by** T6.7. The accent tint is set on the panel in that same handler, and
`behaviour.case.ts` asserts the panel's background changes when a case-study
link is clicked. It came back unset, and the tint turned out to be the first
thing that had ever depended on the handler running at all.

**Resolved** by listening in the **capture** phase and adding
`event.stopPropagation()` for anchors the loader is taking over. Capture runs
before React, so `preventDefault()` now actually suppresses the navigation —
`preventDefault` alone never could, because it stops the browser's navigation and
not React's.

`<WorkCard>`'s link gained `data-no-loader` in the same change, deliberately: it
opens the lightbox, and sweeping a full-page loader over a drawer that slides in
over the same page announces a navigation that is not happening.

**Checked in production**, not just dev: navbar link, wordmark, work card into
the drawer, case-study mini-nav, browser back, and an external link left alone.

**The durable lesson:** *a check that asserts a timeline's shape does not assert
that anything plays it.* Four of this harness's sections read registered
timelines; only `behaviour.*` drives the interface. This is the second time that
distinction has paid for itself.


---

## I-049 · The favicon was invalid XML for four phases  🟢

**Raised:** phase 06 · **Resolved:** phase 06

`app/icon.svg` opened with a generated banner comment containing the literal text `--black`.

**An XML comment may not contain a double hyphen.** The specification is unambiguous and the
consequence is total: a strict parser rejects the entire document, and every SVG parser is strict.
Browsers were not drawing a broken icon — they were drawing **no** icon, because the file never
parsed.

Sayandeep reported the favicon missing three times across phases 5 and 6. The first two fixes were
real and necessary — the tilt-as-transform squashed the stroke into a broken "C" at 16px, and the
spec's ratios are sub-pixel at that size — and both were improvements to a file nothing was reading.

Found by accident: rendering `icon.svg` through sharp to check the tilt direction, which failed with
`XML parse error: Comment must not contain '--'`.

**Resolved** in `scripts/brand-assets.mjs`. The banner is built through a `banner()` helper that
replaces any double hyphen in the comment *body* with an en dash — the delimiters are added outside
the substitution, which the first attempt at the guard got wrong and turned `<!--` into `<–`.

**The durable lesson:** *a generated file needs a check that it parses.* Three rounds of visual
fixes were applied to a document that no parser had ever accepted.

---

## I-050 · Lenis kept its scroll position across route changes  🟢

**Raised:** phase 06 · **Resolved:** phase 06

Sayandeep: *"whenever i visit a project it takes me to the no filter footer."*

Reproduced exactly. Scrolled to the bottom of `/works/tessera`, clicked "next project", landed on
`/works/co-canvas` at **scrollY 6573 of 7766** — the footer.

Next's App Router scrolls to the top on a push and restores the offset on back and forward. Neither
survives Lenis, which holds its own `animatedScroll` and writes it to the window on every tick of the
GSAP ticker — so whatever the router sets is overwritten on the next frame by a number left over from
the previous page, clamped to the new page's height.

**Resolved** by `components/chrome/ScrollReset.tsx`, and the fix is one rule rather than two.
Whatever the router just did is right — 0 for a push, the remembered offset for a pop — so the
component reads `window.scrollY` back one frame later and tells Lenis to go there. It never needs to
know which kind of navigation it was.

Asserted both directions in `behaviour.case.ts`: leaving the grid at 1618px lands at **0px** on the
case study, and going back restores **1618px**.

---

## I-051 · `curTrigger is undefined`, and this time the cause  🟢

**Raised:** phases 05 and 06 · **Resolved:** phase 06

Reported three times, always naming `WorksGrid.tsx` and the line where it calls
`ScrollTrigger.create()`. Phase 5 removed four `ScrollTrigger.refresh()` calls from cleanups and
consolidated eleven triggers into one, which reduced it to a Fast-Refresh-only symptom and was
recorded as such. It came back.

**The cause is a double free, and it was in almost every animated component on the site.**

The pattern was: create `gsap.matchMedia()` inside `useGSAP`, return a cleanup from `mm.add()` that
kills what it made, and then *also* `return () => mm.revert()` from the `useGSAP` callback.

`useGSAP` reverts its own context on unmount, and a matchMedia created inside that context is
reverted **with** it — running every `mm.add()` cleanup exactly once. The explicit `mm.revert()`
made it happen twice. A second `ScrollTrigger.kill()` on an instance already removed from
`_triggers` splices the array a second time, taking out a *different* trigger and leaving a hole.

`_triggers` is what `ScrollTrigger.create()` walks. So the throw surfaced in whichever component
happened to be constructing a trigger at that moment — which is why `WorksGrid` kept being named by
a bug it did not cause.

**Resolved** by deleting every explicit `mm.revert()` inside a `useGSAP` callback, and every
`kill()` of an object the context already owns, across `WorksGrid`, `CaseBoard`, `CustomCursor`,
`Hero3D`, `StackWall`, `CultureCollage`, `RevealText`, `Schematic` and `ServicesAccordion`.

What stayed: `gsap.set(..., { clearProps: 'transform' })` for `quickSetter` writes, which GSAP is
not recording; `document.removeEventListener` and `gsap.ticker.remove`; and one `refresh.kill()` on
a `delayedCall`, because a delayed refresh that outlives its component fires at nothing — and killing
a tween twice is harmless where killing a ScrollTrigger twice is not.

**Verified by the harness rather than by hope:** `ScrollTrigger count returns to baseline after route
changes` still passes at 22, so the context genuinely owns them and this is not a leak traded for a
crash.

**The durable lesson:** *inside `useGSAP`, cleaning up is the default, not your job.* Every manual
revert of something the context owns is a double free waiting for a component to be unmounted at the
wrong moment.

---

## I-052 · A seeded generator passed as a prop is not deterministic  🟢

**Raised:** phase 06 · **Resolved:** phase 06

`<Artwork>` was built to be deterministic precisely so it could be server-rendered — and its first
render produced a hydration mismatch: **177 rects on the server, 271 in the browser.**

The seeding was fine. The mistake was creating one `random` closure in the parent and passing it to
`<Mosaic>` and then to `<Rule>`. A generator created during render is **mutable state in a render
function**, React renders components twice in development, and it does not guarantee that a parent
and its children re-render together — so the second call to a child continued the sequence instead
of restarting it.

**Resolved** by deriving a seed per motif — `${seed}:mosaic` — and building the generator inside the
component that consumes it. One hash each, and a motif rendered any number of times in any order
draws the same picture.

**The durable lesson:** *deterministic seeding does not survive a shared, stateful consumer.* If it
can be called twice, it must not remember.


---

## I-053 · `Math.cos` is not the same number in Node and the browser  🟢

**Raised:** phase 07 · **Resolved:** phase 07

`<Artwork>`'s `iris` and `orbit` motifs are built from trigonometry, and they hydrated with an
attribute mismatch — `123.45600000000002` on one side against `123.456` on the other.

`Math.cos` and `Math.sin` are **implementation-defined** in ECMAScript: the standard requires them
to be close, not identical. The Node process that server-renders a page and the browser that
hydrates it can therefore disagree in the last bit, and React compares attributes as strings.

**Resolved** by rounding every emitted coordinate to two decimal places, which on a 1600-unit canvas
is well under a device pixel at any size these are drawn.

Worth separating from I-052, which looked like the same bug and was not: that one was a *count*
mismatch from a shared mutable generator, this one is an *attribute* mismatch from floating point.
Fixing the first did not fix the second, and it was only by diffing the server HTML against the
hydrated DOM twice that the two came apart.

---

## I-054 · Four nav links had nowhere to go  🟡

**Raised:** phase 07 · **Status:** partly resolved

An enumeration of every internal `href` on the site against its status code found nine 404s.

**Resolved in phase 7:** `/works`, `/services`, `/services/[slug]` ×5, `/industries/[slug]` ×5 and
`/privacy`. `/services` and `/privacy` are not in `30-page-specs.md` at all — the first because the
spec assumes a nav that points elsewhere (D-039), the second because the footer links to it and a
privacy link that 404s is the specific kind of broken that people notice.

**Still open:** `/about` (phase 8) and `/blog` plus `/blog/[slug]` (phase 9). The `/404` page from
D-031 catches them and says which sections are still being built, so nothing reads as broken — but
they are links to nothing and they are in the navbar.

**Worth keeping:** the enumeration itself. Walking the rendered DOM for `a[href^="/"]` and fetching
each one is four lines and it found every gap at once. Phase 12 should run it again.

---

## I-055 · The privacy page has to stay true  🟡

**Raised:** phase 07 · **Owner:** whoever adds the next third-party script

`/privacy` says this site sets no cookies, runs no analytics, has no accounts and posts no forms —
because that is true of it as built. The contact panel composes a `mailto:` and nothing leaves the
browser until the visitor sends it.

**That page is a claim, and it is only worth making because it is checkable.** Adding a form
provider, an analytics tag, an embedded player or a session cookie makes it false. Anyone doing that
changes `app/privacy/page.tsx` in the same commit.


---

## I-056 · The blog has no dates, deliberately  🟡

**Raised:** phase 09 · **Owner:** content

`30-page-specs.md` §`/blog/[slug]` asks the post hero for a date. `40-content-model.md` §5 does not
carry one, and the posts were written this week.

**No date is shown.** Inventing publication dates is the one kind of lie this site cannot afford —
everything else on it is checkable, and a fabricated timeline would be the first thing to fall over
if anyone looked.

The **reading time is real**: derived from the body's own word count at two hundred words a minute,
not the `readingTime` field in the metadata, which was an estimate typed by hand.

**To close:** add a real `publishedAt` when the posts are actually published, and put it back in the
hero. Until then the absence is correct.


---

## I-057 · Thirteen headless browsers, one pinned GPU  🟢

**Raised:** phase 09 · **Resolved:** phase 09

Sayandeep: *"why is node.exe using 100% of my gpu1 .. gpu 1 is getting fried."*

**It was not node.** Node has no renderer and never touches a GPU. It was
thirteen leaked Playwright Chromium processes, and Task Manager attributes a
child's GPU time upward to the parent that spawned it.

They leaked from the capture scripts. Every one followed the same shape —
`chromium.launch()` at the top, `browser.close()` at the bottom, and a hundred
lines that can throw in between. When one did (a dead deploy, a moved selector,
a bad crop region), the script died and the browser did not.

**On this project that is not a tidy-up issue.** The pages these scripts open run
a Three.js hero with a `requestAnimationFrame` loop, so a leaked headless
Chromium is not an idle process — it is a process rendering WebGL forever.
Thirteen of them saturated a discrete GPU.

**Resolved** by `scripts/lib/browser.mjs`. `launchGuarded()` registers handlers
for the three ways these scripts actually end badly — an unhandled rejection
(top-level `await` with no `try`), an uncaught exception, and Ctrl-C — and closes
the browser before exiting on any of them. Playwright cleans up after a
*graceful* exit on its own; these are the paths where it never gets the chance.

`tools/verify/run.ts` already had `finally { await browser.close() }` and was
never the source.

**For the record**, since it will be asked again: the binaries that do the GPU
work are

```
G:\CDriveOffload\ms-playwright\branded\chrome\win64-152.0.7977.42\chrome-win64\chrome.exe
G:\CDriveOffload\ms-playwright\chromium-1223\chrome-win64\chrome.exe
G:\CDriveOffload\ms-playwright\chromium-1234\chrome-win64\chrome.exe
```

and `node.exe` (`D:
odejs
ode.exe`) is not one of them. A Windows graphics
preference set on node does nothing.

**The durable lesson:** *a script that opens a browser owns closing it on every
path out, not just the happy one* — and on a site with a render loop, a leaked
browser costs power rather than memory.


---

## I-058 · Navigating home from a scrolled page left the homepage with no ScrollTriggers  🟢

**Raised:** phase 09 · **Resolved:** phase 09

Sayandeep: *"getting error while trying go back to home page from work pages."*

```
TypeError: Cannot read properties of undefined (reading 'end')
    at ScrollTrigger.refresh  (x8, recursing)
    at ScrollTrigger.create   <- WorksGrid, mounting the homepage
```

The same message as I-051 and **a different cause**, which is worth saying
plainly: fixing the double free did not fix this, and the shared symptom sent
the first investigation to the wrong place twice.

**What was actually happening.** Instrumenting `ScrollTrigger.create` showed
every homepage trigger being constructed at `scrollY = 6551` — the *outgoing*
page's scroll position. `<ScrollReset>` corrected it in a `useEffect` plus a
`requestAnimationFrame`; the page's own triggers are built in a **layout**
effect, before paint, and therefore before that rAF ever ran.

At that scroll, every `once: true` reveal on the homepage evaluates as already
passed. Creating one trigger makes ScrollTrigger recursively refresh the others
(`ScrollTrigger.js:1372`), and each `once` trigger that fires during the cascade
**kills itself** — splicing `_triggers` while an outer loop walks it by index.
The next read is a hole.

**The damage was not the console line.** The exception aborted `WorksGrid`'s
`useGSAP`, so the homepage ended up with **zero** ScrollTriggers: no parallax, no
reveals, until a reload. Measured before and after — 0, then 22.

**Resolved** by moving the correction into a layout effect that runs
synchronously, before any page component builds a trigger. `<ScrollReset>` is
rendered in the root layout ahead of `<main>`, and React runs sibling layout
effects in order.

That costs the trick the first version was proud of — reading `window.scrollY`
back and letting the router's own decision stand for both push and pop. Running
earlier means the router has not decided yet, so it now tracks `popstate` and
branches: **push** goes to the top immediately, **pop** lets the browser restore
and only syncs Lenis a frame later. Back-navigation never hit the crash anyway,
because the position it restores is the one the page was built for.

**The durable lesson:** *a correction that runs after the thing it corrects for
is not a fix, it is a repaint.* The first version made the symptom Sayandeep
reported go away and left a worse one behind it.

---

## I-059 · The native pointer stays visible under the custom cursor  🟢

**Raised:** phase 09 · **Resolved:** phase 09

Sayandeep: *"when the mouse is on those cards the cursor should disappear and
that circle becomes the new cursor .. u leave the card the cursor comes back."*

`<CustomCursor>` drew its disc over the arrow rather than instead of it, which
is the difference between a decoration and a cursor.

**Resolved** with `cursor: none` on `[data-cursor]` and its descendants, scoped
to the target rather than set on the document — so the pointer returns the
instant it leaves, and nothing can strand a visitor whose pointer ends up
somewhere the component is not running.

It lives in `app/styles/global.css`, not in `CustomCursor.module.css`, and the
build insisted: a CSS Module refuses a selector with no local class in it
(*"pure selectors must contain at least one local class or id"*). That refusal
is correct — a rule matching `[data-cursor]` anywhere on the site should be
visible in the global sheet rather than hidden inside one component's.

Gated to desktop width, a fine pointer, and no reduced-motion preference — the
same three gates as the disc. Hiding the pointer where the replacement is
switched off would leave no cursor at all.


---

## I-060 · Matter traps the page scroll, and the spec only caught half of it  🟢

**Raised:** phase 11 · **Resolved:** phase 11

`Mouse.setElement` attaches six listeners to the element it is given. Read out of
`node_modules/matter-js/build/matter.js` rather than from the docs:

```js
element.addEventListener('mousemove',  mouse.mousemove,  { passive: true });
element.addEventListener('mousedown',  mouse.mousedown,  { passive: true });
element.addEventListener('mouseup',    mouse.mouseup,    { passive: true });
element.addEventListener('wheel',      mouse.mousewheel, { passive: false });
element.addEventListener('touchmove',  mouse.mousemove,  { passive: false });
element.addEventListener('touchstart', mouse.mousedown,  { passive: false });
element.addEventListener('touchend',   mouse.mouseup,    { passive: false });
```

`70-physics-footer.md` §9 flags the **touch** three: they call `preventDefault`
and trap page scroll inside the pit.

**It does not mention `wheel`, and `wheel` is worse.** `mouse.mousewheel` calls
`event.preventDefault()` unconditionally. The pit is the last thing on the page,
so a visitor who scrolled into it could not scroll back out — in either
direction, with a wheel or a trackpad. On a laptop that is the whole page held
hostage by a footer toy.

**Resolved** by removing all four non-passive listeners after
`MouseConstraint.create`. Matter's three passive mouse handlers still drive the
drag, and on touch devices the browser's compatibility mouse events reach the
same handlers.

Asserted rather than assumed: a wheel event over the pit moves `window.scrollY`
by 418px.

**The durable lesson:** *a spec that verified most of a library's behaviour has
still only verified most of it.* §9 was right about the touch listeners and the
same paragraph would have caught the wheel one if anybody had read the whole
`setElement` body instead of the part that was already known to be a problem.
