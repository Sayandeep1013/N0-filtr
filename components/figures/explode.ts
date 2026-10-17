/**
 * The explode, client side. D-064.
 *
 * The build wraps every drawn item in `<g class="it" data-k data-l data-p>`:
 * its painter's key, its lift (how much nearer the viewer it gets per unit of
 * its assembly's share) and the index of its assembly. Given one number — how
 * far apart the figure is, 0 to 1 — this works out each assembly's share,
 * translates the items, and re-sorts them when their order changes, which is
 * the skill's own recipe (motion.md, "Depth re-sorting of moving parts").
 *
 * Shares are staggered so the earliest assembly in the order always leads:
 * that is the invariant the build's audit replays, so every frame this can
 * produce is one the audit has proved clear.
 */

export interface Piece {
  readonly name: string;
  readonly move: readonly number[];
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function explodeOf(stage: Element, pieces: readonly Piece[], window = 0.42) {
  const host = stage.querySelector('[data-items]');
  const items = host
    ? Array.from(host.children).map((el) => {
        const g = el as SVGGElement;
        return { el: g, k: Number(g.dataset.k), l: Number(g.dataset.l), p: Number(g.dataset.p), key: 0 };
      })
    : [];
  let order = items.slice();
  const n = pieces.length;
  const step = n > 1 ? (1 - window) / (n - 1) : 0;
  const shares = new Array<number>(n).fill(0);

  /** Places everything for apartness `q` (0 assembled, 1 fully apart). */
  function set(q: number): readonly number[] {
    for (let i = 0; i < n; i++) {
      const x = clamp01((q - i * step) / window);
      shares[i] = x * x * (3 - 2 * x);
    }
    for (const it of items) {
      const s = it.p >= 0 ? (shares[it.p] ?? 0) : 0;
      const move = it.p >= 0 ? pieces[it.p]?.move : undefined;
      if (s > 0 && move) it.el.setAttribute('transform', `translate(${(move[0]! * s).toFixed(2)} ${(move[1]! * s).toFixed(2)})`);
      else it.el.removeAttribute('transform');
      it.key = it.k + it.l * s;
    }
    const sorted = items.slice().sort((a, b) => a.key - b.key);
    if (host && sorted.some((it, i) => it !== order[i])) {
      const frag = document.createDocumentFragment();
      for (const it of sorted) frag.appendChild(it.el);
      host.appendChild(frag);
      order = sorted;
    }
    return shares;
  }

  return { set, shares, home: () => shares.every((s) => s < 1e-3) };
}
