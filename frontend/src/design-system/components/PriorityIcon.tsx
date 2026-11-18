import React from 'react';
import { IssuePriority } from '../../types';

interface PriorityIconProps {
  priority: IssuePriority;
  size?: number;
  className?: string;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({
  priority,
  size = 14,
  className = '',
}) => {
  switch (priority) {
    case 'HIGHEST':
      return (
        <span title="Highest Priority" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 13V3M8 3L4 7M8 3L12 7" stroke="#CA3521" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );

    case 'HIGH':
      return (
        <span title="High Priority" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="#FF5630" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );

    case 'MEDIUM':
      return (
        <span title="Medium Priority" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.5 6.5H12.5" stroke="#FFAB00" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M3.5 10H12.5" stroke="#FFAB00" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
      );

    case 'LOW':
      return (
        <span title="Low Priority" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.5 4.5L11.5 11.5M11.5 11.5H6.5M11.5 11.5V6.5" stroke="#2A7E43" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );

    case 'LOWEST':
      return (
        <span title="Lowest Priority" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="#0C66E4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );

    default:
      return null;
  }
};
