<template>
    <div class="commerce-covenant shadow-lg rounded border-2 position-relative overflow-hidden"
        :class="{ 'fabric-pulsing': isPulsing }" v-if="transaction">
        <header
            class="covenant-header d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-success border-opacity-50">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-arrows-angle-contract"></i>
                <h3 class="font-monospace h6 text-uppercase mb-0">Covenant of Commerce</h3>
            </div>
            <div class="bit-tag tiny font-monospace opacity-75">BIT 1001</div>
        </header>

        <div class="covenant-body font-monospace small">
            <div class="logic-row mb-2">
                <span class="text-secondary">SELLER_ID:</span>
                <span class="text-white ms-2">{{ transaction.seller_id }}</span>
            </div>
            <div class="logic-row mb-2">
                <span class="text-secondary">BUYER_ID:</span>
                <span class="text-white ms-2">{{ transaction.buyer_id }}</span>
            </div>
            <div class="logic-row mb-2">
                <span class="text-secondary">RATIONAL_REASON:</span>
                <span class="text-info ms-2">{{ transaction.rational_reason }}</span>
            </div>
            <div class="logic-row mb-2">
                <span class="text-secondary">STATUS:</span>
                <span class="text-success ms-2">{{ transaction.status }}</span>
            </div>
            <div class="logic-row mb-3">
                <span class="text-secondary">EARTH_LOCATION:</span>
                <span class="text-warning ms-2">{{ transaction.earth_location }}</span>
            </div>

            <div
                class="manifestation-zone p-3 bg-black border border-success border-opacity-25 rounded text-center mt-4">
                <label class="tiny text-uppercase opacity-50 d-block mb-2">Manifestation Result</label>
                <div class="display-1 text-success glow">{{ transaction.manifestation_result }}</div>
                <div class="tiny text-uppercase opacity-50 mt-2">Information Finalized</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIOSettings } from '../useIOSettings';
import type { CommerceLogic } from '../commerceLogic';

const { playSFX } = useIOSettings();

const props = defineProps<{
    transaction: CommerceLogic | null
}>();

const isPulsing = ref(false);

watch(() => props.transaction, (newVal) => {
    if (newVal) {
        isPulsing.value = true;
        playSFX('fulfill'); // Play a sound effect when the covenant manifests
        setTimeout(() => { isPulsing.value = false; }, 1000); // Pulse for 1 second
    }
});
</script>

<style scoped>
.commerce-covenant {
    background: radial-gradient(circle at center, #001100 0%, #000 100%);
    border: 2px solid #00ff41;
    padding: 1.5rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.2);
}

.glow {
    text-shadow: 0 0 20px #00ff41;
}

.tiny {
    font-size: 0.65rem;
}

.fabric-pulsing {
    animation: fabric-pulse 1s ease-out;
}

@keyframes fabric-pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.2);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 0 60px rgba(0, 255, 65, 0.6);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.2);
    }
}
</style>