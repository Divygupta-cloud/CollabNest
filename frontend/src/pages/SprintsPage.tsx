import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Repeat,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Kanban,
  ChevronRight,
  ChevronDown,
  Target,
  Clock,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { Modal } from '../design-system/components/Modal';
import {
  Button,
  Lozenge,
  PriorityIcon,
  IssueTypeIcon,
  Avatar,
  Input,
} from '../design-system/components';
import {
  useProject,
  useSprints,
  useIssues,
  useUsers,
  useCurrentUser,
  sprintService,
} from '../services';
import { Sprint, SprintStatus } from '../types';
import { canManageSprints } from '../utils/permissions';
import { usePermissions } from '../services/rbac';

export const SprintsPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const sprints = useSprints(project?.id || '');
  const allIssues = useIssues(project?.id);
  const users = useUsers();
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<SprintStatus | 'ALL'>('ALL');
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [detailIssueKey, setDetailIssueKey] = useState<string | null>(null);

  const userCanManage = canManageSprints(currentUser);
  const { can } = usePermissions();
  const canCreate = can('CREATE_SPRINT');
  const canStart = can('START_SPRINT');
  const canClose = can('CLOSE_SPRINT');

  // Group issues by sprintId
  const sprintIssuesMap = useMemo(() => {
    const map: Record<string, typeof allIssues> = {};
    sprints.forEach((s) => {
      map[s.id] = allIssues.filter((i) => i.sprintId === s.id);
    });
    return map;
  }, [sprints, allIssues]);

  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const futureSprints = sprints.filter((s) => s.status === 'FUTURE');
  const closedSprints = sprints.filter((s) => s.status === 'CLOSED');

  const displayedSprints = useMemo(() => {
    if (filterStatus === 'ALL') return sprints;
    return sprints.filter((s) => s.status === filterStatus);
  }, [sprints, filterStatus]);

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
    setIsCreateModalOpen(false);
  };

  const handleStartSprint = (sprintId: string) => {
    sprintService.updateSprint(sprintId, { status: 'ACTIVE' });
  };

  const handleCompleteSprint = (sprintId: string) => {
    sprintService.updateSprint(sprintId, { status: 'CLOSED' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ProjectHeaderNav />

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project?.name || projectKey, href: `/projects/${projectKey}/overview` },
            { label: 'Sprints' },
          ]}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderBottom: '1px solid #333C48',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(87, 157, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#579DFF',
                }}
              >
                <Repeat size={18} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Sprint Cycles & Iterations
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '6px' }}>
              Plan, start, and retrospect development sprints for {project?.name}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#22272B',
                borderRadius: '4px',
                border: '1px solid #333C48',
                padding: '2px',
              }}
            >
              {(['ALL', 'ACTIVE', 'FUTURE', 'CLOSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    backgroundColor: filterStatus === st ? '#282E33' : 'transparent',
                    color: filterStatus === st ? '#579DFF' : '#9FADBC',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st === 'ALL'
                    ? `All (${sprints.length})`
                    : st === 'ACTIVE'
                    ? `Active (${activeSprints.length})`
                    : st === 'FUTURE'
                    ? `Future (${futureSprints.length})`
                    : `Completed (${closedSprints.length})`}
                </button>
              ))}
            </div>

            {canCreate ? (
              <Button
                appearance="primary"
                iconBefore={<Plus size={16} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Sprint
              </Button>
            ) : userCanManage ? (
              <div
                title="You can edit sprints but not create them"
                style={{
                  fontSize: '11px',
                  color: '#8C9BAB',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  padding: '6px 10px',
                  borderRadius: '4px',
                }}
              >
                🔒 Manager/Admin Only
              </div>
            ) : (
              <div
                title="Only Managers and Admins can create sprints"
                style={{
                  fontSize: '11px',
                  color: '#8C9BAB',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  padding: '6px 10px',
                  borderRadius: '4px',
                }}
              >
                🔒 Manager/Admin Only
              </div>
            )}
          </div>
        </div>

        {/* Sprint Cards List */}
        {displayedSprints.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
            }}
          >
            <Repeat size={36} color="#8C9BAB" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: '0 0 6px 0' }}>
              No Sprints found
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', maxWidth: '420px', margin: '0 auto 16px auto' }}>
              No sprints currently match the selected filter.
            </p>
            {userCanManage && (
              <Button
                appearance="primary"
                iconBefore={<Plus size={14} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Sprint
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {displayedSprints.map((sprint) => {
              const sprintIssues = sprintIssuesMap[sprint.id] || [];
              const totalIssues = sprintIssues.length;
              const doneIssues = sprintIssues.filter((i) => i.status === 'DONE').length;
              const inProgressIssues = sprintIssues.filter(
                (i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW'
              ).length;
              const todoIssues = sprintIssues.filter(
                (i) => i.status === 'TODO' || i.status === 'BACKLOG'
              ).length;
              const totalPts = sprintIssues.reduce(
                (acc, curr) => acc + (curr.storyPoints || 0),
                0
              );
              const progressPct =
                totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
              const isExpanded = expandedSprintId === sprint.id;

              return (
                <div
                  key={sprint.id}
                  style={{
                    backgroundColor: '#22272B',
                    border: `1px solid ${sprint.status === 'ACTIVE' ? '#579DFF' : '#333C48'}`,
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow:
                      sprint.status === 'ACTIVE'
                        ? '0 0 0 1px rgba(87, 157, 255, 0.25)'
                        : 'none',
                  }}
                >
                  {/* Sprint Card Header */}
                  <div
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor:
                        sprint.status === 'ACTIVE'
                          ? 'rgba(87, 157, 255, 0.04)'
                          : '#22272B',
                      borderBottom: isExpanded ? '1px solid #333C48' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <button
                        onClick={() =>
                          setExpandedSprintId(isExpanded ? null : sprint.id)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9FADBC',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#F1F2F4',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              setExpandedSprintId(isExpanded ? null : sprint.id)
                            }
                          >
                            {sprint.name}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '3px',
                              backgroundColor:
                                sprint.status === 'ACTIVE'
                                  ? 'rgba(34, 160, 107, 0.2)'
                                  : sprint.status === 'FUTURE'
                                  ? 'rgba(87, 157, 255, 0.15)'
                                  : 'rgba(140, 155, 171, 0.15)',
                              color:
                                sprint.status === 'ACTIVE'
                                  ? '#4BCE97'
                                  : sprint.status === 'FUTURE'
                                  ? '#579DFF'
                                  : '#8C9BAB',
                            }}
                          >
                            {sprint.status}
                          </span>
                        </div>

                        {sprint.goal && (
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#9FADBC',
                              marginTop: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Target size={13} color="#8C9BAB" />
                            <span>{sprint.goal}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates & Metrics */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      {(sprint.startDate || sprint.endDate) && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#9FADBC',
                          }}
                        >
                          <Calendar size={14} color="#8C9BAB" />
                          <span>
                            {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'N/A'} -{' '}
                            {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div style={{ width: '140px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#9FADBC',
                            marginBottom: '4px',
                          }}
                        >
                          <span>
                            {doneIssues}/{totalIssues} issues
                          </span>
                          <span style={{ fontWeight: 600, color: '#4BCE97' }}>
                            {progressPct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            backgroundColor: '#1D2125',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            display: 'flex',
                          }}
                        >
                          <div style={{ width: `${progressPct}%`, backgroundColor: '#4BCE97' }} />
                          <div
                            style={{
                              width: `${totalIssues > 0 ? (inProgressIssues / totalIssues) * 100 : 0}%`,
                              backgroundColor: '#579DFF',
                            }}
                          />
                        </div>
                      </div>

                      {/* Story points pill */}
                      <div
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#1D2125',
                          border: '1px solid #333C48',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#F1F2F4',
                          fontWeight: 600,
                        }}
                      >
                        {totalPts} SP
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {sprint.status === 'ACTIVE' && (
                          <>
                            <Button
                              appearance="primary"
                              spacing="compact"
                              iconBefore={<Kanban size={14} />}
                              onClick={() => navigate(`/projects/${projectKey}/board`)}
                            >
                              View Board
                            </Button>
                            {userCanManage && (
                              <Button
                                appearance="subtle"
                                spacing="compact"
                                iconBefore={<CheckCircle2 size={14} color="#4BCE97" />}
                                onClick={() => handleCompleteSprint(sprint.id)}
                              >
                                Complete Sprint
                              </Button>
                            )}
                          </>
                        )}

                        {sprint.status === 'FUTURE' && (
                          <>
                            {userCanManage && (
                              <Button
                                appearance="default"
                                spacing="compact"
                                iconBefore={<Play size={12} />}
                                onClick={() => handleStartSprint(sprint.id)}
                              >
                                Start Sprint
                              </Button>
                            )}
                            <Button
                              appearance="subtle"
                              spacing="compact"
                              onClick={() => navigate(`/projects/${projectKey}/backlog`)}
                            >
                              Plan in Backlog
                            </Button>
                          </>
                        )}

                        {sprint.status === 'CLOSED' && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#4BCE97',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Issues in Sprint */}
                  {isExpanded && (
                    <div style={{ backgroundColor: '#1D2125', padding: '16px 20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                          Committed Sprint Issues ({totalIssues})
                        </span>
                        <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                          {todoIssues} To Do • {inProgressIssues} In Progress • {doneIssues} Done
                        </span>
                      </div>

                      {sprintIssues.length === 0 ? (
                        <div
                          style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#738496',
                            fontSize: '13px',
                            backgroundColor: '#22272B',
                            borderRadius: '4px',
                          }}
                        >
                          No issues currently in this sprint. Use Backlog planning to drag issues into this sprint.
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: '#22272B',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid #333C48',
                          }}
                        >
                          {sprintIssues.map((issue) => {
                            const assignee = users.find((u) => u.id === issue.assigneeId);
                            return (
                              <div
                                key={issue.id}
                                onClick={() => setDetailIssueKey(issue.key)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '8px 14px',
                                  borderBottom: '1px solid #282E33',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = '#282E33')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = 'transparent')
                                }
                              >
                                <IssueTypeIcon type={issue.type} size={15} />
                                <span style={{ fontWeight: 600, color: '#579DFF', width: '80px' }}>
                                  {issue.key}
                                </span>
                                <span style={{ flex: 1, color: '#F1F2F4' }}>{issue.title}</span>
                                <Lozenge status={issue.status} />
                                <PriorityIcon priority={issue.priority} size={14} />
                                {issue.storyPoints !== undefined && (
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#282E33',
                                      color: '#9FADBC',
                                      padding: '1px 6px',
                                      borderRadius: '3px',
                                    }}
                                  >
                                    {issue.storyPoints} SP
                                  </span>
                                )}
                                {assignee && (
                                  <Avatar name={assignee.name} src={assignee.avatarUrl} size="xsmall" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Sprint Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Sprint"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <Button appearance="subtle" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleCreateSprint}>
                Create Sprint
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSprint} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                Sprint Name <span style={{ color: '#F87171' }}>*</span>
              </label>
              <Input
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="e.g. Sprint 15 - Payment Gateway"
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                Sprint Goal
              </label>
              <textarea
                value={newSprintGoal}
                onChange={(e) => setNewSprintGoal(e.target.value)}
                placeholder="What is the objective of this sprint?"
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  borderRadius: '3px',
                  padding: '8px 10px',
                  color: '#F1F2F4',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </form>
        </Modal>
      )}

      {detailIssueKey && (
        <IssueDetailModal
          issueKey={detailIssueKey}
          onClose={() => setDetailIssueKey(null)}
        />
      )}
    </div>
  );
};
