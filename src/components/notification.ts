// src/stores/notification.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  icon?: string; // e.g., 'bi-check-circle-fill', 'bi-exclamation-triangle-fill'
  duration?: number; // in ms, defaults to 3000 for success/info, 5000 for warning/error
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  let notificationIdCounter = 0;

  /**
   * Adds a new notification to the stack.
   * @param type The type of notification ('success', 'error', 'info', 'warning').
   * @param message The message content of the notification.
   * @param icon Optional custom Bootstrap icon class (e.g., 'bi-bell-fill').
   * @param duration Optional duration in milliseconds before the notification auto-dismisses.
   */
  const addNotification = (
    type: Notification['type'],
    message: string,
    icon?: string,
    duration?: number
  ) => {
    const defaultDuration = {
      success: 3000,
      info: 3000,
      warning: 5000,
      error: 7000, // Errors might need more time to read
    };

    const newNotification: Notification = {
      id: notificationIdCounter++,
      type,
      message,
      icon: icon || getDefaultIcon(type),
      duration: duration || defaultDuration[type],
    };

    notifications.value.push(newNotification);

    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const getDefaultIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      case 'warning': return 'bi-exclamation-circle-fill';
      default: return 'bi-bell-fill';
    }
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
});