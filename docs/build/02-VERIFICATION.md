# Verification

`npm run verify` is the gate. Nothing is handed off without it green and its report committed.

The point is not testing for its own sake. It is that **"I implemented it" and "it is correct"
are different claims**, and across a dozen sessions only the second one survives. The harness
converts the second claim into something an agent cannot fake.

Built in Phase 0. Extended by every phase after.

---

## The four checks

```bash
npm run verify           # all four, writes report, non-zero exit on failure
npm run verify:tokens    # computed styles vs the token table
npm run verify:motion    # GSAP timelines vs specced durations/eases
npm run verify:visual    # screenshots, ours vs tonik
npm run verify:budget    # bundle size + Lighthouse
```

| Check | Catches | Misses |
|---|---|---|
| tokens | wrong hex, wrong rem, wrong tracking, broken fluid root | wrong layout |
| motion | wrong duration, ease, stagger, timeScale | wrong feel |
| visual | wrong layout, spacing, composition | wrong timing |
| budget | bloat, slow LCP, oversized media | correctness |

No single check is sufficient. Together they cover everything that has a right answer.

---

## 1. `verify:tokens`

Boots the dev server, opens pages in Playwright, reads `getComputedStyle` on probe elements,
asserts against a machine-readable copy of the token table.

`tools/verify/tokens.config.ts`:

```ts
export const TOKEN_ASSERTIONS = [
  // ── the fluid root: the single most important assertion on the site ──
  { at: 1512, selector: 'html', prop: 'fontSize', expect: '16.45px', tolerance: 0.05 },
  { at: 1440, selector: 'html', prop: 'fontSize', expect: '16px' },
  { at: 1920, selector: 'html', prop: 'fontSize', expect: '19px',    tolerance: 0.05 },

  // ── ground and text ──
  { at: 1512, selector: 'body', prop: 'backgroundColor', expect: 'rgb(33, 33, 33)' },
  { at: 1512, selector: 'body', prop: 'color',           expect: 'rgb(239, 239, 239)' },

  // ── type scale, in px at 1512 (rem × 16.45) ──
  { at: 1512, selector: '[data-t="h1"]',    prop: 'fontSize',      expect: '98.7px', tolerance: 0.5 },
  { at: 1512, selector: '[data-t="h1"]',    prop: 'letterSpacing', expect: '-2.4675px', tolerance: 0.05 },
  { at: 1512, selector: '[data-t="h1"]',    prop: 'fontWeight',    expect: '400' },
  { at: 1512, selector: '[data-t="label"]', prop: 'fontSize',      expect: '12.34px', tolerance: 0.5 },
  { at: 1512, selector: '[data-t="label"]', prop: 'textTransform', expect: 'uppercase' },

  // ── layout ──
  { at: 1512, selector: '.padding-global', prop: 'paddingLeft', expect: '41.13px', tolerance: 0.5 },
];
```

**Every typography component carries a `data-t` attribute** naming its scale token. That is the
hook this check uses, and it costs nothing.

### The display-weight rule, enforced

```ts
// no display text may ever be bolder than 400
{ selectorAll: '[data-t^="h"], [data-t^="p"]', prop: 'fontWeight', expectAll: '400' }
```

This catches the single easiest way to break the look.

---

## 2. `verify:motion`

The hard one, and the most valuable. Asserts that the timelines we wrote have the durations,
eases and staggers the spec names.

**Approach:** components register their timelines on a global registry in dev builds only.

```ts
// lib/motion/registry.ts  — compiled out of production
export function registerTimeline(id: string, tl: gsap.core.Timeline) {
  if (process.env.NODE_ENV !== 'development') return;
  (window.__TIMELINES__ ??= {})[id] = tl;
}
```

```ts
// in a component
const tl = gsap.timeline({ paused: true });
tl.to(...);
registerTimeline('work-card.hover', tl);
```

The check reads them back and asserts shape:

```ts
export const MOTION_ASSERTIONS = [
  { id: 'loader.enter',      totalDuration: 1.0,
    tweens: [ { target: '.loader__mark', duration: 0.4, ease: 'power2.inOut' },
              { target: '.loader',       duration: 0.6, ease: 'power2.inOut' } ] },

  { id: 'work-card.hover',
    tweens: [ { duration: 0.25, ease: 'power1.inOut', props: { y: '-110%' } },
              { duration: 0.4,  ease: 'power1.inOut', props: { opacity: 0.3 } } ] },

  { id: 'contact.open',      totalDuration: 1.5, tweenCount: 6,
    tweens: [ { duration: 0.4 }, { duration: 0.7, position: '<+0.3' } ] },

  { id: 'accordion.open',    tweens: [ { duration: 0.7 }, { duration: 0.5 } ] },
  { id: 'accordion.close',   tweens: [ { duration: 0.6 }, { duration: 0.6, position: '>-0.1' } ] },
];
```

### Also asserted

- **Reverse discipline** — every registered hover timeline's `reverse()` path must apply
  `timeScale(1.2)` or `1.5`. Checked by invoking and reading `timeScale()`.
- **matchMedia gating** — at a 991px viewport, `gsap.matchMedia()` contexts for hover, parallax
  and text reveal must report inactive. Catches the most common responsive bug on this build.
- **ScrollTrigger hygiene** — after navigating between routes twice,
  `ScrollTrigger.getAll().length` must return to its baseline. Catches leaks.
- **Single loop** — `gsap.ticker` has exactly one Lenis callback; no stray `requestAnimationFrame`.

---

## 3. `verify:visual`

Screenshots our build and tonik at matched viewports and scroll positions, writes a side-by-side
contact sheet.

```ts
// tools/verify/visual.config.ts
export const SHOTS = [
  { name: 'hero',        ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 0 },
  { name: 'stack-wall',  ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 950 },
  { name: 'works-a',     ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 1900 },
  { name: 'services',    ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 8250 },
  { name: 'cta',         ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 9320 },
  { name: 'footer',      ours: '/',              theirs: 'https://www.tonik.com/',              scroll: 11984 },
  { name: 'cs-hero',     ours: '/works/tessera', theirs: 'https://www.tonik.com/case-studies/letta', scroll: 0 },
  { name: 'service',     ours: '/services/product-design', theirs: 'https://www.tonik.com/product-design', scroll: 0 },
];
export const VIEWPORTS = [ { w: 1512, h: 900 }, { w: 390, h: 844 } ];
```

Scroll positions are tonik's **measured** section offsets from the teardown. Our page will not
match them exactly once our content differs — that is expected and fine. What must match is
**composition**: gutters, type scale, vertical rhythm, the relationship of elements.

**This check does not pass or fail automatically.** It produces
`tools/verify/output/contact-sheet.html` and the agent is required to open it and record a
judgement in the report. Automating a pixel-diff against a site with different content would
produce noise, not signal.

> Reference screenshots of tonik already exist in `docs/research/screens/` (22 of them). Use
> them for offline comparison rather than re-fetching tonik on every run.

---

## 4. `verify:budget`

| Metric | Budget | Source |
|---|---|---|
| JS on `/`, gzipped | < 190KB | `60-architecture-and-build.md` §5 |
| Home page total | < 1.8MB | " |
| Largest card poster | ≤ 250KB | " |
| Largest reel | ≤ 1.2MB | " |
| LCP | < 2.5s | " |
| CLS | < 0.05 | " |
| Lighthouse Perf | ≥ 85 desktop / ≥ 70 mobile | " |
| Matter.js in initial bundle | **must be absent** | `70-physics-footer.md` §7 |
| Three.js in initial bundle | must be dynamically imported | " |

Uses `@next/bundle-analyzer` output plus `mcp__chrome-devtools__lighthouse_audit`.

---

## The report

`tools/verify/output/report.md`, regenerated each run, **committed as evidence**:

```markdown
# Verification report
Run: 2026-08-26T14:22:10Z · Phase 04 · commit a1b2c3d · branch phase/04-works-grid

## Summary
tokens  ✅ 47/47
motion  ✅ 18/18
visual  ⚠️  reviewed by agent — see judgement
budget  ✅ 6/6

## tokens
✅ html@1512 fontSize = 16.45px
✅ html@1440 fontSize = 16px
... (all assertions, pass or fail, with actual vs expected)

## motion
✅ work-card.hover  tween[0] duration 0.25 ease power1.inOut
✅ work-card.hover  tween[1] opacity → 0.3
❌ work-card.hover  reverse timeScale expected 1 got 1.5   ← example failure

## visual
Contact sheet: tools/verify/output/contact-sheet.html
Agent judgement: composition matches at 1512. At 390 our works grid gutter is
1.25rem vs tonik's — correct per spec (mobile gutter override). No action.

## budget
✅ JS gzip 171KB / 190KB
✅ matter.js absent from initial bundle
```

The **agent judgement** line on `visual` is mandatory and must be specific. "Looks good" is not
a judgement; it is a failure to perform the check.

---

## Growing the harness

Every phase adds assertions for what it built. This is part of the phase, not optional extra:

| Phase | Adds |
|---|---|
| 1 | loader, navbar mini threshold, contact panel timeline, footer sibling-dim |
| 2 | hero parallax curve endpoints, DPR clamp, loop suspends off-screen |
| 3 | reveal scrub range, marquee seamlessness |
| 4 | all three hover layers, differential parallax rates, mobile sheet is static |
| 5 | accordion open/close sequences, culture wipe |
| 6 | accent crossfade duration, cursor drift range, lightbox slide |
| 7 | FAQ auto-numbering, ScrollTrigger count after filtering |
| 8 | pinned range, flythrough scrub, 60fps under load |
| 9 | prose measure, Shiki is build-time |
| 10 | asset budgets |
| 11 | pit sleeps, absent from initial bundle, reduced-motion static |
| 12 | full sweep, a11y, Lighthouse |

**A phase that adds no assertions has not really been verified** — it has only been checked
against assertions written for someone else's work.

---

## Prove the harness works

Once, in Phase 0, and any time you substantially change it:

1. Change a token to a deliberately wrong value → `verify:tokens` **must** fail.
2. Change a duration to a deliberately wrong value → `verify:motion` **must** fail.
3. Revert both. Re-run. Must pass.
4. Record that you did this in the phase record.

A harness that has never failed is not known to work. It is just a script that exits zero.
