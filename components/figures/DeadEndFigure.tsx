import { P_SET, readoutOf } from '@/lib/figures/deadEnd';
import { FigurePlate } from './FigurePlate';
import { DeadEndLive } from './DeadEndLive';
import { LIVE } from './generated/deadEnd.live';

/**
 * The 404's figure — a line that goes nowhere. D-064.
 *
 * The same bench as /about's Fig. 01. Open the valve and the gauge climbs to
 * the regulator's 4.04 bar and stays there with nothing flowing, because the
 * line ends in a blind flange. A page that does not exist, as plumbing. Every
 * number comes from `lib/figures/deadEnd.ts`.
 *
 * Unlike Fig. 01 the drawing is not server-rendered: see `DeadEndLive`.
 */
export function DeadEndFigure({ className }: { className?: string }) {
  return (
    <FigurePlate
      className={className}
      fig="Fig 404"
      title="Dead end"
      hint="Click to open the valve"
      hintTouch="Tap to open the valve"
      readout={readoutOf({ open: 0, p: 0 })}
      keys={[
        { mark: 'lit', label: 'Handwheel — opens the valve' },
        { mark: 'raised', label: 'Blind flange — where the line stops' },
      ]}
      caption={`Open the valve and the gauge climbs to ${P_SET.toFixed(2)} bar, then stops. Full pressure, nothing moving: the line ends in a blind flange, so there is nowhere for anything to go.`}
      stage={
        <DeadEndLive
          label="Dead end, a valve feeding a line closed by a blind flange. Arrow keys or Enter open and shut the valve."
          valueText={readoutOf({ open: 0, p: 0 })}
          ratio={`${LIVE.width} / ${LIVE.height}`}
        />
      }
    />
  );
}
