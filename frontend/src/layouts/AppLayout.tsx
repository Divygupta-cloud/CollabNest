import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GlobalNavbar } from '../components/navigation/GlobalNavbar';
import { ProjectSidebar } from '../components/navigation/ProjectSidebar';
import { WorkspaceSidebar } from '../components/navigation/WorkspaceSidebar';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  // Check if current route is within a project context (e.g. /projects/CRM/...)
  const isProjectRoute = location.pathname.startsWith('/projects/') && location.pathname.split('/').length > 2;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Global Navigation */}
      <GlobalNavbar />

      {/* Main Content Area with Collapsible Left Sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {isProjectRoute ? <ProjectSidebar /> : <WorkspaceSidebar />}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#161A1D',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
