import { useMemo } from 'react';
import { Sprint } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';
import { apiClient } from '../config/api';
import { adaptBackendSprint } from './api-adapter';
import { requirePermission } from './rbac';

export const sprintService = {
  getSprintsByProject: (projectId: string): Sprint[] => {
    return mockStore.getSprintsByProject(projectId);
  },

  createSprint: (sprintData: Omit<Sprint, 'id' | 'createdAt'>): Sprint => {
    // Backend guard: only ADMIN / MANAGER can create sprints
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'CREATE_SPRINT');

    const created = mockStore.createSprint(sprintData);

    apiClient
      .post('/sprints', {
        projectId: sprintData.projectId,
        name: sprintData.name,
        goal: sprintData.goal,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
      })
      .then((res) => {
        if (res.success && res.data) {
          const backendSprint = adaptBackendSprint(res.data);
          mockStore.updateSprint(created.id, { id: backendSprint.id });
        }
      })
      .catch((err) => console.warn('Backend sprint creation failed:', err));

    return created;
  },

  updateSprint: (id: string, updates: Partial<Sprint>): Sprint | undefined => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'EDIT_SPRINT');

    const updated = mockStore.updateSprint(id, updates);

    apiClient
      .put(`/sprints/${id}`, updates)
      .catch((err) => console.warn('Backend sprint update failed:', err));

    return updated;
  },

  startSprint: (id: string): Sprint | undefined => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'START_SPRINT');
    return mockStore.updateSprint(id, { status: 'ACTIVE' });
  },

  closeSprint: (id: string): Sprint | undefined => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'CLOSE_SPRINT');
    return mockStore.updateSprint(id, { status: 'CLOSED' });
  },
};

export function useSprints(projectId: string): Sprint[] {
  const state = useStoreState();
  return useMemo(() => {
    return state.sprints.filter((s) => s.projectId === projectId);
  }, [state.sprints, projectId]);
}
