/**
 * Footnote spelling out the assumptions behind the simulation. The asterisk in
 * the page subtitle links here.
 */

import { buildMethodologyNote, PAGE } from '../content/labels';
import { COLORS } from '../styles/tokens';

export interface MethodologyNoteProps {
  /** Contribution rate actually used, already formatted, e.g. `"9,19%"`. */
  formattedContributionRate: string;
}

export function MethodologyNote({ formattedContributionRate }: MethodologyNoteProps) {
  return (
    <p
      id={PAGE.assumptionsAnchor}
      style={{
        margin: 0,
        fontSize: '11.5px',
        lineHeight: 1.7,
        color: COLORS.textTertiary,
        textWrap: 'pretty',
        scrollMarginTop: '24px',
      }}
    >
      <span style={{ color: COLORS.accent, fontWeight: 700 }}>*</span>{' '}
      {buildMethodologyNote(formattedContributionRate)}
    </p>
  );
}
