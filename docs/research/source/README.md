# Recovered source

Material recovered from tonik.com while reverse-engineering its design language.

## Local only — not committed

These are **tonik's own assets**. This repository is public, so they are gitignored and exist
only on the build machine. Everything we derived *from* them lives in `docs/spec/`, which is our
own analysis and is committed.

| File | What it is | How to get it again |
|---|---|---|
| `tonik-animations.js` | Their GSAP/Slater bundle, de-minified | `curl -sL "https://assets.slater.app/slater/9281/20081.js?v=560437" \| npx js-beautify -f -` |
| `tonik-ix2.json` | Their Webflow Interactions store — 130 events, 39 action lists | In devtools on tonik.com: `Webflow.require('ix2').store.getState().ixData` |
| `tonik-hero-scene.splinecode` | Their hero 3D scene (opaque binary) | `curl -sL https://prod.spline.design/Nbj6s1LtKEf3QmSk/scene.splinecode` |
| `ix2-hover.txt` | Decoded hover action lists | `node decode-ix2-timed.mjs MOUSE_OVER` |

## Committed

| File | What it is |
|---|---|
| `decode-ix2-timed.mjs` | Decodes IX2 timed action lists. `node decode-ix2-timed.mjs MOUSE_OVER,MOUSE_CLICK` |
| `decode-ix2-continuous.mjs` | Decodes IX2 continuous (mouse/scroll-driven) lists. `node decode-ix2-continuous.mjs a-3 a-8` |
| `tonik-sitemap.xml` | Their public sitemap — route inventory |

**You do not need these files to build.** Every value they yielded is already written into
`docs/spec/`. They exist for re-verification if a spec value is ever disputed.
