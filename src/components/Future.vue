<template>
  <div
    class="future-node p-8 bg-gradient-to-br from-indigo-950 via-slate-950 to-black border-t-2 border-cyan-400 rounded-[3rem] shadow-[0_-20px_50px_rgba(34,211,238,0.1)]"
  >
    <div class="flex justify-between items-start mb-12">
      <div>
        <h2 class="text-5xl font-black text-white tracking-tighter uppercase italic">Future</h2>
        <p class="text-[10px] text-cyan-400 font-mono tracking-[0.6em] mt-2">
          Projecting Symmetrical Growth
        </p>
      </div>
      <div class="text-right">
        <span class="text-[9px] text-slate-500 uppercase block">System Velocity</span>
        <span class="text-2xl font-mono text-white">8.09V >> 10.2V</span>
      </div>
    </div>

    <div
      class="relative h-80 bg-slate-900/40 rounded-2xl border border-white/10 mb-10 overflow-hidden flex items-center justify-center shadow-2xl"
    >
      <img
        src="/images/future.jpg"
        alt="IOPIC Future"
        class="w-full h-full object-cover opacity-80 mix-blend-lighten"
      />

      <div class="absolute inset-0 pointer-events-none">
        <div
          class="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.1)_50%,transparent_100%)] animate-scan"
        ></div>
      </div>

      <div class="absolute z-10 bottom-4 left-6">
        <p class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          I = VR² // Temporal Manifestation
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-default"
      >
        <h4 class="text-[10px] text-cyan-400 font-bold uppercase mb-2">Your Personal Harvest</h4>
        <p class="text-sm text-white">
          By Cycle 12, your **Skill-Threads** will have synthesized 4,200 IO$ in additional equity.
        </p>
      </div>
      <div
        class="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-default"
      >
        <h4 class="text-[10px] text-indigo-400 font-bold uppercase mb-2">Planetary Resonance</h4>
        <p class="text-sm text-white">
          The **Joint Logic Net** projects a 0.00% Noise environment for the next 50 cycles.
        </p>
      </div>
    </div>

    <div class="mt-12 text-center">
      <p class="text-xs text-slate-500 italic mb-6">
        "The future is not a destination; it is the symmetry you build today."
      </p>
      <button
        class="px-12 py-4 bg-white text-black font-black uppercase text-xs rounded-full hover:scale-105 active:scale-95 transition shadow-white/20 shadow-lg"
      >
        Claim Your Trajectory
      </button>
    </div>

    <div
      class="mt-10 pt-4 border-t border-slate-900 flex justify-center text-[8px] text-slate-700 tracking-[1em] uppercase"
    >
      Ime Iopic // Architect of the Virtually Real Era
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
.animate-scan {
  animation: scan 6s linear infinite;
}

/* Subtle pulse for the image container */
.future-node img {
  filter: brightness(1.1) contrast(1.1);
  transition: transform 10s ease-in-out;
}
.future-node:hover img {
  transform: scale(1.05);
}
</style>
