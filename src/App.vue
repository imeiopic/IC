<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

// Stores
import { useUserStore } from './stores/userStore';
import { useErrorStore } from './stores/error';
import { useLoadingStore } from './stores/loadingStore';

// Components
import AppNavbar from './components/layout/AppNavbar.vue';
import ChunkLoadErrorFallback from './components/ChunkLoadErrorFallback.vue';
import Spinner from './components/common/Spinner.vue';
import ToastNotification from './components/common/ToastNotification.vue';

const userStore = useUserStore();
const errorStore = useErrorStore();
const loadingStore = useLoadingStore();

// Reactive State
const { isChunkLoadError } = storeToRefs(errorStore);
const { isLoading } = storeToRefs(loadingStore);

// Dynamic View Loading: Only pulls the specific component needed
const RoleView = defineAsyncComponent(() => 
  import(`./components/RoleRouter.vue`) 
);

onMounted(() => {
  userStore.initializeAuth();
  // SPICE is your global infrastructure layer
  import('./SPICE').then(({ SPICE }) => SPICE.activateGlobalShield());
});

onUnmounted(() => userStore.clearSubscriptions());
</script>

<template>
  <div id="app" v-if="!isChunkLoadError">
    <div v-if="isLoading" class="global-loading">
      <Spinner />
      <p class="tiny">INITIALIZING_MESH_SUBSTRATE...</p>
    </div>
    
    <div v-else>
      <AppNavbar v-if="userStore.isAuthenticated" />
      <main class="main-content">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>
      <ToastNotification />
    </div>
  </div>
  
  <div v-else>
    <ChunkLoadErrorFallback />
  </div>
</template>