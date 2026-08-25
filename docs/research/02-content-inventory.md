# Content inventory — github.com/Sayandeep1013

37 public repos. Profile: name "Sayandeep..", company **Finaxon AI**, blog **Rein.dev**,
location "Localhost:3000". 4 followers, account created 2023-05-20.

## The big finding: RepoLogs already did the curation

`RepoLogs` (a.k.a. **rein.dev**) is a finished horizontally-scrolling portfolio in the manner
of ikony.tv. It ships **twelve chapters, one per repo**, and already contains everything a
case-study template needs:

- a curated 12-project selection with a stated reading `ORDER`
- a one-line thesis per project ("the constraint it breaks")
- **~40 optimised WebP screenshots** in `assets/img/`
- **accent colour pairs** per project, sampled from each project's own screenshots and
  contrast-corrected for light and dark grounds
- twelve line-art architecture diagrams (a small SVG DSL in `content/diagrams.mjs`)
- long-form technical prose in `content/chapters.mjs` + `chapters-b.mjs` (37KB combined)

That is a ready-made content spine. It is written in a different design language
(paper/concrete, Archivo + IBM Plex Sans, horizontal scroll), but the **words, images and
accents transfer directly** into the tonik-style case-study template.

### The twelve, with their accents

| # | Chapter | Repo | The constraint it breaks | Light | Dark |
|---|---|---|---|---|---|
| 01 | ReelShell | `ReelShell` | A terminal can be a streaming client | `#086063` | `#12A5AA` |
| 02 | TermTypo | `TermTypo` | A terminal can be a ranked competitive arena | `#39631D` | `#5C9C32` |
| 03 | DiscVault | `DiscVault` | An attachment cap is a block size | `#1627DF` | `#747EF1` |
| 04 | ReIN Bot | `Rein-Bot` | A free tier can host realtime multiplayer | `#A31F72` | `#DE54AB` |
| 05 | FTC | `FTC-Game` | No client decides the outcome | `#7F4F0A` | `#C67A10` |
| 06 | Solidus | `Solidus-Bingo` | A sideloaded app can still be updated | `#106534` | `#1BA755` |
| 07 | CanVas | `co-canvas` | A URL is the whole account system | `#973911` | `#E75D23` |
| 08 | Tessera | `Tessera` | A drawing is a document an AI can edit | `#125C91` | `#2595E4` |
| 09 | NoteTakerXX | `NoteTakerXx` | Notes have coordinates | `#6A570C` | `#A58812` |
| 10 | ValoBot | `ValoBot` | A model with no cutoff, if it fetches first | `#AB1C40` | `#E4587B` |
| 11 | DroidDoodle | `DroidDoodle` | A phone runs the model that drives the canvas | `#6F22D3` | `#A36EE7` |
| 12 | Santioni | `Martini-Recreation` | A closed WebGL system can be read | `#B8241F` | `#E25F5A` |

These accents map **one-to-one** onto tonik's `#color-container[data-color]` mechanic
(§7 of the teardown) — per-case-study page theming, loader tinting, nav colour crossfade.

## Asset audit (what we can actually put on screen)

| Repo | Images in repo | Notes |
|---|---|---|
| RepoLogs | 40+ curated WebP | already sized and colour-sampled — **primary source** |
| Tessera | 236 (16.7MB) | incl. `app/` UI captures and eval runs |
| Martini-Recreation | 124 (11.9MB) | WebGL textures, msdf, bluenoise — *source assets*, not shots |
| ReactGamePortal | 57 (5.5MB) | per-game art |
| mubitracker-watchdeck | 18 (9.4MB) | mobile screenshots |
| ValoBot | 12 (4.6MB) | `screenshots/readme/` |
| NoteTakerXx | 11 (4.0MB) | `images/Readme Screenshot Images/` |
| co-canvas / ReelSharing | 9 each | `screenshots/readme/` |
| TermTypo | 8 | `screenshots/readme/` |
| DiscVault | 4 | `screenshots/readme/` |
| Symbiote | 2 (1.6MB) | 3D showcase — needs capture |
| **Rein-Bot** | **0** | **needs capture** |

**Gap, stated plainly:** tonik's case studies run on bespoke 3D renders, motion reels and
brand systems. What exists here is UI screenshots. The template will look right, but the
*imagery* will read as product screenshots rather than art direction unless we either
(a) shoot motion/renders for the top few, or (b) design the template around framed UI —
device mockups, cropped detail shots, colour-field backdrops driven by each accent.
This is the single biggest quality risk in the project and needs a decision.

## Full repo list by tier

### Tier A — deployed, visual, already written up (case-study grade)

| Repo | Lang | Live | One-line |
|---|---|---|---|
| `Tessera` | TS | tessera-brown-pi.vercel.app | Code-native pixel-art editor; canvas is a JSON doc an AI agent edits via reviewable diffs |
| `RepoLogs` | JS | sayandeep1013.github.io/RepoLogs | Horizontal 12-chapter portfolio, vanilla JS, no deps |
| `Rein-Bot` | PLpgSQL | sayandeep1013.github.io/Rein-Bot | Guess-the-anime-opening multiplayer party game, server-side fuzzy matching |
| `Martini-Recreation` | GLSL | — | Two-tier study of santionispirits.com: exact offline mirror + Next.js/GSAP rebuild |
| `co-canvas` | TS | co-canvas-web.vercel.app | Realtime rooms pairing a block editor with a shared Excalidraw canvas over Yjs |
| `ReelSharing` | TS | reel-sharing.vercel.app | AI memory vault: any video link → transcript, summary, key frames, tags |
| `DiscVault` | TS | discvault.onrender.com | Chunked large-file storage on Discord attachment limits, SHA-256 manifest |
| `TermTypo` | Python | termtypo.vercel.app | Terminal-first multiplayer typing test, ELO ladder, CLI↔web cross-play |
| `ValoBot` | TS | valobot.vercel.app | Valorant esports dashboard + CYPHER, a Groq analyst grounded in live VLR.gg data |
| `mubitracker-watchdeck` | TS | mubitracker-watchdeck-web.vercel.app | Swipe-based movie/TV/anime tracker with friends and reviews |
| `ReactGamePortal` | JS | rein-gameportal.netlify.app | Collage of browser mini-games in one GSAP-animated React portal |
| `FTC-Game` | TS | ftc-game.vercel.app | Realtime multiplayer card game, server-authoritative |

### Tier B — strong, shippable, thinner assets

`Solidus-Bingo` (Expo realtime bingo) · `NoteTakerXx` (spatial canvas notes) ·
`puzzled` (Expo/Skia jigsaw) · `Symbiote` (Three.js Venom showcase) ·
`DroidDoodle` (on-device LLM Android canvas) · `Trans_Cribed` (Flutter on-device STT bench) ·
`ReelShell` (Go terminal streaming TUI) · `Church-Voice-app` (scripture recording studio)

### Tier C — concepts, tools, small pieces

`PanelWeaver` · `BubbleScribe` · `TomeVoice` · `GlyphDrift` · `Image_Manipulation` ·
`vlc-skins` · `TerminalPyGames` · two browser extensions · `dashboard-main` ·
`Disease-prediction` · `Recommendation-System` · `ReactNoteApp` · `Flutter-Calculator` ·
`notion_widgets` · `PinchFlat`

## Mapping onto tonik's information architecture

tonik's five services, and what we plausibly have to show against each:

| tonik service | No Filter equivalent | Evidence in the repos |
|---|---|---|
| Product Design | Product Design | Tessera, NoteTakerXx, mubitracker, co-canvas |
| Websites | Websites | RepoLogs, Martini-Recreation, ReactGamePortal |
| Branding | Branding | **thin** — no brand-identity work in the repos |
| No-Code Development | — | **nothing**; no Webflow/no-code work exists |
| Engineering | Engineering | DiscVault, Rein-Bot, FTC-Game, TermTypo, ValoBot, Solidus |

tonik's other IA also assumes things we do not have: a client logo wall
("trusted by 200+ YCombinator & Speedrun founders"), named client testimonials with
headshots, a team of 45 people, a physical office, job openings, and a seed fund.
Every one of those is a content decision, not a technical one.
