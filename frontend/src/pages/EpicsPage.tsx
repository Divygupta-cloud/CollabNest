import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import {
  Button,
  Lozenge,
  PriorityIcon,
  IssueTypeIcon,
  Avatar,
} from '../design-system/components';
import {
  useProject,
  useIssues,
  useUsers,
  useSprints,
  useCurrentUser,
} from '../services';
import { Issue } from '../types';
import { canCreateEpic } from '../utils/permissions';

export const EpicsPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const allIssues = useIssues(project?.id);
  const users = useUsers();
  const sprints = useSprints(project?.id || '');
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailIssueKey, setDetailIssueKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all Epics for this project
  const epics = useMemo(() => {
    return allIssues.filter((i) => i.type === 'EPIC');
  }, [allIssues]);

  // Child issues grouped by epicId
  const epicChildrenMap = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    epics.forEach((epic) => {
      map[epic.id] = allIssues.filter((i) => i.epicId === epic.id || i.epicId === epic.key);
    });
    return map;
  }, [epics, allIssues]);

  const filteredEpics = useMemo(() => {
    if (!searchQuery.trim()) return epics;
    const q = searchQuery.toLowerCase();
    return epics.filter(
      (e) => e.title.toLowerCase().includes(q) || e.key.toLowerCase().includes(q)
    );
  }, [epics, searchQuery]);

  const userCanCreate = canCreateEpic(currentUser);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Project Navigation Header */}
      <ProjectHeaderNav />

      {/* Main Page Body */}
      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project?.name || projectKey, href: `/projects/${projectKey}/overview` },
            { label: 'Epics' },
          ]}
        />

        {/* Header Banner */}
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
                  backgroundColor: 'rgba(192, 132, 252, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C084FC',
                }}
              >
                <Zap size={18} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Project Epics
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '6px' }}>
              High-level strategic initiatives and feature deliverables for {project?.name}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search epics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                color: '#F1F2F4',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
                width: '200px',
              }}
            />
            {userCanCreate ? (
              <Button
                appearance="primary"
                iconBefore={<Plus size={16} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Epic
              </Button>
            ) : (
              <div
                title="Only Team Leads, Managers, and Admins can create Epics"
                style={{
                  fontSize: '11px',
                  color: '#8C9BAB',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  padding: '6px 10px',
                  borderRadius: '4px',
                }}
              >
                🔒 Lead/Admin Only
              </div>
            )}
          </div>
        </div>

        {/* Epics Grid / Accordion */}
        {filteredEpics.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
            }}
          >
            <Zap size={36} color="#8C9BAB" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: '0 0 6px 0' }}>
              No Epics found
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', maxWidth: '440px', margin: '0 auto 16px auto' }}>
              Epics group related Stories, Tasks, and Bugs into major project releases.
            </p>
            {userCanCreate && (
              <Button
                appearance="primary"
                iconBefore={<Plus size={14} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create First Epic
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredEpics.map((epic) => {
              const children = epicChildrenMap[epic.id] || [];
              const totalChildren = children.length;
              const doneChildren = children.filter((c) => c.status === 'DONE').length;
              const inProgressChildren = children.filter(
                (c) => c.status === 'IN_PROGRESS' || c.status === 'IN_REVIEW'
              ).length;
              const todoChildren = children.filter(
                (c) => c.status === 'TODO' || c.status === 'BACKLOG'
              ).length;
              const progressPct =
                totalChildren > 0 ? Math.round((doneChildren / totalChildren) * 100) : 0;
              const isExpanded = selectedEpicId === epic.id;
              const owner = users.find((u) => u.id === epic.assigneeId);

              // Distinct sprints in this epic
              const linkedSprintIds = [
                ...new Set(children.map((c) => c.sprintId).filter(Boolean)),
              ] as string[];
              const epicSprints = sprints.filter((s) => linkedSprintIds.includes(s.id));

              return (
                <div
                  key={epic.id}
                  style={{
                    backgroundColor: '#22272B',
                    border: '1px solid #333C48',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Epic Header Row */}
                  <div
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: isExpanded ? '1px solid #333C48' : 'none',
                      backgroundColor: '#22272B',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <button
                        onClick={() => setSelectedEpicId(isExpanded ? null : epic.id)}
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

                      <div
                        onClick={() => setDetailIssueKey(epic.key)}
                        style={{
                          backgroundColor: 'rgba(192, 132, 252, 0.2)',
                          color: '#C084FC',
                          border: '1px solid rgba(192, 132, 252, 0.35)',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Click to view Epic details modal"
                      >
                        {epic.key}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          onClick={() => setSelectedEpicId(isExpanded ? null : epic.id)}
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#F1F2F4',
                            cursor: 'pointer',
                          }}
                        >
                          {epic.title}
                        </div>
                        {epic.description && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#9FADBC',
                              marginTop: '2px',
                              maxWidth: '680px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {epic.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Progress Summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      {/* Owner */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={owner?.name || 'Unassigned'} src={owner?.avatarUrl} size="small" />
                        <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                          {owner?.name || 'Unassigned'}
                        </span>
                      </div>

                      {/* Status */}
                      <Lozenge status={epic.status} />

                      {/* Priority */}
                      <PriorityIcon priority={epic.priority} size={15} />

                      {/* Progress Bar Mini */}
                      <div style={{ width: '130px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#9FADBC',
                            marginBottom: '4px',
                          }}
                        >
                          <span>{doneChildren}/{totalChildren} Done</span>
                          <span style={{ fontWeight: 600, color: '#4BCE97' }}>{progressPct}%</span>
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
                              width: `${totalChildren > 0 ? (inProgressChildren / totalChildren) * 100 : 0}%`,
                              backgroundColor: '#579DFF',
                            }}
                          />
                        </div>
                      </div>

                      {/* Expand / View Details Button */}
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        iconAfter={<ArrowUpRight size={14} />}
                        onClick={() => setDetailIssueKey(epic.key)}
                      >
                        Epic Details
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Child Issues & Breakdown */}
                  {isExpanded && (
                    <div style={{ backgroundColor: '#1D2125', padding: '16px 20px' }}>
                      {/* Sprint distribution tags */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                          fontSize: '12px',
                          color: '#8C9BAB',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Sprint Distribution:</span>
                        {epicSprints.length === 0 ? (
                          <span style={{ color: '#738496', fontStyle: 'italic' }}>Backlog only</span>
                        ) : (
                          epicSprints.map((s) => (
                            <span
                              key={s.id}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '3px',
                                backgroundColor: 'rgba(87, 157, 255, 0.15)',
                                color: '#579DFF',
                                fontWeight: 600,
                                fontSize: '11px',
                              }}
                            >
                              {s.name}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Child Issues List */}
                      <div style={{ marginBottom: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                            Child Issues ({totalChildren})
                          </span>
                          <span style={{ fontSize: '11px', color: '#9FADBC' }}>
                            {todoChildren} To Do • {inProgressChildren} In Progress • {doneChildren} Done
                          </span>
                        </div>

                        {children.length === 0 ? (
                          <div
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#738496',
                              fontSize: '13px',
                              backgroundColor: '#22272B',
                              borderRadius: '4px',
                            }}
                          >
                            No child issues linked to this Epic yet. Assign issues in the Backlog or create a ticket with this Epic.
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
                            {children.map((child) => {
                              const childAssignee = users.find((u) => u.id === child.assigneeId);
                              return (
                                <div
                                  key={child.id}
                                  onClick={() => setDetailIssueKey(child.key)}
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
                                  <IssueTypeIcon type={child.type} size={15} />
                                  <span style={{ fontWeight: 600, color: '#579DFF', width: '80px' }}>
                                    {child.key}
                                  </span>
                                  <span style={{ flex: 1, color: '#F1F2F4' }}>{child.title}</span>
                                  <Lozenge status={child.status} />
                                  <PriorityIcon priority={child.priority} size={14} />
                                  {child.storyPoints !== undefined && (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        backgroundColor: '#282E33',
                                        color: '#9FADBC',
                                        padding: '1px 6px',
                                        borderRadius: '3px',
                                      }}
                                    >
                                      {child.storyPoints} SP
                                    </span>
                                  )}
                                  {childAssignee && (
                                    <Avatar
                                      name={childAssignee.name}
                                      src={childAssignee.avatarUrl}
                                      size="xsmall"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultProjectId={project?.id}
          defaultType="EPIC"
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
