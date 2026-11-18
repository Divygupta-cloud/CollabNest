import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  FolderKanban,
  LayoutDashboard,
  Users,
  Grid,
  ChevronLeft,
  ChevronRight,
  Layers,
  Shield,
  Settings,
} from 'lucide-react';
import { usePermissions } from '../../services/rbac';

export const WorkspaceSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { can } = usePermissions();

  const allNavItems = [
    {
      label: 'Your Work',
      path: '/dashboard',
      icon: <Clock size={16} />,
      permission: null, // visible to everyone
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: <FolderKanban size={16} />,
      permission: null,
    },
    {
      label: 'Dashboards',
      path: '/dashboard',
      icon: <LayoutDashboard size={16} />,
      permission: null,
    },
    {
      label: 'People & Teams',
      path: '/teams',
      icon: <Users size={16} />,
      permission: 'VIEW_ALL_USERS' as const,
    },
    {
      label: 'User Management',
      path: '/users',
      icon: <Shield size={16} />,
      permission: 'MANAGE_USERS' as const,
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: <Settings size={16} />,
      permission: 'VIEW_SYSTEM_SETTINGS' as const,
    },

  ];

  const navItems = allNavItems.filter(
    (item) => item.permission === null || can(item.permission)
  );

  return (
    <aside
      style={{
        width: isCollapsed ? '20px' : '240px',
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

      {/* Main Sidebar Content */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Workspace Header */}
          <div
            style={{
              padding: '16px 16px 14px 16px',
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
                backgroundColor: '#0C66E4',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              <Layers size={18} />
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
                CollabNest Workspace
              </div>
              <div style={{ fontSize: '11px', color: '#9FADBC' }}>Jira Software</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ padding: '12px 8px', overflowY: 'auto', flex: 1 }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#8C9BAB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 8px',
                marginBottom: '4px',
              }}
            >
              WORKSPACE
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '3px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#579DFF' : '#9FADBC',
                  backgroundColor: isActive ? 'rgba(87, 157, 255, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '2px',
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
                <span style={{ color: 'inherit' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Footer Note */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #333C48',
              fontSize: '11px',
              color: '#738496',
            }}
          >
            Atlassian Design System • CollabNest
          </div>
        </div>
      )}
    </aside>
  );
};
