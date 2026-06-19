<template>
  <div
    class="p-4 bg-black text-white border-2 border-cyan-900 font-mono w-full shadow-2xl relative select-none"
  >
    <header class="mb-6">
      <span class="text-[9px] text-cyan-500 font-bold uppercase"
        >// MUNICIPLE_MESH // SECURE_LOCATION_RESOLVER</span
      >
      <h2 class="text-xl font-black">URBAN_ANCHOR_QUERY</h2>
    </header>

    <div class="space-y-4">
      <div class="relative">
        <input
          v-model="query"
          @keyup.enter="resolveAnchor"
          placeholder="ENTER_ANCHOR_LOCATION // ANONYMIZED_QUERY"
          class="w-full bg-neutral-950 border border-cyan-900 p-3 text-sm text-cyan-100 outline-none focus:border-cyan-500"
          :disabled="isResolving"
        />
        <button
          v-if="query"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-900 hover:text-cyan-400 text-xs transition-colors"
        >
          [ CLEAR ]
        </button>
      </div>

      <div v-if="resolvedAnchor" class="p-4 bg-cyan-950/20 border border-cyan-900">
        <p class="text-xs text-cyan-400 uppercase font-black">
          ANCHOR_RESOLVED: {{ resolvedAnchor.name }}
        </p>
        <p class="text-[9px] text-neutral-500">
          COORDINATE_MESH: {{ resolvedAnchor.lat }} // {{ resolvedAnchor.lng }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@composables/useAuth';
import { app } from '@/firebase';
import { callFirebaseFunction } from '@/api';

const { user } = useAuth();
const emit = defineEmits(['anchor-saved']);
const query = ref('');
const isResolving = ref(false);
const resolvedAnchor = ref<{ name: string; lat: number; lng: number } | null>(null);

const clearSearch = () => {
  query.value = '';
  resolvedAnchor.value = null;
};

const resolveAnchor = async () => {
  if (!query.value || isResolving.value) return;
  isResolving.value = true;

  // CRITICAL: We do not call Google directly.
  // We call our internal Iopic Proxy which scrubs all telemetry.
  const response = await fetch('/api/sovereign-proxy/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query.value, suid: 'IME_ROOT_SESSION' }), // SUID for internal tracking, scrubbed by proxy
  });

  if (response.ok) {
    const data = await response.json();
    resolvedAnchor.value = data;

    // Automatically ground the resolved anchor into the user's Firestore entity list
    if (user.value && data) {
      try {
        await callFirebaseFunction(app, 'saveUrbanAnchor', {
          userId: user.value.uid,
          name: data.name,
          lat: data.lat,
          lng: data.lng,
        });
        emit('anchor-saved');
        clearSearch(); // Clear noise after successful grounding
      } catch (err) {
        console.error('MUNICIPLE_MESH: auto-save sequence failed:', err);
      }
    }
  } else {
    console.error('MUNICIPLE_MESH: Failed to resolve anchor.', await response.text());
    resolvedAnchor.value = null;
  }
  isResolving.value = false;
};
</script>
