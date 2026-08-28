# Handoff

**Overwrite this file entirely at the end of every session.** It is a letter to the next agent,
not a log. The template is at the bottom.

---

# → To the agent taking the next review round

**From:** review round 9 · 2026-08-28 · **Opus** · one session

> **The site is built. You are in review rounds, not phases.** Sayandeep works through it in the
> browser, reports what is wrong, and each round is fixed, verified and committed before the next.
> Read `STATE.md`'s "Where we are" block for the full list of rounds; this letter is about round 9,
> which was the largest of them and left three things you should know before touching the same
> files.

## What round 9 changed

Six decisions, **D-057 → D-062**. All six are in `DECISIONS.md` with the reasoning; this is the map.

| | What | Files |
|---|---|---|
| D-057 | the custom cursor is white, always — no per-work tint | `components/case/CustomCursor.*` |
| D-058 | the wire rig runs all six collage frames, not four | `components/motion/wireRig.ts` |
| D-059 | the generated plates became **specimen plates** | `components/art/Artwork.*` |
| D-060 | the copy pass — six headings replaced | `lib/content/site.ts`, `about.ts`, `app/blog/page.tsx` |
| D-061 | the loader assembles a wheel and spins it | `components/chrome/Loader.*`, `ApertureMark.tsx` |
| D-062 | App Development is the sixth service | `lib/content/services.ts`, three works, `ServiceIcon` |

## Three things that will bite you if you do not read them

### 1. `<Artwork>`'s apparatus is DOM on purpose, and it is the thing most likely to be "fixed"

The plate is a `<span>` laid out in flexbox with the instruments as small square SVGs inside it. It
looks like it should obviously be one SVG. It cannot be.

**These plates are drawn into boxes whose aspect ratios the component cannot know**: 16:10 on a half
card, 21:9 on the full one, whatever a board tile's column and row spans work out to, 4:3 on a
phone. One viewBox with `preserveAspectRatio="slice"` crops the overflow — a texture field does not
care, a ruled frame does. On the 21:9 card that crop is about 170 units off the top and the bottom,
which is the header rail, the footer rail and both rows of corner marks.

Passing the ratio in does not rescue it either: the plate is inset from its box by `--card-plate`,
in `rem`, on a **fluid** root, so the true ratio moves with the viewport and no caller can state it.
The full argument is at the top of `Artwork.tsx`. If you find yourself consolidating it into one
SVG, that note is the reason not to.

### 2. Work cards get the rectilinear instruments only

`family="rectilinear"` on the card's `<Artwork>`, which drops `iris`, `orbit` and `burst`. It is not
a taste rule about the drawings — Sayandeep likes them, and `/about` keeps all seven. It is that the
card is the one place a plate is drawn *under* moving type: the title watermark travels to a corner
and the info drawer wipes across, both in straight lines, and a ring underneath reads as a second
unrelated system. `grid` and `stack` exist only because cutting three left the cards with two.

### 3. The loader's curtain waits on two latches, and that is not over-engineering

`latch = { route, intro, armed }`. The curtain rises when **both** the new pathname has rendered and
the assembly sequence has finished — whichever lands second calls `raise()`. `armed` stops a stray
pathname change raising a curtain that was never lowered.

It has to be a join because the sequence now runs on *every* navigation and the wheel keeps spinning
until the route resolves. That is the entire fix for I-067; a curtain that simply followed either
event on its own would reintroduce it. See D-061.

## What round 9 found rather than was told

Three bugs, all logged, and the pattern in them is worth carrying forward: **two were found by the
harness and one by a trace, none by looking at the page.**

- **I-066** — the plate's extra DOM made `pointerover` re-snap the custom cursor once per child
  element, deleting its lag entirely. `verify:motion` reported it in a run whose purpose was to
  check the wire rig's pole count. Nothing about the change looked related to the cursor.
- **I-067** — the loader showed a parked mark in **three** separate windows, for three different
  reasons. Found with a rAF sampler reading the mark's own animated values; the first two were
  fixed, and re-reading the same trace found the third. A loader has several windows where nothing
  is scheduled, and each one shows whatever was left on screen.
- **I-068** — the specs and the strings now deliberately disagree. Left **open**. Read it before you
  "correct" any copy back to `30-page-specs.md` or the services count back to five.

## Where to start

1. `STATE.md`, then `ISSUES.md` — I-068 is open by design and I-033, I-040 are still open from
   before.
2. **Content is what is left, not build.** 9 of 12 blog posts unwritten (D-043), the showreel is a
   placeholder (I-033), the 30 service FAQs are drafts Sayandeep has not read — and there are now
   **36**, because D-062 added six more he has also not read.
3. Phase 12's own list is untouched: Lighthouse, OG images, sitemap, robots.
4. `support@nofilter.com` still does not match the `nofilter.studio` domain (I-040).

## Two smaller things worth knowing

- **`ApertureMark` now exports `TILT_AXIS_DEGREES` and `TILT_SQUASH`.** The loader needs them to
  compose `tilt ∘ rotate(θ) ∘ tilt⁻¹` — a tilted wheel drawn in projection cannot be spun by
  rotating it on screen, that tumbles the ellipse. The mark file still owns the geometry; nothing
  retypes those numbers.
- **`--work-accent-ink` changed consumers mid-session.** The custom cursor read it, went white
  (D-057), and the plate's accent datum picked it up (D-059) — a 1px line in the *dark* accent is
  invisible on a `--grey-900` ground. It was briefly deleted as dead in between. If you are
  wondering why the property exists, that is why.

## Working notes

- **Kill Playwright browsers before launching one**, and wrap capture scripts in `try/finally`.
  Sayandeep asked for this directly after a session leaked nine headless Chromiums:
  `Get-Process chrome,chromium,headless_shell -EA SilentlyContinue | ? { $_.Path -like "*ms-playwright*" } | Stop-Process -Force`
- **`npm run verify` must own port 3000** and refuses to start if a dev server has it. Stop yours
  first. Do not edit source while it is running — a mid-build edit hung one run for fifteen minutes
  with no output.
- Model: this session ran on **Opus**, as CLAUDE.md's model policy requires.

---

## Template

```
# → To the agent picking up phase N

**From:** phase N-1 · date · model · sessions

## What is done
## What is not
## What will bite you
## Where to start
```
