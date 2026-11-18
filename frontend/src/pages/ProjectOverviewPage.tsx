import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Kanban,
  ListTodo,
  Calendar,
  Layers,
  Zap,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import {
  Button,
  Avatar,
  Lozenge,
  PriorityIcon,
  IssueTypeIcon,
} from '../design-system/components';
import {
  useProject,
  useIssues,
  useSprints,
  useUsers,
  useActivities,
  useCurrentUser,
} from '../services';
import { Issue } from '../types';
import { canCreateEpic, getRoleBadge } from '../utils/permissions';

export const ProjectOverviewPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const issues = useIssues(project?.id);
  const sprints = useSprints(project?.id || '');
  const users = useUsers();
  const activities = useActivities();
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailIssueKey, setDetailIssueKey] = useState<string | null>(null);

  // Issues breakdown
  const total = issues.length;
  const doneCount = issues.filter((i) => i.status === 'DONE').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const inReviewCount = issues.filter((i) => i.status === 'IN_REVIEW').length;
  const todoCount = issues.filter((i) => i.status === 'TODO' || i.status === 'BACKLOG').length;
  const blockedCount = issues.filter(
    (i) => i.status === 'CANCELLED' || i.priority === 'HIGHEST'
  ).length;

  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Active Sprint
  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === 'ACTIVE') || sprints[0];
  }, [sprints]);

  const activeSprintIssues = useMemo(() => {
    if (!activeSprint) return [];
    return issues.filter((i) => i.sprintId === activeSprint.id);
  }, [activeSprint, issues]);

  const activeSprintTotal = activeSprintIssues.length;
  const activeSprintDone = activeSprintIssues.filter((i) => i.status === 'DONE').length;
  const activeSprintInProgress = activeSprintIssues.filter(
    (i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW'
  ).length;
  const activeSprintTodo = activeSprintIssues.filter(
    (i) => i.status === 'TODO' || i.status === 'BACKLOG'
  ).length;
  const activeSprintProgress =
    activeSprintTotal > 0 ? Math.round((activeSprintDone / activeSprintTotal) * 100) : 0;

  // Epics in this project
  const epics = useMemo(() => {
    return issues.filter((i) => i.type === 'EPIC');
  }, [issues]);

  // Child issues count for each epic
  const epicsWithProgress = useMemo(() => {
    return epics.map((epic) => {
      const children = issues.filter((i) => i.epicId === epic.id || i.epicId === epic.key);
      const childTotal = children.length;
      const childDone = children.filter((c) => c.status === 'DONE').length;
      const childInProgress = children.filter(
        (c) => c.status === 'IN_PROGRESS' || c.status === 'IN_REVIEW'
      ).length;
      const progress = childTotal > 0 ? Math.round((childDone / childTotal) * 100) : 0;
      return {
        ...epic,
        childrenCount: childTotal,
        completedCount: childDone,
        inProgressCount: childInProgress,
        progressPct: progress,
      };
    });
  }, [epics, issues]);

  // Project Lead
  const lead = users.find((u) => u.id === project?.leadId);

  // Recent Activity for this project
  const projectActivities = useMemo(() => {
    return activities
      .filter((a) => a.issueKey && a.issueKey.startsWith(`${projectKey}-`))
      .slice(0, 7);
  }, [activities, projectKey]);

  // Compact Squad Summary
  const teamMemberIds = useMemo(() => {
    const ids = new Set<string>();
    if (project?.leadId) ids.add(project.leadId);
    issues.forEach((i) => {
      if (i.assigneeId) ids.add(i.assigneeId);
    });
    return Array.from(ids);
  }, [project, issues]);

  const squadMembers = useMemo(() => {
    return users.filter((u) => teamMemberIds.includes(u.id));
  }, [users, teamMemberIds]);

  const devMembers = squadMembers.filter((u) => u.role === 'DEVELOPER' && u.id !== project?.leadId);
  const qaMembers = squadMembers.filter((u) => u.role === 'QA');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ProjectHeaderNav />

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project?.name || projectKey, href: `/projects/${projectKey}/overview` },
            { label: 'Overview' },
          ]}
        />

        {/* 1. Project Banner Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: '1px solid #333C48',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                backgroundColor: project?.iconBgColor || '#0C66E4',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              {project?.key || 'PRJ'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                  {project?.name}
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(87, 157, 255, 0.15)',
                    color: '#579DFF',
                    border: '1px solid rgba(87, 157, 255, 0.3)',
                  }}
                >
                  {project?.key}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(34, 160, 107, 0.15)',
                    color: '#4BCE97',
                  }}
                >
                  Active
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px', maxWidth: '720px' }}>
                {project?.description}
              </p>
              {lead && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#8C9BAB' }}>
                  <span>Project Lead:</span>
                  <Avatar name={lead.name} src={lead.avatarUrl} size="xsmall" />
                  <span style={{ color: '#F1F2F4', fontWeight: 600 }}>{lead.name}</span>
                  <span>({lead.title})</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              appearance="primary"
              iconBefore={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Issue
            </Button>
            <Button
              appearance="default"
              iconBefore={<Settings size={15} />}
              onClick={() => navigate(`/projects/${projectKey}/settings`)}
            >
              Project Settings
            </Button>
          </div>
        </div>

        {/* 2. PROJECT SUMMARY (KPI CARDS) */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#8C9BAB', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.04em' }}>
            Project Summary & Metrics
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Total Issues */}
            <div style={{ padding: '16px 18px', backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#8C9BAB' }}>Total Issues</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#F1F2F4', marginTop: '4px' }}>
                {total}
              </div>
              <div style={{ fontSize: '11px', color: '#9FADBC', marginTop: '2px' }}>Project backlog & board</div>
            </div>

            {/* To Do / Open */}
            <div style={{ padding: '16px 18px', backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#8C9BAB' }}>To Do (Open)</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#8C9BAB', marginTop: '4px' }}>
                {todoCount}
              </div>
              <div style={{ fontSize: '11px', color: '#738496', marginTop: '2px' }}>Pending execution</div>
            </div>

            {/* In Progress */}
            <div style={{ padding: '16px 18px', backgroundColor: 'rgba(87, 157, 255, 0.08)', border: '1px solid rgba(87, 157, 255, 0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#579DFF' }}>In Progress</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#579DFF', marginTop: '4px' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '11px', color: '#579DFF', marginTop: '2px' }}>Active engineering</div>
            </div>

            {/* In Review */}
            <div style={{ padding: '16px 18px', backgroundColor: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#C084FC' }}>In Review</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#C084FC', marginTop: '4px' }}>
                {inReviewCount}
              </div>
              <div style={{ fontSize: '11px', color: '#C084FC', marginTop: '2px' }}>QA & Code Review</div>
            </div>

            {/* Done */}
            <div style={{ padding: '16px 18px', backgroundColor: 'rgba(34, 160, 107, 0.08)', border: '1px solid rgba(34, 160, 107, 0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#4BCE97' }}>Done</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#4BCE97', marginTop: '4px' }}>
                {doneCount}
              </div>
              <div style={{ fontSize: '11px', color: '#4BCE97', marginTop: '2px' }}>{completionRate}% delivered</div>
            </div>

            {/* Blocked / Critical */}
            <div style={{ padding: '16px 18px', backgroundColor: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#F87171' }}>Blocked / Highest</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#F87171', marginTop: '4px' }}>
                {blockedCount}
              </div>
              <div style={{ fontSize: '11px', color: '#F87171', marginTop: '2px' }}>Urgent attention</div>
            </div>
          </div>
        </div>

        {/* 3. SPRINT OVERVIEW */}
        {activeSprint && (
          <div
            style={{
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
              padding: '20px 24px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Kanban size={18} color="#579DFF" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                  Active Sprint Overview — {activeSprint.name}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(34, 160, 107, 0.2)',
                    color: '#4BCE97',
                  }}
                >
                  ACTIVE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(activeSprint.startDate || activeSprint.endDate) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9FADBC' }}>
                    <Calendar size={14} />
                    <span>
                      {activeSprint.startDate ? new Date(activeSprint.startDate).toLocaleDateString() : 'N/A'} -{' '}
                      {activeSprint.endDate ? new Date(activeSprint.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )}
                <Button
                  appearance="primary"
                  spacing="compact"
                  iconAfter={<ArrowRight size={14} />}
                  onClick={() => navigate(`/projects/${projectKey}/board`)}
                >
                  View Board
                </Button>
              </div>
            </div>

            {activeSprint.goal && (
              <p style={{ fontSize: '13px', color: '#9FADBC', margin: '0 0 16px 0' }}>
                <strong>Sprint Goal:</strong> {activeSprint.goal}
              </p>
            )}

            {/* Sprint Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                <span>Delivery: {activeSprintDone} of {activeSprintTotal} issues resolved</span>
                <span style={{ color: '#4BCE97' }}>{activeSprintProgress}% Complete</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#1D2125', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${activeSprintProgress}%`, backgroundColor: '#4BCE97' }} />
                <div
                  style={{
                    width: `${activeSprintTotal > 0 ? (activeSprintInProgress / activeSprintTotal) * 100 : 0}%`,
                    backgroundColor: '#579DFF',
                  }}
                />
              </div>
            </div>

            {/* Sprint Status Breakdown pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#9FADBC' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4BCE97' }} />
                <strong>{activeSprintDone}</strong> Done
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#579DFF' }} />
                <strong>{activeSprintInProgress}</strong> In Progress
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8C9BAB' }} />
                <strong>{activeSprintTodo}</strong> To Do
              </span>
            </div>
          </div>
        )}

        {/* 4. EPIC PROGRESS & RECENT ACTIVITY (2-COLUMN GRID) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Epics Progress List */}
          <div
            style={{
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#C084FC" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                  Active Epics ({epicsWithProgress.length})
                </h3>
              </div>
              <Button
                appearance="subtle"
                spacing="compact"
                onClick={() => navigate(`/projects/${projectKey}/epics`)}
              >
                View All Epics
              </Button>
            </div>

            {epicsWithProgress.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#738496', fontSize: '13px' }}>
                No active Epics in this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {epicsWithProgress.slice(0, 4).map((epic) => {
                  const owner = users.find((u) => u.id === epic.assigneeId);
                  return (
                    <div
                      key={epic.id}
                      onClick={() => navigate(`/projects/${projectKey}/epics`)}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#1D2125',
                        border: '1px solid #333C48',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#579DFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333C48')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#C084FC', backgroundColor: 'rgba(192, 132, 252, 0.15)', padding: '2px 6px', borderRadius: '3px' }}>
                            {epic.key}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4' }}>
                            {epic.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4BCE97' }}>
                          {epic.progressPct}%
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9FADBC' }}>
                        <span>
                          {epic.completedCount} of {epic.childrenCount} issues completed
                        </span>
                        {owner && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Avatar name={owner.name} src={owner.avatarUrl} size="xsmall" />
                            <span style={{ fontSize: '11px' }}>{owner.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Mini bar */}
                      <div style={{ height: '4px', backgroundColor: '#282E33', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                        <div style={{ width: `${epic.progressPct}%`, height: '100%', backgroundColor: '#4BCE97' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Project Activity Stream */}
          <div
            style={{
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={18} color="#579DFF" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Recent Activity
              </h3>
            </div>

            {projectActivities.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#738496', fontSize: '13px' }}>
                No recent activity logged for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectActivities.map((act) => {
                  const actor = users.find((u) => u.id === act.userId);
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '12px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #282E33',
                      }}
                    >
                      <Avatar name={actor?.name || 'User'} src={actor?.avatarUrl} size="small" />
                      <div style={{ flex: 1 }}>
                        <div>
                          <strong style={{ color: '#F1F2F4' }}>{actor?.name || 'Team Member'}</strong>{' '}
                          <span style={{ color: '#9FADBC' }}>{act.detail}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          <span
                            onClick={() => setDetailIssueKey(act.issueKey)}
                            style={{ color: '#579DFF', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {act.issueKey}
                          </span>
                          <span style={{ color: '#738496', fontSize: '11px' }}>
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 5. PROJECT TEAM SUMMARY */}
        <div
          style={{
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '6px',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#60A5FA" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Project Squad ({squadMembers.length} contributors)
              </h3>
            </div>
            <Button
              appearance="subtle"
              spacing="compact"
              iconAfter={<ArrowRight size={14} />}
              onClick={() => navigate(`/projects/${projectKey}/team`)}
            >
              View Full Team
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {squadMembers.slice(0, 6).map((member) => {
              const badge = getRoleBadge(member.role);
              const assigned = issues.filter((i) => i.assigneeId === member.id).length;
              return (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: '#1D2125',
                    border: '1px solid #333C48',
                    borderRadius: '4px',
                  }}
                >
                  <Avatar name={member.name} src={member.avatarUrl} size="small" />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: badge.text }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8C9BAB' }}>• {assigned} issues</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultProjectId={project?.id}
        />
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
