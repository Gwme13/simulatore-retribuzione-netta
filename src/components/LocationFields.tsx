/**
 * Region and municipality selectors.
 *
 * Both are locked: the prototype only models Milan, in Lombardy. They stay
 * visible rather than hidden so the assumption behind the local surtaxes is
 * explicit, and they are marked disabled so the keyboard skips them.
 */

import { INPUT_PANEL } from '../content/labels';
import { LABEL_STYLE, SELECT_STYLE } from '../styles/tokens';

/** One locked selector, rendered twice with different content. */
interface LockedSelectProps {
  id: string;
  label: string;
  value: string;
}

function LockedSelect({ id, label, value }: LockedSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label htmlFor={id} style={LABEL_STYLE}>
        {label}
      </label>
      {/* Uncontrolled on purpose: the field is disabled and offers one option,
          so there is no change to handle. */}
      <select id={id} disabled defaultValue={value} style={SELECT_STYLE}>
        <option value={value}>{value}</option>
      </select>
    </div>
  );
}

export function LocationFields() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      <LockedSelect id="region" label={INPUT_PANEL.regionLabel} value={INPUT_PANEL.regionValue} />
      <LockedSelect
        id="municipality"
        label={INPUT_PANEL.municipalityLabel}
        value={INPUT_PANEL.municipalityValue}
      />
    </div>
  );
}
