/**
 * Design tokens and the style objects shared by more than one component.
 *
 * The reference design ships as inline styles. Rather than repeating the same
 * hex codes and font stacks across a dozen files, every recurring value lives
 * here under the name it has in the design system, so a colour is changed once
 * and the components read as intent instead of as magic strings.
 */

import type { CSSProperties } from 'react';

/** The design system palette, verbatim from the handoff. */
export const COLORS = {
  pageBackground: '#F4F6FA',
  cardSurface: '#FFFFFF',
  subtleSurface: '#FBFCFE',
  totalSurface: '#F7F9FD',
  segmentedSurface: '#F1F4FA',
  disabledSurface: '#F5F7FA',

  border: '#E2E7F0',
  subtleBorder: '#EDF0F6',
  inputBorder: '#D9E0EC',
  infoIconBorder: '#C9D3E4',
  sliderTrack: '#DDE3EE',

  textPrimary: '#0F1B2E',
  textSecondary: '#5A6883',
  textTertiary: '#8792A8',
  textOnDarkMuted: '#8FA1C0',
  textOnDarkBody: '#C6D2E4',
  tooltipText: '#DCE4F2',

  accent: '#2F5CFF',
  accentHover: '#1B3FCC',
  accentSurface: '#EAF0FF',

  negative: '#D5442F',
  negativeSurface: '#FBE4E0',
  errorBorder: '#E8917F',

  positive: '#0E9463',
  positiveSurface: '#E4F7EE',

  ochre: '#B5711A',
  ochreSurface: '#FFF2E0',

  darkSurface: '#0F1B2E',
  darkBarTrack: '#24344F',

  chartNet: '#7FE7C4',
  chartContributions: '#4E7BFF',
  chartIncomeTax: '#FF7A5C',
  chartSurtaxes: '#FFC46B',
  kpiDeductions: '#FF9E80',
} as const;

/** Monospace stack used for every figure, formula and tag. */
export const MONO_FONT = "'IBM Plex Mono',monospace";

/** Sans stack used for the interface itself. */
export const SANS_FONT = "'Plus Jakarta Sans',sans-serif";

/**
 * Font stack of the tooltip and the info icon.
 *
 * The reference asks for Inter, which the design never loads; the browser
 * therefore falls back to `system-ui`. Reproduced as-is on purpose; see the
 * observations in the README.
 */
export const TOOLTIP_FONT = "'Inter',system-ui,sans-serif";

/** Uppercase caption used above every input and card. */
export const LABEL_STYLE: CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '1.3px',
  textTransform: 'uppercase',
  color: COLORS.textSecondary,
};

/** Same caption, on the dark summary panel. */
export const DARK_EYEBROW_STYLE: CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '1.4px',
  textTransform: 'uppercase',
  color: COLORS.textOnDarkMuted,
  whiteSpace: 'nowrap',
};

/** White card shared by the input panel and the breakdown panel. */
export const CARD_STYLE: CSSProperties = {
  background: COLORS.cardSurface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  boxShadow: '0 1px 2px rgba(15,27,46,.04)',
};

/** Hairline separator inside the input panel. */
export const DIVIDER_STYLE: CSSProperties = {
  height: '1px',
  background: COLORS.subtleBorder,
};

/** Round 28px badge carrying a step number, or the total's equals sign. */
export const BADGE_STYLE: CSSProperties = {
  flex: '0 0 auto',
  width: '28px',
  height: '28px',
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12.5px',
  fontWeight: 800,
};

/** Colour pair of a step's badge and tag, keyed by the step's visual family. */
export const STEP_TONE_COLORS = {
  contribution: { surface: COLORS.accentSurface, ink: COLORS.accent },
  taxBase: { surface: COLORS.segmentedSurface, ink: COLORS.textSecondary },
  tax: { surface: COLORS.negativeSurface, ink: COLORS.negative },
  local: { surface: COLORS.ochreSurface, ink: COLORS.ochre },
} as const;

/** Colour of a step's headline amount, by role. */
export const STEP_VALUE_COLORS = {
  deducted: COLORS.negative,
  neutral: COLORS.textPrimary,
  muted: COLORS.textTertiary,
} as const;

/** Large monospace figure, used for the totals and the pay-period cards. */
export const LARGE_FIGURE_STYLE: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: '26px',
  fontWeight: 600,
  letterSpacing: '-1px',
  color: COLORS.textPrimary,
};

/** Select box for region and municipality, rendered with a custom chevron. */
export const SELECT_STYLE: CSSProperties = {
  appearance: 'none',
  border: `1.5px solid ${COLORS.border}`,
  background: `${COLORS.disabledSurface} url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%238792A8%22 stroke-width=%221.6%22/></svg>') no-repeat right 14px center`,
  borderRadius: '11px',
  padding: '13px 14px',
  fontFamily: SANS_FONT,
  fontSize: '14px',
  fontWeight: 600,
  color: COLORS.textSecondary,
  cursor: 'not-allowed',
};
