# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent starting Phase 2

**From:** phase 01 · 2026-08-25 · commit `83ff9ae` · **Opus**

## What I did

The site has chrome. Loader, Navbar, ContactPanel and Footer are built, mounted in the root
layout outside `<main>`, and verified — `/` is still a blank page between a working navbar and a
working footer, which is exactly what phase 3 needs. Along the way `Button`, `IconCircle` and the
2D aperture mark exist because this phase's components could not be built without them (D-009).

Two things beyond the brief. **I re-measured tonik**, because the phase-0 handoff asked me to grab
the I-005/I-006 numbers if I opened Playwright anyway, and because several navbar and footer
values were unspecified. Doing it *before* building rather than after was the right order: it
resolved both inherited issues and corrected six spec values, including an entire interaction
that neither recovered source can see. And **the harness gained a behaviour layer** that drives
the real interface instead of reading registered timelines — it found five real problems within
an hour of existing, one of which reached users.

## ⚠ One decision I need from you — I-017

**The spec's `inOutQuad → power2.inOut` translation is wrong, and I did not change it.**

GSAP's `powerN` aliases are offset by one from the Penner names (`gsap-core.js:1526`):
`Quad === Power1`, `Cubic === Power2`. So `power2.inOut` is **cubic**. Webflow's `inOutQuad` is
quadratic. I confirmed it by scrubbing our own loader: at 25% progress the panel had travelled
`4p³` of its sweep — cubic to four decimal places — where quadratic would be `2p²`.

The token is *named* `quad`. GSAP even ships `quad.inOut` as an alias for `power1.inOut`. The name
and the recovered IX2 value agree with each other; only the transcribed value disagrees with both.
That reads like a slip.

Protocol §4 says log it and leave it, so `EASE.quad` is still `power2.inOut` and `verify:motion`
is green against it. **My recommendation is to change it to `power1.inOut`.** It is three lines
today — `lib/motion/tokens.ts`, `SPEC_EASE` in `motion.config.ts`, and the two mapping tables in
the specs — and it costs more every phase that adds an inOutQuad timeline. Settle it in phase 2.

## Known gaps

**In the build**

- **`/` is still blank between the navbar and the footer.** By design. The footer therefore sits
  near the top of the document, which is why `verify:visual`'s footer shot scrolls to `'bottom'`
  rather than to tonik's measured 11,984px.
- **Every nav destination 404s** — `/works`, `/about`, `/services`, `/blog`, `/services/[slug]`,
  `/privacy`. Expected; they arrive with their phases. Note that **Next hard-navigates to a route
  it cannot resolve**, so clicking a nav link today does a full page load rather than a client
  transition. The loader still covers correctly either way, but you cannot observe a client-side
  route change through those links. Use `/` ↔ `/probe`.
- **The contact panel's gif slot is empty** (I-015). The element is real and animated so the
  timeline and its assertion are honest, but there is nothing inside it until phase 10.
- **The five footer service icons are placeholder art** (I-014). One file,
  `components/ui/ServiceIcon.tsx`, five paths.
- **The contact form has no endpoint.** With no `NEXT_PUBLIC_TALLY_FORM_ID` it composes a
  `mailto:`. That works, but it is not the shipping path. The budget bands and the four referral
  chips are invented — the spec names the fields and not their options (I-015). **These are
  content decisions and therefore Sayandeep's.**
- **The form's fields are ~40px tall against tonik's ~51px**, so our form runs about 170px
  shorter. Measured off `s12-contact.png` rather than off computed styles, so I left it rather
  than guess a third number. Grab it if you open their panel.
- **`h3`–`h6` mobile sizes disagree with tonik** (I-011). I resolved h1 and h1-sm because they had
  open issues and three independent elements agreed; h3–h6 came from one page and through
  `is-mobile-*` modifier classes that may be per-instance overrides. **Phase 3 owns this** — it is
  the first phase to render those at 390.
- **The `≤479` breakpoint is still unimplemented** (I-007), inherited.
- **The mobile wordmark is proportionally a quarter the size of tonik's** (I-013). Theirs is an
  SVG scaled to 100% of its column and only *happens* to equal 14vw at 1512. Ours is text at a
  fixed 14vw. Desktop is right; 390 is visibly under-scaled. Left as specced — 14vw is one of the
  two rem exceptions CLAUDE.md names.

**In the harness**

- **3 timeline assertions are still pending**, all owed by phases 4 and 5.
- **The three/matter/plyr budget assertions are still vacuous** — those packages are not
  installed. `three` stops being vacuous the moment you install it, which is your phase.

## What you should do first

1. `git checkout main && git pull && git checkout -b phase/02-brand-3d`, set STATE to
   in-progress, commit that immediately.
2. **`npm run verify`** before you touch anything. ~2 minutes. It should be green:
   `tokens 136/136 · motion 129/132 (3 pending) · visual judged · budget 4/4`.
3. **Reset `AGENT_JUDGEMENT` to `null`** in `tools/verify/visual.config.ts`. Mine describes a
   footer and a contact panel. If you leave it, your run goes green on a stale judgement and the
   visual check silently stops meaning anything.
4. **Settle I-017** — see above. It is the cheapest it will ever be.
5. **Show Sayandeep the aperture mark before you build the 3D.** `50-brand-and-3d.md` §5 makes
   approval a precondition and phase 2 is the gate. It already renders in three places, so a
   screenshot of the loader, the nav and the footer *is* the sign-off material — you do not need
   to build anything to ask. If the concept is rejected, the replacement is
   `components/brand/ApertureMark.tsx` and `Wordmark.tsx` and nothing else; every consumer takes
   `currentColor` and sizes from its container. Settle **I-009** — the tick stroke weight, which
   the spec never gives — in the same conversation.

## ⚠ Things that will bite you

- **You have 20KB of JS budget left.** `/` is at **170.0KB of 190KB**. Three.js is ~48KB gzipped.
  If it is not dynamically imported, phase 2 blows the budget on its own —
  `60-architecture-and-build.md` §5 already requires the dynamic import and now you know the
  number. Phase 0 warned about this at 159.5KB; the chrome cost 10.5KB.
- **rAF may be throttled to ~1fps in a Playwright MCP browser window that is not on top.** I lost
  twenty minutes to a loader that appeared not to animate: `gsap.ticker.frame` advanced once per
  second while `setInterval` ran normally, so the timeline sat at progress 0 and then jumped to 1.
  The animation was correct the whole time. If motion looks broken when you drive the browser by
  hand, check `gsap.ticker.frame` over a second before you change any code. The harness runs
  headless and is unaffected — **trust `npm run verify` over what you see in the MCP browser.**
  To prove a timeline renders without depending on frames, scrub it:
  `tl.pause(); tl.progress(0.25); getComputedStyle(el).transform`.
- **`'1rem top'` / `'30rem top'` are PIXELS.** ScrollTrigger has no rem support — `_offsetToPx`
  ends in `parseFloat(value) || 0`. tonik's own trigger reports `start: 1, end: 30`, and their bar
  is not mini at 20px and is mini at 40px. Copy the strings exactly; converting them to computed
  rem puts the threshold sixteen times further down the page. I-016, and the warning is now in the
  spec next to the code.
- **GSAP negates `timeScale()` while a timeline runs backwards.** A correct reverse at 1.2 reads
  `-1.2`. I fixed `reverseTimeScale` to compare magnitudes; it would otherwise have failed phase
  4's perfectly correct `work-card.hover`.
- **`reverseTimeScale` on a timeline assertion is nearly useless.** It calls `reverse()` on the
  registered timeline and reads the scale back, which passes only if the timeline is already
  sitting at that scale — and every component applies the scale inside its own handler. Write a
  behaviour check instead. There are two working examples.
- **React runs a child's layout effects before its parent's.** That is how the loader came to play
  its full sweep before `MotionProvider` reported reduced motion. If a component needs provider
  state on its very first effect, the provider has to seed it synchronously, not wait for a
  matchMedia callback.
- **A stagger's `amount` folds into the tween's reported duration.** `contact.open`'s meta tween
  is `duration: .5` with `stagger: { amount: .5 }` and `getChildren()` reports it as **1.0s**.
  Assert what GSAP reports, not what you wrote.
- **`gsap.set()` calls are children.** They are zero-duration tweens and `getChildren()` returns
  them, so tween indices in an assertion include them. All four of my timeline assertions document
  their index mapping.
- **The dev server must not already be running** when you `verify` — inherited warning, and I hit
  it. The harness boots its own on :3000 and dies with `server exited early with code 1` if the
  port is taken. On Windows `pkill -f "next dev"` does not reliably kill it; see the commands
  below.

## Anything surprising

**tonik has a whole interaction that neither recovered source can see.** Every `.button-icon` on
their site — the nav CTA and the footer social bars in this phase — carries a
`.button-icon-overlay`: a 200%-tall panel parked directly below the button that slides
`translateY(-55%)` over `.4s` on hover, while the label and the disc invert underneath it. It is
plain CSS, so it appears in neither their GSAP bundle nor their IX2 store, and the teardown never
caught it. It only turned up because I hovered the button with Playwright and read the computed
styles back. **The lesson generalises: `[css]` is a real third animation layer and the only way to
find it is to hover things on their site and look.** §9 now documents it.

**Their social bars are `--white-10`, not `--grey-800`.** On the `--black` ground those composite
to within a few points of each other, which is how the teardown read `#3b3b3b` off a screenshot.
Worth remembering whenever a spec colour came from a capture rather than from `getComputedStyle`.

**The visual check found four errors that 136 green token assertions did not** — a reversed meta
row, native fieldset borders, pill chips that should be square and fill the row, and visible
labels where tonik uses placeholders. That is now two phases running. **Open the PNGs.**

**Below 992 the contact panel is only reachable through the burger menu**, because tonik puts the
CTA *inside* the links group rather than beside it, and it collapses with them. That is faithful,
and it surprised the visual harness before it surprised me — the `contact-open` shot had to open
the burger first.

## Verification state

```
Run: 2026-08-25 · Phase 01 · commit 83ff9ae · branch phase/01-chrome

tokens  ✅ 136/136
motion  ⚠️ 129/132  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 4/4
```

Key figures: **JS 170.0KB / 190KB** · total 234.6KB / 1800KB · CLS 0.0018 · LCP 116ms local ·
ScrollTrigger baseline **1** and returning to it across route changes.

Full report: `tools/verify/output/report.md` (committed). Phase record:
`docs/build/phases/PHASE-01.md`.

## Commands you'll need

```bash
npm run dev                # :3000 — stop it before you verify
npm run verify             # the gate — ~2 min, includes a production build
npm run verify:motion      # ~40s now; the behaviour layer drives a real browser
npm run verify:visual      # then OPEN tools/verify/output/contact-sheet.html
npm run verify -- --keep   # leave the server up, for debugging the harness itself
npm run lint               # clean
npx tsc --noEmit           # strict, with noUncheckedIndexedAccess
```

Freeing port 3000 on Windows when `verify` says the server exited early:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Reading tonik's own interaction data — how I-016 and §9's overlay were settled:

```js
// what ScrollTrigger actually resolved a position string to
ScrollTrigger.getAll().find(t => t.trigger.tagName === 'MAIN')   // -> { start: 1, end: 30 }

// a [css] hover, which no recovered source contains
await page.hover('.navbar_component .button-icon');
getComputedStyle(document.querySelector('.button-icon-overlay')).transform
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
