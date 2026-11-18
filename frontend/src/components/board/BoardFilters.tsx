import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, AlertCircle, Zap, Tag, Filter } from 'lucide-react';
import { UserAvatar } from '../../design-system/components/UserAvatar';
import { User, IssueType, IssuePriority, Issue } from '../../types';
import { IssueTypeIcon, PriorityIcon } from '../../design-system/components';

interface BoardFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;

  selectedAssigneeIds: string[];
  onAssigneeSelect: (id: string) => void;

  selectedTypes: (IssueType | 'ALL')[];
  onTypeSelect: (type: IssueType | 'ALL') => void;

  selectedPriorities: (IssuePriority | 'ALL')[];
  onPrioritySelect: (priority: IssuePriority | 'ALL') => void;

  selectedEpicId: string | null;
  onEpicSelect: (epicId: string | null) => void;

  selectedLabel: string | null;
  onLabelSelect: (label: string | null) => void;

  onlyMyIssues: boolean;
  onToggleOnlyMyIssues: () => void;

  users: User[];
  epics: Issue[];
  allLabels: string[];
  currentUserId: string;

  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: 'STORY',   label: 'Story' },
  { value: 'TASK',    label: 'Task' },
  { value: 'BUG',     label: 'Bug' },
  { value: 'SUBTASK', label: 'Sub-task' },
];

const PRIORITIES: { value: IssuePriority; label: string }[] = [
  { value: 'HIGHEST', label: 'Highest' },
  { value: 'HIGH',    label: 'High' },
  { value: 'MEDIUM',  label: 'Medium' },
  { value: 'LOW',     label: 'Low' },
  { value: 'LOWEST',  label: 'Lowest' },
];

// Generic dropdown pill
function FilterPill({
  label,
  icon,
  active,
  count,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          height: '28px',
          padding: '0 10px',
          borderRadius: '3px',
          border: active ? '1px solid #579DFF' : '1px solid #333C48',
          backgroundColor: active ? 'rgba(87, 157, 255, 0.12)' : '#22272B',
          color: active ? '#579DFF' : '#9FADBC',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '#282E33';
            e.currentTarget.style.borderColor = '#454F59';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '#22272B';
            e.currentTarget.style.borderColor = '#333C48';
          }
        }}
      >
        {icon}
        {label}
        {count !== undefined && count > 0 && (
          <span
            style={{
              backgroundColor: '#579DFF',
              color: '#fff',
              borderRadius: '10px',
              padding: '0 5px',
              fontSize: '10px',
              fontWeight: 700,
              minWidth: '16px',
              textAlign: 'center',
            }}
          >
            {count}
          </span>
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 300,
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            minWidth: '180px',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export const BoardFilters: React.FC<BoardFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssigneeIds,
  onAssigneeSelect,
  selectedTypes,
  onTypeSelect,
  selectedPriorities,
  onPrioritySelect,
  selectedEpicId,
  onEpicSelect,
  selectedLabel,
  onLabelSelect,
  onlyMyIssues,
  onToggleOnlyMyIssues,
  users,
  epics,
  allLabels,
  currentUserId,
  hasActiveFilters,
  onClearFilters,
}) => {
  const assigneeCount = selectedAssigneeIds.length;
  const typeCount = selectedTypes.length;
  const priorityCount = selectedPriorities.length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '14px',
        userSelect: 'none',
        padding: '10px 0',
        borderBottom: '1px solid #282E33',
      }}
    >
      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#22272B',
          border: `1px solid ${searchQuery ? '#579DFF' : '#333C48'}`,
          borderRadius: '3px',
          padding: '0 8px',
          height: '28px',
          width: '200px',
          transition: 'border-color 0.15s',
        }}
      >
        <Search size={13} color={searchQuery ? '#579DFF' : '#9FADBC'} />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search board..."
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '12px',
            color: '#F1F2F4',
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#738496', display: 'flex' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', backgroundColor: '#333C48' }} />

      {/* Assignee avatars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {users.slice(0, 6).map((u) => {
          const isSelected = selectedAssigneeIds.includes(u.id);
          return (
            <div
              key={u.id}
              onClick={() => onAssigneeSelect(u.id)}
              title={u.name}
              style={{
                cursor: 'pointer',
                borderRadius: '50%',
                padding: '1px',
                border: isSelected ? '2px solid #579DFF' : '2px solid transparent',
                opacity: assigneeCount > 0 && !isSelected ? 0.45 : 1,
                transition: 'all 0.12s ease',
              }}
            >
              <UserAvatar user={u} size="xs" />
            </div>
          );
        })}
      </div>

      {/* My issues toggle */}
      <button
        onClick={onToggleOnlyMyIssues}
        style={{
          height: '28px',
          padding: '0 10px',
          borderRadius: '3px',
          border: onlyMyIssues ? '1px solid #579DFF' : '1px solid #333C48',
          backgroundColor: onlyMyIssues ? 'rgba(87, 157, 255, 0.12)' : '#22272B',
          color: onlyMyIssues ? '#579DFF' : '#9FADBC',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        Only mine
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', backgroundColor: '#333C48' }} />

      {/* Issue Type filter */}
      <FilterPill
        label="Type"
        icon={<Filter size={12} />}
        active={typeCount > 0}
        count={typeCount}
      >
        {(close) => (
          <div style={{ padding: '6px 0' }}>
            {ISSUE_TYPES.map((t) => {
              const isActive = selectedTypes.includes(t.value);
              return (
                <div
                  key={t.value}
                  onClick={() => { onTypeSelect(t.value); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 14px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                    color: isActive ? '#579DFF' : '#F1F2F4',
                    fontSize: '13px',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#282E33'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <IssueTypeIcon type={t.value} size={14} />
                  {t.label}
                  {isActive && <span style={{ marginLeft: 'auto', color: '#579DFF', fontSize: '12px' }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </FilterPill>

      {/* Priority filter */}
      <FilterPill
        label="Priority"
        icon={<AlertCircle size={12} />}
        active={priorityCount > 0}
        count={priorityCount}
      >
        {(close) => (
          <div style={{ padding: '6px 0' }}>
            {PRIORITIES.map((p) => {
              const isActive = selectedPriorities.includes(p.value);
              return (
                <div
                  key={p.value}
                  onClick={() => onPrioritySelect(p.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 14px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                    color: isActive ? '#579DFF' : '#F1F2F4',
                    fontSize: '13px',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#282E33'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <PriorityIcon priority={p.value} size={14} />
                  {p.label}
                  {isActive && <span style={{ marginLeft: 'auto', color: '#579DFF', fontSize: '12px' }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </FilterPill>

      {/* Epic filter */}
      {epics.length > 0 && (
        <FilterPill
          label={selectedEpicId ? (epics.find((e) => e.id === selectedEpicId)?.key ?? 'Epic') : 'Epic'}
          icon={<Zap size={12} />}
          active={!!selectedEpicId}
        >
          {(close) => (
            <div style={{ padding: '6px 0' }}>
              <div
                onClick={() => { onEpicSelect(null); close(); }}
                style={{
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: !selectedEpicId ? '#579DFF' : '#F1F2F4',
                  backgroundColor: !selectedEpicId ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => { if (selectedEpicId) e.currentTarget.style.backgroundColor = '#282E33'; }}
                onMouseLeave={(e) => { if (selectedEpicId) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                All Epics
              </div>
              {epics.map((epic) => {
                const isActive = selectedEpicId === epic.id;
                return (
                  <div
                    key={epic.id}
                    onClick={() => { onEpicSelect(isActive ? null : epic.id); close(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                      color: isActive ? '#579DFF' : '#F1F2F4',
                      fontSize: '13px',
                      transition: 'background-color 0.1s',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#282E33'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Zap size={12} color="#B8ACF6" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {epic.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </FilterPill>
      )}

      {/* Label filter */}
      {allLabels.length > 0 && (
        <FilterPill
          label={selectedLabel ?? 'Label'}
          icon={<Tag size={12} />}
          active={!!selectedLabel}
        >
          {(close) => (
            <div style={{ padding: '6px 0' }}>
              <div
                onClick={() => { onLabelSelect(null); close(); }}
                style={{
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: !selectedLabel ? '#579DFF' : '#F1F2F4',
                  backgroundColor: !selectedLabel ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
              >
                All Labels
              </div>
              {allLabels.map((lbl) => {
                const isActive = selectedLabel === lbl;
                return (
                  <div
                    key={lbl}
                    onClick={() => { onLabelSelect(isActive ? null : lbl); close(); }}
                    style={{
                      padding: '7px 14px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                      color: isActive ? '#579DFF' : '#F1F2F4',
                      fontSize: '13px',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#282E33'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {lbl}
                  </div>
                );
              })}
            </div>
          )}
        </FilterPill>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#333C48' }} />
          <button
            onClick={onClearFilters}
            style={{
              height: '28px',
              padding: '0 10px',
              borderRadius: '3px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#579DFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <X size={12} />
            Clear filters
          </button>
        </>
      )}
    </div>
  );
};
