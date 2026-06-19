<template>
  <div class="municipality-node bg-black text-white min-vh-100 p-4 font-mono">
    <header
      class="d-flex justify-content-between align-items-center border-bottom border-zinc-800 pb-3 mb-4"
    >
      <div>
        <h1 class="font-black h4 mb-0">{{ clusterName }}_CORE</h1>
        <p class="extra-tiny text-info italic mb-0">
          Coord: {{ coordinates.lat }}, {{ coordinates.lng }}
        </p>
      </div>
      <div class="status-pulse d-flex align-items-center gap-2">
        <div class="pulse-dot bg-success rounded-circle" style="width: 8px; height: 8px"></div>
        <span class="tiny uppercase">Mesh_Synchronized</span>
      </div>
    </header>

    <div v-if="loading" class="text-center text-info mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Synchronizing with Municipality Node...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger mt-5" role="alert">Error: {{ error }}</div>

    <div v-else class="row g-4">
      <div class="col-md-4">
        <div class="stat-card border border-zinc-800 p-3 rounded">
          <h6 class="extra-tiny text-zinc-500 uppercase">Grounded_Citizens</h6>
          <h2 class="font-black text-glow">{{ citizenCount }}</h2>
          <div class="progress bg-zinc-900 mt-2" style="height: 4px">
            <div class="progress-bar bg-info" :style="{ width: saturation + '%' }"></div>
          </div>
          <p class="extra-tiny mt-2 text-zinc-500">Saturation: {{ saturation }}%</p>
        </div>
      </div>

      <div class="col-md-8">
        <div class="infrastructure-grid border border-zinc-800 p-3 rounded">
          <h6 class="extra-tiny text-zinc-500 uppercase mb-3">Active_Symmetric_Entities</h6>
          <div v-if="localEntities.length > 0" class="row g-2">
            <div v-for="entity in localEntities" :key="entity.id" class="col-6 col-lg-3">
              <div class="entity-chip bg-zinc-950 border border-zinc-800 p-2 text-center rounded">
                <div class="extra-tiny text-zinc-500">{{ entity.type }}</div>
                <div class="tiny font-black text-info">{{ entity.name || entity.id }}</div>
                <div
                  class="extra-tiny"
                  :class="{
                    'text-success': entity.operationalStatus === 'ACTIVE',
                    'text-warning': entity.operationalStatus === 'DEGRADED',
                    'text-danger': entity.operationalStatus === 'OFFLINE'
                  }"
                >
                  {{ entity.operationalStatus }}
                </div>
              </div>
            </div>
          </div>
          <p v-else class="tiny text-zinc-400">No local entities sighted.</p>
        </div>
      </div>

      <div class="col-12">
        <div class="law-terminal bg-zinc-950 border border-zinc-800 p-3 rounded">
          <h6 class="extra-tiny text-zinc-500 uppercase mb-3">0010_GOV_Command_Terminal</h6>
          <div class="terminal-output bg-black p-3 tiny border border-zinc-900 rounded">
            <div class="text-success">&gt;&gt;&gt; Policing local 1:16 wage spread... [OK]</div>
            <div class="text-success">
              &gt;&gt;&gt; Sighting regional utility pressure... [STABLE]
            </div>
            <div class="text-info">&gt;&gt;&gt; Transit handshake with Global_Mesh... [ACTIVE]</div>
            <div class="text-zinc-600 mt-2">Waiting for new civic pulses...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/firebase'; // Assuming firebase.ts exports the initialized app

interface Coordinates {
  lat: string;
  lng: string;
}

interface LocalEntity {
  id: string;
  name?: string; // Name is optional, fallback to ID
  type: string;
  operationalStatus: string;
}

const route = useRoute();

const clusterName = ref('Loading...');
const coordinates = ref<Coordinates>({ lat: 'N/A', lng: 'N/A' });
const citizenCount = ref<number | string>(0);
const saturation = ref(0);
const localEntities = ref<LocalEntity[]>([]);

const loading = ref(true);
const error = ref<string | null>(null);

const functionsInstance = getFunctions(app);
const getMunicipalityDetailsCallable = httpsCallable(functionsInstance, 'getMunicipalityDetails');

const fetchMunicipalityDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const municipalityId = route.params.municipalityId as string;
    if (!municipalityId) {
      throw new Error('Municipality ID not provided in route parameters.');
    }

    const result = await getMunicipalityDetailsCallable({ municipalityId });
    const data = result.data as any; // Cast to any for now, define a proper interface later

    clusterName.value = data.clusterName;
    coordinates.value = data.coordinates;
    citizenCount.value = data.citizenCount;
    saturation.value = data.saturation;
    localEntities.value = data.localEntities;
  } catch (e: any) {
    console.error('Error fetching municipality details:', e);
    error.value = e.message || 'Failed to load municipality details.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMunicipalityDetails();
});
</script>

<style scoped>
.text-glow {
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.7rem;
}
.extra-tiny {
  font-size: 0.55rem;
}
.italic {
  font-style: italic;
}
</style>
