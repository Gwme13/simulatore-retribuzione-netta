/**
 * Page root: owns the state, runs the calculation, and hands formatted values to
 * the presentational components below it.
 *
 * There is no "calculate" button by design. The results follow the input as it
 * is typed, so the effect of a change is immediately visible.
 */

import { useMemo, useState } from 'react';

import { BreakdownPanel } from './components/BreakdownPanel';
import type { ChartSegment } from './components/CompositionChart';
import { InputPanel } from './components/InputPanel';
import { MethodologyNote } from './components/MethodologyNote';
import { PayPeriodCards } from './components/PayPeriodCards';
import { SummaryPanel } from './components/SummaryPanel';
import { buildBreakdownSteps, buildNetSalaryFormula } from './content/breakdown';
import type { PayPeriods } from './content/labels';
import {
  CHART_SEGMENT_LABELS,
  PAGE,
  PAY_PERIOD_NOTES,
  SLIDER_RANGE,
} from './content/labels';
import { formatCurrency, formatRate, formatShare } from './lib/format';
import { calculatePayroll, DEFAULT_INPS_RATE, type PayrollBreakdown } from './lib/payroll';
import { validateGrossSalary } from './lib/validation';
import { COLORS } from './styles/tokens';

/** Gross salary the page opens on, in euros. */
const INITIAL_GROSS_SALARY = 35_000;

/** Number of pay periods the page opens on. */
const INITIAL_PAY_PERIODS: PayPeriods = 13;

export interface AppProps {
  /**
   * Employee IVS contribution rate, as a percentage. Exposed so the assumption
   * can be changed in one place: it feeds the calculation and every sentence
   * that quotes it.
   */
  inpsRate?: number;
}

export function App({ inpsRate = DEFAULT_INPS_RATE }: AppProps) {
  /**
   * The field keeps two pieces of state on purpose. `rawValue` is whatever has
   * been typed, so the field never fights the user; `lastValidSalary` is the
   * amount the results are based on, so a half-typed or out-of-range entry shows
   * an error without blanking the whole page.
   */
  const [rawValue, setRawValue] = useState(String(INITIAL_GROSS_SALARY));
  const [lastValidSalary, setLastValidSalary] = useState(INITIAL_GROSS_SALARY);
  const [payPeriods, setPayPeriods] = useState<PayPeriods>(INITIAL_PAY_PERIODS);
  /** Id of the step whose tooltip is open; only one may be open at a time. */
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  const validation = validateGrossSalary(rawValue);
  const grossSalary = validation.amount ?? lastValidSalary;

  const result = useMemo(
    () => calculatePayroll(grossSalary, inpsRate),
    [grossSalary, inpsRate],
  );

  const steps = useMemo(() => buildBreakdownSteps(result), [result]);
  const segments = useMemo(() => buildChartSegments(result), [result]);

  function handleTextChange(nextValue: string) {
    setRawValue(nextValue);

    const { amount } = validateGrossSalary(nextValue);
    if (amount !== null) setLastValidSalary(amount);
  }

  function handleAmountChange(amount: number) {
    setRawValue(String(amount));
    setLastValidSalary(amount);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(20px,4vw,40px) clamp(14px,3vw,32px) 64px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(18px,3vw,28px)',
        }}
      >
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(26px,5vw,36px)',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-1.2px',
              color: COLORS.textPrimary,
            }}
          >
            {PAGE.title}
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              maxWidth: '760px',
              fontSize: '14px',
              lineHeight: 1.6,
              color: COLORS.textSecondary,
              textWrap: 'pretty',
            }}
          >
            {PAGE.subtitle}
            <a
              href={`#${PAGE.assumptionsAnchor}`}
              style={{ color: COLORS.accent, fontWeight: 700, paddingLeft: '2px' }}
            >
              *
            </a>
          </p>
        </header>

        <main style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <InputPanel
            value={rawValue}
            errorMessage={validation.errorMessage}
            sliderValue={clamp(grossSalary, SLIDER_RANGE.min, SLIDER_RANGE.max)}
            sliderFillPercentage={sliderFillFor(grossSalary)}
            selectedPreset={Math.round(grossSalary)}
            onTextChange={handleTextChange}
            onAmountChange={handleAmountChange}
            payPeriods={payPeriods}
            onPayPeriodsChange={setPayPeriods}
          />

          <div
            style={{
              flex: '3 1 440px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <SummaryPanel
              netSalary={formatCurrency(result.netSalary)}
              netSalaryShare={formatShare(result.netSalary, grossSalary)}
              netPerPeriod={formatCurrency(result.netSalary / payPeriods)}
              payPeriods={payPeriods}
              payPeriodNote={PAY_PERIOD_NOTES[payPeriods]}
              totalDeductions={formatCurrency(result.totalDeductions)}
              totalDeductionsShare={formatShare(result.totalDeductions, grossSalary)}
              segments={segments}
            />

            <BreakdownPanel
              steps={steps}
              formattedGrossSalary={formatCurrency(grossSalary)}
              formattedNetSalary={formatCurrency(result.netSalary)}
              netSalaryFormula={buildNetSalaryFormula(result)}
              openTooltipId={openTooltipId}
              onOpenTooltip={setOpenTooltipId}
              onCloseTooltip={() => setOpenTooltipId(null)}
            />

            <PayPeriodCards netSalary={result.netSalary} selected={payPeriods} />

            <MethodologyNote formattedContributionRate={formatRate(inpsRate)} />
          </div>
        </main>
      </div>
    </div>
  );
}

/** Restricts a value to a closed interval. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Position of the slider fill, as a percentage of the track.
 *
 * The field accepts salaries beyond the slider's maximum, so the fill is clamped
 * rather than allowed to overflow the track.
 */
function sliderFillFor(grossSalary: number): number {
  const { min, max } = SLIDER_RANGE;
  return clamp(((grossSalary - min) / (max - min)) * 100, 0, 100);
}

/**
 * Splits the gross salary into the four slices of the composition bar.
 *
 * Percentages are computed on the sum of the slices, which equals the gross
 * salary, so the legend always adds up to 100%. Empty slices are dropped, since
 * a zero-width segment would still render its legend entry.
 */
function buildChartSegments(result: PayrollBreakdown): ChartSegment[] {
  const slices = [
    { label: CHART_SEGMENT_LABELS.net, value: result.netSalary, color: COLORS.chartNet },
    {
      label: CHART_SEGMENT_LABELS.contributions,
      value: result.socialContributions,
      color: COLORS.chartContributions,
    },
    {
      label: CHART_SEGMENT_LABELS.incomeTax,
      value: result.incomeTax,
      color: COLORS.chartIncomeTax,
    },
    {
      label: CHART_SEGMENT_LABELS.surtaxes,
      value: result.regionalSurtax + result.municipalSurtax,
      color: COLORS.chartSurtaxes,
    },
  ];

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return slices
    .filter((slice) => slice.value > 0)
    .map((slice) => ({
      label: slice.label,
      color: slice.color,
      amount: formatCurrency(slice.value),
      share: formatShare(slice.value, total),
      widthPercentage: (slice.value / total) * 100,
    }));
}
