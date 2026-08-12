/**
 * Dark panel at the top of the results column: the three headline figures and
 * the composition bar underneath them.
 */

import { SUMMARY_PANEL } from '../content/labels';
import { COLORS } from '../styles/tokens';
import { CompositionChart, type ChartSegment } from './CompositionChart';
import { KpiTile } from './KpiTile';

export interface SummaryPanelProps {
  /** Net yearly salary, already formatted. */
  netSalary: string;
  /** Weight of the net salary on the gross one, e.g. `"66,8%"`. */
  netSalaryShare: string;
  /** Net salary per pay period, already formatted. */
  netPerPeriod: string;
  /** Number of pay periods the net is split into. */
  payPeriods: number;
  /** Caption under the per-period figure. */
  payPeriodNote: string;
  /** Total withheld, already formatted. */
  totalDeductions: string;
  /** Weight of the deductions on the gross salary. */
  totalDeductionsShare: string;
  segments: readonly ChartSegment[];
}

export function SummaryPanel({
  netSalary,
  netSalaryShare,
  netPerPeriod,
  payPeriods,
  payPeriodNote,
  totalDeductions,
  totalDeductionsShare,
  segments,
}: SummaryPanelProps) {
  return (
    <section
      aria-label="Risultato della simulazione"
      style={{
        background: COLORS.darkSurface,
        borderRadius: '18px',
        padding: 'clamp(20px,3vw,30px) clamp(18px,3vw,32px)',
        color: COLORS.cardSurface,
        display: 'flex',
        flexDirection: 'column',
        gap: '26px',
        boxShadow: '0 12px 32px rgba(15,27,46,.18)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
          gap: '18px',
          alignItems: 'end',
        }}
      >
        <KpiTile
          eyebrow={SUMMARY_PANEL.netSalaryEyebrow}
          value={netSalary}
          note={`${netSalaryShare} ${SUMMARY_PANEL.ofGrossSuffix}`}
          valueFontSize="44px"
          valueLetterSpacing="-2px"
        />
        <KpiTile
          eyebrow={`${SUMMARY_PANEL.netPerPeriodEyebrow} × ${payPeriods}`}
          value={netPerPeriod}
          note={payPeriodNote}
          valueFontSize="32px"
          valueLetterSpacing="-1.4px"
          valueColor={COLORS.chartNet}
        />
        <KpiTile
          eyebrow={SUMMARY_PANEL.totalDeductionsEyebrow}
          value={totalDeductions}
          note={`${totalDeductionsShare} ${SUMMARY_PANEL.ofGrossSuffix}`}
          valueFontSize="32px"
          valueLetterSpacing="-1.4px"
          valueColor={COLORS.kpiDeductions}
        />
      </div>

      <CompositionChart segments={segments} />
    </section>
  );
}
