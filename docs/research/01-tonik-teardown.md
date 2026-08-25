# tonik.com — full technical teardown

Captured 2026-08-25 at 1512×900 (and 390×844). Source of truth for the No Filter rebuild.

## 1. Stack (what they actually run)

| Layer | Theirs | Note |
|---|---|---|
| CMS / host | **Webflow** (`cdn.prod.website-files.com`) | all markup is Webflow-generated |
| Custom JS | **Slater** (`assets.slater.app/slater/9281/20081.js`) | 24KB ES module, recovered in full |
| Animation | **GSAP 3.11.3** + ScrollTrigger + **Flip 3.12.5** | Flip is used only for the showreel |
| Text split | **SplitType** (unpkg) | words only, `tagName: span` |
| Smooth scroll | **Lenis 1.0.23** (studio-freight) | `lerp .1, wheelMultiplier .7` |
| 3D hero | **Spline** (`@splinetool/runtime`) | scene `Nbj6s1LtKEf3QmSk`, 201KB msgpack. NOT hand-written GLSL. |
| Carousels | **Splide 4.1.4** + auto-scroll ext | mobile-only logo marquee; mobile service nav |
| CS sliders | **Swiper** | case-study image sliders only |
| Video | **Plyr 3.7.2** | showreel + case-study reels |
| Forms | **Tally.so** iframe | contact panel |
| Pagination | Finsweet `cmsload` | works grid "load more" |
| jQuery 3.5.1 | Webflow default | used for `$.each` loops in the custom JS |

**Key architectural note:** there is *no* Barba running, but every page carries
`data-barba-namespace` on `.main-wrapper` and it is used purely as a **page-type switch**
(`initMain()` switches on it). Page transitions are real navigations masked by the loader.

## 2. Design tokens

### Colour (from `:root`)

```
--c-primary--black        #212121   page background
--c-primary--white        #efefef   primary text
--c-secondary--grey-900   #2e2e2e   background-secondary (CTA panel, open accordion row)
--c-secondary--grey-800   #3b3b3b   background-tertiary (cards, loader, social bars)
--c-secondary--grey-700   #737373   text-secondary
--c-secondary--grey-600   #e0e0e0   border-alternate / form fills
--c-secondary--white-30   #ffffff4d border-primary (hairlines)
--c-secondary--white-10   #ffffff1a background-transparent (ghost buttons)
--c-background--overlay   #21212180 50% scrim
--overlay-darker          #212121b3 70% scrim
--text-white-50           #efefef80
system success  #027a48 / #ecfdf3      system error  #b42318 / #fef3f2
```

Inversion pair: `background-alternate = #efefef`, `text-alternate = #212121`.
The whole site is one dark theme plus **per-case-study accent theming** (see §7).

### Type

| Role | Family | Where |
|---|---|---|
| Display / body | **Neue Montreal** (Pangram Pangram, **commercial licence**) | all headings + prose |
| Labels / UI | **IBM Plex Mono** 300–700 | every uppercase label, nav, buttons, table keys |
| (loaded, unused) | Urbanist, Messinasans | — |

Scale (rem, on a fluid root — see below):

```
t-heading-1-rg        6rem   / 6rem     ls -.15rem   ("Get in touch.", hero)
t-heading-1-small-rg  3.25rem/ 3.25rem
t-heading-2-rg        5rem   / 5rem
t-heading-3-rg        2rem   / 2.5rem
t-heading-4-rg        2rem   / 2rem
t-heading-5-rg        1.5rem / 1.75rem
t-heading-6-rg        1rem   / 1.25rem
t-paragraph-big       1.25rem/ 1.6
t-paragraph-1-rg      1rem   / 1.25rem
t-paragraph-2-rg      .625rem/ .75rem
t-label-big           .875rem/ .875rem   UPPERCASE mono  ls -.0175rem
t-label-1-rg          .75rem / .75rem    UPPERCASE mono  ls -.015rem   <- the workhorse
t-label-2-rg          .5rem  / .5rem     UPPERCASE mono  ls -.01rem
```

### Fluid root (this is the whole responsive system)

```css
html { font-size: calc(0.4375rem + 0.625vw); }         /* >1440px */
@media (max-width:2400px){ html{ font-size: calc(0.4375rem + 0.625vw) } }
@media (max-width:1440px){ html{ font-size: 1rem } }   /* locks at 16px */
@media (max-width: 991px){ html{ font-size: 1rem } }
```

Verified: at 1512px root = **16.45px**. Every other value is rem, so the entire layout
scales linearly above 1440px and is fixed below it.

### Layout

- `.padding-global` = `0 2.5rem`
- `.container-large` = `max-width:100%` → content width = `100vw − 5rem`
- Navbar: `position:fixed`, `inset:0 0 auto`, `z-index:10`, `padding-top:1.5rem`,
  transparent, `transition: all .3s ease-in-out`
- Global: `::-webkit-scrollbar{display:none}` and inverted `::selection`
  (`#efefef` bg / `#212121` text)

## 3. The loader

DOM: `.loader-bar_component > .loader_img.w-embed > svg` — nothing else. No % counter, no bar.

```
.loader-bar_component: fixed inset:0; 100%×100%; bg #3B3B3B; z-index 9999;
                       display:flex; align-items:center; justify-content:center
.loader_img:           3rem square (49.35px @1512), fill currentColor #EFEFEF
```

**Enter** (`initLoader`), on arrival:

```js
gsap.to('.loader_img',           {opacity:0, scale:.5, duration:.4, ease:'power3.in'});
gsap.to('.loader-bar_component', {yPercent:-100, duration:.6, ease:'power3.in'}, '<');
```

**Exit** (`initLoaderOut`) — every `a[preloader-start="true"]` is intercepted:

```js
gsap.set('.loader-bar_component', {yPercent:200, display:'flex'});
gsap.set('.loader_img',           {opacity:1, scale:1});
gsap.to ('.loader-bar_component', {yPercent:100, duration:.5, ease:'power3.out',
                                   onComplete:()=> location.href = href});
```

On a case-study link it first tints the bar to `darkenColor(caseColor, 10%)`, then
crossfades it to `#3b3b3b` before navigating — so the incoming page's accent lands first.

`pageshow` with `event.persisted` force-hides the bar (bfcache guard).

> **Deliberate fix for our build:** `yPercent 200 → 100` leaves the panel off-screen; the
> visible cover comes only from the *next* page painting its loader at `yPercent 0`.
> We animate `100 → 0` instead so the exit is actually seen.

## 4. Homepage — 12,884px / 14.3 screens at 900px viewport

| # | Section | Height | Contents |
|---|---|---|---|
| 1 | `section_home-hero` | 1361 | Spline 3D + h1 + labels + client logo grid |
| 2 | `section_home-projects` | 7180 | scroll-reveal heading, 2-col works grid, testimonials |
| 3 | `section_services` | 902 | scroll-reveal heading + 5-row accordion |
| 4 | `section_cta` | 370 | "Get in touch." panel |
| 5 | `section_culture` | 1781 | editorial photo collage, parallax + wipes |
| 6 | `section_blogs` | 632 | 3 article cards |
| — | `footer` | 659 | link columns + 14vw wordmark |

### 4.1 Hero

- `.hero-absolute-wrapper-3d` sits **outside `<main>`**, `position:absolute`, full viewport,
  `z-index:0` — so the canvas survives page changes.
- Spline scene: dark matte asterisk glyph inside a gritty torus, slow idle rotation.
- `h1` is `t-heading-1-rg` (6rem) split over two lines with an **inline play button**
  (`.home-hero_video-btn`) sitting in the text flow on line 2.
- Bottom rail: two `t-label-1-rg` labels, left and right, above a hairline.
- Client logos: static flex-wrap grid ≥768px; **Splide auto-scroll marquee**
  (`speed .8`, `pauseOnHover:false`, `autoWidth`, `loop`) below 768px.

### 4.2 Scroll text reveal (used on 4+ sections)

The single most characteristic motion on the site.

```js
new SplitType('[text-split]', {types:'words', tagName:'span'});
$('[scroll-animation]').each(function(){
  gsap.timeline({scrollTrigger:{trigger:this, start:'top 90%', end:'top 10%', scrub:1}})
      .from($(this).find('.word'), {opacity:.2, duration:.4, ease:'power1.out',
                                    stagger:{each:.1}});
});
```

Words sit at 20% opacity and light to 100% in a scrubbed stagger.
**Desktop only** (`gsap.matchMedia('(min-width: 992px)')`).

### 4.3 Works grid

Two independent columns with different parallax rates:

```js
'.home-projects_cms-wrapper:nth-child(2n+1)'  -> y:'-8%'   scrub 1
'.home-projects_cms-wrapper:nth-child(2n+2)'  -> y:'-10%'  scrub 1
'.project_testimonial-wrapper'                -> y:'-12%'  scrub 1
```

Reveal on enter (`start:'top 90%'`, one-shot via a `data-reveal` flag):

```
.home-projects_color-overlay  width 100% -> 0%   (.75s wipe)
.home-projects_cs-label       opacity -> 1       (at '>-0.2')
.home-projects_item-info-box  opacity -> 1       (at '<')
```

Hover (>991px only), paused timeline played/reversed:

```
.home-projects_item-info-box  y 0% -> -110%   .25s power1.inOut   (caption slides away)
siblings                      opacity 1 -> .3 .4s power1.inOut    (everything else dims)
.home-projects_item-ds-box    set opacity 1                       (detail sheet)
video.play(); .home-projects_item-img opacity -> 0                (still swaps to reel)
```

Reverse on mouseleave; `onReverseComplete` returns the ds-box to `opacity:0`.
The detail sheet carries **Services · Tools · Industries · Year · Location** + title + description.

Cards come in three widths — half-column, wide, full-bleed — and **testimonial cells are
interleaved into the same grid** (quote, left hairline rule, 40px avatar, mono name + role).

### 4.4 Services accordion (`initServicesAcc`)

Row = icon + name (`t-heading-4-rg`) + arrow, hairline separated. One open at a time.

```js
open  (>767): tl.fromTo(body,{height:0},{height:'auto',duration:.7})
                .set(right,{opacity:1})
                .to(right,{x:'0%',duration:.5});           // right panel slides in
close (>767): tl.to(right,{x:'-100%',duration:.6})
                .set(right,{opacity:0})
                .to(body,{height:0,duration:.6},'>-0.1')
                .to(right,{height:'0%',duration:.6},'<');
```

Below 767 both parts animate height only. The featured case-study `<video>` plays on open
and pauses + resets to 0 on close.

Open row: bg → `#2E2E2E`, arrow ↓ rotates to →. Body is three columns —
prose + pill CTA | testimonial (1px vertical rule) | **inverted light panel** (`#EFEFEF`,
dark text) listing OUTPUT / TOOLS / FEATURED CASE STUDY.

### 4.5 CTA

`#2E2E2E` panel, "WORK WITH US" mono label top-left, `t-heading-1-rg` "Get in touch."
bottom-left, ~96px white circular arrow right. The whole panel is the contact trigger.

### 4.6 Culture (`initCulture`)

```js
'.culture_grid-photo-el[data-paralax=true]' -> y:'-20%'  scrub 1  (top bottom -> bottom top)
'.culture_grid-photo-overlay'               -> width:'0%'         (top 70% -> bottom bottom)
```

Scattered editorial collage, each photo captioned in `t-label-1-rg`.

### 4.7 Footer

Hairline top border. Left: SERVICES list (line-art icon + label). Right: BUSINESS ENQUIRIES,
OPPORTUNITIES, address + GMT, SOCIALS as full-width `#3B3B3B` bars with a circular ↗.
Bottom: mono tagline, then the wordmark at **`font-size: 14vw`** in `#EFEFEF`.

## 5. Navbar

```
.navbar_component          bg transparent, padding-top 1.5rem
.navbar_component.is-mini  bg #212121,     padding-top .75rem
transition: all .3s ease-in-out
```

Toggled by ScrollTrigger on `main`: `start:'1rem top'`, `end:'30rem top'`,
`onLeave` → add `is-mini`, `onEnterBack` → remove.

Links are `t-label-1-rg` (.75rem mono uppercase, padding `.4rem .5rem`); the active page gets
a filled pill. "WORKS" carries a superscript count. CONTACT is a light pill with a dark
circular arrow. Mobile: a **"+" glyph whose vertical stroke rotates 90°**
(`gsap.to(line,{rotate:'90deg',duration:.5})`).

## 6. Contact panel (`initContact`) — global

Right sidebar, `#EFEFEF`, ~56% viewport width, over a `#21212180` scrim.

```js
tl.set('.contact-us_heading-part',{opacity:0})
  .set('.contact-us_call-part,.contact-us_divider,.contact-us_bottom-part',{opacity:0,x:'10%'})
  .to(section,{opacity:1,duration:.4})
  .to(sidebar,{x:'0%',duration:.7},'<+0.3')
  .to('.contact-us_heading-part',{opacity:1,duration:.3},'<+0.2')
  .to([...],{opacity:1,x:'0%',duration:.5,ease:'power3.out',
             stagger:{amount:.5,from:'start',each:.1}},'<')
  .to('.contact-us_gif-img',{y:'0%',duration:.5},'<+0.2');
// close: tl.timeScale(1.2).reverse()
```

Form: grey-filled inputs with mono uppercase placeholders, **chip multi-selects** for service
and referral source, black "SUBMIT A FORM" bar with a circular arrow. A looping GIF slides up
on the left. `[data-lenis-prevent]` on the scroll container.

## 7. Case study template (`case-study`)

- `#color-container[data-color]` holds a **per-case accent** (e.g. Letta `#c9cdd1`).
  On load it fades nav / overlays / blog-image tints from `#212121` to that colour over `.7s`.
  The whole page inverts to a light ground with dark text when the accent is light.
- Adds a **custom cursor** (`.custom-cursor_component`) — case-study pages only.
- Sections: `section_cs-basic` (mini navbar, title, hero reel, info grid + key/value table:
  SERVICES · INDUSTRIES · TOOLS · HIGHLIGHT · LIVE) → `section_cs-full-content`
  (alternating rich text + full-bleed visuals + **Swiper** sliders + client testimonials)
  → `section_cs-full-footer` (next project).
- Hero reel autoplays muted via Plyr with `controls:false`, loops unless the slug is excluded.

## 8. About template

| Section | Height | Motion |
|---|---|---|
| `about-hero` | 1586 | **3D photo flythrough**, 12 images |
| `vision` | 1398 | — |
| `meetup` | 1433 | — |
| `people` | 3103 | **pinned 3D card rise**, 45 portraits |
| `open-pos` | 234 | — |

**Flythrough** (`initIntroAbout`): container `--perspective:1000px`, list `rotationY:25`,
each item `z: random(-1600,200)`, `y: random(0,150)`,
`xPercent: random(-1000,-500) → random(500,1000)`, inner img `scale: 2 → .5`,
all `scrub:true`, `ease:'none'`, `start:'top bottom+=5%'`, `end:'bottom top-=5%'`.
Items fade in staggered `from:'random'`.

**People** (`initPeopleScroll`): `pin: .people_wrapper`, `start:'center center'`,
`end:'+=250%'`, `scrub:1`, `perspective:1000`, then
`.from(items,{y: innerHeight, rotationX:-70, transformOrigin:'50% 0%', z:100,
stagger:{amount:.4, from:'random', grid:[4,9]}})`; the headline fades out at `'<+0.2'`.

## 9. Full route map

| Route | namespace | Sections |
|---|---|---|
| `/` | homepage | home-hero, home-projects, services, cta, culture, blogs |
| `/product-design` `/websites` `/branding` `/no-code-development` `/engineering` | `service-*` | service-hero, projects, service-qa, cta, blogs |
| `/case-studies/*` | case-study | cs-basic, cs-full-content, cs-full-footer |
| `/about` | about | about-hero, vision, meetup, people, open-pos, cta, blogs |
| `/blog` | blog | blog-main, cta |
| `/blog/*` | blog-post | rich text + regex code highlighter |
| `/industries/*` | industry-template | service-hero, cta, blogs |
| `/workwithus` | careers | careers-hero, rules, open-pos, blogs |
| `/job-offers/*` | job-offer | job-offer, culture, blogs |
| `/404` | 404 | image un-blurs `blur(24px) → 0` over 1s after a .5s delay |
| `/feed` | feed | localStorage new-item dot on the nav |

Global on every page: navbar · loader · contact panel · ajax lightbox · footer.

## 10. Other mechanics worth copying

**Ajax lightbox** (`initAjaxModal`) — case-study links `fetch()` the target page, parse out
`[tr-ajaxmodal-element='cms-page-content']`, inject it, `history.replaceState` the URL and
title, and slide a panel in from `x:120%`. Esc / overlay / outside-click reverse it. Focus is
trapped by wrapping the last focusable element back to the close button.

**Services FAQ accordion** (`initServicesQaAcc`) — auto-numbers each row `[01]`, `[02]`… via
`padStart(2,'0')`; height 0 ↔ auto at .5s/.6s.

**"Load more" button hover** — label slides `y:-2rem`, the icon box grows to `100% × 100%`
with `border-radius:0`, the chevron fades, an absolutely-positioned second label fades in, and
a GIF container scales up behind it. Reverse plays at `timeScale(1.5)`.

**Blog post code blocks** — regex syntax highlighter (`styleCode`) wrapping strings, keywords,
numbers, functions, comments and types in spans.

**Timing signature.** Durations cluster at `.25 / .3 / .4 / .5 / .6 / .7`; eases are
`power1.inOut`, `power2.out`, `power3.out`, `power3.in`, `sine`, and `none` for scrubs.
Reverses consistently run faster than forwards (`timeScale(1.2)`–`1.5`).
