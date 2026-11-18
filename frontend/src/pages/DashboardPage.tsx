import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  Clock,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { IssueDetailModal } from '../components/issue/IssueDetailModal';
import {
  Avatar,
  Lozenge,
  IssueTypeIcon,
  PriorityIcon,
} from '../design-system/components';
import {
  useCurrentUser,
  useProjects,
  useIssues,
  useActivities,
  useUsers,
  projectService,
} from '../services';

export const DashboardPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const projects = useProjects();
  const issues = useIssues();
  const activities = useActivities();
  const users = useUsers();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeIssueKey = searchParams.get('issue');

  const [activeTab, setActiveTab] = useState<'worked' | 'assigned' | 'starred'>('worked');

  const assignedIssues = issues.filter((i) => i.assigneeId === currentUser.id);
  const workedOnIssues = issues.slice(0, 6);
  const starredProjects = projects.filter((p) => p.isStarred);

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Your Work' }]} />

      {/* Welcome Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
          Your Work
        </h1>
        <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px' }}>
          Welcome back, <strong style={{ color: '#F1F2F4' }}>{currentUser.name}</strong> • {currentUser.title}
        </p>
      </div>

      {/* Recent Projects Cards */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4' }}>
            Recent Projects
          </div>
          <button
            onClick={() => navigate('/projects')}
            style={{
              background: 'none',
              border: 'none',
              color: '#579DFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View all projects →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.key}/board`)}
              style={{
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#579DFF';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333C48';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '3px',
                  backgroundColor: p.iconBgColor || '#0C66E4',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.key.substring(0, 2)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#F1F2F4',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                  {p.category.toLowerCase()} project
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  projectService.toggleStarred(p.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: p.isStarred ? '#E2B203' : '#738496',
                }}
              >
                <Star size={16} fill={p.isStarred ? '#E2B203' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Dashboard Body: Work tabs & Activity feed (alignItems: start prevents blank void) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Work Navigation Tabs */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid #333C48',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setActiveTab('worked')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: activeTab === 'worked' ? 600 : 500,
                color: activeTab === 'worked' ? '#579DFF' : '#9FADBC',
                borderBottom: activeTab === 'worked' ? '2px solid #579DFF' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Worked on</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'worked' ? 'rgba(87, 157, 255, 0.2)' : '#282E33',
                  color: activeTab === 'worked' ? '#579DFF' : '#9FADBC',
                }}
              >
                {workedOnIssues.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: activeTab === 'assigned' ? 600 : 500,
                color: activeTab === 'assigned' ? '#579DFF' : '#9FADBC',
                borderBottom: activeTab === 'assigned' ? '2px solid #579DFF' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Assigned to me</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'assigned' ? 'rgba(87, 157, 255, 0.2)' : '#282E33',
                  color: activeTab === 'assigned' ? '#579DFF' : '#9FADBC',
                }}
              >
                {assignedIssues.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('starred')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: activeTab === 'starred' ? 600 : 500,
                color: activeTab === 'starred' ? '#579DFF' : '#9FADBC',
                borderBottom: activeTab === 'starred' ? '2px solid #579DFF' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Starred</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'starred' ? 'rgba(87, 157, 255, 0.2)' : '#282E33',
                  color: activeTab === 'starred' ? '#579DFF' : '#9FADBC',
                }}
              >
                {starredProjects.length}
              </span>
            </button>
          </div>

          {/* Tab Content Card */}
          <div
            style={{
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '3px',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {activeTab === 'worked' && (
              <div>
                {workedOnIssues.map((issue) => {
                  const proj = projects.find(
                    (p) => p.id === issue.projectId || p.key === issue.key.split('-')[0]
                  );
                  const assignee = users.find((u) => u.id === issue.assigneeId);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => setSearchParams({ issue: issue.key })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 16px',
                        borderBottom: '1px solid #282E33',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <IssueTypeIcon type={issue.type} size={16} />

                      {/* Project Icon + Project Key / Issue Key */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '3px',
                            backgroundColor: proj?.iconBgColor || '#0C66E4',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          title={`${proj?.name || ''} (${proj?.key || ''})`}
                        >
                          {proj?.key.substring(0, 2) || issue.key.split('-')[0].substring(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#579DFF', fontSize: '13px' }}>
                          {issue.key}
                        </span>
                      </div>

                      <span
                        style={{
                          flex: 1,
                          color: '#F1F2F4',
                          fontSize: '13px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {issue.title}
                      </span>

                      <Lozenge status={issue.status} />
                      <PriorityIcon priority={issue.priority} size={14} />

                      {/* Assignee Avatar on the right side */}
                      <div style={{ width: '28px', display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          name={assignee?.name || 'Unassigned'}
                          src={assignee?.avatarUrl}
                          size="small"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'assigned' && (
              <div>
                {assignedIssues.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#738496', fontSize: '13px' }}>
                    You have no issues assigned to you right now!
                  </div>
                ) : (
                  assignedIssues.map((issue) => {
                    const proj = projects.find(
                      (p) => p.id === issue.projectId || p.key === issue.key.split('-')[0]
                    );
                    const assignee = users.find((u) => u.id === issue.assigneeId);
                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSearchParams({ issue: issue.key })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '11px 16px',
                          borderBottom: '1px solid #282E33',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <IssueTypeIcon type={issue.type} size={16} />

                        {/* Project Icon + Project Key / Issue Key */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '3px',
                              backgroundColor: proj?.iconBgColor || '#0C66E4',
                              color: '#FFFFFF',
                              fontSize: '9px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                            title={`${proj?.name || ''} (${proj?.key || ''})`}
                          >
                            {proj?.key.substring(0, 2) || issue.key.split('-')[0].substring(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#579DFF', fontSize: '13px' }}>
                            {issue.key}
                          </span>
                        </div>

                        <span
                          style={{
                            flex: 1,
                            color: '#F1F2F4',
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {issue.title}
                        </span>

                        <Lozenge status={issue.status} />
                        <PriorityIcon priority={issue.priority} size={14} />

                        {/* Assignee Avatar on the right side */}
                        <div style={{ width: '28px', display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            name={assignee?.name || 'Unassigned'}
                            src={assignee?.avatarUrl}
                            size="small"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'starred' && (
              <div>
                {starredProjects.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#738496', fontSize: '13px' }}>
                    No starred projects yet. Click the star on any project to keep it here.
                  </div>
                ) : (
                  starredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.key}/board`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderBottom: '1px solid #282E33',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Star size={16} fill="#E2B203" color="#E2B203" />
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          backgroundColor: p.iconBgColor || '#0C66E4',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p.key.substring(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#F1F2F4', flex: 1, fontSize: '13px' }}>
                        {p.name} ({p.key})
                      </span>
                      <span style={{ fontSize: '12px', color: '#579DFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open board →
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Global Activity Stream */}
        <div>
          <div
            style={{
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '3px',
              padding: '18px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={16} color="#579DFF" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                Recent Team Activity
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activities.slice(0, 6).map((act) => {
                const actUser = users.find((u) => u.id === act.userId);
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {/* User Avatar next to activity items */}
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      <Avatar
                        name={actUser?.name || act.userId}
                        src={actUser?.avatarUrl}
                        size="small"
                      />
                    </div>
                    <div style={{ flex: 1, fontSize: '12px' }}>
                      <div style={{ color: '#F1F2F4', lineHeight: '1.4' }}>
                        {/* Interactive link pill for issue key */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchParams({ issue: act.issueKey });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '1px 6px',
                            backgroundColor: '#1D2125',
                            border: '1px solid #333C48',
                            borderRadius: '3px',
                            color: '#579DFF',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            marginRight: '6px',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1D2125')}
                          title={`View issue ${act.issueKey}`}
                        >
                          {act.issueKey}
                        </span>
                        <span>{act.detail}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#738496', marginTop: '3px' }}>
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issueKey={activeIssueKey}
        onClose={() => {
          searchParams.delete('issue');
          setSearchParams(searchParams);
        }}
      />
    </div>
  );
};
