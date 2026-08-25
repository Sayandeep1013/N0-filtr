# Content model

Content lives in the repo as typed TypeScript modules (structured data) plus MDX (long-form).
No external CMS. Everything below is derived from real repo data — nothing invented.

---

## 1. Schemas

```ts
// content/works/_types.ts
export type Work = {
  slug: string;                 // /works/{slug}
  title: string;
  order: number;                // grid + reading order
  thesis: string;               // the one-line "constraint it breaks"
  summary: string;              // 1–2 sentences, shown on the card
  services: string[];           // → SpecTable, drives service-page filtering
  tools: string[];              // → SpecTable
  industries: string[];         // → SpecTable, drives industry-page filtering
  year: number;
  status: 'live' | 'archived' | 'in-progress';   // replaces tonik's LOCATION row
  links: { live?: string; repo: string; package?: string };
  accent: { light: string; dark: string };        // sampled, contrast-corrected
  invertsPage: boolean;         // true → case-study page uses accent.light as ground
  card: { width: 'half' | 'wide' | 'full'; poster: string; reel?: string };
  blocks: Block[];              // the case-study body
};

export type Block =
  | { type: 'prose';        heading?: string; body: string }
  | { type: 'visual-full';  src: string; alt: string; caption?: string }
  | { type: 'visual-2up';   items: [Media, Media] }
  | { type: 'visual-bleed'; src: string; alt: string }
  | { type: 'slider';       items: Media[] }
  | { type: 'quote';        text: string; attribution?: string }
  | { type: 'spec';         rows: { key: string; value: string[] }[] }
  | { type: 'code';         lang: string; source: string; caption?: string };
```

```ts
// content/services/_types.ts
export type Service = {
  slug: string; index: number;          // drives the [01]…[05] numerals
  name: string; headline: string; lead: string;
  icon: string;                          // line-art SVG id
  skills: string[]; deliverables: string[]; industries: string[];
  output: string[]; tools: string[];     // the accordion's inverted right panel
  featuredWorkSlug: string;
  faq: { q: string; a: string }[];       // 6 each, auto-numbered at render
  relatedWorkSlugs: string[];
};
```

```ts
// content/posts/_types.ts — frontmatter for MDX
export type Post = {
  slug: string; title: string; category: 'Design'|'Engineering'|'Process'|'Tools';
  date: string; readingTime: number; excerpt: string;
  cover?: string; relatedWorkSlug?: string;
};
```

---

## 2. The twelve works

Order, thesis and accents come from RepoLogs. Summaries are the repo descriptions verbatim.
Services/tools/industries are assigned from each project's actual stack.

| # | slug | Title | Year | Status | Accent (dark) | Card |
|---|---|---|---|---|---|---|
| 01 | `tessera` | Tessera | 2026 | live | `#2595E4` | full |
| 02 | `co-canvas` | CanVas | 2026 | live | `#E75D23` | half |
| 03 | `discvault` | DiscVault | 2026 | live | `#747EF1` | wide |
| 04 | `rein-bot` | ReIN Bot | 2026 | live | `#DE54AB` | half |
| 05 | `martini` | Santioni | 2026 | archived | `#E25F5A` | wide |
| 06 | `valobot` | ValoBot | 2026 | live | `#E4587B` | half |
| 07 | `termtypo` | TermTypo | 2026 | live | `#5C9C32` | half |
| 08 | `reelshell` | ReelShell | 2026 | archived | `#12A5AA` | half |
| 09 | `solidus` | Solidus | 2026 | live | `#1BA755` | half |
| 10 | `ftc` | FTC | 2026 | live | `#C67A10` | half |
| 11 | `notetakerxx` | NoteTakerXX | 2026 | live | `#A58812` | wide |
| 12 | `droiddoodle` | DroidDoodle | 2026 | archived | `#A36EE7` | half |

`invertsPage` is **false** for all twelve — every accent above is a saturated colour on our dark
ground. (tonik's Letta inverts because its accent is a near-white `#c9cdd1`. If we later add a
work with a light accent, the flag exists.)

### Per-work detail

**01 · Tessera** — `#2595E4` / `#125C91`
*Thesis:* A drawing is a document an AI can edit.
*Summary:* Code-native pixel-art editor — the canvas is a JSON document with an AI editing agent
proposing reviewable pixel diffs on top.
Services: Product Design, Engineering · Tools: TypeScript, React, Canvas, LLM APIs
Industries: AI, Creative Coding · Live: `tessera-brown-pi.vercel.app`

**02 · CanVas (co-canvas)** — `#E75D23` / `#973911`
*Thesis:* A URL is the whole account system.
*Summary:* Realtime collaborative rooms pairing a shared block-editor document with a shared
Excalidraw canvas — join by room name, no accounts, synced live via Yjs over a Cloudflare Worker.
Services: Product Design, Engineering · Tools: TypeScript, Yjs, Cloudflare Workers, WebSockets
Industries: Realtime, Dev Tools · Live: `co-canvas-web.vercel.app`

**03 · DiscVault** — `#747EF1` / `#1627DF`
*Thesis:* An attachment cap is a block size.
*Summary:* Chunked large-file storage on Discord's free-tier attachment limits, retrieved via a
SHA-256-verified manifest — controlled from CLI, website, desktop exe, and Android apk.
Services: Engineering · Tools: TypeScript, Node, Discord API, SHA-256
Industries: Dev Tools · Live: `discvault.onrender.com`

**04 · ReIN Bot** — `#DE54AB` / `#A31F72`
*Thesis:* A free tier can host realtime multiplayer.
*Summary:* Guess the anime from its opening — multiplayer party game with server-side fuzzy
answer matching, curated 20s clips, and an all-free-tier stack.
Services: Product Design, Engineering · Tools: PostgreSQL, Supabase, FFmpeg, GitHub Actions
Industries: Realtime · Live: `sayandeep1013.github.io/Rein-Bot`
⚠️ **No images in repo — needs capture.**

**05 · Santioni (Martini-Recreation)** — `#E25F5A` / `#B8241F`
*Thesis:* A closed WebGL system can be read.
*Summary:* A study of santionispirits.com's WebGL experience at two fidelity tiers: an exact
offline mirror and a Next.js/GSAP DOM rebuild of the scroll-driven acts.
Services: Websites, Engineering · Tools: GLSL, WebGL, Next.js, GSAP
Industries: Creative Coding · **The strongest evidence for the Websites service.**

**06 · ValoBot** — `#E4587B` / `#AB1C40`
*Thesis:* A model with no cutoff, if it fetches first.
*Summary:* Valorant esports intelligence dashboard — live match/team/player data from VLR.gg
plus CYPHER, a Groq-powered conversational analyst grounded in that live context.
Services: Product Design, Engineering · Tools: Next.js, TypeScript, Groq
Industries: AI · Live: `valobot.vercel.app`

**07 · TermTypo** — `#5C9C32` / `#39631D`
*Thesis:* A terminal can be a ranked competitive arena.
*Summary:* Terminal-first multiplayer typing test — ranked 1v1 races, ELO ladder, and a global
leaderboard, cross-play between the CLI and a companion web app.
Services: Product Design, Engineering · Tools: Python, TypeScript, WebSockets
Industries: Dev Tools, Realtime · Live: `termtypo.vercel.app`

**08 · ReelShell** — `#12A5AA` / `#086063`
*Thesis:* A terminal can be a streaming client.
*Summary:* Terminal-native streaming service.
Services: Engineering · Tools: Go, TUI, mpv · Industries: Dev Tools

**09 · Solidus** — `#1BA755` / `#106534`
*Thesis:* A sideloaded app can still be updated.
*Summary:* Real-time multiplayer Bingo (Expo/React Native + Supabase) — ranked auto-matchmaking,
private rooms, and bot practice, with a leaderboard tracking wins and win rate.
Services: Product Design, Engineering · Tools: Expo, React Native, Supabase
Industries: Mobile, Realtime

**10 · FTC** — `#C67A10` / `#7F4F0A`
*Thesis:* No client decides the outcome.
*Summary:* Realtime multiplayer card game with a server-authoritative rules engine.
Services: Product Design, Engineering · Tools: Next.js, Supabase, TypeScript
Industries: Realtime · Live: `ftc-game.vercel.app`

**11 · NoteTakerXX** — `#A58812` / `#6A570C`
*Thesis:* Notes have coordinates.
*Summary:* Spatial note-taking — notes placed on a dot grid and linked with rope curves.
Services: Product Design, Engineering · Tools: TypeScript, Canvas
Industries: Dev Tools · Live: `rein-note.vercel.app`

**12 · DroidDoodle** — `#A36EE7` / `#6F22D3`
*Thesis:* A phone runs the model that drives the canvas.
*Summary:* On-device agentic AI driving a drawing canvas on Android.
Services: Product Design, Engineering · Tools: Kotlin, C++, on-device LLM
Industries: AI, Mobile

---

## 3. The five services

| # | slug | Name | Headline | Evidence |
|---|---|---|---|---|
| 01 | `product-design` | Product Design | "Your shortcut from idea to shipped. Where data meets delight." | strong — 8 works |
| 02 | `branding` | Branding | "Your culture and DNA, visualised." | **thin — 0 works** |
| 03 | `websites` | Websites | "Turning browsers into believers." | strong — Santioni, RepoLogs |
| 04 | `creative-development` | Creative Development | "The web, doing things the web isn't supposed to do." | this site, + phase 11's block pit |
| 05 | `engineering` | Engineering | "Your technical co-founder. Minus the equity sacrifice." | strongest — 12 works |

> **Service 04 was replaced on 2026-08-26.** It read `no-code` / "No-Code Development" /
> "Launch 10× faster. Conserve capital, validate early." — tonik's positioning, transcribed
> along with everything else. tonik build in Webflow; we build in Next.js with hand-written GSAP
> timelines, a custom GLSL material and a Matter.js floor, so that service line was a claim our
> own codebase contradicts. Sayandeep replaced it with **Creative Development**. See D-011.
>
> It also fixes the evidence problem in the row above: slot 04 had **zero** supporting works,
> and the replacement's strongest piece of evidence is the site it is written on.

**Service 02 is offered per your decision but has no portfolio evidence.** Its page leads with
the spec table and FAQ; its works grid falls back to studio-wide selected work with the honest
label "SELECTED WORK ACROSS THE STUDIO". Service 04 no longer needs that fallback, but it keeps
it until the works are actually written in phase 10.

**Accordion right-panel content** (OUTPUT / TOOLS) per service — e.g. Product Design:
OUTPUT — Audit and user tests · User flows · Style guides · Design systems · Interactive
prototypes · MVP definition · Product roadmap · Dev handover
TOOLS — Figma · FigJam · Spline · Three.js

**FAQ — 6 per service.** Question set mirrors tonik's, adapted:
How long is the process? · What if I come with just an idea? · How many iterations do you offer? ·
Do you work with early-stage teams? · What engagement models do you offer? · What is your availability?

---

## 4. Industries (5)

`ai` · `dev-tools` · `realtime` · `mobile` · `creative-coding`

| Industry | Works |
|---|---|
| AI | Tessera, ValoBot, DroidDoodle |
| Dev Tools | DiscVault, TermTypo, ReelShell, NoteTakerXX, CanVas |
| Realtime | CanVas, ReIN Bot, TermTypo, Solidus, FTC |
| Mobile | Solidus, DroidDoodle |
| Creative Coding | Tessera, Santioni |

---

## 5. Blog — 12 posts

Ported from RepoLogs `content/chapters.mjs` + `chapters-b.mjs` (~37KB of existing prose).
Each chapter's "the hard part" and "architecture" sections become an article; each links to its
work via `relatedWorkSlug`.

| slug | Title | Category | From |
|---|---|---|---|
| `attachment-cap-block-size` | An attachment cap is a block size | Engineering | DiscVault |
| `free-tier-realtime-multiplayer` | Running realtime multiplayer on a free tier | Engineering | ReIN Bot |
| `url-as-account-system` | The URL is the whole account system | Engineering | CanVas |
| `drawing-as-document` | A drawing is a document an AI can edit | Design | Tessera |
| `terminal-as-client` | The terminal is a perfectly good client | Engineering | ReelShell |
| `ranked-in-a-terminal` | Building a ranked ladder in a terminal | Engineering | TermTypo |
| `no-client-decides` | No client decides the outcome | Engineering | FTC |
| `sideloaded-and-updatable` | A sideloaded app can still be updated | Engineering | Solidus |
| `notes-have-coordinates` | Notes have coordinates | Design | NoteTakerXX |
| `grounding-beats-cutoff` | A model with no cutoff, if it fetches first | Engineering | ValoBot |
| `model-on-the-phone` | Running the model on the phone | Engineering | DroidDoodle |
| `reading-a-closed-webgl-system` | Reading a closed WebGL system | Tools | Santioni |

Categories on the index filter: **Design · Engineering · Process · Tools**.
Current distribution is Engineering-heavy — worth writing 2–3 Process pieces later.

---

## 6. Stack wall (replaces the client logo wall)

Monochrome wordmarks, `opacity: .7`, all drawn from the works' actual `tools`:

React · Next.js · TypeScript · Three.js · GLSL · GSAP · Lenis · Supabase · PostgreSQL ·
Cloudflare Workers · Yjs · Expo · React Native · Kotlin · Go · Python · Node · FFmpeg ·
Vercel · Groq · Excalidraw · WebSockets

22 marks — coincidentally close to tonik's 28, so the wall reads at the same density.

---

## 7. Copy inventory — what still needs writing

| Item | Source | Status |
|---|---|---|
| Work summaries ×12 | repo descriptions | ✅ exists |
| Work theses ×12 | RepoLogs | ✅ exists |
| Case-study bodies ×12 | RepoLogs chapters | ⚠️ needs restructuring into `Block[]` |
| Blog posts ×12 | RepoLogs chapters | ⚠️ needs restructuring into MDX |
| Service pages ×5 | — | ❌ to write (~400 words each) |
| Service FAQs ×30 | — | ❌ to write |
| Industry pages ×5 | — | ❌ to write (~200 words each) |
| Homepage hero + section leads | — | ❌ to write |
| About page | — | ❌ to write (the largest single writing task) |

The About page is the one place with no existing source material. It needs a genuine studio
narrative — what No Filter is, how it works, what it refuses to do.
