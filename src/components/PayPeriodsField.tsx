/**
 * Segmented control choosing how many pay periods the yearly net is split into.
 *
 * The three buttons are one exclusive choice, so they form a radiogroup rather
 * than three unrelated buttons: screen readers then announce "2 of 3" instead of
 * three isolated controls.
 *
 * A `fieldset`/`legend` pair would be the other way to express the grouping, but
 * a legend is not laid out as a flex item, which would break the spacing. The
 * group is therefore named through `aria-labelledby` instead.
 */

import { useRef, type KeyboardEvent } from 'react';

import type { PayPeriods } from '../content/labels';
import { INPUT_PANEL, PAY_PERIOD_OPTIONS } from '../content/labels';
import { COLORS, LABEL_STYLE, SANS_FONT } from '../styles/tokens';

/** Id of the caption that names the radiogroup. */
const GROUP_LABEL_ID = 'pay-periods-label';

export interface PayPeriodsFieldProps {
  /** Currently selected number of pay periods. */
  value: PayPeriods;
  onChange: (payPeriods: PayPeriods) => void;
}

export function PayPeriodsField({ value, onChange }: PayPeriodsFieldProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Implements the roving tabindex a radiogroup is expected to have: the group
   * is a single stop in the tab order, and the arrow keys move the selection
   * inside it, wrapping around at both ends.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = PAY_PERIOD_OPTIONS.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    const nextOption = PAY_PERIOD_OPTIONS[nextIndex];
    if (nextOption === undefined) return;

    event.preventDefault();
    onChange(nextOption);
    buttons.current[nextIndex]?.focus();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span id={GROUP_LABEL_ID} style={LABEL_STYLE}>
        {INPUT_PANEL.payPeriodsLabel}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={GROUP_LABEL_ID}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '8px',
          background: COLORS.segmentedSurface,
          padding: '5px',
          borderRadius: '12px',
        }}
      >
        {PAY_PERIOD_OPTIONS.map((option, index) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(option)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: '9px',
                padding: '11px 0',
                fontFamily: SANS_FONT,
                fontSize: '14px',
                fontWeight: 700,
                background: isSelected ? COLORS.cardSurface : 'transparent',
                color: isSelected ? COLORS.textPrimary : COLORS.textSecondary,
                boxShadow: isSelected ? '0 1px 3px rgba(15,27,46,.14)' : 'none',
              }}
            >
              {option} mensilità
            </button>
          );
        })}
      </div>
    </div>
  );
}
