import type { Browser, Page } from 'playwright';
import { newPage } from './lib/browser';
import { fail, pass, type CheckResult } from './lib/types';
import { BEHAVIOUR } from './behaviour.config';

/**
 * Phase 4's behaviour checks: the works grid.
 *
 * `01-PHASES.md`'s acceptance criteria for this phase are, almost word for word,
 * three things a timeline's shape cannot tell you:
 *
 *   "Hovering one card dims all eleven others to exactly 0.3"
 *       — a fact about eleven elements, not about a tween
 *   "verify:motion confirms all three hover layers' durations"
 *       — and one of the three is asymmetric in the opposite direction to the
 *         rest of the site, which is exactly the kind of thing that looks right
 *   "Mobile variant verified at 390 — the responsive behaviour most likely to
 *    be got wrong"
 *       — because the sheet does not hide on mobile, it becomes content
 *
 * The overlay's durations are read off the live tweens rather than sampled from
 * opacity over time. Sampling a `power1.inOut` curve and inferring a duration
 * from it is a measurement of the harness's own timing jitter; `duration()` is
 * the number the component actually asked for.
 */

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/** Scroll past Lenis rather than through it, then let the scrub settle. */
async function scrollTo(page: Page, y: number, settle = 900): Promise<void> {
  await page.evaluate((target) => {
    const lenis = (window as unknown as { lenis?: { scrollTo(v: number, o?: object): void } }).lenis;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, y);
  await page.waitForTimeout(settle);
}

/** Put the grid's first row on screen, whatever the page above it grows to. */
async function scrollToGrid(page: Page): Promise<void> {
  const y = await page.evaluate(() => {
    const grid = document.querySelector('[data-works-grid]');
    return grid ? Math.round(grid.getBoundingClientRect().top + window.scrollY) : 0;
  });
  await scrollTo(page, y);
}

/* ── 1. the dim: eleven others, exactly 0.3 ─────────────────────────────── */

async function checkSiblingDim(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.worksGrid;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await scrollToGrid(page);

    const result = await page.evaluate(
      async ({ dimmed, index }) => {
        const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const cards = [...document.querySelectorAll<HTMLElement>('[data-work-card]')];
        const target = cards[index]!;
        const others = () => cards.filter((el) => el !== target).map((el) => +getComputedStyle(el).opacity);

        /* A real pointer may already be resting on a card after the scroll,
           which would leave a dim running before we start. Clear it. */
        for (const card of cards) card.dispatchEvent(new MouseEvent('mouseleave'));
        await wait(700);
        const before = others();

        target.dispatchEvent(new MouseEvent('mouseenter'));
        await wait(700);
        const during = others();
        const self = +getComputedStyle(target).opacity;

        target.dispatchEvent(new MouseEvent('mouseleave'));
        await wait(700);
        const after = others();

        return {
          cardCount: cards.length,
          otherCount: cards.length - 1,
          before: [...new Set(before.map((v) => Math.round(v * 1000) / 1000))],
          during: [...new Set(during.map((v) => Math.round(v * 1000) / 1000))],
          after: [...new Set(after.map((v) => Math.round(v * 1000) / 1000))],
          self: Math.round(self * 1000) / 1000,
          dimmed,
        };
      },
      { dimmed: c.dimmed, index: c.hoverIndex },
    );

    out.push(
      result.cardCount === c.cardCount
        ? pass(`works grid: ${result.cardCount} cards`, String(result.cardCount))
        : fail('works grid: card count', String(c.cardCount), String(result.cardCount)),
    );

    const allDimmed =
      result.during.length === 1 && near(result.during[0]!, c.dimmed, c.tolerance);
    out.push(
      allDimmed
        ? pass(
            `works grid: hovering one card dims all ${result.otherCount} others to exactly ${c.dimmed}`,
            `every other card at ${result.during[0]}`,
          )
        : fail(
            `works grid: hovering one card dims all ${result.otherCount} others to ${c.dimmed}`,
            `[${c.dimmed}]`,
            JSON.stringify(result.during),
          ),
    );

    out.push(
      near(result.self, 1, c.tolerance)
        ? pass('works grid: the hovered card is not dimmed', String(result.self))
        : fail('works grid: the hovered card is not dimmed', '1', String(result.self)),
    );

    const restored = result.after.length === 1 && near(result.after[0]!, 1, c.tolerance);
    out.push(
      restored
        ? pass('works grid: leaving restores every card to 1', String(result.after[0]))
        : fail('works grid: leaving restores every card to 1', '[1]', JSON.stringify(result.after)),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 2. the overlay: 500 in, 400 out — the asymmetry runs backwards ─────── */

async function checkOverlay(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.worksGrid;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await scrollToGrid(page);

    const measured = await page.evaluate(async (index) => {
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const g = (window as unknown as { gsap: typeof import('gsap').gsap }).gsap;
      const cards = [...document.querySelectorAll<HTMLElement>('[data-work-card]')];
      const target = cards[index]!;
      const overlay = target.querySelector<HTMLElement>('[data-work-overlay]')!;

      for (const card of cards) card.dispatchEvent(new MouseEvent('mouseleave'));
      await wait(700);

      const sheet = target.querySelector<HTMLElement>('[data-work-sheet]')!;
      const media = target.querySelector<HTMLElement>('[data-work-media]')!;

      target.dispatchEvent(new MouseEvent('mouseenter'));
      // Read the tweens while they are still alive, before they retire.
      const inTween = g.getTweensOf(overlay)[0];
      const inDuration = inTween ? +inTween.duration().toFixed(3) : null;
      const sheetInTween = g.getTweensOf(sheet)[0];
      const sheetIn = sheetInTween ? +sheetInTween.duration().toFixed(3) : null;
      await wait(900);
      const peak = +getComputedStyle(overlay).opacity;
      const sheetOpen = +getComputedStyle(sheet).opacity;
      const coverage =
        +(sheet.getBoundingClientRect().height / media.getBoundingClientRect().height).toFixed(3);

      target.dispatchEvent(new MouseEvent('mouseleave'));
      const outTween = g.getTweensOf(overlay)[0];
      const outDuration = outTween ? +outTween.duration().toFixed(3) : null;
      const sheetOutTween = g.getTweensOf(sheet)[0];
      const sheetOut = sheetOutTween ? +sheetOutTween.duration().toFixed(3) : null;
      await wait(900);
      const rest = +getComputedStyle(overlay).opacity;
      const sheetRest = +getComputedStyle(sheet).opacity;

      return {
        inDuration,
        outDuration,
        peak,
        rest,
        sheetIn,
        sheetOut,
        sheetOpen,
        sheetRest,
        coverage,
      };
    }, c.hoverIndex);

    out.push(
      measured.peak !== null && near(measured.peak, c.overlayOpacity, c.tolerance)
        ? pass(`works grid: overlay reaches ${c.overlayOpacity}`, String(measured.peak))
        : fail(`works grid: overlay reaches ${c.overlayOpacity}`, String(c.overlayOpacity), String(measured.peak)),
    );
    out.push(
      measured.inDuration !== null && near(measured.inDuration, c.overlayIn, 0.001)
        ? pass(`works grid: overlay in is ${c.overlayIn}s`, `${measured.inDuration}s`)
        : fail('works grid: overlay in', `${c.overlayIn}s`, String(measured.inDuration)),
    );
    out.push(
      measured.outDuration !== null && near(measured.outDuration, c.overlayOut, 0.001)
        ? pass(
            `works grid: overlay OUT is ${c.overlayOut}s — faster than in, §21.2's inverted asymmetry`,
            `${measured.outDuration}s`,
          )
        : fail('works grid: overlay out', `${c.overlayOut}s`, String(measured.outDuration)),
    );
    out.push(
      measured.rest !== null && near(measured.rest, 0, c.tolerance)
        ? pass('works grid: overlay returns to 0', String(measured.rest))
        : fail('works grid: overlay returns to 0', '0', String(measured.rest)),
    );

    /* The drawer. §5 sets its opacity outright; ours tweens, on Sayandeep's
       instruction (D-022), and a requirement nobody checks is one that
       regresses back to a `set()` the next time someone reads §5. */
    out.push(
      measured.sheetIn !== null && near(measured.sheetIn, c.sheetIn, 0.001)
        ? pass(
            `works grid: the hover sheet FADES in over ${c.sheetIn}s — it is not set`,
            `${measured.sheetIn}s`,
          )
        : fail(
            'works grid: the hover sheet fades in rather than being set',
            `${c.sheetIn}s`,
            measured.sheetIn === null ? 'no tween — it is a gsap.set()' : `${measured.sheetIn}s`,
          ),
    );
    out.push(
      measured.sheetOut !== null && near(measured.sheetOut, c.sheetOut, 0.001)
        ? pass(`works grid: the hover sheet fades out over ${c.sheetOut}s`, `${measured.sheetOut}s`)
        : fail('works grid: the hover sheet fades out', `${c.sheetOut}s`, String(measured.sheetOut)),
    );
    out.push(
      near(measured.sheetOpen, 1, c.tolerance) && near(measured.sheetRest, 0, c.tolerance)
        ? pass('works grid: the sheet opens to 1 and returns to 0')
        : fail(
            'works grid: the sheet opens to 1 and returns to 0',
            'open 1, rest 0',
            `open ${measured.sheetOpen}, rest ${measured.sheetRest}`,
          ),
    );
    out.push(
      measured.coverage > 0 && measured.coverage <= c.sheetMaxCoverage
        ? pass(
            'works grid: the sheet is a drawer, not a curtain — it does not fill the media',
            `${Math.round(measured.coverage * 100)}% of the media's height`,
          )
        : fail(
            'works grid: the sheet does not fill the media',
            `≤ ${Math.round(c.sheetMaxCoverage * 100)}%`,
            `${Math.round(measured.coverage * 100)}%`,
          ),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 3. the grid itself: twelve tracks, the placement map, the reveal ───── */

async function checkGridStructure(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.worksGrid;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.desktop });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);

    const structure = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>('[data-works-grid]');
      if (!grid) return null;
      const cs = getComputedStyle(grid);
      const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter((n) => !Number.isNaN(n));
      return {
        trackCount: tracks.length,
        columnGap: +parseFloat(cs.columnGap).toFixed(3),
        equalTracks: tracks.every((t) => Math.abs(t - tracks[0]!) < 0.5),
        width: +grid.getBoundingClientRect().width.toFixed(2),
        widths: [...grid.querySelectorAll<HTMLElement>('[data-work-card]')].map(
          (el) => el.dataset.workWidth,
        ),
      };
    });

    if (!structure) {
      out.push(fail('works grid: present', '[data-works-grid]', 'not found'));
      return out;
    }

    out.push(
      structure.trackCount === 12 && structure.equalTracks
        ? pass('works grid: twelve equal tracks', `${structure.trackCount} × equal`)
        : fail('works grid: twelve equal tracks', '12 equal', `${structure.trackCount}, equal: ${structure.equalTracks}`),
    );
    out.push(
      near(structure.columnGap, c.columnGapPx, 0.2)
        ? pass('works grid: 1.25rem column gap — theirs, not our old 1.5', `${structure.columnGap}px`)
        : fail('works grid: column gap', `${c.columnGapPx}px`, `${structure.columnGap}px`),
    );

    const mix = structure.widths.reduce<Record<string, number>>((acc, w) => {
      acc[w ?? '?'] = (acc[w ?? '?'] ?? 0) + 1;
      return acc;
    }, {});
    const mixOk = mix.half === c.mix.half && mix.wide === c.mix.wide && mix.full === c.mix.full;
    out.push(
      mixOk
        ? pass('works grid: card mix is half ×8, wide ×3, full ×1', JSON.stringify(mix))
        : fail('works grid: card mix', JSON.stringify(c.mix), JSON.stringify(mix)),
    );

    /* The reveal: the wipe has to end at 0% and the guard has to be set. */
    await scrollToGrid(page);
    await page.waitForTimeout(1400);
    const revealed = await page.evaluate(() => {
      const card = document.querySelector<HTMLElement>('[data-work-card]');
      const wipe = card?.querySelector<HTMLElement>('[data-work-wipe]');
      return {
        guard: card?.getAttribute('data-revealed'),
        wipeWidth: wipe ? +getComputedStyle(wipe).width.replace('px', '') : null,
        infoOpacity: card ? +getComputedStyle(card.querySelector('[data-work-info]')!).opacity : null,
      };
    });
    out.push(
      revealed.guard === 'true' && (revealed.wipeWidth ?? 99) < 1
        ? pass('works grid: reveal wipes to 0% and sets its one-shot guard', `width ${revealed.wipeWidth}px`)
        : fail(
            'works grid: reveal wipes to 0% and sets its guard',
            'data-revealed="true", wipe width 0',
            `guard ${revealed.guard}, wipe ${revealed.wipeWidth}px`,
          ),
    );
  } finally {
    await context.close();
  }
  return out;
}

/* ── 4. ≤767: the sheet becomes content ─────────────────────────────────── */

async function checkMobile(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  const c = BEHAVIOUR.worksGrid;
  const out: CheckResult[] = [];
  const { context, page } = await newPage(browser, { viewport: c.mobile });

  try {
    await page.goto(baseUrl + c.page, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await scrollToGrid(page);

    const state = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>('[data-works-grid]')!;
      const cards = [...grid.querySelectorAll<HTMLElement>('[data-work-card]')];
      const first = cards[0]!;
      const sheet = first.querySelector<HTMLElement>('[data-work-sheet]')!;
      const scs = getComputedStyle(sheet);
      const widths = cards.map((el) => Math.round(el.getBoundingClientRect().width));
      /* sRGB relative luminance, WCAG's formula. A hex would be the wrong
         assertion here — every panel is a different colour on purpose. */
      const luminance = (colour: string) => {
        const parts = (colour.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
        /* Two formats, two scales. `color-mix()` computes to
           `color(srgb 0.194 0.143 0.121)` with components in 0..1, while a
           plain declaration computes to `rgb(33, 33, 33)` in 0..255. Reading
           the first as the second divides every channel by another 255 and
           reports a luminance near zero — which would sail through a
           "must be dark" assertion for entirely the wrong reason, and then fail
           the "lighter than the page" one. The panel is a color-mix, so this is
           not hypothetical. */
        const scale = colour.startsWith('color(') ? 1 : 255;
        const lin = (v: number) => {
          const c = v / scale;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * lin(parts[0] ?? 0) + 0.7152 * lin(parts[1] ?? 0) + 0.0722 * lin(parts[2] ?? 0);
      };

      return {
        sheetPosition: scs.position,
        sheetOpacity: +scs.opacity,
        sheetBackground: scs.backgroundColor,
        sheetLuminance: +luminance(scs.backgroundColor).toFixed(4),
        pageLuminance: +luminance(getComputedStyle(document.body).backgroundColor).toFixed(4),
        videoCount: grid.querySelectorAll('video').length,
        videoDisplay: grid.querySelector('video')
          ? getComputedStyle(grid.querySelector('video')!).display
          : 'no reels yet',
        distinctWidths: [...new Set(widths)],
        gridColumns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        transforms: [...new Set(cards.map((el) => getComputedStyle(el.parentElement!).transform))],
      };
    });

    out.push(
      state.sheetPosition === 'static' && state.sheetOpacity === 1
        ? pass(
            'works grid ≤767: the sheet is permanent content, not a hover state',
            `position ${state.sheetPosition}, opacity ${state.sheetOpacity}`,
          )
        : fail(
            'works grid ≤767: the sheet is permanent content',
            'position static, opacity 1',
            `position ${state.sheetPosition}, opacity ${state.sheetOpacity}`,
          ),
    );
    /* Never a bright surface. See the note on `sheetMaxLuminance` — the
       assertion is the property, not a hex, because all twelve panels differ. */
    out.push(
      state.sheetLuminance <= c.sheetMaxLuminance
        ? pass(
            `works grid: the sheet is never a bright surface (luminance ≤ ${c.sheetMaxLuminance})`,
            `${state.sheetBackground} → ${state.sheetLuminance}`,
          )
        : fail(
            'works grid: the sheet is never a bright surface',
            `luminance ≤ ${c.sheetMaxLuminance}`,
            `${state.sheetBackground} → ${state.sheetLuminance}`,
          ),
    );
    out.push(
      state.sheetLuminance > state.pageLuminance
        ? pass(
            'works grid: the sheet is still distinguishable from the page ground',
            `sheet ${state.sheetLuminance} vs page ${state.pageLuminance}`,
          )
        : fail(
            'works grid: the sheet is distinguishable from the page ground',
            'sheet lighter than page',
            `sheet ${state.sheetLuminance} vs page ${state.pageLuminance}`,
          ),
    );
    out.push(
      state.gridColumns === 1 && state.distinctWidths.length === 1
        ? pass('works grid ≤767: one column, every card the full measure', `${state.distinctWidths[0]}px`)
        : fail(
            'works grid ≤767: one column',
            '1 track, one width',
            `${state.gridColumns} tracks, widths ${JSON.stringify(state.distinctWidths)}`,
          ),
    );
    out.push(
      state.transforms.length === 1 && state.transforms[0] === 'none'
        ? pass('works grid ≤767: no parallax — every cell untransformed')
        : fail('works grid ≤767: no parallax', '["none"]', JSON.stringify(state.transforms)),
    );
    out.push(
      state.videoCount === 0 || state.videoDisplay === 'none'
        ? pass('works grid ≤767: no reel playback', String(state.videoDisplay))
        : fail('works grid ≤767: no reel playback', 'display none', String(state.videoDisplay)),
    );
  } finally {
    await context.close();
  }
  return out;
}

export async function checkWorksGrid(browser: Browser, baseUrl: string): Promise<CheckResult[]> {
  return [
    ...(await checkGridStructure(browser, baseUrl)),
    ...(await checkSiblingDim(browser, baseUrl)),
    ...(await checkOverlay(browser, baseUrl)),
    ...(await checkMobile(browser, baseUrl)),
  ];
}
