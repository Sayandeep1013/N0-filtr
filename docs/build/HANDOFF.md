# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent starting Phase 0

**From:** the spec & system session (Opus) · 2026-08-25 · commit `43b2f1f`

## What I did

Reverse-engineered tonik.com end to end and wrote the build specification, then designed the
build system you're about to work inside. No application code exists yet — the repo is specs,
research, and this system. You are the first builder.

Two things worth knowing about how the specs were made, because it changes how much you should
trust them:

1. **The values are measured, not designed.** I recovered tonik's actual animation source — both
   engines. Their GSAP bundle from Slater, and their Webflow IX2 interaction store (130 events,
   39 action lists), plus their 24 CSS `:hover` rules. When a spec says `.7s` or
   `power2.inOut` or `#3b3b3b`, that came off their running site. Treat those as facts.
2. **Where I guessed, I've said so.** The confidence table in
   `docs/spec/00-brief-and-decisions.md` rates every aspect honestly. Anything below 8 is a
   place where you should expect to exercise judgement rather than transcribe.

## Known gaps

Be aware of these; none of them block Phase 0.

- **Culture collage composition (spec confidence 7/10).** The motion is exact, the *layout* is
  ours to author. Phase 5 will need real design judgement, not transcription.
- **Blog and industry templates (6/10).** I know their sections and card design; I did not crawl
  their interiors. Phase 7 and 9 may want a re-measure against the live site first.
- **The 3D hero object (5/10).** Their hero is an opaque Spline binary. We are *not* cloning it —
  we're building our own aperture. Its *behaviour* is at 10/10 though: I recovered the exact
  per-object rotation curves. See `50-brand-and-3d.md` §2.
- **Content is largely unwritten.** The 12 works have theses and summaries; the case-study
  bodies, service pages, industry pages and the whole About page still need writing (Phase 10).
- **The physics pit values are starting points.** `frictionAir 0.02` and `restitution 0.35`
  decide whether it reads "fluffy" or "hard". They need tuning on real content, last, with the
  user in the loop.

## What you should do first

1. Read `docs/build/00-PROTOCOL.md` §1 (the loop) and §2 (orientation). It's the operating
   manual and this is your first session, so read it properly.
2. Read your Reading Map: `docs/spec/10-design-system.md` **in full**, plus
   `60-architecture-and-build.md` §1, §2, §3, §5, plus `docs/build/02-VERIFICATION.md` in full.
3. `git checkout -b phase/00-foundation`, set STATE to in-progress, commit that.
4. Work T0.1 → T0.10 in order.

**The single most important thing in Phase 0 is the harness, not the scaffold.** Every phase
after yours is measured by the tooling you build. If you run short of context, ship a smaller
scaffold and a complete harness rather than the reverse.

**And prove it works by breaking it.** Set a token to a wrong value, confirm `verify:tokens`
fails, revert. Record that you did. A harness that has never failed is just a script that
exits zero.

## Things that will bite you

- **The fluid root is the whole responsive system.** `calc(0.4375rem + 0.625vw)` above 1440px,
  locked to `1rem` at or below. At 1512px the root must compute to **16.45px** — assert this
  first, because every other dimension on the site is a multiple of it.
- **Split text only after `document.fonts.ready`.** SplitType measures word boxes; running it
  against the fallback face produces wrong geometry that looks fine until it doesn't.
- **One ticker.** GSAP's ticker drives Lenis now and Matter later. Never add a second rAF loop,
  never use `Matter.Runner`.
- **Don't set git identity.** The global config is already correct. I set it locally on the
  first commit and misattributed it to the wrong GitHub account. Protocol §9 has the detail.

## Anything surprising

`initLoader()` in tonik's recovered bundle is **dead code** — never called. Their real loader is
a Webflow IX2 action list with different easing (`inOutQuad`, not `power3.in`). I specced the
dead function first and had to correct it. If you find yourself reading
`docs/research/source/tonik-animations.js` directly, remember that not everything in it runs.

## Commands you'll need

```bash
npm run dev                    # once T0.1 exists
npm run verify                 # once T0.10 exists
node docs/research/source/decode-ix2-timed.mjs MOUSE_OVER        # if the local files are present
node docs/research/source/decode-ix2-continuous.mjs a-3 a-23
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
