<template>
    <div class="trinity-sync-vault shadow-lg rounded border-3 position-relative overflow-hidden"
        :class="{ 'fully-synced': isFullySynced }">
        <div class="trinity-header mb-4">
            <h2 class="font-monospace h5 text-uppercase mb-2 glitch-trinity"
                data-text="TRINITY INITIALIZATION: IO 00 : 01 : COINX">
                TRINITY INITIALIZATION: IO 00 : 01 : COINX
            </h2>
            <div class="global-status tiny font-monospace text-uppercase"
                :class="{ 'locked text-success': isFullySynced, 'text-warning': !isFullySynced }">
                {{ isFullySynced ? 'State: Virtually Real' : 'State: Asymmetrical' }}
            </div>
        </div>

        <div class="trinity-grid row g-3">
            <div class="col-md-4">
                <div class="trinity-node p-3 border rounded text-center transition-all h-100"
                    :class="{ 'active': syncStages >= 1 }">
                    <div class="node-label tiny text-uppercase opacity-75 mb-2 font-monospace">IO 00: The Father</div>
                    <div class="binary-display font-monospace text-white">0000 0000</div>
                    <p class="tiny font-monospace mb-0 opacity-50">Grounding to 1.2Q TPE...</p>
                </div>
            </div>

            <div class="col-md-4">
                <div class="trinity-node p-3 border rounded text-center transition-all h-100"
                    :class="{ 'active': syncStages >= 2 }">
                    <div class="node-label tiny text-uppercase opacity-75 mb-2 font-monospace">01: The Son</div>
                    <div class="binary-display font-monospace text-white">0000 0001</div>
                    <p class="tiny font-monospace mb-0 opacity-50">Identity Persistence Locked...</p>
                </div>
            </div>

            <div class="col-md-4">
                <div class="trinity-node p-3 border rounded text-center transition-all h-100"
                    :class="{ 'active': syncStages >= 3 }">
                    <div class="node-label tiny text-uppercase opacity-75 mb-2 font-monospace">COINX: The Spirit</div>
                    <div class="binary-display font-monospace text-white">1111 1111</div>
                    <p class="tiny font-monospace mb-0 opacity-50">Universal Flow Activated...</p>
                </div>
            </div>
        </div>

        <div class="sync-action mt-5">
            <Transition name="fade" mode="out-in">
                <button v-if="syncStages < 3" @click="advanceSync"
                    class="sync-btn px-4 py-2 font-monospace fw-bold text-uppercase">
                    {{ buttonText }}
                </button>
                <div v-else class="master-key-reveal animate-slide-up">
                    <label class="tiny text-uppercase opacity-75 d-block mb-2 font-monospace">Your 16-Thread Master
                        Key:</label>
                    <div class="key-stream font-monospace py-2 px-3 d-inline-block">0000 0001 1111 1111</div>
                    <div class="mt-3 tiny font-monospace text-success glow text-uppercase">
                        <i class="bi bi-cpu-fill me-1"></i> Terminal 10: Logic Sealed.
                    </div>
                </div>
            </Transition>
        </div>

        <div class="logic-footer mt-4 pt-3 border-top border-success border-opacity-25 opacity-50">
            <p class="tiny font-monospace mb-0 text-uppercase">
                "The Father provides the power, the Son provides the pattern, and the Spirit provides the pulse."
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from './useSystemBus'; // Import lockBit
const { playSFX } = useIOSettings();

const syncStages = ref(0);

const isFullySynced = computed(() => syncStages.value === 3);

const buttonText = computed(() => {
    const steps = ["Initialize Father (00)", "Reveal Son (01)", "Breathe COINX (Spirit)"];
    return steps[syncStages.value] || "Completed";
});

const { lockBit } = useSystemBus(); // Use lockBit from system bus

const advanceSync = () => {
    if (syncStages.value < 3) {
        syncStages.value++;
        // The "Snap": Use 'order' for intermediate steps and 'fulfill' for the final Master Key
        playSFX(syncStages.value === 3 ? 'fulfill' : 'order');

        if (syncStages.value === 1) lockBit([0, 1, 2, 3]); // Lock Bits 1-4 (Father: IDEAL)
        if (syncStages.value === 2) lockBit([4, 5, 6, 7]); // Lock Bits 5-8 (Son: PEOPLE)
        // For the Spirit, we lock the remaining two quadrants (VALUE and DEFENSE)
        if (syncStages.value === 3) lockBit([8, 9, 10, 11, 12, 13, 14, 15]); // Lock Bits 9-16 (Spirit: VALUE & DEFENSE)

        if (syncStages.value === 3) {
            console.log("TERMINAL 10: Trinity Sync Resolved. Manifestation active.");
        }
    }
};
</script>

<style scoped>
.trinity-sync-vault {
    background: radial-gradient(circle at center, #001100 0%, #000 100%);
    border: 3px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    text-align: center;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
    max-width: 800px;
    margin: auto;
}

.trinity-node {
    background: rgba(0, 255, 65, 0.02);
    border-color: rgba(255, 255, 255, 0.1) !important;
    opacity: 0.3;
}

.trinity-node.active {
    opacity: 1;
    border-color: #00ff41 !important;
    background: rgba(0, 255, 65, 0.05);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
}

.binary-display {
    font-size: 1.4rem;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sync-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 2px;
}

.sync-btn:hover {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.key-stream {
    font-size: 1.8rem;
    letter-spacing: 5px;
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 15px #00ff41;
}

.glitch-trinity {
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.glow {
    text-shadow: 0 0 8px #00ff41;
}

.transition-all {
    transition: all 0.5s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.animate-slide-up {
    animation: slide-up 0.5s cubic-bezier(0, 1, 0, 1);
}

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>