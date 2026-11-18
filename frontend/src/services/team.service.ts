import { useMemo } from 'react';
import { Team } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';

export const teamService = {
  getTeams: (): Team[] => {
    return mockStore.getTeams();
  },

  getTeamById: (id: string): Team | undefined => {
    return mockStore.getTeamById(id);
  },
};

export function useTeams(): Team[] {
  const state = useStoreState();
  return state.teams;
}

export function useTeam(teamId: string): Team | undefined {
  const state = useStoreState();
  return useMemo(() => {
    return state.teams.find((t) => t.id === teamId);
  }, [state.teams, teamId]);
}
