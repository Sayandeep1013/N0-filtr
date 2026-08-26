# tonik — extracted design system

**Read from their live DOM, not from a capture.** Regenerate with:

```bash
npx playwright install firefox     # once — Playwright ships browsers separately
npm run extract:tonik              # firefox (default)
node tools/extract/tonik.mjs --chromium
```

Chromium is already installed for the verify harness, so `--chromium` works on a fresh checkout
with no extra download. The script says so if the Firefox binary is missing.

Output: `tools/extract/output/tonik-<engine>.json`. Firefox and Chromium agree on every figure
below; where two engines agree, the number is a property of their CSS rather than of a renderer.

Captured 2026-08-26 at 1512×900, 1920×1080, 1280×800, 390×844.

> **What this file is.** Measurements and structure — sizes, spacing, colours, transition
> vocabulary, section rhythm. Facts about a layout, and the same class of thing `docs/spec/` is
> built from.
>
> **What it is not.** Their copy, their imagery, their Spline scene and their logo are not
> collected here and are not ours to use. CLAUDE.md's line holds: *our own brand, our own work.*

---

## Why this exists

Phase 2 corrected layout by eye against a screenshot, one number at a time — the foot rail was
29px too high, the copy column 57px too far left, the play control 0.2rem out with the wrong gap.
**Every one of those is a value their page will simply tell you.**

A capture shows where things *are*. `getComputedStyle` shows *why*. One pass reads the whole
system; eyes read one number and miss the rule behind it.

---

## The container system — the thing eyes could not see

| | value |
|---|---|
| `.padding-global` | `padding-inline: 2.5rem` — 41.125px at 1512, 47.5px at 1920 |
| `.container-large` | **`max-width: 80rem`**, `margin-inline: auto` — 1316px at 1512, 1520px at 1920 |
| `.container-large.unl-width` | `max-width: 100%` — the full-bleed modifier |

Eleven `.container-large` elements on their homepage: **ten at 1316px, one at 100%.** The capped
ones carry every section's copy — hero, projects, services, cta, culture. The uncapped one is the
hero's 3D wrapper, which has to reach the viewport edges while the copy beside it stays inside
80rem.

**This is why their hero copy starts at x=98 and not at the 41px gutter**, and it was the single
cause of the alignment drift phase 2 kept chasing. `10-design-system.md` documents
`.container-large` as `calc(100vw - 2 × 2.5rem)` — the gutter width — which is wrong. See I-030.

---

## Type scale, as rendered

Root 16.45px at 1512. Every size below is an exact rem multiple of it.

| rendered | rem | line-height | tracking | case | face | their class | uses |
|---|---|---|---|---|---|---|---|
| 102.813px | 6.25 | 6.25rem | −0.15rem | — | Neue Montreal | `cta-heading` | 1 |
| 98.7px | **6** | 6rem | −0.15rem | — | Neue Montreal | h1 | 2 |
| 32.9px | **2** | 2.5rem | normal | — | Neue Montreal | `t-heading-3-rg` | 28 |
| 32.9px | 2 | 2rem | normal | — | Neue Montreal | `t-heading-4-rg` | 5 |
| 24.675px | **1.5** | 1.75rem | normal | — | Neue Montreal | `t-heading-5-rg` | 8 |
| 16.45px | **1** | 1.25rem | normal | — | Neue Montreal | `t-paragraph-1-rg` | 55 |
| 12.3375px | **0.75** | 0.75rem | −0.015rem | upper | **IBM Plex Mono** | `t-label-1-rg` | 97 |
| 10.2813px | **0.625** | 0.75rem | normal | — | Neue Montreal | `t-paragraph-2-rg` | 210 |
| 8.225px | **0.5** | 0.5rem | −0.01rem | upper | **IBM Plex Mono** | `t-label-2-rg` | 90 |

Our `10-design-system.md` scale matches on every step it names.

**One finding worth carrying:** there is no 0.875rem step on their site. The only 14px text is a
single Webflow `w-inline-block` default. Our `--t-label-big` at 0.875rem may be an invention —
worth a look when a phase actually needs it.

---

## Colour, as used

| rgb | hex | our token | role |
|---|---|---|---|
| 33, 33, 33 | `#212121` | `--black` | page ground |
| 239, 239, 239 | `#efefef` | `--white` | primary text, inverted grounds |
| 59, 59, 59 | `#3b3b3b` | `--grey-800` | **most-used text colour** (241), card grounds |
| 46, 46, 46 | `#2e2e2e` | `--grey-900` | secondary grounds (37 uses) |
| 115, 115, 115 | `#737373` | `--grey-700` | borders on light |
| rgba(255,255,255,.1) | | `--white-10` | ghost fills |
| rgba(239,239,239,.5) | | `--white-50` | muted text on dark |

**Borders — and one we do not have.**

| border | uses | note |
|---|---|---|
| `1px solid rgba(59, 59, 59, 0.3)` | **71** | the hairline on **light** surfaces |
| `1px solid rgba(255, 255, 255, 0.3)` | 13 | the hairline on **dark** — our `--white-30` |

Our `--border-primary` is `--white-30` and `--border-alternate` is solid `--black`. Theirs is
`--grey-800` at 30% on light, and it is by far their most-used border. Phase 4 owns the first
light surface; it will need this.

---

## Motion vocabulary, as declared

Their CSS transitions, by frequency. Every duration lands on a step our `DUR` table already names.

| transition | uses | our token |
|---|---|---|
| `background-color .3s ease-in-out` | 21 | `DUR.fast` |
| `transform .4s ease-in-out` | 17 | `DUR.base` |
| `background-color, color .4s ease-in-out` | 16 | `DUR.base` |
| `color .4s ease-in-out` | 14 | `DUR.base` |
| `opacity .6s ease-in-out` | 10 | `DUR.slow` |
| `transform .5s ease-in-out` | 6 | `DUR.mid` |
| `height .4s ease-in-out` | 5 | `DUR.base` |

`ease-in-out` throughout, which is the `power1.inOut` I-017 settled.

---

## Section rhythm — the homepage, top to bottom

Document height **12,885px** at 1512.

| top | height | section |
|---|---|---|
| 0 | 1361 | `section_home-hero` |
| 1361 | 7180 | `section_home-projects` |
| 8541 | 903 | `section_services` |
| 9443 | 370 | `section_cta` |
| 9813 | 1781 | `section_culture` |
| 11594 | 632 | `section_blogs` |

`30-page-specs.md` gives 1361 / ~7180 / 902 / 370 / 632 and a 12,884 document. **The spec's
section table is accurate to within a pixel** — it was measured properly the first time.

---

## The hero, element by element

At 1512×900. Ours matches every figure.

| element | value |
|---|---|
| `h1` | x 98, y 201.5, 1316 × 197.4 · 98.7px / 98.7px / −2.4675px / 400 |
| line 2 | `display: flex`, `align-items: flex-end`, `gap: 41.125px` |
| play control | `<button>` x 98, y 324.1, **65.797px square** (4rem), child bg `rgb(59,59,59)`, radius 0 |
| foot bar | x 98, y 816.8, 1316 wide · `border-bottom: 1px rgba(255,255,255,.3)` · `padding-bottom: 28.7875px` (1.75rem) · no top border |
| foot labels | colour `rgb(239,239,239)` — **primary text, not the secondary grey** |
| 3D wrapper | `position: absolute; inset: 0; height: 900px; z-index: 0` |
| navbar | `padding-top: 24.675px` (1.5rem), height 59.5 |

---

## How to use this

**Before building any component, check whether its numbers are already here.** If they are not,
extend `tools/extract/tonik.mjs` rather than measuring a screenshot — the extractor takes a
selector list and the marginal cost of one more component is a line.

Phases 4, 5 and 7 each build several components against this system. The light-surface hairline,
the 2rem/2.5rem heading step and the section offsets above are all things those phases would
otherwise rediscover one at a time.
