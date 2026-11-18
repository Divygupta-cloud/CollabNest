import { apiClient } from '../config/api';
import { mockStore } from '../mocks/store';
import {
  adaptBackendIssue,
  adaptBackendProject,
  adaptBackendSprint,
  adaptBackendUser,
  adaptBackendTeam,
} from './api-adapter';
import { Sprint } from '../types';

let isSyncing = false;

export async function initializeBackendSync(): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;

  try {
    // 1. Health check
    const health = await apiClient.get('/health');
    if (!health.success || health.data?.status !== 'ok') {
      return false;
    }

    // 2. Ensure authentication
    let token = apiClient.getToken();
    if (!token) {
      const loginRes = await apiClient.post('/auth/login', {
        username: 'admin',
        password: 'password123',
      });
      if (loginRes.success && loginRes.data?.token) {
        token = loginRes.data.token;
        apiClient.setToken(token);
        if (loginRes.data.user) {
          mockStore.setCurrentUser(adaptBackendUser(loginRes.data.user));
        }
      }
    } else {
      const meRes = await apiClient.get('/auth/me');
      if (meRes.success && meRes.data) {
        mockStore.setCurrentUser(adaptBackendUser(meRes.data));
      } else {
        // Token expired, re-login
        const loginRes = await apiClient.post('/auth/login', {
          username: 'admin',
          password: 'password123',
        });
        if (loginRes.success && loginRes.data?.token) {
          apiClient.setToken(loginRes.data.token);
          if (loginRes.data.user) {
            mockStore.setCurrentUser(adaptBackendUser(loginRes.data.user));
          }
        }
      }
    }

    // 3. Fetch all core entities in parallel
    const [projectsRes, issuesRes, usersRes, teamsRes] = await Promise.all([
      apiClient.get('/projects'),
      apiClient.get('/issues?limit=100'),
      apiClient.get('/users'),
      apiClient.get('/teams'),
    ]);

    const partialState: Record<string, any> = {};

    if (projectsRes.success && Array.isArray(projectsRes.data)) {
      partialState.projects = projectsRes.data.map(adaptBackendProject);
    }

    if (issuesRes.success && Array.isArray(issuesRes.data)) {
      partialState.issues = issuesRes.data.map(adaptBackendIssue);
    }

    if (usersRes.success && Array.isArray(usersRes.data)) {
      partialState.users = usersRes.data.map(adaptBackendUser);
    }

    if (teamsRes.success && Array.isArray(teamsRes.data)) {
      partialState.teams = teamsRes.data.map(adaptBackendTeam);
    }

    // 4. Fetch sprints for all projects
    if (partialState.projects && partialState.projects.length > 0) {
      const allSprints: Sprint[] = [];
      await Promise.all(
        partialState.projects.map(async (project: any) => {
          const sprintsRes = await apiClient.get(`/sprints/project/${project.id}`);
          if (sprintsRes.success && Array.isArray(sprintsRes.data)) {
            allSprints.push(...sprintsRes.data.map(adaptBackendSprint));
          }
        })
      );
      if (allSprints.length > 0) {
        partialState.sprints = allSprints;
      }
    }

    // 5. Update local store with live backend data
    mockStore.syncWithBackend(partialState);
    console.log('✅ CollabNest successfully synced with backend API at http://localhost:5000/api');
    return true;
  } catch (err) {
    console.warn('Backend sync failed, continuing with mock store:', err);
    return false;
  } finally {
    isSyncing = false;
  }
}
