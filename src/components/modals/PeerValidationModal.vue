<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="text-glow">02: PEER HANDSHAKE</h2>
      <p>Searching for biological neighbors in the mesh...</p>
      <div class="handshake-icon">🤝</div>
      <button class="action-btn" @click="$emit('success', 'peer')">GRANT SYMMETRY PULSE</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #050505; border: 1px solid #00ff41; padding: 2rem; color: #00ff41; font-family: 'Space Mono', monospace; text-align: center; }
.handshake-icon { font-size: 3rem; margin: 2rem 0; }
.action-btn { width: 100%; padding: 1rem; background: #00ff41; color: #000; border: none; font-weight: bold; cursor: pointer; }
</style>
