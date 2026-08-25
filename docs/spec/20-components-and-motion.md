# Components and motion

Every interactive element, its anatomy, its states, and its exact animation.

**Two sources, both recovered.** tonik runs two animation engines and this spec draws on both:

| Marker | Source |
|---|---|
| **[src]** | the Slater/GSAP bundle — `docs/research/source/tonik-animations.js` |
| **[ix2]** | Webflow Interactions — `docs/research/source/tonik-ix2.json` (130 events, 39 action lists) |
| **[css]** | plain CSS `:hover` rules in their stylesheet — 24 of them, §22 |
| **[new]** | ours — things they don't have, or that we deliberately changed |

The IX2 layer carries almost every **hover** and **cursor-tracking** effect on the site, plus
the loader. Missing it on the first pass was the single largest gap in this document; §21 below
collects the interactions that live there.

---

## 1. Loader `<Loader />`

Global. Rendered in the root layout, above everything.

**Anatomy**
```
.loader                       fixed inset-0, z-9999, bg var(--grey-800)
                              display:flex; place-items:center
  └ .loader__mark             3rem square, color var(--white)
                              → the No Filter aperture glyph (SVG, currentColor)
```

**Enter — on every page mount [src: IX2 `a-23`]**

> **Corrected.** The Slater `initLoader()` I first specced from is **dead code — never called.**
> The real loader is a Webflow IX2 action list (`a-23 "preload-load-animation-in"`, fired on
> `PAGE_START`, `PAGE_SCROLL_UP` and `PAGE_FINISH`). Durations match, but the easing is
> **`inOutQuad`**, not `power3.in`. Case studies use an identical list, `a-32`.

```js
// exact IX2 sequence
gsap.timeline()
  .set('.loader',      { display: 'flex' })                                   // step 1, 0ms
  .to ('.loader__mark',{ opacity: 0, scale: .5, duration: .4, ease: 'power2.inOut' })  // inOutQuad
  .to ('.loader',      { yPercent: -100, duration: .6, ease: 'power2.inOut' }, '<')
  .set('.loader',      { display: 'none' })                                   // step 3
  .set('.loader__mark',{ opacity: 1 });                                       // reset for reuse
```

GSAP's `power2.inOut` is the exact equivalent of Webflow's `inOutQuad`.

**Exit — intercepting any internal link [src, corrected]**
```js
gsap.set('.loader',       { yPercent: 100, display: 'flex' });  // [new] was 200
gsap.set('.loader__mark', { opacity: 1, scale: 1 });
gsap.to ('.loader', {
  yPercent: 0,                                                   // [new] was 100
  duration: .5, ease: 'power3.out',
  onComplete: () => router.push(href)
});
```

> **The one deliberate fix.** tonik animates `200 → 100`, which leaves the panel below the fold —
> the cover you see is actually the *next* page's loader painting at 0. It works, but the exit
> tween is invisible and the handoff can flash. We animate `100 → 0` so the panel genuinely
> sweeps up over the outgoing page.

**Case-study link variant [src]** — before navigating, tint to the incoming accent:
```js
loader.style.backgroundColor = darken(work.accent, 10);
gsap.to('.loader', { yPercent: 0, duration: .5, ease: 'power3.out' });
gsap.to('.loader', { backgroundColor: '#3b3b3b', duration: .3, delay: .2,
                     onComplete: navigate }, '<');
```

**bfcache guard [src]**
```js
window.addEventListener('pageshow', e => {
  if (e.persisted) gsap.set('.loader', { display: 'none' });
});
```

**Reduced motion [new]** — 200ms opacity fade both directions, no transform.

---

## 2. Navbar `<Navbar />`

**Anatomy**
```
.nav                     fixed inset:0 0 auto, z-10, bg transparent
                         padding-top 1.5rem, transition all .3s ease-in-out
  └ .nav__logo           wordmark, 4.25rem × 1.25rem
  └ .nav__links          WORKS¹² · ABOUT · SERVICES · BLOG
  └ .nav__cta            CONTACT pill (inverted: light bg, dark text, dark circle arrow)
  └ .nav__burger         ≤991 only — a "+" glyph
```

**States**

| State | Change |
|---|---|
| default | transparent, `padding-top: 1.5rem` |
| `.is-mini` **[src]** | `background: var(--black)`, `padding-top: .75rem` |
| link default | `color: var(--white)`, `padding: .4rem .5rem`, `--t-label` |
| link active **[src]** | filled pill — `background: var(--white-10)` |
| link hover **[css]** | `background: var(--white-10)` — **disabled below 991px** (`background: transparent`) |

**Mini toggle [src]**
```js
ScrollTrigger.create({
  trigger: 'main', start: '1rem top', end: '30rem top',
  onLeave:      () => nav.classList.add('is-mini'),
  onEnterBack:  () => nav.classList.remove('is-mini'),
});
```

**Mobile burger [src]** — the glyph is a `+` built from two 1px strokes. Opening rotates only
the **vertical** stroke:
```js
gsap.to('.nav__burger-vline', { rotate: open ? 90 : 0, duration: .5 });
```
Menu panel slides down; `lenis.stop()` while open.

**`WORKS¹²`** — the superscript is `--t-label-sm`, `vertical-align: super`, bound to the works
count so it can never drift from reality.

---

## 3. Contact panel `<ContactPanel />`

Global, triggered by any `[data-contact]` element (nav CTA, CTA block, footer, service heroes).

**Anatomy**
```
.contact                 fixed inset-0, z-9000, bg var(--black-50), display:none
  └ .contact__gif        bottom-left, translated y:100% at rest
  └ .contact__sidebar    absolute right-0, width 56%, bg var(--white), text dark
                         translated x:100% at rest
      └ __heading        "Contact Us" (--t-h3) + lead (--t-p) + divider + close ×
      └ __body           [data-lenis-prevent] — Tally iframe (or native fallback)
```

**Open [src]**
```js
const tl = gsap.timeline({ paused: true,
  onReverseComplete: () => { section.style.display = 'none'; open = false; } });

tl.set('.contact__heading', { opacity: 0 })
  .set('.contact__meta',    { opacity: 0, x: '10%' })
  .to ('.contact',          { opacity: 1, duration: .4 })
  .to ('.contact__sidebar', { x: '0%',    duration: .7 }, '<+0.3')
  .to ('.contact__heading', { opacity: 1, duration: .3 }, '<+0.2')
  .to ('.contact__meta',    { opacity: 1, x: '0%', duration: .5, ease: 'power3.out',
                              stagger: { amount: .5, from: 'start', each: .1 } }, '<')
  .to ('.contact__gif',     { y: '0%',    duration: .5 }, '<+0.2');
```

**Close [src]** — `tl.timeScale(1.2).reverse()`. Triggers: × button, scrim click, `Escape`.
`lenis.stop()` on open, `lenis.start()` on close.

**Form** (native fallback, styled to match Tally exactly)

| Field | Type | Style |
|---|---|---|
| NAME / COMPANY | text, 2-up | `bg var(--grey-600)`, mono uppercase placeholder |
| EMAIL | email, full | same |
| HOW CAN WE HELP YOU? | chip multi-select ×5 (the five services) | chips: `bg var(--grey-600)`, selected → `bg var(--black)` `color var(--white)` |
| TELL US ABOUT YOUR PROJECT | textarea | same |
| WHAT BUDGET DO YOU HAVE? | select | same + chevron |
| WHERE DID YOU FIND US? | chip multi-select ×4 | same |
| SUBMIT A FORM | full-width bar, `bg var(--black)`, `color var(--white)`, circular arrow right |

---

## 4. Scroll text reveal `<RevealText />`

The site's signature motion. Applied to every section lead paragraph and most H2s.

**[src]**
```js
const split = new SplitType(el, { types: 'words', tagName: 'span' });
gsap.timeline({
  scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 10%', scrub: 1 }
}).from(split.words, {
  opacity: .2, duration: .4, ease: 'power1.out', stagger: { each: .1 }
});
```

Words rest at **20% opacity** and light to full in a scrubbed stagger. Desktop only (`>991`).
Below that the text renders at full opacity with no split.

**Implementation note:** split *after* fonts load (`document.fonts.ready`) or the word boxes
measure wrong. Re-split on resize via `ScrollTrigger.addEventListener('refreshInit')`.

---

## 5. Works grid `<WorksGrid />` + `<WorkCard />`

The largest and most important component. 7180px of the homepage.

**Grid structure**
- Two independent columns, each an ordinary block flow.
- Cards come in three widths: `half` (6/12, the default), `wide` (8/12), `full` (12/12, full-bleed).
- Columns scroll at **different parallax rates**, which is what creates the drifting, staggered feel.

**Parallax [src]** — desktop only
```js
'.works__col:nth-child(2n+1)' → gsap.to(el, { y: '-8%'  }, scrub 1, 'top bottom' → 'bottom top')
'.works__col:nth-child(2n+2)' → gsap.to(el, { y: '-10%' }, same)
```

### `<WorkCard />`

**Anatomy**
```
.work                              position:relative
  ├ .work__media                   16:10, overflow hidden
  │   ├ .work__img                 poster still
  │   ├ .work__video               muted loop reel, opacity 0 at rest
  │   ├ .work__wipe                absolute inset, bg var(--black), width 100%
  │   └ .work__badge               "CASE STUDY" chip, opacity 0
  ├ .work__sheet                   the hover detail sheet — opacity 0, bg var(--white)
  │                                dark text: SERVICES / TOOLS / INDUSTRIES / YEAR / LOCATION
  └ .work__info                    caption: mono client name (left) + description (right)
```

**Reveal on scroll [src]** — one-shot, guarded by a `data-revealed` flag
```js
gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 90%', end: 'bottom bottom' } })
  .to('.work__wipe',  { width: '0%',  duration: .75 })
  .to('.work__badge', { opacity: 1,   duration: .5 }, '>-0.2')
  .to('.work__info',  { opacity: 1,   duration: .5 }, '<');
```

**Hover [src]** — desktop only, one paused timeline per card, built on mount
```js
const tl = gsap.timeline({ paused: true, ease: 'power3.out' })
  .fromTo('.work__info', { y: '0%' }, { y: '-110%', duration: .25, ease: 'power1.inOut' })
  .fromTo(siblings,      { opacity: 1 }, { opacity: .3, duration: .4, ease: 'power1.inOut' }, '<');

onMouseEnter: gsap.set('.work__sheet', { opacity: 1 });
              tl.timeScale(1).play();
              if (hasReel) { gsap.set('.work__img', { opacity: 0 }); video.play(); }

onMouseLeave: tl.timeScale(1).reverse();
              if (hasReel) { gsap.set('.work__img', { opacity: 1 }); video.pause(); video.currentTime = 0; }

tl.eventCallback('onReverseComplete', () => gsap.set('.work__sheet', { opacity: 0 }));
```

Note `siblings` = every *other* card. Hovering one card dims the entire rest of the grid to
**30%**. This is the single most striking interaction on the site.

**Mobile (≤767) [src, observed]** — this is the important responsive change:
the hover sheet is **not hidden, it becomes permanent content**. Each card renders as a single
column: media, then a light `#EFEFEF` panel showing SERVICES / INDUSTRIES, then the title and
description in dark text. No hover, no dimming, no video swap.

### Testimonial cell

tonik interleaves testimonial cards into the same grid at `y: -12%` parallax.
**We have no testimonials (decision 2).** The cells are filled by promoting a work card to
`wide`. The parallax rate `-12%` is retained on those promoted cells so the grid rhythm survives.

---

## 6. Services accordion `<ServicesAccordion />`

Five rows. One open at a time.

**Row (closed)**
```
.svc__head        grid: icon 2rem | name (--t-h4) | arrow ↓
                  border-bottom: var(--hairline); padding 2rem 0
```

**Row (open)** — `background: var(--grey-900)`, arrow rotates ↓ → →

**Body — three columns**
```
| 1: prose (5/12)          | 2: testimonial (3/12)   | 3: spec panel (4/12)     |
| --t-h4 lead              | quote --t-p-big         | INVERTED: bg white       |
| 2–3 paragraphs --t-p     | 1px left rule           | OUTPUT list              |
| pill CTA "MORE ABOUT …"  | avatar 40px + name/role | TOOLS list               |
|                          |                         | FEATURED WORK thumb      |
```
Column 2 has no content for us (no testimonials) → columns 1 and 3 widen to 7/12 and 5/12.

**Open [src]** — `>767`
```js
gsap.timeline()
  .fromTo(body,  { height: 0 }, { height: 'auto', duration: .7 })
  .set  (right,  { opacity: 1 })
  .to   (right,  { x: '0%', duration: .5 });
featuredVideo?.play();
```

**Close [src]** — `>767`
```js
gsap.timeline()
  .to (right, { x: '-100%', duration: .6 })
  .set(right, { opacity: 0 })
  .to (body,  { height: 0, duration: .6 }, '>-0.1')
  .to (right, { height: '0%', duration: .6 }, '<');
featuredVideo?.pause(); featuredVideo.currentTime = 0;
```

**≤767 [src]** — height-only on both parts, no x-slide:
```js
open:  tl.fromTo(body, {height:0},{height:'auto',duration:.7})
         .fromTo(right,{height:0},{height:'auto',opacity:1,duration:.7},'<');
close: tl.to(body,{height:0,duration:.6}).to(right,{height:0,duration:.6},'<');
```

> tonik's source contains four `onComplate` typos (sic) in this function, so those callbacks
> never fire. We implement the evident intent with correctly-spelled `onComplete`.

---

## 7. FAQ accordion `<FaqAccordion />`

Service pages. Left column heading, right column rows.

**Auto-numbering [src]** — each row's numeral is generated, never authored:
```js
head.querySelector('.faq__num').textContent = `[${String(i + 1).padStart(2, '0')}]`;
```

**Row** — `[01]` superscript (`--t-label-sm`) + question (`--t-h4`) + arrow →
Open: `background: var(--grey-900)`, arrow → rotates to ↑, answer in `--t-p`.

**[src]**
```js
open:  gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .6 });
close: gsap.to(body, { height: 0, duration: .5 });
```

---

## 8. Spec table `<SpecTable />` — **the most reused component on the site**

Appears in four places with identical construction: the work hover sheet, the case-study hero,
the service hero, and the accordion's right panel.

```
.spec                       display: grid; grid-template-columns: 4fr 8fr
  └ .spec__row              border-bottom: var(--hairline); padding: .75rem 0
      ├ .spec__key          --t-label, color var(--text-secondary)
      └ .spec__value        --t-p, color var(--text-primary), one item per line
```

Keys seen in the wild: `SERVICES` `TOOLS` `INDUSTRIES` `YEAR` `LOCATION` `HIGHLIGHT` `LIVE`
`SKILLS` `DELIVERABLES` `PRODUCTS DESIGNED` `TEAM SIZE` `OUTPUT`.

Values are always a plain vertical list — never comma-separated, never chips.
On inverted surfaces the colours swap via the `--text-alternate` pair; no separate component.

---

## 9. Buttons

### Pill button `<Button />` — "LET'S TALK", "MORE ABOUT PRODUCT DESIGN"
```
padding .5rem .75rem; gap .5rem; border-radius 999px;
background var(--white-10); color var(--white); --t-label
  └ circular icon 1.5rem, background var(--white), icon dark
hover [new]: background var(--white-30), .3s ease-in-out
```

### Circle arrow `<IconCircle />` — CTA block, socials, form submit
```
aspect-ratio 1; border-radius 50%;
background var(--bg-alternate); color var(--text-alternate);
transition background-color .3s ease-in-out
.is-inverted → background var(--black), color var(--white)
```
Sizes: `1.5rem` inline, `2.5rem` social bars, `6rem` CTA block.

### Load-more `<LoadMoreButton />` [src]
The most elaborate hover on the site:
```js
gsap.timeline({ paused: true, ease: 'power3.out' })
  .to(label,     { y: '-2rem', duration: .5 })
  .to(iconBox,   { width: '100%', height: '100%', borderRadius: 0, duration: .5 }, '<')
  .to(chevron,   { opacity: 0, duration: .3 }, '<')
  .to(altLabel,  { opacity: 1, duration: .5 }, '>-0.1')
  .to(mediaBox,  { width: '100%', height: '100%', opacity: 1, duration: .4 }, '<-0.1');
// enter: .timeScale(1).play()   leave: .timeScale(1.5).reverse()
```

---

## 10. CTA block `<CtaBlock />`

```
.cta            background var(--grey-900); padding 3rem; min-height 23rem
                cursor pointer; the whole block opens the contact panel
  ├ label       "WORK WITH US" — --t-label, top-left
  ├ heading     "Get in touch." — --t-h1 (6rem), bottom-left
  └ arrow       IconCircle 6rem, right, vertically centred
hover [new]: background var(--grey-800) .3s; arrow scales 1.05
```

---

## 11. Stack wall `<StackWall />` (replaces tonik's client logo wall)

**≥768** — static centred flex-wrap grid of monochrome technology wordmarks, `opacity: .7`,
`gap: 3rem 4rem`, hover → `opacity: 1`.

**≤767 [src]** — becomes an infinite auto-scrolling marquee. tonik uses Splide auto-scroll;
we implement it with a GSAP loop (no library):
```js
const loop = gsap.to(track, {
  xPercent: -50, duration: 30, ease: 'none', repeat: -1,
});  // track contains the logo set duplicated twice
```
Matches their `speed: .8, pauseOnHover: false, autoWidth: true, loop: true`.

---

## 12. Culture collage `<CultureCollage />`

Hand-placed editorial photo scatter with mono captions.

**[src]**
```js
// parallax — only on photos flagged for it
'.culture__photo[data-parallax]' →
  gsap.to(el, { y: '-20%' }, { scrub: 1, start: 'top bottom', end: 'bottom top' });

// wipe reveal — every photo
'.culture__overlay' →
  gsap.to(el, { width: '0%', duration: 1 }, { start: 'top 70%', end: 'bottom bottom' });
```

Layout is authored, not generated: absolute positions on a 12-column reference at desktop,
collapsing to a simple 1-column stack at ≤767. **Our lowest-confidence layout (7/10)** — the
motion is exact but the composition is a design act we perform ourselves.

---

## 13. About: 3D photo flythrough `<Flythrough />`

**[src]** — 12 items, scrubbed
```js
wrapper.style.setProperty('--perspective', '1000px');
gsap.fromTo(items, { opacity: 0 },
  { opacity: 1, delay: .2, stagger: { amount: .6, from: 'random' } });

gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: list, start: 'top bottom+=5%', end: 'bottom top-=5%', scrub: true }
})
  .set  (list,  { rotationY: 25 })
  .set  (items, { z: () => gsap.utils.random(-1600, 200),
                  y: () => gsap.utils.random(0, 150) })
  .fromTo(items,{ xPercent: () => gsap.utils.random(-1000, -500) },
                { xPercent: () => gsap.utils.random( 500,  1000) }, 0)
  .fromTo(imgs, { scale: 2 }, { scale: .5 }, 0);
```

---

## 14. About: pinned 3D rise `<PinnedRise />`

**[src]** — the best motion on the site. 45 cards, pinned for 250% of viewport.
```js
gsap.timeline({
  defaults: { ease: 'sine' },
  scrollTrigger: { trigger: list, start: 'center center', end: '+=250%',
                   pin: wrapper, scrub: 1 }
})
  .set (list,     { perspective: 1000 })
  .from(items,    { y: window.innerHeight, rotationX: -70,
                    transformOrigin: '50% 0%', z: 100,
                    stagger: { amount: .4, from: 'random', grid: [4, 9] } })
  .to  (headline, { opacity: 0 }, '<+0.2');
```
Headline sits behind the cards and fades as they rise past it.
**Our fill:** 45 project artefacts rather than 45 faces (see brief, decision 2).

---

## 15. Showreel `<Showreel />` — GSAP Flip

The only use of Flip on the site. The hero's small play button *becomes* the full-screen player.

**Open [src]**
```js
const state = Flip.getState(btnBg);
section.classList.remove('is-hidden');
playerWrapper.appendChild(btnBg);              // reparent
gsap.to(btnIcon, { opacity: 0, duration: .4 });
Flip.from(state, { duration: 1, ease: 'power2.out', scale: true });

gsap.timeline()
  .to(player,  { opacity: 1, delay: .6, duration: .4 })
  .to(heading, { opacity: 1, duration: .5 }, '<+0.2')
  .to(section, { backgroundColor: '#21212180', duration: .4,
                 onComplete: () => plyr.play() }, '<');
```

**Close [src]**
```js
const state = Flip.getState(btnBg);
btn.appendChild(btnBg);                        // reparent back
plyr.stop();
gsap.timeline()
  .to(player,  { opacity: 0, duration: .4 })
  .to(heading, { opacity: 0, duration: .4 }, '<')
  .to(section, { backgroundColor: '#21212100', duration: .3,
                 onComplete: () => section.classList.add('is-hidden') }, '<+0.1');
Flip.from(state, { delay: .3, duration: .6, ease: 'power2.out', absolute: true });
gsap.to(btnIcon, { opacity: 1, delay: .4, duration: .4 });
```

Controls fade in on `play`, out on `pause`/`ended`; volume set to `.3` on first play.

---

## 16. Ajax lightbox `<WorkLightbox />`

Opens a case study over the grid without a full navigation. **[src]**

```js
fetch(href).then(r => r.text()).then(html => {
  const doc  = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.querySelector('[data-modal-content]');
  document.title = doc.querySelector('title').innerText;
  history.replaceState({}, '', href);
  modal.append(body);
  tl.play();
});

tl.set  (lightbox, { display: 'flex', onComplete: () => modal.scrollTop = 0 })
  .fromTo(lightbox,{ opacity: 0 }, { opacity: 1, duration: .4 })
  .fromTo(wrapper, { x: '120%' },  { x: '0%',   duration: .7 }, '>-0.1');
```

Closes on ×, scrim, outside click, and `Escape`. Focus trap: the last focusable element's
`focusout` returns focus to the close button.

**Next.js adaptation:** rather than `fetch` + `DOMParser`, use a parallel route
(`@modal/(.)works/[slug]`) with the same Flip-less slide-in timeline. Identical feel, real
routing, no HTML parsing.

---

## 17. Secondary service nav `<ServiceNav />`

Sits above the service hero, below the main navbar.

```
[01] Product Design   [02] Branding   [03] Websites   [04] No-code   [05] Engineering
                                                        FILTER BY INDUSTRY ▾
border-bottom: var(--hairline)
```
Active item `color var(--white)`; the rest `color var(--text-secondary)`. Numerals are
`--t-label-sm` superscripts.

**≤767 [src]** — becomes a horizontal swipe carousel starting on the active index
(`perPage: 3, autoWidth, focus: 0, omitEnd: true, arrows: false, pagination: false`).
We implement with Embla and the same options.

---

## 18. Custom cursor `<CustomCursor />` — case-study pages only

tonik mounts `.custom-cursor_component` on case studies only. A small circle that lerps toward
the pointer and scales up over media, showing a mono label ("VIEW", "DRAG").
Desktop only; disabled under `prefers-reduced-motion` and on touch.

```js
gsap.ticker.add(() => {
  pos.x += (mouse.x - pos.x) * 0.15;
  pos.y += (mouse.y - pos.y) * 0.15;
  gsap.set(cursor, { x: pos.x, y: pos.y });
});
```

---

## 19. Blog card `<BlogCard />`

```
.post              background var(--grey-800); padding 1.5rem; min-height 22rem
                   display: flex; flex-direction: column; justify-content: space-between
  ├ title          --t-h3, top
  ├ divider        var(--hairline), above the footer row
  └ category       --t-label, bottom-left  ·  "READ ARTICLE" --t-label, bottom-right
hover [new]: cover image cross-fades in behind at opacity .25; title shifts x .25rem
```

Three per row on the blog card row; a filtered grid on `/blog`.

---

## 20. Footer `<Footer />`

```
border-top: var(--hairline); padding: 6rem var(--gutter) 3rem
┌ SERVICES (icon + label ×5)              │ BUSINESS ENQUIRIES → email
│                                          │ OPPORTUNITIES → …
│                                          │ CITY, CC · GMT+X + address
│                                          │ SOCIALS → full-width bars, bg var(--grey-800),
│                                          │           IconCircle ↗ right
├ mono tagline (--t-label, --text-secondary)
└ WORDMARK — font-size: 14vw, color var(--white), line-height .8
                                            year · privacy policy, bottom-right
```

The `14vw` wordmark is the one place the site abandons rem. Keep it in `vw`.

**Service link hover [ix2 `a-17`/`a-18`]** — the footer service list uses the same sibling-dim
pattern as the works grid:

```
in : siblings .service-link → opacity 0.3, 400ms inOutQuad
out: .service-link          → opacity 1,   400ms inOutQuad
```

---

## 21. The IX2 interaction layer

Everything below was recovered from Webflow's Interactions store and is reproduced with GSAP.
Webflow easing names map directly: `inOutQuad → power2.inOut`, `outCirc → circ.out`,
`easeInOut → power1.inOut`, `ease → power1.inOut`.

### 21.1 Sibling-dim — a site-wide pattern

Three separate components dim their siblings to exactly **0.3** on hover:

| Component | Action list | Duration / ease |
|---|---|---|
| Works grid card | `[src]` GSAP | .4s `power1.inOut` |
| Footer service link | `[ix2] a-17/a-18` | 400ms `inOutQuad` |
| Featured-customer link | `[ix2] a-27/a-28` | 500ms `ease` |

Treat this as one shared primitive, `useSiblingDim(0.3)`, not three implementations.

### 21.2 Work thumbnail overlay [ix2 `a-29`/`a-30`]

An extra layer under the GSAP hover timeline, easy to miss:

```
in : ↳ .fade-away-overlay → opacity 0.55, 500ms ease
out: ↳ .fade-away-overlay → opacity 0,    400ms ease
```

Note the asymmetry — **out is faster than in** here, the inverse of the site's usual rule.

### 21.3 Button icon — diagonal swap [ix2 `a-25`/`a-26`]

The signature button hover. Two stacked icons trade places along a diagonal:

```
INITIAL  .button-icon              x 0%     y 0%     rotate 325°
         .button-icon.is-absolute  x -101%  y 101%
HOVER    .button-icon              x 101%   y -101%   300ms outCirc
         .button-icon.is-absolute  x 0%     y 0%      300ms outCirc
OUT      both return                         300ms outCirc
```

The arrow exits toward the top-right and its twin arrives from the bottom-left, so the icon
appears to be replaced rather than moved. The `325°` rotate is a static offset that orients the
glyph along the diagonal — it does not animate.

### 21.4 Load-more button — layered cursor parallax [ix2 `a-8`]

Three media layers behind the button track the cursor at different depths. Runs on **all**
breakpoints.

| Layer | Mouse X (0→100%) | Mouse Y (0→100%) |
|---|---|---|
| `.gif-img.is-1` | −10% → +10% | −10% → +10% |
| `.gif-img.is-2` | −15% → +15% | −15% → +15% |
| `.gif-img.is-3` | −8% → +8% | −8% → +8% |

500ms smoothing on each. This sits *underneath* the GSAP load-more timeline in §9.

### 21.5 Custom cursor — a five-part system [ix2 `a-10`–`a-14`]

Case-study and careers pages only. More than the simple follower I first specced.

```
hover in  [a-10]  .custom-cursor_wrapper  scale 0→1,  500ms easeInOut
                                          opacity 0→1, 200ms easeInOut
hover out [a-11]  .custom-cursor_wrapper  scale 1→0,  400ms easeInOut
                                          opacity → 0, 0ms (instant)
move      [a-14]  cursor element          x −50→+50px, y −50→+50px across the viewport
click     [a-12]  .is-cursor + .is-cursor-abs  y → −100%, 500ms easeInOut
2nd click [a-13]  .is-cursor + .is-cursor-abs  y → 0%,    500ms easeInOut
```

Two details worth keeping:

- **The move is a ±50px range, not 1:1 tracking.** The cursor element is centred and drifts
  within a small window as the pointer crosses the viewport — it reads as a considered object,
  not a mouse follower.
- **Click toggles a label.** Two stacked text elements slide `y: −100%` together on first click
  and back on the second, swapping the cursor's caption (e.g. `DRAG` ↔ `RELEASE`).

### 21.6 Meetup image — cursor-tracked with tilt [ix2 `a-19`–`a-22`]

About page. Hovering a meetup item reveals its image, which then tracks the cursor and tilts:

```
reveal [a-19]  siblings .img-box  scale .7→1, 500ms easeInOut · opacity 0→1, 300ms easeInOut
hide   [a-20]  reverse
track X [a-21] .img-box  @15%: x 0%,   rotate −2°   →  @80%: x 100%, rotate +2°
track Y [a-22] .img-box  @0%:  y −50%                →  @100%: y −25%
```

The X curve is clamped to the 15–80% band, so the image stops short of the viewport edges.

### 21.7 Filter dropdown [ix2 `a-6`/`a-7`]

Works/service industry filter:

```
open  .filter-dropdown_list  y 20%→0%, opacity 0→1, 500ms inOutQuad · chevron rotate → 0°
close reverse
```

### 21.8 Feed heading scroll fade [ix2 `a-24`]

`.feed-hero_heading-wrapper` opacity `1 → 0` across the first **50%** of scroll progress.

### 21.9 What we do not port

These action lists belong to tonik pages we dropped (decision 2) and have no equivalent here:
`a-2` / `a-34` / `a-35` / `a-36` (seed-capital page loads), `a-37` / `a-38` (fund clock),
`a-39`–`a-45` (job-offer forms and see-more toggles), `a-16` (careers cursor).

---

## 22. Plain CSS hover states

The third and easiest-to-overlook layer. These are ordinary `:hover` rules in their stylesheet,
independent of both GSAP and IX2. All inherit the global `transition` on their base class.

| Selector | Declaration |
|---|---|
| `.navbar_link:hover` | `background-color: var(--white-10)` — **reset to transparent ≤991px** |
| `.home-hero_video-btn:hover` | `transform: scale(1.1)` — the inline hero play button |
| `.contact-us_close-btn:hover` | `opacity: .5; transform: rotate(90deg)` |
| `.home-showreel_close-btn:hover` | `opacity: .5; transform: rotate(90deg)` |
| `.service-hero_navbar-link:hover`, `.w--current` | `color: var(--text-primary)` — secondary service nav |
| `.blog-main_filter-radio-field:hover` | `color: var(--white)` (and a `--grey-700` variant) |
| `.filter-dropdown_toggle:hover` | `opacity: .6` |
| `.filter-dropdown_item-link:hover` | `opacity: .6` |
| `.drop-down_icon-box:hover` | `transform: rotate(90deg) scale(1.2)` |
| `.form_input:hover` | `border-color: var(--grey-700)` |
| `.form_radio-btn:hover` | `border-color: #0000004d` |
| `.check-box:hover` | `background-color: #00000026` |
| `.lightbox_overlay:hover` | `background-color: var(--overlay)` |
| `.banner:hover` | `opacity: .7` |
| `a:hover` | `outline: 0` |

**The two patterns worth internalising:** close buttons *rotate 90° and half-fade*; secondary
controls *drop to `.6` opacity*. Both are consistent site-wide and cost nothing to reproduce.

Rules for tonik pages we dropped (`.jo-form-*`, `.cs-coming-soon-badge`, `.button_gradient*`,
`.f-checkbox-butn-field`) are not ported.
