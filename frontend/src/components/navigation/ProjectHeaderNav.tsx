import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  FolderOpen,
  Kanban,
  ListTodo,
  Layers,
  Zap,
  Repeat,
  Users,
  Settings,
} from 'lucide-react';
import { useProject } from '../../services';
import { Project } from '../../types';

interface ProjectHeaderNavProps {
  project?: Project;
  activeTab?: string;
  onOpenCreateModal?: () => void;
}

export const ProjectHeaderNav: React.FC<ProjectHeaderNavProps> = ({
  project: propProject,
}) => {
  const { projectKey: paramKey } = useParams<{ projectKey: string }>();
  const projectKey = paramKey || propProject?.key || 'CRM';
  const fetchedProject = useProject(projectKey);
  const project = propProject || fetchedProject;

  const navTabs = [
    { label: 'Overview', path: `/projects/${projectKey}/overview`, icon: <FolderOpen size={15} /> },
    { label: 'Board', path: `/projects/${projectKey}/board`, icon: <Kanban size={15} /> },
    { label: 'Backlog', path: `/projects/${projectKey}/backlog`, icon: <ListTodo size={15} /> },
    { label: 'Issues', path: `/projects/${projectKey}/issues`, icon: <Layers size={15} /> },
    { label: 'Epics', path: `/projects/${projectKey}/epics`, icon: <Zap size={15} /> },
    { label: 'Sprints', path: `/projects/${projectKey}/sprints`, icon: <Repeat size={15} /> },
    { label: 'Team', path: `/projects/${projectKey}/team`, icon: <Users size={15} /> },
    { label: 'Settings', path: `/projects/${projectKey}/settings`, icon: <Settings size={15} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        borderBottom: '1px solid #333C48',
        backgroundColor: '#1D2125',
        padding: '0 24px',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Project mini badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingRight: '16px',
          marginRight: '8px',
          borderRight: '1px solid #333C48',
          height: '42px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '3px',
            backgroundColor: project?.iconBgColor || '#0C66E4',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {project?.key || 'PRJ'}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
          {project?.name || projectKey}
        </span>
      </div>

      {/* Nav Tabs */}
      {navTabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#579DFF' : '#9FADBC',
            textDecoration: 'none',
            borderBottom: isActive ? '2px solid #579DFF' : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.color = '#F1F2F4';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.color = '#9FADBC';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
