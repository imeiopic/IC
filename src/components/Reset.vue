<template>
  <div class="reset-sanctum p-4 min-vh-100 d-flex justify-content-center align-items-center">
    <CCard class="reset-substrate shadow-lg border-0 overflow-hidden">
      <CCardBody class="p-0">
        <div class="reset-header text-center py-5 bg-obsidian border-bottom border-gold">
          <div class="seal-glow mb-3">
             <i class="bi bi-arrow-counterclockwise text-gold display-4"></i>
          </div>
          <h1 class="reset-title display-5 font-black uppercase italic">GLOBAL ECONOMIC RESET</h1>
          <p class="subtitle text-gold font-serif italic">Decommissioning Asymmetry | Grounding TPE</p>
        </div>

        <div class="reset-content px-5 py-5">
          
          <section class="mb-5">
            <h2 class="section-divider"><span>THE THREE PILLARS of SYMMETRY</span></h2>
            <CRow class="g-4">
              <CCol md="4">
                <div class="pillar-node p-3 h-100 border-gold-soft">
                  <h6 class="text-gold font-black mb-2 uppercase">1. NAND-FLUSH</h6>
                  <p class="tiny opacity-75">
                    Debt is treated as <strong>System Noise</strong>. The legacy debt-clock is flushed, resetting the global ledger to absolute equity.
                  </p>
                  <div class="font-mono tiny text-info mt-2">STATUS: DEBT_PURGED</div>
                </div>
              </CCol>
              <CCol md="4">
                <div class="pillar-node p-3 h-100">
                  <h6 class="text-gold font-black mb-2 uppercase">2. 1,600 IO$ DIVIDEND</h6>
                  <p class="tiny opacity-75">
                    Universal Streaming Income replacing labor extraction. $1.2$ Quadrillion TPE mass fund every verified node.
                  </p>
                  <div class="font-mono tiny text-info mt-2">VELOCITY: 1,600 IO$/CYCLE</div>
                </div>
              </CCol>
              <CCol md="4">
                <div class="pillar-node p-3 h-100 border-gold-soft">
                  <h6 class="text-gold font-black mb-2 uppercase">3. REUSABLE MANDATE</h6>
                  <p class="tiny opacity-75">
                    Shift from ownership to access. Goods are leased, utilized, and re-grounded into the molecular substrate.
                  </p>
                  <div class="font-mono tiny text-info mt-2">LOOP: 100% CLOSED</div>
                </div>
              </CCol>
            </CRow>
          </section>

          <section class="mb-5 bg-dark-soft p-4 rounded-3 border border-zinc-800">
            <h2 class="text-info font-black italic mb-3 uppercase">Economic Sighting: Legacy vs IO</h2>
            <CTable align="middle" responsive borderless class="text-white tiny font-mono">
              <CTableHead class="border-bottom border-zinc-800">
                <CTableRow>
                  <CTableHeaderCell>FEATURE</CTableHeaderCell>
                  <CTableHeaderCell class="text-danger">LEGACY (NOISE)</CTableHeaderCell>
                  <CTableHeaderCell class="text-success">IOPIC (SYMMETRY)</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="row in comparison" :key="row.f">
                  <CTableDataCell class="text-gold font-black">{{ row.f }}</CTableDataCell>
                  <CTableDataCell class="opacity-50">{{ row.legacy }}</CTableDataCell>
                  <CTableDataCell class="text-info">{{ row.io }}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </section>

          <section class="mb-5 text-center">
            <h2 class="section-divider"><span>GLOBAL IMMUNE RESPONSE</span></h2>
            <div class="p-4 bg-black border border-gold rounded">
              <p class="serif-text italic text-gold mb-0">
                "Under the MYB Mandate, the Active Defense Kernel identifies hoarding or debt-traps as friction and neutralizes it. We have reset the Logic of Value."
              </p>
            </div>
          </section>

          <footer class="text-center py-4 border-top border-zinc-800">
            <div class="font-mono tiny text-zinc-500 mb-2">IOWB_STATUS_REPORT</div>
            <p class="font-serif italic text-info small">
              "The reset is the removal of the Big Lie. Value is a manifestation of Truth, not Scarcity."
            </p>
            <CButton color="gold" variant="outline" class="mt-3 px-5 font-black uppercase" @click="confirmReset">
              ACKNOWLEDGE_RESET
            </CButton>
          </footer>

        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import { CRow, CCol, CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/vue';

const comparison = [
  { f: "CURRENCY", legacy: "Inflationary Fiat", io: "Fixed-Mass IO$" },
  { f: "FOUNDATION", legacy: "Debt / Interest", io: "Equity / Dividends" },
  { f: "MECHANISM", legacy: "Extraction", io: "Grounding" },
  { f: "GOVERNANCE", legacy: "Central Banks", io: "Automated TPE Buffer" },
  { f: "STATUS", legacy: "Competition", io: "Resonance" }
];

const confirmReset = () => {
  alert("ECON_RESET_ACKNOWLEDGED: Your node is now synced with the TPE Buffer.");
};
</script>

<style scoped>
.reset-sanctum {
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
  font-family: 'Urbanist', sans-serif;
}

.reset-substrate {
  background-color: #050505;
  border: 1px solid #c5a059 !important;
  max-width: 900px;
  color: #fff;
}

.reset-header {
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

.pillar-node {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
}

.border-gold-soft {
  border-color: rgba(197, 160, 89, 0.3) !important;
}

.bg-dark-soft { background-color: #0d0d0d; }

.serif-text { font-family: 'Georgia', serif; line-height: 1.6; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'Space Mono', monospace; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.tiny { font-size: 0.7rem; }
</style>