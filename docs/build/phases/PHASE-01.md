# Phase 01 — Global chrome

**Branch:** `phase/01-chrome` · **Started:** 2026-08-25 · **Completed:** 2026-08-25
**Sessions:** 1 · **Model:** Opus · **Final commit:** `83ff9ae` · **Tag:** `phase-01-complete`

> Permanent record. Not overwritten. One file per phase in `docs/build/phases/`.

---

## Plan

Build the four global components — Loader, Navbar, ContactPanel, Footer — so that every later
phase inherits working chrome and can concentrate on page content. They mount in the root
layout, outside `<main>`, so they survive route changes.

Deviations from the phase brief, decided at step 3:

1. **Two `components/ui/` primitives are built here rather than in phase 3.** `IconCircle` (§9)
   is required by the nav CTA pill, the footer social bars *and* the form submit — three
   consumers inside this phase. `Button` (§9) is the nav CTA. §9, §21.3 and `50-brand-and-3d.md`
   §1 were added to this phase's Reading Map in `01-PHASES.md`, per protocol §2. See D-009.

2. **The 2D aperture mark is built here**, because the loader and navbar have nothing to render
   without it. Its geometry is fully specified, so this is transcription, not design. The concept
   is still un-approved — phase 2 is that gate — and it is isolated in two files.

3. **The harness gains a behaviour layer.** Three of the four things `02-VERIFICATION.md` says
   phase 1 owes are DOM behaviours, not timeline shapes. See D-008.

**One large unplanned addition:** a full re-measure of tonik. The phase-0 handoff asked for the
I-005/I-006 numbers "if you are opening Playwright against tonik for anything else". Several
navbar and footer values were unspecified or looked wrong, so the trip happened first, before
building — which turned out to be the right order. It resolved both inherited issues and
corrected six spec values, including one whole interaction (§9's fill overlay) that neither
recovered source could see because it is plain CSS.

## Tasks

| id | task | status | commit | evidence |
|---|---|---|---|---|
| T1.1 | Loader — IX2 enter timeline | ✅ | `b8d6a10` | `loader.enter` 0.6s, 5 children, both tweens power2.inOut at startTime 0 — report lines 49–72 |
| T1.2 | Loader exit + link interception | ✅ | `b8d6a10` | `loader.exit` 0.5s power3.out; route change driven in-browser: panel at top=1200 → covers → path changes → clears. Scrub of the playhead at 0/.25/.5/.75/1 gives 1200/380/75/5/0 |
| T1.3 | Navbar — layout, `WORKS¹²`, active pill, CTA pill | ✅ | `8b23459` | logo box 4.25rem×1.25rem, menu gap 2.5rem, link padding .4/.5rem, CTA .5/.75rem gap .5rem — all measured against tonik's own computed styles |
| T1.4 | Navbar `is-mini` | ✅ | `8b23459` | behaviour check: off at 20px, on at 100px, bg `--black`, padding-top 0.75rem, off again on the way back up |
| T1.5 | Navbar mobile | ✅ | `8b23459` | `nav-menu-390.png` — panel down, links + CTA, vertical stroke rotated |
| T1.6 | Footer | ✅ | `8b23459` | behaviour check: siblings dim to 0.30 at 1512, restore to 1, nothing dims at 991. `footer-1512.png` vs `s11-footer.png` |
| T1.7 | Contact panel | ✅ | `bf46ec0` | `contact.open` 1.5s, 7 children, every startTime matches its position parameter. Behaviour: opens, sidebar 56.0%, role=dialog aria-modal, focus in, Escape closes at −1.2, focus restored |
| T1.8 | Contact form | ✅ | `bf46ec0` | `contact-panel-1512.png` — renders with no Tally ID, chips fill the row 5-up and 4-up |
| T1.9 | CSS hover states from §22 | ✅ | `bf46ec0` | close-button rotate+half-fade, `.6` on secondary controls, input border, chip hover — every `:hover` rule confirmed inside a `min-width: 992px` query |

## Decisions made

- **D-007** — animated elements carry a BEM hook class as well as their CSS-Module class.
- **D-008** — `verify:motion` gains a behaviour layer that drives the real interface.
- **D-009** — `Button`, `IconCircle` and the 2D mark are built in phase 1.

## Issues found

Resolved: **I-005**, **I-006** (both inherited from phase 0, both settled by re-measure),
**I-010**, **I-016**.

Opened: **I-009** (tick stroke weight), **I-011** (h3–h6 mobile step-down), **I-012** (asymmetric
nav link padding), **I-013** (mobile wordmark scale), **I-014** (placeholder service icons),
**I-015** (form options, gif, endpoint), **I-017** (**the `inOutQuad` easing translation — needs
a decision**).

## Assertions added to the harness

**Timelines flipped live:** `loader.enter`, `loader.exit`, `contact.open`, `button.icon`.

**`TweenAssertion.startTime`** — new. The `position` field existed since phase 0 and was never
asserted by anything; a wrong position parameter passed every duration and ease check while the
sequence played in the wrong order. `startTime` is the resolved playhead, which is the only form
a position parameter can actually be read back as. Every `'<'`, `'<+0.3'` and `'<+0.2'` in the
loader and contact timelines is now checked against the second it lands on.

**Behaviour layer** (`behaviour.ts`, `behaviour.config.ts`), five checks:

| check | asserts |
|---|---|
| `nav.is-mini threshold` | off at 20px, on at 100px, correct ground and padding, off again on the way up |
| `footer service sibling-dim` | siblings at exactly 0.3, hovered at 1, restored on leave, **and nothing at 991** |
| `contact panel open/close` | closed at rest, opens, sidebar x 0 and 56%, dialog semantics, focus in, Escape, reverse at −1.2, focus restored |
| `button icon-swap reverse scale` | forward at 1, reverse at −1.5 — the button scale, not the panel one |
| `loader under reduced motion` | a 200ms fade, no transform among the animated props, page cleared |

**Visual:** `footer`, `contact-panel` and `nav-menu` shots at both viewports. `Shot` gains
`prepare` (a named interaction before the shutter) and `ourScroll` (tonik's footer sits at
11,984px; ours does not).

**Three harness bugs fixed**, all of which would have failed correct code in a later phase:

1. `reverseTimeScale` compared a signed `timeScale()`. GSAP negates it while reversing, so phase
   4's correct `work-card.hover` would have read −1.2 against an expected 1.2 and failed.
2. `readMotionState` raced hydration and intermittently reported the desktop matchMedia context
   inactive at 1512.
3. `verify:budget` used `networkidle`, which stopped resolving once the page had chrome on it.

## Verification at completion

```
Run: 2026-08-25 · Phase 01 · commit 83ff9ae · branch phase/01-chrome

tokens  ✅ 136/136
motion  ⚠️ 129/132  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 4/4
```

Key figures: JS on `/` **170.0KB / 190KB** · total 234.6KB / 1800KB · CLS 0.0018 · LCP 116ms
local · ScrollTrigger baseline now **1** and returning to it across route changes, so the leak
check is meaningful for the first time.

**Visual judgement:** recorded in full in `tools/verify/visual.config.ts`. In short: the footer
composition lands against `s11-footer.png` — same gutter, same column geometry, and the `14vw`
wordmark ends within a pixel of theirs because both are proportions of the viewport. The contact
panel's sidebar geometry matches `s12-contact.png`. Looking at the pairs found four errors no
assertion would have caught: the footer meta row had the year before the mark, the fieldsets were
rendering their native border, the chips were pills where tonik's are square and fill the row,
and every text field carried a visible label where tonik uses the placeholder. All fixed and
re-captured. One difference left standing: their form fields are ~51px tall against our ~40px,
measured off a screenshot rather than computed styles, so it is noted rather than guessed at.

## Self-review

Protocol §6, worked through honestly.

- [x] **Values spot-checked against spec.** Five at random: loader exit `.5s` / `power3.out`
      (§1) ✓ · contact sidebar 56% (§3) ✓, asserted at 56.0% · sibling-dim 0.3 / 400ms
      (§20, §21.1) ✓, asserted exactly · nav link padding `.4rem .5rem` (§2) ✓, computed
      7.84/9.8px at a 19.6px root · IconCircle `background-color .3s ease-in-out` (§9) ✓.
- [x] **Reverse timeScales correct.** 1.2 for the contact panel, 1.5 for the icon swap, both
      asserted through the real close/leave path rather than by poking the timeline.
- [x] **All hover/parallax/reveal inside matchMedia.** Every GSAP hover is inside
      `gsap.matchMedia(MQ.desktop)`; every CSS `:hover` rule in all five modules was checked to
      sit inside a `min-width: 992px` block. The footer dim is additionally asserted *inactive*
      at 991.
- [x] **One rAF loop.** Asserted, including under reduced motion.
- [x] **Reduced motion tested by actually toggling it.** It found a real defect — see below.
- [x] **No dead code, logs, or unlogged TODOs.** Clean.
- [x] **Every "done" has evidence** — the table above cites a report line, a capture or a
      recorded measurement for each.
- [x] **Every gap written into HANDOFF** under Known gaps.

**What I found and fixed during self-review, and during verification:**

- **The loader ignored `prefers-reduced-motion` on first load.** React runs a child's layout
  effects before its parent's, so the Loader built and played its full 0.6s sweep before
  `MotionProvider`'s matchMedia context had told it the visitor asked for reduced motion. The
  entire loader animation, at full speed, for exactly the person who asked not to see it. Fixed
  by seeding the preference synchronously in the provider's `useState` initialiser. This is the
  single most valuable thing the phase produced and it was found by a check written twenty
  minutes earlier.
- **`'30rem top'` is 30 pixels.** ScrollTrigger has no rem support. Our code was already
  byte-identical to tonik's and therefore already right; the *assertion* was wrong, testing a
  493.5px boundary that does not exist. Confirmed against tonik's live trigger instance rather
  than inferred. I-016.
- **`power2.inOut` is cubic, not quadratic.** Scrubbing our own loader gave `4p³` to four decimal
  places. Webflow's `inOutQuad` is quadratic — GSAP's `Quad` is `Power1`. Logged as I-017 and
  **left as specced**, per protocol §4. It needs a decision, not a guess.
- Removed a prefetch-exclusion branch from `verify:budget` that reported 0 and fixed nothing —
  the real cause was `networkidle`. Carrying it would have silently under-counted real weight
  once the routes exist.

## Handed off to
Phase 02 · see HANDOFF.md at commit `83ff9ae`
