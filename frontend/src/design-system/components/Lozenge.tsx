import React from 'react';
import { IssueStatus } from '../../types';

interface LozengeProps {
  status: IssueStatus | string;
  isBold?: boolean;
  isCompact?: boolean;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; text: string; bg: string; border: string; boldBg: string; boldText: string }
> = {
  BACKLOG: {
    label: 'BACKLOG',
    text: '#9FADBC',
    bg: '#282E33',
    border: 'none',
    boldBg: '#282E33',
    boldText: '#9FADBC',
  },
  TODO: {
    label: 'TO DO',
    text: '#DEE4EA',
    bg: '#282E33',
    border: 'none',
    boldBg: '#282E33',
    boldText: '#DEE4EA',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    text: '#FFFFFF',
    bg: '#0055CC',
    border: 'none',
    boldBg: '#0055CC',
    boldText: '#FFFFFF',
  },
  IN_REVIEW: {
    label: 'IN REVIEW',
    text: '#FFFFFF',
    bg: '#5E4DB2',
    border: 'none',
    boldBg: '#5E4DB2',
    boldText: '#FFFFFF',
  },
  QA_TESTING: {
    label: 'QA TESTING',
    text: '#1D1F21',
    bg: '#CF9F02',
    border: 'none',
    boldBg: '#CF9F02',
    boldText: '#1D1F21',
  },
  DONE: {
    label: 'DONE',
    text: '#FFFFFF',
    bg: '#216E4E',
    border: 'none',
    boldBg: '#216E4E',
    boldText: '#FFFFFF',
  },
  CANCELLED: {
    label: 'CANCELLED',
    text: '#FFFFFF',
    bg: '#AE2E24',
    border: 'none',
    boldBg: '#AE2E24',
    boldText: '#FFFFFF',
  },
};

export const Lozenge: React.FC<LozengeProps> = ({
  status,
  isBold = false,
  className = '',
}) => {
  const normalizedKey = status.toUpperCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedKey] || {
    label: status.toUpperCase(),
    text: '#DEE4EA',
    bg: '#282E33',
    border: 'none',
    boldBg: '#282E33',
    boldText: '#DEE4EA',
  };

  const style: React.CSSProperties = {
    backgroundColor: isBold ? config.boldBg : config.bg,
    color: isBold ? config.boldText : config.text,
    border: config.border && config.border !== 'none' ? `1px solid ${config.border}` : 'none',
    borderRadius: '3px',
    padding: '2px 6px',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.04em',
    lineHeight: '14px',
    textTransform: 'uppercase',
  };

  return (
    <span
      className={`jira-lozenge select-none ${className}`}
      style={style}
    >
      {config.label}
    </span>
  );
};
