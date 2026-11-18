import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Avatar, Button, Lozenge, IssueTypeIcon, PriorityIcon } from '../design-system/components';
import { useTeam, useUsers, useIssues } from '../services';

export const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const team = useTeam(teamId || '');
  const users = useUsers();
  const issues = useIssues();
  const navigate = useNavigate();

  if (!team) {
    return (
      <div style={{ padding: '32px', backgroundColor: '#161A1D', minHeight: '100%' }}>
        <Breadcrumbs items={[{ label: 'Teams', href: '/teams' }, { label: 'Not Found' }]} />
        <h2 style={{ color: '#F1F2F4' }}>Team not found</h2>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    );
  }

  const lead = users.find((u) => u.id === team.leadId);
  const members = users.filter((u) => team.memberIds.includes(u.id));
  const teamIssues = issues.filter((i) => team.memberIds.includes(i.assigneeId || ''));

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
      <Breadcrumbs items={[{ label: 'Teams', href: '/teams' }, { label: team.name }]} />

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '20px',
          marginBottom: '24px',
          borderBottom: '1px solid #333C48',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              {team.name}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                backgroundColor: 'rgba(192, 132, 252, 0.15)',
                color: '#C084FC',
                borderRadius: '3px',
                border: '1px solid rgba(192, 132, 252, 0.3)',
              }}
            >
              {team.department}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '6px' }}>
            {team.description}
          </p>
        </div>

        {lead && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              backgroundColor: '#22272B',
              borderRadius: '6px',
              border: '1px solid #333C48',
            }}
          >
            <Avatar name={lead.name} src={lead.avatarUrl} size="medium" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8C9BAB', textTransform: 'uppercase' }}>
                Team Leader
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F2F4' }}>{lead.name}</div>
              <div style={{ fontSize: '11px', color: '#9FADBC' }}>{lead.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Team Members Roster */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '12px' }}>
          Team Members ({members.length})
        </h3>
        <div
          style={{
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#1D2125',
                  borderBottom: '1px solid #333C48',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8C9BAB',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '10px 16px' }}>Member</th>
                <th style={{ padding: '10px 16px' }}>Title & Role</th>
                <th style={{ padding: '10px 16px' }}>Email</th>
                <th style={{ padding: '10px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #282E33', fontSize: '13px' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={m.name} src={m.avatarUrl} size="small" />
                      <span style={{ fontWeight: 600, color: '#F1F2F4' }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9FADBC' }}>
                    <div style={{ color: '#F1F2F4' }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: '#8C9BAB', fontWeight: 600 }}>{m.role}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9FADBC' }}>{m.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(34, 160, 107, 0.2)',
                        color: '#4BCE97',
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Currently Assigned Deliverables */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '12px' }}>
          Active Squad Deliverables ({teamIssues.length})
        </h3>
        <div
          style={{
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {teamIssues.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#738496', fontStyle: 'italic' }}>
              No current issues assigned to members of this team.
            </div>
          ) : (
            teamIssues.map((issue) => {
              const assignee = users.find((u) => u.id === issue.assigneeId);
              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/projects/CRM/board?issue=${issue.key}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderBottom: '1px solid #282E33',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <IssueTypeIcon type={issue.type} size={16} />
                  <span style={{ fontWeight: 600, color: '#579DFF', width: '80px' }}>{issue.key}</span>
                  <span style={{ flex: 1, color: '#F1F2F4' }}>{issue.title}</span>
                  <Lozenge status={issue.status} />
                  <PriorityIcon priority={issue.priority} size={14} />
                  {assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={assignee.name} src={assignee.avatarUrl} size="xsmall" />
                      <span style={{ fontSize: '12px', color: '#9FADBC' }}>{assignee.name}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
