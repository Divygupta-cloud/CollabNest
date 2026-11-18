import React, { useState } from 'react';
import { Plus, FlaskConical } from 'lucide-react';
import { Issue, IssueStatus } from '../../types';
import { KanbanCard } from './KanbanCard';
import { COLUMN_META, isValidTransition } from '../../services/workflow';
import { usePermissions } from '../../services/rbac';

interface KanbanColumnProps {
  title: string;
  status: IssueStatus;
  issues: Issue[];
  onCardClick: (issue: Issue) => void;
  onDropIssue: (issueId: string, targetStatus: IssueStatus) => boolean | void;
  onQuickCreate?: (status: IssueStatus) => void;
  /** issues currently being dragged (to check valid drop target) */
  draggingIssue?: Issue | null;
  onDragStartIssue?: (issue: Issue) => void;
  onDragEndIssue?: () => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  issues,
  onCardClick,
  onDropIssue,
  onQuickCreate,
  draggingIssue,
  onDragStartIssue,
  onDragEndIssue,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const { can } = usePermissions();

  const meta = COLUMN_META[status] ?? COLUMN_META.TODO;

  // Check if the dragging issue can be dropped here
  const canDrop = draggingIssue
    ? isValidTransition(
        draggingIssue.type,
        draggingIssue.status,
        status,
        can('EDIT_ANY_ISSUE') // Admin / Manager / TL bypass workflow
      )
    : true;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canDrop && draggingIssue) {
      e.dataTransfer.dropEffect = 'none';
      setIsRejected(true);
      setIsDragOver(false);
    } else {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
      setIsRejected(false);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsRejected(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsRejected(false);
    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId && (canDrop || !draggingIssue)) {
      onDropIssue(issueId, status);
    }
  };

  const isQAColumn = status === 'QA_TESTING';
  const isDoneColumn = status === 'DONE';

  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: '240px',
        maxWidth: '300px',
        backgroundColor: isDragOver
          ? `${meta.accentBg}`
          : isRejected
          ? 'rgba(248, 113, 113, 0.06)'
          : '#1D2125',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        transition: 'background-color 0.12s ease, border-color 0.12s ease',
        border: isDragOver
          ? `2px dashed ${meta.accent}`
          : isRejected
          ? '2px dashed #F87171'
          : '1px solid #282E33',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        style={{
          padding: '10px 12px 8px 12px',
          borderBottom: `2px solid ${meta.accent}`,
          borderRadius: '6px 6px 0 0',
          backgroundColor: meta.accentBg,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {isQAColumn && <FlaskConical size={13} color={meta.accent} />}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: meta.headerColor,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: meta.accent,
                backgroundColor: `${meta.accentBg}`,
                border: `1px solid ${meta.accent}`,
                borderRadius: '10px',
                padding: '0px 6px',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {issues.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {totalPoints > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  color: '#738496',
                  fontWeight: 600,
                }}
              >
                {totalPoints} SP
              </span>
            )}
            {onQuickCreate && (
              <button
                onClick={() => onQuickCreate(status)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px',
                  cursor: 'pointer',
                  color: '#9FADBC',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = meta.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9FADBC')}
                title={`Add issue to ${title}`}
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Column Cards Container */}
      <div
        style={{
          padding: '8px 8px 12px 8px',
          overflowY: 'auto',
          flex: 1,
          minHeight: '120px',
        }}
      >
        {issues.length === 0 ? (
          <div
            style={{
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: isDragOver ? meta.accent : '#454F59',
              fontStyle: 'italic',
              gap: '4px',
              border: '1px dashed #333C48',
              borderRadius: '4px',
              margin: '4px 0',
            }}
          >
            {isDragOver ? (
              <span style={{ fontWeight: 600, fontStyle: 'normal' }}>Drop here</span>
            ) : isRejected ? (
              <span style={{ color: '#F87171', fontStyle: 'normal', fontWeight: 600 }}>
                ✗ Invalid transition
              </span>
            ) : (
              <span>No issues</span>
            )}
          </div>
        ) : (
          issues.map((issue) => (
            <KanbanCard
              key={issue.id}
              issue={issue}
              onClick={() => onCardClick(issue)}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', issue.id);
                e.dataTransfer.effectAllowed = 'move';
                onDragStartIssue?.(issue);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
