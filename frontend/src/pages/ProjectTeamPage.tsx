import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  Code,
  CheckCircle,
  Plus,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import { Modal } from '../design-system/components/Modal';
import {
  Button,
  Avatar,
  UserAvatar,
  Lozenge,
  IssueTypeIcon,
  PriorityIcon,
  Select,
} from '../design-system/components';
import {
  useProject,
  useIssues,
  useUsers,
  useCurrentUser,
  useTeams,
} from '../services';
import { User, Issue } from '../types';
import { canManageTeamMembers, getRoleBadge } from '../utils/permissions';
import { mockStore } from '../mocks/store';

export const ProjectTeamPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const issues = useIssues(project?.id);
  const allUsers = useUsers();
  const teams = useTeams();
  const currentUser = useCurrentUser();
  const navigate = useNavigate();

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [detailIssueKey, setDetailIssueKey] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedNewUserId, setSelectedNewUserId] = useState<string>('');

  // Find teams associated with this project
  const projectTeams = useMemo(() => {
    if (!project) return [];
    return teams.filter(
      (t) => t.projectIds?.includes(project.id) || t.leadId === project.leadId
    );
  }, [teams, project]);

  // Squad members from project teams or project lead or users with assigned issues
  const projectLead = allUsers.find((u) => u.id === project?.leadId);

  const teamMemberIds = useMemo(() => {
    const ids = new Set<string>();
    if (project?.leadId) ids.add(project.leadId);
    projectTeams.forEach((t) => t.memberIds.forEach((id) => ids.add(id)));
    // Also include anyone who has assigned issues in this project
    issues.forEach((i) => {
      if (i.assigneeId) ids.add(i.assigneeId);
    });
    return Array.from(ids);
  }, [project, projectTeams, issues]);

  const squadMembers = useMemo(() => {
    return allUsers.filter((u) => teamMemberIds.includes(u.id));
  }, [allUsers, teamMemberIds]);

  // Group members into Team Lead, Developers, QA, and Others
  const leadMembers = squadMembers.filter((m) => m.id === project?.leadId || m.role === 'TEAM_LEAD');
  const developerMembers = squadMembers.filter((m) => m.role === 'DEVELOPER' && m.id !== project?.leadId);
  const qaMembers = squadMembers.filter((m) => m.role === 'QA');
  const otherMembers = squadMembers.filter(
    (m) =>
      m.role !== 'DEVELOPER' &&
      m.role !== 'QA' &&
      m.role !== 'TEAM_LEAD' &&
      m.id !== project?.leadId
  );

  const userCanManage = canManageTeamMembers(currentUser, project?.leadId);

  const availableUsersToAdd = useMemo(() => {
    return allUsers.filter((u) => !teamMemberIds.includes(u.id));
  }, [allUsers, teamMemberIds]);

  const handleAddMember = () => {
    if (!selectedNewUserId || projectTeams.length === 0) return;
    const targetTeam = projectTeams[0];
    const updatedMemberIds = [...new Set([...targetTeam.memberIds, selectedNewUserId])];
    mockStore.syncWithBackend({
      teams: mockStore.getTeams().map((t) =>
        t.id === targetTeam.id ? { ...t, memberIds: updatedMemberIds } : t
      ),
    });
    setIsAddMemberModalOpen(false);
    setSelectedNewUserId('');
  };

  const renderMemberCard = (member: User) => {
    const memberIssues = issues.filter((i) => i.assigneeId === member.id);
    const assignedCount = memberIssues.length;
    const inProgressCount = memberIssues.filter(
      (i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW'
    ).length;
    const doneCount = memberIssues.filter((i) => i.status === 'DONE').length;
    const isExpanded = expandedUserId === member.id;
    const badge = getRoleBadge(member.role);

    return (
      <div
        key={member.id}
        style={{
          backgroundColor: '#22272B',
          border: '1px solid #333C48',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#22272B',
            borderBottom: isExpanded ? '1px solid #333C48' : 'none',
          }}
        >
          {/* Left Avatar & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <button
              onClick={() => setExpandedUserId(isExpanded ? null : member.id)}
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

            <UserAvatar user={member} size="lg" />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#F1F2F4',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedUserId(isExpanded ? null : member.id)}
                >
                  {member.name}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </span>
                {member.id === project?.leadId && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(251, 146, 60, 0.15)',
                      color: '#FB923C',
                      border: '1px solid rgba(251, 146, 60, 0.3)',
                    }}
                  >
                    Project Lead
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#9FADBC', marginTop: '2px' }}>
                {member.title} • {member.email}
              </div>
            </div>
          </div>

          {/* Right Workload Statistics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                {assignedCount} issues assigned
              </div>
              <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                {inProgressCount} in progress • {doneCount} completed
              </div>
            </div>

            {/* Workload Progress Bar */}
            <div style={{ width: '120px' }}>
              <div
                style={{
                  height: '6px',
                  backgroundColor: '#1D2125',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    width: `${assignedCount > 0 ? (doneCount / assignedCount) * 100 : 0}%`,
                    backgroundColor: '#4BCE97',
                  }}
                />
                <div
                  style={{
                    width: `${assignedCount > 0 ? (inProgressCount / assignedCount) * 100 : 0}%`,
                    backgroundColor: '#579DFF',
                  }}
                />
              </div>
            </div>

            <Button
              appearance="subtle"
              spacing="compact"
              onClick={() => setExpandedUserId(isExpanded ? null : member.id)}
            >
              {isExpanded ? 'Hide Issues' : 'View Issues'}
            </Button>
          </div>
        </div>

        {/* Expanded Assigned Issues List */}
        {isExpanded && (
          <div style={{ backgroundColor: '#1D2125', padding: '14px 20px' }}>
            {memberIssues.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#738496',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}
              >
                No issues currently assigned in this project.
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
                {memberIssues.map((issue) => (
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ProjectHeaderNav />

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project?.name || projectKey, href: `/projects/${projectKey}/overview` },
            { label: 'Team' },
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
                  backgroundColor: 'rgba(96, 165, 250, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60A5FA',
                }}
              >
                <Users size={18} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Project Squad & Contributors
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '6px' }}>
              Engineers, designers, and testers contributing to {project?.name} ({squadMembers.length} members).
            </p>
          </div>

          {userCanManage && availableUsersToAdd.length > 0 && (
            <Button
              appearance="primary"
              iconBefore={<Plus size={16} />}
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              Add Member to Squad
            </Button>
          )}
        </div>

        {/* Group 1: Leadership */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={16} color="#C084FC" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              Technical Leadership & Management ({leadMembers.length})
            </h3>
          </div>
          {leadMembers.map(renderMemberCard)}
        </div>

        {/* Group 2: Developers */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Code size={16} color="#60A5FA" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              Software Engineers & Developers ({developerMembers.length})
            </h3>
          </div>
          {developerMembers.map(renderMemberCard)}
        </div>

        {/* Group 3: QA */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={16} color="#FBBF24" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              Quality Assurance & Verification ({qaMembers.length})
            </h3>
          </div>
          {qaMembers.map(renderMemberCard)}
        </div>

        {/* Group 4: Other Members if any */}
        {otherMembers.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <UserCheck size={16} color="#9FADBC" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Additional Contributors ({otherMembers.length})
              </h3>
            </div>
            {otherMembers.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <Modal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          title="Add Member to Project Squad"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <Button appearance="subtle" onClick={() => setIsAddMemberModalOpen(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                disabled={!selectedNewUserId}
                onClick={handleAddMember}
              >
                Add Member
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: '#9FADBC', margin: 0 }}>
              Select an employee from the organization directory to join {project?.name}'s engineering squad:
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                Select Employee
              </label>
              <Select
                value={selectedNewUserId}
                onChange={(e) => setSelectedNewUserId(e.target.value)}
              >
                <option value="">Choose an employee...</option>
                {availableUsersToAdd.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.title} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>
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
