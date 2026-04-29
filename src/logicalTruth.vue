<script setup lang="ts">
import { ref } from 'vue';

interface TruthPillar {
  role: string;
  label: string;
  description: string;
  identity: string;
  color: string;
}

const pillars = ref<TruthPillar[]>([
  { 
    role: 'Internet', 
    label: 'The "Where"', 
    description: 'The physical medium and substrate of the fabric.', 
    identity: 'Medium',
    color: '#007bff' 
  },
  { 
    role: 'Order', 
    label: 'The "When"', 
    description: 'The sequential timing and deterministic logic gates.', 
    identity: 'Sequence',
    color: '#fd7e14' 
  },
  { 
    role: 'People', 
    label: 'The "Who"', 
    description: 'The originating or receiving entity; the source of intent.', 
    identity: 'Actor',
    color: '#28a745' 
  },
  { 
    role: 'Information', 
    label: 'The "What"', 
    description: 'The raw data payload; the immutable state of being.', 
    identity: 'Payload',
    color: '#6f42c1' 
  },
  { 
    role: 'Connector', 
    label: 'The "How"', 
    description: 'The 16-thread bridge that validates and binds the protocol.', 
    identity: 'Bridge',
    color: '#e83e8c' 
  }
]);
</script>

<template>
  <div class="truth-layer-container">
    <header class="truth-header">
      <h1>IOPIC: The Logical Truth</h1>
      <p>The Ultimate Abstraction Layer for People using Internet Computing</p>
    </header>

    <div class="pillars-grid">
      <div 
        v-for="pillar in pillars" 
        :key="pillar.role" 
        class="pillar-card"
        :style="{ '--pillar-color': pillar.color }"
      >
        <div class="pillar-role">{{ pillar.role }}</div>
        <div class="pillar-identity">{{ pillar.identity }}</div>
        <h3 class="pillar-label">{{ pillar.label }}</h3>
        <p class="pillar-desc">{{ pillar.description }}</p>
        
        <!-- Visual representation of the 16-thread bridge for the Connector -->
        <div v-if="pillar.role === 'Connector'" class="bridge-visual">
          <div v-for="i in 16" :key="i" class="thread"></div>
        </div>
      </div>
    </div>

    <footer class="truth-footer">
      <p>iiii = ! : The Truth is defined by the connection.</p>
    </footer>
  </div>
</template>

<style scoped>
.truth-layer-container {
  padding: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.truth-header { text-align: center; margin-bottom: 4rem; }
.truth-header h1 { font-size: 2.5rem; letter-spacing: 2px; color: #333; }
.truth-header p { color: #666; font-style: italic; }

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.pillar-card {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border-top: 5px solid var(--pillar-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pillar-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.pillar-role { font-weight: bold; text-transform: uppercase; font-size: 0.75rem; color: var(--pillar-color); margin-bottom: 0.5rem; }
.pillar-identity { position: absolute; top: 1rem; right: 1rem; font-size: 0.65rem; background: #f8f9fa; padding: 2px 8px; border-radius: 20px; color: #999; }
.pillar-label { margin: 0.5rem 0 1rem; font-size: 1.25rem; }
.pillar-desc { font-size: 0.9rem; color: #555; line-height: 1.6; }

.bridge-visual {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 1.5rem;
}

.thread {
  height: 20px;
  background: var(--pillar-color);
  opacity: 0.3;
  border-radius: 2px;
  animation: thread-pulse 2s infinite ease-in-out;
}

@keyframes thread-pulse {
  0%, 100% { opacity: 0.2; transform: scaleY(1); }
  50% { opacity: 0.6; transform: scaleY(1.5); }
}

.thread:nth-child(2n) { animation-delay: 0.2s; }
.thread:nth-child(3n) { animation-delay: 0.4s; }

.truth-footer { text-align: center; margin-top: 5rem; color: #ccc; font-weight: bold; letter-spacing: 1px; }
</style>