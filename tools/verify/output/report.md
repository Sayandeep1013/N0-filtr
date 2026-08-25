# Verification report
Run: 2026-08-25T14:56:01.164Z · Phase 01 · commit `c13ba63` · branch `phase/01-chrome`

## Summary
```
motion  ⚠️ 74/78  (4 pending, owed by later phases)
```

## motion

✅ DUR.micro = 0.25s
✅ DUR.fast = 0.3s
✅ DUR.base = 0.4s
✅ DUR.mid = 0.5s
✅ DUR.slow = 0.6s
✅ DUR.slower = 0.7s
✅ DUR.wipe = 0.75s
✅ EASE.out = power3.out
✅ EASE.in = power3.in
✅ EASE.soft = power2.out
✅ EASE.quad = power2.inOut
✅ EASE.circ = circ.out
✅ EASE.inOut = power1.inOut
✅ EASE.gentle = power1.out
✅ EASE.sine = sine
✅ EASE.linear = none
✅ REVERSE_SCALE (panels) = 1.2
✅ REVERSE_SCALE_FAST (buttons) = 1.5
✅ tokens.css --dur-micro = 0.25s
✅ tokens.css --dur-fast = 0.3s
✅ tokens.css --dur-base = 0.4s
✅ tokens.css --dur-mid = 0.5s
✅ tokens.css --dur-slow = 0.6s
✅ tokens.css --dur-slower = 0.7s
✅ tokens.css --dur-wipe = 0.75s
✅ no rAF loop outside the GSAP ticker = 0 unsanctioned
✅ exactly one GSAP ticker loop = 1
✅ Lenis attached to the GSAP ticker = tickerCallbacks=1
✅ exactly one Lenis ticker callback = 1
✅ desktop motion context (min-width: 992px) @991 = inactive
✅ desktop motion context (min-width: 992px) @1512 = active
✅ prefers-reduced-motion detected = true
✅ Lenis destroyed under reduced motion = native scroll
✅ no rAF loop outside the GSAP ticker, under reduced motion = 0 unsanctioned
✅ ScrollTrigger count returns to baseline after route changes = 0
⏳ contact.open — owed by phase 1
⏳ work-card.hover — owed by phase 4
⏳ accordion.open — owed by phase 5
⏳ accordion.close — owed by phase 5
✅ loader.enter totalDuration = 0.6s
✅ loader.enter tween count = 5
✅ loader.enter tween[0] duration = 0s
✅ loader.enter tween[0] target = div.Loader_loader__LpNgN.loader
✅ loader.enter tween[0] props = display, yPercent, opacity, parent, repeat, immediateRender
✅ loader.enter tween[0] startTime = 0s
✅ loader.enter tween[1] duration = 0.4s
✅ loader.enter tween[1] ease = power2.inOut
✅ loader.enter tween[1] target = div.Loader_mark__6dBzw.loader__mark
✅ loader.enter tween[1] props = opacity, scale, parent
✅ loader.enter tween[1] startTime = 0s
✅ loader.enter tween[2] duration = 0.6s
✅ loader.enter tween[2] ease = power2.inOut
✅ loader.enter tween[2] target = div.Loader_loader__LpNgN.loader
✅ loader.enter tween[2] props = yPercent, parent
✅ loader.enter tween[2] startTime (<) = 0s
✅ loader.enter tween[3] duration = 0s
✅ loader.enter tween[3] target = div.Loader_loader__LpNgN.loader
✅ loader.enter tween[3] props = display, parent, repeat, immediateRender
✅ loader.enter tween[3] startTime = 0.6s
✅ loader.enter tween[4] duration = 0s
✅ loader.enter tween[4] target = div.Loader_mark__6dBzw.loader__mark
✅ loader.enter tween[4] props = opacity, scale, parent, repeat, immediateRender
✅ loader.enter tween[4] startTime = 0.6s
✅ loader.exit totalDuration = 0.5s
✅ loader.exit tween count = 3
✅ loader.exit tween[0] duration = 0s
✅ loader.exit tween[0] target = div.Loader_loader__LpNgN.loader
✅ loader.exit tween[0] props = yPercent, display, opacity, parent, repeat, immediateRender
✅ loader.exit tween[0] startTime = 0s
✅ loader.exit tween[1] duration = 0s
✅ loader.exit tween[1] target = div.Loader_mark__6dBzw.loader__mark
✅ loader.exit tween[1] props = opacity, scale, parent, repeat, immediateRender
✅ loader.exit tween[1] startTime = 0s
✅ loader.exit tween[2] duration = 0.5s
✅ loader.exit tween[2] ease = power3.out
✅ loader.exit tween[2] target = div.Loader_loader__LpNgN.loader
✅ loader.exit tween[2] props = yPercent, parent
✅ loader.exit tween[2] startTime = 0s

> Pending entries are timelines the spec names but no phase has built yet. The phase that builds one flips `pending: false` in motion.config.ts.
