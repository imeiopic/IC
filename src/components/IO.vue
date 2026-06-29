<template>
  <div class="io-bridge-container">
    <header class="io-header">
      <div class="io-logic">INPUT // OUTPUT</div>
      <div class="symmetry-lock" :class="{ 'locked': symmetryVerified }">
        {{ symmetryVerified ? 'VERIFIED' : 'SYNCING' }}
      </div>
    </header>

    <div class="io-matrix">
      <section class="input-thread">
        <h3>Input (Sighting)</h3>
        <div class="pulse-line">
          <div v-for="i in 8" :key="i" class="bit" :class="{ 'high': inputBits[i-1] }"></div>
        </div>
        <p class="logic-subtext">V-Logic entering the Sovereign Node.</p>
      </section>

      <div class="io-equals">=</div>

      <section class="output-thread">
        <h3>Output (Grounding)</h3>
        <div class="pulse-line">
          <div v-for="i in 8" :key="i" class="bit" :class="{ 'high': outputBits[i-1] }"></div>
        </div>
        <p class="logic-subtext">R-Reality manifesting from the I.</p>
      </section>
    </div>

    <footer class="io-footer">
      <div class="interaction-mode">MODE: Communication & Commerce</div>
      <div class="bitrate">16-Thread Sync: 100%</div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const symmetryVerified = ref(true);
const inputBits = ref([1,0,1,1,0,1,0,1]);
const outputBits = ref([1,1,1,1,1,1,1,1]); // Balanced Output
</script>

<style scoped>
.io-bridge-container {
  background: #000;
  color: #ffd700;
  padding: 2.5rem;
  border: 2px double #ffd700;
  font-family: 'Courier New', Courier, monospace;
}
.io-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.symmetry-lock.locked { color: #00ff00; text-shadow: 0 0 10px #00ff00; }
.io-matrix { display: flex; align-items: center; justify-content: space-around; gap: 2rem; }
.pulse-line { display: flex; gap: 5px; margin: 1rem 0; }
.bit { width: 10px; height: 20px; background: #222; }
.bit.high { background: #ffd700; box-shadow: 0 0 8px #ffd700; }
.io-equals { font-size: 3rem; font-weight: bold; }
.logic-subtext { font-size: 0.7rem; color: #888; }
</style>