<template>
  <div
    class="together-node p-8 bg-slate-950 border-t-4 border-white rounded-3xl shadow-[0_0_60px_rgba(255,255,255,0.05)] mt-6"
  >
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-black text-white uppercase italic tracking-tighter">Together</h2>
        <p class="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
          Synergy Protocol: MULTI-THREAD SYNC
        </p>
      </div>
      <div class="sync-count text-right">
        <span class="block text-[10px] text-slate-500 uppercase">Active Bonds</span>
        <span class="text-2xl font-black text-white">{{ activeBonds }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="project in projects"
        :key="project.name"
        class="project-card p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/40 transition cursor-pointer"
      >
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-sm font-bold text-white uppercase">{{ project.name }}</h4>
          <span
            class="text-[9px] px-2 py-0.5 rounded"
            :class="{
              'bg-emerald-500/20 text-emerald-400': project.badge === 'emerald',
              'bg-indigo-500/20 text-indigo-400': project.badge === 'indigo'
            }"
          >
            {{ project.status }}
          </span>
        </div>
        <p class="text-xs text-slate-400 mb-4 italic">{{ project.description }}</p>
        <div class="w-full bg-slate-800 h-1 rounded-full">
          <div
            class="h-full"
            :class="{
              'bg-white': project.badge === 'emerald',
              'bg-indigo-400': project.badge === 'indigo'
            }"
            :style="{ width: project.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div
      class="mt-10 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-dashed border-white/20 text-center"
    >
      <p class="text-xs text-white font-bold uppercase mb-4 tracking-widest">
        Contribute Your Thread
      </p>
      <div class="flex justify-center gap-4">
        <button
          class="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full hover:invert transition"
        >
          Offer Skill-Thread
        </button>
        <button
          class="px-6 py-2 border border-white text-white text-[10px] font-black uppercase rounded-full hover:bg-white hover:text-black transition"
        >
          Pledge Energy-Equity
        </button>
      </div>
    </div>

    <div
      class="mt-8 pt-4 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono"
    >
      <span class="text-slate-600 uppercase italic">"I am because We act."</span>
      <span class="text-white font-bold uppercase tracking-widest">Auth: Ime Iopic</span>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useNetStore } from '@/stores/netStore';
const netStore = useNetStore();
const { activeBonds, projects } = storeToRefs(netStore);
</script>
