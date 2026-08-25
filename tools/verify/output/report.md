# Verification report
Run: 2026-08-25T15:33:57.514Z · Phase 01 · commit `8b23459` · branch `phase/01-chrome`

## Summary
```
motion  ⚠️ 129/132  (3 pending, owed by later phases)
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
✅ ScrollTrigger count returns to baseline after route changes = 1
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
✅ contact.open totalDuration = 1.5s
✅ contact.open tween count = 7
✅ contact.open tween[0] duration = 0s
✅ contact.open tween[0] target = div.ContactPanel_heading__IUuco.contact__heading
✅ contact.open tween[0] props = opacity, parent, repeat, immediateRender
✅ contact.open tween[0] startTime = 0s
✅ contact.open tween[1] duration = 0s
✅ contact.open tween[1] target = p.ContactPanel_lead__d8xpB.contact__meta, div.ContactPanel_divider__HxrAW.contact__meta, div.ContactPanel_body__sAqvT.contact__meta
✅ contact.open tween[1] props = opacity, x, parent, repeat, immediateRender
✅ contact.open tween[1] startTime = 0s
✅ contact.open tween[2] duration = 0.4s
✅ contact.open tween[2] target = div.ContactPanel_contact__I3BfT.contact
✅ contact.open tween[2] props = opacity, parent
✅ contact.open tween[2] startTime = 0s
✅ contact.open tween[3] duration = 0.7s
✅ contact.open tween[3] target = div.ContactPanel_sidebar__TFeFW.contact__sidebar
✅ contact.open tween[3] props = x, parent
✅ contact.open tween[3] startTime (<+0.3) = 0.3s
✅ contact.open tween[4] duration = 0.3s
✅ contact.open tween[4] target = div.ContactPanel_heading__IUuco.contact__heading
✅ contact.open tween[4] props = opacity, parent
✅ contact.open tween[4] startTime (<+0.2) = 0.5s
✅ contact.open tween[5] duration = 1s
✅ contact.open tween[5] ease = power3.out
✅ contact.open tween[5] target = p.ContactPanel_lead__d8xpB.contact__meta, div.ContactPanel_divider__HxrAW.contact__meta, div.ContactPanel_body__sAqvT.contact__meta
✅ contact.open tween[5] props = opacity, x, parent
✅ contact.open tween[5] startTime (<) = 0.5s
✅ contact.open tween[6] duration = 0.5s
✅ contact.open tween[6] target = div.ContactPanel_gif__T7RsE.contact__gif
✅ contact.open tween[6] props = y, parent
✅ contact.open tween[6] startTime (<+0.2) = 0.7s
✅ nav.is-mini threshold — off at 20px = no is-mini
✅ nav.is-mini threshold — on at 100px = is-mini
✅ nav.is-mini threshold — background = rgb(33, 33, 33)
✅ nav.is-mini threshold — padding-top = 0.750rem
✅ nav.is-mini threshold — off again after scrolling back up = no is-mini
✅ footer service sibling-dim @1512 — siblings dim = 0.30, 0.30, 0.30, 0.30
✅ footer service sibling-dim @1512 — hovered stays lit = 1.00
✅ footer service sibling-dim @1512 — restores on leave = 1 across the list
✅ footer service sibling-dim @991 — gated off = nothing dimmed
✅ contact panel open/close — closed at rest = display: none
✅ contact panel open/close — opens = display: block, opacity 1
✅ contact panel open/close — sidebar rests at x 0% = 0.0px from the right edge
✅ contact panel open/close — sidebar width = 56.0%
✅ contact panel open/close — is a modal dialog = role=dialog aria-modal=true
✅ contact panel open/close — focus moves into the panel = yes
✅ contact panel open/close — close runs at the panel scale = -1.2 (reversing at 1.2)
✅ contact panel open/close — Escape closes it = display: none
✅ contact panel open/close — focus returns to the trigger = yes
✅ button icon-swap reverse scale — plays forward on hover = progress 1.00
✅ button icon-swap reverse scale — forward runs at 1 = 1
✅ button icon-swap reverse scale — reverse runs at the button scale = -1.5 (reversing at 1.5)
✅ loader under reduced motion — a 200ms fade = 0.2s
✅ loader under reduced motion — no transform = opacity, duration, ease, parent, overwrite, delay
✅ loader under reduced motion — loader clears the page = display: none

> Pending entries are timelines the spec names but no phase has built yet. The phase that builds one flips `pending: false` in motion.config.ts.
> Behaviour checks drive the real interface — scroll, hover, click, Escape — rather than reading a registered timeline. They are the only instrument that catches an unwired handler, a matchMedia gate that leaks below 992, or a reverse running at the wrong timeScale. See behaviour.config.ts.
