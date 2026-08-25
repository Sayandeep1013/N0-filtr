# Phases

13 phases. Each is sized to roughly one session; several will take two. Phases run **in order**
except where a dependency note says otherwise.

This file **supersedes** the outline in `docs/spec/60-architecture-and-build.md` §7, which was
written before the build system existed.

**Legend:** `⬜ not started` · `🔨 in progress` · `✅ done` · `⚠️ done with caveat` · `🚧 blocked`

**Gates** — phases 2 and 6 stop for user sign-off before the next phase begins. Do not proceed
through a gate on your own judgment.

---

## Reading Map convention

Every phase names the exact spec sections it needs. Read those. Not the rest.
If you needed something outside your map, **add it here** before you hand off.

---

# Phase 0 — Foundation & verification harness

`phase/00-foundation` · no dependencies · **~1.5 sessions**

The most important phase. Everything downstream is measured by the harness built here, so the
harness has to be trustworthy before any component exists.

### Reading Map
- `docs/spec/10-design-system.md` — **all of it**
- `docs/spec/60-architecture-and-build.md` §1 Stack, §2 Structure, §3 Motion architecture,
  §5 Budgets, **§6 Accessibility** (added in phase 0 — it governs the reset: focus-visible,
  the skip link, and keyboard scrolling surviving the hidden scrollbars)
- `docs/build/02-VERIFICATION.md` — all of it

### Tasks
| id | task | done-when |
|---|---|---|
| T0.1 | Next.js 15 scaffold — App Router, TS strict, CSS Modules, no Tailwind | `npm run dev` serves a blank page; `npm run build` passes |
| T0.2 | Fonts — General Sans + IBM Plex Mono via `next/font/local`, self-hosted | both render; zero network font requests in the network panel |
| T0.3 | `tokens.css` — every colour, type and layout token from the design system | `verify:tokens` passes against the full token table |
| T0.4 | Fluid root + reset + global chrome (hidden scrollbar, inverted `::selection`) | root computes **16.45px @1512** and **16px @1440** — asserted |
| T0.5 | Lenis + GSAP + `MotionProvider` with `matchMedia` and a single ticker | `gsap.ticker` drives Lenis; no second rAF anywhere |
| T0.6 | `verify:tokens` — computed styles vs the token table | catches a deliberately wrong hex when you test it |
| T0.7 | `verify:motion` — GSAP timeline durations/eases vs spec | catches a deliberately wrong duration when you test it |
| T0.8 | `verify:visual` — screenshot harness, ours vs tonik, matched viewports + scroll | produces a contact sheet at 1512 and 390 |
| T0.9 | `verify:budget` — bundle size + Lighthouse | reports against §5 budgets |
| T0.10 | `npm run verify` aggregator → `tools/verify/output/report.md` | one command, one report, non-zero exit on failure |

### Acceptance
- `npm run verify` runs, passes, and writes a committed report.
- **Prove the harness works by breaking something.** Change a token to a wrong value, confirm
  `verify:tokens` fails, revert. Record this in the phase record — a harness that has never
  failed is not known to work.
- Root font size asserted at both breakpoints.

---

# Phase 1 — Global chrome

`phase/01-chrome` · needs 0 · **~1 session**

### Reading Map
- `20-components-and-motion.md` §1 Loader, §2 Navbar, §3 Contact panel, §20 Footer, §21.1, §22
- `30-page-specs.md` — the global chrome note at the top
- `10-design-system.md` §5 Motion primitives, §6 Global chrome

### Tasks
| id | task | done-when |
|---|---|---|
| T1.1 | Loader — IX2 enter timeline (`power2.inOut`, 400/600ms) | matches `a-23` exactly; `verify:motion` green |
| T1.2 | Loader exit + link interception (`100 → 0`, our correction) | clicking any internal link sweeps the panel up before navigating |
| T1.3 | Navbar — layout, `WORKS¹²`, active pill, CTA pill | matches at 1512 |
| T1.4 | Navbar `is-mini` — ScrollTrigger `1rem top` → `30rem top` | toggles at the right scroll positions |
| T1.5 | Navbar mobile — `+` glyph, vertical stroke rotates 90°, panel, `lenis.stop()` | works at 390 |
| T1.6 | Footer — link columns, social bars, `14vw` wordmark, service sibling-dim (`a-17/a-18`) | siblings dim to exactly 0.3 |
| T1.7 | Contact panel — 6-step open timeline, `timeScale(1.2)` close, focus trap, Escape | full timeline matches §3 |
| T1.8 | Contact form — native fallback styled to match; Tally slot behind a config flag | renders without a Tally ID |
| T1.9 | CSS hover states from §22 — close-button rotate, `.6` opacity pattern | all present |

### Acceptance
- All four global components on a blank page, `npm run verify` green.
- Loader tested on a real route change, not just in isolation.
- Contact panel keyboard-operable: Tab traps, Escape closes, focus restores.

---

# Phase 2 — Brand & 3D hero 🚦 **GATE**

`phase/02-brand-3d` · needs 0 · **~2 sessions**

The only phase with no reference to copy. We are inventing here.

### Reading Map
- `docs/spec/50-brand-and-3d.md` — **all of it**
- `20-components-and-motion.md` §1 (the loader consumes the mark)

### Tasks
| id | task | done-when |
|---|---|---|
| T2.1 | Aperture mark — SVG glyph at 16/32/48px + `no filter` wordmark | **STOP. Present to user. Do not proceed without approval.** |
| T2.2 | Three.js scene — persistent mount in root layout, outside `<main>` | survives route changes; one WebGL context per session |
| T2.3 | Geometry — torus ring + 6 extruded bevelled blades | matches §2 scene graph |
| T2.4 | GLSL material — object-space simplex grain + fresnel rim | grain sticks to the surface under rotation, doesn't swim |
| T2.5 | Mouse parallax — **the exact tonik curves**, ring and blades at different rates | ring `−0.2→+0.2`, blades `−0.1→+0.5` on X; opposed on Y; ~500ms damp |
| T2.6 | Mobile — scroll-driven `rotationY −0.525 → −1.5` | scrubbed to hero ScrollTrigger |
| T2.7 | Perf — DPR clamp, IntersectionObserver suspend, route-change fade | 60fps desktop; loop stops off-screen |
| T2.8 | Reduced motion — one static frame; no-WebGL → baked WebP fallback | both paths tested |
| T2.9 | Mark applied to loader, nav, footer, favicon, OG | consistent everywhere |

### Acceptance
- **User has approved the mark** before anything downstream uses it.
- Mouse parallax visibly produces depth — the blades outrun the ring. If it looks flat, the
  curves are wrong.
- 60fps at 1512 with the loop suspending off-screen.
- **Gate: present a screen recording of the hero to the user before phase 3.**

---

# Phase 3 — Homepage: hero, stack wall, reveal

`phase/03-home-upper` · needs 1, 2 · **~1 session**

### Reading Map
- `30-page-specs.md` §1 Hero, §2 (heading only)
- `20-components-and-motion.md` §4 RevealText, §11 Stack wall
- `40-content-model.md` §6 Stack wall content

### Tasks
| id | task | done-when |
|---|---|---|
| T3.1 | Hero copy — `--t-h1` two lines, inline play button in the text flow | play button sits *in* line 2, not beside it |
| T3.2 | Hero bottom rail — two mono labels above a hairline | matches at 1512 and 390 |
| T3.3 | `<RevealText>` — SplitType words, scrubbed `top 90%`→`top 10%`, rest at `.2` opacity | split happens after `document.fonts.ready` |
| T3.4 | Stack wall ≥768 — static flex-wrap grid, `.7` opacity | 22 wordmarks |
| T3.5 | Stack wall ≤767 — GSAP infinite marquee, no library | seamless loop, no jump |
| T3.6 | Showreel — Flip open/close choreography, Plyr | Flip reparents the button background correctly |

### Acceptance
- Word reveal is scrubbed, not triggered — scrolling back un-reveals.
- Hero matches tonik's composition in `verify:visual` (allowing for our content).

---

# Phase 4 — Works grid

`phase/04-works-grid` · needs 3 · **~2 sessions**

The most intricate component on the site. Three interacting hover layers.

### Reading Map
- `20-components-and-motion.md` §5 Works grid, §8 SpecTable, §21.1 sibling-dim, §21.2 thumbnail overlay
- `30-page-specs.md` §2 Works
- `40-content-model.md` §1 Schemas, §2 The twelve works

### Tasks
| id | task | done-when |
|---|---|---|
| T4.1 | `Work` content modules — 12 typed files from §2 | types compile; all 12 present |
| T4.2 | `<SpecTable>` — the four-place reusable component | used by the hover sheet |
| T4.3 | `<WorkCard>` — media, wipe, badge, sheet, info; three width variants | half/wide/full all render |
| T4.4 | Reveal on scroll — wipe `100%→0%`, badge, info; one-shot | `data-revealed` guard prevents replay |
| T4.5 | Hover layer 1 — caption `y −110%`, **siblings dim to .3** | dims *other* cards, never itself |
| T4.6 | Hover layer 2 — `.fade-away-overlay` to `.55` in 500ms, out in 400ms | note the asymmetry |
| T4.7 | Hover layer 3 — sheet fades in, video swaps for the still | video resets to 0 on leave |
| T4.8 | Differential parallax — col A `−8%`, col B `−10%` | scrubbed, desktop only |
| T4.9 | Mobile ≤767 — **sheet becomes permanent content**, single column | no hover, no dimming, no video |

### Acceptance
- Hovering one card dims all eleven others to exactly 0.3.
- `verify:motion` confirms all three hover layers' durations.
- Mobile variant verified at 390 — this is the responsive behaviour most likely to be got wrong.

---

# Phase 5 — Homepage: services, CTA, culture, blog row

`phase/05-home-lower` · needs 4 · **~1.5 sessions**

### Reading Map
- `30-page-specs.md` §3–§7
- `20-components-and-motion.md` §6 Services accordion, §10 CTA, §12 Culture, §19 Blog card
- `40-content-model.md` §3 Services

### Tasks
| id | task | done-when |
|---|---|---|
| T5.1 | Services accordion — 5 rows, one open, arrow rotate, row bg `#2e2e2e` | matches §6 |
| T5.2 | Accordion open/close — `.7s` + `.5s` open, `.6s` close sequence | exact; note the `onComplate` typo is *not* reproduced |
| T5.3 | Accordion body — 3 columns, inverted right panel | right panel is `#EFEFEF` with dark text |
| T5.4 | Accordion ≤767 — height-only, no x-slide | |
| T5.5 | `<CtaBlock>` — `#2e2e2e`, 6rem heading, 6rem circle arrow, opens contact | whole block is the trigger |
| T5.6 | `<CultureCollage>` — parallax `−20%`, wipe `width→0%` | **composition is ours to author** |
| T5.7 | Blog card row — 3 cards, hairline, category label | |

### Acceptance
- Accordion: opening one closes the other; the featured video plays on open and resets on close.
- Culture collage composed deliberately, not scattered randomly. Flag it in handoff for review.

---

# Phase 6 — Case study template 🚦 **GATE**

`phase/06-case-study` · needs 4 · **~2 sessions**

Build **one** work end to end. The other eleven are content, not code.

### Reading Map
- `30-page-specs.md` §`/works/[slug]`
- `20-components-and-motion.md` §8 SpecTable, §16 Lightbox, §18 Custom cursor, §21.5 cursor system
- `40-content-model.md` §1 Schemas, §2 (one work), `10-design-system.md` §2 accent theming

### Tasks
| id | task | done-when |
|---|---|---|
| T6.1 | Route + per-work accent theming, `.7s` crossfade from `#212121` | `--accent` drives nav, overlays, tints |
| T6.2 | CS hero — mini-nav, title, reel (Plyr, muted, `controls:false`), spec table | |
| T6.3 | Block set — all 8 block types from the page spec | each renders standalone |
| T6.4 | Custom cursor — all 5 IX2 action lists (`a-10`–`a-14`) | scale in 500ms, out 400ms, ±50px drift, click toggles label |
| T6.5 | `<NextWork>` — accent crossfades toward the next work | |
| T6.6 | Lightbox — intercepted parallel route, `x 120% → 0` | Escape, scrim and outside-click close it |
| T6.7 | Loader accent tint on case-study links | bar tints to `darken(accent,10%)` before navigating |

### Acceptance
- One complete case study, reviewed at 1512 and 390.
- Cursor is a ±50px drifting object, **not** a 1:1 pointer follower.
- **Gate: present the finished case study to the user before phase 7.**

---

# Phase 7 — Works index, services, industries

`phase/07-service-pages` · needs 6 · **~2 sessions**

### Reading Map
- `30-page-specs.md` §`/works`, §`/services/[slug]`, §`/industries/[slug]`
- `20-components-and-motion.md` §7 FAQ, §17 ServiceNav, §21.7 filter dropdown
- `40-content-model.md` §3 Services, §4 Industries

### Tasks
| id | task | done-when |
|---|---|---|
| T7.1 | `<ServiceNav>` — numbered `[01]`–`[05]`, active state, industry filter | |
| T7.2 | ServiceNav ≤767 — Embla carousel starting on the active index | |
| T7.3 | Filter dropdown — IX2 `a-6`/`a-7`, `y 20%→0%`, chevron rotate | |
| T7.4 | Service hero — copy left, spec table right | |
| T7.5 | `<FaqAccordion>` — auto-numbered `[01]`, height 0↔auto | numerals generated, never authored |
| T7.6 | Filtered works grids + client-side facet | `ScrollTrigger.refresh()` after filtering |
| T7.7 | `/works` index | |
| T7.8 | 5 service pages + 5 industry pages | 10 routes live |

### Acceptance
- Filtering re-arms reveals and doesn't leak ScrollTriggers (check `ScrollTrigger.getAll().length`).
- Branding and no-code pages handle their empty works grid gracefully.

---

# Phase 8 — About

`phase/08-about` · needs 5 · **~1.5 sessions**

The two best pieces of motion on the site.

### Reading Map
- `30-page-specs.md` §`/about`
- `20-components-and-motion.md` §13 Flythrough, §14 PinnedRise, §21.6 meetup hover

### Tasks
| id | task | done-when |
|---|---|---|
| T8.1 | About hero + `<Flythrough>` — 12 images, `rotationY 25`, random z/y/xPercent, scale 2→.5 | scrubbed, `ease: none` |
| T8.2 | Vision + meetup sections | |
| T8.3 | Meetup hover — IX2 `a-19`–`a-22`, image tracks cursor with `−2°→+2°` tilt | X clamped to the 15–80% band |
| T8.4 | `<PinnedRise>` — pinned 250%, `rotationX −70`, random 4×9 stagger | headline fades at `<+0.2` |
| T8.5 | Open positions + CTA + blog row | |

### Acceptance
- PinnedRise holds 60fps with 45 elements. If it doesn't, reduce count before reducing quality.
- Pin doesn't fight Lenis — no jump on entry or exit.

---

# Phase 9 — Blog

`phase/09-blog` · needs 5 · **~1 session**

### Reading Map
- `30-page-specs.md` §`/blog`, §`/blog/[slug]`
- `40-content-model.md` §5 Blog

### Tasks
| id | task | done-when |
|---|---|---|
| T9.1 | MDX pipeline + typed frontmatter | |
| T9.2 | Shiki at build time, themed to our palette | zero runtime highlighting cost |
| T9.3 | Blog index + category filter pills | |
| T9.4 | Post template — 7/12 column, figure captions, blockquote rule | |
| T9.5 | Port 12 articles from RepoLogs prose | all 12 render |

### Acceptance
- Prose measure lands near 65 characters.
- Code blocks scroll horizontally in their own container; the page body never does.

---

# Phase 10 — Content & assets

`phase/10-assets` · needs 6 · **~2 sessions** · *parallel-safe with 8 and 9*

### Reading Map
- `docs/spec/60-architecture-and-build.md` §4 Asset pipeline
- `40-content-model.md` — all of it
- `docs/research/02-content-inventory.md`

### Tasks
| id | task | done-when |
|---|---|---|
| T10.1 | `scripts/capture.ts` — headless capture of the 8 live deploys | stills at 2× |
| T10.2 | Interaction reels — scripted, 6–10s, ffmpeg to mp4+webm | real interactions, not idle scrolls |
| T10.3 | **ReIN Bot capture — priority, it has zero images** | |
| T10.4 | Import RepoLogs' 40+ existing WebP | |
| T10.5 | `scripts/covers.ts` — per-work shader cover keyed to its accent | deterministic seed per slug |
| T10.6 | `scripts/optimise.ts` — sharp → AVIF/WebP, 1×/2× | ≤250KB per poster |
| T10.7 | Write the remaining 11 case-study bodies | |
| T10.8 | Write 5 service pages, 5 industry pages, homepage copy | |
| T10.9 | **Write the About page** — the largest writing task, no source material | |

### Acceptance
- Every card has a poster; at least 8 have reels.
- No image over budget. `verify:budget` green.

---

# Phase 11 — Block pit

`phase/11-block-pit` · needs 1 · **~1 session**

### Reading Map
- `docs/spec/70-physics-footer.md` — **all of it**

### Tasks
| id | task | done-when |
|---|---|---|
| T11.1 | Section shell, hairline, labels, IntersectionObserver gate, dynamic import | Matter absent from the initial bundle |
| T11.2 | Engine + walls + fixed-timestep loop on the GSAP ticker | no `Matter.Runner`; accumulator clamped |
| T11.3 | Tile factory — shape mix, chamfer, DOM elements on token classes | 44 desktop / 24 mobile |
| T11.4 | DOM sync in the ticker | |
| T11.5 | MouseConstraint — **`render.visible: false`** | no green line |
| T11.6 | Velocity pusher — `Body.setPosition(b, p, true)` | fast sweep scatters harder than slow |
| T11.7 | Entry drop stagger + RESET control | |
| T11.8 | Sleeping, escape guard, mobile counts, touch listener fix | pile sleeps at ~0% CPU |
| T11.9 | Reduced-motion static pile | no simulation at all |
| T11.10 | **Tune `frictionAir` and `restitution` last, together, on real content** | reads "fluffy", not "hard" |

### Acceptance
- Sweep scatters and the pile re-settles within ~2s.
- A tile can be flung off-screen and falls back in.
- CPU ~0 when untouched; simulation stops when off-screen.
- **Present to the user for feel.** This one is explicitly subjective.

---

# Phase 12 — Polish & launch

`phase/12-polish` · needs all · **~1.5 sessions**

### Reading Map
- `60-architecture-and-build.md` §5 Budgets, §6 Accessibility, §8 Fidelity verification
- `00-brief-and-decisions.md` — the open items table

### Tasks
| id | task | done-when |
|---|---|---|
| T12.1 | `/404` — blur reveal, `blur(24px)→0` after `.5s` | |
| T12.2 | `/privacy` | |
| T12.3 | Metadata, OG images, sitemap, robots | |
| T12.4 | Full `prefers-reduced-motion` audit across every phase's work | toggled and tested, not assumed |
| T12.5 | Accessibility audit — focus, semantics, contrast, skip link | |
| T12.6 | Performance — hit every budget in §5 | Lighthouse ≥85 desktop / ≥70 mobile |
| T12.7 | Full-site `verify:visual` sweep vs tonik | contact sheet reviewed |
| T12.8 | Resolve the open-items table (email, domain, socials, Tally ID) | |
| T12.9 | Deploy to Vercel | |

### Acceptance
- Every budget met, every deviation on the documented list, nothing undocumented differs.

---

## Dependency graph

```
0 ──┬── 1 ──┬── 3 ── 4 ──┬── 5 ──┬── 8 ──┐
    │       │            │       │       │
    └── 2 ──┘            └── 6 ──┼── 7 ──┼── 12
                                 │       │
                                 └──10 ──┤
                            9 ───────────┤
                           11 ───────────┘
```

Phases 9, 10 and 11 are parallel-safe with their neighbours once their dependencies are met.
Everything converges on 12.
