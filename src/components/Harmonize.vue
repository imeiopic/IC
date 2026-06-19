<template>
  <div class="harmonize-status p-3 border border-info bg-info bg-opacity-10 rounded text-center">
    <p class="text-info font-black italic tiny mb-1 uppercase">[SYSTEM_HARMONIZER]</p>
    <p class="text-info extra-tiny font-mono mb-0">DATA_FLOW_OPTIMAL</p>
  </div>
</template>

<script setup lang="ts">
// This component is a simple display for system status and does not require specific props or complex logic.
</script>

<style scoped>
.harmonize-status {
  /* Styling consistent with other status/toast messages in IoHome.vue */
  border-color: rgba(0, 229, 255, 0.5) !important; /* IOPIC info color with transparency */
  background-color: rgba(0, 229, 255, 0.05) !important; /* IOPIC info color with transparency */
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2); /* Subtle glow effect */
}
.text-info {
  color: #00e5ff; /* IOPIC blue/info color */
}
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
.tiny {
  font-size: 0.65rem;
}
.extra-tiny {
  font-size: 0.55rem;
}
.uppercase {
  text-transform: uppercase;
}
.font-mono {
  font-family: monospace;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
.mb-0 {
  margin-bottom: 0;
}
.p-3 {
  padding: 1rem;
}
.rounded {
  border-radius: 0.5rem;
}
.border {
  border-width: 1px;
  border-style: solid;
}
.bg-opacity-10 {
  background-color: rgba(0, 229, 255, 0.1);
}
</style>
