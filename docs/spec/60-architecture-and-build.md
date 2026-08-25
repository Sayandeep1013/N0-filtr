# Architecture, asset pipeline, and build plan

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | 10 templates, 40 routes, static-friendly, first-class Vercel |
| Styling | **CSS Modules + a global token sheet** | The fluid-rem system is CSS-native; Tailwind would fight it. Mirrors tonik's own approach. |
| Animation | **GSAP 3.13** + ScrollTrigger + Flip + Observer | Same library and plugin set as the source |
| Text split | **SplitType** | Exactly what tonik uses; 2KB |
| Smooth scroll | **Lenis 1.x** | Same library, same config |
| 3D | **Three.js (vanilla) + custom GLSL** | One scene, one shader — R3F's reconciler earns nothing here |
| Sliders | **Embla** | Replaces both Splide and Swiper; lighter than either, one library instead of two |
| Physics | **Matter.js** | The footer block pit. ~25KB gz, lazy-loaded. Measured alternative: Rapier 3D WASM is **1,534KB** — 18× the cost for no visible gain on a 2D problem. |
| Video | **Plyr** | Matches the source; needed for the Flip showreel choreography |
| Content | **TS modules** (structured) + **MDX** (long-form) | Type-safe, in-repo, no CMS to run |
| Code highlighting | **Shiki**, build-time | Replaces tonik's runtime regex pass — correct and free at runtime |
| Images | `next/image` + **sharp** → AVIF/WebP | |
| Forms | **Tally** embed | Per decision 8 |
| Deploy | **Vercel** | |

**No Tailwind, no Barba, no Spline, no jQuery, no Webflow.**

## 2. Structure

```
app/
  layout.tsx                  Loader · Navbar · ContactPanel · Hero3D · Footer
  page.tsx                    /
  works/page.tsx              /works
  works/[slug]/page.tsx       case study
  @modal/(.)works/[slug]/     intercepted route → the lightbox
  services/[slug]/page.tsx
  industries/[slug]/page.tsx
  about/page.tsx
  blog/page.tsx
  blog/[slug]/page.tsx
  not-found.tsx
  styles/
    tokens.css                §2 + §3 of the design system
    reset.css
    global.css                scrollbar, selection, fluid root
components/
  chrome/       Loader · Navbar · ContactPanel · Footer · CustomCursor
  hero/         Hero3D/ (scene.ts, material.glsl.ts, aperture.ts) · HeroCopy · StackWall
  works/        WorksGrid · WorkCard · WorkLightbox · NextWork
  services/     ServicesAccordion · ServiceNav · FaqAccordion
  blocks/       Prose · VisualFull · Visual2Up · VisualBleed · Slider · Quote · CodeBlock
  ui/           Button · IconCircle · SpecTable · RevealText · BlogCard · CtaBlock · LoadMoreButton
  motion/       Flythrough · PinnedRise · CultureCollage · Showreel
lib/
  motion/       gsap.ts (registration) · lenis.ts · tokens.ts (DUR/EASE) · useReveal.ts
  content/      works.ts · services.ts · industries.ts · posts.ts
content/
  works/*.ts    12 typed modules
  posts/*.mdx   12 articles
public/media/   captured stills, reels, generated covers
scripts/
  capture.ts    headless capture of live deploys
  covers.ts     generated shader covers
  optimise.ts   sharp pipeline
docs/           research + spec (this)
```

## 3. Motion architecture

One rule: **all GSAP lives behind `gsap.matchMedia()`**, registered in a single provider.

```tsx
// lib/motion/MotionProvider.tsx  (client, mounted in layout)
useLayoutEffect(() => {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 992px)', () => { /* hover, parallax, text reveal */ });
  mm.add('(max-width: 991px)', () => { /* reduced set */ });
  mm.add('(prefers-reduced-motion: reduce)', () => { /* static end states */ });
  return () => mm.revert();
}, []);
```

`matchMedia` handles cleanup on route change and viewport crossing automatically — this is what
prevents the leaked-ScrollTrigger bugs that plague this kind of site.

**Per-component pattern:**
```tsx
const ref = useRef<HTMLDivElement>(null);
useGSAP(() => { /* timelines scoped to ref.current */ }, { scope: ref });
```
`@gsap/react`'s `useGSAP` gives automatic revert on unmount. Use it everywhere.

**Ordering on mount:** fonts ready → SplitType → ScrollTrigger.refresh() → loader exit.
Splitting before fonts load measures the fallback face and produces wrong word boxes.

## 4. Asset pipeline

The imagery decision (capture + generated covers) breaks into three scripted stages.

### Stage 1 — capture live deploys (`scripts/capture.ts`)

Eight live URLs: Tessera, CanVas, DiscVault, ReIN Bot, ValoBot, TermTypo, FTC, NoteTakerXX.

```ts
// per project, per defined shot
await page.setViewportSize({ width: 1440, height: 900 });
await page.emulateMedia({ colorScheme: 'dark' });
// stills at deviceScaleFactor 2 → 2880×1800
await page.screenshot({ path, scale: 'device' });
// reels: 6–10s of real interaction, recorded via context.recordVideo,
// then ffmpeg → muted h264 mp4 + webm, 1280×800, CRF 26
```

Each project gets a small **shot list** in its content module — the 3–5 screens worth showing.
Reels are scripted interactions (a race running, a canvas being drawn, a file chunking), not
idle scrolls. **ReIN Bot is the priority here — it has zero images in the repo.**

### Stage 2 — generated covers (`scripts/covers.ts`)

Every card gets art direction, not just a screenshot. A headless Three.js pass renders a
per-project abstract cover keyed to its accent:

- the same aperture material and lighting as the hero, so the covers feel like one system
- a per-project deterministic seed derived from the slug, driving the form
- output 1600×1000 WebP, sitting **behind** the UI screenshot which is composited as a floating
  framed panel with a soft shadow

This is what stops a grid of twelve browser screenshots from looking like a link dump.

### Stage 3 — optimise (`scripts/optimise.ts`)

sharp → AVIF + WebP at 1x/2x, `next/image` with explicit sizes.
Budget: **≤ 250KB per card poster**, ≤ 1.2MB per reel.

### Existing assets to reuse

RepoLogs' `assets/img/*.webp` — 40+ already-sized, already-colour-sampled shots for
co-canvas, DiscVault, FTC, Santioni, NoteTakerXX, Solidus, TermTypo, Tessera and ValoBot.
Copy them in first; capture only fills the gaps.

## 5. Performance budget

| Metric | Target |
|---|---|
| LCP (home, 4G, mid-tier mobile) | < 2.5s |
| CLS | < 0.05 — all media has explicit dimensions |
| INP | < 200ms |
| JS on `/` (gzipped) | < 190KB — GSAP ~55, Three ~150 raw/~48 gz, Lenis ~4, app ~40 |
| Home page total weight | < 1.8MB with images |
| Lighthouse Performance | ≥ 85 desktop, ≥ 70 mobile (the 3D hero has a real cost) |

Three.js and Plyr are **dynamically imported**. Plyr loads only when the showreel is first
opened. Case-study reels are `preload="none"` with a poster.

## 6. Accessibility

Improvements over the source, all deliberate:

- `prefers-reduced-motion` fully honoured (tonik ships none)
- Every accordion is a real `<button aria-expanded aria-controls>`, not a div with a click handler
- The contact panel is a focus-trapped dialog with `Escape`, restoring focus on close
- Skip link to `#main`
- Hidden scrollbars do **not** remove keyboard scrolling — arrows, Page keys, Home/End all work
- Text contrast: `--white` on `--black` is 13.6:1; `--grey-700` on `--black` is 4.6:1 —
  which is why `--text-secondary` is used only for labels at `.75rem`+, never body copy
- The 3D canvas is `aria-hidden` with the headline as the accessible content

## 7. Build plan

| Phase | Deliverable | Acceptance |
|---|---|---|
| **0** Foundation | Next scaffold, tokens, fonts, fluid root, reset, Lenis, GSAP provider | A blank page measures root = 16.45px at 1512 and 16px at 1440 |
| **1** Chrome | Loader, Navbar (+mini, +mobile), Footer, ContactPanel | Loader enters/exits with the exact timings; nav minis at 30rem; panel opens with the full stagger |
| **2** Brand + 3D | Aperture glyph, wordmark, `<Hero3D />` | **Sign-off gate** — static render approved before it goes in the page |
| **3** Homepage | Hero, StackWall, RevealText, WorksGrid, Accordion, CTA, Culture, Blog row | Side-by-side scroll comparison vs tonik at 1512 and 390 |
| **4** Case study | Template, block set, accent theming, custom cursor, NextWork, lightbox | One work built end to end and reviewed before the other 11 |
| **5** Service + industry | ServiceNav, spec table, FAQ, filtered grids | All 10 pages |
| **6** About | Flythrough, PinnedRise, vision, meetup | Both set-pieces at 60fps |
| **7** Blog | Index, filters, post template, Shiki | 12 posts rendering |
| **8** Assets | Capture, covers, optimise | Every card has a poster; 8 have reels |
| **9** Block pit | Matter.js engine, tile factory, sweep, drag/throw, entry drop, reduced-motion path | Sweep scatters and re-settles in ~2s; pile sleeps at 0% CPU; static under reduced motion |
| **10** Polish | 404, privacy, OG images, sitemap, reduced motion, a11y audit, Lighthouse | All budgets in §5 met |

Phases 2 and 4 have explicit **sign-off gates** — I stop and show you before continuing.

## 8. Fidelity verification

How we prove "1:1" rather than asserting it:

1. **Side-by-side scroll capture.** A script drives both tonik and our build through the same
   scroll positions at the same viewport and writes paired screenshots into a contact sheet.
   Reviewed at phase 3 and phase 9.
2. **Motion audit, both engines.** Every timeline marked **[src]** is checked line-by-line
   against `docs/research/source/tonik-animations.js`; every one marked **[ix2]** against
   `docs/research/source/tonik-ix2.json`. Durations, eases, stagger amounts and position
   parameters must match exactly. Webflow easing maps: `inOutQuad → power1.inOut`,
   `outCirc → circ.out`, `easeInOut → power1.inOut`, `ease → power1.inOut`.
3. **Token audit.** Computed styles on our built page compared against the extracted token
   table — colours, font sizes, line heights, tracking, gutters.
4. **The deviations list.** Every intentional difference is recorded and justified. Current list:
   - loader exit `100 → 0` instead of `200 → 100` (theirs is invisible)
   - `onComplete` where their source has the `onComplate` typo
   - `prefers-reduced-motion` support added
   - real `<button>` semantics on accordions
   - Shiki instead of a runtime regex highlighter
   - Embla instead of Splide + Swiper
   - Three.js instead of Spline
   - no testimonials, no client wall, no careers, no seed fund (decision 2)
   - **the block pit below the footer — an addition, not a deviation (decision 9)**

   Corrections made after the IX2 pass, now matching the source rather than deviating from it:
   - loader easing is `power1.inOut` (their `inOutQuad`), **not** the `power3.in` in their dead
     `initLoader()` function
   - hero parallax drives two objects at different rates, not the camera

Anything not on that list that differs from tonik is a bug.
