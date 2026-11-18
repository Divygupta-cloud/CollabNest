import React from 'react';
import { IssueType } from '../../types';

interface IssueTypeIconProps {
  type: IssueType;
  size?: number;
  className?: string;
}

export const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({
  type,
  size = 16,
  className = '',
}) => {
  switch (type) {
    case 'EPIC':
      return (
        <span title="Epic" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="16" rx="3" fill="#904EE2" />
            <path
              d="M8.8 3L4.5 9.2H8L7.2 13L11.5 6.8H8L8.8 3Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );

    case 'STORY':
      return (
        <span title="Story" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="16" rx="3" fill="#00875A" />
            <path d="M4.5 4.5H11.5V12L8 9.5L4.5 12V4.5Z" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case 'TASK':
      return (
        <span title="Task" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="16" rx="3" fill="#4BADE8" />
            <path
              d="M6.5 10.5L4.5 8.5L5.2 7.8L6.5 9.1L10.8 4.8L11.5 5.5L6.5 10.5Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'BUG':
      return (
        <span title="Bug" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="16" rx="3" fill="#E5493A" />
            <circle cx="8" cy="8" r="3.2" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case 'SUBTASK':
      return (
        <span title="Subtask" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="16" height="16" rx="3" fill="#00A3BF" />
            <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          </svg>
        </span>
      );

    default:
      return null;
  }
};
