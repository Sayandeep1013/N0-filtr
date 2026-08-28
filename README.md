# No Filter

**A studio site for a studio of one.** Design and engineering for founders who ship — twelve real
projects, six services, and a footer you can play with.

Built with Next.js 15, GSAP and Three.js. Dark, typographic, and heavily animated, with every
motion value written down and machine-checked before it lands.

**[n0-filtr.vercel.app →](https://n0-filtr.vercel.app)**

![The homepage hero — the Open Aperture, rendered in WebGL](docs/screenshots/home-hero.png)

---

## What's in it

| | |
|---|---|
| **12 case studies** | Each one written from its own repository, with a sampled accent pair that themes the whole page |
| **6 services · 5 industries** | Templated pages with their own navigation and FAQ sets |
| **A blog** | MDX-adjacent typed blocks, syntax-highlit with Shiki at build time |
| **A 3D brand mark** | The Open Aperture — a housed iris mechanism in Three.js with a custom GLSL material, which tips and actuates as the pointer crosses it |
| **A block pit** | 56 Matter.js bodies piled over the footer, each labelled with something the work is actually built with. Drag them around |
| **A wire rig** | Simulated ropes strung between the culture frames. Drag a card and they swing, whip and settle |
| **Generated plates** | Every thumbnail on the site is a specimen plate drawn in code — a ruled mount, registration crosses, and one to three instruments, annotated with facts about the work it belongs to |

---

## The parts worth looking at

### The wire rig

![Poles drawn in hairlines, with simulated ropes hanging between the culture frames](docs/screenshots/wire-rig.png)

All six culture frames grow an electric pole, and wires hang between them — out of one frame,
across the gap, into the next. Every wire is fourteen verlet points with gravity and distance
constraints, pinned at both ends to the crossarm it leaves from.

It ran on four for a while, on the argument that a real street does not wire every building. That is
true about a street and wrong about this composition: 05 and 06 are the bottom row, and an omission
in the middle of a run reads as restraint where the same omission at the end of one reads as the run
having stopped.

It started as a Bézier with a hand-tuned sag term, which was fine until the cards became draggable.
A formula has no memory: it resolves to the right shape every frame, with no swing and no settle.
Simulating it deleted both tuned numbers — sag is gravity acting on a rope cut longer than its gap,
and *a stretched wire straightens* is not a rule anyone wrote, it's what happens when segments can't
exceed their rest length.

Grab any card. `lib/motion/rope.ts` · `components/motion/wireRig.ts`

### The block pit

![The footer, with labelled blocks piled over a hollow wordmark](docs/screenshots/block-pit.png)

Matter.js, lazy-loaded, running on GSAP's ticker rather than its own runner. Every tile carries a
real dependency name; the coloured ones are drawn from the twelve projects' accents, which is the
only other place on the site those colours appear together.

The wordmark behind it is hollow — outline letters with a second stroked copy masked to a circle at
the pointer, so only the strokes near your cursor take colour. On a case study it lights in that
project's own accent; everywhere else it cycles the twelve.

### The work

![The works grid](docs/screenshots/works-grid.png)

Twelve cards on a twelve-column grid with authored placements. Hovering one sends its title
travelling to the corner while an info drawer wipes in behind it.

![A case study page](docs/screenshots/case-study.png)

### The specimen plates

![One card's plate — a ruled mount, corner registration marks, two instruments and a spec rail](docs/screenshots/plate.png)

There are no stock photographs anywhere on this site. Every thumbnail is drawn in code as a printed
figure: a ruled mount with registration crosses at the corners, a header rail, one to three small
instruments on a great deal of empty ground with a part name under each, and a footer carrying a
spec line and an edition.

**Every label on it is true.** `FIG.04` is the work's real position in the twelve, the code is the
plate's actual seed, and the spec line names the instruments actually drawn and the hash they came
from. Where there is no real edition number the field is omitted rather than invented — a studio
called No Filter putting a decorative serial on its own work would be the one joke here at its own
expense.

The apparatus is DOM and only the instruments are SVG, which is a correctness choice rather than a
stylistic one. These plates are drawn into boxes whose aspect ratios the component cannot know —
16:10 on a half card, 21:9 on the full one, 4:3 on a phone — and one sliced viewBox crops 170 units
off a 21:9 plate, which is both rails and every corner mark.

`components/art/Artwork.tsx`

### The loader

The mark assembles itself and then spins: the ring forms from a line, six blades grow out of their
anchors on the inner edge, and the wheel turns — slowly at first, then accelerating — until the
curtain lifts. On a client-side navigation the whole sequence runs at 2.4× and the spin **keeps
going until the route resolves**, so the wait is the fastest part of the animation rather than a
parked logo.

The spin is not a rotation. The mark is a tilted wheel drawn in projection, so turning it on screen
tumbles its ellipse; the blade group is spun in the wheel's own plane by composing
`tilt ∘ rotate(θ) ∘ tilt⁻¹` about the centre.

`components/chrome/Loader.tsx`

### The about page

![Forty-five artefacts rising into a pinned viewport](docs/screenshots/about-people.png)

Forty-five artefacts rise out of the fold in a pinned, scrubbed sequence, staggered from random
across a 4×9 grid with a real perspective and an X-rotation. It is the best piece of motion on the
site and it is worth scrolling slowly.

---

## Running it

```bash
npm install
npm run dev          # localhost:3000
```

```bash
npm run build        # production build
npm run verify       # THE GATE — see below
npm run lint
npm run typecheck
npm run readme:shots # regenerate the images on this page (needs the dev server)
```

---

## The verification harness

The unusual part of this repo. Animation work rots quietly: a duration drifts, a setter silently
stops firing, a value gets "tidied" back to something rounder. So the motion is asserted rather than
eyeballed, and `npm run verify` has to pass before anything is called done.

```
tokens   138/138    computed styles vs the token table, at three viewports
motion   283/283    timeline durations, eases, and distances actually travelled
visual   judged     screenshot diffs, reviewed rather than thresholded
budget     7/7      bundle size, route weight, triangle count, Lighthouse
```

```bash
npm run verify:tokens
npm run verify:motion
npm run verify:visual
npm run verify:budget
```

It earns its keep. It has caught an easing curve a full power too strong across the whole site, a
`once: true` that quietly broke the back button, a homepage that came back from a scrolled page with
no ScrollTriggers at all, and two scroll parallaxes that had **never once run**, because
`gsap.quickSetter(el, 'yPercent', '%')` silently writes nothing at all. Two hundred and sixty-seven
assertions had been passing the whole time; none of them measured distance travelled. Nine now do.

The most recent catch is the one that says the most about the method. Redrawing the card thumbnails
added a few dozen elements inside each card, and `verify:motion` immediately reported that the
custom cursor no longer lagged behind the pointer — `pointerover` fires for every element crossed,
so one sweep was re-pinning the disc twenty times. Nothing about a change to a picture looked
related to a cursor, and it was found in a run started to check something else entirely.

Fixing it then failed a *different* assertion, which turned out to be the better find: two checks in
that file had been in direct contradiction — one demanding the disc snap on a move, the other
demanding it lag on the same move — and **only the bug satisfied both**. Nothing had ever been red,
so nobody had cause to read them together.

---

## How it's built

**Next.js 15** (App Router, TypeScript strict) · **CSS Modules** on a token sheet · **GSAP** +
ScrollTrigger · **Lenis** · **SplitType** · **Three.js** with custom GLSL · **Matter.js** ·
**Embla** · **Shiki** · **Plyr** · deployed on **Vercel**.

No Tailwind, no component library, no animation library beyond GSAP.

A few rules the whole codebase holds to:

- **One animation loop.** GSAP's ticker drives Lenis, ScrollTrigger and Matter. There is no second
  `requestAnimationFrame` anywhere, and `verify:motion` probes for one.
- **Everything is `rem`** on a fluid root, locked at 1440px. Two exceptions: hairlines and the
  footer wordmark.
- **Reverses run faster than forwards** — always. Nothing closes at the speed it opened.
- **The display face is never bolded.** Hierarchy comes from size and colour. The wordmark is the
  one logo-shaped exception.
- **`prefers-reduced-motion` is honoured everywhere**, and it means *reduced*, not *deleted* — a
  light that follows your pointer stays, a colour that changes on its own goes.

---

## Layout

```
app/                 routes — home, works, services, industries, about, blog, privacy
components/          by area: hero, works, case, services, about, blog, chrome, motion,
                     physics, brand, ui, art
lib/                 content model, motion tokens, the rope simulation, helpers
content/works/       the twelve case studies, one file each
docs/build/          how this was built: protocol, phases, decisions, issues, state
docs/spec/           the design system, component and motion specs, page specs
tools/verify/        the harness
```

`docs/build/DECISIONS.md` and `docs/build/ISSUES.md` are the interesting reading — every judgement
call and every bug, with the reasoning that produced it.

---

## On mobile

![The homepage at 390px](docs/screenshots/mobile-home.png)

Every interactive control clears the 44px floor, nothing scrolls sideways at 390, the nav panel is
`inert` while closed, and the effects that need a pointer or side-by-side frames simply don't render
below 992 rather than degrading into something worse.

---

<sub>Built by <a href="https://github.com/Sayandeep1013">Sayandeep</a> · No filter between the idea and the thing</sub>
