import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Play,
  CheckCircle,
  Layers,
  Filter,
  X,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import {
  Button,
  Lozenge,
  IssueTypeIcon,
  PriorityIcon,
  Avatar,
  Badge,
  Modal,
  Input,
} from '../design-system/components';
import {
  useProject,
  useIssues,
  useSprints,
  useUsers,
  useCurrentUser,
  issueService,
  sprintService,
} from '../services';
import { Issue } from '../types';
import { canCreateEpic, canManageSprints } from '../utils/permissions';

export const BacklogPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const issues = useIssues(project?.id);
  const sprints = useSprints(project?.id || '');
  const users = useUsers();
  const currentUser = useCurrentUser();

  const userCanCreateEpic = canCreateEpic(currentUser);
  const userCanManageSprints = canManageSprints(currentUser);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeIssueKey = searchParams.get('issue');

  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [targetSprintForCreate, setTargetSprintForCreate] = useState<string | null>(null);
  const [createDefaultType, setCreateDefaultType] = useState<any>('STORY');

  // Epic Panel State
  const [isEpicPanelOpen, setIsEpicPanelOpen] = useState(true);
  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string | null>(null);

  // Collapsed sections tracking
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

  const toggleSprintCollapse = (id: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Epics in this project
  const epics = useMemo(() => {
    return issues.filter((i) => i.type === 'EPIC');
  }, [issues]);

  // Filtered issues based on selected Epic
  const filteredIssues = useMemo(() => {
    if (!selectedEpicFilter) return issues;
    return issues.filter(
      (i) => i.epicId === selectedEpicFilter || i.key === selectedEpicFilter || i.id === selectedEpicFilter
    );
  }, [issues, selectedEpicFilter]);

  // Group issues by sprint
  const sprintIssuesMap = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    sprints.forEach((s) => (map[s.id] = []));
    map['backlog'] = [];

    filteredIssues.forEach((i) => {
      if (i.type === 'EPIC') return; // Epics are managed in Epic panel / Epics page
      if (i.sprintId && map[i.sprintId]) {
        map[i.sprintId].push(i);
      } else {
        map['backlog'].push(i);
      }
    });

    return map;
  }, [sprints, filteredIssues]);

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim() || !project) return;
    sprintService.createSprint({
      projectId: project.id,
      name: newSprintName.trim(),
      goal: newSprintGoal.trim(),
      status: 'FUTURE',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setNewSprintName('');
    setNewSprintGoal('');
    setIsCreateSprintModalOpen(false);
  };

  const handleDropToSprint = (e: React.DragEvent, sprintId: string | null) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId) {
      issueService.moveIssueSprint(issueId, sprintId);
    }
  };

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    e.dataTransfer.setData('text/plain', issue.id);
  };

  const handleOpenCreateIssue = (sprintId: string | null, type = 'STORY') => {
    setTargetSprintForCreate(sprintId);
    setCreateDefaultType(type);
    setIsCreateIssueModalOpen(true);
  };

  const renderIssueRow = (issue: Issue) => {
    const assignee = users.find((u) => u.id === issue.assigneeId);
    const issueEpic = epics.find((e) => e.id === issue.epicId || e.key === issue.epicId);

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(e) => handleDragStart(e, issue)}
        onClick={() =>
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('issue', issue.key);
            return next;
          })
        }
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 14px',
          backgroundColor: '#22272B',
          borderBottom: '1px solid #282E33',
          cursor: 'pointer',
          transition: 'background-color 0.1s ease',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22272B')}
      >
        <IssueTypeIcon type={issue.type} size={16} />
        <span style={{ fontWeight: 600, color: '#579DFF', width: '75px', flexShrink: 0 }}>
          {issue.key}
        </span>
        <span
          style={{
            flex: 1,
            color: '#F1F2F4',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {issue.title}
        </span>

        {/* Epic Badge if linked */}
        {issueEpic && (
          <span
            style={{
              backgroundColor: 'rgba(135, 119, 217, 0.2)',
              color: '#8777D9',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ⚡ {issueEpic.key}
          </span>
        )}

        <Lozenge status={issue.status} isCompact />
        <PriorityIcon priority={issue.priority} size={14} />
        {issue.storyPoints !== undefined && (
          <Badge appearance="default">{issue.storyPoints}</Badge>
        )}
        {assignee ? (
          <Avatar name={assignee.name} src={assignee.avatarUrl} size="xsmall" />
        ) : (
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#282E33',
              border: '1px solid #333C48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: '#9FADBC',
              fontWeight: 700,
            }}
          >
            ?
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#161A1D',
      }}
    >
      {/* Project Navigation Header */}
      {project ? (
        <ProjectHeaderNav
          project={project}
          activeTab="backlog"
          onOpenCreateModal={() => handleOpenCreateIssue(null)}
        />
      ) : (
        <div style={{ padding: '16px 32px 0 32px' }}>
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: projectKey, href: `/projects/${projectKey}/board` },
              { label: 'Backlog' },
            ]}
          />
        </div>
      )}

      {/* Main Content Layout with optional Left Epic Panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Collapsible Left Epic Panel */}
        {isEpicPanelOpen && (
          <div
            style={{
              width: '260px',
              backgroundColor: '#1D2125',
              borderRight: '1px solid #333C48',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Epic Panel Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #333C48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#8777D9" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F2F4' }}>
                  EPICS ({epics.length})
                </span>
              </div>
              {userCanCreateEpic && (
                <button
                  onClick={() => handleOpenCreateIssue(null, 'EPIC')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Create Epic"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Filter Reset if Epic selected */}
            {selectedEpicFilter && (
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(87, 157, 255, 0.1)',
                  borderBottom: '1px solid #333C48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#579DFF', fontWeight: 600 }}>Filtering by Epic</span>
                <button
                  onClick={() => setSelectedEpicFilter(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9FADBC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Epics List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {epics.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#738496', fontSize: '12px' }}>
                  No epics defined yet.
                </div>
              ) : (
                epics.map((ep) => {
                  const childCount = issues.filter(
                    (i) => i.epicId === ep.id || i.epicId === ep.key
                  ).length;
                  const doneCount = issues.filter(
                    (i) => (i.epicId === ep.id || i.epicId === ep.key) && i.status === 'DONE'
                  ).length;
                  const progressPct = childCount > 0 ? Math.round((doneCount / childCount) * 100) : 0;
                  const isSelected = selectedEpicFilter === ep.id || selectedEpicFilter === ep.key;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => setSelectedEpicFilter(isSelected ? null : ep.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(135, 119, 217, 0.2)' : '#22272B',
                        border: isSelected ? '1px solid #8777D9' : '1px solid #333C48',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#282E33';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#22272B';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#8777D9' }}>
                          ⚡ {ep.key}
                        </span>
                        <span style={{ fontSize: '11px', color: '#8C9BAB' }}>
                          {doneCount}/{childCount} done
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#F1F2F4',
                          fontWeight: 500,
                          marginBottom: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ep.title}
                      </div>
                      {/* Mini Progress Bar */}
                      <div style={{ height: '4px', backgroundColor: '#333C48', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            backgroundColor: progressPct === 100 ? '#36B37E' : '#8777D9',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Area: Backlog and Sprints */}
        <div style={{ flex: 1, padding: '20px 32px', overflowY: 'auto' }}>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                appearance="subtle"
                spacing="compact"
                iconBefore={<Layers size={14} color="#8777D9" />}
                onClick={() => setIsEpicPanelOpen(!isEpicPanelOpen)}
              >
                {isEpicPanelOpen ? 'Hide Epics' : 'Show Epics'}
              </Button>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                {project?.name || projectKey} Backlog
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {userCanManageSprints && (
                <Button
                  appearance="default"
                  iconBefore={<Plus size={16} />}
                  onClick={() => setIsCreateSprintModalOpen(true)}
                >
                  Create Sprint
                </Button>
              )}
              <Button
                appearance="primary"
                iconBefore={<Plus size={16} />}
                onClick={() => handleOpenCreateIssue(null)}
              >
                Create Issue
              </Button>
            </div>
          </div>

          {/* Sprints Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sprints.map((sprint) => {
              const sprintIssues = sprintIssuesMap[sprint.id] || [];
              const isCollapsed = collapsedSprints[sprint.id];
              const totalPts = sprintIssues.reduce(
                (acc, curr) => acc + (curr.storyPoints || 0),
                0
              );

              return (
                <div
                  key={sprint.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#579DFF';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333C48';
                  }}
                  onDrop={(e) => {
                    e.currentTarget.style.borderColor = '#333C48';
                    handleDropToSprint(e, sprint.id);
                  }}
                  style={{
                    backgroundColor: '#1D2125',
                    border: '1px solid #333C48',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Sprint Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#22272B',
                      borderBottom: isCollapsed ? 'none' : '1px solid #333C48',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => toggleSprintCollapse(sprint.id)}
                    >
                      {isCollapsed ? <ChevronRight size={18} color="#9FADBC" /> : <ChevronDown size={18} color="#9FADBC" />}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4' }}>
                        {sprint.name}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: sprint.status === 'ACTIVE' ? 'rgba(34, 160, 107, 0.2)' : '#282E33',
                          color: sprint.status === 'ACTIVE' ? '#4BCE97' : '#9FADBC',
                        }}
                      >
                        {sprint.status}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                        ({sprintIssues.length} issues • {totalPts} pts)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {userCanManageSprints && sprint.status === 'FUTURE' && (
                        <Button
                          appearance="default"
                          spacing="compact"
                          iconBefore={<Play size={12} />}
                          onClick={() =>
                            sprintService.updateSprint(sprint.id, { status: 'ACTIVE' })
                          }
                        >
                          Start Sprint
                        </Button>
                      )}
                      {userCanManageSprints && sprint.status === 'ACTIVE' && (
                        <Button
                          appearance="subtle"
                          spacing="compact"
                          iconBefore={<CheckCircle size={14} color="#22A06B" />}
                          onClick={() =>
                            sprintService.updateSprint(sprint.id, { status: 'CLOSED' })
                          }
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        iconBefore={<Plus size={14} />}
                        onClick={() => handleOpenCreateIssue(sprint.id)}
                      >
                        Add issue
                      </Button>
                    </div>
                  </div>

                  {/* Sprint Issues List */}
                  {!isCollapsed && (
                    <div>
                      {sprintIssues.length === 0 ? (
                        <div
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#738496',
                            fontSize: '13px',
                            fontStyle: 'italic',
                          }}
                        >
                          Drag issues here from the backlog to plan this sprint.
                        </div>
                      ) : (
                        sprintIssues.map(renderIssueRow)
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Backlog Pool (Unassigned to Sprints) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#579DFF';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#333C48';
              }}
              onDrop={(e) => {
                e.currentTarget.style.borderColor = '#333C48';
                handleDropToSprint(e, null);
              }}
              style={{
                backgroundColor: '#1D2125',
                border: '1px solid #333C48',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Backlog Header */}
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#22272B',
                  borderBottom: '1px solid #333C48',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4' }}>
                    Backlog
                  </span>
                  <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                    ({sprintIssuesMap['backlog']?.length || 0} issues)
                  </span>
                </div>

                <Button
                  appearance="subtle"
                  spacing="compact"
                  iconBefore={<Plus size={14} />}
                  onClick={() => handleOpenCreateIssue(null)}
                >
                  Create issue
                </Button>
              </div>

              {/* Backlog Issues List */}
              <div>
                {(!sprintIssuesMap['backlog'] || sprintIssuesMap['backlog'].length === 0) ? (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#738496',
                      fontSize: '13px',
                      fontStyle: 'italic',
                    }}
                  >
                    No issues currently in the backlog.
                  </div>
                ) : (
                  sprintIssuesMap['backlog'].map(renderIssueRow)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreateSprintModalOpen}
        onClose={() => setIsCreateSprintModalOpen(false)}
        title="Create Sprint"
        footer={
          <>
            <Button appearance="subtle" onClick={() => setIsCreateSprintModalOpen(false)}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleCreateSprint}>
              Create Sprint
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSprint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Sprint Name <span style={{ color: '#F87171' }}>*</span>
            </label>
            <Input
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              placeholder="e.g. CRM Sprint 16"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Sprint Goal
            </label>
            <Input
              value={newSprintGoal}
              onChange={(e) => setNewSprintGoal(e.target.value)}
              placeholder="What is the objective of this sprint?"
            />
          </div>
        </form>
      </Modal>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        defaultProjectId={project?.id}
        defaultSprintId={targetSprintForCreate}
        defaultType={createDefaultType}
      />

      {/* Issue Detail View Modal */}
      <IssueDetailModal
        issueKey={activeIssueKey}
        onClose={() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('issue');
            return next;
          });
        }}
      />
    </div>
  );
};
