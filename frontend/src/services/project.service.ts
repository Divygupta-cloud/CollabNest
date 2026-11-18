import { useMemo } from 'react';
import { Project } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';

export const projectService = {
  getProjects: (): Project[] => {
    return mockStore.getProjects();
  },

  getProjectByKey: (key: string): Project | undefined => {
    return mockStore.getProjectByKey(key);
  },

  getProjectById: (id: string): Project | undefined => {
    return mockStore.getProjectById(id);
  },

  toggleStarred: (id: string): Project | undefined => {
    return mockStore.toggleProjectStar(id);
  },

  updateProject: (id: string, updates: Partial<Project>): Project | undefined => {
    return mockStore.updateProject(id, updates);
  },
};

export function useProjects(): Project[] {
  const state = useStoreState();
  return state.projects;
}

export function useProject(projectKey: string): Project | undefined {
  const state = useStoreState();
  return useMemo(() => {
    return state.projects.find((p) => p.key.toUpperCase() === projectKey.toUpperCase());
  }, [state.projects, projectKey]);
}
