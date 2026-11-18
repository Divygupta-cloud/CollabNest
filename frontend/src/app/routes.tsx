import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectOverviewPage } from '../pages/ProjectOverviewPage';
import { BoardPage } from '../pages/BoardPage';
import { BacklogPage } from '../pages/BacklogPage';
import { IssuesPage } from '../pages/IssuesPage';
import { EpicsPage } from '../pages/EpicsPage';
import { SprintsPage } from '../pages/SprintsPage';
import { ProjectTeamPage } from '../pages/ProjectTeamPage';
import { ProjectSettingsPage } from '../pages/ProjectSettingsPage';
import { TeamsPage } from '../pages/TeamsPage';
import { TeamDetailPage } from '../pages/TeamDetailPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { SettingsPage } from '../pages/SettingsPage';
import { PermissionGuard, ForbiddenPage } from '../components/common/PermissionGuard';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectKey',
        element: <Navigate to="board" replace />,
      },
      {
        path: 'projects/:projectKey/overview',
        element: <ProjectOverviewPage />,
      },
      {
        path: 'projects/:projectKey/board',
        element: <BoardPage />,
      },
      {
        path: 'projects/:projectKey/backlog',
        element: <BacklogPage />,
      },
      {
        path: 'projects/:projectKey/issues',
        element: <IssuesPage />,
      },
      {
        path: 'projects/:projectKey/epics',
        element: <EpicsPage />,
      },
      {
        path: 'projects/:projectKey/sprints',
        element: <SprintsPage />,
      },
      {
        path: 'projects/:projectKey/team',
        element: <ProjectTeamPage />,
      },
      {
        path: 'projects/:projectKey/timeline',
        element: <BacklogPage />,
      },
      {
        // Project Settings: requires VIEW_PROJECT_SETTINGS
        path: 'projects/:projectKey/settings',
        element: (
          <PermissionGuard
            permission="VIEW_PROJECT_SETTINGS"
            fallback={<ForbiddenPage requiredPermission="VIEW_PROJECT_SETTINGS" />}
          >
            <ProjectSettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'filters',
        element: <IssuesPage />,
      },
      {
        path: 'issues',
        element: <IssuesPage />,
      },
      {
        // Teams: requires VIEW_ALL_USERS to see People & Teams
        path: 'teams',
        element: (
          <PermissionGuard
            permission="VIEW_ALL_USERS"
            fallback={<ForbiddenPage requiredPermission="VIEW_ALL_USERS" />}
          >
            <TeamsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'teams/:teamId',
        element: (
          <PermissionGuard
            permission="VIEW_ALL_USERS"
            fallback={<ForbiddenPage requiredPermission="VIEW_ALL_USERS" />}
          >
            <TeamDetailPage />
          </PermissionGuard>
        ),
      },
      {
        // User Management: requires MANAGE_USERS (Admin only)
        path: 'users',
        element: (
          <PermissionGuard
            permission="MANAGE_USERS"
            fallback={<ForbiddenPage requiredPermission="MANAGE_USERS" />}
          >
            <UserManagementPage />
          </PermissionGuard>
        ),
      },
      {
        // System Settings: requires VIEW_SYSTEM_SETTINGS (Admin only)
        path: 'settings',
        element: (
          <PermissionGuard
            permission="VIEW_SYSTEM_SETTINGS"
            fallback={<ForbiddenPage requiredPermission="VIEW_SYSTEM_SETTINGS" />}
          >
            <SettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
