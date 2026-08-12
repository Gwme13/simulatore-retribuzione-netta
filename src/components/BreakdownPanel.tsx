/**
 * The "Il calcolo, passo per passo" card: the five steps plus the grand total.
 *
 * The card deliberately has no `overflow: hidden`, because the step tooltips
 * extend past its edges and would otherwise be clipped.
 */

import type { BreakdownStepView } from '../content/breakdown';
import { BREAKDOWN_PANEL } from '../content/labels';
import {
  BADGE_STYLE,
  CARD_STYLE,
  COLORS,
  LARGE_FIGURE_STYLE,
  MONO_FONT,
} from '../styles/tokens';
import { BreakdownStep } from './BreakdownStep';

export interface BreakdownPanelProps {
  steps: readonly BreakdownStepView[];
  /** Gross salary shown in the card header, already formatted. */
  formattedGrossSalary: string;
  /** Net salary shown in the total row, already formatted. */
  formattedNetSalary: string;
  /** Sentence under the total, e.g. `"€ 35.000 − € 11.614 di …"`. */
  netSalaryFormula: string;
  /** Id of the step whose tooltip is open, or `null` when none is. */
  openTooltipId: string | null;
  /** Opens the tooltip of one step, implicitly closing any other. */
  onOpenTooltip: (stepId: string) => void;
  /** Closes the open tooltip. */
  onCloseTooltip: () => void;
}

export function BreakdownPanel({
  steps,
  formattedGrossSalary,
  formattedNetSalary,
  netSalaryFormula,
  openTooltipId,
  onOpenTooltip,
  onCloseTooltip,
}: BreakdownPanelProps) {
  return (
    <section style={CARD_STYLE} aria-labelledby="breakdown-heading">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '20px',
          borderBottom: `1px solid ${COLORS.subtleBorder}`,
          borderRadius: '18px 18px 0 0',
        }}
      >
        <h2
          id="breakdown-heading"
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '-.4px',
            color: COLORS.textPrimary,
          }}
        >
          {BREAKDOWN_PANEL.heading}
        </h2>
        <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.textTertiary }}>
          {BREAKDOWN_PANEL.grossPrefix} {formattedGrossSalary}
        </span>
      </header>

      <ol>
        {steps.map((step) => (
          <BreakdownStep
            key={step.id}
            step={step}
            isTooltipOpen={openTooltipId === step.id}
            onOpenTooltip={() => onOpenTooltip(step.id)}
            onCloseTooltip={onCloseTooltip}
            onToggleTooltip={() =>
              openTooltipId === step.id ? onCloseTooltip() : onOpenTooltip(step.id)
            }
          />
        ))}
      </ol>

      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 16px',
          padding: '22px 20px',
          background: COLORS.totalSurface,
          alignItems: 'center',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            ...BADGE_STYLE,
            background: COLORS.darkSurface,
            color: COLORS.cardSurface,
            fontSize: '13px',
          }}
        >
          {BREAKDOWN_PANEL.totalBadge}
        </span>
        <div
          style={{
            flex: '1 1 180px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: COLORS.textPrimary }}>
            {BREAKDOWN_PANEL.totalTitle}
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: MONO_FONT,
              fontSize: '12.5px',
              color: COLORS.textSecondary,
            }}
          >
            {netSalaryFormula}
          </p>
        </div>
        <output
          aria-live="off"
          style={{ ...LARGE_FIGURE_STYLE, marginLeft: 'auto', whiteSpace: 'nowrap' }}
        >
          {formattedNetSalary}
        </output>
      </footer>
    </section>
  );
}
