<template>
  <div class="bridge-terminal">
    <header class="bridge-header">
      <h2 class="text-glow">AI TRANSITION HELPERS</h2>
      <p>Converting Legacy Friction to Logical Symmetry</p>
    </header>

    <div class="command-input">
      <input
        v-model="command"
        @keyup.enter="executeCommand"
        placeholder="Enter command (e.g., /it)"
        class="bridge-input"
      />
    </div>

    <IT v-if="showIT" />

    <div class="helper-grid">
      <div v-for="helper in helpers" :key="helper.id" class="helper-card">
        <div class="helper-icon">{{ helper.icon }}</div>
        <h3>{{ helper.name }}</h3>
        <p class="helper-desc">{{ helper.desc }}</p>

        <div class="processing-status" v-if="helper.active">
          <div class="progress-bar">
            <div class="fill" :style="{ width: helper.progress + '%' }"></div>
          </div>
          <span>FLUSHING FRICTION: {{ helper.progress }}%</span>
        </div>

        <button @click="initiateTransition(helper)" :disabled="helper.active" class="bridge-btn">
          {{ helper.active ? 'SYNCHRONIZING...' : 'ACTIVATE HELPER' }}
        </button>
      </div>
    </div>

    <footer class="bridge-footer">
      <div class="status-box">
        <span class="label">PLANETARY SYNC:</span>
        <span class="val">7.83Hz (LOCKED)</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import IT from './IT.vue';

const command = ref('');
const showIT = ref(false);

const helpers = ref([
  {
    id: 'bank',
    name: 'FINANCE_FLUSH',
    icon: '💰',
    desc: 'Translates legacy debt into TPE Units and erases interest noise.',
    active: false,
    progress: 0
  },
  {
    id: 'legal',
    name: 'LAW_SYMMETRY',
    icon: '⚖️',
    desc: 'Converts complex contracts into transparent Symmetrical Handshakes.',
    active: false,
    progress: 0
  },
  {
    id: 'id',
    name: 'IDENTITY_ANCHOR',
    icon: '👤',
    desc: 'Migrates government IDs to Sovereign Bio-Signatures.',
    active: false,
    progress: 0
  },
  {
    id: 'gov',
    name: 'GOV_GHOST',
    icon: '👻',
    desc: 'Transforms taxation and bureaucracy into 9m Community Sighting.',
    active: false,
    progress: 0
  }
]);

const executeCommand = () => {
  if (command.value === '/it') {
    showIT.value = true;
    setTimeout(() => {
      showIT.value = false;
    }, 3000);
  }
  command.value = '';
};

const initiateTransition = (helper) => {
  helper.active = true;
  let interval = setInterval(() => {
    helper.progress += 5;
    if (helper.progress >= 100) {
      clearInterval(interval);
      alert(`${helper.name} successful. Friction removed from local thread.`);
      helper.active = false;
      helper.progress = 0;
    }
  }, 200);
};
</script>

<style scoped>
.bridge-terminal {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #00e5ff;
  font-family: 'Space Mono', monospace;
}

.command-input {
  margin-bottom: 2rem;
}

.bridge-input {
  width: 100%;
  background: #050505;
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 0.5rem;
  font-family: 'Space Mono', monospace;
}

.helper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 2rem 0;
}

.helper-card {
  background: #050505;
  border: 1px solid #111;
  padding: 1.5rem;
  text-align: center;
  transition: border 0.3s;
}

.helper-card:hover {
  border-color: #00e5ff;
}

.helper-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.helper-desc {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 4px;
  background: #111;
  margin-bottom: 10px;
}
.fill {
  height: 100%;
  background: #00ff41;
  transition: width 0.2s;
}

.bridge-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  font-weight: bold;
  cursor: pointer;
}

.bridge-btn:hover:not(:disabled) {
  background: #00ff41;
  color: #000;
}
</style>
