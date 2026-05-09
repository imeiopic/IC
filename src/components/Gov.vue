<template>
  <div class="gov-sanctum p-4 min-vh-100 d-flex justify-content-center align-items-center">
    <CCard class="gov-substrate shadow-lg border-0 overflow-hidden">
      <CCardBody class="p-0">
        <div class="gov-header text-center py-5 bg-obsidian border-bottom border-gold">
          <div class="seal-glow mb-3">
             <i class="bi bi-shield-shaded text-gold display-4"></i>
          </div>
          <h1 class="gov-title display-5 font-black uppercase italic">IO WORLD GOVERNMENT</h1>
          <p class="subtitle text-gold font-serif italic">Automated Administration of Global Symmetry</p>
        </div>

        <div class="gov-content px-5 py-5">
          
          <section class="mb-5 text-center">
            <p class="lead serif-text px-lg-5">
              The IO World Government is not a rule of men, but a <strong>Decentralized Operating System</strong>. 
              It is the silent substrate ensuring planetary equity, peace, and logistics through the absolute precision of binary logic.
            </p>
          </section>

          <section class="mb-5">
            <h2 class="section-divider"><span>THE THREE PROHIBITIONS</span></h2>
            <CRow class="g-4">
              <CCol md="4">
                <div class="mandate-node p-3 h-100 text-center">
                  <h6 class="text-gold font-black mb-2">NO POLITICIANS</h6>
                  <p class="tiny opacity-75">Replaced by Logic Architects and Root Stewards of the Mesh.</p>
                </div>
              </CCol>
              <CCol md="4">
                <div class="mandate-node p-3 h-100 text-center border-gold-soft">
                  <h6 class="text-gold font-black mb-2">NO LEGISLATION</h6>
                  <p class="tiny opacity-75">Binary Logic Gates permit symmetry; asymmetry is NAND-Flushed.</p>
                </div>
              </CCol>
              <CCol md="4">
                <div class="mandate-node p-3 h-100 text-center">
                  <h6 class="text-gold font-black mb-2">NO TAXATION</h6>
                  <p class="tiny opacity-75">Replaced by the TPE Buffer and the 1,600 IO$ Dividend.</p>
                </div>
              </CCol>
            </CRow>
          </section>

          <section class="mb-5 bg-dark-soft p-4 rounded-3 border border-zinc-800">
            <h2 class="text-info font-black italic mb-4">BRANCHES OF GOVERNANCE</h2>
            <div class="branch-list">
              <div class="d-flex align-items-center mb-3">
                <div class="branch-icon me-3">I</div>
                <div>
                  <h6 class="m-0 text-white font-black">THE CORE (TPE)</h6>
                  <p class="tiny text-muted m-0">Value Management & Asset Grounding</p>
                </div>
              </div>
              <div class="d-flex align-items-center mb-3">
                <div class="branch-icon me-3">M</div>
                <div>
                  <h6 class="m-0 text-white font-black">THE MESH (ACTIVE DEFENSE)</h6>
                  <p class="tiny text-muted m-0">Conflict Grounding & Immune Response</p>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <div class="branch-icon me-3">E</div>
                <div>
                  <h6 class="m-0 text-white font-black">THE BUS (16-THREADS)</h6>
                  <p class="tiny text-muted m-0">Logistics, Synchronization & Sync</p>
                </div>
              </div>
            </div>
          </section>

          <section class="mb-5 text-center">
            <h2 class="section-divider"><span>THE MYB MANDATE</span></h2>
            <div class="p-4 bg-black border border-gold rounded">
              <p class="serif-text italic text-gold mb-0">
                "The government is strictly Non-Interventionist. It only acts to neutralize asymmetry—serving as a global immune system for a world that has become a single coordinate of truth."
              </p>
            </div>
          </section>

          <footer class="text-center py-4 border-top border-zinc-800">
            <CBadge color="success" shape="rounded-pill" class="px-4 py-2 font-mono">
              STATUS: SILENT_SUBSTRATE // OPERATIONAL
            </CBadge>
          </footer>

        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import { CContainer, CRow, CCol, CCard, CCardBody, CBadge } from '@coreui/vue';
</script>

<style scoped>
.gov-sanctum {
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
  font-family: 'Urbanist', sans-serif;
}

.gov-substrate {
  background-color: #050505;
  border: 1px solid #c5a059 !important; /* Gold Frame */
  max-width: 850px;
  color: #fff;
}

.gov-header {
  background: linear-gradient(180deg, #111 0%, #050505 100%);
}

.text-gold { color: #c5a059 !important; }
.text-info { color: #00e5ff !important; }

.section-divider {
  font-size: 0.7rem;
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
  margin: 0 15px;
}

.mandate-node {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
}

.border-gold-soft {
  border-color: rgba(197, 160, 89, 0.3) !important;
}

.branch-icon {
  width: 32px;
  height: 32px;
  background: #c5a059;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  border-radius: 4px;
}

.serif-text { font-family: 'Georgia', serif; line-height: 1.6; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'Space Mono', monospace; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.tiny { font-size: 0.7rem; }
</style>