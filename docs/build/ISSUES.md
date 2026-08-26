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
