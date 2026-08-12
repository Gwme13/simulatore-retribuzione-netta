/**
 * The three cards at the bottom comparing the monthly figure across 12, 13 and
 * 14 pay periods. The selected one is outlined; the yearly net never changes.
 */

import type { PayPeriods } from '../content/labels';
import { PAY_PERIOD_CARD_NOTES, PAY_PERIOD_OPTIONS } from '../content/labels';
import { formatCurrency } from '../lib/format';
import { COLORS, LABEL_STYLE, LARGE_FIGURE_STYLE } from '../styles/tokens';

export interface PayPeriodCardsProps {
  /** Net yearly salary, unrounded, divided per card. */
  netSalary: number;
  /** Currently selected number of pay periods. */
  selected: PayPeriods;
}

export function PayPeriodCards({ netSalary, selected }: PayPeriodCardsProps) {
  return (
    <section aria-label="Confronto per mensilità">
      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: '16px',
        }}
      >
        {PAY_PERIOD_OPTIONS.map((option) => (
          <li
            key={option}
            style={{
              background: COLORS.cardSurface,
              border: `1.5px solid ${option === selected ? COLORS.accent : COLORS.border}`,
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={LABEL_STYLE}>{option} mensilità</span>
            <output aria-live="off" style={LARGE_FIGURE_STYLE}>
              {formatCurrency(netSalary / option)}
            </output>
            <span style={{ fontSize: '12px', color: COLORS.textTertiary }}>
              {PAY_PERIOD_CARD_NOTES[option]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
