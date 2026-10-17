/**
 * The model behind /about's Fig. 01 — the slide-plate screen changer. Pure: no
 * DOM, no React. The build (`tools/figures/handover.mjs`) reads the geometry
 * from here, and the live component reads the physics, so the drawing and the
 * numbers cannot drift apart. See D-064.
 *
 * ── The rig ───────────────────────────────────────────────────────────────
 *
 * A regulator holds the line at 3.00 bar. Water runs through a slide plate that
 * carries two stations a stroke apart — an open bore and a four-layer screen
 * pack — and then out through a fixed nozzle into a receiver. The two gauges
 * sit either side of the plate.
 *
 * With every loss written as a coefficient on the pipe's dynamic head
 * (ΔP = K · ½ρv²), supply pressure splits between the plate and the nozzle in
 * proportion to their K, so the outlet gauge reads
 *
 *     P_out = P_in · K_n / (K_plate + K_n)
 *
 * and nothing else has to be assumed about the pump.
 *
 * ── Where each number comes from ──────────────────────────────────────────
 *
 * · **Woven screen, per layer** — Idelchik, *Handbook of Hydraulic
 *   Resistance*, diagram 8-6, for Re > 400: K = 1.3(1 − f) + (1/f − 1)²,
 *   with open-area ratio f = 0.30. Four layers in series is 4 K = 25.4.
 * · **Open bore** — a full-bore slide gate, wide open: K ≈ 0.17, as Crane
 *   TP-410 gives for a gate valve. It is a hole the size of the pipe.
 * · **Nozzle** — chosen so the open line runs at 2.5 m/s in a 25 mm bore,
 *   which is a normal design velocity for water. That fixes K_n = 96.0.
 * · **Part-way** — while the plate moves, the bore is covered partly by the
 *   open hole, partly by the screen and partly by the web between them. The two
 *   paths see the same ΔP, so their flows add: 1/√K_plate = φ_s/√K_s + φ_o/√K_o,
 *   with φ the share of bore area each one uncovers. Across the web the line is
 *   briefly shut — which is true of a real discontinuous screen changer, and
 *   the readout says so rather than smoothing it over.
 */

/** Pipe bore radius, world units (the drawing is ~1 unit = 1 px). */
export const BORE = 4.4;
/** Distance between the two stations on the plate — the stroke. */
export const STROKE = 48;

export const P_IN = 3.0; // bar, the regulator's set point
const RHO = 998; // kg/m³, water at 20 °C
const BORE_M = 0.025; // m, the real line's bore
const V_OPEN = 2.5; // m/s with the screen out

const FOPEN = 0.3;
const K_LAYER = 1.3 * (1 - FOPEN) + (1 / FOPEN - 1) ** 2;
export const K_SCREEN = 4 * K_LAYER;
export const K_OPEN = 0.17;
const HEAD_OPEN = (0.5 * RHO * V_OPEN ** 2) / 1e5; // bar
export const K_NOZZLE = P_IN / HEAD_OPEN - K_OPEN;

/** Area shared by two circles of radius r whose centres are d apart, over πr². */
function overlap(d: number, r = BORE): number {
  const a = Math.abs(d);
  if (a >= 2 * r) return 0;
  return (2 * r * r * Math.acos(a / (2 * r)) - (a / 2) * Math.sqrt(4 * r * r - a * a)) / (Math.PI * r * r);
}

export interface Reading {
  /** 0 = screen out (open bore in line), 1 = screen in. */
  t: number;
  pIn: number;
  pOut: number;
  /** Share of supply pressure the plate costs, 0..1. */
  loss: number;
  /** L/min through the line. */
  flow: number;
  phase: 'out' | 'in' | 'between' | 'shut';
}

export function readingAt(t: number): Reading {
  const offset = t * STROKE;
  const open = overlap(offset);
  const screen = overlap(STROKE - offset);
  const conductance = screen / Math.sqrt(K_SCREEN) + open / Math.sqrt(K_OPEN);
  const kPlate = conductance > 1e-9 ? 1 / conductance ** 2 : Infinity;
  const share = Number.isFinite(kPlate) ? K_NOZZLE / (kPlate + K_NOZZLE) : 0;
  const pOut = P_IN * share;
  const head = Number.isFinite(kPlate) ? P_IN / (kPlate + K_NOZZLE) : 0; // bar
  const v = Math.sqrt((2 * head * 1e5) / RHO);
  const flow = v * Math.PI * (BORE_M / 2) ** 2 * 60_000;
  const phase = conductance <= 1e-9 ? 'shut' : open > 0.99 ? 'out' : screen > 0.99 ? 'in' : 'between';
  return { t, pIn: P_IN, pOut, loss: 1 - share, flow, phase };
}

export function readoutOf(r: Reading): string {
  const word = r.phase === 'out' ? 'screen out' : r.phase === 'in' ? 'screen in' : r.phase === 'shut' ? 'line shut' : 'changing over';
  return `${word} · outlet ${r.pOut.toFixed(2)} bar · loss ${(r.loss * 100).toFixed(r.loss < 0.1 ? 1 : 0)}%`;
}
