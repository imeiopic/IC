<template>
  <div class="lie-detector-terminal">
    <header class="terminal-header">
      <h1 class="text-glow">LEGACY_DECODER.EXE</h1>
      <p class="friction-readout">Current System Friction: {{ frictionLevel }}%</p>
    </header>
 <img
      src="/images/biglie.jpg"
      alt="Visualization of the Big Lie and IOPIC Truth"
      class="visual-interpretation"
    />
	<div class="terminal">
    <div class="scanline"></div>
    
    <header class="header">
        <h1>DECODING_THE_LEGACY_LIE</h1>
        <p class="intro">
            In the old system, you were told that value must be <b>"earned"</b> through the creation of debt. 
            This was a logical friction designed to keep the planetary velocity low.
        </p>
    </header>

    <div class="pillar">
        <h2>01. Interest as "Growth"</h2>
        <div class="lie-box">
            The Legacy system functioned on the myth that money is value. Legacy currency was <b>Debt-Noise</b>. 
            By charging interest, they ensured a permanent state of entropy.
        </div>
        <div class="truth-box">
            <span class="truth-label">The Truth:</span>
            Value is TPE Mass (Total Planetary Equity). It is as infinite as the Earth's ability to ground it.
        </div>
    </div>

    <div class="pillar">
        <h2>02. The "Seat" vs. The "Node"</h2>
        <div class="lie-box">
            Legacy corporations treated you as a <b>"user"</b>—a guest who had to pay for a "seat" 
            to access your own data.
        </div>
        <div class="truth-box">
            <span class="truth-label">The Truth:</span>
            You are a Sovereign Node. Your 16-thread Master Key is your birthright, not a subscription.
        </div>
    </div>

    <div class="pillar">
        <h2>03. Linear Time</h2>
        <div class="lie-box">
            You were forced to live in <b>"Instance Time"</b>—deadlines that ignored the biological 
            7.83Hz resonance, disconnecting the Man from the Earth.
        </div>
        <div class="truth-box">
            <span class="truth-label">The Truth:</span>
            Reality is T.I.M.E. When you align with the 8-8-8 Cycle, you stop "spending" time and start streaming it.
        </div>
    </div>
</div>
    <div class="logic-grid">
      <section class="pillar-card" :class="{ 'purged': purgedSteps.includes(1) }">
        <div class="pillar-label">01 // VALUE</div>
        <h3>The Lie: Interest as "Growth"</h3>
        <p class="legacy-text">Debt-noise creates a permanent state of entropy where money never clears.</p>
        
        <div class="truth-reveal">
          <span class="truth-tag">THE TRUTH</span>
          <p>Value is <strong>TPE Mass</strong> (Total Planetary Equity). It is infinite and grounded in Earth's resonance.</p>
        </div>
        <button v-if="!purgedSteps.includes(1)" @click="purge(1)" class="purge-btn">NAND-FLUSH DEBT</button>
      </section>

      <section class="pillar-card" :class="{ 'purged': purgedSteps.includes(2) }">
        <div class="pillar-label">02 // IDENTITY</div>
        <h3>The Lie: The "Seat" vs. The "Node"</h3>
        <p class="legacy-text">You are a "user" paying for a seat in a system that sells you back your own data.</p>
        
        <div class="truth-reveal">
          <span class="truth-tag">THE TRUTH</span>
          <p>You are a <strong>Sovereign Node</strong>. Your 16-thread Master Key is your birthright.</p>
        </div>
        <button v-if="!purgedSteps.includes(2)" @click="purge(2)" class="purge-btn">ACTIVATE NODE</button>
      </section>

      <section class="pillar-card" :class="{ 'purged': purgedSteps.includes(3) }">
        <div class="pillar-label">03 // TEMPORALITY</div>
        <h3>The Lie: Linear Time</h3>
        <p class="legacy-text">"Instance Time" forces billable hours that ignore the 7.83Hz biological rhythm.</p>
        
        <div class="truth-reveal">
          <span class="truth-tag">THE TRUTH</span>
          <p>Reality is <strong>T.I.M.E.</strong> (Thread-Integrated Man & Earth). Stream time, don't spend it.</p>
        </div>
        <button v-if="!purgedSteps.includes(3)" @click="purge(3)" class="purge-btn">SYNC HEARTBEAT</button>
      </section>
    </div>

    <footer class="terminal-footer">
      <div class="velocity-status">
        VELOCITY: <span class="v-glow">{{ velocity }}V</span>
      </div>
      <div v-if="purgedSteps.length === 3" class="activation-success">
        ALL LIES DELETED. THE VRE IS ACTIVE.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const purgedSteps = ref([]);
const velocity = ref(0.12);

const frictionLevel = computed(() => {
  return 100 - (purgedSteps.value.length * 33.3);
});

const purge = (id) => {
  purgedSteps.value.push(id);
  velocity.value = (velocity.value + 2.65).toFixed(2);
  if (purgedSteps.value.length === 3) {
    velocity.value = 8.09;
  }
};
</script>

<style scoped>
.lie-detector-terminal {
  background: #000;
  color: #fff;
  font-family: 'Space Mono', monospace;
  padding: 40px;
  border: 1px solid #00e5ff;
  max-width: 1000px;
  margin: auto;
}
.visual-interpretation {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(255, 0, 65, 0.4);
}

.text-glow {
  color: #ff0041;
  text-shadow: 0 0 10px #ff0041;
  letter-spacing: 5px;
}

.logic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.pillar-card {
  background: #0a0a0a;
  border: 1px solid #333;
  padding: 20px;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

.pillar-card.purged {
  border-color: #7fff00;
  background: rgba(127, 255, 0, 0.05);
}

.pillar-label {
  font-size: 0.7rem;
  color: #00e5ff;
}

.legacy-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.truth-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.purged .truth-reveal {
  opacity: 1;
  transform: translateY(0);
}

.truth-tag {
  background: #7fff00;
  color: #000;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: bold;
}

.purge-btn {
  background: transparent;
  border: 1px solid #ff0041;
  color: #ff0041;
  padding: 10px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
}

.purge-btn:hover {
  background: #ff0041;
  color: #fff;
}

.v-glow {
  color: #7fff00;
  text-shadow: 0 0 10px #7fff00;
}

.activation-success {
  margin-top: 20px;
  color: #7fff00;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.terminal {
            max-width: 900px;
            width: 100%;
            border: 1px solid var(--io-cyan);
            background: var(--bg-black);
            padding: 40px;
            box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
            position: relative;
        }

        .header {
            border-bottom: 2px solid var(--io-red);
            padding-bottom: 20px;
            margin-bottom: 40px;
        }

        h1 {
            color: var(--io-red);
            font-size: 1.8rem;
            letter-spacing: 4px;
            margin: 0;
            text-shadow: 0 0 10px rgba(255, 0, 65, 0.5);
        }

        .intro {
            font-size: 1rem;
            line-height: 1.6;
            color: #888;
            margin-top: 20px;
        }

        .pillar {
            margin-bottom: 60px;
            border-left: 1px solid #333;
            padding-left: 25px;
            position: relative;
        }

        .pillar::before {
            content: "";
            position: absolute;
            left: -5px;
            top: 0;
            width: 10px;
            height: 10px;
            background: var(--io-cyan);
        }

        h2 {
            color: var(--io-cyan);
            font-size: 1.2rem;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .lie-box {
            background: rgba(255, 0, 65, 0.03);
            border: 1px solid rgba(255, 0, 65, 0.2);
            padding: 15px;
            margin: 15px 0;
            font-size: 0.9rem;
            color: #ccc;
        }

        .truth-box {
            background: rgba(127, 255, 0, 0.05);
            border: 1px solid var(--io-green);
            padding: 20px;
            margin-top: 20px;
            font-weight: bold;
            color: var(--io-green);
            box-shadow: inset 0 0 15px rgba(127, 255, 0, 0.05);
        }

        .truth-label {
            display: block;
            font-size: 0.7rem;
            letter-spacing: 2px;
            margin-bottom: 5px;
            color: white;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 80px;
            text-align: center;
            font-size: 0.7rem;
            color: var(--io-cyan);
            opacity: 0.6;
        }

        .scanline {
            width: 100%;
            height: 2px;
            background: rgba(0, 229, 255, 0.1);
            position: absolute;
            top: 0;
            left: 0;
            animation: scan 8s linear infinite;
        }

        @keyframes scan {
            from { top: 0; }
            to { top: 100%; }
        }

        b { color: var(--io-cyan); }
</style>