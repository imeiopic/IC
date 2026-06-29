<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="text-glow">01: INTERNAL SYMMETRY</h2>
      <p>Sighting local coordinates (+/- 9m precision)...</p>
      <div class="bio-sync">GROUNDING TO 7.83Hz...</div>
      <button class="action-btn" @click="$emit('success', 'self')">EXECUTE SELF-GROUNDING</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #050505; border: 1px solid #00ff41; padding: 2rem; color: #00ff41; font-family: 'Space Mono', monospace; text-align: center; }
.bio-sync { margin: 2rem 0; font-size: 1.2rem; animation: pulse 2s infinite; }
.action-btn { width: 100%; padding: 1rem; background: #00ff41; color: #000; border: none; font-weight: bold; cursor: pointer; }
@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
</style>
