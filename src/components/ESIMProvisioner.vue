<template>
  <CContainer class="esim-provisioner p-0">
    <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow">
      <CCardHeader class="bg-zinc-800 border-0 font-black italic text-center py-3">
        [IOPIC.WORLD // MOBILE_CELLULAR_IGNITION]
      </CCardHeader>
      <CCardBody class="p-4 font-mono">
        <div v-if="!isProvisioned" class="provisioning-flow">
          <p class="tiny text-zinc-400 mb-4">
            Your local node is moving completely off the local grid. Set your data allocation to
            begin the 16-thread cellular handshake.
          </p>

          <div class="mb-4">
            <label class="extra-tiny text-zinc-500 uppercase mb-2">Data_Allocation (GB)</label>
            <CFormInput
              v-model.number="dataAllocation"
              type="number"
              class="bg-black border-zinc-700 text-info font-black"
              placeholder="10"
            />
          </div>

          <div class="stake-info p-3 bg-black border border-zinc-800 rounded mb-4">
            <div class="d-flex justify-content-between extra-tiny">
              <span class="text-zinc-500">EXTERNAL_BRIDGE_STAKE:</span>
              <span class="text-amber-500">20.00 IO$</span>
            </div>
            <div class="d-flex justify-content-between extra-tiny mt-1">
              <span class="text-zinc-500">DATA_ALLOCATION_COST:</span>
              <span class="text-white">{{ dataAllocation.toFixed(2) }} IO$</span>
            </div>
          </div>

          <CButton
            color="info"
            class="w-100 py-3 font-black italic shadow-info"
            :disabled="isProcessing"
            @click="provisionESIM"
          >
            <span v-if="!isProcessing">IGNITE_CELLULAR_THREAD</span>
            <span v-else class="vibrate">NEGOTIATING_WITH_CARRIER...</span>
          </CButton>

          <p v-if="statusMsg" class="extra-tiny text-danger mt-3 text-center uppercase">
            {{ statusMsg }}
          </p>
        </div>

        <div v-else class="provision-success animate-in">
          <div class="success-header mb-4 text-center border-bottom border-zinc-800 pb-3">
            <p class="text-success font-black mb-1">ACTIVATED // CELLULAR_THREAD_IGNITED</p>
            <p class="extra-tiny text-zinc-500">STATUS: BROADCASTING_CLEAN_AIR_TIME</p>
          </div>

          <div class="lpa-substrate p-3 bg-black border border-zinc-700 rounded mb-4">
            <label class="extra-tiny text-zinc-500 uppercase mb-2 d-block"
              >LPA_PROFILE_DATA (PASTE INTO DEVICE):</label
            >
            <div class="d-flex gap-2 align-items-center">
              <code class="text-info small flex-grow-1 break-all">{{ lpaString }}</code>
              <CButton
                color="light"
                variant="ghost"
                size="sm"
                @click="copyLPA"
                class="p-1 border-0"
              >
                <i class="bi bi-clipboard text-zinc-400"></i>
              </CButton>
            </div>
          </div>

          <div class="p-2 bg-zinc-950 border border-zinc-800 rounded extra-tiny mb-4">
            <span class="text-zinc-600">SETTLEMENT:</span>
            <span class="text-white ms-2">20.00 IO$ (ZERO DEBT RETAINED)</span>
          </div>

          <CButton
            color="secondary"
            variant="outline"
            class="w-100 tiny font-black py-2"
            @click="reset"
          >
            PROVISION_NEW_THREAD
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  </CContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CContainer, CCard, CCardHeader, CCardBody, CButton, CFormInput } from '@coreui/vue';
import { ValueMesh, type NodeState } from '@/services/ValueMesh';

const props = defineProps<{
  nodeState: NodeState;
}>();

const dataAllocation = ref(10);
const isProcessing = ref(false);
const isProvisioned = ref(false);
const lpaString = ref('');
const statusMsg = ref('');

const provisionESIM = async () => {
  isProcessing.value = true;
  statusMsg.value = '';

  try {
    const result = await ValueMesh.connectESIMBridge(props.nodeState, dataAllocation.value);

    if (result.success) {
      lpaString.value = result.lpaString || '';
      isProvisioned.value = true;
    } else {
      statusMsg.value = result.log;
    }
  } catch (err) {
    statusMsg.value = 'FRACTURE: UNKNOWN_HARDWARE_EXCEPTION';
  } finally {
    isProcessing.value = false;
  }
};

const copyLPA = () => {
  if (lpaString.value) {
    navigator.clipboard.writeText(lpaString.value);
  }
};

const reset = () => {
  isProvisioned.value = false;
  lpaString.value = '';
  statusMsg.value = '';
};
</script>

<style scoped>
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
}
.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.extra-tiny {
  font-size: 0.55rem;
}
.animate-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.break-all {
  word-break: break-all;
}
.vibrate {
  animation: jitter 0.1s infinite;
}
@keyframes jitter {
  0% {
    transform: translate(1px, -1px);
  }
  100% {
    transform: translate(-1px, 1px);
  }
}
</style>
