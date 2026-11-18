import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Button, Input, Avatar } from '../design-system/components';
import { useProjects, useUsers, projectService } from '../services';

export const ProjectsPage: React.FC = () => {
  const projects = useProjects();
  const users = useUsers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
      <Breadcrumbs items={[{ label: 'Home', href: '/dashboard' }, { label: 'Projects' }]} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
            Projects
          </h1>
          <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px' }}>
            Browse and manage all active software and business engineering projects.
          </p>
        </div>

        <div style={{ width: '220px' }}>
          <Input
            isCompact
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            iconBefore={<Search size={14} color="#9FADBC" />}
          />
        </div>
      </div>

      {/* Projects Table */}
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
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ width: '40px', padding: '10px 12px', textAlign: 'center' }}>
                <Star size={14} color="#8C9BAB" style={{ margin: '0 auto', display: 'block' }} />
              </th>
              <th style={{ padding: '10px 16px' }}>Name</th>
              <th style={{ padding: '10px 16px' }}>Key</th>
              <th style={{ padding: '10px 16px' }}>Type</th>
              <th style={{ padding: '10px 16px' }}>Project Lead</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => {
              const lead = users.find((u) => u.id === p.leadId);
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid #282E33',
                    fontSize: '13px',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Star Toggle */}
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => projectService.toggleStarred(p.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: p.isStarred ? '#E2B203' : '#738496',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                      }}
                    >
                      <Star size={16} fill={p.isStarred ? '#E2B203' : 'none'} />
                    </button>
                  </td>

                  {/* Project Name + Avatar */}
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${p.key}/board`)}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: p.iconBgColor || '#0C66E4',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p.key.substring(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#579DFF' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#9FADBC' }}>{p.description}</div>
                      </div>
                    </div>
                  </td>

                  {/* Key */}
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#F1F2F4' }}>
                    {p.key}
                  </td>

                  {/* Category */}
                  <td style={{ padding: '12px 16px', color: '#9FADBC', textTransform: 'capitalize' }}>
                    {p.category.toLowerCase()} project
                  </td>

                  {/* Project Lead */}
                  <td style={{ padding: '12px 16px' }}>
                    {lead ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={lead.name} src={lead.avatarUrl} size="xsmall" />
                        <span style={{ color: '#F1F2F4' }}>{lead.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#738496' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        onClick={() => navigate(`/projects/${p.key}/board`)}
                      >
                        Board
                      </Button>
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        onClick={() => navigate(`/projects/${p.key}/backlog`)}
                      >
                        Backlog
                      </Button>
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        onClick={() => navigate(`/projects/${p.key}/overview`)}
                      >
                        Overview
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
