<template>
  <div class="vre-bg"></div>
</template>

<script setup>
// Virtually Real Earth background (renamed from VirtuallyRealEarth)
</script>

<style scoped>
.vre-bg {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    ellipse at center,
    rgba(34, 211, 238, 0.12) 0%,
    rgba(8, 47, 73, 0.18) 100%
  );
  z-index: 0;
  pointer-events: none;
}
</style>
