<template>
  <div id="app">
    <!-- Global Error Boundary Notification -->
    <div
      v-if="globalError"
      class="global-error-overlay alert alert-danger shadow-lg border-0 m-3"
      role="alert"
    >
      <div class="d-flex justify-content-between align-items-center">
        <span class="d-flex align-items-center gap-2">
          <span class="bi bi-shield-lock-fill" aria-hidden="true"></span>
          <strong class="text-uppercase">System Alert:</strong>
          {{ globalError }}
        </span>
        <button type="button" class="btn-close" @click="clearError" aria-label="Close"></button>
      </div>
    </div>

    <!-- Global Loading State: Prevents Navbar/UI flickering -->
    <div v-if="!isInitialized" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Initializing Reality...</span>
      </div>
    </div>

    <nav class="main-nav" v-if="isInitialized">
      <router-link :to="{ name: 'IopicSoleProprietorship' }" class="nav-link">
        Iopic.org – Sole Proprietorship Manifesto
      </router-link>
      <router-link :to="{ name: 'OrderTakerNodeRoles' }" class="nav-link">
        OrderTaker Node Roles
      </router-link>
      <router-link :to="{ name: 'IOTLawAndOrder' }" class="nav-link">
        IO Law & Order for IoT
      </router-link>

      <router-link :to="{ name: 'IOTPolicyManager' }" class="nav-link">
        IoT Policy Manager
      </router-link>
      <router-link :to="{ name: 'IOTAuditDashboard' }" class="nav-link">
        IoT Audit Dashboard
      </router-link>
      <router-link :to="{ name: 'DICClient' }" class="nav-link">
        Direct Internet Communication
      </router-link>
      <router-link :to="{ name: 'DICChat' }" class="nav-link"> DIC Real-Time Chat </router-link>
    </nav>

    <router-view v-if="isInitialized" />

    <!-- Global Modal Substrate -->
    <GlobalModalContainer />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './useAuth';
import { useError } from './useError';
import GlobalModalContainer from './components/GlobalModalContainer.vue';

const { isInitialized } = useAuth();
const { globalError, clearError } = useError();
</script>

<style scoped>
.global-error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa; /* Matches light background */
}
</style>
