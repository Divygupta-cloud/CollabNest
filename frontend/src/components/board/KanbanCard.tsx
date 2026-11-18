import React from 'react';
import { Issue } from '../../types';
import { IssueTypeIcon, PriorityIcon, Tag } from '../../design-system/components';
import { UserAvatar } from '../../design-system/components/UserAvatar';
import { useUsers } from '../../services';
import { CheckSquare } from 'lucide-react';
import { ISSUE_TYPE_META } from '../../services/workflow';

interface KanbanCardProps {
  issue: Issue;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, issue: Issue) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ issue, onClick, onDragStart }) => {
  const users = useUsers();
  const rawAssigneeIds = issue.assigneeIds && issue.assigneeIds.length > 0
    ? issue.assigneeIds
    : issue.assigneeId
    ? [issue.assigneeId]
    : [];
  const assignees = rawAssigneeIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is typeof users[0] => !!u);
  const assignee = assignees[0];
  const typeMeta = ISSUE_TYPE_META[issue.type] ?? ISSUE_TYPE_META.TASK;
  const isBug = issue.type === 'BUG';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, issue)}
      onClick={onClick}
      style={{
        backgroundColor: '#22272B',
        borderRadius: '4px',
        border: `1px solid ${isBug ? 'rgba(248, 113, 113, 0.25)' : '#333C48'}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
        padding: '10px 12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#282E33';
        e.currentTarget.style.borderColor = isBug ? 'rgba(248, 113, 113, 0.45)' : '#454F59';
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#22272B';
        e.currentTarget.style.borderColor = isBug ? 'rgba(248, 113, 113, 0.25)' : '#333C48';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Type + Key header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '7px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* Type badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              backgroundColor: typeMeta.bg,
              color: typeMeta.color,
              border: `1px solid ${typeMeta.border}`,
            }}
          >
            <IssueTypeIcon type={issue.type} size={10} />
            {typeMeta.label}
          </span>
          {/* Issue key */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#738496',
              fontFamily: 'monospace',
            }}
          >
            {issue.key}
          </span>
        </div>

        {/* Priority icon */}
        <PriorityIcon priority={issue.priority} size={13} />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '13px',
          color: '#F1F2F4',
          lineHeight: 1.45,
          marginBottom: '8px',
          wordBreak: 'break-word',
          fontWeight: 500,
        }}
      >
        {issue.title}
      </div>

      {/* Subtask progress */}
      {issue.subtasks && issue.subtasks.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: '#8C9BAB',
            marginBottom: '7px',
          }}
        >
          <CheckSquare size={11} />
          <span>
            {issue.subtasks.filter((s) => s.completed).length}/{issue.subtasks.length}
          </span>
          <div
            style={{
              flex: 1,
              height: '3px',
              backgroundColor: '#333C48',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(issue.subtasks.filter((s) => s.completed).length / issue.subtasks.length) * 100}%`,
                backgroundColor: '#22A06B',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '8px' }}>
          {issue.labels.slice(0, 2).map((lbl) => (
            <Tag key={lbl} label={lbl} color="default" />
          ))}
          {issue.labels.length > 2 && (
            <span style={{ fontSize: '10px', color: '#9FADBC', alignSelf: 'center' }}>
              +{issue.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: story points + assignee */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {issue.storyPoints !== undefined && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#579DFF',
                backgroundColor: 'rgba(87, 157, 255, 0.12)',
                border: '1px solid rgba(87, 157, 255, 0.25)',
                borderRadius: '3px',
                padding: '1px 5px',
              }}
            >
              {issue.storyPoints} SP
            </span>
          )}
        </div>

        <div>
          {assignees.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {assignees.slice(0, 3).map((u, i) => (
                <div
                  key={u.id}
                  style={{
                    marginLeft: i > 0 ? '-6px' : '0',
                    zIndex: 3 - i,
                  }}
                  title={u.name}
                >
                  <UserAvatar user={u} size="xs" borderColor="#22272B" />
                </div>
              ))}
              {assignees.length > 3 && (
                <div
                  style={{
                    marginLeft: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#333C48',
                    border: '1.5px solid #22272B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#DEE4EA',
                    zIndex: 0,
                  }}
                  title={`+${assignees.length - 3} more assignees`}
                >
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#282E33',
                border: '1px dashed #454F59',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Unassigned"
            >
              <span style={{ fontSize: '9px', color: '#9FADBC' }}>?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
