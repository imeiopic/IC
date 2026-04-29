<template>
  <div class="iopic-processor">
    <h2 class="title">IOPIC 16-Thread Global Processor</h2>
    <div class="diagram-container">
      <div ref="mermaidContainer" class="diagram"></div>
    </div>
    <div class="quadrants">
      <div
        v-for="q in processor.quadrants"
        :key="q.name"
        class="quadrant"
        :style="{ borderColor: q.color }"
      >
        <h3>{{ q.name }}</h3>
        <ul>
          <li><strong>Bits:</strong> {{ q.bits.join(', ') }}</li>
          <li><strong>Logic Gates:</strong> {{ q.logicGates.join(', ') }}</li>
          <li><strong>Role:</strong> {{ q.role }}</li>
          <li><strong>Function:</strong> {{ q.function }}</li>
        </ul>
      </div>
    </div>
    <div class="terminal">
      <h3>Central Terminal 10</h3>
      <p>
        Status: <strong>{{ processor.terminal.status }}</strong>
      </p>
      <p>{{ processor.terminal.description }}</p>
    </div>
    <div class="gate-rules">
      <h4>Gate Configuration Rules</h4>
      <ul>
        <li v-for="rule in processor.gateRules" :key="rule.type">
          <strong>{{ rule.type }}:</strong> {{ rule.gates.join(', ') }}
          <span v-if="rule.required">(Required)</span><span v-else>(Optional)</span>
        </li>
      </ul>
    </div>
    <blockquote class="decree">{{ processor.decree }}</blockquote>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mermaid from 'mermaid';
import { Iopic16ThreadProcessor } from '../Iopic16ThreadProcessor.js';

const processor = Iopic16ThreadProcessor;
const mermaidContainer = ref(null);

// Mermaid diagram source
const mermaidSource = `flowchart TB\n    subgraph Q1[SPATIAL INTEGRITY (IDEAL)\\nBits 1-4\\nTeal]\n      A1(AND) --> A2(OR)\n      A2 --> T10[Terminal 10]\n    end\n    subgraph Q2[IDENTITY PERSISTENCE (PEOPLE)\\nBits 5-8\\nPurple]\n      B1(NAND) --> B2(AND)\n      B2 --> T10\n    end\n    subgraph Q3[VALUE EXCHANGE (BS-MOLECULE)\\nBits 9-12\\nYellow]\n      C1(XNOR) --> C2(XOR)\n      C2 --> C3(OR)\n      C3 --> T10\n    end\n    subgraph Q4[SYSTEM DEFENSE (ACTIVE)\\nBits 13-16\\nRed]\n      D1(NAND) --> D2(OR)\n      D2 --> T10\n    end\n    T10[Central Terminal 10\\nBinary Completion Port\\nLOCKED]\n    style Q1 fill:#008080,stroke:#222,stroke-width:2px\n    style Q2 fill:#800080,stroke:#222,stroke-width:2px\n    style Q3 fill:#FFD700,stroke:#222,stroke-width:2px\n    style Q4 fill:#C00,stroke:#222,stroke-width:2px\n    style T10 fill:#222,stroke:#0ff,stroke-width:4px`;

onMounted(() => {
  mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  mermaid.render('iopic-16-thread-processor', mermaidSource, (svgCode) => {
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = svgCode;
    }
  });
});
</script>

<style scoped>
.iopic-processor {
  max-width: 900px;
  margin: 2rem auto;
  background: #181818;
  color: #eee;
  border-radius: 16px;
  box-shadow: 0 4px 32px #000a;
  padding: 2rem;
}
.title {
  text-align: center;
  color: #0ff;
  margin-bottom: 2rem;
}
.diagram-container {
  text-align: center;
  margin-bottom: 2rem;
}
.diagram {
  max-width: 100%;
  border: 2px solid #0ff;
  border-radius: 12px;
  background: #222;
}
.quadrants {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.quadrant {
  flex: 1 1 200px;
  border-left: 6px solid;
  background: #222b;
  border-radius: 8px;
  padding: 1rem 1.5rem;
}
.terminal {
  background: #222;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-left: 6px solid #0ff;
}
.gate-rules {
  margin-bottom: 2rem;
}
.decree {
  font-style: italic;
  color: #0ff;
  border-left: 4px solid #0ff;
  padding-left: 1rem;
  background: #111;
}
</style>
