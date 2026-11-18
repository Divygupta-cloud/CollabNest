import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  Kanban,
  ListTodo,
  Layers,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Repeat,
  Users,
} from 'lucide-react';
import { useProject } from '../../services';
import { usePermissions } from '../../services/rbac';

export const ProjectSidebar: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { can } = usePermissions();

  const allNavGroups = [
    {
      title: 'PROJECT',
      items: [
        {
          label: 'Overview',
          path: `/projects/${projectKey}/overview`,
          icon: <FolderOpen size={16} />,
          permission: null,
        },
      ],
    },
    {
      title: 'PLANNING',
      items: [
        {
          label: 'Board',
          path: `/projects/${projectKey}/board`,
          icon: <Kanban size={16} />,
          permission: null,
        },
        {
          label: 'Backlog',
          path: `/projects/${projectKey}/backlog`,
          icon: <ListTodo size={16} />,
          permission: null,
        },
        {
          label: 'Epics',
          path: `/projects/${projectKey}/epics`,
          icon: <Zap size={16} />,
          permission: null,
        },
        {
          label: 'Sprints',
          path: `/projects/${projectKey}/sprints`,
          icon: <Repeat size={16} />,
          permission: null,
        },
      ],
    },
    {
      title: 'EXECUTION',
      items: [
        {
          label: 'Issues',
          path: `/projects/${projectKey}/issues`,
          icon: <Layers size={16} />,
          permission: null,
        },
        {
          label: 'Team',
          path: `/projects/${projectKey}/team`,
          icon: <Users size={16} />,
          permission: null,
        },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          label: 'Project Settings',
          path: `/projects/${projectKey}/settings`,
          icon: <Settings size={16} />,
          permission: 'VIEW_PROJECT_SETTINGS' as const,
        },
      ],
    },
  ];

  // Filter items by permission; drop empty groups
  const navGroups = allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.permission === null || can(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      style={{
        width: isCollapsed ? '24px' : '240px',
        backgroundColor: '#1D2125',
        borderRight: '1px solid #333C48',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        position: 'relative',
        transition: 'width 0.2s cubic-bezier(0.2, 0, 0, 1)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Collapse / Expand Tab Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '24px',
          right: '-12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#22272B',
          border: '1px solid #333C48',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#9FADBC',
          zIndex: 10,
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main Sidebar Content (Hidden if collapsed) */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Project Header Widget */}
          <div
            style={{
              padding: '16px 16px 12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #333C48',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: project?.iconBgColor || '#0C66E4',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {project?.key || 'PRJ'}
            </div>
            <div style={{ overflow: 'hidden' }}>
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
                {project?.name || 'Project'}
              </div>
              <div style={{ fontSize: '11px', color: '#9FADBC', textTransform: 'capitalize' }}>
                {project?.category ? `${project.category.toLowerCase()} project` : 'Software project'}
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <div style={{ padding: '12px 8px', overflowY: 'auto', flex: 1 }}>
            {navGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#8C9BAB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#579DFF' : '#9FADBC',
                      backgroundColor: isActive ? 'rgba(87, 157, 255, 0.15)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background-color 0.1s ease',
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = '#282E33';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom Footer Note */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #333C48',
              fontSize: '11px',
              color: '#738496',
            }}
          >
            Phase 1 UI • CollabNest v1.0
          </div>
        </div>
      )}
    </aside>
  );
};
