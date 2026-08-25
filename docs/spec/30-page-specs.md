# Page specifications

Section-by-section build order for all 10 templates. Heights given are tonik's measured values
at 1512×900 — our targets, not hard constraints.

Global on every page: `<Loader />` · `<Navbar />` · `<ContactPanel />` · `<Footer />` ·
`<BlockPit />`.

**`<BlockPit />` sits below the footer on every page** — the last thing on the document, after
the `14vw` wordmark, separated by a single hairline. A 60vh pile of soft labelled tiles you can
sweep, drag and throw. Full specification in `70-physics-footer.md`. It is our own addition;
tonik has nothing like it.

---

## `/` — Homepage

Target ~12,900px / ~14 screens at 900px viewport. tonik's is 12,884px.

### 1. Hero — 1361px

```
<section class="hero">
  ├ <Hero3D />                       ← rendered in root layout, NOT here (see note)
  ├ .hero__copy
  │   ├ h1 (--t-h1, 6rem, two lines)
  │   │   "Design and engineering"  /  [▶] "for people who ship"
  │   │   The play button sits INLINE in the text flow on line 2.
  │   └ .hero__labels  (2-up, --t-label, above a hairline, pinned to section bottom)
  │       left:  "0→1 DESIGN AND ENGINEERING FOR PEOPLE WHO SHIP"
  │       right: "12 SHIPPED PROJECTS · 8 LIVE IN PRODUCTION"
  └ <StackWall />                    ← 461px, below the 900px viewport fold
```

> **Critical architectural note.** The 3D canvas must be mounted in the **root layout**, outside
> `<main>`, exactly as tonik does (`.hero-absolute-wrapper-3d` is a sibling of `<main>`).
> `position: absolute; inset: 0; height: 100vh; z-index: 0`. This is what lets it survive route
> changes without re-initialising WebGL.

### 2. Works — ~7180px

```
<section class="works">
  ├ <RevealText as="h2">              ← the scrubbed word reveal
  │   "A studio that defines, designs, and builds products
  │    and other digital machinery."
  ├ <WorksGrid>                       ← 12 cards, 2 columns, differential parallax
  │   col A: -8%   col B: -10%
  │   widths: half ×8, wide ×3, full ×1
  └ <LoadMoreButton>  "SEE ALL WORK" → /works
```

Card order interleaves the two columns so the visual weight alternates. Cards promoted to
`wide` occupy the cells where tonik places testimonials, preserving the grid rhythm.

### 3. Services — 902px

```
<section class="services">
  ├ .services__label      "OUR SERVICES" (--t-label)
  ├ <RevealText as="p">   "Design is the API between vision and reality.
  │                        Consider us your gateway."
  └ <ServicesAccordion>   5 rows, first closed by default
```

### 4. CTA — 370px — `<CtaBlock />`

### 5. Culture — 1781px — `<CultureCollage />`

```
├ .culture__label        "OUR STUDIO" (--t-label, left column)
├ heading + lead         (right column, --t-h2 + --t-p)
└ photo scatter          6–8 photos, mono captions, parallax + wipe
```
Content: workspace, screens, process shots, conference/meetup photos.

### 6. Blog row — 632px — 3 × `<BlogCard />` + "Check out our blog" link

### 7. Footer — 659px

---

## `/works` — Works index

Reuses the service-page shell without the service-specific parts.

```
├ <ServiceNav />              secondary nav + "FILTER BY INDUSTRY ▾"
├ .works-hero                 h1 "Selected work" + lead + count
├ <WorksGrid full />          all 12, same parallax and hover mechanics
├ <CtaBlock />
└ blog row
```

The industry filter is a client-side facet over `work.industries`. Filtering re-runs
`ScrollTrigger.refresh()` and re-arms the reveal timelines (tonik does this with a
`ResizeObserver` on the list — we use a layout effect keyed on the filter value).

---

## `/works/[slug]` — Case study ×12

Target ~7,700–9,300px. tonik's Letta is 7,666px; Supabase 9,280px.

**Page-level theming.** On mount, read the work's accent and drive:
```js
document.documentElement.style.setProperty('--accent', work.accent.dark);
gsap.fromTo(themedEls, { backgroundColor: '#212121' },
                       { backgroundColor: work.accent.dark, duration: .7 });
```
If `work.invertsPage` is true, the ground becomes `work.accent.light` and all text flips to
`--text-alternate` — exactly as tonik's Letta page does with `#c9cdd1`.

Also mounts `<CustomCursor />` (case studies only).

### Sections

```
1. cs-hero                    ~1550px
   ├ .cs__mini-nav            ← BACK TO WORK · slug · next →
   ├ h1                       work title (--t-h1)
   ├ .cs__reel                full-bleed hero video, Plyr, autoplay muted loop, controls:false
   └ .cs__info                2-up:
       left  — lead paragraph (--t-p-big)
       right — <SpecTable>  SERVICES · INDUSTRIES · TOOLS · HIGHLIGHT · LIVE

2. cs-content                 ~4200px  ← composable block stack
   Block types (author picks the sequence per work):
     · prose          heading (--t-h3) + rich text, 7/12 column
     · visual-full    one image/video, full container width
     · visual-2up     two images side by side, 1.5rem gap
     · visual-bleed   edge-to-edge, breaks the gutter
     · slider         Embla carousel, prev/next, counter — replaces tonik's Swiper
     · quote          large pull quote (--t-p-big), 1px left rule
     · spec           an inline <SpecTable> for mid-article detail
     · code           syntax-highlighted specimen (see blog post spec)

3. cs-footer                  ~1270px
   ├ .cs__outcome             LIVE URL · REPO · PACKAGE — big link rows with IconCircle ↗
   └ <NextWork />             full-bleed next-project card, accent crossfading to the next
```

**Block rhythm rule.** Never more than two prose blocks in a row without a visual. tonik's
observed cadence is roughly `prose → visual-2up → prose → visual-bleed → slider → quote →
visual-full → prose`.

---

## `/services/[slug]` — Service page ×5

Target ~5,330px (tonik's `/product-design` measured exactly).

```
├ <ServiceNav />                      174px — 5 numbered items + industry filter
├ .svc-hero                           1139px
│   left  (7/12): h1 (--t-h2) + lead (--t-p) + pill "LET'S TALK"
│   right (4/12): <SpecTable>
│       SKILLS · DELIVERABLES · INDUSTRIES WE WORK IN · PROJECTS SHIPPED · TEAM SIZE
├ .svc-works                          1560px — <WorksGrid> filtered to this service
├ .svc-faq                            795px
│   left  (5/12): "More about {service}" (--t-h2)
│   right (7/12): <FaqAccordion> — 6 questions, auto-numbered
├ <CtaBlock />                        370px
└ blog row                            632px
```

The five slugs: `product-design`, `websites`, `branding`, `no-code`, `engineering`.

> Per your instruction, we offer all five. Two of them — `branding` and `no-code` — have no
> supporting work in the repos. Their works grids will be empty or thin. The spec table and FAQ
> carry those pages instead, and the works grid falls back to "Selected work across the studio".

---

## `/about`

Target ~9,415px.

```
1. about-hero        1586px  h1 "We are cool humans and we make a fuss"
                             + <Flythrough /> (12 images) + lead + supporting prose
2. vision            1398px  "AGENCY + BUILDER" label, manifesto, <RevealText>
3. meetup            1433px  photo/story block — how we work
4. people            3103px  <PinnedRise /> — headline "no filter is people"
                             45 artefacts, 4×9 grid, pinned 250%
5. open              234px   "Always open to new nodes in our network" + contact link
6. <CtaBlock />      370px
7. blog row          632px
```

---

## `/blog` — Index

```
├ .blog-hero        h1 "We share what we know." + lead
├ .blog-filters     category radio pills — DESIGN · ENGINEERING · PROCESS · TOOLS
│                   active gets .is-active (filled pill); client-side filter
└ .blog-grid        3-col <BlogCard /> grid, 1-col ≤767
```

`<CtaBlock />` closes the page (no blog row — it would be recursive).

---

## `/blog/[slug]` — Post ×12

```
├ .post-hero        category (--t-label) · h1 (--t-h1-sm) · date · read time
├ .post-body        7/12 column, MDX
│   h2 --t-h3 · h3 --t-h5 · p --t-p · blockquote with 1px left rule
│   figure + mono caption · <pre><code> syntax-highlighted
└ .post-footer      prev/next post + <CtaBlock />
```

**Code highlighting.** tonik uses a regex pass at runtime (`styleCode`). We use **Shiki at build
time** — same visual result, correct tokenisation, zero runtime cost. Theme tuned to our palette:
strings `--accent`, keywords `--white`, comments `--grey-700`, numbers `--white-50`.

---

## `/industries/[slug]` ×5

Reduced from tonik's 13 to the five we can evidence: `ai`, `dev-tools`, `realtime`, `mobile`,
`creative-coding`.

```
├ <ServiceNav variant="industry" />
├ .ind-hero          h1 + lead + <SpecTable> (WHAT WE BUILD · TYPICAL STACK · EXAMPLES)
├ <WorksGrid />      filtered to this industry
├ <CtaBlock />
└ blog row
```

---

## `/404`

```
├ .lost__grid        a placeholder grid overlay, opacity 1
└ .lost__img         a project still, filter: blur(24px)
```

**[src]**
```js
gsap.timeline({ ease: 'power3.out' })
  .set(img,  { filter: 'blur(24px)' })
  .to (grid, { opacity: 0, delay: .5, duration: .3 })
  .to (img,  { filter: 'blur(0px)', duration: 1 }, '<+0.1');
```
Plus "PAGE NOT FOUND" (`--t-h1`) and a pill back to `/`.

---

## `/privacy`

Single prose column, `--t-p`, 7/12. No motion beyond the loader.

---

## Route summary

| Route | Count | Template |
|---|---|---|
| `/` | 1 | homepage |
| `/works` | 1 | works index |
| `/works/[slug]` | 12 | case study |
| `/services/[slug]` | 5 | service |
| `/about` | 1 | about |
| `/blog` | 1 | blog index |
| `/blog/[slug]` | 12 | blog post |
| `/industries/[slug]` | 5 | industry |
| `/privacy`, `/404` | 2 | minimal |
| | **40** | **10 templates** |
