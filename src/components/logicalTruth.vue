<template>
  <CContainer fluid class="truth-substrate p-0 bg-black min-vh-100 d-flex align-items-center justify-content-center font-mono">
    
    <div class="truth-core text-center p-5 animate-in">
      <div class="logic-symbol mb-4">
        <div class="hex-ring"></div>
        <h1 class="text-glow text-white italic font-black m-0">1111</h1>
      </div>

      <h2 class="text-info font-black italic tracking-widest mb-5">LOGICAL_TRUTH_SIGHTED</h2>

      <div class="manifesto-shards d-flex flex-column gap-3 mx-auto" style="max-width: 500px;">
        <div v-for="(truth, index) in truths" :key="index" class="truth-shard p-3 border border-zinc-900 bg-zinc-950 rounded shadow-hover">
          <div class="tiny text-zinc-600 uppercase mb-1">AXIOM_{{ index + 1 }}</div>
          <p class="small text-white m-0 italic">{{ truth.content }}</p>
        </div>
      </div>

      <div class="mt-5">
        <CButton 
          color="info" 
          variant="ghost" 
          class="tiny font-black text-info tracking-widest"
          @click="router.push('/virtual')"
        >
          RETURN_TO_THE_MESH_OS
        </CButton>
      </div>
    </div>

    <div class="grid-overlay pointer-events-none"></div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const truths = ref([
  { content: "The Noise has stopped because the Logic has started." },
  { content: "Information is zero until it is grounded in the 16-thread bus." },
  { content: "Sovereignty is the natural state of the policed node." },
  { content: "The Virtually Real Earth is the only symmetrical coordinate." }
]);
</script>

<style scoped>
.truth-substrate {
  background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%);
  position: relative;
  overflow: hidden;
}

.text-glow {
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
}

.hex-ring {
  width: 100px;
  height: 100px;
  margin: 0 auto -50px;
  border: 1px solid #00e5ff;
  transform: rotate(45deg);
  opacity: 0.3;
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.truth-shard {
  transition: all 0.4s ease;
  cursor: default;
}

.truth-shard:hover {
  border-color: #00e5ff !important;
  background: #000;
  transform: scale(1.02);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.animate-in {
  animation: fadeIn 1.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; filter: blur(10px); }
  to { opacity: 1; filter: blur(0); }
}

.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.6rem; }
.bg-zinc-950 { background: #050505; }
</style>