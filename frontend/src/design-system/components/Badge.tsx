import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  appearance?: 'default' | 'primary' | 'important' | 'added';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  appearance = 'default',
  className = '',
}) => {
  const appearanceStyles = {
    default: {
      bg: '#333C48',
      color: '#DEE4EA',
    },
    primary: {
      bg: '#0C66E4',
      color: '#FFFFFF',
    },
    important: {
      bg: '#CA3521',
      color: '#FFFFFF',
    },
    added: {
      bg: 'rgba(33, 110, 78, 0.4)',
      color: '#4BCE97',
    },
  };

  const style = appearanceStyles[appearance];

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full select-none ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '11px',
        lineHeight: 1,
        padding: '2px 6px',
        minWidth: '18px',
        height: '18px',
      }}
    >
      {children}
    </span>
  );
};
