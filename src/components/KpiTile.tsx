/**
 * One figure of the dark summary panel: caption, value, and a note under it.
 */

import type { CSSProperties } from 'react';

import { COLORS, DARK_EYEBROW_STYLE, MONO_FONT } from '../styles/tokens';

export interface KpiTileProps {
  /** Uppercase caption above the figure. */
  eyebrow: string;
  /** The figure itself, already formatted. */
  value: string;
  /** Short explanation shown underneath. */
  note: string;
  /** Font size of the figure; the primary tile is larger than the others. */
  valueFontSize: string;
  /** Letter spacing paired with `valueFontSize`. */
  valueLetterSpacing: string;
  /** Colour of the figure. Defaults to white. */
  valueColor?: CSSProperties['color'];
}

export function KpiTile({
  eyebrow,
  value,
  note,
  valueFontSize,
  valueLetterSpacing,
  valueColor = COLORS.cardSurface,
}: KpiTileProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0,
        background: 'rgba(255,255,255,.045)',
        borderRadius: '14px',
        padding: '16px 18px',
      }}
    >
      <span style={DARK_EYEBROW_STYLE}>{eyebrow}</span>
      {/* `output` marks this as a calculated result, but its implicit live region
          is switched off: the whole page recomputes on every keystroke, and
          announcing each figure as it is typed would be unusable. */}
      <output
        aria-live="off"
        style={{
          fontFamily: MONO_FONT,
          fontSize: valueFontSize,
          fontWeight: 600,
          letterSpacing: valueLetterSpacing,
          lineHeight: 1,
          color: valueColor,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </output>
      <span style={{ fontSize: '12.5px', color: COLORS.textOnDarkMuted, whiteSpace: 'nowrap' }}>
        {note}
      </span>
    </div>
  );
}
