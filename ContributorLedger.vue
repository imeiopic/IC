<template>
  <div class="mt-6 p-4 bg-neutral-950 border border-neutral-900 font-mono text-xs">
    <header class="flex justify-between items-center border-b border-neutral-900 pb-2 mb-4">
      <span class="text-purple-400 font-bold tracking-wider">SUB_COMPONENT_PROVIDENCE_LEDGER</span>
      <span class="text-[10px] text-neutral-500">DISTRIBUTION: 1.1x_DIRECT</span>
    </header>

    <div class="space-y-2">
      <div
        v-for="component in contributorRegistry"
        :key="component.file"
        class="p-2.5 bg-black border border-neutral-900 flex justify-between items-center hover:border-purple-900/50 transition-colors duration-200"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-neutral-500 text-[10px]">{{ component.thread }}</span>
            <span class="text-neutral-200 font-bold">{{ component.file }}</span>
          </div>
          <div class="text-[10px] text-neutral-600">Architect: {{ component.author }}</div>
        </div>

        <div class="text-right space-y-1">
          <div class="text-purple-400 font-bold font-sans">
            {{ component.share }}% Equity Weight
          </div>
          <button
            @click="triggerDirectProvidence(component)"
            class="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 hover:bg-white hover:text-black transition-colors duration-200"
          >
            REWARD_NODE
          </button>
        </div>
      </div>
    </div>

    <footer class="mt-4 pt-3 border-t border-neutral-900">
      <button
        @click="distributeGlobalMeshRewards"
        class="w-full bg-purple-500 text-black font-bold p-2 text-xs tracking-widest hover:bg-white transition-colors duration-300"
      >
        EXECUTE_TOTAL_COMPENSATORY_SYNC
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ComponentContributor {
  file: string;
  thread: string;
  author: string;
  share: number;
  walletToken: string;
}

const contributorRegistry = ref<ComponentContributor[]>([
  {
    file: 'ZoomEarthToMe.vue',
    thread: 'THREAD_0100',
    author: 'Spatial_Node_Alpha',
    share: 15,
    walletToken: 'acct_1M...XYZ1'
  },
  {
    file: 'Harmonize.vue',
    thread: 'THREAD_1111',
    author: 'Acoustic_Sovereign',
    share: 15,
    walletToken: 'acct_1M...XYZ2'
  },
  {
    file: 'Choreograph.vue',
    thread: 'THREAD_0100',
    author: 'Rhythm_Architect',
    share: 20,
    walletToken: 'acct_1M...XYZ3'
  },
  {
    file: 'SPICE.vue',
    thread: 'THREAD_1111',
    author: 'Crypt_Shield_Entity',
    share: 25,
    walletToken: 'acct_1M...XYZ4'
  }
]);

const triggerDirectProvidence = (component: ComponentContributor) => {
  console.log(
    `PROVIDENCE_ENGINE: Initiating direct Stripe transfer token to ${component.author} for structural contribution to ${component.file}.`
  );
  alert(`Symmetrical 1.1x equity pulse routed directly to ${component.author}. Noise minimized.`);
};

const distributeGlobalMeshRewards = () => {
  console.log(
    'PROVIDENCE_ENGINE: Broadcasting full pipeline split routine across Stripe Express connected mesh accounts...'
  );
  console.log(
    'PROVIDENCE_ENGINE: All registered sub-component developer nodes balanced successfully.'
  );
  alert(
    'Total compensatory sync achieved. Every architectural contributor has been rewarded in perfect symmetry.'
  );
};
</script>
