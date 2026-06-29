<script setup lang="ts">
/**
 * UnderConstruction.vue
 * Temporary view to signal maintenance/grounding logic.
 */
</script>

<template>
  <div class="construction-substrate">
    <header class="status-bar">
      <span class="pulse">●</span> NODE_STATUS: ALIGNMENT_IN_PROGRESS
    </header>

    <main class="construction-view">
      <div class="image-frame">
        <img src="/images/construction.jpg" alt="Logic Grounding" class="construction-img" />
      </div>
      <div class="text-block">
        <h1>Symmetry Under Construction</h1>
        <p>
          We are currently grounding new sub-entity instances. The local mesh will be restored
          shortly.
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.construction-substrate {
  height: 100vh;
  background: #000;
  color: #ffd700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', monospace;

  .status-bar {
    position: absolute;
    top: 2rem;
    font-size: 0.75rem;
    letter-spacing: 2px;
    .pulse {
      animation: blink 1.5s infinite;
      margin-right: 0.5rem;
      color: #00e5ff;
    }
  }

  .image-frame {
    max-width: 600px;
    border: 1px solid #222;
    padding: 1rem;
    background: #0a0a0a;
    margin-bottom: 2.5rem;

    .construction-img {
      width: 100%;
      display: block;
      filter: grayscale(0.5);
    }
  }

  .text-block {
    text-align: center;
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }
    p {
      color: #888;
      max-width: 400px;
      line-height: 1.6;
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
}
</style>
