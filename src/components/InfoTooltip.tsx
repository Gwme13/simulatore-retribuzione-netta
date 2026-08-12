/**
 * The circled "i" next to a step title, and the panel it reveals.
 *
 * Opening is driven from the parent so that only one tooltip can be open at a
 * time. Pointer users get hover, touch users get tap-to-toggle, keyboard users
 * get focus. All three are needed because the icon is not a link and has no
 * other affordance.
 */

import { COLORS, TOOLTIP_FONT } from '../styles/tokens';

export interface InfoTooltipProps {
  /** Unique id of the tooltip panel, referenced by `aria-describedby`. */
  id: string;
  /** Text shown inside the panel. */
  text: string;
  /** Whether the panel is currently visible. */
  isOpen: boolean;
  /** Accessible name of the trigger, since its content is a bare "i". */
  label: string;
  /** Opens this tooltip and closes any other. */
  onOpen: () => void;
  /** Closes this tooltip. */
  onClose: () => void;
  /** Toggles the tooltip, used for pointer devices without hover. */
  onToggle: () => void;
}

export function InfoTooltip({
  id,
  text,
  isOpen,
  label,
  onOpen,
  onClose,
  onToggle,
}: InfoTooltipProps) {
  return (
    <button
      type="button"
      className="info-icon"
      aria-label={label}
      aria-expanded={isOpen}
      aria-describedby={isOpen ? id : undefined}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={onClose}
      onClick={onToggle}
      style={{
        position: 'relative',
        top: '0.5px',
        flex: '0 0 auto',
        width: '16px',
        height: '16px',
        padding: 0,
        boxSizing: 'border-box',
        borderRadius: '50%',
        border: `1px solid ${COLORS.infoIconBorder}`,
        background: 'transparent',
        color: COLORS.textOnDarkMuted,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: TOOLTIP_FONT,
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0,
        cursor: 'help',
        userSelect: 'none',
        alignSelf: 'center',
      }}
    >
      i
      {isOpen && (
        <span
          id={id}
          role="tooltip"
          style={{
            position: 'absolute',
            // Anchored to the right so the panel opens leftwards and stays on screen.
            top: 'calc(100% + 9px)',
            right: '-8px',
            width: '320px',
            maxWidth: 'calc(100vw - 56px)',
            boxSizing: 'border-box',
            padding: '11px 13px',
            background: COLORS.darkSurface,
            color: COLORS.tooltipText,
            borderRadius: '9px',
            fontFamily: TOOLTIP_FONT,
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: 'left',
            textWrap: 'pretty',
            boxShadow: '0 12px 28px rgba(15,27,46,.22)',
            zIndex: 20,
            cursor: 'default',
          }}
        >
          {text}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '12px',
              border: '6px solid transparent',
              borderBottomColor: COLORS.darkSurface,
            }}
          />
        </span>
      )}
    </button>
  );
}
