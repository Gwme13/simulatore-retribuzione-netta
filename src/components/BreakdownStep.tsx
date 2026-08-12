/**
 * One row of the step-by-step breakdown: numbered badge, title with its tooltip,
 * formula, optional band detail, and the resulting amount.
 */

import type { BreakdownStepView } from '../content/breakdown';
import { BREAKDOWN_PANEL } from '../content/labels';
import {
  BADGE_STYLE,
  COLORS,
  MONO_FONT,
  STEP_TONE_COLORS,
  STEP_VALUE_COLORS,
} from '../styles/tokens';
import { InfoTooltip } from './InfoTooltip';

export interface BreakdownStepProps {
  step: BreakdownStepView;
  /** Whether this step's tooltip is the one currently open. */
  isTooltipOpen: boolean;
  /** Opens this step's tooltip, closing any other. */
  onOpenTooltip: () => void;
  /** Closes the open tooltip. */
  onCloseTooltip: () => void;
  /** Toggles this step's tooltip. */
  onToggleTooltip: () => void;
}

export function BreakdownStep({
  step,
  isTooltipOpen,
  onOpenTooltip,
  onCloseTooltip,
  onToggleTooltip,
}: BreakdownStepProps) {
  const tone = STEP_TONE_COLORS[step.tone];

  return (
    <li
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px 16px',
        padding: '20px',
        borderBottom: `1px solid ${COLORS.subtleBorder}`,
        alignItems: 'flex-start',
      }}
    >
      <span
        aria-hidden="true"
        style={{ ...BADGE_STYLE, background: tone.surface, color: tone.ink }}
      >
        {step.id}
      </span>

      <div
        style={{
          flex: '1 1 180px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Title and icon share one inline-flex so the icon stays attached to
              the last word when the title wraps. */}
          <h3
            style={{
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '15px',
              fontWeight: 700,
              color: COLORS.textPrimary,
            }}
          >
            {step.title}
            <InfoTooltip
              id={`step-${step.id}-tooltip`}
              text={step.info}
              isOpen={isTooltipOpen}
              label={`${BREAKDOWN_PANEL.infoIconLabel}: ${step.title}`}
              onOpen={onOpenTooltip}
              onClose={onCloseTooltip}
              onToggle={onToggleTooltip}
            />
          </h3>
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: '11px',
              fontWeight: 600,
              color: tone.ink,
              background: tone.surface,
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            {step.tag}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontFamily: MONO_FONT,
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: COLORS.textSecondary,
            textWrap: 'pretty',
          }}
        >
          {step.formula}
        </p>

        {step.rows.length > 0 && (
          <dl
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '6px',
              borderLeft: `2px solid ${COLORS.border}`,
              paddingLeft: '14px',
            }}
          >
            {step.rows.map((row) => (
              <div
                key={row.description}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px 14px',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <dt
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: '12px',
                    color: COLORS.textSecondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.description}
                </dt>
                <dd
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'baseline',
                    whiteSpace: 'nowrap',
                    marginLeft: 'auto',
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO_FONT,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: COLORS.accent,
                    }}
                  >
                    {row.rate}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO_FONT,
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      minWidth: '74px',
                      textAlign: 'right',
                    }}
                  >
                    {row.amount}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div
        style={{
          flex: '0 0 auto',
          marginLeft: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        <output
          aria-live="off"
          style={{
            fontFamily: MONO_FONT,
            fontSize: '19px',
            fontWeight: 600,
            letterSpacing: '-.6px',
            color: STEP_VALUE_COLORS[step.valueTone],
          }}
        >
          {step.value}
        </output>
        <span style={{ fontFamily: MONO_FONT, fontSize: '11.5px', color: COLORS.textTertiary }}>
          {step.share}
        </span>
      </div>
    </li>
  );
}
