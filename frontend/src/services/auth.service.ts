import { User } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';

export const authService = {
  getCurrentUser: (): User => {
    return mockStore.getCurrentUser();
  },

  switchUser: (user: User): void => {
    mockStore.setCurrentUser(user);
  },

  loginWithUserId: (userId: string): User | undefined => {
    const user = mockStore.getUserById(userId);
    if (user) {
      mockStore.setCurrentUser(user);
    }
    return user;
  },

  logout: (): void => {
    const defaultUser = mockStore.getUsers()[0];
    mockStore.setCurrentUser(defaultUser);
  },
};

export function useCurrentUser(): User {
  const state = useStoreState();
  return state.currentUser;
}
