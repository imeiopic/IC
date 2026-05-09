<template>
  <div class="e-node p-6 bg-slate-950 border-l-4 border-violet-500 rounded-xl shadow-2xl">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-black text-white uppercase italic">Entity Builder</h3>
      <div class="flex items-center space-x-2">
        <span class="text-[9px] font-mono text-violet-400 animate-pulse">GEMINI-AI SYNCED</span>
        <div class="w-2 h-2 bg-violet-500 rounded-full"></div>
      </div>
    </div>

    <div class="input-zone mb-6">
      <label class="text-[10px] text-slate-500 uppercase font-bold mb-2 block"
        >Define New Entity Logic</label
      >
      <div class="relative">
        <input
          v-model="entityQuery"
          placeholder="Describe the entity (e.g., 'Local Garden Thread')"
          class="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:border-violet-500 outline-none transition"
        />
        <button
          @click="generateEntity"
          class="absolute right-2 top-2 text-violet-400 hover:text-white"
        >
          <span class="material-icons text-sm">auto_awesome</span>
        </button>
      </div>
    </div>

    <div v-if="generatedMenu" class="menu-preview border-t border-slate-800 pt-6">
      <p class="text-[10px] text-slate-500 uppercase mb-3">Proposed Entity Menu</p>
      <div class="space-y-2">
        <div
          v-for="item in generatedMenu"
          :key="item"
          class="p-2 bg-violet-950/20 border border-violet-500/30 rounded text-xs text-violet-100 flex justify-between"
        >
          {{ item }}
          <span class="text-[8px] text-slate-500 uppercase">Wired</span>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-between items-center">
      <p class="text-[8px] text-slate-600 italic">"Creation is a shared thread."</p>
      <p class="text-[9px] font-mono text-white uppercase tracking-tighter">
        Auth: Ime Iopic + Gemini
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const entityQuery = ref('');
const generatedMenu = ref(null);

const generateEntity = () => {
  // Logic: Send query to Gemini via the 16-thread bus
  console.log(`Gemini is architecting entity: ${entityQuery.value}`);
  // Simulated AI response
  generatedMenu.value = ['Logic-Check', 'Symmetry-Verify', 'Heartbeat-Link'];
};
</script>
