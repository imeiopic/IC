<template>
  <div class="iopic-events-bus">
    <div class="event-header">
      <h2>0110_SOCIAL: Planetary Pulses</h2>
      <button @click="createEvent" class="create-pulse-btn">+ New Event</button>
    </div>

    <div class="event-grid">
      <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
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
            @click="commitToEvent(event.id)" 
            :disabled="event.isUserCommitted"
            class="commit-btn"
          >
            {{ event.isUserCommitted ? 'Sighted' : 'Commit Handshake' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const upcomingEvents = ref([]);

const loadEvents = async () => {
  // Sighting active pulses on the 0110_SOCIAL thread
  upcomingEvents.value = await store.dispatch('fetchSymmetricalEvents');
};

const commitToEvent = async (eventId) => {
  // Initiates a handshake to ground the node's presence
  await store.dispatch('groundEventCommitment', eventId);
  console.log(`Node committed to Pulse: ${eventId}`);
};

onMounted(loadEvents);
</script>

<style scoped>
.iopic-events-bus { padding: 2rem; background: #050505; color: white; }
.event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.event-card { background: #111; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
.event-visual { height: 150px; background-size: cover; position: relative; }
.thread-tag { position: absolute; top: 10px; right: 10px; background: #ffd700; color: #000; padding: 2px 8px; font-size: 0.7rem; font-weight: bold; }
.commit-btn { width: 100%; background: #00ff00; color: #000; border: none; padding: 1rem; cursor: pointer; font-weight: bold; }
.commit-btn:disabled { background: #333; color: #888; }
</style>