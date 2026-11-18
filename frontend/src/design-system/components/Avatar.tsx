import React, { useState } from 'react';
import { getIllustratedAvatarUrl } from './UserAvatar';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  appearance?: 'circle' | 'square';
  className?: string;
  title?: string;
  borderColor?: string;
}

const sizeMap = {
  xsmall: 18,
  small: 24,
  medium: 32,
  large: 40,
  xlarge: 48,
};

const fontMap = {
  xsmall: '10px',
  small: '11px',
  medium: '13px',
  large: '16px',
  xlarge: '18px',
};

const bgColors = [
  '#0052CC',
  '#00875A',
  '#5E4DB2',
  '#CA3521',
  '#00A3BF',
  '#DE350B',
  '#FF991F',
  '#403294',
];

function getHashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'medium',
  appearance = 'circle',
  className = '',
  title,
  borderColor,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const pxSize = sizeMap[size];
  const fontSize = fontMap[size];
  const borderRadius = appearance === 'circle' ? '50%' : '4px';
  const bgColor = getHashColor(name);

  let effectiveSrc = src;
  if (!effectiveSrc || effectiveSrc.includes('unsplash.com') || effectiveSrc.includes('images.unsplash')) {
    effectiveSrc = getIllustratedAvatarUrl(name);
  }

  return (
    <div
      title={title || name}
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
      style={{
        width: pxSize,
        height: pxSize,
        minWidth: pxSize,
        borderRadius,
        backgroundColor: imageFailed ? bgColor : '#1D2125',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize,
        boxShadow: borderColor ? `0 0 0 2px ${borderColor}` : undefined,
        cursor: 'default',
      }}
    >
      {effectiveSrc && !imageFailed ? (
        <img
          src={effectiveSrc}
          alt={name}
          onError={() => setImageFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius,
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{
  users: Array<{ id: string; name: string; avatarUrl?: string }>;
  max?: number;
  size?: 'xsmall' | 'small' | 'medium';
}> = ({ users, max = 4, size = 'small' }) => {
  const visible = users.slice(0, max);
  const remainder = users.length - max;

  return (
    <div className="inline-flex items-center -space-x-1.5 overflow-hidden">
      {visible.map((user) => (
        <Avatar
          key={user.id}
          name={user.name}
          src={user.avatarUrl}
          size={size}
          borderColor="#1D2125"
          title={user.name}
        />
      ))}
      {remainder > 0 && (
        <div
          title={`${remainder} more members`}
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            fontSize: fontMap[size],
            backgroundColor: '#333C48',
            color: '#DEE4EA',
            borderRadius: '50%',
            boxShadow: '0 0 0 2px #1D2125',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
};
