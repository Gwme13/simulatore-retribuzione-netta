/**
 * Gross salary input: text field, validation message, slider and presets.
 *
 * The field and the slider edit the same value from two directions, so the parent
 * owns both the raw text and the last valid amount (see `App.tsx`).
 */

import { INPUT_PANEL, SALARY_PRESETS, SLIDER_RANGE } from '../content/labels';
import { COLORS, LABEL_STYLE, MONO_FONT } from '../styles/tokens';

const FIELD_ID = 'gross-salary';
const ERROR_ID = 'gross-salary-error';

export interface GrossSalaryFieldProps {
  /** Raw text currently in the field, which may not be a valid number. */
  value: string;
  /** Validation message to show, or `null` when the input is valid. */
  errorMessage: string | null;
  /** Amount the slider thumb reflects, already clamped to the slider range. */
  sliderValue: number;
  /** How far along the track the fill reaches, as a percentage 0–100. */
  sliderFillPercentage: number;
  /** Last valid amount, used to highlight the matching preset. */
  selectedPreset: number;
  /** Called on every keystroke with the raw field text. */
  onTextChange: (rawValue: string) => void;
  /** Called when the slider or a preset picks an exact amount. */
  onAmountChange: (amount: number) => void;
}

export function GrossSalaryField({
  value,
  errorMessage,
  sliderValue,
  sliderFillPercentage,
  selectedPreset,
  onTextChange,
  onAmountChange,
}: GrossSalaryFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <label htmlFor={FIELD_ID} style={LABEL_STYLE}>
        {INPUT_PANEL.grossSalaryLabel}
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: `1.5px solid ${errorMessage ? COLORS.errorBorder : COLORS.inputBorder}`,
          borderRadius: '12px',
          padding: '0 16px',
          background: COLORS.subtleSurface,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '22px', fontWeight: 700, color: COLORS.textTertiary }}>
          {INPUT_PANEL.currencySymbol}
        </span>
        <input
          id={FIELD_ID}
          type="number"
          value={value}
          onChange={(event) => onTextChange(event.target.value)}
          aria-invalid={errorMessage !== null}
          aria-describedby={errorMessage ? ERROR_ID : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: MONO_FONT,
            fontSize: '26px',
            fontWeight: 600,
            letterSpacing: '-1px',
            color: COLORS.textPrimary,
            padding: '14px 0',
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.textTertiary }}>
          {INPUT_PANEL.perYearSuffix}
        </span>
      </div>

      {errorMessage && (
        <p
          id={ERROR_ID}
          role="alert"
          style={{
            margin: 0,
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '12.5px',
            fontWeight: 600,
            color: COLORS.negative,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: COLORS.negativeSurface,
              color: COLORS.negative,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              flex: '0 0 auto',
            }}
          >
            !
          </span>
          <span>{errorMessage}</span>
        </p>
      )}

      <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center' }}>
        {/* Track and fill are plain elements: styling the native track
            consistently across browsers is not possible. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '6px',
            borderRadius: '99px',
            background: COLORS.sliderTrack,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            height: '6px',
            borderRadius: '99px',
            background: COLORS.accent,
            width: `${sliderFillPercentage}%`,
          }}
        />
        <input
          type="range"
          min={SLIDER_RANGE.min}
          max={SLIDER_RANGE.max}
          step={SLIDER_RANGE.step}
          value={sliderValue}
          aria-label={INPUT_PANEL.sliderAccessibleLabel}
          onChange={(event) => onAmountChange(Number(event.target.value))}
          style={{ position: 'relative', width: '100%', height: '22px', margin: 0, background: 'transparent' }}
        />
      </div>

      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO_FONT,
          fontSize: '11px',
          color: COLORS.textTertiary,
        }}
      >
        <span>{INPUT_PANEL.sliderMinLabel}</span>
        <span>{INPUT_PANEL.sliderMaxLabel}</span>
      </div>

      <ul style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {SALARY_PRESETS.map((preset) => {
          const isSelected = preset === selectedPreset;

          return (
            <li key={preset}>
              <button
                type="button"
                className="preset-chip"
                aria-pressed={isSelected}
                onClick={() => onAmountChange(preset)}
                style={{
                  border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
                  background: isSelected ? COLORS.accentSurface : COLORS.cardSurface,
                  color: isSelected ? COLORS.accent : COLORS.textSecondary,
                  borderRadius: '99px',
                  padding: '7px 13px',
                  fontFamily: MONO_FONT,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {preset / 1000}k
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
