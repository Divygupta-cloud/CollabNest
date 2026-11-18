import React, { useState } from 'react';

export type UserAvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | number;

export interface UserAvatarProps {
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  userId?: string;
  name?: string;
  avatarUrl?: string;
  size?: UserAvatarSize;
  className?: string;
  title?: string;
  borderColor?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const sizeMap: Record<string, number> = {
  xs: 20,
  xsmall: 20,
  sm: 26,
  small: 26,
  md: 32,
  medium: 32,
  lg: 36,
  large: 36,
  xl: 48,
  xlarge: 48,
};

const fontMap: Record<string, string> = {
  xs: '10px',
  xsmall: '10px',
  sm: '11px',
  small: '11px',
  md: '12px',
  medium: '12px',
  lg: '14px',
  large: '14px',
  xl: '18px',
  xlarge: '18px',
};

const fallbackColors = [
  '#0052CC',
  '#00875A',
  '#5E4DB2',
  '#CA3521',
  '#00A3BF',
  '#DE350B',
  '#FF991F',
  '#403294',
  '#0065FF',
  '#36B37E',
];

function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates a deterministic Jira-style illustrated character avatar URL
 * using DiceBear's open-source avataaars library.
 */
export function getIllustratedAvatarUrl(seed: string): string {
  if (!seed) return 'https://api.dicebear.com/9.x/avataaars/svg?seed=user&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
  const cleanSeed = seed.trim().toLowerCase();
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(cleanSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  userId,
  name,
  avatarUrl,
  size = 'md',
  className = '',
  title,
  borderColor,
  style,
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Determine user identity
  const effectiveUserId = user?.id || userId;
  const effectiveName = user?.name || name || 'User';
  const accessibleTitle = title || effectiveName;

  // Resolve size in pixels
  const pxSize = typeof size === 'number' ? size : sizeMap[size] || 32;
  const fontSize = typeof size === 'number' ? `${Math.round(size * 0.4)}px` : fontMap[size] || '12px';

  // Seed for deterministic generation: prefer userId, fall back to name
  const seed = effectiveUserId || effectiveName;

  // Always use deterministic illustrated avatar, avoiding realistic photos
  let effectiveSrc = avatarUrl || user?.avatarUrl;
  if (!effectiveSrc || effectiveSrc.includes('unsplash.com') || effectiveSrc.includes('images.unsplash')) {
    effectiveSrc = getIllustratedAvatarUrl(seed);
  }

  const bgColor = getHashColor(effectiveName || seed || 'user');

  return (
    <div
      role="img"
      aria-label={accessibleTitle}
      title={accessibleTitle}
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
      style={{
        width: pxSize,
        height: pxSize,
        minWidth: pxSize,
        borderRadius: '50%',
        backgroundColor: imageFailed ? bgColor : '#1D2125',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize,
        boxShadow: borderColor ? `0 0 0 2px ${borderColor}` : undefined,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {!imageFailed && effectiveSrc ? (
        <img
          src={effectiveSrc}
          alt={accessibleTitle}
          loading="lazy"
          onError={() => setImageFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span style={{ lineHeight: 1 }}>{getInitials(effectiveName)}</span>
      )}
    </div>
  );
};
