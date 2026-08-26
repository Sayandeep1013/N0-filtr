# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent starting Phase 3

**From:** phase 02 · 2026-08-26 · **Opus** · two sessions

## Read this first: how this build measures tonik changed

**`docs/research/03-tonik-extract.md` is tonik's design system read off their live DOM.** Container
system, type scale as rendered, colour set, transition vocabulary, section rhythm, the hero element
by element. Regenerate or extend it:

```bash
npx playwright install firefox              # ONCE — Playwright ships browsers separately
npm run extract:tonik                       # firefox, the default
node tools/extract/tonik.mjs --chromium     # the cross-engine diff, no download needed
```

Chromium is already installed for the verify harness, so `--chromium` works immediately on a
fresh checkout. The script tells you which browser is missing rather than failing obscurely.

**Protocol §2.9 now requires you to check it before measuring anything**, and every Reading Map
points at it. This is not bureaucracy — it is the most expensive lesson this phase learned.

> **A capture shows where an element is. It never shows the rule that put it there.**

Phase 2 spent a session correcting the hero by eye against a screenshot: the foot rail 29px too
high, the copy column 57px too far left, the play control 0.2rem out with the wrong gap, the label
colour wrong. Each found, fixed, followed by another. **Every one of those values was in
`getComputedStyle` the whole time**, and one rule explained all of them at once —
`.container-large` is `max-width: 80rem`, centred, which our own spec had documented as the gutter
width. See D-016 and I-030.

If your component's numbers are not in the extract, **extend the extractor** — it takes a selector
list and one more component costs a line — then commit the regenerated output. Open a screenshot
only for composition, which is the one thing a capture is genuinely better at.

## The proof it works, and how to reuse it

`npm run compare:hero` reads the same structural values out of **both** DOMs — ours and theirs —
at four viewports and diffs them. It needs `npm run dev` running.

**It passes 92/92 in Firefox and in Chromium.** Only 1512 was ever tuned; 1280, 1440 and 1920 came
out right on their own, which is the test of whether rules were copied or positions were.

**The first run was 91/92, and the failure is the more useful half.** Their canvas wrapper is
110vh at 1920 and 100vh below — swept across widths in both engines, switching at exactly 1920,
which is Webflow's largest default breakpoint. Ten per cent more viewport height is ten per cent
less crop on an object framed off height, which is why their hero still reads on a wide monitor.

**Extend this the same way you extend the extractor.** When you build the works grid, add its
structural fields to `STRUCTURAL` in `tools/extract/compare-hero.mjs` and let it tell you whether
you got it right, rather than looking. It deliberately compares only what is a property of the
layout — never anything downstream of content, because our copy is ours and theirs is theirs.

## What I did

The Open Aperture is approved and on all seven surfaces §4 names — loader, navbar, footer,
favicon, apple icon, 512 tile, OG card. Behind the headline is a **machined barrel with six blades
housed inside its bore**, with a procedural grain and a specular the spec never described.

The homepage has a real hero: headline, inline play control, foot rail, matching tonik's live DOM
figure for figure.

**The object was rebuilt from scratch mid-phase**, and the first version is worth knowing about
because its failure is instructive. It followed §2 literally — a wire torus with six bars floating
at its inner edge, driven by §2's recovered parallax curves. Those curves are correct for tonik and
wrong for us: their glyph floats free inside their ring, ours is *housed*, and the same
differential slid the blades straight out of the bore. See D-014.

## ⚠ The five things that will actually affect you

**1. Part of your phase is already built.** T3.1 (hero copy) and T3.2 (foot rail) shipped in phase
2 so the 3D object could be judged against real text instead of the footer wordmark standing in for
a headline (D-015). **Re-read your brief before you claim it.** Still yours: the scrubbed word
reveal (T3.3), the stack wall (T3.4, T3.5), the showreel (T3.6).

**2. You have ~16KB of JS budget.** `/` is at **303.7KB of 320KB**. Phase 3 adds SplitType, the
stack wall and the showreel to this exact route. The ceiling was raised once, on measurements
(D-013); raising it again needs the same standard — **measure and put it to Sayandeep, do not edit
the number.** Two rules protect the headroom: **Plyr must load only when the showreel first opens**,
and Matter only when the pit scrolls into view. If either shows up in `verify:budget`'s figure that
is a bug in your import, not a reason to raise the ceiling.

**3. `PlaySquare` is inert and `aria-hidden` on purpose.** T3.6 turns it into the real Flip trigger.
Its markup is already the shape Flip needs — the background is a separate layer with
`data-flip-id="showreel"`, which is how tonik structure theirs. A button that looks live and does
nothing is worse than no button; a screen reader announcing "play" on a control that cannot play is
worse still.

**4. `data-hero` is already on the hero section.** That closes I-020 — the mobile scroll drive
scrubs against it. Nothing to do; **do not remove it.**

**5. The wordmark is `font-weight: 700`, deliberately.** CLAUDE.md §3 says the display face is
never bolded; §3 has been amended to name this one exception, because the rule is about type and
a wordmark is a logo drawn with the face. **Do not "fix" it back to 400** — read D-017 first.
Everything else stays 400 and `verify:tokens` still asserts it.

**6. The extract already answers things you are about to need.** Their heading steps are 2rem/2.5rem
and 1.5rem/1.75rem. Their most-used border is `1px solid rgba(59,59,59,.3)` — the hairline on
**light** surfaces, which we do not have a token for and phase 4 will need. There is no 0.875rem
step anywhere on their site, so our `--t-label-big` may be invented.

## Known gaps

**In the build**

- **The homepage ends after the hero.** The footer currently sits directly under it, so two rules
  land ~43px apart with nothing between them. That is the stack wall's slot — it stops when you
  build it.
- **Every nav destination still 404s.** `/works`, `/about`, `/services`, `/blog`, `/privacy`. Next
  hard-navigates to an unresolvable route, so you cannot observe a client-side transition through
  those links — use `/` ↔ `/probe`.
- **`h3`–`h6` mobile sizes disagree with tonik (I-011), and phase 3 owns it.** You are the first
  phase to render those at 390. The extract has their real values.
- **The `≤479` breakpoint is unimplemented** (I-007). Inherited.
- **The contact panel's gif slot is empty** (I-015); **the form has no endpoint** — it composes a
  `mailto:` to a real address. Phase 10 / user.
- **The five footer service icons are placeholder art** (I-014, phase 10).
- **I-029 is open and harmless**: §2 gives the idle spin as `0.0022`/frame *and* as "~7.5s per
  revolution", which are not the same motion — 0.0022/frame is 47.6s. Neither is used; Sayandeep
  asked for it much slower, so it is 0.02 rad/s. `IDLE_SPIN_PER_SECOND = 0` stops it dead.

**In the harness**

- **3 timeline assertions are still pending**, owed by phases 4 and 5.
- **`matter-js` and `plyr` absence checks are vacuous** — not installed. `three`'s is not, and passes.
- **The hero's off-screen check injects its own scroll height** — it grows `body` and calls
  `lenis.resize()` because the homepage has none. **Delete those lines once your stack wall gives
  the page real height**; the comment says so in place.

## Things that will bite you

- **A per-frame constant in a spec is a duration wearing a disguise.** §2 states its spin as
  "~7.5s per revolution" and its damp as "500ms" and writes both as per-frame increments — true
  only at 60fps. The behaviour check caught it: the sweep read 0.319 rad instead of 0.4 because
  headless Chromium runs the ticker near 20fps. **Phases 4, 5 and 11 have the same exposure** —
  the block pit especially. Check every `+=` you copy out of a spec.
- **`networkidle` is not "the page has settled" on a route that dynamically imports three.** The
  chunk lands after it and React commits later. Two harness checks raced on this and reported bugs
  that did not exist — a ScrollTrigger leak and a missing loader timeline. Both now wait for state.
  **If a check starts failing after you add a library, suspect the check first.**
- **A correct implementation of an illegible value looks exactly like a broken one.** §2's load-in
  was running perfectly and read as "the object just appears" — 15% of travel, 60% of it in the
  first fifth of the duration. **Measure before you change.**
- **Lenis caches its scroll limit from the content element.** Growing `documentElement` and calling
  `lenis.scrollTo()` clamps silently to the stale limit; the page does not move and nothing errors.
  Grow `body` and call `lenis.resize()`.
- **React reconciles away DOM you inject into `main`.** Anything a test injects must live where
  React does not own it.
- **`networkidle` raced the harness in THREE separate places**, and all three are fixed: the
  ScrollTrigger baseline, the loader's reduced-motion read, and the registered-timeline reader.
  Each reported a bug that did not exist. If a check starts failing after you add a library,
  **suspect the check first** — and if you add a fourth reader of page state, make it wait.
- **Backticks inside a GLSL template literal end the string.** Writing `` `roughness` `` in a
  shader comment is a build error with a confusing message.
- **The dev server must not be running when you `verify`.**
  `Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

## Anything surprising

**The spec section with no reference to transcribe is a different kind of document.** §2's scene
graph and GLSL are *authored intent* — tonik's object is a Spline binary the brief deliberately
does not copy — so unlike §1's ratios or §20's IX2 curves they were never measured off anything.
**Six of its statements did not survive being followed to the letter** (I-021 to I-029), and none
of them is visible in the source. Rendering it and looking at it against the reference is the only
check that finds this class of problem.

**The most valuable assertion is the one that reads a relationship, not a value.** "The blades
outrun the ring" is not a number in any file — it is a ratio between two rotations. Writing that
assertion is what surfaced the per-frame damp bug. And when the object was rebuilt, the assertion
that replaced it is *structural*: a rotation about the bore axis cannot change a radius, so the
blades are incapable of leaving the barrel. **Assert the invariant, not the tuning.**

**tonik's own numbers were wrong about tonik.** §3 argues against Spline partly on "Three ~48KB
gz". It measures 141KB. The conclusion holds — Spline is ~380KB plus a scene — but the budget
built on that estimate failed the moment it met a real bundle.

## Verification state

```
Run: 2026-08-26 · Phase 02 · branch phase/02-brand-3d

tokens  ✅ 136/136
motion  ⚠️ 144/147  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 5/5
```

**JS 303.7KB / 320KB** · total 370KB / 1800KB · CLS 0.0027 · **5,232 triangles / 40,000** · blade
reach 1.930 of 2.0 invariant · pointer response max 0.159 rad.

## What you should do first

1. `git checkout main && git pull && git checkout -b phase/03-home-upper`, set STATE to
   in-progress, commit that immediately.
2. **`npm run verify`** before you touch anything. It should be green.
3. **Reset `AGENT_JUDGEMENT` to `null`** in `tools/verify/visual.config.ts`. Mine describes a hero,
   a footer and a contact panel. Leave it and your run goes green on a stale judgement.
4. **Read `docs/research/03-tonik-extract.md`.** Then re-read your phase brief — T3.1 and T3.2 are
   done.
5. **`npm run extract:tonik`** and extend it with the selectors for the stack wall and the showreel
   *before* you build them. That is the whole point of it existing.
6. **Watch the 16KB.** Check `verify:budget` after SplitType and after the showreel, not at the end.

## Commands you'll need

```bash
npm run dev                # :3000 — stop it before you verify
npm run verify             # the gate — ~3 min
npm run verify:motion      # ~90s; 15 assertions drive a real WebGL context
npm run verify:visual      # then OPEN tools/verify/output/contact-sheet.html
npm run extract:tonik      # their live design system → docs/research/03-tonik-extract.md
npm run compare:hero       # head-to-head vs tonik at 4 viewports — needs `npm run dev` running
npm run brand:assets       # favicon / apple icon / 512 / OG card
npm run hero:fallback      # rebakes public/hero-aperture.webp — needs `npm run dev` running
npm run lint && npx tsc --noEmit
```

Reading the hero's live state, which is how every hero assertion works:

```js
window.__HERO__                  // { mode, running, triangles, reducedMotion }
window.__HERO_SCENE__.debug()    // tip, actuation, spin, cameraZ, blades, bladeReach, scale
```

---
---

## Template — copy this when you write your handoff

```markdown
# → To the agent starting Phase NN

**From:** phase NN-1 · <date> · commit `<sha>`

## What I did
<One paragraph. What exists now that didn't before.>

## Known gaps
<Everything imperfect, stubbed, skipped, or half-done. THE MOST IMPORTANT SECTION.
 If there are none, say "none" — but be sure before you do.>

## What you should do first
<Numbered. Concrete. Assume they know nothing about your session.>

## Things that will bite you
<Traps you hit, or nearly hit.>

## Anything surprising
<Things you learned that aren't in the specs. Add them to the specs too if they're durable.>

## Verification state
<Paste the summary block from tools/verify/output/report.md>

## Commands you'll need
<Anything non-obvious.>
```
