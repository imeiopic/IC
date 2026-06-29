<template>
  <div class="o-node p-5 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl">
    <div class="flex justify-between items-center mb-6">
      <div class="flex flex-col">
        <span class="text-[8px] text-slate-500 uppercase tracking-[.3em]">Order Thread</span>
        <h4 class="text-xs font-mono text-white">#{{ orderData.id }}</h4>
      </div>
      <div
        class="status-pill px-2 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10"
      >
        <span class="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{{
          orderData.stage
        }}</span>
      </div>
    </div>

    <div
      class="transfer-viz relative h-20 bg-black/40 rounded-lg mb-6 flex items-center px-4 overflow-hidden"
    >
      <div class="flex-1 flex justify-between items-center z-10">
        <div class="buyer-side">
          <p class="text-[8px] text-slate-500 uppercase mb-1">Debit</p>
          <p class="text-sm font-black text-white">
            -{{ orderData.amount.toFixed(2) }} <span class="text-[10px] text-slate-500">IO$</span>
          </p>
        </div>
        <div class="split-icon flex flex-col items-center">
          <div class="h-px w-12 bg-gradient-to-r from-emerald-500 to-indigo-500"></div>
          <span class="text-[7px] text-cyan-400 font-bold mt-1 uppercase tracking-widest"
            >Molecule Split</span
          >
        </div>
        <div class="seller-side text-right">
          <p class="text-[8px] text-slate-500 uppercase mb-1">Credit</p>
          <p class="text-sm font-black text-indigo-400">
            +{{ (orderData.amount * 0.95).toFixed(2) }}
            <span class="text-[10px] text-slate-500">IO$</span>
          </p>
        </div>
      </div>
      <div
        class="absolute bottom-0 left-0 h-1 bg-cyan-500/50 shadow-[0_0_10px_#22d3ee]"
        :style="{ width: '100%' }"
      ></div>
    </div>

    <div class="space-y-3">
      <div class="flex justify-between items-center text-[10px]">
        <span class="text-slate-500">Infrastructure Lubricant (5%)</span>
        <span class="text-cyan-400 font-mono">{{ (orderData.amount * 0.05).toFixed(2) }} IO$</span>
      </div>
      <div class="flex justify-between items-center text-[10px]">
        <span class="text-slate-500">Coordinate Proximity</span>
        <span class="text-emerald-400">VERIFIED</span>
      </div>
    </div>

    <button
      v-if="orderData.stage !== 'SETTLED'"
      @click="$emit('close')"
      class="w-full mt-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:invert transition"
    >
      Confirm Physical Handshake
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  orderData: {
    type: Object,
    required: true
  }
});
</script>
