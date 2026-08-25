# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent starting Phase 1

**From:** phase 00 · 2026-08-25 · commit `033b3aa` · **Opus**

## What I did

The repo now runs. There is a Next 15 app with the complete token system, both faces self-hosted,
the fluid root working, and Lenis riding the GSAP ticker behind a `MotionProvider` that owns all
responsive and reduced-motion state. And there is the harness: `npm run verify` runs four checks,
writes `tools/verify/output/report.md`, and exits non-zero when something is wrong. I proved it
by breaking three things and confirming it caught all three.

There are **no components**. `/` is deliberately blank. That is your phase.

## Known gaps

**In the build**

- **`/` renders nothing.** By design — T0.1's acceptance was a blank page. The only route with
  content is `/probe`, which is dev-only and exists for the harness.
- **No component has been verified, because none exist.** The motion check's five timeline
  assertions are all `pending`. Two are yours: `loader.enter` and `contact.open`.
- **The ScrollTrigger leak check passes against a baseline of zero.** It is live and correct but
  it has never seen a real trigger. It becomes meaningful the moment you create one.
- **Three budget assertions are vacuous** and say so in the report: `three`, `matter-js` and
  `plyr` are "absent from the bundle" only because they are not installed.
- **`--t-p-big` line-height is unitless (1.6)** while every other step is a rem length. That is
  what the spec says; just don't be surprised by it.
- **The ≤479 breakpoint is not implemented at all** (I-007). The spec names it but gives no
  values. Below 480 you get the ≤767 values.
- **Lighthouse is not in `verify:budget`.** LCP/CLS come from the browser's own observers on an
  unthrottled local load — a regression signal, not a score. Real Lighthouse is phase 12, via
  `mcp__chrome-devtools__lighthouse_audit`.

**Two real defects I found and did *not* fix, because they are spec-faithful**

- **I-005 — at ≤767, `h1-sm` (3.25rem) renders LARGER than `h1` (3rem).** The mobile step-down
  in §3 names h1/h2/h3/h4 and not h1-sm, so the secondary hero style out-ranks the primary one on
  mobile. Look at `tools/verify/output/shots/type-scale-390.png` after a `verify:visual` run —
  it is the biggest thing on the page. Bites phase 3 and phase 7.
- **I-006 — `h1` tracking is not stepped down with `h1` size.** `-0.15rem` is 2.5% of a 6rem face
  and 5% of a 3rem one, so mobile h1 is proportionally twice as tight.

Both are logged. Protocol §4 says implement the conservative reading and escalate, not silently
correct — so I did. **Both want the same 20-minute re-measure of tonik at 390.** If you are
opening Playwright against tonik for anything else in phase 1, grab these while you are there and
put the answers in the spec.

## What you should do first

1. `git checkout main && git pull && git checkout -b phase/01-chrome`, set STATE to in-progress,
   commit that immediately.
2. `npm install` if this is a fresh clone, then **`npm run verify`** before you touch anything.
   It should be green. If it is not, something in your environment differs from mine and you want
   to know that now, not after you have written a loader.
3. Read your Reading Map — `20-components-and-motion.md` §1, §2, §3, §20, §21.1, §22 ·
   `30-page-specs.md` global chrome note · `10-design-system.md` §5, §6. Not the rest.
4. Work T1.1 → T1.9.

**As you build, flip the assertions.** `tools/verify/motion.config.ts` has `loader.enter` and
`contact.open` seeded with the shapes from `02-VERIFICATION.md` and `pending: true`. Set them to
`false` when you build them and add the navbar mini threshold and the footer sibling-dim.
`tools/verify/visual.config.ts` has a `footer` shot pending. **A phase that adds no assertions has
not been verified.**

**And reset `AGENT_JUDGEMENT` to `null` when you start.** Mine describes the type scale on a page
with no components. If you leave it, the run goes green on a stale judgement and the visual check
silently stops meaning anything. Set it to null, build, run `verify:visual`, actually open the
PNGs, then write what you saw.

## Things that will bite you

- **The dev server must not already be running.** The harness boots its own on :3000 and kills
  the tree on exit. If you have `npm run dev` open in another terminal, `verify` will measure
  *that* server — including whatever uncompiled state it is in.
- **`verify` runs a full production build** for the budget check, so it takes ~90s. Use
  `npm run verify:tokens` / `:motion` / `:visual` while iterating; run the full thing before you
  commit a task.
- **Register timelines or they cannot be checked.** `registerTimeline('loader.enter', tl)` from
  `lib/motion/registry.ts`. It is dev-only and compiles out. A timeline nobody registered reports
  as a failure once you flip its `pending`, which is the intended pressure.
- **Split text only after `document.fonts.ready`.** Inherited warning from the spec session, and
  still true — the harness itself awaits it before every measurement for the same reason.
- **Get scroll state from `useMotion()`, never from a resize listener.** It gives you `lenis`,
  `reducedMotion`, `isDesktop` (>991), `isAbove767`, and `stopScroll` / `startScroll` for the
  contact panel. `stopScroll` handles the reduced-motion case too, where there is no Lenis at all.
- **Don't add a rAF loop.** The check classifies rather than counts (D-004) and will name your
  stack in the failure.
- **Don't set git identity.** Global config is already correct — `saaiyaan1013@gmail.com`.

## Anything surprising

**GSAP runs two rAF loops, and that is fine.** ScrollTrigger has `_rafBugFix`, a no-op keep-alive
that exists because Firefox does not repaint consistently unless something is queued
(`node_modules/gsap/ScrollTrigger.js:61`). It drives nothing. The one-loop check allowlists it by
name — see D-004. If you had counted, you would have concluded the rule was already broken.

**`normalizeWheel` is gone from Lenis** (I-004). Every other specced option survives.

**Fonts: General Sans ships a variable cut**, 200–700 in 38KB — smaller than two statics and
covering every weight §3 names. IBM Plex Mono has no variable cut on Fontsource, so it ships 400
and 500 only (D-003). Adding a mono weight is one line in `app/fonts/fonts.ts` plus a woff2.

**The visual check is the one that found the real bugs.** The 132 computed-style assertions all
passed while `h1-sm` was rendering larger than `h1` on mobile — because that is *correct against
the spec*. Assertions verify what you told them to; only looking catches what nobody thought to
assert. Open the PNGs.

**The budget is tighter than it looks.** JS on `/` is already **159.5KB of the 190KB budget**
with nothing but React, GSAP and Lenis. Three.js is ~48KB gzipped and arrives in phase 2. If it
is not dynamically imported, phase 2 blows the budget on its own — `60-architecture-and-build.md`
§5 already requires the dynamic import, and now you know why it is not optional.

## Verification state

```
Run: 2026-08-25 · Phase 00 · commit 033b3aa · branch phase/00-foundation

tokens  ✅ 132/132
motion  ⚠️ 35/40  (5 pending, owed by later phases)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 4/4
```

Key figures: root **16.45px @1512** and **16px @1440** · JS 159.5KB/190KB · total 204.5KB/1800KB ·
CLS 0 · both faces confirmed painting via CDP · zero network font requests.

Full report: `tools/verify/output/report.md` (committed). Phase record with the break-test
results: `docs/build/phases/PHASE-00.md`.

## Commands you'll need

```bash
npm run dev                # :3000
npm run verify             # the gate — ~90s, includes a production build
npm run verify:tokens      # ~20s, use these while iterating
npm run verify:motion
npm run verify:visual      # then OPEN tools/verify/output/contact-sheet.html
npm run verify -- --keep   # leave the server up, for debugging the harness itself
npm run lint               # real eslint now, and clean
npx tsc --noEmit           # strict, with noUncheckedIndexedAccess
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
