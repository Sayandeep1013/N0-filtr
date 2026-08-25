# The block pit — physics playground below the footer

An interactive pile of soft, rounded tiles sitting after the footer. Sweep the cursor through
them and they scatter. Grab one, drag it, let go and it falls. Every value below is verified
against a live Matter.js runtime, not taken from memory.

---

## 1. Why Matter.js (and the number that decided it)

I measured a production Rapier build while researching this — [Unseen's Cellular
experiment](https://unseen.co/labs/cellular/), which uses Rapier 3D + Three.js:

| Asset | Size |
|---|---|
| `rapier_wasm3d_bg.wasm` | **1,534 KB** |
| app bundle | 266 KB |

Rapier is excellent, but a 1.5MB WASM payload (~450KB brotli) for a footer toy is
indefensible on a site already carrying Three.js and GSAP. **Matter.js is ~90KB raw / ~25KB
gzipped**, pure JS, no WASM fetch, no async init.

The problem is also genuinely 2D: tiles in a tray, viewed head-on. 3D physics would buy us
nothing visible and cost 18× the bytes.

| Engine | Payload | Verdict |
|---|---|---|
| **Matter.js** | ~25KB gz | ✅ chosen |
| cannon-es | ~35KB gz | 3D, unnecessary here |
| Rapier 2D | ~250KB br | overkill |
| Rapier 3D | ~450KB br | 18× the cost, no visible gain |

---

## 2. The translation into our theme

This is not a bag of primary-coloured kids' blocks. It is **the stack wall, made physical.**

The same technology wordmarks that sit as a static grid in the hero (§11 of the components
spec) fall into a pile at the bottom of the page. The site opens with our stack stated flatly
and closes with it as something you can shove around. That is the idea, and it is why the pit
earns its place rather than being decoration.

### Tile design

```
┌──────────────┐   background : --grey-800  #3b3b3b   (majority)
│              │                --grey-900  #2e2e2e   (variation)
│   THREE.JS   │                --white     #efefef   (≈4 tiles, dark text)
│              │                <work accent>          (≈3 tiles, from the twelve)
└──────────────┘   border     : 1px solid --white-30
                    radius     : 22% of tile size  (matches Matter's chamfer)
                    label      : --t-label — .75rem IBM Plex Mono, UPPERCASE, -.015rem
```

**Accent tiles are drawn from the twelve works' sampled accents** — the same values that theme
the case-study pages. The pit is the only other place on the site where those colours appear
together, which quietly links it to the work.

### Shape mix

| Shape | Count | Size | Notes |
|---|---|---|---|
| Square tile | 60% | 64 / 88 / 112px | the default; carries a label |
| Wide pill | 25% | 140–190 × 56px | longer wordmarks (`CLOUDFLARE WORKERS`) |
| Disc | 15% | 56–76px | unlabelled, breaks the grid rhythm |

Three sizes only, on the same modular feel as the type scale. No random sizing — the pile
should look composed, not spilled.

---

## 3. Verified Matter.js baseline

Read off a live `Matter.Engine.create()` and a fresh body, not from docs:

| | Default | Ours | Why |
|---|---|---|---|
| `gravity.y` | 1 | **1** | keep |
| `gravity.scale` | 0.001 | **0.0011** | fractionally heavier, reads more settled |
| `positionIterations` | 6 | **8** | cleaner stacking, no jitter in the pile |
| `velocityIterations` | 4 | **6** | " |
| `constraintIterations` | 2 | 2 | keep |
| `enableSleeping` | **false** | **true** | essential — a settled pit costs ~0 CPU |
| `restitution` | 0 | **0.35** | default is dead-flat; 0.35 is soft, not rubbery |
| `friction` | 0.1 | **0.4** | tiles should not skate |
| `frictionAir` | 0.01 | **0.02** | the "fluffy" tell — slightly damped fall |
| `frictionStatic` | 0.5 | 0.5 | keep |
| `density` | 0.001 | **0.0012** | |
| `slop` | 0.05 | **0.02** | tighter contacts, neater pile |
| `chamfer` | null | **`{radius: size*0.22}`** | verified: 4 verts → **16 verts** |

`chamfer` is real geometry, not a paint trick — the rounded corner participates in collision,
which is why chamfered tiles settle into a pile that *looks* soft.

---

## 4. Interaction model

Three distinct behaviours. Only one is built into Matter.

### 4.1 Sweep — push without clicking

`MouseConstraint` only acts on press, so hover-push needs its own mechanism.

A static circular body follows the pointer and is moved with the **third argument** of
`Body.setPosition`, which I verified exists (arity 3) and writes velocity directly:

```js
// Body.setPosition(body, position, updateVelocity)
// source confirms: updateVelocity → body.velocity = delta, positionPrev reset
Body.setPosition(pusher, { x: px, y: py }, true);
```

```js
const pusher = Bodies.circle(-999, -999, 46, {
  isStatic: true,
  render: { visible: false },
  friction: 0, restitution: 0.2,
});
```

Because the pusher carries real velocity, a **fast** sweep scatters tiles hard and a slow drift
nudges them — the interaction is pressure-sensitive for free. This is the single most important
detail for making it feel alive; a pusher moved with plain `setPosition` feels dead.

The pusher parks at `(-999,-999)` on `pointerleave` so it cannot disturb a settled pile.

### 4.2 Drag and throw

```js
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: Mouse.create(canvasEl),
  constraint: {
    stiffness: 0.12,          // verified default is 0.1 — slightly firmer
    damping: 0.1,             // verified default is 0 — 0 feels whippy
    render: { visible: false } // ⚠ VERIFIED DEFAULT IS TRUE
  }
});
```

> **The classic bug:** `render.visible` defaults to `true` with `strokeStyle: '#90EE90'` — a
> bright green line from cursor to body. Verified on a live instance. Must be disabled.

**Throwing needs no extra code.** The constraint is a spring: while dragging, the body
accumulates genuine velocity chasing the cursor. On release the constraint detaches and that
velocity persists, so the tile flies and falls. Fling behaviour is emergent, not scripted.

Grab affordance: `cursor: grab` over the pit, `grabbing` while held, via
`mouseConstraint` `startdrag` / `enddrag` events.

### 4.3 Entry drop

On first scroll into view, tiles drop in from above the frame, staggered:

```js
tiles.forEach((b, i) => {
  Body.setPosition(b, { x: b.spawnX, y: -120 - Math.random() * 400 });
  Body.setAngle(b, gsap.utils.random(-0.4, 0.4));
  // released on a stagger of ~40ms, from 'random'
});
```

Matching the site's motion signature: `stagger: { amount: .8, from: 'random' }`.

---

## 5. Containment

Static walls, all `render.visible: false`:

| Wall | Placement |
|---|---|
| Floor | at the section's bottom edge, 200px thick, extending 400px past both sides |
| Left / Right | full height, 200px thick, flush with the viewport edges |
| Ceiling | **1500px above** the top edge, not at it |

The high ceiling matters: a hard throw should be able to leave the frame and come back. A
ceiling flush with the top makes the pit feel like a box; one far above makes it feel like a
tray under open air.

**Escape guard:** any body whose position leaves the bounds by >600px (a physics blow-out) is
respawned at the top rather than lost. Checked once per second, not per frame.

---

## 6. Rendering — DOM, not canvas

Matter's built-in `Render` is a debug view. We drive **real DOM elements** from body
transforms instead.

```js
// in the GSAP ticker, after Engine.update
for (const t of tiles) {
  t.el.style.transform =
    `translate3d(${t.body.position.x - t.w/2}px, ${t.body.position.y - t.h/2}px, 0)` +
    ` rotate(${t.body.angle}rad)`;
}
```

**Why DOM over canvas:**
- Real IBM Plex Mono at `.75rem` — canvas text at small sizes is measurably worse
- Tiles inherit the actual CSS tokens, so the pit can never drift from the design system
- Hairline borders stay crisp at any DPR without manual scaling
- Labels are selectable and readable by assistive tech

60 elements × one transform write per frame is trivial. Each tile gets
`will-change: transform; contain: layout paint;` and `position: absolute; top: 0; left: 0`.

Canvas would only win past ~300 bodies, and we run 44.

---

## 7. Loop and performance

```js
// one ticker for the whole site — no Runner, no second rAF
const FIXED = 1000 / 60;
let acc = 0;
gsap.ticker.add((time, deltaMs) => {
  if (!inView) return;                 // IntersectionObserver gate
  acc += Math.min(deltaMs, 100);       // clamp — prevents the spiral of death
  while (acc >= FIXED) { Engine.update(engine, FIXED); acc -= FIXED; }
  syncDom();
});
```

**Fixed timestep is not optional.** Feeding `Engine.update` a variable delta makes stacks
jitter and restitution drift with framerate.

`Matter.Runner` is deliberately not used — it owns its own rAF loop, which would race the GSAP
ticker already driving Lenis and ScrollTrigger. One loop for the whole site.

| Budget | Value |
|---|---|
| Body count | **44** desktop · **24** ≤767 |
| Payload | ~25KB gz, lazy-loaded on approach |
| CPU when settled | ~0 — `enableSleeping: true` |
| CPU when active | < 3ms/frame |
| Runs when | only while the section intersects the viewport |

**Lazy loading:** Matter is dynamically imported when the pit is within 1.5 viewports of the
fold. It never appears in the initial bundle.

---

## 8. Placement and layout

```
… footer (wordmark at 14vw) …
────────────────────────────────  1px --white-30
  .pit                            height: 60vh (min 420px, max 680px)
                                  background: --black
                                  overflow: hidden
                                  cursor: grab
  ┌ label   "DRAG US AROUND"      --t-label, top-left, --text-secondary
  └ reset   "RESET"               --t-label, top-right, hover → --white
```

The pit is the **last** thing on the page, below the footer — the site's punchline, not a
section. Nothing follows it. It sits on the same `--black` ground with a single hairline
separating it from the footer above.

`overscroll-behavior: none` on the pit so trackpad momentum inside it does not bounce the page.

---

## 9. Responsive, touch, accessibility

| Context | Behaviour |
|---|---|
| ≤767px | 24 tiles, smaller sizes, pit height 45vh |
| Touch | drag/throw works via Matter's touch handling; the sweep pusher is disabled (no hover) |
| Touch scroll | `mouse.element` touch listeners are **passive-safe** — Matter attaches non-passive `touchmove` and calls `preventDefault`, which would trap page scroll. We remove its touch bindings and re-add our own that only preventDefault once a body is actually grabbed. |
| Keyboard | the pit is `aria-hidden` and not focusable — it carries no information the footer does not already state in text |
| `prefers-reduced-motion` | **no simulation at all.** Tiles render once in a pre-computed settled arrangement and never move. No pusher, no drag, no entry drop. |
| No JS | nothing renders; the section collapses to zero height |

The reduced-motion path is the important one. A pit that scatters on cursor movement is
exactly the kind of thing that triggers vestibular discomfort, so it does not degrade — it is
absent, replaced by a static pile that still says the same thing.

---

## 10. Tile content

22 wordmarks, matching the hero stack wall exactly:

`REACT` · `NEXT.JS` · `TYPESCRIPT` · `THREE.JS` · `GLSL` · `GSAP` · `LENIS` · `SUPABASE` ·
`POSTGRES` · `CLOUDFLARE` · `YJS` · `EXPO` · `REACT NATIVE` · `KOTLIN` · `GO` · `PYTHON` ·
`NODE` · `FFMPEG` · `VERCEL` · `GROQ` · `WEBSOCKETS` · `MATTER.JS`

Plus ~22 unlabelled tiles and discs as filler, for 44 bodies total.

`MATTER.JS` being in the pit, made of Matter.js, is the joke. Leave it in.

---

## 11. Build steps

1. Section shell, hairline, labels, IntersectionObserver gate, dynamic import
2. Engine + walls + fixed-timestep loop on the GSAP ticker
3. Tile factory — shape mix, chamfer, DOM elements, token classes
4. DOM sync in the ticker
5. `MouseConstraint` (with `render.visible: false`) → drag and throw
6. Velocity pusher → sweep
7. Entry drop stagger + RESET
8. Sleeping, escape guard, mobile counts
9. Touch listener fix, reduced-motion static path
10. Tune: `frictionAir` and `restitution` are the two dials that decide whether it reads
    "fluffy" or "hard". Tune them last, together, on real content.

**Acceptance:** a fast cursor sweep scatters the pile and it re-settles within ~2s; a tile can
be picked up, flung off-screen, and falls back in; the pile sleeps (0% CPU) when untouched;
the section never runs while off-screen; reduced-motion shows a static pile.
