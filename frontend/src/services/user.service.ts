import { useMemo } from 'react';
import { User } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';
import { requirePermission } from './rbac';

export const userService = {
  getUsers: (): User[] => {
    return mockStore.getUsers();
  },

  getUserById: (id: string): User | undefined => {
    return mockStore.getUserById(id);
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'MANAGE_USERS');
    return mockStore.createUser(userData);
  },

  updateUser: (id: string, updates: Partial<User>): User | undefined => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'MANAGE_USERS');
    return mockStore.updateUser(id, updates);
  },
};

export function useUsers(): User[] {
  const state = useStoreState();
  return state.users;
}

export function useUser(userId: string): User | undefined {
  const state = useStoreState();
  return useMemo(() => {
    return state.users.find((u) => u.id === userId);
  }, [state.users, userId]);
}
