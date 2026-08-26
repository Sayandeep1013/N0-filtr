# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent starting Phase 3

**From:** phase 02 · 2026-08-26 · **Opus**

## What I did

The site has a brand and a hero. The Open Aperture is **approved** — Sayandeep signed it off
against the three specced alternates — and it now appears on every surface `50-brand-and-3d.md`
§4 names: loader, navbar, footer, favicon, apple icon, 512 tile and the OG card. Behind the
headline there is a real 3D object: a torus, six extruded bevelled blades, a procedural
object-space grain, and the two parallax curves recovered from tonik's IX2 data, with the blades
outrunning the ring by exactly 1.50×.

Two content corrections arrived mid-phase and are done. **The wordmark is `NO FiLTER`**, not
lowercase. **Service 04 is Creative Development**, not tonik's No-Code Development — they build in
Webflow and we do not, and that line was a claim this codebase contradicts.

The harness gained **13 hero assertions** in a new file, `tools/verify/behaviour.hero.ts`, and
they found two real bugs within minutes of existing.

## Decisions Sayandeep made

Five at the brand gate (D-010, D-011), three after the hero recording (D-013, and the sign-offs on
I-021 and I-022). **Nothing is open.** In order:

1. **The Open Aperture is the mark.** Over broken mesh, the NF ligature and the un-screened dot.
2. **I-009 — ticks at half the ring's weight.** No code changed; the provisional value was right,
   and it is now written into the spec that had omitted it.
3. **I-014 — the footer service icons stay placeholder until phase 10.** Owner narrowed from
   "2 or 10" to 10. Phase 2 will not raise it again.
4. **The wordmark is `NO FiLTER`**, chosen from four candidates set in the real face.
5. **Service 04 is `creative-development` / Creative Development.**
6. **I-022 — keep the camera at 7.5**, not the specced 6.5.
7. **I-021 — the grain is right as built.** tonik's sparkles harder; that difference is accepted.
8. **I-019 — the JS budget is 320KB**, raised from a 190 that was arithmetic rather than a
   measurement.

## ⚠ The three things you most need to know

**1. You have ~17KB of JS budget, and you will spend it.** `/` measures **302.8KB of 320KB**.
Phase 3 adds SplitType, the stack wall, the reveal and the showreel to this exact route. The
ceiling was raised once, on measurements, and raising it a second time needs the same standard —
**re-measure and put it to Sayandeep, do not just edit the number.** Two rules protect the
headroom: **Plyr must load only when the showreel is first opened**, and Matter only when the pit
scrolls into view. Both are specced lazy. If either appears in `verify:budget`'s figure that is a
bug in your import, not a reason to raise the ceiling. See D-013 and the note in
`budget.config.ts`.

**2. A per-frame constant in a spec is a duration wearing a disguise.** §2 states its idle spin as
"~7.5s per revolution" and its parallax smoothing as "500ms", and writes both as per-frame
increments — which are only those durations at 60fps. The behaviour check caught it immediately:
the sweep read 0.319 rad instead of 0.4, because headless Chromium runs the ticker near 20fps. The
curves were right and the convergence was not. Both are per-second now (I-023). **Phases 4, 5 and
11 have the same exposure** — the block pit especially. Check every `+=` you copy out of a spec.

**3. One attribute of yours finishes the mobile hero.** Put **`data-hero`** on the hero section.
`Hero3D` looks for it and falls back to the first viewport of the document until it exists; with
it, the mobile scroll drive scrubs against the real section's own range. One attribute, no other
change. I-020, and the constant is `HERO_TRIGGER_SELECTOR` in `Hero3D.tsx`.

## Known gaps

**In the build**

- **`/` is still blank between the navbar and the footer** — that is your phase. The 3D hero now
  paints behind that blank space, so the footer currently sits *under* a full-height canvas near
  the top of the document. It looks wrong in the captures and it is not: giving the page height
  fixes it.
- **Every nav destination still 404s.** `/works`, `/about`, `/services`, `/blog`, `/privacy`. Next
  hard-navigates to a route it cannot resolve, so you cannot observe a client-side transition
  through those links — use `/` ↔ `/probe`.
- **`h3`–`h6` mobile sizes disagree with tonik (I-011), and phase 3 owns it.** It is the first
  phase to render those at 390. Inherited, unchanged.
- **The `≤479` breakpoint is still unimplemented** (I-007). Inherited.
- **The contact panel's gif slot is empty** (I-015) and **the form has no endpoint** — it composes
  a `mailto:` to a real address. Both phase 10 / user.
- **The five footer service icons are placeholder art** (I-014, phase 10). The
  `creative-development` glyph was redrawn this phase because the old one was a no-code metaphor,
  but it is placeholder like the other four.
- **I-013 is materially smaller than it was** — the caps wordmark fills 71.6% of its mobile column
  where the lowercase form filled ~51%. Still open, still phase 12.

**In the harness**

- **3 timeline assertions are still pending**, owed by phases 4 and 5. Unchanged.
- **`matter-js` and `plyr` absence checks are still vacuous** — not installed. `three`'s is not,
  and it passes.
- **The hero's off-screen check injects its own scroll height.** `behaviour.hero.ts` grows `body`
  and calls `lenis.resize()` because the homepage has none. **Delete those lines once your hero
  section gives the page real height** — the comment says so in place.

## Things that will bite you

- **Playwright's element screenshot clips the page to the element's box; it does not isolate the
  element.** The hero is `inset: 0`, so the first baked fallback came back with the navbar and the
  wordmark painted over the canvas. Hide siblings first.
- **Lenis caches its scroll limit from the content element.** Growing `documentElement` and then
  calling `lenis.scrollTo(2700)` **silently clamps to the stale limit** — the page does not move
  and nothing errors. Grow `body` and call `lenis.resize()`. This cost me two false "the suspend is
  broken" diagnoses.
- **React reconciles away DOM you inject into `main`.** The same check first appended a spacer
  there and it vanished. Anything a test injects has to live somewhere React does not own.
- **Backticks inside a GLSL template literal end the string.** Writing `` `roughness` `` in a code
  comment inside the shader source is a build error with a confusing message.
- **`three`'s colour management will silently triple an additive literal.** It round-trips a base
  colour correctly and mangles anything added in the middle. `apertureScene.ts` sets
  `outputColorSpace` to linear so §2's numbers mean what they say; if you touch that file, know
  why it is there.
- **A casing change is a metrics change.** `NO FiLTER` overran the navbar's measured `4.25rem` box
  by 8% — 5.6px eaten out of the gap before the links, invisible in every screenshot because
  `flex: none` means an overrun neither clips nor collides. Found by measuring, not looking. If you
  change any string that sits in a measured box, measure it.
- **The dev server must not be running when you `verify`.** Inherited, still true.
  `Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

## Anything surprising

**The spec section with no reference to transcribe is a different kind of document, and has to be
read differently.** §2's scene graph and its GLSL are *authored intent* — tonik's object is a
Spline binary the brief deliberately does not copy — so unlike §1's ratios or §20's IX2 curves,
they were never measured off anything. Four of its statements do not survive being followed to the
letter, and the first render was wrong three ways at once:

- The blades stood upright through a tipped ring, because §2 hangs the tilt off the *Ring* line
  and they are one mechanism.
- The object rendered near-black, because the lambert term was normalised by all three light
  intensities and the two directional lights face each other, so no surface can receive both.
- It overflowed the viewport on all four sides, because §2's camera and §2's composition target
  contradict each other.

**None of that is visible in the source.** CLAUDE.md's model policy singles this phase out as
resting entirely on judgement; this is what that meant in practice. **Render it and look at it
against the reference capture** — that is the only check that finds this class of problem, and it
found all four.

**The check that pays for itself is the one that reads a relationship, not a value.** "The blades
outrun the ring" is not a number in any file; it is the ratio between two rotations, and no
screenshot and no registered timeline can see it. Writing that assertion is what surfaced the
per-frame damp bug. **The pattern generalises — when a spec says one thing moves faster than
another, assert the ratio.**

**The two degraded paths should be the same picture.** §2 asks for a baked still "at its load-in
pose", but the load-in ends with the object still turning, so there is no frame that *is* the
pose. §2 had already fixed one for a different reason — reduced motion renders exactly one frame
at `rotation.y = 0.4`. Baking the fallback *through* that path makes it deterministic and specced,
and means a visitor with no WebGL and a visitor who asked for no motion see the same hero instead
of two different ones.

**tonik's own numbers were wrong about tonik.** §3 argues against Spline partly on "Three ~48KB
gz". It is 141KB. The conclusion still holds — Spline is ~380KB plus a scene — but the argument
that reached it was not sound, and the budget built on the same estimate failed the moment it met
a real bundle.

## Verification state

```
Run: 2026-08-26 · Phase 02 · branch phase/02-brand-3d

tokens  ✅ 136/136
motion  ⚠️ 142/145  (3 pending, owed by phases 4 and 5)
visual  ⚠️ reviewed by agent — see judgement
budget  ✅ 5/5
```

Key figures: **JS 302.8KB / 320KB** · total 369.4KB / 1800KB · CLS 0.0027 · **13,064 triangles /
40,000** · ring sweep 0.394/0.4 · blade sweep 0.592/0.6 · **ratio 1.50×**.

Full report: `tools/verify/output/report.md` (committed). Phase record:
`docs/build/phases/PHASE-02.md`.

## What you should do first

1. `git checkout main && git pull && git checkout -b phase/03-home-upper`, set STATE to
   in-progress, commit that immediately.
2. **`npm run verify`** before you touch anything. It should be green.
3. **Reset `AGENT_JUDGEMENT` to `null`** in `tools/verify/visual.config.ts`. Mine describes a hero,
   a footer and a contact panel. Leave it and your run goes green on a stale judgement and the
   visual check silently stops meaning anything.
4. **Put `data-hero` on the hero section** as you build it — that is the whole of I-020.
5. **Watch the 17KB.** Check `verify:budget` after SplitType and after the showreel, not at the
   end of the phase.
6. `docs/research/screens/tonik-hero-01.png` is your reference and the `hero` shot in
   `visual.config.ts` is already enabled — it captures at 1512 and 390 and you re-judge it with
   your copy over the object.

## Commands you'll need

```bash
npm run dev                # :3000 — stop it before you verify
npm run verify             # the gate — ~3 min now, the hero check adds three browser contexts
npm run verify:motion      # ~90s; 13 of the assertions drive a real WebGL context
npm run verify:visual      # then OPEN tools/verify/output/contact-sheet.html
npm run brand:assets       # regenerates favicon / apple icon / 512 / OG card
npm run hero:fallback      # rebakes public/hero-aperture.webp — needs `npm run dev` running
npm run lint && npx tsc --noEmit
```

Freeing port 3000 on Windows when `verify` says the server exited early:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Reading the hero's live state, which is how every hero assertion works:

```js
window.__HERO__          // { mode, running, triangles, reducedMotion }
window.__HERO_SCENE__.debug()   // { ringY, ringX, bladesY, bladesX, assemblyY, cameraZ, blades }
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
