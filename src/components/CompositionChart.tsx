/**
 * Stacked bar showing how the gross salary splits between take-home pay and the
 * amounts withheld, with a legend giving each segment's amount and weight.
 */

import { SUMMARY_PANEL } from '../content/labels';
import { COLORS, MONO_FONT } from '../styles/tokens';

/** One slice of the bar, already formatted for display. */
export interface ChartSegment {
  readonly label: string;
  readonly color: string;
  /** Amount of the segment, e.g. `"€ 23.386"`. */
  readonly amount: string;
  /** Weight on the total, e.g. `"66,8%"`. */
  readonly share: string;
  /** Width of the segment as a percentage of the bar, e.g. `66.8`. */
  readonly widthPercentage: number;
}

export interface CompositionChartProps {
  segments: readonly ChartSegment[];
}

export function CompositionChart({ segments }: CompositionChartProps) {
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          height: '16px',
          borderRadius: '99px',
          overflow: 'hidden',
          background: COLORS.darkBarTrack,
        }}
      >
        {segments.map((segment) => (
          <span
            key={segment.label}
            style={{ width: `${segment.widthPercentage}%`, background: segment.color }}
          />
        ))}
      </div>

      {/* The legend carries the actual figures, so it doubles as the accessible
          description of the bar above. */}
      <figcaption>
        <ul style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
          {segments.map((segment) => (
            <li key={segment.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                aria-hidden="true"
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '3px',
                  background: segment.color,
                  flex: '0 0 auto',
                }}
              />
              <span style={{ fontSize: '12.5px', color: COLORS.textOnDarkBody }}>
                {segment.label}
              </span>
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: COLORS.cardSurface,
                }}
              >
                {segment.amount}
              </span>
              <span
                style={{ fontFamily: MONO_FONT, fontSize: '12px', color: COLORS.textOnDarkMuted }}
              >
                {segment.share}
              </span>
            </li>
          ))}
        </ul>
        <span className="visually-hidden">{SUMMARY_PANEL.chartCaption}</span>
      </figcaption>
    </figure>
  );
}
