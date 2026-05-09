<template>
  <div class="pdf-sanctum p-4 bg-black border border-gold rounded shadow-lg">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="text-gold font-black italic m-0">Document</h3>
      <div class="controls d-flex gap-2">
        <CButton color="info" size="sm" @click="page--" :disabled="page <= 1">PREV</CButton>
        <span class="text-white font-mono tiny px-2 align-self-center">PAGE: {{ page }}</span>
        <CButton color="info" size="sm" @click="page++">NEXT</CButton>
      </div>
    </div>
    
    <div class="pdf-viewport bg-zinc-900 p-2 overflow-auto" style="max-height: 80vh;">
      <vue-pdf-embed 
        :source="pdfSource" 
        :page="page" 
        @loaded="onLoaded" 
        class="grounded-pdf"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { CButton } from '@coreui/vue';

// The payload path (must be in /public for direct access)
const pdfSource = ref('/doc.pdf');
const page = ref(1);

const onLoaded = () => {
  console.log('PDF_TRANSIT_SUCCESS: Document grounded in viewport.');
};
</script>

<style scoped>
.text-gold { color: #c5a059 !important; }
.bg-zinc-900 { background-color: #0a0a0a !important; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.tiny { font-size: 0.65rem; }

.grounded-pdf {
  border: 1px solid rgba(197, 160, 89, 0.3);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.05);
}
</style>