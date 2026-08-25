# No Filter — brief, decisions, and honest self-assessment

## What we are building

A from-scratch marketing site for **No Filter**, a design & engineering studio, that reproduces
the **design language and interaction model of tonik.com one-to-one** — the loader, the 3D hero,
the scroll choreography, the hover mechanics, the accordions, the panel transitions, the type
system, the colour system, the grid — with every piece of tonik's brand and content replaced by
ours.

Not a visual approximation. The motion source was recovered from their Slater bundle and is
reproduced tween-for-tween: same durations, same eases, same stagger amounts, same
ScrollTrigger offsets, same `timeScale` on reverse.

## Decisions (locked 2026-08-25)

| # | Decision | Choice | Consequence |
|---|---|---|---|
| 1 | Positioning | **Agency voice — "we"** | Copy speaks as a studio. Services are offered, not just demonstrated. |
| 2 | Client-proof sections | **Adapt honestly** | Logo wall → stack wall. Testimonials cut. Team = one. Careers + seed fund dropped. Nothing fabricated. |
| 3 | Brand mark | **I design it** | Aperture concept, approved by you before it ships. Drives hero 3D, loader glyph, footer wordmark. |
| 4 | Display typeface | **Free near-match** | General Sans (Fontshare) primary, Switzer as the alternate. IBM Plex Mono unchanged. |
| 5 | Works scope | **12, full depth** | The RepoLogs twelve. Nav reads `WORKS¹²`. Content spine already written. |
| 6 | Imagery | **Capture + generated covers** | Headless capture of 9 live deploys (stills + motion), plus a per-project shader cover keyed to its accent. |
| 7 | Blog | **Port RepoLogs writeups** | 12 real articles from existing technical prose. |
| 8 | Contact | **Tally embed** | Matches tonik exactly. You supply the form ID. |
| 9 | Block pit below the footer | **Matter.js, themed** | An interactive pile of soft tiles after the footer — sweep, drag, throw. Our own addition, not from tonik. See `70-physics-footer.md`. |

### Derived from decision 2 — what changes vs tonik

| tonik section | No Filter |
|---|---|
| 28-logo client wall | **Stack wall** — React, Three.js, GSAP, Supabase, Expo, Go, Postgres, Cloudflare… |
| "Trusted by 200+ YC founders" | **"12 shipped projects · 8 live in production"** (verifiable) |
| Named client testimonials ×5 | **Cut.** Grid rhythm preserved by promoting a work card to the vacated cell. |
| 45 team portraits (pinned 3D scroll) | **Kept as a set-piece**, re-purposed: 45 project artefacts/screens instead of 45 faces. The motion is too good to lose. |
| Poznan office + GMT+1 | Your city + offset (**need from you**) |
| `/workwithus`, `/job-offers/*` | **Dropped** (2 templates) |
| `/seedcapital` | **Dropped** |
| `/industries/*` (13 pages) | **Kept but reduced** to the industries we can evidence: AI, Dev Tools, Realtime, Mobile, Creative Coding |

## Scope — templates we ship

| Route | Template | Status |
|---|---|---|
| `/` | homepage | ✅ full |
| `/works` | works index (tonik's `/product-design` grid role) | ✅ full |
| `/works/[slug]` ×12 | case study | ✅ full |
| `/services/[slug]` ×5 | service page | ✅ full |
| `/about` | about | ✅ full |
| `/blog` | blog index | ✅ full |
| `/blog/[slug]` ×12 | blog post | ✅ full |
| `/industries/[slug]` ×5 | industry | ✅ full |
| `/privacy` | legal | ✅ minimal |
| `/404` | not found | ✅ full |

**10 templates, ~40 routes.** Global on every page: loader · navbar · contact panel · footer ·
**block pit** (below the footer, every page).

## Self-assessment — "if I built only from these specs, would it look exactly like tonik?"

Rated honestly. 10 = I have the literal source. 5 = I inferred it from one screenshot.

> **Revised after the IX2 pass.** tonik runs **two** animation engines, not one. The first pass
> recovered only the Slater/GSAP bundle. The second extracted **Webflow IX2** — 130 events and
> 39 action lists, including 37 hover pairs, 9 mouse-move interactions and the real loader.
> Both are now in hand (`docs/research/source/tonik-ix2.json`). Ratings below reflect that.

| Aspect | Confidence | Basis |
|---|---|---|
| Colour tokens | **10** | verbatim from their `:root` |
| Type scale | **10** | verbatim from their CSS |
| Fluid-root responsive system | **10** | formula extracted, verified numerically at 1512px |
| Loader (both directions) | **10** | full recovered source |
| Scroll text reveal | **10** | full recovered source |
| Works-grid hover + reveal | **10** | full recovered source |
| Works-grid parallax | **10** | full recovered source |
| Services accordion | **9** | full source; right-panel internals from one capture |
| FAQ accordion | **9** | full source + capture |
| Contact panel | **9** | full source; iframe internals are Tally's |
| Navbar + mini state | **9** | source + CSS |
| About: 3D flythrough | **10** | full recovered source |
| About: pinned people scroll | **10** | full recovered source |
| Culture collage | **7** | motion exact; the *collage layout* is bespoke absolute positioning, sampled once |
| Footer | **9** | capture + the `14vw` wordmark rule |
| CTA block | **9** | capture + tokens |
| Case-study template | **8** | structure + theming mechanic known; long-form block rhythm sampled twice, not exhaustively |
| Service template | **9** | hero, spec table, FAQ, and secondary nav all captured |
| Blog index / post | **6** | card design captured; index filters and post body only partially seen |
| Industry template | **6** | section names only |
| Mobile (≤767) | **7** | hero, works and nav captured; mid-breakpoints (768–991) inferred from their media queries |
| Hover micro-interactions (IX2) | **10** | all 7 hover action lists decoded with exact values |
| Cursor-driven parallax (IX2) | **10** | hero, load-more and meetup mouse-move curves decoded |
| Custom cursor system | **9** | all 5 action lists decoded (hover in/out, click, second click, move) |
| 3D hero — **behaviour** | **10** | exact per-object rotation curves for mouse and scroll recovered |
| 3D hero — **the object itself** | **5** | opaque Spline binary; geometry, materials and lighting not decomposable |
| 3D hero **as our own equivalent** | **9** | fully specified in `50-brand-and-3d.md`, built by us in Three.js/GLSL |
| Block pit (our own addition) | **9** | Matter.js defaults verified against a live runtime |

**Weighted overall: ~9.0 / 10.** (was 8.7 before the IX2 pass)

### Where that number is honest about its weak points

Three areas sit below 8, and I want to be explicit rather than let them pass:

1. **Culture collage layout (7).** The *motion* is exact — I have the parallax and wipe code.
   What I have only one sample of is how the photos are actually positioned. tonik hand-placed
   them. We will hand-place ours too, so this is a design act rather than a replication gap —
   but it will not be pixel-identical to theirs, and it shouldn't be.
2. **Blog and industry templates (6).** I know their sections and their card design; I have not
   walked their interiors. These are the two lowest-risk templates on the site (rich text and a
   filtered grid), so I judged further crawling a poor use of the budget. If you want them at 9,
   say so and I will do a dedicated pass.
3. **The 3D hero's *object* (5).** A hard ceiling, not an effort problem: it is a 201KB Spline
   binary and its geometry, materials and lighting are not recoverable. **We are not cloning it
   anyway** — it is their logo. Its *behaviour*, however, is now at 10: the IX2 pass recovered
   the exact per-object rotation curves (two objects counter-rotating at different rates on
   mouse, and a separate scroll-driven curve on mobile). See `50-brand-and-3d.md` §2.

**None of these block the build.** Items 1 and 3 are places where we make our own design
decisions regardless. Item 2 is a known, cheap gap I can close on request.

## Open items — small things I need from you

Not blocking; each has a stated placeholder I will build against until you replace it.

| Item | Placeholder in use |
|---|---|
| Business email | `hello@nofilter.studio` |
| Domain | `nofilter.studio` |
| City + GMT offset for footer | `KOLKATA, IN · GMT+5:30` |
| Social handles (Instagram / LinkedIn / X / GitHub) | GitHub → `Sayandeep1013`, rest omitted |
| Tally form ID | contact panel renders a styled native fallback until supplied |
| Footer tagline (tonik's is "DESIGNING A VISION OF BIG THINKING FOUNDERS") | `NO FILTER BETWEEN THE IDEA AND THE THING` |

## The one thing I want you to push back on

Decision 2 keeps the **pinned 45-portrait scroll** from the About page but fills it with project
artefacts instead of faces. It is the best single piece of motion on tonik's site and I do not
want to lose it — but a one-person studio showing 45 screens where they show 45 people is a
slightly different claim. If that reads as overreach to you, the alternative is to fill it with
the 12 works at larger scale and reduce the grid from 4×9 to 3×4. Say the word.
