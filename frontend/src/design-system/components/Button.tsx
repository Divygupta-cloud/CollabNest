import React, { useState } from 'react';

export type ButtonAppearance =
  | 'primary'
  | 'default'
  | 'subtle'
  | 'danger'
  | 'warning'
  | 'link';

export type ButtonSpacing = 'compact' | 'default' | 'none';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ButtonAppearance;
  spacing?: ButtonSpacing;
  isLoading?: boolean;
  isSelected?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      appearance = 'default',
      spacing = 'default',
      isLoading = false,
      isSelected = false,
      iconBefore,
      iconAfter,
      className = '',
      disabled,
      style,
      ...rest
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Padding & Height based on spacing
    const heightMap = {
      compact: '24px',
      default: '32px',
      none: 'auto',
    };

    const paddingMap = {
      compact: '0 8px',
      default: '0 12px',
      none: '0',
    };

    const fontSizeMap = {
      compact: '12px',
      default: '14px',
      none: 'inherit',
    };

    // Appearance styles
    let bg = 'rgba(255, 255, 255, 0.08)';
    let color = '#F1F2F4';
    let border = 'none';

    if (appearance === 'primary') {
      bg = '#0C66E4';
      color = '#FFFFFF';
      if (isHovered && !disabled) bg = '#0055CC';
      if (isActive && !disabled) bg = '#09326C';
    } else if (appearance === 'default') {
      bg = isSelected ? 'rgba(87, 157, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)';
      color = isSelected ? '#579DFF' : '#F1F2F4';
      if (isHovered && !disabled) bg = isSelected ? 'rgba(87, 157, 255, 0.3)' : 'rgba(255, 255, 255, 0.14)';
      if (isActive && !disabled) bg = 'rgba(255, 255, 255, 0.2)';
    } else if (appearance === 'subtle') {
      bg = isSelected ? 'rgba(87, 157, 255, 0.18)' : 'transparent';
      color = isSelected ? '#579DFF' : '#9FADBC';
      if (isHovered && !disabled) {
        bg = isSelected ? 'rgba(87, 157, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)';
        color = '#F1F2F4';
      }
      if (isActive && !disabled) bg = 'rgba(255, 255, 255, 0.14)';
    } else if (appearance === 'danger') {
      bg = '#CA3521';
      color = '#FFFFFF';
      if (isHovered && !disabled) bg = '#AE2A19';
      if (isActive && !disabled) bg = '#601E16';
    } else if (appearance === 'warning') {
      bg = '#E2B203';
      color = '#1D2125';
      if (isHovered && !disabled) bg = '#CF9F02';
    } else if (appearance === 'link') {
      bg = 'transparent';
      color = '#579DFF';
      border = 'none';
      if (isHovered && !disabled) {
        color = '#85B8FF';
      }
    }

    const computedStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: heightMap[spacing],
      padding: paddingMap[spacing],
      fontSize: fontSizeMap[spacing],
      fontWeight: 500,
      borderRadius: '3px',
      border,
      backgroundColor: bg,
      color,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background-color 0.15s ease, color 0.15s ease',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      textDecoration: appearance === 'link' && isHovered ? 'underline' : 'none',
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={computedStyle}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        {...rest}
      >
        {isLoading ? (
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
              display: 'inline-block',
            }}
          />
        ) : (
          iconBefore
        )}
        {children}
        {iconAfter}
      </button>
    );
  }
);

Button.displayName = 'Button';
