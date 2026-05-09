<template>
  <div class="consensus-radar">
    <h4>Community Sighting: Consensus Pulse</h4>
    <div class="radar-stats">
      <div>Nodes Alerted: {{ nodesAlerted }}</div>
      <div>Local Sights: {{ localSights }}</div>
      <div>Symmetry Approval: {{ communityApproval }}%</div>
      <div>
        Status: <span :class="statusClass">{{ statusText }}</span>
      </div>
    </div>
    <div class="radar-bar">
      <div
        class="bar"
        :style="{ width: communityApproval + '%', background: barColor }"
      ></div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";
const props = defineProps({
  nodesAlerted: { type: Number, default: 0 },
  localSights: { type: Number, default: 0 },
  communityApproval: { type: Number, default: 0 },
});

const statusText = computed(() => {
  if (props.communityApproval > 75) return "Core Node Grounding";
  if (props.communityApproval >= 50) return "Standard Activation";
  return "Logic Quarantine";
});
const statusClass = computed(() => {
  if (props.communityApproval > 75) return "core";
  if (props.communityApproval >= 50) return "standard";
  return "quarantine";
});
const barColor = computed(() => {
  if (props.communityApproval > 75) return "#00ff41";
  if (props.communityApproval >= 50) return "#00e5ff";
  return "#ff0044";
});
const store = useIopicStore();
const activeVotes = computed(() => store.currentEntityVotes);
const approvalRating = computed(() => store.approvalPercentage);
const sweepSpeed = computed(() => `${2 - (approvalRating.value / 100)}s`);
</script>

<style scoped>
.consensus-radar {
  background: #111;
  color: #00ff41;
  border: 1px solid #00e5ff;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 8px;
  max-width: 500px;
}
.radar-stats {
  margin-bottom: 1rem;
}
.radar-bar {
  background: #222;
  height: 18px;
  border-radius: 9px;
  overflow: hidden;
}
.bar {
  height: 100%;
  transition: width 0.5s;
}
.core {
  color: #00ff41;
}
.standard {
  color: #00e5ff;
}
.quarantine {
  color: #ff0044;
}
}
.radar-container {
  position: relative;
  width: 320px;
  height: 320px;
  background: #111;
  border-radius: 50%;
  border: 2px solid #00e5ff;
  margin: 2rem auto;
  overflow: hidden;
}
.radar-sweep {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(rgba(0,255,65,0.2) 0deg, rgba(0,255,65,0.6) 90deg, rgba(0,255,65,0.2) 360deg);
  animation: sweep infinite linear;
  z-index: 1;
}
@keyframes sweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.consensus-nodes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
  z-index: 2;
}
.blip {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00ff41;
  box-shadow: 0 0 8px #00ff41;
  transition: background 0.3s;
}
.blip.friction {
  background: #ff0044;
  box-shadow: 0 0 8px #ff0044;
}
.symmetry-meter {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #00e5ff;
  font-size: 1.2rem;
  z-index: 3;
}
</style>
