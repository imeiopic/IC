<template>
  <div class="education-bus-container">
    <header class="edu-header">
      <div class="thread-label">THREAD_1101 // TRUTH & LOGIC</div>
      <h2>The Academy of 16</h2>
    </header>

    <div class="logic-hierarchy">
      <div 
        v-for="(level, index) in hierarchy" 
        :key="index" 
        class="hierarchy-tier"
        :class="{ 'locked': !level.isSighted, 'active': level.isCurrent }"
      >
        <div class="tier-icon">{{ level.icon }}</div>
        <div class="tier-details">
          <h3>Tier {{ index + 1 }}: {{ level.name }}</h3>
          <p>{{ level.description }}</p>
          <div class="mastery-bar">
            <div class="mastery-fill" :style="{ width: level.progress + '%' }"></div>
          </div>
        </div>
        <div class="sighting-check" v-if="level.isSighted">✓ Grounded</div>
      </div>
    </div>

    <aside class="syllabus-sidebar">
      <h3>Active Equations</h3>
      <ul class="equation-list">
        <li v-for="eq in equations" :key="eq.id" @click="sightingEquation(eq)">
          {{ eq.formula }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hierarchy = ref([
  { 
    name: "Sovereign Sighting", 
    description: "Mastering the 'Equation of 1' and sensory isolation.", 
    icon: "👁️", 
    isSighted: true, 
    isCurrent: false, 
    progress: 100 
  },
  { 
    name: "Binary Symmetry", 
    description: "Learning the logic of the Handshake and 1.1x Multiplier.", 
    icon: "🤝", 
    isSighted: true, 
    isCurrent: true, 
    progress: 45 
  },
  { 
    name: "Mesh Architecture", 
    description: "Building 16-thread substrates and Entity Domains.", 
    icon: "🌐", 
    isSighted: false, 
    isCurrent: false, 
    progress: 0 
  }
]);

const equations = ref([
  { id: 1, formula: "I = VR²" },
  { id: 2, formula: "iiii = !" },
  { id: 3, formula: "1 : 16 Ratio" }
]);
</script>

<style scoped>
.education-bus-container { display: flex; background: #000; color: #fff; padding: 2rem; border: 1px solid #00ff00; }
.logic-hierarchy { flex: 2; display: flex; flex-direction: column; gap: 1.5rem; }
.hierarchy-tier { 
  display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; 
  background: #050505; border: 1px solid #222; border-radius: 12px;
  transition: all 0.3s ease;
}
.hierarchy-tier.active { border-color: #00ff00; box-shadow: 0 0 15px rgba(0, 255, 0, 0.1); }
.hierarchy-tier.locked { opacity: 0.4; filter: grayscale(1); }
.tier-icon { font-size: 2.5rem; }
.mastery-bar { height: 6px; background: #111; width: 100%; margin-top: 10px; border-radius: 3px; }
.mastery-fill { height: 100%; background: #00ff00; border-radius: 3px; }
.syllabus-sidebar { flex: 1; border-left: 1px solid #222; padding-left: 2rem; }
.equation-list li { 
  padding: 10px; background: #111; margin-bottom: 10px; 
  cursor: pointer; font-family: monospace; color: #ffd700;
}
</style>