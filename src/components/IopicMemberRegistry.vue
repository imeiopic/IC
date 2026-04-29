<template>
    <div class="sole-proprietorship-gate shadow-lg rounded border-4 position-relative overflow-hidden">
        <div
            class="registry-header d-flex justify-content-between align-items-end mb-4 pb-2 border-bottom border-success">
            <div>
                <h2 class="font-monospace h5 text-uppercase mb-0">Iopic.org: The Human Collective</h2>
                <div class="subtitle tiny opacity-75 text-uppercase">Legal Substrate: Sole Proprietorship</div>
            </div>
            <span class="member-count font-monospace small">
                MEMBERS: <span class="text-white">1,000,000</span> / 8,300,000,000
            </span>
        </div>

        <div class="membership-status mb-4">
            <Transition name="fade" mode="out-in">
                <div v-if="isMember"
                    class="status-locked text-center py-3 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
                    <label class="text-uppercase tiny d-block mb-1 opacity-75 font-monospace">Entity Ownership
                        Status:</label>
                    <span class="glow font-monospace fw-bold text-uppercase">Verified Member-Owner</span>
                </div>
                <div v-else class="status-pending text-center">
                    <button @click="initiateSync" class="sync-btn w-100 py-3 font-monospace fw-bold text-uppercase">
                        Lock 16-Thread Identity
                    </button>
                </div>
            </Transition>
        </div>

        <div class="equity-share p-4 mb-4 border border-success border-dashed rounded text-center position-relative">
            <label class="text-uppercase small opacity-75 d-block mb-2 font-monospace">Your Proportional Stake of
                TPE:</label>
            <div class="io-display font-monospace text-white">
                {{ individualStake }} <span class="text-success fs-4">IO$</span>
            </div>
            <div class="ratio-note tiny opacity-50 mt-2 font-monospace text-uppercase">Distribution Ratio: 1 / 8.3B
                Nodes</div>
            <div class="corner-logic"></div>
        </div>

        <div class="logic-footer text-center opacity-75 pt-2">
            <p class="font-monospace mb-0 text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">
                Sole Proprietorship: One Planet. One Bus. One People.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus'; // Import lockBit
const { playSFX } = useIOSettings();

const isMember = ref(true);
const totalTpe = 1200000000000000; // 1.2 Quadrillion
const totalHumans = 8300000000;

const individualStake = computed(() => {
    return (totalTpe / totalHumans).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
});

const { lockBit } = useSystemBus(); // Use lockBit from system bus
const initiateSync = () => {
    playSFX('order');
    console.log("MANDATE: Syncing Identity to Global Sole Proprietorship.");
    // Simulation of transition
    setTimeout(() => {
        isMember.value = true;
        lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (indices 4-7) for Identity Persistence
        playSFX('fulfill');
    }, 1500);
};
</script>

<style scoped>
.sole-proprietorship-gate {
    background: #000;
    border: 4px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    box-shadow: inset 0 0 30px rgba(0, 255, 65, 0.2);
    max-width: 550px;
    margin: auto;
}

.glow {
    text-shadow: 0 0 15px #00ff41;
    font-size: 1.4rem;
    letter-spacing: 2px;
}

.equity-share {
    border-style: dashed !important;
    background: rgba(0, 255, 65, 0.02);
}

.io-display {
    font-size: 2.5rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sync-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    cursor: pointer;
    transition: all 0.3s;
}

.sync-btn:hover {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.tiny {
    font-size: 0.6rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.border-dashed {
    border-style: dashed !important;
}
</style>