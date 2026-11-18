import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagProps {
  label: string;
  isRemovable?: boolean;
  onRemove?: () => void;
  color?: 'default' | 'blue' | 'green' | 'purple' | 'red';
  className?: string;
  onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  label,
  isRemovable = false,
  onRemove,
  color = 'default',
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  const colorMap = {
    default: {
      bg: '#22272B',
      hoverBg: '#2C333A',
      text: '#C7D1DB',
      border: '#38414A',
    },
    blue: {
      bg: 'rgba(87, 157, 255, 0.12)',
      hoverBg: 'rgba(87, 157, 255, 0.22)',
      text: '#85B8FF',
      border: 'rgba(87, 157, 255, 0.32)',
    },
    green: {
      bg: 'rgba(33, 110, 78, 0.25)',
      hoverBg: 'rgba(33, 110, 78, 0.38)',
      text: '#7EE2B8',
      border: 'rgba(75, 206, 151, 0.32)',
    },
    purple: {
      bg: 'rgba(135, 119, 217, 0.16)',
      hoverBg: 'rgba(135, 119, 217, 0.28)',
      text: '#B8ACF6',
      border: 'rgba(155, 138, 251, 0.32)',
    },
    red: {
      bg: 'rgba(248, 113, 113, 0.12)',
      hoverBg: 'rgba(248, 113, 113, 0.22)',
      text: '#FF8F8F',
      border: 'rgba(248, 113, 113, 0.32)',
    },
  };

  const scheme = colorMap[color] || colorMap.default;

  return (
    <span
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4px',
        padding: isRemovable ? '2px 4px 2px 8px' : '2px 8px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: '16px',
        letterSpacing: '0.01em',
        backgroundColor: isHovered ? scheme.hoverBg : scheme.bg,
        color: scheme.text,
        border: `1px solid ${scheme.border}`,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s ease, border-color 0.12s ease',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ display: 'inline-block', lineHeight: 1 }}>{label}</span>
      {isRemovable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          onMouseEnter={() => setIsRemoveHovered(true)}
          onMouseLeave={() => setIsRemoveHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: isRemoveHovered ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            color: isRemoveHovered ? '#FFFFFF' : scheme.text,
            width: '14px',
            height: '14px',
            padding: 0,
            margin: '0 0 0 2px',
            borderRadius: '50%',
            cursor: 'pointer',
            outline: 'none',
            opacity: isRemoveHovered ? 1 : 0.7,
            transition: 'all 0.12s ease',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
};
