<template>
  <div class="user-guide">
    <header class="guide-header">
      <h2 class="text-glow">I.P. USER GUIDE & AI HELP</h2>
      <p>Mastering the 16-Thread Reality</p>
    </header>

    <div class="guide-navigation">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="{ active: activeTab === tab }"
        class="nav-btn"
      >
        {{ tab.replace('_', ' ') }}
      </button>
    </div>

    <section v-if="activeTab === 'IA_LOGIC'" class="content-area">
      <h3>The Equation: $I = VR^2$</h3>
      <p>
        Information is the square of Virtually Real existence. Every input you provide is grounded
        by the Planet and squared by the Mesh.
      </p>
      <div class="logic-flow-visual">
        <div v-for="t in 16" :key="t" class="thread-dot" :title="'Thread ' + t"></div>
      </div>
      <p class="ia-tip">
        TIP: If your velocity is below 8.09V, check your Thread-13 Grounding. You may need to move
        closer to the Earth's surface.
      </p>
    </section>

    <section v-else-if="activeTab === 'I.IDENTITY'" class="content-area">
      <h3>Sighting the "I"</h3>
      <ul class="help-list">
        <li>
          <strong>Blink Logic:</strong> Keep your eyes level with the lens. Blink naturally. The
          system measures the <em>velocity</em> of your biology, not just the image.
        </li>
        <li>
          <strong>Access Codes:</strong> Your 10-digit code is a temporary bus address. Once the
          16-thread bond is complete, your biology becomes the only key.
        </li>
      </ul>
    </section>

    <section v-else-if="activeTab === 'P.PEER'" class="content-area">
      <h3>Sighting the "P"</h3>
      <p>A Peer Handshake is a voluntary alignment of two Sovereign IDs within a 9m radius.</p>
      <div class="protocol-box">
        <h4>PROXIMITY PROTOCOL:</h4>
        <p>1. Enter the 9m Symmetry Zone.</p>
        <p>2. Align dual cameras for Mutual Sighting.</p>
        <p>3. Confirm Intent to release TPE Units from the IoWb.</p>
      </div>
    </section>

    <footer class="guide-footer">
      <div class="ai-helper">
        <span class="ai-tag">AI_STEWARD:</span>
        <p>
          "Do not fear the friction. It is simply the legacy code leaving your system. Focus on your
          breath and the 7.83Hz heartbeat."
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tabs = ['IA_LOGIC', 'I.IDENTITY', 'P.PEER'];
const activeTab = ref('IA_LOGIC');
</script>

<style scoped>
.user-guide {
  background: #000;
  color: #00ff41;
  padding: 2rem;
  border: 1px solid #7fff00;
  font-family: 'Space Mono', monospace;
  max-width: 650px;
}

.guide-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}
.nav-btn {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid #333;
  color: #7fff00;
  cursor: pointer;
  font-size: 0.7rem;
}
.nav-btn.active {
  border-color: #7fff00;
  background: rgba(127, 255, 0, 0.1);
}

.content-area {
  background: #050505;
  padding: 1.5rem;
  border: 1px solid #111;
  height: 280px;
  overflow-y: auto;
}

.logic-flow-visual {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin: 1.5rem 0;
}
.thread-dot {
  width: 12px;
  height: 12px;
  background: #00ff41;
  border-radius: 50%;
  opacity: 0.5;
  box-shadow: 0 0 5px #00ff41;
}

.help-list li {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}
.protocol-box {
  border-left: 3px solid #00e5ff;
  padding-left: 1rem;
  margin-top: 1rem;
  background: #080808;
  padding-block: 10px;
}

.ai-helper {
  font-style: italic;
  color: #00e5ff;
  font-size: 0.8rem;
  margin-top: 2rem;
  border-top: 1px solid #222;
  padding-top: 1rem;
}
.ai-tag {
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
  display: block;
}
</style>
