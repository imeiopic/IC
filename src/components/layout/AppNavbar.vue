<script setup lang="ts">
import { computed } from 'vue';
import { useMeshStore } from '@/stores/meshStore';

const props = defineProps<{
  user: any | null;
  role: string | null;
  shieldActive: boolean;
}>();

const mesh = useMeshStore();
const emit = defineEmits(['logout', 'open-profile', 'open-rider', 'open-driver']);

// Dynamic class for the shield status to indicate thread-mesh integrity
const shieldClass = computed(() => props.shieldActive ? 'text-success' : 'text-danger');
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-zinc-800">
    <CContainer fluid>
      <div class="brand-group">
        <a class="navbar-brand text-glow text-info font-black" href="#">VRE_NETWORK</a>
        <span class="ms-3 text-info font-mono" style="font-size: 0.7rem;">
          MESH_LATENCY: {{ mesh.meshLatency }}ms
        </span>
      </div>
      
      <div class="d-flex align-items-center gap-3">
        <div class="d-flex align-items-center gap-1 me-3">
          <i :class="['bi', shieldActive ? 'bi-shield-fill-check' : 'bi-shield-slash', shieldClass]"></i>
          <span :class="['fw-bold text-uppercase', shieldClass]" style="font-size: 0.65rem;">
            {{ shieldActive ? 'SHIELD_ACTIVE' : 'SHIELD_OFF' }}
          </span>
        </div>

        <span class="navbar-text me-3 text-white-50 font-mono small">
          NODE: {{ user?.uid.substring(0, 8) }} | THREAD: T-{{ mesh.activeThreads }}
        </span>

        <CButtonGroup size="sm">
          <CButton color="primary" variant="outline" @click="emit('open-profile')">PROFILE</CButton>
          <CButton v-if="role === 'buyer'" color="info" variant="outline" @click="emit('open-rider')">RIDER</CButton>
          <CButton v-if="role === 'driver'" color="warning" variant="outline" @click="emit('open-driver')">DRIVER</CButton>
        </CButtonGroup>

        <CButton color="danger" size="sm" @click="emit('logout')">LOGOUT</CButton>
      </div>
    </CContainer>
  </nav>
</template>

<style scoped>
.text-glow { text-shadow: 0 0 8px rgba(0, 229, 255, 0.5); }
.brand-group { display: flex; align-items: center; }
</style>