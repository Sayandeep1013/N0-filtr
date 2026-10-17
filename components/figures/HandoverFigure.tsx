import { readingAt, readoutOf } from '@/lib/figures/handover';
import { SVG } from './generated/handover.svg';
import { FigurePlate } from './FigurePlate';
import { HandoverLive } from './HandoverLive';
import s from './Stage.module.css';

/**
 * /about, Fig. 01 — the handover, as a machine. D-064.
 *
 * The manifesto above it says the gap between deciding and shipping is where
 * software goes wrong, "so we do not have one". This is the studio's name taken
 * literally: a bench line with a slide-plate screen changer in it, the screen
 * pulled out. Push it in and the outlet gauge shows what a filter in the line
 * costs. Every number comes from `lib/figures/handover.ts`.
 *
 * The drawing is built offline — `npm run figures` — and lands here as a string.
 */
export function HandoverFigure({ className }: { className?: string }) {
  return (
    <FigurePlate
      className={className}
      fig="Fig 01"
      title="The handover"
      hint="Hover to slide the screen"
      hintTouch="Tap to slide the screen"
      readout={readoutOf(readingAt(0))}
      keys={[
        { mark: 'lit', label: 'Slide plate — open bore and screen pack' },
        { mark: 'raised', label: 'Gauges either side of it' },
      ]}
      caption="A regulator holds the line at 3 bar. With the screen out, the water passes a full-bore hole and both gauges agree. Slide the screen in — four layers of fine mesh, the handover — and a fifth of the pressure is gone before the work reaches the other side."
      stage={
        <HandoverLive
          label="The handover, a slide-plate screen changer. Arrow keys or Enter slide the screen into the line and out again."
          valueText={readoutOf(readingAt(0))}
        >
          <div className={s.svg} dangerouslySetInnerHTML={{ __html: SVG }} />
        </HandoverLive>
      }
    />
  );
}
