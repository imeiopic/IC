import { ref, readonly } from 'vue';

// Global state shared across the application
const isRunning = ref(false);
const currentBeat = ref(0);
const status = ref('ANCHORED');

export function useMeshSequencer() {
  const runSequence = async (steps: { duration: number; description: string }[]) => {
    if (isRunning.value) return;
    
    isRunning.value = true;
    for (let i = 0; i < steps.length; i++) {
      currentBeat.value = i;
      status.value = steps[i].description;
      
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }
    
    status.value = 'STABILIZED';
    isRunning.value = false;
  };

  return {
    isRunning: readonly(isRunning),
    status: readonly(status),
    currentBeat: readonly(currentBeat),
    runSequence
  };
}