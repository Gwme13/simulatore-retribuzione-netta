/**
 * Left-hand card holding every control: salary, pay periods and location.
 */

import type { PayPeriods } from '../content/labels';
import { CARD_STYLE, DIVIDER_STYLE } from '../styles/tokens';
import { GrossSalaryField, type GrossSalaryFieldProps } from './GrossSalaryField';
import { LocationFields } from './LocationFields';
import { PayPeriodsField } from './PayPeriodsField';

export interface InputPanelProps extends GrossSalaryFieldProps {
  payPeriods: PayPeriods;
  onPayPeriodsChange: (payPeriods: PayPeriods) => void;
}

export function InputPanel({ payPeriods, onPayPeriodsChange, ...salaryProps }: InputPanelProps) {
  return (
    <section
      aria-label="Parametri della simulazione"
      style={{
        ...CARD_STYLE,
        flex: '1 1 290px',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        padding: 'clamp(18px,3vw,26px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '26px',
      }}
    >
      <GrossSalaryField {...salaryProps} />
      <div style={DIVIDER_STYLE} />
      <PayPeriodsField value={payPeriods} onChange={onPayPeriodsChange} />
      <div style={DIVIDER_STYLE} />
      <LocationFields />
    </section>
  );
}
