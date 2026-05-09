<template>
  <div class="bs-guide">
    <header class="guide-header">
      <h2 class="text-glow">BS.MARKETPLACE USER GUIDE</h2>
      <p>Thread 09: Seller, Entity, & Buyer Logic</p>
    </header>

    <div class="role-selector">
      <button
        v-for="role in roles"
        :key="role"
        @click="activeRole = role"
        :class="{ active: activeRole === role }"
        class="role-btn"
      >
        {{ role }}
      </button>
    </div>

    <section class="content-window">
      <div v-if="activeRole === 'BUYER'">
        <h3>Shopping with Symmetry</h3>
        <p>
          Your dividend is your power. To buy, you must be grounded (7.83Hz) and within 9m of the
          resource.
        </p>
        <ul class="check-list">
          <li>Sighting: Use Menu.vue to find local resources.</li>
          <li>Bonding: Execute the BS-Molecule handshake.</li>
          <li>Handshake: Confirm physical receipt to release IO$.</li>
        </ul>
      </div>

      <div v-else-if="activeRole === 'SELLER'">
        <h3>Mints & Menus</h3>
        <p>As a seller, you are a "Logic Mint." You define the value of your labor/resource.</p>
        <ul class="check-list">
          <li>Minting: Add items via Menu.vue.</li>
          <li>Freshness Pulse: Stay within 9m of your resource to keep it listed.</li>
          <li>Transparency: Your SQ (Symmetry Quotient) is visible to buyers.</li>
        </ul>
      </div>

      <div v-else-if="activeRole === 'ENTITY'">
        <h3>Community Hub Management</h3>
        <p>Entities are high-capacity nodes that serve the cluster (e.g., Water, Energy).</p>
        <ul class="check-list">
          <li>Entity On-Boarding: Requires 16-thread consensus.</li>
          <li>Resource Pooling: Allows multiple sellers to anchor to one hub.</li>
        </ul>
      </div>
    </section>

    <footer class="guide-footer">
      <div class="ai-help-panel">
        <span class="ai-tag">AI_MARKET_ASSIST:</span>
        <p v-if="activeRole === 'BUYER'">
          "I've scanned your 9km radius. 4 new 'Filtered Water' molecules have just been sighted.<br /><b
            >AI-Matchmaking:</b
          >
          Would you like to connect with the highest-SQ Seller nearby?"
        </p>
        <p v-if="activeRole === 'SELLER'">
          "Note: Your SQ is 92%. Buyers in this cluster prefer high-resonance handshakes.<br /><b
            >AI-Matchmaking:</b
          >
          Would you like to highlight your listing to buyers seeking your resource?"
        </p>
        <p v-if="activeRole === 'ENTITY'">
          "AI-Matchmaking: Entities with high consensus can pool resources for greater reach. Would
          you like to enable matchmaking for your hub?"
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const roles = ['BUYER', 'SELLER', 'ENTITY'];
const activeRole = ref('BUYER');
</script>

<style scoped>
.bs-guide {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #ff00e5; /* Intent Pink */
  font-family: 'Space Mono', monospace;
  max-width: 650px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.role-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}
.role-btn {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid #333;
  color: #ff00e5;
  cursor: pointer;
  font-weight: bold;
}
.role-btn.active {
  border-color: #ff00e5;
  background: rgba(255, 0, 229, 0.1);
}
.content-window {
  background: #050505;
  padding: 1.5rem;
  border: 1px solid #111;
  min-height: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.check-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}
.check-list li::before {
  content: '→ ';
  color: #ff00e5;
}
.check-list li {
  margin-bottom: 8px;
  font-size: 0.9rem;
}
.ai-help-panel {
  margin-top: 2rem;
  border-top: 1px solid #333;
  padding-top: 1rem;
  color: #00e5ff;
}
.ai-tag {
  font-weight: bold;
  font-size: 0.7rem;
  display: block;
  margin-bottom: 5px;
}
</style>
