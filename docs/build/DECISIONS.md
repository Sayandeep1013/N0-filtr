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

---

## D-007 · Animated elements carry a BEM hook class as well as their module class

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** The stack is CSS Modules, which hash every class name — `.loader__mark` compiles to
`Loader_mark__6dBzw`. But `verify:motion` identifies a tween's target by matching a substring
against the target's className, and `02-VERIFICATION.md` seeds those assertions with the spec's
names (`target: '.loader__mark'`). Behaviour checks, the visual harness's `prepare` steps and
anything a future agent types into devtools have the same problem.

**Decision:** Anything GSAP animates, anything the harness queries, and anything a JS handler
toggles carries **two** classes: the hashed module class for styling and an unhashed BEM class
for behaviour. `cx(s.mark, 'loader__mark')`. The BEM names are the spec's names, which are
tonik's names, so the DOM reads like the teardown.

Classes toggled from JS — `is-mini` — are the hook class **only**, with the module styling it
through `.nav:global(.is-mini)`. Otherwise the toggle has to know both names.

**Alternatives:** Plain global CSS for the chrome (abandons the stack decision for a quarter of
the site). Data attributes (`[data-motion="loader-mark"]`) — cleaner in principle, but the tween
serialiser reads className, so it would mean rewriting the harness to match assertions written
before this phase. Configuring Next's `localIdentName` to keep names readable (fragile, global,
and still not stable across a production build).

**Consequence:** Two class names on perhaps thirty elements. In exchange the motion assertions
work as written, the visual harness can drive real interactions by selector, and inspecting the
running site shows the same class names as `docs/research/`. The cost is discipline: a new
animated element needs its hook class or its assertion silently matches nothing.

---

## D-008 · `verify:motion` gains a behaviour layer

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** `02-VERIFICATION.md` says phase 1 owes the harness "loader, navbar mini threshold,
contact panel timeline, footer sibling-dim". Only the first and third are timeline shapes. The
phase-0 checker could assert what a registered timeline *is*; it had no way to assert what the
interface *does*.

Worse, `TimelineAssertion.reverseTimeScale` — the phase-0 mechanism for the "reverses run faster"
rule — cannot work. It calls `reverse()` on the registered timeline and reads the scale back,
which passes only if the timeline is already sitting at that scale. Every component on this site
applies the scale inside its handler, so on **correct** code it reads 1 and fails.

**Decision:** A `behaviour.ts` / `behaviour.config.ts` pair, folded into the `motion` section
rather than made a fifth check. Each check drives the real interface — scrolls, hovers, clicks,
presses Escape — and reads the DOM back. Values live in the config; the interactions are code,
because each one is genuinely bespoke.

**Alternatives:** A declarative DSL for interactions (more machinery than five checks justify).
Leaving these unverified and asserting them in prose (the failure mode the whole harness exists
to prevent). Making it a fifth report section (five sections is harder to read than four, and
these *are* motion).

**Consequence:** `verify:motion` went from ~40 to 132 assertions and takes about 40s instead of
20s. It immediately found five real problems, including one that reached users: the loader ran
its full sweep before the provider reported reduced motion. Later phases should add behaviour
checks, not just timeline shapes — a timeline can be perfectly shaped and never wired to
anything.

---

## D-009 · Two `ui/` primitives and the 2D mark are built in phase 1

**Phase:** 1 · **Date:** 2026-08-25 · **Status:** active

**Context:** Phase 1's four components need three things the phase brief assigns elsewhere.
`IconCircle` (§9) has three consumers inside this phase alone — the nav CTA, the footer social
bars, the form submit. `Button` (§9) is the nav CTA. And the loader has nothing to render
without the aperture glyph, which `50-brand-and-3d.md` §1 specifies and phase 2 approves.

**Decision:** Build all three here. §9, §21.3 and `50-brand-and-3d.md` §1 were added to phase 1's
Reading Map in `01-PHASES.md`, per protocol §2.

The mark's geometry is fully specified — a ring of stroke 1/12 the diameter, six ticks at 60°,
each 1/6 of the radius, rotated 8° off-radial — so this is transcription, not design. The
**concept** remains un-approved; `50-brand-and-3d.md` §5 makes user approval a precondition and
phase 2 is that gate. Everything brand-shaped is confined to `components/brand/`, two files.

**Alternatives:** Ad-hoc markup inside Navbar and Footer, rebuilt properly in phase 3 — which
guarantees two implementations that diverge, and would have hidden the §9 fill-overlay hover
that the re-measure found. A placeholder glyph for the loader (a square, a dot): dishonest in a
different way, and it would have to be found and replaced rather than simply approved.

**Consequence:** Phase 3 inherits `Button` and `IconCircle` working, with the §21.3 diagonal
swap and the §9 fill overlay already asserted. If phase 2's gate rejects the aperture, the
replacement is `ApertureMark.tsx` and `Wordmark.tsx` and nothing else — every consumer takes
`currentColor` and sizes from its container.

---

## D-010 · The Open Aperture is the mark; the gate was cleared with a rendered sheet

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** `50-brand-and-3d.md` §5 makes user approval a precondition for the 3D hero, and
`01-PHASES.md` marks T2.1 **"STOP. Present to user. Do not proceed without approval."** Phase 2
is a gate, so everything after T2.1 was blocked on a decision that is Sayandeep's to make —
brand is a non-technical decision under CLAUDE.md's ground rules.

Two things made the presentation unusual. The mark already existed, because phase 1 built it
under D-009 — the loader had nothing to render without a glyph. And the *concept* still needed
approving even though the *drawing* was already in three shipped components.

**Decision:** Present the mark as a published sign-off sheet rather than as a static render, and
generate every glyph on that sheet from the same four ratios `ApertureMark.tsx` uses rather than
redrawing them. The sheet is set in the project's own tokens and in the real General Sans and
IBM Plex Mono, inlined from `app/fonts/`.

Two consequences follow from generating rather than redrawing. The approved drawing and the
shipping drawing **cannot drift apart** — there is no second source. And the I-009 tick-weight
options could be rendered as live variants of one function at both 48px and 16px, so the choice
was made by eye instead of from a description.

Setting it in the real faces is not a nicety: a wordmark whose whole specification is
`General Sans 400 / -0.02em / 0.22em word gap` cannot be approved in a substitute face, and the
0.22em gap is invisible as a decision unless you can see the two words set.

**Sayandeep's answers, 2026-08-26:**

1. **The Open Aperture, approved** over the three alternates in §1.
2. **I-009 — half the ring's weight**, taking the recommendation. Resolved; written into the
   spec, which had omitted it. No code change: the provisional value was the chosen one.
3. **I-014 — the footer service icons stay placeholder until phase 10.** Phase 2 owns the brand
   and could have taken them; he chose not to spend the phase on them.

**Alternatives:** A static PNG render of the assembly, which §5 point 2 literally asks for — but
the 3D assembly does not exist yet, and rendering the 2D mark to a bitmap to approve a vector is
a worse artefact than the vector. Asking in prose with no visual, which is how a brand gets
approved by someone who cannot see it. Building the hero first and asking afterwards, which is
the failure mode the gate exists to prevent.

**Consequence:** T2.2–T2.9 are unblocked. The 3D assembly still owes its **own** sign-off — the
phase-2 acceptance criteria require a screen recording of the hero before phase 3 starts, and
that is a second gate, not the same one. The tick weight is now a specced value, so it falls
under CLAUDE.md non-negotiable §1 like any other: it may not be silently adjusted.

---

## D-011 · `NO FiLTER`, and Creative Development replaces No-Code

**Phase:** 2 · **Date:** 2026-08-26 · **Status:** active

**Context:** Two content changes from Sayandeep, both arriving after the T2.1 gate had already
cleared and neither of them a technical call. They are recorded together because they came in
one message and both are corrections to things the build had inherited rather than chosen.

### The wordmark casing

Spec §1 set the wordmark lowercase throughout, reasoning that it matched tonik's own lowercase
`tonik` and kept the mono labels doing the shouting. Sayandeep asked for `No FiLTER`
*"…something like that"* — a direction, not a final form.

**Decision:** Render four candidates and let him choose by eye rather than pick one from the
description. `NO FiLTER`, `No FiLTER`, `No Filter` and `NO FILTER`, each set in the real
General Sans 400 with the specced `0.22em` word gap, at display size and at the 1.0625rem the
navbar actually uses. **He chose `NO FiLTER`.**

Both words in caps make the lone lowercase `i` unmistakably deliberate rather than a slip — with
only `F` capitalised in `No FiLTER`, the odd letter reads as a typo. And it earns its keep: the
`i` drops a dot into a run of caps, a small void inside the letterform that rhymes with the
aperture's empty centre. The two halves of the identity now say the same thing.

**The casing is authored as literal text in `Wordmark.tsx`; `text-transform` is `none`.** Not
`uppercase` — a transform would eat the lowercase `i`, which is the entire device. That is worth
stating because `uppercase` is the reflex for a caps wordmark and it would silently destroy this
one.

**Two values were deliberately *not* changed, then measured in the same session.**
`letter-spacing: -0.02em` and the footer's `14vw` were both verified in phase 1 against the
lowercase form. Both are specced, so under CLAUDE.md non-negotiable §1 they get measured before
they get touched. Logged as **I-018**, measured immediately rather than deferred, and **both
hold** — the footer wordmark fills 82.5% of its column at 1512 and 71.6% at 390 and overflows at
neither. It grew from ~59% and ~51%, which halves the gap I-013 complains about at no cost.

**The measurement found a real overrun somewhere else: the navbar.** §4 fixes the logo box at
`4.25rem × 1.25rem` and `flex: none` reserves that width in the nav row, so the box is measured
and the face size is not — phase 1 had set `font-size: 1rem` because that is what made the
*lowercase* wordmark fill 4.25rem exactly. Caps measured **4.59rem in a 4.25rem box, an 8%
overrun into the links group.** `4.25 / 4.59 = 0.926` → `font-size: 0.925rem`, re-measured at
99.9% of the box at both 1512 and 390. One value moved and it is the fitted one, not the
measured one. This is the lesson worth carrying: **a casing change is a metrics change**, and
every box the wordmark sits in had been fitted to the old metrics.

### Service 04

The five services were transcribed from tonik, and slot 04 was **No-Code Development** — "Launch
10× faster. Conserve capital, validate early." tonik build in Webflow. This site is Next.js with
hand-written GSAP timelines, a custom GLSL material and a Matter.js floor. Offering a no-code
service line underneath that is a claim the codebase directly contradicts, and Sayandeep caught
it.

**Decision: `creative-development` / Creative Development**, chosen over Motion & Interaction,
AI Products, and dropping to four services. "The web, doing things the web isn't supposed to do."

It is the exact inverse of the slot it replaces, it is the industry's own term for WebGL, scroll
choreography and physics, and it is **evidenced rather than asserted** — its strongest portfolio
piece is the site the claim is written on. That matters here: `40-content-model.md` §3 recorded
slot 04 as having **zero** supporting works, and `30-page-specs.md` already specified a fallback
for its empty grid. One rename fixes a positioning lie and a content gap at once.

Motion & Interaction was the runner-up and reads as a discipline inside Product Design rather
than a service beside it. AI Products would have repeated slot 04's original problem — an
unevidenced service — with a more fashionable word.

**Consequence:** The slug change touches `lib/content/site.ts`, `ServiceIcon.tsx`, and four spec
files (`20` §17, `30` §/services, `40` §3, `01-PHASES` phase 7). Done in this commit, before
phase 7 builds five pages against the old name.

The service icon was re-keyed and **redrawn**: the old glyph was stacked blocks clicking
together, a no-code metaphor that means nothing under the new name. It is a wireframe cube now.
Still placeholder art like the other four — I-014 stands, and phase 10 still owns the set.

`docs/research/02-content-inventory.md` is left untouched. It records "No-Code Development —
nothing; no Webflow/no-code work exists", which is the evidence trail that led to this decision.
Research files are snapshots of what was found; rewriting them to match a later choice would
destroy the reasoning.
