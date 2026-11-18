import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center gap-1.5 text-xs mb-3 select-none ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} color="#738496" />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                style={{ color: '#9FADBC', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#579DFF';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9FADBC';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? '#F1F2F4' : '#8C9BAB', fontWeight: isLast ? 600 : 400 }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
