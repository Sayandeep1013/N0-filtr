# Design system

Everything here is either extracted verbatim from tonik or derived from our locked decisions.
This file is the single source of truth for `app/styles/tokens.css`.

## 1. The fluid-root system

This is the whole responsive strategy. Get it right and the rest follows.

```css
html { font-size: calc(0.4375rem + 0.625vw); }        /* ≥1441px: scales linearly */
@media (max-width: 1440px) { html { font-size: 1rem } } /* ≤1440px: locked at 16px */
```

- At 1512px → root = **16.45px**. At 1920px → 19.0px. At 2560px → 23.0px.
- Every dimension on the site is in `rem`. Nothing is in `px` except hairlines (`1px`) and the
  footer wordmark (`14vw`).
- Below 1441px the layout is **fixed-scale and reflows by breakpoint**, not by scaling.

> tonik ships a redundant `max-width:2400px` duplicate and a redundant `max-width:991px` rule.
> We collapse both. Behaviour is identical.

### Breakpoints

| Name | Query | What changes |
|---|---|---|
| `desktop` | ≥992px | full experience: hover, parallax, text reveal, 2-col works grid |
| `tablet` | 768–991px | no hover/parallax/text-reveal; works grid still 2-col; accordion desktop layout |
| `mobile` | ≤767px | works grid 1-col, **hover sheet becomes static content**, accordion height-only, stack wall becomes an auto-scrolling marquee |
| `small` | ≤479px | tighter gutters, heading scale step-down |

The three JS thresholds tonik actually branches on — and we mirror exactly — are
**`>991`** (hover, parallax, text reveal, works interactions) and **`>767`** (accordion layout,
stack marquee). Implemented with `gsap.matchMedia()`, never with raw `resize` listeners.

## 2. Colour

```css
:root {
  /* primitives */
  --black:        #212121;   /* page ground */
  --white:        #efefef;   /* primary text */
  --grey-900:     #2e2e2e;   /* secondary ground: CTA panel, open accordion row */
  --grey-800:     #3b3b3b;   /* tertiary ground: cards, loader, social bars */
  --grey-700:     #737373;   /* secondary text, inactive nav */
  --grey-600:     #e0e0e0;   /* form fills, alternate borders */

  /* alphas */
  --white-30:     #ffffff4d; /* hairlines — the most-used border on the site */
  --white-10:     #ffffff1a; /* ghost button fills */
  --white-50:     #efefef80; /* muted text on dark */
  --black-50:     #21212180; /* scrim */
  --black-70:     #212121b3; /* heavy scrim */

  /* semantic */
  --bg-primary:      var(--black);
  --bg-secondary:    var(--grey-900);
  --bg-tertiary:     var(--grey-800);
  --bg-alternate:    var(--white);    /* inverted surfaces */
  --bg-transparent:  var(--white-10);
  --text-primary:    var(--white);
  --text-secondary:  var(--grey-700);
  --text-alternate:  var(--black);    /* on inverted surfaces */
  --border-primary:  var(--white-30);
  --border-alternate:var(--black);

  /* system */
  --success: #027a48;  --success-bg: #ecfdf3;
  --error:   #b42318;  --error-bg:   #fef3f2;

  /* per-page accent — set by the case-study template, defaults to ground */
  --accent: var(--black);
}
```

**The inversion pair is the core move.** `--bg-alternate` / `--text-alternate` flips any surface
to light-on-dark → dark-on-light. It drives the contact panel, the accordion's right panel, the
CONTACT pill, the mobile works sheet, and the entire case-study page when its accent is light.

### Accent theming (case studies)

Each work carries a light and a dark accent (already sampled — see the content inventory).
On a case-study page:

```
--accent        : <work.accent.dark>       /* on our dark ground */
--accent-ground : <work.accent.light>      /* the page ground if the case inverts */
```

Transition on mount, matching tonik's `.7s`:

```js
gsap.fromTo([navMini, overlays, imageTints],
  { backgroundColor: '#212121' },
  { backgroundColor: accent, duration: .7 });
```

And the outgoing loader tints to `darken(accent, 10%)` before navigating, so the colour lands
before the page does.

## 3. Typography

### Families

| Token | Family | Source | Weights |
|---|---|---|---|
| `--font-display` | **General Sans** | Fontshare (free commercial) | 300, 400, 500, 600 |
| `--font-mono` | **IBM Plex Mono** | Fontsource / Google | 300, 400, 500, 600, 700 |

Self-hosted via `next/font/local` — no network font requests, no CLS. `font-display: swap`.
Fallback stacks: `General Sans, Inter, Helvetica Neue, Arial, sans-serif` /
`IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace`.

> General Sans was chosen for its **single-storey `g`**, which is the detail that most makes
> Neue Montreal look like itself. Switzer is the fallback choice if the specimen comparison
> during build says otherwise.

### Scale

Names mirror tonik's so the teardown maps directly onto our code.

| Token | Size / line-height | Tracking | Family | Used for |
|---|---|---|---|---|
| `--t-h1` | `6rem / 6rem` | `-.15rem` | display | hero h1, "Get in touch." |
| `--t-h1-sm` | `3.25rem / 3.25rem` | `0` | display | secondary heroes |
| `--t-h2` | `5rem / 5rem` | `0` | display | section headings |
| `--t-h3` | `2rem / 2.5rem` | `0` | display | card titles, panel headings |
| `--t-h4` | `2rem / 2rem` | `0` | display | accordion rows, FAQ questions |
| `--t-h5` | `1.5rem / 1.75rem` | `0` | display | sub-headings |
| `--t-h6` | `1rem / 1.25rem` | `0` | display | inline headings |
| `--t-p-big` | `1.25rem / 1.6` | `0` | display | lead paragraphs, testimonial quotes |
| `--t-p` | `1rem / 1.25rem` | `0` | display | body |
| `--t-p-sm` | `.625rem / .75rem` | `0` | display | fine print |
| `--t-label-big` | `.875rem / .875rem` | `-.0175rem` | mono, UPPER | section labels |
| `--t-label` | `.75rem / .75rem` | `-.015rem` | mono, UPPER | **the workhorse** — nav, buttons, table keys, captions |
| `--t-label-sm` | `.5rem / .5rem` | `-.01rem` | mono, UPPER | superscripts, numerals |

All display weights are **400**. The site never bolds its display face — hierarchy is carried by
size and colour alone. This is a defining property of the look; do not introduce a 600 heading.

### Mobile step-down (≤767)

`--t-h1: 2.5rem/2.5rem`, tracking `-.05rem` · `--t-h1-sm: 2.5rem/2.5rem`, tracking `-.05rem` ·
`--t-h2: 2.5rem/2.5rem` · `--t-h3/-h4: 1.5rem/1.75rem`.

Label sizes are **unchanged** — the mono labels stay at `.75rem` at every breakpoint, which is
what keeps the interface feeling technical on small screens. Confirmed by re-measure: `.75rem`
label and `.5rem` label-sm are byte-identical at 1512 and 390, tracking included.

> **Re-measured in phase 1** (2026-08-25, tonik at 390, root 16px). The h1 and h1-sm rows above
> replace `3rem/3rem` and an unstated h1-sm. Three separate elements — the homepage hero
> `.t-heading-1-rg`, the `/product-design` hero `.t-heading-1-small-rg` and `.cta-heading` — all
> compute to `40px / 40px / -0.8px`. Below 768 the primary and secondary hero steps **collapse
> into one**, which is why the spec's silence about h1-sm produced an inversion. See I-005, I-006.
>
> The same trip found h3–h6 disagreeing with the table above as well, from a thinner sample.
> Those are **not** changed here — see I-011, owed by phase 3.

## 4. Layout

```css
--gutter:  2.5rem;                    /* .padding-global */
--content: calc(100vw - (2 * 2.5rem));/* .container-large */
--hairline: 1px solid var(--border-primary);
```

- One container. `max-width: 100%`, padded `0 var(--gutter)`. There is **no max content width** —
  the site is edge-to-edge at every viewport and scales by the fluid root instead.
- Mobile gutter drops to `1.25rem`.
- Section rhythm: sections are separated by their own internal padding, not by margins. Standard
  vertical padding is `8rem` desktop, `4rem` mobile.

### The 12-column reference grid

tonik does not use a formal grid class, but every layout resolves to twelfths of `--content`.
We define one and use it, which makes our layouts more consistent than theirs:

```css
--col: calc((var(--content) - (11 * 1.5rem)) / 12);
--grid-gap: 1.5rem;
```

Observed column spans: works cards `6/12` (536px at 1512), service hero copy `7/12`,
service spec table `4/12` right-aligned, accordion rows `8/12`, FAQ `7/12` right-aligned.

## 5. Motion primitives

The site has a narrow, consistent motion vocabulary. Encode it once.

```ts
export const DUR = {
  micro:  0.25,   // caption slide, small opacity swaps
  fast:   0.3,    // colour transitions, chevron fades
  base:   0.4,    // the default — most opacity and colour tweens
  mid:    0.5,    // panel slides, label rises
  slow:   0.6,    // loader exit, accordion close
  slower: 0.7,    // accordion open, sidebar slide-in, accent crossfade
  wipe:   0.75,   // reveal overlays
} as const;

export const EASE = {
  out:     'power3.out',    // things arriving
  in:      'power3.in',     // things leaving
  soft:    'power2.out',    // Flip transitions
  quad:    'power1.inOut',  // the loader — Webflow's inOutQuad  [ix2]
  circ:    'circ.out',      // button icon diagonal swap          [ix2]
  inOut:   'power1.inOut',  // hover state changes, IX2 'ease'
  gentle:  'power1.out',    // staggered text
  sine:    'sine',          // the pinned people scroll
  linear:  'none',          // anything scrubbed
} as const;

// Webflow IX2 easing → GSAP
// inOutQuad → power1.inOut   outCirc → circ.out
// easeInOut → power1.inOut   ease    → power1.inOut
//
// `quad` and `inOut` hold the same value on purpose — Webflow's inOutQuad,
// easeInOut and ease are all quadratic-in-out within a hair of each other. They
// stay separate names because they record different provenance.
//
// Corrected in phase 1: this table said `inOutQuad → power2.inOut`. GSAP's
// powerN is offset by one from the Penner names (Quad === Power1), so power2 is
// cubic and every [ix2] inOutQuad timeline was one power too strong. See I-017.

export const REVERSE_SCALE = 1.2;   // panels
export const REVERSE_SCALE_FAST = 1.5; // buttons
```

**Rules, observed and enforced:**

1. **Reverses run faster than forwards.** Always `timeScale(1.2)` for panels, `1.5` for buttons.
   Nothing on this site closes at the speed it opened.
2. **Scrubbed animations use `ease: 'none'`.** Scroll position is the easing.
3. **Hover timelines are built once, `paused: true`**, then `.play()` / `.reverse()`.
   Never create a tween inside a `mouseenter` handler.
4. **All hover interactions are gated at `>991px`** via `gsap.matchMedia`.
5. `ScrollTrigger.update` is driven by Lenis, never by the native scroll event.

### Smooth scroll

```js
const lenis = new Lenis({
  lerp: 0.1,
  wheelMultiplier: 0.7,
  gestureOrientation: 'vertical',
  normalizeWheel: false,
  smoothWheel: true,
  syncTouch: false,          // touch stays native — matches their smoothTouch:false
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

`[data-lenis-prevent]` on any independently-scrolling container (the contact panel body).
`lenis.stop()` / `lenis.start()` when a full-screen panel is open.

## 6. Global chrome

```css
::-webkit-scrollbar { display: none; }
html { scrollbar-width: none; }

::selection {
  background-color: var(--bg-alternate);
  color: var(--text-alternate);
}
```

Scrollbars are hidden site-wide and selection is inverted. Both are load-bearing for the look.

## 7. Reduced motion

tonik ships no `prefers-reduced-motion` handling at all. **We do**, because the site is
otherwise unusable for a motion-sensitive visitor:

```js
gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
  lenis.destroy();                       // native scroll
  ScrollTrigger.getAll().forEach(st => { st.scrub = false; });
  // reveals resolve instantly to their end state; parallax disabled;
  // the loader becomes a 200ms fade; the 3D hero holds a single static frame.
});
```

This is a deliberate, documented improvement over the source — not a deviation from the design.
