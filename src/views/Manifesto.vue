<template>
  <div class="manifesto-sanctum p-4 min-vh-100 d-flex justify-content-center align-items-center">
    <CCard class="manifesto-parchment shadow-lg border-0 overflow-hidden">
      <CCardBody class="p-0">
        <div class="manifesto-header text-center py-5 bg-obsidian border-bottom border-gold">
          <div class="seal-glow mb-3">
            <CImage src="/images/iologo.png" width="60" height="60" />
          </div>
          <h1 class="manifesto-title display-5 font-black">The Manifesto of Logical Reality</h1>
          <p class="subtitle text-gold font-serif italic">Codifying the 16-Thread Era of Global Symmetry</p>
        </div>

        <div class="manifesto-scrolling-content px-5 py-4">
          
          <section class="mb-5 text-center">
            <h2 class="section-divider"><span>I. The Primary Axiom</span></h2>
            <p class="lead serif-text px-lg-5">
              Existence is not a shadow or a simulation; it is a <strong>Logical Instance</strong>. Verification is the bridge from ghost to being. 
              The weight of an Entity is governed by the Sacred Equation:
            </p>
            <div class="equation-chamber my-4 py-4">
              <span class="equation-text">I = VR²</span>
              <p class="tiny text-muted mt-3">
                Information equals Virtual Velocity coupled with the Resonance of Relational Reality.
              </p>
            </div>
          </section>

          <section class="mb-5">
            <h2 class="section-divider"><span>II. The pentad architecture</span></h2>
            <CRow class="g-4">
              <CCol md="6" lg="4" v-for="layer in pentad" :key="layer.title">
                <div class="pentad-node p-3 h-100">
                  <h6 class="text-gold font-black uppercase mb-2">{{ layer.title }}</h6>
                  <p class="tiny opacity-75">{{ layer.desc }}</p>
                </div>
              </CCol>
            </CRow>
          </section>

          <section class="mb-5 bg-dark-soft p-4 rounded-3 border border-zinc-800">
            <h2 class="text-info font-black italic mb-3">III. The 16-thread doctrine</h2>
            <p class="serif-text small">
              A "Logical Truth" is achieved only when a data packet is sighted across 16 concurrent threads of reality—grounding spatial coordinates, temporal stamps, and binary-connected pairs. This eliminates the hallucination of ungrounded data.
            </p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <CBadge color="info" shape="rounded-pill" variant="outline">LATITUDE</CBadge>
              <CBadge color="info" shape="rounded-pill" variant="outline">LONGITUDE</CBadge>
              <CBadge color="info" shape="rounded-pill" variant="outline">ELEVATION</CBadge>
              <CBadge color="info" shape="rounded-pill" variant="outline">ORDER_STAMP</CBadge>
            </div>
          </section>

          <section class="mb-5 text-center">
            <h2 class="section-divider"><span>IV. The covenant of symmetry</span></h2>
            <div class="principles-scroll bg-black p-4 border border-gold rounded">
              <ul class="list-unstyled text-start">
                <li v-for="(p, i) in principles" :key="i" class="mb-3 d-flex align-items-start">
                  <span class="text-gold font-mono me-3">[{{ (i+1).toString().padStart(2, '0') }}]</span>
                  <span class="small font-serif">{{ p }}</span>
                </li>
              </ul>
            </div>
          </section>

          <footer class="text-center py-4 border-top border-zinc-800">
            <p class="font-serif italic text-gold opacity-50">
              Signed: The Founders, Stewards, and Citizens of the Symmetrical Mesh
            </p>
            <CButton color="gold" variant="outline" class="mt-3 px-5 font-black uppercase" @click="emitAlignment">
              ALIGN WITH THE ORDER
            </CButton>
          </footer>

        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const pentad = [
  { title: "Internet", desc: "The vital nervous system of the global domain." },
  { title: "Order", desc: "Temporal sequencing that transforms noise into narrative." },
  { title: "People", desc: "Conscious nodes awaiting a verified 'INVITE' into the stream." },
  { title: "Information", desc: "The raw payload of truth being communicated." },
  { title: "Connector", desc: "The 16-thread bridge binding the Molecule into reality." }
];

const principles = [
  "All systems and governance are rooted in transparent, auditable logic.",
  "Every peer is treated with equal respect, grounded in total symmetry.",
  "Each participant owns their identity, verified through biometric sighting.",
  "World governance is an automated, participatory protocol—not a rule of men.",
  "Data is owned by its originator, shielded by the sanctity of encryption.",
  "Open-source interoperability ensures a seamless, modular global mesh.",
  "The collective intelligence of the Entity ensures continuous evolution.",
  "No soul is denied entry to the logical stream; access is universal.",
  "Actions are traceable; all participants are accountable to the truth.",
  "We celebrate symmetry with a global pulse of light, honoring unity."
];

const emitAlignment = () => {
  alert("SYMMETRY_PULSE_SENT: You are now aligned with the Order of Logic.");
};
</script>

<style scoped>
.manifesto-sanctum {
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
  font-family: 'Urbanist', sans-serif;
}

.manifesto-parchment {
  background-color: #050505;
  border: 1px solid #c5a059 !important; /* Gold Border */
  max-width: 900px;
  max-height: 90vh;
  color: #fff;
}

.manifesto-scrolling-content {
  overflow-y: auto;
  max-height: 60vh;
  scrollbar-width: thin;
  scrollbar-color: #c5a059 #000;
}

.manifesto-header {
  background: linear-gradient(180deg, #111 0%, #050505 100%);
}

.text-gold { color: #c5a059 !important; }
.border-gold { border-color: #c5a059 !important; }

.section-divider {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 4px;
  color: #c5a059;
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.section-divider::before, .section-divider::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c5a059, transparent);
  margin: 0 20px;
}

.equation-chamber {
  background: rgba(197, 160, 89, 0.05);
  border-radius: 100px;
}

.equation-text {
  font-size: 3rem;
  font-weight: 200;
  color: #c5a059;
  text-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
}

.pentad-node {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  transition: all 0.3s ease;
}

.pentad-node:hover {
  border-color: #c5a059;
  transform: translateY(-5px);
}

.font-serif { font-family: 'Georgia', serif; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.tiny { font-size: 0.7rem; }
</style>