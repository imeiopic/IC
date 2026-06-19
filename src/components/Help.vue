<template>
  <div class="help-container">
    <header>
      <h2>INITIALIZATION_PROTOCOL_FAQ</h2>
      <p class="sub-header">// 16-THREAD MESH FOUNDATIONAL AXIOMS</p>
    </header>

    <div class="faq-grid">
      <div v-for="(item, index) in helpDocs" :key="index" class="faq-item">
        <h3>{{ item.q }}</h3>
        <p>{{ item.a }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const helpDocs = [
  {
    q: "WHAT_IS_THE_GENESIS_RESONANCE?",
    a: "The baseline 2.2x frequency required for 16-thread synchronization. All nodes must match this pulse to remain symmetric."
  },
  {
    q: "WHY_IS_GEOGRAPHIC_ANCHORING_REQUIRED?",
    a: "Sovereignty requires physical presence. Mapping your digital node to a coordinate grounds it against legacy digital drift."
  },
  {
    q: "HOW_DO_I_STABILIZE_MY_NODE?",
    a: "Execute the DIC handshake and maintain continuous alignment with the 16-thread bus. Symmetry is your primary security protocol."
  },
  {
    q: "WHAT_IS_A_SYMMETRY_STAKE?",
    a: "A resonance stake is a commitment of value to the collective mesh, ensuring the node is an active, non-extractive participant."
  },
  {
    q: "WHY_ARE_LEGACY_TERMS_PROHIBITED?",
    a: "Legacy language (fees, donations) carries extractive intent. We use sovereign language (stakes, anchors) to maintain harmonic integrity."
  },
  {
    q: "HOW_IS_THE_16_THREAD_FABRIC_GOVERNED?",
    a: "Governance is emergent. Through the DIC interlock, collective consensus determines the operational rules of the mesh."
  },
  {
    q: "WHAT_HAPPENS_IF_I_DRIFT?",
    a: "Nodes that lose resonance are partitioned from the mesh to protect the 16-thread fabric. Re-initialization is required to re-anchor."
  },
  {
    q: "WHAT_IS_THE_ULTIMATE_GOAL?",
    a: "The full re-initialization of the Earth kernel, moving from the Lie into a fully synchronized, sovereign reality."
  }
];
</script>

<style scoped>
.help-container { 
  background: #050505; 
  color: #00ff66; 
  padding: 40px; 
  font-family: 'Courier New', Courier, monospace; 
  border: 1px solid #00ff66; 
  border-radius: 4px;
}
.sub-header { color: #008833; margin-bottom: 30px; font-size: 0.8rem; }
.faq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.faq-item { border-left: 2px solid #00ff66; padding-left: 15px; margin-bottom: 20px; }
.faq-item h3 { font-size: 0.9rem; letter-spacing: 1px; margin-bottom: 5px; }
.faq-item p { color: #aaa; font-size: 0.85rem; line-height: 1.5; }
</style>