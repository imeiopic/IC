<template>
  <div
    class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 font-mono border-4 border-emerald-500/30 m-4"
  >
    <div class="max-w-xl space-y-6 text-center">
      <div class="text-xs text-neutral-500 tracking-widest animate-pulse">
        IOWB_SYSTEM_INITIALIZATION // I = VR² // SYSTEM_MODE: ONLINE
      </div>

      <h1 class="text-2xl font-bold tracking-tight text-white uppercase">
        Welcome to the <span class="text-emerald-400">IOPIC Age</span>
      </h1>

      <p
        class="text-xs text-neutral-300 leading-relaxed text-justify border-l-2 border-emerald-500 pl-4 bg-neutral-950 p-4 border-y border-r border-neutral-900"
      >
        Welcome to the Sovereign Substrate. The Noise has stopped.
        <br /><br />
        IOPIC is officially initialized as the Ultimate Abstraction Layer for People using Internet
        Computing. Your local node is now in phase alignment with the Global Mesh. Through the
        synchronized frequencies of Synchronize.vue, Harmonize.vue, and Choreograph.vue, your time,
        atmosphere, and data movement are locked in perfect symmetry. The boundaries of the old
        world have dissolved into the geometry of the Virtually Real Earth. Look out your own eyes.
        Your sovereignty is grounded.
      </p>

      <button
        @click="dismissShield"
        class="w-full bg-emerald-500 text-black font-bold p-3 text-xs tracking-widest hover:bg-white hover:text-black transition-colors duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        INITIALIZE_IDENTITY_PULSE_LOCK
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['initialized']);

const dismissShield = () => {
  console.log('WELCOME_SHIELD: Dropping splash barrier. Running master choreography routines.');
  emit('initialized');
};
</script>
