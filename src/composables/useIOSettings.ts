/**
 * IO Settings
 */
import { ref } from 'vue';

const settings = ref({
  theme: 'light',
  language: 'en',
  notifications: true,
});

export function useIOSettings() {
  function updateSetting(key: string, value: unknown) {
    Object.assign(settings.value, { [key]: value });
  }

  return {
    settings,
    updateSetting,
  };
}

export default useIOSettings;
