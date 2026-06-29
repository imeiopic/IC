import { reactive } from 'vue';

export function useInviteActions() {
  const deleting = reactive<Record<string, boolean>>({});
  const flipping = reactive<Record<string, boolean>>({});

  return { deleting, flipping };
}