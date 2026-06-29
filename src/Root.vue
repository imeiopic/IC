<template>
  <div id="iopic-root" class="min-h-screen bg-black text-slate-200">
    <div
      v-if="isKernelLoading"
      class="kernel-overlay fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
    >
      <div class="logo-animation mb-6">
        <h1 class="text-4xl font-black text-white italic">
          iopic<span class="text-cyan-500">.world</span>
        </h1>
      </div>
      <div class="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div class="bg-cyan-400 h-full animate-pulse-width"></div>
      </div>
      <p class="mt-4 font-mono text-[9px] text-cyan-600 tracking-[0.3em] uppercase">
        Active Defense Kernel: Purging Legacy Static...
      </p>
    </div>

    <div v-else class="system-canvas relative">
      <div class="fixed inset-0 z-0 pointer-events-none">
        <VirtuallyRealEarth class="opacity-30" />
      </div>

      <main class="relative z-10 pt-24 pb-12 max-w-7xl mx-auto px-6">
        <router-view v-slot="{ Component }">
          <transition name="thread-shift" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <footer
        class="fixed bottom-0 w-full z-20 py-2 px-6 bg-black/60 backdrop-blur-md border-t border-slate-900 flex justify-between items-center"
      >
        <span class="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          Auth: Ime Iopic // Kernel v8.09
        </span>
        <span class="text-[9px] font-mono text-cyan-500 uppercase"> Sync Status: Symmetrical </span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRootStore } from './stores/rootStore';

import VirtuallyRealEarth from './components/VirtuallyRealEarth.vue';

const rootStore = useRootStore();
const isKernelLoading = ref(true);

onMounted(() => {
  // Terminal 10 Sync Simulation
  setTimeout(() => {
    isKernelLoading.value = false;
    console.log('Root Sync Complete.');
  }, 2000);
});
</script>

<style scoped>
.animate-pulse-width {
  animation: grow 2s ease-in-out forwards;
}

@keyframes grow {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

/* Thread Transition Logic */
.thread-shift-enter-active,
.thread-shift-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.thread-shift-enter-from {
  opacity: 0;
  filter: blur(10px);
  transform: scale(0.98);
}
.thread-shift-leave-to {
  opacity: 0;
  filter: blur(10px);
  transform: scale(1.02);
}
</style>
