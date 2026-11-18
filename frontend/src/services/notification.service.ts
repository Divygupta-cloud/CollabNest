import { Notification, ActivityItem } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';

export const notificationService = {
  getNotifications: (): Notification[] => {
    return mockStore.getNotifications();
  },

  markAsRead: (id: string): void => {
    mockStore.markNotificationAsRead(id);
  },

  markAllAsRead: (): void => {
    mockStore.markAllNotificationsAsRead();
  },

  getActivities: (): ActivityItem[] => {
    return mockStore.getActivities();
  },
};

export function useNotifications(): Notification[] {
  const state = useStoreState();
  return state.notifications;
}

export function useActivities(): ActivityItem[] {
  const state = useStoreState();
  return state.activities;
}
