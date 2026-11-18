import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Plus, CheckCircle2, FlaskConical, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { BoardFilters } from '../components/board/BoardFilters';
import { KanbanColumn } from '../components/board/KanbanColumn';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { Button } from '../design-system/components';
import {
  useProject,
  useIssues,
  useSprints,
  useUsers,
  useCurrentUser,
  issueService,
} from '../services';
import { usePermissions } from '../services/rbac';
import { Issue, IssueStatus, IssueType, IssuePriority } from '../types';
import { BOARD_COLUMNS, isValidTransition } from '../services/workflow';
import { can } from '../services/rbac';
import { PermissionGuard } from '../components/common/PermissionGuard';

export const BoardPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const issues = useIssues(project?.id);
  const sprints = useSprints(project?.id || '');
  const users = useUsers();
  const currentUser = useCurrentUser();
  const { can: userCan } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeIssueKey = searchParams.get('issue');

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE') || sprints[0];

  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<IssueType[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<IssuePriority[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [draggingIssue, setDraggingIssue] = useState<Issue | null>(null);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<IssueStatus>('TODO');

  // ── Derived data ────────────────────────────────────────────────────────────
  const sprintIssues = useMemo(
    () =>
      issues.filter(
        (i) =>
          // Show issues on the active sprint (or all if no active sprint)
          !activeSprint || !i.sprintId || i.sprintId === activeSprint.id
      ),
    [issues, activeSprint]
  );

  // Epics for this project (for filter dropdown)
  const epics = useMemo(
    () => issues.filter((i) => i.type === 'EPIC' && i.projectId === project?.id),
    [issues, project]
  );

  // All unique labels
  const allLabels = useMemo(() => {
    const labelSet = new Set<string>();
    sprintIssues.forEach((i) => (i.labels || []).forEach((l) => labelSet.add(l)));
    return Array.from(labelSet).sort();
  }, [sprintIssues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return sprintIssues.filter((issue) => {
      // Never show plain EPICs on the board
      if (issue.type === 'EPIC') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !issue.key.toLowerCase().includes(q) &&
          !issue.title.toLowerCase().includes(q)
        )
          return false;
      }
      const issueAssigneeList = issue.assigneeIds && issue.assigneeIds.length > 0
        ? issue.assigneeIds
        : issue.assigneeId
        ? [issue.assigneeId]
        : [];
      if (selectedAssigneeIds.length > 0 && !selectedAssigneeIds.some((id) => issueAssigneeList.includes(id)))
        return false;
      if (onlyMyIssues && !issueAssigneeList.includes(currentUser.id)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(issue.type)) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(issue.priority))
        return false;
      if (selectedEpicId && issue.epicId !== selectedEpicId) return false;
      if (selectedLabel && !(issue.labels ?? []).includes(selectedLabel)) return false;

      return true;
    });
  }, [
    sprintIssues,
    searchQuery,
    selectedAssigneeIds,
    onlyMyIssues,
    selectedTypes,
    selectedPriorities,
    selectedEpicId,
    selectedLabel,
    currentUser.id,
  ]);

  // Group issues by column status
  const columnIssues = useMemo(() => {
    const map: Record<IssueStatus, Issue[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      QA_TESTING: [],
      DONE: [],
      CANCELLED: [],
    };
    filteredIssues.forEach((i) => {
      const col = i.status in map ? i.status : 'TODO';
      map[col].push(i);
    });
    // Sort each column by order
    Object.keys(map).forEach((k) => {
      map[k as IssueStatus].sort((a, b) => a.order - b.order);
    });
    return map;
  }, [filteredIssues]);

  // ── Event handlers ──────────────────────────────────────────────────────────

  const handleToggleAssignee = (id: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleType = (type: IssueType | 'ALL') => {
    if (type === 'ALL') {
      setSelectedTypes([]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
    );
  };

  const handleTogglePriority = (priority: IssuePriority | 'ALL') => {
    if (priority === 'ALL') {
      setSelectedPriorities([]);
      return;
    }
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((x) => x !== priority) : [...prev, priority]
    );
  };

  const handleDropIssue = useCallback(
    (issueId: string, newStatus: IssueStatus) => {
      const issue = issues.find((i) => i.id === issueId);
      if (!issue) return;

      // Validate the transition (bypass for Admin/Manager/TL who have EDIT_ANY_ISSUE)
      const bypass = userCan('EDIT_ANY_ISSUE');
      if (!isValidTransition(issue.type, issue.status, newStatus, bypass)) {
        // Silently reject — column already shows visual feedback
        return;
      }

      issueService.moveIssueStatus(issueId, newStatus);
      setDraggingIssue(null);
    },
    [issues, userCan]
  );

  const handleDragStart = useCallback((issue: Issue) => {
    setDraggingIssue(issue);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingIssue(null);
  }, []);

  const handleCardClick = (issue: Issue) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('issue', issue.key);
      return next;
    });
  };

  const handleCloseDetailModal = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('issue');
      return next;
    });
  };

  const handleQuickCreate = (status: IssueStatus) => {
    setCreateInitialStatus(status);
    setIsCreateModalOpen(true);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedAssigneeIds.length ||
      onlyMyIssues ||
      selectedTypes.length ||
      selectedPriorities.length ||
      selectedEpicId ||
      selectedLabel
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAssigneeIds([]);
    setOnlyMyIssues(false);
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedEpicId(null);
    setSelectedLabel(null);
  };

  // ── Sprint summary stats ────────────────────────────────────────────────────
  const totalIssues = filteredIssues.length;
  const doneIssues = filteredIssues.filter((i) => i.status === 'DONE').length;
  const totalPoints = sprintIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
  const donePoints = sprintIssues
    .filter((i) => i.status === 'DONE')
    .reduce((s, i) => s + (i.storyPoints ?? 0), 0);
  const progressPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#161A1D',
      }}
      onDragEnd={handleDragEnd}
    >
      {/* Project Navigation Header */}
      {project ? (
        <ProjectHeaderNav
          project={project}
          activeTab="board"
          onOpenCreateModal={() => handleQuickCreate('TODO')}
        />
      ) : (
        <div style={{ padding: '16px 32px 0 32px' }}>
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: projectKey, href: `/projects/${projectKey}/board` },
              { label: 'Sprint Board' },
            ]}
          />
        </div>
      )}

      {/* Main Board Container */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          gap: '0',
        }}
      >
        {/* Board Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F2F4', margin: 0 }}>
                {project?.name || projectKey} — Sprint Board
              </h1>
              {activeSprint && (
                <span
                  style={{
                    backgroundColor: 'rgba(87, 157, 255, 0.15)',
                    color: '#579DFF',
                    border: '1px solid rgba(87, 157, 255, 0.3)',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                  }}
                >
                  {activeSprint.name}
                </span>
              )}
            </div>

            {/* Sprint progress bar */}
            {activeSprint && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    width: '200px',
                    height: '4px',
                    backgroundColor: '#333C48',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #22A06B, #57D9A3)',
                      borderRadius: '2px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#9FADBC', fontWeight: 600 }}>
                  {doneIssues}/{totalIssues} issues · {donePoints}/{totalPoints} SP · {progressPct}%
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <PermissionGuard permission="CREATE_ISSUE">
              <Button
                appearance="primary"
                iconBefore={<Plus size={15} />}
                onClick={() => handleQuickCreate('TODO')}
                spacing="compact"
              >
                Create Issue
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="CLOSE_SPRINT">
              <Button
                appearance="subtle"
                iconBefore={<CheckCircle2 size={15} color="#22A06B" />}
                spacing="compact"
                title="Complete sprint"
                onClick={() => alert('Sprint completion flow — coming soon!')}
              >
                Complete Sprint
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Filter Bar */}
        <BoardFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedAssigneeIds={selectedAssigneeIds}
          onAssigneeSelect={handleToggleAssignee}
          selectedTypes={selectedTypes}
          onTypeSelect={handleToggleType}
          selectedPriorities={selectedPriorities}
          onPrioritySelect={handleTogglePriority}
          selectedEpicId={selectedEpicId}
          onEpicSelect={setSelectedEpicId}
          selectedLabel={selectedLabel}
          onLabelSelect={setSelectedLabel}
          onlyMyIssues={onlyMyIssues}
          onToggleOnlyMyIssues={() => setOnlyMyIssues(!onlyMyIssues)}
          users={users}
          epics={epics}
          allLabels={allLabels}
          currentUserId={currentUser.id}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Kanban Columns */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '8px',
          }}
        >
          {BOARD_COLUMNS.map(({ status, label }) => (
            <KanbanColumn
              key={status}
              title={label}
              status={status}
              issues={columnIssues[status] ?? []}
              onCardClick={handleCardClick}
              onDropIssue={handleDropIssue}
              onQuickCreate={userCan('CREATE_ISSUE') ? handleQuickCreate : undefined}
              draggingIssue={draggingIssue}
              onDragStartIssue={handleDragStart}
              onDragEndIssue={handleDragEnd}
            />
          ))}
        </div>

        {/* QA Role — contextual action panel for QA_TESTING column */}
        {currentUser.role === 'QA' && columnIssues.QA_TESTING?.length > 0 && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px 16px',
              backgroundColor: 'rgba(251, 191, 36, 0.07)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <FlaskConical size={16} color="#FBBF24" />
            <span style={{ fontSize: '13px', color: '#FBBF24', fontWeight: 600 }}>
              QA Testing ({columnIssues.QA_TESTING.length} issue
              {columnIssues.QA_TESTING.length !== 1 ? 's' : ''} awaiting review)
            </span>
            <span style={{ fontSize: '12px', color: '#9FADBC' }}>
              Click a card to open, then mark pass or reject
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {columnIssues.QA_TESTING.slice(0, 3).map((issue) => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => issueService.moveIssueStatus(issue.id, 'DONE')}
                    title={`Pass: ${issue.key}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '3px',
                      border: '1px solid rgba(34, 160, 107, 0.4)',
                      backgroundColor: 'rgba(34, 160, 107, 0.12)',
                      color: '#22A06B',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ThumbsUp size={12} /> {issue.key} Pass
                  </button>
                  <button
                    onClick={() => issueService.moveIssueStatus(issue.id, 'IN_PROGRESS')}
                    title={`Reject: ${issue.key}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '3px',
                      border: '1px solid rgba(248, 113, 113, 0.4)',
                      backgroundColor: 'rgba(248, 113, 113, 0.12)',
                      color: '#F87171',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ThumbsDown size={12} /> Reject
                  </button>
                </div>
              ))}
              {columnIssues.QA_TESTING.length > 3 && (
                <span style={{ fontSize: '12px', color: '#738496', alignSelf: 'center' }}>
                  +{columnIssues.QA_TESTING.length - 3} more — open detail to review
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal issueKey={activeIssueKey} onClose={handleCloseDetailModal} />

      {/* Quick Create Modal */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultProjectId={project?.id}
        defaultSprintId={activeSprint?.id}
      />
    </div>
  );
};
