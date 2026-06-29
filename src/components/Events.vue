<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventStore } from '@/stores/eventStore';

const eventStore = useEventStore();

onMounted(() => {
  eventStore.fetchSymmetricalEvents();
});

const handleCommitment = (eventId: string) => {
  eventStore.groundEventCommitment(eventId);
};
</script>

<template>
  <div class="iopic-events-bus">
    <header class="event-header">
      <h2>0110_SOCIAL: Planetary Pulses</h2>
      <button class="create-pulse-btn">+ New Event</button>
    </header>

    <div v-if="eventStore.loading" class="loading-state">
      Scanning active network pulses...
    </div>

    <div v-else class="event-grid">
      <div v-for="event in eventStore.events" :key="event.id" class="event-card">
        <div class="event-visual" :style="{ backgroundImage: `url(${event.image})` }">
          <div class="thread-tag">{{ event.primaryThread }}</div>
        </div>
        
        <div class="event-details">
          <h3>{{ event.title }}</h3>
          <p class="logic-subtext">{{ event.description }}</p>
          
          <div class="grounding-info">
            <span>Sighted Nodes: {{ event.committedNodes }}</span>
            <span>Pressure: {{ event.atmosphericPressure }}%</span>
          </div>

          <button 
            @click="handleCommitment(event.id)" 
            :disabled="event.isUserCommitted"
            class="commit-btn"
          >
            {{ event.isUserCommitted ? 'SIGHTED' : 'COMMIT HANDSHAKE' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.iopic-events-bus { padding: 2rem; background: #050505; color: white; min-height: 100vh; }
.event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.event-card { background: #111; border: 1px solid #333; border-radius: 12px; overflow: hidden; transition: transform 0.2s; }
.event-card:hover { border-color: #ffd700; }
.event-visual { height: 150px; background-size: cover; position: relative; }
.thread-tag { position: absolute; top: 10px; right: 10px; background: #ffd700; color: #000; padding: 4px 10px; font-size: 0.7rem; font-weight: bold; }
.event-details { padding: 1.5rem; }
.logic-subtext { font-size: 0.85rem; color: #888; margin: 1rem 0; }
.grounding-info { display: flex; justify-content: space-between; font-size: 0.75rem; color: #ffd700; margin-bottom: 1.5rem; }
.commit-btn { width: 100%; background: #00ff00; color: #000; border: none; padding: 1rem; cursor: pointer; font-weight: bold; font-family: monospace; }
.commit-btn:disabled { background: #1a331a; color: #4d804d; cursor: not-allowed; }
.loading-state { color: #58a6ff; font-family: monospace; text-align: center; margin-top: 4rem; }
</style>