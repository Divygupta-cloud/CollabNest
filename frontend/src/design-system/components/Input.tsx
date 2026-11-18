import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isCompact?: boolean;
  isInvalid?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      isCompact = false,
      isInvalid = false,
      iconBefore,
      iconAfter,
      className = '',
      style,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    let borderColor = '#333C48';
    let bg = '#22272B';
    let boxShadow = 'none';

    if (isInvalid) {
      borderColor = '#F87171';
      boxShadow = isFocused ? '0 0 0 1px #F87171' : 'none';
      bg = '#22272B';
    } else if (isFocused) {
      borderColor = '#579DFF';
      boxShadow = '0 0 0 1px #579DFF';
      bg = '#1D2125';
    } else if (isHovered && !disabled) {
      borderColor = '#738496';
      bg = '#282E33';
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          height: isCompact ? '28px' : '36px',
          padding: '0 10px',
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '3px',
          boxShadow,
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
      >
        {iconBefore && <span style={{ color: '#8C9BAB', display: 'flex', alignItems: 'center' }}>{iconBefore}</span>}
        <input
          ref={ref}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#F1F2F4',
            fontSize: isCompact ? '13px' : '14px',
            width: '100%',
            ...style,
          }}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {iconAfter && <span style={{ color: '#8C9BAB', display: 'flex', alignItems: 'center' }}>{iconAfter}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ isInvalid = false, className = '', style, disabled, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    let borderColor = '#333C48';
    let bg = '#22272B';
    let boxShadow = 'none';

    if (isInvalid) {
      borderColor = '#F87171';
      boxShadow = isFocused ? '0 0 0 1px #F87171' : 'none';
      bg = '#22272B';
    } else if (isFocused) {
      borderColor = '#579DFF';
      boxShadow = '0 0 0 1px #579DFF';
      bg = '#1D2125';
    } else if (isHovered && !disabled) {
      borderColor = '#738496';
      bg = '#282E33';
    }

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px 10px',
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '3px',
          boxShadow,
          outline: 'none',
          color: '#F1F2F4',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        className={className}
        {...rest}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  isCompact?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ isCompact = false, children, className = '', style, disabled, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    let borderColor = '#333C48';
    let bg = '#22272B';
    let boxShadow = 'none';

    if (isFocused) {
      borderColor = '#579DFF';
      boxShadow = '0 0 0 1px #579DFF';
      bg = '#1D2125';
    } else if (isHovered && !disabled) {
      borderColor = '#738496';
      bg = '#282E33';
    }

    return (
      <select
        ref={ref}
        disabled={disabled}
        style={{
          height: isCompact ? '28px' : '36px',
          padding: '0 28px 0 10px',
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '3px',
          boxShadow,
          outline: 'none',
          color: '#F1F2F4',
          fontSize: isCompact ? '13px' : '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'auto',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        className={className}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
