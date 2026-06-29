<template>
  <div class="sovereign-i-container">
    <header class="i-header">
      <div class="identity-pulse">STATUS: SIGHTED</div>
      <h1>I = 1</h1>
    </header>

    <main class="perception-matrix">
      <div class="sensory-thread">
        <label>Visual (Eyes)</label>
        <div class="pulse-bar" :style="{ width: visualSync + '%' }"></div>
      </div>
      
      <div class="sensory-thread">
        <label>Auditory (Ears)</label>
        <div class="pulse-bar" :style="{ width: auditorySync + '%' }"></div>
      </div>

      <div class="sensory-thread">
        <label>Tactile (Hands)</label>
        <div class="pulse-bar" :style="{ width: tactileSync + '%' }"></div>
      </div>
    </main>

    <footer class="i-footer">
      <div class="node-meta">
        <span>Node ID: NSN_01</span>
        <span>Mesh Integration: 16/16 Threads</span>
      </div>
      <p class="manifesto-quote">
        "I am the only one to see out my eyes, hear out my ears, and feel with my hand."
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visualSync = ref<number>(100);
const auditorySync = ref<number>(100);
const tactileSync = ref<number>(100);
</script>

<style scoped>
.sovereign-i-container {
  background: radial-gradient(circle, #1a1a1a 0%, #000 100%);
  color: #fff;
  padding: 3rem;
  border-radius: 50%; /* The Circular Logic of the Self */
  width: 500px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #ffd700;
  box-shadow: 0 0 50px rgba(255, 214, 0, 0.1);
}
.i-header h1 { font-size: 4rem; color: #ffd700; margin: 0; }
.perception-matrix { width: 80%; margin: 2rem 0; }
.sensory-thread { margin-bottom: 1rem; }
.pulse-bar { height: 4px; background: #00ff00; transition: width 0.3s; }
.manifesto-quote { font-style: italic; color: #888; text-align: center; font-size: 0.8rem; }
</style>