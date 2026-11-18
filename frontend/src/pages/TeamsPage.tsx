import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowRight, Shield } from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Avatar, AvatarGroup, Button } from '../design-system/components';
import { useTeams, useUsers, useProjects } from '../services';

export const TeamsPage: React.FC = () => {
  const teams = useTeams();
  const users = useUsers();
  const projects = useProjects();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
      <Breadcrumbs items={[{ label: 'Home', href: '/dashboard' }, { label: 'Teams' }]} />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
          Engineering Teams
        </h1>
        <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px' }}>
          Collaborate across functional squads, track deliverables, and manage membership.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {teams.map((team) => {
          const lead = users.find((u) => u.id === team.leadId);
          const members = users.filter((u) => team.memberIds.includes(u.id));
          const teamProjects = projects.filter((p) => team.projectIds.includes(p.id));

          return (
            <div
              key={team.id}
              style={{
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '6px',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#579DFF';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333C48';
                e.currentTarget.style.boxShadow =
                  '0 1px 2px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div>
                {/* Team Title & Department */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                    {team.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      backgroundColor: '#282E33',
                      color: '#9FADBC',
                      borderRadius: '3px',
                      border: '1px solid #333C48',
                    }}
                  >
                    {team.department}
                  </span>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: '13px',
                    color: '#9FADBC',
                    lineHeight: 1.4,
                    marginBottom: '16px',
                    minHeight: '36px',
                  }}
                >
                  {team.description}
                </p>

                {/* Team Lead */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Shield size={14} color="#C084FC" />
                  <span style={{ fontSize: '12px', color: '#8C9BAB' }}>Lead:</span>
                  {lead ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={lead.name} src={lead.avatarUrl} size="xsmall" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                        {lead.name}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#738496' }}>Unassigned</span>
                  )}
                </div>

                {/* Associated Projects */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <FolderKanban size={14} color="#8C9BAB" />
                  <span style={{ fontSize: '12px', color: '#8C9BAB' }}>Projects:</span>
                  {teamProjects.map((p) => (
                    <span
                      key={p.id}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(87, 157, 255, 0.15)',
                        color: '#579DFF',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      {p.key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Member avatars stack & View team link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #333C48',
                  paddingTop: '12px',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarGroup users={members} max={4} size="small" />
                  <span style={{ fontSize: '12px', color: '#8C9BAB' }}>
                    {members.length} members
                  </span>
                </div>

                <Button
                  appearance="subtle"
                  spacing="compact"
                  iconAfter={<ArrowRight size={14} />}
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  View Team
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
