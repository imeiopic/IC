import { ref } from 'vue';

export interface ToastMessage {
  id: number;
  text: string;
}

const errorQueue = ref<ToastMessage[]>([]);

export function useError() {
  const setGlobalError = (msg: string) => {
    // Add to queue with a timestamp ID to ensure uniqueness
    errorQueue.value.push({ id: Date.now(), text: msg });
  };

  const removeError = (id: number) => {
    errorQueue.value = errorQueue.value.filter(e => e.id !== id);
  };

  return { errorQueue, setGlobalError, removeError };
}