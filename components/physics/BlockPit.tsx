'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/motion/gsap';
import { useMotion } from '@/lib/motion/MotionProvider';
import { cx } from '@/lib/cx';
import { buildTiles, type Tile } from './pitLayout';
import s from './BlockPit.module.css';

/**
 * `<BlockPit />` — the physics playground below the footer.
 * `docs/spec/70-physics-footer.md`, and `01-PHASES.md` phase 11.
 *
 * **This is the one thing on the site that is ours rather than tonik's.** The
 * rest of the build is a reproduction; this is the addition, and §2 is what
 * makes it more than a toy: *"It is the stack wall, made physical."* The same
 * twenty-two wordmarks that open the page as a static grid close it as a pile
 * you can shove around.
 *
 * ── Every number here is measured, not remembered ────────────────────────
 *
 * §3 was read off a live `Matter.Engine.create()` rather than the docs, and the
 * deviations from Matter's defaults are the whole character of the thing:
 * `frictionAir: 0.02` is the fluffy tell, `restitution: 0.35` is soft rather
 * than rubbery, `chamfer` at 22% is *real geometry* (4 verts → 16) so the
 * rounded corner participates in the collision and the pile settles soft.
 *
 * ── The three things this does not do ────────────────────────────────────
 *
 * **No `Matter.Runner`.** It owns a `requestAnimationFrame` of its own, which
 * would race the GSAP ticker already driving Lenis and ScrollTrigger.
 * `CLAUDE.md` non-negotiable 7 is one loop for the whole site, and this runs
 * inside it.
 *
 * **No `Matter.Render`.** That is a debug view. Real DOM elements are driven
 * from body transforms instead, so tiles carry actual IBM Plex Mono at
 * `.75rem`, inherit the design tokens, keep hairline borders crisp at any DPR,
 * and stay readable to assistive tech. §6 — canvas only wins past ~300 bodies
 * and this runs 44.
 *
 * **No variable timestep.** §7: *"Fixed timestep is not optional."* Feeding
 * `Engine.update` a raw delta makes stacks jitter and restitution drift with
 * framerate, so the accumulator clamps at 100ms and steps at a fixed 1/60.
 *
 * ── Reduced motion is an absence, not a degradation ──────────────────────
 *
 * §9 is emphatic and it is the reason the layout lives in `pitLayout.ts`: the
 * arrangement is computed deterministically and rendered as ordinary HTML, so
 * under the preference the pit is **a real settled pile that never moves**
 * rather than an empty box. Matter is never imported at all on that path.
 *
 * ── Lazily imported ──────────────────────────────────────────────────────
 *
 * Matter is ~25KB gzipped and is fetched only when the pit is within 1.5
 * viewports of the fold. It never appears in the initial bundle, which is what
 * lets a footer toy exist on a page already carrying Three.js and GSAP.
 */

/** §7. */
const FIXED = 1000 / 60;
/** §3, all of it. */
const BODY_OPTIONS = {
  restitution: 0.35,
  friction: 0.4,
  frictionAir: 0.02,
  frictionStatic: 0.5,
  density: 0.0012,
  slop: 0.02,
};

export function BlockPit() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();

  /* Rendered on the server, so the pile exists before any JavaScript decides
     whether it may move. `mobile` is resolved after mount, and the server
     renders the desktop set — a phone briefly holding 44 tiles it is about to
     replace with 24 is cheaper than an empty box that pops. */
  const [mobile, setMobile] = useState(false);
  const tiles = useMemo(() => buildTiles(mobile), [mobile]);

  const [live, setLive] = useState(false);
  const resetRef = useRef<(() => void) | null>(null);

  /* `reducedMotion` is resolved during the first client render, and the server
     has no media queries — so anything that *reads* it in the markup is a
     hydration mismatch. The pit's label said "Drag us around" on the server and
     "The stack, at rest" in a browser that asked for less motion, and React
     reported it. Gating on mount makes both renders agree and then corrects. */
  const [mounted, setMounted] = useState(false);
  const still = mounted && reducedMotion;

  useEffect(() => {
    setMounted(true);
    setMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  /* ── the approach gate ──────────────────────────────────────────────────
     §7: Matter is imported when the pit is within 1.5 viewports. The observer
     is separate from the in-view gate below because they answer different
     questions — "should this exist" and "should this be stepping". */
  useEffect(() => {
    if (reducedMotion) return;
    const el = root.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  /* ── the simulation ─────────────────────────────────────────────────────
     One effect, because the engine, the walls, the bodies, the loop and the
     listeners are one lifetime — and tearing half of them down would leave a
     `MouseConstraint` holding a dead engine. */
  useEffect(() => {
    if (!live || reducedMotion) return;
    const el = stage.current;
    if (!el) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('matter-js').then((Matter) => {
      if (disposed || !stage.current) return;
      const { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint } = Matter;

      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width === 0 || height === 0) return;

      const engine = Engine.create();
      /* §3. `enableSleeping` is the one that matters for the CPU budget: a
         settled pit costs approximately nothing. */
      engine.enableSleeping = true;
      engine.gravity.y = 1;
      engine.gravity.scale = 0.0011;
      engine.positionIterations = 8;
      engine.velocityIterations = 6;
      engine.constraintIterations = 2;

      /* §5. The ceiling is 1500 above the frame, deliberately: a hard throw
         should be able to leave the pit and come back. Flush with the top makes
         it a box; far above makes it a tray under open air. */
      const WALL = 200;
      const walls = [
        Bodies.rectangle(width / 2, height + WALL / 2, width + 800, WALL, { isStatic: true }),
        Bodies.rectangle(-WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
        Bodies.rectangle(width + WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
        Bodies.rectangle(width / 2, -1500, width + 800, WALL, { isStatic: true }),
      ];
      Composite.add(engine.world, walls);

      /* One body per element already in the DOM. */
      const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-pit-tile]'));
      const parts = nodes
        .map((node) => {
          const w = Number(node.dataset.w);
          const h = Number(node.dataset.h);
          const spawnX = Number(node.dataset.x) * width;
          if (!w || !h) return null;

          const body =
            node.dataset.shape === 'disc'
              ? Bodies.circle(spawnX, -200, w / 2, BODY_OPTIONS)
              : Bodies.rectangle(spawnX, -200, w, h, {
                  ...BODY_OPTIONS,
                  /* §3: real geometry, not a paint trick. */
                  chamfer: { radius: Math.min(w, h) * 0.22 },
                });

          return { node, body, w, h, spawnX };
        })
        .filter((part): part is NonNullable<typeof part> => part !== null);

      Composite.add(
        engine.world,
        parts.map((p) => p.body),
      );

      /* ── 4.1 the sweep pusher ─────────────────────────────────────────────
         `MouseConstraint` only acts on press, so hover-push needs its own body.
         The third argument of `Body.setPosition` writes velocity directly,
         which is what makes a fast sweep scatter and a slow drift nudge — the
         interaction is pressure-sensitive for free. §4.1 calls this the single
         most important detail, and a pusher moved without it feels dead. */
      const pusher = Bodies.circle(-999, -999, 46, {
        isStatic: true,
        friction: 0,
        restitution: 0.2,
      });
      Composite.add(engine.world, pusher);

      /* `@types/matter-js` declares `setPosition(body, position)` — two
         arguments — and the shipped library takes three. Verified against
         `node_modules/matter-js` rather than assumed: `Body.setPosition.length`
         is **3** and the source names the third `updateVelocity`. The cast is
         narrow and points at the reason, so it can be deleted when the types
         catch up. */
      const setPosition = Body.setPosition as unknown as (
        body: Matter.Body,
        position: Matter.Vector,
        updateVelocity?: boolean,
      ) => void;

      const onPointerMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        setPosition(pusher, { x: event.clientX - rect.left, y: event.clientY - rect.top }, true);
      };
      /* Parked off-screen so a settled pile is not disturbed by a pointer that
         left the section. */
      const onPointerLeave = () => setPosition(pusher, { x: -999, y: -999 }, true);

      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerleave', onPointerLeave);

      /* ── 4.2 drag and throw ───────────────────────────────────────────────
         `render.visible` defaults to **true** with a bright green line from the
         cursor to the body. §4.2 flags it as the classic bug; it is verified,
         and it must be off.

         Throwing needs no code: the constraint is a spring, the body accumulates
         real velocity chasing the cursor, and on release that velocity persists.
         The fling is emergent. */
      const mouse = Mouse.create(el);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.12,
          damping: 0.1,
          render: { visible: false },
        },
      });
      Composite.add(engine.world, mouseConstraint);

      /* ── the scroll traps ─────────────────────────────────────────────────
         Matter's `Mouse.setElement` attaches six listeners. Three are harmless
         (`mousemove`/`mousedown`/`mouseup`, all passive). The other three are
         **not**, and only one of them is in the spec:

           element.addEventListener('wheel',      mouse.mousewheel, { passive: false });
           element.addEventListener('touchmove',  mouse.mousemove,  { passive: false });
           element.addEventListener('touchstart', mouse.mousedown,  { passive: false });
           element.addEventListener('touchend',   mouse.mouseup,    { passive: false });

         §9 flags the touch three: they call `preventDefault` and trap page
         scroll inside the pit.

         **`wheel` is worse and the spec does not mention it.** Read out of
         `matter.js`: `mousewheel` calls `event.preventDefault()`
         unconditionally. The pit is the last thing on the page, so a visitor who
         scrolled into it could not scroll back out — in either direction, with a
         wheel or a trackpad. See I-060.

         All four come off. Matter's mouse handlers still drive the drag, and on
         touch devices the drag goes through those same handlers via the browser's
         compatibility mouse events. */
      const handlers = mouse as unknown as Record<string, EventListener>;
      (
        [
          ['wheel', 'mousewheel'],
          ['touchmove', 'mousemove'],
          ['touchstart', 'mousedown'],
          ['touchend', 'mouseup'],
        ] as const
      ).forEach(([type, key]) => {
        const handler = handlers[key];
        if (handler) el.removeEventListener(type, handler);
      });

      const onStartDrag = () => el.classList.add(s.grabbing ?? 'is-grabbing');
      const onEndDrag = () => el.classList.remove(s.grabbing ?? 'is-grabbing');
      Events.on(mouseConstraint, 'startdrag', onStartDrag);
      Events.on(mouseConstraint, 'enddrag', onEndDrag);

      /* ── 4.3 the entry drop ───────────────────────────────────────────────
         §4.3, on the site's own motion signature: a stagger of amount .8 from
         random. GSAP does the timing; Matter does the falling. */
      /* ── 4.3 the entry drop ───────────────────────────────────────────────
         §4.3, on the site's own motion signature: a stagger of amount .8 from
         random. GSAP does the timing; Matter does the falling.

         **`gsap.delayedCall` per body, not a staggered tween.** The first
         version was `gsap.to(bodies, { duration: .01, stagger })` with the
         release in `onUpdate`, and it released exactly one tile: with no
         animatable property to tween, GSAP has nothing to stagger and collapses
         the call. Releasing on an explicit timer says what it means and cannot
         be optimised away.

         `Math.random` is safe here in a way it is not in `<Artwork>` (I-052):
         this runs after mount, on the client only, and changes no markup — so
         there is nothing for hydration to disagree about, and a pile that falls
         differently each visit is the point. */
      let releases: gsap.core.Tween[] = [];

      const drop = () => {
        releases.forEach((call) => call.kill());
        releases = [];

        parts.forEach((part) => {
          Body.setStatic(part.body, true);
          Body.setPosition(part.body, {
            x: part.spawnX,
            y: -120 - gsap.utils.random(0, 400),
          });
          Body.setAngle(part.body, gsap.utils.random(-0.4, 0.4));
          Body.setVelocity(part.body, { x: 0, y: 0 });
          Body.setAngularVelocity(part.body, 0);
        });

        /* `from: 'random'` as a shuffled release order. */
        const order = [...parts].sort(() => Math.random() - 0.5);
        order.forEach((part, i) => {
          const delay = order.length > 1 ? (i / (order.length - 1)) * 0.8 : 0;
          releases.push(gsap.delayedCall(delay, () => Body.setStatic(part.body, false)));
        });
      };
      drop();
      resetRef.current = drop;

      /* ── the loop ─────────────────────────────────────────────────────────
         On GSAP's ticker, gated by an in-view flag, fixed timestep with a clamp
         that prevents the spiral of death after a backgrounded tab. */
      let inView = true;
      const viewObserver = new IntersectionObserver(
        (entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
        },
        { threshold: 0 },
      );
      viewObserver.observe(el);

      let accumulator = 0;
      const tick = (_time: number, deltaMs: number) => {
        if (!inView) return;
        accumulator += Math.min(deltaMs, 100);
        while (accumulator >= FIXED) {
          Engine.update(engine, FIXED);
          accumulator -= FIXED;
        }
        for (const part of parts) {
          part.node.style.transform =
            `translate3d(${part.body.position.x - part.w / 2}px, ` +
            `${part.body.position.y - part.h / 2}px, 0) ` +
            `rotate(${part.body.angle}rad)`;
        }
      };
      gsap.ticker.add(tick);

      /* §5's escape guard. A physics blow-out puts a body somewhere it can never
         return from; this brings it back rather than losing it. Once a second,
         not once a frame — it is a safety net, not a simulation step. */
      const guard = window.setInterval(() => {
        for (const part of parts) {
          const { x, y } = part.body.position;
          if (x < -600 || x > width + 600 || y > height + 600) {
            Body.setPosition(part.body, { x: part.spawnX, y: -200 });
            Body.setVelocity(part.body, { x: 0, y: 0 });
          }
        }
      }, 1000);

      cleanup = () => {
        releases.forEach((call) => call.kill());
        gsap.ticker.remove(tick);
        window.clearInterval(guard);
        viewObserver.disconnect();
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerleave', onPointerLeave);
        Events.off(mouseConstraint, 'startdrag', onStartDrag);
        Events.off(mouseConstraint, 'enddrag', onEndDrag);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        resetRef.current = null;
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [live, reducedMotion, tiles]);

  return (
    <section
      ref={root}
      className={s.pit}
      /* §9: "the pit is `aria-hidden` and not focusable — it carries no
         information the footer does not already state in text." */
      aria-hidden="true"
    >
      <div className={s.head}>
        <p data-t="label" className={s.label}>
          {still ? 'The stack, at rest' : 'Drag us around'}
        </p>
        {still ? null : (
          <button type="button" className={s.reset} onClick={() => resetRef.current?.()} tabIndex={-1}>
            <span data-t="label">Reset</span>
          </button>
        )}
      </div>

      <div ref={stage} className={cx(s.stage, !live && s.settled)}>
        {tiles.map((tile) => (
          <PitTile key={tile.id} tile={tile} live={live && !reducedMotion} />
        ))}
      </div>
    </section>
  );
}

function PitTile({ tile, live }: { tile: Tile; live: boolean }) {
  return (
    <span
      data-pit-tile
      data-shape={tile.shape}
      data-w={tile.w}
      data-h={tile.h}
      data-x={tile.x}
      className={cx(s.tile, s[tile.shape], s[tile.tone])}
      style={{
        width: tile.w,
        height: tile.h,
        ...(tile.accent ? { backgroundColor: tile.accent } : null),
        /* Before Matter attaches — and permanently, under reduced motion — the
           tile sits where `pitLayout` placed it: a real settled pile rather
           than a stack in the corner. Matter overwrites `transform` on its
           first frame and `left`/`bottom` stay at 0/auto for it to work from.

           `left` and `bottom` rather than a percentage inside `translate`,
           because a percentage in a transform resolves against the **element**.
           The first version read `calc(100% - 200%)` and sent every tile a
           hundred percent of its own height *upward*, which piled them all at
           the top of the pit. */
        ...(live
          ? null
          : {
              top: 'auto',
              left: `${tile.rowX * 100}%`,
              bottom: `${tile.row * 62}px`,
              transform: `translateX(-50%) rotate(${tile.angle}rad)`,
            }),
      }}
    >
      {tile.label ? <span className={s.tileLabel}>{tile.label}</span> : null}
    </span>
  );
}
