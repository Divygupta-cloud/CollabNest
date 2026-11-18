import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  onClick?: () => void;
  isDestructive?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode; // custom menu content
  align?: 'left' | 'right';
  className?: string;
  menuWidth?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  children,
  align = 'left',
  className = '',
  menuWidth = '220px',
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className={className}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger}
      </div>

      {open && (
        <div
          className="animate-slide-down"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align]: 0,
            zIndex: 500,
            width: menuWidth,
            backgroundColor: '#22272B',
            borderRadius: '4px',
            boxShadow:
              '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
            border: '1px solid #333C48',
            padding: '4px 0',
            overflow: 'hidden',
            color: '#F1F2F4',
          }}
        >
          {items ? (
            <div>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isDisabled) return;
                    item.onClick?.();
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    cursor: item.isDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: item.isSelected
                      ? 'rgba(87, 157, 255, 0.18)'
                      : 'transparent',
                    color: item.isDisabled
                      ? '#738496'
                      : item.isDestructive
                      ? '#F87171'
                      : item.isSelected
                      ? '#579DFF'
                      : '#F1F2F4',
                    fontSize: '14px',
                    opacity: item.isDisabled ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isDisabled) {
                      e.currentTarget.style.backgroundColor = item.isSelected
                        ? 'rgba(87, 157, 255, 0.28)'
                        : 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.isSelected
                      ? 'rgba(87, 157, 255, 0.18)'
                      : 'transparent';
                  }}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <div style={{ flex: 1 }}>
                    <div>{item.label}</div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9FADBC',
                          marginTop: '2px',
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};
