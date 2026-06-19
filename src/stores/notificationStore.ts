/**
 * Notification Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Array<{ id: string; message: string; type: string }>>([]);

  function addNotification(message: string, type: string = 'info') {
    const id = Date.now().toString();
    notifications.value.push({ id, message, type });
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id);
    }, 5000);
  }

  function clearNotifications() {
    notifications.value = [];
  }

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
});
