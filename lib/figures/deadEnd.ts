/**
 * The model behind the 404's figure — a dead-ended line. Pure. D-064.
 *
 * A regulator, a block-and-bleed gate valve, a gauge, and a pipe that ends in a
 * blind flange. Open the valve and the stub fills to the regulator's set point
 * and stays there: no flow, full pressure, because there is nowhere for anything
 * to go. That is a page that does not exist, as plumbing.
 *
 * ── What is true and what is chosen ───────────────────────────────────────
 *
 * · **Steady state is exact.** A closed-end line carries no flow, so there is
 *   no friction drop and the gauge reads the supply's set point. The set point
 *   is 4.04 bar because this is the 404; a regulator can be set to that.
 * · **Block and bleed.** Shut, the valve blocks the supply and opens a bleed
 *   port to the stub, so the gauge falls back to zero. That is what a
 *   double-block-and-bleed valve is for, and it is why closing the wheel
 *   empties the line rather than trapping 4 bar in it.
 * · **The fill is a first-order lag** whose time constant scales inversely with
 *   how far the valve is open — a cracked valve fills a dead leg slowly. The
 *   constants are chosen to be watchable, not measured.
 */

export const P_SET = 4.04; // bar
/** Turns of the handwheel from shut to fully open. */
export const TURNS = 3;
/** Stem rise, world units, from shut to open. */
export const LIFT = 9;

const TAU_FILL = 0.32; // s, wide open
const TAU_BLEED = 0.26; // s — the reverse runs faster, as everything here does
const CRACK = 0.04;

export interface Line {
  /** Valve opening, 0..1. */
  open: number;
  /** Stub pressure, bar. */
  p: number;
}

/** Steps the stub pressure toward where the valve sends it. */
export function stepLine(line: Line, dt: number, calm = false): boolean {
  const shut = line.open < CRACK;
  const target = shut ? 0 : P_SET;
  if (calm) {
    line.p = target;
    return true;
  }
  const tau = shut ? TAU_BLEED : TAU_FILL / Math.max(line.open, 0.08);
  line.p += (target - line.p) * (1 - Math.exp(-dt / tau));
  if (Math.abs(target - line.p) < 5e-4) {
    line.p = target;
    return true;
  }
  return false;
}

export function readoutOf(line: Line): string {
  const shut = line.open < CRACK;
  const word = shut ? (line.p > 0.005 ? 'bleeding' : 'valve shut') : line.p < P_SET - 0.005 ? 'filling' : 'valve open';
  return `${word} · ${line.p.toFixed(2)} bar · flow 0 L/min`;
}
